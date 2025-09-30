// Portfolio interactions: mobile menu, active link highlighting, smooth scroll, year
(function () {
  // Theme setup
  const root = document.documentElement;
  const THEME_KEY = 'theme-preference';
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)');
  const getStoredTheme = () => localStorage.getItem(THEME_KEY);
  const setStoredTheme = (t) => localStorage.setItem(THEME_KEY, t);
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = t === 'light' ? '☾' : '☀';
    // Notify particles to refresh colors
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: t } }));
  };
  const initTheme = () => {
    const saved = getStoredTheme();
    const theme = saved || (prefersLight.matches ? 'light' : 'dark');
    applyTheme(theme);
  };
  initTheme();
  prefersLight.addEventListener?.('change', (e) => {
    if (!getStoredTheme()) applyTheme(e.matches ? 'light' : 'dark');
  });

  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setStoredTheme(next);
  });
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.nav__menu');
  const links = document.querySelectorAll('.nav__link');

  // Mobile menu toggle
  toggle?.addEventListener('click', () => {
    const isOpen = menu?.classList.toggle('open');
    if (toggle) toggle.setAttribute('aria-expanded', String(!!isOpen));
  });

  // Close on link click (mobile)
  links.forEach((a) => a.addEventListener('click', () => menu?.classList.remove('open')));

  // Back to top button functionality
  const toTopBtn = document.querySelector('.to-top');
  toTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Smooth scroll for internal links
  links.forEach((a) => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    }
  }));

  // Active link highlighting using IntersectionObserver
  const sections = document.querySelectorAll('main[id], section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute('id');
      const navLink = document.querySelector(`.nav__link[href="#${id}"]`);
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav__link.active').forEach((n) => n.classList.remove('active'));
        navLink?.classList.add('active');
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0.01 });

  sections.forEach((sec) => observer.observe(sec));

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // Reveal-on-scroll animations
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));

  // Animate skill bars when skills list is in view
  const skillsList = document.getElementById('skills-list');
  if (skillsList) {
    const skillsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          skillsList.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    skillsObserver.observe(skillsList);
  }

  // Count-up numbers in About stats
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const nums = aboutSection.querySelectorAll('.about__stat .num');
    const parseTarget = (text) => {
      const hasPlus = /\+$/.test(text.trim());
      const n = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
      return { n, hasPlus };
    };
    const countTo = (el, target, hasPlus) => {
      const duration = 900; // ms
      const start = performance.now();
      const from = 0;
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(from + (target - from) * eased);
        el.textContent = hasPlus ? value + '+' : String(value);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const aboutObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          nums.forEach((el) => {
            if (el.dataset.counted === '1') return;
            const { n, hasPlus } = parseTarget(el.textContent || '0');
            countTo(el, n, hasPlus);
            el.dataset.counted = '1';
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    aboutObserver.observe(aboutSection);
  }

  // Subtle parallax on hero image
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero__image img');
  if (hero && heroImg) {
    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      const dx = (x - 0.5) * 12; // -6..6
      const dy = (y - 0.5) * 8;  // -4..4
      heroImg.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.02)`;
      heroImg.style.transition = 'transform 60ms linear';
    };
    const onLeave = () => {
      heroImg.style.transform = 'translate3d(0, 0, 0) scale(1)';
      heroImg.style.transition = 'transform 300ms ease';
    };
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
  }

  // Particles background
  (function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0, height = 0, dpr = Math.max(1, window.devicePixelRatio || 1);
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = 0;
    let dotRGB = '110,168,254';
    let lineRGB = '150,170,200';

    function refreshColors() {
      const styles = getComputedStyle(document.documentElement);
      const dot = styles.getPropertyValue('--particle-dot').trim();
      const line = styles.getPropertyValue('--particle-line').trim();
      if (dot) dotRGB = dot;
      if (line) lineRGB = line;
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    }

    function createParticles() {
      const area = width * height;
      const base = Math.round(area / 18000); // density
      const count = Math.max(40, Math.min(140, base));
      particles = new Array(count).fill(0).map(() => {
        const speed = 0.15 + Math.random() * 0.35; // px per frame
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1 + Math.random() * 2.2,
          a: 0.35 + Math.random() * 0.35
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Draw connections first to sit beneath dots
      const maxDist = 110;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < maxDist * maxDist) {
            const t = 1 - Math.sqrt(dist2) / maxDist;
            ctx.strokeStyle = `rgba(${lineRGB}, ${0.12 * t})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.fillStyle = `rgba(${dotRGB},${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function update() {
      const repelRadius = 80;
      for (const p of particles) {
        // Mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < repelRadius * repelRadius) {
          const dist = Math.sqrt(dist2) || 1;
          const force = (repelRadius - dist) / repelRadius; // 0..1
          p.vx += (dx / dist) * force * 0.35;
          p.vy += (dy / dist) * force * 0.35;
        }

        // Integrate
        p.x += p.vx;
        p.y += p.vy;

        // Gentle friction and keep-alive
        p.vx *= 0.998;
        p.vy *= 0.998;
        // Prevent coming to a full stop: ensure a minimum drift speed
        const speed = Math.hypot(p.vx, p.vy);
        if (speed < 0.08) {
          const angle = Math.random() * Math.PI * 2;
          const min = 0.12, max = 0.3;
          const s = min + Math.random() * (max - min);
          p.vx = Math.cos(angle) * s;
          p.vy = Math.sin(angle) * s;
        }

        // Wrap around edges
        if (p.x < -5) p.x = width + 5; else if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5; else if (p.y > height + 5) p.y = -5;
      }
    }

    function loop() {
      update();
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      stop();
      resize();
      rafId = requestAnimationFrame(loop);
    }
    function stop() { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }

    // Events
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    mediaQuery.addEventListener?.('change', start);
    document.addEventListener('themechange', () => { refreshColors(); draw(); });

    refreshColors();
    start();
  })();
})();
