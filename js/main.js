gsap.registerPlugin(ScrollTrigger);

// ── SPARKLE CURSOR ────────────────────────────────────────────────────────────
const ring      = document.getElementById('cRing');
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function createSparkle(x, y) {
  const el = document.createElement('span');
  el.textContent = '✦';
  const size  = Math.random() * 9 + 5;
  const color = Math.random() > 0.45 ? '#f5f2ee' : '#3a52d4';
  el.style.cssText = [
    'position:fixed', `left:${x}px`, `top:${y}px`,
    'pointer-events:none', 'z-index:9997', `font-size:${size}px`,
    `color:${color}`, 'transform:translate(-50%,-50%)',
    'user-select:none', 'line-height:1', 'will-change:transform,opacity'
  ].join(';');
  document.body.appendChild(el);
  gsap.to(el, {
    y: -(Math.random() * 42 + 16), x: (Math.random() - 0.5) * 30,
    opacity: 0, scale: Math.random() * 0.5 + 0.15,
    rotation: (Math.random() - 0.5) * 160,
    duration: 0.5 + Math.random() * 0.4, ease: 'power2.out',
    onComplete: () => el.remove()
  });
}

if (isDesktop) {
  let lx = 0, ly = 0;
  document.addEventListener('mousemove', e => {
    gsap.to(ring, { x: e.clientX, y: e.clientY, duration: .55, ease: 'power2.out' });
    const dx = e.clientX - lx, dy = e.clientY - ly;
    if (dx * dx + dy * dy > 900) {
      createSparkle(e.clientX, e.clientY);
      lx = e.clientX; ly = e.clientY;
    }
  }, { passive: true });

  const hoverEls = document.querySelectorAll('a, button, .skill-row, .tool-pill, .proj-tile');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ── MAGNETIC BUTTONS ──────────────────────────────────────────────────────────
if (isDesktop) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * .28;
      const y = (e.clientY - r.top  - r.height / 2) * .28;
      gsap.to(btn, { x, y, duration: .4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.5)' });
    });
  });
}

