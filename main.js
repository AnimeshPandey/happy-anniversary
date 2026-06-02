(function () {
  'use strict';

  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function raf2(fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  }

  /* ── Haptic ──────────────────────────────────────────────────────── */
  function haptic(ms) {
    if (navigator.vibrate) navigator.vibrate(ms || 30);
  }

  /* ── Per-theme particle shapes ───────────────────────────────────── */
  function getParticleStyle() {
    var theme = ThemeController.current();
    return (theme && theme.particleStyle) ? theme.particleStyle : {};
  }

  function applyParticleStyle(el) {
    var s = getParticleStyle();
    if (s.borderRadius) el.style.borderRadius = s.borderRadius;
    if (s.clipPath)     el.style.clipPath      = s.clipPath;
    if (s.transform)    el.style.transform     = s.transform;
  }

  /* ── Falling petals ──────────────────────────────────────────────── */
  function initPetals() {
    var container = document.getElementById('petals-layer');
    if (!container) return;
    var count = isMobile ? 18 : 28;
    for (var i = 0; i < count; i++) {
      var petal    = document.createElement('div');
      var colorIdx = (i % 6) + 1;
      petal.className = 'petal petal-color-' + colorIdx;
      petal.style.setProperty('will-change', 'transform, opacity');
      var x        = (Math.random() * 102).toFixed(1);
      var size     = (7 + Math.random() * 10).toFixed(1);
      var duration = (8 + Math.random() * 10).toFixed(1);
      var delay    = -(Math.random() * 18).toFixed(1);
      var drift    = ((Math.random() - 0.5) * 120).toFixed(0);
      var rotate   = 360 + Math.floor(Math.random() * 400);
      petal.style.left              = x + '%';
      petal.style.width             = size + 'px';
      petal.style.height            = (size * 1.45).toFixed(1) + 'px';
      petal.style.animationDuration = duration + 's';
      petal.style.animationDelay    = delay + 's';
      petal.style.setProperty('--drift',      drift + 'px');
      petal.style.setProperty('--end-rotate', rotate + 'deg');
      applyParticleStyle(petal);
      container.appendChild(petal);
    }
  }

  /* Re-shape petals when theme changes */
  function reshapePetals() {
    var petals = document.querySelectorAll('.petal');
    petals.forEach(function (p) {
      p.style.borderRadius = '';
      p.style.clipPath     = '';
      p.style.transform    = '';
      applyParticleStyle(p);
    });
  }

  /* ── Theme Selector ──────────────────────────────────────────────── */
  function initThemeSelector() {
    ThemeController.init();

    var cycleBtn = document.getElementById('ts-cycle-btn');
    var startBtn = document.getElementById('ts-start-btn');
    var selector = document.getElementById('theme-selector');

    if (cycleBtn) {
      cycleBtn.addEventListener('click', function () {
        ThemeController.cycle();
        reshapePetals();
      });
    }

    var dotsEl = document.getElementById('ts-dots');
    if (dotsEl) {
      dotsEl.querySelectorAll('.ts-dot').forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          ThemeController.set(i);
          reshapePetals();
        });
      });
    }

    if (startBtn && selector) {
      startBtn.addEventListener('click', function () {
        selector.classList.add('dismissed');
        selector.addEventListener('transitionend', function handler() {
          selector.style.display = 'none';
          selector.removeEventListener('transitionend', handler);
          runCeremonySequence();
        });
      });
    }
  }

  /* ── Ceremony sequence ───────────────────────────────────────────── */
  function runCeremonySequence() {
    var title = document.getElementById('ceremony-heading');
    var date  = document.getElementById('ceremony-date');
    var btn   = document.getElementById('begin-btn');
    if (!title) return;
    setTimeout(function () { title.classList.add('visible'); }, 1800);
    setTimeout(function () { if (date) date.classList.add('visible'); }, 2800);
    setTimeout(function () {
      if (btn) btn.classList.add('visible');
      if (!reducedMotion) fireCeremonyBurst();
    }, 4100);
  }

  /* ── Ceremony particle burst ─────────────────────────────────────── */
  function fireCeremonyBurst() {
    var bloom = document.querySelector('.ceremony-bloom');
    if (!bloom) return;
    var rect  = bloom.getBoundingClientRect();
    var cx    = rect.left + rect.width  / 2;
    var cy    = rect.top  + rect.height / 2;
    var count = isMobile ? 20 : 32;

    for (var i = 0; i < count; i++) {
      (function (idx) {
        var angle    = (idx / count) * Math.PI * 2;
        var dist     = 55 + Math.random() * 75;
        var tx       = Math.cos(angle) * dist;
        var ty       = Math.sin(angle) * dist;
        var size     = 4 + Math.random() * 6;
        var dur      = 0.55 + Math.random() * 0.35;
        var colorIdx = (idx % 6) + 1;

        var p = document.createElement('div');
        p.style.cssText = [
          'position:fixed',
          'width:' + size + 'px', 'height:' + size + 'px',
          'border-radius:50%',
          'left:' + (cx - size / 2) + 'px', 'top:' + (cy - size / 2) + 'px',
          'pointer-events:none', 'z-index:250',
          'background:var(--petal-' + colorIdx + ')',
          'animation:burstOut ' + dur + 's ease-out both',
          '--tx:' + tx + 'px', '--ty:' + ty + 'px'
        ].join(';');
        document.body.appendChild(p);
        setTimeout(function () { p.remove(); }, (dur + 0.1) * 1000);
      })(i);
    }
  }

  /* ── Image frame ornament ────────────────────────────────────────── */
  function buildImageFrame() {
    var ns  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'image-frame');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    [
      'M5 18 L5 5 L18 5',
      'M82 5 L95 5 L95 18',
      'M95 82 L95 95 L82 95',
      'M18 95 L5 95 L5 80'
    ].forEach(function (d) {
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'var(--gold)');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    });
    return svg;
  }

  /* ── Build image placeholder ─────────────────────────────────────── */
  function buildPlaceholder(imageId) {
    var slot = IMAGE_SLOTS[imageId];
    if (!slot) return document.createElement('div');

    var fig = document.createElement('figure');
    fig.className = 'image-placeholder';
    fig.style.setProperty('--aspect', slot.aspectRatio);
    fig.setAttribute('role', 'img');
    fig.setAttribute('aria-label', slot.placeholder);

    var ns  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ph-icon');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x','2'); rect.setAttribute('y','2');
    rect.setAttribute('width','28'); rect.setAttribute('height','28'); rect.setAttribute('rx','2');
    var circ = document.createElementNS(ns, 'circle');
    circ.setAttribute('cx','11'); circ.setAttribute('cy','12'); circ.setAttribute('r','3');
    var pathEl = document.createElementNS(ns, 'path');
    pathEl.setAttribute('d', 'M2 24 l8-8 5 5 5-5 12 10');
    svg.appendChild(rect); svg.appendChild(circ); svg.appendChild(pathEl);

    var text = document.createElement('p');
    text.className = 'ph-text';
    text.textContent = slot.placeholder;

    fig.appendChild(svg);
    fig.appendChild(text);
    fig.appendChild(buildImageFrame());
    return fig;
  }

  /* ── Build opening panels ────────────────────────────────────────── */
  function buildOpeningPanels() {
    var poemEl = document.getElementById('opening-poem-text');
    if (poemEl) poemEl.textContent = SITE.opening.poem;

    var container = document.getElementById('opening-panels');
    if (!container) return;

    SITE.opening.panels.forEach(function (panel, i) {
      var article  = document.createElement('article');
      article.className = 'opening-panel' + (i % 2 === 1 ? ' opening-panel--right' : '');

      var imgWrap  = document.createElement('div');
      imgWrap.className = 'panel-image reveal ' + (i % 2 === 0 ? 'reveal-left' : 'reveal-right');
      imgWrap.appendChild(buildPlaceholder(panel.imageId));

      var textWrap = document.createElement('div');
      textWrap.className = 'panel-text reveal';
      var p = document.createElement('p');
      p.textContent = panel.text;
      textWrap.appendChild(p);

      article.appendChild(imgWrap);
      article.appendChild(textWrap);
      container.appendChild(article);
    });
  }

  /* ── Build chapters ──────────────────────────────────────────────── */
  function buildChapters() {
    var container = document.getElementById('chapters-container');
    if (!container) return;

    SITE.chapters.forEach(function (ch, idx) {
      var article = document.createElement('article');
      article.className = 'chapter chapter--' + ch.layout;
      article.id = 'chapter-' + ch.number;

      var imgWrap = document.createElement('div');
      imgWrap.className = 'chapter-image-wrap reveal ' +
        (ch.layout === 'left' ? 'reveal-left' : 'reveal-right');
      imgWrap.appendChild(buildPlaceholder(ch.imageId));

      var textWrap = document.createElement('div');
      textWrap.className = 'chapter-text-wrap reveal ' +
        (ch.layout === 'left' ? 'reveal-right' : 'reveal-left');

      var num = document.createElement('div');
      num.className = 'chapter-number reveal-child';
      num.textContent = ch.number;

      var titleEl = document.createElement('h2');
      titleEl.className = 'chapter-title reveal-child';
      titleEl.textContent = ch.title;

      var body = document.createElement('p');
      body.className = 'chapter-body reveal-child';
      body.textContent = ch.body;

      var ornament = document.createElement('div');
      ornament.className = 'chapter-ornament reveal-child';
      ornament.setAttribute('aria-hidden', 'true');
      var dot = document.createElement('span');
      dot.className = 'chapter-ornament-dot';
      ornament.appendChild(dot);

      textWrap.appendChild(num);
      textWrap.appendChild(titleEl);
      textWrap.appendChild(body);
      textWrap.appendChild(ornament);
      article.appendChild(imgWrap);
      article.appendChild(textWrap);
      container.appendChild(article);

      if ((idx + 1) % 4 === 0 && idx < SITE.chapters.length - 1) {
        container.appendChild(buildFlourish());
      }
    });
  }

  function buildFlourish() {
    var div = document.createElement('div');
    div.className = 'chapter-flourish';
    div.setAttribute('aria-hidden', 'true');
    var ns  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 120 30');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '30');
    svg.setAttribute('fill', 'none');
    svg.innerHTML =
      '<circle cx="60" cy="15" r="5" fill="#C0185F" opacity="0.55"/>' +
      '<circle cx="60" cy="15" r="2.5" fill="#D4A017" opacity="0.9"/>' +
      '<circle cx="44" cy="15" r="3" fill="#F4A0B0" opacity="0.6"/>' +
      '<circle cx="76" cy="15" r="3" fill="#F4A0B0" opacity="0.6"/>' +
      '<circle cx="32" cy="15" r="1.8" fill="#D4A017" opacity="0.45"/>' +
      '<circle cx="88" cy="15" r="1.8" fill="#D4A017" opacity="0.45"/>';
    div.appendChild(svg);
    return div;
  }

  /* ── Build crescendo + closing ───────────────────────────────────── */
  function buildCrescendo() {
    var l1 = document.getElementById('crescendo-line1');
    var l2 = document.getElementById('crescendo-line2');
    var l3 = document.getElementById('crescendo-line3');
    if (l1) l1.textContent = SITE.crescendo.line1;
    if (l2) l2.textContent = SITE.crescendo.line2;
    if (l3) l3.textContent = SITE.crescendo.line3;
  }

  function buildClosing() {
    var imgWrap = document.getElementById('closing-image-wrap');
    if (imgWrap) imgWrap.appendChild(buildPlaceholder(SITE.closing.imageId));
    var msg  = document.getElementById('closing-message');
    var sign = document.getElementById('closing-signoff');
    if (msg)  msg.textContent  = SITE.closing.message;
    if (sign) sign.textContent = SITE.closing.signoff;
  }

  /* ── Typewriter poem ─────────────────────────────────────────────── */
  function initTypewriter() {
    if (reducedMotion) return;
    var el = document.getElementById('opening-poem-text');
    if (!el) return;
    var fullText = el.textContent;
    el.textContent = '';

    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.appendChild(cursor);

    var triggered = false;
    var poemWrap  = el.closest('.opening-poem') || el.parentElement;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || triggered) return;
        triggered = true;
        observer.disconnect();

        var chars = fullText.split('');
        var i     = 0;
        var speed = 26;

        function typeNext() {
          if (i >= chars.length) {
            setTimeout(function () { cursor.style.opacity = '0'; }, 1400);
            return;
          }
          var ch = chars[i++];
          el.insertBefore(document.createTextNode(ch), cursor);
          setTimeout(typeNext, ch === '\n' ? speed * 10 : speed);
        }
        setTimeout(typeNext, 500);
      });
    }, { threshold: 0.5 });

    if (poemWrap) observer.observe(poemWrap);
  }

  /* ── Scroll progress ─────────────────────────────────────────────── */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var scrollTop  = window.scrollY || window.pageYOffset;
      var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      var pct        = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
      bar.style.height = pct.toFixed(2) + '%';
    }, { passive: true });
  }

  /* ── Word-level title animation ──────────────────────────────────── */
  function animateTitleWords(titleEl) {
    if (reducedMotion || !titleEl) return;
    var text  = titleEl.textContent.trim();
    var words = text.split(' ');
    titleEl.innerHTML = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'title-word';
      span.textContent = i < words.length - 1 ? word + ' ' : word;
      span.style.transitionDelay = (i * 55) + 'ms';
      titleEl.appendChild(span);
    });
  }

  /* ── Crescendo burst ─────────────────────────────────────────────── */
  function fireCrescendoBurst() {
    if (reducedMotion) return;
    var burst = document.getElementById('crescendo-burst');
    if (!burst || burst.dataset.fired) return;
    burst.dataset.fired = '1';

    var cw    = burst.offsetWidth  || 0;
    var ch    = burst.offsetHeight || 0;
    var count = isMobile ? 30 : 60;

    for (var i = 0; i < count; i++) {
      (function (idx) {
        var x    = Math.random() * cw;
        var y    = Math.random() * ch;
        var tx   = (Math.random() - 0.5) * 200;
        var ty   = -(40 + Math.random() * 160);
        var size = 3 + Math.random() * 6;
        var dur  = 0.8 + Math.random() * 0.7;
        var del  = Math.random() * 0.6;
        var cidx = (idx % 6) + 1;

        var p = document.createElement('div');
        p.style.cssText = [
          'position:absolute',
          'width:' + size + 'px', 'height:' + size + 'px',
          'border-radius:50%',
          'left:' + x + 'px', 'top:' + y + 'px',
          'pointer-events:none',
          'background:rgba(255,255,255,' + (0.55 + Math.random() * 0.45) + ')',
          'animation:burstOut ' + dur + 's ease-out ' + del + 's both',
          '--tx:' + tx + 'px', '--ty:' + ty + 'px'
        ].join(';');
        burst.appendChild(p);
        setTimeout(function () { p.remove(); }, (dur + del + 0.2) * 1000);
      })(i);
    }
  }

  /* ── Intersection Observer — reveals + side effects ──────────────── */
  function initReveal() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var crescendoFired = false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('visible');
        observer.unobserve(el);

        /* Odometer flip on chapter number */
        if (!reducedMotion && el.classList.contains('chapter-text-wrap')) {
          var numEl = el.querySelector('.chapter-number');
          if (numEl) {
            numEl.classList.add('odometer-flip');
            numEl.addEventListener('animationend', function () {
              numEl.classList.remove('odometer-flip');
            }, { once: true });
          }
          /* Word-level title animation */
          var titleEl = el.querySelector('.chapter-title');
          if (titleEl) animateTitleWords(titleEl);
        }

        /* Crescendo burst */
        if (!crescendoFired && el.classList.contains('crescendo-text')) {
          crescendoFired = true;
          setTimeout(fireCrescendoBurst, 300);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
  }

  /* ── Confetti ────────────────────────────────────────────────────── */
  function fireConfetti(cx, cy) {
    if (reducedMotion) return;
    var colors = ['var(--rose)', 'var(--gold)', 'var(--rose-light)', 'var(--gold-light)', 'var(--rose-mid)'];
    var count  = isMobile ? 22 : 38;

    for (var i = 0; i < count; i++) {
      (function (idx) {
        var angle   = Math.random() * Math.PI * 2;
        var speed   = 70 + Math.random() * 110;
        var tx      = Math.cos(angle) * speed;
        var ty      = Math.sin(angle) * speed - 50;
        var size    = 5 + Math.random() * 7;
        var dur     = 0.9 + Math.random() * 0.6;
        var isRect  = Math.random() > 0.45;
        var rot     = (Math.random() * 720 - 360).toFixed(0) + 'deg';

        var p = document.createElement('div');
        p.style.cssText = [
          'position:fixed', 'pointer-events:none', 'z-index:300',
          'width:' + size + 'px', 'height:' + (isRect ? size * 0.5 : size) + 'px',
          'border-radius:' + (isRect ? '1px' : '50%'),
          'background:' + colors[idx % colors.length],
          'left:' + cx + 'px', 'top:' + cy + 'px',
          'animation:confettiFall ' + dur + 's ease-out both',
          '--tx:' + tx + 'px', '--ty:' + ty + 'px', '--rot:' + rot
        ].join(';');
        document.body.appendChild(p);
        setTimeout(function () { p.remove(); }, (dur + 0.1) * 1000);
      })(i);
    }
  }

  /* ── SVG heart draw + fill + confetti ───────────────────────────── */
  function initHeart() {
    var path = document.getElementById('heart-path');
    if (!path || !path.getTotalLength) return;

    var length = path.getTotalLength();
    path.style.strokeDasharray  = length;
    path.style.strokeDashoffset = length;

    if (!window.IntersectionObserver) {
      path.style.strokeDashoffset = '0';
      return;
    }

    var wrap     = document.querySelector('.heart-wrap');
    var heartDone = false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        path.style.strokeDashoffset = '0';

        /* After stroke finishes, fill the heart */
        path.addEventListener('transitionend', function handler() {
          path.removeEventListener('transitionend', handler);
          if (!heartDone) {
            heartDone = true;
            path.classList.add('filled');
            haptic(40);
          }
        });
      });
    }, { threshold: 0.5 });

    observer.observe(wrap || path);

    /* Confetti on heart tap */
    if (wrap) {
      function handleHeartTap(e) {
        var rect = wrap.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        fireConfetti(cx, cy);
        haptic([30, 20, 30]);
      }
      wrap.addEventListener('click',    handleHeartTap);
      wrap.addEventListener('touchend', function (e) {
        e.preventDefault();
        handleHeartTap(e);
      }, { passive: false });
    }
  }

  /* ── Begin button ────────────────────────────────────────────────── */
  function initBeginButton() {
    var btn      = document.getElementById('begin-btn');
    var ceremony = document.getElementById('ceremony');
    if (!btn || !ceremony) return;

    function dismiss() {
      ceremony.classList.add('dismissed');
      ceremony.addEventListener('transitionend', function handler() {
        ceremony.style.display = 'none';
        ceremony.removeEventListener('transitionend', handler);
        showJourneyUI();
      });
    }
    btn.addEventListener('click', dismiss);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dismiss(); }
    });
  }

  /* Show fixed UI elements once the journey starts */
  function showJourneyUI() {
    var soundBtn = document.getElementById('sound-toggle');
    var shareBtn = document.getElementById('share-btn');
    var navEl    = document.getElementById('chapter-nav');

    if (soundBtn) {
      soundBtn.removeAttribute('hidden');
      setTimeout(function () { soundBtn.classList.add('visible'); }, 400);
    }
    if (shareBtn && navigator.share) {
      shareBtn.removeAttribute('hidden');
      setTimeout(function () { shareBtn.classList.add('visible'); }, 500);
    }
    if (navEl) {
      navEl.removeAttribute('hidden');
    }
  }

  /* ── Sound toggle ────────────────────────────────────────────────── */
  function initSound() {
    var btn   = document.getElementById('sound-toggle');
    var audio = document.getElementById('ambient-audio');
    if (!btn) return;
    var playing = false;

    btn.addEventListener('click', function () {
      if (!audio) return;
      if (playing) {
        audio.pause();
        playing = false;
        btn.classList.remove('playing');
        btn.setAttribute('aria-label', 'Play ambient music');
        btn.textContent = '♪';
      } else {
        audio.volume = 0.28;
        audio.play().then(function () {
          playing = true;
          btn.classList.add('playing');
          btn.setAttribute('aria-label', 'Pause ambient music');
          btn.textContent = '♫';
        }).catch(function () {});
      }
    });
  }

  /* ── Chapter navigation dots ─────────────────────────────────────── */
  function initChapterNav() {
    var nav      = document.getElementById('chapter-nav');
    var chapters = document.querySelectorAll('.chapter');
    if (!nav || chapters.length === 0) return;

    /* Build dots */
    chapters.forEach(function (ch, i) {
      var dot = document.createElement('button');
      dot.className = 'chapter-nav-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', 'Chapter ' + (i + 1));
      dot.addEventListener('click', function () {
        ch.scrollIntoView({ behavior: 'smooth', block: 'start' });
        haptic(20);
      });
      nav.appendChild(dot);
    });

    var dots = nav.querySelectorAll('.chapter-nav-dot');

    /* Show nav when any chapter enters view */
    var chapObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = Array.prototype.indexOf.call(chapters, entry.target);
        if (idx === -1) return;
        dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
        nav.classList.add('visible');
      });
    }, { threshold: 0.4 });

    /* Hide nav when not in chapters section */
    var chapSection = document.getElementById('chapters');
    if (chapSection) {
      var sectionObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) nav.classList.remove('visible');
        });
      }, { threshold: 0.01 });
      sectionObs.observe(chapSection);
    }

    chapters.forEach(function (ch) { chapObserver.observe(ch); });
  }

  /* ── Web Share ───────────────────────────────────────────────────── */
  function initShare() {
    var btn = document.getElementById('share-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!navigator.share) return;
      navigator.share({
        title: 'Happy Anniversary',
        text:  'A journey through our first year together.',
        url:   window.location.href
      }).catch(function () {});
    });
  }

  /* ── Orientation guard ───────────────────────────────────────────── */
  function initOrientationGuard() {
    var overlay = document.getElementById('orientation-overlay');
    if (!overlay || !window.matchMedia) return;
    var mq = window.matchMedia('(orientation: landscape) and (max-height: 500px)');

    function check(e) {
      var isLandMobile = typeof e.matches !== 'undefined' ? e.matches : mq.matches;
      overlay.classList.toggle('visible', isLandMobile);
      if (isLandMobile) {
        overlay.removeAttribute('hidden');
      }
    }

    if (mq.addEventListener) {
      mq.addEventListener('change', check);
    } else if (mq.addListener) {
      mq.addListener(check);
    }
    check(mq);
  }

  /* ── Floating decorative SVGs (desktop only, non-essential) ──────── */
  function initFloats() {
    if (isMobile || reducedMotion) return;

    var shapes = [
      'M12 2C10 2 7 5 7 10C7 16 10 20 12 22C14 20 17 16 17 10C17 5 14 2 12 2Z',
      'M12 2L13.5 9.5L22 12L13.5 14.5L12 22L10.5 14.5L2 12L10.5 9.5Z',
      'M12 2L14.5 9.2L22 9.2L16 13.8L18.2 21L12 16.8L5.8 21L8 13.8L2 9.2L9.5 9.2Z'
    ];
    var fills = ['var(--rose-light)', 'var(--gold-light)', 'var(--rose-mid)'];
    var sels  = ['#opening', '#chapters', '#closing'];

    sels.forEach(function (sel, si) {
      var section = document.querySelector(sel);
      if (!section) return;
      var pos = section.style.position;
      if (!pos || pos === 'static') section.style.position = 'relative';

      for (var j = 0; j < 3; j++) {
        var ns   = 'http://www.w3.org/2000/svg';
        var svg  = document.createElementNS(ns, 'svg');
        var size = 14 + Math.random() * 18;
        svg.setAttribute('class', 'section-float');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width',  size);
        svg.setAttribute('height', size);
        svg.setAttribute('aria-hidden', 'true');

        var pathEl = document.createElementNS(ns, 'path');
        pathEl.setAttribute('d',    shapes[(si + j) % shapes.length]);
        pathEl.setAttribute('fill', fills[j % fills.length]);
        svg.appendChild(pathEl);

        var dur = (7 + Math.random() * 5).toFixed(1);
        var del = -(Math.random() * 6).toFixed(1);
        svg.style.cssText = [
          'left:' + (4 + Math.random() * 88) + '%',
          'top:'  + (8 + Math.random() * 82) + '%',
          'opacity:' + (0.08 + Math.random() * 0.1).toFixed(2),
          'animation:floatDrift ' + dur + 's ease-in-out ' + del + 's infinite'
        ].join(';');

        section.appendChild(svg);
      }
    });
  }

  /* ── Init ────────────────────────────────────────────────────────── */
  function init() {
    initPetals();
    initThemeSelector();
    buildOpeningPanels();
    buildChapters();
    buildCrescendo();
    buildClosing();
    initBeginButton();
    initScrollProgress();
    initOrientationGuard();
    initShare();
    initSound();

    raf2(function () {
      initReveal();
      initHeart();
      initTypewriter();
      initChapterNav();
      initFloats();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
