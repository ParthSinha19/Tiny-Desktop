/* File Explorer - Week 3. Works on the same shared virtual file system as Paint. */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs, I = LCL.icons, ui = LCL.ui;

  LCL.clipboard = LCL.clipboard || null; /* { mode: 'copy' | 'move', id } */

  LCL.registerApp({
    id: 'explorer', title: 'File Explorer', icon: 'explorer', w: 900, h: 580, minW: 520, minH: 380,
    help: 'This is where your files live. Click a file, then use the buttons. Double-click to open it!',
    mount: function (root, ctx) {
      var cwd = vfs.DESKTOP, hist = [], sel = null, renaming = false, lastId = null, lastTime = 0;

      var wrap = el('div', { class: 'exp' });
      var crumbs = el('div', { class: 'crumbs', 'aria-label': 'Where you are' });
      var tools = el('div', { class: 'exp-tools' });
      var tree = el('nav', { class: 'exp-side', 'aria-label': 'Folders' });
      var grid = el('div', { class: 'exp-grid' });
      var status = el('div', { class: 'exp-status' });
      var btns = {};

      function tbtn(key, label, glyph, fn, cls) {
        var b = el('button', { class: 'btn tb ' + (cls || ''), html: I.g(glyph) + '<span>' + label + '</span>', onclick: fn });
        btns[key] = b; return b;
      }
      var navBar = el('div', { class: 'exp-nav' }, [tbtn('back', 'Back', 'back', goBack), tbtn('up', 'Up', 'up', goUp), crumbs]);
      [['newfolder', 'New Folder', 'newfolder', newFolder], ['newnote', 'New Note', 'newnote', newNote],
        ['open', 'Open', 'open', function () { if (sel) openNode(sel); }],
        ['rename', 'Rename', 'rename', function () { if (sel) startRename(sel, false); }],
        ['copy', 'Copy', 'copy', function () { setClip('copy'); }],
        ['move', 'Move', 'move', function () { setClip('move'); }],
        ['paste', 'Paste', 'paste', paste],
        ['del', 'Delete', 'trash', del, 'danger']].forEach(function (t) { tools.appendChild(tbtn(t[0], t[1], t[2], t[3], t[4])); });

      wrap.appendChild(navBar); wrap.appendChild(tools);
      wrap.appendChild(el('div', { class: 'exp-main' }, [tree, grid]));
      wrap.appendChild(status);
      root.appendChild(wrap);

      /* ---------- navigation ---------- */
      function go(id, user) {
        if (!vfs.get(id)) return;
        if (id !== cwd) { hist.push(cwd); cwd = id; }
        sel = null; render();
        if (user) LCL.emit('explorer:open-folder', { id: id });
      }
      function goBack() { while (hist.length) { var id = hist.pop(); if (vfs.get(id)) { cwd = id; sel = null; render(); return; } } }
      function goUp() { var n = vfs.get(cwd); if (n && n.parent) go(n.parent, false); }

      function openNode(id) {
        var n = vfs.get(id); if (!n) return;
        if (n.type === 'folder') go(id, true);
        else { LCL.openNode(id); LCL.emit('explorer:open-file', { id: id }); }
      }

      /* ---------- drag and drop ---------- */
      function makeDrop(node, folderId) {
        node.addEventListener('dragover', function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; node.classList.add('dropping'); });
        node.addEventListener('dragleave', function () { node.classList.remove('dropping'); });
        node.addEventListener('drop', function (e) {
          e.preventDefault(); e.stopPropagation(); node.classList.remove('dropping');
          var id = e.dataTransfer.getData('text/plain');
          if (id) doMove(id, folderId);
        });
      }
      function doMove(id, target) {
        var n = vfs.get(id), t = vfs.get(target);
        var r = vfs.move(id, target);
        if (!r.ok) { LCL.bleep.say(r.error); LCL.sound.play('oops'); return; }
        if (r.same) { LCL.bleep.say('It is already in that folder!'); return; }
        LCL.sound.play('good'); LCL.bleep.say('Moved "' + n.name + '" into ' + t.name + '!');
        LCL.emit('explorer:move', { id: id });
      }

      /* ---------- actions ---------- */
      function select(id) { sel = id; markSel(); updateTools(); }
      function markSel() {
        Array.prototype.forEach.call(grid.children, function (c) { c.classList.toggle('sel', c.getAttribute('data-id') === sel); });
      }
      function newFolder() {
        var n = vfs.createFolder(cwd, 'New Folder');
        LCL.emit('explorer:newfolder', { id: n.id });
        select(n.id); startRename(n.id, true);
        LCL.bleep.say('Type a name for your new folder, then press Enter.');
      }
      function newNote() {
        var n = vfs.createFile(cwd, 'New Note', 'text', '', { by: 'pupil' });
        select(n.id); startRename(n.id, true);
        LCL.bleep.say('Type a name for your new note, then press Enter.');
      }
      function itemEl(id) {
        return Array.prototype.filter.call(grid.children, function (c) { return c.getAttribute('data-id') === id; })[0];
      }
      function startRename(id, isNew) {
        var node = itemEl(id), n = vfs.get(id);
        if (!node || !n) return;
        if (n.system) { LCL.bleep.say('This special folder cannot be renamed.'); return; }
        var label = node.querySelector('.flabel');
        var input = el('input', { class: 'rename', type: 'text', maxlength: '40', value: n.name, 'aria-label': 'New name' });
        label.replaceWith(input);
        renaming = true; input.focus(); input.select();
        var done = false;
        function finish(commit, fromBlur) {
          if (done) return;
          if (commit) {
            var r = vfs.rename(id, input.value);
            if (!r.ok) {
              if (!fromBlur) { LCL.bleep.say(r.error); LCL.sound.play('oops'); input.focus(); return; }
            } else if (r.changed && !isNew) {
              LCL.emit('explorer:rename', { id: id }); LCL.sound.play('good'); LCL.bleep.say('Renamed!');
            }
          }
          done = true; renaming = false; render();
        }
        input.addEventListener('keydown', function (e) {
          e.stopPropagation();
          if (e.key === 'Enter') finish(true, false);
          else if (e.key === 'Escape') finish(false, false);
        });
        input.addEventListener('blur', function () { finish(true, true); });
        input.addEventListener('click', function (e) { e.stopPropagation(); });
        input.addEventListener('dblclick', function (e) { e.stopPropagation(); });
      }
      function setClip(mode) {
        var n = sel && vfs.get(sel); if (!n) return;
        LCL.clipboard = { mode: mode, id: sel };
        LCL.sound.play('pop');
        LCL.bleep.say(mode === 'copy'
          ? 'Copied "' + n.name + '"! Now open the folder where you want the copy and press Paste.'
          : 'Ready to move "' + n.name + '"! Open the folder where it should go and press Paste.', { ms: 10000 });
        render();
      }
      function paste() {
        var cb = LCL.clipboard, n = cb && vfs.get(cb.id);
        if (!cb || !n) { LCL.clipboard = null; render(); return; }
        var target = vfs.get(cwd);
        if (cb.mode === 'copy') {
          var r = vfs.copy(cb.id, cwd);
          if (!r.ok) { LCL.bleep.say(r.error); LCL.sound.play('oops'); return; }
          select(r.node.id);
          LCL.sound.play('good'); LCL.bleep.say('Copied into ' + target.name + '!');
          LCL.emit('explorer:copy', { id: r.node.id });
        } else {
          var m = vfs.move(cb.id, cwd);
          if (!m.ok) { LCL.bleep.say(m.error); LCL.sound.play('oops'); return; }
          if (m.same) { LCL.bleep.say('It is already in this folder. Open a different folder first!'); return; }
          LCL.clipboard = null; select(cb.id);
          LCL.sound.play('good'); LCL.bleep.say('Moved into ' + target.name + '!');
          LCL.emit('explorer:move', { id: cb.id });
        }
        render();
      }
      function del() {
        var n = sel && vfs.get(sel); if (!n) return;
        if (n.system) { LCL.bleep.say('This special folder cannot be deleted.'); return; }
        ui.confirm(root, 'Delete "' + n.name + '"?' + (n.type === 'folder' ? ' Everything inside it will go too.' : ''), { yes: 'Yes, delete it', no: 'No, keep it', danger: true }).then(function (ok) {
          if (!ok) return;
          if (LCL.clipboard && (LCL.clipboard.id === n.id)) LCL.clipboard = null;
          vfs.remove(n.id); sel = null; render();
          LCL.bleep.say('Deleted.');
        });
      }

      /* ---------- rendering ---------- */
      function renderTree() {
        tree.innerHTML = '';
        tree.appendChild(el('h3', { text: 'Folders' }));
        (function walk(id, depth) {
          var n = vfs.get(id);
          var row = el('button', {
            class: 'trow' + (id === cwd ? ' cur' : ''), 'data-depth': depth,
            html: '<span class="ti">' + I.big(id === vfs.ROOT ? 'computer' : 'folder') + '</span><span class="tl"></span>',
            onclick: function () { go(id, true); }
          });
          row.style.paddingLeft = (8 + depth * 14) + 'px';
          row.querySelector('.tl').textContent = n.name;
          makeDrop(row, id);
          tree.appendChild(row);
          vfs.children(id).filter(function (x) { return x.type === 'folder'; }).forEach(function (f) { walk(f.id, depth + 1); });
        })(vfs.ROOT, 0);
      }
      function renderCrumbs() {
        crumbs.innerHTML = '';
        vfs.path(cwd).forEach(function (n, i, arr) {
          var b = el('button', { class: 'crumb', text: n.name, onclick: function () { go(n.id, false); } });
          makeDrop(b, n.id);
          crumbs.appendChild(b);
          if (i < arr.length - 1) crumbs.appendChild(el('span', { class: 'sep', text: '›' }));
        });
      }
      function renderGrid() {
        grid.innerHTML = '';
        var kids = vfs.children(cwd);
        if (!kids.length) grid.appendChild(el('p', { class: 'exp-empty', text: 'This folder is empty. Try New Folder or New Note, or Paste something here!' }));
        kids.forEach(function (n) {
          var cut = LCL.clipboard && LCL.clipboard.mode === 'move' && LCL.clipboard.id === n.id;
          var d = el('div', { class: 'fitem' + (sel === n.id ? ' sel' : '') + (cut ? ' cut' : ''), tabindex: '0', role: 'button', 'data-id': n.id, draggable: 'true', 'aria-label': n.name });
          d.appendChild(ui.nodeIcon(n));
          d.appendChild(el('span', { class: 'flabel', text: n.name }));
          d.addEventListener('click', function (e) {
            e.stopPropagation();
            if (renaming) return;
            var now = Date.now();
            if (lastId === n.id && now - lastTime < 450) { lastId = null; openNode(n.id); return; }
            lastId = n.id; lastTime = now; select(n.id);
          });
          d.addEventListener('keydown', function (e) {
            if (renaming) return;
            if (e.key === 'Enter') { e.preventDefault(); openNode(n.id); }
            else if (e.key === ' ') { e.preventDefault(); select(n.id); }
            else if (e.key === 'Delete') { select(n.id); del(); }
            else if (e.key === 'F2') { select(n.id); startRename(n.id, false); }
          });
          d.addEventListener('dragstart', function (e) {
            if (n.system) { e.preventDefault(); return; }
            e.dataTransfer.setData('text/plain', n.id); e.dataTransfer.effectAllowed = 'move'; select(n.id);
          });
          if (n.type === 'folder') makeDrop(d, n.id);
          grid.appendChild(d);
        });
      }
      function updateTools() {
        var n = sel && vfs.get(sel), cb = LCL.clipboard, cbn = cb && vfs.get(cb.id);
        function dis(k, v) { btns[k].disabled = !!v; }
        dis('back', !hist.length); dis('up', !(vfs.get(cwd) && vfs.get(cwd).parent));
        dis('open', !n); dis('rename', !n || n.system); dis('copy', !n); dis('move', !n || n.system); dis('del', !n || n.system);
        dis('paste', !cbn);
        status.innerHTML = '';
        var count = vfs.children(cwd).length;
        status.appendChild(el('span', { text: count + (count === 1 ? ' thing' : ' things') + ' in this folder' }));
        if (cbn) {
          status.appendChild(el('span', { class: 'clip', text: (cb.mode === 'copy' ? 'Copying' : 'Moving') + ' "' + cbn.name + '". Open a folder and press Paste.' }));
          status.appendChild(el('button', { class: 'mini', text: 'Cancel', onclick: function () { LCL.clipboard = null; render(); } }));
        }
      }
      function render() {
        if (renaming) return;
        if (!vfs.get(cwd)) { cwd = vfs.ROOT; hist = []; }
        if (sel && !vfs.get(sel)) sel = null;
        var cn = vfs.get(cwd);
        ctx.setTitle('File Explorer - ' + cn.name);
        renderTree(); renderCrumbs(); renderGrid(); updateTools();
      }

      grid.addEventListener('click', function () { if (!renaming) { sel = null; markSel(); updateTools(); } });
      var off = vfs.onChange(render);
      render();

      return {
        destroy: off,
        onOpen: function (args) {
          if (args && args.folderId && vfs.get(args.folderId)) go(args.folderId, false);
        }
      };
    }
  });
})();
