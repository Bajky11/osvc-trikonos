(() => {
  'use strict';
  const section = document.getElementById('sezona');
  if (!section) return;
  const panels = [...section.querySelectorAll('.seasonal-panel')];
  // Local product photos stand in for the final seasonal collections.
  const photos = [
    ['tancici-bukacek-1.jpg', 'Tančící Bukáček'],
    ['dvoubarevna-betynka-1.jpg', 'Dvoubarevná Betynka'],
    ['nemuzes-me-tisknout-1.jpg', 'Nemůžeš mě tisknout'],
    ['another-week-1.jpg', 'Another Week'],
    ['stesti-si-nekoupis-1.jpg', 'Štěstí si nekoupíš'],
    ['tancici-bukacek-2.jpg', 'Tančící Bukáček — detail']
  ];
  let active = null;
  function open(panel) {
    active = panel;
    section.classList.add('is-expanded');
    panels.forEach(item => {
      const selected = item === panel;
      item.classList.toggle('is-active', selected);
      item.inert = !selected;
      const button = item.querySelector('.seasonal-open');
      button.setAttribute('aria-expanded', String(selected));
      button.tabIndex = selected ? -1 : 0;
      const detail = item.querySelector('.seasonal-detail');
      detail.inert = !selected;
      detail.setAttribute('aria-hidden', String(!selected));
    });
    panel.querySelector('.seasonal-back').focus({ preventScroll: true });
  }
  function close() {
    if (!active) return;
    const previous = active;
    active = null;
    section.classList.remove('is-expanded');
    panels.forEach(panel => {
      panel.classList.remove('is-active');
      panel.inert = false;
      const button = panel.querySelector('.seasonal-open');
      button.setAttribute('aria-expanded', 'false');
      button.tabIndex = 0;
    });
    previous.querySelector('.seasonal-open').focus({ preventScroll: true });
    panels.forEach(panel => {
      const detail = panel.querySelector('.seasonal-detail');
      detail.inert = true;
      detail.setAttribute('aria-hidden', 'true');
    });
  }
  panels.forEach((panel, index) => {
    const strip = panel.querySelector('.seasonal-strip');
    const subtitle = document.createElement('p');
    subtitle.className = 'seasonal-subtitle';
    subtitle.textContent = panel.dataset.season === 'christmas'
      ? 'Trocha hor. Trocha kouzla. Radost pod stromeček.'
      : 'Trocha tajemna. Trocha nadsázky. Halloween po svém.';
    panel.querySelector('.seasonal-heading').append(subtitle);
    strip.setAttribute('aria-roledescription', 'karusel');
    const images = index ? [...photos].reverse() : photos;
    images.forEach(([filename, name]) => {
      const card = document.createElement('figure');
      card.className = 'seasonal-card';
      const image = document.createElement('img');
      image.src = `assets/products-trikonos/${filename}`;
      image.alt = name;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.width = 600;
      image.height = 700;
      image.draggable = false;
      const caption = document.createElement('figcaption');
      caption.textContent = name;
      card.append(image, caption);
      strip.append(card);
    });
    panel.querySelector('.seasonal-open').addEventListener('click', () => { if (!active) open(panel); });
    panel.querySelector('.seasonal-back').addEventListener('click', close);
    function move(direction) {
      const card = strip.querySelector('.seasonal-card');
      const gap = parseFloat(getComputedStyle(strip).gap) || 0;
      strip.scrollBy({
        left: direction * (card.getBoundingClientRect().width + gap),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
    }
    panel.querySelector('[data-seasonal-prev]').addEventListener('click', () => move(-1));
    panel.querySelector('[data-seasonal-next]').addEventListener('click', () => move(1));
    strip.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    });
  });
  section.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) { event.preventDefault(); close(); }
  });
})();
