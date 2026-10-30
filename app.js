/* Little Computer Lab - desktop shell.
 * Window manager, taskbar, Start menu, Bleep the robot, sounds and shared UI helpers.
 * Apps register themselves with LCL.registerApp({...}) - see apps/*.js. */
(function () {
  'use strict';
  var LCL = window.LCL, vfs = LCL.vfs, I = LCL.icons;
  function $(s, r) { return (r || document).querySelector(s); }
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ================= DOM helper ================= */
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  LCL.el = el;
  var ui = LCL.ui = {};

  /* ================= sound ================= */
  var AC = window.AudioContext || window.webkitAudioContext, actx = null;
  var TUNES = {
    good: [[523, 0, .12], [659, .1, .12], [784, .2, .2]],
    oops: [[300, 0, .15], [250, .15, .2]],
    pop: [[700, 0, .08]],
    tada: [[523, 0, .12], [659, .12, .12], [784, .24, .12], [1047, .36, .35]],
    melody: [[392, 0, .2], [440, .22, .2], [494, .44, .2], [523, .66, .35]]
  };
  LCL.sound = {
    muted: false,
    play: function (name) {
      if (this.muted || !AC) return;
      try {
        actx = actx || new AC();
        if (actx.state === 'suspended') actx.resume();
        var t0 = actx.currentTime;
        (TUNES[name] || []).forEach(function (s) {
          var o = actx.createOscillator(), g = actx.createGain();
          o.type = 'triangle'; o.frequency.value = s[0];
          g.gain.setValueAtTime(0.0001, t0 + s[1]);
          g.gain.exponentialRampToValueAtTime(0.18, t0 + s[1] + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + s[1] + s[2]);
          o.connect(g); g.connect(actx.destination);
          o.start(t0 + s[1]); o.stop(t0 + s[1] + s[2] + 0.05);
        });
      } catch (e) { /* sound is optional */ }
    }
  };

  /* ================= effects ================= */
  LCL.fx = {
    confetti: function () {
      if (reduced) return;
      var layer = el('div', { class: 'confetti' }), cols = ['#fa5252', '#fcc419', '#40c057', '#228be6', '#be4bdb', '#ff922b'];
      for (var i = 0; i < 44; i++) {
        var p = el('i');
        p.style.left = Math.random() * 100 + '%';
        p.style.background = cols[i % cols.length];
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        p.style.setProperty('--dx', (Math.random() * 180 - 90) + 'px');
        layer.appendChild(p);
      }
      document.body.appendChild(layer);
      setTimeout(function () { layer.remove(); }, 3000);
    },
    toast: function (text) {
      var t = el('div', { class: 'toast', text: text });
      $('#toast-layer').appendChild(t);
      setTimeout(function () { t.remove(); }, 2800);
    }
  };
  var PRAISE = ['Brilliant!', 'Well done!', 'Super!', 'You did it!', 'Fantastic!', 'Great job!', 'Wonderful!', 'Hooray!'];
  LCL.praise = function () { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; };

  /* ================= Bleep the robot ================= */
  var bleepBox = $('#bleep'), bubble = $('#bleep-bubble'), bubbleText = $('#bleep-text'), bleepTimer = null;
  var canSpeak = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  if (!canSpeak) $('#bleep-read').hidden = true;

  LCL.bleep = {
    say: function (text, opts) {
      opts = opts || {};
      bubbleText.textContent = text;
      bubble.hidden = false;
      bubble.classList.remove('flip');
      var r = bubble.getBoundingClientRect();
      if (r.left < 8) bubble.classList.add('flip');
      clearTimeout(bleepTimer);
      if (!opts.sticky) bleepTimer = setTimeout(LCL.bleep.hide, opts.ms || Math.max(7000, text.length * 90));
    },
    hide: function () { bubble.hidden = true; clearTimeout(bleepTimer); },
    help: function () {
      var w = activeWin && !activeWin.minimised ? activeWin : null;
      var msg = w && w.def.help ? w.def.help : 'Hi, I am Bleep! Double-click a picture on the desktop to open an app. Open the Mission Board to see fun jobs to do.';
      LCL.bleep.say(msg, { ms: 12000 });
    },
    speak: function (text) {
      if (!canSpeak) return;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text || bubbleText.textContent);
        u.lang = 'en-GB'; u.rate = 0.9; u.pitch = 1.15;
        window.speechSynthesis.speak(u);
      } catch (e) { /* optional */ }
    }
  };
  $('#bleep-read').addEventListener('click', function () { LCL.bleep.speak(bubbleText.textContent); });
  $('#bleep-close').addEventListener('click', function () { LCL.bleep.hide(); });

  (function bleepDrag() {
    var bot = $('#bleep-bot'), sx, sy, ox, oy, moved = false, down = false;
    bot.addEventListener('pointerdown', function (e) {
      down = true; moved = false; sx = e.clientX; sy = e.clientY;
      var r = bleepBox.getBoundingClientRect(); ox = r.left; oy = r.top;
      bot.setPointerCapture(e.pointerId);
    });
    bot.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      moved = true;
      var w = bleepBox.offsetWidth, h = bleepBox.offsetHeight;
      var x = Math.max(0, Math.min(window.innerWidth - 90, ox + dx));
      var y = Math.max(0, Math.min(window.innerHeight - 150, oy + dy));
      bleepBox.style.left = x + 'px'; bleepBox.style.top = y + 'px';
      bleepBox.style.right = 'auto'; bleepBox.style.bottom = 'auto';
      void w; void h;
    });
    bot.addEventListener('pointerup', function () {
      down = false;
      if (!moved) { LCL.bleep.help(); LCL.sound.play('pop'); }
    });
  })();

  /* ================= app registry ================= */
  var apps = LCL.apps = {}, appOrder = [];
  LCL.registerApp = function (def) {
    if (!apps[def.id]) appOrder.push(def.id);
    apps[def.id] = def;
  };

  /* ================= windows ================= */
  var wins = [], zTop = 10, openCount = 0, activeWin = null;
  var winLayer = $('#windows'), desktop = $('#desktop'), taskApps = $('#task-apps');

  LCL.openApp = function (id, args) {
    var def = apps[id];
    if (!def) return null;
    var w = wins.filter(function (x) { return x.appId === id; })[0];
    if (w) {
      focusWin(w);
      if (w.inst && w.inst.onOpen) w.inst.onOpen(args || {});
      return w;
    }
    return createWindow(def, args || {});
  };

  LCL.openNode = function (id) {
    var n = vfs.get(id);
    if (!n) return;
    if (n.type === 'folder') LCL.openApp('explorer', { folderId: id });
    else if (n.kind === 'drawing') LCL.openApp('paint', { fileId: id });
    else LCL.openApp('notepad', { fileId: id });
  };

  function createWindow(def, args) {
    var area = winLayer.getBoundingClientRect();
    var small = area.width < 760;
    var W = Math.min(def.w || 720, area.width - 16), H = Math.min(def.h || 500, area.height - 16);
    var off = (openCount++ % 6) * 30;
    var X = Math.max(8, Math.min(area.width - W - 8, 60 + off)), Y = Math.max(8, Math.min(area.height - H - 8, 24 + off));

    var node = el('div', { class: 'window', role: 'dialog', 'aria-label': def.title, tabindex: '-1' });
    node.style.left = X + 'px'; node.style.top = Y + 'px'; node.style.width = W + 'px'; node.style.height = H + 'px';

    var titleEl = el('span', { class: 'tb-title', text: def.title });
    var bMin = el('button', { class: 'tb-btn min', title: 'Hide this window', 'aria-label': 'Minimise', html: I.g('min') });
    var bMax = el('button', { class: 'tb-btn max', title: 'Make this window big', 'aria-label': 'Maximise', html: I.g('max') });
    var bClose = el('button', { class: 'tb-btn close', title: 'Close', 'aria-label': 'Close', html: I.g('close') });
    var bar = el('div', { class: 'titlebar' }, [
      el('span', { class: 'tb-icon', html: I.big(def.icon) }), titleEl,
      el('span', { class: 'tb-btns' }, [bMin, bMax, bClose])
    ]);
    var body = el('div', { class: 'win-body' });
    var grip = el('div', { class: 'resize-handle', 'aria-hidden': 'true' });
    node.appendChild(bar); node.appendChild(body); node.appendChild(grip);
    winLayer.appendChild(node);

    var w = { appId: def.id, def: def, node: node, body: body, titleEl: titleEl, inst: null, minimised: false, maximised: false, rect: null };
    wins.push(w);

    var ctx = {
      win: w, el: body, args: args,
      setTitle: function (t) { titleEl.textContent = t; node.setAttribute('aria-label', t); renderTaskbar(); },
      close: function () { closeWin(w); }
    };
    w.ctx = ctx;

    /* controls */
    bMin.addEventListener('click', function (e) { e.stopPropagation(); minimiseWin(w); });
    bMax.addEventListener('click', function (e) { e.stopPropagation(); toggleMax(w); });
    bClose.addEventListener('click', function (e) { e.stopPropagation(); closeWin(w); });
    bar.addEventListener('dblclick', function (e) { if (!e.target.closest('.tb-btn')) toggleMax(w); });
    node.addEventListener('pointerdown', function () { if (activeWin !== w) focusWin(w); }, true);
    w.bMax = bMax;

    /* drag by title bar */
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.tb-btn') || w.maximised) return;
      var sx = e.clientX, sy = e.clientY, ox = node.offsetLeft, oy = node.offsetTop;
      bar.setPointerCapture(e.pointerId);
      bar.classList.add('dragging');
      function move(ev) {
        var a = winLayer.getBoundingClientRect();
        node.style.left = Math.max(-node.offsetWidth + 140, Math.min(a.width - 140, ox + ev.clientX - sx)) + 'px';
        node.style.top = Math.max(0, Math.min(a.height - 50, oy + ev.clientY - sy)) + 'px';
      }
      function up() {
        bar.classList.remove('dragging');
        bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up);
      }
      bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
    });

    /* resize from the corner */
    grip.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      var sx = e.clientX, sy = e.clientY, ow = node.offsetWidth, oh = node.offsetHeight;
      var minW = def.minW || 400, minH = def.minH || 300;
      grip.setPointerCapture(e.pointerId);
      function move(ev) {
        node.style.width = Math.max(minW, ow + ev.clientX - sx) + 'px';
        node.style.height = Math.max(minH, oh + ev.clientY - sy) + 'px';
      }
      function up() { grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up); }
      grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
    });

    if (window.ResizeObserver) {
      var pending = false;
      new ResizeObserver(function () {
        if (pending) return; pending = true;
        requestAnimationFrame(function () { pending = false; if (w.inst && w.inst.onResize) w.inst.onResize(); });
      }).observe(body);
    }

    w.inst = def.mount(body, ctx) || {};
    if (small) { w.maximised = true; node.classList.add('maximised'); }
    syncMaxIcon(w);
    focusWin(w);
    if (w.inst.onOpen) w.inst.onOpen(args);
    if (w.inst.onResize) requestAnimationFrame(w.inst.onResize);
    if (def.help) LCL.bleep.say(def.help, { ms: 10000 });
    return w;
  }

  function syncMaxIcon(w) {
    w.bMax.innerHTML = I.g(w.maximised ? 'restore' : 'max');
    w.bMax.title = w.maximised ? 'Make this window smaller' : 'Make this window big';
    w.bMax.setAttribute('aria-label', w.maximised ? 'Restore' : 'Maximise');
  }
  function toggleMax(w) {
    w.maximised = !w.maximised;
    w.node.classList.toggle('maximised', w.maximised);
    syncMaxIcon(w);
    if (w.inst && w.inst.onResize) requestAnimationFrame(w.inst.onResize);
  }
  function focusWin(w) {
    if (w.minimised) { w.minimised = false; w.node.classList.remove('minimised'); }
    zTop++; w.node.style.zIndex = zTop;
    wins.forEach(function (x) { x.node.classList.toggle('active', x === w); });
    activeWin = w;
    renderTaskbar();
    closeStart();
    if (w.inst && w.inst.onFocus) w.inst.onFocus();
  }
  function topVisible() {
    var best = null;
    wins.forEach(function (x) { if (!x.minimised && (!best || +x.node.style.zIndex > +best.node.style.zIndex)) best = x; });
    return best;
  }
  function minimiseWin(w) {
    w.minimised = true; w.node.classList.add('minimised'); w.node.classList.remove('active');
    var next = topVisible();
    if (next) focusWin(next); else { activeWin = null; renderTaskbar(); }
  }
  function closeWin(w) {
    try { if (w.inst && w.inst.destroy) w.inst.destroy(); } catch (e) { console.error(e); }
    w.node.remove();
    wins = wins.filter(function (x) { return x !== w; });
    if (activeWin === w) activeWin = null;
    var next = topVisible();
    if (next) focusWin(next); else renderTaskbar();
  }
  LCL.closeAllWindows = function () { wins.slice().forEach(closeWin); };

  window.addEventListener('resize', function () {
    var a = winLayer.getBoundingClientRect();
    wins.forEach(function (w) {
      if (w.maximised) return;
      var n = w.node;
      n.style.left = Math.max(-n.offsetWidth + 140, Math.min(a.width - 140, n.offsetLeft)) + 'px';
      n.style.top = Math.max(0, Math.min(a.height - 50, n.offsetTop)) + 'px';
    });
  });

  /* ================= taskbar ================= */
  function renderTaskbar() {
    taskApps.innerHTML = '';
    wins.forEach(function (w) {
      var on = w === activeWin && !w.minimised;
      var b = el('button', {
        class: 'task-btn' + (on ? ' active' : '') + (w.minimised ? ' mini' : ''),
        title: w.titleEl.textContent,
        html: '<span class="ti">' + I.big(w.def.icon) + '</span><span class="t"></span>'
      });
      b.querySelector('.t').textContent = w.titleEl.textContent;
      b.addEventListener('click', function () {
        if (w.minimised) focusWin(w);
        else if (w === activeWin) minimiseWin(w);
        else focusWin(w);
      });
      taskApps.appendChild(b);
    });
  }

  function tickClock() {
    $('#clock').textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function showDesktop() {
    var anyVisible = wins.some(function (w) { return !w.minimised; });
    if (anyVisible) {
      wins.forEach(function (w) { w.minimised = true; w.node.classList.add('minimised'); w.node.classList.remove('active'); });
      activeWin = null; renderTaskbar();
    } else if (wins.length) {
      wins.forEach(function (w) { w.minimised = false; w.node.classList.remove('minimised'); });
      focusWin(wins[wins.length - 1]);
    }
  }

  /* ================= Start menu ================= */
  var startMenu = $('#start-menu'), startBtn = $('#start-btn');
  function closeStart() { startMenu.hidden = true; startBtn.setAttribute('aria-expanded', 'false'); startBtn.classList.remove('open'); }
  function toggleStart() {
    if (!startMenu.hidden) return closeStart();
    buildStart();
    startMenu.hidden = false; startBtn.setAttribute('aria-expanded', 'true'); startBtn.classList.add('open');
    LCL.sound.play('pop');
  }
  function buildStart() {
    startMenu.innerHTML = '';
    startMenu.appendChild(el('h3', { text: 'My Apps' }));
    var grid = el('div', { class: 'start-grid' });
    appOrder.map(function (id) { return apps[id]; }).filter(function (a) { return !a.hidden; }).forEach(function (a) {
      grid.appendChild(el('button', {
        class: 'start-item', onclick: function () { closeStart(); LCL.openApp(a.id); },
        html: '<span class="si">' + I.big(a.icon) + '</span><span class="sl"></span>'
      }));
      grid.lastChild.querySelector('.sl').textContent = a.title;
    });
    grid.appendChild(el('button', {
      class: 'start-item soon', onclick: function () { LCL.bleep.say('New apps are coming soon. I will tell you when they arrive!'); },
      html: '<span class="si">' + I.big('lock') + '</span><span class="sl">Coming soon</span>'
    }));
    startMenu.appendChild(grid);
    startMenu.appendChild(el('div', { class: 'start-foot' }, [
      el('button', { class: 'btn', html: I.g('desktop') + ' Show Desktop', onclick: function () { closeStart(); showDesktop(); } }),
      el('button', { class: 'btn ghost', html: I.g('refresh') + ' Default wallpaper', onclick: function () { closeStart(); LCL.clearWallpaper(); LCL.bleep.say('The wallpaper is back to normal.'); } }),
      el('button', { class: 'btn ghost', html: I.g('refresh') + ' Start fresh', onclick: function () { closeStart(); startFresh(); } })
    ]));
  }
  startBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleStart(); });
  document.addEventListener('pointerdown', function (e) {
    if (!startMenu.hidden && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) closeStart();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeStart(); });

  function startFresh() {
    ui.confirm(desktop, 'Ask a grown-up first! This will delete every drawing, file, folder and star, and begin again. Start fresh?', {
      yes: 'Yes, start fresh', no: 'No, keep my work', title: 'Start fresh?'
    }).then(function (ok) {
      if (!ok) return;
      vfs.reset().then(function () { location.reload(); });
    });
  }

  /* ================= shared UI: icons for nodes, double-click, modal, file dialog ================= */
  ui.nodeIcon = function (n) {
    var d = el('span', { class: 'nicon' });
    if (n.type === 'folder') d.innerHTML = I.big('folder');
    else if (n.kind === 'drawing' && n.data) {
      d.classList.add('thumb');
      d.appendChild(el('img', { src: n.data, alt: '', draggable: 'false' }));
    } else if (n.kind === 'drawing') d.innerHTML = I.big('picture');
    else d.innerHTML = I.big('file');
    return d;
  };

  /* Click handler that also reports double-click / double-tap reliably (timing based). */
  ui.onActivate = function (node, fn, opts) {
    opts = opts || {};
    var last = 0;
    node.addEventListener('click', function (e) {
      var now = Date.now(), touch = e.pointerType === 'touch';
      if ((opts.touchOpens && touch) || now - last < 450) { last = 0; fn(e); } else last = now;
    });
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); }
    });
  };

  ui.modal = function (container, o) {
    return new Promise(function (resolve) {
      var back = el('div', { class: 'modal-back' });
      var box = el('div', { class: 'modal ' + (o.cls || ''), role: 'dialog', 'aria-modal': 'true' });
      if (o.title) box.appendChild(el('h3', { text: o.title }));
      var body = el('div', { class: 'modal-body' });
      box.appendChild(body);
      if (o.message) body.appendChild(el('p', { class: 'modal-msg', text: o.message }));
      function close(v) {
        document.removeEventListener('keydown', onKey, true);
        back.remove(); resolve(v);
      }
      function onKey(e) {
        if (e.key === 'Escape') { e.stopPropagation(); close(o.cancelValue === undefined ? null : o.cancelValue); }
      }
      if (o.build) o.build(body, close);
      var bar = el('div', { class: 'modal-btns' });
      (o.buttons || []).forEach(function (b) {
        bar.appendChild(el('button', {
          class: 'btn' + (b.primary ? ' primary' : '') + (b.danger ? ' danger' : ''), text: b.label,
          onclick: function () { if (b.onclick && b.onclick(close) === false) return; close(b.value); }
        }));
      });
      box.appendChild(bar);
      back.appendChild(box); container.appendChild(back);
      document.addEventListener('keydown', onKey, true);
      var first = box.querySelector('input,textarea') || bar.querySelector('.primary') || bar.querySelector('button');
      if (first) setTimeout(function () { first.focus(); }, 30);
    });
  };

  ui.confirm = function (container, message, o) {
    o = o || {};
    return ui.modal(container, {
      title: o.title, message: message, cancelValue: false,
      buttons: [{ label: o.no || 'No', value: false, primary: true }, { label: o.yes || 'Yes', value: true, danger: !!o.danger }]
    });
  };

  /* Save / Open dialog backed by the shared virtual file system. */
  ui.fileDialog = function (container, o) {
    var mode = o.mode, kind = o.kind, cur = o.startId && vfs.get(o.startId) ? o.startId : vfs.DESKTOP, sel = null;
    var nameInput = null, listBox, crumbBox, hint;
    return ui.modal(container, {
      title: o.title || (mode === 'save' ? 'Save your ' + (kind === 'drawing' ? 'picture' : 'note') : 'Open a ' + (kind === 'drawing' ? 'picture' : 'note')),
      cls: 'filedlg', cancelValue: null,
      build: function (body, close) {
        var places = el('div', { class: 'places' });
        [[vfs.DESKTOP, 'Desktop', 'desktop'], [vfs.DOCUMENTS, 'Documents', 'open'], [vfs.ROOT, 'This Computer', 'home']].forEach(function (p) {
          places.appendChild(el('button', { class: 'chip', html: I.g(p[2]) + '<span>' + p[1] + '</span>', onclick: function () { cur = p[0]; sel = null; render(); } }));
        });
        places.appendChild(el('button', {
          class: 'chip', html: I.g('up') + '<span>Up</span>', onclick: function () {
            var n = vfs.get(cur); if (n && n.parent) { cur = n.parent; sel = null; render(); }
          }
        }));
        crumbBox = el('div', { class: 'dlg-path' });
        listBox = el('div', { class: 'dlg-list' });
        body.appendChild(places); body.appendChild(crumbBox); body.appendChild(listBox);
        if (mode === 'save') {
          nameInput = el('input', { class: 'dlg-name', type: 'text', maxlength: '40', value: o.defaultName || '', 'aria-label': 'Name' });
          nameInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doPrimary(close); });
          body.appendChild(el('label', { class: 'dlg-label' }, ['Name: ', nameInput]));
        }
        hint = el('p', { class: 'dlg-hint' });
        body.appendChild(hint);
        o._close = close;
        render();
      },
      buttons: [
        { label: 'Cancel', value: null },
        { label: mode === 'save' ? 'Save' : 'Open', primary: true, onclick: function (close) { doPrimary(close); return false; } }
      ]
    });

    function doPrimary(close) {
      if (mode === 'save') {
        var name = vfs.clean(nameInput.value) || o.defaultName || 'My Picture';
        close({ folderId: cur, name: name });
      } else if (sel) close(sel);
      else hint.textContent = 'Click a picture first, then press Open.';
    }
    function render() {
      crumbBox.innerHTML = '';
      vfs.path(cur).forEach(function (n, i, arr) {
        crumbBox.appendChild(el('button', { class: 'crumb', text: n.name, onclick: function () { cur = n.id; sel = null; render(); } }));
        if (i < arr.length - 1) crumbBox.appendChild(el('span', { class: 'sep', text: '›' }));
      });
      listBox.innerHTML = '';
      var kids = vfs.children(cur).filter(function (n) { return n.type === 'folder' || n.kind === kind; });
      if (!kids.length) listBox.appendChild(el('p', { class: 'dlg-empty', text: 'This folder is empty.' }));
      kids.forEach(function (n) {
        var item = el('div', { class: 'ditem' + (sel === n.id ? ' sel' : '') + (mode === 'save' && n.type === 'file' ? ' dim' : ''), tabindex: '0', role: 'button' });
        item.appendChild(ui.nodeIcon(n));
        item.appendChild(el('span', { class: 'dl', text: n.name }));
        var last = 0;
        item.addEventListener('click', function () {
          if (n.type === 'folder') { cur = n.id; sel = null; render(); return; }
          if (mode === 'save') return;
          var now = Date.now();
          if (sel === n.id && now - last < 450) { o._close(n.id); return; }
          sel = n.id; last = now; hint.textContent = '';
          Array.prototype.forEach.call(listBox.children, function (c) { c.classList.remove('sel'); });
          item.classList.add('sel');
        });
        listBox.appendChild(item);
      });
      hint.textContent = mode === 'save' ? 'It will be saved in: ' + vfs.pathString(cur) : '';
    }
  };

  /* ================= desktop icons ================= */
  function iconTile(label, iconHtml, onopen, touchOpens) {
    var d = el('div', { class: 'dicon', tabindex: '0', role: 'button', 'aria-label': label });
    if (typeof iconHtml === 'string') d.appendChild(el('span', { class: 'nicon', html: iconHtml })); else d.appendChild(iconHtml);
    d.appendChild(el('span', { class: 'dl', text: label }));
    d.addEventListener('click', function (e) {
      e.stopPropagation();
      Array.prototype.forEach.call($('#icons').children, function (c) { c.classList.remove('sel'); });
      d.classList.add('sel');
    });
    ui.onActivate(d, onopen, { touchOpens: touchOpens });
    return d;
  }
  var deskPending = false;
  function renderDesktop() {
    if (deskPending) return; deskPending = true;
    requestAnimationFrame(function () {
      deskPending = false;
      var box = $('#icons'); box.innerHTML = '';
      appOrder.map(function (id) { return apps[id]; }).filter(function (a) { return !a.hidden; }).forEach(function (a) {
        box.appendChild(iconTile(a.title, I.big(a.icon), function () { LCL.openApp(a.id); }, true));
      });
      vfs.children(vfs.DESKTOP).forEach(function (n) {
        var t = iconTile(n.name, ui.nodeIcon(n), function () { LCL.openNode(n.id); }, false);
        t.classList.add('file');
        box.appendChild(t);
      });
    });
  }
  LCL.renderDesktop = renderDesktop;
  desktop.addEventListener('click', function (e) {
    if (e.target.closest('.dicon')) return;
    Array.prototype.forEach.call($('#icons').children, function (c) { c.classList.remove('sel'); });
  });

  function renderSoon() {
    var box = $('#soon');
    box.appendChild(el('h3', { text: 'Coming soon' }));
    var row = el('div', { class: 'soon-tiles' });
    for (var i = 0; i < 3; i++) {
      row.appendChild(el('button', {
        class: 'soon-tile', 'aria-label': 'A new app is coming soon', html: '<span class="nicon">' + I.big('lock') + '</span><span class="dl">New app</span>',
        onclick: function () { LCL.bleep.say('Something new is coming soon. Keep practising with the apps you have!'); LCL.sound.play('pop'); }
      }));
    }
    box.appendChild(row);
  }
    /* ================= wallpaper ================= */
  function applyWallpaper() {
    var id = vfs.getKV('wallpaper', null), n = id && vfs.get(id);
    var svg = $('#wallpaper');
    if (n && n.kind === 'drawing' && n.data) {
      svg.style.display = 'none';
      desktop.style.background = 'url("' + n.data + '") center / cover no-repeat';
    } else {
      svg.style.display = '';
      desktop.style.background = '';
    }
  }
  LCL.setWallpaper = function (id) { vfs.setKV('wallpaper', id); applyWallpaper(); };
  LCL.clearWallpaper = function () { vfs.setKV('wallpaper', null); applyWallpaper(); };

  /* ================= boot ================= */
  function setSoundIcon() {
    $('#sound-btn').innerHTML = I.g(LCL.sound.muted ? 'soundoff' : 'soundon');
    $('#sound-btn').title = LCL.sound.muted ? 'Sound is off' : 'Sound is on';
  }
  function boot() {
    vfs.init().then(function () {
      LCL.sound.muted = !!vfs.getKV('muted', false);
      setSoundIcon();
      $('#sound-btn').addEventListener('click', function () {
        LCL.sound.muted = !LCL.sound.muted; vfs.setKV('muted', LCL.sound.muted); setSoundIcon(); LCL.sound.play('pop');
      });
      $('#show-desktop').innerHTML = I.g('desktop');
      $('#show-desktop').addEventListener('click', showDesktop);
      $('#stars-btn').addEventListener('click', function () { LCL.openApp('missions'); });
      tickClock(); setInterval(tickClock, 20000);
      renderSoon();
      renderDesktop();
      applyWallpaper();
      vfs.onChange(function () { renderDesktop(); applyWallpaper(); });
      if (LCL.missions && LCL.missions.init) LCL.missions.init();
      $('#loading').remove();
      LCL.bleep.say(vfs.persistent
        ? 'Hello! I am Bleep. Double-click a picture to open an app. Try the Mission Board for fun jobs to do!'
        : 'Hello! I am Bleep. This browser cannot keep your work after you close it, but you can still play!', { ms: 14000 });
      LCL.on('fs:error', function () { LCL.bleep.say('Oh no, I could not save that. Please ask a grown-up to help.'); });
    });
  }
  window.addEventListener('load', boot);
})();
