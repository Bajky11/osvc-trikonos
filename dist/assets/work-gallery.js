(() => {
  'use strict';
  const photos = Array.from(document.querySelectorAll('.shop-work-gallery a[data-work-photo]'));
  if (!photos.length) return;
  const viewAll = document.querySelector('[data-work-view-all]');
  const gallery = document.querySelector('.shop-work-gallery');
  const track = document.createElement('div');
  track.className = 'shop-work-track';
  const group = document.createElement('div');
  group.className = 'shop-work-group';
  photos.forEach(photo => group.append(photo));
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  const copies = Array.from(duplicate.querySelectorAll('a'));
  copies.forEach(photo => { photo.tabIndex = -1; });
  track.append(group, duplicate);
  gallery.append(track);
  gallery.classList.add('is-marquee');
  function updateVisibility() {
    gallery.classList.toggle('is-document-hidden', document.hidden);
  }
  document.addEventListener('visibilitychange', updateVisibility);
  updateVisibility();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      gallery.classList.toggle('is-offscreen', !entries[0].isIntersecting);
    });
    observer.observe(gallery);
  }
  const dialog = document.createElement('dialog');
  dialog.id = 'work-lightbox';
  dialog.className = 'work-lightbox';
  dialog.setAttribute('aria-labelledby', 'work-lightbox-title');
  dialog.innerHTML = `
    <h2 id="work-lightbox-title" class="shop-sr-only">Fotografie realizací</h2>
    <button type="button" class="work-lightbox-button work-lightbox-close" data-close aria-label="Zavřít galerii" title="Zavřít (Esc)" autofocus>×</button>
    <div class="work-lightbox-frame"><img alt="" hidden><p class="work-lightbox-status" role="status"></p></div>
    <button type="button" class="work-lightbox-button work-lightbox-prev" data-prev aria-label="Předchozí fotografie" title="Předchozí (←)">←</button>
    <span class="work-lightbox-count" role="status" aria-live="polite"></span>
    <button type="button" class="work-lightbox-button work-lightbox-next" data-next aria-label="Další fotografie" title="Další (→)">→</button>`;
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const status = dialog.querySelector('.work-lightbox-status');
  const count = dialog.querySelector('.work-lightbox-count');
  let index = 0;
  let request = 0;
  let opener = null;

  function show(position) {
    index = (position + photos.length) % photos.length;
    const photo = photos[index];
    const alt = photo.querySelector('img').alt;
    const version = ++request;
    image.hidden = true;
    image.alt = alt;
    count.textContent = `${index + 1} / ${photos.length}`;
    status.textContent = 'Načítání fotografie…';
    const preload = new Image();
    preload.onload = () => {
      if (version !== request || !dialog.open) return;
      image.src = preload.src;
      image.hidden = false;
      status.textContent = '';
    };
    preload.onerror = () => {
      if (version !== request || !dialog.open) return;
      status.textContent = 'Fotografii se nepodařilo načíst. Zkus jinou.';
    };
    preload.src = photo.href;
  }

  function bindOpener(element, position, focusTarget = element) {
    element.setAttribute('aria-haspopup', 'dialog');
    element.setAttribute('aria-controls', dialog.id);
    element.addEventListener('click', event => {
      event.preventDefault();
      opener = focusTarget;
      gallery.classList.add('is-modal-open');
      dialog.showModal();
      show(position);
    });
  }
  photos.forEach((photo, position) => bindOpener(photo, position));
  copies.forEach((photo, position) => bindOpener(photo, position, photos[position]));
  if (viewAll) bindOpener(viewAll, 0);
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    ++request;
    image.removeAttribute('src');
    image.hidden = true;
    gallery.classList.remove('is-modal-open');
    opener?.focus({ preventScroll: true });
  });
})();