// ── ABOUT PHOTO GLASS SHARDS ─────────────────────────────────────────────────
(function () {
  const section = document.getElementById('about');
  const photoEl = document.getElementById('photoOuter');
  const origImg = document.querySelector('.about-photo');
  if (!section || !photoEl || !origImg) return;

  function setup() {
    const secR   = section.getBoundingClientRect();
    const frameEl = photoEl.querySelector('.photo-frame') || photoEl;
    const frameR  = frameEl.getBoundingClientRect();
    const fw = frameR.width;
    const fh = frameR.height;
    if (fw < 10 || fh < 10) return;

    const fx = frameR.left - secR.left;
    const fy = frameR.top  - secR.top;
    const sW = secR.width;
    const sH = secR.height;

    // Bild ist 800×449 Landscape – cover in Portrait-Frame
    // bgH passt auf Frame-Höhe, bgW überragt seitlich (horizontaler Crop)
    const imgW    = origImg.naturalWidth  || fw;
    const imgH    = origImg.naturalHeight || fh;
    const cvScale = Math.max(fw / imgW, fh / imgH);
    const bgW     = Math.round(imgW * cvScale);
    const bgH     = Math.round(imgH * cvScale);
    const offX    = Math.round((fw - bgW) / 2);
    const offY    = 0;

    const COLS = 22, ROWS = 30;
    const sw = fw / COLS;
    const sh = fh / ROWS;

    const shards    = [];
    const shatterTo = [];

    section.style.overflow = 'hidden';

    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;z-index:5;pointer-events:none;';
    section.appendChild(layer);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el  = document.createElement('div');
        const sl  = Math.round(fx + c * sw);
        const st  = Math.round(fy + r * sh);
        const sr  = Math.round(fx + (c + 1) * sw);
        const sb  = Math.round(fy + (r + 1) * sh);
        const bgX = offX - (sl - Math.round(fx));
        const bgY = offY - (st - Math.round(fy));

        el.style.cssText = [
          'position:absolute',
          `left:${sl}px`, `top:${st}px`,
          `width:${sr - sl + 1}px`, `height:${sb - st + 1}px`,
          `background-image:url(${origImg.src})`,
          `background-size:${bgW}px ${bgH}px`,
          `background-position:${bgX}px ${bgY}px`,
          'will-change:transform,opacity',
        ].join(';');

        layer.appendChild(el);
        shards.push(el);

        const angle = Math.atan2(
          st + sh * .5 - (fy + fh * .5),
          sl + sw * .5 - (fx + fw * .5)
        );
        const thrust = 600 + Math.random() * 700;
        shatterTo.push({
          x:       Math.cos(angle) * thrust * (.6 + Math.random() * .8),
          y:       Math.sin(angle) * thrust * (.6 + Math.random() * .8),
          rotateZ: (Math.random() - .5) * 480,
          scale:   0,
        });
      }
    }

    const rng = (() => {
      let s = 0xdeadbeef;
      return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
    })();

    shards.forEach(el => {
      gsap.set(el, {
        x: (rng() - .5) * sW * .85, y: (rng() - .5) * sH * .6,
        rotateX: (rng() - .5) * 180, rotateY: (rng() - .5) * 180,
        rotateZ: (rng() - .5) * 90,
        scale: .05 + rng() * .15,
        opacity: 0, transformPerspective: 700,
      });
    });

    // Rahmen + Foto zunächst komplett unsichtbar
    gsap.set(photoEl, { opacity: 0 });
    gsap.set(origImg, { opacity: 0 });

    // ── Vollständige bidirektionale Scrub-Timeline ────────────────────────
    // t=0.00–1.05  Assembly: Partikel fliegen zusammen
    // t=1.05–1.35  Handoff rein: shards+foto gleichzeitig cross-fade (nahtlos)
    // t=1.36       layer hidden – foto sauber
    // t=1.36–2.70  Foto hält
    // t=2.70       layer visible
    // t=2.70–2.76  Handoff raus: sofort swap
    // t=2.76–3.60  Explosion

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   'top 100%',
        end:     'bottom 18%',
        scrub:   0.5,
      },
    });

    // Assembly
    tl.to(shards, {
      x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0,
      scale: 1, opacity: 1, transformPerspective: 700,
      duration: 1.05,
      stagger: { amount: 0.65, from: 'random', ease: 'none' },
      ease: 'none',
    }, 0);

    // Handoff rein: Foto blendet ein, shards mit Stagger raus
    tl.to(photoEl, { opacity: 1, duration: 0.3, ease: 'none' }, 1.05);
    tl.to(origImg, { opacity: 1, duration: 0.3, ease: 'none' }, 1.05);
    tl.to(shards,  { opacity: 0, duration: 0.22, ease: 'none',
      stagger: { amount: 0.22, from: 'random', ease: 'none' },
    }, 1.05);

    // Layer komplett ausblenden – kein Leak durch Rahmen-Ecken
    tl.set(layer, { visibility: 'hidden' }, 1.50);

    // Foto hält sauber
    tl.to(origImg, { opacity: 1, duration: 1.50, ease: 'none' }, 1.50);

    // Vor Explosion: layer sofort sichtbar, shards assembled, foto weg
    tl.set(layer,   { visibility: 'visible' }, 3.00);
    tl.set(photoEl, { opacity: 0 },            3.00);
    tl.set(origImg, { opacity: 0 },            3.00);
    tl.set(shards,  { opacity: 1 },            3.00);

    // Explosion – sofort und massiv
    tl.to(shards, {
      x: i => shatterTo[i].x,
      y: i => shatterTo[i].y,
      rotateZ: i => shatterTo[i].rotateZ,
      scale: 0, opacity: 0, transformPerspective: 700,
      duration: 0.84,
      stagger: { amount: 0.06, from: 'center', ease: 'none' },
      ease: 'none',
    }, 3.00);
  }

  function init() {
    if (origImg.naturalWidth > 0) {
      requestAnimationFrame(setup);
    } else {
      origImg.addEventListener('load', () => requestAnimationFrame(setup), { once: true });
    }
  }

  requestAnimationFrame(init);
}());

