// Portfolio interactions:
//  1. highlight the current section in the top bar
//  2. load and scroll motion (name letters, reveals)
//  3. the lock-in amplifier demo
// The particle scene behind the page lives in scene.js.

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMotion();
  initScope();
});

/* ---------- Load and scroll motion ---------- */
function initMotion() {
  // Split the name into letters so they can rise in one by one.
  document.querySelectorAll('.split').forEach(el => {
    const text = el.textContent; el.textContent = ''; el.setAttribute('aria-label', text);
    let i = 0;
    text.split(' ').forEach((word, w, all) => {
      const span = document.createElement('span'); span.style.whiteSpace = 'nowrap'; span.setAttribute('aria-hidden', 'true');
      [...word].forEach(c => { const ch = document.createElement('span'); ch.className = 'ch'; ch.style.setProperty('--i', i++); ch.textContent = c; span.appendChild(ch); });
      el.appendChild(span);
      if (w < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  // Reveal blocks as they scroll in, staggered within each column.
  const items = [...document.querySelectorAll('.rv')];
  if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, k) => { e.target.style.setProperty('--d', k); e.target.classList.add('in'); io.unobserve(e.target); });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
}

/* ---------- Section highlight ---------- */
function initNav() {
  const links = [...document.querySelectorAll('.top-links a')];
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const sections = [...byId.keys()].map(id => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;

  const visible = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
    const current = sections.find(s => visible.has(s.id));
    links.forEach(a => a.removeAttribute('aria-current'));
    if (current) byId.get(current.id).setAttribute('aria-current', 'true');
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s));
}

/* ---------- Lock-in amplifier demo ----------
   Input:  x[n] = A sin(2 pi f n / fs) + noise
   Lock-in: mix x with sin and cos references, low-pass each (two cascaded
   one-pole filters), then R = 2 * sqrt(I^2 + Q^2) estimates A.            */
function initScope() {
  const cIn = document.getElementById('plot-in');
  const cOut = document.getElementById('plot-out');
  if (!cIn || !cOut) return;

  const noiseEl = document.getElementById('noise');
  const tauEl = document.getElementById('tau');
  const tauOut = document.getElementById('tau-out');
  const rSnr = document.getElementById('r-snr');
  const rAmp = document.getElementById('r-amp');
  const rErr = document.getElementById('r-err');

  const FS = 2000, F = 50, A = 0.5;
  const STEPS_PER_FRAME = 33;          // roughly real time at 60 fps
  const IN_LEN = 400;                  // 10 cycles on screen
  const OUT_LEN = 360;                 // about 6 s of history
  const W = 2 * Math.PI * F / FS;
  const css = getComputedStyle(document.documentElement);
  const GOLD = css.getPropertyValue('--gold').trim() || '#e3bb5c';
  const SILK = css.getPropertyValue('--silk').trim() || '#f3f1e7';
  const DIM = css.getPropertyValue('--silk-dim').trim() || '#bdd0c6';
  const GRID = '#154534';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let sigma, alpha, n, i1, i2, q1, q2, R, yRange;
  const inBuf = new Float32Array(IN_LEN);
  const cleanBuf = new Float32Array(IN_LEN);
  const outBuf = new Float32Array(OUT_LEN);
  let inPos = 0, outPos = 0, outCount = 0, frame = 0;

  function tauSeconds() {              // slider 0..100 -> 0.03 s .. 3 s, log scale
    return 0.03 * Math.pow(100, tauEl.value / 100);
  }
  function readControls() {
    sigma = parseFloat(noiseEl.value);
    const tau = tauSeconds();
    alpha = 1 - Math.exp(-1 / (FS * tau));
    tauOut.textContent = tau.toFixed(2) + ' s';
  }
  function reset() {
    n = 0; i1 = i2 = q1 = q2 = 0; R = 0;
    inPos = outPos = outCount = 0;
    inBuf.fill(0); cleanBuf.fill(0); outBuf.fill(0);
    yRange = Math.max(1, 3 * sigma + 0.5);
  }
  function gauss() {
    let u = 0; while (u === 0) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
  }
  function step(count) {
    for (let k = 0; k < count; k++) {
      const ph = W * n++;
      const s = Math.sin(ph), c = Math.cos(ph);
      const clean = A * s;
      const x = clean + sigma * gauss();
      i1 += alpha * (x * s - i1); i2 += alpha * (i1 - i2);
      q1 += alpha * (x * c - q1); q2 += alpha * (q1 - q2);
      inBuf[inPos] = x; cleanBuf[inPos] = clean; inPos = (inPos + 1) % IN_LEN;
    }
    R = 2 * Math.hypot(i2, q2);
    outBuf[outPos] = R; outPos = (outPos + 1) % OUT_LEN;
    if (outCount < OUT_LEN) outCount++;
  }

  function fit(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }
  function grid(ctx, w, h) {
    ctx.strokeStyle = GRID; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 10; i++) { const x = Math.round(w * i / 10) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let i = 1; i < 4; i++) { const y = Math.round(h * i / 4) + 0.5; ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
  }
  function trace(ctx, buf, start, len, count, w, toY, color, width) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const v = buf[(start + i) % len];
      const x = (i / (len - 1)) * w, y = toY(v);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }

  function draw() {
    // input
    const target = Math.max(1, 3 * sigma + 0.5);
    yRange += (target - yRange) * 0.15;
    let { ctx, w, h } = fit(cIn);
    grid(ctx, w, h);
    const yIn = v => h / 2 - (Math.max(-yRange, Math.min(yRange, v)) / yRange) * (h / 2 - 4);
    trace(ctx, inBuf, inPos, IN_LEN, IN_LEN, w, yIn, SILK, 1);
    trace(ctx, cleanBuf, inPos, IN_LEN, IN_LEN, w, yIn, GOLD, 2);

    // output
    ({ ctx, w, h } = fit(cOut));
    grid(ctx, w, h);
    const yOut = v => h - 6 - (Math.max(0, Math.min(1, v))) * (h - 12);
    ctx.strokeStyle = DIM; ctx.lineWidth = 1; ctx.setLineDash([6, 5]); ctx.beginPath();
    ctx.moveTo(0, yOut(A)); ctx.lineTo(w, yOut(A)); ctx.stroke(); ctx.setLineDash([]);
    const start = outCount < OUT_LEN ? 0 : outPos;
    trace(ctx, outBuf, start, OUT_LEN, outCount, w, yOut, GOLD, 2.5);
  }

  function readouts() {
    rSnr.textContent = sigma === 0 ? 'no noise'
      : (10 * Math.log10((A * A / 2) / (sigma * sigma))).toFixed(1).replace('-', '−') + ' dB';
    rAmp.textContent = R.toFixed(3);
    rErr.textContent = (Math.abs(R - A) / A * 100).toFixed(1) + '%';
  }

  function renderStatic() {            // reduced motion: simulate 6 s, draw once
    reset();
    for (let i = 0; i < OUT_LEN; i++) step(STEPS_PER_FRAME);
    yRange = Math.max(1, 3 * sigma + 0.5);
    draw(); readouts();
  }

  let running = false, onScreen = true;
  function loop() {
    if (!running) return;
    step(STEPS_PER_FRAME);
    draw();
    if (frame++ % 8 === 0) readouts();
    requestAnimationFrame(loop);
  }
  function setRunning(want) {
    if (reduced) return;
    if (want && !running) { running = true; requestAnimationFrame(loop); }
    else if (!want) running = false;
  }

  noiseEl.addEventListener('input', () => { readControls(); if (reduced) renderStatic(); });
  tauEl.addEventListener('input', () => { readControls(); if (reduced) renderStatic(); });
  window.addEventListener('resize', () => { if (reduced || !running) draw(); });
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden && onScreen));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; setRunning(onScreen && !document.hidden); })
      .observe(cIn.closest('.scope'));
  }

  readControls();
  reset();
  if (reduced) renderStatic(); else setRunning(true);
}
