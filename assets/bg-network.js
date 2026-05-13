/* ============================================
   ANIMATED NETWORK BACKGROUND — injector
   Self-contained: injects an SVG topology behind the page content.
   Zero deps. Idempotent. Inert (pointer-events: none, aria-hidden).
   ============================================ */

(function () {
  if (document.querySelector('.bg-network')) return;

  // Fixed viewBox 1600x900; SVG scales with preserveAspectRatio="xMidYMid slice"
  // to fully cover any viewport without distortion.
  // Nodes positioned asymmetrically for an "organic infrastructure" feel.
  var NODES = [
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
  ];

  // Edges: indices into NODES. Mixed near/far connections suggest topology.
  var EDGES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [1, 7], [3, 7], [3, 8], [4, 8], [5, 8],
    [2, 9], [0, 6], [6, 7], [7, 8]
  ];

  // A subset of edges gets the slow "scan" highlight running across them
  var SCAN_EDGES = [[1, 3], [2, 5], [7, 8], [0, 4]];

  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 1600 900');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  // Base lines
  EDGES.forEach(function (e) {
    var a = NODES[e[0]], b = NODES[e[1]];
    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('class', 'net-line');
    svg.appendChild(line);
  });

  // Scan-highlighted lines (drawn on top)
  SCAN_EDGES.forEach(function (e, i) {
    var a = NODES[e[0]], b = NODES[e[1]];
    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('class', 'net-line--scan s' + (i + 1));
    svg.appendChild(line);
  });

  // Halos (drawn before the solid node so the dot sits on top)
  NODES.forEach(function (n) {
    var halo = document.createElementNS(svgNS, 'circle');
    halo.setAttribute('cx', n.x); halo.setAttribute('cy', n.y);
    halo.setAttribute('r', n.r * 4);
    halo.setAttribute('class', 'net-node--halo ' + n.cls);
    svg.appendChild(halo);
  });

  // Solid nodes
  NODES.forEach(function (n) {
    var c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', n.x); c.setAttribute('cy', n.y);
    c.setAttribute('r', n.r);
    c.setAttribute('class', 'net-node ' + n.cls);
    svg.appendChild(c);
  });

  var wrap = document.createElement('div');
  wrap.className = 'bg-network';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.appendChild(svg);

  // Insert as the first child of <body> so it sits behind everything else
  if (document.body.firstChild) {
    document.body.insertBefore(wrap, document.body.firstChild);
  } else {
    document.body.appendChild(wrap);
  }
})();
