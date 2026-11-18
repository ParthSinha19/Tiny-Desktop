/* Robot Workshop - a 3D robot-building sandbox for Little Computer Lab.
   No objectives, no scores. Children assemble, colour, animate and save their own robots.
   Uses Three.js (bundled in vendor/) - no CDN, no network requests. */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs, I = LCL.icons;
  var THREE = window.THREE;

  /* ================= constants ================= */
  var KIND = 'robot3d';
  var MAX_PER_CAT = 8, MAX_TOTAL = 36;
  var CATS = ['head', 'eyes', 'antenna', 'arms', 'legs', 'wheels', 'accessory'];
  var CAT_LABEL = { body: 'Body', head: 'Heads', eyes: 'Eyes', antenna: 'Antennas', arms: 'Arms', legs: 'Legs', wheels: 'Wheels', accessory: 'Hats & Bits' };
  var CAT_HINT = {
    body: 'This is the middle of your robot. Drag a new one to swap it!',
    head: 'Drop a head on your robot. Add as many as you like!',
    eyes: 'Give your robot some eyes to see with.',
    antenna: 'Antennas go on top of the head.',
    arms: 'Arms go on the sides of the body.',
    legs: 'Legs go underneath the body.',
    wheels: 'Wheels go underneath the body too - mix them with legs if you like!',
    accessory: 'Hats, bows and fun bits go on top.'
  };
  var PALETTE = ['#ff6b6b', '#ffa94d', '#ffd43b', '#94d82d', '#38d9a9', '#4dabf7', '#748ffc', '#da77f2', '#f783ac', '#868e96', '#ffffff', '#212529'];
  var ACCENT_DARK = 0x263047, ACCENT_METAL = 0xb9c2cc, ACCENT_GOLD = 0xffd43b;
  var IDEAS = [
    'Build a robot with four eyes.', 'Make the tallest robot you can.', 'Build a robot with lots of wheels.',
    'Give your robot a funny hat.', 'Build a robot that looks like an animal.', 'Make two totally different robots.',
    'Build a robot for your teacher.', 'Try a robot with no legs at all - just wheels!', 'Give your robot three heads!',
    'Make the smallest robot you can build.', 'Build a robot that looks a bit scary (but friendly).', 'Give your robot a colourful bow.'
  ];

  /* ================= small helpers ================= */
  function col(hex) { return new THREE.Color(hex); }
  function mesh(geo, hex, paintable) {
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col(hex), roughness: 0.55, metalness: 0.08 }));
    m.castShadow = true; m.receiveShadow = true;
    m.userData.paintable = paintable !== false;
    return m;
  }
  function grp(kids) {
    var g = new THREE.Group();
    (kids || []).forEach(function (k) { g.add(k); });
    return g;
  }
  function sph(r, hex, p) { return mesh(new THREE.SphereGeometry(r, 16, 12), hex, p); }
  function bx(w, h, d, hex, p) { return mesh(new THREE.BoxGeometry(w, h, d), hex, p); }
  function cyl(rt, rb, h, hex, p, seg) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 16), hex, p); }
  function cone(r, h, hex, p) { return mesh(new THREE.ConeGeometry(r, h, 16), hex, p); }
  function trs(r, tube, hex, p) { return mesh(new THREE.TorusGeometry(r, tube, 10, 22), hex, p); }
  function at(o, x, y, z) { o.position.set(x, y, z); return o; }
  function bbox(obj) {
    var b = new THREE.Box3().setFromObject(obj);
    if (!isFinite(b.min.x)) return { min: new THREE.Vector3(), max: new THREE.Vector3(), size: new THREE.Vector3(0.3, 0.3, 0.3) };
    return { min: b.min, max: b.max, size: b.getSize(new THREE.Vector3()) };
  }
  /* bbox() reads the object's CURRENT world position, so calling it again on a part that
     was already placed by an earlier relayout() would measure "shape + stale old offset",
     not the part's intrinsic size. localBBox() zeroes position/rotation first so it always
     reflects just the shape - use this whenever the result will be used to compute a NEW
     position (stacking heads, sizing the body); use plain bbox() only when you want the
     part's current, already-placed location (e.g. the final grounding pass, the selection ring). */
  function localBBox(obj) {
    var p0 = obj.position.clone(), r0 = obj.rotation.clone();
    obj.position.set(0, 0, 0); obj.rotation.set(0, 0, 0); obj.updateMatrixWorld(true);
    var b = bbox(obj);
    obj.position.copy(p0); obj.rotation.copy(r0); obj.updateMatrixWorld(true);
    return b;
  }
  function paintGroup(group, hex) {
    group.traverse(function (o) {
      if (o.isMesh && o.userData.paintable !== false) o.material.color.set(hex);
    });
  }
  function disposeObj(obj) {
    obj.traverse(function (o) {
      if (o.isMesh) {
        o.geometry.dispose();
        if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); }); else o.material.dispose();
      }
    });
  }

  /* ================= component catalogue ================= */
  /* Every builder returns a fresh THREE.Group centred on its own local origin.
     Bodies/heads are centred vertically on y=0 (placement code moves them).
     Arms/antenna/accessory point "up"; legs/wheels hang "down". */
  var CATALOG = {
    body: [
      { id: 'small', label: 'Small', shape: 'round', build: function (c) { return grp([bx(0.78, 0.68, 0.58, c)]); } },
      { id: 'large', label: 'Large', shape: 'round', build: function (c) { return grp([bx(1.3, 1.05, 0.95, c)]); } },
      {
        id: 'rounded', label: 'Rounded', shape: 'round', build: function (c) {
          var cy = cyl(0.42, 0.42, 0.6, c); var top = sph(0.42, c); var bot = sph(0.42, c);
          at(top, 0, 0.3, 0); at(bot, 0, -0.3, 0);
          return grp([cy, top, bot]);
        }
      },
      { id: 'box', label: 'Boxy', shape: 'square', build: function (c) { return grp([bx(0.95, 0.95, 0.85, c)]); } },
      { id: 'tall', label: 'Tall', shape: 'square', build: function (c) { return grp([bx(0.72, 1.3, 0.6, c)]); } }
    ],
    head: [
      { id: 'round', label: 'Round', shape: 'round', build: function (c) { return grp([sph(0.42, c)]); } },
      { id: 'square', label: 'Square', shape: 'square', build: function (c) { return grp([bx(0.66, 0.66, 0.66, c)]); } },
      { id: 'rect', label: 'Tall', shape: 'square', build: function (c) { return grp([bx(0.52, 0.82, 0.48, c)]); } },
      {
        id: 'tv', label: 'TV', shape: 'square', build: function (c) {
          var box = bx(0.9, 0.58, 0.5, c); var screen = bx(0.62, 0.34, 0.06, ACCENT_DARK, false);
          at(screen, 0, 0, 0.26);
          return grp([box, screen]);
        }
      },
      {
        id: 'dome', label: 'Dome', shape: 'round', build: function (c) {
          var base = cyl(0.4, 0.4, 0.18, c);
          var dome = mesh(new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), c);
          at(dome, 0, 0.09, 0);
          return grp([base, dome]);
        }
      }
    ],
    eyes: [
      { id: 'round', label: 'Round (pair)', shape: 'round', build: function () { return grp([eyeBall(-0.14, 0.1), eyeBall(0.14, 0.1)]); } },
      { id: 'square', label: 'Square (pair)', shape: 'square', build: function () { return grp([eyeSquare(-0.14), eyeSquare(0.14)]); } },
      {
        id: 'sleepy', label: 'Sleepy (pair)', shape: 'round', build: function () {
          function lid(sx) {
            var l = mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 16, Math.PI), ACCENT_DARK, false);
            l.rotation.z = Math.PI; at(l, sx, -0.01, 0.06); return l;
          }
          return grp([lid(-0.14), lid(0.14)]);
        }
      },
      { id: 'big', label: 'Big (pair)', shape: 'round', build: function () { return grp([eyeBall(-0.18, 0.16), eyeBall(0.18, 0.16)]); } },
      { id: 'cyclops', label: 'Cyclops (one)', shape: 'round', build: function () { return grp([eyeBall(0, 0.2)]); } }
    ],
    antenna: [
      {
        id: 'single', label: 'Single', shape: 'round', build: function (c) {
          var rod = cyl(0.025, 0.025, 0.34, c); var ball = sph(0.07, ACCENT_GOLD, false);
          at(rod, 0, 0.17, 0); at(ball, 0, 0.36, 0);
          return grp([rod, ball]);
        }
      },
      {
        id: 'double', label: 'Double', shape: 'square', build: function (c) {
          function one(side) {
            var rod = cyl(0.02, 0.02, 0.3, c); var ball = sph(0.055, ACCENT_GOLD, false);
            at(rod, side * 0.07, 0.15, 0); at(ball, side * 0.13, 0.3, 0); rod.rotation.z = side * 0.35;
            return [rod, ball];
          }
          return grp(one(-1).concat(one(1)));
        }
      },
      {
        id: 'curly', label: 'Curly', shape: 'round', build: function (c) {
          var rod = cyl(0.025, 0.025, 0.2, c); at(rod, 0, 0.1, 0);
          var coil = trs(0.1, 0.025, c); at(coil, 0, 0.3, 0); coil.rotation.x = Math.PI / 2;
          return grp([rod, coil]);
        }
      },
      {
        id: 'bulb', label: 'Bulb', shape: 'round', build: function (c) {
          var rod = cyl(0.025, 0.025, 0.28, c); var bulb = sph(0.1, '#fff3bf', false);
          at(rod, 0, 0.14, 0); at(bulb, 0, 0.32, 0);
          return grp([rod, bulb]);
        }
      }
    ],
    arms: [
      {
        id: 'short', label: 'Short', shape: 'square', build: function (c) {
          var limb = cyl(0.09, 0.09, 0.32, c); var hand = sph(0.12, c);
          limb.rotation.z = Math.PI / 2; at(limb, 0.16, 0, 0); at(hand, 0.33, 0, 0);
          return grp([limb, hand]);
        }
      },
      {
        id: 'long', label: 'Long', shape: 'square', build: function (c) {
          var limb = cyl(0.08, 0.08, 0.56, c); var hand = sph(0.12, c);
          limb.rotation.z = Math.PI / 2; at(limb, 0.28, 0, 0); at(hand, 0.57, 0, 0);
          return grp([limb, hand]);
        }
      },
      {
        id: 'mech', label: 'Mechanical', shape: 'square', build: function (c) {
          var up = cyl(0.09, 0.09, 0.28, c); var joint = sph(0.1, ACCENT_METAL, false); var lo = cyl(0.075, 0.075, 0.26, c);
          var clawA = bx(0.06, 0.14, 0.04, ACCENT_METAL, false), clawB = bx(0.06, 0.14, 0.04, ACCENT_METAL, false);
          up.rotation.z = Math.PI / 2; at(up, 0.14, 0, 0); at(joint, 0.28, 0, 0);
          lo.rotation.z = Math.PI / 2 + 0.5; at(lo, 0.45, -0.1, 0);
          at(clawA, 0.62, -0.02, 0.04); at(clawB, 0.62, -0.02, -0.04);
          return grp([up, joint, lo, clawA, clawB]);
        }
      },
      {
        id: 'paddle', label: 'Paddle', shape: 'square', build: function (c) {
          var limb = bx(0.3, 0.1, 0.06, c); var hand = bx(0.16, 0.22, 0.06, c);
          at(limb, 0.15, 0, 0); at(hand, 0.34, 0, 0);
          return grp([limb, hand]);
        }
      },
      {
        id: 'thick', label: 'Thick', shape: 'round', build: function (c) {
          var limb = cyl(0.15, 0.15, 0.34, c); var hand = sph(0.17, c);
          limb.rotation.z = Math.PI / 2; at(limb, 0.18, 0, 0); at(hand, 0.38, 0, 0);
          return grp([limb, hand]);
        }
      }
    ],
    legs: [
      { id: 'short', label: 'Short', shape: 'square', build: function (c) { var l = cyl(0.11, 0.11, 0.3, c); var f = bx(0.22, 0.1, 0.3, c); at(l, 0, -0.15, 0); at(f, 0, -0.33, 0.04); return grp([l, f]); } },
      { id: 'long', label: 'Long', shape: 'square', build: function (c) { var l = cyl(0.1, 0.1, 0.58, c); var f = bx(0.22, 0.1, 0.3, c); at(l, 0, -0.29, 0); at(f, 0, -0.62, 0.04); return grp([l, f]); } },
      { id: 'chunky', label: 'Chunky', shape: 'square', build: function (c) { var l = cyl(0.17, 0.17, 0.34, c); var f = bx(0.3, 0.12, 0.36, c); at(l, 0, -0.17, 0); at(f, 0, -0.38, 0.05); return grp([l, f]); } },
      {
        id: 'bent', label: 'Bent', shape: 'square', build: function (c) {
          var up = cyl(0.1, 0.1, 0.28, c); var lo = cyl(0.09, 0.09, 0.26, c); var f = bx(0.22, 0.1, 0.3, c);
          at(up, 0, -0.14, 0); lo.rotation.x = 0.6; at(lo, 0, -0.33, 0.07); at(f, 0, -0.46, 0.2);
          return grp([up, lo, f]);
        }
      },
      { id: 'peg', label: 'Peg', shape: 'round', build: function (c) { var l = cone(0.13, 0.5, c); at(l, 0, -0.25, 0); l.rotation.x = Math.PI; return grp([l]); } }
    ],
    wheels: [
      { id: 'small', label: 'Small', shape: 'round', build: function (c) { var t = trs(0.14, 0.06, c); var h = cyl(0.05, 0.05, 0.1, ACCENT_METAL, false); t.rotation.y = Math.PI / 2; h.rotation.z = Math.PI / 2; return grp([t, h]); } },
      { id: 'large', label: 'Large', shape: 'round', build: function (c) { var t = trs(0.24, 0.08, c); var h = cyl(0.07, 0.07, 0.12, ACCENT_METAL, false); t.rotation.y = Math.PI / 2; h.rotation.z = Math.PI / 2; return grp([t, h]); } },
      { id: 'offroad', label: 'Chunky', shape: 'round', build: function (c) { var t = cyl(0.22, 0.22, 0.2, c); t.rotation.z = Math.PI / 2; var h = cyl(0.06, 0.06, 0.22, ACCENT_METAL, false); h.rotation.z = Math.PI / 2; return grp([t, h]); } },
      {
        id: 'dual', label: 'Twin', shape: 'round', build: function (c) {
          var t1 = trs(0.15, 0.06, c), t2 = trs(0.15, 0.06, c); t1.rotation.y = t2.rotation.y = Math.PI / 2;
          at(t1, 0, 0, -0.14); at(t2, 0, 0, 0.14);
          var ax = cyl(0.03, 0.03, 0.34, ACCENT_METAL, false); ax.rotation.z = Math.PI / 2;
          return grp([t1, t2, ax]);
        }
      }
    ],
    accessory: [
      {
        id: 'tophat', label: 'Top Hat', shape: 'square', build: function (c) {
          var brim = cyl(0.3, 0.3, 0.03, c); var top = cyl(0.19, 0.19, 0.3, c);
          at(brim, 0, 0, 0); at(top, 0, 0.16, 0);
          return grp([brim, top]);
        }
      },
      { id: 'party', label: 'Party Hat', shape: 'round', build: function (c) { var h = cone(0.22, 0.4, c); at(h, 0, 0.2, 0); var ball = sph(0.05, ACCENT_GOLD, false); at(ball, 0, 0.41, 0); return grp([h, ball]); } },
      {
        id: 'bow', label: 'Bow', shape: 'round', build: function (c) {
          var l = cone(0.14, 0.2, c), r = cone(0.14, 0.2, c), knot = sph(0.07, c);
          l.rotation.z = Math.PI / 2; r.rotation.z = -Math.PI / 2; at(l, -0.12, 0, 0); at(r, 0.12, 0, 0);
          return grp([l, r, knot]);
        }
      },
      {
        id: 'flower', label: 'Flower', shape: 'round', build: function (c) {
          var kids = [], n = 5, i;
          for (i = 0; i < n; i++) {
            var p = sph(0.08, c); var a = (i / n) * Math.PI * 2;
            at(p, Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0); kids.push(p);
          }
          kids.push(sph(0.07, ACCENT_GOLD, false));
          return grp(kids);
        }
      },
      { id: 'badge', label: 'Badge', shape: 'round', build: function (c) { var r = cyl(0.14, 0.14, 0.03, c); r.rotation.x = Math.PI / 2; var s = cyl(0.07, 0.07, 0.04, ACCENT_GOLD, false); s.rotation.x = Math.PI / 2; at(s, 0, 0, 0.02); return grp([r, s]); } }
    ]
  };
  function eyeBall(sx, r) {
    var g = grp([sph(r, '#ffffff')]); var p = sph(r * 0.55, ACCENT_DARK, false); at(p, 0, 0, r * 0.7); g.add(p); g.position.x = sx; return g;
  }
  function eyeSquare(sx) {
    var g = grp([bx(0.16, 0.16, 0.08, '#ffffff')]); var p = bx(0.08, 0.08, 0.05, ACCENT_DARK, false); at(p, 0, 0, 0.06); g.add(p); g.position.x = sx; return g;
  }
  /* body default is the first entry, used for new robots */

  /* ================= workshop scene (shared geometry, one per window) ================= */
  function buildWorkshop() {
    var scene = new THREE.Scene();
    scene.background = col('#bfe3ff');

    var hemi = new THREE.HemisphereLight(0xffffff, 0x4a5a3a, 0.85);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffffff, 0.95);
    sun.position.set(3.5, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -4; sun.shadow.camera.right = 4; sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    /* floor */
    var floor = mesh(new THREE.CircleGeometry(6, 40), '#e8d3ad', false);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.userData.paintable = false;
    scene.add(floor);
    var rug = mesh(new THREE.CircleGeometry(2.4, 40), '#ffe3a8', false);
    rug.rotation.x = -Math.PI / 2; rug.position.y = 0.002; rug.receiveShadow = true;
    scene.add(rug);

    /* back wall + mural */
    var wall = mesh(new THREE.PlaneGeometry(12, 5), '#d9f0ff', false);
    wall.position.set(0, 2.3, -2.6); scene.add(wall);
    var sunDeco = mesh(new THREE.CircleGeometry(0.55, 24), '#ffe066', false);
    sunDeco.position.set(-3.2, 3.6, -2.58); scene.add(sunDeco);
    [-2, -1, 1, 2].forEach(function (x, i) {
      var cloud = mesh(new THREE.CircleGeometry(0.4 - Math.abs(x) * 0.03, 20), '#ffffff', false);
      cloud.position.set(x * 1.3, 3.9 + (i % 2) * 0.15, -2.59); scene.add(cloud);
    });

    /* shelves with little decorative parts (not interactive) */
    function shelf(x, y) {
      var board = bx(1.7, 0.08, 0.4, '#c98b4b', false); at(board, x, y, -2.1); board.receiveShadow = true; scene.add(board);
      var deco = [sph(0.12, PALETTE[(x | 0) % PALETTE.length], false), bx(0.18, 0.18, 0.18, PALETTE[2], false), cyl(0.1, 0.1, 0.22, PALETTE[5], false)];
      deco.forEach(function (d, i) { at(d, x - 0.5 + i * 0.5, y + 0.14, -2.1); d.rotation.y = i; scene.add(d); });
    }
    shelf(-2.4, 2.2); shelf(2.4, 2.2); shelf(-2.4, 1.3); shelf(2.4, 1.3);

    /* workbench */
    var benchTop = bx(2.1, 0.12, 1.3, '#a9754a', false); benchTop.position.y = 0.72; scene.add(benchTop);
    [[-0.9, -0.55], [0.9, -0.55], [-0.9, 0.55], [0.9, 0.55]].forEach(function (p) {
      var leg = cyl(0.06, 0.06, 0.72, '#7a5230', false); leg.position.set(p[0], 0.36, p[1]); scene.add(leg);
    });

    var benchTopY = 0.78;
    return { scene: scene, benchTopY: benchTopY };
  }

  /* ================= robot model ================= */
  function newRobot(id) {
    var group = new THREE.Group(), stand = new THREE.Group();
    group.add(stand);
    return { id: id, group: group, stand: stand, parts: [], selectedId: null, partSeq: 1 };
  }
  function makeDefaultRobot(id, x) {
    var r = newRobot(id);
    r.group.position.x = x || 0;
    addPart(r, 'body', 'small', PALETTE[5]);
    addPart(r, 'head', 'round', PALETTE[2]);
    addPart(r, 'eyes', 'round', '#ffffff');
    addPart(r, 'arms', 'short', PALETTE[5]);
    addPart(r, 'arms', 'short', PALETTE[5]);
    addPart(r, 'legs', 'short', PALETTE[9]);
    addPart(r, 'legs', 'short', PALETTE[9]);
    relayout(r);
    return r;
  }
  function totalParts(r) { return r.parts.length; }
  function countCat(r, cat) { return r.parts.filter(function (p) { return p.cat === cat; }).length; }

  function addPart(r, cat, variantId, color) {
    if (cat !== 'body' && countCat(r, cat) >= MAX_PER_CAT) return null;
    if (totalParts(r) >= MAX_TOTAL) return null;
    var def = (CATALOG[cat] || []).filter(function (v) { return v.id === variantId; })[0] || CATALOG[cat][0];
    if (!def) return null;
    if (cat === 'body') {
      var old = r.parts.filter(function (p) { return p.cat === 'body'; })[0];
      if (old) removePart(r, old.id, true);
    }
    var mesh3 = def.build(color);
    var part = { id: 'p' + (r.partSeq++), cat: cat, variant: variantId, color: color, spin: 0, mesh: mesh3 };
    r.parts.push(part);
    r.stand.add(mesh3);
    return part;
  }
  function removePart(r, partId, skipRelayout) {
    var idx = -1, i;
    for (i = 0; i < r.parts.length; i++) if (r.parts[i].id === partId) { idx = i; break; }
    if (idx < 0) return;
    var p = r.parts[idx];
    if (p.cat === 'body') return; /* body is swapped, not removed */
    r.stand.remove(p.mesh); disposeObj(p.mesh);
    r.parts.splice(idx, 1);
    if (r.selectedId === partId) r.selectedId = null;
    if (!skipRelayout) relayout(r);
  }
  function duplicatePart(r, partId) {
    var p = r.parts.filter(function (x) { return x.id === partId; })[0];
    if (!p || p.cat === 'body') return null;
    var np = addPart(r, p.cat, p.variant, p.color);
    if (np) np.spin = p.spin;
    relayout(r);
    return np;
  }

  /* lay out every part of a robot fresh, based on category rules */
  function relayout(r) {
    var body = r.parts.filter(function (p) { return p.cat === 'body'; })[0];
    if (!body) return;
    /* reset so every bbox() below reads plain local coordinates, regardless of
       whatever the animation loop last did to r.group, or a previous relayout did to r.stand */
    r.group.position.set(0, 0, 0); r.group.rotation.set(0, 0, 0);
    r.stand.position.set(0, 0, 0); r.stand.rotation.set(0, 0, 0);
    /* position.set() alone does not refresh the cached matrixWorld used by bbox()/localBBox();
       without this, a relayout triggered outside the render loop (e.g. right after dropPart)
       would read stale ancestor transforms left over from the last animated frame. */
    r.group.updateMatrixWorld(true);
    var bb = localBBox(body.mesh);
    var topY = bb.max.y, botY = bb.min.y, halfW = Math.max(0.3, bb.size.x / 2), halfD = Math.max(0.25, bb.size.z / 2);
    at(body.mesh, 0, 0, 0); body.mesh.rotation.y = body.spin;

    /* heads stack upward; remember each head's mid-height & top-surface for eyes/antenna */
    var heads = r.parts.filter(function (p) { return p.cat === 'head'; });
    var headSlots = [], y = topY;
    heads.forEach(function (p) {
      var hb = localBBox(p.mesh);
      var baseY = y - hb.min.y;
      p.mesh.position.set(0, baseY, 0); p.mesh.rotation.y = p.spin;
      headSlots.push({ midY: baseY + (hb.min.y + hb.max.y) / 2, topY: baseY + hb.max.y, frontZ: hb.max.z, halfW: hb.size.x / 2 });
      y += hb.size.y;
    });
    var topStackY = y;
    var topHead = headSlots.length ? headSlots[headSlots.length - 1] : { midY: (topY + botY) / 2 + (topY - botY) * 0.3, topY: topY, frontZ: halfD, halfW: halfW };

    /* eyes: each placed part is already a complete pair (or a single cyclops eye);
       round-robin across heads, stacking extra pairs in rows down the same face. */
    var eyes = r.parts.filter(function (p) { return p.cat === 'eyes'; });
    var faceSlots = headSlots.length ? headSlots : [{ midY: (topY + botY) / 2 + (topY - botY) * 0.15, frontZ: halfD, halfW: halfW }];
    var rowCount = {};
    eyes.forEach(function (p, i) {
      var faceIdx = i % faceSlots.length, slot = faceSlots[faceIdx];
      var row = rowCount[faceIdx] = (rowCount[faceIdx] || 0);
      rowCount[faceIdx]++;
      p.mesh.position.set(0, slot.midY + 0.04 - row * 0.17, slot.frontZ * 0.94 + 0.02);
      p.mesh.rotation.y = p.spin;
    });

    /* antenna: on top of the topmost head (or body top), spread sideways */
    var ants = r.parts.filter(function (p) { return p.cat === 'antenna'; });
    ants.forEach(function (p, i) {
      var cx = (i - (ants.length - 1) / 2) * 0.22;
      p.mesh.position.set(cx, topStackY, topHead.frontZ * 0.2);
      p.mesh.rotation.y = p.spin;
    });

    /* accessories: also on top, slightly scattered */
    var accs = r.parts.filter(function (p) { return p.cat === 'accessory'; });
    accs.forEach(function (p, i) {
      var ang = i * 1.3;
      p.mesh.position.set(Math.cos(ang) * 0.12 * i, topStackY + 0.02, Math.sin(ang) * 0.12 * i);
      p.mesh.rotation.y = p.spin;
    });

    /* arms: left/right pairs down the sides of the body */
    var arms = r.parts.filter(function (p) { return p.cat === 'arms'; });
    arms.forEach(function (p, i) {
      var pair = Math.floor(i / 2), side = i % 2 === 0 ? -1 : 1;
      var sy = Math.max(botY + 0.1, topY - 0.25 - pair * 0.3);
      p.mesh.position.set(side * halfW, sy, 0);
      p.mesh.scale.x = side;
      p.mesh.rotation.y = p.spin * side;
    });

    /* legs: spread along the bottom, hanging down */
    var legs = r.parts.filter(function (p) { return p.cat === 'legs'; });
    legs.forEach(function (p, i) {
      var n = legs.length, lx = n <= 1 ? 0 : (i / (n - 1) - 0.5) * Math.max(halfW * 1.6, 0.4);
      p.mesh.position.set(lx, botY, -0.05);
      p.mesh.rotation.y = p.spin;
    });

    /* wheels: spread along the bottom too, offset to the front so legs can coexist */
    var wheels = r.parts.filter(function (p) { return p.cat === 'wheels'; });
    wheels.forEach(function (p, i) {
      var n = wheels.length, wx = n <= 1 ? 0 : (i / (n - 1) - 0.5) * Math.max(halfW * 1.8, 0.5);
      p.mesh.position.set(wx, botY, halfD * 0.6 + 0.1);
      p.mesh.rotation.y = p.spin;
    });

    /* ground the whole robot: shift everything up so its very lowest point
       (leg/wheel feet if any, otherwise the body itself) rests on the bench surface (y=0) */
    var minY = 0;
    r.parts.forEach(function (p) { minY = Math.min(minY, bbox(p.mesh).min.y); });
    r.stand.position.y = -minY;
    r.group.updateMatrixWorld(true);
  }

  /* ================= animations ================= */
  function poseAnim(r, kind, t) {
    var byCat = {};
    r.parts.forEach(function (p) { (byCat[p.cat] = byCat[p.cat] || []).push(p); });
    r.group.rotation.set(0, 0, 0); r.group.position.y = 0;
    (byCat.arms || []).forEach(function (p) { p.mesh.rotation.z = 0; });
    (byCat.head || []).forEach(function (p) { p.mesh.rotation.z = 0; });
    (byCat.legs || []).forEach(function (p) { p.mesh.rotation.x = 0; });
    if (kind === 'wave') {
      (byCat.arms || []).forEach(function (p, i) {
        var side = i % 2 === 0 ? -1 : 1;
        p.mesh.rotation.z = side * (Math.sin(t * 6) * 0.5 + 0.4);
      });
      (byCat.head || []).forEach(function (p) { p.mesh.rotation.z = Math.sin(t * 3) * 0.08; });
    } else if (kind === 'dance') {
      r.group.position.y = Math.abs(Math.sin(t * 7)) * 0.14;
      r.group.rotation.y = Math.sin(t * 3) * 0.3;
      (byCat.arms || []).forEach(function (p, i) { p.mesh.rotation.z = (i % 2 === 0 ? -1 : 1) * (0.6 + Math.sin(t * 7 + i) * 0.4); });
    } else if (kind === 'walk') {
      (byCat.legs || []).forEach(function (p, i) { p.mesh.rotation.x = Math.sin(t * 6 + (i % 2) * Math.PI) * 0.5; });
      (byCat.arms || []).forEach(function (p, i) { p.mesh.rotation.z = (i % 2 === 0 ? -1 : 1) * 0.15 + Math.sin(t * 6 + (i % 2) * Math.PI) * 0.25; });
      r.group.position.y = Math.abs(Math.sin(t * 6)) * 0.05;
    } else if (kind === 'spin') {
      r.group.rotation.y = t * 5;
      r.group.position.y = Math.abs(Math.sin(t * 8)) * 0.08;
    } else {
      /* idle: gentle breathing sway so the workshop always feels alive */
      r.group.position.y = Math.sin(t * 1.4) * 0.015;
      r.group.rotation.y = Math.sin(t * 0.7) * 0.03;
    }
  }

  /* ================= serialise ================= */
  function serialise(r) {
    return {
      v: 1, name: r.name || 'My Robot',
      parts: r.parts.map(function (p) { return { cat: p.cat, variant: p.variant, color: p.color, spin: p.spin }; })
    };
  }
  function deserialise(r, data) {
    r.parts.slice().forEach(function (p) { r.stand.remove(p.mesh); disposeObj(p.mesh); });
    r.parts = [];
    (data.parts || []).forEach(function (pd) {
      var part = addPart(r, pd.cat, pd.variant, pd.color || '#4dabf7');
      if (part) part.spin = pd.spin || 0;
    });
    if (!r.parts.some(function (p) { return p.cat === 'body'; })) addPart(r, 'body', 'small', PALETTE[5]);
    relayout(r);
  }

  /* ================= CSS ================= */
  function injectCSS() {
    if (document.getElementById('rw-style')) return;
    var css = '' +
      '.rw-app{position:relative;width:100%;height:100%;display:flex;background:#bfe3ff;font-size:16px;overflow:hidden}' +
      '.rw-side{width:230px;flex:none;background:#fff8ec;border-right:4px solid #f1c988;display:flex;flex-direction:column;overflow:hidden}' +
      '.rw-tabs{display:flex;flex-wrap:wrap;gap:4px;padding:8px;background:#ffe9c7}' +
      '.rw-tab{border:3px solid transparent;background:#fff;border-radius:12px;padding:5px 7px;font-weight:800;font-size:12.5px;color:#7a4a1a;display:flex;align-items:center;gap:5px;cursor:pointer}' +
      '.rw-tab .dot{width:12px;height:12px;border-radius:50%;flex:none}' +
      '.rw-tab.on{border-color:#f08c00;background:#fff3de}' +
      '.rw-hint{margin:0;padding:8px 10px;font-size:13px;color:#8a5a1f;background:#fff3de;border-bottom:2px dashed #f1c988}' +
      '.rw-grid{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-content:start}' +
      '.rw-part{border:3px solid #e9c48a;background:#fff;border-radius:14px;padding:6px;text-align:center;cursor:grab;touch-action:none;user-select:none}' +
      '.rw-part:hover{border-color:#f08c00}' +
      '.rw-swatch{width:42px;height:42px;margin:0 auto 4px;border:3px solid rgba(0,0,0,.25)}' +
      '.rw-shape-round{border-radius:50%}.rw-shape-square{border-radius:8px}' +
      '.rw-part .lbl{font-size:12px;font-weight:800;color:#5c3a10;display:block}' +
      '.rw-paint{display:flex;flex-wrap:wrap;gap:5px;padding:8px 10px;background:#fff3de;border-top:2px dashed #f1c988}' +
      '.rw-sw{width:22px;height:22px;border-radius:50%;border:2px solid rgba(0,0,0,.25);cursor:pointer;padding:0}' +
      '.rw-sw.on{outline:3px solid #212529;outline-offset:1px}' +
      '.rw-main{flex:1;position:relative;display:flex;flex-direction:column;min-width:0}' +
      '.rw-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#e7f5ff;border-bottom:4px solid #a5d8ff;align-items:center}' +
      '.rw-btn{border:0;border-radius:12px;background:#4dabf7;color:#fff;font-weight:800;padding:9px 13px;font-size:14px;display:flex;align-items:center;gap:6px;cursor:pointer;box-shadow:0 3px 0 #1971c2}' +
      '.rw-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #1971c2}' +
      '.rw-btn.g{background:#40c057;box-shadow:0 3px 0 #2f9e44}.rw-btn.g:active{box-shadow:0 1px 0 #2f9e44}' +
      '.rw-btn.r{background:#ff8787;box-shadow:0 3px 0 #e03131}.rw-btn.r:active{box-shadow:0 1px 0 #e03131}' +
      '.rw-btn.y{background:#ffd43b;color:#5c3a10;box-shadow:0 3px 0 #f08c00}.rw-btn.y:active{box-shadow:0 1px 0 #f08c00}' +
      '.rw-btn[disabled]{opacity:.4;cursor:default;box-shadow:none;transform:none}' +
      '.rw-spacer{flex:1}' +
      '.rw-canwrap{flex:1;position:relative;min-height:0}' +
      '.rw-canwrap canvas{display:block;width:100%;height:100%}' +
      '.rw-idea{position:absolute;left:10px;top:10px;max-width:280px;background:#fff;border:3px solid #ffd43b;border-radius:14px;padding:8px 10px;box-shadow:0 4px 10px rgba(0,0,0,.15);font-size:13.5px;font-weight:700;color:#5c3a10;display:flex;gap:8px;align-items:center}' +
      '.rw-idea button{border:0;background:#ffe066;border-radius:8px;padding:4px 7px;font-weight:800;cursor:pointer;font-size:12px}' +
      '.rw-panel{position:absolute;right:10px;top:10px;background:#fff;border:3px solid #a5d8ff;border-radius:16px;padding:10px;width:208px;box-shadow:0 4px 10px rgba(0,0,0,.18)}' +
      '.rw-panel h4{margin:0 0 6px;font-size:14px;color:#1b3a6b}' +
      '.rw-panel .row{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}' +
      '.rw-anim{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:8px;background:rgba(255,255,255,.92);padding:8px;border-radius:16px;box-shadow:0 4px 10px rgba(0,0,0,.18)}' +
      '.rw-welcome{position:absolute;inset:0;background:rgba(27,58,107,.55);display:flex;align-items:center;justify-content:center;z-index:5}' +
      '.rw-welcome .card{background:#fff;border-radius:18px;padding:20px;max-width:320px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.3)}' +
      '.rw-welcome h3{margin:0 0 8px;color:#1b3a6b}' +
      '.rw-welcome p{margin:0 0 14px;color:#495057;font-size:15px}' +
      '.rw-narrow .rw-side{position:absolute;left:0;top:0;bottom:0;z-index:4;transform:translateX(-100%);transition:transform .2s}' +
      '.rw-narrow.rw-open .rw-side{transform:translateX(0)}' +
      '.rw-togcat{display:none}.rw-narrow .rw-togcat{display:flex}';
    document.head.appendChild(el('style', { id: 'rw-style', html: css }));
  }

  /* ================= app ================= */
  LCL.registerApp({
    id: 'robotworkshop',
    title: 'Robot Workshop',
    icon: 'robotworkshop',
    w: 1040, h: 700, minW: 620, minH: 440,
    help: 'Build your own 3D robot! Drag parts onto your robot, give it colours, then press Bring to Life.',
    mount: function (root, ctx) {
      injectCSS();
      var app = el('div', { class: 'rw-app' });
      root.appendChild(app);

      if (!THREE) {
        app.appendChild(el('p', { text: 'Robot Workshop needs its 3D library (vendor/three.min.js) to run.', style: 'padding:20px' }));
        return { destroy: function () {} };
      }

      var currentFileId = null, dirty = false, activeCat = 'head', paintColor = PALETTE[5];
      var ws = buildWorkshop();
      var robots = [makeDefaultRobot('r1', 0)];
      robots.forEach(function (r) { ws.scene.add(r.group); r.group.position.y = ws.benchTopY; });
      var activeRobotId = robots[0].id;
      var selIndicator = trs(0.3, 0.025, '#ffd43b', false); selIndicator.rotation.x = Math.PI / 2; selIndicator.visible = false;
      ws.scene.add(selIndicator);

      var playing = null, clock = new THREE.Clock(), raf = null;

      /* ---- layout: canvas + camera ---- */
      var canwrap = el('div', { class: 'rw-canwrap' });
      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      canwrap.appendChild(renderer.domElement);
      var camera = new THREE.PerspectiveCamera(48, 1, 0.1, 50);
      camera.position.set(2.4, 2.1, 3.2);
      var controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, ws.benchTopY + 0.6, 0);
      controls.enableDamping = true; controls.dampingFactor = 0.08;
      controls.minDistance = 1.6; controls.maxDistance = 6.5;
      controls.maxPolarAngle = Math.PI * 0.49; controls.minPolarAngle = Math.PI * 0.08;
      controls.enablePan = false;
      controls.update();

      /* ---- idea banner ---- */
      var ideaIdx = Math.floor(Math.random() * IDEAS.length);
      var ideaBox = el('div', { class: 'rw-idea' });
      function renderIdea() {
        ideaBox.innerHTML = '';
        ideaBox.appendChild(el('span', { text: 'Idea: ' + IDEAS[ideaIdx] }));
        ideaBox.appendChild(el('button', { text: 'New idea', onclick: function () { ideaIdx = (ideaIdx + Math.floor(1 + Math.random() * (IDEAS.length - 1))) % IDEAS.length; renderIdea(); } }));
        ideaBox.appendChild(el('button', { text: 'Hide', onclick: function () { ideaBox.hidden = true; } }));
      }
      renderIdea();
      canwrap.appendChild(ideaBox);

      /* ---- selected-part panel ---- */
      var panel = el('div', { class: 'rw-panel', hidden: true });
      canwrap.appendChild(panel);

      /* ---- animation chooser / stop bar ---- */
      var animBar = el('div', { class: 'rw-anim', hidden: true });
      canwrap.appendChild(animBar);

      app.appendChild((function () {
        var side = el('div', { class: 'rw-side' });
        var tabs = el('div', { class: 'rw-tabs' });
        var colours = ['#748ffc', '#ffd43b', '#ff8787', '#69db7c', '#e599f7', '#868e96'];
        CATS.forEach(function (cat, i) {
          var b = el('button', { class: 'rw-tab' + (cat === activeCat ? ' on' : ''), 'data-cat': cat });
          b.appendChild(el('span', { class: 'dot', style: 'background:' + colours[i % colours.length] }));
          b.appendChild(document.createTextNode(CAT_LABEL[cat]));
          b.addEventListener('click', function () { activeCat = cat; refreshCatalog(); });
          tabs.appendChild(b);
        });
        side.appendChild(tabs);
        var hint = el('p', { class: 'rw-hint' });
        side.appendChild(hint);
        var grid = el('div', { class: 'rw-grid' });
        side.appendChild(grid);
        var paintRow = el('div', { class: 'rw-paint' });
        paintRow.appendChild(el('span', { text: 'New part colour:', style: 'width:100%;font-size:12px;font-weight:800;color:#8a5a1f' }));
        PALETTE.forEach(function (c) {
          var sw = el('button', { class: 'rw-sw' + (c === paintColor ? ' on' : ''), style: 'background:' + c, title: 'Pick this colour' });
          sw.addEventListener('click', function () {
            paintColor = c;
            Array.prototype.forEach.call(paintRow.querySelectorAll('.rw-sw'), function (x) { x.classList.toggle('on', x.style.background === hexToRgbStr(c)); });
          });
          paintRow.appendChild(sw);
        });
        side.appendChild(paintRow);
        side._grid = grid; side._hint = hint; side._tabs = tabs;
        return side;
      })());

      var mainCol = el('div', { class: 'rw-main' });
      var toolbar = buildToolbar();
      mainCol.appendChild(toolbar);
      mainCol.appendChild(canwrap);
      app.appendChild(mainCol);

      function hexToRgbStr(hex) {
        var d = document.createElement('div'); d.style.background = hex; document.body.appendChild(d);
        var v = getComputedStyle(d).backgroundColor; d.remove(); return v;
      }

      function buildToolbar() {
        var bar = el('div', { class: 'rw-toolbar' });
        bar.appendChild(el('button', { class: 'rw-togcat', html: I.g('open'), title: 'Parts', onclick: function () { app.classList.toggle('rw-open'); } }));
        bar.appendChild(el('button', { class: 'rw-btn', html: I.g('newpage') + ' New Robot', onclick: onNewRobot }));
        bar.appendChild(el('button', { class: 'rw-btn', html: I.g('copy') + ' Duplicate Robot', onclick: onDuplicateRobot }));
        bar.appendChild(el('button', { class: 'rw-btn', html: I.g('save') + ' Save', onclick: onSave }));
        bar.appendChild(el('button', { class: 'rw-btn', html: I.g('open') + ' Load', onclick: onLoad }));
        bar.appendChild(el('span', { class: 'rw-spacer' }));
        bar.appendChild(el('button', { class: 'rw-btn y', html: I.g('refresh') + ' Reset View', onclick: resetView }));
        bar.appendChild(el('button', { class: 'rw-btn g', html: I.g('star') + ' Bring to Life!', onclick: openAnimChooser }));
        return bar;
      }

      function activeRobot() { return robots.filter(function (r) { return r.id === activeRobotId; })[0] || robots[0]; }
      function selectedPart() {
        var r = activeRobot();
        return r.parts.filter(function (p) { return p.id === r.selectedId; })[0] || null;
      }
      function markDirty() { dirty = true; }

      function refreshCatalog() {
        var side = app.querySelector('.rw-side'); if (!side) return;
        Array.prototype.forEach.call(side._tabs.children, function (b) { b.classList.toggle('on', b.getAttribute('data-cat') === activeCat); });
        side._hint.textContent = CAT_HINT[activeCat] || '';
        var grid = side._grid; grid.innerHTML = '';
        (CATALOG[activeCat] || []).forEach(function (def) {
          var card = el('div', { class: 'rw-part' });
          var sw = el('div', { class: 'rw-swatch rw-shape-' + def.shape, style: 'background:' + paintColor });
          card.appendChild(sw);
          card.appendChild(el('span', { class: 'lbl', text: def.label }));
          wireDrag(card, activeCat, def.id);
          grid.appendChild(card);
        });
      }

      /* ---- drag a catalogue card onto the workshop (with a tap fallback) ---- */
      function wireDrag(card, cat, variantId) {
        var ghost = null, startX, startY, moved = false, pid = null;
        card.addEventListener('pointerdown', function (e) {
          startX = e.clientX; startY = e.clientY; moved = false; pid = e.pointerId;
          card.setPointerCapture(pid);
        });
        card.addEventListener('pointermove', function (e) {
          if (pid == null) return;
          var dx = e.clientX - startX, dy = e.clientY - startY;
          if (!moved && Math.abs(dx) + Math.abs(dy) > 8) {
            moved = true;
            ghost = el('div', { class: 'rw-part', style: 'position:fixed;z-index:50;pointer-events:none;opacity:.85;width:70px;transform:translate(-50%,-50%)' });
            ghost.appendChild(el('div', { class: 'rw-swatch rw-shape-' + (CATALOG[cat].filter(function (d) { return d.id === variantId; })[0] || {}).shape, style: 'background:' + paintColor }));
            document.body.appendChild(ghost);
          }
          if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
        });
        function finish(e) {
          if (pid == null) return;
          try { card.releasePointerCapture(pid); } catch (err) {}
          pid = null;
          if (ghost) { ghost.remove(); ghost = null; }
          var overCanvas = !moved; /* a tap always counts as "add it" */
          if (moved) {
            var r = canwrap.getBoundingClientRect();
            overCanvas = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          }
          if (overCanvas) dropPart(cat, variantId);
        }
        card.addEventListener('pointerup', finish);
        card.addEventListener('pointercancel', finish);
      }

      function dropPart(cat, variantId) {
        var r = activeRobot();
        if (cat !== 'body' && countCat(r, cat) >= MAX_PER_CAT) { LCL.bleep.say('That part already has plenty on this robot! Try another part.', { ms: 5000 }); return; }
        if (totalParts(r) >= MAX_TOTAL) { LCL.bleep.say('This robot is getting very big! Try starting a new one.', { ms: 5000 }); return; }
        var p = addPart(r, cat, variantId, paintColor);
        if (!p) return;
        relayout(r);
        r.selectedId = p.id;
        LCL.sound.play('pop'); markDirty();
        renderPanel();
      }

      /* ---- selecting placed parts by clicking the canvas ---- */
      var ray = new THREE.Raycaster();
      (function wireSelect() {
        var downX, downY;
        renderer.domElement.addEventListener('pointerdown', function (e) { downX = e.clientX; downY = e.clientY; });
        renderer.domElement.addEventListener('pointerup', function (e) {
          if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6) return;
          var rect = renderer.domElement.getBoundingClientRect();
          var ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
          ray.setFromCamera(ndc, camera);
          var targets = [];
          robots.forEach(function (r) { targets.push(r.group); });
          var hits = ray.intersectObjects(targets, true);
          if (!hits.length) { clearSelection(); return; }
          var obj = hits[0].object, robot = null, part = null;
          robots.forEach(function (r) {
            r.parts.forEach(function (p) {
              var found = false;
              p.mesh.traverse(function (o) { if (o === obj) found = true; });
              if (found) { robot = r; part = p; }
            });
          });
          if (part) { activeRobotId = robot.id; robot.selectedId = part.id; renderPanel(); }
        });
      })();
      function clearSelection() { robots.forEach(function (r) { r.selectedId = null; }); renderPanel(); }

      function renderPanel() {
        var r = activeRobot(), p = selectedPart();
        selIndicator.visible = !!p;
        if (p) {
          r.group.position.y = ws.benchTopY; r.group.rotation.set(0, 0, 0);
          r.group.updateMatrixWorld(true);
          var wp = new THREE.Vector3(); p.mesh.getWorldPosition(wp);
          var bb = bbox(p.mesh);
          selIndicator.position.set(wp.x, bb.min.y, wp.z);
        }
        if (!p) { panel.hidden = true; return; }
        panel.hidden = false; panel.innerHTML = '';
        panel.appendChild(el('h4', { text: (CATALOG[p.cat].filter(function (d) { return d.id === p.variant; })[0] || {}).label + ' ' + CAT_LABEL[p.cat].replace(/s$/, '') }));
        var row = el('div', { class: 'row' });
        PALETTE.forEach(function (c) {
          row.appendChild(el('button', { class: 'rw-sw', style: 'background:' + c, onclick: function () { p.color = c; paintGroup(p.mesh, c); markDirty(); } }));
        });
        panel.appendChild(row);
        var row2 = el('div', { class: 'row' });
        row2.appendChild(el('button', { class: 'rw-btn', style: 'padding:6px 9px', html: I.g('refresh'), title: 'Rotate', onclick: function () { p.spin += Math.PI / 4; relayout(r); markDirty(); } }));
        row2.appendChild(el('button', { class: 'rw-btn', style: 'padding:6px 9px', html: I.g('copy'), title: 'Duplicate this part', onclick: function () { var np = duplicatePart(r, p.id); if (np) { r.selectedId = np.id; markDirty(); renderPanel(); } else LCL.bleep.say('There is no more room for that part!', { ms: 4000 }); } }));
        if (p.cat !== 'body') row2.appendChild(el('button', { class: 'rw-btn r', style: 'padding:6px 9px', html: I.g('trash'), title: 'Remove', onclick: function () { removePart(r, p.id); markDirty(); renderPanel(); } }));
        panel.appendChild(row2);
        if (p.cat === 'body') panel.appendChild(el('p', { text: 'Drag a new body to swap it.', style: 'font-size:11.5px;color:#868e96;margin:6px 0 0' }));
      }

      /* ---- animations ---- */
      function openAnimChooser() {
        animBar.hidden = false; animBar.innerHTML = '';
        [['wave', 'Wave'], ['dance', 'Dance'], ['walk', 'Walk'], ['spin', 'Spin']].forEach(function (a) {
          animBar.appendChild(el('button', { class: 'rw-btn g', text: a[1], onclick: function () { playing = a[0]; renderAnimBar(); } }));
        });
        animBar.appendChild(el('button', { class: 'rw-btn', text: 'Close', onclick: function () { animBar.hidden = true; } }));
      }
      function renderAnimBar() {
        animBar.innerHTML = '';
        animBar.appendChild(el('span', { text: 'Playing: ' + playing, style: 'font-weight:800;color:#2b8a3e;align-self:center' }));
        animBar.appendChild(el('button', { class: 'rw-btn r', html: I.g('close') + ' Stop', onclick: function () { playing = null; animBar.hidden = true; resetPose(); } }));
      }
      function resetPose() { robots.forEach(function (r) { relayout(r); r.group.rotation.set(0, 0, 0); r.group.position.y = ws.benchTopY; }); }

      /* ---- robot/file actions ---- */
      function guard(next) {
        if (!dirty) return next();
        LCL.ui.confirm(app, 'Your robot has not been saved. Start anyway and lose these changes?', { title: 'Not saved yet', yes: 'Yes, start anyway', no: 'No, keep working' }).then(function (ok) { if (ok) next(); });
      }
      function onNewRobot() {
        guard(function () {
          var r = activeRobot();
          r.parts.slice().forEach(function (p) { r.stand.remove(p.mesh); disposeObj(p.mesh); });
          r.parts = []; r.selectedId = null;
          addPart(r, 'body', 'small', PALETTE[5]); addPart(r, 'head', 'round', PALETTE[2]);
          addPart(r, 'eyes', 'round', '#ffffff');
          relayout(r); currentFileId = null; dirty = false; renderPanel();
          LCL.bleep.say('Fresh start! Build whatever you like.', { ms: 5000 });
        });
      }
      function onDuplicateRobot() {
        var src = activeRobot();
        if (robots.length >= 2) { LCL.bleep.say('Only two robots can share the workbench at once! Try Save to keep this one, then start a new robot.', { ms: 7000 }); return; }
        var nr = newRobot('r' + Date.now());
        nr.group.position.x = src.group.position.x >= 0 ? -1.5 : 1.5;
        nr.group.position.y = ws.benchTopY;
        src.parts.forEach(function (p) { var np = addPart(nr, p.cat, p.variant, p.color); if (np) np.spin = p.spin; });
        relayout(nr);
        ws.scene.add(nr.group);
        robots.push(nr); activeRobotId = nr.id;
        LCL.sound.play('tada'); markDirty();
        LCL.bleep.say('Ta-da! Here is a copy of your robot.', { ms: 5000 });
      }
      function onSave() {
        var r = activeRobot();
        if (currentFileId && vfs.get(currentFileId)) {
          vfs.writeFile(currentFileId, JSON.stringify(serialise(r)));
          dirty = false; LCL.sound.play('tada');
          LCL.bleep.say('Saved!', { ms: 3000 });
          return;
        }
        LCL.ui.fileDialog(app, { mode: 'save', kind: KIND, defaultName: r.name || 'My Robot', startId: vfs.DESKTOP })
          .then(function (res) {
            if (!res) return;
            r.name = res.name;
            var n = vfs.createFile(res.folderId, res.name, KIND, JSON.stringify(serialise(r)));
            currentFileId = n.id; dirty = false;
            LCL.sound.play('tada'); LCL.fx.confetti();
            LCL.bleep.say('Saved! You can find ' + res.name + ' and open it again later.', { ms: 6000 });
          });
      }
      function onLoad() {
        guard(function () {
          LCL.ui.fileDialog(app, { mode: 'open', kind: KIND, startId: currentFileId && vfs.get(currentFileId) ? vfs.get(currentFileId).parent : vfs.DESKTOP })
            .then(function (id) {
              if (!id) return;
              var n = vfs.get(id); if (!n) return;
              var data; try { data = JSON.parse(n.data); } catch (e) { LCL.bleep.say('I could not read that robot file.', { ms: 5000 }); return; }
              var r = activeRobot();
              r.name = data.name; deserialise(r, data);
              currentFileId = id; dirty = false; renderPanel();
              LCL.bleep.say('Here is ' + (data.name || 'your robot') + '!', { ms: 5000 });
            });
        });
      }
      function resetView() {
        camera.position.set(2.4, 2.1, 3.2);
        controls.target.set(0, ws.benchTopY + 0.6, 0);
        controls.update();
      }

      /* ---- welcome overlay (once per browser) ---- */
      if (!vfs.getKV('rw.seen', false)) {
        var wel = el('div', { class: 'rw-welcome' });
        var card = el('div', { class: 'card' });
        card.appendChild(el('h3', { text: 'Welcome to Robot Workshop!' }));
        card.appendChild(el('p', { text: 'Drag parts from the left onto your robot. Click a part on your robot to colour, rotate, copy or remove it. There is no wrong way to build - have fun!' }));
        card.appendChild(el('button', { class: 'rw-btn g', text: "Let's build!", onclick: function () { wel.remove(); } }));
        wel.appendChild(card);
        canwrap.appendChild(wel);
        vfs.setKV('rw.seen', true);
      }

      /* ---- render loop ---- */
      function sizeRenderer() {
        var w = canwrap.clientWidth || 1, h = canwrap.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        app.classList.toggle('rw-narrow', w < 760);
      }
      function tick() {
        raf = requestAnimationFrame(tick);
        var t = clock.getElapsedTime();
        robots.forEach(function (r) { poseAnim(r, playing, t); r.group.position.y += ws.benchTopY; });
        controls.update();
        renderer.render(ws.scene, camera);
      }
      requestAnimationFrame(function () { sizeRenderer(); refreshCatalog(); tick(); });

      return {
        onResize: sizeRenderer,
        onFocus: function () {},
        destroy: function () {
          cancelAnimationFrame(raf);
          robots.forEach(function (r) { disposeObj(r.group); });
          disposeObj(ws.scene);
          renderer.dispose();
        }
      };
    }
  });
})();
