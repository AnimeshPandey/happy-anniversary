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
    /* Lock scroll while selector/ceremony are showing */
    document.body.style.overflow = 'hidden';

    var savedIdx = loadSavedTheme();
    ThemeController.init();
    if (savedIdx !== 0) ThemeController.set(savedIdx);

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
      reshapePetals();
      flashThemeTransition();
      haptic(20);
      var orb = document.querySelector('.ts-orb');
      if (orb) {
        orb.classList.remove('pulse');
        void orb.offsetWidth;
        orb.classList.add('pulse');
        setTimeout(function () { orb.classList.remove('pulse'); }, 700);
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

    setTimeout(function () { title.classList.add('visible'); }, 1200);
    setTimeout(function () { if (recipient) recipient.classList.add('visible'); }, 1900);
    setTimeout(function () { if (date) date.classList.add('visible'); }, 2600);
    setTimeout(function () {
      if (days) { days.classList.add('visible'); initDaysCounter(); }
    }, 3200);
    setTimeout(function () {
      if (btn) btn.classList.add('visible');
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
      ceremony.style.display = 'none';

      if (overlay && !reducedMotion) {
        var cx = window.innerWidth  / 2;
        var cy = window.innerHeight / 2;
        overlay.style.setProperty('--pcx', cx + 'px');
        overlay.style.setProperty('--pcy', cy + 'px');
        overlay.classList.add('expanding');

        /* Use setTimeout matching CSS durations (0.38s expand, 0.44s collapse) */
        setTimeout(function () {
          overlay.classList.remove('expanding');
          overlay.classList.add('collapsing');
          setTimeout(function () {
            overlay.classList.remove('collapsing');
            showJourneyUI();
          }, 460);
        }, 400);
      } else {
        showJourneyUI();
      }
    }

    btn.addEventListener('click', dismiss);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dismiss(); }
    });
  }

  function showJourneyUI() {
    /* Restore scrolling now that journey is active */
    document.body.style.overflow = '';

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

    /* Use 'instant' to bypass any smooth-scroll so the
       journey always starts at the very top regardless of prior scroll. */
    window.scrollTo({ top: 0, behavior: 'instant' });

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
    document.title = chapterTitle ? chapterTitle + ' — Happy Anniversary' : 'Happy Anniversary';
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
  function playChime(chapterIndex) {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77,
                 1046.5, 1174.66, 1318.51, 1396.91, 1567.98];
    var freq  = notes[(chapterIndex || 0) % notes.length];

    function doPlay() {
      try {
        var osc  = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.3);
      } catch (e) {}
    }

    if (ctx.state === 'running') {
      doPlay();
    } else {
      ctx.resume().then(doPlay).catch(function () {});
    }
  }

  /* ── Sound toggle (ambient audio + AudioContext unlock) ──────────── */
  function initSound() {
    var btn   = document.getElementById('sound-toggle');
    var audio = document.getElementById('ambient-audio');
    if (!btn) return;
    var playing = false;

    btn.addEventListener('click', function () {
      /* Unlock Web Audio on first user gesture so chimes work */
      var ctx = getAudioCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(function () {});

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
        }).catch(function () {
          /* No audio file — AudioContext is still unlocked for chimes */
        });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(function () {
        document.body.style.overflow = 'hidden'; /* re-lock scroll for ceremony */
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
