/* Notepad - opens text files from the shared file system (hidden from the desktop). */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs, I = LCL.icons;

  LCL.registerApp({
    id: 'notepad', title: 'Notepad', icon: 'notepad', hidden: true, w: 540, h: 420, minW: 320, minH: 260,
    help: 'Read or type here. Press Save to keep your words.',
    mount: function (root, ctx) {
      var id = null, dirty = false;
      var wrap = el('div', { class: 'notepad' });
      var status = el('span', { class: 'np-status' });
      var area = el('textarea', { class: 'np-text', spellcheck: 'false', 'aria-label': 'Your writing' });
      var saveBtn = el('button', { class: 'btn primary', html: I.g('save') + ' Save', onclick: save });
      wrap.appendChild(el('div', { class: 'np-bar' }, [saveBtn, status]));
      wrap.appendChild(area);
      root.appendChild(wrap);

      function name() { var n = id && vfs.get(id); return n ? n.name : null; }
      function refresh() {
        var n = name();
        ctx.setTitle('Notepad' + (n ? ' - ' + n : ''));
        status.textContent = !n ? 'Not saved yet' : dirty ? 'Changes not saved' : 'Saved';
      }
      area.addEventListener('input', function () { dirty = true; refresh(); });

      function save() {
        if (id && vfs.get(id)) {
          vfs.writeFile(id, area.value); dirty = false; refresh();
          LCL.bleep.say('Saved!'); LCL.sound.play('good');
          return;
        }
        LCL.ui.fileDialog(root, { mode: 'save', kind: 'text', startId: vfs.DESKTOP, defaultName: 'My Note' }).then(function (r) {
          if (!r) return;
          var n = vfs.createFile(r.folderId, r.name, 'text', area.value, { by: 'pupil' });
          id = n.id; dirty = false; refresh();
          LCL.bleep.say('Saved in ' + vfs.pathString(n.parent) + '!'); LCL.sound.play('good');
        });
      }

      var off = vfs.onChange(function () {
        if (id && !vfs.get(id)) id = null;
        refresh();
      });
      refresh();
      return {
        destroy: off,
        onOpen: function (args) {
          if (args && args.fileId && vfs.get(args.fileId)) {
            var n = vfs.get(args.fileId);
            id = n.id; area.value = typeof n.data === 'string' ? n.data : ''; dirty = false; refresh();
          }
        }
      };
    }
  });
})();
