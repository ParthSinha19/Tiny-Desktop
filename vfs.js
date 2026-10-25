/* Little Computer Lab - shared virtual file system + tiny event bus.
 * Everything lives in IndexedDB (falls back to memory if unavailable).
 * Never touches the real computer's files. */
(function (root) {
  'use strict';
  var LCL = root.LCL = root.LCL || {};

  /* ---------- tiny event bus ---------- */
  var handlers = {}, anyHandlers = [];
  LCL.on = function (name, fn) {
    if (name === '*') {
      anyHandlers.push(fn);
      return function () { anyHandlers = anyHandlers.filter(function (f) { return f !== fn; }); };
    }
    (handlers[name] = handlers[name] || []).push(fn);
    return function () { handlers[name] = (handlers[name] || []).filter(function (f) { return f !== fn; }); };
  };
  LCL.emit = function (name, data) {
    (handlers[name] || []).slice().forEach(function (f) { try { f(data, name); } catch (e) { console.error(e); } });
    anyHandlers.slice().forEach(function (f) { try { f(name, data); } catch (e) { console.error(e); } });
  };

  /* ---------- storage ---------- */
  var DB_NAME = 'little-computer-lab';
  var DB = null, nodes = {}, kv = {}, changeFns = [];
  var ROOT = 'root', DESKTOP = 'desktop', DOCUMENTS = 'documents';

  function uid() { return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function openDB() {
    return new Promise(function (resolve) {
      try {
        if (typeof indexedDB === 'undefined' || !indexedDB) return resolve(null);
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () {
          var d = req.result;
          if (!d.objectStoreNames.contains('nodes')) d.createObjectStore('nodes', { keyPath: 'id' });
          if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv', { keyPath: 'key' });
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
        req.onblocked = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }
  function idbPut(store, val) {
    if (!DB) return;
    try {
      var tx = DB.transaction(store, 'readwrite');
      tx.objectStore(store).put(val);
      tx.onerror = tx.onabort = function () { LCL.emit('fs:error', {}); };
    } catch (e) { LCL.emit('fs:error', {}); }
  }
  function idbDelete(store, key) {
    if (!DB) return;
    try { DB.transaction(store, 'readwrite').objectStore(store).delete(key); } catch (e) { /* ignore */ }
  }
  function idbReadAll(store) {
    return new Promise(function (resolve) {
      if (!DB) return resolve([]);
      var out = [];
      try {
        var req = DB.transaction(store, 'readonly').objectStore(store).openCursor();
        req.onsuccess = function () {
          var c = req.result;
          if (c) { out.push(c.value); c['continue'](); } else resolve(out);
        };
        req.onerror = function () { resolve(out); };
      } catch (e) { resolve(out); }
    });
  }

  /* ---------- helpers ---------- */
  function clean(name) {
    return String(name == null ? '' : name).replace(/[\\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  }
  function put(n) { nodes[n.id] = n; idbPut('nodes', n); return n; }
  function changed(type, id) {
    changeFns.slice().forEach(function (f) { try { f({ type: type, id: id }); } catch (e) { console.error(e); } });
    LCL.emit('fs:change', { type: type, id: id });
  }
  function sampleDrawing() {
    try {
      var c = document.createElement('canvas'); c.width = 640; c.height = 400;
      var x = c.getContext('2d');
      x.fillStyle = '#bfe6ff'; x.fillRect(0, 0, 640, 400);
      x.fillStyle = '#ffd43b'; x.beginPath(); x.arc(520, 90, 50, 0, 7); x.fill();
      x.fillStyle = '#69c46d'; x.beginPath(); x.ellipse(200, 430, 460, 140, 0, 0, 7); x.fill();
      x.fillStyle = '#ffb877'; x.fillRect(150, 200, 160, 120);
      x.fillStyle = '#e8590c'; x.beginPath(); x.moveTo(130, 204); x.lineTo(230, 128); x.lineTo(330, 204); x.closePath(); x.fill();
      x.fillStyle = '#74c0fc'; x.fillRect(188, 244, 44, 44);
      x.fillStyle = '#8d5524'; x.fillRect(260, 250, 36, 70);
      return c.toDataURL('image/png');
    } catch (e) { return null; }
  }
  function add(parent, name, type, kind, data, extra) {
    var now = Date.now();
    var n = { id: uid(), parent: parent, name: name, type: type, created: now, modified: now };
    if (type === 'file') { n.kind = kind; n.data = data; }
    if (extra) Object.keys(extra).forEach(function (k) { n[k] = extra[k]; });
    return put(n);
  }
  function seed() {
    var now = Date.now();
    put({ id: ROOT, parent: null, name: 'This Computer', type: 'folder', system: true, created: now, modified: now });
    put({ id: DESKTOP, parent: ROOT, name: 'Desktop', type: 'folder', system: true, created: now, modified: now });
    put({ id: DOCUMENTS, parent: ROOT, name: 'Documents', type: 'folder', system: true, created: now, modified: now });
    add(DESKTOP, 'Hello', 'file', 'text', 'Hello! Welcome to Little Computer Lab.\nThis is a file. Double-click a file to open it.');
    var box = add(DESKTOP, 'Practice Box', 'folder');
    add(box.id, 'Cat', 'file', 'text', 'Cats say meow!\nThey like to nap in the sun.');
    add(box.id, 'Dog', 'file', 'text', 'Dogs say woof!\nThey love to play fetch.');
    add(box.id, 'Sunny House', 'file', 'drawing', sampleDrawing());
    add(DOCUMENTS, 'My Story', 'file', 'text', 'Once upon a time, a little robot learned to use a computer.');
    var an = add(DOCUMENTS, 'Animals', 'folder');
    add(an.id, 'Fish', 'file', 'text', 'Fish live in the water and can swim.');
    add(an.id, 'Bird', 'file', 'text', 'Birds have wings and some can sing.');
  }

  /* ---------- public API ---------- */
  var VFS = LCL.vfs = {
    ROOT: ROOT, DESKTOP: DESKTOP, DOCUMENTS: DOCUMENTS, persistent: false, clean: clean,

    init: function () {
      return openDB().then(function (d) {
        DB = d;
        VFS.persistent = !!d;
        return Promise.all([idbReadAll('nodes'), idbReadAll('kv')]);
      }).then(function (r) {
        r[0].forEach(function (n) { nodes[n.id] = n; });
        r[1].forEach(function (k) { kv[k.key] = k.value; });
        if (!nodes[ROOT]) seed();
      });
    },
    reset: function () {
      nodes = {}; kv = {};
      return new Promise(function (resolve) {
        if (!DB) return resolve();
        try {
          var tx = DB.transaction(['nodes', 'kv'], 'readwrite');
          tx.objectStore('nodes').clear(); tx.objectStore('kv').clear();
          tx.oncomplete = tx.onerror = tx.onabort = function () { resolve(); };
        } catch (e) { resolve(); }
      });
    },
    onChange: function (fn) {
      changeFns.push(fn);
      return function () { changeFns = changeFns.filter(function (f) { return f !== fn; }); };
    },

    getKV: function (key, def) { return Object.prototype.hasOwnProperty.call(kv, key) ? kv[key] : def; },
    setKV: function (key, val) { kv[key] = val; idbPut('kv', { key: key, value: val }); },

    get: function (id) { return nodes[id] || null; },
    all: function () { return Object.keys(nodes).map(function (k) { return nodes[k]; }); },
    children: function (parentId) {
      return VFS.all().filter(function (n) { return n.parent === parentId; }).sort(function (a, b) {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });
    },
    path: function (id) {
      var out = [], n = nodes[id], guard = 0;
      while (n && guard++ < 50) { out.unshift(n); n = n.parent ? nodes[n.parent] : null; }
      return out;
    },
    pathString: function (id) {
      var p = VFS.path(id);
      return p.length <= 1 ? 'This Computer' : p.slice(1).map(function (n) { return n.name; }).join(' > ');
    },
    isDescendant: function (id, ancestorId) {
      var n = nodes[id], guard = 0;
      while (n && guard++ < 50) { if (n.id === ancestorId) return true; n = n.parent ? nodes[n.parent] : null; }
      return false;
    },
    nameTaken: function (parentId, name, exceptId) {
      var low = name.toLowerCase();
      return VFS.children(parentId).some(function (n) { return n.id !== exceptId && n.name.toLowerCase() === low; });
    },
    uniqueName: function (parentId, name, exceptId) {
      var base = clean(name) || 'New Item', out = base, i = 2;
      while (VFS.nameTaken(parentId, out, exceptId)) out = base + ' (' + (i++) + ')';
      return out;
    },

    createFolder: function (parentId, name) {
      var n = add(parentId, VFS.uniqueName(parentId, name || 'New Folder'), 'folder');
      changed('create', n.id); return n;
    },
    createFile: function (parentId, name, kind, data, extra) {
      var n = add(parentId, VFS.uniqueName(parentId, name || 'New File'), 'file', kind, data, extra);
      changed('create', n.id); return n;
    },
    writeFile: function (id, data) {
      var n = nodes[id]; if (!n) return false;
      n.data = data; n.modified = Date.now(); put(n); changed('write', id); return true;
    },
    rename: function (id, name) {
      var n = nodes[id]; if (!n) return { ok: false, error: 'I cannot find that.' };
      if (n.system) return { ok: false, error: 'This special folder cannot be renamed.' };
      name = clean(name);
      if (!name) return { ok: false, error: 'Please type a name.' };
      if (name === n.name) return { ok: true, changed: false };
      if (VFS.nameTaken(n.parent, name, id)) return { ok: false, error: 'That name is already used here. Try another one!' };
      n.name = name; n.modified = Date.now(); put(n); changed('rename', id);
      return { ok: true, changed: true };
    },
    move: function (id, targetId) {
      var n = nodes[id], t = nodes[targetId];
      if (!n || !t || t.type !== 'folder') return { ok: false, error: 'That is not a folder.' };
      if (n.system) return { ok: false, error: 'This special folder cannot be moved.' };
      if (n.id === targetId || VFS.isDescendant(targetId, id)) return { ok: false, error: 'A folder cannot go inside itself!' };
      if (n.parent === targetId) return { ok: true, same: true, node: n };
      n.parent = targetId; n.name = VFS.uniqueName(targetId, n.name, n.id); n.modified = Date.now();
      put(n); changed('move', id);
      return { ok: true, node: n };
    },
    copy: function (id, targetId) {
      var n = nodes[id], t = nodes[targetId];
      if (!n || !t || t.type !== 'folder') return { ok: false, error: 'That is not a folder.' };
      if (n.id === targetId || VFS.isDescendant(targetId, id)) return { ok: false, error: 'A folder cannot be copied into itself!' };
      function rec(src, parent) {
        var c = {};
        Object.keys(src).forEach(function (k) { c[k] = src[k]; });
        c.id = uid(); c.parent = parent; c.name = VFS.uniqueName(parent, src.name); c.created = c.modified = Date.now();
        delete c.system;
        put(c);
        if (src.type === 'folder') VFS.children(src.id).forEach(function (ch) { if (ch.id !== c.id) rec(ch, c.id); });
        return c;
      }
      var copy = rec(n, targetId);
      changed('copy', copy.id);
      return { ok: true, node: copy };
    },
    remove: function (id) {
      var n = nodes[id]; if (!n) return { ok: false };
      if (n.system) return { ok: false, error: 'This special folder cannot be deleted.' };
      (function rec(x) {
        VFS.children(x.id).forEach(rec);
        delete nodes[x.id]; idbDelete('nodes', x.id);
      })(n);
      changed('remove', id);
      return { ok: true };
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = LCL;
})(typeof window !== 'undefined' ? window : globalThis);
