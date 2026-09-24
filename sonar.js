/**
 * SonarGrid — a decorative dot field that answers taps with expanding rings.
 * Vanilla JavaScript port.
 */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('sonar-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Configuration (equivalent to props in React)
  const opts = {
    spacing: 26,
    dotRadius: 1.4,
    baseOpacity: 0.28,
    pingEvery: 2.4,
    speed: 260,
    ringWidth: 90,
    amplitude: 2.2,
    interactive: true,
    maxRings: 6,
    seedPing: true,
    pingArea: [0.22, 0.18, 0.78, 0.82]
  };

  const MAX_DPR = 2;
  const TAU = Math.PI * 2;

  let width = 0;
  let height = 0;
  let raf = 0;
  let timer = 0;
  let visible = true;
  let seeded = false;
  let stroke = "#6366f1"; // Indigo 500
  let nextPing = performance.now() + opts.pingEvery * 1000;
  let rings = [];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const addRing = (x, y, born) => {
    rings.push({ x, y, born });
    while (rings.length > opts.maxRings) rings.shift();
  };

  const draw = (now) => {
    const lifetime = (Math.hypot(width, height) + opts.ringWidth) / opts.speed;
    rings = rings.filter((r) => (now - r.born) / 1000 < lifetime);
    
    const live = rings.map((r) => {
      const age = (now - r.born) / 1000;
      const radius = age * opts.speed;
      return { x: r.x, y: r.y, radius, reach: radius + opts.ringWidth, fade: 1 - age / lifetime };
    });

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = stroke;

    const cols = Math.ceil(width / opts.spacing) + 1;
    const rows = Math.ceil(height / opts.spacing) + 1;
    const offsetX = (width - (cols - 1) * opts.spacing) / 2;
    const offsetY = (height - (rows - 1) * opts.spacing) / 2;

    const hot = [];
    ctx.globalAlpha = opts.baseOpacity;
    ctx.beginPath();
    
    for (let i = 0; i < cols; i++) {
      const cx = offsetX + i * opts.spacing;
      for (let j = 0; j < rows; j++) {
        const cy = offsetY + j * opts.spacing;
        let energy = 0;
        for (const r of live) {
          if (Math.abs(cx - r.x) > r.reach || Math.abs(cy - r.y) > r.reach) continue;
          const dist = Math.abs(Math.hypot(cx - r.x, cy - r.y) - r.radius);
          if (dist >= opts.ringWidth) continue;
          const t = 1 - dist / opts.ringWidth;
          const k = t * t * (3 - 2 * t) * r.fade;
          if (k > energy) energy = k;
        }
        
        if (energy < 0.01) {
          ctx.moveTo(cx + opts.dotRadius, cy);
          ctx.arc(cx, cy, opts.dotRadius, 0, TAU);
        } else {
          hot.push(cx, cy, energy);
        }
      }
    }
    ctx.fill();

    for (let k = 0; k < hot.length; k += 3) {
      const energy = hot[k + 2] || 0;
      ctx.globalAlpha = opts.baseOpacity + (1 - opts.baseOpacity) * energy;
      ctx.beginPath();
      ctx.arc(hot[k] || 0, hot[k + 1] || 0, opts.dotRadius * (1 + opts.amplitude * energy), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const resize = () => {
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    if (!seeded) {
      seeded = true;
      const [x0, y0, x1, y1] = opts.pingArea;
      if (opts.seedPing && !reduceMotion.matches) {
        addRing(width * (x0 + (x1 - x0) * 0.68), height * (y0 + (y1 - y0) * 0.34), performance.now() - 500);
      }
    }
    draw(performance.now());
  };

  const scheduleIdle = (delay) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => tick(performance.now()), Math.max(16, delay));
  };

  const tick = (now) => {
    raf = 0;
    if (!visible || document.hidden) return;
    
    if (reduceMotion.matches) {
      rings = [];
      draw(now);
      return;
    }
    
    if (opts.pingEvery > 0 && now >= nextPing) {
      const [x0, y0, x1, y1] = opts.pingArea;
      addRing(width * (x0 + Math.random() * (x1 - x0)), height * (y0 + Math.random() * (y1 - y0)), now);
      nextPing = now + opts.pingEvery * 1000;
    }
    
    draw(now);
    
    if (rings.length > 0) {
      raf = requestAnimationFrame(tick);
    } else if (opts.pingEvery > 0) {
      scheduleIdle(nextPing - now);
    }
  };

  const wake = () => {
    if (!raf) {
      window.clearTimeout(timer);
      raf = requestAnimationFrame(tick);
    }
  };

  const onDown = (e) => {
    if (!opts.interactive || reduceMotion.matches) return;
    const rect = canvas.getBoundingClientRect();
    addRing(e.clientX - rect.left, e.clientY - rect.top, performance.now());
    wake();
  };

  const onVisibility = () => {
    if (!document.hidden) wake();
  };

  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) wake();
    },
    { threshold: 0 }
  );

  resize();
  ro.observe(canvas.parentElement);
  io.observe(canvas.parentElement);
  
  canvas.addEventListener("pointerdown", onDown);
  document.addEventListener("visibilitychange", onVisibility);
  reduceMotion.addEventListener("change", wake);
  
  wake();
});
