/* Little Computer Lab - inline SVG icons (no external files). */
(function () {
  'use strict';
  var LCL = window.LCL = window.LCL || {};

  /* Big coloured icons, 64x64 */
  var BIG = {
    academy: '<rect x="6" y="12" width="52" height="36" rx="6" fill="#1971c2"/><rect x="11" y="17" width="42" height="26" rx="3" fill="#e7f5ff"/><circle cx="25" cy="28" r="3.5" fill="#1b3a6b"/><circle cx="39" cy="28" r="3.5" fill="#1b3a6b"/><path d="M23 35q9 7 18 0" fill="none" stroke="#e8590c" stroke-width="3" stroke-linecap="round"/><rect x="28" y="48" width="8" height="7" fill="#868e96"/><rect x="18" y="55" width="28" height="5" rx="2.5" fill="#495057"/><polygon points="32,1 49,8 32,15 15,8" fill="#212529"/><path d="M48 9v8" stroke="#fcc419" stroke-width="2.5" stroke-linecap="round"/>',
    paint: '<path d="M32 6C16 6 5 17 5 31c0 13 10 24 23 24 6 0 7-3 6-6-1-4 1-7 6-7h8c7 0 11-5 11-11C59 15 47 6 32 6z" fill="#ffe8cc" stroke="#e8590c" stroke-width="3"/><circle cx="19" cy="28" r="5" fill="#fa5252"/><circle cx="30" cy="18" r="5" fill="#fcc419"/><circle cx="43" cy="21" r="5" fill="#40c057"/><circle cx="48" cy="33" r="5" fill="#228be6"/>',
    explorer: '<path d="M5 15a4 4 0 0 1 4-4h14l6 6h26a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#fab005"/><path d="M5 26h54v21a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#ffd43b"/><circle cx="44" cy="40" r="9" fill="#e7f5ff" stroke="#1971c2" stroke-width="3"/><path d="M51 47l7 7" stroke="#1971c2" stroke-width="4" stroke-linecap="round"/>',
    folder: '<path d="M5 15a4 4 0 0 1 4-4h14l6 6h26a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#fab005"/><path d="M5 26h54v21a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#ffd43b"/>',
    missions: '<rect x="4" y="4" width="56" height="56" rx="14" fill="#7950f2"/><polygon points="32,10 38,25 54,26 42,36 46,52 32,43 18,52 22,36 10,26 26,25" fill="#ffd43b" stroke="#f08c00" stroke-width="2.5" stroke-linejoin="round"/>',
    notepad: '<rect x="12" y="5" width="40" height="54" rx="5" fill="#fff9db" stroke="#f59f00" stroke-width="3"/><path d="M20 20h24M20 29h24M20 38h16" stroke="#adb5bd" stroke-width="3" stroke-linecap="round"/><path d="M40 52l14-14 5 5-14 14-7 2z" fill="#fa5252" stroke="#c92a2a" stroke-width="2" stroke-linejoin="round"/>',
    file: '<path d="M14 4h26l12 12v42a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff" stroke="#74a7e0" stroke-width="3" stroke-linejoin="round"/><path d="M40 4v12h12" fill="#d0ebff" stroke="#74a7e0" stroke-width="3" stroke-linejoin="round"/><path d="M20 28h24M20 36h24M20 44h14" stroke="#adb5bd" stroke-width="3" stroke-linecap="round"/>',
    picture: '<rect x="6" y="10" width="52" height="44" rx="5" fill="#d0ebff" stroke="#74a7e0" stroke-width="3"/><circle cx="44" cy="23" r="6" fill="#ffd43b"/><path d="M8 50l16-18 12 12 8-8 12 14z" fill="#51cf66"/>',
    computer: '<rect x="6" y="8" width="52" height="38" rx="6" fill="#495057"/><rect x="11" y="13" width="42" height="28" rx="3" fill="#a5d8ff"/><rect x="28" y="46" width="8" height="8" fill="#868e96"/><rect x="18" y="54" width="28" height="5" rx="2.5" fill="#495057"/>',
    lock: '<rect x="8" y="8" width="48" height="48" rx="12" fill="#e9ecef" stroke="#adb5bd" stroke-width="3" stroke-dasharray="6 5"/><rect x="21" y="30" width="22" height="16" rx="4" fill="#adb5bd"/><path d="M25 30v-5a7 7 0 0 1 14 0v5" fill="none" stroke="#adb5bd" stroke-width="4" stroke-linecap="round"/>'
  };

  /* Small line glyphs, 24x24 */
  var G = {
    back: '<path d="M15 5l-7 7 7 7"/><path d="M8 12h12"/>',
    up: '<path d="M12 20V5"/><path d="M5 12l7-7 7 7"/>',
    newfolder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 10v6M9 13h6"/>',
    newnote: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14h6"/>',
    rename: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    move: '<path d="M3 12h13"/><path d="M11 6l6 6-6 6"/><path d="M21 5v14"/>',
    paste: '<rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 13h6M9 17h4"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    open: '<path d="M3 18V6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v2"/><path d="M3 18l3-8h16l-3 8z"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><rect x="8" y="13" width="8" height="7"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-4"/>',
    brush: '<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12c-3 0-5 2-5 5 0 2-1 3-2 4 4 1 9 0 10-4"/>',
    eraser: '<path d="M7 20h13"/><path d="M5 15l9-9 6 6-7 7H8z"/><path d="M10 10l6 6"/>',
    square: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
    circle: '<circle cx="12" cy="12" r="8"/>',
    triangle: '<path d="M12 4l9 16H3z"/>',
    star: '<path d="M12 3l2.7 6 6.3.6-4.8 4.2 1.5 6.2L12 16.8 6.3 20l1.5-6.2L3 9.6 9.3 9z"/>',
    newpage: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    clear: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
    soundon: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>',
    soundoff: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    check: '<path d="M4 12l5 5 11-11"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
    min: '<path d="M5 18h14"/>',
    max: '<rect x="5" y="5" width="14" height="14" rx="1.5"/>',
    restore: '<rect x="4" y="8" width="12" height="12" rx="1.5"/><path d="M8 8V5h12v12h-4"/>',
    desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M20 4v5h-5"/>',
    fill: '<path d="M5 19l6-14 8 8-10 6z"/><path d="M19 17c0 1.5-1 2.5-2 2.5s-2-1-2-2.5 2-3 2-3 2 1.5 2 3z"/>'
  };

  LCL.icons = {
    big: function (n) { return '<svg viewBox="0 0 64 64" aria-hidden="true">' + (BIG[n] || BIG.file) + '</svg>'; },
    g: function (n) {
      return '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (G[n] || '') + '</svg>';
    }
  };
})();
