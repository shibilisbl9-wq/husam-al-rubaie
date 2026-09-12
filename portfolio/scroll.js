/* ============================================================
   Scroll-driven timeline.

   The Figma file is a 12-frame storyboard, so every pose in it is
   preserved here as an anchor on a 0..1 progress track. The timing
   and the composition those poses sit in are not from the file —
   the frames were working sketches. Each animated box interpolates
   between anchors in design-space pixels, and the stage scales to
   fit the viewport.
   ============================================================ */
(function () {
  'use strict';

  /* timeline anchors, in storyboard order */
  var A = 0.00, B = 0.10, C = 0.24, D = 0.32, E = 0.44,
      F = 0.54, G = 0.64, H = 0.76, I = 0.88, L = 1.00;

  /* ── layouts ───────────────────────────────────────────── */
  /* wide: content column 120 -> 1240, portrait bleeds off the right edge */
  var WIDE = {
    Wd: 1920, Ht: 1080,
    desi:   { x: [[A,-389],[B,-569],[C,-1269],[0.30,-2300]],
              y: [[A,104],[B,254],[C,254]],
              o: [[A,1],[0.27,1],[0.31,0]] },
    gner:   { x: [[A,320],[B,500],[C,-1340],[0.30,-2500]],
              y: [[A,103],[B,253],[C,253]],
              o: [[A,1],[0.27,1],[0.31,0]] },
    meet:   { y: [[A,491],[B,131],[C,-43]],
              tr:[[A,0.20],[B,0.40]],
              o: [[A,1],[0.20,1],[C,0]] },
    cutout: { x: [[A,346]], y: [[A,1054],[B,204],[0.22,150]],
              w: [[A,1081]], o: [[A,1],[0.15,1],[0.19,0]] },
    /* settles into the full-height band before line 3 arrives, so the
       statement never has to sit on top of the photograph */
    profile:{ r: [[0.15,3300],[C,1980],[D,1960],[E,1930],[F,1920]],
              w: [[C,1282],[D,1180],[E,860],[F,620]],
              h: [[C,901],[D,950],[E,1030],[F,1080]],
              y: [[C,110],[D,80],[E,25],[F,0]],
              o: [[0.15,0],[0.17,1],[0.90,1],[0.97,0]] },
    photo:  { r: [[A,1920]], w: [[A,620]], h: [[A,1080]], y: [[A,0]],
              o: [[0.90,0],[0.97,1]] },
    hi:     { x: [[A,120]], y: [[C,215],[0.345,190]],
              s: [[C,1],[0.345,0.29]],
              o: [[0.21,0],[0.25,1],[0.30,1],[0.345,0]] },
    head:   { x: [[A,120]], y: [[A,190]] },
    ln1:    { o: [[0.30,0],[0.36,1]] },
    ln2:    { o: [[0.34,0],[0.41,1]] },
    ln3:    { o: [[0.52,0],[0.58,1]] },
    ln4:    { o: [[0.68,0],[0.74,1]] },
    oo:     { n: [[0.58,1],[0.66,8]] },
    badge:  { x: [[A,120]], y: [[0.42,120],[0.50,100]],
              w: [[0.42,260],[0.50,288]], h: [[0.42,48],[0.50,52]],
              o: [[0.42,0],[0.50,1]] },
    panel:  { x: [[A,120]], y: [[H,656],[I,620]], w: [[A,1120]], h: [[A,260]],
              o: [[H,0],[I,1]] },
    contact:{ x: [[A,120]], y: [[0.90,966],[L,950]], o: [[0.90,0],[L,1]] },
    /* the tool row: a group box per pose; each tile keeps its normalised
       slot and lerps from scattered to aligned */
    toolBox: {
      x: [[A,238],[B,143],[C,146],[D,147],[E,170],[F,140],[G,128],[H,120],[I,120],[L,120]],
      y: [[A,769],[B,848],[C,819],[D,824],[E,790],[F,740],[G,712],[H,700],[I,692],[L,692]],
      w: [[A,1418],[B,1579],[C,769],[D,769],[E,700],[F,620],[G,580],[H,556],[I,556],[L,556]],
      h: [[A,174],[B,133],[C,130],[D,90],[E,60],[F,55],[G,54],[H,52],[I,52],[L,52]]
    },
    scatter: [[29,47,61],[192,138,64],[390,0,66],[589,52,58],[794,91,58],[972,53,67],[1166,102,61],[1350,103,54]],
    scatterBox: [1418,174],
    alignedBox: 556, alignedStep: 72, alignedSize: 52,
    settle: [A, E]
  };

  /* compact: portrait band on top, content beneath */
  var COMPACT = {
    Wd: 390, Ht: 844,
    desi:   { x: [[A,-86],[B,-110],[C,-330],[0.30,-560]],
              y: [[A,200],[B,235],[C,235]],
              o: [[A,1],[0.27,1],[0.31,0]] },
    gner:   { x: [[A,71],[B,95],[C,-350],[0.30,-590]],
              y: [[A,199],[B,234],[C,234]],
              o: [[A,1],[0.27,1],[0.31,0]] },
    meet:   { y: [[A,330],[B,110],[C,-30]],
              tr:[[A,0.20],[B,0.36]],
              o: [[A,1],[0.20,1],[C,0]] },
    cutout: { x: [[A,75]], y: [[A,760],[B,235],[0.22,205]],
              w: [[A,240]], o: [[A,1],[0.15,1],[0.19,0]] },
    profile:{ r: [[0.15,830],[C,400],[D,398],[E,394],[F,390]],
              w: [[C,420],[D,412],[E,400],[F,390]],
              h: [[C,300],[D,280],[E,240],[F,200]],
              y: [[C,20],[D,14],[E,5],[F,0]],
              o: [[0.15,0],[0.17,1],[0.90,1],[0.97,0]] },
    photo:  { r: [[A,390]], w: [[A,390]], h: [[A,200]], y: [[A,0]],
              o: [[0.90,0],[0.97,1]] },
    hi:     { x: [[A,24]], y: [[C,272],[0.345,264]],
              s: [[C,1],[0.345,0.26]],
              o: [[0.21,0],[0.25,1],[0.30,1],[0.345,0]] },
    head:   { x: [[A,24]], y: [[A,264]] },
    ln1:    { o: [[0.30,0],[0.36,1]] },
    ln2:    { o: [[0.34,0],[0.41,1]] },
    ln3:    { o: [[0.52,0],[0.58,1]] },
    ln4:    { o: [[0.68,0],[0.74,1]] },
    oo:     { n: [[0.58,1],[0.66,8]] },
    badge:  { x: [[A,24]], y: [[0.42,236],[0.50,226]],
              w: [[0.42,168],[0.50,180]], h: [[0.42,28],[0.50,32]],
              o: [[0.42,0],[0.50,1]] },
    panel:  { x: [[A,24]], y: [[H,412],[I,396]], w: [[A,342]], h: [[A,403]],
              o: [[H,0],[I,1]] },
    contact:{ x: [[A,24]], y: [[0.90,822],[L,812]], o: [[0.90,0],[L,1]] },
    toolBox: {
      x: [[A,20],[B,15],[C,20],[D,24],[E,26],[F,24],[G,24],[H,24],[I,24],[L,24]],
      y: [[A,600],[B,640],[C,600],[D,596],[E,560],[F,500],[G,470],[H,455],[I,452],[L,452]],
      w: [[A,350],[B,360],[C,330],[D,320],[E,300],[F,360],[G,350],[H,342],[I,342],[L,342]],
      h: [[A,90],[B,70],[C,60],[D,48],[E,40],[F,36],[G,35],[H,34],[I,34],[L,34]]
    },
    scatter: [[6,26,30],[50,66,32],[96,0,33],[143,28,29],[190,50,29],[236,29,33],[282,56,30],[318,58,27]],
    scatterBox: [350,90],
    alignedBox: 342, alignedStep: 44, alignedSize: 34,
    settle: [A, E]
  };

  /* ── maths ─────────────────────────────────────────────── */
  function smooth(u) { return u * u * (3 - 2 * u); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function track(p, kf) {
    if (!kf || !kf.length) return 0;
    if (p <= kf[0][0]) return kf[0][1];
    for (var i = 1; i < kf.length; i++) {
      if (p <= kf[i][0]) {
        var a = kf[i - 1], b = kf[i];
        var span = b[0] - a[0];
        var u = span <= 0 ? 1 : (p - a[0]) / span;
        return a[1] + (b[1] - a[1]) * smooth(u);
      }
    }
    return kf[kf.length - 1][1];
  }

  /* ── dom ───────────────────────────────────────────────── */
  var el = {};
  ['scroller','frame','desi','gner','meet','cutout','profile','photocard','hi',
   'heading','ln1','ln2','ln3','ln4','oo','badge','panel','tools','contact',
   'cue','railfill'].forEach(function (id) { el[id] = document.getElementById(id); });

  var tools = Array.prototype.slice.call(el.tools.children);

  var LAY = WIDE;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pickLayout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    /* the 1920-wide stage only stays legible above ~0.68 scale, so anything
       narrower or squarer than this gets the purpose-built compact canvas */
    var compact = vw < 1100 || vw / vh < 1.2;
    LAY = compact ? COMPACT : WIDE;
    document.documentElement.classList.toggle('mob', compact);
    document.documentElement.classList.toggle('dsk', !compact);
    el.frame.style.setProperty('--W', LAY.Wd + 'px');
    el.frame.style.setProperty('--H', LAY.Ht + 'px');
    el.frame.style.setProperty('--s', Math.min(vw / LAY.Wd, vh / LAY.Ht));
  }

  /* ── painters ──────────────────────────────────────────── */
  function place(node, x, y, o) {
    node.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    if (o !== undefined) node.style.opacity = o;
  }
  function box(node, x, y, w, h, o) {
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    node.style.opacity = o;
  }
  /* the portraits are mirrored, so they scale about their own left edge and
     are positioned by their right edge */
  function flipped(node, right, y, w, h, o) {
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.transform = 'translate3d(' + right + 'px,' + y + 'px,0) scaleX(-1)';
    node.style.opacity = o;
  }

  var lastOo = -1;

  function render(p) {
    var d = LAY;

    /* Act 1 — kinetic type */
    place(el.desi, track(p, d.desi.x), track(p, d.desi.y), track(p, d.desi.o));
    place(el.gner, track(p, d.gner.x), track(p, d.gner.y), track(p, d.gner.o));
    place(el.meet, 0, track(p, d.meet.y), track(p, d.meet.o));
    el.meet.style.letterSpacing = track(p, d.meet.tr).toFixed(3) + 'em';
    el.cutout.style.width = track(p, d.cutout.w) + 'px';
    place(el.cutout, track(p, d.cutout.x), track(p, d.cutout.y), track(p, d.cutout.o));

    /* Act 2 — the portrait band */
    flipped(el.profile, track(p, d.profile.r), track(p, d.profile.y),
            track(p, d.profile.w), track(p, d.profile.h), track(p, d.profile.o));
    flipped(el.photocard, track(p, d.photo.r), track(p, d.photo.y),
            track(p, d.photo.w), track(p, d.photo.h), track(p, d.photo.o));

    /* Act 3 — the statement */
    el.hi.style.transform = 'translate3d(' + track(p, d.hi.x) + 'px,' +
                            track(p, d.hi.y) + 'px,0) scale(' + track(p, d.hi.s) + ')';
    el.hi.style.opacity = track(p, d.hi.o);

    place(el.heading, track(p, d.head.x), track(p, d.head.y));
    el.ln1.style.opacity = track(p, d.ln1.o);
    el.ln2.style.opacity = track(p, d.ln2.o);
    el.ln3.style.opacity = track(p, d.ln3.o);
    el.ln4.style.opacity = track(p, d.ln4.o);

    var n = Math.max(1, Math.round(track(p, d.oo.n)));
    if (n !== lastOo) { el.oo.textContent = new Array(n + 1).join('o'); lastOo = n; }

    box(el.badge, track(p, d.badge.x), track(p, d.badge.y),
        track(p, d.badge.w), track(p, d.badge.h), track(p, d.badge.o));

    /* Act 4 — the facts */
    box(el.panel, track(p, d.panel.x), track(p, d.panel.y),
        track(p, d.panel.w), track(p, d.panel.h), track(p, d.panel.o));
    place(el.contact, track(p, d.contact.x), track(p, d.contact.y), track(p, d.contact.o));

    /* the software row */
    var gx = track(p, d.toolBox.x), gy = track(p, d.toolBox.y),
        gw = track(p, d.toolBox.w), gh = track(p, d.toolBox.h);
    var q = smooth(clamp01((p - d.settle[0]) / (d.settle[1] - d.settle[0])));
    var sb = d.scatterBox;
    for (var t = 0; t < tools.length; t++) {
      var s = d.scatter[t];
      var nx = (s[0] / sb[0]) * (1 - q) + ((t * d.alignedStep) / d.alignedBox) * q;
      var ny = (s[1] / sb[1]) * (1 - q);
      var ns = (s[2] / sb[0]) * (1 - q) + (d.alignedSize / d.alignedBox) * q;
      var size = ns * gw;
      var node = tools[t];
      node.style.width = size + 'px';
      node.style.height = size + 'px';
      node.style.setProperty('--ts', size + 'px');
      node.style.transform = 'translate3d(' + (gx + nx * gw) + 'px,' +
                             (gy + ny * gh) + 'px,0)';
    }

    el.cue.style.opacity = clamp01(1 - p * 22);
    el.railfill.style.width = (p * 100) + '%';
  }

  /* ── loop ──────────────────────────────────────────────── */
  var ticking = false;

  function readProgress() {
    var range = el.scroller.offsetHeight - window.innerHeight;
    if (range <= 0) return 1;
    return clamp01(-el.scroller.getBoundingClientRect().top / range);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { render(readProgress()); ticking = false; });
  }

  function boot() {
    pickLayout();
    if (reduced) {
      el.scroller.style.height = '100svh';
      render(1);
      return;
    }
    render(readProgress());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { pickLayout(); render(readProgress()); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        pickLayout(); render(readProgress());
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  /* fonts change text metrics — repaint once they land */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { render(reduced ? 1 : readProgress()); });
  }
})();