// ── WORKFLOW ROBOT MOUSE TRACKING ────────────────────────────────────────────
(function () {
  const eyeL    = document.getElementById('eyeL');
  const eyeR    = document.getElementById('eyeR');
  const head    = document.getElementById('robotHead');
  const robot   = document.getElementById('wfRobot');
  const wrap    = robot && robot.closest('.wf-robot-wrap');
  if (!eyeL || !eyeR || !head || !robot) return;

  // SVG eye centers
  const LC = { x: 148, y: 148 };
  const RC = { x: 252, y: 148 };
  const EYE_MAX = 8;
  const HEAD_ROT_X = 18; // max vertical tilt  deg
  const HEAD_ROT_Y = 22; // max horizontal turn deg

  // Current interpolated values
  let cur = { lx:0, ly:0, rx:0, ry:0, hx:0, hy:0 };
  let tgt = { lx:0, ly:0, rx:0, ry:0, hx:0, hy:0 };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  window.addEventListener('mousemove', e => {
    const rect = robot.getBoundingClientRect();
    if (!rect.width) return;

    // Normalised mouse position relative to robot center (-1 … +1)
    const nx = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2;
    const ny = ((e.clientY - rect.top)   / rect.height - 0.5) * 2;

    // Head rotation targets
    tgt.hx = clamp(ny * HEAD_ROT_X, -HEAD_ROT_X, HEAD_ROT_X);
    tgt.hy = clamp(nx * HEAD_ROT_Y, -HEAD_ROT_Y, HEAD_ROT_Y);

    // Eye pupil targets (SVG space)
    const scaleX = 400 / rect.width;
    const scaleY = 600 / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;

    const dir = (cx, cy) => {
      const dx = mx - cx, dy = my - cy;
      const d  = Math.sqrt(dx*dx + dy*dy) || 1;
      const f  = Math.min(d, EYE_MAX) / d;
      return { x: dx * f, y: dy * f };
    };
    const l = dir(LC.x, LC.y), r = dir(RC.x, RC.y);
    tgt.lx = l.x; tgt.ly = l.y;
    tgt.rx = r.x; tgt.ry = r.y;
  });

  // Smooth lerp render loop
  (function loop() {
    const t = 0.07;
    for (const k in cur) cur[k] += (tgt[k] - cur[k]) * t;

    // Head movement via SVG 2D transforms (reliable cross-browser)
    // hx = vertical tilt (up/down), hy = horizontal turn (left/right)
    const tx   =  cur.hy * 0.55;   // translate X
    const ty   =  cur.hx * 0.4;    // translate Y
    const skX  = -cur.hy * 0.35;   // skewX simulates perspective turn
    const skY  =  cur.hx * 0.18;   // skewY simulates tilt depth
    head.setAttribute('transform',
      `translate(${tx.toFixed(2)},${ty.toFixed(2)}) skewX(${skX.toFixed(2)}) skewY(${skY.toFixed(2)})`
    );

    // Eye pupils (relative to head – no offset needed, head group moves them)
    eyeL.setAttribute('transform', `translate(${cur.lx.toFixed(2)},${cur.ly.toFixed(2)})`);
    eyeR.setAttribute('transform', `translate(${cur.rx.toFixed(2)},${cur.ry.toFixed(2)})`);

    requestAnimationFrame(loop);
  })();

  // ── Wave – einmalig beim Sehen, rücksetzbar beim Verlassen ───────────────
  const armWave = document.getElementById('robotArmWave');
  if (armWave && wrap) {
    gsap.set(armWave, { svgOrigin: '75 275' });
    let wavePlaying = false;
    let waveComplete = false;

    function playWave() {
      if (wavePlaying || waveComplete) return;
      wavePlaying = true;
      gsap.timeline({ onComplete: () => { wavePlaying = false; waveComplete = true; } })
        // Arm hebt sich hoch – neben den Kopf
        .to(armWave, { rotation: -168, duration: 0.7, ease: 'power2.out' })
        // 2× links-rechts winken
        .to(armWave, { rotation: -148, duration: 0.28, ease: 'power1.inOut' })
        .to(armWave, { rotation: -172, duration: 0.28, ease: 'power1.inOut' })
        .to(armWave, { rotation: -148, duration: 0.28, ease: 'power1.inOut' })
        .to(armWave, { rotation: -172, duration: 0.28, ease: 'power1.inOut' })
        // Arm fällt sanft zurück in Ruheposition
        .to(armWave, { rotation: 0, duration: 0.8, ease: 'power2.inOut' });
    }

    function resetWave() {
      if (wavePlaying) return;
      gsap.killTweensOf(armWave);
      gsap.to(armWave, { rotation: 0, duration: 0.4, ease: 'power2.out' });
      waveComplete = false;
    }

    const waveObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setTimeout(playWave, 300); }
      else { resetWave(); }
    }, { threshold: 0.25 });
    waveObserver.observe(wrap);
  }

  // ── Hover interaction ──────────────────────────────────────────────────────
  if (wrap) {
    wrap.addEventListener('mouseenter', () => {
      wrap.classList.add('hovered');
      // Robot "notices" – eyes flash, body bounces up slightly
      gsap.to(robot, { y: -10, duration: 0.35, ease: 'back.out(2.5)' });
      gsap.to([eyeL, eyeR], {
        attr: { rx: 22, ry: 16 },
        duration: 0.2, ease: 'power2.out',
        yoyo: true, repeat: 1,
      });
    });

    wrap.addEventListener('mouseleave', () => {
      wrap.classList.remove('hovered');
      gsap.to(robot, { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      // Head returns to center
      tgt.hx = 0; tgt.hy = 0;
    });

    // Click – robot does a quick spin-nod
    wrap.addEventListener('click', () => {
      gsap.timeline()
        .to(robot, { rotateZ: -8, duration: 0.18, ease: 'power2.out' })
        .to(robot, { rotateZ:  8, duration: 0.18, ease: 'power2.inOut' })
        .to(robot, { rotateZ:  0, duration: 0.5,  ease: 'elastic.out(1, 0.4)' });
    });
  }
}());

