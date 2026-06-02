(function () {
  'use strict';

  /* ── Petals ──────────────────────────────────────────────────── */
  function initPetals() {
    var container = document.getElementById('petals-layer');
    if (!container) return;

    var colors = ['#F4A0B0', '#E8789A', '#FBBEC9', '#D4A0B8', '#F9C4D4', '#EFAABF'];
    var count = 30;

    for (var i = 0; i < count; i++) {
      var petal = document.createElement('div');
      petal.className = 'petal';

      var x        = (Math.random() * 102).toFixed(1);
      var size     = (8 + Math.random() * 11).toFixed(1);
      var duration = (7 + Math.random() * 10).toFixed(1);
      var delay    = -(Math.random() * 18).toFixed(1);
      var drift    = ((Math.random() - 0.5) * 130).toFixed(0);
      var rotate   = (360 + Math.floor(Math.random() * 400));
      var color    = colors[Math.floor(Math.random() * colors.length)];

      petal.style.left             = x + '%';
      petal.style.width            = size + 'px';
      petal.style.height           = (size * 1.45).toFixed(1) + 'px';
      petal.style.background       = color;
      petal.style.animationDuration = duration + 's';
      petal.style.animationDelay   = delay + 's';
      petal.style.setProperty('--drift', drift + 'px');
      petal.style.setProperty('--end-rotate', rotate + 'deg');

      container.appendChild(petal);
    }
  }

  /* ── Ceremony sequence ───────────────────────────────────────── */
  function runCeremonySequence() {
    var title = document.getElementById('ceremony-heading');
    var date  = document.getElementById('ceremony-date');
    var btn   = document.getElementById('begin-btn');

    if (!title) return;
    setTimeout(function () { title.classList.add('visible'); }, 1800);
    setTimeout(function () { if (date) date.classList.add('visible'); }, 2800);
    setTimeout(function () { if (btn)  btn.classList.add('visible'); }, 4100);
  }

  /* ── Build image placeholder ─────────────────────────────────── */
  function buildPlaceholder(imageId) {
    var slot = IMAGE_SLOTS[imageId];
    if (!slot) {
      var empty = document.createElement('div');
      return empty;
    }

    var fig = document.createElement('figure');
    fig.className = 'image-placeholder';
    fig.style.setProperty('--aspect', slot.aspectRatio);
    fig.setAttribute('role', 'img');
    fig.setAttribute('aria-label', slot.placeholder);

    // Picture-frame SVG icon
    var ns = 'http://www.w3.org/2000/svg';
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
    rect.setAttribute('x', '2'); rect.setAttribute('y', '2');
    rect.setAttribute('width', '28'); rect.setAttribute('height', '28');
    rect.setAttribute('rx', '2');

    var circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', '11'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '3');

    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M2 24 l8-8 5 5 5-5 12 10');

    svg.appendChild(rect);
    svg.appendChild(circle);
    svg.appendChild(path);

    var text = document.createElement('p');
    text.className = 'ph-text';
    text.textContent = slot.placeholder;

    fig.appendChild(svg);
    fig.appendChild(text);
    return fig;
  }

  /* ── Build opening panels ────────────────────────────────────── */
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

  /* ── Build chapters ──────────────────────────────────────────── */
  function buildChapters() {
    var container = document.getElementById('chapters-container');
    if (!container) return;

    SITE.chapters.forEach(function (ch, idx) {
      var article = document.createElement('article');
      article.className = 'chapter chapter--' + ch.layout;
      article.id = 'chapter-' + ch.number;

      // Image column
      var imgWrap = document.createElement('div');
      imgWrap.className = 'chapter-image-wrap reveal ' +
        (ch.layout === 'left' ? 'reveal-left' : 'reveal-right');
      imgWrap.appendChild(buildPlaceholder(ch.imageId));

      // Text column
      var textWrap = document.createElement('div');
      textWrap.className = 'chapter-text-wrap reveal ' +
        (ch.layout === 'left' ? 'reveal-right' : 'reveal-left');

      var num = document.createElement('div');
      num.className = 'chapter-number';
      num.textContent = ch.number;

      var title = document.createElement('h2');
      title.className = 'chapter-title';
      title.textContent = ch.title;

      var body = document.createElement('p');
      body.className = 'chapter-body';
      body.textContent = ch.body;

      var ornament = document.createElement('div');
      ornament.className = 'chapter-ornament';
      ornament.setAttribute('aria-hidden', 'true');
      var dot = document.createElement('span');
      dot.className = 'chapter-ornament-dot';
      ornament.appendChild(dot);

      textWrap.appendChild(num);
      textWrap.appendChild(title);
      textWrap.appendChild(body);
      textWrap.appendChild(ornament);

      article.appendChild(imgWrap);
      article.appendChild(textWrap);
      container.appendChild(article);

      // Decorative flourish after every 4th chapter
      if ((idx + 1) % 4 === 0 && idx < SITE.chapters.length - 1) {
        container.appendChild(buildFlourish());
      }
    });
  }

  function buildFlourish() {
    var div = document.createElement('div');
    div.className = 'chapter-flourish';
    div.setAttribute('aria-hidden', 'true');
    var ns = 'http://www.w3.org/2000/svg';
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

  /* ── Build crescendo ─────────────────────────────────────────── */
  function buildCrescendo() {
    var l1 = document.getElementById('crescendo-line1');
    var l2 = document.getElementById('crescendo-line2');
    var l3 = document.getElementById('crescendo-line3');
    if (l1) l1.textContent = SITE.crescendo.line1;
    if (l2) l2.textContent = SITE.crescendo.line2;
    if (l3) l3.textContent = SITE.crescendo.line3;
  }

  /* ── Build closing ───────────────────────────────────────────── */
  function buildClosing() {
    var imgWrap = document.getElementById('closing-image-wrap');
    if (imgWrap) imgWrap.appendChild(buildPlaceholder(SITE.closing.imageId));

    var msg = document.getElementById('closing-message');
    if (msg) msg.textContent = SITE.closing.message;

    var sign = document.getElementById('closing-signoff');
    if (sign) sign.textContent = SITE.closing.signoff;
  }

  /* ── Intersection Observer for reveals ──────────────────────── */
  function initReveal() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── SVG Heart draw ──────────────────────────────────────────── */
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

    var heartWrap = document.querySelector('.heart-wrap');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          path.style.strokeDashoffset = '0';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(heartWrap || path);
  }

  /* ── Begin button ────────────────────────────────────────────── */
  function initBeginButton() {
    var btn      = document.getElementById('begin-btn');
    var ceremony = document.getElementById('ceremony');
    if (!btn || !ceremony) return;

    function dismiss() {
      ceremony.classList.add('dismissed');
      ceremony.addEventListener('transitionend', function handler() {
        ceremony.style.display = 'none';
        ceremony.removeEventListener('transitionend', handler);
      });
    }

    btn.addEventListener('click', dismiss);

    // Also allow keyboard Enter/Space
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dismiss(); }
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    initPetals();
    runCeremonySequence();
    buildOpeningPanels();
    buildChapters();
    buildCrescendo();
    buildClosing();
    initBeginButton();

    // Defer observer setup until after DOM paint
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        initReveal();
        initHeart();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
