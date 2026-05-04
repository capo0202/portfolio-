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

// ── ABOUT PHOTO GLASS SHARDS – SCROLL SCRUB ──────────────────────────────────
(function () {
  const section  = document.getElementById('about');
  const photoEl  = document.getElementById('photoOuter'); // full element incl. border ring
  const origImg  = document.querySelector('.about-photo');
  if (!section || !photoEl || !origImg) return;

  function setup() {
    const secR   = section.getBoundingClientRect();
    const photoR = photoEl.getBoundingClientRect();
    const fw = photoR.width;
    const fh = photoR.height;
    if (fw < 10 || fh < 10) return; // hidden on mobile

    const fx = photoR.left - secR.left;
    const fy = photoR.top  - secR.top;
    const sW = secR.width;
    const sH = secR.height;

    // Replicate object-fit:cover for the inner photo-frame area (inset 3px border)
    const border  = 3;
    const frameW  = fw - border * 2;
    const frameH  = fh - border * 2;
    const imgW    = origImg.naturalWidth  || frameW;
    const imgH    = origImg.naturalHeight || frameH;
    const cvScale = Math.max(frameW / imgW, frameH / imgH);
    const bgW     = Math.round(imgW * cvScale);
    const bgH     = Math.round(imgH * cvScale);
    // Center offset within frame (negative = image overflows the frame edge)
    const offX    = Math.round((frameW - bgW) / 2);
    const offY    = Math.round((frameH - bgH) / 2);

    const COLS = 24, ROWS = 32;  // 768 micro-shards
    const sw   = fw / COLS;
    const sh   = fh / ROWS;

    const shards    = [];
    const shatterTo = [];

    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;z-index:5;pointer-events:none;';
    section.appendChild(layer);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = document.createElement('div');
        const sl = fx + c * sw;
        const st = fy + r * sh;

        // Fragment's top-left in photo-frame coords (inner image area)
        // = position in photo-outer minus the border inset
        // Background position = where the image starts relative to THIS fragment
        const bgX = offX - (c * sw - border);
        const bgY = offY - (r * sh - border);

        el.style.cssText = [
          'position:absolute',
          `left:${sl}px`,
          `top:${st}px`,
          `width:${sw + 0.8}px`,
          `height:${sh + 0.8}px`,
          `background-image:url(${origImg.src})`,
          `background-size:${bgW}px ${bgH}px`,
          `background-position:${bgX}px ${bgY}px`,
          'will-change:transform,opacity',
        ].join(';');

        layer.appendChild(el);
        shards.push(el);

        // Radial shatter from photo center
        const angle  = Math.atan2(
          st + sh * 0.5 - (fy + fh * 0.5),
          sl + sw * 0.5 - (fx + fw * 0.5)
        );
        const thrust = 220 + Math.random() * 360;
        shatterTo.push({
          x:       Math.cos(angle) * thrust * (0.65 + Math.random() * 0.7),
          y:       Math.sin(angle) * thrust * (0.65 + Math.random() * 0.7),
          rotateX: (Math.random() - 0.5) * 300,
          rotateY: (Math.random() - 0.5) * 300,
          rotateZ: (Math.random() - 0.5) * 140,
          scale:   0.07 + Math.random() * 0.15,
        });
      }
    }

    // Deterministic scatter so pattern is identical on every page load
    const rng = (() => {
      let s = 0xdeadbeef;
      return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
    })();

    shards.forEach(el => {
      gsap.set(el, {
        x:          (rng() - 0.5) * sW * 0.82,
        y:          (rng() - 0.5) * sH * 0.58,
        rotateX:    (rng() - 0.5) * 200,
        rotateY:    (rng() - 0.5) * 200,
        rotateZ:    (rng() - 0.5) * 90,
        scale:      0.06 + rng() * 0.18,
        opacity:    0,
        transformPerspective: 700,
      });
    });

    origImg.style.opacity = '0';

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   'top 55%',
        end:     'bottom 25%',
        scrub:   1.4,
      },
    });

    // Phase 1 (60 % of scroll range): scattered → assembled
    tl.to(shards, {
      x: 0, y: 0,
      rotateX: 0, rotateY: 0, rotateZ: 0,
      scale: 1, opacity: 1,
      transformPerspective: 700,
      duration: 0.6,
      stagger: { amount: 0.45, from: 'random', ease: 'none' },
      ease: 'none',
    });

    // Phase 2 (35 % after 5 % hold): assembled → shatter outward
    tl.to(shards, {
      x:       i => shatterTo[i].x,
      y:       i => shatterTo[i].y,
      rotateX: i => shatterTo[i].rotateX,
      rotateY: i => shatterTo[i].rotateY,
      rotateZ: i => shatterTo[i].rotateZ,
      scale:   i => shatterTo[i].scale,
      opacity: 0,
      transformPerspective: 700,
      duration: 0.35,
      stagger: { amount: 0.22, from: 'center', ease: 'none' },
      ease: 'none',
    }, '>0.05');
  }

  // Wait for image natural dimensions, then settle layout one frame
  function init() {
    if (origImg.naturalWidth > 0) {
      requestAnimationFrame(setup);
    } else {
      origImg.addEventListener('load', () => requestAnimationFrame(setup), { once: true });
    }
  }

  requestAnimationFrame(init);
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
    modalVideo.src = src; modalVideo.load(); modalVideo.play();
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