// ── WORKFLOW SECTION ──────────────────────────────────────────────────────────
(function () {
  const blocks = document.querySelectorAll('.wf-block');
  if (!blocks.length) return;

  blocks.forEach(block => {
    const steps    = block.querySelectorAll('.wf-step');
    const lineFill = block.querySelector('.wf-line-fill');
    const total    = steps.length;

    // Ensure initial state is set by GSAP (not CSS alone) so scrub works correctly
    gsap.set(steps, { opacity: 0, y: 14 });
    gsap.set(lineFill, { width: '0%' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start:   'top 80%',
        end:     'top 22%',
        scrub:   0.5,
      },
    });

    // Line fills progressively across full timeline
    tl.to(lineFill, { width: '100%', ease: 'none', duration: 1 }, 0);

    // Steps appear one by one left to right
    steps.forEach((step, i) => {
      const t = i / (total - 1);
      tl.to(step, { opacity: 1, y: 0, ease: 'none', duration: 0.2 }, t * 0.78);
      tl.to(step.querySelector('.wf-node'), {
        borderColor: 'rgba(58,82,212,.85)',
        background:  'rgba(58,82,212,.2)',
        boxShadow:   '0 0 16px rgba(58,82,212,.6), 0 0 32px rgba(58,82,212,.25)',
        ease: 'none', duration: 0.14,
      }, t * 0.78);
    });
  });
}());

