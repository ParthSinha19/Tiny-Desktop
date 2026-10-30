/* Little Paint - Week 2. Drawings are saved into the shared virtual file system. */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs, I = LCL.icons;

  var W = 640, H = 400;
  var COLOURS = [['Red', '#e03131'], ['Orange', '#f76707'], ['Yellow', '#fcc419'], ['Green', '#40c057'], ['Blue', '#228be6'],
    ['Purple', '#9c36b5'], ['Pink', '#f783ac'], ['Brown', '#8d5524'], ['Black', '#212529'], ['White', '#ffffff']];
  var SIZES = [['Small', 4], ['Medium', 10], ['Big', 24]];
  var TOOLS = [['brush', 'Brush', 'brush'], ['eraser', 'Rubber', 'eraser'], ['box', 'Box', 'square'],
    ['circle', 'Circle', 'circle'], ['triangle', 'Triangle', 'triangle'], ['star', 'Star', 'star']];
  var SHAPES = { box: 1, circle: 1, triangle: 1, star: 1 };

  LCL.registerApp({
    id: 'paint', title: 'Little Paint', icon: 'paint', w: 900, h: 610, minW: 520, minH: 420,
    help: 'Pick a colour, then press and hold to draw. When you are happy, press Save!',
    mount: function (root, ctx) {
      var tool = 'brush', colour = COLOURS[4][1], size = SIZES[1][1], filled = true;
      var undo = [], dirty = false, currentId = null, drawing = false, last = null, start = null, base = null, tookAction = false;

      var canvas = el('canvas', { class: 'p-canvas', width: String(W), height: String(H), 'aria-label': 'Drawing page' });
      var c = canvas.getContext('2d', { willReadFrequently: true });
      function whiteout() { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); }
      whiteout();

      /* ---------- layout ---------- */
      var status = el('span', { class: 'p-status' });
      var top = el('div', { class: 'p-top' }, [
        el('button', { class: 'btn', html: I.g('newpage') + ' New', onclick: newPicture }),
        el('button', { class: 'btn', html: I.g('open') + ' Open', onclick: openDialog }),
        el('button', { class: 'btn primary', html: I.g('save') + ' Save', onclick: save }),
        el('button', { class: 'btn', html: I.g('desktop') + ' Wallpaper', onclick: makeWallpaper }),
        el('span', { class: 'p-gap' }),
        el('button', { class: 'btn', html: I.g('undo') + ' Undo', onclick: doUndo }),
        el('button', { class: 'btn', html: I.g('clear') + ' Clear', onclick: clearAll }),
        status
      ]);
      var toolBox = el('div', { class: 'p-tools' });
      var toolBtns = {};
      TOOLS.forEach(function (t) {
        var b = el('button', { class: 'tool-btn', title: t[1], 'aria-label': t[1], html: I.g(t[2]) + '<span>' + t[1] + '</span>', onclick: function () { setTool(t[0]); } });
        toolBtns[t[0]] = b; toolBox.appendChild(b);
      });
      var fillBtn = el('button', { class: 'tool-btn small', onclick: function () { filled = !filled; syncFill(); } });
      toolBox.appendChild(fillBtn);
      var sizeBtns = [];
      var sizeRow = el('div', { class: 'p-sizes' });
      SIZES.forEach(function (s) {
        var b = el('button', { class: 'size-btn', title: s[0] + ' brush', 'aria-label': s[0] + ' size', onclick: function () { size = s[1]; syncSize(); } });
        var dot = el('i'); dot.style.width = dot.style.height = Math.min(26, s[1] + 4) + 'px'; b.appendChild(dot);
        sizeBtns.push(b); sizeRow.appendChild(b);
      });
      toolBox.appendChild(sizeRow);

      var stage = el('div', { class: 'p-stage' }, [canvas]);
      var colourBox = el('div', { class: 'p-colours', role: 'group', 'aria-label': 'Colours' });
      var colourBtns = [];
      COLOURS.forEach(function (col) {
        var b = el('button', { class: 'swatch', title: col[0], 'aria-label': col[0], onclick: function () { pickColour(col[1]); } });
        b.style.background = col[1]; colourBtns.push(b); colourBox.appendChild(b);
      });

      var wrap = el('div', { class: 'paint' }, [top, el('div', { class: 'p-mid' }, [toolBox, stage]), colourBox]);
      root.appendChild(wrap);

      /* ---------- state sync ---------- */
      function setTool(t) {
        tool = t;
        Object.keys(toolBtns).forEach(function (k) { toolBtns[k].classList.toggle('on', k === t); });
        fillBtn.style.display = SHAPES[t] ? '' : 'none';
        if (SHAPES[t]) LCL.bleep.say('Press and drag on the page to make a shape. Or just click to stamp a small one!', { ms: 7000 });
      }
      function syncFill() { fillBtn.innerHTML = I.g('fill') + '<span>' + (filled ? 'Filled' : 'Outline') + '</span>'; fillBtn.classList.toggle('on', filled); }
      function syncSize() { sizeBtns.forEach(function (b, i) { b.classList.toggle('on', SIZES[i][1] === size); }); }
      function syncColour() { colourBtns.forEach(function (b, i) { b.classList.toggle('on', COLOURS[i][1] === colour); }); }
      function pickColour(v) {
        colour = v; syncColour();
        if (tool === 'eraser') setTool('brush');
        LCL.emit('paint:colour'); LCL.sound.play('pop');
      }
      function refresh() {
        var n = currentId && vfs.get(currentId);
        ctx.setTitle('Little Paint' + (n ? ' - ' + n.name : ''));
        status.textContent = !n ? (dirty ? 'Not saved yet' : 'New picture') : dirty ? 'Changes not saved' : 'Saved in ' + vfs.pathString(n.parent);
      }
      function fit() {
        var r = stage.getBoundingClientRect(), aw = r.width - 20, ah = r.height - 20;
        if (aw <= 0 || ah <= 0) return;
        var s = Math.min(aw / W, ah / H);
        canvas.style.width = Math.floor(W * s) + 'px'; canvas.style.height = Math.floor(H * s) + 'px';
      }

      /* ---------- drawing ---------- */
      function pos(e) {
        var r = canvas.getBoundingClientRect();
        return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
      }
      function pushUndo() {
        undo.push(c.getImageData(0, 0, W, H));
        if (undo.length > 20) undo.shift();
      }
      function drawShape(a, b) {
        var x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(a.x - b.x), h = Math.abs(a.y - b.y);
        c.beginPath();
        if (tool === 'box') c.rect(x, y, w, h);
        else if (tool === 'circle') c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        else if (tool === 'triangle') { c.moveTo(x + w / 2, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); }
        else {
          var cx = x + w / 2, cy = y + h / 2;
          for (var i = 0; i < 10; i++) {
            var rr = i % 2 ? 0.42 : 1, ang = -Math.PI / 2 + i * Math.PI / 5;
            var px = cx + Math.cos(ang) * (w / 2) * rr, py = cy + Math.sin(ang) * (h / 2) * rr;
            if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
          }
          c.closePath();
        }
        c.lineJoin = 'round'; c.lineWidth = Math.max(4, size / 2); c.strokeStyle = colour; c.fillStyle = colour;
        if (filled) c.fill();
        c.stroke();
      }
      function dot(p) {
        c.fillStyle = tool === 'eraser' ? '#fff' : colour;
        c.beginPath(); c.arc(p.x, p.y, (tool === 'eraser' ? size * 1.6 : size) / 2, 0, Math.PI * 2); c.fill();
      }

      canvas.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        e.preventDefault(); canvas.setPointerCapture(e.pointerId);
        pushUndo(); drawing = true; tookAction = false;
        start = last = pos(e);
        base = undo[undo.length - 1];
        if (!SHAPES[tool]) dot(last);
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!drawing) return;
        var p = pos(e);
        if (SHAPES[tool]) {
          c.putImageData(base, 0, 0); drawShape(start, p);
        } else {
          c.strokeStyle = tool === 'eraser' ? '#fff' : colour;
          c.lineWidth = tool === 'eraser' ? size * 1.6 : size; c.lineCap = 'round'; c.lineJoin = 'round';
          c.beginPath(); c.moveTo(last.x, last.y); c.lineTo(p.x, p.y); c.stroke();
        }
        last = p; tookAction = true;
      });
      function endStroke(e) {
        if (!drawing) return;
        drawing = false;
        var p = e && e.clientX !== undefined ? pos(e) : last;
        if (SHAPES[tool]) {
          c.putImageData(base, 0, 0);
          if (Math.abs(p.x - start.x) < 6 && Math.abs(p.y - start.y) < 6) {
            var r = 28 + size; drawShape({ x: start.x - r, y: start.y - r }, { x: start.x + r, y: start.y + r });
          } else drawShape(start, p);
        }
        dirty = true; refresh();
        LCL.emit(SHAPES[tool] ? 'paint:shape' : tool === 'eraser' ? 'paint:erase' : 'paint:drew');
      }
      canvas.addEventListener('pointerup', endStroke);
      canvas.addEventListener('pointercancel', endStroke);

      /* ---------- actions ---------- */
      function doUndo() {
        if (!undo.length) { LCL.bleep.say('There is nothing to undo yet. Draw something first!'); return; }
        c.putImageData(undo.pop(), 0, 0); dirty = true; refresh(); LCL.sound.play('pop');
        LCL.emit('paint:undo');
      }
      function clearAll() {
        pushUndo(); whiteout(); dirty = true; refresh();
        LCL.bleep.say('The page is clear! Press Undo if you change your mind.');
      }
      function guard() {
        if (!dirty) return Promise.resolve(true);
        return LCL.ui.confirm(root, 'Your picture has changes that are not saved. Carry on without saving?', { yes: 'Yes, carry on', no: 'No, go back' });
      }
      function newPicture() {
        guard().then(function (ok) {
          if (!ok) return;
          whiteout(); undo = []; currentId = null; dirty = false; refresh();
          LCL.bleep.say('A fresh page! What will you draw?');
        });
      }
      function save() {
        var data = canvas.toDataURL('image/png');
        if (currentId && vfs.get(currentId)) {
          vfs.writeFile(currentId, data); dirty = false; refresh();
          LCL.bleep.say('Saved!'); LCL.sound.play('good'); LCL.emit('paint:saved', { id: currentId });
          return;
        }
        LCL.ui.fileDialog(root, { mode: 'save', kind: 'drawing', startId: vfs.DESKTOP, defaultName: 'My Picture' }).then(function (r) {
          if (!r) return;
          var n = vfs.createFile(r.folderId, r.name, 'drawing', data, { by: 'pupil' });
          currentId = n.id; dirty = false; refresh();
          LCL.bleep.say('Saved in ' + vfs.pathString(n.parent) + '! You can find it in File Explorer.', { ms: 9000 });
          LCL.sound.play('good'); LCL.emit('paint:saved', { id: n.id });
        });
      }
      function makeWallpaper() {
        if (!currentId || !vfs.get(currentId)) {
          LCL.bleep.say('Save your picture first. Then press Wallpaper to put it on the desktop!', { ms: 9000 });
          LCL.sound.play('oops');
          return;
        }
        if (dirty) { vfs.writeFile(currentId, canvas.toDataURL('image/png')); dirty = false; refresh(); }
        LCL.setWallpaper(currentId);
        LCL.sound.play('good');
        LCL.bleep.say('Your picture is now the desktop wallpaper! Press Show Desktop to see it.', { ms: 9000 });
        LCL.emit('paint:wallpaper', { id: currentId });
      }
      function loadFile(id) {
        var n = vfs.get(id);
        if (!n || n.kind !== 'drawing') return;
        function done() { undo = []; currentId = id; dirty = false; refresh(); LCL.bleep.say('Here is "' + n.name + '". You can keep drawing on it!'); LCL.emit('paint:opened', { id: id }); }
        whiteout();
        if (!n.data) return done();
        var img = new Image();
        img.onload = function () { whiteout(); c.drawImage(img, 0, 0, W, H); done(); };
        img.onerror = done;
        img.src = n.data;
      }
      function openDialog() {
        guard().then(function (ok) {
          if (!ok) return;
          LCL.ui.fileDialog(root, { mode: 'open', kind: 'drawing', startId: currentId && vfs.get(currentId) ? vfs.get(currentId).parent : vfs.DESKTOP }).then(function (id) { if (id) loadFile(id); });
        });
      }

      var off = vfs.onChange(function () {
        if (currentId && !vfs.get(currentId)) currentId = null;
        refresh();
      });

      setTool('brush'); syncFill(); syncSize(); syncColour(); refresh();
      requestAnimationFrame(fit);

      return {
        destroy: off,
        onResize: fit,
        onOpen: function (args) {
          if (args && args.fileId) guard().then(function (ok) { if (ok) loadFile(args.fileId); });
        }
      };
    }
  });
})();
