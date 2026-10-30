/* Little Computer Lab - weekly missions + Mission Board app.
 * To add a week: push a new object onto MISSIONS. A step is finished by an
 * event (apps call LCL.emit('name')) or by a check(vfs) on the shared file system. */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs, I = LCL.icons;

  function foldersNamed(name) {
    return vfs.all().filter(function (n) { return n.type === 'folder' && n.name.toLowerCase() === name; });
  }
  function pupilDrawings() { return vfs.all().filter(function (n) { return n.kind === 'drawing' && n.by === 'pupil'; }); }
  function inPictures(n) {
    var p = vfs.get(n.parent);
    return !!p && p.type === 'folder' && p.name.toLowerCase() === 'pictures';
  }

  var MISSIONS = [
    {
      id: 'w1', label: 'Week 1', title: 'Meet the Computer', app: 'academy', appLabel: 'Open Computer Academy', steps: [
        { id: 'w1-parts', text: 'Find the monitor, keyboard, mouse and speakers', event: 'academy:parts' },
        { id: 'w1-click', text: 'Click the balloons', event: 'academy:click' },
        { id: 'w1-dbl', text: 'Double-click to hatch the eggs', event: 'academy:dblclick' },
        { id: 'w1-drag', text: 'Drag the ball into the basket', event: 'academy:drag' },
        { id: 'w1-type', text: 'Type and save a welcome message', event: 'academy:typed' }
      ]
    },
    {
      id: 'w2', label: 'Week 2', title: 'Draw a Picture', app: 'paint', appLabel: 'Open Little Paint', steps: [
        { id: 'w2-draw', text: 'Draw with the brush', event: 'paint:drew' },
        { id: 'w2-colour', text: 'Choose a colour', event: 'paint:colour' },
        { id: 'w2-shape', text: 'Make a shape', event: 'paint:shape' },
        { id: 'w2-erase', text: 'Rub something out with the eraser', event: 'paint:erase' },
        { id: 'w2-undo', text: 'Press Undo', event: 'paint:undo' },
        { id: 'w2-save', text: 'Save your picture', event: 'paint:saved' },
        { id: 'w2-open', text: 'Open a saved picture', event: 'paint:opened' },
        { id: 'w2-wall', text: 'Make your picture the wallpaper', event: 'paint:wallpaper' }
      ]
    },
    {
      id: 'w3', label: 'Week 3', title: 'Files and Folders', app: 'explorer', appLabel: 'Open File Explorer', steps: [
        { id: 'w3-new', text: 'Make a new folder', event: 'explorer:newfolder' },
        { id: 'w3-rename', text: 'Give a folder a new name', event: 'explorer:rename' },
        { id: 'w3-folder', text: 'Open a folder', event: 'explorer:open-folder' },
        { id: 'w3-file', text: 'Open a file', event: 'explorer:open-file' },
        { id: 'w3-copy', text: 'Copy a file into another folder', event: 'explorer:copy' },
        { id: 'w3-move', text: 'Move a file into another folder', event: 'explorer:move' }
      ]
    },
    {
      id: 'bonus', label: 'Bonus', title: 'The Picture Journey', app: 'paint', appLabel: 'Open Little Paint', steps: [
        { id: 'b-1', text: 'Draw a picture and save it on the Desktop', check: function () {
          return pupilDrawings().some(function (n) { return n.parent === vfs.DESKTOP || inPictures(n); });
        } },
        { id: 'b-2', text: 'In File Explorer, make a folder called Pictures', check: function () { return foldersNamed('pictures').length > 0; } },
        { id: 'b-3', text: 'Move your drawing into the Pictures folder', check: function () { return pupilDrawings().some(inPictures); } },
        { id: 'b-4', text: 'Open your drawing again from the Pictures folder', event: 'paint:opened', test: function (d) {
          var n = d && vfs.get(d.id);
          return !!n && n.by === 'pupil' && inPictures(n);
        } }
      ]
    }
  ];
  var COMING = [{ label: 'Week 4', title: 'Coming soon' }, { label: 'Week 5', title: 'Coming soon' }];

  var progress = {};
  function stepsAll() { var a = []; MISSIONS.forEach(function (m) { m.steps.forEach(function (s) { a.push(s); }); }); return a; }
  function doneCount(m) { return m.steps.filter(function (s) { return progress[s.id]; }).length; }
  function totalDone() { return stepsAll().filter(function (s) { return progress[s.id]; }).length; }

  function markDone(step, quiet) {
    if (progress[step.id]) return;
    progress[step.id] = true;
    vfs.setKV('missions', progress);
    updateStars();
    LCL.emit('missions:update');
    if (quiet) return;
    var m = MISSIONS.filter(function (x) { return x.steps.indexOf(step) >= 0; })[0];
    if (m && doneCount(m) === m.steps.length) {
      LCL.sound.play('tada'); LCL.fx.confetti();
      LCL.fx.toast('Mission complete: ' + m.title);
      LCL.bleep.say('Mission complete! You finished "' + m.title + '". Amazing work!', { ms: 9000 });
    } else {
      LCL.sound.play('good');
      LCL.fx.toast('Mission step done!');
      LCL.bleep.say('Mission step done: ' + step.text + '. Well done!', { ms: 7000 });
    }
  }
  function updateStars() { var n = document.getElementById('stars-n'); if (n) n.textContent = totalDone(); }

  function runChecks(quiet) {
    stepsAll().forEach(function (s) {
      if (s.check && !progress[s.id]) { try { if (s.check()) markDone(s, quiet); } catch (e) { /* ignore */ } }
    });
  }

  LCL.missions = {
    list: MISSIONS,
    init: function () {
      progress = vfs.getKV('missions', {}) || {};
      updateStars();
      runChecks(true);
      LCL.on('*', function (name, data) {
        if (name === 'fs:change') { runChecks(false); return; }
        stepsAll().forEach(function (s) {
          if (s.event === name && !progress[s.id] && (!s.test || s.test(data))) markDone(s);
        });
      });
    }
  };

  /* ---------- Mission Board app ---------- */
  LCL.registerApp({
    id: 'missions', title: 'Mission Board', icon: 'missions', w: 600, h: 580, minW: 380,
    help: 'These are your missions. Do them in any order. A star appears when you finish a job!',
    mount: function (root) {
      var wrap = el('div', { class: 'missions' });
      root.appendChild(wrap);
      function render() {
        wrap.innerHTML = '';
        wrap.appendChild(el('div', { class: 'm-head' }, [
          el('h2', { text: 'Mission Board' }),
          el('p', { text: 'You have ' + totalDone() + ' of ' + stepsAll().length + ' stars. Do the jobs in any order!' })
        ]));
        MISSIONS.forEach(function (m) {
          var d = doneCount(m), complete = d === m.steps.length, nextFound = false;
          var card = el('section', { class: 'm-card' + (complete ? ' complete' : '') });
          card.appendChild(el('div', { class: 'm-top' }, [
            el('div', { class: 'm-title' }, [el('small', { text: m.label }), el('h3', { text: m.title })]),
            el('span', { class: 'pill', text: complete ? 'Done!' : d + ' / ' + m.steps.length })
          ]));
          var ul = el('ul', { class: 'm-steps' });
          m.steps.forEach(function (s) {
            var on = !!progress[s.id], cls = on ? 'done' : '';
            if (!on && !nextFound) { cls = 'next'; nextFound = true; }
            ul.appendChild(el('li', { class: cls }, [el('span', { class: 'box', html: on ? I.g('check') : '' }), el('span', { text: s.text })]));
          });
          card.appendChild(ul);
          card.appendChild(el('button', { class: 'btn primary', text: m.appLabel, onclick: function () { LCL.openApp(m.app); } }));
          wrap.appendChild(card);
        });
        COMING.forEach(function (c) {
          wrap.appendChild(el('section', { class: 'm-card locked' }, [
            el('div', { class: 'm-top' }, [el('div', { class: 'm-title' }, [el('small', { text: c.label }), el('h3', { text: c.title })]), el('span', { class: 'pill', text: 'Soon' })]),
            el('p', { class: 'm-soon', text: 'New missions will appear here.' })
          ]));
        });
      }
      render();
      var off = LCL.on('missions:update', render);
      return { destroy: off };
    }
  });
})();
