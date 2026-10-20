(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var content = $('content'), ecc = $('ecc'), size = $('size'), fg = $('fg'), bg = $('bg');
  var preview = $('preview'), msg = $('msg'), alt = $('alt'), pngBtn = $('png'), svgBtn = $('svg');
  var QUIET = 4; // modules of white border, per QR spec
  var current = null; // {modules, count, text}

  function normalize(raw) {
    var t = raw.trim();
    // Bare domain like "lhena.org/volunteer" -> add https://. Leave anything with a scheme alone.
    if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
    if (/^[^\s@]+\.[a-z]{2,}(\/\S*)?$/i.test(t)) return 'https://' + t;
    return t;
  }

  function luminance(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function build(text) {
    var qr = qrcode(0, ecc.value);
    qr.addData(text, 'Byte');
    qr.make();
    var n = qr.getModuleCount(), rows = [];
    for (var r = 0; r < n; r++) {
      var row = [];
      for (var c = 0; c < n; c++) row.push(qr.isDark(r, c));
      rows.push(row);
    }
    return { modules: rows, count: n, text: text };
  }

  function svgString(q, px) {
    var total = q.count + QUIET * 2, d = '';
    for (var r = 0; r < q.count; r++) {
      var c = 0;
      while (c < q.count) {
        if (q.modules[r][c]) {
          var s = c;
          while (c < q.count && q.modules[r][c]) c++;
          d += 'M' + (s + QUIET) + ' ' + (r + QUIET) + 'h' + (c - s) + 'v1h-' + (c - s) + 'z';
        } else c++;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total +
      '" width="' + px + '" height="' + px + '" shape-rendering="crispEdges">' +
      '<rect width="100%" height="100%" fill="' + bg.value + '"/>' +
      '<path fill="' + fg.value + '" d="' + d + '"/></svg>';
  }

  function drawPng(q, px, cb) {
    var total = q.count + QUIET * 2;
    var scale = Math.floor(px / total) || 1; // integer module size keeps edges crisp
    var cv = document.createElement('canvas');
    cv.width = cv.height = total * scale;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = bg.value; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = fg.value;
    for (var r = 0; r < q.count; r++)
      for (var c = 0; c < q.count; c++)
        if (q.modules[r][c]) ctx.fillRect((c + QUIET) * scale, (r + QUIET) * scale, scale, scale);
    cv.toBlob(cb, 'image/png');
  }

  function render() {
    var text = normalize(content.value);
    msg.textContent = '';
    current = null;
    if (!text) { preview.hidden = true; preview.removeAttribute('src'); alt.textContent = ''; pngBtn.disabled = svgBtn.disabled = true; return; }
    try { current = build(text); }
    catch (e) {
      preview.hidden = true; pngBtn.disabled = svgBtn.disabled = true;
      msg.textContent = 'Too much text for a QR code at this error-correction level. Shorten it or choose a lower level.';
      return;
    }
    var warn = [];
    if (contrast(fg.value, bg.value) < 4) warn.push('Low contrast between code and background. It may not scan.');
    if (luminance(fg.value) > luminance(bg.value)) warn.push('Code is lighter than the background. Some scanners cannot read inverted codes.');
    if (text !== content.value.trim()) warn.push('Added https:// to the start.');
    msg.textContent = warn.join(' ');
    preview.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString(current, 320));
    preview.alt = 'QR code for ' + text;
    preview.hidden = false;
    alt.textContent = 'Encodes: ' + text;
    pngBtn.disabled = svgBtn.disabled = false;
  }

  function save(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function fileBase() {
    var t = current.text.replace(/^[a-z]+:\/\//i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40);
    return 'qr-' + (t || 'code');
  }

  pngBtn.addEventListener('click', function () {
    if (current) drawPng(current, parseInt(size.value, 10), function (b) { save(b, fileBase() + '.png'); });
  });
  svgBtn.addEventListener('click', function () {
    if (current) save(new Blob([svgString(current, parseInt(size.value, 10))], { type: 'image/svg+xml' }), fileBase() + '.svg');
  });
  [content, ecc, fg, bg].forEach(function (el) { el.addEventListener('input', render); });
  $('form').addEventListener('submit', function (e) { e.preventDefault(); });
  render();
})();
