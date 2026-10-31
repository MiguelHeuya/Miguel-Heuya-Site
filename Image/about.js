/* Section « À propos » : boutons « Voir plus » / « Voir moins ».
   Sans JavaScript, tout le texte reste affiché et le bouton reste caché. */
(function () {
  'use strict';
  var body = document.getElementById('about-body');
  var more = document.getElementById('about-more');
  var btn = document.getElementById('about-toggle');
  var sec = document.getElementById('apropos');
  if (!body || !more || !btn) return;

  var label = btn.querySelector('.about-toggle-label');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  body.classList.add('is-collapsible');
  btn.hidden = false;

  function setOpen(open) {
    body.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    label.textContent = open ? 'Voir moins' : 'Voir plus';
  }

  btn.addEventListener('click', function () {
    var open = !body.classList.contains('is-open');
    setOpen(open);
    /* Au repli, on revient en haut de la section si on l'avait dépassée */
    if (!open && sec && sec.getBoundingClientRect().top < 0) {
      sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  });

  setOpen(false);
})();
