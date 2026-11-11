/* Little Computer Lab: The Mystery of the Missing Power Crystal */
(function () {
  'use strict';
  var LCL = window.LCL, el = LCL.el, vfs = LCL.vfs;
  var NS = 'http://www.w3.org/2000/svg', KV = 'crystalmystery';

  /* ---------- CSS (injected once) ---------- */
  var CSS = [
'.cm-root{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;background:#1b1646;color:#2a2147;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none;--u:1}',
'.cm-root *{box-sizing:border-box}',
'.cm-top{display:flex;align-items:center;gap:8px;padding:6px 10px;background:linear-gradient(#3a2d7d,#2a2060);color:#fff;flex:0 0 auto}',
'.cm-loc{flex:1;display:flex;align-items:center;gap:8px;font-weight:800;font-size:calc(17px*var(--u));min-width:0}',
'.cm-loc span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.cm-dots{display:flex;gap:5px;margin-right:6px}',
'.cm-dot{width:calc(20px*var(--u));height:calc(20px*var(--u));opacity:.3;transition:opacity .4s,transform .4s}',
'.cm-dot.on{opacity:1;transform:scale(1.15)}',
'.cm-ib{min-width:48px;height:48px;border:0;border-radius:14px;background:#fff;box-shadow:0 3px 0 #b9acf0;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;padding:0 6px;font:inherit}',
'.cm-ib:active{transform:translateY(2px);box-shadow:none}',
'.cm-ib.wig{animation:cm-wig .6s 2}',
'.cm-newdot{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ff4f6d;border:2px solid #fff}',
'.cm-root button:focus-visible,.cm-card:focus-visible{outline:4px solid #ffd23f;outline-offset:2px}',
'.cm-stage{position:relative;flex:1 1 auto;min-height:0;background:#241f5e;overflow:hidden;--px:0}',
'.cm-svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}',
'.cm-l1{transform:translateX(calc(var(--px,0)*-6px));transition:transform .4s ease-out}',
'.cm-l2{transform:translateX(calc(var(--px,0)*-14px));transition:transform .4s ease-out}',
'.cm-l3{transform:translateX(calc(var(--px,0)*22px));transition:transform .4s ease-out}',
'.cm-hot{cursor:pointer;outline:none}',
'.cm-hot .cm-ring{opacity:0;fill:none;stroke:#fff;stroke-width:4;stroke-dasharray:10 7}',
'.cm-hot:hover .cm-ring,.cm-hot:focus .cm-ring{opacity:.95}',
'.cm-hot .cm-art{transition:filter .2s;}',
'.cm-hot:hover .cm-art,.cm-hot:focus .cm-art{filter:brightness(1.13) drop-shadow(0 0 6px #fff9)}',
'.cm-hot.cm-pulse .cm-ring{opacity:1;stroke:#ffd23f;animation:cm-ring 1s ease-in-out infinite}',
'@keyframes cm-ring{50%{stroke-width:8;opacity:.45}}',
'@keyframes cm-sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2.5deg)}}',
'.cm-sway{transform-box:fill-box;transform-origin:50% 100%;animation:cm-sway 4s ease-in-out infinite}',
'@keyframes cm-drift{from{transform:translateX(-40px)}to{transform:translateX(60px)}}',
'.cm-drift{animation:cm-drift 40s ease-in-out infinite alternate}',
'@keyframes cm-twk{0%,100%{opacity:.2}50%{opacity:1}}',
'.cm-twk{animation:cm-twk 2.4s infinite}',
'@keyframes cm-flt{0%{transform:translate(0,0);opacity:0}20%{opacity:1}50%{transform:translate(var(--dx,20px),-18px)}80%{opacity:1}100%{transform:translate(calc(var(--dx,20px)*-1),-40px);opacity:0}}',
'.cm-ff{animation:cm-flt 6s ease-in-out infinite}',
'@keyframes cm-glw{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}',
'.cm-glw{transform-box:fill-box;transform-origin:50% 50%;animation:cm-glw 3s ease-in-out infinite}',
'@keyframes cm-shm{to{stroke-dashoffset:-40}}',
'.cm-shm{stroke-dasharray:14 26;animation:cm-shm 3s linear infinite}',
'@keyframes cm-fall{0%{transform:translate(0,-20px) rotate(0);opacity:0}10%{opacity:1}100%{transform:translate(70px,440px) rotate(360deg);opacity:0}}',
'.cm-leaf{animation:cm-fall 12s linear infinite}',
'@keyframes cm-spin{to{transform:rotate(360deg)}}',
'.cm-spin{transform-box:fill-box;transform-origin:50% 50%;animation:cm-spin 16s linear infinite}',
'@keyframes cm-pop{0%{transform:translate(0,0) scale(.2);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(var(--s,1)) rotate(120deg);opacity:0}}',
'.cm-sp{animation:cm-pop .9s ease-out forwards}',
'@keyframes cm-boing{0%,100%{transform:scale(1)}30%{transform:scale(1.18,.85)}60%{transform:scale(.92,1.12)}}',
'.cm-boing{transform-box:fill-box;transform-origin:50% 100%;animation:cm-boing .6s}',
'@keyframes cm-bf{0%,100%{transform:translate(0,0)}25%{transform:translate(30px,-26px)}50%{transform:translate(60px,4px)}75%{transform:translate(24px,-14px)}}',
'.cm-bf{animation:cm-bf 7s ease-in-out infinite}',
'@keyframes cm-wig{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}',
'@keyframes cm-in{from{opacity:0;transform:translateY(8px) scale(.96)}}',
'@keyframes cm-fi{from{opacity:0}}',
/* robot */
'.cm-robot{transition-property:transform;transition-timing-function:ease-in-out;pointer-events:none}',
'.cm-bob{animation:cm-idle 2.4s ease-in-out infinite}',
'@keyframes cm-idle{50%{transform:translateY(-2px)}}',
'.cm-walk .cm-bob{animation:cm-wk .38s ease-in-out infinite}',
'@keyframes cm-wk{50%{transform:translateY(-6px)}}',
'.cm-legL,.cm-legR{transform-box:fill-box;transform-origin:50% 0}',
'.cm-armL,.cm-armR{transform-box:fill-box;transform-origin:50% 8%;transition:transform .3s}',
'.cm-walk .cm-legL,.cm-walk .cm-armR{animation:cm-lg .38s ease-in-out infinite}',
'.cm-walk .cm-legR,.cm-walk .cm-armL{animation:cm-lg .38s ease-in-out infinite reverse}',
'@keyframes cm-lg{0%,100%{transform:rotate(18deg)}50%{transform:rotate(-18deg)}}',
'.cm-cheer .cm-bob{animation:cm-jump .5s ease-in-out 3}',
'@keyframes cm-jump{40%{transform:translateY(-22px)}}',
'.cm-cheer .cm-armL{transform:rotate(150deg)}.cm-cheer .cm-armR{transform:rotate(-150deg)}',
'.cm-head{transform-box:fill-box;transform-origin:50% 100%}',
'.cm-huh .cm-head{animation:cm-tilt 1.4s}',
'@keyframes cm-tilt{20%,60%{transform:rotate(-10deg)}40%,80%{transform:rotate(8deg)}}',
'.cm-m2{display:none}.cm-huh .cm-m1{display:none}.cm-huh .cm-m2{display:block}',
'.cm-look .cm-eyes{transform:translateX(3px)}.cm-look .cm-head{transform:rotate(6deg)}',
'.cm-eye{transform-box:fill-box;transform-origin:50% 50%;animation:cm-blink 5s infinite}',
'@keyframes cm-blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}',
'.cm-carry{opacity:0;transition:opacity .3s}.cm-has .cm-carry{opacity:1}',
/* scene bits */
'.cm-mk{opacity:0;pointer-events:none}.cm-mk.on{opacity:1}.cm-mk.on .cm-mki{animation:cm-boing .6s}',
'.cm-win{fill:#2b2c63;transition:fill 1.6s}.cm-lit .cm-win{fill:#ffe27a}',
'.cm-wglow,.cm-bunt,.cm-day{opacity:0;transition:opacity 2s}.cm-lit .cm-wglow,.cm-lit .cm-bunt,.cm-lit .cm-day{opacity:1}',
'.cm-night{transition:opacity 3s}.cm-lit .cm-night{opacity:0}',
'.cm-skyl{opacity:0;transition:opacity 3s}.cm-lit .cm-skyl{opacity:1}',
'.cm-dim{fill:#0b0830;opacity:.38;transition:opacity 3s}.cm-lit .cm-dim{opacity:0}',
'.cm-cld{opacity:.35;transition:opacity 3s}.cm-lit .cm-cld{opacity:1}',
'.cm-h1{fill:#4a3a8a;transition:fill 3s}.cm-lit .cm-h1{fill:#86d1a6}',
'.cm-h2{fill:#3b4a8c;transition:fill 3s}.cm-lit .cm-h2{fill:#5cbb74}',
'.cm-led{opacity:.2}.cm-lit .cm-led{animation:cm-twk 1s infinite}',
'.cm-mc{opacity:0;transform:translateY(-50px);transition:all .8s}.cm-mc.cm-in{opacity:1;transform:none}',
'.cm-cable{stroke-dasharray:220;stroke-dashoffset:220;transition:stroke-dashoffset .9s}.cm-cable.cm-on{stroke-dashoffset:0}',
'.cm-b3{transform-box:fill-box;transform-origin:50% 50%;transition:transform .25s}.cm-b3.cm-press{transform:translateY(5px) scale(.9)}',
'.cm-vl{transform-box:fill-box}.cm-va,.cm-vb{transform-box:fill-box;transform-origin:50% 10%;transition:transform .3s}',
'.cm-party .cm-vl{animation:cm-hop .7s ease-in-out infinite}',
'@keyframes cm-hop{50%{transform:translateY(-12px)}}',
'.cm-party .cm-va{transform:rotate(150deg)}.cm-party .cm-vb{transform:rotate(-150deg)}',
'.cm-lid{transform-box:fill-box;transform-origin:0 100%;transition:transform .6s}',
'.cm-open .cm-lid{transform:rotate(-40deg) translate(-6px,-6px)}',
'.cm-cont{opacity:0;transform:translateY(10px);transition:all .6s .3s}.cm-open .cm-cont{opacity:1;transform:none}',
'.cm-cr{transform-box:fill-box;transform-origin:50% 100%;opacity:0;transform:translateY(40px) scale(.3);transition:all 1.1s cubic-bezier(.2,1.3,.4,1)}',
'.cm-cr.on{opacity:1;transform:none}',
'.cm-shake{animation:cm-shk .5s}',
'@keyframes cm-shk{20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}',
/* UI */
'.cm-chip{position:absolute;top:10px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;max-width:92%;z-index:3}',
'.cm-tag{display:flex;align-items:center;gap:8px;background:#fff7d6;border:3px solid #e1b84a;border-radius:14px;padding:3px 12px 3px 6px;font-weight:800;font-size:calc(16px*var(--u));box-shadow:0 3px 0 #b98d1d;animation:cm-in .5s}',
'.cm-prompt{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:#000b;color:#fff;border-radius:999px;padding:6px 16px;font-weight:800;pointer-events:none;opacity:0;transition:opacity .2s;font-size:calc(16px*var(--u));white-space:nowrap;z-index:3}',
'.cm-prompt.on{opacity:1}',
'.cm-title{position:absolute;top:12px;left:50%;transform:translateX(-50%);text-align:center;pointer-events:none;width:92%;animation:cm-in .8s;z-index:3}',
'.cm-title b{display:block;font-size:calc(28px*var(--u));color:#fff;text-shadow:0 3px 0 #5b3fb5,0 0 18px #7df9ff;line-height:1.1}',
'.cm-title i{font-style:normal;font-size:calc(16px*var(--u));color:#ffe9a8;font-weight:700}',
'.cm-nb{position:absolute;top:8px;right:8px;bottom:8px;width:min(340px,80%);background:linear-gradient(#b07a40,#8a5a2b);border-radius:18px;padding:12px;transform:translateX(115%);transition:transform .35s;display:flex;flex-direction:column;gap:8px;box-shadow:-4px 0 18px #0008;z-index:7}',
'.cm-nb.on{transform:none}',
'.cm-nbh{display:flex;align-items:center;gap:8px;color:#fff;font-weight:800;font-size:calc(20px*var(--u))}',
'.cm-nbh span{flex:1}',
'.cm-page{background:#fff9e8;border-radius:10px;flex:1;overflow:auto;padding:6px 10px}',
'.cm-cl{display:flex;gap:10px;align-items:center;padding:8px 2px;border-bottom:2px dashed #e8d9a8;font-size:calc(17px*var(--u));font-weight:700;color:#3a2a10;animation:cm-in .5s}',
'.cm-cl svg{flex:0 0 auto}',
'.cm-fade{position:absolute;left:0;top:0;width:100%;height:100%;background:#120d33;opacity:0;pointer-events:none;transition:opacity .4s;z-index:6}',
'.cm-fade.on{opacity:1;pointer-events:auto}',
'.cm-ov{position:absolute;left:0;top:0;width:100%;height:100%;background:#0b0830d0;z-index:9;display:flex;align-items:center;justify-content:center;padding:12px;animation:cm-fi .4s;overflow:auto}',
'.cm-box2{background:linear-gradient(#fff,#f1ebff);border-radius:26px;padding:18px 26px;text-align:center;max-width:460px;box-shadow:0 8px 0 #7e6bd0,0 14px 30px #000a;display:flex;flex-direction:column;gap:10px;align-items:center}',
'.cm-box2 h2{margin:0;font-size:calc(30px*var(--u));color:#43308f}',
'.cm-box2 p{margin:0;font-size:calc(19px*var(--u));font-weight:700}',
'.cm-dlg{flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:10px 12px;background:linear-gradient(#2a2060,#1b1646);min-height:calc(90px*var(--u))}',
'.cm-av{flex:0 0 auto;width:calc(64px*var(--u));height:calc(64px*var(--u))}',
'.cm-bub{flex:1;background:#fff;border-radius:20px;padding:8px 16px;font-size:calc(20px*var(--u));line-height:1.3;font-weight:700;position:relative;min-height:calc(56px*var(--u));display:flex;align-items:center;box-shadow:0 3px 0 #cfc5f7;animation:cm-in .35s}',
'.cm-bub:before{content:"";position:absolute;left:-10px;top:50%;margin-top:-10px;border:10px solid transparent;border-right-color:#fff;border-left:0}',
'.cm-btn{border:0;border-radius:18px;font:inherit;font-weight:800;font-size:calc(19px*var(--u));padding:0 18px;min-height:max(48px,calc(54px*var(--u)));cursor:pointer;color:#fff;background:linear-gradient(#52d36d,#2fa84d);box-shadow:0 4px 0 #1f7a36;display:flex;align-items:center;gap:8px;flex:0 0 auto}',
'.cm-btn.alt{background:linear-gradient(#ffd23f,#f5a623);color:#4a2f00;box-shadow:0 4px 0 #b56f00}',
'.cm-btn.lis{background:linear-gradient(#5aa9ff,#3b7be0);box-shadow:0 4px 0 #2a57a8;padding:0 12px}',
'.cm-btn.big{font-size:calc(25px*var(--u));padding:0 28px;animation:cm-wig 1.6s infinite}',
'.cm-btn:active{transform:translateY(3px);box-shadow:none}',
'.cm-seq{position:absolute;left:8px;bottom:8px;width:62%;max-width:500px;background:#fff9e8ee;border:4px solid #e1b84a;border-radius:22px;padding:8px 10px;z-index:4;animation:cm-in .5s;--cw:max(88px,calc(100px*var(--u)))}',
'.cm-sqt{text-align:center;font-weight:800;font-size:calc(16px*var(--u));color:#5a3d0a}',
'.cm-row{display:flex;gap:8px;justify-content:center;align-items:center;margin:4px 0;flex-wrap:wrap}',
'.cm-slot{width:var(--cw);height:var(--cw);border-radius:18px;border:4px dashed #b79a4a;background:#fff3c2;position:relative;display:flex;align-items:center;justify-content:center}',
'.cm-slot b{position:absolute;left:8px;top:2px;font-size:24px;color:#b58a1a}',
'.cm-slot.over{background:#d5f7c7;border-color:#3aa655}',
'.cm-card{width:var(--cw);height:var(--cw);border-radius:18px;background:#fff;border:4px solid #7e6bd0;box-shadow:0 4px 0 #5a47ac;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:calc(13px*var(--u));font-weight:800;text-align:center;touch-action:none;cursor:grab;line-height:1.1;padding:2px;position:relative}',
'.cm-slot .cm-card{position:absolute;left:-4px;top:-4px}',
'.cm-card.drag{z-index:30;cursor:grabbing;box-shadow:0 12px 20px #0007}',
'.cm-card.hint{animation:cm-hint 1s infinite}',
'@keyframes cm-hint{50%{transform:scale(1.1);box-shadow:0 0 0 6px #ffd23f}}',
'@media (prefers-reduced-motion:reduce){.cm-root *{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.001s!important}}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('cm-style')) return;
    var s = document.createElement('style'); s.id = 'cm-style'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ---------- SVG helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function G(id, st) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' + st.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>'; }
  function RG(id, c) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="1"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }
  function sw(x, y, s, inner, d) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><g class="cm-sway" style="animation-delay:' + (d || 0) + 's">' + inner + '</g></g>'; }
  function tree(x, y, s, c1, c2, d) {
    return sw(x, y, s, '<path d="M-9 0L-6 -56H6L9 0Z" fill="#7b4a2b"/><circle cx="0" cy="-84" r="40" fill="' + c1 + '"/><circle cx="-26" cy="-62" r="28" fill="' + c1 + '"/><circle cx="27" cy="-64" r="29" fill="' + c1 + '"/><circle cx="-8" cy="-96" r="22" fill="' + c2 + '" opacity=".6"/><circle cx="20" cy="-70" r="12" fill="' + c2 + '" opacity=".45"/>', d);
  }
  function pine(x, y, s, c1, c2, d) {
    return sw(x, y, s, '<rect x="-6" y="-14" width="12" height="16" fill="#6b4226"/><path d="M0 -70L-44 -12H44Z" fill="' + c1 + '"/><path d="M0 -96L-34 -44H34Z" fill="' + c1 + '"/><path d="M0 -122L-26 -76H26Z" fill="' + c1 + '"/><path d="M0 -122L-26 -76H0Z M0 -96L-34 -44H0Z M0 -70L-44 -12H0Z" fill="' + c2 + '" opacity=".35"/>', d);
  }
  function flower(x, y, s, c, d) {
    var p = '', i, a;
    for (i = 0; i < 5; i++) { a = i * 72 * Math.PI / 180; p += '<circle cx="' + (Math.sin(a) * 6).toFixed(1) + '" cy="' + (-Math.cos(a) * 6 - 22).toFixed(1) + '" r="5" fill="' + c + '"/>'; }
    return sw(x, y, s, '<path d="M0 0Q-3 -12 0 -22" stroke="#3f9a4a" stroke-width="3" fill="none"/><path d="M0 -8q-10 -2 -12 -9q9 0 12 9" fill="#4fb35a"/>' + p + '<circle cx="0" cy="-22" r="4" fill="#ffd23f"/>', d);
  }
  function cloud(x, y, s) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><g class="cm-drift"><ellipse rx="46" ry="16" fill="#fff" opacity=".92"/><circle cx="-18" cy="-12" r="18" fill="#fff" opacity=".92"/><circle cx="12" cy="-18" r="22" fill="#fff" opacity=".92"/></g></g>'; }
  function rock(x, y, s, c) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-30 0Q-36 -22 -12 -28Q10 -36 28 -18Q38 -6 32 0Z" fill="' + c + '"/><path d="M-20 -14Q-8 -26 8 -26Q-6 -20 -10 -10Z" fill="#fff" opacity=".3"/></g>'; }
  function crystal(x, y, s, c1, c2, d) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse class="cm-glw" style="animation-delay:' + (d || 0) + 's" cx="0" cy="-30" rx="34" ry="42" fill="' + c1 + '" opacity=".25"/><path d="M-12 0L-16 -26L0 -62L16 -26L12 0Z" fill="' + c1 + '"/><path d="M0 -62L16 -26L12 0L0 -6Z" fill="' + c2 + '" opacity=".55"/><path d="M-16 -26L0 -62L-4 -26Z" fill="#fff" opacity=".6"/></g>';
  }
  function hot(id, label, x, y, w, h, inner) {
    return '<g class="cm-hot" data-id="' + id + '" data-tip="' + esc(label) + '" tabindex="0" role="button" aria-label="' + esc(label) + '"><g class="cm-art">' + inner + '</g><rect class="cm-ring" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#fff" fill-opacity="0"/></g>';
  }
  function sign(x, y, txt, w) {
    return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-4" y="-6" width="8" height="40" fill="#7b4a2b"/><rect x="' + (-w / 2) + '" y="-34" width="' + w + '" height="30" rx="8" fill="#e0a867" stroke="#8a5a2b" stroke-width="3"/><text x="0" y="-14" text-anchor="middle" font-size="15" font-weight="800" fill="#4a2f12" font-family="Trebuchet MS,sans-serif">' + txt + '</text></g>';
  }
  function foot(x, y, s, rot, c) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')" fill="' + c + '"><ellipse cx="0" cy="10" rx="10" ry="14"/><ellipse cx="0" cy="-8" rx="9" ry="7"/><circle cx="-9" cy="-20" r="3.6"/><circle cx="-3" cy="-24" r="3.6"/><circle cx="4" cy="-24" r="3.6"/><circle cx="10" cy="-19" r="3.4"/></g>'; }
  function paw(x, y, s, rot, c) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')" fill="' + c + '"><path d="M0 22C-16 10 -14 -2 0 -1C14 -2 16 10 0 22Z"/><circle cx="-14" cy="-10" r="6"/><circle cx="-5" cy="-20" r="6"/><circle cx="6" cy="-20" r="6"/><circle cx="15" cy="-10" r="6"/></g>'; }
  var STAR = '0,-16 4.7,-6.5 15.2,-5 7.6,2.3 9.4,12.9 0,8 -9.4,12.9 -7.6,2.3 -15.2,-5 -4.7,-6.5';
  var MOON = 'M6 -14A15 15 0 1 0 6 14A11 11 0 1 1 6 -14Z';
  var LEAF = 'M0 -16C16 -12 16 10 0 16C-16 10 -16 -12 0 -16Z';
  function ffs(list) { return list.map(function (p, i) { return '<circle class="cm-ff" style="animation-delay:' + (i * 0.9) + 's;--dx:' + (i % 2 ? 24 : -24) + 'px" cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#fff59a"/>'; }).join(''); }

  /* notebook / clue icons (40x40) */
  function nbIcon(t, sz) {
    var b = '';
    if (t === 'drop') b = '<path d="M20 4C28 16 33 22 33 28A13 13 0 0 1 7 28C7 22 12 16 20 4Z" fill="#4fb4ff"/><path d="M8 8L32 34" stroke="#e0463c" stroke-width="5" stroke-linecap="round"/>';
    if (t === 'foot') b = foot(20, 22, 0.7, 0, '#7a5632');
    if (t === 'red') b = '<rect x="5" y="12" width="30" height="22" rx="4" fill="#e0524f"/><path d="M5 18Q20 2 35 18Z" fill="#c63e3b"/><path d="M8 8L32 36" stroke="#222" stroke-width="5" stroke-linecap="round"/>';
    if (t === 'star') b = '<rect x="5" y="12" width="30" height="22" rx="4" fill="#4f86f0"/><path d="M5 18Q20 2 35 18Z" fill="#3a6ad0"/><polygon transform="translate(20 25) scale(.5)" points="' + STAR + '" fill="#ffd23f"/>';
    if (t === 'crystal') b = '<path d="M20 3L31 17L27 37H13L9 17Z" fill="#7df9ff"/><path d="M20 3L31 17L27 37H20Z" fill="#35c4e6"/>';
    return '<svg viewBox="0 0 40 40" width="' + sz + '" height="' + sz + '" aria-hidden="true">' + b + '</svg>';
  }
  var CL = {
    water: { t: 'The crystal is not near the water.', i: 'drop' },
    feet: { t: 'Footprints: small, big, small, big, small. They lead to the cave!', i: 'foot' },
    red: { t: 'The crystal is not in the red box.', i: 'red' },
    star: { t: 'The crystal is in a box with a star.', i: 'star' },
    found: { t: 'We found the Power Crystal! Take it home.', i: 'crystal' }
  };
  var DOTSVG = '<svg viewBox="0 0 40 40" width="100%" height="100%"><path d="M20 3L31 17L27 37H13L9 17Z" fill="#7df9ff"/><path d="M20 3L31 17L27 37H20Z" fill="#35c4e6"/></svg>';
  var BOOKSVG = '<svg viewBox="0 0 40 40" width="32" height="32"><rect x="6" y="4" width="26" height="32" rx="4" fill="#a9743c"/><rect x="9" y="4" width="23" height="32" rx="3" fill="#c98f4f"/><path d="M26 4v14l3-3 3 3V4Z" fill="#ff4f6d"/><circle cx="19" cy="22" r="5" fill="#7df9ff"/></svg>';
  var BLEEP = '<svg viewBox="0 0 64 64"><line x1="32" y1="4" x2="32" y2="14" stroke="#aaa" stroke-width="3"/><circle cx="32" cy="6" r="4" fill="#ff7b54"/><rect x="8" y="14" width="48" height="40" rx="16" fill="#ff9f43"/><rect x="8" y="14" width="48" height="14" rx="12" fill="#fff" opacity=".22"/><rect x="14" y="22" width="36" height="24" rx="10" fill="#1b2a4a"/><ellipse cx="25" cy="33" rx="4.5" ry="5.5" fill="#7df9ff"/><ellipse cx="39" cy="33" rx="4.5" ry="5.5" fill="#7df9ff"/><path d="M26 41Q32 46 38 41" stroke="#7df9ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  var LISTEN = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 9v6h4l5 4V5L7 9Z" fill="#fff"/><path d="M15 8Q18 12 15 16M18 5Q23 12 18 19" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  var PIN = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="#ff7b54"/><circle cx="12" cy="9" r="3" fill="#fff"/></svg>';
  var SNDON = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M3 9v6h4l5 4V5L7 9Z" fill="#43308f"/><path d="M15 8Q18 12 15 16M18 5Q23 12 18 19" stroke="#43308f" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  var SNDOFF = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M3 9v6h4l5 4V5L7 9Z" fill="#43308f"/><path d="M15 9l7 7M22 9l-7 7" stroke="#e0463c" stroke-width="2.5" stroke-linecap="round"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" width="28" height="28"><rect x="5" y="4" width="5" height="16" rx="2" fill="#43308f"/><rect x="14" y="4" width="5" height="16" rx="2" fill="#43308f"/></svg>';
  var XSVG = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 5L19 19M19 5L5 19" stroke="#43308f" stroke-width="3.5" stroke-linecap="round"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 12H19M13 6L19 12L13 18" stroke="#b58a1a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* sequencing cards */
  var CARDS = {
    crystal: { t: 'Put the crystal in the machine', why: 'The crystal is what gives the machine power, so it needs to go in first.',
      icon: '<svg viewBox="0 0 64 64" width="50" height="50"><rect x="12" y="38" width="40" height="20" rx="5" fill="#8e7bd8"/><path d="M32 4L43 19L39 34H25L21 19Z" fill="#7df9ff"/><path d="M32 4L43 19L39 34H32Z" fill="#35c4e6"/></svg>' },
    cable: { t: 'Connect the power cable', why: 'The cable needs the crystal to be inside the machine first.',
      icon: '<svg viewBox="0 0 64 64" width="50" height="50"><path d="M6 54C22 54 20 32 34 32S46 20 46 20" stroke="#ff9f43" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="38" y="6" width="20" height="18" rx="5" fill="#555"/><rect x="43" y="0" width="3" height="8" fill="#bbb"/><rect x="50" y="0" width="3" height="8" fill="#bbb"/></svg>' },
    button: { t: 'Press the green button', why: 'The green button starts the machine, so we press it last, when everything is ready.',
      icon: '<svg viewBox="0 0 64 64" width="50" height="50"><circle cx="32" cy="38" r="24" fill="#1d6e33"/><circle cx="32" cy="34" r="19" fill="#2fa84d"/><ellipse cx="25" cy="27" rx="7" ry="4" fill="#fff" opacity=".4"/><path d="M32 2v10M26 8l6 6 6-6" stroke="#ffd23f" stroke-width="4" fill="none" stroke-linecap="round"/></svg>' }
  };
  var ORDER = ['crystal', 'cable', 'button'], TRAY = ['cable', 'button', 'crystal'];
  var LOC = { village: 'Sparkle Village', forest: 'Forest Crossroads', trail: 'Footprint Trail', cave: 'Crystal Cave' };

  /* ---------- robot loading (read only) ---------- */
  function colourOf(v) { return (typeof v === 'string' && /^(#[0-9a-f]{3,8}|rgb|hsl)/i.test(v.trim())) ? v.trim() : null; }
  function pick(o, keys) { for (var i = 0; i < keys.length; i++) { var c = colourOf(o[keys[i]]); if (c) return c; } return null; }
  function loadRobot() {
    var R = { name: 'Spark', body: '#4f86f0', accent: '#ffcf4a', img: null, found: false };
    try {
      var all = vfs.all(); if (!Array.isArray(all)) all = Object.keys(all).map(function (k) { return all[k]; });
      var c = all.filter(function (n) { return n && n.type === 'file' && /robot/i.test((n.kind || '') + ' ' + (n.name || '')); });
      c.sort(function (a, b) { return (b.modified || 0) - (a.modified || 0); });
      var n = c[0], d = n ? n.data : (vfs.getKV('robot', null) || vfs.getKV('robotcreator', null));
      if (typeof d === 'string') {
        if (d.indexOf('data:image') === 0) { R.img = d; R.found = true; if (n) R.name = n.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 14); }
        else { try { d = JSON.parse(d); } catch (e) { d = null; } }
      }
      if (d && typeof d === 'object') {
        R.found = true;
        if (typeof d.name === 'string' && d.name.trim()) R.name = d.name.trim().slice(0, 14);
        R.body = pick(d, ['body', 'bodyColor', 'bodyColour', 'color', 'colour', 'primary']) || R.body;
        R.accent = pick(d, ['accent', 'eyes', 'eyeColor', 'eyeColour', 'secondary', 'trim']) || R.accent;
        if (typeof d.image === 'string' && d.image.indexOf('data:image') === 0) R.img = d.image;
      }
    } catch (e) { /* fallback robot */ }
    return R;
  }
  function robotSVG(R) {
    var b = R.body, a = R.accent, parts;
    var legs = '<g class="cm-legL"><rect x="-17" y="-22" width="11" height="22" rx="5" fill="#7d879f"/><rect x="-20" y="-6" width="18" height="8" rx="4" fill="' + a + '"/></g><g class="cm-legR"><rect x="6" y="-22" width="11" height="22" rx="5" fill="#7d879f"/><rect x="3" y="-6" width="18" height="8" rx="4" fill="' + a + '"/></g>';
    var arms = '<g class="cm-armL"><rect x="-38" y="-62" width="12" height="30" rx="6" fill="' + a + '"/></g><g class="cm-armR"><rect x="26" y="-62" width="12" height="30" rx="6" fill="' + a + '"/></g>';
    if (R.img) {
      parts = legs + arms + '<g class="cm-head"><rect x="-36" y="-110" width="72" height="54" rx="12" fill="#fff" stroke="' + b + '" stroke-width="5"/><image href="' + R.img + '" x="-31" y="-105" width="62" height="44" preserveAspectRatio="xMidYMid slice"/></g><rect x="-20" y="-56" width="40" height="36" rx="12" fill="' + b + '"/><g class="cm-eyes"></g><path class="cm-m1" d="M0 0" fill="none"/><path class="cm-m2" d="M0 0" fill="none"/>';
    } else {
      parts = legs + arms + '<rect x="-27" y="-66" width="54" height="46" rx="16" fill="' + b + '"/><rect x="-27" y="-66" width="54" height="16" rx="14" fill="#fff" opacity=".18"/><rect x="-14" y="-52" width="28" height="20" rx="7" fill="#12203a" opacity=".85"/><circle cx="-6" cy="-42" r="3.5" fill="#ff6b6b"/><circle cx="6" cy="-42" r="3.5" fill="#6bff95"/>' +
        '<g class="cm-head"><line x1="0" y1="-112" x2="0" y2="-98" stroke="#7d879f" stroke-width="4"/><circle class="cm-glw" cx="0" cy="-116" r="6" fill="' + a + '"/><rect x="-27" y="-100" width="54" height="40" rx="15" fill="' + b + '"/><rect x="-27" y="-100" width="54" height="14" rx="12" fill="#fff" opacity=".2"/><rect x="-20" y="-93" width="40" height="26" rx="10" fill="#12203a"/><g class="cm-eyes"><ellipse class="cm-eye" cx="-9" cy="-82" rx="5" ry="6" fill="#7df9ff"/><ellipse class="cm-eye" cx="9" cy="-82" rx="5" ry="6" fill="#7df9ff"/><circle cx="-10.5" cy="-84" r="1.6" fill="#fff"/><circle cx="7.5" cy="-84" r="1.6" fill="#fff"/></g><path class="cm-m1" d="M-8 -73Q0 -66 8 -73" stroke="#7df9ff" stroke-width="3" fill="none" stroke-linecap="round"/><path class="cm-m2" d="M-8 -71Q-4 -75 0 -71T8 -71" stroke="#7df9ff" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
    }
    var nm = esc(R.name), nw = Math.max(50, R.name.length * 8 + 18);
    return '<g class="cm-rb"><ellipse cx="0" cy="2" rx="28" ry="7" fill="#000" opacity=".25"/><g class="cm-bob">' + parts +
      '<g class="cm-carry" transform="translate(0 -134)"><ellipse class="cm-glw" cx="0" cy="-4" rx="22" ry="26" fill="#7df9ff" opacity=".35"/><path d="M0 -26L12 -10L8 6H-8L-12 -10Z" fill="#7df9ff"/><path d="M0 -26L12 -10L8 6H0Z" fill="#35c4e6"/></g></g></g>' +
      '<g transform="translate(0 0)"><rect x="' + (-nw / 2) + '" y="8" width="' + nw + '" height="18" rx="9" fill="#fff" opacity=".9"/><text x="0" y="21" text-anchor="middle" font-size="12" font-weight="800" fill="#43308f" font-family="Trebuchet MS,sans-serif">' + nm + '</text></g>';
  }

  /* ---------- scenes ---------- */
  var SC = {};
  function house(x, y, w, h, body, roof, idx) {
    var l = x - w / 2, t = y - h;
    return '<g><rect x="' + (x + w / 4) + '" y="' + (t - h * 0.55) + '" width="14" height="30" fill="#8a5a2b"/><rect x="' + l + '" y="' + t + '" width="' + w + '" height="' + h + '" rx="4" fill="' + body + '"/><path d="M' + (l - 10) + ' ' + t + 'L' + x + ' ' + (t - h * 0.6) + 'L' + (l + w + 10) + ' ' + t + 'Z" fill="' + roof + '"/><path d="M' + (l - 10) + ' ' + t + 'L' + x + ' ' + (t - h * 0.6) + 'L' + x + ' ' + t + 'Z" fill="#fff" opacity=".12"/>' +
      '<rect x="' + (x - 11) + '" y="' + (y - 36) + '" width="22" height="36" rx="10" fill="#6b3f2a"/>' +
      [-1, 1].map(function (s) { var wx = x + s * (w / 3.2) - 10; return '<circle class="cm-wglow" cx="' + (wx + 10) + '" cy="' + (t + 26) + '" r="34" fill="url(#wg)" style="transition-delay:' + idx * 0.3 + 's"/><rect class="cm-win" x="' + wx + '" y="' + (t + 16) + '" width="20" height="22" rx="4" stroke="#fff" stroke-width="3" style="transition-delay:' + idx * 0.3 + 's"/><path d="M' + (wx + 10) + ' ' + (t + 16) + 'v22M' + wx + ' ' + (t + 27) + 'h20" stroke="#fff" stroke-width="2"/>'; }).join('') + '</g>';
  }
  function lamp(x, y) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-3" y="-70" width="6" height="70" fill="#4a3d7a"/><circle class="cm-wglow" cx="0" cy="-76" r="46" fill="url(#wg)"/><circle cx="0" cy="-76" r="9" fill="#ffe27a"/><path d="M-9 -78Q0 -92 9 -78Z" fill="#4a3d7a"/></g>'; }
  function vill(x, y, body, hair, d) {
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="cm-vl" style="animation-delay:' + d + 's"><rect x="-10" y="-2" width="7" height="8" rx="3" fill="#5b4a8a"/><rect x="3" y="-2" width="7" height="8" rx="3" fill="#5b4a8a"/><ellipse cx="0" cy="-20" rx="16" ry="21" fill="' + body + '"/><rect class="cm-va" x="-25" y="-36" width="8" height="24" rx="4" fill="' + body + '"/><rect class="cm-vb" x="17" y="-36" width="8" height="24" rx="4" fill="' + body + '"/><circle cx="0" cy="-54" r="14" fill="#ffd9b0"/><path d="M-15 -56Q-14 -72 0 -70Q14 -72 15 -56Q8 -64 0 -62Q-8 -64 -15 -56Z" fill="' + hair + '"/><circle cx="-5" cy="-53" r="2" fill="#3a2a2a"/><circle cx="5" cy="-53" r="2" fill="#3a2a2a"/><path d="M-5 -47Q0 -43 5 -47" stroke="#a0522d" stroke-width="2" fill="none"/></g></g>';
  }
  function machine() {
    var cp = 'M0 -30L12 -14L8 2H-8L-12 -14Z';
    return '<g transform="translate(650 345)"><rect x="-84" y="-12" width="168" height="24" rx="8" fill="#6f6a9a"/><rect x="-64" y="-150" width="128" height="140" rx="18" fill="#8e7bd8" stroke="#5b49ad" stroke-width="4"/><rect x="-58" y="-144" width="34" height="128" rx="14" fill="#fff" opacity=".14"/>' +
      '<ellipse cx="0" cy="-168" rx="40" ry="38" fill="#bfe8ff" opacity=".35" stroke="#fff" stroke-width="3"/><path d="M0 -190L14 -172L10 -150H-10L-14 -172Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="5 5"/>' +
      '<g class="cm-mc" id="cm-mcrys"><circle cx="0" cy="-172" r="46" fill="url(#cgl)"/><g transform="translate(0 -142) scale(1.6)"><path d="' + cp + '" fill="#7df9ff"/><path d="M0 -30L12 -14L8 2H0Z" fill="#35c4e6"/><path d="M-12 -14L0 -30L-3 -14Z" fill="#fff" opacity=".7"/></g></g>' +
      '<rect x="-44" y="-118" width="88" height="34" rx="10" fill="#2a2060"/>' + [-28, -14, 0, 14, 28].map(function (px, i) { return '<circle class="cm-led" style="animation-delay:' + i * 0.2 + 's" cx="' + px + '" cy="-101" r="4" fill="' + ['#ff6b6b', '#ffd23f', '#6bff95', '#7df9ff', '#ff7ed8'][i] + '"/>'; }).join('') +
      '<circle cx="-64" cy="-44" r="10" fill="#2a2060"/><path class="cm-cable" id="cm-cable" d="M-64 -44C-110 -44 -96 -2 -140 -4" stroke="#ff9f43" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<circle cx="24" cy="-56" r="24" fill="#1d6e33"/><g class="cm-b3" id="cm-b3"><circle cx="24" cy="-58" r="17" fill="#2fa84d"/><ellipse cx="18" cy="-65" rx="7" ry="4" fill="#fff" opacity=".4"/></g></g>';
  }
  SC.village = function (rb) {
    var i, st = '';
    for (i = 0; i < 26; i++) st += '<circle class="cm-twk" style="animation-delay:' + ((i % 7) * 0.4) + 's" cx="' + ((i * 97) % 800) + '" cy="' + ((i * 53) % 190 + 10) + '" r="' + (1 + (i % 3) * 0.6) + '" fill="#fff"/>';
    var bunt = '<path d="M20 150Q200 230 380 150" stroke="#fff" stroke-width="2" fill="none"/>';
    for (i = 0; i < 10; i++) { var t = i / 9, bx = 20 + 360 * t, by = 150 + 160 * t * (1 - t); bunt += '<path d="M' + (bx - 9) + ' ' + by + 'L' + (bx + 9) + ' ' + by + 'L' + bx + ' ' + (by + 20) + 'Z" fill="' + ['#ff7ed8', '#ffd23f', '#7df9ff', '#6bff95'][i % 4] + '"/>'; }
    var h = '<defs>' + G('vs', [[0, '#241f5e'], [0.55, '#7b57b3'], [1, '#f6a6a0']]) + G('vl', [[0, '#4fb8ff'], [0.65, '#c3ecff'], [1, '#ffeab5']]) + G('vg', [[0, '#5aa84f'], [1, '#2f7a3c']]) + RG('wg', '#ffe27a') + RG('sg', '#fff6b8') + RG('cgl', '#7df9ff') + '</defs>';
    h += '<rect width="800" height="450" fill="url(#vs)"/><rect class="cm-skyl" width="800" height="450" fill="url(#vl)"/>';
    h += '<g class="cm-night">' + st + '<circle cx="110" cy="70" r="26" fill="#fff6d0"/><circle cx="122" cy="62" r="24" fill="#4a3b8c"/></g>';
    h += '<g class="cm-day"><circle cx="690" cy="80" r="110" fill="url(#sg)"/><circle cx="690" cy="80" r="38" fill="#fff6b8"/></g>';
    h += '<g class="cm-cld">' + cloud(250, 80, 1) + cloud(520, 130, 0.8) + '</g>';
    h += '<g class="cm-l1"><path class="cm-h1" d="M-40 270Q90 170 240 240T520 215T860 250V340H-40Z"/></g>';
    h += '<g class="cm-l2"><path class="cm-h2" d="M-40 300Q150 230 330 285T640 270T860 290V350H-40Z"/>' + pine(30, 320, 0.9, '#2f8f58', '#7fe0a0', 0) + pine(770, 322, 1, '#2f8f58', '#7fe0a0', 1) + '</g>';
    h += '<path d="M-10 335Q200 320 400 332T810 328V450H-10Z" fill="url(#vg)"/><path d="M-10 400Q300 372 520 382T810 395V425Q500 412 300 414T-10 436Z" fill="#e8c98a"/>';
    h += house(110, 335, 110, 84, '#f2a7b6', '#8f5fd1', 0) + house(265, 335, 96, 100, '#ffd49a', '#d8575f', 1) + house(430, 338, 100, 78, '#a8dcf5', '#5f7fd1', 2);
    h += lamp(200, 352) + lamp(355, 354) + lamp(530, 356);
    h += '<g class="cm-bunt">' + bunt + '</g><rect class="cm-dim" width="800" height="450"/>';
    h += hot('machine', 'The machine', 566, 130, 170, 230, machine());
    h += hot('vA', 'A villager', 160, 330, 60, 80, vill(190, 400, '#ff8fab', '#6b3f2a', 0)) + hot('vB', 'A villager', 310, 340, 60, 80, vill(340, 408, '#7ec8ff', '#d9a441', 0.2)) + hot('vC', 'A villager', 450, 336, 60, 80, vill(480, 404, '#9be37d', '#3a2a2a', 0.4));
    h += rb;
    h += '<g class="cm-l3">' + flower(40, 440, 1.2, '#ff7eb6', 0.2) + flower(90, 444, 1, '#ffd23f', 0.8) + flower(740, 442, 1.2, '#7df9ff', 0.4) + flower(780, 436, 1, '#ff7eb6', 1) + '</g>';
    h += '<g class="cm-night">' + ffs([[120, 300], [300, 290], [480, 300], [620, 250], [700, 330]]) + '</g><g id="cm-fx"></g>';
    return h;
  };
  SC.forest = function (rb) {
    var i, rays = '';
    for (i = 0; i < 8; i++) rays += '<path d="M-6 -60L0 -112L6 -60Z" fill="#fff6b8" opacity=".5" transform="rotate(' + i * 45 + ')"/>';
    var h = '<defs>' + G('fs', [[0, '#7fd0ff'], [0.6, '#cdf3ff'], [1, '#f7ffd9']]) + G('fg', [[0, '#8bd35a'], [1, '#4a9a3b']]) + G('fr', [[0, '#7fd7ff'], [1, '#2f8fe0']]) + RG('sun', '#fff3a0') + RG('cgf', '#9ffcff') + '</defs>';
    h += '<rect width="800" height="450" fill="url(#fs)"/><circle cx="640" cy="70" r="90" fill="url(#sun)"/><g transform="translate(640 70)"><g class="cm-spin">' + rays + '</g></g><circle cx="640" cy="70" r="34" fill="#fff6b8"/>';
    h += cloud(120, 70, 1.1) + cloud(430, 45, 0.8) + cloud(300, 115, 0.7);
    h += '<g class="cm-l1"><path d="M-40 230Q80 140 220 200T470 190T720 170T860 210V270H-40Z" fill="#9bd8b5"/><path d="M-40 250Q140 190 300 230T600 210T860 240V290H-40Z" fill="#7cc79b"/></g>';
    h += '<g class="cm-l2">' + pine(30, 262, 0.9, '#2f8f58', '#7fe0a0', 0) + pine(95, 258, 0.7, '#3aa066', '#8ff0b0', 1) + tree(205, 262, 0.8, '#58b86a', '#a6ee9a', 0.5) + tree(600, 262, 0.8, '#58b86a', '#a6ee9a', 1.2) + pine(710, 260, 0.8, '#2f8f58', '#7fe0a0', 0.3) + pine(775, 262, 1, '#2f8f58', '#7fe0a0', 1.4) + '</g>';
    h += '<path d="M0 255Q200 240 400 250T800 245V450H0Z" fill="url(#fg)"/>';
    h += '<path d="M400 450C400 400 400 330 400 262" stroke="#c9a15f" stroke-width="64" stroke-linecap="round" fill="none"/><path d="M400 400C330 385 260 365 190 345" stroke="#c9a15f" stroke-width="54" stroke-linecap="round" fill="none"/><path d="M400 400C470 385 540 365 610 350" stroke="#c9a15f" stroke-width="54" stroke-linecap="round" fill="none"/>';
    h += '<path d="M400 450C400 400 400 330 400 262" stroke="#ecd29b" stroke-width="52" stroke-linecap="round" fill="none"/><path d="M400 400C330 385 260 365 190 345" stroke="#ecd29b" stroke-width="42" stroke-linecap="round" fill="none"/><path d="M400 400C470 385 540 365 610 350" stroke="#ecd29b" stroke-width="42" stroke-linecap="round" fill="none"/>';
    /* river */
    var riv = '<path d="M0 258L150 258Q190 330 215 450L0 450Z" fill="url(#fr)" stroke="#bfeaff" stroke-width="5"/><path class="cm-shm" d="M20 295q40 -8 80 0" stroke="#fff" stroke-width="3" fill="none"/><path class="cm-shm" style="animation-delay:-1s" d="M40 350q50 -10 100 0" stroke="#fff" stroke-width="3" fill="none"/><path class="cm-shm" style="animation-delay:-2s" d="M10 410q60 -10 130 0" stroke="#fff" stroke-width="3" fill="none"/><ellipse cx="170" cy="345" rx="14" ry="8" fill="#9aa3b5"/><ellipse cx="150" cy="372" rx="12" ry="7" fill="#aab2c2"/><path d="M214 440q-6 -40 -2 -60M226 440q0 -30 6 -50" stroke="#3f9a4a" stroke-width="4" fill="none"/>' + sign(150, 425, 'River Path', 104);
    h += hot('river', 'River Path', 0, 258, 230, 192, riv);
    /* cave */
    var cave = '<path d="M290 264Q298 138 400 128Q502 138 510 264Z" fill="#8b8aa8"/><path d="M300 250Q310 160 400 148Q330 170 320 250Z" fill="#b5b4d0" opacity=".6"/><circle cx="318" cy="190" r="14" fill="#5cbb74"/><circle cx="486" cy="200" r="16" fill="#5cbb74"/><path d="M356 264Q354 190 400 184Q446 190 444 264Z" fill="#1a1040"/><ellipse class="cm-glw" cx="400" cy="240" rx="34" ry="30" fill="url(#cgf)"/><path d="M394 262L402 240L410 262Z" fill="#7df9ff"/>' + sign(330, 345, 'Dark Cave', 94);
    h += hot('cave', 'Dark Cave', 290, 128, 220, 200, cave);
    /* garden */
    var gd = '<g fill="#fff"><rect x="560" y="272" width="14" height="40" rx="3"/><rect x="590" y="272" width="14" height="40" rx="3"/><rect x="620" y="272" width="14" height="40" rx="3"/><rect x="650" y="272" width="14" height="40" rx="3"/><rect x="680" y="272" width="14" height="40" rx="3"/><rect x="710" y="272" width="14" height="40" rx="3"/><rect x="740" y="272" width="14" height="40" rx="3"/></g><rect x="556" y="284" width="206" height="8" fill="#e8e8f5"/><rect x="556" y="300" width="206" height="8" fill="#e8e8f5"/><ellipse cx="660" cy="345" rx="110" ry="26" fill="#8a5a3b"/>' +
      flower(590, 346, 1.3, '#ff7eb6', 0) + flower(625, 352, 1.5, '#ffd23f', 0.4) + flower(660, 348, 1.3, '#ff6b6b', 0.8) + flower(695, 354, 1.5, '#b68cff', 0.2) + flower(730, 348, 1.3, '#ff9f43', 0.6) + flower(610, 330, 1, '#7df9ff', 1) + flower(715, 332, 1, '#ff7eb6', 0.3) +
      '<g transform="translate(650 300)"><g class="cm-bf"><path d="M0 0Q-10 -12 -14 -2Q-10 8 0 0Q10 -12 14 -2Q10 8 0 0Z" fill="#ff7ed8"/></g></g><g transform="translate(600 290)"><g class="cm-bf" style="animation-delay:-3s"><path d="M0 0Q-10 -12 -14 -2Q-10 8 0 0Q10 -12 14 -2Q10 8 0 0Z" fill="#7df9ff"/></g></g>' + sign(660, 436, 'Flower Garden', 128);
    h += hot('garden', 'Flower Garden', 550, 268, 230, 180, gd);
    /* fun things */
    h += hot('mush', 'A bouncy mushroom', 262, 392, 70, 56, '<g id="cm-mush" transform="translate(296 440)"><rect x="-6" y="-22" width="12" height="22" rx="5" fill="#fff3da"/><path d="M-24 -20Q-22 -44 0 -44Q22 -44 24 -20Z" fill="#ff5a5a"/><circle cx="-9" cy="-30" r="4" fill="#fff"/><circle cx="8" cy="-34" r="3.5" fill="#fff"/><circle cx="13" cy="-24" r="3" fill="#fff"/></g>');
    h += hot('squirrel', 'A squirrel', 484, 296, 78, 62, '<g transform="translate(520 350)"><ellipse cx="0" cy="-4" rx="26" ry="9" fill="#9a6a3a"/><rect x="-22" y="-4" width="44" height="14" rx="4" fill="#7b4a2b"/><g id="cm-sq"><path d="M10 -8Q40 -30 24 -56Q4 -44 6 -20Z" fill="#c9792c"/><ellipse cx="-4" cy="-18" rx="11" ry="13" fill="#d98a3a"/><circle cx="-8" cy="-34" r="9" fill="#d98a3a"/><circle cx="-12" cy="-36" r="1.8" fill="#222"/><circle cx="-14" cy="-44" r="3" fill="#d98a3a"/></g></g>');
    h += hot('pebble', 'A shiny pebble', 28, 392, 70, 52, '<g transform="translate(62 440)">' + rock(0, 0, 1, '#9aa3b5') + '<path d="M-4 -16l4 -8l4 8l-4 4Z" fill="#fff" opacity=".9"/></g>');
    /* crossed-out markers */
    h += '<g class="cm-mk" id="mk-river" transform="translate(118 330)"><g class="cm-mki"><circle r="30" fill="#fff" stroke="#e0463c" stroke-width="5"/><path d="M0 -16C8 -4 12 2 12 8A12 12 0 0 1 -12 8C-12 2 -8 -4 0 -16Z" fill="#4fb4ff"/><path d="M-22 -22L22 22" stroke="#e0463c" stroke-width="6" stroke-linecap="round"/></g></g>';
    h += '<g class="cm-mk" id="mk-garden" transform="translate(655 395)"><g class="cm-mki"><circle r="26" fill="#fff" stroke="#e0463c" stroke-width="5"/><path d="M-14 -14L14 14M14 -14L-14 14" stroke="#e0463c" stroke-width="7" stroke-linecap="round"/></g></g>';
    h += rb;
    h += '<g class="cm-l3"><path d="M-10 450L0 420L10 450Z M18 450L30 412L42 450Z M770 450L782 414L794 450Z" fill="#3a8a3a"/>' + flower(70, 448, 1.2, '#ffd23f', 0.5) + flower(745, 446, 1.2, '#ff7eb6', 0.2) + '</g>';
    for (i = 0; i < 4; i++) h += '<g transform="translate(' + (120 + i * 190) + ' 0)"><path class="cm-leaf" style="animation-delay:' + (i * 3) + 's" d="M0 0Q8 -6 14 0Q8 6 0 0Z" fill="#ff9f43"/></g>';
    h += ffs([[220, 280], [520, 250], [700, 300]]) + '<g id="cm-fx"></g>';
    return h;
  };
  SC.trail = function (rb) {
    var xs = [190, 320, 450, 580], ys = [292, 300, 296, 282], i;
    var h = '<defs>' + G('ts', [[0, '#27604f'], [1, '#6bbf86']]) + G('tg', [[0, '#5f8a3c'], [1, '#3d6b2f']]) + RG('cs', '#ffd23f') + '</defs>';
    h += '<rect width="800" height="450" fill="url(#ts)"/>';
    h += '<g class="cm-l1">' + [20, 110, 200, 300, 420, 520, 620, 720].map(function (x, k) { return pine(x, 250, 1.1, '#1f5a45', '#2f7a5c', k * 0.4); }).join('') + '</g>';
    h += '<g class="cm-glw" style="animation-duration:6s"><path d="M120 0L190 0L330 300L200 300Z" fill="#fff" opacity=".12"/><path d="M420 0L470 0L560 300L470 300Z" fill="#fff" opacity=".1"/></g>';
    h += '<g class="cm-l2">' + tree(90, 270, 1.3, '#2f8f58', '#7fe0a0', 0) + tree(700, 268, 1.4, '#2f8f58', '#7fe0a0', 1) + '</g>';
    h += '<path d="M0 235Q200 220 400 232T800 226V450H0Z" fill="url(#tg)"/>';
    var tp = 'M-30 285C60 280 120 295 190 292S260 300 320 300S390 296 450 296S520 284 580 282S650 272 710 270S780 262 840 262';
    h += '<path d="' + tp + '" stroke="#7d5b36" stroke-width="84" fill="none" stroke-linecap="round"/><path d="' + tp + '" stroke="#a98456" stroke-width="72" fill="none" stroke-linecap="round"/>';
    for (i = 0; i < 4; i++) h += '<g id="fp' + i + '" class="cm-fp">' + foot(xs[i], ys[i], i % 2 ? 1.4 : 0.8, 90, '#5a3b22') + '</g>';
    h += '<g id="cm-slotg" transform="translate(0 0)"><ellipse class="cm-glw" cx="710" cy="270" rx="52" ry="44" fill="url(#cs)"/><ellipse cx="710" cy="270" rx="40" ry="34" fill="none" stroke="#ffd23f" stroke-width="4" stroke-dasharray="8 6"/><text id="cm-q" x="710" y="284" text-anchor="middle" font-size="44" font-weight="900" fill="#fff" stroke="#8a5a00" stroke-width="2" font-family="Trebuchet MS,sans-serif">?</text><g id="cm-stamp"></g></g>';
    function puddle(id, label, x, inner) { return hot(id, label, x - 72, 366, 144, 70, '<ellipse cx="' + x + '" cy="402" rx="64" ry="30" fill="#5a3b22"/><ellipse cx="' + x + '" cy="400" rx="54" ry="23" fill="#85603c"/><ellipse cx="' + (x - 18) + '" cy="392" rx="18" ry="5" fill="#fff" opacity=".25"/>' + inner); }
    h += puddle('cS', 'Small footprint', 250, foot(250, 402, 0.8, 90, '#4a2f18')) + puddle('cL', 'Big footprint', 400, foot(400, 402, 1.4, 90, '#4a2f18')) + puddle('cP', 'Paw print', 550, paw(550, 402, 1.1, 90, '#4a2f18'));
    h += '<g transform="translate(560 330)"><rect x="-50" y="-16" width="100" height="26" rx="12" fill="#7b4a2b"/><ellipse cx="50" cy="-3" rx="8" ry="13" fill="#a8693c"/><ellipse cx="-14" cy="-18" rx="20" ry="7" fill="#5cbb74"/></g>';
    h += rb;
    h += '<g class="cm-l3">' + [0, 60, 700, 750].map(function (x, k) { return '<path d="M' + x + ' 450Q' + (x + 10) + ' 400 ' + (x + 30) + ' 380Q' + (x + 30) + ' 420 ' + (x + 50) + ' 450Z" fill="#2f7a3c"/>'; }).join('') + '<g transform="translate(120 440)"><rect x="-4" y="-18" width="8" height="18" fill="#fff3da"/><path d="M-14 -16Q-12 -34 0 -34Q12 -34 14 -16Z" fill="#7df9ff"/><ellipse class="cm-glw" cy="-22" rx="22" ry="18" fill="#7df9ff" opacity=".3"/></g></g>';
    h += ffs([[150, 200], [330, 180], [500, 210], [650, 190], [760, 230]]) + '<g id="cm-fx"></g>';
    return h;
  };
  function box(id, x, c1, c2, sym, cont) {
    var y = 300;
    return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-54 0L-46 44H46L54 0Z" fill="#4a3d7a"/><rect x="-56" y="-4" width="112" height="12" rx="5" fill="#6a5aa8"/>' +
      '<g id="cm-box-' + id + '"><rect x="-44" y="-54" width="88" height="54" rx="8" fill="' + c1 + '"/><rect x="-44" y="-20" width="88" height="20" rx="8" fill="' + c2 + '" opacity=".5"/><rect x="-30" y="-54" width="10" height="54" fill="#ffd23f" opacity=".85"/><rect x="20" y="-54" width="10" height="54" fill="#ffd23f" opacity=".85"/>' +
      '<rect x="-38" y="-58" width="76" height="10" fill="#fff7a0"/><g class="cm-cont" transform="translate(0 -62)">' + (cont || '') + '</g>' +
      '<g class="cm-lid"><path d="M-48 -54Q-48 -86 0 -86Q48 -86 48 -54Z" fill="' + c1 + '"/><path d="M-48 -54Q-48 -80 -20 -84Q-40 -70 -40 -54Z" fill="#fff" opacity=".3"/><rect x="-30" y="-85" width="10" height="31" fill="#ffd23f" opacity=".85"/><rect x="20" y="-85" width="10" height="31" fill="#ffd23f" opacity=".85"/></g>' +
      '<circle cx="0" cy="-52" r="7" fill="#ffd23f" stroke="#b58a1a" stroke-width="2"/><g transform="translate(0 -26)">' + sym + '</g></g></g>';
  }
  SC.cave = function (rb) {
    var i, st = '';
    for (i = 0; i < 11; i++) st += '<path d="M' + (i * 80 - 20) + ' 0L' + (i * 80 + 36) + ' 0L' + (i * 80 + 8 + (i % 3) * 6) + ' ' + (50 + (i * 37) % 60) + 'Z" fill="#1d1450"/>';
    var moon = '<path d="' + MOON + '" transform="scale(1.25)" fill="#fff7c8"/>', star = '<polygon points="' + STAR + '" transform="scale(1.35)" fill="#ffd23f" stroke="#b58a1a" stroke-width="1"/>', leaf = '<path d="' + LEAF + '" transform="scale(1.2)" fill="#c9f7a0"/><path d="M0 -14V14" stroke="#2a8a45" stroke-width="2"/>';
    var h = '<defs>' + G('cb', [[0, '#120b30'], [0.6, '#2d2070'], [1, '#3a2a86']]) + RG('cw', '#9a7bff') + RG('cy', '#fff6b8') + '</defs>';
    h += '<rect width="800" height="450" fill="url(#cb)"/><ellipse cx="400" cy="190" rx="340" ry="170" fill="url(#cw)" opacity=".45"/>';
    h += '<g class="cm-l1">' + st + crystal(250, 150, 0.7, '#7df9ff', '#c9fbff', 0) + crystal(560, 140, 0.8, '#ff7ed8', '#ffc2ee', 1) + '</g>';
    h += '<g class="cm-l2">' + crystal(70, 330, 1.9, '#4de1ff', '#a8f4ff', 0) + crystal(135, 345, 1.2, '#ff7ed8', '#ffc2ee', 0.8) + crystal(738, 336, 2, '#b68cff', '#e0d0ff', 0.4) + crystal(685, 348, 1.1, '#4de1ff', '#a8f4ff', 1.2) + '</g>';
    h += '<path d="M-10 335Q200 318 400 330T810 322V450H-10Z" fill="#2b1f66"/><path d="M-10 372Q300 352 810 374V450H-10Z" fill="#35277e"/>';
    h += '<ellipse cx="120" cy="425" rx="90" ry="16" fill="#4de1ff" opacity=".5"/><path class="cm-shm" d="M60 425q30 -6 60 0" stroke="#fff" stroke-width="3" fill="none"/><path class="cm-shm" style="animation-delay:-1.5s" d="M120 428q30 -6 60 0" stroke="#fff" stroke-width="3" fill="none"/>';
    h += hot('red', 'Red box with a moon', 192, 200, 116, 150, box('red', 250, '#e0524f', '#7a1c1a', moon, '<circle r="10" fill="#9aa3b5"/><circle cx="-4" cy="-2" r="1.6" fill="#222"/><circle cx="4" cy="-2" r="1.6" fill="#222"/><path d="M-4 3Q0 6 4 3" stroke="#222" fill="none" stroke-width="1.5"/>'));
    h += hot('blue', 'Blue box with a star', 342, 200, 116, 150, box('blue', 400, '#4f86f0', '#1b3a8a', star, ''));
    h += hot('green', 'Green box with a leaf', 492, 200, 116, 150, box('green', 550, '#4cc26b', '#1a5a2c', leaf, '<rect x="-3" y="-8" width="6" height="12" rx="3" fill="#fff3da"/><path d="M-12 -6Q-10 -22 0 -22Q10 -22 12 -6Z" fill="#ff8fab"/>'));
    h += '<g transform="translate(400 228)"><g class="cm-cr" id="cm-crys"><circle r="110" cy="-30" fill="url(#cy)"/><g class="cm-spin">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (k) { return '<path d="M-7 -30L0 -130L7 -30Z" fill="#fff6b8" opacity=".55" transform="rotate(' + k * 30 + ' 0 -30)"/>'; }).join('') + '</g><g transform="scale(1.7)"><path d="M0 -50L20 -22L14 4H-14L-20 -22Z" fill="#7df9ff"/><path d="M0 -50L20 -22L14 4H0Z" fill="#35c4e6"/><path d="M-20 -22L0 -50L-6 -22Z" fill="#fff" opacity=".8"/></g></g></g>';
    h += rb;
    h += '<g class="cm-l3"><path d="M-10 450L-10 380Q40 390 60 450Z M810 450L810 372Q760 392 740 450Z" fill="#150e38"/></g>';
    h += ffs([[160, 250], [300, 200], [480, 230], [620, 200], [700, 280], [400, 160]]) + '<g id="cm-fx"></g>';
    return h;
  };

  /* ---------- app ---------- */
  LCL.registerApp({
    id: 'crystalmystery',
    title: 'Power Crystal Mystery',
    icon: 'crystalmystery',
    w: 960, h: 640, minW: 560, minH: 440,
    help: 'Help your robot find the missing Power Crystal and save Sparkle Village!',
    mount: function (root, ctx) {
      injectCSS();
      try { if (getComputedStyle(root).position === 'static') root.style.position = 'relative'; } catch (e) {}
      var timers = [], dead = false, pxRaf = 0;
      var noMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      var saved = vfs.getKV(KV, null) || {};
      var R = loadRobot();
      var S = { stage: 0, clues: saved.clues || [], mute: !!saved.mute, lock: true, scene: '', rx: 0, ry: 400, dir: 1, has: false, done: !!saved.done, q: [], cb: null, goLabel: '', goBig: false, cur: '', elim: {}, wrong: {}, seq: [null, null, null], seqOn: false, seqBusy: false, seqWrong: 0, opened: {}, sel: '' };
      var svg, robotEl, flipEl, HOT = {};

      function later(fn, ms) { var t = setTimeout(function () { var i = timers.indexOf(t); if (i > -1) timers.splice(i, 1); if (!dead) fn(); }, ms); timers.push(t); return t; }
      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function snd(n) { if (S.mute) return; try { LCL.sound.play(n); } catch (e) {} }
      function save() { vfs.setKV(KV, { stage: S.stage, clues: S.clues, done: S.done, mute: S.mute }); }

      /* --- DOM --- */
      var wrap = el('div', { class: 'cm-root' });
      var locTxt = el('span', { text: '' });
      var dots = [0, 1, 2, 3].map(function () { return el('div', { class: 'cm-dot', html: DOTSVG }); });
      var bookBtn = el('button', { class: 'cm-ib', 'aria-label': 'Open the clue notebook', html: BOOKSVG, onclick: function () { toggleNB(); } });
      var sndBtn = el('button', { class: 'cm-ib', 'aria-label': 'Sound on or off', html: S.mute ? SNDOFF : SNDON, onclick: function () { S.mute = !S.mute; sndBtn.innerHTML = S.mute ? SNDOFF : SNDON; save(); } });
      var pauseBtn = el('button', { class: 'cm-ib', 'aria-label': 'Pause', html: PAUSE, onclick: function () { pauseMenu(); } });
      var top = el('div', { class: 'cm-top' }, [el('div', { class: 'cm-loc' }, [el('span', { html: PIN, style: 'display:flex' }), locTxt]), el('div', { class: 'cm-dots' }, dots), bookBtn, sndBtn, pauseBtn]);
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 800 450'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.setAttribute('class', 'cm-svg');
      var chip = el('div', { class: 'cm-chip' });
      var promptEl = el('div', { class: 'cm-prompt' });
      var nbList = el('div', { class: 'cm-page' });
      var nb = el('div', { class: 'cm-nb', 'aria-hidden': 'true' }, [el('div', { class: 'cm-nbh' }, [el('span', { html: BOOKSVG, style: 'flex:0 0 auto;display:flex' }), el('span', { text: 'Clue Notebook' }), el('button', { class: 'cm-ib', 'aria-label': 'Close notebook', html: XSVG, onclick: function () { toggleNB(false); } })]), nbList]);
      var fade = el('div', { class: 'cm-fade on' });
      var titleEl = null;
      var stage = el('div', { class: 'cm-stage' }, [svg, chip, promptEl, nb, fade]);
      var bubble = el('div', { class: 'cm-bub' });
      var listenBtn = el('button', { class: 'cm-btn lis', 'aria-label': 'Listen', html: LISTEN, onclick: function () { try { LCL.bleep.speak(S.cur); } catch (e) {} } });
      var goBtn = el('button', { class: 'cm-btn', style: 'display:none' });
      var dlg = el('div', { class: 'cm-dlg' }, [el('div', { class: 'cm-av', html: BLEEP }), bubble, listenBtn, goBtn]);
      wrap.appendChild(top); wrap.appendChild(stage); wrap.appendChild(dlg); root.appendChild(wrap);

      function resize() { var w = wrap.clientWidth || 760; wrap.style.setProperty('--u', Math.max(0.8, Math.min(1.35, w / 760)).toFixed(2)); }
      resize();

      /* --- dialogue --- */
      function setText(t) { S.cur = t; bubble.textContent = t; bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = ''; }
      function hideGo() { goBtn.style.display = 'none'; goBtn.onclick = null; }
      function setGo(label, fn, cls) { goBtn.textContent = label; goBtn.className = 'cm-btn' + (cls ? ' ' + cls : ''); goBtn.style.display = 'flex'; goBtn.onclick = fn; }
      function say(lines, cb, o) {
        o = o || {}; S.q = (typeof lines === 'string' ? [lines] : lines).slice(); S.cb = cb || null; S.goLabel = o.label || ''; S.goBig = !!o.big; S.lock = true; showLine();
      }
      function showLine() {
        var t = S.q.shift(), last = !S.q.length; setText(t);
        if (last && !S.cb) { hideGo(); S.lock = false; return; }
        S.lock = true;
        setGo(last && S.goLabel ? S.goLabel : 'Next', function () {
          snd('pop');
          if (S.q.length) showLine(); else { var cb = S.cb; S.cb = null; hideGo(); if (cb) cb(); }
        }, last && S.goBig ? 'big' : '');
      }
      function quip(t) { setText(t); }

      /* --- clues / notebook --- */
      function renderNB() {
        nbList.innerHTML = '';
        if (!S.clues.length) { nbList.appendChild(el('div', { class: 'cm-cl', text: 'No clues yet. Look around!' })); return; }
        S.clues.forEach(function (k) { if (CL[k]) nbList.appendChild(el('div', { class: 'cm-cl' }, [el('span', { html: nbIcon(CL[k].i, 44) }), el('span', { text: CL[k].t })])); });
      }
      function toggleNB(on) {
        var open = on === undefined ? !nb.classList.contains('on') : on;
        nb.classList.toggle('on', open); nb.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (open) { var d = bookBtn.querySelector('.cm-newdot'); if (d) bookBtn.removeChild(d); renderNB(); }
      }
      function addClue(k) {
        if (S.clues.indexOf(k) > -1) return;
        S.clues.push(k); save(); renderNB(); snd('pop');
        if (!nb.classList.contains('on')) { if (!bookBtn.querySelector('.cm-newdot')) bookBtn.appendChild(el('span', { class: 'cm-newdot' })); bookBtn.classList.remove('wig'); void bookBtn.offsetWidth; bookBtn.classList.add('wig'); }
      }
      function showChip(keys) { chip.innerHTML = ''; keys.forEach(function (k) { chip.appendChild(el('div', { class: 'cm-tag' }, [el('span', { html: nbIcon(CL[k].i, 32), style: 'display:flex' }), el('span', { text: CL[k].t })])); }); }
      function setStage(n) { S.stage = n; dots.forEach(function (d, i) { d.classList.toggle('on', n > i + 1 || (S.done && n >= 4) || n === i + 1); }); save(); }

      /* --- robot & fx --- */
      function sc(y) { return Math.max(0.72, Math.min(1.2, 0.62 + y / 450 * 0.55)); }
      function tf(x, y) { return 'translate(' + x + 'px,' + y + 'px) scale(' + sc(y).toFixed(3) + ')'; }
      function robotMarkup() { return '<g id="cm-robot" class="cm-robot" style="transform:' + tf(S.rx, S.ry) + '"><g id="cm-flip">' + robotSVG(R) + '</g></g>'; }
      function placeRobot(x, y, dir) {
        S.rx = x; S.ry = y; S.dir = dir || 1;
        robotEl = svg.querySelector('#cm-robot'); flipEl = svg.querySelector('#cm-flip');
        robotEl.style.transitionDuration = '0s'; robotEl.style.transform = tf(x, y);
        flipEl.setAttribute('transform', 'scale(' + S.dir + ' 1)');
        if (S.has) robotEl.classList.add('cm-has');
        void robotEl.getBoundingClientRect();
      }
      function face(x) { S.dir = x >= S.rx ? 1 : -1; flipEl.setAttribute('transform', 'scale(' + S.dir + ' 1)'); }
      function walkTo(x, y, cb) {
        var dx = x - S.rx, dy = y - S.ry, d = Math.sqrt(dx * dx + dy * dy), dur = noMotion ? 30 : Math.max(350, d * 4.2);
        if (Math.abs(dx) > 6) { S.dir = dx > 0 ? 1 : -1; flipEl.setAttribute('transform', 'scale(' + S.dir + ' 1)'); }
        robotEl.classList.add('cm-walk'); robotEl.style.transitionDuration = dur + 'ms';
        S.rx = x; S.ry = y; robotEl.style.transform = tf(x, y);
        later(function () { robotEl.classList.remove('cm-walk'); if (cb) cb(); }, dur + 40);
      }
      function emote(c, ms) { if (!robotEl) return; robotEl.classList.add(c); later(function () { robotEl.classList.remove(c); }, ms || 1400); }
      function burst(x, y, n, cols) {
        var fx = svg.querySelector('#cm-fx'); if (!fx) return;
        var g = document.createElementNS(NS, 'g'), i;
        for (i = 0; i < n; i++) {
          var a = Math.random() * 6.283, d = 30 + Math.random() * 70, gg = document.createElementNS(NS, 'g'), p = document.createElementNS(NS, 'path');
          gg.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
          p.setAttribute('d', 'M0 -9L2.5 -2.5L9 0L2.5 2.5L0 9L-2.5 2.5L-9 0L-2.5 -2.5Z'); p.setAttribute('fill', cols[i % cols.length]); p.setAttribute('class', 'cm-sp');
          p.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px'); p.style.setProperty('--dy', (Math.sin(a) * d - 20).toFixed(0) + 'px'); p.style.setProperty('--s', (0.7 + Math.random() * 1.2).toFixed(2));
          gg.appendChild(p); g.appendChild(gg);
        }
        fx.appendChild(g); later(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 1100);
      }
      var GOLD = ['#ffd23f', '#fff6b8', '#7df9ff', '#ff7ed8'];
      function boing(sel) { var e = svg.querySelector(sel); if (!e) return; e.classList.remove('cm-boing'); void e.getBoundingClientRect(); e.classList.add('cm-boing'); }
      function pulse(id, on) { var h = svg.querySelector('.cm-hot[data-id="' + id + '"]'); if (h) h.classList.toggle('cm-pulse', on !== false); }

      /* --- scene switching --- */
      function goScene(name, rx, ry, dir, cb) {
        S.lock = true; hideGo(); fade.className = 'cm-fade on';
        later(function () {
          clearTimers(); S.scene = name; S.rx = rx; S.ry = ry;
          svg.innerHTML = SC[name](robotMarkup());
          svg.setAttribute('class', 'cm-svg'); placeRobot(rx, ry, dir);
          locTxt.textContent = LOC[name]; promptEl.classList.remove('on');
          later(function () { fade.className = 'cm-fade'; later(function () { if (cb) cb(); }, 450); }, 60);
        }, noMotion ? 30 : 420);
      }

      /* --- interaction wiring --- */
      function hotFrom(t) { while (t && t !== svg) { if (t.classList && t.classList.contains('cm-hot')) return t; t = t.parentNode; } return null; }
      function activate(h) { if (S.lock || S.ov) return; var fn = HOT[S.scene + '.' + h.getAttribute('data-id')]; if (fn) { promptEl.classList.remove('on'); fn(h); } }
      svg.addEventListener('click', function (e) { var h = hotFrom(e.target); if (h) activate(h); });
      svg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var h = hotFrom(e.target); if (h) { e.preventDefault(); activate(h); } } });
      function tip(e) { var h = hotFrom(e.target); if (h && !S.lock && !S.ov) { promptEl.textContent = 'Tap to look: ' + h.getAttribute('data-tip'); promptEl.classList.add('on'); } else promptEl.classList.remove('on'); }
      svg.addEventListener('pointerover', tip); svg.addEventListener('focusin', tip);
      svg.addEventListener('pointerleave', function () { promptEl.classList.remove('on'); }); svg.addEventListener('focusout', function () { promptEl.classList.remove('on'); });
      stage.addEventListener('pointermove', function (e) {
        if (noMotion || pxRaf) return; var r = stage.getBoundingClientRect(), v = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pxRaf = requestAnimationFrame(function () { pxRaf = 0; stage.style.setProperty('--px', v.toFixed(2)); });
      });

      /* --- overlays --- */
      function overlay(title, sub, btns, extra) {
        var kids = [];
        if (extra) kids.push(el('div', { html: extra }));
        kids.push(el('h2', { text: title })); if (sub) kids.push(el('p', { text: sub }));
        var ov = el('div', { class: 'cm-ov' }), first = null;
        btns.forEach(function (b, i) { var bt = el('button', { class: 'cm-btn ' + (b.cls || ''), text: b.label, onclick: function () { if (ov.parentNode) ov.parentNode.removeChild(ov); S.ov = null; if (b.fn) b.fn(); } }); if (!i) first = bt; kids.push(bt); });
        ov.appendChild(el('div', { class: 'cm-box2' }, kids)); stage.appendChild(ov); S.ov = ov; if (first) first.focus();
      }
      function pauseMenu() {
        if (S.ov) return;
        overlay('Paused', 'Your adventure is saved.', [{ label: 'Keep playing' }, { label: 'Start again', cls: 'alt', fn: restart }, { label: 'Leave the game', cls: 'lis', fn: function () { ctx.close(); } }]);
      }
      function restart() { S.clues = []; S.stage = 0; S.done = false; S.has = false; S.elim = {}; S.wrong = {}; S.opened = {}; S.seq = [null, null, null]; S.seqWrong = 0; S.seqOn = false; removeSeq(); showChip([]); renderNB(); save(); intro(); }

      /* ================= STORY ================= */
      function intro() {
        setStage(0); showChip([]); S.has = false; removeSeq();
        goScene('village', 330, 400, 1, function () {
          titleEl = el('div', { class: 'cm-title' }, [el('b', { text: 'The Mystery of the Missing Power Crystal' }), el('i', { text: 'A Little Computer Lab adventure' })]); stage.appendChild(titleEl);
          emote('cm-cheer', 1600);
          var L = ['Oh no! Something has happened in Sparkle Village!', 'The Power Crystal has disappeared. Without it, the village lights won\'t work!', 'Your robot, ' + R.name + ', looks like just the right explorer to help us.', 'Shall we investigate?'];
          if (!R.found) L.splice(2, 0, 'I could not find your robot, so my friend ' + R.name + ' will help today. You can make your own robot in the robot maker!');
          say(L, function () { if (titleEl && titleEl.parentNode) titleEl.parentNode.removeChild(titleEl); stage1(); }, { label: 'Start Adventure', big: true });
        });
      }
      HOT['village.vA'] = function () { face(190); quip('Hello! Please help us find our Power Crystal!'); boing('#cm-robot'); snd('pop'); };
      HOT['village.vB'] = function () { face(340); quip('It is so dark without our lights. Can you help?'); snd('pop'); };
      HOT['village.vC'] = function () { face(480); quip(S.has ? 'You found it! Hooray!' : 'We will cheer very loudly when the crystal comes home!'); snd('pop'); };
      HOT['village.machine'] = function () { face(650); quip(S.stage === 4 ? 'The machine is waiting for the crystal. Let us put the jobs in order!' : 'This machine makes all the village lights glow. It needs the crystal!'); snd('pop'); };

      /* Stage 1 */
      function stage1() {
        setStage(1); S.elim = {}; showChip([]);
        goScene('forest', -70, 410, 1, function () {
          walkTo(400, 405, function () {
            say('The crystal is hidden somewhere nearby. I found a clue!', function () {
              addClue('water'); showChip(['water']);
              say('Look at the clue at the top. Tap each path to explore it!');
            });
          });
        });
      }
      function mark(id) { var m = svg.querySelector('#mk-' + id); if (m) m.classList.add('on'); }
      function afterElim() { if (S.elim.river && S.elim.garden) { pulse('cave'); } }
      HOT['forest.river'] = function () {
        S.lock = true; walkTo(215, 380, function () {
          emote('cm-look', 1500);
          if (!S.elim.river) { S.elim.river = true; mark('river'); snd('oops'); say('Splash! The ground is wet and soggy. The clue says not near the water, so we can cross out the river!'); }
          else say('Still wet! We already crossed this path out.');
          afterElim();
        });
      };
      HOT['forest.garden'] = function () {
        S.lock = true; walkTo(600, 400, function () {
          emote('cm-look', 1500);
          if (!S.elim.garden) { S.elim.garden = true; mark('garden'); snd('pop'); say('So many pretty flowers! But I cannot see anything sparkly. Let us cross this path out too.'); }
          else say('Lovely flowers, but no crystal here.');
          afterElim();
        });
      };
      HOT['forest.cave'] = function () {
        S.lock = true; pulse('cave', false);
        walkTo(400, 275, function () {
          emote('cm-look', 1200); snd('good');
          say(['Wow! I can see a faint glow deep inside the cave!', 'Look! There are footprints on the ground. Let us follow them!'], function () { LCL.emit('crystalmystery:paths'); stage2(); });
        });
      };
      HOT['forest.mush'] = function () { boing('#cm-mush'); quip('Boing! The mushroom is bouncy!'); snd('pop'); burst(296, 400, 6, GOLD); };
      HOT['forest.squirrel'] = function () { boing('#cm-sq'); quip('The squirrel wiggles its tail and scampers round the stump!'); snd('pop'); };
      HOT['forest.pebble'] = function () { quip('Just a shiny pebble. Not the Power Crystal!'); snd('pop'); burst(62, 420, 6, GOLD); };

      /* Stage 2 */
      function stage2() {
        setStage(2); showChip([]); S.wrong.print = 0;
        goScene('trail', -70, 350, 1, function () {
          walkTo(70, 350, function () {
            say(['Footprints! Someone walked this way. Let us look closely.'], function () {
              var words = ['Small…', 'Big…', 'Small…', 'Big…'], i = 0;
              (function step() {
                if (i >= 4) { say('What comes next? Tap the footprint in the mud that fits the pattern!'); return; }
                boing('#fp' + i); quip(words[i]); snd('pop'); i++; later(step, noMotion ? 200 : 900);
              })();
            });
          });
        });
      }
      function stamp(k) {
        var s = svg.querySelector('#cm-stamp'), q = svg.querySelector('#cm-q'); if (q) q.style.opacity = 0;
        s.innerHTML = k === 'S' ? foot(710, 270, 0.8, 90, '#5a3b22') : k === 'L' ? foot(710, 270, 1.4, 90, '#5a3b22') : paw(710, 270, 1.1, 90, '#5a3b22');
        s.setAttribute('class', 'cm-boing');
      }
      function pickPrint(k) {
        S.lock = true; stamp(k);
        if (k === 'S') {
          snd('good'); burst(710, 250, 12, GOLD); emote('cm-cheer', 1500); addClue('feet');
          say(['Yes! Small, big, small, big, small. You spotted the pattern!', 'The trail goes towards the cave. Let us follow it!'], function () {
            LCL.emit('crystalmystery:pattern'); walkTo(860, 300, function () { stage3(); });
          });
        } else {
          snd('oops'); emote('cm-huh', 1500); S.wrong.print = (S.wrong.print || 0) + 1;
          var msg = k === 'L' ? 'Hmm, two big ones in a row? Look again: small, big, small, big… what comes after big?' : 'That is a paw print, not a footprint like the others. Look again!';
          quip(msg);
          later(function () {
            var s = svg.querySelector('#cm-stamp'), q = svg.querySelector('#cm-q'); if (s) s.innerHTML = ''; if (q) q.style.opacity = 1;
            if (S.wrong.print >= 2) { pulse('cS'); [0, 1, 2, 3].forEach(function (n) { later(function () { boing('#fp' + n); }, n * 350); }); quip('Try again! The shining footprint might help.'); }
            S.lock = false;
          }, noMotion ? 300 : 1700);
        }
      }
      HOT['trail.cS'] = function () { pickPrint('S'); };
      HOT['trail.cL'] = function () { pickPrint('L'); };
      HOT['trail.cP'] = function () { pickPrint('P'); };

      /* Stage 3 */
      function stage3() {
        setStage(3); showChip([]); S.opened = {}; S.wrong.box = 0; S.sel = '';
        goScene('cave', -70, 398, 1, function () {
          walkTo(110, 400, function () {
            emote('cm-cheer', 1200); snd('good');
            say(['Wow! A crystal cave!', 'Three mystery boxes! And I found two clues.'], function () {
              addClue('red'); addClue('star'); showChip(['red', 'star']);
              say('Use both clues to find the right box. Tap a box to look at it first.');
            });
          });
        });
      }
      var BOXTXT = { red: 'A red box with a moon on it.', blue: 'A blue box with a star on it.', green: 'A green box with a leaf on it.' }, BOXX = { red: 250, blue: 400, green: 550 };
      function inspect(id) {
        if (S.opened[id]) { quip('We already opened this one!'); return; }
        S.lock = true; S.sel = id; hideGo();
        walkTo(BOXX[id], 400, function () {
          emote('cm-look', 1500); boing('#cm-box-' + id); quip(BOXTXT[id]); snd('pop');
          setGo('Open the box', function () { openBox(id); }, 'alt'); S.lock = false;
        });
      }
      HOT['cave.red'] = function () { inspect('red'); };
      HOT['cave.blue'] = function () { inspect('blue'); };
      HOT['cave.green'] = function () { inspect('green'); };
      function openBox(id) {
        S.lock = true; hideGo(); S.opened[id] = true; var b = svg.querySelector('#cm-box-' + id); b.classList.add('cm-open'); snd('pop');
        later(function () {
          if (id === 'blue') {
            var c = svg.querySelector('#cm-crys'); c.classList.add('on'); burst(400, 200, 18, GOLD); snd('tada'); emote('cm-cheer', 1800); pulse('blue', false);
            try { LCL.fx.confetti(); } catch (e) {}
            addClue('found');
            say(['The Power Crystal! You found it!', 'It is so bright and sparkly!', 'Let us take it back to Sparkle Village.'], function () {
              LCL.emit('crystalmystery:box'); S.has = true; robotEl.classList.add('cm-has'); c.classList.remove('on'); showChip(['found']); stage4();
            });
          } else {
            S.wrong.box = (S.wrong.box || 0) + 1; emote('cm-huh', 1500); snd('oops');
            var m = id === 'red' ? 'Just a little pebble! The first clue says the crystal is not in the red box.' : 'A little mushroom! But the crystal is in a box with a star, and this one has a leaf.';
            if (S.wrong.box >= 2) { pulse('blue'); m += ' Look for the star!'; }
            say(m);
          }
        }, noMotion ? 100 : 750);
      }

      /* Stage 4 */
      var seqEl, slotsRow, trayRow, slotEls = [];
      function removeSeq() { if (seqEl && seqEl.parentNode) seqEl.parentNode.removeChild(seqEl); seqEl = null; S.seqOn = false; }
      function stage4() {
        setStage(4); S.seq = [null, null, null]; S.seqWrong = 0; removeSeq();
        goScene('village', -70, 398, 1, function () {
          walkTo(300, 402, function () {
            say(['We are home! The machine needs three jobs, done in the right order.', 'Drag each picture into a box: 1, then 2, then 3. You can tap them too!'], function () { buildSeq(); S.lock = false; });
          });
        });
      }
      function buildSeq() {
        slotsRow = el('div', { class: 'cm-row' }); trayRow = el('div', { class: 'cm-row' });
        seqEl = el('div', { class: 'cm-seq' }, [el('div', { class: 'cm-sqt', text: 'Put the jobs in order!' }), slotsRow, el('div', { class: 'cm-sqt', text: 'Drag the pictures up, or tap them.' }), trayRow]);
        stage.appendChild(seqEl); S.seqOn = true; S.seqBusy = false; renderSeq();
      }
      function renderSeq() {
        slotsRow.innerHTML = ''; trayRow.innerHTML = ''; slotEls = [];
        for (var i = 0; i < 3; i++) {
          var s = el('div', { class: 'cm-slot' }, [el('b', { text: String(i + 1) })]); if (S.seq[i]) s.appendChild(mkCard(S.seq[i]));
          slotEls.push(s); slotsRow.appendChild(s); if (i < 2) slotsRow.appendChild(el('span', { html: ARROW, style: 'display:flex' }));
        }
        TRAY.forEach(function (k) { if (S.seq.indexOf(k) < 0) trayRow.appendChild(mkCard(k)); });
      }
      function slotAt(x, y) { for (var i = 0; i < slotEls.length; i++) { var r = slotEls[i].getBoundingClientRect(); if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) return i; } return -1; }
      function hilite(x, y) { var n = slotAt(x, y); slotEls.forEach(function (s, i) { s.classList.toggle('over', i === n); }); }
      function placeAt(k, i) { var o = S.seq.indexOf(k); if (o > -1) S.seq[o] = null; S.seq[i] = k; snd('pop'); renderSeq(); afterPlace(); }
      function unplace(k) { var o = S.seq.indexOf(k); if (o > -1) S.seq[o] = null; renderSeq(); }
      function tapCard(k) { if (S.seq.indexOf(k) > -1) { unplace(k); return; } var e = S.seq.indexOf(null); if (e > -1) placeAt(k, e); }
      function mkCard(k) {
        var c = el('div', { class: 'cm-card', tabindex: '0', role: 'button', 'aria-label': CARDS[k].t, html: CARDS[k].icon + '<span>' + CARDS[k].t + '</span>' });
        c.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !S.seqBusy) { e.preventDefault(); tapCard(k); } });
        c.addEventListener('pointerdown', function (e) {
          if (S.seqBusy || !S.seqOn) return; e.preventDefault();
          var sx = e.clientX, sy = e.clientY, moved = false; try { c.setPointerCapture(e.pointerId); } catch (x) {} c.classList.add('drag');
          function mv(ev) { var dx = ev.clientX - sx, dy = ev.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 8) moved = true; c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; hilite(ev.clientX, ev.clientY); }
          function up(ev) {
            c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up);
            try { c.releasePointerCapture(ev.pointerId); } catch (x) {} c.classList.remove('drag'); c.style.transform = ''; hilite(-999, -999);
            if (!moved) { tapCard(k); return; }
            var n = slotAt(ev.clientX, ev.clientY); if (n > -1) placeAt(k, n); else if (S.seq.indexOf(k) > -1) unplace(k); else renderSeq();
          }
          c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
        });
        return c;
      }
      function afterPlace() { if (S.seq.indexOf(null) < 0) checkSeq(); }
      function checkSeq() {
        S.seqBusy = true; var bad = -1, i;
        for (i = 0; i < 3; i++) if (S.seq[i] !== ORDER[i]) { bad = i; break; }
        if (bad < 0) { success(); return; }
        S.seqWrong++; snd('oops'); emote('cm-huh', 1500); seqEl.classList.remove('cm-shake'); void seqEl.offsetWidth; seqEl.classList.add('cm-shake');
        quip(CARDS[S.seq[bad]].why);
        later(function () {
          for (var j = bad; j < 3; j++) S.seq[j] = null; renderSeq(); S.seqBusy = false;
          if (S.seqWrong >= 2) { var n = S.seq.indexOf(null), cs = trayRow.querySelectorAll('.cm-card'); for (var m = 0; m < cs.length; m++) if (cs[m].getAttribute('aria-label') === CARDS[ORDER[n]].t) cs[m].classList.add('hint'); quip('Try this one next! It is wiggling.'); }
        }, noMotion ? 300 : 1800);
      }
      function fireworks(n) {
        var i; for (i = 0; i < n; i++) (function (k) { later(function () { burst(80 + Math.random() * 640, 50 + Math.random() * 150, 14, ['#ff7ed8', '#ffd23f', '#7df9ff', '#6bff95']); snd('pop'); }, k * 450); })(i);
      }
      function success() {
        S.lock = true; S.has = false; robotEl.classList.remove('cm-has'); hideGo();
        later(function () { removeSeq(); svg.querySelector('#cm-mcrys').classList.add('cm-in'); burst(650, 175, 12, GOLD); snd('pop'); }, 300);
        later(function () { svg.querySelector('#cm-cable').classList.add('cm-on'); snd('pop'); }, 1400);
        later(function () { svg.querySelector('#cm-b3').classList.add('cm-press'); snd('good'); }, 2400);
        later(function () { svg.classList.add('cm-lit'); svg.classList.add('cm-party'); snd('melody'); fireworks(6); try { LCL.fx.confetti(); } catch (e) {} }, 3000);
        later(function () { finale(); }, noMotion ? 3600 : 6200);
      }
      function finale() {
        walkTo(545, 405, function () {
          face(700); emote('cm-cheer', 2000); S.done = true; save(); showChip([]);
          say(['You did it!', 'You followed the clues, spotted patterns and solved the mystery!', 'Sparkle Village is bright again!'], function () {
            LCL.emit('crystalmystery:power'); LCL.emit('crystalmystery:complete'); snd('tada');
            var medal = '<svg viewBox="0 0 120 130" width="130" height="140"><path d="M34 70L20 124L46 112L60 128L66 76Z" fill="#e0463c"/><path d="M86 70L100 124L74 112L60 128L54 76Z" fill="#c63e3b"/><circle cx="60" cy="52" r="44" fill="#f5a623"/><circle cx="60" cy="52" r="36" fill="#ffd23f" stroke="#fff3b0" stroke-width="3"/><polygon transform="translate(60 52) scale(1.7)" points="' + STAR + '" fill="#fff" stroke="#b56f00" stroke-width="1.2"/></svg>';
            overlay('Master Detective!', R.name + ' solved the mystery of the missing Power Crystal!', [{ label: 'Play again', fn: restart }, { label: 'Stay in the village', cls: 'alt', fn: function () { fireworks(4); say('Sparkle Village is bright again!'); } }], medal);
          }, { label: 'Next' });
        });
      }

      /* --- start --- */
      renderNB(); setStage(0);
      if (saved.stage >= 1 && !saved.done) {
        locTxt.textContent = LOC.village;
        overlay('Welcome back!', 'Carry on with your adventure?', [{ label: 'Continue', fn: function () { S.stage = saved.stage; if (saved.stage === 1) stage1(); else if (saved.stage === 2) stage2(); else if (saved.stage === 3) stage3(); else { S.has = true; stage4(); } } }, { label: 'New adventure', cls: 'alt', fn: restart }]);
      } else intro();

      return {
        onOpen: function () {},
        onResize: resize,
        onFocus: function () {},
        destroy: function () { dead = true; clearTimers(); if (pxRaf) cancelAnimationFrame(pxRaf); }
      };
    }
  });
})();