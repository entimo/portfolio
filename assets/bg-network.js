/* ============================================
   ANIMATED NETWORK BACKGROUND — V2 injector
   Three depth-tiered SVG layers + mouse parallax
   (rAF-driven, throttled) + traveling light packets
   that ride along selected edges.

   Self-contained, zero deps, idempotent, inert.
   ============================================ */

(function () {
  if (document.querySelector('.bg-network')) return;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var VB_W = 1600, VB_H = 900;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     Layer definitions. Each layer carries its own node set and edges.
     Parallax magnitude grows with proximity (near layer moves more).
  ---------------------------------------------------------------------- */

  var LAYERS = [
    {
      cls: 'bg-network__layer--far',
      parallax: 4,   // px max travel
      nodes: [
        { x: 90,   y: 110,  r: 2,   cls: 'n1'  },
        { x: 320,  y: 250,  r: 1.8, cls: 'n2'  },
        { x: 680,  y: 130,  r: 2.2, cls: 'n3'  },
        { x: 1180, y: 200,  r: 1.9, cls: 'n4'  },
        { x: 1500, y: 380,  r: 2.1, cls: 'n5'  },
        { x: 1450, y: 760,  r: 2.0, cls: 'n6'  },
        { x: 1050, y: 820,  r: 1.7, cls: 'n7'  },
        { x: 540,  y: 760,  r: 1.9, cls: 'n8'  },
        { x: 160,  y: 660,  r: 2.0, cls: 'n9'  },
        { x: 60,   y: 420,  r: 1.8, cls: 'n10' }
      ],
      edges: [
        [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0],
        [1,8],[2,7],[3,6]
      ],
      scans: []
    },
    {
      cls: 'bg-network__layer--mid',
      parallax: 10,
      nodes: [
        { x: 180,  y: 160,  r: 3,   cls: 'n1' },
        { x: 420,  y: 320,  r: 2.5, cls: 'n2' },
        { x: 760,  y: 180,  r: 3.5, cls: 'n3' },
        { x: 980,  y: 460,  r: 3,   cls: 'n4' },
        { x: 1280, y: 240,  r: 2.8, cls: 'n5' },
        { x: 1460, y: 620,  r: 3.2, cls: 'n6' },
        { x: 240,  y: 720,  r: 2.6, cls: 'n7' },
        { x: 620,  y: 680,  r: 3,   cls: 'n8' },
        { x: 1100, y: 760,  r: 2.7, cls: 'n9' },
        { x: 880,  y: 80,   r: 2.4, cls: 'n10' }
      ],
      edges: [
        [0,1],[1,2],[2,3],[3,4],[4,5],
        [1,6],[3,6],[3,7],[4,7],[5,7],
        [2,8],[0,8],[6,7],[7,8]
      ],
      scans: [[1,3], [2,4], [6,7], [0,4], [3,8]]
    },
    {
      cls: 'bg-network__layer--near',
      parallax: 18,
      // Two abstract clusters (mini-topologies) — small dense groupings
      // suggesting datacenter racks / subnetworks. Drawn closer to viewer.
      nodes: [
        // Cluster A — upper-left rack
        { x: 230,  y: 220,  r: 3.2, cls: 'n11' },
        { x: 290,  y: 270,  r: 2.4, cls: 'n12' },
        { x: 200,  y: 290,  r: 2.6, cls: 'n13' },
        { x: 290,  y: 200,  r: 2.4, cls: 'n14' },
        // Cluster B — lower-right rack
        { x: 1330, y: 560,  r: 3.0, cls: 'n15' },
        { x: 1395, y: 615,  r: 2.5, cls: 'n16' },
        { x: 1280, y: 625,  r: 2.6, cls: 'n17' },
        { x: 1390, y: 510,  r: 2.4, cls: 'n18' }
      ],
      // Star topology within each cluster, plus an inter-cluster trunk
      edges: [
        [0,1],[0,2],[0,3],[1,2],[2,3],          // cluster A mesh
        [4,5],[4,6],[4,7],[5,6],[6,7],          // cluster B mesh
        [0,4]                                    // trunk
      ],
      scans: [[0,4], [1,2], [5,6]]
    }
  ];

  /* ----------------------------------------------------------------------
     Packets: small dots that travel along selected mid-layer edges, with
     SVG animateMotion. Each packet picks a path by id.
  ---------------------------------------------------------------------- */

  var PACKET_PATHS = [
    // (layerIndex, fromNodeIdx, toNodeIdx, duration_s, delay_s)
    [1, 0, 1, 9,  0   ],
    [1, 1, 3, 11, 2.5 ],
    [1, 3, 5, 8,  4.5 ],
    [1, 5, 7, 12, 1.5 ],
    [1, 2, 4, 10, 3.5 ],
    [1, 6, 7, 13, 0.8 ]
  ];

  /* ----------------------------------------------------------------------
     Build SVG per layer
  ---------------------------------------------------------------------- */

  function buildLayer(def, idx) {
    var layer = document.createElement('div');
    layer.className = 'bg-network__layer ' + def.cls;
    layer.dataset.parallax = def.parallax;

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + VB_W + ' ' + VB_H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    // Defs to host paths used by animateMotion
    var defs = document.createElementNS(SVG_NS, 'defs');
    svg.appendChild(defs);

    // Base lines
    def.edges.forEach(function (e) {
      var a = def.nodes[e[0]], b = def.nodes[e[1]];
      var line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('class', 'net-line');
      svg.appendChild(line);
    });

    // Scan-highlighted lines (drawn on top)
    def.scans.forEach(function (e, i) {
      var a = def.nodes[e[0]], b = def.nodes[e[1]];
      var line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('class', 'net-line--scan s' + ((i % 5) + 1));
      svg.appendChild(line);
    });

    // Halos (so the solid dot sits on top)
    def.nodes.forEach(function (n) {
      var halo = document.createElementNS(SVG_NS, 'circle');
      halo.setAttribute('cx', n.x); halo.setAttribute('cy', n.y);
      halo.setAttribute('r', n.r * 4);
      halo.setAttribute('class', 'net-node--halo ' + n.cls);
      svg.appendChild(halo);
    });

    // Solid nodes
    def.nodes.forEach(function (n) {
      var c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', n.x); c.setAttribute('cy', n.y);
      c.setAttribute('r', n.r);
      c.setAttribute('class', 'net-node ' + n.cls);
      svg.appendChild(c);
    });

    // Packets on this layer (mid only by default)
    if (!prefersReduced) {
      PACKET_PATHS.forEach(function (p, i) {
        if (p[0] !== idx) return;
        var a = def.nodes[p[1]], b = def.nodes[p[2]];
        if (!a || !b) return;
        var pathId = 'bg-pkt-path-' + idx + '-' + i;
        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('id', pathId);
        path.setAttribute('d', 'M' + a.x + ',' + a.y + ' L' + b.x + ',' + b.y);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'none');
        defs.appendChild(path);

        var pkt = document.createElementNS(SVG_NS, 'circle');
        pkt.setAttribute('r', 1.8);
        pkt.setAttribute('class', 'net-packet');

        var motion = document.createElementNS(SVG_NS, 'animateMotion');
        motion.setAttribute('dur', p[3] + 's');
        motion.setAttribute('begin', '-' + p[4] + 's');
        motion.setAttribute('repeatCount', 'indefinite');
        motion.setAttribute('rotate', 'auto');
        var mpath = document.createElementNS(SVG_NS, 'mpath');
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + pathId);
        mpath.setAttribute('href', '#' + pathId);
        motion.appendChild(mpath);
        pkt.appendChild(motion);
        svg.appendChild(pkt);
      });
    }

    layer.appendChild(svg);
    return layer;
  }

  /* ----------------------------------------------------------------------
     Mount
  ---------------------------------------------------------------------- */

  var wrap = document.createElement('div');
  wrap.className = 'bg-network';
  wrap.setAttribute('aria-hidden', 'true');

  var layerEls = LAYERS.map(function (def, i) {
    var el = buildLayer(def, i);
    wrap.appendChild(el);
    return el;
  });

  if (document.body.firstChild) {
    document.body.insertBefore(wrap, document.body.firstChild);
  } else {
    document.body.appendChild(wrap);
  }

  /* ----------------------------------------------------------------------
     Parallax — only on devices that can hover (skip touch), and respect
     reduced motion. rAF-driven, mousemove just stores target coords.
  ---------------------------------------------------------------------- */

  if (prefersReduced) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var targetX = 0, targetY = 0;  // -0.5..0.5
  var curX = 0,    curY = 0;
  var EASE = 0.06;
  var rafId = null;
  var paused = false;

  function onMove(e) {
    var w = window.innerWidth || 1, h = window.innerHeight || 1;
    targetX = (e.clientX / w) - 0.5;
    targetY = (e.clientY / h) - 0.5;
    if (!rafId && !paused) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    rafId = null;
    curX += (targetX - curX) * EASE;
    curY += (targetY - curY) * EASE;
    for (var i = 0; i < layerEls.length; i++) {
      var p = parseFloat(layerEls[i].dataset.parallax) || 0;
      // Mid-layer also gets a tiny vertical drift independent of mouse
      layerEls[i].style.setProperty('--px', (-curX * p).toFixed(2) + 'px');
      layerEls[i].style.setProperty('--py', (-curY * p).toFixed(2) + 'px');
    }
    if (Math.abs(targetX - curX) > 0.0005 || Math.abs(targetY - curY) > 0.0005) {
      rafId = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('mousemove', onMove, { passive: true });

  // Pause when tab is hidden (perf) — also cancel any in-flight rAF.
  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
    if (paused && rafId) { cancelAnimationFrame(rafId); rafId = null; }
  });
})();
