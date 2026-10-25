/* Computer Academy - Week 1: parts of a computer, mouse skills, typing. */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs;

  var LESSONS = [
    { id: 'parts', title: 'Meet the Computer', event: 'academy:parts' },
    { id: 'click', title: 'Clicking', event: 'academy:click' },
    { id: 'dbl', title: 'Double-Click', event: 'academy:dblclick' },
    { id: 'drag', title: 'Dragging', event: 'academy:drag' },
    { id: 'type', title: 'Typing', event: 'academy:typed' }
  ];

  var INFO = {
    monitor: ['the monitor', 'The monitor is the screen. It shows pictures and words.'],
    keyboard: ['the keyboard', 'The keyboard has letters and numbers. We type with it.'],
    mouse: ['the mouse', 'The mouse moves the pointer on the screen. We click with it.'],
    speakers: ['the speakers', 'The speakers play sounds and music.']
  };

  function sceneSvg() {
    var keys = '';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 12; c++) {
      keys += '<rect x="' + (119 + c * 18.2) + '" y="' + (231 + r * 11) + '" width="14" height="8" rx="2" fill="#fff" stroke="#adb5bd"/>';
    }
    function speaker(x) {
      return '<g><rect x="' + x + '" y="90" width="56" height="100" rx="10" fill="#495057"/><circle cx="' + (x + 28) + '" cy="116" r="9" fill="#adb5bd"/><circle cx="' + (x + 28) + '" cy="158" r="19" fill="#adb5bd"/><circle cx="' + (x + 28) + '" cy="158" r="9" fill="#343a40"/></g>';
    }
    return '<svg viewBox="0 0 480 300" class="scene-svg" role="img" aria-label="A computer with a monitor, keyboard, mouse and speakers">' +
      '<rect x="0" y="266" width="480" height="34" rx="8" fill="#e9d8a6"/>' +
      '<g class="part" data-part="monitor"><rect x="140" y="16" width="200" height="140" rx="12" fill="#343a40"/><rect x="150" y="26" width="180" height="120" rx="6" fill="#a5d8ff"/><path d="M150 118 Q200 88 240 112 T330 102 V146 H150Z" fill="#8ce99a"/><circle cx="300" cy="58" r="14" fill="#ffe066"/><rect x="228" y="156" width="24" height="26" fill="#868e96"/><rect x="198" y="180" width="84" height="12" rx="6" fill="#495057"/></g>' +
      '<text class="lbl" x="240" y="212">Monitor</text>' +
      '<g class="part" data-part="speakers">' + speaker(46) + speaker(378) + '</g>' +
      '<text class="lbl" x="74" y="212">Speaker</text><text class="lbl" x="406" y="212">Speaker</text>' +
      '<g class="part" data-part="keyboard"><rect x="108" y="222" width="236" height="44" rx="8" fill="#dee2e6" stroke="#868e96" stroke-width="3"/>' + keys + '</g>' +
      '<text class="lbl" x="226" y="290">Keyboard</text>' +
      '<g class="part" data-part="mouse"><rect x="372" y="224" width="34" height="50" rx="17" fill="#f1f3f5" stroke="#868e96" stroke-width="3"/><path d="M389 224v22M372 246h34" stroke="#868e96" stroke-width="3" fill="none"/></g>' +
      '<text class="lbl" x="389" y="293">Mouse</text>' +
      '</svg>';
  }

  LCL.registerApp({
    id: 'academy', title: 'Computer Academy', icon: 'academy', w: 880, h: 590, minW: 480, minH: 400,
    help: 'Welcome to Computer Academy! Pick a lesson on the left. Press Listen to hear me read the words.',
    mount: function (root) {
      var progress = vfs.getKV('academy', {}) || {};
      var timers = [], current = null;
      var wrap = el('div', { class: 'acad' });
      var side = el('nav', { class: 'acad-side', 'aria-label': 'Lessons' });
      var stage = el('div', { class: 'acad-stage' });
      wrap.appendChild(side); wrap.appendChild(stage);
      root.appendChild(wrap);

      function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function allDone() { return LESSONS.every(function (l) { return progress[l.id]; }); }

      function renderSide() {
        side.innerHTML = '';
        side.appendChild(el('h3', { text: 'Week 1' }));
        LESSONS.forEach(function (l, i) {
          side.appendChild(el('button', {
            class: 'lesson-btn' + (current === l.id ? ' on' : '') + (progress[l.id] ? ' done' : ''),
            onclick: function () { openLesson(l.id); },
            html: '<span class="num">' + (progress[l.id] ? '✓' : (i + 1)) + '</span><span class="lt"></span>'
          }));
          side.lastChild.querySelector('.lt').textContent = l.title;
        });
      }

      function complete(id) {
        var first = !progress[id];
        progress[id] = true;
        vfs.setKV('academy', progress);
        renderSide();
        LCL.sound.play('tada'); LCL.fx.confetti();
        var l = LESSONS.filter(function (x) { return x.id === id; })[0];
        LCL.emit(l.event);
        if (allDone() && first) {
          LCL.emit('academy:complete');
          LCL.bleep.say('You finished all of Week 1! You are a computer star!', { ms: 10000 });
        }
      }

      /* ---- shared lesson scaffolding ---- */
      function shell(title, instr) {
        stage.innerHTML = '';
        var h = el('h2', { text: title });
        var p = el('p', { class: 'instr', text: instr });
        var fb = el('div', { class: 'fb', 'aria-live': 'polite' });
        var area = el('div', { class: 'lesson-area' });
        var listen = el('button', { class: 'mini listen', text: 'Listen', title: 'Read this out loud', onclick: function () { LCL.bleep.speak(p.textContent); } });
        stage.appendChild(el('div', { class: 'lhead' }, [h, listen]));
        stage.appendChild(p); stage.appendChild(area); stage.appendChild(fb);
        var api = {
          area: area, instr: p,
          say: function (t, good) { fb.textContent = t; fb.className = 'fb ' + (good ? 'good' : 'try'); },
          ask: function (t) { p.textContent = t; LCL.bleep.say(t, { ms: 9000 }); }
        };
        LCL.bleep.say(instr, { ms: 9000 });
        return api;
      }
      function won(sh, id, msg) {
        sh.say(msg || (LCL.praise() + ' You finished this lesson!'), true);
        complete(id);
        var next = LESSONS[LESSONS.map(function (l) { return l.id; }).indexOf(id) + 1];
        sh.area.appendChild(el('div', { class: 'win-row' }, [
          el('button', { class: 'btn', text: 'Do it again', onclick: function () { openLesson(id); } }),
          next ? el('button', { class: 'btn primary', text: 'Next lesson', onclick: function () { openLesson(next.id); } }) : null
        ]));
      }

      /* ---- lesson 1: parts ---- */
      function lessonParts() {
        var sh = shell('Meet the Computer', 'Click on each part of the computer to find out what it does.');
        var scene = el('div', { class: 'scene learn', html: sceneSvg() });
        var btnRow = el('div', { class: 'win-row' });
        sh.area.appendChild(scene); sh.area.appendChild(btnRow);
        var mode = 'learn', queue = [], target = null, wrong = 0;

        function setBtn() {
          btnRow.innerHTML = '';
          if (mode === 'learn') btnRow.appendChild(el('button', { class: 'btn primary', text: 'Test me!', onclick: startQuiz }));
          else btnRow.appendChild(el('button', { class: 'btn', text: 'Show the names again', onclick: function () { mode = 'learn'; scene.classList.add('learn'); clearHint(); sh.ask('Click on each part to find out what it does.'); setBtn(); } }));
        }
        function clearHint() { Array.prototype.forEach.call(scene.querySelectorAll('.part'), function (p) { p.classList.remove('hint', 'pick'); }); }
        function nextTarget() {
          target = queue.shift(); wrong = 0; clearHint();
          if (!target) { mode = 'learn'; scene.classList.add('learn'); setBtn(); won(sh, 'parts', LCL.praise() + ' You know all the parts of the computer!'); return; }
          sh.ask('Can you click on ' + INFO[target][0] + '?');
          sh.say('', true);
        }
        function startQuiz() {
          mode = 'quiz'; scene.classList.remove('learn');
          queue = Object.keys(INFO).sort(function () { return Math.random() - 0.5; });
          setBtn(); nextTarget();
        }
        Array.prototype.forEach.call(scene.querySelectorAll('.part'), function (p) {
          p.addEventListener('click', function () {
            var part = p.getAttribute('data-part');
            if (mode === 'learn') {
              clearHint(); p.classList.add('pick');
              sh.say(INFO[part][1], true); LCL.bleep.say(INFO[part][1], { ms: 8000 });
              LCL.sound.play(part === 'speakers' ? 'melody' : 'pop');
              return;
            }
            if (!target) return;
            if (part === target) {
              LCL.sound.play('good'); sh.say(LCL.praise() + ' That is ' + INFO[part][0] + '.', true);
              p.classList.add('pick');
              later(nextTarget, 900);
              target = null;
            } else {
              LCL.sound.play('oops'); wrong++;
              sh.say('That is ' + INFO[part][0] + '. Have another go!', false);
              if (wrong >= 2) scene.querySelector('[data-part="' + target + '"]').classList.add('hint');
            }
          });
        });
        setBtn();
      }

      /* ---- lesson 2: click ---- */
      function lessonClick() {
        var sh = shell('Clicking', 'Press the left mouse button once on each balloon to pop it.');
        var need = 6, got = 0, misses = 0, balloon = null;
        var stars = el('div', { class: 'stars' });
        var field = el('div', { class: 'field' });
        sh.area.appendChild(stars); sh.area.appendChild(field);
        var cols = ['#fa5252', '#fcc419', '#40c057', '#228be6', '#be4bdb', '#ff922b'];
        function paintStars() {
          stars.innerHTML = '';
          for (var i = 0; i < need; i++) stars.appendChild(el('span', { class: i < got ? 'on' : '', text: '★' }));
        }
        function spawn() {
          if (balloon) balloon.remove();
          balloon = el('button', { class: 'balloon', 'aria-label': 'Balloon. Click me!' });
          balloon.style.background = 'radial-gradient(circle at 35% 30%, #fff8 0 12%, ' + cols[got % cols.length] + ' 40%)';
          balloon.style.left = (6 + Math.random() * 78) + '%';
          balloon.style.top = (6 + Math.random() * 64) + '%';
          balloon.addEventListener('click', function (e) {
            e.stopPropagation(); got++; misses = 0; LCL.sound.play('pop'); paintStars();
            if (got >= need) { balloon.remove(); balloon = null; won(sh, 'click', LCL.praise() + ' You popped all the balloons!'); }
            else { sh.say(LCL.praise(), true); spawn(); }
          });
          field.appendChild(balloon);
        }
        field.addEventListener('click', function () {
          if (got >= need) return;
          misses++;
          sh.say('Move the pointer on to the balloon, then click.', false);
          if (misses >= 3 && balloon) balloon.classList.add('hint');
        });
        paintStars(); spawn();
      }

      /* ---- lesson 3: double-click ---- */
      function lessonDbl() {
        var sh = shell('Double-Click', 'Double-click means click two times, very fast. Double-click the egg!');
        var need = 3, got = 0, last = 0, busy = false;
        var stars = el('div', { class: 'stars' });
        var field = el('div', { class: 'field center' });
        sh.area.appendChild(stars); sh.area.appendChild(field);
        function paintStars() { stars.innerHTML = ''; for (var i = 0; i < need; i++) stars.appendChild(el('span', { class: i < got ? 'on' : '', text: '★' })); }
        var egg = el('button', { class: 'egg', 'aria-label': 'Egg. Double-click me!' });
        field.appendChild(egg);
        egg.addEventListener('click', function () {
          if (busy) return;
          var now = Date.now();
          if (now - last < 500) {
            last = 0; busy = true; got++; paintStars();
            egg.className = 'egg hatched'; egg.textContent = '🐥';
            LCL.sound.play('good');
            if (got >= need) { won(sh, 'dbl', LCL.praise() + ' Three chicks hatched!'); return; }
            sh.say(LCL.praise() + ' It hatched! Here comes another egg.', true);
            later(function () { egg.className = 'egg'; egg.textContent = ''; busy = false; }, 1200);
          } else {
            last = now; egg.classList.remove('wobble'); void egg.offsetWidth; egg.classList.add('wobble');
            var mine = now;
            later(function () { if (last === mine && !busy) { sh.say('Nearly! Click two times, quickly, like this: click-click!', false); LCL.sound.play('oops'); } }, 560);
          }
        });
        paintStars();
      }

      /* ---- lesson 4: drag ---- */
      function lessonDrag() {
        var sh = shell('Dragging', 'Press and hold the left button on the ball. Keep holding, move the mouse, then let go over the basket.');
        var rounds = [
          { b: [10, 62], g: [70, 12] }, { b: [78, 66], g: [14, 18] }, { b: [44, 70], g: [46, 8] }
        ];
        var round = 0, busy = false;
        var stars = el('div', { class: 'stars' });
        var field = el('div', { class: 'field' });
        sh.area.appendChild(stars); sh.area.appendChild(field);
        var goal = el('div', { class: 'goal', html: '<span>Basket</span>' });
        var ball = el('div', { class: 'ball', role: 'button', 'aria-label': 'Ball. Drag me to the basket.' });
        field.appendChild(goal); field.appendChild(ball);
        function paintStars() { stars.innerHTML = ''; for (var i = 0; i < rounds.length; i++) stars.appendChild(el('span', { class: i < round ? 'on' : '', text: '★' })); }
        function place(r) {
          ball.style.left = r.b[0] + '%'; ball.style.top = r.b[1] + '%';
          goal.style.left = r.g[0] + '%'; goal.style.top = r.g[1] + '%';
        }
        function toPct(x, y) {
          var f = field.getBoundingClientRect();
          return [x / f.width * 100, y / f.height * 100];
        }
        ball.addEventListener('pointerdown', function (e) {
          if (busy) return;
          e.preventDefault(); ball.setPointerCapture(e.pointerId);
          var f = field.getBoundingClientRect(), b = ball.getBoundingClientRect();
          var offX = e.clientX - b.left, offY = e.clientY - b.top, sx = e.clientX, sy = e.clientY, moved = 0;
          var startL = ball.style.left, startT = ball.style.top;
          ball.classList.add('grab');
          function move(ev) {
            var x = Math.max(0, Math.min(f.width - b.width, ev.clientX - f.left - offX));
            var y = Math.max(0, Math.min(f.height - b.height, ev.clientY - f.top - offY));
            ball.style.left = x + 'px'; ball.style.top = y + 'px';
            moved = Math.max(moved, Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy));
          }
          function up() {
            ball.removeEventListener('pointermove', move); ball.removeEventListener('pointerup', up); ball.removeEventListener('pointercancel', up);
            ball.classList.remove('grab');
            var br = ball.getBoundingClientRect(), gr = goal.getBoundingClientRect();
            var cx = br.left + br.width / 2, cy = br.top + br.height / 2;
            if (cx > gr.left && cx < gr.right && cy > gr.top && cy < gr.bottom) {
              busy = true; round++; paintStars(); LCL.sound.play('good');
              var p = toPct(gr.left - f.left + (gr.width - br.width) / 2, gr.top - f.top + (gr.height - br.height) / 2);
              ball.style.left = p[0] + '%'; ball.style.top = p[1] + '%';
              if (round >= rounds.length) { won(sh, 'drag', LCL.praise() + ' You dragged the ball every time!'); return; }
              sh.say(LCL.praise() + ' In the basket! Here is the next one.', true);
              later(function () { place(rounds[round]); busy = false; }, 1100);
            } else {
              ball.style.left = startL; ball.style.top = startT;
              LCL.sound.play('oops');
              sh.say(moved < 8 ? 'Press and HOLD the button down, then move the mouse.' : 'Nearly! Keep holding until the ball is over the basket.', false);
            }
          }
          ball.addEventListener('pointermove', move); ball.addEventListener('pointerup', up); ball.addEventListener('pointercancel', up);
          void startT;
        });
        paintStars(); place(rounds[0]);
      }

      /* ---- lesson 5: typing ---- */
      function lessonType() {
        var sh = shell('Typing', 'Look at the letters. Find each one on the keyboard and type it.');
        var words = ['hi', 'cat', 'hello'], wi = 0;
        var tiles = el('div', { class: 'tiles' });
        var input = el('input', { class: 'big-input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Type here', placeholder: 'Click here, then type' });
        sh.area.appendChild(tiles); sh.area.appendChild(input);

        function showWord() {
          tiles.innerHTML = ''; input.value = '';
          words[wi].toUpperCase().split('').forEach(function (ch) { tiles.appendChild(el('span', { class: 'tile', text: ch })); });
          sh.ask('Type the word: ' + words[wi].toUpperCase().split('').join(' '));
          input.focus();
        }
        input.addEventListener('input', function () {
          var target = words[wi], v = input.value.toLowerCase();
          if (target.indexOf(v) !== 0) {
            LCL.sound.play('oops');
            var need = target.charAt(Math.max(0, v.length - 1)).toUpperCase();
            input.value = input.value.slice(0, -1);
            sh.say('Look for the ' + need + ' key.', false);
            return;
          }
          Array.prototype.forEach.call(tiles.children, function (t, i) { t.classList.toggle('ok', i < v.length); });
          if (v.length) LCL.sound.play('pop');
          if (v.length === target.length) {
            LCL.sound.play('good'); sh.say(LCL.praise() + ' You typed ' + target.toUpperCase() + '.', true);
            wi++;
            if (wi >= words.length) later(messagePhase, 900); else later(showWord, 900);
          }
        });

        function messagePhase() {
          stage.innerHTML = '';
          var sh2 = shell('My Welcome Message', 'Now write your own welcome message. Press the buttons to help you start.');
          var box = el('textarea', { class: 'msg', rows: '4', maxlength: '200', placeholder: 'Hello! Welcome to my computer!', 'aria-label': 'Your welcome message' });
          var save = el('button', { class: 'btn primary', text: 'Save my message', disabled: true });
          var chips = el('div', { class: 'chips' });
          ['Hello! ', 'My name is ', 'I like ', 'Welcome to my computer! '].forEach(function (t) {
            chips.appendChild(el('button', { class: 'chip', text: t.trim(), onclick: function () { box.value += t; box.focus(); check(); } }));
          });
          function check() { save.disabled = box.value.trim().length < 3; }
          box.addEventListener('input', check);
          save.addEventListener('click', function () {
            var n = vfs.createFile(vfs.DESKTOP, 'My Welcome Message', 'text', box.value.trim(), { by: 'pupil' });
            box.disabled = true; save.disabled = true;
            LCL.bleep.say('Look at your Desktop! Your message is saved there.', { ms: 9000 });
            won(sh2, 'type', LCL.praise() + ' Your message is saved on the Desktop, called "' + n.name + '".');
          });
          sh2.area.appendChild(chips); sh2.area.appendChild(box);
          sh2.area.appendChild(el('div', { class: 'win-row' }, [save]));
          box.focus();
        }
        showWord();
      }

      var RUN = { parts: lessonParts, click: lessonClick, dbl: lessonDbl, drag: lessonDrag, type: lessonType };
      function openLesson(id) {
        clearTimers(); current = id; renderSide(); RUN[id]();
      }
      function home() {
        clearTimers(); current = null; renderSide(); stage.innerHTML = '';
        stage.appendChild(el('div', { class: 'acad-home' }, [
          el('h2', { text: 'Welcome to Computer Academy!' }),
          el('p', { text: allDone() ? 'You have finished Week 1. You can play any lesson again!' : 'Pick a lesson on the left. Start with number 1.' }),
          el('button', { class: 'btn primary big', text: allDone() ? 'Play again from the start' : 'Start lesson 1', onclick: function () { openLesson('parts'); } })
        ]));
      }
      home();
      return { destroy: clearTimers };
    }
  });
})();
