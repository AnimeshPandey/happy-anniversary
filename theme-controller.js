var ThemeController = (function () {
  'use strict';

  var currentIndex = 0;
  var isTransitioning = false;

  /* Apply all CSS variable tokens to :root */
  function applyTokens(theme) {
    var root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    Object.keys(theme.tokens).forEach(function (prop) {
      root.style.setProperty(prop, theme.tokens[prop]);
    });
  }

  /* Fade content out, swap, fade back in */
  function animateContent(fn) {
    var content = document.querySelector('.ts-content');
    if (!content) { fn(); return; }

    content.classList.add('ts-content--exit');
    setTimeout(function () {
      fn();
      content.classList.remove('ts-content--exit');
      content.classList.add('ts-content--enter');
      setTimeout(function () {
        content.classList.remove('ts-content--enter');
      }, 400);
    }, 180);
  }

  /* Update the visible UI labels */
  function updateUI(theme) {
    var nameEl    = document.getElementById('ts-name');
    var taglineEl = document.getElementById('ts-tagline');
    var iconEl    = document.getElementById('ts-icon');
    var announceEl = document.getElementById('ts-announce');

    if (nameEl)    nameEl.textContent    = theme.name;
    if (taglineEl) taglineEl.textContent = theme.tagline;
    if (iconEl)    iconEl.textContent    = theme.icon;
    if (announceEl) announceEl.textContent = 'Theme changed to ' + theme.name;

    // Update dot states
    var dots = document.querySelectorAll('.ts-dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('ts-dot--active', i === currentIndex);
      dot.setAttribute('aria-pressed', i === currentIndex ? 'true' : 'false');
    });
  }

  /* Build the dot indicators once */
  function buildDots(container) {
    THEMES.forEach(function (theme, i) {
      var btn = document.createElement('button');
      btn.className = 'ts-dot' + (i === 0 ? ' ts-dot--active' : '');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Select ' + theme.name);
      btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      btn.addEventListener('click', function () { set(i); });
      container.appendChild(btn);
    });
  }

  /* ── Public API ── */

  function set(index) {
    if (isTransitioning) return;
    isTransitioning = true;

    currentIndex = ((index % THEMES.length) + THEMES.length) % THEMES.length;
    var theme = THEMES[currentIndex];

    /* Background transitions via CSS (background-color is animatable) */
    applyTokens(theme);

    /* Animate text swap */
    animateContent(function () { updateUI(theme); });

    setTimeout(function () { isTransitioning = false; }, 600);
  }

  function cycle() {
    set(currentIndex + 1);
  }

  function current() {
    return THEMES[currentIndex];
  }

  function init() {
    var dotsEl = document.getElementById('ts-dots');
    if (dotsEl) buildDots(dotsEl);

    applyTokens(THEMES[0]);
    updateUI(THEMES[0]);
  }

  return { init: init, set: set, cycle: cycle, current: current };
})();
