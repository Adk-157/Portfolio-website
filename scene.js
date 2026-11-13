// Particle scene: one cloud of points, fixed behind the page, that reshapes
// itself into a different object for each section as you scroll.
// Plain WebGL, no libraries.

(function () {
  const canvas = document.getElementById('scene');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) { document.documentElement.classList.add('no-webgl'); return; }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 900px)');
  const N = small.matches ? 14000 : 26000;

  /* ---------- helpers ---------- */
  function rng(seed) {                       // mulberry32
    let a = seed >>> 0;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const SILK = [0.95, 0.94, 0.90], GOLD = [0.93, 0.76, 0.36], HOT = [1.0, 0.55, 0.22],
        GREEN = [0.40, 0.80, 0.62], DIM = [0.50, 0.66, 0.59], RED = [1.0, 0.36, 0.30];

  // A shape is built by calling put(x, y, z, colour) exactly N times.
  function build(seed, fill) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const r = rng(seed);
    const g = () => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * r()); };
    let i = 0;
    const put = (x, y, z, c, k) => {
      if (i >= N) return;
      k = k === undefined ? 1 : k;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = c[0] * k; col[i * 3 + 1] = c[1] * k; col[i * 3 + 2] = c[2] * k; i++;
    };
    fill(put, r, g, n => Math.floor(N * n));
    while (i < N) put(g() * 0.02, g() * 0.02, g() * 0.02, DIM);
    // shuffle so every morph is a scatter, not a slide
    for (let a = N - 1; a > 0; a--) {
      const b = Math.floor(r() * (a + 1));
      for (let k = 0; k < 3; k++) {
        let t = pos[a * 3 + k]; pos[a * 3 + k] = pos[b * 3 + k]; pos[b * 3 + k] = t;
        t = col[a * 3 + k]; col[a * 3 + k] = col[b * 3 + k]; col[b * 3 + k] = t;
      }
    }
    return { pos, col };
  }

  /* ---------- shapes ---------- */
  const SHAPES = {
    // Quad flat package lying in the XZ plane, with pins and fan-out traces.
    chip: { axis: 0, tilt: 0.85, angle: t => t * 0.22, make: () => build(11, (put, r, g, n) => {
      const B = 0.52, H = 0.06, PINS = 14;
      for (let k = n(0.30); k--;) {
        const x = Math.round((r() * 2 - 1) * B / 0.026) * 0.026, z = Math.round((r() * 2 - 1) * B / 0.026) * 0.026;
        const die = Math.abs(x) < 0.2 && Math.abs(z) < 0.2;
        put(x, H, z, die ? GOLD : DIM, die ? 0.9 : 0.75);
      }
      for (let k = n(0.08); k--;) {
        const s = (r() * 2 - 1) * B, y = (r() * 2 - 1) * H, e = Math.floor(r() * 4);
        put(e === 0 ? s : e === 1 ? s : e === 2 ? B : -B, y, e === 0 ? B : e === 1 ? -B : s, SILK, 0.8);
      }
      const side = (e, along, out, y) => e === 0 ? [along, y, out] : e === 1 ? [along, y, -out] : e === 2 ? [out, y, along] : [-out, y, along];
      for (let k = n(0.26); k--;) {
        const e = Math.floor(r() * 4), p = Math.floor(r() * PINS), u = r();
        const along = -0.45 + p * 0.9 / (PINS - 1) + g() * 0.006;
        const y = H * 0.4 - u * u * (H * 1.4);
        put(...side(e, along, B + u * 0.17, y), GOLD);
      }
      for (let k = n(0.36); k--;) {
        const e = Math.floor(r() * 4), p = Math.floor(r() * PINS), u = r();
        const base = -0.45 + p * 0.9 / (PINS - 1);
        const jog = Math.max(0, u - 0.25) * (p - (PINS - 1) / 2) * 0.11;
        const pulse = Math.abs(u - ((p * 0.37 + e * 0.21) % 1)) < 0.04;
        put(...side(e, base + jog, B + 0.17 + u * 0.75, -H), pulse ? HOT : GREEN, pulse ? 1 : 0.8 - u * 0.4);
      }
    }) },

    // Two-wheeler wheel in the XY plane, rolling.
    wheel: { axis: 1, tilt: 0.12, angle: t => -t * 0.7, make: () => build(23, (put, r, g, n) => {
      for (let k = n(0.42); k--;) {
        const a = r() * 6.2832, b = r() * 6.2832, R = 0.8, rr = 0.1;
        const tread = Math.floor(a * 28 / 6.2832) % 2 === 0;
        put((R + rr * Math.cos(b)) * Math.cos(a), (R + rr * Math.cos(b)) * Math.sin(a), rr * 1.3 * Math.sin(b), tread ? SILK : DIM, tread ? 0.85 : 0.6);
      }
      for (let k = n(0.12); k--;) { const a = r() * 6.2832; put(0.64 * Math.cos(a), 0.64 * Math.sin(a), (r() - 0.5) * 0.1, GOLD); }
      for (let k = n(0.22); k--;) {
        const s = Math.floor(r() * 10), a = s * 0.62832, u = 0.1 + r() * 0.54, w = g() * 0.012;
        put(u * Math.cos(a) - w * Math.sin(a), u * Math.sin(a) + w * Math.cos(a), (s % 2 ? 0.035 : -0.035) * (1 - u), SILK, 0.9);
      }
      for (let k = n(0.12); k--;) {
        const a = r() * 6.2832, u = 0.27 + r() * 0.1;
        if (Math.floor(a * 18 / 6.2832) % 3 === 0 && u > 0.3 && u < 0.34) { put(u * Math.cos(a), u * Math.sin(a), 0.06, HOT); continue; }
        put(u * Math.cos(a), u * Math.sin(a), 0.06, DIM, 0.9);
      }
      for (let k = n(0.12); k--;) { const a = r() * 6.2832, u = Math.sqrt(r()) * 0.1; put(u * Math.cos(a), u * Math.sin(a), (r() - 0.5) * 0.16, GOLD); }
    }) },

    // Leaf with veins; scattered red points are the fluorescence.
    leaf: { axis: 0, tilt: 0.1, angle: t => Math.sin(t * 0.5) * 0.75, make: () => build(37, (put, r, g, n) => {
      const w = t => 0.46 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.9);
      const P = (x, t) => { const y = -0.95 + t * 1.9; return [x + 0.08 * Math.sin(t * 2.2), y, 0.5 * x * x - 0.12 * Math.sin(t * 3.1)]; };
      for (let k = n(0.50); k--;) {
        const t = r(), x = (r() * 2 - 1) * w(t);
        const glow = r() < 0.16;
        put(...P(x, t), glow ? RED : GREEN, glow ? 1 : 0.55 + r() * 0.3);
      }
      for (let k = n(0.14); k--;) { const t = r(), s = r() < 0.5 ? 1 : -1; put(...P(s * w(t), t), SILK, 0.85); }
      for (let k = n(0.10); k--;) { const t = -0.12 + r() * 1.12; put(...P(g() * 0.006, t), GOLD); }
      for (let k = n(0.26); k--;) {
        const v = Math.floor(r() * 9), t0 = 0.1 + v * 0.09, s = r() < 0.5 ? 1 : -1, u = r();
        const t = t0 + u * 0.16, x = s * u * w(t) * 0.96;
        put(...P(x, t), GOLD, 0.75 - u * 0.3);
      }
    }) },

    // A clean tone (gold ribbon) inside a cloud of noise.
    wave: { axis: 0, tilt: 0.25, angle: t => Math.sin(t * 0.3) * 0.5, make: () => build(41, (put, r, g, n) => {
      for (let k = n(0.42); k--;) { const x = (r() * 2 - 1) * 1.35; put(x, 0.3 * Math.sin(5 * x), (r() - 0.5) * 0.16, GOLD); }
      for (let k = n(0.58); k--;) { const x = (r() * 2 - 1) * 1.35; put(x, 0.3 * Math.sin(5 * x) + g() * 0.3, g() * 0.28, SILK, 0.35 + r() * 0.35); }
    }) },

    // Sensor nodes joined by radio links, with packets in flight.
    mesh: { axis: 0, tilt: 0.3, angle: t => t * 0.18, make: () => build(53, (put, r, g, n) => {
      const nodes = [];
      for (let i = 0; i < 11; i++) { const y = 1 - 2 * (i + 0.5) / 11, rad = Math.sqrt(1 - y * y), a = i * 2.39996; nodes.push([0.8 * rad * Math.cos(a), 0.8 * y, 0.8 * rad * Math.sin(a)]); }
      const links = [];
      nodes.forEach((a, i) => {
        nodes.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])]).filter(x => x[0] !== i).sort((p, q) => p[1] - q[1]).slice(0, 3)
          .forEach(([j]) => { if (!links.some(l => (l[0] === j && l[1] === i))) links.push([i, j]); });
      });
      for (let k = n(0.34); k--;) {
        const c = nodes[Math.floor(r() * nodes.length)], a = r() * 6.2832, z = r() * 2 - 1, s = Math.sqrt(1 - z * z) * 0.075;
        put(c[0] + s * Math.cos(a), c[1] + s * Math.sin(a), c[2] + z * 0.075, GOLD);
      }
      for (let k = n(0.66); k--;) {
        const l = links[Math.floor(r() * links.length)], a = nodes[l[0]], b = nodes[l[1]], u = r();
        const packet = Math.abs(u - ((l[0] * 0.31 + l[1] * 0.17) % 1)) < 0.035;
        const j = packet ? 0.02 : 0.004;
        put(a[0] + (b[0] - a[0]) * u + g() * j, a[1] + (b[1] - a[1]) * u + g() * j, a[2] + (b[2] - a[2]) * u + g() * j, packet ? HOT : SILK, packet ? 1 : 0.5);
      }
    }) },

    // Double helix: two strands and the rungs between them.
    helix: { axis: 0, tilt: 0.1, angle: t => t * 0.35, make: () => build(67, (put, r, g, n) => {
      for (let k = n(0.62); k--;) {
        const u = r(), a = u * 6.2832 * 2.6 + (r() < 0.5 ? 0 : Math.PI), gold = Math.cos(a - u * 6.2832 * 2.6) > 0;
        put(0.42 * Math.cos(a) + g() * 0.012, -1.15 + u * 2.3, 0.42 * Math.sin(a) + g() * 0.012, gold ? GOLD : SILK, 0.9);
      }
      for (let k = n(0.38); k--;) {
        const rung = Math.floor(r() * 30), u = rung / 29, a = u * 6.2832 * 2.6, s = r() * 2 - 1;
        put(0.42 * s * Math.cos(a), -1.15 + u * 2.3, 0.42 * s * Math.sin(a), DIM, 0.8);
      }
    }) },

    // Strands wound around a torus.
    vortex: { axis: 1, tilt: -0.95, angle: t => t * 0.12, make: () => build(79, (put, r, g, n) => {
      for (let k = N; k--;) {
        const s = Math.floor(r() * 80), u = r(), phi = u * 6.2832, th = s * 6.2832 / 80 + 0.9 * Math.sin(phi) + u * 0.5;
        const R = 0.66, rr = 0.33 + g() * 0.012, d = R + rr * Math.cos(phi);
        const tip = Math.cos(phi) > 0.55;
        put(d * Math.cos(th), d * Math.sin(th), rr * Math.sin(phi), tip ? HOT : (s % 3 ? SILK : GOLD), tip ? 1 : 0.55 + 0.35 * Math.cos(phi));
      }
    }) },
  };
  const cache = {};
  const shape = name => cache[name] || (cache[name] = SHAPES[name].make());

  /* ---------- GL program ---------- */
  const VS = `
    attribute vec3 aFrom, aTo, aCFrom, aCTo, aSeed;
    uniform float uT, uTime, uAngF, uAngT, uAxF, uAxT, uTiltX, uAspect, uScale, uAlpha, uPx;
    uniform vec2 uOff, uMouse, uLook;
    varying vec3 vCol; varying float vA;
    vec3 spin(vec3 p, float a, float ax) {
      float c = cos(a), s = sin(a);
      return ax > 0.5 ? vec3(c*p.x - s*p.y, s*p.x + c*p.y, p.z) : vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z);
    }
    void main() {
      float d = aSeed.x * 0.45;
      float tt = smoothstep(d, d + 0.55, uT);
      vec3 p = mix(spin(aFrom, uAngF, uAxF), spin(aTo, uAngT, uAxT), tt);
      float burst = sin(tt * 3.14159);
      p += normalize(aSeed - 0.5 + 0.001) * burst * 0.5;
      float sw = burst * (aSeed.y - 0.5) * 3.2, cs = cos(sw), sn = sin(sw);
      p.xy = vec2(cs*p.x - sn*p.y, sn*p.x + cs*p.y);
      p += 0.007 * vec3(sin(uTime*1.3 + aSeed.x*40.0), cos(uTime*1.1 + aSeed.y*40.0), sin(uTime*0.9 + aSeed.z*40.0));
      float ax = uTiltX + uLook.y, cx = cos(ax), sx = sin(ax);
      p = vec3(p.x, cx*p.y - sx*p.z, sx*p.y + cx*p.z);
      float cy = cos(uLook.x), sy = sin(uLook.x);
      p = vec3(cy*p.x + sy*p.z, p.y, -sy*p.x + cy*p.z);
      p *= uScale;
      float w = 3.2 - p.z;
      vec2 ndc = vec2(p.x / uAspect, p.y) * (1.92 / w) + uOff;
      vec2 dm = (ndc - uMouse) * vec2(uAspect, 1.0);
      float m = exp(-dot(dm, dm) / 0.025);
      ndc += normalize(dm + 0.0001) * m * 0.07 / vec2(uAspect, 1.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
      gl_PointSize = uPx * (0.65 + aSeed.z * 0.9) * (3.2 / w) * (1.0 + burst * 0.8 + m * 1.5);
      vCol = mix(aCFrom, aCTo, tt) * (1.0 + m * 0.8);
      vA = uAlpha * (0.5 + 0.5 * aSeed.y);
    }`;
  const FS = `
    precision mediump float;
    varying vec3 vCol; varying float vA;
    void main() {
      float r = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.15, r) * vA;
      gl_FragColor = vec4(vCol * a, a);
    }`;
  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn('Particle scene disabled:', e); document.documentElement.classList.add('no-webgl'); return; }
  gl.useProgram(prog);

  const U = {};
  ['uT', 'uTime', 'uAngF', 'uAngT', 'uAxF', 'uAxT', 'uTiltX', 'uAspect', 'uScale', 'uAlpha', 'uPx', 'uOff', 'uMouse', 'uLook']
    .forEach(n => (U[n] = gl.getUniformLocation(prog, n)));
  const buf = {};
  ['aFrom', 'aTo', 'aCFrom', 'aCTo', 'aSeed'].forEach(n => {
    buf[n] = gl.createBuffer();
    const loc = gl.getAttribLocation(prog, n);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf[n]);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  });
  const set = (n, data) => { gl.bindBuffer(gl.ARRAY_BUFFER, buf[n]); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); };
  { const r = rng(5), seeds = new Float32Array(N * 3); for (let i = 0; i < seeds.length; i++) seeds[i] = r(); set('aSeed', seeds); }
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  /* ---------- scenes come from the page: every [data-shape] element ---------- */
  const els = [...document.querySelectorAll('[data-shape]')].filter(e => SHAPES[e.dataset.shape]);
  if (!els.length) return;
  function place(el) {                       // where the object sits for this section
    const side = el.dataset.side || 'right';
    if (small.matches) {
      return el.dataset.hero !== undefined ? { x: 0, y: 0.44, s: 0.6, a: 1 } : { x: 0, y: 0, s: 0.85, a: 0.4 };
    }
    if (side === 'center') return { x: 0, y: 0, s: 1.5, a: parseFloat(el.dataset.alpha || '0.3') };
    return { x: side === 'left' ? -0.5 : 0.5, y: 0, s: 0.92, a: 1 };
  }

  let pair = -1;
  function load(i) {
    if (i === pair) return; pair = i;
    const a = shape(els[i].dataset.shape), b = shape(els[Math.min(i + 1, els.length - 1)].dataset.shape);
    set('aFrom', a.pos); set('aCFrom', a.col); set('aTo', b.pos); set('aCTo', b.col);
  }

  function progress() {
    const vh = window.innerHeight; let p = 0;
    for (let i = 1; i < els.length; i++) {
      const t = (0.92 * vh - els[i].getBoundingClientRect().top) / (0.62 * vh);
      p += Math.max(0, Math.min(1, t));
    }
    return p;
  }

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize); resize();

  const mouse = { x: 9, y: 9, lx: 0, ly: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', e => {
    mouse.x = (e.clientX / W) * 2 - 1; mouse.y = 1 - (e.clientY / H) * 2;
    mouse.tx = mouse.x * 0.35; mouse.ty = -mouse.y * 0.22;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { mouse.x = 9; mouse.y = 9; });

  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const t0 = performance.now();
  let shown = progress();

  function frame(now) {
    const time = reduced ? 0 : (now - t0) / 1000;
    const target = progress();
    shown = reduced ? target : shown + (target - shown) * 0.12;   // glide a little behind the scroll
    const i = Math.min(Math.floor(shown), els.length - 2 < 0 ? 0 : els.length - 2);
    const t = els.length > 1 ? Math.max(0, Math.min(1, shown - i)) : 0;
    load(i);
    const A = SHAPES[els[i].dataset.shape], B = SHAPES[els[Math.min(i + 1, els.length - 1)].dataset.shape];
    const pa = place(els[i]), pb = place(els[Math.min(i + 1, els.length - 1)]), e = ease(t);
    mouse.lx += (mouse.tx - mouse.lx) * 0.06; mouse.ly += (mouse.ty - mouse.ly) * 0.06;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uT, t); gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uAngF, A.angle(time)); gl.uniform1f(U.uAngT, B.angle(time));
    gl.uniform1f(U.uAxF, A.axis); gl.uniform1f(U.uAxT, B.axis);
    gl.uniform1f(U.uTiltX, lerp(A.tilt, B.tilt, e));
    gl.uniform1f(U.uAspect, W / H);
    gl.uniform1f(U.uScale, lerp(pa.s, pb.s, e) * Math.min(1, (W / H) / 1.1 + 0.25));
    gl.uniform1f(U.uAlpha, lerp(pa.a, pb.a, e));
    gl.uniform1f(U.uPx, (small.matches ? 2.0 : 2.3) * dpr * Math.max(1, Math.min(2.4, W / 1440)));
    gl.uniform2f(U.uOff, lerp(pa.x, pb.x, e), lerp(pa.y, pb.y, e));
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform2f(U.uLook, mouse.lx, mouse.ly);
    gl.drawArrays(gl.POINTS, 0, N);
    if (!document.hidden) requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });
  requestAnimationFrame(frame);
})();
