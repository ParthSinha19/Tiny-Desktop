/* apps/blockworld.js — BlockWorld Adventures v2 (Years 1–2)
 * A polished, Minecraft-inspired 2D computing adventure for Tiny Desktop.
 * Single self-contained file: Canvas renderer (lighting, particles, animated
 * sprites), maps, questions, activities, gems, star ratings and progress saving.
 *
 * Controls: Arrow keys / WASD to walk, SPACE / E / ENTER to interact,
 * click or tap the world to walk there, 1-3 to answer questions.
 */
(function () {
  'use strict';

  var LCL = window.LCL;
  if (!LCL || !LCL.registerApp) { return; }
  var el = LCL.el;
  var vfs = LCL.vfs;
  var STORE_KEY = 'blockworld.adventures.v2';
  var OLD_KEY = 'blockworld.adventures.v1';
  var PRAISE = ['Brilliant!', 'Well done!', 'Super work!', 'Fantastic!', 'You did it!', 'Amazing!'];
  var GATE = { x: 14, y: 9 };
  var COLS = 16, ROWS = 12;
  var MOVE_TIME = 0.15;
  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  var OUT = 'rgba(25,38,64,.55)';
  var GEM_COLORS = ['#ff6b8b', '#4fd0ff', '#ffd24d', '#6fe39a', '#c58bff'];
  var FACES = {
    villager: '👧', computer: '🖥️', librarian: '📚', chest: '🧰', owl: '🦉', fox: '🦊',
    robot: '🤖', miner: '⛏️', penguin: '🐧', lighthouse: '🗼', guardian: '🧙', crystal: '💎'
  };
  var HEIGHT = {
    villager: 46, librarian: 46, miner: 52, guardian: 64, computer: 36, chest: 30, owl: 36,
    fox: 40, penguin: 32, robot: 40, lighthouse: 72, crystal: 56
  };

  var THEMES = {
    village: { bg: ['#8fd8ff', '#e4f6ff'], floorA: '#6fc357', floorB: '#66ba4f', blade: '#8bd870', dark: 0, tint: 'rgba(255,225,150,.07)', ambient: 'petals', water: ['#2b93d6', '#52bdf0'] },
    storage: { bg: ['#5a3d2b', '#7b5539'], floorA: '#cf9f66', floorB: '#c4935c', blade: '#8bd870', dark: 0.2, tint: 'rgba(255,170,80,.08)', ambient: 'dust', water: ['#2b93d6', '#52bdf0'] },
    forest: { bg: ['#1d4a3a', '#2f6b4b'], floorA: '#4a9f4d', floorB: '#429645', blade: '#6fc16a', dark: 0.3, tint: 'rgba(30,70,120,.14)', ambient: 'fireflies', water: ['#2b93d6', '#52bdf0'] },
    mines: { bg: ['#2b2f3a', '#454b5a'], floorA: '#7d8190', floorB: '#747887', blade: '#8bd870', dark: 0.66, tint: 'rgba(80,60,40,.08)', ambient: 'embers', water: ['#2b93d6', '#52bdf0'] },
    frozen: { bg: ['#bfe6ff', '#eaf8ff'], floorA: '#eef8ff', floorB: '#e2f2fc', blade: '#8bd870', dark: 0, tint: 'rgba(140,200,255,.1)', ambient: 'snow', water: ['#3d8fc4', '#74c0ec'] },
    temple: { bg: ['#6b5630', '#a58d58'], floorA: '#dccb9f', floorB: '#d2bf90', blade: '#8bd870', dark: 0.42, tint: 'rgba(255,200,90,.08)', ambient: 'gold', water: ['#2b93d6', '#52bdf0'] }
  };

  /* Maps are 16 columns by 12 rows. #, T, R, B and ~ are blocked tiles. */
  var LEVELS = [
    {
      id: 'village', name: 'The Village', short: 'Village', subtitle: 'Meet the computer helpers',
      description: 'The villagers need help with their computers. Find them and lend a hand.',
      start: { x: 2, y: 9 },
      gems: [[13, 2], [7, 3], [6, 9], [12, 5], [2, 6]],
      lights: [],
      map: [
        '################', '#....T.........#', '#..T...........#', '#..............#',
        '#..====........#', '#........T.....#', '#..............#', '#..~~~.........#',
        '#..~~~.....T...#', '#..............#', '#.........T....#', '################'
      ],
      tasks: [
        {
          id: 'keyboard', x: 4, y: 5, kind: 'villager', label: 'Mia', title: 'Help Mia with her computer', icon: 'person',
          say: 'Oh no! My computer is all muddled up. Can you tell me about its parts?',
          rounds: [
            { prompt: 'Which part helps us type letters?', choices: [{ label: 'Keyboard', icon: '⌨️' }, { label: 'Mouse', icon: '🖱️' }, { label: 'Screen', icon: '🖥️' }], answer: 0, hint: 'A keyboard has lots of keys to press.' },
            { prompt: 'Which part shows pictures and words?', choices: [{ label: 'Speaker', icon: '🔊' }, { label: 'Screen', icon: '🖥️' }, { label: 'Chair', icon: '🪑' }], answer: 1, hint: 'Look at the part you are reading this on.' }
          ]
        },
        {
          id: 'computer-parts', x: 11, y: 7, kind: 'computer', label: 'Computer desk', title: 'Choose the right computer helper', icon: 'computer',
          say: 'This computer desk has lots of useful parts. Pick the right one each time!',
          rounds: [
            { prompt: 'What do we use to point and click?', item: 'Choose the right tool', choices: [{ label: 'Mouse', icon: '🖱️' }, { label: 'Speaker', icon: '🔊' }, { label: 'Book', icon: '📘' }], answer: 0, hint: 'You move it with your hand.' },
            { prompt: 'Which part lets us hear sounds?', choices: [{ label: 'Keyboard', icon: '⌨️' }, { label: 'Speakers', icon: '🔊' }, { label: 'Screen', icon: '🖥️' }], answer: 1, hint: 'Speakers play sounds and music.' },
            { prompt: 'Which machine can print on paper?', choices: [{ label: 'Printer', icon: '🖨️' }, { label: 'Mouse', icon: '🖱️' }, { label: 'Monitor', icon: '🖥️' }], answer: 0, hint: 'A printer puts words and pictures onto paper.' }
          ]
        }
      ]
    },
    {
      id: 'storage', name: 'The Storage House', short: 'Storage', subtitle: 'Files and folders',
      description: 'The librarian has mixed up the files. Help put everything in the right place.',
      start: { x: 2, y: 9 },
      gems: [[13, 1], [7, 3], [8, 7], [2, 4], [12, 8]],
      lights: [[4, 0], [11, 0]],
      map: [
        '################', '#..............#', '#..BBB....BB...#', '#..............#',
        '#....====......#', '#..............#', '#..BBB.....BBB.#', '#..............#',
        '#..............#', '#....B.........#', '#..............#', '################'
      ],
      tasks: [
        {
          id: 'file-folder', x: 4, y: 4, kind: 'librarian', label: 'Librarian', title: 'A little file and folder quiz', icon: 'folder',
          say: 'Phew, the files are all jumbled! Can you answer my questions first?',
          rounds: [
            { prompt: 'What is a file?', choices: [{ label: 'Something saved on a computer', icon: '📄' }, { label: 'A kind of sandwich', icon: '🥪' }, { label: 'A computer chair', icon: '🪑' }], answer: 0, hint: 'A picture, a song or a story can be a file.' },
            { prompt: 'What is a folder for?', choices: [{ label: 'Playing music', icon: '🎵' }, { label: 'Keeping files together', icon: '📁' }, { label: 'Making the screen brighter', icon: '💡' }], answer: 1, hint: 'A folder is like a little container for files.' }
          ]
        },
        {
          id: 'sort-files', x: 11, y: 5, kind: 'chest', label: 'Sorting chest', title: 'Sort the files into folders', icon: 'chest',
          say: 'These files need homes! Which folder does each one belong in?',
          rounds: [
            { prompt: 'Where should this photo go?', item: '🌄', choices: [{ label: 'Pictures', icon: '🖼️' }, { label: 'Music', icon: '🎵' }, { label: 'Documents', icon: '📄' }], answer: 0, hint: 'A photo is a picture.' },
            { prompt: 'Where should this story go?', item: '📖', choices: [{ label: 'Music', icon: '🎵' }, { label: 'Documents', icon: '📄' }, { label: 'Pictures', icon: '🖼️' }], answer: 1, hint: 'A story is something we read.' },
            { prompt: 'Where should this song go?', item: '🎶', choices: [{ label: 'Pictures', icon: '🖼️' }, { label: 'Documents', icon: '📄' }, { label: 'Music', icon: '🎵' }], answer: 2, hint: 'Songs are music.' }
          ]
        }
      ]
    },
    {
      id: 'forest', name: 'The Forest', short: 'Forest', subtitle: 'Patterns and problem solving',
      description: 'The forest friends have forgotten their patterns. Can you help them?',
      start: { x: 2, y: 9 },
      gems: [[13, 2], [7, 4], [7, 9], [2, 7], [13, 6]],
      lights: [],
      map: [
        '################', '#..T......T....#', '#..............#', '#...T.....T....#',
        '#..............#', '#..T......T....#', '#..............#', '#...........T..#',
        '#...T..........#', '#..............#', '#..............#', '################'
      ],
      tasks: [
        {
          id: 'patterns', x: 4, y: 5, kind: 'owl', label: 'Ollie the owl', title: 'Finish the block patterns', icon: 'pattern', type: 'pattern',
          say: 'Hoo-hoo! My pattern blocks got mixed up. Can you finish them for me?',
          rounds: [
            { prompt: 'What comes next?', pattern: ['🟥', '🟦', '🟥', '?'], choices: [{ label: 'Blue', icon: '🟦' }, { label: 'Green', icon: '🟩' }, { label: 'Yellow', icon: '🟨' }], answer: 0, hint: 'The colours take turns: red, blue, red…' },
            { prompt: 'What comes next?', pattern: ['🟨', '🟩', '🟨', '?'], choices: [{ label: 'Red', icon: '🟥' }, { label: 'Green', icon: '🟩' }, { label: 'Blue', icon: '🟦' }], answer: 1, hint: 'Look at which colour comes after yellow.' },
            { prompt: 'What comes next?', pattern: ['🟪', '🟪', '🟧', '🟪', '🟪', '?'], choices: [{ label: 'Orange', icon: '🟧' }, { label: 'Purple', icon: '🟪' }, { label: 'Green', icon: '🟩' }], answer: 0, hint: 'Two purple blocks, then one orange block.' }
          ]
        },
        {
          id: 'forest-facts', x: 10, y: 8, kind: 'fox', label: 'Fifi the fox', title: 'Forest animal questions', icon: 'fox',
          say: 'I love animals! Do you know some forest facts?',
          rounds: [
            { prompt: 'How many legs does a spider have?', choices: [{ label: 'Six', icon: '6️⃣' }, { label: 'Eight', icon: '8️⃣' }, { label: 'Four', icon: '4️⃣' }], answer: 1, hint: 'Count four legs on each side.' },
            { prompt: 'Which animal makes honey?', choices: [{ label: 'Bee', icon: '🐝' }, { label: 'Fox', icon: '🦊' }, { label: 'Frog', icon: '🐸' }], answer: 0, hint: 'It is a small flying insect that visits flowers.' }
          ]
        }
      ]
    },
    {
      id: 'mines', name: 'The Mines', short: 'Mines', subtitle: 'Instructions and algorithms',
      description: 'A little robot is stuck in the mine. Give it the right instructions.',
      start: { x: 2, y: 9 },
      gems: [[7, 2], [8, 6], [13, 4], [2, 7], [9, 9]],
      lights: [[2, 0], [7, 0], [13, 0], [0, 5], [15, 6]],
      map: [
        '################', '#RRR.......RRR.#', '#R............R#', '#...RR....RR...#',
        '#..............#', '#..RR......RR..#', '#..............#', '#....RR........#',
        '#..............#', '#............R.#', '#..............#', '################'
      ],
      tasks: [
        {
          id: 'robot-maze', x: 4, y: 4, kind: 'robot', label: 'Rover robot', title: 'Guide the robot through the maze', icon: 'robot', type: 'maze',
          say: 'Beep boop! I am stuck. Give me arrow instructions to reach the star!',
          maze: { grid: ['#####', '#...#', '#.#.#', '#...#', '#####'], start: { x: 1, y: 3 }, goal: { x: 3, y: 1 } }
        },
        {
          id: 'instructions', x: 11, y: 7, kind: 'miner', label: 'Mine helper', title: 'Think like a programmer', icon: 'pickaxe',
          say: 'Programmers think in steps. Let me see if you can think like one!',
          rounds: [
            { prompt: 'A list of steps to finish a job is called…', choices: [{ label: 'Instructions', icon: '📋' }, { label: 'A rainbow', icon: '🌈' }, { label: 'A sandwich', icon: '🥪' }], answer: 0, hint: 'Instructions tell us what to do.' },
            { prompt: 'The robot turns the wrong way. What should we do?', choices: [{ label: 'Fix the steps and try again', icon: '🔧' }, { label: 'Walk away', icon: '🚶' }, { label: 'Hide the robot', icon: '🙈' }], answer: 0, hint: 'Finding and fixing a mistake is called debugging.' }
          ]
        }
      ]
    },
    {
      id: 'frozen', name: 'The Frozen Lake', short: 'Frozen Lake', subtitle: 'The internet and staying safe',
      description: 'Help the penguins make safe choices when they use the internet.',
      start: { x: 2, y: 9 },
      gems: [[7, 2], [13, 2], [10, 6], [2, 6], [8, 9]],
      lights: [],
      map: [
        '################', '#....IIII......#', '#....IIII......#', '#....IIII......#',
        '#..............#', '#..~~~~~~......#', '#..~~~~~~......#', '#..~~~~~~......#',
        '#..............#', '#..........T...#', '#..............#', '################'
      ],
      tasks: [
        {
          id: 'online-safety', x: 4, y: 4, kind: 'penguin', label: 'Pip the penguin', title: 'Make safe choices online', icon: 'shield',
          say: 'Waddle waddle! The internet can be tricky. Help me choose safely.',
          rounds: [
            { prompt: 'A stranger asks for your password. What should you do?', choices: [{ label: 'Tell a trusted grown-up', icon: '🧑‍🏫' }, { label: 'Share your password', icon: '🔑' }, { label: 'Post it online', icon: '📢' }], answer: 0, hint: 'Keep passwords private. Ask a trusted grown-up for help.' },
            { prompt: 'A strange message pops up. What should you do?', choices: [{ label: 'Click every link', icon: '🖱️' }, { label: 'Ask a trusted grown-up', icon: '🧑‍🏫' }, { label: 'Send your address', icon: '🏠' }], answer: 1, hint: 'Stop and ask a grown-up before clicking.' },
            { prompt: 'Should we be kind to people online?', choices: [{ label: 'Yes, always', icon: '💛' }, { label: 'No, never', icon: '❌' }, { label: 'Only sometimes', icon: '🤔' }], answer: 0, hint: 'Kindness matters online and offline.' }
          ]
        },
        {
          id: 'internet-facts', x: 11, y: 8, kind: 'lighthouse', label: 'Ice lighthouse', title: 'What can the internet do?', icon: 'internet',
          say: 'My light shines across the whole internet. What do you know about it?',
          rounds: [
            { prompt: 'What can we use the internet for?', choices: [{ label: 'Learning and finding information', icon: '📚' }, { label: 'Making toast', icon: '🍞' }, { label: 'Brushing our teeth', icon: '🪥' }], answer: 0, hint: 'The internet can help us learn and find things out.' },
            { prompt: 'Who can help if something online feels wrong?', choices: [{ label: 'A trusted grown-up', icon: '🧑‍🏫' }, { label: 'A stranger online', icon: '🎭' }, { label: 'Nobody', icon: '🙅' }], answer: 0, hint: 'You can always speak to a grown-up you trust.' }
          ]
        }
      ]
    },
    {
      id: 'temple', name: 'The Ancient Temple', short: 'Temple', subtitle: 'The final adventure',
      description: 'You have nearly reached the treasure. Use everything you have learned!',
      start: { x: 2, y: 9 },
      gems: [[7, 2], [13, 3], [7, 6], [2, 5], [12, 9]],
      lights: [[3, 0], [8, 0], [12, 0], [0, 6], [15, 6]],
      map: [
        '################', '#SSSSSSSSSSSSSS#', '#S............S#', '#S..RR....RR..S#',
        '#S............S#', '#S....SS......S#', '#S............S#', '#S......RR....S#',
        '#S............S#', '#S............S#', '#SSSSSSSSSSSSSS#', '################'
      ],
      tasks: [
        {
          id: 'temple-quiz', x: 4, y: 4, kind: 'guardian', label: 'Temple guardian', title: 'A little general knowledge quiz', icon: 'scroll',
          say: 'Only the wise may pass. Answer my questions, brave explorer!',
          rounds: [
            { prompt: 'Which planet do we live on?', choices: [{ label: 'Earth', icon: '🌍' }, { label: 'Mars', icon: '🔴' }, { label: 'Saturn', icon: '🪐' }], answer: 0, hint: 'It is the planet with oceans, land and lots of life.' },
            { prompt: 'How many days are in a week?', choices: [{ label: 'Five', icon: '5️⃣' }, { label: 'Seven', icon: '7️⃣' }, { label: 'Ten', icon: '🔟' }], answer: 1, hint: 'Monday to Sunday makes seven days.' }
          ]
        },
        {
          id: 'final-challenge', x: 11, y: 7, kind: 'crystal', label: 'Golden crystal', title: 'The final computing challenge', icon: 'crystal',
          say: 'The last challenge! Show me everything you have learned.',
          rounds: [
            { prompt: 'Which one can hold lots of files?', choices: [{ label: 'A folder', icon: '📁' }, { label: 'A mouse', icon: '🖱️' }, { label: 'A screen', icon: '🖥️' }], answer: 0, hint: 'Think about the Storage House.' },
            { prompt: 'What comes next: red, blue, red…?', choices: [{ label: 'Green', icon: '🟩' }, { label: 'Blue', icon: '🟦' }, { label: 'Yellow', icon: '🟨' }], answer: 1, hint: 'The colours take turns.' },
            { prompt: 'Someone asks for your password. What should you do?', choices: [{ label: 'Keep it private and ask a grown-up', icon: '🔒' }, { label: 'Give it to them', icon: '📨' }, { label: 'Write it on a sign', icon: '🪧' }], answer: 0, hint: 'Passwords are private. A trusted grown-up can help.' }
          ]
        }
      ]
    }
  ];

  /* Pre-compute per-level lists of tall objects and water tiles. */
  LEVELS.forEach(function (l) {
    l._dyn = []; l._water = [];
    l.map.forEach(function (row, gy) {
      for (var gx = 0; gx < row.length; gx++) {
        var ch = row.charAt(gx);
        if (ch === 'T') { l._dyn.push({ k: 'T', gx: gx, gy: gy }); }
        else if (ch === 'R' && l.id === 'temple') { l._dyn.push({ k: 'P', gx: gx, gy: gy }); }
        else if (ch === '~') { l._water.push({ gx: gx, gy: gy }); }
      }
    });
  });

  var CSS = [
    '.bw-app{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;position:relative;background:linear-gradient(180deg,#cfe9ff,#eaf6ff);color:#243552;font-family:inherit;outline:none;-webkit-user-select:none;user-select:none}',
    '.bw-app *{box-sizing:border-box}',
    '.bw-header{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;background:linear-gradient(180deg,#fff,#eef6ff);border-bottom:3px solid #cfe1f5;z-index:2}',
    '.bw-logo{width:38px;height:38px;flex:none;border-radius:10px;background:linear-gradient(145deg,#6bb8ff,#3f86e0);display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:6px;box-shadow:inset 0 -4px rgba(0,0,0,.16),0 2px 6px rgba(40,90,160,.3)}',
    '.bw-logo i{display:block;background:#e4f5ff;border-radius:2px;box-shadow:inset 0 -3px rgba(0,0,0,.14)}',
    '.bw-brand{min-width:145px;margin-right:auto}.bw-brand strong{display:block;font-size:18px;line-height:1.1;color:#2557a3}.bw-brand small{font-size:11px;color:#6c7d97;font-weight:700}',
    '.bw-nav{display:flex;gap:4px;flex-wrap:wrap}',
    '.bw-levelbtn,.bw-iconbtn{width:31px;height:31px;border:0;border-radius:9px;background:#e8eef7;color:#73839b;font-weight:900;cursor:pointer;font:inherit;font-size:13px;font-weight:900}',
    '.bw-levelbtn.current{background:#ffc45b;color:#67420a;box-shadow:0 2px 0 #d28b23}.bw-levelbtn.unlocked{background:#d9f4df;color:#237348}.bw-levelbtn:disabled{opacity:.5;cursor:default}',
    '.bw-iconbtn{background:#e3efff;color:#2c66b3;font-size:15px}.bw-iconbtn:hover{background:#d3e6ff}',
    '.bw-main{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 238px;gap:10px;padding:10px}',
    '.bw-world{position:relative;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:4px solid #fff;border-radius:16px;background:#8fd5ff;box-shadow:0 6px 0 rgba(46,81,120,.14),0 10px 24px rgba(30,60,100,.18)}',
    '.bw-canvas{display:block;width:100%;height:100%;touch-action:manipulation;outline:none}',
    '.bw-hud{position:absolute;left:10px;top:10px;display:flex;gap:6px;z-index:2;pointer-events:none}',
    '.bw-chip{padding:4px 11px;border-radius:999px;background:rgba(14,26,48,.62);color:#fff;font-weight:900;font-size:13px;border:1px solid rgba(255,255,255,.35)}',
    '.bw-near{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:92%;padding:7px 14px;background:rgba(14,26,48,.84);color:#fff;border:2px solid rgba(255,255,255,.8);border-radius:12px;font-weight:800;font-size:14px;text-align:center;pointer-events:none;white-space:nowrap}',
    '.bw-near:empty{display:none}',
    '.bw-side{min-width:0;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:9px}',
    '.bw-card{background:#fff;border:2px solid #d7e6f5;border-radius:14px;padding:11px;box-shadow:0 3px 0 rgba(59,91,130,.08)}',
    '.bw-side h2{margin:0 0 4px;font-size:18px;color:#2859a5}.bw-side p{margin:0;color:#66758b;font-size:13px;line-height:1.4}',
    '.bw-count{height:9px;background:#e9eef6;border-radius:10px;overflow:hidden;margin:9px 0 5px}.bw-count span{display:block;height:100%;background:linear-gradient(90deg,#4fd08a,#2fb36c);border-radius:10px;transition:width .3s}',
    '.bw-taskrow{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #edf1f6;font-size:13px;font-weight:800;color:#40516d}',
    '.bw-taskrow:first-of-type{margin-top:5px}.bw-taskstatus{width:22px;height:22px;flex:none;border-radius:7px;display:grid;place-items:center;background:#edf2f8;color:#8291a6;font-size:13px}.bw-taskrow.done .bw-taskstatus{background:#d9f7e4;color:#21834e}',
    '.bw-taskrow .bw-tstars{margin-left:auto;color:#f0a81e;font-size:12px;letter-spacing:1px}',
    '.bw-controls-title{font-size:13px;font-weight:900;color:#52647e;margin-bottom:7px}',
    '.bw-dpad{display:grid;grid-template-columns:repeat(3,40px);grid-template-rows:repeat(2,36px);justify-content:center;gap:4px}',
    '.bw-dir{border:0;border-radius:10px;background:#e6f1ff;color:#2c66b3;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 2px 0 #bfd4ed;touch-action:none}',
    '.bw-dir:active{transform:translateY(2px);box-shadow:none}',
    '.bw-sidehint{font-size:11px!important;text-align:center;margin-top:6px!important}',
    '.bw-footer{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;background:linear-gradient(180deg,#fff,#eef6ff);border-top:3px solid #cfe1f5}',
    '.bw-status{flex:1;min-width:140px;font-size:13px;font-weight:800;color:#586b86}',
    '.bw-btn{border:0;border-radius:11px;min-height:40px;padding:0 16px;background:#4b91e7;color:#fff;font:inherit;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #2e67b0}',
    '.bw-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #2e67b0}.bw-btn.green{background:#36b978;box-shadow:0 3px 0 #218452}.bw-btn.orange{background:#f1a63d;box-shadow:0 3px 0 #bf751c}.bw-btn.grey{background:#8393a9;box-shadow:0 3px 0 #5c6b80}.bw-btn:disabled{opacity:.55;cursor:default}',
    '.bw-btn:focus-visible,.bw-choice:focus-visible,.bw-levelbtn:focus-visible,.bw-dir:focus-visible,.bw-iconbtn:focus-visible{outline:3px solid #ffb02e;outline-offset:2px}',
    '.bw-modal-layer{position:absolute;inset:0;z-index:20;background:rgba(16,30,54,.62);display:flex;align-items:center;justify-content:center;padding:14px}',
    '.bw-modal{position:relative;width:min(580px,100%);max-height:100%;overflow:auto;background:linear-gradient(180deg,#fff,#f6faff);border:4px solid #e2edfa;border-radius:20px;padding:18px;box-shadow:0 8px 0 rgba(0,0,0,.18),0 18px 40px rgba(0,0,0,.25);text-align:center;outline:none;animation:bwpop .22s ease-out}',
    '.bw-modal.shake{animation:bwshake .35s}',
    '@keyframes bwpop{from{transform:translateY(12px) scale(.95);opacity:0}to{transform:none;opacity:1}}',
    '@keyframes bwshake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}',
    '.bw-modal h2{font-size:22px;color:#2859a5;margin:0 38px 5px}.bw-modal p{font-size:16px;line-height:1.4;color:#465773;margin:8px 0 12px}',
    '.bw-modal-kicker{color:#8795aa;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}',
    '.bw-close{position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:9px;background:#edf2f8;color:#64748b;font-size:22px;font-weight:900;cursor:pointer}',
    '.bw-npc{display:flex;align-items:center;gap:12px;text-align:left;background:#f1f8ff;border:2px solid #d8e8fb;border-radius:16px;padding:12px;margin:12px 0}',
    '.bw-face{width:66px;height:66px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:36px;background:radial-gradient(circle at 30% 30%,#fff,#cfe6ff);border:3px solid #fff;box-shadow:0 3px 8px rgba(40,80,130,.25)}',
    '.bw-say{font-size:16px;line-height:1.4;font-weight:700;color:#38506f}',
    '.bw-dots{display:flex;gap:6px;justify-content:center;margin:2px 0 8px}.bw-dot{width:12px;height:12px;border-radius:50%;background:#dbe6f3}.bw-dot.on{background:#ffbf47}.bw-dot.done{background:#3fbf7c}',
    '.bw-item{display:inline-flex;align-items:center;justify-content:center;min-width:86px;min-height:65px;padding:8px 15px;margin:2px 0 10px;border-radius:14px;background:#f1f7ff;border:2px solid #d8e8fb;font-size:37px}',
    '.bw-pattern{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:8px 0 14px}.bw-pattern span{width:48px;height:48px;display:grid;place-items:center;border-radius:10px;background:#f0f4fa;font-size:29px;border:2px solid #d9e4f2}',
    '.bw-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px auto 7px;max-width:520px}',
    '.bw-choice{position:relative;min-height:96px;padding:9px 6px;border:3px solid #d7e6f7;border-radius:14px;background:#f7fbff;color:#354862;font:inherit;font-size:14px;font-weight:900;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;transition:transform .08s}',
    '.bw-choice:hover{border-color:#8bb7ee;background:#edf6ff;transform:translateY(-2px)}.bw-choice-icon{font-size:27px;line-height:1.1}',
    '.bw-choice.wrong{background:#ffe6e3;border-color:#ee8c83;opacity:.6;cursor:default;transform:none}.bw-choice.right{background:#d9f8e5;border-color:#46bd7d;transform:scale(1.04)}',
    '.bw-key{position:absolute;left:6px;top:5px;width:18px;height:18px;border-radius:6px;background:#e1ecf8;color:#6a7d97;font-size:11px;display:grid;place-items:center}',
    '.bw-feedback{min-height:28px;margin:8px 0 2px;font-size:14px;font-weight:900;color:#bd6f1c}',
    '.bw-modal-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px}',
    '.bw-maze{display:grid;grid-template-columns:repeat(5,44px);gap:4px;justify-content:center;margin:12px auto}',
    '.bw-cell{width:44px;height:44px;border-radius:8px;background:#e7f2df;border:2px solid #cbdcbe;display:grid;place-items:center;font-size:23px;position:relative}',
    '.bw-cell.wall{background:linear-gradient(180deg,#667388,#4b576b);border-color:#465368}.bw-cell.goal{background:#fff0ba;border-color:#e8bc4c}.bw-cell.robot{background:#cde9ff;border-color:#5b9bd8}',
    '.bw-cell.trail::after{content:"";width:10px;height:10px;border-radius:50%;background:#7fb8f2;position:absolute}',
    '.bw-arrowpad{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:9px 0}.bw-arrow{width:48px;height:44px;border:0;border-radius:10px;background:#e6f1ff;color:#2c66b3;font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 2px 0 #bfd4ed}.bw-arrow:disabled{opacity:.5}',
    '.bw-code{min-height:40px;border:2px dashed #d2dfef;border-radius:10px;padding:6px;display:flex;gap:4px;align-items:center;justify-content:center;flex-wrap:wrap;color:#8291a6;font-size:13px;font-weight:800}',
    '.bw-code span{width:29px;height:28px;border-radius:7px;background:#e8f2ff;color:#316bb3;display:grid;place-items:center;font-size:17px}.bw-code span.run{background:#ffc45b;color:#67420a}',
    '.bw-legend{font-size:12px!important;color:#708097!important}',
    '.bw-success-icon{font-size:52px;margin:2px 0 6px}',
    '.bw-stars{font-size:40px;letter-spacing:6px;color:#f5b01f;text-shadow:0 2px 0 rgba(150,95,0,.25)}.bw-stars .off{color:#d3dbe6;text-shadow:none}',
    '@media(max-width:800px){.bw-main{grid-template-columns:minmax(0,1fr) 205px;gap:7px;padding:7px}.bw-side{gap:7px}.bw-card{padding:9px}.bw-brand strong{font-size:16px}}',
    '@media(max-width:650px){.bw-main{grid-template-columns:1fr;grid-template-rows:minmax(230px,1fr) auto}.bw-side{display:grid;grid-template-columns:1fr 1fr;max-height:180px;overflow:auto}.bw-side .bw-card:first-child{grid-row:span 2}.bw-world{min-height:230px}.bw-footer{padding:6px 8px}.bw-choice{min-height:78px;font-size:12px}.bw-choices{gap:5px}}',
    '@media(prefers-reduced-motion:reduce){.bw-app *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('bw-style')) { return; }
    var style = document.createElement('style');
    style.id = 'bw-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ---------- small helpers ---------- */
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function speak(text) { try { if (LCL.bleep && LCL.bleep.speak) { LCL.bleep.speak(text); } } catch (e) {} }
  function safeSave(state) { try { if (vfs && vfs.setKV) { vfs.setKV(STORE_KEY, state); } } catch (e) {} }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function loadState() {
    var raw = {};
    try {
      raw = (vfs && vfs.getKV) ? (vfs.getKV(STORE_KEY, null) || vfs.getKV(OLD_KEY, {}) || {}) : {};
    } catch (e) { raw = {}; }
    var s = {
      current: Number.isFinite(Number(raw.current)) ? Number(raw.current) : 0,
      unlocked: Number.isFinite(Number(raw.unlocked)) ? Number(raw.unlocked) : 0,
      completed: raw.completed && typeof raw.completed === 'object' ? raw.completed : {},
      stars: raw.stars && typeof raw.stars === 'object' ? raw.stars : {},
      gems: raw.gems && typeof raw.gems === 'object' ? raw.gems : {},
      seen: !!raw.seen,
      finished: !!raw.finished,
      muted: !!raw.muted
    };
    s.current = Math.max(0, Math.min(LEVELS.length - 1, s.current));
    s.unlocked = Math.max(0, Math.min(LEVELS.length - 1, s.unlocked));
    LEVELS.forEach(function (level) {
      var list = s.completed[level.id];
      if (!Array.isArray(list)) { s.completed[level.id] = []; }
      else { s.completed[level.id] = list.filter(function (id) { return level.tasks.some(function (t) { return t.id === id; }); }); }
      var g = s.gems[level.id];
      if (!Array.isArray(g)) { s.gems[level.id] = []; }
      else { s.gems[level.id] = g.filter(function (i) { return Number.isFinite(i) && i >= 0 && i < level.gems.length; }); }
    });
    return s;
  }
  function isDone(state, level, task) { return (state.completed[level.id] || []).indexOf(task.id) >= 0; }
  function countDone(state, level) { return level.tasks.filter(function (task) { return isDone(state, level, task); }).length; }
  function levelDone(state, level) { return countDone(state, level) === level.tasks.length; }
  function tileAt(l, x, y) {
    if (y < 0 || y >= l.map.length || x < 0 || x >= l.map[y].length) { return '#'; }
    return l.map[y].charAt(x);
  }

  /* ---------- drawing helpers ---------- */
  function rr(c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function fillRR(c, x, y, w, h, r, fill, stroke, lw) {
    rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }
  function ell(c, x, y, rx, ry, fill, stroke, lw, rot) {
    c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }
  function poly(c, p, fill, stroke, lw) {
    c.beginPath(); c.moveTo(p[0], p[1]);
    for (var i = 2; i < p.length; i += 2) { c.lineTo(p[i], p[i + 1]); }
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.lineJoin = 'round'; c.stroke(); }
  }
  function shadow(c, x, y, rx, ry, a) { ell(c, x, y, rx, ry, 'rgba(10,20,40,' + a + ')'); }
  function lin(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function rad(c, x, y, r0, r1, stops) {
    var g = c.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function rnd(a, b, k) { var s = Math.sin(a * 127.1 + b * 311.7 + (k || 0) * 74.7) * 43758.5453; return s - Math.floor(s); }
  function shade(hex, p) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = p < 0 ? 0 : 255, q = Math.abs(p);
    r = Math.round((t - r) * q + r); g = Math.round((t - g) * q + g); b = Math.round((t - b) * q + b);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function glow(c, x, y, r, color, a) {
    c.save(); c.globalCompositeOperation = 'lighter';
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', a)); g.addColorStop(1, color.replace('A', 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.restore();
  }

  /* ---------- static tile art ---------- */
  function drawFloor(c, th, x, y, t, gx, gy) {
    var u = t / 40, T = THEMES[th], i;
    c.fillStyle = ((gx + gy) % 2 === 0) ? T.floorA : T.floorB; c.fillRect(x, y, t, t);
    if (th === 'village' || th === 'forest') {
      c.strokeStyle = T.blade; c.lineWidth = Math.max(1, 1.3 * u); c.lineCap = 'round';
      for (i = 0; i < 4; i++) {
        var bx = x + rnd(gx, gy, i) * t, by = y + 5 * u + rnd(gx, gy, i + 9) * (t - 6 * u);
        c.beginPath(); c.moveTo(bx, by); c.lineTo(bx - 1.5 * u, by - 4 * u); c.moveTo(bx + 2 * u, by); c.lineTo(bx + 3.5 * u, by - 5 * u); c.stroke();
      }
      if (rnd(gx, gy, 20) > (th === 'village' ? 0.82 : 0.9)) {
        var fx = x + (.2 + rnd(gx, gy, 21) * .6) * t, fy = y + (.25 + rnd(gx, gy, 22) * .55) * t;
        var cols = ['#ff8fb1', '#fff1a8', '#ffffff', '#b9a2ff'];
        for (i = 0; i < 5; i++) { ell(c, fx + Math.cos(i * 1.256) * 2.6 * u, fy + Math.sin(i * 1.256) * 2.6 * u, 1.9 * u, 1.9 * u, cols[Math.floor(rnd(gx, gy, 23) * 4)]); }
        ell(c, fx, fy, 1.6 * u, 1.6 * u, '#f2b33a');
      }
    } else if (th === 'storage') {
      c.fillStyle = 'rgba(70,38,12,.28)';
      c.fillRect(x, y, t, 1.6 * u); c.fillRect(x, y + t / 2, t, 1.6 * u);
      c.fillRect(x + (gy % 2 ? t * .3 : t * .7), y, 1.4 * u, t / 2);
      c.fillRect(x + (gy % 2 ? t * .7 : t * .3), y + t / 2, 1.4 * u, t / 2);
      c.fillStyle = 'rgba(255,225,170,.18)';
      c.fillRect(x + 4 * u, y + 7 * u, t * .4, 1.2 * u); c.fillRect(x + t * .5, y + t / 2 + 8 * u, t * .35, 1.2 * u);
    } else if (th === 'mines') {
      c.fillStyle = 'rgba(0,0,0,.16)';
      for (i = 0; i < 3; i++) { ell(c, x + rnd(gx, gy, i + 3) * t, y + rnd(gx, gy, i + 6) * t, 2.6 * u, 1.6 * u, 'rgba(0,0,0,.17)'); }
      if (rnd(gx, gy, 30) > .7) {
        c.strokeStyle = 'rgba(30,32,45,.35)'; c.lineWidth = Math.max(1, 1.2 * u); c.beginPath();
        c.moveTo(x + 6 * u, y + 12 * u); c.lineTo(x + 16 * u, y + 20 * u); c.lineTo(x + 14 * u, y + 30 * u); c.stroke();
      }
    } else if (th === 'frozen') {
      c.fillStyle = 'rgba(150,200,235,.22)'; ell(c, x + t * .5, y + t * .8, t * .36, t * .1, 'rgba(150,200,235,.28)');
      for (i = 0; i < 3; i++) { ell(c, x + rnd(gx, gy, i) * t, y + rnd(gx, gy, i + 4) * t, 1.2 * u, 1.2 * u, 'rgba(255,255,255,.95)'); }
    } else if (th === 'temple') {
      c.strokeStyle = 'rgba(120,92,46,.38)'; c.lineWidth = Math.max(1, 1.3 * u); c.strokeRect(x + .5, y + .5, t - 1, t - 1);
      c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(x + 2 * u, y + 2 * u, t - 4 * u, 3 * u);
      if (rnd(gx, gy, 40) > .8) { c.fillStyle = 'rgba(190,150,60,.4)'; c.fillRect(x + t * .42, y + t * .42, t * .16, t * .16); }
    }
  }
  function drawStoneTile(c, x, y, t) {
    var u = t / 40;
    c.fillStyle = '#bda877'; c.fillRect(x, y, t, t);
    c.fillStyle = '#cfba87'; c.fillRect(x + 3 * u, y + 3 * u, t - 6 * u, t - 6 * u);
    c.strokeStyle = '#e1b94f'; c.lineWidth = Math.max(1, 1.6 * u); c.strokeRect(x + 6 * u, y + 6 * u, t - 12 * u, t - 12 * u);
    c.fillStyle = '#e1b94f'; c.fillRect(x + t / 2 - 2 * u, y + t / 2 - 2 * u, 4 * u, 4 * u);
  }
  function drawIceTile(c, x, y, t, gx, gy) {
    var u = t / 40;
    c.fillStyle = lin(c, x, y, x + t, y + t, [[0, '#cdf1ff'], [1, '#8ed0ee']]); c.fillRect(x, y, t, t);
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(1, 2 * u);
    c.beginPath(); c.moveTo(x + 6 * u, y + 14 * u); c.lineTo(x + 18 * u, y + 5 * u); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(x + 22 * u, y + 34 * u); c.lineTo(x + 34 * u, y + 24 * u); c.stroke();
    if (rnd(gx, gy, 5) > .5) { c.strokeStyle = 'rgba(80,150,200,.4)'; c.lineWidth = Math.max(1, u); c.beginPath(); c.moveTo(x + 8 * u, y + 30 * u); c.lineTo(x + 20 * u, y + 24 * u); c.lineTo(x + 24 * u, y + 32 * u); c.stroke(); }
  }
  function drawPathTile(c, th, x, y, t, gx, gy) {
    var u = t / 40, i;
    if (th === 'storage') {
      c.fillStyle = '#a82f47'; c.fillRect(x, y, t, t);
      c.fillStyle = '#c24560'; c.fillRect(x, y + 2 * u, t, t - 4 * u);
      c.strokeStyle = '#f1c45a'; c.lineWidth = Math.max(1, 1.8 * u); c.strokeRect(x + 4 * u, y + 4 * u, t - 8 * u, t - 8 * u);
      poly(c, [x + t / 2, y + 12 * u, x + t / 2 + 8 * u, y + t / 2, x + t / 2, y + t - 12 * u, x + t / 2 - 8 * u, y + t / 2], 'rgba(241,196,90,.85)');
    } else {
      c.fillStyle = '#d6b57a'; c.fillRect(x, y, t, t);
      c.fillStyle = '#e6c98f'; c.fillRect(x + 2 * u, y + 2 * u, t - 4 * u, t - 4 * u);
      for (i = 0; i < 4; i++) { ell(c, x + (.15 + rnd(gx, gy, i) * .7) * t, y + (.15 + rnd(gx, gy, i + 5) * .7) * t, 3 * u, 2 * u, 'rgba(150,110,60,.35)'); }
      c.fillStyle = 'rgba(111,75,37,.14)'; c.fillRect(x, y + t - 3 * u, t, 3 * u);
    }
  }
  function drawWallTile(c, th, x, y, t, gx, gy) {
    var u = t / 40, i, k;
    if (th === 'village' || th === 'forest') {
      var base = th === 'village' ? '#2f8a3e' : '#1f5a32';
      c.fillStyle = base; c.fillRect(x, y, t, t);
      for (i = 0; i < 6; i++) {
        var px = x + rnd(gx, gy, i) * t, py = y + rnd(gx, gy, i + 7) * t, r = (7 + rnd(gx, gy, i + 3) * 6) * u;
        ell(c, px, py, r, r * .9, shade(base, .08 + rnd(gx, gy, i + 11) * .25));
      }
      for (i = 0; i < 3; i++) { ell(c, x + rnd(gx, gy, i + 30) * t, y + rnd(gx, gy, i + 40) * t * .6, 3 * u, 2 * u, 'rgba(255,255,255,.12)'); }
    } else if (th === 'storage') {
      c.fillStyle = '#7b4f35'; c.fillRect(x, y, t, t);
      c.fillStyle = '#5e3a27';
      for (i = 0; i < 4; i++) {
        c.fillRect(x, y + i * t / 4, t, 1.6 * u);
        var off = (i % 2) ? t * .25 : t * .55;
        c.fillRect(x + off, y + i * t / 4, 1.6 * u, t / 4);
        c.fillRect(x + (off + t * .5) % t, y + i * t / 4, 1.6 * u, t / 4);
      }
      c.fillStyle = 'rgba(255,200,150,.14)'; c.fillRect(x, y, t, 4 * u);
    } else if (th === 'mines') {
      c.fillStyle = '#3d4150'; c.fillRect(x, y, t, t);
      for (k = 0; k < 4; k++) {
        var cx = x + rnd(gx, gy, k) * t, cy = y + rnd(gx, gy, k + 5) * t, r2 = (8 + rnd(gx, gy, k + 9) * 8) * u;
        poly(c, [cx - r2, cy, cx - r2 * .3, cy - r2 * .9, cx + r2 * .8, cy - r2 * .4, cx + r2, cy + r2 * .5, cx, cy + r2 * .9], shade('#555b6e', (rnd(gx, gy, k + 13) - .5) * .3));
      }
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x, y, t, 3 * u);
    } else if (th === 'frozen') {
      c.fillStyle = lin(c, x, y, x, y + t, [[0, '#d3f3ff'], [1, '#6db6dc']]); c.fillRect(x, y, t, t);
      for (k = 0; k < 3; k++) {
        var fx = x + rnd(gx, gy, k) * t;
        poly(c, [fx, y, fx + 8 * u, y + t * .7, fx - 8 * u, y + t * .7], 'rgba(255,255,255,.4)');
      }
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x, y, t, 4 * u);
    } else {
      c.fillStyle = lin(c, x, y, x, y + t, [[0, '#9b8456'], [1, '#6f5c38']]); c.fillRect(x, y, t, t);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, y + t * .5, t, 1.6 * u); c.fillRect(x + (gx % 2 ? t * .3 : t * .7), y, 1.6 * u, t * .5);
      c.fillStyle = '#e1b94f'; c.fillRect(x, y + t * .78, t, 2.4 * u);
      poly(c, [x + t / 2, y + t * .3, x + t / 2 + 5 * u, y + t * .45, x + t / 2, y + t * .6, x + t / 2 - 5 * u, y + t * .45], '#e1b94f');
    }
  }
  function drawBoulder(c, th, x, y, t, gx, gy) {
    var u = t / 40;
    shadow(c, x + t / 2, y + t * .86, 15 * u, 4.5 * u, .3);
    poly(c, [x + 5 * u, y + t * .84, x + 8 * u, y + t * .46, x + 18 * u, y + t * .22, x + 31 * u, y + t * .3, x + 36 * u, y + t * .62, x + 33 * u, y + t * .84],
      lin(c, x, y + t * .2, x + t, y + t * .85, [[0, '#a7b1c0'], [1, '#5f6b7c']]), OUT, Math.max(1, 1.2 * u));
    poly(c, [x + 12 * u, y + t * .42, x + 19 * u, y + t * .28, x + 28 * u, y + t * .34, x + 20 * u, y + t * .46], 'rgba(255,255,255,.35)');
    if (th === 'mines' && rnd(gx, gy, 3) > .35) {
      poly(c, [x + 24 * u, y + t * .7, x + 27 * u, y + t * .5, x + 31 * u, y + t * .7], '#6fe6ff', OUT, u);
      poly(c, [x + 14 * u, y + t * .78, x + 16 * u, y + t * .62, x + 19 * u, y + t * .78], '#ff8fe1', OUT, u);
    }
  }
  function drawBookshelf(c, x, y, t, gx, gy) {
    var u = t / 40, i;
    shadow(c, x + t / 2, y + t * .92, 16 * u, 3.5 * u, .25);
    fillRR(c, x + 2 * u, y + 3 * u, t - 4 * u, t - 6 * u, 3 * u, lin(c, x, y, x + t, y, [[0, '#8a5638'], [1, '#6b3f27']]), OUT, Math.max(1, 1.2 * u));
    var cols = ['#e85d54', '#f0bd4b', '#4e9bd8', '#5eb879', '#a87bd0', '#ff9d5c'];
    for (var row = 0; row < 3; row++) {
      var by = y + (6 + row * 10.5) * u, bx = x + 5 * u;
      for (i = 0; i < 6; i++) {
        var w = (3.2 + rnd(gx + i, gy + row, 1) * 2.6) * u, h = (6.5 + rnd(gx + i, gy + row, 2) * 3) * u;
        if (bx + w > x + t - 5 * u) { break; }
        fillRR(c, bx, by + (9 * u - h), w, h, u, cols[Math.floor(rnd(gx + i, gy + row, 3) * cols.length)], 'rgba(0,0,0,.25)', .6);
        bx += w + .8 * u;
      }
      c.fillStyle = '#b57d4a'; c.fillRect(x + 4 * u, by + 9.5 * u, t - 8 * u, 1.8 * u);
    }
  }

  /* ---------- dynamic world art ---------- */
  function drawTree(c, th, cx, by, s, t, gx, gy) {
    var u = s / 40, sway = Math.sin(t / 900 + gx * 1.7 + gy) * 1.8 * u;
    shadow(c, cx, by - 3 * u, 14 * u, 4.2 * u, .25);
    fillRR(c, cx - 3.2 * u, by - 18 * u, 6.4 * u, 16 * u, 2 * u, lin(c, cx - 3 * u, 0, cx + 3 * u, 0, [[0, '#8a5a34'], [1, '#6b4326']]), OUT, Math.max(1, u));
    if (th === 'village') {
      var blobs = [[0, -31, 13], [-9, -24, 10], [9, -24, 10], [1, -39, 9]];
      blobs.forEach(function (b, i) {
        var bx = cx + b[0] * u + sway * (0.4 + i * .15), bY = by + b[1] * u;
        ell(c, bx, bY, b[2] * u, b[2] * .92 * u, rad(c, bx - 3 * u, bY - 4 * u, 1, b[2] * u, [[0, '#7fdc6a'], [1, '#2e9440']]), 'rgba(20,70,35,.5)', Math.max(1, u));
      });
      for (var i = 0; i < 3; i++) { if (rnd(gx, gy, i + 50) > .4) { ell(c, cx + (rnd(gx, gy, i) - .5) * 20 * u + sway * .5, by - (22 + rnd(gx, gy, i + 3) * 18) * u, 1.8 * u, 1.8 * u, '#e5483f'); } }
    } else {
      var snow = th === 'frozen', dark = th === 'forest' ? '#14502c' : '#2c8a4a';
      for (var k = 0; k < 3; k++) {
        var top = by - (50 - k * 8) * u, bot = by - (22 - k * 6) * u, hw = (9 + k * 4) * u, sx = sway * (1 - k * .25);
        poly(c, [cx + sx, top, cx - hw, bot, cx + hw, bot], lin(c, cx - hw, top, cx + hw, bot, [[0, snow ? '#3fa56a' : '#3ea157'], [1, dark]]), OUT, Math.max(1, u));
        if (snow) { poly(c, [cx + sx, top, cx - hw * .55, top + (bot - top) * .5, cx + hw * .55, top + (bot - top) * .5], 'rgba(255,255,255,.92)'); }
      }
    }
  }
  function drawPillar(c, cx, by, s) {
    var u = s / 40;
    shadow(c, cx, by - 3 * u, 14 * u, 4 * u, .3);
    fillRR(c, cx - 12 * u, by - 9 * u, 24 * u, 8 * u, 2 * u, '#b9a578', OUT, u);
    fillRR(c, cx - 8 * u, by - 50 * u, 16 * u, 42 * u, 2 * u, lin(c, cx - 8 * u, 0, cx + 8 * u, 0, [[0, '#e9dcb8'], [.6, '#cdbb8c'], [1, '#a99565']]), OUT, u);
    c.strokeStyle = 'rgba(110,85,40,.3)'; c.lineWidth = Math.max(1, u);
    for (var i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(cx + i * 4 * u, by - 48 * u); c.lineTo(cx + i * 4 * u, by - 10 * u); c.stroke(); }
    fillRR(c, cx - 12 * u, by - 56 * u, 24 * u, 8 * u, 2 * u, '#c9b588', OUT, u);
    c.fillStyle = '#e1b94f'; c.fillRect(cx - 8 * u, by - 34 * u, 16 * u, 2.4 * u);
  }
  function drawWater(c, l, ox, oy, tile, time) {
    var th = THEMES[l.id], u = tile / 40;
    function isW(gx, gy) { return tileAt(l, gx, gy) === '~'; }
    l._water.forEach(function (w) {
      var x = ox + w.gx * tile, y = oy + w.gy * tile;
      c.save(); c.beginPath(); c.rect(x, y, tile, tile); c.clip();
      c.fillStyle = lin(c, x, y, x, y + tile, [[0, th.water[1]], [1, th.water[0]]]); c.fillRect(x, y, tile, tile);
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = Math.max(1, 1.5 * u); c.lineCap = 'round';
      for (var i = 0; i < 2; i++) {
        var yy = y + (i * .5 + .24) * tile + Math.sin(time / 600 + w.gx * .9 + i * 2) * 2 * u;
        var off = Math.sin(time / 900 + w.gy + i) * 5 * u;
        c.beginPath(); c.moveTo(x + 6 * u + off, yy); c.quadraticCurveTo(x + 14 * u + off, yy - 3.5 * u, x + 24 * u + off, yy); c.stroke();
      }
      var sp = (Math.sin(time / 400 + w.gx * 3 + w.gy * 5) + 1) / 2;
      ell(c, x + (.2 + .6 * rnd(w.gx, w.gy, 1)) * tile, y + (.2 + .6 * rnd(w.gx, w.gy, 2)) * tile, 1.8 * u, 1.8 * u, 'rgba(255,255,255,' + (.2 + sp * .6) + ')');
      c.fillStyle = 'rgba(255,255,255,.6)';
      if (!isW(w.gx, w.gy - 1)) { c.fillRect(x, y, tile, 3.2 * u); }
      if (!isW(w.gx - 1, w.gy)) { c.fillRect(x, y, 3.2 * u, tile); }
      if (!isW(w.gx + 1, w.gy)) { c.fillRect(x + tile - 3.2 * u, y, 3.2 * u, tile); }
      if (!isW(w.gx, w.gy + 1)) { c.fillRect(x, y + tile - 3.2 * u, tile, 3.2 * u); }
      c.restore();
    });
  }

  function drawHuman(c, cx, by, s, o) {
    var u = s / 40, moving = !!o.moving, t = o.t || 0, lw = Math.max(1, 1.1 * u);
    var sw = moving ? Math.sin(o.phase || 0) * 3.4 * u : 0;
    var bob = moving ? Math.abs(Math.sin(o.phase || 0)) * 1.8 * u : Math.sin(t / 420 + (o.seed || 0)) * .6 * u;
    var dir = o.dir || 'down', side = dir === 'left' || dir === 'right', sg = dir === 'left' ? -1 : 1;
    var skin = o.skin || '#f0c299', hair = o.hair || '#5b3d28', shirt = o.shirt || '#3e89e8', pants = o.pants || '#39507a';
    shadow(c, cx, by - 1 * u, 10 * u, 3.6 * u, .3);
    var y = by - bob, i;
    c.lineJoin = 'round';
    // legs
    if (side) {
      fillRR(c, cx - 3 * u + sw * sg, y - 10 * u, 6 * u, 10 * u, 2.5 * u, shade(pants, -.2), OUT, lw);
      fillRR(c, cx - 3 * u + sw * sg + sg * u, y - 3.5 * u, 7 * u, 3.5 * u, 1.6 * u, '#27324a');
      fillRR(c, cx - 3 * u - sw * sg, y - 10 * u, 6 * u, 10 * u, 2.5 * u, pants, OUT, lw);
      fillRR(c, cx - 3 * u - sw * sg + sg * u, y - 3.5 * u, 7 * u, 3.5 * u, 1.6 * u, '#27324a');
    } else {
      fillRR(c, cx - 6.5 * u, y - 10 * u + sw * .5, 6 * u, 10 * u, 2.5 * u, pants, OUT, lw);
      fillRR(c, cx - 7 * u, y - 3.5 * u + sw * .5, 7 * u, 3.5 * u, 1.6 * u, '#27324a');
      fillRR(c, cx + .5 * u, y - 10 * u - sw * .5, 6 * u, 10 * u, 2.5 * u, pants, OUT, lw);
      fillRR(c, cx + 0 * u, y - 3.5 * u - sw * .5, 7 * u, 3.5 * u, 1.6 * u, '#27324a');
    }
    // torso
    var ty = y - 22 * u;
    rr(c, cx - 8.5 * u, ty, 17 * u, 15 * u, 5 * u); c.fillStyle = lin(c, 0, ty, 0, ty + 15 * u, [[0, shirt], [1, shade(shirt, -.24)]]); c.fill(); c.strokeStyle = OUT; c.lineWidth = lw; c.stroke();
    if (o.belt) { fillRR(c, cx - 8.5 * u, ty + 11 * u, 17 * u, 3 * u, 1.5 * u, o.belt); }
    // arms
    if (!side) {
      fillRR(c, cx - 13.2 * u, ty + 1.5 * u - sw * .5, 5 * u, 10 * u, 2.5 * u, shirt, OUT, lw); ell(c, cx - 10.7 * u, ty + 12.5 * u - sw * .5, 2.4 * u, 2.4 * u, skin);
      fillRR(c, cx + 8.2 * u, ty + 1.5 * u + sw * .5, 5 * u, 10 * u, 2.5 * u, shirt, OUT, lw); ell(c, cx + 10.7 * u, ty + 12.5 * u + sw * .5, 2.4 * u, 2.4 * u, skin);
    } else {
      fillRR(c, cx - 2.5 * u + sw * sg * .8, ty + 2 * u, 5 * u, 10 * u, 2.5 * u, shade(shirt, -.1), OUT, lw); ell(c, cx + sw * sg * .8, ty + 12.5 * u, 2.4 * u, 2.4 * u, skin);
    }
    // head
    var cy = ty - 6.5 * u, hr = 9.5 * u;
    if (o.pony) {
      if (!side) { ell(c, cx + 10.5 * u, cy + 1 * u, 3.8 * u, 5 * u, hair, OUT, lw, .3); }
      else { ell(c, cx - sg * 10 * u, cy + 3 * u, 3.6 * u, 5.4 * u, hair, OUT, lw, sg * .4); }
    }
    ell(c, cx, cy, hr, hr, rad(c, cx - 2 * u, cy - 3 * u, 1, hr, [[0, shade(skin, .15)], [1, skin]]), OUT, lw);
    if (dir === 'up') {
      ell(c, cx, cy, hr + .3 * u, hr + .3 * u, hair, OUT, lw);
    } else if (dir === 'down') {
      c.beginPath(); c.arc(cx, cy, hr + .4 * u, Math.PI, Math.PI * 2);
      c.quadraticCurveTo(cx + 6 * u, cy - 2 * u, cx + 2 * u, cy - 3.5 * u); c.quadraticCurveTo(cx - 3 * u, cy - 1 * u, cx - hr - .4 * u, cy);
      c.closePath(); c.fillStyle = hair; c.fill(); c.strokeStyle = OUT; c.stroke();
    } else {
      c.beginPath(); c.arc(cx, cy, hr + .4 * u, Math.PI, Math.PI * 2); c.lineTo(cx + sg * 9 * u, cy - 1 * u); c.lineTo(cx - sg * 9 * u, cy + 3 * u); c.closePath();
      c.fillStyle = hair; c.fill(); c.strokeStyle = OUT; c.stroke();
      ell(c, cx - sg * 5.5 * u, cy + 2 * u, 4.5 * u, 7 * u, hair);
    }
    var blink = (t % 3400) < 110;
    c.fillStyle = '#243049'; c.strokeStyle = '#243049';
    if (dir === 'down') {
      [-3.6, 3.6].forEach(function (sx) {
        if (blink) { c.lineWidth = lw; c.beginPath(); c.moveTo(cx + (sx - 1.6) * u, cy + 1.5 * u); c.lineTo(cx + (sx + 1.6) * u, cy + 1.5 * u); c.stroke(); }
        else { ell(c, cx + sx * u, cy + 1.5 * u, 1.7 * u, 2.2 * u, '#243049'); ell(c, cx + (sx + .6) * u, cy + .7 * u, .6 * u, .6 * u, '#fff'); }
      });
      ell(c, cx - 6.2 * u, cy + 4.6 * u, 2 * u, 1.2 * u, 'rgba(255,110,110,.35)'); ell(c, cx + 6.2 * u, cy + 4.6 * u, 2 * u, 1.2 * u, 'rgba(255,110,110,.35)');
      c.lineWidth = lw; c.beginPath(); c.arc(cx, cy + 4.2 * u, 2 * u, .2, Math.PI - .2); c.stroke();
    } else if (side) {
      if (blink) { c.lineWidth = lw; c.beginPath(); c.moveTo(cx + sg * 2.4 * u, cy + 1.5 * u); c.lineTo(cx + sg * 5.6 * u, cy + 1.5 * u); c.stroke(); }
      else { ell(c, cx + sg * 4 * u, cy + 1.5 * u, 1.7 * u, 2.2 * u, '#243049'); ell(c, cx + sg * 4.6 * u, cy + .7 * u, .6 * u, .6 * u, '#fff'); }
      ell(c, cx + sg * 6.5 * u, cy + 4.6 * u, 2 * u, 1.2 * u, 'rgba(255,110,110,.35)');
    }
    if (o.glasses && dir !== 'up') {
      c.strokeStyle = '#4a3a2a'; c.lineWidth = Math.max(1, 1.3 * u);
      if (dir === 'down') { ell(c, cx - 3.6 * u, cy + 1.5 * u, 3.4 * u, 3.4 * u, 'rgba(210,235,255,.35)', '#4a3a2a', 1.3 * u); ell(c, cx + 3.6 * u, cy + 1.5 * u, 3.4 * u, 3.4 * u, 'rgba(210,235,255,.35)', '#4a3a2a', 1.3 * u); c.beginPath(); c.moveTo(cx - .2 * u, cy + 1.5 * u); c.lineTo(cx + .2 * u, cy + 1.5 * u); c.stroke(); }
      else { ell(c, cx + sg * 4 * u, cy + 1.5 * u, 3.4 * u, 3.4 * u, 'rgba(210,235,255,.35)', '#4a3a2a', 1.3 * u); }
    }
    if (o.hat === 'hard') {
      c.beginPath(); c.arc(cx, cy - 1 * u, 10.2 * u, Math.PI, Math.PI * 2); c.closePath(); c.fillStyle = '#f4c431'; c.fill(); c.strokeStyle = OUT; c.lineWidth = lw; c.stroke();
      fillRR(c, cx - 11.5 * u, cy - 2.6 * u, 23 * u, 3.2 * u, 1.6 * u, '#e0a91d', OUT, lw);
      ell(c, cx, cy - 7 * u, 2.4 * u, 2 * u, '#fff7b0');
    } else if (o.hat === 'wizard') {
      poly(c, [cx - 11 * u, cy - 3 * u, cx + 2 * u + Math.sin(t / 600) * 1.5 * u, cy - 27 * u, cx + 11 * u, cy - 3 * u], lin(c, cx - 11 * u, cy - 27 * u, cx + 11 * u, cy, [[0, '#8d6bd8'], [1, '#4c2f98']]), OUT, lw);
      ell(c, cx, cy - 3 * u, 13 * u, 3.2 * u, '#5e3db0', OUT, lw);
      ell(c, cx - 1 * u, cy - 12 * u, 1.8 * u, 1.8 * u, '#ffe27a');
    }
  }

  function drawComputer(c, cx, by, s, t, done) {
    var u = s / 40;
    shadow(c, cx, by - 1 * u, 17 * u, 4 * u, .28);
    fillRR(c, cx - 16 * u, by - 14 * u, 32 * u, 6 * u, 2 * u, lin(c, 0, by - 14 * u, 0, by - 8 * u, [[0, '#c98f55'], [1, '#9a6538']]), OUT, u);
    fillRR(c, cx - 14 * u, by - 8 * u, 4 * u, 7 * u, 1 * u, '#7c4f2b'); fillRR(c, cx + 10 * u, by - 8 * u, 4 * u, 7 * u, 1 * u, '#7c4f2b');
    fillRR(c, cx - 3 * u, by - 20 * u, 6 * u, 7 * u, 1.5 * u, '#6c7b90');
    fillRR(c, cx - 11 * u, by - 38 * u, 22 * u, 18 * u, 3.5 * u, '#34455e', OUT, u);
    fillRR(c, cx - 9 * u, by - 36 * u, 18 * u, 14 * u, 2 * u, lin(c, 0, by - 36 * u, 0, by - 22 * u, [[0, '#8ae6ff'], [1, '#3b8fd9']]));
    c.fillStyle = 'rgba(255,255,255,.7)';
    for (var i = 0; i < 3; i++) { var wv = (5 + ((Math.floor(t / 420) + i * 3) % 6)) * u; c.fillRect(cx - 7 * u, by - 33 * u + i * 4 * u, Math.min(wv, 14 * u), 1.8 * u); }
    fillRR(c, cx - 9 * u, by - 17 * u, 14 * u, 3.4 * u, 1.4 * u, '#e5edf6', OUT, .8);
    ell(c, cx + 10 * u, by - 15.4 * u, 2.6 * u, 1.9 * u, '#f3f6fa', OUT, .8);
    if (!done) { glow(c, cx, by - 28 * u, 26 * u, 'rgba(140,220,255,A)', .22); }
  }
  function drawChest(c, cx, by, s, t, done) {
    var u = s / 40;
    shadow(c, cx, by - 1 * u, 15 * u, 4 * u, .28);
    if (!done) { glow(c, cx, by - 20 * u, 28 * u, 'rgba(255,215,100,A)', .3 + Math.sin(t / 300) * .08); }
    fillRR(c, cx - 13 * u, by - 17 * u, 26 * u, 14 * u, 2.5 * u, lin(c, 0, by - 17 * u, 0, by - 3 * u, [[0, '#b46f38'], [1, '#7f4a24']]), OUT, u);
    fillRR(c, cx - 13 * u, by - 27 * u + (done ? 3 * u : 0), 26 * u, 11 * u, 5 * u, lin(c, 0, by - 27 * u, 0, by - 16 * u, [[0, '#d99a4c'], [1, '#a76a31']]), OUT, u);
    c.fillStyle = '#5b3a20'; c.fillRect(cx - 9 * u, by - 27 * u + (done ? 3 * u : 0), 2.4 * u, 24 * u); c.fillRect(cx + 6.6 * u, by - 27 * u + (done ? 3 * u : 0), 2.4 * u, 24 * u);
    fillRR(c, cx - 3 * u, by - 20 * u, 6 * u, 7 * u, 1.2 * u, '#ffd35a', OUT, .8);
    ell(c, cx, by - 17 * u, .9 * u, .9 * u, '#7a4d10');
  }
  function drawOwl(c, cx, by, s, t) {
    var u = s / 40, y = by - Math.sin(t / 500) * .8 * u, lw = Math.max(1, 1.1 * u);
    shadow(c, cx, by - 1 * u, 11 * u, 3.4 * u, .28);
    ell(c, cx - 4 * u, y - 1.5 * u, 3.2 * u, 1.6 * u, '#f2a93b'); ell(c, cx + 4 * u, y - 1.5 * u, 3.2 * u, 1.6 * u, '#f2a93b');
    poly(c, [cx - 10 * u, y - 31 * u, cx - 3 * u, y - 27 * u, cx - 9 * u, y - 21 * u], '#7d5030', OUT, lw);
    poly(c, [cx + 10 * u, y - 31 * u, cx + 3 * u, y - 27 * u, cx + 9 * u, y - 21 * u], '#7d5030', OUT, lw);
    ell(c, cx, y - 15 * u, 12 * u, 14 * u, lin(c, 0, y - 29 * u, 0, y, [[0, '#b98250'], [1, '#7d5030']]), OUT, lw);
    ell(c, cx - 11 * u, y - 14 * u, 3.4 * u, 8 * u, '#8a5a35', OUT, lw, .15); ell(c, cx + 11 * u, y - 14 * u, 3.4 * u, 8 * u, '#8a5a35', OUT, lw, -.15);
    ell(c, cx, y - 11 * u, 7.5 * u, 9 * u, '#f1dcb0');
    c.strokeStyle = 'rgba(150,100,50,.4)'; c.lineWidth = Math.max(1, u);
    for (var i = 0; i < 3; i++) { c.beginPath(); c.arc(cx - 3 * u + i * 3 * u, y - 8 * u + (i % 2) * 4 * u, 2 * u, 0, Math.PI); c.stroke(); }
    var blink = (t % 3000) < 120;
    [-5, 5].forEach(function (sx) {
      ell(c, cx + sx * u, y - 20 * u, 5 * u, blink ? .8 * u : 5 * u, '#fff', '#f2b84a', 1.4 * u);
      if (!blink) { ell(c, cx + (sx + Math.sin(t / 900) * .8) * u, y - 20 * u, 2.4 * u, 2.4 * u, '#242c3b'); ell(c, cx + (sx + .8) * u, y - 21 * u, .8 * u, .8 * u, '#fff'); }
    });
    poly(c, [cx - 2.2 * u, y - 16.5 * u, cx + 2.2 * u, y - 16.5 * u, cx, y - 12 * u], '#f5a93a', OUT, Math.max(1, u * .8));
  }
  function drawFox(c, cx, by, s, t) {
    var u = s / 40, y = by - Math.sin(t / 560) * .7 * u, lw = Math.max(1, 1.1 * u), tw = Math.sin(t / 380) * .18;
    shadow(c, cx, by - 1 * u, 12 * u, 3.4 * u, .28);
    ell(c, cx + 11 * u, y - 8 * u, 4.6 * u, 10 * u, lin(c, 0, y - 18 * u, 0, y, [[0, '#f09a45'], [1, '#d96a25']]), OUT, lw, .7 + tw);
    ell(c, cx + 14.4 * u, y - 14 * u, 2.6 * u, 3.4 * u, '#fff', null, 0, .7 + tw);
    ell(c, cx, y - 10 * u, 9.5 * u, 10.5 * u, lin(c, 0, y - 20 * u, 0, y, [[0, '#f29a48'], [1, '#d96a25']]), OUT, lw);
    ell(c, cx, y - 8 * u, 5 * u, 7 * u, '#fff3e3');
    poly(c, [cx - 10 * u, y - 29 * u, cx - 6 * u, y - 39 * u, cx - 1 * u, y - 30 * u], '#d96a25', OUT, lw); poly(c, [cx - 8.5 * u, y - 30 * u, cx - 6 * u, y - 36 * u, cx - 3 * u, y - 30.5 * u], '#3a2418');
    poly(c, [cx + 10 * u, y - 29 * u, cx + 6 * u, y - 39 * u, cx + 1 * u, y - 30 * u], '#d96a25', OUT, lw); poly(c, [cx + 8.5 * u, y - 30 * u, cx + 6 * u, y - 36 * u, cx + 3 * u, y - 30.5 * u], '#3a2418');
    ell(c, cx, y - 23 * u, 10.5 * u, 8.5 * u, lin(c, 0, y - 32 * u, 0, y - 15 * u, [[0, '#f5a050'], [1, '#e2762c']]), OUT, lw);
    poly(c, [cx - 10 * u, y - 21 * u, cx - 1 * u, y - 15 * u, cx - 9 * u, y - 15.5 * u], '#fff'); poly(c, [cx + 10 * u, y - 21 * u, cx + 1 * u, y - 15 * u, cx + 9 * u, y - 15.5 * u], '#fff');
    var blink = (t % 3200) < 110;
    [-4, 4].forEach(function (sx) { if (blink) { c.strokeStyle = '#2a1a10'; c.beginPath(); c.moveTo(cx + (sx - 1.4) * u, y - 24 * u); c.lineTo(cx + (sx + 1.4) * u, y - 24 * u); c.stroke(); } else { ell(c, cx + sx * u, y - 24 * u, 1.4 * u, 1.9 * u, '#2a1a10'); } });
    ell(c, cx, y - 19.8 * u, 2 * u, 1.5 * u, '#1e1a1a');
  }
  function drawPenguin(c, cx, by, s, t) {
    var u = s / 40, y = by - Math.abs(Math.sin(t / 700)) * 1 * u, lw = Math.max(1, 1.1 * u);
    shadow(c, cx, by - 1 * u, 11 * u, 3.2 * u, .28);
    ell(c, cx - 4.5 * u, y - 1.6 * u, 3.6 * u, 1.7 * u, '#f4a638'); ell(c, cx + 4.5 * u, y - 1.6 * u, 3.6 * u, 1.7 * u, '#f4a638');
    ell(c, cx - 10 * u, y - 14 * u, 3 * u, 8 * u, '#1e2f46', OUT, lw, .25 + Math.sin(t / 400) * .08); ell(c, cx + 10 * u, y - 14 * u, 3 * u, 8 * u, '#1e2f46', OUT, lw, -.25 - Math.sin(t / 400) * .08);
    ell(c, cx, y - 15 * u, 10.5 * u, 14.5 * u, lin(c, 0, y - 30 * u, 0, y, [[0, '#2f4663'], [1, '#17263a']]), OUT, lw);
    ell(c, cx, y - 12.5 * u, 6.8 * u, 10.5 * u, '#fff');
    fillRR(c, cx - 9.5 * u, y - 18.5 * u, 19 * u, 4.2 * u, 2 * u, '#e04a4a', OUT, lw); fillRR(c, cx + 3 * u, y - 16 * u, 4.4 * u, 8 * u, 1.6 * u, '#cf3b3b', OUT, lw);
    var blink = (t % 3300) < 110;
    [-3.4, 3.4].forEach(function (sx) { ell(c, cx + sx * u, y - 23 * u, 2.7 * u, blink ? .6 * u : 2.7 * u, '#fff'); if (!blink) { ell(c, cx + sx * u, y - 22.6 * u, 1.3 * u, 1.3 * u, '#17263a'); } });
    poly(c, [cx - 2.4 * u, y - 20 * u, cx + 2.4 * u, y - 20 * u, cx, y - 16.8 * u], '#f4a638', OUT, Math.max(1, u * .8));
  }
  function drawRobot(c, cx, by, s, t) {
    var u = s / 40, y = by - Math.abs(Math.sin(t / 500)) * 1.2 * u, lw = Math.max(1, 1.1 * u);
    shadow(c, cx, by - 1 * u, 13 * u, 3.5 * u, .3);
    fillRR(c, cx - 12 * u, y - 6 * u, 24 * u, 6 * u, 3 * u, '#38475b', OUT, lw);
    for (var i = 0; i < 4; i++) { c.fillStyle = '#5c6e86'; c.fillRect(cx - 9 * u + i * 6 * u, y - 4.5 * u, 2.6 * u, 3 * u); }
    fillRR(c, cx - 15 * u, y - 22 * u, 4.4 * u, 11 * u, 2 * u, '#7f93a8', OUT, lw); fillRR(c, cx + 10.6 * u, y - 22 * u, 4.4 * u, 11 * u, 2 * u, '#7f93a8', OUT, lw);
    fillRR(c, cx - 10 * u, y - 24 * u, 20 * u, 19 * u, 4.5 * u, lin(c, 0, y - 24 * u, 0, y - 5 * u, [[0, '#b7c8d8'], [1, '#7f93a8']]), OUT, lw);
    fillRR(c, cx - 5 * u, y - 19 * u, 10 * u, 6 * u, 2 * u, '#16283d'); ell(c, cx, y - 16 * u, 1.8 * u, 1.8 * u, (Math.floor(t / 500) % 2) ? '#ff7a7a' : '#7dffa6');
    fillRR(c, cx - 8.5 * u, y - 39 * u, 17 * u, 14 * u, 4.5 * u, lin(c, 0, y - 39 * u, 0, y - 25 * u, [[0, '#c8d7e5'], [1, '#8da1b6']]), OUT, lw);
    fillRR(c, cx - 6.5 * u, y - 36 * u, 13 * u, 8 * u, 3 * u, '#10243a');
    ell(c, cx - 3 * u, y - 32 * u, 1.9 * u, 2.2 * u, '#83efff'); ell(c, cx + 3 * u, y - 32 * u, 1.9 * u, 2.2 * u, '#83efff');
    c.strokeStyle = '#6a7c90'; c.lineWidth = Math.max(1, 1.4 * u); c.beginPath(); c.moveTo(cx, y - 39 * u); c.lineTo(cx, y - 45 * u); c.stroke();
    ell(c, cx, y - 46 * u, 2.2 * u, 2.2 * u, (Math.floor(t / 400) % 2) ? '#ff6a6a' : '#7a2a2a');
  }
  function drawLighthouse(c, cx, by, s, t) {
    var u = s / 40, lw = Math.max(1, 1.1 * u);
    function halfW(h) { return (11 - 3.6 * (h / 50)) * u; }
    shadow(c, cx, by - 2 * u, 15 * u, 4 * u, .3);
    var bands = [[0, 50, '#f7f4ea'], [10, 20, '#d9534e'], [30, 40, '#d9534e']];
    poly(c, [cx - halfW(0), by - 3 * u, cx - halfW(50), by - 53 * u, cx + halfW(50), by - 53 * u, cx + halfW(0), by - 3 * u], lin(c, cx - 12 * u, 0, cx + 12 * u, 0, [[0, '#ffffff'], [1, '#d6d2c2']]), OUT, lw);
    bands.slice(1).forEach(function (b) { poly(c, [cx - halfW(b[0]), by - 3 * u - b[0] * u, cx - halfW(b[1]), by - 3 * u - b[1] * u, cx + halfW(b[1]), by - 3 * u - b[1] * u, cx + halfW(b[0]), by - 3 * u - b[0] * u], b[2]); });
    fillRR(c, cx - 3 * u, by - 14 * u, 6 * u, 11 * u, 2.5 * u, '#5c7f9d', OUT, lw);
    fillRR(c, cx - 8 * u, by - 56 * u, 16 * u, 5 * u, 1.5 * u, '#8b8f99', OUT, lw);
    fillRR(c, cx - 6 * u, by - 66 * u, 12 * u, 10 * u, 2 * u, 'rgba(255,238,160,.95)', OUT, lw);
    poly(c, [cx - 8 * u, by - 66 * u, cx, by - 74 * u, cx + 8 * u, by - 66 * u], '#d9534e', OUT, lw);
    var a = t / 700, bx = Math.cos(a) * 70 * u, by2 = Math.sin(a) * 6 * u;
    c.save(); c.globalCompositeOperation = 'lighter';
    var g = c.createLinearGradient(cx, by - 61 * u, cx + bx, by - 61 * u + by2);
    g.addColorStop(0, 'rgba(255,240,160,.5)'); g.addColorStop(1, 'rgba(255,240,160,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(cx, by - 61 * u); c.lineTo(cx + bx, by - 61 * u + by2 - 10 * u); c.lineTo(cx + bx, by - 61 * u + by2 + 10 * u); c.closePath(); c.fill();
    c.restore();
    glow(c, cx, by - 61 * u, 22 * u, 'rgba(255,230,120,A)', .45);
  }
  function drawCrystal(c, cx, by, s, t, done) {
    var u = s / 40, fl = Math.sin(t / 600) * 3 * u, lw = Math.max(1, 1.1 * u);
    shadow(c, cx, by - 1 * u, 13 * u, 3.6 * u, .3);
    fillRR(c, cx - 11 * u, by - 7 * u, 22 * u, 6 * u, 2 * u, '#b8a678', OUT, lw);
    glow(c, cx, by - 30 * u + fl, 36 * u, 'rgba(255,220,110,A)', done ? .2 : .45);
    var y = by + fl;
    poly(c, [cx, y - 50 * u, cx + 10 * u, y - 38 * u, cx + 10 * u, y - 24 * u, cx, y - 14 * u, cx - 10 * u, y - 24 * u, cx - 10 * u, y - 38 * u],
      lin(c, cx - 10 * u, y - 50 * u, cx + 10 * u, y - 14 * u, [[0, '#d5fbff'], [.5, '#4fd6f0'], [1, '#2a78d6']]), OUT, lw);
    poly(c, [cx, y - 50 * u, cx + 10 * u, y - 38 * u, cx, y - 32 * u, cx - 10 * u, y - 38 * u], 'rgba(255,255,255,.45)');
    poly(c, [cx, y - 32 * u, cx + 10 * u, y - 38 * u, cx + 10 * u, y - 24 * u, cx, y - 14 * u], 'rgba(20,70,160,.25)');
    for (var i = 0; i < 3; i++) {
      var a = t / 700 + i * 2.1; var sx = cx + Math.cos(a) * 17 * u, sy = y - 32 * u + Math.sin(a) * 7 * u;
      ell(c, sx, sy, 1.6 * u, 1.6 * u, 'rgba(255,245,170,.95)');
    }
  }

  function drawGate(c, cx, by, s, t, open) {
    var u = s / 40, lw = Math.max(1, 1.2 * u);
    shadow(c, cx, by - 1 * u, 19 * u, 4 * u, .3);
    if (open) { glow(c, cx, by - 22 * u, 42 * u, 'rgba(120,230,255,A)', .5); }
    // portal
    c.save();
    c.beginPath(); c.moveTo(cx - 10 * u, by - 3 * u); c.lineTo(cx - 10 * u, by - 34 * u); c.arc(cx, by - 34 * u, 10 * u, Math.PI, Math.PI * 2); c.lineTo(cx + 10 * u, by - 3 * u); c.closePath();
    c.clip();
    if (open) {
      c.fillStyle = rad(c, cx, by - 24 * u, 1, 24 * u, [[0, '#fffbd0'], [.45, '#5fe0ff'], [1, '#3a50d8']]); c.fillRect(cx - 12 * u, by - 46 * u, 24 * u, 46 * u);
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = Math.max(1, 1.6 * u);
      for (var i = 0; i < 4; i++) { c.beginPath(); c.arc(cx, by - 24 * u, (4 + i * 4.5) * u, t / 380 * (i % 2 ? 1 : -1) + i, t / 380 * (i % 2 ? 1 : -1) + i + 1.8); c.stroke(); }
    } else {
      c.fillStyle = lin(c, 0, by - 46 * u, 0, by, [[0, '#2f4468'], [1, '#18243a']]); c.fillRect(cx - 12 * u, by - 46 * u, 24 * u, 46 * u);
      c.fillStyle = 'rgba(120,160,230,.15)'; for (var j = 0; j < 4; j++) { c.fillRect(cx - 10 * u + j * 6 * u, by - 40 * u, 2 * u, 36 * u); }
    }
    c.restore();
    // pillars + lintel
    fillRR(c, cx - 19 * u, by - 44 * u, 9 * u, 43 * u, 2.5 * u, lin(c, cx - 19 * u, 0, cx - 10 * u, 0, [[0, '#c9bb97'], [1, '#9b8a63']]), OUT, lw);
    fillRR(c, cx + 10 * u, by - 44 * u, 9 * u, 43 * u, 2.5 * u, lin(c, cx + 10 * u, 0, cx + 19 * u, 0, [[0, '#b8a883'], [1, '#8d7d58']]), OUT, lw);
    c.beginPath(); c.arc(cx, by - 34 * u, 15 * u, Math.PI, Math.PI * 2); c.arc(cx, by - 34 * u, 10 * u, Math.PI * 2, Math.PI, true); c.closePath();
    c.fillStyle = lin(c, cx - 15 * u, by - 49 * u, cx + 15 * u, by - 34 * u, [[0, '#d9cba5'], [1, '#a89868']]); c.fill(); c.strokeStyle = OUT; c.lineWidth = lw; c.stroke();
    var rune = open ? '#ffe27a' : '#6d6a60';
    for (var r = 0; r < 3; r++) { c.fillStyle = rune; c.fillRect(cx - 16 * u, by - 36 * u + r * 9 * u, 3 * u, 3 * u); c.fillRect(cx + 13 * u, by - 36 * u + r * 9 * u, 3 * u, 3 * u); }
    if (open) { ell(c, cx, by - 49 * u, 2.4 * u, 2.4 * u, '#ffe27a'); }
    else {
      fillRR(c, cx - 5 * u, by - 22 * u, 10 * u, 8 * u, 2 * u, '#f0b73a', OUT, lw);
      c.strokeStyle = '#c99626'; c.lineWidth = Math.max(1, 2 * u); c.beginPath(); c.arc(cx, by - 22 * u, 3.6 * u, Math.PI, Math.PI * 2); c.stroke();
      ell(c, cx, by - 18 * u, 1.1 * u, 1.1 * u, '#6b4a10');
    }
  }
  function drawGem(c, cx, cy, s, t, idx) {
    var u = s / 40, col = GEM_COLORS[idx % GEM_COLORS.length], fl = Math.sin(t / 380 + idx * 1.3) * 2.4 * u;
    var y = cy + fl;
    shadow(c, cx, cy + 9 * u, 6 * u - fl * .2, 1.8 * u, .22);
    glow(c, cx, y, 17 * u, 'rgba(255,255,255,A)', .35);
    poly(c, [cx, y - 8 * u, cx + 6.5 * u, y - 2 * u, cx, y + 8 * u, cx - 6.5 * u, y - 2 * u], lin(c, cx - 6 * u, y - 8 * u, cx + 6 * u, y + 8 * u, [[0, shade(col, .5)], [.5, col], [1, shade(col, -.3)]]), OUT, Math.max(1, u));
    poly(c, [cx - 6.5 * u, y - 2 * u, cx, y - 8 * u, cx + 6.5 * u, y - 2 * u, cx, y], 'rgba(255,255,255,.4)');
    var a = (Math.sin(t / 250 + idx * 2) + 1) / 2;
    c.strokeStyle = 'rgba(255,255,255,' + (a * .9) + ')'; c.lineWidth = Math.max(1, 1.3 * u);
    c.beginPath(); c.moveTo(cx + 7 * u, y - 8 * u); c.lineTo(cx + 7 * u, y - 3 * u); c.moveTo(cx + 4.5 * u, y - 5.5 * u); c.lineTo(cx + 9.5 * u, y - 5.5 * u); c.stroke();
  }
  function drawThing(c, task, cx, by, s, t, done, seed) {
    var k = task.kind;
    if (k === 'computer') { drawComputer(c, cx, by, s, t, done); }
    else if (k === 'chest') { drawChest(c, cx, by, s, t, done); }
    else if (k === 'owl') { drawOwl(c, cx, by, s, t); }
    else if (k === 'fox') { drawFox(c, cx, by, s, t); }
    else if (k === 'penguin') { drawPenguin(c, cx, by, s, t); }
    else if (k === 'robot') { drawRobot(c, cx, by, s, t); }
    else if (k === 'lighthouse') { drawLighthouse(c, cx, by, s, t); }
    else if (k === 'crystal') { drawCrystal(c, cx, by, s, t, done); }
    else if (k === 'miner') { drawHuman(c, cx, by, s, { t: t, seed: seed, dir: 'down', shirt: '#d0842f', hair: '#4d3524', pants: '#4a4f66', hat: 'hard', belt: '#6b4a24' }); }
    else if (k === 'guardian') { drawHuman(c, cx, by, s, { t: t, seed: seed, dir: 'down', shirt: '#6a4bb5', hair: '#e8d9a8', pants: '#3d2f72', hat: 'wizard', belt: '#e1b94f' }); }
    else if (k === 'librarian') { drawHuman(c, cx, by, s, { t: t, seed: seed, dir: 'down', shirt: '#8a62c9', hair: '#c4c4d2', pants: '#4a4660', glasses: true, belt: '#d9a441' }); }
    else { drawHuman(c, cx, by, s, { t: t, seed: seed, dir: 'down', shirt: '#ef6f8e', hair: '#8a4b2a', pants: '#5b5f9b', pony: true }); }
  }
  function drawPill(c, cx, y, text, s) {
    c.font = '800 ' + Math.max(10, s * .27) + 'px sans-serif';
    var w = c.measureText(text).width + 14, h = Math.max(16, s * .42);
    fillRR(c, cx - w / 2, y - h / 2, w, h, h / 2, 'rgba(14,26,48,.82)', 'rgba(255,255,255,.8)', 1.2);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, cx, y + .5);
  }
  function drawMarker(c, cx, topY, s, t, done) {
    var u = s / 40, y = topY - 8 * u + Math.sin(t / 300) * 2 * u;
    c.beginPath(); c.arc(cx, y, 8.5 * u, 0, Math.PI * 2);
    c.fillStyle = done ? '#58cf8d' : '#ffd24a'; c.fill(); c.strokeStyle = done ? '#1f7d49' : '#b07a10'; c.lineWidth = Math.max(1, 1.6 * u); c.stroke();
    c.fillStyle = done ? '#fff' : '#5a3a00'; c.font = '900 ' + (12 * u) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(done ? '✓' : '!', cx, y + .6 * u);
  }

  /* ================= APP ================= */
  LCL.registerApp({
    id: 'blockworld',
    title: 'BlockWorld Adventures',
    icon: 'blockworld',
    w: 1080, h: 720, minW: 650, minH: 520,
    help: 'Explore a blocky world, collect gems, solve simple computing challenges and unlock new places. Use the arrow keys or WASD to walk.',
    mount: function (root, ctx) {
      injectCSS();
      var alive = true;
      var state = loadState();
      var levelIndex = state.current;
      var P = { x: 0, y: 0, rx: 0, ry: 0, fromX: 0, fromY: 0, t: 0, moving: false, dir: 'down', phase: 0, steps: 0 };
      var held = [], queued = null, path = [], pendingInteract = false, pendingFace = null;
      var activeTask = null, message = null;
      var statusText = 'Explore the world. Find a character or object to help.';
      var hasFocus = true;
      var ambient = [], bursts = [];
      var raf = 0, lastT = 0, clock = 0, bannerAt = -99999, bannerReq = true, fade = 1;
      var lastBump = 0, lastNearText = null;
      var app = null, canvas, worldCtx, worldPane, nearPrompt, nav, side, status, modalLayer, interactBtn, soundBtn, hudGems, hudStars;
      var dpr = 1, view = { tile: 40, ox: 0, oy: 0, width: 0, height: 0 };
      var staticCanvas = null, staticKey = '';
      var lightC = document.createElement('canvas'), lightX = lightC.getContext('2d');
      var actx = null;

      function L() { return LEVELS[levelIndex]; }
      function persist() { state.current = levelIndex; safeSave(state); }
      function modalOpen() { return !!(activeTask || message); }
      function focusApp() { try { if (app) { app.focus({ preventScroll: true }); } } catch (e) {} }

      /* ---------- sound ---------- */
      function synth(seq) {
        try {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) { return; }
          if (!actx) { actx = new AC(); }
          if (actx.state === 'suspended') { actx.resume(); }
          var t0 = actx.currentTime;
          seq.forEach(function (n) {
            var o = actx.createOscillator(), g = actx.createGain(), v = n[4] || 0.08;
            o.type = n[3] || 'triangle'; o.frequency.value = n[0];
            g.gain.setValueAtTime(0.0001, t0 + n[1]);
            g.gain.exponentialRampToValueAtTime(v, t0 + n[1] + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[1] + n[2]);
            o.connect(g); g.connect(actx.destination);
            o.start(t0 + n[1]); o.stop(t0 + n[1] + n[2] + 0.03);
          });
        } catch (e) {}
      }
      function play(name) {
        if (state.muted) { return; }
        if (name === 'gem') { synth([[880, 0, 0.09, 'triangle'], [1320, 0.07, 0.16, 'triangle']]); return; }
        if (name === 'bump') { synth([[130, 0, 0.08, 'square', 0.04]]); return; }
        if (name === 'portal') { synth([[392, 0, 0.12], [523, 0.1, 0.12], [659, 0.2, 0.12], [784, 0.3, 0.35]]); return; }
        try { if (LCL.sound && LCL.sound.play) { LCL.sound.play(name); return; } } catch (e) {}
        var fb = { step: [[220, 0, 0.04, 'sine', 0.03]], oops: [[200, 0, 0.18, 'sawtooth', 0.05]], good: [[660, 0, 0.1], [880, 0.08, 0.14]], pop: [[520, 0, 0.06, 'sine']], tada: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.25]] };
        if (fb[name]) { synth(fb[name]); }
      }

      /* ---------- world queries ---------- */
      function thingAtXY(x, y) {
        var tasks = L().tasks;
        for (var i = 0; i < tasks.length; i++) { if (tasks[i].x === x && tasks[i].y === y) { return { task: tasks[i], x: x, y: y }; } }
        if (x === GATE.x && y === GATE.y) { return { gate: true, x: x, y: y }; }
        return null;
      }
      function isBlockedTile(x, y) {
        var ch = tileAt(L(), x, y);
        if ('#TRB~'.indexOf(ch) >= 0) { return true; }
        return !!thingAtXY(x, y);
      }
      function getTarget() {
        var f = DIRS[P.dir], t = thingAtXY(P.x + f[0], P.y + f[1]);
        if (t) { return t; }
        var names = ['up', 'down', 'left', 'right'];
        for (var i = 0; i < 4; i++) { t = thingAtXY(P.x + DIRS[names[i]][0], P.y + DIRS[names[i]][1]); if (t) { return t; } }
        return null;
      }
      function allTasksDone() { return levelDone(state, L()); }
      function gemsFound(l) { return (state.gems[l.id] || []).length; }
      function totalStars() { var n = 0; Object.keys(state.stars).forEach(function (k) { n += Number(state.stars[k]) || 0; }); return n; }
      function bfs(sx, sy, isGoal) {
        var seen = {}, q = [{ x: sx, y: sy, p: [] }];
        seen[sx + ',' + sy] = 1;
        while (q.length) {
          var n = q.shift();
          if (isGoal(n.x, n.y) && n.p.length) { return n.p; }
          for (var nm in DIRS) {
            var nx = n.x + DIRS[nm][0], ny = n.y + DIRS[nm][1], key = nx + ',' + ny;
            if (seen[key] || isBlockedTile(nx, ny)) { continue; }
            seen[key] = 1; q.push({ x: nx, y: ny, p: n.p.concat([{ x: nx, y: ny }]) });
          }
        }
        return null;
      }
      function walkTo(gx, gy) {
        if (modalOpen() || gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) { return; }
        var thing = thingAtXY(gx, gy), p;
        held = []; queued = null; path = []; pendingInteract = false;
        if (thing) {
          if (Math.abs(P.x - gx) + Math.abs(P.y - gy) === 1 && !P.moving) { faceToward(gx, gy); interact(); return; }
          p = bfs(P.x, P.y, function (x, y) { return Math.abs(x - gx) + Math.abs(y - gy) === 1; });
          if (p) { path = p; pendingInteract = true; pendingFace = { x: gx, y: gy }; }
          return;
        }
        if (isBlockedTile(gx, gy)) { return; }
        p = bfs(P.x, P.y, function (x, y) { return x === gx && y === gy; });
        if (p) { path = p; }
      }
      function faceToward(tx, ty) {
        var dx = tx - P.x, dy = ty - P.y;
        if (Math.abs(dx) >= Math.abs(dy)) { P.dir = dx < 0 ? 'left' : 'right'; } else { P.dir = dy < 0 ? 'up' : 'down'; }
      }

      /* ---------- movement ---------- */
      function startMove(dx, dy) {
        P.fromX = P.x; P.fromY = P.y; P.x += dx; P.y += dy; P.t = 0; P.moving = true; P.steps++;
        P.dir = dx < 0 ? 'left' : (dx > 0 ? 'right' : (dy < 0 ? 'up' : 'down'));
        if (P.steps % 2 === 0) { play('step'); }
      }
      function tryMove(dirName) {
        var d = DIRS[dirName];
        P.dir = dirName;
        if (!isBlockedTile(P.x + d[0], P.y + d[1])) { startMove(d[0], d[1]); }
        else if (clock - lastBump > 280) { lastBump = clock; play('bump'); }
      }
      function spawnBurst(tx, ty, colors, n, speed, kind) {
        for (var i = 0; i < n; i++) {
          var a = Math.random() * Math.PI * 2, sp = (0.3 + Math.random()) * speed;
          bursts.push({ x: tx, y: ty, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - speed * .6, life: .6 + Math.random() * .5, max: 1.1, size: 1.5 + Math.random() * 2.2, color: pick(colors), kind: kind || 'spark' });
        }
      }
      function onArrive() {
        var l = L(), found = state.gems[l.id];
        var puff = l.id === 'frozen' ? ['#ffffff'] : ['#ffffff', '#e8d6a8'];
        spawnBurst(P.x + .5, P.y + .95, puff, 2, .5, 'puff');
        l.gems.forEach(function (g, i) {
          if (g[0] === P.x && g[1] === P.y && found.indexOf(i) < 0) {
            found.push(i); persist(); play('gem');
            spawnBurst(P.x + .5, P.y + .5, [GEM_COLORS[i % 5], '#ffffff', '#ffe27a'], 16, 3.2);
            var all = found.length === l.gems.length;
            if (all) { spawnBurst(P.x + .5, P.y + .5, GEM_COLORS, 30, 4.5); }
            setStatus(all ? 'You found every gem here! 💎' : 'You found a gem! 💎 ' + found.length + ' of ' + l.gems.length);
            updateHud(); updateSide();
          }
        });
        updateNear();
      }
      function update(dt) {
        if (P.moving) {
          P.t += dt / MOVE_TIME; P.phase += dt * 15;
          if (P.t >= 1) { P.t = 1; P.moving = false; P.rx = P.x; P.ry = P.y; onArrive(); }
          else { P.rx = P.fromX + (P.x - P.fromX) * P.t; P.ry = P.fromY + (P.y - P.fromY) * P.t; }
        }
        if (!P.moving && !modalOpen()) {
          var d = held.length ? held[held.length - 1] : queued;
          queued = null;
          if (d) { path = []; pendingInteract = false; tryMove(d); }
          else if (path.length) {
            var n = path[0], dx = n.x - P.x, dy = n.y - P.y;
            if (Math.abs(dx) + Math.abs(dy) === 1 && !isBlockedTile(n.x, n.y)) { path.shift(); startMove(dx, dy); }
            else { path = []; pendingInteract = false; }
          } else if (pendingInteract) {
            pendingInteract = false;
            if (pendingFace) { faceToward(pendingFace.x, pendingFace.y); }
            interact();
          }
        }
        if (!P.moving) { P.phase = 0; }
        // particles
        var k = THEMES[L().id].ambient;
        ambient.forEach(function (p) {
          p.ph += dt * p.sp * 2;
          if (k === 'snow') { p.y += dt * (.8 + p.sp); p.x += Math.sin(p.ph) * dt * .6 + dt * .15; }
          else if (k === 'petals') { p.x += dt * (.35 + p.sp * .4); p.y += dt * (.25 + p.sp * .2) + Math.sin(p.ph) * dt * .3; }
          else if (k === 'embers' || k === 'gold') { p.y -= dt * (.25 + p.sp * .4); p.x += Math.sin(p.ph) * dt * .25; }
          else if (k === 'fireflies') { p.x += Math.cos(p.ph * .7) * dt * .5; p.y += Math.sin(p.ph * .9) * dt * .4; }
          else { p.x += Math.sin(p.ph) * dt * .1; p.y += Math.cos(p.ph * .8) * dt * .08 - dt * .03; }
          if (p.x > COLS) { p.x -= COLS; } if (p.x < 0) { p.x += COLS; }
          if (p.y > ROWS) { p.y -= ROWS; } if (p.y < 0) { p.y += ROWS; }
        });
        for (var i = bursts.length - 1; i >= 0; i--) {
          var b = bursts[i]; b.life -= dt;
          if (b.life <= 0) { bursts.splice(i, 1); continue; }
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.kind === 'spark') { b.vy += 5 * dt; } else { b.vy -= 0.2 * dt; }
        }
        if (allTasksDone() && Math.random() < dt * 14) {
          bursts.push({ x: GATE.x + .5 + (Math.random() - .5) * .5, y: GATE.y + .5, vx: (Math.random() - .5) * .3, vy: -.8 - Math.random() * .5, life: 1, max: 1, size: 1.6, color: '#fff3a3', kind: 'spark2' });
        }
        if (fade > 0) { fade = Math.max(0, fade - dt * 2.2); }
      }
      function seedAmbient() {
        var k = THEMES[L().id].ambient, counts = { petals: 18, dust: 26, fireflies: 22, embers: 28, snow: 64, gold: 30 };
        ambient = [];
        for (var i = 0; i < (counts[k] || 0); i++) { ambient.push({ x: Math.random() * COLS, y: Math.random() * ROWS, ph: Math.random() * 6.28, sp: .3 + Math.random() * .7, sz: .6 + Math.random() }); }
      }

      /* ---------- game flow ---------- */
      function setStatus(text) { statusText = text; if (status) { status.textContent = text; } }
      function enterLevel(index) {
        levelIndex = index;
        var l = L();
        P.x = l.start.x; P.y = l.start.y; P.rx = P.x; P.ry = P.y; P.moving = false; P.dir = 'down'; P.t = 0;
        held = []; queued = null; path = []; pendingInteract = false; bursts = [];
        staticKey = ''; fade = 1; bannerReq = true;
        seedAmbient(); persist(); renderGame();
      }
      function interact() {
        if (!alive || modalOpen()) { return; }
        var target = getTarget();
        if (!target) { setStatus('Walk closer to a character or object, then press SPACE.'); play('oops'); return; }
        if (target.gate) { useGate(); return; }
        var task = target.task;
        held = []; path = [];
        activeTask = { task: task, stage: 'intro', round: 0, wrong: 0, moves: [], rounds: null, eliminated: {}, rightIdx: null, feedback: '', running: false, locked: false, shake: false };
        if (task.rounds) {
          activeTask.rounds = task.rounds.map(function (r) {
            var ch = r.choices.map(function (c, i) { return { label: c.label, icon: c.icon, correct: i === r.answer }; });
            return { prompt: r.prompt, item: r.item, pattern: r.pattern, hint: r.hint, choices: shuffle(ch) };
          });
        }
        play('pop'); renderModal();
      }
      function useGate() {
        if (!allTasksDone()) {
          var left = L().tasks.length - countDone(state, L());
          showMessage('The gate is still closed', 'Finish ' + (left === 1 ? 'the last challenge' : 'both challenges') + ' in this area first. Look for the characters with a glowing ❗ above them.', 'Keep exploring', closeMessage, '🔒');
          play('oops'); return;
        }
        spawnBurst(GATE.x + .5, GATE.y + .5, ['#fff3a3', '#7fe7ff', '#ffffff'], 24, 3);
        if (levelIndex < LEVELS.length - 1) {
          state.unlocked = Math.max(state.unlocked, levelIndex + 1);
          enterLevel(levelIndex + 1); play('portal');
          showMessage('New area unlocked!', 'Welcome to ' + L().name + '. ' + L().description, 'Let’s go!', closeMessage, '🌟');
        } else {
          state.finished = true; persist(); play('portal');
          try { LCL.emit('blockworld:complete', { levels: LEVELS.length }); } catch (e) {}
          var gems = 0, maxGems = 0;
          LEVELS.forEach(function (l) { gems += gemsFound(l); maxGems += l.gems.length; });
          showMessage('You are a BlockWorld Explorer!', 'You explored all six areas and solved the computing challenges. You found ' + gems + ' of ' + maxGems + ' gems and earned ' + totalStars() + ' stars. Fantastic work!', 'Explore again', function () { message = null; enterLevel(0); renderModal(); }, '🏆');
        }
      }
      function switchLevel(index) {
        if (index < 0 || index > state.unlocked || index >= LEVELS.length || index === levelIndex || modalOpen()) { return; }
        enterLevel(index); play('pop'); focusApp();
      }
      function showMessage(title, body, action, fn, icon, stars) {
        activeTask = null; held = [];
        message = { title: title, body: body, action: action || 'Continue', fn: fn || closeMessage, icon: icon || '✨', stars: stars };
        renderModal();
      }
      function closeMessage() { message = null; renderModal(); renderGame(); }
      function closeActivity() { activeTask = null; renderModal(); renderGame(); }
      function starsFor(at) {
        if (at.task.type === 'maze') { return at.wrong === 0 && at.moves.length <= 5 ? 3 : (at.wrong <= 1 ? 2 : 1); }
        return at.wrong === 0 ? 3 : (at.wrong <= 2 ? 2 : 1);
      }
      function completeTask(at) {
        var task = at.task, l = L(), already = isDone(state, l, task), stars = starsFor(at), key = l.id + ':' + task.id;
        var list = state.completed[l.id] || [];
        if (list.indexOf(task.id) < 0) { list.push(task.id); }
        state.completed[l.id] = list;
        if (!(state.stars[key] >= stars)) { state.stars[key] = stars; }
        persist(); activeTask = null; play('tada');
        spawnBurst(task.x + .5, task.y + .4, ['#ffe27a', '#ffffff', '#7fe7ff', '#ff9ed0'], 26, 3.6);
        try { LCL.emit('blockworld:challenge-complete', { level: l.id, challenge: task.id }); } catch (e) {}
        var last = allTasksDone();
        var body = already ? 'Great replay! Your best score is saved.' : (last ? 'You finished both challenges! The gate is glowing. Go and find it.' : 'You completed a challenge. Find the other character or object in this area.');
        renderGame();
        showMessage(pick(PRAISE), body, 'Back to the world', closeMessage, '🎉', stars);
      }

      /* ---------- modal UI ---------- */
      function btn(cls, text, fn) { return el('button', { class: cls, type: 'button', text: text, onclick: fn }); }
      function renderModal() {
        if (!modalLayer) { return; }
        modalLayer.innerHTML = '';
        if (!message && !activeTask) { modalLayer.style.display = 'none'; focusApp(); return; }
        modalLayer.style.display = 'flex';
        var card = message ? buildMessageCard() : buildActivityCard();
        modalLayer.appendChild(card);
        var af = card.querySelector('[data-af]') || card;
        try { af.focus({ preventScroll: true }); } catch (e) {}
      }
      function buildMessageCard() {
        var card = el('div', { class: 'bw-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': message.title, tabindex: '-1' });
        card.appendChild(el('button', { class: 'bw-close', type: 'button', text: '×', 'aria-label': 'Close', onclick: closeMessage }));
        card.appendChild(el('div', { class: 'bw-success-icon', text: message.icon }));
        card.appendChild(el('h2', { text: message.title }));
        if (message.stars) {
          var st = el('div', { class: 'bw-stars', 'aria-label': message.stars + ' out of 3 stars' });
          for (var i = 0; i < 3; i++) { st.appendChild(el('span', { class: i < message.stars ? '' : 'off', text: '★' })); }
          card.appendChild(st);
        }
        card.appendChild(el('p', { text: message.body }));
        var b = btn('bw-btn green', message.action, function () { var fn = message && message.fn; if (typeof fn === 'function') { fn(); } else { closeMessage(); } });
        b.setAttribute('data-af', '1');
        card.appendChild(el('div', { class: 'bw-modal-actions' }, [b]));
        return card;
      }
      function buildActivityCard() {
        var at = activeTask, task = at.task, l = L();
        var card = el('div', { class: 'bw-modal' + (at.shake ? ' shake' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': task.title, tabindex: '-1' });
        at.shake = false;
        card.appendChild(el('button', { class: 'bw-close', type: 'button', text: '×', 'aria-label': 'Close challenge', onclick: closeActivity }));
        card.appendChild(el('div', { class: 'bw-modal-kicker', text: l.name + ' · Challenge ' + (l.tasks.indexOf(task) + 1) + ' of ' + l.tasks.length }));
        card.appendChild(el('h2', { text: task.title }));
        if (at.stage === 'intro') {
          card.appendChild(el('div', { class: 'bw-npc' }, [el('div', { class: 'bw-face', text: FACES[task.kind] || '🙂' }), el('div', { class: 'bw-say', text: task.label + ': “' + (task.say || 'Can you help me?') + '”' })]));
          var go = btn('bw-btn green', isDone(state, l, task) ? 'Play again' : 'Let’s help!', function () {
            at.stage = task.type === 'maze' ? 'maze' : 'quiz';
            if (task.type === 'maze') { at.pos = { x: task.maze.start.x, y: task.maze.start.y }; at.trail = []; }
            play('pop'); renderModal();
          });
          go.setAttribute('data-af', '1');
          card.appendChild(el('div', { class: 'bw-modal-actions' }, [go, btn('bw-btn grey', 'Not now', closeActivity)]));
          return card;
        }
        if (at.stage === 'maze') {
          card.appendChild(el('p', { text: 'Help the robot reach the star. Add arrow steps, then press RUN.' }));
          card.appendChild(buildMaze());
        } else {
          var round = at.rounds[at.round];
          var dots = el('div', { class: 'bw-dots' });
          at.rounds.forEach(function (r, i) { dots.appendChild(el('span', { class: 'bw-dot' + (i < at.round ? ' done' : (i === at.round ? ' on' : '')) })); });
          card.appendChild(dots);
          if (round.item) { card.appendChild(el('div', { class: 'bw-item', text: round.item })); }
          if (round.pattern) {
            var pat = el('div', { class: 'bw-pattern' });
            round.pattern.forEach(function (v) { pat.appendChild(el('span', { text: v })); });
            card.appendChild(pat);
          }
          card.appendChild(el('p', { text: round.prompt }));
          var choices = el('div', { class: 'bw-choices' });
          round.choices.forEach(function (choice, i) {
            var b = el('button', { class: 'bw-choice', type: 'button', onclick: function () { chooseAnswer(i); } });
            if (at.eliminated[i]) { b.className += ' wrong'; b.disabled = true; }
            if (at.rightIdx === i) { b.className += ' right'; }
            if (at.rightIdx !== null) { b.disabled = true; }
            b.appendChild(el('span', { class: 'bw-key', text: String(i + 1) }));
            if (choice.icon) { b.appendChild(el('span', { class: 'bw-choice-icon', text: choice.icon })); }
            b.appendChild(el('span', { text: choice.label }));
            choices.appendChild(b);
          });
          card.appendChild(choices);
          var hearText = round.prompt + ' ' + round.choices.map(function (c) { return c.label; }).join('. ');
          card.appendChild(btn('bw-btn grey', '🔊 Hear it', function () { speak(hearText); }));
        }
        card.appendChild(el('div', { class: 'bw-feedback', text: at.feedback || '' }));
        return card;
      }
      function chooseAnswer(index) {
        var at = activeTask;
        if (!at || at.stage !== 'quiz' || at.locked) { return; }
        var round = at.rounds[at.round], ch = round.choices[index];
        if (!ch || at.eliminated[index]) { return; }
        if (!ch.correct) {
          at.wrong++; at.eliminated[index] = true; at.shake = true;
          at.feedback = 'Nearly! ' + (round.hint || 'Have another try.');
          play('oops'); renderModal(); return;
        }
        at.locked = true; at.rightIdx = index; at.feedback = pick(PRAISE);
        play('good'); renderModal();
        setTimeout(function () {
          if (!alive || activeTask !== at) { return; }
          at.locked = false; at.rightIdx = null; at.eliminated = {}; at.feedback = '';
          if (at.round < at.rounds.length - 1) { at.round++; renderModal(); }
          else { completeTask(at); }
        }, 650);
      }

      function arrowFor(m) { return m === 'up' ? '↑' : (m === 'down' ? '↓' : (m === 'left' ? '←' : '→')); }
      function buildMaze() {
        var at = activeTask, maze = at.task.maze, pos = at.pos || maze.start;
        var grid = el('div', { class: 'bw-maze' }), y, x;
        for (y = 0; y < maze.grid.length; y++) {
          for (x = 0; x < maze.grid[y].length; x++) {
            var isWall = maze.grid[y].charAt(x) === '#', isGoal = x === maze.goal.x && y === maze.goal.y, isRobot = x === pos.x && y === pos.y;
            var isStart = x === maze.start.x && y === maze.start.y;
            var trail = at.trail && at.trail.some(function (t) { return t.x === x && t.y === y; });
            var cell = el('div', { class: 'bw-cell' + (isWall ? ' wall' : '') + (isGoal ? ' goal' : '') + (isRobot ? ' robot' : '') + (trail && !isRobot ? ' trail' : '') });
            if (isRobot) { cell.textContent = '🤖'; } else if (isGoal) { cell.textContent = '⭐'; } else if (isStart) { cell.textContent = '▶'; }
            grid.appendChild(cell);
          }
        }
        var wrap = el('div', {});
        wrap.appendChild(grid);
        wrap.appendChild(el('p', { class: 'bw-legend', text: 'Tap the arrows (or use your arrow keys) to write the robot’s instructions.' }));
        var code = el('div', { class: 'bw-code' });
        if (!at.moves.length) { code.textContent = 'Your steps will appear here'; }
        else { at.moves.forEach(function (m, i) { code.appendChild(el('span', { class: i === at.runIdx ? 'run' : '', text: arrowFor(m) })); }); }
        wrap.appendChild(code);
        var pad = el('div', { class: 'bw-arrowpad' });
        [['up', '↑'], ['left', '←'], ['down', '↓'], ['right', '→']].forEach(function (a) {
          var b = el('button', { class: 'bw-arrow', type: 'button', text: a[1], 'aria-label': 'Add ' + a[0], onclick: function () { addMazeMove(a[0]); } });
          b.disabled = !!at.running; pad.appendChild(b);
        });
        wrap.appendChild(pad);
        var actions = el('div', { class: 'bw-modal-actions' });
        var undo = btn('bw-btn grey', '⌫ Undo', undoMazeMove), clear = btn('bw-btn grey', 'Clear', function () { if (!at.running) { at.moves = []; at.feedback = ''; renderModal(); } }), run = btn('bw-btn green', '▶ RUN', runMaze);
        undo.disabled = clear.disabled = run.disabled = !!at.running;
        actions.appendChild(undo); actions.appendChild(clear); actions.appendChild(run);
        wrap.appendChild(actions);
        return wrap;
      }
      function addMazeMove(move) {
        var at = activeTask;
        if (!at || at.stage !== 'maze' || at.running || at.moves.length >= 10) { return; }
        at.moves.push(move); at.feedback = ''; play('pop'); renderModal();
      }
      function undoMazeMove() {
        var at = activeTask;
        if (!at || at.stage !== 'maze' || at.running || !at.moves.length) { return; }
        at.moves.pop(); at.feedback = ''; renderModal();
      }
      function runMaze() {
        var at = activeTask;
        if (!at || at.stage !== 'maze' || at.running) { return; }
        if (!at.moves.length) { at.feedback = 'Add a few arrow steps first.'; renderModal(); return; }
        var maze = at.task.maze, i = 0;
        at.running = true; at.pos = { x: maze.start.x, y: maze.start.y }; at.trail = []; at.runIdx = -1; at.feedback = '';
        renderModal();
        function resetLater() {
          setTimeout(function () {
            if (!alive || activeTask !== at) { return; }
            at.pos = { x: maze.start.x, y: maze.start.y }; at.trail = []; renderModal();
          }, 900);
        }
        function step() {
          if (!alive || activeTask !== at) { return; }
          if (i >= at.moves.length) {
            at.running = false; at.runIdx = -1;
            if (at.pos.x === maze.goal.x && at.pos.y === maze.goal.y) { completeTask(at); return; }
            at.wrong++; at.feedback = 'The robot has not reached the star yet. Add or change your steps.'; play('oops'); renderModal(); resetLater(); return;
          }
          var m = at.moves[i], d = DIRS[m], nx = at.pos.x + d[0], ny = at.pos.y + d[1];
          at.runIdx = i;
          if (ny < 0 || ny >= maze.grid.length || nx < 0 || nx >= maze.grid[ny].length || maze.grid[ny].charAt(nx) === '#') {
            at.running = false; at.runIdx = -1; at.wrong++; at.shake = true;
            at.feedback = 'Bump! The robot hit a wall. Fix the steps and try again.'; play('oops'); renderModal(); resetLater(); return;
          }
          at.trail.push({ x: at.pos.x, y: at.pos.y }); at.pos = { x: nx, y: ny }; play('pop'); renderModal(); i++;
          setTimeout(step, 420);
        }
        setTimeout(step, 350);
      }

      /* ---------- shell / panels ---------- */
      function createShell() {
        app = el('div', { class: 'bw-app', tabindex: '0' });
        var header = el('div', { class: 'bw-header' });
        var logo = el('div', { class: 'bw-logo', 'aria-hidden': 'true' }, [el('i'), el('i'), el('i'), el('i')]);
        var brand = el('div', { class: 'bw-brand' }, [el('strong', { text: 'BlockWorld Adventures' }), el('small', { text: 'Explore · Learn · Unlock' })]);
        nav = el('div', { class: 'bw-nav', 'aria-label': 'Unlocked areas' });
        soundBtn = el('button', { class: 'bw-iconbtn', type: 'button', title: 'Sound on or off', 'aria-label': 'Toggle sound', onclick: function () { state.muted = !state.muted; persist(); updateSoundBtn(); focusApp(); } });
        var helpBtn = el('button', { class: 'bw-iconbtn', type: 'button', text: '?', title: 'How to play', 'aria-label': 'How to play', onclick: function () { if (!modalOpen()) { showMessage('How to play', 'Walk with the arrow keys or W A S D. Press SPACE next to a character to help them. Collect the sparkling gems 💎. You can also click or tap the world to walk there.', 'Got it!', closeMessage, '🎮'); } } });
        header.appendChild(logo); header.appendChild(brand); header.appendChild(nav); header.appendChild(soundBtn); header.appendChild(helpBtn);

        var main = el('div', { class: 'bw-main' });
        worldPane = el('div', { class: 'bw-world' });
        canvas = document.createElement('canvas');
        canvas.className = 'bw-canvas';
        canvas.setAttribute('aria-label', 'Top-down adventure world. Use arrow keys or WASD to move.');
        canvas.tabIndex = 0;
        worldCtx = canvas.getContext('2d');
        hudGems = el('div', { class: 'bw-chip' }); hudStars = el('div', { class: 'bw-chip' });
        var hud = el('div', { class: 'bw-hud' }, [hudGems, hudStars]);
        nearPrompt = el('div', { class: 'bw-near' });
        worldPane.appendChild(canvas); worldPane.appendChild(hud); worldPane.appendChild(nearPrompt);

        side = el('div', { class: 'bw-side' });
        main.appendChild(worldPane); main.appendChild(side);
        var footer = el('div', { class: 'bw-footer' });
        status = el('div', { class: 'bw-status', text: statusText });
        interactBtn = el('button', { class: 'bw-btn orange', type: 'button', text: 'SPACE · INTERACT', onclick: function () { interact(); focusApp(); } });
        footer.appendChild(status); footer.appendChild(interactBtn);
        modalLayer = el('div', { class: 'bw-modal-layer' });
        modalLayer.style.display = 'none';
        app.appendChild(header); app.appendChild(main); app.appendChild(footer); app.appendChild(modalLayer);
        root.appendChild(app);

        canvas.addEventListener('click', function (e) {
          var r = canvas.getBoundingClientRect();
          walkTo(Math.floor((e.clientX - r.left - view.ox) / view.tile), Math.floor((e.clientY - r.top - view.oy) / view.tile));
          focusApp();
        });
        return app;
      }
      function updateSoundBtn() { if (soundBtn) { soundBtn.textContent = state.muted ? '🔇' : '🔊'; } }
      function updateHeader() {
        nav.innerHTML = '';
        LEVELS.forEach(function (l, i) {
          var b = el('button', { class: 'bw-levelbtn' + (i === levelIndex ? ' current' : (i <= state.unlocked ? ' unlocked' : '')), type: 'button', text: String(i + 1), title: i <= state.unlocked ? l.name : 'Locked', onclick: function () { switchLevel(i); } });
          b.disabled = i > state.unlocked;
          nav.appendChild(b);
        });
        updateSoundBtn();
      }
      function updateHud() {
        var l = L();
        if (hudGems) { hudGems.textContent = '💎 ' + gemsFound(l) + ' / ' + l.gems.length; }
        if (hudStars) { hudStars.textContent = '⭐ ' + totalStars(); }
      }
      function bindDir(b, name) {
        function down(e) { e.preventDefault(); if (modalOpen()) { return; } pressDir(name); }
        function up() { releaseDir(name); focusApp(); }
        b.addEventListener('pointerdown', down);
        b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', function () { releaseDir(name); });
        b.addEventListener('keydown', function (e) { e.stopPropagation(); });
      }
      function dirButton(label, name, hint) {
        var b = el('button', { class: 'bw-dir', type: 'button', text: label, title: hint, 'aria-label': hint });
        bindDir(b, name); return b;
      }
      function updateSide() {
        side.innerHTML = '';
        var l = L(), done = countDone(state, l), total = l.tasks.length;
        var info = el('div', { class: 'bw-card' });
        info.appendChild(el('h2', { text: l.name }));
        info.appendChild(el('p', { text: l.description }));
        var bar = el('div', { class: 'bw-count' }, [el('span')]);
        bar.firstChild.style.width = Math.round(done / total * 100) + '%';
        info.appendChild(bar);
        info.appendChild(el('p', { text: done + ' of ' + total + ' challenges complete' }));
        l.tasks.forEach(function (task) {
          var ok = isDone(state, l, task), n = state.stars[l.id + ':' + task.id] || 0;
          var row = el('div', { class: 'bw-taskrow' + (ok ? ' done' : '') });
          row.appendChild(el('span', { class: 'bw-taskstatus', text: ok ? '✓' : '•' }));
          row.appendChild(el('span', { text: task.label }));
          if (ok) { row.appendChild(el('span', { class: 'bw-tstars', text: '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n) })); }
          info.appendChild(row);
        });
        info.appendChild(el('div', { class: 'bw-taskrow' }, [el('span', { class: 'bw-taskstatus', text: '💎' }), el('span', { text: 'Gems ' + gemsFound(l) + ' of ' + l.gems.length })]));
        side.appendChild(info);
        var controls = el('div', { class: 'bw-card' });
        controls.appendChild(el('div', { class: 'bw-controls-title', text: 'Move around' }));
        var pad = el('div', { class: 'bw-dpad' });
        pad.appendChild(el('span', {})); pad.appendChild(dirButton('↑', 'up', 'Move up')); pad.appendChild(el('span', {}));
        pad.appendChild(dirButton('←', 'left', 'Move left')); pad.appendChild(dirButton('↓', 'down', 'Move down')); pad.appendChild(dirButton('→', 'right', 'Move right'));
        controls.appendChild(pad);
        controls.appendChild(el('p', { class: 'bw-sidehint', text: 'W A S D or arrow keys · tap the world to walk' }));
        side.appendChild(controls);
      }
      function updateNear() {
        if (!nearPrompt) { return; }
        var text = '';
        if (!modalOpen()) {
          var t = getTarget(), l = L();
          if (!t) { text = 'Find the characters with ❗ · Collect 💎'; }
          else if (t.gate) { text = allTasksDone() ? 'SPACE · Open the gate' : 'SPACE · The gate needs ' + (l.tasks.length - countDone(state, l)) + ' more challenge' + (l.tasks.length - countDone(state, l) === 1 ? '' : 's'); }
          else if (isDone(state, l, t.task)) { text = 'SPACE · Play again with ' + t.task.label; }
          else { text = 'SPACE · Talk to ' + t.task.label; }
        }
        if (text !== lastNearText) { lastNearText = text; nearPrompt.textContent = text; }
      }
      function renderGame() {
        if (!alive) { return; }
        updateHeader(); updateSide(); updateHud(); updateNear();
        if (status) { status.textContent = statusText; }
      }

      /* ---------- input ---------- */
      function dirFromEvent(e) {
        var m = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
        if (m[e.code]) { return m[e.code]; }
        var k = String(e.key || '').toLowerCase();
        var n = { arrowup: 'up', up: 'up', w: 'up', arrowdown: 'down', down: 'down', s: 'down', arrowleft: 'left', left: 'left', a: 'left', arrowright: 'right', right: 'right', d: 'right' };
        return n[k] || null;
      }
      function pressDir(name) {
        var i = held.indexOf(name); if (i >= 0) { held.splice(i, 1); }
        held.push(name);
        if (P.moving) { queued = name; }
      }
      function releaseDir(name) { var i = held.indexOf(name); while (i >= 0) { held.splice(i, 1); i = held.indexOf(name); } }
      function onKeyDown(e) {
        if (!alive || !hasFocus || !root.isConnected || !root.getClientRects().length) { return; }
        if (e.ctrlKey || e.metaKey || e.altKey) { return; }
        var tg = e.target;
        if (tg && tg.nodeType === 1 && !root.contains(tg) && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable)) { return; }
        var dir = dirFromEvent(e), k = String(e.key || '');
        if (modalOpen()) {
          if (k === 'Escape') { e.preventDefault(); if (activeTask) { closeActivity(); } else { closeMessage(); } return; }
          if (activeTask && activeTask.stage === 'quiz' && /^[1-3]$/.test(k)) { e.preventDefault(); chooseAnswer(Number(k) - 1); return; }
          if (activeTask && activeTask.stage === 'maze') {
            if (dir && /^Arrow/.test(e.code || '')) { e.preventDefault(); addMazeMove(dir); }
            else if (k === 'Backspace') { e.preventDefault(); undoMazeMove(); }
            else if (k === 'Enter' && !(tg && tg.tagName === 'BUTTON')) { e.preventDefault(); runMaze(); }
          }
          return;
        }
        if (dir) { e.preventDefault(); if (!e.repeat) { pressDir(dir); } return; }
        if (e.code === 'Space' || k === ' ' || e.code === 'KeyE' || k === 'Enter') {
          e.preventDefault(); if (!e.repeat) { interact(); }
        }
      }
      function onKeyUp(e) {
        var dir = dirFromEvent(e);
        if (dir) { releaseDir(dir); }
      }
      function clearHeld() { held = []; queued = null; }
      function onPointerDown(e) { hasFocus = !!(e.target && root.contains(e.target)); }
      function onVisibility() { clearHeld(); }

      /* ---------- rendering ---------- */
      function resizeCanvas() {
        if (!canvas || !worldCtx) { return; }
        var w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        var pxW = Math.round(w * dpr), pxH = Math.round(h * dpr);
        if (canvas.width !== pxW || canvas.height !== pxH) { canvas.width = pxW; canvas.height = pxH; }
        if (lightC.width !== pxW || lightC.height !== pxH) { lightC.width = pxW; lightC.height = pxH; }
        staticKey = '';
      }
      function buildStatic(l, tile, ox, oy, w, h) {
        var key = [levelIndex, tile, ox, oy, w, h, dpr].join('|');
        if (staticKey === key && staticCanvas) { return staticCanvas; }
        if (!staticCanvas) { staticCanvas = document.createElement('canvas'); }
        staticCanvas.width = Math.round(w * dpr); staticCanvas.height = Math.round(h * dpr);
        var c = staticCanvas.getContext('2d'), u = tile / 40, th = l.id;
        c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
        for (var gy = 0; gy < ROWS; gy++) {
          for (var gx = 0; gx < COLS; gx++) {
            var ch = tileAt(l, gx, gy), x = ox + gx * tile, y = oy + gy * tile;
            if (ch === '#') { drawWallTile(c, th, x, y, tile, gx, gy); continue; }
            if (ch === '~') { c.fillStyle = '#1b6fa8'; c.fillRect(x, y, tile, tile); continue; }
            if (ch === 'I') { drawIceTile(c, x, y, tile, gx, gy); }
            else if (ch === 'S') { drawStoneTile(c, x, y, tile); }
            else { drawFloor(c, th, x, y, tile, gx, gy); if (ch === '=') { drawPathTile(c, th, x, y, tile, gx, gy); } }
            var g;
            if (tileAt(l, gx, gy - 1) === '#') { g = c.createLinearGradient(0, y, 0, y + 14 * u); g.addColorStop(0, 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x, y, tile, 14 * u); }
            if (tileAt(l, gx - 1, gy) === '#') { g = c.createLinearGradient(x, 0, x + 10 * u, 0); g.addColorStop(0, 'rgba(0,0,0,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x, y, 10 * u, tile); }
            if (tileAt(l, gx + 1, gy) === '#') { g = c.createLinearGradient(x + tile, 0, x + tile - 10 * u, 0); g.addColorStop(0, 'rgba(0,0,0,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x + tile - 10 * u, y, 10 * u, tile); }
            if (ch === 'R' && th !== 'temple') { drawBoulder(c, th, x, y, tile, gx, gy); }
            else if (ch === 'B') { drawBookshelf(c, x, y, tile, gx, gy); }
          }
        }
        staticKey = key;
        return staticCanvas;
      }
      function drawAmbient(c, ox, oy, tile, time) {
        var k = THEMES[L().id].ambient, u = tile / 40;
        ambient.forEach(function (p) {
          var x = ox + p.x * tile, y = oy + p.y * tile, a;
          if (k === 'snow') { ell(c, x, y, (1.4 + p.sz) * u, (1.4 + p.sz) * u, 'rgba(255,255,255,.9)'); }
          else if (k === 'petals') { ell(c, x, y, 3 * u * p.sz, 1.7 * u * p.sz, p.sz > 1 ? 'rgba(255,170,200,.85)' : 'rgba(255,255,255,.8)', null, 0, p.ph); }
          else if (k === 'dust') { ell(c, x, y, 1.3 * u * p.sz, 1.3 * u * p.sz, 'rgba(255,230,180,.45)'); }
          else if (k === 'fireflies') { a = (Math.sin(time / 400 + p.ph * 3) + 1) / 2; glow(c, x, y, 11 * u * p.sz, 'rgba(255,240,120,A)', .25 + a * .6); ell(c, x, y, 1.5 * u, 1.5 * u, 'rgba(255,255,200,' + (.5 + a * .5) + ')'); }
          else if (k === 'embers') { a = (Math.sin(time / 300 + p.ph * 4) + 1) / 2; ell(c, x, y, 1.6 * u * p.sz, 1.6 * u * p.sz, 'rgba(255,' + Math.round(120 + a * 80) + ',50,' + (.5 + a * .4) + ')'); }
          else if (k === 'gold') { a = (Math.sin(time / 350 + p.ph * 3) + 1) / 2; ell(c, x, y, 1.5 * u * p.sz, 1.5 * u * p.sz, 'rgba(255,225,110,' + (.3 + a * .6) + ')'); }
        });
        bursts.forEach(function (b) {
          var x = ox + b.x * tile, y = oy + b.y * tile, a = Math.max(0, b.life / b.max);
          if (b.kind === 'puff') { ell(c, x, y, (2 + (1 - a) * 5) * u, (1.4 + (1 - a) * 3) * u, 'rgba(255,255,255,' + a * .35 + ')'); }
          else if (b.kind === 'spark2') { ell(c, x, y, 1.8 * u, 1.8 * u, 'rgba(255,243,163,' + a + ')'); }
          else { glow(c, x, y, b.size * 4 * u, 'rgba(255,255,255,A)', a * .5); ell(c, x, y, b.size * u, b.size * u, b.color); }
        });
      }
      function drawLighting(c, l, th, w, h, ox, oy, tile, time) {
        var i, u = tile / 40;
        if (th.dark > 0) {
          var lx = lightX;
          lx.setTransform(dpr, 0, 0, dpr, 0, 0); lx.globalCompositeOperation = 'source-over'; lx.clearRect(0, 0, w, h);
          lx.fillStyle = 'rgba(6,8,22,' + th.dark + ')'; lx.fillRect(0, 0, w, h);
          lx.globalCompositeOperation = 'destination-out';
          var hole = function (x, y, r, a) {
            var g = lx.createRadialGradient(x, y, r * .1, x, y, r);
            g.addColorStop(0, 'rgba(0,0,0,' + a + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
            lx.fillStyle = g; lx.beginPath(); lx.arc(x, y, r, 0, Math.PI * 2); lx.fill();
          };
          hole(ox + (P.rx + .5) * tile, oy + (P.ry + .5) * tile, tile * 3.4, .95);
          l.lights.forEach(function (p, i2) { hole(ox + (p[0] + .5) * tile, oy + (p[1] + .6) * tile, tile * (3 + Math.sin(time / 130 + i2 * 2) * .15), .95); });
          l.tasks.forEach(function (tk) { if (!isDone(state, l, tk)) { hole(ox + (tk.x + .5) * tile, oy + (tk.y + .5) * tile, tile * 1.7, .8); } });
          hole(ox + (GATE.x + .5) * tile, oy + (GATE.y + .5) * tile, tile * (allTasksDone() ? 3 : 1.8), .85);
          l.gems.forEach(function (g, i3) { if (state.gems[l.id].indexOf(i3) < 0) { hole(ox + (g[0] + .5) * tile, oy + (g[1] + .5) * tile, tile * 1.1, .7); } });
          lx.globalCompositeOperation = 'source-over';
          c.drawImage(lightC, 0, 0, w, h);
        }
        l.lights.forEach(function (p, i4) {
          var fl = 1 + Math.sin(time / 90 + i4 * 3) * .08;
          glow(c, ox + (p[0] + .5) * tile, oy + (p[1] + .55) * tile, tile * 2.6 * fl, 'rgba(255,160,60,A)', .28);
        });
        if (th.tint) { c.fillStyle = th.tint; c.fillRect(0, 0, w, h); }
        var vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .32, w / 2, h / 2, Math.max(w, h) * .72);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.34)');
        c.fillStyle = vg; c.fillRect(0, 0, w, h);
      }
      function drawWorld(time) {
        if (!worldCtx || !canvas) { return; }
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) { return; }
        if (canvas.width !== Math.round(w * Math.min(window.devicePixelRatio || 1, 2))) { resizeCanvas(); }
        var c = worldCtx, l = L(), th = THEMES[l.id], i;
        var tile = Math.max(18, Math.floor(Math.min((w - 16) / COLS, (h - 16) / ROWS)));
        var ox = Math.round((w - tile * COLS) / 2), oy = Math.round((h - tile * ROWS) / 2);
        view = { tile: tile, ox: ox, oy: oy, width: w, height: h };
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        var bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, th.bg[0]); bg.addColorStop(1, th.bg[1]);
        c.fillStyle = bg; c.fillRect(0, 0, w, h);
        c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 20; c.shadowOffsetY = 6; c.fillStyle = '#000'; c.fillRect(ox, oy, tile * COLS, tile * ROWS); c.restore();
        c.drawImage(buildStatic(l, tile, ox, oy, w, h), 0, 0, w, h);
        drawWater(c, l, ox, oy, tile, time);

        var ents = [];
        l._dyn.forEach(function (d) {
          ents.push({ y: d.gy + 1, f: function () {
            var cx = ox + (d.gx + .5) * tile, by = oy + (d.gy + 1) * tile - tile * .06;
            if (d.k === 'T') { drawTree(c, l.id, cx, by, tile, time, d.gx, d.gy); } else { drawPillar(c, cx, by, tile); }
          } });
        });
        l.tasks.forEach(function (task, idx) {
          var done = isDone(state, l, task);
          ents.push({ y: task.y + 1, f: function () { drawThing(c, task, ox + (task.x + .5) * tile, oy + (task.y + 1) * tile - tile * .08, tile, time, done, idx * 1.7); } });
        });
        ents.push({ y: GATE.y + 1, f: function () { drawGate(c, ox + (GATE.x + .5) * tile, oy + (GATE.y + 1) * tile - tile * .04, tile, time, allTasksDone()); } });
        l.gems.forEach(function (g, gi) {
          if (state.gems[l.id].indexOf(gi) >= 0) { return; }
          ents.push({ y: g[1] + .7, f: function () { drawGem(c, ox + (g[0] + .5) * tile, oy + (g[1] + .55) * tile, tile, time, gi); } });
        });
        ents.push({ y: P.ry + 1.001, f: function () {
          drawHuman(c, ox + (P.rx + .5) * tile, oy + (P.ry + 1) * tile - tile * .1, tile, { t: time, moving: P.moving, phase: P.phase, dir: P.dir, shirt: '#3e89e8', hair: '#5a3b26', pants: '#39507a', skin: '#f1c397', belt: '#f2c14e' });
        } });
        ents.sort(function (a, b) { return a.y - b.y; });
        for (i = 0; i < ents.length; i++) { ents[i].f(); }

        // markers and labels
        var target = modalOpen() ? null : getTarget();
        l.tasks.forEach(function (task) {
          var done = isDone(state, l, task), cx = ox + (task.x + .5) * tile, top = oy + (task.y + 1) * tile - (HEIGHT[task.kind] || 44) * tile / 40;
          drawMarker(c, cx, top, tile, time, done);
          if (target && target.task === task) { drawPill(c, cx, top - 28 * tile / 40, task.label, tile); }
        });
        if (target && target.gate) { drawPill(c, ox + (GATE.x + .5) * tile, oy + (GATE.y + 1) * tile - 62 * tile / 40, allTasksDone() ? 'Open the gate' : 'Locked gate', tile); }

        drawAmbient(c, ox, oy, tile, time);
        drawLighting(c, l, th, w, h, ox, oy, tile, time);

        var age = time - bannerAt;
        if (age >= 0 && age < 2900) {
          var a = Math.min(1, age / 300, (2900 - age) / 600);
          c.save(); c.globalAlpha = a;
          var bw = Math.min(w - 24, 340), bx = (w - bw) / 2, byy = 16 + (1 - a) * -10;
          fillRR(c, bx, byy, bw, 62, 14, 'rgba(14,26,48,.8)', 'rgba(255,255,255,.75)', 2);
          c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.font = '900 22px sans-serif'; c.fillText(l.name, w / 2, byy + 24);
          c.font = '700 13px sans-serif'; c.fillStyle = '#bcd6f5'; c.fillText(l.subtitle, w / 2, byy + 46);
          c.restore();
        }
        if (fade > 0) { c.fillStyle = 'rgba(8,14,28,' + fade + ')'; c.fillRect(0, 0, w, h); }
      }
      function frame(now) {
        if (!alive) { return; }
        raf = requestAnimationFrame(frame);
        var dt = Math.min(.05, (now - (lastT || now)) / 1000);
        lastT = now; clock = now;
        if (bannerReq) { bannerAt = now; bannerReq = false; }
        update(dt);
        drawWorld(now);
        updateNear();
      }

      /* ---------- start ---------- */
      createShell();
      var l0 = L();
      P.x = l0.start.x; P.y = l0.start.y; P.rx = P.x; P.ry = P.y;
      seedAmbient();
      renderGame();
      resizeCanvas();
      var resizeObserver = null;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(function () { resizeCanvas(); });
        resizeObserver.observe(worldPane);
      }
      window.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('keyup', onKeyUp, true);
      window.addEventListener('blur', clearHeld);
      document.addEventListener('pointerdown', onPointerDown, true);
      document.addEventListener('visibilitychange', onVisibility);
      if (!state.seen) {
        showMessage('Welcome to BlockWorld!', 'Use W A S D or the arrow keys to move. Walk next to a character or object and press SPACE to talk or play. Collect the gems 💎, finish both challenges and open the gate.', 'Start exploring', function () {
          state.seen = true; persist(); closeMessage(); speak('Welcome to BlockWorld Adventures! Use the arrow keys to move. Press space to talk.');
        }, '🧱');
      }
      raf = requestAnimationFrame(frame);

      return {
        onOpen: function () { hasFocus = true; focusApp(); resizeCanvas(); },
        onFocus: function () { hasFocus = true; if (!modalOpen()) { focusApp(); } },
        onResize: function () { resizeCanvas(); },
        destroy: function () {
          alive = false;
          try { cancelAnimationFrame(raf); } catch (e) {}
          if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
          window.removeEventListener('keydown', onKeyDown, true);
          window.removeEventListener('keyup', onKeyUp, true);
          window.removeEventListener('blur', clearHeld);
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('visibilitychange', onVisibility);
          try { if (actx && actx.close) { actx.close(); } } catch (e) {}
          if (modalLayer) { modalLayer.innerHTML = ''; }
        }
      };
    }
  });
})();