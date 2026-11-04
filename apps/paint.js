/* Little Paint - Week 2. A Microsoft Paint style editor.
   Drawings are saved into the shared virtual file system. */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs, I = LCL.icons;

  var DEF_W = 640, DEF_H = 400, MIN_DIM = 8, MAX_DIM = 1600;
  var ZOOMS = [0.25, 0.5, 1, 2, 3, 4, 6, 8];
  var PALETTE = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#4000ff', '#804000',
    '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040'
  ];
  var FONTS = ['Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];
  var FSIZES = [10, 12, 14, 18, 24, 36, 48, 72];
  var LWS = [1, 2, 3, 5, 8], BSIZES = [2, 4, 8, 14, 24], ESIZES = [4, 8, 12, 20], ASIZES = [8, 16, 24];
  var BSHAPES = ['round', 'square', 'slash', 'back'];

  var TOOLS = [
    ['freeselect', 'Free-Form Select', 'Draw around something to select it. Then drag it to move it.'],
    ['select', 'Select', 'Drag a box to select. Drag inside it to move it. Hold Ctrl to copy.'],
    ['eraser', 'Eraser', 'Press and hold to rub out.'],
    ['fill', 'Fill With Colour', 'Click an area to fill it with colour.'],
    ['picker', 'Pick Colour', 'Click the picture to copy a colour from it.'],
    ['magnifier', 'Magnifier', 'Click to zoom in. Right-click to zoom out.'],
    ['pencil', 'Pencil', 'Press and hold to draw a thin line.'],
    ['brush', 'Brush', 'Press and hold to paint.'],
    ['airbrush', 'Airbrush', 'Press and hold to spray colour.'],
    ['text', 'Text', 'Drag a box, then type. Click outside the box when you are done.'],
    ['line', 'Line', 'Drag to make a straight line. Hold Shift for straight angles.'],
    ['curve', 'Curve', 'Drag a line, then drag on the page twice to bend it.'],
    ['rect', 'Rectangle', 'Drag to make a rectangle. Hold Shift for a square.'],
    ['polygon', 'Polygon', 'Drag the first side, then click each corner. Double-click to finish.'],
    ['ellipse', 'Ellipse', 'Drag to make an oval. Hold Shift for a circle.'],
    ['roundrect', 'Rounded Rectangle', 'Drag to make a rectangle with round corners.'],
    ['triangle', 'Triangle', 'Drag to make a triangle.'],
    ['diamond', 'Diamond', 'Drag to make a diamond.'],
    ['pentagon', 'Pentagon', 'Drag to make a pentagon.'],
    ['hexagon', 'Hexagon', 'Drag to make a hexagon.'],
    ['star', 'Star', 'Drag to make a star. Or just click to stamp one!'],
    ['heart', 'Heart', 'Drag to make a heart.'],
    ['arrow', 'Arrow', 'Drag to make an arrow.'],
    ['bolt', 'Lightning', 'Drag to make a lightning bolt.']
  ];
  var TIPS = {};
  TOOLS.forEach(function (t) { TIPS[t[0]] = t[2]; });
  var BOXSHAPES = { rect: 1, ellipse: 1, roundrect: 1, triangle: 1, diamond: 1, pentagon: 1, hexagon: 1, star: 1, heart: 1, arrow: 1, bolt: 1 };
  var MODE_TOOLS = { rect: 1, ellipse: 1, roundrect: 1, triangle: 1, diamond: 1, pentagon: 1, hexagon: 1, star: 1, heart: 1, arrow: 1, bolt: 1, polygon: 1 };
  var UNIT = {
    triangle: [[.5, 0], [1, 1], [0, 1]],
    diamond: [[.5, 0], [1, .5], [.5, 1], [0, .5]],
    pentagon: [[.5, 0], [1, .38], [.81, 1], [.19, 1], [0, .38]],
    hexagon: [[.25, 0], [.75, 0], [1, .5], [.75, 1], [.25, 1], [0, .5]],
    star: [[.5, 0], [.62, .38], [1, .38], [.69, .62], [.81, 1], [.5, .77], [.19, 1], [.31, .62], [0, .38], [.38, .38]],
    arrow: [[0, .3], [.55, .3], [.55, 0], [1, .5], [.55, 1], [.55, .7], [0, .7]],
    bolt: [[.6, 0], [.15, .55], [.5, .55], [.4, 1], [.85, .4], [.5, .4]]
  };
  var ICONS = {
    freeselect: '<path d="M3 5 L7 2.5 L13 4.5 L12.5 10 L8 13.5 L3.5 9.5 Z" stroke-dasharray="2 1.5"/>',
    select: '<rect x="2.5" y="3.5" width="11" height="9" stroke-dasharray="2 1.5"/>',
    eraser: '<path d="M3 10 L9 3 L14 7 L8 14 L5 14 Z" fill="#f78fb3"/>',
    fill: '<path d="M2.5 8 L7.5 3 L12.5 8 L7.5 13 Z" fill="#fff"/><path d="M13 9.5 Q15 12.5 13 13.5 Q11 12.5 13 9.5 Z" fill="#228be6" stroke="none"/>',
    picker: '<path d="M10.5 2 L14 5.5 L12 7.5 L8.5 4 Z" fill="#868e96"/><path d="M8.5 5 L3 10.5 L3 13 L5.5 13 L11 7.5" fill="#fff"/>',
    magnifier: '<circle cx="6.5" cy="6.5" r="4" fill="#cfe8ff"/><path d="M9.5 9.5 L14 14" stroke-width="2"/>',
    pencil: '<path d="M3 13 L4 10 L11 3 L13 5 L6 12 Z" fill="#ffd43b"/>',
    brush: '<path d="M13.5 2 L7.5 8" stroke="#8d5524" stroke-width="2.5"/><path d="M7.5 8 Q3 8 3 13 Q8 13 8.5 9 Z" fill="#228be6"/>',
    airbrush: '<rect x="2" y="8" width="6" height="5" fill="#ced4da"/><path d="M8 9 L11 6.5"/><circle cx="12.5" cy="3" r=".7" fill="#222"/><circle cx="14" cy="5.5" r=".7" fill="#222"/><circle cx="11" cy="3.5" r=".6" fill="#222"/><circle cx="13" cy="7.5" r=".6" fill="#222"/>',
    text: '<text x="3" y="13" font-size="13" font-weight="bold" font-family="serif" fill="#222" stroke="none">A</text>',
    line: '<path d="M3 13 L13 3" stroke-width="1.5"/>',
    curve: '<path d="M3 12 C3 2 13 14 13 4" stroke-width="1.5"/>',
    rect: '<rect x="2.5" y="4.5" width="11" height="8"/>',
    polygon: '<path d="M3 12 L5 4 L11 3 L14 9 L8 13 Z"/>',
    ellipse: '<ellipse cx="8" cy="8" rx="6" ry="4.5"/>',
    roundrect: '<rect x="2.5" y="4.5" width="11" height="8" rx="3"/>',
    triangle: '<path d="M8 2.5 L14 13 L2 13 Z"/>',
    diamond: '<path d="M8 2 L14 8 L8 14 L2 8 Z"/>',
    pentagon: '<path d="M8 2 L14 6.5 L12 13.5 L4 13.5 L2 6.5 Z"/>',
    hexagon: '<path d="M5 3 L11 3 L14 8 L11 13 L5 13 L2 8 Z"/>',
    star: '<path d="M8 1.5 L9.5 5.9 L14.2 6 L10.4 8.9 L11.7 13.4 L8 10.8 L4.3 13.4 L5.6 8.9 L1.8 6 L6.5 5.9 Z"/>',
    heart: '<path d="M8 13.5 C4 10.5 2 8.5 2 6 C2 4 3.5 3 5 3 C6.5 3 8 4 8 5.5 C8 4 9.5 3 11 3 C12.5 3 14 4 14 6 C14 8.5 12 10.5 8 13.5 Z"/>',
    arrow: '<path d="M2 6 L9 6 L9 3 L14 8 L9 13 L9 10 L2 10 Z"/>',
    bolt: '<path d="M9.5 2 L4 9 L8 9 L7 14 L12.5 7 L8.5 7 Z"/>'
  };
  function svg16(inner) {
    return '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#222" stroke-width="1" aria-hidden="true">' + inner + '</svg>';
  }

  var CSS = [
    '.mp{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;background:#ece9d8;color:#000;font-size:12px;outline:0;user-select:none;-webkit-user-select:none}',
    '.mp *{box-sizing:border-box}',
    '.mp-menubar{display:flex;background:#ece9d8;border-bottom:1px solid #aca899;padding:1px 2px}',
    '.mp-menubtn{background:none;border:1px solid transparent;padding:3px 9px;cursor:pointer;font:inherit;color:inherit}',
    '.mp-menubtn:hover,.mp-menubtn.open{background:#316ac5;color:#fff}',
    '.mp-menu{position:absolute;z-index:60;background:#fff;border:1px solid #808080;box-shadow:2px 2px 5px rgba(0,0,0,.35);min-width:230px;padding:2px}',
    '.mp-mi{display:flex;justify-content:space-between;gap:28px;padding:4px 18px;cursor:pointer;white-space:nowrap}',
    '.mp-mi:hover{background:#316ac5;color:#fff}',
    '.mp-mi.dis{color:#999;pointer-events:none}',
    '.mp-key{opacity:.7}',
    '.mp-sep{height:1px;background:#ccc;margin:3px 2px}',
    '.mp-qat{display:flex;gap:4px;align-items:center;padding:3px 6px;border-bottom:1px solid #aca899;flex-wrap:wrap}',
    '.mp-qat .btn{padding:3px 9px;cursor:pointer}',
    '.mp-qsep{width:1px;height:22px;background:#aca899;margin:0 4px}',
    '.mp-textbar{display:none;align-items:center;gap:6px;padding:3px 6px;border-bottom:1px solid #aca899;background:#f5f4ea;flex-wrap:wrap}',
    '.mp-textbar select{font:inherit;padding:2px}',
    '.mp-tg{min-width:28px;padding:2px 8px;cursor:pointer}',
    '.mp-tg.on{background:#316ac5;color:#fff}',
    '.mp-body{flex:1;min-height:0;display:flex}',
    '.mp-left{width:84px;flex:0 0 auto;padding:4px;display:flex;flex-direction:column;gap:6px;overflow-y:auto;background:#ece9d8}',
    '.mp-tools{display:grid;grid-template-columns:repeat(2,1fr);gap:1px}',
    '.mp-tool{height:28px;display:flex;align-items:center;justify-content:center;background:#ece9d8;border:1px solid transparent;cursor:pointer;padding:0}',
    '.mp-tool:hover{border-color:#fff #808080 #808080 #fff}',
    '.mp-tool.on{background:#fff;border-color:#808080 #fff #fff #808080}',
    '.mp-opts{border:1px solid;border-color:#808080 #fff #fff #808080;padding:3px;min-height:74px;display:flex;flex-wrap:wrap;gap:2px;align-content:flex-start}',
    '.mp-opt{min-width:34px;min-height:22px;display:flex;align-items:center;justify-content:center;background:#ece9d8;border:1px solid transparent;cursor:pointer;padding:1px 3px;font:inherit;color:inherit}',
    '.mp-opt:hover{border-color:#fff #808080 #808080 #fff}',
    '.mp-opt.on{background:#fff;border-color:#808080 #fff #fff #808080}',
    '.mp-opt.wide{width:100%}',
    '.mp-work{flex:1;min-width:0;overflow:auto;background:#808080;border:2px solid;border-color:#808080 #fff #fff #808080}',
    '.mp-pad{display:inline-block;padding:10px 22px 22px 10px;vertical-align:top}',
    '.mp-cw{position:relative;background:#fff;touch-action:none;box-shadow:1px 1px 0 #000}',
    '.mp-cw canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}',
    '.mp-ov{pointer-events:none}',
    '.mp-px{image-rendering:pixelated}',
    '.mp-h{position:absolute;width:7px;height:7px;background:#316ac5;border:1px solid #fff;z-index:5}',
    '.mp-hr{right:-9px;top:50%;margin-top:-4px;cursor:ew-resize}',
    '.mp-hb{bottom:-9px;left:50%;margin-left:-4px;cursor:ns-resize}',
    '.mp-hc{right:-9px;bottom:-9px;cursor:nwse-resize}',
    '.mp-rsz{position:absolute;left:0;top:0;border:1px dashed #000;display:none;pointer-events:none;z-index:4}',
    '.mp-text{position:absolute;z-index:6;resize:both;overflow:hidden;border:1px dashed #000;padding:0;margin:0;outline:0;white-space:pre-wrap;word-break:break-word;min-width:30px;min-height:20px}',
    '.mp-pal{display:flex;align-items:center;gap:10px;padding:4px 8px;border-top:1px solid #fff;background:#ece9d8;flex-wrap:wrap}',
    '.mp-fgbg{position:relative;width:42px;height:38px;flex:0 0 auto;border:1px solid;border-color:#808080 #fff #fff #808080;background:#ece9d8}',
    '.mp-fg,.mp-bg{position:absolute;width:20px;height:20px;border:1px solid #000;cursor:pointer;padding:0}',
    '.mp-fg{left:4px;top:4px;z-index:2;box-shadow:0 0 0 1px #fff}',
    '.mp-bg{left:16px;top:14px}',
    '.mp-colours{display:grid;grid-template-rows:repeat(2,20px);grid-auto-flow:column;grid-auto-columns:20px;gap:1px}',
    '.mp-sw{width:20px;height:20px;border:1px solid;border-color:#808080 #fff #fff #808080;padding:0;cursor:pointer}',
    '.mp-status{display:flex;align-items:center;gap:0;border-top:1px solid #aca899;background:#ece9d8;font-size:12px;flex-wrap:wrap}',
    '.mp-seg{padding:2px 8px;border-right:1px solid #aca899;white-space:nowrap}',
    '.mp-seg.grow{flex:1;min-width:120px;overflow:hidden;text-overflow:ellipsis}',
    '.mp-zbtn{padding:0 8px;cursor:pointer;font:inherit}',
    '.mp-modal{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;z-index:70}',
    '.mp-dlg{background:#ece9d8;border:2px solid #0a246a;min-width:250px;box-shadow:3px 3px 8px rgba(0,0,0,.5)}',
    '.mp-dlgtitle{background:#0a246a;color:#fff;font-weight:700;padding:4px 8px}',
    '.mp-dlgbody{padding:10px 12px;display:flex;flex-direction:column;gap:8px}',
    '.mp-dlgbody label{display:flex;align-items:center;gap:8px}',
    '.mp-dlgbody input{width:80px;font:inherit;padding:2px}',
    '.mp-dlgbtns{display:flex;justify-content:flex-end;gap:6px;margin-top:4px}',
    '.mp-dlgbtns .btn{cursor:pointer;padding:3px 14px}'
  ].join('\n');

  function ico(n) { try { return (I && I.g) ? I.g(n) : ''; } catch (e) { return ''; } }
  function say(msg, ms) { try { LCL.bleep.say(msg, { ms: ms || 6000 }); } catch (e) { /* ignore */ } }
  function snd(n) { try { LCL.sound.play(n); } catch (e) { /* ignore */ } }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgbHex(r, g, b) { return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1); }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function clampDim(v) { return Math.max(MIN_DIM, Math.min(MAX_DIM, Math.round(v) || MIN_DIM)); }
  function snap45(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, step = Math.PI / 4, ang = Math.round(Math.atan2(dy, dx) / step) * step, d = Math.sqrt(dx * dx + dy * dy);
    return { x: a.x + Math.cos(ang) * d, y: a.y + Math.sin(ang) * d };
  }

  /* ---------- shape drawing (works on any 2D context) ---------- */
  function shapePath(g, t, x, y, w, h) {
    g.beginPath();
    if (t === 'rect') { g.rect(x, y, w, h); }
    else if (t === 'ellipse') { g.ellipse(x + w / 2, y + h / 2, Math.max(0.5, w / 2), Math.max(0.5, h / 2), 0, 0, Math.PI * 2); }
    else if (t === 'roundrect') {
      var r = Math.min(w, h) * 0.25;
      g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
      g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
      g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
    } else if (t === 'heart') {
      var X = function (u) { return x + u * w; }, Y = function (v) { return y + v * h; };
      g.moveTo(X(.5), Y(1));
      g.bezierCurveTo(X(.15), Y(.72), X(0), Y(.5), X(0), Y(.3));
      g.bezierCurveTo(X(0), Y(.1), X(.15), Y(0), X(.27), Y(0));
      g.bezierCurveTo(X(.4), Y(0), X(.5), Y(.1), X(.5), Y(.22));
      g.bezierCurveTo(X(.5), Y(.1), X(.6), Y(0), X(.73), Y(0));
      g.bezierCurveTo(X(.85), Y(0), X(1), Y(.1), X(1), Y(.3));
      g.bezierCurveTo(X(1), Y(.5), X(.85), Y(.72), X(.5), Y(1));
      g.closePath();
    } else {
      UNIT[t].forEach(function (q, i) {
        var px = x + q[0] * w, py = y + q[1] * h;
        if (i) g.lineTo(px, py); else g.moveTo(px, py);
      });
      g.closePath();
    }
  }
  function paintPath(g, mode, mc, ac, lw) {
    g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = lw;
    if (mode === 'solid') { g.fillStyle = mc; g.fill(); }
    else {
      if (mode === 'both') { g.fillStyle = ac; g.fill(); }
      g.strokeStyle = mc; g.stroke();
    }
  }
  function drawBoxShape(g, t, a, b, mc, ac, mode, lw, shift) {
    var x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    if (shift) { var m = Math.max(w, h); x = b.x < a.x ? a.x - m : a.x; y = b.y < a.y ? a.y - m : a.y; w = h = m; }
    if (w < 1 || h < 1) return;
    if (mode !== 'solid') { x += lw / 2; y += lw / 2; w = Math.max(1, w - lw); h = Math.max(1, h - lw); }
    shapePath(g, t, x, y, w, h);
    paintPath(g, mode, mc, ac, lw);
  }
  function drawLine(g, a, b, col, lw) {
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  }
  function drawCurve(g, cv) {
    g.strokeStyle = cv.col; g.lineWidth = cv.lw; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cv.p0.x, cv.p0.y);
    if (!cv.c1) g.lineTo(cv.p1.x, cv.p1.y);
    else { var c2 = cv.c2 || cv.c1; g.bezierCurveTo(cv.c1.x, cv.c1.y, c2.x, c2.y, cv.p1.x, cv.p1.y); }
    g.stroke();
  }
  function drawPoly(g, pl, closed) {
    g.beginPath();
    pl.pts.forEach(function (q, i) { if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); });
    if (closed && pl.pts.length > 2) { g.closePath(); paintPath(g, pl.mode, pl.mc, pl.ac, pl.lw); }
    else { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = pl.lw; g.strokeStyle = pl.mc; g.stroke(); }
  }

  LCL.registerApp({
    id: 'paint', title: 'Little Paint', icon: 'paint', w: 940, h: 650, minW: 560, minH: 440,
    help: 'Pick a tool and a colour, then press and hold to draw. When you are happy, press Save!',
    mount: function (root, ctx) {
      var W = DEF_W, H = DEF_H;
      var S = {
        tool: 'brush', prevTool: 'pencil', fg: '#000000', bg: '#ffffff', lw: 2, mode: 'outline',
        brushSize: 4, brushShape: 'round', eraserSize: 12, airSize: 16, zoom: 1, fit: false,
        selTrans: false, textTrans: true, font: 'Arial', fs: 18, bold: false, italic: false, underline: false
      };
      var undo = [], redo = [], dirty = false, currentId = null;
      var drag = null, sel = null, clip = null, curve = null, poly = null, textBox = null;
      var airTimer = null, lastClick = 0, lastPos = { x: -99, y: -99 }, openMenu = null;

      if (!document.getElementById('mp-style')) {
        var st = document.createElement('style');
        st.id = 'mp-style'; st.textContent = CSS; document.head.appendChild(st);
      }

      /* ---------- canvases ---------- */
      var canvas = el('canvas', { class: 'mp-canvas', width: String(W), height: String(H), 'aria-label': 'Drawing page' });
      var c = canvas.getContext('2d', { willReadFrequently: true });
      var ov = el('canvas', { class: 'mp-ov', width: String(W), height: String(H) });
      var o = ov.getContext('2d');
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);

      var cw = el('div', { class: 'mp-cw' }, [canvas, ov]);
      var rsz = el('div', { class: 'mp-rsz' }, []);
      var hR = el('div', { class: 'mp-h mp-hr', title: 'Drag to change the width' }, []);
      var hB = el('div', { class: 'mp-h mp-hb', title: 'Drag to change the height' }, []);
      var hC = el('div', { class: 'mp-h mp-hc', title: 'Drag to change the size' }, []);
      [rsz, hR, hB, hC].forEach(function (n) { cw.appendChild(n); });
      var pad = el('div', { class: 'mp-pad' }, [cw]);
      var work = el('div', { class: 'mp-work' }, [pad]);

      /* ---------- left toolbox ---------- */
      var toolBox = el('div', { class: 'mp-tools' }, []), toolBtns = {};
      TOOLS.forEach(function (t) {
        var b = el('button', { class: 'mp-tool', title: t[1], 'aria-label': t[1] }, []);
        b.innerHTML = svg16(ICONS[t[0]]);
        b.addEventListener('click', function () { setTool(t[0]); });
        toolBtns[t[0]] = b; toolBox.appendChild(b);
      });
      var opts = el('div', { class: 'mp-opts' }, []);
      var left = el('div', { class: 'mp-left' }, [toolBox, opts]);

      /* ---------- menu bar + quick toolbar ---------- */
      var menubar = el('div', { class: 'mp-menubar' }, []);
      var qUndo = el('button', { class: 'btn', html: ico('undo') + ' Undo', onclick: doUndo });
      var qRedo = el('button', { class: 'btn', html: '&#8631; Redo', onclick: doRedo });
      var qat = el('div', { class: 'mp-qat' }, [
        el('button', { class: 'btn', html: ico('newpage') + ' New', onclick: newPicture }),
        el('button', { class: 'btn', html: ico('open') + ' Open', onclick: openDialog }),
        el('button', { class: 'btn primary', html: ico('save') + ' Save', onclick: save }),
        el('button', { class: 'btn primary', title: 'Use this picture as the desktop wallpaper', html: ico('desktop') + ' Wallpaper', onclick: makeWallpaper }),
        el('span', { class: 'mp-qsep' }, []),
        qUndo, qRedo
      ]);

      /* ---------- text options bar ---------- */
      var fontSel = document.createElement('select');
      FONTS.forEach(function (f) { var op = document.createElement('option'); op.value = f; op.textContent = f; fontSel.appendChild(op); });
      fontSel.value = S.font;
      fontSel.addEventListener('change', function () { S.font = fontSel.value; applyTextStyle(); });
      var sizeSel = document.createElement('select');
      FSIZES.forEach(function (f) { var op = document.createElement('option'); op.value = String(f); op.textContent = f + ' pt'; sizeSel.appendChild(op); });
      sizeSel.value = String(S.fs);
      sizeSel.addEventListener('change', function () { S.fs = parseInt(sizeSel.value, 10) || 18; applyTextStyle(); });
      function toggle(label, key, style) {
        var b = el('button', { class: 'btn mp-tg', text: label }, []);
        b.setAttribute('style', style);
        b.addEventListener('click', function () { S[key] = !S[key]; b.classList.toggle('on', S[key]); applyTextStyle(); });
        return b;
      }
      var textbar = el('div', { class: 'mp-textbar' }, [
        el('span', { text: 'Font:' }, []), fontSel, sizeSel,
        toggle('B', 'bold', 'font-weight:700'), toggle('I', 'italic', 'font-style:italic'), toggle('U', 'underline', 'text-decoration:underline')
      ]);

      /* ---------- colour palette ---------- */
      var fgSq = el('button', { class: 'mp-fg', title: 'Foreground colour (click to change)', 'aria-label': 'Foreground colour' }, []);
      var bgSq = el('button', { class: 'mp-bg', title: 'Background colour (click to change)', 'aria-label': 'Background colour' }, []);
      fgSq.addEventListener('click', function () { editColour('fg'); });
      bgSq.addEventListener('click', function () { editColour('bg'); });
      var colours = el('div', { class: 'mp-colours', role: 'group', 'aria-label': 'Colours' }, []);
      function addSwatch(col) {
        var b = el('button', { class: 'mp-sw', title: col, 'aria-label': 'Colour ' + col }, []);
        b.style.background = col;
        b.addEventListener('click', function () { pickColour(col, 'fg'); });
        b.addEventListener('contextmenu', function (e) { e.preventDefault(); pickColour(col, 'bg'); });
        colours.appendChild(b);
      }
      for (var pi = 0; pi < 14; pi++) { addSwatch(PALETTE[pi]); addSwatch(PALETTE[pi + 14]); }
      var customBtn = el('button', { class: 'btn', text: 'Edit Colours…', onclick: function () { editColour('fg'); } });
      var pal = el('div', { class: 'mp-pal' }, [el('div', { class: 'mp-fgbg' }, [bgSq, fgSq]), colours, customBtn,
        el('span', { text: 'Left-click = colour 1, right-click = colour 2', style: 'opacity:.7' }, [])]);

      var colorIn = document.createElement('input');
      colorIn.type = 'color';
      colorIn.setAttribute('style', 'position:absolute;opacity:0;width:0;height:0;pointer-events:none;left:0;top:0');
      colorIn.addEventListener('input', function () {
        var which = colorIn.getAttribute('data-which') === 'bg' ? 'bg' : 'fg';
        pickColour(colorIn.value, which);
      });

      /* ---------- status bar ---------- */
      var hintEl = el('div', { class: 'mp-seg grow' }, []);
      var selEl = el('div', { class: 'mp-seg' }, []);
      var coordEl = el('div', { class: 'mp-seg', style: 'min-width:76px' }, []);
      var sizeEl = el('div', { class: 'mp-seg' }, []);
      var saveEl = el('div', { class: 'mp-seg' }, []);
      var zoomEl = el('span', { style: 'min-width:38px;display:inline-block;text-align:center' }, []);
      var zMinus = el('button', { class: 'mp-zbtn', text: '−', title: 'Zoom out', onclick: function () { S.fit = false; zoomStep(-1); } });
      var zPlus = el('button', { class: 'mp-zbtn', text: '+', title: 'Zoom in', onclick: function () { S.fit = false; zoomStep(1); } });
      var zFit = el('button', { class: 'mp-zbtn', text: 'Fit', title: 'Fit the picture to the window', onclick: fitZoom });
      var status = el('div', { class: 'mp-status' }, [hintEl, selEl, coordEl, sizeEl, saveEl, el('div', { class: 'mp-seg' }, [zMinus, zoomEl, zPlus, zFit])]);

      var body = el('div', { class: 'mp-body' }, [left, work]);
      var wrap = el('div', { class: 'mp', tabindex: '0' }, [menubar, qat, textbar, body, pal, status]);
      wrap.appendChild(colorIn);
      root.appendChild(wrap);

      /* ---------- menus ---------- */
      function closeMenu() {
        if (!openMenu) return;
        if (openMenu.pop.parentNode) openMenu.pop.parentNode.removeChild(openMenu.pop);
        openMenu.btn.classList.remove('open');
        openMenu = null;
      }
      function showMenu(btn, items) {
        closeMenu();
        var pop = el('div', { class: 'mp-menu' }, []);
        items.forEach(function (it) {
          if (it.sep) { pop.appendChild(el('div', { class: 'mp-sep' }, [])); return; }
          var dis = it.dis && it.dis();
          var row = el('div', { class: 'mp-mi' + (dis ? ' dis' : '') }, [el('span', { text: it.t }, []), el('span', { class: 'mp-key', text: it.k || '' }, [])]);
          row.addEventListener('click', function () { closeMenu(); it.f(); });
          pop.appendChild(row);
        });
        var br = btn.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        pop.style.left = (br.left - wr.left) + 'px';
        pop.style.top = (br.bottom - wr.top) + 'px';
        wrap.appendChild(pop);
        btn.classList.add('open');
        openMenu = { btn: btn, pop: pop };
      }
      var MENUS = [
        ['File', function () {
          return [
            { t: 'New', k: 'Ctrl+N', f: newPicture }, { t: 'Open…', k: 'Ctrl+O', f: openDialog }, { sep: 1 },
            { t: 'Save', k: 'Ctrl+S', f: save }, { t: 'Save As…', f: saveAs }, { sep: 1 },
            { t: 'Set as Wallpaper', f: makeWallpaper }
          ];
        }],
        ['Edit', function () {
          return [
            { t: 'Undo', k: 'Ctrl+Z', f: doUndo, dis: function () { return !undo.length && !curve && !poly && !textBox; } },
            { t: 'Redo', k: 'Ctrl+Y', f: doRedo, dis: function () { return !redo.length; } }, { sep: 1 },
            { t: 'Cut', k: 'Ctrl+X', f: cutSel, dis: function () { return !sel; } },
            { t: 'Copy', k: 'Ctrl+C', f: copySel, dis: function () { return !sel; } },
            { t: 'Paste', k: 'Ctrl+V', f: pasteSel, dis: function () { return !clip; } },
            { t: 'Clear Selection', k: 'Del', f: deleteSel, dis: function () { return !sel; } },
            { t: 'Select All', k: 'Ctrl+A', f: selectAll }
          ];
        }],
        ['View', function () {
          return [
            { t: 'Zoom In', f: function () { S.fit = false; zoomStep(1); } }, { t: 'Zoom Out', f: function () { S.fit = false; zoomStep(-1); } },
            { t: 'Normal Size (100%)', f: function () { S.fit = false; setZoom(1); } }, { t: 'Fit to Window', f: fitZoom }
          ];
        }],
        ['Image', function () {
          return [
            { t: 'Flip Horizontal', f: function () { flip(true); } }, { t: 'Flip Vertical', f: function () { flip(false); } },
            { t: 'Rotate Right 90°', f: function () { rotate(90); } }, { t: 'Rotate Left 90°', f: function () { rotate(-90); } },
            { t: 'Rotate 180°', f: function () { rotate(180); } }, { sep: 1 },
            { t: 'Invert Colours', f: invertColours }, { t: 'Clear Image', k: 'Ctrl+Shift+N', f: clearImage }, { sep: 1 },
            { t: 'Attributes…', f: attrDialog }
          ];
        }],
        ['Colours', function () {
          return [
            { t: 'Edit Colour 1 (foreground)…', f: function () { editColour('fg'); } },
            { t: 'Edit Colour 2 (background)…', f: function () { editColour('bg'); } }
          ];
        }],
        ['Help', function () {
          return [
            { t: 'How to paint', f: function () { say('Pick a tool on the left and a colour at the bottom. Press and hold on the page to draw. Right-click a colour to change the background colour!', 12000); } },
            { t: 'Make a wallpaper', f: function () { say('Press Wallpaper at the top. If your picture is not saved yet, I will help you save it first!', 10000); } }
          ];
        }]
      ];
      MENUS.forEach(function (m) {
        var b = el('button', { class: 'mp-menubtn', text: m[0] }, []);
        b.addEventListener('click', function () { if (openMenu && openMenu.btn === b) closeMenu(); else showMenu(b, m[1]()); });
        b.addEventListener('pointerenter', function () { if (openMenu && openMenu.btn !== b) showMenu(b, m[1]()); });
        menubar.appendChild(b);
      });
      function docDown(e) {
        if (openMenu && !openMenu.pop.contains(e.target) && !openMenu.btn.contains(e.target)) closeMenu();
      }
      document.addEventListener('pointerdown', docDown, true);

      /* ---------- state helpers ---------- */
      function layout() {
        cw.style.width = Math.round(W * S.zoom) + 'px';
        cw.style.height = Math.round(H * S.zoom) + 'px';
        canvas.classList.toggle('mp-px', S.zoom > 1);
        ov.classList.toggle('mp-px', S.zoom > 1);
        updateStatus();
      }
      function setDims(w, h) {
        W = w; H = h;
        canvas.width = w; canvas.height = h; ov.width = w; ov.height = h;
        layout();
      }
      function updateStatus() {
        zoomEl.textContent = Math.round(S.zoom * 100) + '%';
        sizeEl.textContent = W + ' × ' + H + 'px';
        selEl.textContent = sel ? 'Selection: ' + sel.w + ' × ' + sel.h : '';
      }
      function refresh() {
        var n = currentId && vfs.get(currentId);
        ctx.setTitle((n ? n.name : 'Untitled') + ' - Little Paint');
        saveEl.textContent = !n ? (dirty ? 'Not saved yet' : 'New picture') : dirty ? 'Changes not saved' : 'Saved in ' + vfs.pathString(n.parent);
        qUndo.disabled = !undo.length; qRedo.disabled = !redo.length;
        updateStatus();
      }
      function syncColours() {
        fgSq.style.background = S.fg; bgSq.style.background = S.bg;
        applyTextStyle();
      }
      function pickColour(col, which) {
        if (which === 'bg') S.bg = col; else S.fg = col;
        syncColours();
        if (S.tool === 'eraser' && which === 'fg') setTool('brush', true);
        if (which === 'fg') { emit('paint:colour'); snd('pop'); }
      }
      function editColour(which) {
        colorIn.setAttribute('data-which', which);
        colorIn.value = which === 'bg' ? S.bg : S.fg;
        colorIn.click();
      }
      function emit(n, d) { LCL.emit(n, d); }

      function snapshot() { return { w: W, h: H, d: c.getImageData(0, 0, W, H) }; }
      function restore(s) {
        if (s.w !== W || s.h !== H) setDims(s.w, s.h);
        c.putImageData(s.d, 0, 0);
      }
      function trim() {
        var max = Math.max(6, Math.floor(48e6 / (W * H * 4)));
        while (undo.length > max) undo.shift();
      }
      function pushUndo() { undo.push(snapshot()); redo = []; trim(); }
      function clearOv() { o.clearRect(0, 0, W, H); }
      function whiteout(col) { c.fillStyle = col || '#fff'; c.fillRect(0, 0, W, H); }
      function copyCanvas() {
        var t = document.createElement('canvas'); t.width = W; t.height = H;
        t.getContext('2d').drawImage(canvas, 0, 0); return t;
      }

      /* ---------- zoom ---------- */
      function setZoom(z, ax, ay, tx, ty) {
        commitText();
        z = Math.max(0.1, Math.min(8, z));
        var wr = work.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
        if (ax === undefined) {
          tx = wr.left + work.clientWidth / 2; ty = wr.top + work.clientHeight / 2;
          ax = (tx - cr.left) / S.zoom; ay = (ty - cr.top) / S.zoom;
        }
        S.zoom = z; layout();
        var cr2 = canvas.getBoundingClientRect();
        work.scrollLeft += (cr2.left + ax * z) - tx;
        work.scrollTop += (cr2.top + ay * z) - ty;
        if (sel) drawSelOverlay();
        if (S.tool === 'magnifier') renderOpts();
      }
      function zoomStep(dir, ax, ay, tx, ty) {
        var z = S.zoom, nz = z, i;
        if (dir > 0) { for (i = 0; i < ZOOMS.length; i++) if (ZOOMS[i] > z + 0.001) { nz = ZOOMS[i]; break; } }
        else { for (i = ZOOMS.length - 1; i >= 0; i--) if (ZOOMS[i] < z - 0.001) { nz = ZOOMS[i]; break; } }
        setZoom(nz, ax, ay, tx, ty);
      }
      function fitZoom() {
        var z = Math.min((work.clientWidth - 44) / W, (work.clientHeight - 44) / H);
        S.fit = true;
        setZoom(Math.max(0.1, Math.min(8, Math.floor(z * 100) / 100)));
        work.scrollLeft = 0; work.scrollTop = 0;
      }
      work.addEventListener('wheel', function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        var p = pos(e); S.fit = false;
        zoomStep(e.deltaY < 0 ? 1 : -1, p.x, p.y, e.clientX, e.clientY);
      }, { passive: false });

      /* ---------- tools + option box ---------- */
      function setTool(t, quiet) {
        if (t !== S.tool) commitAll();
        if ((t === 'picker' || t === 'magnifier') && S.tool !== 'picker' && S.tool !== 'magnifier') S.prevTool = S.tool;
        S.tool = t;
        Object.keys(toolBtns).forEach(function (k) { toolBtns[k].classList.toggle('on', k === t); });
        textbar.style.display = t === 'text' ? 'flex' : 'none';
        canvas.style.cursor = t === 'magnifier' ? 'zoom-in' : t === 'text' ? 'text' : 'crosshair';
        hintEl.textContent = TIPS[t] || '';
        renderOpts();
        if (!quiet) say(TIPS[t], 5000);
      }
      function optBtn(inner, on, title, fn, cls) {
        var b = el('button', { class: 'mp-opt' + (on ? ' on' : '') + (cls ? ' ' + cls : ''), title: title || '' }, []);
        if (typeof inner === 'string') b.innerHTML = inner;
        b.addEventListener('click', function () { fn(); renderOpts(); });
        return b;
      }
      function renderOpts() {
        clear(opts);
        var t = S.tool;
        function add(n) { opts.appendChild(n); }
        function lineWidths() {
          LWS.forEach(function (w) {
            add(optBtn('<svg width="52" height="12"><line x1="3" y1="6" x2="49" y2="6" stroke="#000" stroke-width="' + w + '"/></svg>', S.lw === w, w + ' pixels', function () { S.lw = w; }, 'wide'));
          });
        }
        if (t === 'select' || t === 'freeselect') {
          add(optBtn('Opaque', !S.selTrans, 'Keep the background colour when you move it', function () { S.selTrans = false; selTransChanged(); }, 'wide'));
          add(optBtn('Clear', S.selTrans, 'Make the background colour see-through', function () { S.selTrans = true; selTransChanged(); }, 'wide'));
        } else if (t === 'text') {
          add(optBtn('Opaque', !S.textTrans, 'Fill the text box with the background colour', function () { S.textTrans = false; applyTextStyle(); }, 'wide'));
          add(optBtn('Clear', S.textTrans, 'See-through text box', function () { S.textTrans = true; applyTextStyle(); }, 'wide'));
        } else if (t === 'eraser') {
          ESIZES.forEach(function (s) {
            add(optBtn('<i style="display:block;width:' + Math.min(s, 18) + 'px;height:' + Math.min(s, 18) + 'px;background:#fff;border:1px solid #000"></i>', S.eraserSize === s, s + ' pixels', function () { S.eraserSize = s; }));
          });
        } else if (t === 'magnifier') {
          [1, 2, 3, 4, 6, 8].forEach(function (z) {
            add(optBtn(z + '×', Math.abs(S.zoom - z) < 0.001, 'Zoom ' + (z * 100) + '%', function () { S.fit = false; setZoom(z); }, 'wide'));
          });
        } else if (t === 'brush') {
          var shapeSvg = {
            round: '<circle cx="8" cy="8" r="5" fill="#000"/>', square: '<rect x="3" y="3" width="10" height="10" fill="#000"/>',
            slash: '<path d="M3 13 L13 3" stroke="#000" stroke-width="2"/>', back: '<path d="M3 3 L13 13" stroke="#000" stroke-width="2"/>'
          };
          BSHAPES.forEach(function (s) {
            add(optBtn('<svg width="16" height="16" viewBox="0 0 16 16">' + shapeSvg[s] + '</svg>', S.brushShape === s, 'Brush shape', function () { S.brushShape = s; }));
          });
          BSIZES.forEach(function (s) {
            add(optBtn('<i style="display:block;width:' + Math.min(s, 20) + 'px;height:' + Math.min(s, 20) + 'px;border-radius:50%;background:#000"></i>', S.brushSize === s, s + ' pixels', function () { S.brushSize = s; }));
          });
        } else if (t === 'airbrush') {
          ASIZES.forEach(function (s) {
            add(optBtn('<i style="display:block;width:' + (s / 2 + 6) + 'px;height:' + (s / 2 + 6) + 'px;border-radius:50%;background:radial-gradient(#000,#fff)"></i>', S.airSize === s, 'Spray size ' + s, function () { S.airSize = s; }));
          });
        } else if (t === 'line' || t === 'curve') {
          lineWidths();
        } else if (MODE_TOOLS[t]) {
          var modes = [
            ['outline', '<svg width="52" height="14"><rect x="3" y="2" width="46" height="10" fill="none" stroke="#000"/></svg>', 'Outline only'],
            ['both', '<svg width="52" height="14"><rect x="3" y="2" width="46" height="10" fill="#aaa" stroke="#000"/></svg>', 'Outline and fill (fill uses colour 2)'],
            ['solid', '<svg width="52" height="14"><rect x="3" y="2" width="46" height="10" fill="#000"/></svg>', 'Solid colour']
          ];
          modes.forEach(function (m) { add(optBtn(m[1], S.mode === m[0], m[2], function () { S.mode = m[0]; }, 'wide')); });
          lineWidths();
        }
      }
      function selTransChanged() {
        if (sel && sel.lifted) { sel.draw = makeDraw(); drawSelOverlay(); }
      }

      /* ---------- selection ---------- */
      function ants(x, y, w, h) {
        var lw = Math.max(1, 1 / S.zoom);
        o.save(); o.lineWidth = lw; o.setLineDash([]); o.strokeStyle = '#fff'; o.strokeRect(x, y, w, h);
        o.setLineDash([4 * lw, 4 * lw]); o.strokeStyle = '#000'; o.strokeRect(x, y, w, h); o.restore();
      }
      function polyAnts(pts) {
        var lw = Math.max(1, 1 / S.zoom);
        o.save(); o.lineWidth = lw; o.beginPath();
        pts.forEach(function (q, i) { if (i) o.lineTo(q.x, q.y); else o.moveTo(q.x, q.y); });
        o.setLineDash([]); o.strokeStyle = '#fff'; o.stroke();
        o.setLineDash([4 * lw, 4 * lw]); o.strokeStyle = '#000'; o.stroke(); o.restore();
      }
      function drawSelOverlay() {
        clearOv();
        if (!sel) return;
        if (sel.lifted && sel.draw) o.drawImage(sel.draw, sel.x, sel.y);
        ants(sel.x, sel.y, sel.w, sel.h);
      }
      function maskPath(g) {
        g.beginPath();
        sel.mask.forEach(function (q, i) { if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); });
        g.closePath();
      }
      function grab() {
        var r = document.createElement('canvas'); r.width = sel.w; r.height = sel.h;
        var g = r.getContext('2d');
        if (sel.raw) { g.drawImage(sel.raw, 0, 0); return r; }
        if (sel.mask) {
          g.save(); g.translate(-sel.x, -sel.y); maskPath(g); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0);
          g.drawImage(canvas, -sel.x, -sel.y); g.restore();
        } else {
          g.drawImage(canvas, sel.x, sel.y, sel.w, sel.h, 0, 0, sel.w, sel.h);
        }
        return r;
      }
      function makeDraw() {
        if (!S.selTrans) return sel.raw;
        var r = document.createElement('canvas'); r.width = sel.w; r.height = sel.h;
        var g = r.getContext('2d'); g.drawImage(sel.raw, 0, 0);
        var im = g.getImageData(0, 0, sel.w, sel.h), d = im.data, b = hexRgb(S.bg);
        for (var i = 0; i < d.length; i += 4) { if (d[i] === b[0] && d[i + 1] === b[1] && d[i + 2] === b[2]) d[i + 3] = 0; }
        g.putImageData(im, 0, 0);
        return r;
      }
      function fillSelArea(col) {
        c.save(); c.fillStyle = col;
        if (sel.mask) { maskPath(c); c.fill(); } else c.fillRect(sel.x, sel.y, sel.w, sel.h);
        c.restore();
      }
      function lift(copy) {
        if (!sel || sel.lifted) return;
        pushUndo();
        sel.raw = grab(); sel.lifted = true;
        if (!copy) fillSelArea(S.bg);
        sel.draw = makeDraw();
        dirty = true;
      }
      function commitSelection() {
        if (!sel) return;
        if (sel.lifted) { c.drawImage(sel.draw, sel.x, sel.y); dirty = true; }
        sel = null; clearOv(); refresh();
      }
      function deleteSel() {
        if (!sel) return;
        if (!sel.lifted) { pushUndo(); fillSelArea(S.bg); }
        sel = null; clearOv(); dirty = true; refresh();
      }
      function copySel() { if (!sel) return; clip = grab(); say('Copied! Press Paste to make another one.', 4000); }
      function cutSel() { if (!sel) return; clip = grab(); deleteSel(); }
      function pasteSel() {
        if (!clip) { say('Nothing to paste yet. Select something and press Copy first!', 6000); return; }
        setTool('select', true);
        commitSelection(); pushUndo();
        var r = document.createElement('canvas'); r.width = clip.width; r.height = clip.height;
        r.getContext('2d').drawImage(clip, 0, 0);
        sel = { x: Math.max(0, Math.floor(work.scrollLeft / S.zoom)), y: Math.max(0, Math.floor(work.scrollTop / S.zoom)), w: r.width, h: r.height, mask: null, raw: r, lifted: true };
        sel.draw = makeDraw(); dirty = true; drawSelOverlay(); refresh();
        say('Drag the pasted picture where you want it. Click outside to set it down.', 7000);
      }
      function selectAll() {
        setTool('select', true); commitSelection();
        sel = { x: 0, y: 0, w: W, h: H, mask: null, raw: null, lifted: false };
        drawSelOverlay(); refresh();
      }

      /* ---------- text ---------- */
      function fontCss(sc) { return (S.italic ? 'italic ' : '') + (S.bold ? 'bold ' : '') + (S.fs * sc) + 'px "' + S.font + '", sans-serif'; }
      function applyTextStyle() {
        if (!textBox) return;
        var s = textBox.ta.style;
        s.font = fontCss(S.zoom); s.lineHeight = '1.2'; s.color = S.fg;
        s.background = S.textTrans ? 'transparent' : S.bg;
        s.textDecoration = S.underline ? 'underline' : 'none';
      }
      function startText(x, y, w, h) {
        commitText();
        var ta = document.createElement('textarea');
        ta.className = 'mp-text'; ta.setAttribute('spellcheck', 'false'); ta.setAttribute('aria-label', 'Type your text');
        ta.style.left = (x * S.zoom) + 'px'; ta.style.top = (y * S.zoom) + 'px';
        ta.style.width = (w * S.zoom) + 'px'; ta.style.height = (h * S.zoom) + 'px';
        cw.appendChild(ta);
        textBox = { ta: ta, x: x, y: y, h: h };
        applyTextStyle();
        setTimeout(function () { if (textBox && textBox.ta === ta) ta.focus(); }, 0);
      }
      function discardText() {
        if (!textBox) return;
        if (textBox.ta.parentNode) textBox.ta.parentNode.removeChild(textBox.ta);
        textBox = null;
      }
      function commitText() {
        if (!textBox) return;
        var tb = textBox, text = tb.ta.value, w = Math.max(20, Math.round(tb.ta.offsetWidth / S.zoom));
        discardText();
        if (!text.replace(/\s/g, '')) return;
        pushUndo();
        var lh = S.fs * 1.2, lines = [];
        c.save(); c.font = fontCss(1); c.textBaseline = 'top';
        text.split('\n').forEach(function (par) {
          var line = '';
          par.split(' ').forEach(function (wd) {
            var test = line ? line + ' ' + wd : wd;
            if (line && c.measureText(test).width > w - 2) { lines.push(line); line = wd; } else line = test;
          });
          lines.push(line);
        });
        if (!S.textTrans) { c.fillStyle = S.bg; c.fillRect(tb.x, tb.y, w, Math.max(lh * lines.length + 2, tb.h)); }
        c.fillStyle = S.fg;
        lines.forEach(function (ln, i) {
          var ty = tb.y + 1 + i * lh;
          c.fillText(ln, tb.x + 1, ty);
          if (S.underline) c.fillRect(tb.x + 1, ty + S.fs * 1.05, c.measureText(ln).width, Math.max(1, S.fs / 14));
        });
        c.restore();
        dirty = true; refresh(); emit('paint:text'); emit('paint:drew');
      }

      /* ---------- curve + polygon ---------- */
      function commitCurve() {
        if (curve && curve.phase >= 1) { pushUndo(); drawCurve(c, curve); dirty = true; refresh(); emit('paint:drew'); }
        curve = null; clearOv();
      }
      function previewPoly() {
        clearOv();
        if (!poly) return;
        drawPoly(o, poly, false);
      }
      function commitPoly() {
        if (poly) {
          if (poly.pts.length >= 2) {
            pushUndo(); drawPoly(c, poly, poly.pts.length > 2); dirty = true; refresh(); emit('paint:shape');
          }
        }
        poly = null; clearOv();
      }
      function commitAll() {
        commitText(); commitSelection(); commitCurve(); commitPoly();
      }
      function cancelPending() {
        var had = false;
        if (textBox) { discardText(); had = true; }
        if (curve) { curve = null; clearOv(); had = true; }
        if (poly) { poly = null; clearOv(); had = true; }
        return had;
      }

      /* ---------- pixel tools ---------- */
      function plotLine(g, x0, y0, x1, y1, col) {
        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, err = dx + dy, e2;
        g.fillStyle = col;
        for (;;) {
          g.fillRect(x0, y0, 1, 1);
          if (x0 === x1 && y0 === y1) break;
          e2 = 2 * err;
          if (e2 >= dy) { err += dy; x0 += sx; }
          if (e2 <= dx) { err += dx; y0 += sy; }
        }
      }
      function stampBrush(x, y, col) {
        var s = S.brushSize, sh = S.brushShape, hf = s / 2;
        c.fillStyle = col; c.strokeStyle = col;
        if (sh === 'round') { c.beginPath(); c.arc(x, y, hf, 0, Math.PI * 2); c.fill(); }
        else if (sh === 'square') { c.fillRect(Math.round(x - hf), Math.round(y - hf), s, s); }
        else {
          c.lineWidth = Math.max(1, s / 6); c.lineCap = 'butt'; c.beginPath();
          if (sh === 'slash') { c.moveTo(x - hf, y + hf); c.lineTo(x + hf, y - hf); }
          else { c.moveTo(x - hf, y - hf); c.lineTo(x + hf, y + hf); }
          c.stroke();
        }
      }
      function stampErase(x, y) {
        var s = S.eraserSize;
        c.fillStyle = S.bg; c.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
      }
      function strokeSeg(a, b, size, fn) {
        var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy), step = Math.max(1, size / 3), n = Math.max(1, Math.ceil(len / step));
        for (var i = 0; i <= n; i++) fn(a.x + dx * i / n, a.y + dy * i / n);
      }
      function spray() {
        if (!drag || drag.kind !== 'air') return;
        var r = S.airSize / 2, n = Math.ceil(S.airSize * 1.2);
        c.fillStyle = drag.col;
        for (var i = 0; i < n; i++) {
          var ang = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * r;
          c.fillRect(Math.round(drag.last.x + Math.cos(ang) * rr), Math.round(drag.last.y + Math.sin(ang) * rr), 1, 1);
        }
      }
      function floodFill(x, y, col) {
        if (x < 0 || y < 0 || x >= W || y >= H) return false;
        var orig = c.getImageData(0, 0, W, H), img = new ImageData(new Uint8ClampedArray(orig.data), W, H), d = img.data;
        var t = hexRgb(col), i0 = (y * W + x) * 4, r0 = d[i0], g0 = d[i0 + 1], b0 = d[i0 + 2], a0 = d[i0 + 3];
        if (r0 === t[0] && g0 === t[1] && b0 === t[2] && a0 === 255) return false;
        function ok(i) { return Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) + Math.abs(d[i + 3] - a0) <= 64; }
        var seen = new Uint8Array(W * H), stack = [x, y], changed = false;
        while (stack.length) {
          var cy = stack.pop(), cx = stack.pop(), lx = cx;
          while (lx >= 0 && !seen[cy * W + lx] && ok((cy * W + lx) * 4)) lx--;
          lx++;
          var up = false, down = false;
          for (var px = lx; px < W && !seen[cy * W + px] && ok((cy * W + px) * 4); px++) {
            var idx = cy * W + px;
            seen[idx] = 1; d[idx * 4] = t[0]; d[idx * 4 + 1] = t[1]; d[idx * 4 + 2] = t[2]; d[idx * 4 + 3] = 255; changed = true;
            if (cy > 0) {
              var mu = !seen[idx - W] && ok((idx - W) * 4);
              if (mu && !up) { stack.push(px, cy - 1); up = true; } else if (!mu) up = false;
            }
            if (cy < H - 1) {
              var md = !seen[idx + W] && ok((idx + W) * 4);
              if (md && !down) { stack.push(px, cy + 1); down = true; } else if (!md) down = false;
            }
          }
        }
        if (!changed) return false;
        undo.push({ w: W, h: H, d: orig }); redo = []; trim();
        c.putImageData(img, 0, 0);
        return true;
      }

      /* ---------- pointer handling ---------- */
      function pos(e) {
        var r = canvas.getBoundingClientRect();
        return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
      }
      function inSel(p) { return sel && p.x >= sel.x && p.x < sel.x + sel.w && p.y >= sel.y && p.y < sel.y + sel.h; }
      function cl(v, max) { return Math.max(0, Math.min(max, v)); }

      function onDown(e) {
        if (e.button === 1) return;
        e.preventDefault();
        wrap.focus({ preventScroll: true });
        closeMenu();
        var btn = e.button === 2 ? 2 : 0, mc = btn ? S.bg : S.fg, ac = btn ? S.fg : S.bg, t = S.tool;
        var p = pos(e), ip = { x: Math.floor(p.x), y: Math.floor(p.y) }, rp = { x: Math.round(p.x), y: Math.round(p.y) };
        try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }

        if (t === 'fill') {
          if (floodFill(ip.x, ip.y, mc)) { dirty = true; refresh(); emit('paint:fill'); emit('paint:drew'); snd('pop'); }
          return;
        }
        if (t === 'picker') {
          if (ip.x < 0 || ip.y < 0 || ip.x >= W || ip.y >= H) return;
          var px = c.getImageData(ip.x, ip.y, 1, 1).data, col = rgbHex(px[0], px[1], px[2]);
          if (btn) S.bg = col; else S.fg = col;
          syncColours(); emit('paint:colour'); snd('pop');
          setTool(S.prevTool, true);
          return;
        }
        if (t === 'magnifier') {
          S.fit = false;
          zoomStep(btn ? -1 : 1, p.x, p.y, e.clientX, e.clientY);
          setTool(S.prevTool, true);
          return;
        }
        if (t === 'pencil') { pushUndo(); drag = { kind: 'pencil', last: ip, col: mc }; plotLine(c, ip.x, ip.y, ip.x, ip.y, mc); return; }
        if (t === 'brush' || t === 'eraser') {
          pushUndo(); drag = { kind: t, last: p, col: t === 'eraser' ? S.bg : mc };
          if (t === 'eraser') stampErase(p.x, p.y); else stampBrush(p.x, p.y, mc);
          return;
        }
        if (t === 'airbrush') {
          pushUndo(); drag = { kind: 'air', last: p, col: mc }; spray();
          airTimer = setInterval(spray, 25);
          return;
        }
        if (t === 'line') { drag = { kind: 'line', start: rp, cur: rp, col: mc }; return; }
        if (BOXSHAPES[t]) { drag = { kind: 'shape', start: rp, cur: rp, mc: mc, ac: ac, shift: e.shiftKey }; return; }
        if (t === 'text') { commitText(); drag = { kind: 'textbox', start: rp, cur: rp }; return; }
        if (t === 'select' || t === 'freeselect') {
          if (inSel(p)) {
            if (!sel.lifted) lift(e.ctrlKey || e.metaKey);
            drag = { kind: 'move', ox: p.x - sel.x, oy: p.y - sel.y };
            return;
          }
          commitSelection();
          drag = t === 'select' ? { kind: 'marq', start: rp, cur: rp } : { kind: 'free', pts: [p] };
          return;
        }
        if (t === 'curve') {
          if (!curve) { curve = { p0: p, p1: p, c1: null, c2: null, phase: 0, col: mc, lw: S.lw }; }
          else if (curve.phase === 1) { curve.c1 = curve.c2 = p; }
          else if (curve.phase === 2) { curve.c2 = p; }
          drag = { kind: 'curve', shift: e.shiftKey };
          return;
        }
        if (t === 'polygon') {
          if (!poly) {
            poly = { pts: [p, { x: p.x, y: p.y }], mc: mc, ac: ac, mode: S.mode, lw: S.lw };
            drag = { kind: 'polyfirst' };
          } else {
            var now = Date.now(), near = dist(p, poly.pts[0]) <= 6 / S.zoom + 2, dbl = (now - lastClick < 350 && dist(p, lastPos) < 6);
            if (near || dbl) { poly.pts.pop(); commitPoly(); }
            else { poly.pts[poly.pts.length - 1] = p; poly.pts.push({ x: p.x, y: p.y }); previewPoly(); }
          }
          lastClick = Date.now(); lastPos = p;
          return;
        }
      }

      function onMove(e) {
        var p = pos(e);
        if (p.x >= 0 && p.y >= 0 && p.x < W && p.y < H) coordEl.textContent = Math.floor(p.x) + ', ' + Math.floor(p.y);
        else coordEl.textContent = '';
        if (!drag) {
          if (poly) { poly.pts[poly.pts.length - 1] = { x: p.x, y: p.y }; previewPoly(); }
          return;
        }
        var rp = { x: Math.round(p.x), y: Math.round(p.y) }, ip = { x: Math.floor(p.x), y: Math.floor(p.y) };
        switch (drag.kind) {
          case 'pencil': plotLine(c, drag.last.x, drag.last.y, ip.x, ip.y, drag.col); drag.last = ip; break;
          case 'brush': strokeSeg(drag.last, p, S.brushSize, function (x, y) { stampBrush(x, y, drag.col); }); drag.last = p; break;
          case 'eraser': strokeSeg(drag.last, p, S.eraserSize, stampErase); drag.last = p; break;
          case 'air': drag.last = p; break;
          case 'line':
            drag.cur = e.shiftKey ? snap45(drag.start, rp) : rp;
            clearOv(); drawLine(o, drag.start, drag.cur, drag.col, S.lw); break;
          case 'shape':
            drag.cur = rp; drag.shift = e.shiftKey;
            clearOv(); drawBoxShape(o, S.tool, drag.start, drag.cur, drag.mc, drag.ac, S.mode, S.lw, drag.shift); break;
          case 'textbox':
            drag.cur = rp; clearOv();
            ants(Math.min(drag.start.x, rp.x), Math.min(drag.start.y, rp.y), Math.abs(rp.x - drag.start.x), Math.abs(rp.y - drag.start.y)); break;
          case 'marq':
            drag.cur = { x: cl(rp.x, W), y: cl(rp.y, H) }; clearOv();
            ants(Math.min(drag.start.x, drag.cur.x), Math.min(drag.start.y, drag.cur.y), Math.abs(drag.cur.x - drag.start.x), Math.abs(drag.cur.y - drag.start.y)); break;
          case 'free': drag.pts.push(p); clearOv(); polyAnts(drag.pts); break;
          case 'move': sel.x = Math.round(p.x - drag.ox); sel.y = Math.round(p.y - drag.oy); drawSelOverlay(); break;
          case 'curve':
            if (curve.phase === 0) curve.p1 = (drag.shift || e.shiftKey) ? snap45(curve.p0, p) : p;
            else if (curve.phase === 1) curve.c1 = curve.c2 = p;
            else curve.c2 = p;
            clearOv(); drawCurve(o, curve); break;
          case 'polyfirst': poly.pts[poly.pts.length - 1] = { x: p.x, y: p.y }; previewPoly(); break;
        }
      }

      function onUp(e) {
        if (!drag) return;
        var d = drag; drag = null;
        if (airTimer) { clearInterval(airTimer); airTimer = null; }
        var p = e && e.clientX !== undefined ? pos(e) : null;
        switch (d.kind) {
          case 'pencil': case 'brush': case 'air':
            dirty = true; refresh(); emit('paint:drew'); break;
          case 'eraser':
            dirty = true; refresh(); emit('paint:erase'); break;
          case 'line':
            clearOv();
            if (dist(d.start, d.cur) >= 1) { pushUndo(); drawLine(c, d.start, d.cur, d.col, S.lw); dirty = true; refresh(); emit('paint:drew'); }
            break;
          case 'shape':
            clearOv();
            var a = d.start, b = d.cur, sh = d.shift;
            if (Math.abs(b.x - a.x) < 4 && Math.abs(b.y - a.y) < 4) { a = { x: d.start.x - 30, y: d.start.y - 30 }; b = { x: d.start.x + 30, y: d.start.y + 30 }; sh = false; }
            pushUndo(); drawBoxShape(c, S.tool, a, b, d.mc, d.ac, S.mode, S.lw, sh);
            dirty = true; refresh(); emit('paint:shape');
            break;
          case 'textbox':
            clearOv();
            var x0 = Math.min(d.start.x, d.cur.x), y0 = Math.min(d.start.y, d.cur.y), w = Math.abs(d.cur.x - d.start.x), hh = Math.abs(d.cur.y - d.start.y);
            if (w < 12 || hh < 12) { x0 = d.start.x; y0 = d.start.y; w = 160; hh = Math.round(S.fs * 1.2 * 2) + 6; }
            startText(x0, y0, w, hh);
            break;
          case 'marq':
            var sx = Math.min(d.start.x, d.cur.x), sy = Math.min(d.start.y, d.cur.y), sw = Math.abs(d.cur.x - d.start.x), sh2 = Math.abs(d.cur.y - d.start.y);
            if (sw < 2 || sh2 < 2) { sel = null; clearOv(); }
            else { sel = { x: sx, y: sy, w: sw, h: sh2, mask: null, raw: null, lifted: false }; drawSelOverlay(); }
            refresh(); break;
          case 'free':
            var minx = W, miny = H, maxx = 0, maxy = 0;
            d.pts.forEach(function (q) { minx = Math.min(minx, q.x); miny = Math.min(miny, q.y); maxx = Math.max(maxx, q.x); maxy = Math.max(maxy, q.y); });
            minx = Math.floor(cl(minx, W)); miny = Math.floor(cl(miny, H)); maxx = Math.ceil(cl(maxx, W)); maxy = Math.ceil(cl(maxy, H));
            if (d.pts.length < 3 || maxx - minx < 2 || maxy - miny < 2) { sel = null; clearOv(); }
            else { sel = { x: minx, y: miny, w: maxx - minx, h: maxy - miny, mask: d.pts, raw: null, lifted: false }; drawSelOverlay(); }
            refresh(); break;
          case 'move':
            dirty = true; refresh(); break;
          case 'curve':
            if (curve) {
              if (curve.phase === 0) { if (dist(curve.p0, curve.p1) < 2) { curve = null; clearOv(); } else curve.phase = 1; }
              else if (curve.phase === 1) curve.phase = 2;
              else commitCurve();
            }
            break;
          case 'polyfirst': previewPoly(); break;
        }
        if (p) { /* keep the pointer position for the status bar */ }
      }
      canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('pointerleave', function () { if (!drag) coordEl.textContent = ''; });

      /* ---------- keyboard ---------- */
      wrap.addEventListener('keydown', function (e) {
        var tg = e.target && e.target.tagName;
        if (tg === 'TEXTAREA' || tg === 'INPUT' || tg === 'SELECT') {
          if (e.key === 'Escape' && tg === 'TEXTAREA') { e.preventDefault(); discardText(); }
          return;
        }
        var k = e.key, ctl = e.ctrlKey || e.metaKey;
        if (ctl) {
          var lk = String(k).toLowerCase(), handled = true;
          if (lk === 'z') { if (e.shiftKey) doRedo(); else doUndo(); }
          else if (lk === 'y') doRedo();
          else if (lk === 'c') copySel();
          else if (lk === 'x') cutSel();
          else if (lk === 'v') pasteSel();
          else if (lk === 'a') selectAll();
          else if (lk === 's') save();
          else if (lk === 'o') openDialog();
          else if (lk === 'n') { if (e.shiftKey) clearImage(); else newPicture(); }
          else handled = false;
          if (handled) e.preventDefault();
          return;
        }
        if (k === 'Delete') { deleteSel(); e.preventDefault(); }
        else if (k === 'Escape') { cancelPending(); if (sel && !sel.lifted) { sel = null; clearOv(); refresh(); } }
        else if (k === 'Enter' && poly) { poly.pts.pop(); commitPoly(); }
      });

      /* ---------- canvas size handles ---------- */
      function bindHandle(hd, ax, ay) {
        var dr = null;
        hd.addEventListener('pointerdown', function (e) {
          if (e.button !== 0) return;
          e.preventDefault(); e.stopPropagation();
          commitAll();
          try { hd.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
          dr = { x: e.clientX, y: e.clientY, nw: W, nh: H };
          rsz.style.display = 'block'; rsz.style.width = (W * S.zoom) + 'px'; rsz.style.height = (H * S.zoom) + 'px';
        });
        hd.addEventListener('pointermove', function (e) {
          if (!dr) return;
          if (ax) dr.nw = clampDim(W + (e.clientX - dr.x) / S.zoom);
          if (ay) dr.nh = clampDim(H + (e.clientY - dr.y) / S.zoom);
          rsz.style.width = (dr.nw * S.zoom) + 'px'; rsz.style.height = (dr.nh * S.zoom) + 'px';
        });
        function end() {
          if (!dr) return;
          var r = dr; dr = null; rsz.style.display = 'none';
          if (r.nw !== W || r.nh !== H) resizeCanvas(r.nw, r.nh);
        }
        hd.addEventListener('pointerup', end);
        hd.addEventListener('pointercancel', end);
      }
      bindHandle(hR, true, false); bindHandle(hB, false, true); bindHandle(hC, true, true);

      function resizeCanvas(nw, nh) {
        commitAll(); pushUndo();
        var tmp = copyCanvas();
        setDims(nw, nh);
        c.fillStyle = S.bg; c.fillRect(0, 0, nw, nh); c.drawImage(tmp, 0, 0);
        dirty = true; refresh();
      }
      function attrDialog() {
        commitAll();
        function num(v) {
          var i = document.createElement('input'); i.type = 'number'; i.min = String(MIN_DIM); i.max = String(MAX_DIM); i.value = String(v); return i;
        }
        var wi = num(W), hi = num(H);
        var modal = el('div', { class: 'mp-modal' }, []);
        function close() { if (modal.parentNode) modal.parentNode.removeChild(modal); }
        function ok() {
          var nw = clampDim(parseInt(wi.value, 10)), nh = clampDim(parseInt(hi.value, 10));
          close();
          if (nw !== W || nh !== H) resizeCanvas(nw, nh);
        }
        var okBtn = el('button', { class: 'btn primary', text: 'OK', onclick: ok });
        var noBtn = el('button', { class: 'btn', text: 'Cancel', onclick: close });
        modal.appendChild(el('div', { class: 'mp-dlg' }, [
          el('div', { class: 'mp-dlgtitle', text: 'Attributes' }, []),
          el('div', { class: 'mp-dlgbody' }, [
            el('label', {}, [el('span', { text: 'Width:' }, []), wi, el('span', { text: 'pixels' }, [])]),
            el('label', {}, [el('span', { text: 'Height:' }, []), hi, el('span', { text: 'pixels' }, [])]),
            el('div', { class: 'mp-dlgbtns' }, [okBtn, noBtn])
          ])
        ]));
        modal.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok(); else if (e.key === 'Escape') close(); });
        wrap.appendChild(modal);
        wi.focus();
      }

      /* ---------- image menu actions ---------- */
      function flip(horiz) {
        commitAll(); pushUndo();
        var tmp = copyCanvas();
        c.save();
        if (horiz) { c.translate(W, 0); c.scale(-1, 1); } else { c.translate(0, H); c.scale(1, -1); }
        c.drawImage(tmp, 0, 0); c.restore();
        dirty = true; refresh();
      }
      function rotate(deg) {
        commitAll(); pushUndo();
        var tmp = copyCanvas(), nw = deg === 180 ? W : H, nh = deg === 180 ? H : W;
        setDims(nw, nh);
        c.save(); c.translate(nw / 2, nh / 2); c.rotate(deg * Math.PI / 180);
        c.drawImage(tmp, -tmp.width / 2, -tmp.height / 2); c.restore();
        dirty = true; refresh();
      }
      function invertColours() {
        commitAll(); pushUndo();
        var im = c.getImageData(0, 0, W, H), d = im.data;
        for (var i = 0; i < d.length; i += 4) { d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; }
        c.putImageData(im, 0, 0);
        dirty = true; refresh();
      }
      function clearImage() {
        commitAll(); pushUndo(); whiteout(S.bg); dirty = true; refresh();
        say('The page is clear! Press Undo if you change your mind.');
      }

      /* ---------- undo / redo ---------- */
      function doUndo() {
        if (cancelPending()) return;
        commitSelection();
        if (!undo.length) { say('There is nothing to undo yet. Draw something first!'); return; }
        redo.push(snapshot()); restore(undo.pop());
        dirty = true; refresh(); snd('pop'); emit('paint:undo');
      }
      function doRedo() {
        cancelPending(); commitSelection();
        if (!redo.length) { say('There is nothing to redo.', 3000); return; }
        undo.push(snapshot()); restore(redo.pop());
        dirty = true; refresh(); snd('pop');
      }

      /* ---------- files ---------- */
      function guard() {
        if (!dirty) return Promise.resolve(true);
        return LCL.ui.confirm(root, 'Your picture has changes that are not saved. Carry on without saving?', { yes: 'Yes, carry on', no: 'No, go back' });
      }
      function newPicture() {
        guard().then(function (ok) {
          if (!ok) return;
          cancelPending(); sel = null; clearOv();
          setDims(DEF_W, DEF_H); whiteout('#fff');
          undo = []; redo = []; currentId = null; dirty = false;
          if (S.fit) fitZoom();
          refresh();
          say('A fresh page! What will you draw?');
        });
      }
      function save() {
        commitAll();
        var data = canvas.toDataURL('image/png');
        if (currentId && vfs.get(currentId)) {
          vfs.writeFile(currentId, data); dirty = false; refresh();
          say('Saved!', 3000); snd('good'); emit('paint:saved', { id: currentId });
          return Promise.resolve(currentId);
        }
        return saveAs();
      }
      function saveAs() {
        commitAll();
        var data = canvas.toDataURL('image/png');
        return LCL.ui.fileDialog(root, { mode: 'save', kind: 'drawing', startId: vfs.DESKTOP, defaultName: 'My Picture' }).then(function (r) {
          if (!r) return null;
          var n = vfs.createFile(r.folderId, r.name, 'drawing', data, { by: 'pupil' });
          currentId = n.id; dirty = false; refresh();
          say('Saved in ' + vfs.pathString(n.parent) + '! You can find it in File Explorer.', 9000);
          snd('good'); emit('paint:saved', { id: n.id });
          return n.id;
        });
      }
      function makeWallpaper() {
        commitAll();
        function apply(id) {
          if (!id) return;
          LCL.setWallpaper(id);
          snd('good');
          say('Your picture is now the desktop wallpaper! Press Show Desktop to see it.', 9000);
          emit('paint:wallpaper', { id: id });
        }
        if (currentId && vfs.get(currentId)) {
          if (dirty) { vfs.writeFile(currentId, canvas.toDataURL('image/png')); dirty = false; refresh(); }
          apply(currentId);
          return;
        }
        say('Let us save your picture first. Then it can be your wallpaper!', 7000);
        saveAs().then(apply);
      }
      function loadFile(id) {
        var n = vfs.get(id);
        if (!n || n.kind !== 'drawing') return;
        function done() {
          undo = []; redo = []; currentId = id; dirty = false;
          if (S.fit) fitZoom();
          refresh();
          say('Here is "' + n.name + '". You can keep drawing on it!');
          emit('paint:opened', { id: id });
        }
        cancelPending(); sel = null; clearOv();
        if (!n.data) { setDims(DEF_W, DEF_H); whiteout('#fff'); return done(); }
        var img = new Image();
        img.onload = function () {
          var nw = clampDim(img.naturalWidth || DEF_W), nh = clampDim(img.naturalHeight || DEF_H);
          setDims(nw, nh); whiteout('#fff'); c.drawImage(img, 0, 0, nw, nh); done();
        };
        img.onerror = function () { setDims(DEF_W, DEF_H); whiteout('#fff'); done(); };
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

      /* ---------- start up ---------- */
      syncColours(); setTool('brush', true); layout(); refresh();
      requestAnimationFrame(layout);

      return {
        destroy: function () {
          if (airTimer) clearInterval(airTimer);
          document.removeEventListener('pointerdown', docDown, true);
          if (off) off();
        },
        onResize: function () { if (S.fit) fitZoom(); },
        onOpen: function (args) {
          if (args && args.fileId) guard().then(function (ok) { if (ok) loadFile(args.fileId); });
        }
      };
    }
  });
})();