/* apps/robot.js — My Robot, My Computer (Years 1-2) */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs;
  var KEY = 'robot';
  var EMPTY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  var PRAISE = ['Brilliant!', 'Well done!', 'Super!', 'Fantastic!', 'You did it!'];
  var ORDER = ['build', 's2-click', 's2-pic', 's2-folder', 's2-quiz', 's3-f1', 's3-f2', 's3-move1', 's3-move2',
    's3-robot', 's3-look', 's3-find', 's4-copy', 's4-paste', 's4-see', 's4-quiz', 'done'];
  var COLOURS = [
    { n: 'Blue', m: '#4aa3ff', d: '#2b6fd0', l: '#a9d6ff' },
    { n: 'Red', m: '#ff6b6b', d: '#c94444', l: '#ffc0c0' },
    { n: 'Green', m: '#3ecf8e', d: '#1f9a68', l: '#a6f0cf' },
    { n: 'Purple', m: '#a07bff', d: '#7650d4', l: '#d3c2ff' },
    { n: 'Orange', m: '#ffae3d', d: '#d9840f', l: '#ffd9a0' }
  ];
  var COUNTS = { head: 4, body: 4, eyes: 4, limbs: 4, acc: 5, colour: 5 };
  var LABELS = {
    head: ['Square head', 'Round head', 'Dome head', 'Diamond head'],
    body: ['Box body', 'Round body', 'Triangle body', 'Pill body'],
    eyes: ['Round eyes', 'One big eye', 'Happy eyes', 'Square eyes'],
    limbs: ['Straight arms and legs', 'Springy arms and legs', 'Ball hands and boots', 'Wheel'],
    acc: ['Nothing', 'Antenna', 'Top hat', 'Star badge', 'Bow tie'],
    colour: ['Blue', 'Red', 'Green', 'Purple', 'Orange']
  };
  var VIEWS = { head: '40 14 120 110', body: '40 100 120 120', eyes: '58 42 84 56', limbs: '20 110 160 140', acc: '40 0 120 120' };
  var GUIDE = { head: 1, body: 1, eyes: 2, limbs: 2, acc: 1, colour: 2, name: 'Sparky' };

  var TASKS = {
    'build': 'Welcome to the Robot Workshop! Pick parts to build your robot. Then give it a name.',
    'redo': 'This is your robot. Change anything you like. Then press Save Robot.',
    's2-click': 'Your robot is now a picture file! A file is something saved on a computer. Click your robot, then press Open.',
    's2-pic': 'Well done! Now click the Sunny Day picture and press Open.',
    's2-folder': 'A folder is a place where we keep files. Click Surprise Box and press Open.',
    's2-folder-in': 'Look! This folder has lots of files inside. A folder can keep many files.',
    's2-quiz': 'Choose the best answer.',
    's3-f1': 'The Desktop is messy! Let us tidy up. Press New Folder and type My Robots.',
    's3-f2': 'Lovely! Make one more folder. Call it My Pictures.',
    's3-move1': 'Moving means taking something from one place and putting it somewhere else. Drag Sunny Day into My Pictures.',
    's3-move2': 'Brilliant! Now drag Big Tree into My Pictures too.',
    's3-robot': 'Now drag your robot into My Robots.',
    's3-look': 'Look at the Desktop. Your robot is not here now! Moving takes a file out of the old place.',
    's3-find': 'Open My Robots and click your robot to find it again.',
    's4-copy': 'Your friend wants a copy of your robot, but you want to keep yours too! Click your robot, then press Copy.',
    's4-paste': 'Now open the Friend Box folder and press Paste.',
    's4-see': 'Copying makes another version. The original stays where it was!',
    's4-quiz': 'Move or copy? Choose the best one.',
    'done': 'You are a Robot Creator and File Explorer! Try moving and copying your files.'
  };

  var QUIZ = {
    s2: [
      { q: 'What is a file?', o: ['Something saved on a computer', 'A kind of fruit', 'A computer mouse'], a: 0, h: 'Think about your robot picture. It was saved on the computer.' },
      { q: 'What is a folder?', o: ['A noisy speaker', 'A place where we keep files', 'A robot hat'], a: 1, h: 'Think about the Surprise Box. What was inside it?' },
      { q: 'Can a folder hold lots of files?', o: ['Yes, lots!', 'No, only one'], a: 0, h: 'Remember the Surprise Box. It had more than one file.' }
    ],
    s4: [
      { q: 'You want your picture in a new folder, and out of the old one.', o: ['Move', 'Copy'], a: 0, h: 'Does the picture stay in the old folder, or go away?' },
      { q: 'Your friend wants the same picture, but you want to keep yours.', o: ['Move', 'Copy'], a: 1, h: 'You need two pictures. One for you, one for your friend.' },
      { q: 'You want a document in two places.', o: ['Move', 'Copy'], a: 1, h: 'Two places means we need two documents.' }
    ]
  };

  var SAMPLES = {
    sun: { name: 'Sunny Day', svg: '<rect width="640" height="400" fill="#8fd3ff"/><circle cx="500" cy="90" r="55" fill="#ffd93d"/><path d="M0 300 Q160 220 320 290 T640 280 V400 H0Z" fill="#5ccf6a"/><rect x="120" y="250" width="8" height="60" fill="#3a9d48"/><circle cx="124" cy="244" r="16" fill="#ff6b9a"/><ellipse cx="150" cy="80" rx="60" ry="24" fill="#fff"/>' },
    tree: { name: 'Big Tree', svg: '<rect width="640" height="400" fill="#dff3ff"/><rect y="320" width="640" height="80" fill="#6fd070"/><rect x="290" y="180" width="60" height="150" rx="8" fill="#8b5a2b"/><circle cx="320" cy="150" r="105" fill="#3fb85a"/><circle cx="240" cy="205" r="65" fill="#4cc766"/><circle cx="400" cy="205" r="65" fill="#4cc766"/><circle cx="300" cy="120" r="14" fill="#ff6b6b"/><circle cx="350" cy="165" r="14" fill="#ff6b6b"/>' },
    fish: { name: 'Happy Fish', svg: '<rect width="640" height="400" fill="#4db6ea"/><ellipse cx="300" cy="200" rx="120" ry="75" fill="#ffa63d"/><polygon points="410,200 520,130 520,270" fill="#ff8a1f"/><circle cx="240" cy="180" r="16" fill="#fff"/><circle cx="244" cy="180" r="7" fill="#222"/><path d="M215 225 Q245 250 275 225" fill="none" stroke="#c0570b" stroke-width="7" stroke-linecap="round"/><circle cx="120" cy="90" r="14" fill="#fff" opacity=".6"/><circle cx="90" cy="150" r="9" fill="#fff" opacity=".6"/><rect y="360" width="640" height="40" fill="#e9d38b"/>' },
    rainbow: { name: 'Rainbow', svg: '<rect width="640" height="400" fill="#d4efff"/><circle cx="320" cy="340" r="250" fill="none" stroke="#ff5d5d" stroke-width="30"/><circle cx="320" cy="340" r="220" fill="none" stroke="#ffb13d" stroke-width="30"/><circle cx="320" cy="340" r="190" fill="none" stroke="#ffe14a" stroke-width="30"/><circle cx="320" cy="340" r="160" fill="none" stroke="#4cd37b" stroke-width="30"/><circle cx="320" cy="340" r="130" fill="none" stroke="#4aa3ff" stroke-width="30"/><rect y="340" width="640" height="60" fill="#6fd070"/><ellipse cx="90" cy="335" rx="80" ry="34" fill="#fff"/><ellipse cx="550" cy="335" rx="80" ry="34" fill="#fff"/>' }
  };

  var MONITOR_SVG = '<svg viewBox="0 0 340 300" aria-hidden="true"><rect x="10" y="10" width="320" height="220" rx="24" fill="#3a4456"/><rect x="26" y="26" width="288" height="188" rx="14" fill="#7fd0ff"/><rect x="44" y="44" width="34" height="26" rx="6" fill="#ffd93d"/><rect x="44" y="90" width="34" height="26" rx="6" fill="#ffd93d"/><rect x="150" y="230" width="40" height="30" fill="#3a4456"/><rect x="100" y="256" width="140" height="18" rx="9" fill="#3a4456"/></svg>';
  var GEARS = '<svg class="rb-gearsvg" viewBox="0 0 400 200" aria-hidden="true"><g class="rb-g1"><circle cx="60" cy="60" r="38" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="14" stroke-dasharray="11 8"/></g><g class="rb-g2"><circle cx="340" cy="120" r="30" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="12" stroke-dasharray="9 7"/></g></svg>';

  /* ---------- drawing the robot ---------- */
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cleanDesign(x) {
    var d = { head: 0, body: 0, eyes: 0, limbs: 0, acc: 1, colour: 0, name: '' }, k, n;
    if (x && typeof x === 'object') {
      for (k in COUNTS) { n = parseInt(x[k], 10); if (n >= 0 && n < COUNTS[k]) { d[k] = n; } }
      d.name = typeof x.name === 'string' ? x.name.slice(0, 12) : '';
    }
    return d;
  }
  function limbsSVG(st, M, D, G, K) {
    var s = '';
    if (st === 0) {
      s += '<rect x="36" y="124" width="16" height="58" rx="8" fill="' + M + '" stroke="' + D + '" stroke-width="3"/><rect x="148" y="124" width="16" height="58" rx="8" fill="' + M + '" stroke="' + D + '" stroke-width="3"/>';
      s += '<rect x="72" y="198" width="18" height="34" rx="6" fill="' + G + '"/><rect x="110" y="198" width="18" height="34" rx="6" fill="' + G + '"/>';
      s += '<rect x="64" y="228" width="34" height="12" rx="6" fill="' + K + '"/><rect x="102" y="228" width="34" height="12" rx="6" fill="' + K + '"/>';
    } else if (st === 1) {
      s += '<g fill="none" stroke="' + G + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">';
      s += '<polyline points="58,130 44,140 64,150 44,160 64,170"/><polyline points="142,130 156,140 136,150 156,160 136,170"/>';
      s += '<polyline points="80,198 70,207 90,216 70,225 90,234"/><polyline points="120,198 110,207 130,216 110,225 130,234"/></g>';
      s += '<circle cx="62" cy="178" r="8" fill="' + M + '"/><circle cx="138" cy="178" r="8" fill="' + M + '"/>';
      s += '<ellipse cx="80" cy="239" rx="13" ry="6" fill="' + K + '"/><ellipse cx="120" cy="239" rx="13" ry="6" fill="' + K + '"/>';
    } else if (st === 2) {
      s += '<rect x="44" y="128" width="10" height="44" rx="5" fill="' + G + '"/><rect x="146" y="128" width="10" height="44" rx="5" fill="' + G + '"/>';
      s += '<circle cx="49" cy="178" r="11" fill="' + M + '" stroke="' + D + '" stroke-width="3"/><circle cx="151" cy="178" r="11" fill="' + M + '" stroke="' + D + '" stroke-width="3"/>';
      s += '<rect x="76" y="198" width="12" height="28" rx="5" fill="' + G + '"/><rect x="112" y="198" width="12" height="28" rx="5" fill="' + G + '"/>';
      s += '<ellipse cx="82" cy="232" rx="16" ry="9" fill="' + M + '" stroke="' + D + '" stroke-width="3"/><ellipse cx="118" cy="232" rx="16" ry="9" fill="' + M + '" stroke="' + D + '" stroke-width="3"/>';
    } else {
      s += '<rect x="38" y="124" width="14" height="50" rx="7" fill="' + G + '"/><rect x="148" y="124" width="14" height="50" rx="7" fill="' + G + '"/>';
      s += '<circle cx="45" cy="177" r="9" fill="' + K + '"/><circle cx="155" cy="177" r="9" fill="' + K + '"/>';
      s += '<rect x="92" y="198" width="16" height="12" fill="' + G + '"/><circle cx="100" cy="228" r="22" fill="' + K + '"/><circle cx="100" cy="228" r="9" fill="' + G + '"/><circle cx="100" cy="228" r="3" fill="' + K + '"/>';
    }
    return s;
  }
  function robotInner(d) {
    var c = COLOURS[d.colour], M = c.m, D = c.d, L = c.l, G = '#cdd5e1', K = '#3a4456', E = '#bff7ff';
    var st = 'fill="' + M + '" stroke="' + D + '" stroke-width="4" stroke-linejoin="round"';
    var s = limbsSVG(d.limbs, M, D, G, K);
    if (d.body === 0) { s += '<rect x="62" y="116" width="76" height="86" rx="16" ' + st + '/>'; }
    else if (d.body === 1) { s += '<ellipse cx="100" cy="160" rx="40" ry="46" ' + st + '/>'; }
    else if (d.body === 2) { s += '<path d="M72 120 H128 L140 198 H60 Z" ' + st + '/>'; }
    else { s += '<rect x="70" y="114" width="60" height="92" rx="30" ' + st + '/>'; }
    s += '<rect x="82" y="140" width="36" height="30" rx="8" fill="' + L + '" opacity=".9"/>';
    s += '<circle cx="88" cy="184" r="4" fill="#ffd93d"/><circle cx="100" cy="184" r="4" fill="#ff6b6b"/><circle cx="112" cy="184" r="4" fill="#3ecf8e"/>';
    s += '<rect x="90" y="104" width="20" height="16" fill="' + G + '"/>';
    if (d.head === 0) { s += '<rect x="54" y="30" width="92" height="78" rx="20" ' + st + '/>'; }
    else if (d.head === 1) { s += '<circle cx="100" cy="70" r="44" ' + st + '/>'; }
    else if (d.head === 2) { s += '<path d="M54 108 V70 Q54 28 100 28 Q146 28 146 70 V108 Z" ' + st + '/>'; }
    else { s += '<polygon points="76,28 124,28 148,70 124,110 76,110 52,70" ' + st + '/>'; }
    s += '<rect x="68" y="50" width="64" height="42" rx="14" fill="#1d2740"/><g class="rb-eyes" fill="' + E + '">';
    if (d.eyes === 0) { s += '<circle cx="85" cy="68" r="7"/><circle cx="115" cy="68" r="7"/>'; }
    else if (d.eyes === 1) { s += '<circle cx="100" cy="68" r="12"/><circle cx="100" cy="68" r="5" fill="#1d2740"/>'; }
    else if (d.eyes === 2) { s += '<path d="M77 73 Q85 61 93 73 M107 73 Q115 61 123 73" fill="none" stroke="' + E + '" stroke-width="5" stroke-linecap="round"/>'; }
    else { s += '<rect x="77" y="60" width="16" height="16" rx="3"/><rect x="107" y="60" width="16" height="16" rx="3"/>'; }
    s += '</g><path d="M91 85 Q100 91 109 85" fill="none" stroke="' + E + '" stroke-width="3" stroke-linecap="round"/>';
    if (d.acc === 1) { s += '<line x1="100" y1="28" x2="100" y2="10" stroke="' + G + '" stroke-width="4"/><circle cx="100" cy="8" r="6" fill="#ff5d5d"/>'; }
    else if (d.acc === 2) { s += '<rect x="74" y="4" width="52" height="28" rx="5" fill="' + K + '"/><rect x="64" y="26" width="72" height="8" rx="4" fill="' + K + '"/><rect x="74" y="20" width="52" height="6" fill="#ff6b6b"/>'; }
    else if (d.acc === 3) { s += '<polygon points="80,124 83,131 90,132 85,137 86,144 80,140 74,144 75,137 70,132 77,131" fill="#ffd93d" stroke="#d9a400" stroke-width="1.5"/>'; }
    else if (d.acc === 4) { s += '<polygon points="100,117 82,108 82,126" fill="#ff6b6b"/><polygon points="100,117 118,108 118,126" fill="#ff6b6b"/><circle cx="100" cy="117" r="5" fill="#c94444"/>'; }
    return s;
  }
  function robotSVG(d, view, cls) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (view || '0 0 200 260') + '" class="' + (cls || '') + '" aria-hidden="true">' + robotInner(d) + '</svg>';
  }
  function exportSVG(d) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#fff4c9"/></linearGradient></defs><rect width="640" height="400" fill="url(#bg)"/><ellipse cx="320" cy="388" rx="110" ry="10" fill="#000" opacity=".12"/><g transform="translate(174 6) scale(1.46)">' + robotInner(d) + '</g></svg>';
  }
  function scene(key) { return '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">' + SAMPLES[key].svg + '</svg>'; }
  function svgToPng(svg, cb) {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'), url = '';
      c.width = 640; c.height = 400;
      try { c.getContext('2d').drawImage(img, 0, 0, 640, 400); url = c.toDataURL('image/png'); } catch (e) { url = ''; }
      cb(url);
    };
    img.onerror = function () { cb(''); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function runQ(q, cb) { if (!q.length) { cb(); return; } q.shift()(function () { runQ(q, cb); }); }
  function idx(s) { return ORDER.indexOf(s); }
  function snum(s) { return s === 'build' ? 1 : (s === 'done' ? 5 : parseInt(s.charAt(1), 10)); }
  function trim(s) { return String(s || '').replace(/^\s+|\s+$/g, ''); }

  /* ---------- styles ---------- */
  var CSS = [
    '.rb-app{height:100%;box-sizing:border-box;display:flex;flex-direction:column;overflow:auto;position:relative;color:#26324d;background:linear-gradient(#bfe4ff 0,#e6f5ff 58%,#fff1c4 58%,#ffe0a0 100%);font-family:inherit}',
    '.rb-app *{box-sizing:border-box}',
    '.rb-gears{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}',
    '.rb-gearsvg{width:100%;height:100%}',
    '.rb-g1,.rb-g2{transform-box:fill-box;transform-origin:center}',
    '.rb-g1{animation:rb-spin 30s linear infinite}.rb-g2{animation:rb-spin 24s linear infinite reverse}',
    '.rb-top,.rb-build,.rb-files,.rb-enter,.rb-done{position:relative;z-index:1}',
    '.rb-top{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:8px 12px;background:rgba(255,255,255,.8);border-bottom:3px solid #fff}',
    '.rb-title{font-weight:800;font-size:18px;color:#2b5fc9;margin-right:auto}',
    '.rb-steps{display:flex;gap:6px}',
    '.rb-step{display:flex;align-items:center;gap:5px;padding:3px 10px 3px 4px;border-radius:20px;background:#e3ebf7;font-size:13px;font-weight:700;color:#6a7894}',
    '.rb-step b{width:24px;height:24px;border-radius:50%;background:#b9c6dd;color:#fff;display:flex;align-items:center;justify-content:center}',
    '.rb-step i{font-style:normal}',
    '.rb-step.now{background:#ffe3c4;color:#a85a10}.rb-step.now b{background:#ff8a3d}',
    '.rb-step.done{background:#d9f5e4;color:#1f8a56}.rb-step.done b{background:#3ecf8e}',
    '.rb-narrow .rb-step i{display:none}',
    '.rb-card{background:rgba(255,255,255,.92);border-radius:22px;box-shadow:0 6px 0 rgba(0,0,0,.08);padding:12px}',
    '.rb-btn{min-height:48px;padding:0 18px;border:0;border-radius:16px;font-size:18px;font-weight:800;color:#fff;background:#4a8cff;box-shadow:0 4px 0 #2f63c4;cursor:pointer;font-family:inherit}',
    '.rb-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #2f63c4}',
    '.rb-btn:disabled{opacity:.45;cursor:default}',
    '.rb-green{background:#2fc47a;box-shadow:0 4px 0 #1c8f56}.rb-orange{background:#ff8a3d;box-shadow:0 4px 0 #c75f17}.rb-grey{background:#8a97b3;box-shadow:0 4px 0 #62708d}',
    '.rb-big{min-height:60px;font-size:22px;padding:0 30px}',
    '.rb-btn:focus-visible,.rb-opt:focus-visible,.rb-tile:focus-visible,.rb-qopt:focus-visible{outline:4px solid #1d4ed8;outline-offset:2px}',
    '.rb-build{display:grid;grid-template-columns:minmax(210px,1fr) minmax(250px,1.1fr) minmax(210px,1fr);gap:12px;padding:12px;flex:1}',
    '.rb-narrow .rb-build,.rb-narrow .rb-files{grid-template-columns:1fr}.rb-narrow .rb-centre{order:-1}',
    '.rb-group{margin-bottom:10px}.rb-group h3{margin:0 0 6px;font-size:16px;color:#4a5b82}',
    '.rb-row{display:flex;flex-wrap:wrap;gap:8px}',
    '.rb-opt{width:56px;height:56px;border-radius:16px;border:3px solid #cfd8ea;background:#fff;padding:2px;cursor:pointer}',
    '.rb-opt.on{border-color:#ff8a3d;box-shadow:0 0 0 3px #ffd2b0}',
    '.rb-th{display:block;width:100%;height:100%}.rb-th svg{width:100%;height:100%;display:block}',
    '.rb-sw{border-radius:50%;border:3px solid #fff}',
    '.rb-centre{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center}',
    '.rb-hero{width:min(250px,100%);aspect-ratio:200/260;background:radial-gradient(circle at 50% 40%,#fff,#d6eeff);border-radius:28px;border:4px solid #fff;box-shadow:0 8px 0 rgba(0,0,0,.08);padding:6px}',
    '.rb-hero svg{width:100%;height:100%;display:block}',
    '.rb-hsvg{animation:rb-bob 2.6s ease-in-out infinite}',
    '.rb-react{animation:rb-pop .45s}',
    '.rb-wave svg{transform-origin:50% 90%;animation:rb-wiggle 1.2s ease-in-out infinite}',
    '.rb-eyes{transform-box:fill-box;transform-origin:center;animation:rb-blink 4s infinite}',
    '.rb-name{font-size:22px;height:52px;border-radius:16px;border:3px solid #9cc2ff;text-align:center;width:100%;max-width:260px;font-family:inherit}',
    '.rb-brow{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
    '.rb-bubble{background:#fff;border:3px solid #9cc2ff;border-radius:18px;padding:10px 14px;font-size:19px;line-height:1.3;font-weight:600;max-width:340px}',
    '.rb-files{display:grid;grid-template-columns:270px 1fr;gap:12px;padding:12px;flex:1;min-height:0}',
    '.rb-guide{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}',
    '.rb-gbot{width:110px}.rb-gbot svg{width:100%;display:block}',
    '.rb-gbtns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
    '.rb-ex{display:flex;flex-direction:column;gap:8px;min-width:0}',
    '.rb-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px}',
    '.rb-path{font-weight:800;font-size:17px;color:#4a5b82;flex:1;min-width:90px}',
    '.rb-tools{display:flex;gap:8px;flex-wrap:wrap}',
    '.rb-grid{display:flex;flex-wrap:wrap;gap:10px;padding:10px;overflow:auto;align-content:flex-start;min-height:220px;background:#eef6ff;border-radius:16px;border:3px dashed #c3d6f2}',
    '.rb-tile{width:104px;padding:8px 4px;border-radius:16px;border:3px solid transparent;text-align:center;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none}',
    '.rb-tile .ico{height:64px;display:flex;align-items:center;justify-content:center}',
    '.rb-tile .ico>*{max-width:64px;max-height:64px}',
    '.rb-tile.sel{border-color:#ff8a3d;background:#fff3e6}',
    '.rb-tile.drop,.rb-btn.drop{background:#dff7e3;border-color:#3ecf8e;transform:scale(1.07)}',
    '.rb-lbl{font-size:15px;font-weight:800;word-break:break-word}',
    '.rb-empty{width:100%;text-align:center;color:#7a89a8;font-weight:700;padding:30px 0}',
    '.rb-hint{border-color:#ffb300!important;box-shadow:0 0 0 5px rgba(255,179,0,.55)!important;animation:rb-glow 1s ease-in-out infinite}',
    '.rb-pop{animation:rb-pop .5s}',
    '.rb-ghost{position:fixed;z-index:99999;pointer-events:none;opacity:.9;transform:rotate(-4deg) scale(1.08);background:#fff;border-radius:16px}',
    '.rb-fly{position:fixed;z-index:99999;pointer-events:none;width:104px;transition:transform .45s ease-in,opacity .45s}',
    '.rb-ovl{position:absolute;left:0;top:0;width:100%;height:100%;z-index:50;background:rgba(30,45,80,.55);display:flex;align-items:center;justify-content:center;padding:14px}',
    '.rb-dialog{background:#fff;border-radius:24px;padding:18px;max-width:560px;width:100%;max-height:100%;overflow:auto;text-align:center;box-shadow:0 10px 0 rgba(0,0,0,.15)}',
    '.rb-dialog h2{margin:0 0 10px}',
    '.rb-vimg{width:100%;max-width:480px;border-radius:14px;border:3px solid #e1e9f7}',
    '.rb-vtext{white-space:pre-wrap;text-align:left;background:#f6f8fc;border-radius:12px;padding:12px;font-size:18px}',
    '.rb-dbar{display:flex;gap:10px;justify-content:center;margin-top:12px;flex-wrap:wrap}',
    '.rb-target{font-size:30px;font-weight:900;color:#2b5fc9;margin-bottom:10px}',
    '.rb-pfeedback{min-height:26px;margin-top:8px;font-weight:700;color:#c75f17}',
    '.rb-quiz{display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center;justify-content:center}',
    '.rb-quiz h2{margin:0;font-size:26px}.rb-qn{font-weight:800;color:#7a89a8}',
    '.rb-qopts{display:flex;flex-direction:column;gap:10px;width:100%;max-width:420px}',
    '.rb-qopt{min-height:60px;border-radius:18px;border:3px solid #9cc2ff;background:#fff;font-size:21px;font-weight:800;cursor:pointer;font-family:inherit;color:#26324d}',
    '.rb-demo{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap}',
    '.rb-dcard{background:#f2f8ff;border:3px solid #bcd6f7;border-radius:20px;padding:14px;min-width:150px;text-align:center}',
    '.rb-dcard .ico{height:84px;display:flex;align-items:center;justify-content:center}.rb-dcard .ico>*{max-width:84px;max-height:84px}',
    '.rb-plus{font-size:44px;font-weight:900;color:#ff8a3d}',
    '.rb-stagebox{position:relative;width:340px;max-width:100%;height:300px}',
    '.rb-monitor svg{width:100%;height:100%}',
    '.rb-enter-robot{position:absolute;left:50%;top:120px;width:110px;height:143px;transform:translate(-50%,-50%) scale(.6);animation:rb-in 2.4s ease-out}',
    '.rb-enter-robot svg{width:100%;height:100%}',
    '.rb-enter{padding:20px;flex:1}',
    '.rb-done{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px;text-align:center;flex:1}',
    '.rb-ribbon{background:linear-gradient(#ffd54a,#ffb300);color:#6b3f00;font-weight:900;font-size:24px;padding:10px 26px;border-radius:14px;box-shadow:0 5px 0 #c98600}',
    '.rb-done h2{margin:0}.rb-done p{margin:0;font-size:19px;font-weight:600}',
    '.rb-fcards{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}',
    '.rb-fcard{background:rgba(255,255,255,.92);border-radius:18px;padding:10px 14px;min-width:150px}',
    '.rb-fcard .ico{height:56px;display:flex;align-items:center;justify-content:center}.rb-fcard .ico>*{max-height:56px}',
    '.rb-chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:4px}',
    '.rb-chip{background:#e3ecfb;border-radius:10px;padding:2px 8px;font-size:13px;font-weight:700}',
    '@keyframes rb-spin{to{transform:rotate(360deg)}}',
    '@keyframes rb-bob{50%{transform:translateY(-6px)}}',
    '@keyframes rb-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}',
    '@keyframes rb-pop{0%{transform:scale(1)}40%{transform:scale(1.12) rotate(-3deg)}100%{transform:scale(1)}}',
    '@keyframes rb-wiggle{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}',
    '@keyframes rb-glow{50%{box-shadow:0 0 0 10px rgba(255,179,0,.25)}}',
    '@keyframes rb-in{from{transform:translate(-50%,-150%) scale(1.2)}}',
    '@media (prefers-reduced-motion:reduce){.rb-app *,.rb-fly{animation:none!important;transition:none!important}}'
  ].join('\n');
  function injectCSS() {
    if (document.getElementById('rb-style')) { return; }
    var s = document.createElement('style');
    s.id = 'rb-style'; s.textContent = CSS; document.head.appendChild(s);
  }
  function btn(label, colour, fn, extra) {
    return el('button', { class: 'rb-btn rb-' + colour + (extra || ''), type: 'button', onclick: fn, text: label });
  }

  /* ---------- the app ---------- */
  LCL.registerApp({
    id: 'robot',
    title: 'My Robot',
    icon: 'robotbuilder',
    w: 980, h: 660, minW: 560, minH: 480,
    help: 'Build your own robot, then learn about files and folders!',
    mount: function (root, ctx) {
      injectCSS();
      var alive = true, timers = [], offs = [], dragCleanup = null, dragged = false, overEl = null;
      var app = el('div', { class: 'rb-app' });
      root.appendChild(app);

      var S = (function () {
        var s = vfs.getKV(KEY, {}) || {};
        s.design = cleanDesign(s.design);
        if (idx(s.stage) < 0) { s.stage = 'build'; }
        s.ids = s.ids || {};
        s.fileId = s.fileId || null;
        return s;
      })();
      var view = 'build', redo = false;
      var d = cleanDesign(S.design), base = cleanDesign(S.design);
      var cwd = vfs.DESKTOP, sel = null, clip = null, tries = 0, hint = false;
      var lead = '', note = '', pop = null, busy = false, quiz = null, overlay = null, refs = {}, pend = false;

      function later(fn, ms) { timers.push(setTimeout(function () { if (alive) { fn(); } }, ms)); }
      function save() { vfs.setKV(KEY, S); }
      function has(id) { return !!(id && vfs.get(id)); }
      function nm(id) { var n = id && vfs.get(id); return n ? n.name : 'it'; }
      function kids(id) {
        var c = vfs.children(id) || [];
        return c.map(function (x) { return typeof x === 'string' ? vfs.get(x) : x; }).filter(function (x) { return !!x; });
      }
      function findFolder(parent, name) {
        var c = kids(parent), i;
        for (i = 0; i < c.length; i++) { if (c[i].type === 'folder' && c[i].name.toLowerCase() === name.toLowerCase()) { return c[i]; } }
        return null;
      }
      function praise() {
        var p; try { p = LCL.praise(); } catch (e) { p = null; }
        return (typeof p === 'string' && p) ? p : pick(PRAISE);
      }
      function say(text) { try { LCL.bleep.speak(text); } catch (e) {} }
      function sfx(n) { try { LCL.sound.play(n); } catch (e) {} }
      function pathLabel() {
        var parts = [], id = cwd, n, i = 0;
        while (id && id !== vfs.DESKTOP && i < 10) { n = vfs.get(id); if (!n) { break; } parts.unshift(n.name); id = n.parent; i++; }
        parts.unshift('Desktop');
        return parts.join(' > ');
      }

      /* ----- samples and repair ----- */
      function makePic(key, parent, cb) {
        svgToPng(scene(key), function (url) {
          var f = vfs.createFile(parent, SAMPLES[key].name, 'drawing', url || EMPTY_PNG, {});
          if (key === 'sun' || key === 'tree') { S.ids[key] = f.id; }
          cb();
        });
      }
      function makeBox(cb) {
        var b = vfs.createFolder(vfs.DESKTOP, 'Surprise Box');
        S.ids.box = b.id;
        vfs.createFile(b.id, 'Hello', 'text', 'Hello! I live in the Surprise Box.', {});
        runQ([function (n) { makePic('rainbow', b.id, n); }, function (n) { makePic('fish', b.id, n); }], cb);
      }
      function seedAll(cb) {
        var q = [];
        if (!has(S.ids.box)) { q.push(makeBox); }
        if (!has(S.ids.sun)) { q.push(function (n) { makePic('sun', vfs.DESKTOP, n); }); }
        if (!has(S.ids.tree)) { q.push(function (n) { makePic('tree', vfs.DESKTOP, n); }); }
        q.push(function (n) {
          vfs.createFile(vfs.DESKTOP, 'My Story', 'text', 'Once upon a time, a little robot lived inside a computer.', {});
          vfs.createFile(vfs.DESKTOP, 'Shopping List', 'text', 'Milk\nBread\nApples', {});
          n();
        });
        runQ(q, cb);
      }
      function repair(cb) {
        var ids = S.ids, i = idx(S.stage), q = [];
        function folder(key, name, from) {
          if (i >= idx(from) && i < idx('done') && !has(ids[key])) {
            q.push(function (n) { ids[key] = vfs.createFolder(vfs.DESKTOP, name).id; n(); });
          }
        }
        if (S.stage !== 'build' && !has(S.fileId)) {
          q.push(function (n) {
            svgToPng(exportSVG(S.design), function (url) {
              var f = vfs.createFile(vfs.DESKTOP, S.design.name || 'Robot', 'drawing', url || EMPTY_PNG, { by: 'pupil' });
              S.fileId = f.id; n();
            });
          });
        }
        if (i >= idx('s2-click') && i <= idx('s3-move2')) {
          if (!has(ids.sun)) { q.push(function (n) { makePic('sun', vfs.DESKTOP, n); }); }
          if (!has(ids.tree)) { q.push(function (n) { makePic('tree', vfs.DESKTOP, n); }); }
        }
        if (i >= idx('s2-click') && i <= idx('s2-folder') && !has(ids.box)) { q.push(makeBox); }
        folder('myPics', 'My Pictures', 's3-move1');
        folder('myRobots', 'My Robots', 's3-robot');
        folder('friend', 'Friend Box', 's4-copy');
        runQ(q, function () { save(); cb(); });
      }
      function setStage(to) { S.stage = to; tries = 0; hint = false; }
      function reconcile() {
        var ids = S.ids, go = true, f, a;
        while (go) {
          go = false;
          a = S.stage;
          if (a === 's3-f1' && (f = findFolder(vfs.DESKTOP, 'My Robots'))) { ids.myRobots = f.id; setStage('s3-f2'); go = true; }
          else if (a === 's3-f2' && (f = findFolder(vfs.DESKTOP, 'My Pictures'))) { ids.myPics = f.id; setStage('s3-move1'); go = true; }
          else if (a === 's3-move1' && has(ids.sun) && vfs.get(ids.sun).parent === ids.myPics) { setStage('s3-move2'); go = true; }
          else if (a === 's3-move2' && has(ids.tree) && vfs.get(ids.tree).parent === ids.myPics) { setStage('s3-robot'); go = true; }
          else if (a === 's3-robot' && has(S.fileId) && vfs.get(S.fileId).parent === ids.myRobots) { setStage('s3-look'); cwd = vfs.DESKTOP; go = true; }
        }
      }
      function advance(to) {
        setStage(to);
        lead = praise(); note = ''; sel = null;
        if (to === 's2-quiz') { quiz = { set: 's2', i: 0, wrong: 0 }; }
        if (to === 's4-quiz') { quiz = { set: 's4', i: 0, wrong: 0 }; }
        if (to === 's3-f1' || to === 's3-look') { cwd = vfs.DESKTOP; clip = null; }
        if (to === 'done') {
          view = 'done'; LCL.emit('robot:complete', {});
          try { LCL.fx.confetti(); } catch (e) {}
          sfx('tada');
        } else { sfx('good'); }
        save();
        repair(function () { render(); });
      }

      /* ----- builder ----- */
      function thumb(cat, i) {
        if (cat === 'acc' && i === 0) {
          return '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="none" stroke="#9aa5b6" stroke-width="4"/><path d="M12 28 L28 12" stroke="#9aa5b6" stroke-width="4"/></svg>';
        }
        var t = cleanDesign(d); t[cat] = i;
        return robotSVG(t, VIEWS[cat]);
      }
      function setBubble() {
        refs.bubble.textContent = (lead ? lead + ' ' : '') + (note || (redo ? TASKS.redo : TASKS.build));
      }
      function react() {
        refs.hero.className = 'rb-hero'; void refs.hero.offsetWidth; refs.hero.className = 'rb-hero rb-react';
      }
      function updateBuilder() {
        var cat, i, b, th;
        refs.hero.innerHTML = robotSVG(d, '0 0 200 260', 'rb-hsvg');
        for (cat in refs.btns) {
          for (i = 0; i < refs.btns[cat].length; i++) {
            b = refs.btns[cat][i]; th = b.firstChild;
            b.className = 'rb-opt' + (d[cat] === i ? ' on' : '');
            b.setAttribute('aria-pressed', d[cat] === i ? 'true' : 'false');
            if (cat === 'colour') { th.className = 'rb-th rb-sw'; th.style.background = COLOURS[i].m; }
            else { th.innerHTML = thumb(cat, i); }
          }
        }
      }
      function group(cat, title) {
        var row = el('div', { class: 'rb-row' }), i;
        refs.btns[cat] = [];
        function mk(i) {
          var b = el('button', {
            class: 'rb-opt', type: 'button', 'aria-label': LABELS[cat][i], title: LABELS[cat][i],
            onclick: function () { d[cat] = i; updateBuilder(); react(); sfx('pop'); }
          }, [el('span', { class: 'rb-th' })]);
          refs.btns[cat].push(b); row.appendChild(b);
        }
        for (i = 0; i < COUNTS[cat]; i++) { mk(i); }
        return el('div', { class: 'rb-group' }, [el('h3', { text: title }), row]);
      }
      function buildView() {
        refs.btns = {};
        var left = el('div', { class: 'rb-card' }, [group('head', 'Head'), group('body', 'Body'), group('eyes', 'Eyes')]);
        var right = el('div', { class: 'rb-card' }, [group('limbs', 'Arms and legs'), group('acc', 'Extras'), group('colour', 'Colour')]);
        refs.hero = el('div', { class: 'rb-hero', role: 'img', 'aria-label': 'Your robot' });
        refs.bubble = el('div', { class: 'rb-bubble' });
        refs.name = el('input', {
          class: 'rb-name', type: 'text', maxlength: '12', placeholder: 'Type a name', 'aria-label': 'Robot name', value: d.name,
          oninput: function () { d.name = this.value.slice(0, 12); },
          onkeydown: function (e) { if (e.key === 'Enter') { saveRobot(); } }
        });
        var centre = el('div', { class: 'rb-centre' }, [
          refs.bubble, refs.hero, refs.name,
          el('div', { class: 'rb-brow' }, [
            btn('Randomise', 'orange', function () {
              var k; for (k in COUNTS) { d[k] = Math.floor(Math.random() * COUNTS[k]); }
              updateBuilder(); react(); sfx('pop');
            }),
            btn('Reset', 'grey', function () {
              var keep = redo ? base.name : refs.name.value;
              d = cleanDesign(base); d.name = keep.slice(0, 12); refs.name.value = d.name;
              updateBuilder(); react();
            }),
            btn('Listen', 'grey', function () { say(refs.bubble.textContent); })
          ]),
          btn('Save Robot', 'green', saveRobot, ' rb-big')
        ]);
        var wrap = el('div', { class: 'rb-build' }, [left, centre, right]);
        updateBuilder(); setBubble();
        return wrap;
      }
      function saveRobot() {
        var name = trim(d.name);
        if (!name) {
          lead = 'Oops!'; note = 'Your robot needs a name! Type it in the box.';
          setBubble(); refs.name.focus(); sfx('oops'); return;
        }
        if (busy) { return; }
        busy = true; d.name = name;
        svgToPng(exportSVG(d), function (url) {
          if (!alive) { return; }
          var node = has(S.fileId) ? vfs.get(S.fileId) : null, first = S.stage === 'build';
          url = url || EMPTY_PNG;
          if (node) {
            vfs.writeFile(node.id, url);
            if (node.name !== name) { vfs.rename(node.id, name); }
          } else {
            node = vfs.createFile(vfs.DESKTOP, name, 'drawing', url, { by: 'pupil' });
            S.fileId = node.id;
          }
          S.design = cleanDesign(d); base = cleanDesign(d);
          sfx('tada');
          try { LCL.fx.confetti(); } catch (e) {}
          LCL.emit(first ? 'robot:built' : 'robot:redesigned', { id: S.fileId });
          if (first) {
            seedAll(function () {
              S.stage = 's2-click'; save(); busy = false; view = 'enter'; render();
            });
          } else {
            save(); busy = false; redo = false;
            view = S.stage === 'done' ? 'done' : 'files';
            lead = praise(); note = 'Your robot looks great!'; render();
          }
        });
      }
      function startRedo() {
        redo = true; d = cleanDesign(S.design); base = cleanDesign(S.design);
        view = 'build'; lead = ''; note = ''; overlay = null; render();
      }
      function cancelRedo() { redo = false; view = S.stage === 'done' ? 'done' : 'files'; render(); }

      /* ----- shared bits ----- */
      function topBar() {
        var n = snum(S.stage), labels = ['Build', 'Files', 'Organise', 'Copy'];
        var steps = el('div', { class: 'rb-steps' }, labels.map(function (t, i) {
          return el('span', { class: 'rb-step' + (i + 1 < n ? ' done' : '') + (i + 1 === n ? ' now' : '') }, [el('b', { text: String(i + 1) }), el('i', { text: t })]);
        }));
        var right = null;
        if (view === 'build' && redo) { right = btn('Back', 'grey', cancelRedo); }
        else if (has(S.fileId) && view !== 'build' && view !== 'enter') { right = btn('Redesign My Robot', 'orange', startRedo); }
        return el('div', { class: 'rb-top' }, [el('div', { class: 'rb-title', text: 'My Robot, My Computer' }), steps, right]);
      }
      function enterView() {
        return el('div', { class: 'rb-centre rb-enter' }, [
          el('div', { class: 'rb-stagebox' }, [el('div', { class: 'rb-monitor', html: MONITOR_SVG }), el('div', { class: 'rb-enter-robot', html: robotSVG(S.design) })]),
          el('h2', { text: S.design.name + ' is now inside the computer!' }),
          el('p', { text: 'Your robot is saved as a picture file.' }),
          btn('Let us explore!', 'green', function () { view = 'files'; cwd = vfs.DESKTOP; render(); }, ' rb-big')
        ]);
      }
      function stageKey() { return (S.stage === 's2-folder' && cwd === S.ids.box) ? 's2-folder-in' : S.stage; }
      function nextInfo() {
        if (S.stage === 's2-folder' && cwd === S.ids.box) { return { label: 'Next', go: function () { advance('s2-quiz'); } }; }
        if (S.stage === 's3-look') { return { label: 'I see!', go: function () { advance('s3-find'); } }; }
        if (S.stage === 's4-see') { return { label: 'Next', go: function () { advance('s4-quiz'); } }; }
        return null;
      }
      function hintTargets() {
        var ids = S.ids, desk = vfs.DESKTOP, r = { tiles: [], btn: null };
        function inFolder(folder, item) {
          if (cwd === folder) { if (item) { r.tiles.push(item); } }
          else if (cwd === desk) { r.tiles.push(folder); }
          else { r.btn = 'up'; }
        }
        switch (S.stage) {
          case 's2-click': inFolder(desk, S.fileId); if (sel === S.fileId) { r.btn = 'open'; } break;
          case 's2-pic': inFolder(desk, ids.sun); if (sel === ids.sun) { r.btn = 'open'; } break;
          case 's2-folder':
            if (cwd === ids.box) { r.btn = 'next'; } else { inFolder(desk, ids.box); if (sel === ids.box) { r.btn = 'open'; } }
            break;
          case 's3-f1': case 's3-f2': r.btn = cwd === desk ? 'newfolder' : 'up'; break;
          case 's3-move1': if (cwd === desk) { r.tiles = [ids.sun, ids.myPics]; } else { r.btn = 'up'; } break;
          case 's3-move2': if (cwd === desk) { r.tiles = [ids.tree, ids.myPics]; } else { r.btn = 'up'; } break;
          case 's3-robot': if (cwd === desk) { r.tiles = [S.fileId, ids.myRobots]; } else { r.btn = 'up'; } break;
          case 's3-look': case 's4-see': r.btn = 'next'; break;
          case 's3-find': inFolder(ids.myRobots, S.fileId); break;
          case 's4-copy': inFolder(ids.myRobots, S.fileId); if (sel === S.fileId && cwd === ids.myRobots) { r.btn = 'copy'; } break;
          case 's4-paste': if (cwd === ids.friend) { r.btn = 'paste'; } else if (cwd === desk) { r.tiles.push(ids.friend); } else { r.btn = 'up'; } break;
        }
        return r;
      }
      function wrong(text) {
        lead = 'Nearly!'; note = text; tries++;
        if (tries >= 2) { hint = true; }
        sfx('oops'); render();
      }

      /* ----- moving, copying, opening ----- */
      function makeFly(n) { return el('div', { class: 'rb-tile' }, [el('div', { class: 'ico' }, [LCL.ui.nodeIcon(n)])]); }
      function fly(fromEl, toEl, n, cb) {
        if (!fromEl || !toEl || reduced()) { cb(); return; }
        var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
        var g = (fromEl.className.indexOf('rb-tile') >= 0) ? fromEl.cloneNode(true) : makeFly(n);
        g.className = 'rb-fly';
        g.style.left = a.left + 'px'; g.style.top = a.top + 'px';
        document.body.appendChild(g);
        var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
        void g.offsetWidth;
        g.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.3)'; g.style.opacity = '.4';
        later(function () { if (g.parentNode) { g.parentNode.removeChild(g); } cb(); }, 480);
      }
      function moveGoal() {
        var ids = S.ids;
        if (S.stage === 's3-move1') { return { id: ids.sun, dest: ids.myPics }; }
        if (S.stage === 's3-move2') { return { id: ids.tree, dest: ids.myPics }; }
        if (S.stage === 's3-robot') { return { id: S.fileId, dest: ids.myRobots }; }
        return null;
      }
      function tryMove(id, folderId, fromEl, toEl) {
        var goal = moveGoal(), free = S.stage === 'done', n = vfs.get(id);
        if (!n) { return; }
        if (!free) {
          if (!goal) { lead = 'Not yet!'; note = 'We will move files in a moment. Follow the glowing steps.'; render(); return; }
          if (id !== goal.id) { wrong('Not that one. Move ' + nm(goal.id) + '.'); return; }
          if (folderId !== goal.dest) { wrong('Not that folder. Put it in ' + nm(goal.dest) + '.'); return; }
        }
        if (folderId === n.parent) { return; }
        fly(fromEl, toEl, n, function () {
          var r = vfs.move(id, folderId);
          if (!r || !r.ok) { lead = 'Oops!'; note = 'That did not work. Try again.'; render(); return; }
          clip = null; sel = null; if (cwd === folderId) { pop = id; }
          LCL.emit('robot:moved', { id: id });
          if (free) { lead = praise(); note = 'Moved!'; render(); return; }
          advance({ 's3-move1': 's3-move2', 's3-move2': 's3-robot', 's3-robot': 's3-look' }[S.stage]);
        });
      }
      function tryCopy(id, folderId) {
        var free = S.stage === 'done', n = vfs.get(id), r;
        if (!n) { return; }
        if (!free) {
          if (S.stage !== 's4-paste') { lead = 'Not yet!'; note = 'Follow the glowing steps first.'; render(); return; }
          if (id !== S.fileId) { wrong('Copy your robot, please.'); return; }
          if (folderId !== S.ids.friend) { wrong('Open the Friend Box first. Then press Paste.'); return; }
        }
        r = vfs.copy(id, folderId);
        if (!r || !r.ok) { lead = 'Oops!'; note = 'That did not work. Try again.'; render(); return; }
        clip = null; sel = null; pop = r.node ? r.node.id : null;
        LCL.emit('robot:copied', { id: id });
        if (free) { lead = praise(); note = 'Copied!'; sfx('good'); render(); return; }
        S.ids.copyId = r.node.id;
        advance('s4-see');
      }
      function dropped(n, target, tile) {
        var tid = target.getAttribute('data-drop');
        if (!tid || tid === n.id) { return; }
        tryMove(n.id, tid, tile, target);
      }
      function dropAt(ev) {
        var t = document.elementFromPoint(ev.clientX, ev.clientY);
        while (t && t !== app) { if (t.getAttribute && t.getAttribute('data-drop')) { return t; } t = t.parentNode; }
        return null;
      }
      function markOver(t) {
        if (overEl && overEl !== t) { overEl.className = overEl.className.replace(' drop', ''); }
        if (t && t.className.indexOf(' drop') < 0) { t.className += ' drop'; }
        overEl = t;
      }
      var ghost = null;
      function startDrag(e, n, tile) {
        if (e.button > 0 || n.type !== 'file') { return; }
        var sx = e.clientX, sy = e.clientY, moved = false;
        function mv(ev) {
          if (!moved) {
            if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 8) { return; }
            moved = true; ghost = tile.cloneNode(true); ghost.className = 'rb-tile rb-ghost'; document.body.appendChild(ghost);
          }
          ghost.style.left = (ev.clientX - 52) + 'px'; ghost.style.top = (ev.clientY - 40) + 'px';
          markOver(dropAt(ev));
        }
        function stop() {
          document.removeEventListener('pointermove', mv);
          document.removeEventListener('pointerup', up);
          document.removeEventListener('pointercancel', up);
          if (ghost && ghost.parentNode) { ghost.parentNode.removeChild(ghost); }
          ghost = null; markOver(null); dragCleanup = null;
        }
        function up(ev) {
          stop();
          if (moved) {
            dragged = true; later(function () { dragged = false; }, 60);
            var over = dropAt(ev); if (over) { dropped(n, over, tile); }
          }
        }
        dragCleanup = stop;
        document.addEventListener('pointermove', mv);
        document.addEventListener('pointerup', up);
        document.addEventListener('pointercancel', up);
      }
      function showViewer(n) {
        var body = n.kind === 'drawing' ? el('img', { class: 'rb-vimg', src: n.data, alt: n.name }) : el('pre', { class: 'rb-vtext', text: String(n.data || '') });
        var bar = [btn('Close', 'green', closeOverlay)];
        if (n.kind === 'drawing') { bar.push(btn('Open in Paint', 'grey', function () { try { LCL.openNode(n.id); } catch (e) {} })); }
        overlay = el('div', { class: 'rb-ovl' }, [el('div', { class: 'rb-dialog' }, [el('h2', { text: n.name }), body, el('div', { class: 'rb-dbar' }, bar)])]);
        render();
      }
      function closeOverlay() { overlay = null; render(); }
      function openItem(n) {
        var ids = S.ids;
        if (n.type === 'folder') { cwd = n.id; sel = null; render(); return; }
        if (S.stage === 's2-click') {
          if (n.id === S.fileId) { showViewer(n); advance('s2-pic'); return; }
          tries++; if (tries >= 2) { hint = true; } lead = 'Nearly!'; note = 'That is not your robot. Look for ' + nm(S.fileId) + '.';
        } else if (S.stage === 's2-pic') {
          if (n.id === ids.sun) { showViewer(n); advance('s2-folder'); return; }
          tries++; if (tries >= 2) { hint = true; } lead = 'Nearly!'; note = 'Look for the Sunny Day picture.';
        }
        showViewer(n);
      }
      function select(n) {
        var guard = ['s2-click', 's2-pic', 's2-folder', 's3-find', 's4-copy'], t;
        sel = n.id;
        if (guard.indexOf(S.stage) >= 0) {
          t = hintTargets().tiles;
          if (t.length && t.indexOf(n.id) < 0) { wrong('Not that one. Look for ' + nm(t[0]) + '.'); return; }
        }
        if (S.stage === 's3-find' && n.id === S.fileId && cwd === S.ids.myRobots) { advance('s4-copy'); return; }
        render();
      }
      function newFolder() {
        if (cwd !== vfs.DESKTOP) { lead = 'Oops!'; note = 'Go back to the Desktop first.'; render(); return; }
        var target = S.stage === 's3-f1' ? 'My Robots' : (S.stage === 's3-f2' ? 'My Pictures' : null), bad = 0;
        var input = el('input', { class: 'rb-name', type: 'text', maxlength: '20', placeholder: 'Type here', 'aria-label': 'Folder name' });
        var help = el('div', { class: 'rb-pfeedback' });
        function cancel() { overlay = null; render(); }
        function ok() {
          var v = trim(input.value), f;
          if (target ? v.toLowerCase() !== target.toLowerCase() : !v) {
            bad++; sfx('oops');
            if (bad >= 2 && target) { input.value = target; help.textContent = 'I typed it for you. Press OK!'; }
            else { help.textContent = target ? 'Nearly! Type it exactly like this.' : 'Type a name first.'; }
            return;
          }
          overlay = null;
          f = findFolder(vfs.DESKTOP, target || v) || vfs.createFolder(vfs.DESKTOP, target || v);
          pop = f.id; LCL.emit('robot:folder', { id: f.id });
          if (S.stage === 's3-f1') { S.ids.myRobots = f.id; advance('s3-f2'); }
          else if (S.stage === 's3-f2') { S.ids.myPics = f.id; advance('s3-move1'); }
          else { lead = praise(); note = 'New folder made!'; sfx('good'); render(); }
        }
        input.onkeydown = function (e) { if (e.key === 'Enter') { ok(); } else if (e.key === 'Escape') { cancel(); } };
        overlay = el('div', { class: 'rb-ovl' }, [el('div', { class: 'rb-dialog' }, [
          el('h2', { text: 'Name your folder' }),
          target ? el('div', { class: 'rb-target', text: target }) : null,
          input, help,
          el('div', { class: 'rb-dbar' }, [btn('OK', 'green', ok), btn('Cancel', 'grey', cancel)])
        ])]);
        render();
      }
      function clipBtn(mode) {
        var n = sel && vfs.get(sel);
        if (!n || n.type !== 'file') { lead = 'Oops!'; note = 'Click a file first. Then press ' + (mode === 'copy' ? 'Copy' : 'Move') + '.'; render(); return; }
        if (S.stage === 's4-copy' && n.id !== S.fileId) { wrong('Click your robot first. Then press Copy.'); return; }
        clip = { mode: mode, id: n.id }; sfx('pop');
        if (S.stage === 's4-copy') { advance('s4-paste'); return; }
        lead = ''; note = 'Now open a folder and press Paste.'; render();
      }
      function pasteBtn() {
        if (!clip) { return; }
        var n = vfs.get(clip.id);
        if (!n) { clip = null; render(); return; }
        if (clip.mode === 'move') { tryMove(n.id, cwd, refs.paste, refs.grid); } else { tryCopy(n.id, cwd); }
      }

      /* ----- views ----- */
      function toolList() {
        var s = S.stage, L = [];
        if (sel) { L.push(['open', 'Open', 'blue', function () { var n = vfs.get(sel); if (n) { openItem(n); } }]); }
        if (s === 's3-f1' || s === 's3-f2' || s === 'done') { L.push(['newfolder', 'New Folder', 'orange', newFolder]); }
        if (/^s3-(move|robot)/.test(s) || s === 'done') { L.push(['move', 'Move', 'orange', function () { clipBtn('move'); }]); }
        if (s === 's4-copy' || s === 's4-paste' || s === 'done') { L.push(['copy', 'Copy', 'orange', function () { clipBtn('copy'); }]); }
        if (/^s3-(move|robot)/.test(s) || s === 's4-paste' || s === 'done') { L.push(['paste', 'Paste', 'green', pasteBtn]); }
        return L;
      }
      function tile(n, hl) {
        var t = el('div', {
          class: 'rb-tile' + (sel === n.id ? ' sel' : '') + (hl.tiles.indexOf(n.id) >= 0 ? ' rb-hint' : '') + (pop === n.id ? ' rb-pop' : ''),
          tabindex: '0', role: 'button', 'data-id': n.id, 'aria-label': n.name + (n.type === 'folder' ? ' folder' : ' file')
        }, [el('div', { class: 'ico' }, [LCL.ui.nodeIcon(n)]), el('div', { class: 'rb-lbl', text: n.name })]);
        if (n.type === 'folder') { t.setAttribute('data-drop', n.id); }
        t.onclick = function (e) { e.stopPropagation(); if (dragged) { dragged = false; return; } select(n); };
        t.ondblclick = function () { openItem(n); };
        t.onkeydown = function (e) {
          if (e.key === 'Enter') { openItem(n); } else if (e.key === ' ') { e.preventDefault(); select(n); }
        };
        t.onpointerdown = function (e) { startDrag(e, n, t); };
        return t;
      }
      function explorer() {
        var hl = hint ? hintTargets() : { tiles: [], btn: null }, cn = vfs.get(cwd), canUp = cwd !== vfs.DESKTOP && cn;
        var up = el('button', {
          class: 'rb-btn rb-grey' + (hl.btn === 'up' ? ' rb-hint' : ''), type: 'button', text: 'Back', disabled: !canUp,
          onclick: function () { sel = null; cwd = cn.parent; render(); }
        });
        if (canUp) { up.setAttribute('data-drop', cn.parent); }
        var tools = toolList().map(function (t) {
          var b = el('button', { class: 'rb-btn rb-' + t[2] + (hl.btn === t[0] ? ' rb-hint' : ''), type: 'button', onclick: t[3], text: t[1] });
          if (t[0] === 'paste') { b.disabled = !clip; refs.paste = b; }
          return b;
        });
        refs.grid = el('div', { class: 'rb-grid' });
        refs.grid.onclick = function (e) { if (e.target === refs.grid) { sel = null; render(); } };
        var items = kids(cwd).sort(function (a, b) {
          if (a.type !== b.type) { return a.type === 'folder' ? -1 : 1; }
          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        });
        if (!items.length) { refs.grid.appendChild(el('div', { class: 'rb-empty', text: 'This folder is empty.' })); }
        items.forEach(function (n) { refs.grid.appendChild(tile(n, hl)); });
        return el('div', { class: 'rb-card rb-ex' }, [
          el('div', { class: 'rb-bar' }, [up, el('div', { class: 'rb-path', text: pathLabel() }), el('div', { class: 'rb-tools' }, tools)]),
          refs.grid
        ]);
      }
      function answer(i) {
        var set = QUIZ[quiz.set], q = set[quiz.i], s;
        if (i !== q.a) { quiz.wrong++; lead = 'Nearly!'; note = q.h; sfx('oops'); render(); return; }
        sfx('good'); quiz.i++; quiz.wrong = 0; lead = praise(); note = '';
        if (quiz.i < set.length) { render(); return; }
        s = quiz.set; quiz = null;
        advance(s === 's2' ? 's3-f1' : 'done');
      }
      function quizPanel() {
        if (!quiz) { quiz = { set: S.stage === 's2-quiz' ? 's2' : 's4', i: 0, wrong: 0 }; }
        var set = QUIZ[quiz.set], q = set[quiz.i];
        var opts = q.o.map(function (t, i) {
          return el('button', { class: 'rb-qopt' + (quiz.wrong >= 2 && i === q.a ? ' rb-hint' : ''), type: 'button', onclick: function () { answer(i); }, text: t });
        });
        return el('div', { class: 'rb-card rb-quiz' }, [
          el('div', { class: 'rb-qn', text: 'Question ' + (quiz.i + 1) + ' of ' + set.length }),
          el('h2', { text: q.q }), el('div', { class: 'rb-qopts' }, opts)
        ]);
      }
      function demoPanel() {
        var o = vfs.get(S.fileId), c = vfs.get(S.ids.copyId);
        function card(n, title) {
          if (!n) { return el('div', { class: 'rb-dcard' }, [el('b', { text: title }), el('p', { text: 'Not found' })]); }
          var par = vfs.get(n.parent);
          return el('div', { class: 'rb-dcard rb-pop' }, [
            el('b', { text: title }), el('div', { class: 'ico' }, [LCL.ui.nodeIcon(n)]),
            el('div', { class: 'rb-lbl', text: n.name }), el('p', { text: 'in ' + (par ? par.name : 'Desktop') })
          ]);
        }
        return el('div', { class: 'rb-card rb-demo' }, [card(o, 'Original'), el('div', { class: 'rb-plus', text: '+' }), card(c, 'Copy')]);
      }
      function filesView() {
        var key = stageKey(), text = (lead ? lead + ' ' : '') + (note || TASKS[key] || ''), nx = nextInfo();
        var hl = hint ? hintTargets() : { btn: null };
        var gbtns = [btn('Listen', 'grey', function () { say(text); }), btn('Show me', 'grey', function () { hint = true; render(); })];
        var guide = el('div', { class: 'rb-card rb-guide' }, [
          el('div', { class: 'rb-gbot', html: robotSVG(GUIDE, '0 0 200 260', 'rb-hsvg') }),
          el('div', { class: 'rb-bubble' }, [lead ? el('strong', { text: lead + ' ' }) : null, note || TASKS[key] || '']),
          el('div', { class: 'rb-gbtns' }, gbtns),
          nx ? btn(nx.label, 'green', nx.go, ' rb-big' + (hl.btn === 'next' ? ' rb-hint' : '')) : null
        ]);
        var main = (S.stage === 's2-quiz' || S.stage === 's4-quiz') ? quizPanel() : (S.stage === 's4-see' ? demoPanel() : explorer());
        return el('div', { class: 'rb-files' }, [guide, main]);
      }
      function doneView() {
        var cards = [['myRobots'], ['myPics'], ['friend']].map(function (p) {
          var f = has(S.ids[p[0]]) ? vfs.get(S.ids[p[0]]) : null;
          if (!f) { return null; }
          var names = kids(f.id).map(function (n) { return el('span', { class: 'rb-chip', text: n.name }); });
          return el('div', { class: 'rb-fcard' }, [el('div', { class: 'ico' }, [LCL.ui.nodeIcon(f)]), el('b', { text: f.name }), el('div', { class: 'rb-chips' }, names.length ? names : [el('i', { text: 'empty' })])]);
        });
        return el('div', { class: 'rb-done' }, [
          el('div', { class: 'rb-hero rb-wave', html: robotSVG(S.design, '0 0 200 260', '') }),
          el('div', { class: 'rb-ribbon', text: 'Robot Creator and File Explorer' }),
          el('h2', { text: 'Well done, ' + (S.design.name || 'friend') + ' and you!' }),
          el('p', { text: 'You built a robot, made folders, moved files and copied files.' }),
          el('div', { class: 'rb-fcards' }, cards),
          el('div', { class: 'rb-brow' }, [
            btn('Explore my files', 'green', function () { view = 'files'; cwd = vfs.DESKTOP; lead = ''; note = ''; render(); }),
            btn('Open File Explorer', 'grey', function () { try { LCL.openApp('explorer'); } catch (e) {} }),
            btn('Listen', 'grey', function () { say('Well done! You are a Robot Creator and File Explorer!'); })
          ])
        ]);
      }
      function render() {
        if (!alive) { return; }
        if (sel && !has(sel)) { sel = null; }
        if (!has(cwd)) { cwd = vfs.DESKTOP; }
        app.innerHTML = ''; refs = refs.btns && view === 'build' ? refs : {};
        app.appendChild(el('div', { class: 'rb-gears', html: GEARS }));
        app.appendChild(topBar());
        if (view === 'build') { app.appendChild(buildView()); }
        else if (view === 'enter') { app.appendChild(enterView()); }
        else if (view === 'done') { app.appendChild(doneView()); }
        else { app.appendChild(filesView()); }
        if (overlay) {
          app.appendChild(overlay);
          var f = app.querySelector('.rb-ovl input, .rb-ovl button'); if (f) { f.focus(); }
        }
        pop = null;
        if (view === 'files' && overlay === null && (S.stage === 's2-click') && false) { return; }
      }

      app.onkeydown = function (e) { if (e.key === 'Escape' && overlay) { closeOverlay(); } };
      offs.push(vfs.onChange(function () {
        if (pend || (view !== 'files' && view !== 'done')) { return; }
        pend = true;
        later(function () {
          pend = false; reconcile(); save();
          repair(function () { render(); });
        }, 80);
      }));
      function sized() { app.className = 'rb-app' + (root.clientWidth && root.clientWidth < 760 ? ' rb-narrow' : ''); }
      sized();

      repair(function () {
        reconcile();
        if (S.stage === 's4-paste') { S.stage = 's4-copy'; }
        view = S.stage === 'build' ? 'build' : (S.stage === 'done' ? 'done' : 'files');
        save(); render();
      });

      return {
        onOpen: function () {},
        onFocus: function () {},
        onResize: function () { sized(); },
        destroy: function () {
          var g = document.querySelectorAll('.rb-fly,.rb-ghost'), i;
          alive = false;
          for (i = 0; i < timers.length; i++) { clearTimeout(timers[i]); }
          for (i = 0; i < offs.length; i++) { if (typeof offs[i] === 'function') { offs[i](); } }
          if (dragCleanup) { dragCleanup(); }
          for (i = 0; i < g.length; i++) { if (g[i].parentNode) { g[i].parentNode.removeChild(g[i]); } }
        }
      };
    }
  });
})();