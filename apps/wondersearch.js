(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el;

  /* ============================================================
     CONFIG: edit the manifest path and options here.
     The manifest lists the JSON data packs to load.
     Each pack is expected to look like:
       { packId, name, version, entries: [ { id, title, description,
         keywords: [..], category, website, page } ] }
     Optional per-entry field: websiteName (friendly site name).
     ============================================================ */
  var CONFIG = {
    manifestUrl: 'data/wondersearch/manifest.json',
    webAppId: 'webexplorer',
    fetchTimeoutMs: 6000,
    maxResults: 8,
    sampleQuery: 'dinosaurs',
    suggestions: ['Dinosaurs', 'Animals', 'Space', 'Ocean'],
    storageKey: 'wondersearch.progress.v1'
  };

  /* Basic synonyms (keys are singular/stemmed, lowercase) */
  var SYNONYMS = {
    dino: ['dinosaur'], trex: ['dinosaur', 't-rex'], 't-rex': ['dinosaur'],
    tyrannosaurus: ['dinosaur', 't-rex'], fossil: ['dinosaur'], jurassic: ['dinosaur'],
    animal: ['creature', 'pet', 'wildlife'], creature: ['animal'], pet: ['animal'],
    wildlife: ['animal'], puppy: ['dog'], kitten: ['cat'], bunny: ['rabbit'],
    space: ['planet', 'star', 'moon', 'rocket', 'galaxy'], planet: ['space'],
    rocket: ['space'], moon: ['space'], star: ['space'], galaxy: ['space'],
    astronaut: ['space', 'rocket'], sun: ['star', 'space'], earth: ['planet'],
    ocean: ['sea', 'fish'], sea: ['ocean'], fish: ['ocean', 'sea'], whale: ['ocean', 'sea'],
    shark: ['ocean', 'fish'], dolphin: ['ocean', 'sea'], octopus: ['ocean', 'sea'],
    beach: ['sea', 'ocean'], underwater: ['ocean', 'sea']
  };

  var STOP = {
    the: 1, a: 1, an: 1, of: 1, and: 1, is: 1, are: 1, to: 1, for: 1, in: 1, on: 1,
    about: 1, me: 1, show: 1, find: 1, what: 1, i: 1, my: 1, with: 1, some: 1, please: 1
  };

  /* Small built-in dataset used only if every external pack fails. */
  var FALLBACK = [
    { id: 'fb-trex', title: 'Meet the T. rex', description: 'Find out how big and strong the T. rex was.', keywords: ['dinosaur', 't-rex', 'big', 'teeth'], category: 'dinosaurs', website: 'dino-world', page: 'trex' },
    { id: 'fb-diplo', title: 'Long-Necked Dinosaurs', description: 'Meet the giant dinosaurs with very long necks.', keywords: ['dinosaur', 'long neck', 'plant eater'], category: 'dinosaurs', website: 'dino-world', page: 'long-necks' },
    { id: 'fb-lion', title: 'Lions: Kings of the Grass', description: 'Learn where lions live and what they eat.', keywords: ['animal', 'lion', 'big cat', 'africa'], category: 'animals', website: 'animal-friends', page: 'lion' },
    { id: 'fb-pets', title: 'Looking After Pets', description: 'How to be kind to cats, dogs and rabbits.', keywords: ['animal', 'pet', 'cat', 'dog', 'rabbit'], category: 'animals', website: 'animal-friends', page: 'pets' },
    { id: 'fb-planets', title: 'The Planets', description: 'Visit all the planets that go around our Sun.', keywords: ['space', 'planet', 'sun', 'solar system'], category: 'space', website: 'space-station', page: 'planets' },
    { id: 'fb-moon', title: 'The Moon', description: 'Why does the Moon change shape in the sky?', keywords: ['space', 'moon', 'night', 'astronaut'], category: 'space', website: 'space-station', page: 'moon' },
    { id: 'fb-whale', title: 'Blue Whales', description: 'The biggest animal in the world lives in the ocean.', keywords: ['ocean', 'sea', 'whale', 'big'], category: 'ocean', website: 'ocean-explorer', page: 'whale' },
    { id: 'fb-reef', title: 'Coral Reefs', description: 'A colourful underwater home for lots of fish.', keywords: ['ocean', 'sea', 'fish', 'coral', 'underwater'], category: 'ocean', website: 'ocean-explorer', page: 'reef' }
  ];

  var STAGES = ['Meet WonderSearch', "Let's Type", 'Find It!', 'Look Around', "Let's Explore", 'Your Turn'];
  var PRAISE = ['Great clicking! ', 'Nice typing! ', 'You found it! ', 'Sharp eyes! ', 'Wonderful! '];
  var LOGO_COLOURS = ['#4c6ef5', '#f03e3e', '#f59f00', '#37b24d', '#ae3ec9', '#1c7ed6', '#f76707', '#e64980', '#0ca678', '#4c6ef5', '#f03e3e', '#f59f00'];
  var CHIP_COLOURS = ['#4c6ef5', '#37b24d', '#f76707', '#ae3ec9', '#e64980', '#0ca678'];

  var BLEEP_SVG =
    '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">' +
    '<line x1="32" y1="6" x2="32" y2="14" stroke="#868e96" stroke-width="3"/>' +
    '<circle cx="32" cy="6" r="4" fill="#ff6b6b"/>' +
    '<rect x="10" y="14" width="44" height="36" rx="12" fill="#74c0fc" stroke="#1c7ed6" stroke-width="3"/>' +
    '<circle cx="23" cy="30" r="6" fill="#fff"/><circle cx="41" cy="30" r="6" fill="#fff"/>' +
    '<circle cx="24" cy="31" r="3" fill="#212529"/><circle cx="42" cy="31" r="3" fill="#212529"/>' +
    '<path d="M23 41 Q32 48 41 41" fill="none" stroke="#1c7ed6" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="18" y="50" width="28" height="8" rx="4" fill="#4dabf7"/></svg>';

  var CSS = [
    '.ws{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;background:#fffdf7;color:#2b2b3a;overflow:hidden;box-sizing:border-box}',
    '.ws *{box-sizing:border-box}',
    '.ws-top{display:flex;align-items:center;gap:8px;padding:6px 10px;background:#f1f3ff;border-bottom:2px solid #dfe3ff;flex-wrap:wrap}',
    '.ws-steps{display:flex;gap:6px;align-items:center}',
    '.ws-dot{width:28px;height:28px;border-radius:50%;border:2px solid #b8c0ff;background:#fff;font-weight:700;font-size:13px;cursor:pointer;color:#4a52b8;padding:0}',
    '.ws-dot.done{background:#51cf66;border-color:#2f9e44;color:#fff}',
    '.ws-dot.cur{background:#4c6ef5;border-color:#364fc7;color:#fff}',
    '.ws-dot[disabled]{opacity:.4;cursor:default}',
    '.ws-steplabel{font-size:13px;font-weight:700;flex:1;min-width:110px}',
    '.ws-main{flex:1;min-height:0;overflow:auto;padding:12px 16px}',
    '.ws-home{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100%;gap:14px;text-align:center}',
    '.ws-logo{font-size:clamp(34px,9vw,60px);font-weight:800;letter-spacing:1px;line-height:1;background:none;border:0;padding:0;font-family:inherit}',
    '.ws-logo-sm{font-size:24px;cursor:pointer;flex:0 0 auto}',
    '.ws-tagline{font-size:clamp(15px,3vw,18px);color:#5c5f77}',
    '.ws-bar{display:flex;align-items:center;gap:8px;width:100%;max-width:600px;background:#fff;border:3px solid #adb5ff;border-radius:40px;padding:5px 5px 5px 16px;cursor:text}',
    '.ws-input{flex:1;min-width:0;border:0;outline:0;font-size:clamp(18px,4vw,24px);background:transparent;padding:8px 0;color:#222;font-family:inherit}',
    '.ws-btn{border-radius:30px;font-size:18px;padding:10px 20px;cursor:pointer;background:#ff922b;color:#fff;border:0;font-weight:700;font-family:inherit}',
    '.ws-btn:hover{background:#f76707}',
    '.ws-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}',
    '.ws-chip{border:3px solid;border-radius:26px;padding:8px 18px;font-size:clamp(15px,3vw,18px);font-weight:700;cursor:pointer;background:#fff;font-family:inherit}',
    '.ws-chip:hover{background:#f8f9fa}',
    '.ws-status{font-size:14px;color:#868e96;min-height:18px}',
    '.ws-rhead{display:flex;align-items:center;gap:14px;margin-bottom:10px;flex-wrap:wrap}',
    '.ws-rhead .ws-bar{flex:1;min-width:220px;max-width:640px}',
    '.ws-list{max-width:700px}',
    '.ws-count{font-size:15px;color:#5c5f77;margin:4px 0 10px}',
    '.ws-notice{background:#fff3bf;border-radius:10px;padding:8px 12px;margin-bottom:10px;font-size:15px}',
    '.ws-explain{display:none;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding:8px;border-radius:12px}',
    '.ws-explain span{border-radius:16px;padding:5px 12px;font-size:14px;font-weight:700}',
    '.ws-card{background:#fff;border:2px solid #e3e6f5;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer}',
    '.ws-card:hover,.ws-card:focus{border-color:#4c6ef5;outline:0;background:#f8f9ff}',
    '.ws-site{display:flex;align-items:center;gap:8px;font-size:14px;color:#2f7d3a;font-weight:700}',
    '.ws-fav{width:24px;height:24px;border-radius:50%;color:#fff;font-size:13px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}',
    '.ws-title{font-size:clamp(18px,3.5vw,22px);color:#1a56db;font-weight:700;margin:4px 0}',
    '.ws-desc{font-size:15px;color:#495057;line-height:1.4}',
    '.ws-msg{padding:18px;border-radius:14px;background:#f1f3ff;font-size:17px;line-height:1.4;margin-bottom:12px}',
    '.ws-bleep{display:flex;align-items:flex-end;gap:10px;padding:8px 12px;background:#fff8e1;border-top:2px solid #ffe8a3}',
    '.ws-bleepimg{flex:0 0 auto;line-height:0}',
    '.ws-bubble{background:#fff;border:2px solid #ffd43b;border-radius:14px;padding:8px 12px;font-size:15px;line-height:1.35;flex:1;min-width:0}',
    '.ws-btitle{font-size:12px;font-weight:800;color:#e67700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}',
    '.ws-act{margin-top:6px;border-radius:20px;padding:6px 16px;font-size:15px;cursor:pointer;background:#4c6ef5;color:#fff;border:0;font-weight:700;font-family:inherit}',
    '.ws-hl{outline:4px solid #ffd43b;outline-offset:3px;box-shadow:0 0 0 8px rgba(255,212,59,.35)}',
    '.ws-compact .ws-bleepimg svg{width:40px;height:40px}',
    '.ws-compact .ws-main{padding:8px 10px}',
    '.ws-compact .ws-btn{padding:8px 14px;font-size:16px}',
    '.ws-compact .ws-dot{width:24px;height:24px;font-size:12px}'
  ].join('\n');

  /* ---------- pure helpers ---------- */

  /* h(tag, class, text, children[], style)
     Defensive: if a style string is passed in the children slot, treat it as the style. */
  function h(tag, cls, text, kids, style) {
    if (typeof kids === 'string') { style = kids; kids = null; }
    var n = el(tag, cls ? { 'class': cls } : {}, []);
    if (text !== null && text !== undefined && text !== '') n.textContent = text;
    if (style) n.setAttribute('style', style);
    if (Array.isArray(kids)) kids.forEach(function (k) { if (k) n.appendChild(k); });
    return n;
  }

  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function str(v, max) { return (typeof v === 'string' || typeof v === 'number') ? String(v).slice(0, max || 300) : ''; }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function pretty(s) { return String(s || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function stem(t) { return (t.length > 3 && /s$/.test(t) && !/ss$/.test(t)) ? t.slice(0, -1) : t; }

  function tokens(q) {
    return String(q || '').toLowerCase().replace(/[.,!?;:"()\[\]{}]/g, ' ').split(/\s+/)
      .filter(function (t) { return t && !STOP[t]; });
  }

  function lev(a, b) {
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }

  /* Turn untrusted pack data into a safe, plain-string entry */
  function normEntry(e, packId) {
    if (!e || typeof e !== 'object') return null;
    var kw = Array.isArray(e.keywords) ? e.keywords : (typeof e.keywords === 'string' ? e.keywords.split(/[,;]+/) : []);
    var o = {
      id: str(e.id, 80),
      title: str(e.title, 120),
      description: str(e.description, 300),
      keywords: kw.map(function (k) { return str(k, 40).toLowerCase().trim(); }).filter(Boolean).slice(0, 30),
      category: str(e.category, 40),
      website: str(e.website, 80),
      page: str(e.page, 80),
      siteName: str(e.websiteName || e.siteName, 60),
      pack: packId || ''
    };
    if (!o.title || !o.website) return null;
    if (!o.id) o.id = o.website + '/' + (o.page || 'home');
    return o;
  }

  /* Supports the combined WonderSearch pack format */
  function parsePack(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.entries)) {
      throw new Error('Bad pack format');
    }

    var pid = str(data.packId, 60);
    var sites = {};

    if (Array.isArray(data.websites)) {
      data.websites.forEach(function (w) {
        if (w && typeof w === 'object' && str(w.id, 80)) {
          sites[str(w.id, 80)] = str(w.name, 60);
        }
      });
    }

    var out = [];
    data.entries.forEach(function (e) {
      var n = normEntry(e, pid);
      if (n) {
        if (!n.siteName) n.siteName = sites[n.website] || '';
        out.push(n);
      }
    });

    return { id: pid, entries: out };
  }

  function fetchJson(url) {
    var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, CONFIG.fetchTimeoutMs) : null;

    return fetch(url, {
      cache: 'no-cache',
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (t) clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function (e) {
      if (t) clearTimeout(t);
      throw e;
    });
  }

  function entryWords(e) {
    var out = [];

    e.keywords.forEach(function (k) {
      out.push(k);
      k.split(/[\s]+/).forEach(function (p) {
        if (p) out.push(p);
      });
    });

    tokens(e.title).forEach(function (t) { out.push(t); });
    if (e.category) out.push(e.category.toLowerCase());

    return out.map(stem);
  }

  function scoreEntry(e, terms) {
    var kws = entryWords(e);
    var titleWords = tokens(e.title).map(stem);
    var cat = stem(e.category.toLowerCase());
    var desc = e.description.toLowerCase();
    var total = 0;

    terms.forEach(function (t) {
      var x = t.term, sc = 0;

      if (kws.indexOf(x) > -1) sc = Math.max(sc, 6);
      if (titleWords.indexOf(x) > -1) sc = Math.max(sc, 5);
      if (cat === x) sc = Math.max(sc, 3);

      if (x.length >= 3) {
        kws.forEach(function (k) {
          if (k.indexOf(x) === 0 || (k.length >= 3 && x.indexOf(k) === 0)) {
            sc = Math.max(sc, 3.5);
          } else if (k.indexOf(x) > -1) {
            sc = Math.max(sc, 2);
          }
        });

        titleWords.forEach(function (w) {
          if (w.indexOf(x) === 0) sc = Math.max(sc, 3);
        });

        if (desc.indexOf(x) > -1) sc = Math.max(sc, 1);
      }

      total += sc * t.weight;
    });

    return total;
  }

  function buildTerms(toks) {
    var seen = {}, out = [];

    function add(x, w) {
      if (!x || seen[x]) return;
      seen[x] = 1;
      out.push({ term: x, weight: w });
    }

    toks.forEach(function (t) {
      var s = stem(t);
      add(s, 1);
      (SYNONYMS[s] || SYNONYMS[t] || []).forEach(function (syn) {
        add(stem(syn), 0.7);
      });
    });

    return out;
  }

  /* ============================================================
     The app
     ============================================================ */
  LCL.registerApp({
    id: 'wondersearch',
    title: 'WonderSearch',
    icon: 'wondersearch',
    w: 760,
    h: 560,
    minW: 380,
    minH: 360,
    help: 'Hi, I am Bleep! Let me show you how to search for things.',

    mount: function (root, ctx) {
      var S = {
        view: 'home',
        query: '',
        lastGood: '',
        firstQuery: null,
        tutorial: true,
        stage: 0,
        done: [false, false, false, false, false, false],
        praise: '',
        hint: false,
        justDone: false,
        extra: '',
        loadState: 'loading',
        failed: 0,
        entries: [],
        vocab: [],
        res: [],
        hasResults: false,
        destroyed: false,
        els: {}
      };

      /* ---------- progress persistence ---------- */
      function load() {
        try {
          var d = JSON.parse(localStorage.getItem(CONFIG.storageKey) || 'null');
          if (d && Array.isArray(d.done) && d.done.length === 6) {
            S.done = d.done.map(Boolean);
          }
        } catch (e) { /* ignore */ }

        var first = S.done.indexOf(false);
        S.stage = first === -1 ? 5 : first;
      }

      function save() {
        try {
          localStorage.setItem(CONFIG.storageKey, JSON.stringify({ done: S.done }));
        } catch (e) { /* ignore */ }
      }

      /* ---------- data packs ---------- */
      function buildIndex() {
        var v = {};

        S.entries.forEach(function (e) {
          entryWords(e).forEach(function (w) {
            if (w.indexOf(' ') < 0) v[w] = 1;
          });
        });

        Object.keys(SYNONYMS).forEach(function (k) { v[k] = 1; });
        S.vocab = Object.keys(v);
      }

      function loadPacks() {
        S.loadState = 'loading';

        /*
         * Resolve the manifest from the site root (document.baseURI), then
         * resolve each pack file relative to the manifest itself. This works
         * on GitHub Pages project sites such as /Tiny-Desktop/ as well as
         * when the project is served locally.
         */
        var manifestUrl = new URL(CONFIG.manifestUrl, document.baseURI);

        fetchJson(manifestUrl.href).then(function (manifest) {
          var list = Array.isArray(manifest)
            ? manifest
            : (manifest && typeof manifest === 'object' && Array.isArray(manifest.packs) ? manifest.packs : null);

          if (!list) {
            throw new Error('Bad manifest format: expected a packs array');
          }

          var enabledPacks = list.map(function (p) {
            return typeof p === 'string' ? { file: p } : p;
          }).filter(function (p) {
            return p && typeof p === 'object' && p.enabled !== false &&
              (typeof p.file === 'string' || typeof p.url === 'string');
          });

          var jobs = enabledPacks.map(function (pack) {
            var file = pack.file || pack.url;
            var packUrl;

            try {
              packUrl = new URL(file, manifestUrl);
            } catch (err) {
              if (window.console) console.warn('[WonderSearch] invalid pack path', file, err);
              return Promise.resolve(null);
            }

            return fetchJson(packUrl.href).then(parsePack).catch(function (err) {
              if (window.console) console.warn('[WonderSearch] could not load pack', pack.id || file, err);
              return null;
            });
          });

          return Promise.all(jobs);
        }).catch(function (err) {
          if (window.console) console.warn('[WonderSearch] could not load manifest', manifestUrl.href, err);
          return [];
        }).then(function (packs) {
          if (S.destroyed) return;

          var ok = packs.filter(Boolean), all = [], seen = {};
          S.failed = packs.length - ok.length;

          ok.forEach(function (p) {
            p.entries.forEach(function (e) {
              if (!seen[e.id]) {
                seen[e.id] = 1;
                all.push(e);
              }
            });
          });

          if (!all.length) {
            all = FALLBACK.map(function (e) {
              return normEntry(e, 'fallback');
            }).filter(Boolean);

            S.loadState = 'fallback';
          } else {
            S.loadState = 'ready';
          }

          S.entries = all;
          buildIndex();

          if (S.els.status) S.els.status.textContent = statusText();
          if (S.view === 'results') {
            fillResults();
            refresh();
          }
        });
      }

      function statusText() {
        if (S.loadState === 'loading') return 'Getting WonderSearch ready…';
        if (S.loadState === 'fallback') {
          return 'I could not reach my big library, so I am using a few of my own books today.';
        }
        if (S.failed > 0) return 'A few pages did not load, but you can still search!';
        return '';
      }

      /* ---------- searching ---------- */
      function rank(toks) {
        var terms = buildTerms(toks), scored = [];

        S.entries.forEach(function (e) {
          var s = scoreEntry(e, terms);
          if (s > 0) scored.push({ e: e, s: s });
        });

        scored.sort(function (a, b) {
          return b.s - a.s || (a.e.title < b.e.title ? -1 : 1);
        });

        return scored.slice(0, CONFIG.maxResults).map(function (x) { return x.e; });
      }

      function correct(t) {
        var s = stem(t);

        if (SYNONYMS[s] || S.vocab.indexOf(s) > -1) return s;
        if (s.length >= 3 && S.vocab.some(function (w) { return w.indexOf(s) === 0; })) return s;

        var maxD = s.length <= 4 ? 1 : 2, best = null, bestD = 99;

        S.vocab.forEach(function (w) {
          if (Math.abs(w.length - s.length) > maxD) return;

          var d = lev(s, w);
          if (d <= maxD && d < bestD) {
            best = w;
            bestD = d;
          }
        });

        return best;
      }

      function search(q) {
        var toks = tokens(q);
        if (!toks.length) return { results: [], corrected: null };

        var r = rank(toks);
        if (r.length) return { results: r, corrected: null };

        var fixed = [], changed = false;

        toks.forEach(function (t) {
          var c = correct(t);

          if (c && c !== stem(t)) {
            changed = true;
            fixed.push(c);
          } else {
            fixed.push(t);
          }
        });

        if (changed) {
          r = rank(fixed);
          if (r.length) return { results: r, corrected: fixed.join(' ') };
        }

        return { results: [], corrected: null };
      }

      /* ---------- Bleep + guide ---------- */
      function say(text, title, action) {
        S.els.bTitle.textContent = title || 'Bleep says';
        S.els.bText.textContent = text;
        clear(S.els.bAct);

        if (action) {
          var b = h('button', 'ws-act', action.text);
          b.type = 'button';
          b.addEventListener('click', action.fn);
          S.els.bAct.appendChild(b);
        }
      }

      function gentle(text) {
        say(text, 'No worries!');
      }

      function stageMessage() {
        var st = S.stage;

        switch (st) {
          case 0:
            return {
              t: 'Hi, I am Bleep! This big white box is the search bar. Click inside it to begin.'
            };

          case 1:
            return {
              t: 'Now type a word with the keyboard. Try dinosaurs, space or ocean!'
            };

          case 2:
            return {
              t: 'Press the orange Search button, or press the Enter key, to find it.'
            };

          case 3:
            if (S.loadState === 'loading') {
              return {
                t: 'One moment, I am still looking for pages…'
              };
            }

            if (!S.hasResults) {
              return {
                t: 'Hmm, I could not find pages for that word. Try another word, like dinosaurs.'
              };
            }

            return {
              t: 'Look! Each box is a page you can visit. The blue words are the title, the green name is the website, and the grey words tell you what is inside.',
              a: {
                text: 'I see them!',
                fn: function () { complete(3); }
              }
            };

          case 4:
            return {
              t: 'Now pick a page that looks fun. Click anywhere on its card!'
            };

          default:
            if (S.justDone) {
              return {
                t: 'You did it all by yourself! You are a WonderSearch star! Keep searching anything you like.',
                title: 'Hooray!'
              };
            }

            if (S.hint) {
              return {
                t: 'Hint: type a topic you like (not the same word as before), press Search, then click a card.'
              };
            }

            return {
              t: 'Your turn! Search for something new, then open a page you like.',
              a: {
                text: 'Need a hint?',
                fn: function () {
                  S.hint = true;
                  refresh();
                }
              }
            };
        }
      }

      function renderProgress() {
        var wrap = S.els.steps;
        clear(wrap);

        S.els.guideBtn.textContent = S.tutorial ? 'Guide: On' : 'Guide: Off';

        if (!S.tutorial) {
          S.els.stepLabel.textContent = 'Free search';
          return;
        }

        var reach = S.done.indexOf(false);
        if (reach === -1) reach = 5;

        STAGES.forEach(function (name, i) {
          var b = h(
            'button',
            'ws-dot' + (S.done[i] ? ' done' : '') + (i === S.stage ? ' cur' : ''),
            S.done[i] && i !== S.stage ? '✓' : String(i + 1)
          );

          b.type = 'button';
          b.setAttribute('aria-label', 'Stage ' + (i + 1) + ': ' + name);
          b.title = name;

          if (i > reach) {
            b.disabled = true;
          } else {
            b.addEventListener('click', function () { goStage(i); });
          }

          wrap.appendChild(b);
        });

        S.els.stepLabel.textContent = 'Stage ' + (S.stage + 1) + ' of 6: ' + STAGES[S.stage];
      }

      function applyHighlight() {
        var old = root.querySelectorAll('.ws-hl'), i;

        for (i = 0; i < old.length; i++) {
          old[i].classList.remove('ws-hl');
        }

        if (!S.tutorial) return;

        var t = null;

        switch (S.stage) {
          case 0:
          case 1:
            t = S.els.bar;
            break;
          case 2:
            t = S.els.btn;
            break;
          case 3:
            t = S.els.chips;
            break;
          case 4:
            t = S.els.firstCard;
            break;
        }

        if (t && t.style.display !== 'none') {
          t.classList.add('ws-hl');
        }
      }

      function refresh() {
        if (S.destroyed) return;

        renderProgress();

        if (S.els.chips) {
          S.els.chips.style.display =
            (S.tutorial && S.stage === 3 && S.hasResults) ? 'flex' : 'none';
        }

        applyHighlight();

        if (!S.tutorial) {
          say(
            S.view === 'home'
              ? 'Type a word and press Search. Try Dinosaurs, Space or Ocean!'
              : 'Click any result card to visit that website.',
            'Bleep says'
          );
        } else {
          var m = stageMessage();

          say(
            (S.praise || '') + m.t + (S.extra ? ' ' + S.extra : ''),
            m.title || ('Stage ' + (S.stage + 1)),
            m.a
          );
        }

        S.praise = '';
        S.extra = '';
      }

      function complete(i) {
        if (!S.tutorial || S.stage !== i) return;

        S.done[i] = true;
        S.hint = false;

        if (i < 5) {
          S.stage = i + 1;
          S.praise = PRAISE[i % PRAISE.length];
        } else {
          S.justDone = true;
          LCL.emit('wondersearch:challenge_completed', { query: S.query });
        }

        save();
        refresh();
      }

      function goStage(i) {
        S.stage = i;
        S.hint = false;
        S.praise = '';
        S.justDone = false;

        if (i === 3 || i === 4) {
          showResults(S.lastGood || CONFIG.sampleQuery);
        } else {
          showHome();
        }
      }

      /* ---------- views ---------- */
      function buildLogo(small) {
        var logo = h(small ? 'button' : 'div', 'ws-logo' + (small ? ' ws-logo-sm' : ''));

        'WonderSearch'.split('').forEach(function (c, i) {
          logo.appendChild(
            h('span', '', c, null, 'color:' + LOGO_COLOURS[i % LOGO_COLOURS.length])
          );
        });

        if (small) {
          logo.type = 'button';
          logo.setAttribute('aria-label', 'WonderSearch home');
          logo.addEventListener('click', showHome);
        }

        return logo;
      }

      function buildBar(prefill) {
        var bar = h('div', 'ws-bar');
        var input = document.createElement('input');

        input.type = 'text';
        input.className = 'ws-input';
        input.setAttribute('placeholder', 'Type here…');
        input.setAttribute('aria-label', 'Search');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('maxlength', '60');
        input.value = prefill || '';

        var btn = h('button', 'btn primary ws-btn', 'Search');
        btn.type = 'button';

        bar.appendChild(input);
        bar.appendChild(btn);

        bar.addEventListener('click', function (e) {
          if (e.target !== btn) input.focus();
        });

        input.addEventListener('focus', function () {
          LCL.emit('wondersearch:focused');

          if (S.tutorial && S.stage === 0) {
            complete(0);
          }
        });

        input.addEventListener('input', function () {
          if (S.tutorial && S.stage === 1 && input.value.trim().length >= 1) {
            complete(1);
          }
        });

        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            runSearch(input.value);
          }
        });

        btn.addEventListener('click', function () {
          runSearch(input.value);
        });

        S.els.bar = bar;
        S.els.input = input;
        S.els.btn = btn;

        return bar;
      }

      function buildChips() {
        var wrap = h('div', 'ws-chips');

        CONFIG.suggestions.forEach(function (w, i) {
          var c = h(
            'button',
            'ws-chip',
            w,
            null,
            'color:' + CHIP_COLOURS[i % CHIP_COLOURS.length] +
            ';border-color:' + CHIP_COLOURS[i % CHIP_COLOURS.length]
          );

          c.type = 'button';

          c.addEventListener('click', function () {
            if (S.tutorial && S.stage < 2) {
              gentle('Let us go step by step. First click the search bar and type a word ourselves!');
              return;
            }

            if (S.els.input) S.els.input.value = w;
            runSearch(w);
          });

          wrap.appendChild(c);
        });

        return wrap;
      }

      function showHome() {
        S.view = 'home';
        S.els.chips = null;
        S.els.firstCard = null;
        S.els.list = null;

        clear(S.els.main);

        var status = h('div', 'ws-status', statusText());
        S.els.status = status;

        S.els.main.appendChild(
          h('div', 'ws-home', null, [
            buildLogo(false),
            h('div', 'ws-tagline', 'Search to find fun things!'),
            buildBar(''),
            buildChips(),
            status
          ])
        );

        refresh();
      }

      function showResults(q) {
        S.view = 'results';
        S.query = q;
        S.els.status = null;

        clear(S.els.main);

        S.els.list = h('div', 'ws-list');

        S.els.main.appendChild(
          h('div', 'ws-rhead', null, [
            buildLogo(true),
            buildBar(q)
          ])
        );

        S.els.main.appendChild(S.els.list);

        fillResults();
        refresh();
      }

      function fillResults() {
        var list = S.els.list;
        if (!list) return;

        clear(list);

        S.hasResults = false;
        S.els.chips = null;
        S.els.firstCard = null;

        if (S.loadState === 'loading') {
          list.appendChild(h('div', 'ws-msg', 'Searching… one moment please!'));
          return;
        }

        var out = search(S.query);
        S.res = out.results;
        var q = S.query;

        if (S.loadState === 'fallback') {
          list.appendChild(
            h('div', 'ws-notice', 'I could not reach my big library, so these come from my small backup books.')
          );
        }

        if (!out.results.length) {
          list.appendChild(
            h('div', 'ws-msg', 'Oh! I could not find anything for “' + q + '”. Check the spelling, or try a different word like Dinosaurs or Space.')
          );

          list.appendChild(buildChips());

          LCL.emit('wondersearch:results_viewed', { query: q, count: 0 });
          return;
        }

        S.hasResults = true;
        S.lastGood = q;

        if (out.corrected) {
          list.appendChild(
            h('div', 'ws-notice', 'I fixed a spelling for you. Here is what I found for “' + out.corrected + '”.')
          );
        }

        var n = out.results.length;

        list.appendChild(
          h('div', 'ws-count', 'I found ' + n + (n === 1 ? ' page' : ' pages') + ' for “' + (out.corrected || q) + '”')
        );

        var explain = h('div', 'ws-explain', null, [
          h('span', '', '1. Title: what the page is', null, 'background:#dbe4ff;color:#1a56db'),
          h('span', '', '2. Website: where it lives', null, 'background:#d3f9d8;color:#2f7d3a'),
          h('span', '', '3. Words: what is inside', null, 'background:#e9ecef;color:#495057')
        ]);

        S.els.chips = explain;
        list.appendChild(explain);

        out.results.forEach(function (r, i) {
          var card = buildCard(r);

          if (i === 0) S.els.firstCard = card;
          list.appendChild(card);
        });

        LCL.emit('wondersearch:results_viewed', { query: q, count: n });
      }

      function buildCard(r) {
        var site = r.siteName || pretty(r.website);
        var colour = CHIP_COLOURS[(r.website.length + r.website.charCodeAt(0)) % CHIP_COLOURS.length];

        var card = h('div', 'ws-card', null, [
          h('div', 'ws-site', null, [
            h('span', 'ws-fav', site.charAt(0).toUpperCase(), null, 'background:' + colour),
            h('span', '', site + (r.page ? '  ›  ' + pretty(r.page) : ''))
          ]),
          h('div', 'ws-title', r.title),
          h('div', 'ws-desc', r.description)
        ]);

        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', r.title + ' on ' + site);

        card.addEventListener('click', function () {
          openResult(r);
        });

        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openResult(r);
          }
        });

        return card;
      }

      /* ---------- actions ---------- */
      function runSearch(raw) {
        var q = String(raw || '').replace(/\s+/g, ' ').trim();

        if (!q) {
          gentle(
            S.tutorial && S.stage === 0
              ? 'First, click inside the big white box. Then we can type!'
              : 'The box is empty! Click it, type a word, then press Search.'
          );
          return;
        }

        if (S.tutorial && S.stage < 2) {
          gentle('Nice try! Let us go step by step. Click the search bar and type a word first.');
          return;
        }

        var was = S.stage;
        S.justDone = false;

        LCL.emit('wondersearch:searched', { query: q });
        showResults(q);

        if (S.tutorial) {
          if (was === 2) {
            S.firstQuery = norm(q);
            complete(2);
          } else if (was === 5 && S.firstQuery && norm(q) === S.firstQuery) {
            gentle('That is the same word as before. Try a brand-new topic!');
          }
        }
      }

      function explorerAvailable() {
        var id = CONFIG.webAppId;

        try {
          if (typeof LCL.hasApp === 'function') return !!LCL.hasApp(id);
          if (typeof LCL.getApp === 'function') return !!LCL.getApp(id);

          var reg = LCL.apps || LCL.registry;

          if (Array.isArray(reg)) {
            return reg.some(function (a) { return a && a.id === id; });
          }

          if (reg && typeof reg.has === 'function') return !!reg.has(id);
          if (reg && typeof reg === 'object') return id in reg;
        } catch (e) { /* fall through */ }

        return null;
      }

      function launchExplorer(detail) {
        if (explorerAvailable() === false) return false;

        try {
          LCL.openApp(CONFIG.webAppId, detail);
          return true;
        } catch (e) {
          if (window.console) {
            console.warn('[WonderSearch] could not open Web Explorer', e);
          }
          return false;
        }
      }

      function openResult(r) {
        if (S.tutorial) {
          if (S.stage === 3) {
            gentle('Good thinking! First let us look at the results together. Press “I see them!” when you are ready.');
            return;
          }

          if (S.stage === 5 && S.firstQuery && norm(S.query) === S.firstQuery) {
            gentle('Try a brand-new word first. Then pick a page!');
            return;
          }
        }

        var detail = {
          id: r.id,
          website: r.website,
          page: r.page,
          title: r.title,
          query: S.query,
          from: 'wondersearch'
        };

        LCL.emit('wondersearch:result_selected', detail);

        var ok = launchExplorer(detail);

        if (!ok) {
          S.extra = 'You picked “' + r.title + '”! The Web Explorer is not ready yet, so we cannot visit it today.';
        }

        if (S.tutorial && (S.stage === 4 || S.stage === 5)) {
          complete(S.stage);
        } else {
          refresh();
        }
      }

      /* ---------- skeleton ---------- */
      if (!document.getElementById('ws-style')) {
        var st = document.createElement('style');
        st.id = 'ws-style';
        st.textContent = CSS;
        document.head.appendChild(st);
      }

      var wrap = h('div', 'ws');
      var top = h('div', 'ws-top');

      S.els.steps = h('div', 'ws-steps');
      S.els.stepLabel = h('div', 'ws-steplabel');
      S.els.guideBtn = h('button', 'btn', 'Guide: On');

      S.els.guideBtn.type = 'button';

      S.els.guideBtn.addEventListener('click', function () {
        S.tutorial = !S.tutorial;
        S.hint = false;
        S.praise = '';
        refresh();
      });

      top.appendChild(S.els.steps);
      top.appendChild(S.els.stepLabel);
      top.appendChild(S.els.guideBtn);

      S.els.main = h('div', 'ws-main');

      var bleepImg = h('div', 'ws-bleepimg');
      bleepImg.innerHTML = BLEEP_SVG;

      S.els.bTitle = h('div', 'ws-btitle', 'Bleep says');
      S.els.bText = h('div', 'ws-btext');
      S.els.bAct = h('div', 'ws-bact');

      var bleep = h('div', 'ws-bleep', null, [
        bleepImg,
        h('div', 'ws-bubble', null, [
          S.els.bTitle,
          S.els.bText,
          S.els.bAct
        ])
      ]);

      bleep.setAttribute('aria-live', 'polite');

      wrap.appendChild(top);
      wrap.appendChild(S.els.main);
      wrap.appendChild(bleep);

      root.appendChild(wrap);

      function fit() {
        wrap.classList.toggle('ws-compact', wrap.clientWidth < 520);
      }

      load();
      showHome();
      fit();
      loadPacks();

      return {
        onOpen: function (args) {
          fit();

          if (args && typeof args.query === 'string' && args.query.trim()) {
            if (S.tutorial && S.stage < 2) {
              refresh();
              return;
            }

            runSearch(args.query);
          } else {
            refresh();
          }
        },

        onResize: function () {
          fit();
        },

        destroy: function () {
          S.destroyed = true;

          if (wrap.parentNode) {
            wrap.parentNode.removeChild(wrap);
          }

          if (!document.querySelector('.ws')) {
            var s = document.getElementById('ws-style');

            if (s && s.parentNode) {
              s.parentNode.removeChild(s);
            }
          }
        }
      };
    }
  });
})();