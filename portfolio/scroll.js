/* ============================================================
   Scroll-driven timeline.

   The Figma file is a 12-frame storyboard (1920x1080 each). Each
   frame becomes an anchor on a 0..1 progress track; every animated
   box interpolates between those anchors in design-space pixels,
   and the whole stage is scaled to fit the viewport. Numbers below
   are lifted from the frames, not eyeballed.
   ============================================================ */
(function () {
  'use strict';

  /* frame -> progress. A..L in storyboard order. */
  var F = {
    A: 0.00, B: 0.10, C: 0.22, D: 0.33, E: 0.41, G6: 0.49,
    G7: 0.56, H: 0.63, I: 0.70, J: 0.78, K: 0.87, L: 1.00
  };

  /* ── layouts ───────────────────────────────────────────── */
  var DESKTOP = {
    W: 1920, H: 1080,
    desi:   { x: [[F.A,-389],[F.B,-569],[F.C,-1269],[0.28,-2300]],
              y: [[F.A,104],[F.B,254],[F.C,254]],
              o: [[F.A,1],[0.25,1],[0.29,0]] },
    gner:   { x: [[F.A,320],[F.B,500],[F.C,-1340],[0.28,-2500]],
              y: [[F.A,103],[F.B,253],[F.C,253]],
              o: [[F.A,1],[0.25,1],[0.29,0]] },
    meet:   { y: [[F.A,491],[F.B,131],[F.C,-43]],
              tr:[[F.A,0.20],[F.B,0.40]],
              o: [[F.A,1],[0.19,1],[F.C,0]] },
    cutout: { x: [[F.A,346]], y: [[F.A,1054],[F.B,204],[0.20,150]],
              w: [[F.A,1081]], o: [[F.A,1],[0.17,1],[F.C,0]] },
    profile:{ r: [[0.14,3260],[F.C,1913],[F.E,1913],[F.G6,1953],[F.I,1953],[F.J,1949],[F.K,1832]],
              y: [[F.C,182],[F.J,210],[F.K,289]],
              w: [[F.C,1282],[F.J,1153],[F.K,942]],
              h: [[F.C,901],[F.J,810],[F.K,663]],
              o: [[0.14,0],[0.20,1],[0.93,1],[F.L,0]] },
    card:   { x: [[F.C,137],[F.D,178]], y: [[F.C,467],[F.D,352]],
              w: [[F.C,1066],[F.D,835],[F.G6,879]],
              h: [[F.C,240],[F.D,216],[F.I,216],[F.J,272],[F.L,333]],
              o: [[F.C,0],[F.D,0.43],[F.G6,1]] },
    hi:     { x: [[F.C,246]], y: [[F.C,399],[0.335,400]],
              s: [[F.C,1],[0.335,0.21]],
              o: [[0.20,0],[0.235,1],[0.30,1],[0.335,0]] },
    head:   { x: [[F.A,227]], y: [[F.C,515],[F.D,400]] },
    ln1:    { o: [[0.30,0],[0.35,1]] },
    ln2:    { o: [[0.33,0],[0.39,1]] },
    ln3:    { o: [[0.72,0],[F.J,1]] },
    ln4:    { o: [[0.90,0],[0.96,1]] },
    oo:     { n: [[F.J,1],[F.K,8]] },
    badge:  { x: [[F.G6,547]], y: [[F.G6,465],[F.G7,459],[F.I,444]],
              w: [[F.G6,263],[F.G7,292],[F.H,343]],
              h: [[F.G6,55],[F.G7,61],[F.I,75]],
              o: [[0.45,0],[0.52,1]] },
    panel:  { x: [[F.K,178]], y: [[F.K,746],[F.L,712]],
              w: [[F.K,835],[F.L,879]], h: [[F.K,308],[F.L,268]],
              o: [[0.82,0],[F.K,0.41],[F.L,1]] },
    ptext:  { o: [[0.90,0],[0.99,1]] },
    photo:  { r: [[F.L,1554]], y: [[F.L,352]], w: [[F.L,478]], h: [[F.L,668]],
              o: [[0.93,0],[F.L,1]] },
    /* software row: group box per frame; each tile keeps its
       normalised slot and lerps from "scattered" to "aligned". */
    toolBox: {
      x: [[F.A,238],[F.B,143],[F.C,146],[F.D,147],[F.E,190],[F.G6,227],[F.G7,227],[F.H,227],[F.I,227],[F.J,227],[F.K,227],[F.L,227]],
      y: [[F.A,769],[F.B,848],[F.C,819],[F.D,824],[F.E,834],[F.G6,830],[F.G7,787],[F.H,815],[F.I,808],[F.J,832],[F.K,822],[F.L,786]],
      w: [[F.A,1418],[F.B,1579],[F.C,769],[F.D,769],[F.E,747],[F.G6,747],[F.G7,712],[F.H,621],[F.I,586],[F.J,524],[F.K,469],[F.L,469]],
      h: [[F.A,174],[F.B,133],[F.C,130],[F.D,80],[F.E,47],[F.G6,47],[F.G7,47],[F.H,47],[F.I,47],[F.J,42],[F.K,42],[F.L,42]]
    },
    /* scattered slots, frame A (x, y, size) relative to a 1418x174 box */
    scatter: [[29,47,61],[192,138,64],[390,0,66],[589,52,58],[794,91,58],[972,53,67],[1166,102,61],[1350,103,54]],
    scatterBox: [1418,174],
    alignedBox: 469, alignedStep: 61, alignedSize: 42,
    settle: [F.A, F.E]
  };

  var COMPACT = {
    W: 390, H: 844,
    desi:   { x: [[F.A,-86],[F.B,-110],[F.C,-330],[0.28,-560]],
              y: [[F.A,200],[F.B,235],[F.C,235]],
              o: [[F.A,1],[0.25,1],[0.29,0]] },
    gner:   { x: [[F.A,71],[F.B,95],[F.C,-350],[0.28,-590]],
              y: [[F.A,199],[F.B,234],[F.C,234]],
              o: [[F.A,1],[0.25,1],[0.29,0]] },
    meet:   { y: [[F.A,330],[F.B,110],[F.C,-30]],
              tr:[[F.A,0.20],[F.B,0.36]],
              o: [[F.A,1],[0.19,1],[F.C,0]] },
    cutout: { x: [[F.A,75]], y: [[F.A,760],[F.B,235],[0.20,205]],
              w: [[F.A,240]], o: [[F.A,1],[0.17,1],[F.C,0]] },
    profile:{ r: [[0.14,840],[F.C,415],[F.I,415],[F.J,412],[F.K,405]],
              y: [[F.C,60],[F.K,66]],
              w: [[F.C,420],[F.K,380]],
              h: [[F.C,240],[F.K,210]],
              o: [[0.14,0],[0.20,1],[0.93,1],[F.L,0]] },
    card:   { x: [[F.C,8],[F.D,12]], y: [[F.C,318],[F.D,302]],
              w: [[F.C,374],[F.D,366]],
              h: [[F.C,120],[F.D,110],[F.I,110],[F.J,142],[F.L,168]],
              o: [[F.C,0],[F.D,0.43],[F.G6,1]] },
    hi:     { x: [[F.C,28]], y: [[F.C,326],[0.335,320]],
              s: [[F.C,1],[0.335,0.28]],
              o: [[0.20,0],[0.235,1],[0.30,1],[0.335,0]] },
    head:   { x: [[F.A,28]], y: [[F.C,336],[F.D,320]] },
    ln1:    { o: [[0.30,0],[0.35,1]] },
    ln2:    { o: [[0.33,0],[0.39,1]] },
    ln3:    { o: [[0.72,0],[F.J,1]] },
    ln4:    { o: [[0.90,0],[0.96,1]] },
    oo:     { n: [[F.J,1],[F.K,8]] },
    badge:  { x: [[F.G6,186]], y: [[F.G6,348],[F.G7,344],[F.I,340]],
              w: [[F.G6,96],[F.G7,106],[F.H,118]],
              h: [[F.G6,22],[F.G7,25],[F.I,29]],
              o: [[0.45,0],[0.52,1]] },
    panel:  { x: [[F.K,16]], y: [[F.K,510],[F.L,492]],
              w: [[F.K,340],[F.L,358]], h: [[F.K,250],[F.L,272]],
              o: [[0.82,0],[F.K,0.41],[F.L,1]] },
    ptext:  { o: [[0.90,0],[0.99,1]] },
    photo:  { r: [[F.L,374]], y: [[F.L,44]], w: [[F.L,178]], h: [[F.L,249]],
              o: [[0.93,0],[F.L,1]] },
    toolBox: {
      x: [[F.A,20],[F.B,15],[F.C,20],[F.D,24],[F.E,28],[F.G6,28],[F.G7,28],[F.H,28],[F.I,28],[F.J,28],[F.K,28],[F.L,28]],
      y: [[F.A,600],[F.B,640],[F.C,600],[F.D,600],[F.E,604],[F.G6,604],[F.G7,596],[F.H,600],[F.I,598],[F.J,602],[F.K,542],[F.L,522]],
      w: [[F.A,350],[F.B,360],[F.C,330],[F.D,320],[F.E,310],[F.G6,300],[F.G7,300],[F.H,298],[F.I,296],[F.J,296],[F.K,296],[F.L,296]],
      h: [[F.A,90],[F.B,70],[F.C,60],[F.D,48],[F.E,40],[F.G6,36],[F.G7,34],[F.H,32],[F.I,30],[F.J,30],[F.K,30],[F.L,30]]
    },
    scatter: [[6,26,30],[50,66,32],[96,0,33],[143,28,29],[190,50,29],[236,29,33],[282,56,30],[318,58,27]],
    scatterBox: [350, 90],
    alignedBox: 296, alignedStep: 38, alignedSize: 30,
    settle: [F.A, F.E]
  };

  /* ── maths ─────────────────────────────────────────────── */
  function smooth(u) { return u * u * (3 - 2 * u); }

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

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ── dom ───────────────────────────────────────────────── */
  var el = {};
  ['scroller','frame','desi','gner','meet','cutout','profile','card','hi',
   'heading','ln1','ln2','ln3','ln4','oo','badge','panel','tools','photocard',
   'cue','railfill'].forEach(function (id) { el[id] = document.getElementById(id); });

  var tools = Array.prototype.slice.call(el.tools.children);
  var panelText = Array.prototype.slice.call(el.panel.querySelectorAll('.pl'));

  var L = DESKTOP;
  var scale = 1;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pickLayout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    /* the 1920-wide stage only stays legible above ~0.68 scale, so anything
       narrower or squarer than this gets the purpose-built compact canvas */
    var compact = vw < 1100 || vw / vh < 1.2;
    L = compact ? COMPACT : DESKTOP;
    document.documentElement.classList.toggle('mob', compact);
    document.documentElement.classList.toggle('dsk', !compact);
    el.frame.style.setProperty('--W', L.W + 'px');
    el.frame.style.setProperty('--H', L.H + 'px');
    scale = Math.min(vw / L.W, vh / L.H);
    el.frame.style.setProperty('--s', scale);
    document.documentElement.style.setProperty('--W', L.W + 'px');
    document.documentElement.style.setProperty('--H', L.H + 'px');
  }

  /* ── painters ──────────────────────────────────────────── */
  function place(node, x, y, o) {
    node.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    if (o !== undefined) node.style.opacity = o;
  }
  function placeFlipped(node, right, y, w, h, o) {
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.transform = 'translate3d(' + right + 'px,' + y + 'px,0) scaleX(-1)';
    node.style.opacity = o;
  }
  function box(node, x, y, w, h, o) {
    node.style.width = w + 'px';
    node.style.height = h + 'px';
    node.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    node.style.opacity = o;
  }

  var lastOo = -1;

  function render(p) {
    var d = L;

    /* Act 1 — kinetic type */
    place(el.desi, track(p, d.desi.x), track(p, d.desi.y), track(p, d.desi.o));
    place(el.gner, track(p, d.gner.x), track(p, d.gner.y), track(p, d.gner.o));

    place(el.meet, 0, track(p, d.meet.y), track(p, d.meet.o));
    el.meet.style.letterSpacing = track(p, d.meet.tr).toFixed(3) + 'em';

    el.cutout.style.width = track(p, d.cutout.w) + 'px';
    place(el.cutout, track(p, d.cutout.x), track(p, d.cutout.y), track(p, d.cutout.o));

    /* Act 2 — portrait + statement */
    placeFlipped(el.profile, track(p, d.profile.r), track(p, d.profile.y),
                 track(p, d.profile.w), track(p, d.profile.h), track(p, d.profile.o));

    box(el.card, track(p, d.card.x), track(p, d.card.y),
        track(p, d.card.w), track(p, d.card.h), track(p, d.card.o));

    var hs = track(p, d.hi.s);
    el.hi.style.transform = 'translate3d(' + track(p, d.hi.x) + 'px,' +
                            track(p, d.hi.y) + 'px,0) scale(' + hs + ')';
    el.hi.style.opacity = track(p, d.hi.o);

    place(el.heading, track(p, d.head.x), track(p, d.head.y));
    el.ln1.style.opacity = track(p, d.ln1.o);
    el.ln2.style.opacity = track(p, d.ln2.o);
    el.ln3.style.opacity = track(p, d.ln3.o);
    el.ln4.style.opacity = track(p, d.ln4.o);

    var n = Math.max(1, Math.round(track(p, d.oo.n)));
    if (n !== lastOo) { el.oo.textContent = new Array(n + 1).join('o'); lastOo = n; }

    var bw = track(p, d.badge.w), bh = track(p, d.badge.h);
    el.badge.style.setProperty('--bw', bw + 'px');
    el.badge.style.setProperty('--bh', bh + 'px');
    box(el.badge, track(p, d.badge.x), track(p, d.badge.y), bw, bh, track(p, d.badge.o));

    /* Act 3 — the facts */
    box(el.panel, track(p, d.panel.x), track(p, d.panel.y),
        track(p, d.panel.w), track(p, d.panel.h), track(p, d.panel.o));
    var pt = track(p, d.ptext.o);
    for (var i = 0; i < panelText.length; i++) panelText[i].style.opacity = pt;

    placeFlipped(el.photocard, track(p, d.photo.r), track(p, d.photo.y),
                 track(p, d.photo.w), track(p, d.photo.h), track(p, d.photo.o));

    /* software row */
    var gx = track(p, d.toolBox.x), gy = track(p, d.toolBox.y),
        gw = track(p, d.toolBox.w), gh = track(p, d.toolBox.h);
    var q = smooth(clamp01((p - d.settle[0]) / (d.settle[1] - d.settle[0])));
    var sb = d.scatterBox;
    for (var t = 0; t < tools.length; t++) {
      var s = d.scatter[t];
      var nx = (s[0] / sb[0]) * (1 - q) + ((t * d.alignedStep) / d.alignedBox) * q;
      var ny = (s[1] / sb[1]) * (1 - q) + 0 * q;
      var ns = (s[2] / sb[0]) * (1 - q) + (d.alignedSize / d.alignedBox) * q;
      var size = ns * gw;
      var node = tools[t];
      node.style.width = size + 'px';
      node.style.height = size + 'px';
      node.style.setProperty('--ts', size + 'px');
      node.style.transform = 'translate3d(' + (gx + nx * gw) + 'px,' +
                             (gy + ny * gh) + 'px,0)';
    }

    /* chrome */
    el.cue.style.opacity = clamp01(1 - p * 22);
    el.railfill.style.width = (p * 100) + '%';
  }

  /* ── loop ──────────────────────────────────────────────── */
  var ticking = false, progress = 0;

  function readProgress() {
    var range = el.scroller.offsetHeight - window.innerHeight;
    if (range <= 0) return 1;
    var top = el.scroller.getBoundingClientRect().top;
    return clamp01(-top / range);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      progress = readProgress();
      render(progress);
      ticking = false;
    });
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
    window.addEventListener('resize', function () {
      pickLayout();
      render(readProgress());
    });
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
