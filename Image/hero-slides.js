/* Diaporama de l'accueil : fondu enchaîné entre les 4 images.
   - Défilement automatique (pause au survol, hors écran, onglet masqué)
   - Aucun défilement automatique si « réduire les animations » est activé
   - Points de navigation créés ici (sans JS : la première image reste affichée) */
(function () {
  'use strict';
  var box = document.querySelector('.hero-slides');
  if (!box) return;
  var slides = Array.prototype.slice.call(box.querySelectorAll('.slide'));
  if (slides.length < 2) return;

  var DELAY = 5500, FADE = 1300;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, timer = null, cleanTimer = null, hovering = false, visible = true;

  var dotsWrap = document.createElement('div');
  dotsWrap.className = 'slide-dots';
  var dots = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slide-dot';
    b.setAttribute('aria-label', 'Afficher l’image ' + (i + 1) + ' sur ' + slides.length);
    b.addEventListener('click', function () { go(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });
  box.appendChild(dotsWrap);

  function paintDots() {
    dots.forEach(function (d, i) {
      if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }

  function go(i) {
    if (i === cur) return;
    var prev = slides[cur];
    slides.forEach(function (s) { s.classList.remove('is-prev'); });
    prev.classList.remove('is-active');
    prev.classList.add('is-prev');          /* reste visible dessous pendant le fondu */
    prev.setAttribute('aria-hidden', 'true');
    cur = i;
    slides[cur].classList.add('is-active');
    slides[cur].removeAttribute('aria-hidden');
    paintDots();
    clearTimeout(cleanTimer);
    cleanTimer = setTimeout(function () { prev.classList.remove('is-prev'); }, FADE);
  }

  function next() {
    var n = (cur + 1) % slides.length;
    var img = slides[n].querySelector('img');
    if (img && !img.complete) return;       /* image pas encore chargée : on réessaie au prochain tour */
    go(n);
  }

  function stop() { clearInterval(timer); timer = null; }
  function start() { if (reduce || timer || hovering || !visible || document.hidden) return; timer = setInterval(next, DELAY); }
  function restart() { stop(); start(); }

  box.addEventListener('mouseenter', function () { hovering = true; stop(); });
  box.addEventListener('mouseleave', function () { hovering = false; start(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); else stop(); }, { threshold: 0.25 }).observe(box);
  }

  paintDots();
  start();
})();
