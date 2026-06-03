(function () {
  'use strict';

  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var audioCtx = null;

  function raf2(fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  }

  /* ── Haptic ──────────────────────────────────────────────────────── */
  function haptic(ms) {
    if (navigator.vibrate) navigator.vibrate(ms || 30);
  }

  /* ── Scroll lock (iOS-safe body-lock pattern) ───────────────────── */
  function lockScroll() {
    document.body.style.position = 'fixed';
    document.body.style.top      = '0';
    document.body.style.left     = '0';
    document.body.style.right    = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.left     = '';
    document.body.style.right    = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  /* ── Audio context (lazy init on first user gesture) ─────────────── */
  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    return audioCtx;
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

  function reshapePetals() {
    var petals = document.querySelectorAll('.petal');
    petals.forEach(function (p) {
      p.style.borderRadius = '';
      p.style.clipPath     = '';
      p.style.transform    = '';
      applyParticleStyle(p);
    });
  }

  /* ── Theme flash transition overlay ──────────────────────────────── */
  function flashThemeTransition() {
    if (reducedMotion) return;
    var flash = document.createElement('div');
    flash.className = 'theme-flash';
    document.body.appendChild(flash);
    raf2(function () {
      flash.style.opacity = '0.35';
      setTimeout(function () {
        flash.style.opacity = '0';
        setTimeout(function () { flash.remove(); }, 200);
      }, 120);
    });
  }

  /* ── Theme persistence ───────────────────────────────────────────── */
  var THEME_KEY = 'anniversary-theme-idx';

  function saveTheme(index) {
    try { localStorage.setItem(THEME_KEY, String(index)); } catch (e) {}
  }

  function loadSavedTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) {
        var idx = parseInt(saved, 10);
        if (!isNaN(idx) && idx >= 0 && idx < THEMES.length) return idx;
      }
    } catch (e) {}
    return 0;
  }

  /* ── Surprise Me ─────────────────────────────────────────────────── */
  function initSurpriseMe() {
    var btn = document.getElementById('ts-surprise-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var cur = ThemeController.current();
      var curIdx = THEMES.indexOf(cur);
      var randomIdx;
      do { randomIdx = Math.floor(Math.random() * THEMES.length); } while (randomIdx === curIdx && THEMES.length > 1);
      ThemeController.set(randomIdx);
      saveTheme(randomIdx);
      reshapePetals();
      flashThemeTransition();
      haptic(20);
    });
  }

  /* ── Theme preview bubble on dot hover ───────────────────────────── */
  function initThemePreview() {
    var bubble = document.getElementById('ts-preview-bubble');
    var nameEl = document.getElementById('ts-preview-name');
    if (!bubble || !nameEl) return;

    function showBubble(dot, theme) {
      var rect = dot.getBoundingClientRect();
      nameEl.textContent = theme.name;
      bubble.removeAttribute('hidden');
      bubble.style.left      = (rect.left + rect.width / 2) + 'px';
      bubble.style.top       = (rect.top - 8) + 'px';
      bubble.style.transform = 'translateX(-50%) translateY(-100%)';
    }

    function hideBubble() { bubble.setAttribute('hidden', ''); }

    var dotsEl = document.getElementById('ts-dots');
    if (!dotsEl) return;

    dotsEl.querySelectorAll('.ts-dot').forEach(function (dot, i) {
      dot.addEventListener('mouseenter', function () { if (THEMES[i]) showBubble(dot, THEMES[i]); });
      dot.addEventListener('mouseleave', hideBubble);
      dot.addEventListener('focus',      function () { if (THEMES[i]) showBubble(dot, THEMES[i]); });
      dot.addEventListener('blur',       hideBubble);
    });
  }

  /* ── Theme Selector ──────────────────────────────────────────────── */
  function initThemeSelector() {
    /* Lock scroll while selector/ceremony are showing (iOS-safe body-lock) */
    lockScroll();

    var savedIdx = loadSavedTheme();
    ThemeController.init();
    if (savedIdx !== 0) ThemeController.set(savedIdx);

    /* Sync meta[name="theme-color"] with the active theme on every load */
    (function () {
      var metaInit = document.querySelector('meta[name="theme-color"]');
      var t = ThemeController.current();
      if (metaInit && t && t.tokens && t.tokens['--rose']) {
        metaInit.setAttribute('content', t.tokens['--rose']);
      }
    })();

    var startBtn = document.getElementById('ts-start-btn');
    var selector = document.getElementById('theme-selector');
    var prevBtn  = document.getElementById('ts-prev-btn');
    var nextBtn  = document.getElementById('ts-next-btn');
    var orbWrap  = document.getElementById('ts-orb-wrap');

    function getIdx() {
      return THEMES.indexOf(ThemeController.current());
    }

    function applyThemeChange(idx) {
      ThemeController.set(idx);
      saveTheme(idx);
      requestAnimationFrame(function () { reshapePetals(); });
      flashThemeTransition();
      haptic(20);
      playThemeSelect();
      /* Orb pulse via inline style to avoid conflicting with orbFloat animation */
      var orb = document.querySelector('.ts-orb');
      if (orb) {
        orb.style.boxShadow = '0 0 110px 40px var(--orb-shadow)';
        setTimeout(function () { orb.style.boxShadow = ''; }, 650);
      }
      /* Dynamic theme-color meta update */
      var metaTheme = document.querySelector('meta[name="theme-color"]');
      var theme = ThemeController.current();
      if (metaTheme && theme && theme.tokens && theme.tokens['--rose']) {
        metaTheme.setAttribute('content', theme.tokens['--rose']);
      }
    }

    /* Chevron nav buttons */
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        applyThemeChange((getIdx() - 1 + THEMES.length) % THEMES.length);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        applyThemeChange((getIdx() + 1) % THEMES.length);
      });
    }

    /* Orb: tap = next theme, swipe left/right = prev/next */
    if (orbWrap) {
      var swipeStartX = 0;
      var swipeMoved  = false;

      orbWrap.addEventListener('touchstart', function (e) {
        swipeStartX = e.touches[0].clientX;
        swipeMoved  = false;
      }, { passive: true });

      orbWrap.addEventListener('touchmove', function (e) {
        if (Math.abs(e.touches[0].clientX - swipeStartX) > 8) swipeMoved = true;
      }, { passive: true });

      orbWrap.addEventListener('touchend', function (e) {
        if (!swipeMoved) return;
        var dx = e.changedTouches[0].clientX - swipeStartX;
        if (Math.abs(dx) < 20) return;
        var cur = getIdx();
        applyThemeChange(dx < 0
          ? (cur + 1) % THEMES.length
          : (cur - 1 + THEMES.length) % THEMES.length);
      }, { passive: true });

      orbWrap.addEventListener('click', function (e) {
        if (e.target.closest('#ts-surprise-btn')) return;
        applyThemeChange((getIdx() + 1) % THEMES.length);
      });

      orbWrap.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          applyThemeChange((getIdx() + 1) % THEMES.length);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          applyThemeChange((getIdx() - 1 + THEMES.length) % THEMES.length);
        }
      });
    }

    /* Dots */
    var dotsEl = document.getElementById('ts-dots');
    if (dotsEl) {
      dotsEl.querySelectorAll('.ts-dot').forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          reshapePetals();
          saveTheme(i);
          flashThemeTransition();
          haptic(20);
          playThemeSelect();
          /* Keep meta[name="theme-color"] in sync when a dot is tapped */
          var metaTheme = document.querySelector('meta[name="theme-color"]');
          var theme = ThemeController.current();
          if (metaTheme && theme && theme.tokens && theme.tokens['--rose']) {
            metaTheme.setAttribute('content', theme.tokens['--rose']);
          }
        });
      });
    }

    if (startBtn && selector) {
      startBtn.addEventListener('click', function () {
        selector.classList.add('dismissed');
        setTimeout(function () {
          selector.style.display = 'none';
          runCeremonySequence();
        }, 750);
      });
    }

    initSurpriseMe();
    initThemePreview();
  }

  /* ── Days counter (rAF count-up) ─────────────────────────────────── */
  function initDaysCounter() {
    var el = document.getElementById('ceremony-days');
    if (!el) return;

    var start = new Date('2025-06-01');
    var now   = new Date();
    var diff  = Math.max(0, Math.floor((now - start) / 86400000));

    if (reducedMotion) {
      el.textContent = diff + (diff === 1 ? ' day' : ' days') + ' of love';
      return;
    }

    var current = 0;
    var steps   = 72;
    var inc     = Math.ceil(diff / steps);
    el.textContent = '0 days of love';

    function tick() {
      current = Math.min(current + inc, diff);
      el.textContent = current + (current === 1 ? ' day' : ' days') + ' of love';
      if (current < diff) setTimeout(tick, 18);
    }
    setTimeout(tick, 500);
  }

  /* ── Ceremony sequence ───────────────────────────────────────────── */
  function runCeremonySequence() {
    var title     = document.getElementById('ceremony-heading');
    var recipient = document.getElementById('ceremony-recipient');
    var date      = document.getElementById('ceremony-date');
    var days      = document.getElementById('ceremony-days');
    var btn       = document.getElementById('begin-btn');
    if (!title) return;

    if (recipient) recipient.textContent = SITE.recipientName ? 'For ' + SITE.recipientName : '';
    if (date) date.textContent = SITE.date || 'One beautiful year';

    setTimeout(function () { title.classList.add('visible'); }, 1200);
    setTimeout(function () { if (recipient) recipient.classList.add('visible'); }, 1900);
    setTimeout(function () { if (date) date.classList.add('visible'); }, 2600);
    setTimeout(function () {
      if (days) { days.classList.add('visible'); initDaysCounter(); }
    }, 3200);
    setTimeout(function () {
      if (btn) btn.classList.add('visible');
      var hint = document.getElementById('begin-hint');
      if (hint) setTimeout(function () { hint.classList.add('visible'); }, 600);
      if (!reducedMotion) fireCeremonyBurst();
      initCountdownRing();
    }, 4300);
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

  /* ── Countdown ring + 10 s auto-advance ──────────────────────────── */
  function initCountdownRing() {
    var ring   = document.querySelector('.begin-countdown-ring');
    var circle = document.getElementById('countdown-circle');
    var btn    = document.getElementById('begin-btn');
    if (!ring || !circle || !btn) return;

    ring.classList.add('active');
    circle.classList.add('running');

    var timer = setTimeout(function () { btn.click(); }, 10000);
    btn.addEventListener('click', function () { clearTimeout(timer); ring.classList.remove('active'); }, { once: true });
  }

  /* ── Portal transition: ceremony → journey ───────────────────────── */
  function initBeginButton() {
    var btn      = document.getElementById('begin-btn');
    var ceremony = document.getElementById('ceremony');
    var overlay  = document.getElementById('portal-overlay');
    if (!btn || !ceremony) return;

    function dismiss() {
      haptic(40);
      playPortalEntry();
      ceremony.style.display = 'none';

      if (overlay && !reducedMotion) {
        var cx = window.innerWidth  / 2;
        var cy = window.innerHeight / 2;
        overlay.style.setProperty('--pcx', cx + 'px');
        overlay.style.setProperty('--pcy', cy + 'px');
        overlay.classList.add('expanding');

        /* Use setTimeout matching CSS durations (0.28s expand, 0.34s collapse) */
        setTimeout(function () {
          overlay.classList.remove('expanding');
          overlay.classList.add('collapsing');
          setTimeout(function () {
            overlay.classList.remove('collapsing');
            showJourneyUI();
          }, 340);
        }, 280);
      } else {
        showJourneyUI();
      }
    }

    btn.addEventListener('click', dismiss);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dismiss(); }
    });
  }

  var _journeyStarted = false;

  function showJourneyUI() {
    /* Guard: tolerate accidental double-calls (e.g. countdown ring auto-click
       firing after manual Begin press before it was cleared) */
    if (_journeyStarted) return;
    _journeyStarted = true;

    /* Unlock scroll (iOS-safe) — body was position:fixed at top:0, so
       unlocking always restores scroll=0 with no flash. Then fade journey in. */
    unlockScroll();

    var journey = document.getElementById('journey');
    if (journey && !reducedMotion) {
      journey.style.opacity    = '0';
      journey.style.transition = 'opacity 0.5s ease';
      setTimeout(function () {
        journey.style.opacity = '1';
        setTimeout(function () {
          journey.style.opacity     = '';
          journey.style.transition  = '';
        }, 520);
      }, 50);
    }

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
    if (navEl) navEl.removeAttribute('hidden');

    /* One-time TOC discovery hint */
    try {
      if (!localStorage.getItem('toc-hint-shown')) {
        localStorage.setItem('toc-hint-shown', '1');
        setTimeout(function () {
          var hint = document.createElement('div');
          hint.className = 'chapter-nav-hint';
          hint.textContent = 'hold to see all chapters';
          document.body.appendChild(hint);
          setTimeout(function () { hint.classList.add('visible'); }, 100);
          setTimeout(function () {
            hint.classList.remove('visible');
            setTimeout(function () { hint.remove(); }, 450);
          }, 4000);
        }, 3500);
      }
    } catch (e) {}

    /* One-time sound hint toast */
    try {
      if (!localStorage.getItem('sound-hint-shown')) {
        localStorage.setItem('sound-hint-shown', '1');
        setTimeout(function () {
          var toast = document.createElement('div');
          toast.className = 'sound-hint-toast';
          toast.textContent = 'tap the note for music';
          document.body.appendChild(toast);
          setTimeout(function () { toast.classList.add('visible'); }, 100);
          setTimeout(function () {
            toast.classList.remove('visible');
            setTimeout(function () { toast.remove(); }, 450);
          }, 3500);
        }, 2000);
      }
    } catch (e) {}

    /* Launch per-theme ambient effects after a short fade-in delay */
    setTimeout(initThemeAmbientEffects, 1800);
  }

  /* ── Image frame ornament ────────────────────────────────────────── */
  function buildImageFrame() {
    var ns  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'image-frame');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    ['M5 18 L5 5 L18 5', 'M82 5 L95 5 L95 18',
     'M95 82 L95 95 L82 95', 'M18 95 L5 95 L5 80'].forEach(function (d) {
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

  /* ── Build image placeholder (with curtain wipe) ─────────────────── */
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

    /* Curtain reveal: .image-placeholder already has position:relative; overflow:hidden */
    var curtain = document.createElement('div');
    curtain.className = 'image-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    fig.appendChild(curtain);

    return fig;
  }

  /* ── Build opening panels ────────────────────────────────────────── */
  function buildOpeningPanels() {
    var poemEl = document.getElementById('opening-poem-text');
    if (poemEl) poemEl.textContent = SITE.opening.poem;

    var container = document.getElementById('opening-panels');
    if (!container) return;

    SITE.opening.panels.forEach(function (panel, i) {
      var article = document.createElement('article');
      article.className = 'opening-panel' + (i % 2 === 1 ? ' opening-panel--right' : '');

      var imgWrap = document.createElement('div');
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
      article.setAttribute('data-num', ch.number);

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

      if (ch.mood) {
        var mood = document.createElement('span');
        mood.className = 'chapter-mood';
        mood.setAttribute('aria-hidden', 'true');
        mood.textContent = ch.mood;
        ornament.appendChild(mood);
      }

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

    /* Hidden easter egg chapter */
    if (SITE.hiddenChapter) {
      var hch = SITE.hiddenChapter;
      var hiddenEl = document.createElement('article');
      hiddenEl.className = 'chapter chapter--' + hch.layout;
      hiddenEl.id = 'chapter-hidden';

      var hImgWrap = document.createElement('div');
      hImgWrap.className = 'chapter-image-wrap reveal reveal-left';
      hImgWrap.appendChild(buildPlaceholder(hch.imageId));

      var hTextWrap = document.createElement('div');
      hTextWrap.className = 'chapter-text-wrap reveal reveal-right';

      var hNum = document.createElement('div');
      hNum.className = 'chapter-number reveal-child';
      hNum.textContent = hch.number;

      var hTitle = document.createElement('h2');
      hTitle.className = 'chapter-title reveal-child';
      hTitle.textContent = hch.title;

      var hBody = document.createElement('p');
      hBody.className = 'chapter-body reveal-child';
      hBody.textContent = hch.body;

      hTextWrap.appendChild(hNum);
      hTextWrap.appendChild(hTitle);
      hTextWrap.appendChild(hBody);
      hiddenEl.appendChild(hImgWrap);
      hiddenEl.appendChild(hTextWrap);
      container.appendChild(hiddenEl);
    }
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
      '<circle cx="60" cy="15" r="5" class="fd-center" fill="#C0185F" opacity="0.55"/>' +
      '<circle cx="60" cy="15" r="2.5" class="fd-center-dot" fill="#D4A017" opacity="0.9"/>' +
      '<circle cx="44" cy="15" r="3" class="fd-petal" fill="#F4A0B0" opacity="0.6"/>' +
      '<circle cx="76" cy="15" r="3" class="fd-petal" fill="#F4A0B0" opacity="0.6"/>' +
      '<circle cx="32" cy="15" r="1.8" class="fd-accent" fill="#D4A017" opacity="0.45"/>' +
      '<circle cx="88" cy="15" r="1.8" class="fd-accent" fill="#D4A017" opacity="0.45"/>';
    div.appendChild(svg);
    return div;
  }

  /* ── Build crescendo ─────────────────────────────────────────────── */
  function buildCrescendo() {
    var l1 = document.getElementById('crescendo-line1');
    var l2 = document.getElementById('crescendo-line2');
    var l3 = document.getElementById('crescendo-line3');
    if (l1) l1.textContent = SITE.crescendo.line1;
    if (l2) l2.textContent = SITE.crescendo.line2;
    if (l3) l3.textContent = SITE.crescendo.line3;
  }

  /* ── Build closing ───────────────────────────────────────────────── */
  function buildClosing() {
    var imgWrap = document.getElementById('closing-image-wrap');
    if (imgWrap) imgWrap.appendChild(buildPlaceholder(SITE.closing.imageId));
    var msg  = document.getElementById('closing-message');
    var sign = document.getElementById('closing-signoff');
    if (msg)  msg.textContent  = SITE.closing.message;
    if (sign) sign.textContent = SITE.closing.signoff;
    /* Author name below signoff */
    if (sign && SITE.closing.author) {
      var author = document.createElement('p');
      author.className = 'closing-author';
      author.textContent = SITE.closing.author;
      sign.parentNode.insertBefore(author, sign.nextSibling);
    }
  }

  /* ── Poem underline SVG draw ─────────────────────────────────────── */
  function addPoemUnderline() {
    var path = document.getElementById('poem-underline-path');
    if (path) setTimeout(function () { path.classList.add('drawn'); }, 350);
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
        var i = 0, speed = 26;

        function typeNext() {
          if (i >= chars.length) {
            setTimeout(function () {
              cursor.style.opacity = '0';
              addPoemUnderline();
            }, 1400);
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

  /* ── Scroll progress bar ─────────────────────────────────────────── */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY || window.pageYOffset;
      var docH      = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.height = (docH > 0 ? (scrollTop / docH * 100) : 0).toFixed(2) + '%';
    }, { passive: true });
  }

  /* ── Word-level title animation ──────────────────────────────────── */
  function animateTitleWords(titleEl) {
    if (reducedMotion || !titleEl) return;
    var words = titleEl.textContent.trim().split(' ');
    titleEl.innerHTML = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'title-word';
      span.textContent = word;
      span.style.transitionDelay = (i * 55) + 'ms';
      titleEl.appendChild(span);
      if (i < words.length - 1) {
        titleEl.appendChild(document.createTextNode(' '));
      }
    });
  }

  /* ── Crescendo burst ─────────────────────────────────────────────── */
  function fireCrescendoBurst() {
    if (reducedMotion) return;
    var burst = document.getElementById('crescendo-burst');
    if (!burst || burst.dataset.fired) return;
    burst.dataset.fired = '1';

    var cw = burst.offsetWidth || 0, ch = burst.offsetHeight || 0;
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

  /* ── Intersection Observer: reveals + side effects ───────────────── */
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

        if (!reducedMotion && el.classList.contains('chapter-text-wrap')) {
          var numEl = el.querySelector('.chapter-number');
          if (numEl) {
            numEl.classList.add('odometer-flip');
            numEl.addEventListener('animationend', function () {
              numEl.classList.remove('odometer-flip');
            }, { once: true });
          }
          animateTitleWords(el.querySelector('.chapter-title'));
        }

        if (!crescendoFired && el.classList.contains('crescendo-text')) {
          crescendoFired = true;
          setTimeout(fireCrescendoBurst, 300);
          var inner = document.querySelector('.crescendo-inner');
          if (inner) setTimeout(function () { inner.classList.add('rings-active'); }, 800);
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
        var angle  = Math.random() * Math.PI * 2;
        var speed  = 70 + Math.random() * 110;
        var tx     = Math.cos(angle) * speed;
        var ty     = Math.sin(angle) * speed - 50;
        var size   = 5 + Math.random() * 7;
        var dur    = 0.9 + Math.random() * 0.6;
        var isRect = Math.random() > 0.45;
        var rot    = (Math.random() * 720 - 360).toFixed(0) + 'deg';

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

  /* ── Chapter ornament completion pop ─────────────────────────────── */
  function fireChapterCompletionPop(dotEl) {
    if (reducedMotion || !dotEl) return;
    var rect  = dotEl.getBoundingClientRect();
    var cx    = rect.left + rect.width  / 2;
    var cy    = rect.top  + rect.height / 2;

    for (var i = 0; i < 10; i++) {
      (function (idx) {
        var angle = (idx / 10) * Math.PI * 2;
        var dist  = 18 + Math.random() * 25;
        var tx    = Math.cos(angle) * dist;
        var ty    = Math.sin(angle) * dist;
        var size  = 3 + Math.random() * 3;
        var dur   = 0.45 + Math.random() * 0.3;

        var p = document.createElement('div');
        p.style.cssText = [
          'position:fixed', 'pointer-events:none', 'z-index:300',
          'width:' + size + 'px', 'height:' + size + 'px',
          'border-radius:50%',
          'left:' + (cx - size / 2) + 'px', 'top:' + (cy - size / 2) + 'px',
          'background:var(--rose)',
          'animation:burstOut ' + dur + 's ease-out both',
          '--tx:' + tx + 'px', '--ty:' + ty + 'px'
        ].join(';');
        document.body.appendChild(p);
        setTimeout(function () { p.remove(); }, (dur + 0.1) * 1000);
      })(i);
    }
    haptic(15);
  }

  /* ── Ornament IntersectionObserver ───────────────────────────────── */
  function initOrnamentsObserver() {
    var ornaments = document.querySelectorAll('.chapter-ornament');
    if (!ornaments.length || !window.IntersectionObserver) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        var dot = entry.target.querySelector('.chapter-ornament-dot');
        fireChapterCompletionPop(dot);
      });
    }, { threshold: 0.75 });

    ornaments.forEach(function (o) { observer.observe(o); });
  }

  /* ── Hidden chapter easter egg (triple-tap ch12 ornament) ────────── */
  function initHiddenChapter() {
    var ch12 = document.getElementById('chapter-12');
    if (!ch12) return;
    var ornament = ch12.querySelector('.chapter-ornament');
    if (!ornament) return;

    var tapCount = 0, tapTimer = null;
    ornament.style.cursor = 'pointer';

    function handleTap() {
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { tapCount = 0; }, 650);
      if (tapCount >= 3) {
        tapCount = 0;
        var hidden = document.getElementById('chapter-hidden');
        if (hidden && !hidden.classList.contains('revealed')) {
          hidden.classList.add('revealed');
          haptic([30, 20, 60]);
          fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
          setTimeout(function () {
            hidden.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    }

    ornament.addEventListener('click', handleTap);
    ornament.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleTap();
    }, { passive: false });
  }

  /* ── Post-heart slow petal cascade ──────────────────────────────── */
  function fireSlowCascade() {
    if (reducedMotion) return;
    var container = document.getElementById('petals-layer');
    if (!container) return;
    var colors = [
      'var(--rose)', 'var(--gold)', 'var(--rose-light)',
      'var(--gold-light)', 'var(--petal-1)', 'var(--petal-3)',
      'var(--petal-5)', 'var(--rose-mid)'
    ];
    for (var i = 0; i < 8; i++) {
      (function (idx) {
        var p    = document.createElement('div');
        p.className = 'petal';
        p.style.background        = colors[idx % colors.length];
        p.style.left              = (8 + Math.random() * 84) + '%';
        var size = 7 + Math.random() * 9;
        p.style.width             = size + 'px';
        p.style.height            = (size * 1.45).toFixed(1) + 'px';
        p.style.animationDuration = (5.5 + Math.random() * 2.5).toFixed(1) + 's';
        p.style.animationDelay    = (idx * 0.55).toFixed(2) + 's';
        p.style.setProperty('--drift',      ((Math.random() - 0.5) * 90).toFixed(0) + 'px');
        p.style.setProperty('--end-rotate', (240 + Math.random() * 240).toFixed(0) + 'deg');
        container.appendChild(p);
        setTimeout(function () { p.remove(); }, 9500);
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

    var wrap      = document.querySelector('.heart-wrap');
    var heartDone = false;

    if (!window.IntersectionObserver) {
      path.style.strokeDashoffset = '0';
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        path.style.strokeDashoffset = '0';

        /* transitionend is unreliable — use setTimeout matching the 1.6s CSS duration */
        setTimeout(function () {
          if (!heartDone) {
            heartDone = true;
            path.classList.add('filled');
            if (wrap) wrap.classList.add('heart-done');
            haptic(40);

            /* Anniversary dedication reveal + slow cascade */
            setTimeout(function () {
              var closingInner = document.querySelector('.closing-inner');
              if (closingInner && !document.querySelector('.anniversary-dedication')) {
                var dedication = document.createElement('p');
                dedication.className = 'anniversary-dedication';
                dedication.textContent = 'Happy first anniversary, Divya.';
                closingInner.appendChild(dedication);
                raf2(function () { dedication.classList.add('visible'); });
                fireSlowCascade();
              }
            }, 2500);
          }
        }, 1700);
      });
    }, { threshold: 0.5 });

    observer.observe(wrap || path);

    if (wrap) {
      function handleHeartTap() {
        var rect = wrap.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        haptic([30, 20, 30]);
        playChime(11);
      }
      wrap.addEventListener('click', handleHeartTap);
      wrap.addEventListener('touchend', function (e) {
        e.preventDefault();
        handleHeartTap();
      }, { passive: false });
    }
  }

  /* ── Double-tap images → floating love heart ─────────────────────── */
  function spawnLoveHeart(x, y) {
    var offsets = [0, -22, 22];
    offsets.forEach(function (xOff, i) {
      setTimeout(function () {
        var el = document.createElement('div');
        el.className = 'love-heart-popup';
        el.setAttribute('aria-hidden', 'true');
        el.textContent = '♥';
        el.style.left = (x + xOff) + 'px';
        el.style.top  = y + 'px';
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 900);
      }, i * 80);
    });
    haptic(15);
  }

  function initDoubleTapLove() {
    var lastTap   = {};
    var threshold = 320;

    function handleTap(e) {
      var now = Date.now();
      var x   = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
      var y   = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;
      var key = Math.round(x / 80) + '_' + Math.round(y / 80);

      if (lastTap[key] && (now - lastTap[key]) < threshold) {
        spawnLoveHeart(x, y);
        delete lastTap[key];
      } else {
        lastTap[key] = now;
        setTimeout(function () { delete lastTap[key]; }, threshold);
      }
    }

    document.querySelectorAll('.chapter-image-wrap, .panel-image, .closing-image-wrap').forEach(function (img) {
      img.addEventListener('click',    handleTap);
      img.addEventListener('touchend', handleTap, { passive: true });
    });
  }

  /* ── Fixed chapter header (scroll-direction show/hide) ───────────── */
  function initChapterHeader() {
    var header  = document.getElementById('chapter-header');
    var numEl   = document.getElementById('chapter-header-num');
    var titleEl = document.getElementById('chapter-header-title');
    if (!header || !window.IntersectionObserver) return;

    var chapters   = document.querySelectorAll('.chapter:not(#chapter-hidden)');
    var activeChap = null;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        activeChap = entry.target;
        var numSpan   = entry.target.querySelector('.chapter-number');
        var ttlSpan   = entry.target.querySelector('.chapter-title');
        if (numEl)   numEl.textContent   = numSpan ? numSpan.textContent : '';
        if (titleEl) titleEl.textContent = ttlSpan ? ttlSpan.textContent : '';
        if (ttlSpan) updatePageTitle(ttlSpan.textContent);
      });
    }, { threshold: 0.5 });

    chapters.forEach(function (ch) { observer.observe(ch); });

    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      if (activeChap && y > lastY && y > 200) {
        header.classList.add('visible');
      } else {
        header.classList.remove('visible');
      }
      lastY = y;
    }, { passive: true });
  }

  /* ── Page title per chapter ──────────────────────────────────────── */
  function updatePageTitle(chapterTitle) {
    document.title = chapterTitle ? chapterTitle + ' - Happy Anniversary' : 'Happy Anniversary';
  }

  /* ── TOC bottom sheet (long-press nav to open) ───────────────────── */
  function initTOCSheet() {
    var sheet    = document.getElementById('toc-sheet');
    var list     = document.getElementById('toc-list');
    var backdrop = document.getElementById('toc-backdrop');
    if (!sheet || !list) return;

    SITE.chapters.forEach(function (ch, idx) {
      var li = document.createElement('li');
      li.className = 'toc-item';
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-label', 'Chapter ' + ch.number + ': ' + ch.title);

      var numSpan = document.createElement('span');
      numSpan.className = 'toc-item-num';
      numSpan.textContent = ch.number;

      var ttlSpan = document.createElement('span');
      ttlSpan.className = 'toc-item-title';
      ttlSpan.textContent = ch.title;

      li.appendChild(numSpan);
      li.appendChild(ttlSpan);

      if (ch.mood) {
        var moodSpan = document.createElement('span');
        moodSpan.className = 'toc-item-mood';
        moodSpan.setAttribute('aria-hidden', 'true');
        moodSpan.textContent = ch.mood;
        li.appendChild(moodSpan);
      }

      li.addEventListener('click', function () {
        closeTOC();
        var target = document.getElementById('chapter-' + ch.number);
        if (target) setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 320);
        haptic(20);
      });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
      });

      list.appendChild(li);
    });

    function openTOC() {
      sheet.removeAttribute('hidden');
      raf2(function () { sheet.classList.add('open'); });
      haptic(30);
    }

    function closeTOC() {
      sheet.classList.remove('open');
      setTimeout(function () { sheet.setAttribute('hidden', ''); }, 420);
    }

    if (backdrop) backdrop.addEventListener('click', closeTOC);

    var nav = document.getElementById('chapter-nav');
    if (nav) {
      var pressTimer = null;
      nav.addEventListener('touchstart', function () { pressTimer = setTimeout(openTOC, 500); }, { passive: true });
      nav.addEventListener('touchend',   function () { clearTimeout(pressTimer); },              { passive: true });
      nav.addEventListener('mousedown',  function () { pressTimer = setTimeout(openTOC, 500); });
      nav.addEventListener('mouseup',    function () { clearTimeout(pressTimer); });
      nav.addEventListener('mouseleave', function () { clearTimeout(pressTimer); });
    }

    /* Update active TOC item on chapter change */
    var chapters = document.querySelectorAll('.chapter');
    if (window.IntersectionObserver && chapters.length) {
      var tocObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var idx = Array.prototype.indexOf.call(chapters, entry.target);
          list.querySelectorAll('.toc-item').forEach(function (item, i) {
            item.classList.toggle('active', i === idx);
          });
        });
      }, { threshold: 0.5 });
      chapters.forEach(function (ch) { tocObs.observe(ch); });
    }
  }

  /* ── Pull-to-restart ─────────────────────────────────────────────── */
  function initPullToRestart() {
    var indicator = document.getElementById('pull-restart-indicator');
    if (!indicator) return;

    var startY = 0, pulling = false, threshold = 90;

    window.addEventListener('touchstart', function (e) {
      if ((window.scrollY || window.pageYOffset) <= 0) {
        startY  = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!pulling) return;
      var dy = e.touches[0].clientY - startY;
      if (dy > 20) {
        var progress = Math.min(dy / threshold, 1);
        indicator.style.opacity   = String(progress);
        indicator.style.transform = 'translateX(-50%) translateY(' + (-60 + dy * 0.7) + 'px)';
      }
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      if (!pulling) return;
      pulling = false;
      var dy = e.changedTouches[0].clientY - startY;
      indicator.style.opacity   = '0';
      indicator.style.transform = 'translateX(-50%) translateY(-60px)';
      if (dy >= threshold) {
        haptic([30, 20, 60]);
        setTimeout(function () { location.reload(); }, 250);
      }
    }, { passive: true });
  }

  /* ── Shake detection → confetti ──────────────────────────────────── */
  function initShakeDetection() {
    if (!window.DeviceMotionEvent) return;
    var lastX = null, lastY = null, lastZ = null, throttle = false;

    window.addEventListener('devicemotion', function (e) {
      if (throttle) return;
      var acc = e.accelerationIncludingGravity;
      if (!acc) return;
      var x = acc.x || 0, y = acc.y || 0, z = acc.z || 0;
      if (lastX !== null) {
        var delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
        if (delta > 25) {
          throttle = true;
          setTimeout(function () { throttle = false; }, 1500);
          fireConfetti(window.innerWidth / 2, window.innerHeight / 3);
          haptic([20, 15, 20]);
        }
      }
      lastX = x; lastY = y; lastZ = z;
    }, { passive: true });
  }

  /* ── Web Audio synthesised chime ─────────────────────────────────── */
  /* ── Generic one-shot tone ─────────────────────────────────────────── */
  function playToneShort(freq, waveform, gainPeak, attackTime, decayTime) {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var dt = decayTime || 1.0;
    function doPlay() {
      try {
        var osc  = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = waveform || 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(gainPeak || 0.10, ctx.currentTime + (attackTime || 0.02));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dt);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dt + 0.05);
      } catch (e) {}
    }
    if (ctx.state === 'running') doPlay();
    else ctx.resume().then(doPlay).catch(function () {});
  }

  /* ── Get active theme's sound profile (safe fallback) ──────────────── */
  function getThemeSound() {
    var theme = (typeof ThemeController !== 'undefined') ? ThemeController.current() : null;
    return (theme && theme.sound) ? theme.sound : {
      waveform: 'sine', pitchShift: 1.0, gainPeak: 0.14, attackTime: 0.02, decayTime: 1.2
    };
  }

  /* ── 2-note arpeggio on theme selection ─────────────────────────── */
  function playThemeSelect() {
    var s     = getThemeSound();
    var theme = (typeof ThemeController !== 'undefined') ? ThemeController.current() : null;
    var scale = (theme && theme.scale && theme.scale.length >= 4)
      ? theme.scale
      : [523.25, 659.25, 783.99, 1046.5];

    var f1 = scale[0];
    var f2 = scale[Math.floor(scale.length / 2)];

    playToneShort(f1, s.waveform, s.gainPeak * 0.58, s.attackTime, s.decayTime * 0.50);
    setTimeout(function () {
      playToneShort(f2, s.waveform, s.gainPeak * 0.50, s.attackTime, s.decayTime * 0.45);
    }, 120);

    /* Crossfade ambient to new theme */
    if (_ambientOn && theme) crossfadeAmbient(theme);
  }

  /* ── 3-note ascending shimmer on Begin (portal entry) ──────────────── */
  function playPortalEntry() {
    var s = getThemeSound();
    var shift = s.pitchShift;
    var notes = [523.25 * shift, 659.25 * shift, 783.99 * shift];
    notes.forEach(function (freq, i) {
      setTimeout(function () {
        playToneShort(freq, s.waveform, s.gainPeak * 0.70, s.attackTime, s.decayTime * 0.45);
      }, i * 130);
    });
  }

  /* ── 2-note descending tone on Begin Again (replay) ────────────────── */
  function playReplayStart() {
    var s = getThemeSound();
    var shift = s.pitchShift;
    var notes = [659.25 * shift, 523.25 * shift];
    notes.forEach(function (freq, i) {
      setTimeout(function () {
        playToneShort(freq, s.waveform, s.gainPeak * 0.55, s.attackTime, s.decayTime * 0.40);
      }, i * 170);
    });
  }

  /* ── Chapter chime — uses active theme's scale (2-note chord) ─────── */
  function playChime(chapterIndex) {
    var s     = getThemeSound();
    var theme = (typeof ThemeController !== 'undefined') ? ThemeController.current() : null;
    var scale = (theme && theme.scale && theme.scale.length >= 2)
      ? theme.scale
      : [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77,
         1046.5, 1174.66, 1318.51, 1396.91, 1567.98];

    var idx  = (chapterIndex || 0) % scale.length;
    var idx2 = (idx + 2) % scale.length;  /* 2-step chord interval */
    var ctx  = getAudioCtx();
    if (!ctx) return;

    function playNote(freq, delayMs) {
      setTimeout(function () {
        playToneShort(freq, s.waveform, s.gainPeak * 0.72, s.attackTime, s.decayTime);
      }, delayMs);
    }

    playNote(scale[idx],  0);
    playNote(scale[idx2], 45);  /* slight arpeggio offset for richness */
  }

  /* ── Synthesised ambient drone ──────────────────────────────────── */
  var _ambientNodes = null;   /* { osc1, osc2, gainNode, filter } */
  var _ambientOn    = false;

  function startAmbient(theme) {
    var ctx = getAudioCtx();
    if (!ctx || !theme || !theme.ambientNote) return;
    stopAmbient();

    var note = theme.ambientNote;
    var t    = ctx.currentTime;

    /* Master gain (very soft — background presence only) */
    var gain   = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 1.2);

    /* Warm lowpass to remove harsh harmonics */
    var filt = ctx.createBiquadFilter();
    filt.type            = 'lowpass';
    filt.frequency.value = 820;
    filt.Q.value         = 0.7;

    gain.connect(filt);
    filt.connect(ctx.destination);

    /* Root oscillator */
    var osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(note.root || 261.63, t);
    osc1.connect(gain);
    osc1.start(t);

    /* Fifth — slightly detuned for warmth */
    var osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime((note.fifth || note.root * 1.5) + 0.8, t);
    osc2.detune.value = 4;
    osc2.connect(gain);
    osc2.start(t);

    _ambientNodes = { osc1: osc1, osc2: osc2, gainNode: gain, filter: filt };
    _ambientOn    = true;
  }

  function stopAmbient() {
    if (!_ambientNodes) return;
    var ctx = getAudioCtx();
    try {
      var t = ctx ? ctx.currentTime : 0;
      _ambientNodes.gainNode.gain.linearRampToValueAtTime(0, t + 0.8);
      var nodes = _ambientNodes;
      setTimeout(function () {
        try { nodes.osc1.stop(); } catch (e) {}
        try { nodes.osc2.stop(); } catch (e) {}
      }, 900);
    } catch (e) {}
    _ambientNodes = null;
    _ambientOn    = false;
  }

  function crossfadeAmbient(newTheme) {
    /* Fade out old, start new after 600ms overlap */
    if (_ambientNodes) {
      var ctx = getAudioCtx();
      try {
        var t = ctx ? ctx.currentTime : 0;
        _ambientNodes.gainNode.gain.linearRampToValueAtTime(0, t + 0.6);
        var oldNodes = _ambientNodes;
        setTimeout(function () {
          try { oldNodes.osc1.stop(); } catch (e) {}
          try { oldNodes.osc2.stop(); } catch (e) {}
        }, 700);
        _ambientNodes = null;
        _ambientOn    = false;
      } catch (e) {}
    }
    if (newTheme) setTimeout(function () { startAmbient(newTheme); }, 600);
  }

  /* ── Sound toggle — fully synthesised ambient, no audio file ─────── */
  function initSound() {
    var btn = document.getElementById('sound-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      /* Always unlock AudioContext on user gesture */
      var ctx = getAudioCtx();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }

      if (_ambientOn) {
        stopAmbient();
        btn.classList.remove('playing');
        btn.setAttribute('aria-label', 'Play ambient music');
      } else {
        var theme = (typeof ThemeController !== 'undefined') ? ThemeController.current() : null;
        startAmbient(theme);
        btn.classList.add('playing');
        btn.setAttribute('aria-label', 'Pause ambient music');
      }
    });
  }

  /* ── Chapter navigation dots ─────────────────────────────────────── */
  function initChapterNav() {
    var nav      = document.getElementById('chapter-nav');
    /* Exclude hidden easter egg chapter from nav dots */
    var chapters = document.querySelectorAll('.chapter:not(#chapter-hidden)');
    if (!nav || chapters.length === 0) return;

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
    var lastChimeIdx = -1;

    var chapObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = Array.prototype.indexOf.call(chapters, entry.target);
        if (idx === -1) return;
        dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
        nav.classList.add('visible');
        if (idx !== lastChimeIdx) {
          lastChimeIdx = idx;
          playChime(idx);
        }
      });
    }, { threshold: 0.4 });

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
      var land = typeof e.matches !== 'undefined' ? e.matches : mq.matches;
      overlay.classList.toggle('visible', land);
      if (land) overlay.removeAttribute('hidden');
    }

    if (mq.addEventListener) mq.addEventListener('change', check);
    else if (mq.addListener) mq.addListener(check);
    check(mq);
  }

  /* ── Floating decorative SVGs (desktop only) ─────────────────────── */
  function initFloats() {
    if (isMobile || reducedMotion) return;
    var shapes = [
      'M12 2C10 2 7 5 7 10C7 16 10 20 12 22C14 20 17 16 17 10C17 5 14 2 12 2Z',
      'M12 2L13.5 9.5L22 12L13.5 14.5L12 22L10.5 14.5L2 12L10.5 9.5Z',
      'M12 2L14.5 9.2L22 9.2L16 13.8L18.2 21L12 16.8L5.8 21L8 13.8L2 9.2L9.5 9.2Z'
    ];
    var fills = ['var(--rose-light)', 'var(--gold-light)', 'var(--rose-mid)'];

    ['#opening', '#chapters', '#closing'].forEach(function (sel, si) {
      var section = document.querySelector(sel);
      if (!section) return;
      if (!section.style.position || section.style.position === 'static') {
        section.style.position = 'relative';
      }
      for (var j = 0; j < 3; j++) {
        var ns  = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        var size = 14 + Math.random() * 18;
        svg.setAttribute('class', 'section-float');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('aria-hidden', 'true');
        var pEl = document.createElementNS(ns, 'path');
        pEl.setAttribute('d',    shapes[(si + j) % shapes.length]);
        pEl.setAttribute('fill', fills[j % fills.length]);
        svg.appendChild(pEl);
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

  /* ── Closing signoff cursive underline ───────────────────────────── */
  function initClosingSignoff() {
    var signoff = document.getElementById('closing-signoff');
    if (!signoff || !window.IntersectionObserver) return;

    var ns  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'signoff-underline');
    svg.setAttribute('viewBox', '0 0 80 14');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('preserveAspectRatio', 'none');

    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M4 8 Q20 4 40 8 Q60 12 76 7');
    svg.appendChild(path);
    signoff.appendChild(svg);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setTimeout(function () { path.classList.add('drawn'); }, 700);
      });
    }, { threshold: 0.7 });

    observer.observe(signoff);
  }

  /* ── Replay button ───────────────────────────────────────────────── */
  function initReplay() {
    var btn = document.getElementById('replay-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      haptic(30);
      playReplayStart();
      clearThemeEffects();    /* remove all floating effect elements */
      stopAmbient();          /* stop synthesised ambient drone */
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(function () {
        lockScroll(); /* re-lock scroll for ceremony (iOS-safe) */
        _journeyStarted = false; /* allow showJourneyUI to run again after replay */
        var ceremony = document.getElementById('ceremony');
        var selector = document.getElementById('theme-selector');

        if (ceremony) {
          ceremony.style.display = '';
          ceremony.classList.remove('dismissed');
        }
        if (selector) {
          selector.style.display = '';
          selector.classList.remove('dismissed');
        }

        /* Reset ceremony element visibility */
        ['ceremony-heading', 'ceremony-recipient', 'ceremony-date',
         'ceremony-days', 'begin-btn'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.classList.remove('visible');
        });

        /* Reset countdown ring */
        var circle = document.getElementById('countdown-circle');
        if (circle) circle.classList.remove('running');
        var ring = document.querySelector('.begin-countdown-ring');
        if (ring) ring.classList.remove('active');

        /* Hide journey UI */
        ['sound-toggle', 'share-btn'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { el.setAttribute('hidden', ''); el.classList.remove('visible'); }
        });
        var nav = document.getElementById('chapter-nav');
        if (nav) nav.setAttribute('hidden', '');

        reshapePetals();
      }, 700);
    });
  }

  /* ── Theme ambient effects ────────────────────────────────────────
     Each init* function appends elements to #theme-effects-layer and
     returns a cleanup function. clearThemeEffects() calls all of them.
     ─────────────────────────────────────────────────────────────── */
  var _effectCleanups = [];

  function getEffectsLayer() {
    return document.getElementById('theme-effects-layer');
  }

  /* Fireflies — starry-snuggle */
  function initFireflies() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var els = [];
    var count = isMobile ? 8 : 14;
    for (var i = 0; i < count; i++) {
      var ff = document.createElement('div');
      ff.className = 'firefly';
      var dur  = (5 + Math.random() * 7).toFixed(1);
      var glow = (1.5 + Math.random() * 2).toFixed(1);
      var del  = -(Math.random() * 8).toFixed(1);
      ff.style.cssText = [
        'left:' + (5 + Math.random() * 90) + '%',
        'top:'  + (10 + Math.random() * 80) + '%',
        '--ffd:' + dur  + 's',
        '--ffg:' + glow + 's',
        '--ffl:' + del  + 's'
      ].join(';');
      layer.appendChild(ff);
      els.push(ff);
    }
    return function () { els.forEach(function (e) { e.remove(); }); };
  }

  /* Shooting stars — moonlight-mithai */
  function initShootingStars() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;

    function spawnStar() {
      if (!running) return;
      var ss = document.createElement('div');
      ss.className = 'shooting-star';
      var w   = 80 + Math.random() * 160;
      var dur = (0.85 + Math.random() * 0.7).toFixed(2);
      ss.style.cssText = [
        'width:' + w + 'px',
        'left:'  + (20 + Math.random() * 60) + '%',
        'top:'   + (5  + Math.random() * 40) + '%',
        '--ssd:' + dur + 's'
      ].join(';');
      layer.appendChild(ss);
      var t = setTimeout(function () { if (ss.parentNode) ss.remove(); }, (parseFloat(dur) + 0.2) * 1000);
      timers.push(t);

      var next = (4000 + Math.random() * 8000);
      var spawn = setTimeout(spawnStar, next);
      timers.push(spawn);
    }

    var init = setTimeout(spawnStar, 1200);
    timers.push(init);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* Moon glow — moonlight-mithai */
  function initMoonGlow() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var moon = document.createElement('div');
    moon.className = 'moon-glow';
    layer.appendChild(moon);
    var t = setTimeout(function () { moon.classList.add('visible'); }, 600);
    return function () { clearTimeout(t); moon.remove(); };
  }

  /* Cherry blossom gusts — petalpop */
  function initCherryGusts() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;
    var colors  = ['#FFB7C5', '#FF91A4', '#FFD6DF', '#FFAABF', '#FFC8D8'];

    function gust() {
      if (!running) return;
      var count = 6 + Math.floor(Math.random() * 7);
      for (var i = 0; i < count; i++) {
        (function (idx) {
          var el  = document.createElement('div');
          el.className = 'cherry-petal';
          var size = 6 + Math.random() * 8;
          var dur  = (1.2 + Math.random() * 1.0).toFixed(2);
          var del  = (idx * 0.12 + Math.random() * 0.1).toFixed(2);
          el.style.cssText = [
            'width:'  + size + 'px',
            'height:' + (size * 0.7).toFixed(1) + 'px',
            'left:'   + (Math.random() * 95) + '%',
            'top:'    + (Math.random() * 60) + '%',
            'background:' + colors[idx % colors.length],
            '--gx:' + (80 + Math.random() * 120).toFixed(0) + 'px',
            '--gy:' + (30 + Math.random() * 80).toFixed(0)  + 'px',
            '--gr:' + (200 + Math.random() * 360).toFixed(0) + 'deg',
            '--cpd:' + dur + 's',
            '--cpl:' + del + 's'
          ].join(';');
          layer.appendChild(el);
          var t = setTimeout(function () { if (el.parentNode) el.remove(); }, (parseFloat(dur) + parseFloat(del) + 0.3) * 1000);
          timers.push(t);
        })(i);
      }
      var next = setTimeout(gust, 5000 + Math.random() * 8000);
      timers.push(next);
    }

    var start = setTimeout(gust, 800);
    timers.push(start);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* Butterflies — butterfly-blush */
  function initButterflyFlutter() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;

    function spawnButterfly() {
      if (!running) return;
      var el = document.createElement('div');
      el.className = 'butterfly-el';
      var wl = document.createElement('div');
      var wr = document.createElement('div');
      wl.className = 'wing-l';
      wr.className = 'wing-r';
      el.appendChild(wl);
      el.appendChild(wr);

      var startX  = -40;
      var startY  = 10 + Math.random() * 70;
      var endX    = window.innerWidth + 50;
      var speed   = 18000 + Math.random() * 16000;
      var flapDur = (0.38 + Math.random() * 0.24).toFixed(2);

      el.style.cssText = [
        'left:' + startX + 'px',
        'top:'  + startY + '%',
        '--wfd:' + flapDur + 's'
      ].join(';');
      layer.appendChild(el);

      var start = Date.now();
      function step() {
        if (!running || !el.parentNode) return;
        var progress = (Date.now() - start) / speed;
        if (progress >= 1) { el.remove(); return; }
        el.style.left = (startX + progress * (endX - startX)) + 'px';
        el.style.top  = (startY + Math.sin(progress * Math.PI * 6) * 3.5) + '%';
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);

      var t = setTimeout(function () { if (el.parentNode) el.remove(); }, speed + 200);
      timers.push(t);

      var next = setTimeout(spawnButterfly, 6000 + Math.random() * 10000);
      timers.push(next);
    }

    var init = setTimeout(spawnButterfly, 1500);
    timers.push(init);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* Drifting clouds — candy-cloud */
  function initDriftingClouds() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;

    function spawnCloud() {
      if (!running) return;
      var cl = document.createElement('div');
      cl.className = 'cloud-drift';
      var w   = 70  + Math.random() * 110;
      var h   = 28  + Math.random() * 28;
      var dur = (20 + Math.random() * 20).toFixed(1);
      var del = (Math.random() * 2).toFixed(1);
      cl.style.cssText = [
        'width:'  + w + 'px',
        'height:' + h + 'px',
        'left: -' + (w + 20) + 'px',
        'top:'    + (5 + Math.random() * 40) + '%',
        '--cdd:' + dur + 's',
        '--cdl:' + del + 's'
      ].join(';');
      layer.appendChild(cl);
      var t = setTimeout(function () { if (cl.parentNode) cl.remove(); }, (parseFloat(dur) + parseFloat(del) + 1) * 1000);
      timers.push(t);

      var next = setTimeout(spawnCloud, 6000 + Math.random() * 10000);
      timers.push(next);
    }

    /* Pre-place a couple already in progress */
    for (var i = 0; i < 2; i++) {
      (function (idx) {
        var t = setTimeout(function () { spawnCloud(); }, idx * 3500);
        timers.push(t);
      })(i);
    }

    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* Diyas (oil lamps) — sangeetspark */
  function initDiyas() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var els = [];
    var count = isMobile ? 5 : 8;
    for (var i = 0; i < count; i++) {
      var wrap  = document.createElement('div');
      wrap.className = 'diya-wrap';
      var base  = document.createElement('div');
      var flame = document.createElement('div');
      var glow  = document.createElement('div');
      base.className  = 'diya-base';
      flame.className = 'diya-flame';
      glow.className  = 'diya-glow';
      var dur = (0.9 + Math.random() * 0.4).toFixed(2);
      flame.style.setProperty('--dfl', dur + 's');
      glow.style.setProperty('--dfl', dur + 's');
      wrap.appendChild(base);
      wrap.appendChild(flame);
      wrap.appendChild(glow);
      wrap.style.cssText = [
        'left:' + (5 + i * (90 / count) + Math.random() * 5) + '%',
        'bottom:' + (Math.random() * 8) + '%'
      ].join(';');
      layer.appendChild(wrap);
      els.push(wrap);
    }
    return function () { els.forEach(function (e) { e.remove(); }); };
  }

  /* Firework bursts — sangeetspark */
  function initFireworkBursts() {
    if (reducedMotion) return function () {};
    var timers = [];
    var running = true;

    function burst() {
      if (!running) return;
      var cx = 15 + Math.random() * 70;
      var cy = 10 + Math.random() * 50;
      var count = isMobile ? 16 : 26;
      for (var i = 0; i < count; i++) {
        (function (idx) {
          var sp   = document.createElement('div');
          sp.style.position   = 'fixed';
          sp.style.pointerEvents = 'none';
          sp.style.zIndex     = '4';
          var angle = (idx / count) * Math.PI * 2;
          var dist  = 35 + Math.random() * 55;
          var size  = 3 + Math.random() * 4;
          var dur   = (0.5 + Math.random() * 0.4).toFixed(2);
          var del   = (Math.random() * 0.15).toFixed(2);
          var colors = ['#FFD700', '#FF6B35', '#FF1493', '#FF4500', '#FFB800', '#FF69B4'];
          sp.style.cssText += [
            'width:' + size + 'px',
            'height:' + size + 'px',
            'border-radius:50%',
            'left:' + cx + '%',
            'top:'  + cy + '%',
            'background:' + colors[idx % colors.length],
            'animation:fireworkSpark ' + dur + 's ease-out ' + del + 's both',
            '--fx:' + (Math.cos(angle) * dist).toFixed(0) + 'px',
            '--fy:' + (Math.sin(angle) * dist).toFixed(0) + 'px'
          ].join(';');
          document.body.appendChild(sp);
          var t = setTimeout(function () { if (sp.parentNode) sp.remove(); }, (parseFloat(dur) + parseFloat(del) + 0.2) * 1000);
          timers.push(t);
        })(i);
      }
      var next = setTimeout(burst, 4000 + Math.random() * 6000);
      timers.push(next);
    }

    var init = setTimeout(burst, 2000);
    timers.push(init);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* Candle flicker — velvet-vows */
  function initCandleFlicker() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var els = [];
    var count = isMobile ? 4 : 6;
    for (var i = 0; i < count; i++) {
      var wrap  = document.createElement('div');
      wrap.className = 'candle-wrap';
      var flame = document.createElement('div');
      var body  = document.createElement('div');
      flame.className = 'candle-flame';
      body.className  = 'candle-body';
      var dur = (1.0 + Math.random() * 0.7).toFixed(2);
      flame.style.setProperty('--cfl', dur + 's');
      wrap.appendChild(flame);
      wrap.appendChild(body);
      wrap.style.cssText = [
        'left:'   + (8 + i * (84 / count) + Math.random() * 4) + '%',
        'bottom:' + (2 + Math.random() * 5) + '%'
      ].join(';');
      layer.appendChild(wrap);
      els.push(wrap);
    }
    return function () { els.forEach(function (e) { e.remove(); }); };
  }

  /* Gold leaf particles — velvet-vows */
  function initGoldLeafDust() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;

    function spawnLeaf() {
      if (!running) return;
      var el  = document.createElement('div');
      el.className = 'gold-leaf';
      var dur = (2.5 + Math.random() * 2.5).toFixed(1);
      var del = (Math.random() * 0.8).toFixed(2);
      el.style.cssText = [
        'left:'  + (Math.random() * 95) + '%',
        'top:'   + (-10) + 'px',
        '--gld:' + dur + 's',
        '--gll:' + del + 's',
        '--lx:' + ((Math.random() - 0.5) * 120).toFixed(0) + 'px',
        '--ly:' + (80 + Math.random() * 80).toFixed(0) + 'px',
        '--lr:' + (280 + Math.random() * 360).toFixed(0) + 'deg'
      ].join(';');
      layer.appendChild(el);
      var t = setTimeout(function () { if (el.parentNode) el.remove(); }, (parseFloat(dur) + parseFloat(del) + 0.3) * 1000);
      timers.push(t);

      var next = setTimeout(spawnLeaf, 1800 + Math.random() * 3200);
      timers.push(next);
    }

    spawnLeaf();
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* Peacock walk — gulabo-garden */
  function initPeacock() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;

    function spawnPeacock() {
      if (!running) return;
      var wrap = document.createElement('div');
      var body = document.createElement('span');
      wrap.className  = 'peacock-wrap';
      body.className  = 'peacock-body';
      body.textContent = '🦚';
      var dur = (20 + Math.random() * 10).toFixed(0);
      wrap.style.setProperty('--pwd', dur + 's');
      wrap.style.setProperty('--pwl', '0s');
      wrap.appendChild(body);
      layer.appendChild(wrap);
      var t = setTimeout(function () { if (wrap.parentNode) wrap.remove(); }, parseFloat(dur) * 1000 + 800);
      timers.push(t);

      var next = setTimeout(spawnPeacock, (parseFloat(dur) + 8 + Math.random() * 10) * 1000);
      timers.push(next);
    }

    var init = setTimeout(spawnPeacock, 1000);
    timers.push(init);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* Ladybird (PetalPop) */
  function initLadybird() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;
    var els = [];
    var count = isMobile ? 3 : 5;

    for (var i = 0; i < count; i++) {
      (function (idx) {
        var el = document.createElement('div');
        el.className = 'ladybird';
        el.textContent = '🐞';
        var dur = (1.8 + Math.random() * 1.4).toFixed(1);
        var rot = (Math.random() * 30 - 15).toFixed(0);
        el.style.cssText = [
          'left:' + (5 + Math.random() * 88) + '%',
          'top:'  + (10 + Math.random() * 80) + '%',
          '--lbd:' + dur + 's',
          '--lb-rot:' + rot + 'deg'
        ].join(';');
        var t = setTimeout(function () {
          layer.appendChild(el);
          els.push(el);
        }, idx * 600);
        timers.push(t);
      })(i);
    }

    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); els.forEach(function (e) { e.remove(); }); };
  }

  /* Constellation dots (Starry Snuggle) */
  function initConstellations() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var els = [];
    var count = isMobile ? 20 : 35;
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('div');
      dot.className = 'constellation-dot';
      var dur = (1.5 + Math.random() * 2.5).toFixed(1);
      var del = -(Math.random() * 3).toFixed(1);
      var size = (1.5 + Math.random() * 2.5).toFixed(1);
      dot.style.cssText = [
        'left:'   + (Math.random() * 98) + '%',
        'top:'    + (Math.random() * 92) + '%',
        'width:'  + size + 'px',
        'height:' + size + 'px',
        '--ctd:' + dur + 's',
        '--ctl:' + del + 's'
      ].join(';');
      layer.appendChild(dot);
      els.push(dot);
    }
    return function () { els.forEach(function (e) { e.remove(); }); };
  }

  /* Sprinkles (Candy Cloud) */
  function initSprinkles() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;
    var colors  = ['#FF6B9D', '#A8EDEA', '#FFD93D', '#95E1D3', '#F38181', '#C0C0FF'];

    function spawnSprinkle() {
      if (!running) return;
      var el  = document.createElement('div');
      el.className = 'sprinkle';
      var dur = (3.5 + Math.random() * 3).toFixed(1);
      var del = (Math.random() * 0.5).toFixed(2);
      el.style.cssText = [
        'left:'    + (Math.random() * 98) + '%',
        'top:-12px',
        'background:' + colors[Math.floor(Math.random() * colors.length)],
        'transform:rotate(' + (Math.random() * 360).toFixed(0) + 'deg)',
        '--spd:' + dur + 's',
        '--spl:' + del + 's',
        '--sr:'  + ((Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)).toFixed(0) + 'deg'
      ].join(';');
      layer.appendChild(el);
      var t = setTimeout(function () { if (el.parentNode) el.remove(); }, (parseFloat(dur) + parseFloat(del) + 0.3) * 1000);
      timers.push(t);

      var next = setTimeout(spawnSprinkle, 400 + Math.random() * 800);
      timers.push(next);
    }

    var init = setTimeout(spawnSprinkle, 500);
    timers.push(init);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* ── Cat SVG strings (Mishri + Mochi) ───────────────────────────── */
  var MISHRI_SVG =
    '<ellipse cx="50" cy="68" rx="34" ry="26" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6"/>' +
    '<ellipse cx="50" cy="60" rx="20" ry="18" fill="#FFFFFF"/>' +
    '<circle cx="50" cy="35" r="26" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6"/>' +
    '<path d="M26 18 L18 2 L38 14Z" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6"/>' +
    '<path d="M27 16 L22 5 L36 13Z" fill="#F4A8C0" opacity="0.80"/>' +
    '<path d="M74 18 L82 2 L62 14Z" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6"/>' +
    '<path d="M73 16 L78 5 L64 13Z" fill="#F4A8C0" opacity="0.80"/>' +
    '<ellipse cx="40" cy="33" rx="6" ry="6.5" fill="#4A90D9"/>' +
    '<ellipse class="cat-pupil" cx="40" cy="33" rx="3" ry="5.5" fill="#1C2A50"/>' +
    '<circle cx="38" cy="31" r="1.5" fill="white" opacity="0.9"/>' +
    '<ellipse cx="60" cy="33" rx="6" ry="6.5" fill="#4A90D9"/>' +
    '<ellipse class="cat-pupil" cx="60" cy="33" rx="3" ry="5.5" fill="#1C2A50"/>' +
    '<circle cx="58" cy="31" r="1.5" fill="white" opacity="0.9"/>' +
    '<path d="M46 41 Q50 38 54 41 Q50 44 46 41Z" fill="#F490B4"/>' +
    '<path d="M47 44 Q50 47 53 44" fill="none" stroke="#D4A0B8" stroke-width="0.9" stroke-linecap="round"/>' +
    '<line x1="22" y1="39" x2="43" y2="41" stroke="#C8B8C8" stroke-width="0.7" opacity="0.6"/>' +
    '<line x1="22" y1="43" x2="43" y2="43" stroke="#C8B8C8" stroke-width="0.7" opacity="0.5"/>' +
    '<line x1="78" y1="39" x2="57" y2="41" stroke="#C8B8C8" stroke-width="0.7" opacity="0.6"/>' +
    '<line x1="78" y1="43" x2="57" y2="43" stroke="#C8B8C8" stroke-width="0.7" opacity="0.5"/>' +
    '<ellipse cx="33" cy="90" rx="10" ry="7" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.5"/>' +
    '<ellipse cx="67" cy="90" rx="10" ry="7" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.5"/>' +
    '<circle cx="28" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>' +
    '<circle cx="33" cy="93" r="2.5" fill="#F4B8CC" opacity="0.7"/>' +
    '<circle cx="38" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>' +
    '<circle cx="62" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>' +
    '<circle cx="67" cy="93" r="2.5" fill="#F4B8CC" opacity="0.7"/>' +
    '<circle cx="72" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>' +
    '<path d="M84 65 Q100 55 96 42 Q92 30 84 40 Q82 50 88 60" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round"/>' +
    '<path d="M84 65 Q100 55 96 42 Q92 30 84 40 Q82 50 88 60" fill="none" stroke="#F0E8F0" stroke-width="7" stroke-linecap="round"/>';

  var MOCHI_SVG =
    '<ellipse cx="50" cy="68" rx="36" ry="28" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.6"/>' +
    '<ellipse cx="50" cy="44" rx="16" ry="12" fill="#E8DCC8" opacity="0.5"/>' +
    '<ellipse cx="50" cy="60" rx="22" ry="18" fill="#FBF5EC"/>' +
    '<circle cx="50" cy="35" r="27" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.6"/>' +
    '<ellipse cx="50" cy="26" rx="18" ry="12" fill="#FBF5EC" opacity="0.5"/>' +
    '<path d="M25 17 L17 1 L37 13Z" fill="#B8B2C8" stroke="#A0A0B8" stroke-width="0.5"/>' +
    '<path d="M26 15 L20 4 L35 12Z" fill="#8C88A8" opacity="0.75"/>' +
    '<path d="M75 17 L83 1 L63 13Z" fill="#B8B2C8" stroke="#A0A0B8" stroke-width="0.5"/>' +
    '<path d="M74 15 L80 4 L65 12Z" fill="#8C88A8" opacity="0.75"/>' +
    '<ellipse cx="40" cy="33" rx="6" ry="6.5" fill="#7090C4"/>' +
    '<ellipse class="cat-pupil" cx="40" cy="33" rx="3" ry="5.5" fill="#1C2040"/>' +
    '<circle cx="38" cy="31" r="1.5" fill="white" opacity="0.9"/>' +
    '<ellipse cx="60" cy="33" rx="6" ry="6.5" fill="#7090C4"/>' +
    '<ellipse class="cat-pupil" cx="60" cy="33" rx="3" ry="5.5" fill="#1C2040"/>' +
    '<circle cx="58" cy="31" r="1.5" fill="white" opacity="0.9"/>' +
    '<path d="M46 41 Q50 38 54 41 Q50 44 46 41Z" fill="#2A2438"/>' +
    '<circle cx="49" cy="40" r="0.8" fill="rgba(255,255,255,0.35)"/>' +
    '<path d="M47 44 Q50 47 53 44" fill="none" stroke="#8A7A8A" stroke-width="0.9" stroke-linecap="round"/>' +
    '<line x1="21" y1="39" x2="43" y2="41" stroke="#C0B4B0" stroke-width="0.7" opacity="0.5"/>' +
    '<line x1="21" y1="43" x2="43" y2="43" stroke="#C0B4B0" stroke-width="0.7" opacity="0.45"/>' +
    '<line x1="79" y1="39" x2="57" y2="41" stroke="#C0B4B0" stroke-width="0.7" opacity="0.5"/>' +
    '<line x1="79" y1="43" x2="57" y2="43" stroke="#C0B4B0" stroke-width="0.7" opacity="0.45"/>' +
    '<ellipse cx="33" cy="91" rx="11" ry="7" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.5"/>' +
    '<ellipse cx="67" cy="91" rx="11" ry="7" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.5"/>' +
    '<circle cx="28" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>' +
    '<circle cx="33" cy="94" r="2.5" fill="#C0B8C8" opacity="0.65"/>' +
    '<circle cx="38" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>' +
    '<circle cx="62" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>' +
    '<circle cx="67" cy="94" r="2.5" fill="#C0B8C8" opacity="0.65"/>' +
    '<circle cx="72" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>' +
    '<path d="M16 65 Q0 55 4 40 Q8 26 18 36 Q22 46 16 58" fill="none" stroke="#F5EEE0" stroke-width="13" stroke-linecap="round"/>' +
    '<path d="M16 65 Q0 55 4 40 Q8 26 18 36 Q22 46 16 58" fill="none" stroke="#EDE4D4" stroke-width="9" stroke-linecap="round"/>';

  function makeCatSVG(content, h) {
    return '<svg class="cat-svg" viewBox="0 0 100 100" width="' + h + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + content + '</svg>';
  }

  /* Build SVG paw print (1 pad + 4 toe beans) */
  function makePawSVG(color) {
    return '<svg viewBox="0 0 22 22" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="11" cy="14" rx="7" ry="5.5" fill="' + color + '" opacity="0.6"/>' +
      '<circle cx="5"  cy="7.5" r="2.8" fill="' + color + '" opacity="0.6"/>' +
      '<circle cx="11" cy="5.5" r="2.8" fill="' + color + '" opacity="0.6"/>' +
      '<circle cx="17" cy="7.5" r="2.8" fill="' + color + '" opacity="0.6"/>' +
      '</svg>';
  }

  /* ── Kitty paw prints (Purrfect Pair) ────────────────────────────── */
  function initKittyPaws() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;
    var pawColors = ['#F2C8DC', '#C8C0D8'];
    var pawCount  = 0;
    var MAX_PAWS  = isMobile ? 4 : 8;

    function spawnPaw(x, y, colorIdx, delay) {
      if (!running || pawCount >= MAX_PAWS) return;
      pawCount++;
      var wrap = document.createElement('div');
      wrap.className = 'kitty-paw';
      wrap.style.cssText = [
        'left:' + x + '%',
        'top:'  + y + '%',
        '--pawd:' + (3.5 + Math.random() * 2).toFixed(1) + 's',
        '--pawl:' + delay.toFixed(2) + 's'
      ].join(';');
      wrap.innerHTML = makePawSVG(pawColors[colorIdx % 2]);
      layer.appendChild(wrap);
      var dur = parseFloat(wrap.style.getPropertyValue('--pawd') || '4');
      var t = setTimeout(function () { if (wrap.parentNode) { wrap.remove(); pawCount--; } }, (dur + delay + 0.3) * 1000);
      timers.push(t);
    }

    function spawnWalk() {
      if (!running) return;
      var cx    = 10 + Math.random() * 75;
      var cy    = 20 + Math.random() * 65;
      var color = Math.random() > 0.5 ? 0 : 1;
      var count = isMobile ? 1 : (Math.random() > 0.5 ? 4 : 1);
      for (var i = 0; i < count; i++) {
        spawnPaw(cx + i * 4, cy + i * 3, color, i * 0.28);
      }
      var next = setTimeout(spawnWalk, 3000 + Math.random() * 5000);
      timers.push(next);
    }

    var init = setTimeout(spawnWalk, 1200);
    timers.push(init);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* ── Yarn ball rolling across bottom (Purrfect Pair) ─────────────── */
  function initYarnBall() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;
    var colors  = ['#D994B8', '#9BB4DC'];
    var idx     = 0;

    function spawnYarn() {
      if (!running) return;
      var ball = document.createElement('div');
      ball.className = 'yarn-ball';
      var size = 22 + Math.random() * 14;
      var dur  = (6 + Math.random() * 4).toFixed(1);
      var col  = colors[idx % 2];
      idx++;
      ball.style.cssText = [
        'width:' + size + 'px',
        'height:' + size + 'px',
        'bottom:' + (4 + Math.random() * 8) + '%',
        'background: repeating-linear-gradient(45deg, ' + col + ' 0px, ' + col + ' 3px, transparent 3px, transparent 7px)',
        'box-shadow: inset 0 0 0 2px rgba(255,255,255,0.25)',
        '--yrd:' + dur + 's',
        '--yrl:0s'
      ].join(';');
      layer.appendChild(ball);
      var t = setTimeout(function () { if (ball.parentNode) ball.remove(); }, (parseFloat(dur) + 0.5) * 1000);
      timers.push(t);

      var interval = isMobile ? 40000 : 22000;
      var next = setTimeout(spawnYarn, interval + Math.random() * 8000);
      timers.push(next);
    }

    var init = setTimeout(spawnYarn, 3000);
    timers.push(init);
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* ── Floating whiskers (Purrfect Pair) ───────────────────────────── */
  function initFloatingWhiskers() {
    if (reducedMotion) return function () {};
    var layer = getEffectsLayer();
    if (!layer) return function () {};
    var timers = [];
    var running = true;
    var MAX_W   = isMobile ? 3 : 5;
    var wCount  = 0;

    function spawnWhisker() {
      if (!running || wCount >= MAX_W) return;
      wCount++;
      var ns  = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      var len = 36 + Math.random() * 18;
      var rot = (Math.random() * 30 - 15).toFixed(1);
      var dur = (5 + Math.random() * 3).toFixed(1);
      var del = (Math.random() * 0.8).toFixed(2);
      svg.setAttribute('class', 'cat-whisker');
      svg.setAttribute('viewBox', '0 0 ' + len + ' 4');
      svg.setAttribute('width', String(Math.round(len)));
      svg.setAttribute('height', '4');
      svg.setAttribute('aria-hidden', 'true');
      var line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', '0'); line.setAttribute('y1', '2');
      line.setAttribute('x2', String(len)); line.setAttribute('y2', '2');
      line.setAttribute('stroke', 'rgba(200,192,216,0.45)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      svg.style.cssText = [
        'left:' + (5 + Math.random() * 85) + '%',
        'top:'  + (30 + Math.random() * 55) + '%',
        '--whr:' + rot + 'deg',
        '--wfd:' + dur + 's',
        '--wfl:' + del + 's'
      ].join(';');
      layer.appendChild(svg);
      var t = setTimeout(function () { if (svg.parentNode) { svg.remove(); wCount--; } }, (parseFloat(dur) + parseFloat(del) + 0.3) * 1000);
      timers.push(t);

      var next = setTimeout(spawnWhisker, 2500 + Math.random() * 3000);
      timers.push(next);
    }

    spawnWhisker();
    return function () { running = false; timers.forEach(function (t) { clearTimeout(t); }); };
  }

  /* ── Cat cameo — Mishri + Mochi appear together (desktop only) ────── */
  function initCatCameo() {
    if (isMobile || reducedMotion) return function () {};
    var timers = [];
    var running = true;

    function spawnCameo() {
      if (!running) return;

      var wrap = document.createElement('div');
      wrap.className = 'cat-cameo-wrap';
      wrap.innerHTML =
        makeCatSVG(MOCHI_SVG, 78) +
        makeCatSVG(MISHRI_SVG, 74);
      document.body.appendChild(wrap);

      /* Blink animation interval for pupils */
      var blinkTimer = setInterval(function () {
        wrap.querySelectorAll('.cat-pupil').forEach(function (p) {
          p.style.transition = 'transform 0.1s ease';
          p.style.transform  = 'scaleY(0.06)';
          setTimeout(function () { p.style.transform = 'scaleY(1)'; }, 140);
        });
      }, 3500 + Math.random() * 2000);

      /* Heart bubble after 3s */
      var heartTimer = setTimeout(function () {
        if (!running || !wrap.parentNode) return;
        var heart = document.createElement('div');
        heart.className = 'cat-heart-bubble';
        heart.textContent = '♡';
        wrap.style.position = 'fixed'; /* ensure positioning context */
        wrap.appendChild(heart);
        setTimeout(function () { if (heart.parentNode) heart.remove(); }, 2600);
      }, 3200);

      /* Exit sequence: Mochi walks off first at 10s, Mishri at 12s */
      var exitTimer1 = setTimeout(function () {
        if (!wrap.parentNode) return;
        clearInterval(blinkTimer);
        var mochi = wrap.querySelector('.cat-svg:first-child');
        if (mochi) {
          mochi.style.transition = 'transform 1.8s ease-in, opacity 1.8s ease';
          mochi.style.transform  = 'translateX(-140px) scaleX(-1)';
          mochi.style.opacity    = '0';
        }
      }, 10000);

      var exitTimer2 = setTimeout(function () {
        if (!wrap.parentNode) return;
        var mishri = wrap.querySelector('.cat-svg:last-child');
        if (mishri) {
          mishri.style.transition = 'transform 1.6s ease-in, opacity 1.6s ease';
          mishri.style.transform  = 'translateX(-120px)';
          mishri.style.opacity    = '0';
        }
        setTimeout(function () { if (wrap.parentNode) wrap.remove(); }, 2000);
      }, 12000);

      timers.push(heartTimer, exitTimer1, exitTimer2);

      /* Schedule next cameo */
      var nextTimer = setTimeout(spawnCameo, 70000 + Math.random() * 20000);
      timers.push(nextTimer);

      return function () { clearInterval(blinkTimer); };
    }

    var initTimer = setTimeout(spawnCameo, 8000);
    timers.push(initTimer);

    return function () {
      running = false;
      timers.forEach(function (t) { clearTimeout(t); });
      document.querySelectorAll('.cat-cameo-wrap').forEach(function (el) { el.remove(); });
    };
  }

  /* ── Dispatch per-theme ambient effects ──────────────────────────── */
  var EFFECT_MODULES = {
    'fireflies':         initFireflies,
    'shooting-stars':    initShootingStars,
    'moon-glow':         initMoonGlow,
    'cherry-gusts':      initCherryGusts,
    'butterflies':       initButterflyFlutter,
    'drifting-clouds':   initDriftingClouds,
    'diyas':             initDiyas,
    'fireworks':         initFireworkBursts,
    'candles':           initCandleFlicker,
    'gold-leaf':         initGoldLeafDust,
    'peacock':           initPeacock,
    'ladybird':          initLadybird,
    'constellations':    initConstellations,
    'sprinkles':         initSprinkles,
    /* Purrfect Pair */
    'kitty-paws':        initKittyPaws,
    'yarn-ball':         initYarnBall,
    'floating-whiskers': initFloatingWhiskers,
    'cat-cameo':         initCatCameo
  };

  function initThemeAmbientEffects() {
    clearThemeEffects();
    var theme = (typeof ThemeController !== 'undefined') ? ThemeController.current() : null;
    if (!theme || !theme.ambientEffects || reducedMotion) return;
    theme.ambientEffects.forEach(function (name) {
      var fn = EFFECT_MODULES[name];
      if (fn) {
        var cleanup = fn();
        if (typeof cleanup === 'function') _effectCleanups.push(cleanup);
      }
    });
  }

  function clearThemeEffects() {
    _effectCleanups.forEach(function (fn) { try { fn(); } catch (e) {} });
    _effectCleanups = [];
    /* Remove any leftover effect elements */
    var layer = getEffectsLayer();
    if (layer) layer.innerHTML = '';
    /* Remove body-appended firework sparks */
    document.querySelectorAll('[style*="fireworkSpark"]').forEach(function (el) { el.remove(); });
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
    initPullToRestart();

    raf2(function () {
      initReveal();
      initHeart();
      initTypewriter();
      initChapterNav();
      initFloats();
      initChapterHeader();
      initTOCSheet();
      initHiddenChapter();
      initOrnamentsObserver();
      initDoubleTapLove();
      initClosingSignoff();
      initReplay();
      initShakeDetection();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
