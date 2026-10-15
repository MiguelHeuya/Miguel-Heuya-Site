/* ==========================================================================
   Miguel Heuya — thème & interactions (partagé par toutes les pages)
   - 6 palettes calibrées (3 claires, 3 sombres), contrastes vérifiés (WCAG AA)
   - Couleurs personnalisées (accent + fond) : tous les autres tons sont
     dérivés automatiquement pour garder un contraste lisible
   - Choix mémorisé dans le navigateur (localStorage)
   Ce fichier est chargé dans <head> (sans defer) pour éviter tout flash.
   ========================================================================== */
(function (root) {
  'use strict';

  /* ---------- Palettes ---------------------------------------------------- */
  var PRESETS = {
    ivoire:   { label: 'Ivoire',   mode: 'light', bg: '#F6F3EC', surface: '#FFFFFF', surface2: '#EFEBE1', line: '#DDD6C7', text: '#1B2430', muted: '#586271', accent: '#1E5B4C', accentText: '#1E5B4C', accentInk: '#FFFFFF', accentSoft: '#E1EBE5' },
    sable:    { label: 'Sable',    mode: 'light', bg: '#F1E9DC', surface: '#FAF5EB', surface2: '#E8DECC', line: '#D6C8B0', text: '#2B2218', muted: '#695B48', accent: '#9A4A2B', accentText: '#9A4A2B', accentInk: '#FFFFFF', accentSoft: '#EBDCCB' },
    brume:    { label: 'Brume',    mode: 'light', bg: '#EDF1F5', surface: '#FFFFFF', surface2: '#E2E8EF', line: '#CFD8E2', text: '#101C2B', muted: '#4E6077', accent: '#1F4E8C', accentText: '#1F4E8C', accentInk: '#FFFFFF', accentSoft: '#DCE6F2' },
    encre:    { label: 'Encre',    mode: 'dark',  bg: '#0F1B1A', surface: '#152523', surface2: '#1B2F2C', line: '#29423D', text: '#E9F0EC', muted: '#9DB2AB', accent: '#7FD3B0', accentText: '#7FD3B0', accentInk: '#0B1715', accentSoft: '#173530' },
    marine:   { label: 'Marine',   mode: 'dark',  bg: '#0D1626', surface: '#131F35', surface2: '#192A46', line: '#27395B', text: '#E7ECF5', muted: '#9AA9C3', accent: '#E3B866', accentText: '#E3B866', accentInk: '#1A1405', accentSoft: '#2A2A2F' },
    graphite: { label: 'Graphite', mode: 'dark',  bg: '#16171A', surface: '#1E2024', surface2: '#272A2F', line: '#34373D', text: '#EDEEF0', muted: '#9CA1A9', accent: '#9DB1F7', accentText: '#9DB1F7', accentInk: '#0E1426', accentSoft: '#23273A' }
  };
  var ORDER = ['ivoire', 'sable', 'brume', 'encre', 'marine', 'graphite'];
  var DEFAULT_PRESET = 'ivoire';
  var STORAGE_KEY = 'hsml-theme-v2';

  /* ---------- Maths couleur ----------------------------------------------- */
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function normHex(h) {
    h = String(h || '').trim();
    if (/^#[0-9a-f]{3}$/i.test(h)) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    return /^#[0-9a-f]{6}$/i.test(h) ? h.toUpperCase() : null;
  }
  function toRgb(h) { h = normHex(h); return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function toHex(rgb) { return '#' + rgb.map(function (v) { return clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0'); }).join('').toUpperCase(); }
  function mix(a, b, t) { var x = toRgb(a), y = toRgb(b); return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function lum(h) {
    var c = toRgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) { var l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  function minContrast(fg, bgs) { return Math.min.apply(null, bgs.map(function (b) { return contrast(fg, b); })); }
  // Rapproche `fg` de `target` jusqu'à atteindre le contraste demandé sur tous les fonds
  function ensureContrast(fg, bgs, min, target) {
    for (var t = 0; t <= 1.0001; t += 0.02) {
      var c = mix(fg, target, t);
      if (minContrast(c, bgs) >= min) return c;
    }
    return target;
  }
  var INK_DARK = '#14110F', INK_LIGHT = '#FFFFFF';
  // Encre lisible sur `bg` : on préfère blanc puis encre douce, sinon le meilleur des trois
  function bestInk(bg) {
    var cands = [INK_LIGHT, INK_DARK, '#000000'], best = cands[0], bc = 0;
    for (var i = 0; i < cands.length; i++) {
      var c = contrast(cands[i], bg);
      if (c >= 4.5) return cands[i];
      if (c > bc) { bc = c; best = cands[i]; }
    }
    return best;
  }
  // Premier ton candidat qui contraste assez avec `text`, sinon le plus contrasté
  function pickTone(text, cands, min) {
    var best = cands[0], bc = 0;
    for (var i = 0; i < cands.length; i++) {
      var c = contrast(text, cands[i]);
      if (c >= min) return cands[i];
      if (c > bc) { bc = c; best = cands[i]; }
    }
    return best;
  }

  /* ---------- Dérivation des tons ---------------------------------------- */
  function accentTokens(accent, bg, surface, text) {
    var dark = lum(bg) < 0.25, a = dark ? 0.2 : 0.12, soft = mix(bg, accent, a);
    // La teinte d'accent ne doit jamais faire passer le texte sous le seuil de lisibilité
    while (a > 0 && contrast(text, soft) < 4.5) { a = Math.max(0, a - 0.02); soft = mix(bg, accent, a); }
    return {
      accent: accent,
      accentText: ensureContrast(accent, [bg, surface, soft], 4.5, text),
      accentInk: bestInk(accent),
      accentSoft: soft
    };
  }
  function deriveFromBg(bg, accent) {
    var lightText = contrast(bg, '#FFFFFF') >= contrast(bg, '#000000'); // fond sombre → texte clair
    var end = lightText ? '#FFFFFF' : '#000000', text = end;
    for (var k = 0.93; k <= 1.0001; k += 0.01) {
      var c = mix(bg, end, k);
      if (contrast(c, bg) >= 7) { text = c; break; }
    }
    var surface, surface2;
    if (lightText) {
      surface  = pickTone(text, [mix(bg, '#FFFFFF', 0.05), mix(bg, '#000000', 0.12)], 7);
      surface2 = pickTone(text, [mix(bg, '#FFFFFF', 0.09), mix(bg, '#000000', 0.2)], 6);
    } else {
      surface  = pickTone(text, [mix(bg, '#FFFFFF', 0.55), mix(bg, '#FFFFFF', 0.8)], 7);
      surface2 = pickTone(text, [mix(bg, '#000000', 0.04), mix(bg, '#FFFFFF', 0.3)], 6);
    }
    var line = mix(bg, text, 0.16);
    var muted = ensureContrast(mix(text, bg, 0.4), [bg, surface, surface2], 4.6, text);
    var t = { mode: lightText ? 'dark' : 'light', bg: bg, surface: surface, surface2: surface2, line: line, text: text, muted: muted };
    var a = accentTokens(accent, bg, surface, text);
    for (var key in a) t[key] = a[key];
    return t;
  }

  /* ---------- État & application ------------------------------------------ */
  function load() {
    try { var s = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (s && typeof s === 'object') return s; } catch (e) {}
    return { preset: DEFAULT_PRESET };
  }
  function save(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }

  function resolve(state) {
    var base = PRESETS[state.preset] || PRESETS[DEFAULT_PRESET];
    var bg = normHex(state.bg), accent = normHex(state.accent);
    if (bg) return deriveFromBg(bg, accent || base.accent);
    if (accent) {
      var t = {}; for (var k in base) t[k] = base[k];
      var a = accentTokens(accent, base.bg, base.surface, base.text);
      for (var j in a) t[j] = a[j];
      return t;
    }
    return base;
  }

  var current = { state: load(), tokens: null };

  function apply(state) {
    var t = resolve(state), el = document.documentElement, s = el.style;
    s.setProperty('--bg', t.bg);
    s.setProperty('--surface', t.surface);
    s.setProperty('--surface-2', t.surface2);
    s.setProperty('--line', t.line);
    s.setProperty('--text', t.text);
    s.setProperty('--muted', t.muted);
    s.setProperty('--accent', t.accent);
    s.setProperty('--accent-text', t.accentText);
    s.setProperty('--accent-ink', t.accentInk);
    s.setProperty('--accent-soft', t.accentSoft);
    var rgb = toRgb(t.accent).join(', ');
    s.setProperty('--accent-rgb', rgb);
    /* alias conservés pour les pages de réalisations (anciennes variables) */
    s.setProperty('--primary', t.accent);
    s.setProperty('--primary-rgb', rgb);
    s.setProperty('--bg-custom', t.bg);
    el.setAttribute('data-mode', t.mode);
    el.setAttribute('data-theme', state.bg || state.accent ? 'custom' : state.preset);
    el.style.colorScheme = t.mode;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t.bg);
    current.state = state; current.tokens = t;
    return t;
  }

  var hasDom = typeof document !== 'undefined';
  // Appliqué immédiatement (script chargé dans <head>)
  if (hasDom) {
    document.documentElement.classList.add('js');
    apply(current.state);
  }

  /* ---------- Interface --------------------------------------------------- */
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  if (hasDom) ready(function () {
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* --- Menu mobile --- */
    var menuBtn = $('#menu-btn'), closeBtn = $('#close-btn'), mobileMenu = $('#mobile-menu');
    function setMenu(open) {
      if (!mobileMenu) return;
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('no-scroll', open);
      if (open && closeBtn) closeBtn.focus();
    }
    if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); if (menuBtn) menuBtn.focus(); });
    $$('#mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

    /* --- Panneau de thème --- */
    var toggle = $('#theme-toggle-btn'), panel = $('#theme-panel');
    var presetsBox = $('#theme-presets'), accentPicker = $('#accent-picker'), bgPicker = $('#bg-picker');
    var resetBtn = $('#theme-reset'), customTag = $('#theme-custom-tag');

    function setPanel(open) {
      if (!panel || !toggle) return;
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function swatchHtml(id) {
      var p = PRESETS[id];
      return '<span class="sw" style="--sw-bg:' + p.bg + ';--sw-surface:' + p.surface + ';--sw-accent:' + p.accent + ';--sw-text:' + p.text + '">' +
        '<i class="sw-a"></i><i class="sw-b"></i><i class="sw-c"></i></span><span class="sw-name">' + p.label + '</span>';
    }
    function buildPresets() {
      if (!presetsBox) return;
      presetsBox.innerHTML = '';
      ORDER.forEach(function (id) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'preset'; b.setAttribute('data-preset', id);
        b.setAttribute('aria-label', 'Thème ' + PRESETS[id].label);
        b.innerHTML = swatchHtml(id);
        b.addEventListener('click', function () { var s = { preset: id }; apply(s); save(s); sync(); });
        presetsBox.appendChild(b);
      });
    }
    function sync() {
      var st = current.state, t = current.tokens, custom = !!(st.bg || st.accent);
      if (presetsBox) $$('.preset', presetsBox).forEach(function (b) {
        var on = !custom && b.getAttribute('data-preset') === st.preset;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (accentPicker) accentPicker.value = t.accent.toLowerCase();
      if (bgPicker) bgPicker.value = t.bg.toLowerCase();
      if (customTag) customTag.hidden = !custom;
      if (resetBtn) resetBtn.hidden = !custom && st.preset === DEFAULT_PRESET;
    }

    if (toggle && panel) {
      buildPresets();
      toggle.addEventListener('click', function (e) { e.stopPropagation(); setPanel(!panel.classList.contains('open')); });
      document.addEventListener('click', function (e) {
        if (panel.classList.contains('open') && !panel.contains(e.target) && !toggle.contains(e.target)) setPanel(false);
      });
      if (accentPicker) accentPicker.addEventListener('input', function (e) {
        var s = { preset: current.state.preset, bg: current.state.bg, accent: e.target.value };
        apply(s); save(s); sync();
        // `sync` réécrit la valeur du sélecteur : on garde le focus de l'utilisateur
      });
      if (bgPicker) bgPicker.addEventListener('input', function (e) {
        var s = { preset: current.state.preset, bg: e.target.value, accent: current.state.accent };
        apply(s); save(s); sync();
      });
      if (resetBtn) resetBtn.addEventListener('click', function () { var s = { preset: DEFAULT_PRESET }; apply(s); save(s); sync(); });
      sync();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      setPanel(false); setMenu(false);
    });

    /* --- Lien actif dans la navigation --- */
    var sections = $$('main section[id], section[id]');
    var links = $$('.nav-link');
    if (sections.length && links.length && 'IntersectionObserver' in window) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
        var cur = null;
        sections.forEach(function (s) { if (seen[s.id]) cur = s.id; });
        links.forEach(function (a) {
          var on = cur && a.getAttribute('href') === '#' + cur;
          a.classList.toggle('active', !!on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      }, { rootMargin: '-35% 0px -60% 0px', threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }

    /* --- Apparition douce + barres de niveau (une seule fois) --- */
    var targets = $$('.reveal, .bar');
    var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduce) {
      targets.forEach(function (el) { el.classList.add('in', 'visible'); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in', 'visible'); ro.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      targets.forEach(function (el) { ro.observe(el); });
    }

    /* --- Bouton « haut de page » --- */
    var toTop = $('#to-top');
    if (toTop) {
      var onScroll = function () { toTop.classList.toggle('show', root.scrollY > 700); };
      root.addEventListener('scroll', onScroll, { passive: true }); onScroll();
      toTop.addEventListener('click', function () { root.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    }

    /* --- « À propos du cadeau » --- */
    var giftBtn = $('#gift-toggle-btn'), giftNote = $('#gift-note');
    if (giftBtn && giftNote) {
      giftBtn.addEventListener('click', function () {
        var open = giftNote.hasAttribute('hidden');
        if (open) giftNote.removeAttribute('hidden'); else giftNote.setAttribute('hidden', '');
        giftBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    /* --- Visionneuse d'image (pages de réalisations) --- */
    var lb = $('#lightbox'), lbImg = $('#lightbox-img');
    root.openLightbox = function (src) { if (!lb) return; lbImg.src = src; lb.classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
    root.closeLightbox = function () { if (!lb) return; lb.classList.add('hidden'); document.body.style.overflow = ''; };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') root.closeLightbox(); });
  });

  /* Export pour les tests (Node) */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PRESETS: PRESETS, ORDER: ORDER, contrast: contrast, deriveFromBg: deriveFromBg, accentTokens: accentTokens, mix: mix };
  }
})(typeof window !== 'undefined' ? window : this);