// ── HERO TITLE HOVER JUMP ─────────────────────────────────────────────────────
if (isDesktop) {
  document.querySelectorAll('.hero-title .lw').forEach(el => {
    el.style.cursor = 'default';
    el.addEventListener('mouseenter', () => gsap.to(el, { y: -10, duration: .28, ease: 'back.out(2.8)' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { y: 0,   duration: .7,  ease: 'elastic.out(1,.4)' }));
  });
}

// ── PRELOADER + HERO ENTRANCE ─────────────────────────────────────────────────
const intro = gsap.timeline({ onComplete: () => document.getElementById('preloader').remove() });
intro
  .to('.pl-top',    { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, .15)
  .to('.pl-bottom', { yPercent:  100, duration: 1.1, ease: 'power4.inOut' }, .15)
  .from('.li',      { yPercent: 112, stagger: .1, duration: 1.05, ease: 'power4.out' }, .6)
  .from('#heroBtns .btn', { opacity: 0, y: 14, stagger: .1, duration: .55, ease: 'power3.out' }, 1.08)
  .from('#heroScroll', { opacity: 0, duration: .5 }, 1.28);

// ── ABOUT VIDEO LOOP ──────────────────────────────────────────────────────────
const workVideo = document.getElementById('work-video');
if (workVideo) {
  workVideo.removeAttribute('loop');
  workVideo.addEventListener('ended', () => {
    setTimeout(() => { workVideo.currentTime = 0; workVideo.play(); }, 5000);
  });
}

// ── PROJECT REEL ──────────────────────────────────────────────────────────────
(function () {
  const reel    = document.querySelector('.proj-reel');
  const track   = document.querySelector('.proj-track');
  const prevBtn = document.querySelector('.reel-prev');
  const nextBtn = document.querySelector('.reel-next');
  if (!reel || !track) return;

  const AUTO   = -2.2;
  const TILE_W = 260 + 16; // tile width + gap

  // Defer loading until section is visible
  const reelVideos = Array.from(track.querySelectorAll('.proj-video'));
  reelVideos.forEach(v => { v.removeAttribute('autoplay'); v.preload = 'none'; });

  // DOM-reorder infinite loop: move off-screen tiles to the opposite end
  function reorder() {
    while (x <= -TILE_W) { track.appendChild(track.firstElementChild); x += TILE_W; }
    while (x > 0)        { track.insertBefore(track.lastElementChild, track.firstElementChild); x -= TILE_W; }
  }

  // Only run ticker + videos when #work is visible
  let reelActive = false;
  ScrollTrigger.create({
    trigger: '#work', start: 'top 85%',
    onEnter()     { reelActive = true;  reelVideos.forEach((v, i) => setTimeout(() => v.play().catch(() => {}), i * 120)); },
    onLeave()     { reelActive = false; reelVideos.forEach(v => v.pause()); },
    onEnterBack() { reelActive = true;  reelVideos.forEach(v => v.play().catch(() => {})); },
    onLeaveBack() { reelActive = false; reelVideos.forEach(v => v.pause()); },
  });

  let x = 0, velX = AUTO, targetV = AUTO;
  let dragging = false, isPaused = false;
  let ox = 0, ot = 0, prevClientX = 0, dragV = 0, dragDist = 0, dragAdj = 0;

  reel.style.cursor = 'grab';

  // Hover → pause auto-scroll
  reel.addEventListener('mouseover', e => { if (e.target.closest('.proj-tile')) isPaused = true; });
  reel.addEventListener('mouseout',  e => { if (e.target.closest('.proj-tile')) isPaused = false; });

  // Drag
  function onStart(cx) {
    dragging = true; dragDist = 0; dragAdj = 0;
    ox = cx; ot = x; prevClientX = cx; dragV = 0;
    reel.style.cursor = 'grabbing';
  }
  function onMove(cx) {
    if (!dragging) return;
    dragDist += Math.abs(cx - prevClientX);
    dragV = cx - prevClientX; prevClientX = cx;
    x = ot + dragAdj + (cx - ox);
    while (x <= -TILE_W) { track.appendChild(track.firstElementChild);          x += TILE_W; dragAdj += TILE_W; }
    while (x > 0)        { track.insertBefore(track.lastElementChild, track.firstElementChild); x -= TILE_W; dragAdj -= TILE_W; }
    gsap.set(track, { x });
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false; reel.style.cursor = 'grab';
    velX = dragV; targetV = AUTO;
  }

  reel.addEventListener('mousedown',   e => { onStart(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', e => onMove(e.clientX));
  window.addEventListener('mouseup',   ()  => onEnd());
  reel.addEventListener('touchstart',  e => onStart(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchmove', e => onMove(e.touches[0].clientX),  { passive: true });
  window.addEventListener('touchend',  ()  => onEnd());

  // Arrow buttons — delta-based so reorder stays in sync
  function jumpBy(px) {
    let applied = 0;
    const obj = { v: 0 };
    gsap.to(obj, { v: 1, duration: 0.55, ease: 'power2.out',
      onUpdate() {
        const delta = px * obj.v - applied; applied = px * obj.v;
        x += delta; reorder(); gsap.set(track, { x });
      }
    });
  }
  if (prevBtn) prevBtn.addEventListener('click', () => jumpBy( TILE_W * 3));
  if (nextBtn) nextBtn.addEventListener('click', () => jumpBy(-TILE_W * 3));

  // Ticker — skipped entirely when reel is off-screen
  gsap.ticker.add(() => {
    if (!reelActive || dragging || isPaused) return;
    targetV += (AUTO - targetV) * 0.035;
    velX    += (targetV - velX) * 0.18;
    x       += velX;
    reorder();
    gsap.set(track, { x });
  });

  // Modal
  const modal      = document.getElementById('videoModal');
  const modalVideo = modal?.querySelector('.v-modal-video');
  const modalClose = modal?.querySelector('.v-modal-close');
  const modalBg    = modal?.querySelector('.v-modal-bg');

  function openModal(src) {
    if (!modal || !modalVideo) return;
    modalVideo.src = src;
    modalVideo.volume = 1;
    modalVideo.muted = false;
    modalVideo.load();
    // Start muted to satisfy autoplay policy, then immediately unmute
    modalVideo.muted = true;
    const playPromise = modalVideo.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        modalVideo.muted = false;
        modalVideo.volume = 1;
      }).catch(() => {});
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalVideo.pause(); modalVideo.src = '';
    document.body.style.overflow = '';
  }

  modalClose?.addEventListener('click', closeModal);
  modalBg?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  reel.addEventListener('click', e => {
    if (dragDist > 6) return;
    const tile = e.target.closest('.proj-tile');
    if (!tile) return;
    const src = tile.querySelector('source')?.src;
    if (src) openModal(src);
  });
}());

// ── SECTION REVEAL ────────────────────────────────────────────────────────────
gsap.utils.toArray('section:not(#hero), .marquee-wrap').forEach(section => {
  gsap.from(section, {
    y: 40, opacity: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: section, start: 'top 92%', once: true }
  });
});

// ── SCROLL REVEALS ────────────────────────────────────────────────────────────
gsap.utils.toArray('.gs-r').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 87%', once: true },
    opacity: 0, y: 22, duration: .75, ease: 'power3.out'
  });
});

gsap.utils.toArray('.ti').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    yPercent: 112, duration: .9, ease: 'power4.out'
  });
});

gsap.utils.toArray('.gs-sk').forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 93%', once: true },
    opacity: 0, x: -16, duration: .55, ease: 'power3.out', delay: i * .04
  });
});

gsap.utils.toArray('.gs-tool').forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 93%', once: true },
    opacity: 0, y: 12, scale: .9, duration: .4, ease: 'back.out(1.5)', delay: i * .03
  });
});

// ── ABOUT PHOTO 3D TILT ───────────────────────────────────────────────────────
(function () {
  const card = document.getElementById('photoOuter');
  if (!card) return;

  const MAX_ROT = 18;
  let raf = null;
  let targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    currentRX = lerp(currentRX, targetRX, 0.1);
    currentRY = lerp(currentRY, targetRY, 0.1);
    card.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale3d(1.04,1.04,1.04)`;
    card.style.boxShadow = `
      ${-currentRY * 1.2}px ${currentRX * 1.2}px 40px rgba(58,82,212,.55),
      0 0 80px rgba(58,82,212,.2)
    `;
    raf = requestAnimationFrame(tick);
  }

  card.addEventListener('mouseenter', () => {
    card.classList.add('tilt-active');
    raf = requestAnimationFrame(tick);
  });

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 … 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    targetRY =  nx * MAX_ROT * 2;
    targetRX = -ny * MAX_ROT * 2;
    // gloss highlight position
    card.style.setProperty('--mx', `${(nx + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(ny + 0.5) * 100}%`);
  });

  card.addEventListener('mouseleave', () => {
    card.classList.remove('tilt-active');
    targetRX = 0;
    targetRY = 0;
    setTimeout(() => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
      card.style.boxShadow = '';
      currentRX = 0;
      currentRY = 0;
    }, 600);
  });
}());

// ── CONTACT LIQUID SHADER ─────────────────────────────────────────────────────
(function () {
  const scene = document.getElementById('ctScene');
  if (!scene) return;

  function init() {
    const canvas = document.createElement('canvas');
    scene.appendChild(canvas);
    canvas.width  = scene.offsetWidth  || 520;
    canvas.height = scene.offsetHeight || 480;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W * 0.5, cy = H * 0.5;
    const R  = Math.min(W, H) * 0.38;
    // 7 arms × 2 points = 14 — alternating tip (far) / valley (close)
    const ARMS = 7;
    const N    = ARMS * 2;

    const pts = Array.from({ length: N }, (_, i) => {
      const isTip = i % 2 === 0;
      return {
        baseA : (i / N) * Math.PI * 2,
        baseR : isTip ? 1.25 : 0.52,          // arms reach far, valleys pull in
        rAmp  : isTip ? 0.18 : 0.10,
        rFreq : 0.22 + Math.random() * 0.38,
        aAmp  : isTip ? 0.10 : 0.06,
        aFreq : 0.18 + Math.random() * 0.28,
        phase : Math.random() * Math.PI * 2,
      };
    });

    let mx = W / 2, my = H / 2, mActive = false;

    scene.addEventListener('mousemove', e => {
      const r = scene.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      mActive = true;
    });
    scene.addEventListener('mouseleave', () => { mActive = false; });

    function getControlPts(t) {
      return pts.map(p => {
        const a = p.baseA + Math.sin(t * p.aFreq + p.phase) * p.aAmp;
        const r = R * (1 + Math.sin(t * p.rFreq + p.phase) * p.rAmp);
        let x = cx + Math.cos(a) * r;
        let y = cy + Math.sin(a) * r * 0.82; // slightly flat vertically

        // Magnetic pull toward mouse – stronger on arm tips
        if (mActive) {
          const mdx = mx - cx, mdy = my - cy;
          const mAngle = Math.atan2(mdy, mdx);
          const diff = a - mAngle;
          const pull = p.baseR > 1.0 ? 0.38 : 0.15;
          const w = Math.exp(-(diff * diff) * 2.0) * pull;
          x += mdx * w;
          y += mdy * w;
        }
        return [x, y];
      });
    }

    function drawShape(points) {
      const n = points.length;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const p0 = points[(i - 1 + n) % n];
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        const p3 = points[(i + 2) % n];
        if (i === 0) ctx.moveTo(p1[0], p1[1]);
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
      }
      ctx.closePath();
    }

    const start = performance.now();
    (function frame() {
      requestAnimationFrame(frame);
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, W, H);

      const pts2 = getControlPts(t);

      // ── Base: very dark chrome fill ──────────────────────────────────
      drawShape(pts2);
      const angle = t * 0.10;
      const gx1 = cx + Math.cos(angle) * R * 1.2, gy1 = cy + Math.sin(angle) * R * 1.2;
      const gx2 = cx - Math.cos(angle) * R * 1.2, gy2 = cy - Math.sin(angle) * R * 1.2;
      const base = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      base.addColorStop(0.00, '#00010a');
      base.addColorStop(0.12, '#03081e');
      base.addColorStop(0.28, '#071535');
      base.addColorStop(0.42, '#1040a0');
      base.addColorStop(0.52, '#3a80e8');
      base.addColorStop(0.62, '#0d3080');
      base.addColorStop(0.78, '#04102a');
      base.addColorStop(1.00, '#000208');
      ctx.fillStyle = base;
      ctx.fill();

      // ── Rim light on arm tips (cyan-blue streak) ─────────────────────
      drawShape(pts2);
      ctx.save();
      ctx.clip();
      const rim = ctx.createLinearGradient(cx - R * 1.3, cy - R * 1.3, cx + R * 1.3, cy + R * 1.3);
      rim.addColorStop(0.00, 'rgba(0,180,255,0.00)');
      rim.addColorStop(0.35, 'rgba(0,160,255,0.00)');
      rim.addColorStop(0.50, 'rgba(80,200,255,0.18)');
      rim.addColorStop(0.65, 'rgba(0,140,220,0.04)');
      rim.addColorStop(1.00, 'rgba(0,80,180,0.00)');
      ctx.fillStyle = rim;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── Primary sharp specular ───────────────────────────────────────
      const h1x = cx - R * 0.18 + Math.sin(t * 0.31) * R * 0.14;
      const h1y = cy - R * 0.28 + Math.cos(t * 0.27) * R * 0.10;
      drawShape(pts2);
      ctx.save();
      ctx.clip();
      const spec1 = ctx.createRadialGradient(h1x, h1y, 0, h1x, h1y, R * 0.32);
      spec1.addColorStop(0.00, 'rgba(235, 245, 255, 0.92)');
      spec1.addColorStop(0.15, 'rgba(180, 220, 255, 0.60)');
      spec1.addColorStop(0.40, 'rgba(80, 150, 255, 0.18)');
      spec1.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = spec1;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── Secondary specular (arm) ─────────────────────────────────────
      const h2x = cx + R * 0.55 + Math.cos(t * 0.41) * R * 0.10;
      const h2y = cy - R * 0.10 + Math.sin(t * 0.37) * R * 0.08;
      drawShape(pts2);
      ctx.save();
      ctx.clip();
      const spec2 = ctx.createRadialGradient(h2x, h2y, 0, h2x, h2y, R * 0.20);
      spec2.addColorStop(0.00, 'rgba(200, 230, 255, 0.75)');
      spec2.addColorStop(0.40, 'rgba(60, 130, 255, 0.20)');
      spec2.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = spec2;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── Third tiny specular dot ──────────────────────────────────────
      const h3x = cx - R * 0.40 + Math.sin(t * 0.53) * R * 0.08;
      const h3y = cy + R * 0.38 + Math.cos(t * 0.46) * R * 0.07;
      drawShape(pts2);
      ctx.save();
      ctx.clip();
      const spec3 = ctx.createRadialGradient(h3x, h3y, 0, h3x, h3y, R * 0.14);
      spec3.addColorStop(0.00, 'rgba(210, 235, 255, 0.65)');
      spec3.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = spec3;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── Dark center depth ────────────────────────────────────────────
      drawShape(pts2);
      ctx.save();
      ctx.clip();
      const depth = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.75);
      depth.addColorStop(0, 'rgba(0,1,8,0.50)');
      depth.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = depth;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }());
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
}());

