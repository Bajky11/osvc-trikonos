(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const headerNav = header.querySelector('.nav');
  const hero = document.getElementById('domu');
  const workSection = document.getElementById('nase-prace');
  const seasonalSection = document.getElementById('sezona');
  const sectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = sectionLinks.map(link => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) })).filter(item => item.section);
  let headerFrame = null;

  function updateHeader() {
    // Use the reserved height, not the changing header height, to avoid flicker.
    const ribbonHeight = parseFloat(getComputedStyle(header).getPropertyValue('--ribbon-height')) || 0;
    const workBounds = workSection?.getBoundingClientRect();
    const sectionLine = headerNav.offsetHeight + ribbonHeight + 1;
    const inWorkSection = Boolean(workBounds && workBounds.top <= sectionLine && workBounds.bottom > sectionLine);
    const seasonalBounds = seasonalSection?.getBoundingClientRect();
    const inSeasonalSection = Boolean(seasonalBounds && seasonalBounds.top <= sectionLine && seasonalBounds.bottom > sectionLine);
    const solid = !hero || window.scrollY > 64;
    const hasRibbon = !inWorkSection && !inSeasonalSection && (!hero || hero.getBoundingClientRect().bottom <= sectionLine);
    const readingLine = header.offsetHeight + 48;
    let current = null;
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= readingLine) current = item;
    }
    // The short footer may never reach the top edge of the viewport.
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    // Finish all layout reads before changing classes or attributes.
    header.classList.toggle('is-solid', solid);
    header.classList.toggle('has-ribbon', hasRibbon);
    for (const item of sections) {
      const active = item === current;
      item.link.classList.toggle('active', active);
      if (active && item.link.getAttribute('aria-current') !== 'location') item.link.setAttribute('aria-current', 'location');
      else if (!active && item.link.hasAttribute('aria-current')) item.link.removeAttribute('aria-current');
    }
    headerFrame = null;
  }

  function scheduleHeaderUpdate() {
    if (headerFrame === null) headerFrame = requestAnimationFrame(updateHeader);
  }

  window.addEventListener('scroll', scheduleHeaderUpdate, { passive: true });
  window.addEventListener('resize', scheduleHeaderUpdate);
  window.addEventListener('pageshow', scheduleHeaderUpdate);
  updateHeader();

  // Keep generated products for filter/pagination tests alongside imported photos.
  const categories = [
    { id: 'bitcoin', subtitle: '…tričko pro bitcoinovou partu', names: ['Hodl klub', 'Digitální zlato', 'Blok za blokem', 'Satoshi tým'] },
    { id: 'parova', subtitle: '…párové tričko', names: ['Spolu na cestě', 'Moje druhá půlka', 'Lepší ve dvou', 'Dokonalá dvojka'] },
    { id: 'retro', subtitle: '…tričko s retro náladou', names: ['Zpátky do osmdesátek', 'Kazetový klub', 'Analogová duše', 'Staré dobré časy'] },
    { id: 'moudra', subtitle: '…tričko s myšlenkou', names: ['Všechno má čas', 'Méně je více', 'Klid v duši', 'Dnes je ten den'] },
    { id: 'sportovni', subtitle: '…tričko pro aktivní dny', names: ['Ještě jeden kilometr', 'Na vrchol', 'Běžecká duše', 'Síla v pohybu'] },
    { id: 'narozeninova', subtitle: '…narozeninové tričko', names: ['Limitovaná edice', 'Legenda slaví', 'Nejlepší ročník', 'Věk je jen číslo'] },
    { id: 'filmova', subtitle: '…tričko pro filmové fanoušky', names: ['Ještě jeden záběr', 'Filmový večer', 'Hlavní role', 'Po titulcích'] },
    { id: 'auto-moto', subtitle: '…tričko pro milovníky motorů', names: ['Na plný plyn', 'Dvě kola stačí', 'Garážový klub', 'Cesta je cíl'] },
    { id: 'sprosta', subtitle: '…tričko bez servítek', names: ['Dnes mě neštvi', 'Mám to na háku', 'Sakra dobrý den', 'Bez filtru'] },
    { id: 'damska', subtitle: '…dámské tričko', names: ['Sama sebou', 'Divoká a svobodná', 'Káva a klid', 'Moje tempo'] },
    { id: 'detska', subtitle: '…tričko pro malé dobrodruhy', names: ['Malý dobrodruh', 'Lesní průzkumník', 'Parta z hřiště', 'Velké malé sny'] },
    { id: 'merch', subtitle: '…tričko z horské party', names: ['Trikonoš klub', 'Z hor na každý den', 'Horská parta', 'Základní tábor'] }
  ];
  const shirtColors = [
    { name: 'Bílá', hex: '#ffffff' },
    { name: 'Černá', hex: '#252b28' },
    { name: 'Přírodní bílá', hex: '#e8dfca' },
    { name: 'Tmavě zelená', hex: '#244c3e' },
    { name: 'Modrá', hex: '#416681' },
    { name: 'Rezavá', hex: '#ad593e' }
  ];
  const shirtTypes = [
    { id: 'male', label: 'Pánské', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'female', label: 'Dámské', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'children', label: 'Dětské', sizes: ['98/104', '110/116', '122/128', '134/140', '146/152'] }
  ];
  const demoProducts = categories.flatMap((category, categoryIndex) => Array.from({ length: 16 }, (_, index) => {
    const image = (categoryIndex + index) % 6;
    return {
      id: `${category.id}-${index + 1}`,
      name: `${category.names[index % 4]}${index >= 4 ? ` / ${Math.floor(index / 4) + 1}` : ''}`,
      subtitle: category.subtitle,
      price: `${[590, 649, 690, 749, 790][index % 5]} Kč`,
      category: category.id, top: index < 4,
      x: (image % 3) * 50, y: image >= 3 ? 100 : 0,
      // Demo views of the same illustration. A view can also use its own src.
      images: [
        { x: (image % 3) * 50, y: image >= 3 ? 100 : 0, zoom: 1, label: 'Celý náhled' },
        { x: (image % 3) * 50, y: image >= 3 ? 100 : 0, zoom: 1.3, label: 'Detail ilustrace' },
        { x: (image % 3) * 50, y: image >= 3 ? 100 : 0, zoom: 1.65, label: 'Přiblížení ilustrace' }
      ],
      tag: index < 4 ? 'Top' : index === 4 ? 'Novinka' : ''
    };
  }));
  // Source categories and sales rankings were not imported, so do not invent them.
  const importedProducts = (window.TrikonosProducts || []).map(product => ({
    category: null, top: false, tag: '', ...product, imported: true
  }));
  const products = [...importedProducts, ...demoProducts];
  const grid = document.getElementById('shopGrid');
  const bestsellers = document.getElementById('shopBestsellers');
  const filters = document.querySelectorAll('.shop-filter');
  const toast = document.getElementById('shopToast');
  const cart = document.getElementById('shopCart');
  const pagination = document.getElementById('shopPagination');
  const detail = document.getElementById('productDetail');
  const related = document.getElementById('shopRelated');
  const pageSize = 12;
  let currentPage = 1;
  let activeCategory = 'all';
  const cartKey = 'trikonos-demo-cart';
  let cartItems = [];
  let count = 0;
  let toastTimer;
  const customColors = ['Bílá', 'Černá', 'Lesní zelená', 'Modrá', 'Červená', 'Písková', 'Šedá', 'Námořnická', 'Vínová', 'Růžová', 'Hořčicová', 'Terakota'];
  function validCustomItem(item) {
    const design = item?.design;
    return item?.id === 'custom-print'
      && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99
      && shirtTypes.some(type => type.id === item.type && type.sizes.includes(item.size))
      && customColors.includes(item.color)
      && typeof design?.name === 'string' && design.name.length <= 255
      && typeof design.src === 'string'
      && (/^assets\/designs\/exec-[a-f0-9-]+\.png$/.test(design.src) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(design.src))
      && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(design[key]))
      && design.width > 0 && design.height > 0 && design.x >= 330 && design.y >= 330
      && design.x + design.width <= 800.001 && design.y + design.height <= 980.001;
  }
  window.TrikonosCart = {
    types: shirtTypes.map(type => ({ ...type, sizes: [...type.sizes] })),
    addCustom(item) {
      if (!validCustomItem(item)) throw new Error('Zkontrolujte typ trička, velikost, počet a vybraný potisk.');
      const next = [...cartItems, item];
      try { localStorage.setItem(cartKey, JSON.stringify(next)); }
      catch { throw new Error('Návrh se nepodařilo uložit. Zkuste menší obrázek nebo povolte úložiště prohlížeče.'); }
      cartItems = next;
      updateCart();
      showToast(`Vlastní potisk (${item.quantity} ks) přidán do košíku. Objednání zatím není dostupné.`);
    }
  };

  function restoreCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(cartKey));
      cartItems = Array.isArray(stored) ? stored.filter(item => validCustomItem(item) || (item && products.some(product => product.id === item.id)
        && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99
        && (item.size === null || typeof item.size === 'string')
        && (item.color == null || shirtColors.some(color => color.name === item.color))
        && (item.type == null || shirtTypes.some(type => type.id === item.type && type.sizes.includes(item.size))))).slice(0, 500) : [];
    } catch {
      // Keep the in-memory cart when browser storage is unavailable.
    }
    updateCart();
  }

  function updateCart() {
    count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('shopCartCount');
    badge.textContent = count;
    badge.hidden = count === 0;
    cart.setAttribute('aria-label', `Košík, počet položek: ${count}`);
  }

  function addProduct(product, quantity, size, color, type) {
    cartItems.push({ id: product.id, quantity, size, color, type });
    updateCart();
    try { localStorage.setItem(cartKey, JSON.stringify(cartItems)); } catch { /* Demo still works without storage. */ }
    showToast(`${product.name}, ${shirtTypes.find(option => option.id === type).label.toLocaleLowerCase('cs')}, ${color}, velikost ${size} (${quantity} ks) přidáno do košíku. Objednání zatím není dostupné.`);
  }

  function productCard(product, bestseller = false) {
    const heading = pagination ? 'h2' : bestseller ? 'h4' : 'h3';
    const url = `produkt.html?id=${encodeURIComponent(product.id)}`;
    return `
      <article class="shop-product">
        <a class="shop-product-link" href="${url}">
          ${product.images[0].src
            ? `<div class="shop-product-art shop-product-art--photo" aria-hidden="true"><img class="shop-product-photo" src="${product.images[0].src}" alt="" loading="lazy" decoding="async" width="635" height="780"></div>`
            : `<div class="shop-product-art" style="--x:${product.x}%;--y:${product.y}%" aria-hidden="true"></div>`}
          <div class="shop-product-details">
            <${heading}>${product.name}</${heading}>
            <p class="shop-product-subtitle">${product.subtitle}</p>
            <strong class="shop-product-price">${product.price}</strong>
          </div>
        </a>
      </article>`;
  }

  function renderStrip(container, selection, bestseller = false) {
    container.innerHTML = `<div class="shop-product-group">${selection.map(product => productCard(product, bestseller)).join('')}</div>`;
    container.scrollLeft = 0;
  }

  function render() {
    const visible = products.filter(product => activeCategory === 'all' || (activeCategory === 'top' ? product.top : product.category === activeCategory));
    if (pagination) {
      const pages = Math.max(1, Math.ceil(visible.length / pageSize));
      currentPage = Math.max(1, Math.min(currentPage, pages));
      const start = (currentPage - 1) * pageSize;
      const selection = visible.slice(start, start + pageSize);
      grid.innerHTML = selection.map(product => productCard(product)).join('');
      const info = `Zobrazeno ${start + 1}–${start + selection.length} z ${visible.length} triček`;
      document.getElementById('shopPageInfo').textContent = info;
      document.getElementById('shopResults').textContent = `${info}. Stránka ${currentPage} z ${pages}.`;
      const pageButton = (page, text, label, disabled = false, current = false) => `<button type="button" data-page="${page}" aria-label="${label}" ${disabled ? 'disabled' : ''} ${current ? 'aria-current="page"' : ''}>${text}</button>`;
      const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter(page => page === 1 || page === pages || Math.abs(page - currentPage) <= 1);
      let previous = 0;
      const links = numbers.map(page => {
        const gap = previous && page - previous > 1 ? '<span aria-hidden="true">…</span>' : '';
        previous = page;
        return gap + pageButton(page, page, `Stránka ${page}`, false, page === currentPage);
      }).join('');
      pagination.innerHTML = pageButton(currentPage - 1, '←', 'Předchozí stránka', currentPage === 1) + links + pageButton(currentPage + 1, '→', 'Další stránka', currentPage === pages);
      return;
    }
    const selection = visible.filter(product => product.imported).slice(0, 8);
    const demos = visible.filter(product => !product.imported);
    const remaining = Math.min(8 - selection.length, demos.length);
    selection.push(...Array.from({ length: remaining }, (_, index) => demos[Math.floor(index * demos.length / remaining)]));
    renderStrip(grid, selection);
    document.getElementById('shopResults').textContent = `Výběr: ${selection.length} triček z kategorie ${document.querySelector('.shop-filter.active').textContent}.`;
  }

  function renderDetail() {
    const id = new URLSearchParams(window.location.search).get('id');
    const product = products.find(item => item.id === id);
    if (!product) {
      document.title = 'Produkt nenalezen — Trikonoš';
      detail.innerHTML = '<div class="product-not-found"><h1>Tohle tričko jsme nenašli.</h1><p>Vyberte si jiný motiv v kolekci.</p><a class="shop-catalog-link" href="vsechna-tricka.html">Zpět na všechna trička →</a></div>';
      document.getElementById('productBreadcrumb').textContent = 'Produkt nenalezen';
      document.getElementById('productRelatedSection').hidden = true;
      return;
    }
    document.title = `${product.name} — Trikonoš`;
    document.getElementById('productBreadcrumb').textContent = product.name;
    const initialType = shirtTypes.find(type => type.id === (product.category === 'detska' ? 'children' : product.category === 'damska' ? 'female' : 'male'));
    const sizeOptions = type => type.sizes.map((size, index) => `<label><input type="radio" name="size" value="${size}" ${index === 0 ? 'required' : ''}><span>${size}</span></label>`).join('');
    const galleryImage = image => image.src
      ? `<img class="product-gallery-art" src="${image.src}" alt="" decoding="async" width="635" height="780" style="--image-zoom:${image.zoom || 1}">`
      : `<span class="shop-product-art product-gallery-art" style="--x:${image.x}%;--y:${image.y}%;--image-zoom:${image.zoom || 1}"></span>`;
    detail.innerHTML = `
      <div class="product-preview" id="productGallery" role="region" aria-label="Galerie trička ${product.name}">
        <div class="product-gallery-main">
          ${product.images.map((image, index) => `<div class="product-gallery-slide${index === 0 ? ' is-active' : ''}" data-gallery-slide="${index}" role="img" aria-label="${product.name} — ${image.label}" aria-hidden="${index !== 0}">${galleryImage(image)}</div>`).join('')}
          ${product.tag ? `<span class="shop-product-tag">${product.tag}</span>` : ''}
        </div>
        ${product.images.length > 1 ? `<div class="product-gallery-thumbnails" role="group" aria-label="Vybrat obrázek">${product.images.map((image, index) => `<button type="button" class="product-gallery-thumbnail" data-gallery-index="${index}" aria-label="${image.label}, obrázek ${index + 1} z ${product.images.length}" aria-pressed="${index === 0}">${galleryImage(image)}</button>`).join('')}</div><div class="product-gallery-controls"><span id="productGalleryPosition">1 / ${product.images.length}</span><button type="button" id="productGalleryToggle" aria-pressed="false">Pozastavit střídání</button></div>` : ''}
      </div>
      <div class="product-info">
          <h1>${product.name}</h1>
          <p class="product-description">${product.subtitle}</p>
          <p class="product-price">${product.price} <span>/ kus</span></p>
        <form id="productForm" class="product-form">
          <fieldset class="product-sizes" id="productTypeOptions"><legend>Typ trička</legend><div>${shirtTypes.map((type, index) => `<label><input type="radio" name="type" value="${type.id}" ${type === initialType ? 'checked' : ''} ${index === 0 ? 'required' : ''}><span>${type.label}</span></label>`).join('')}</div></fieldset>
          <fieldset class="product-sizes product-colors"><legend>Barva</legend><div>${shirtColors.map((color, index) => `<label><input type="radio" name="color" value="${color.name}" ${index === 0 ? 'required' : ''}><span><i style="--swatch:${color.hex}" aria-hidden="true"></i>${color.name}</span></label>`).join('')}</div></fieldset>
          <fieldset class="product-sizes"><legend>Velikost</legend><div id="productSizeOptions">${sizeOptions(initialType)}</div></fieldset>
          <span class="shop-sr-only" id="productSizeStatus" role="status"></span>
          <div class="product-purchase"><label class="product-quantity" for="productQuantity">Počet kusů<input type="number" id="productQuantity" name="quantity" value="1" min="1" max="99" step="1" required inputmode="numeric"></label><button type="submit" class="product-add">Přidat do košíku <span aria-hidden="true">↗</span></button></div>
        </form>
        <div class="product-details">
          <details open><summary>O produktu</summary><p>Motiv: ${product.name}<br>Barva a velikost dle vašeho výběru.<br>Kód produktu: ${product.id}</p></details>
          <details><summary>Chcete vlastní potisk?</summary><p>Pro vlastní motiv, týmová trička nebo větší množství se podívejte na <a href="index.html#vlastni-potisk">možnosti vlastního potisku →</a>.</p></details>
        </div>
      </div>`;
    setupGallery();
    const form = document.getElementById('productForm');
    document.getElementById('productTypeOptions').addEventListener('change', event => {
      if (event.target.name !== 'type') return;
      const type = shirtTypes.find(option => option.id === event.target.value);
      if (!type) return;
      document.getElementById('productSizeOptions').innerHTML = sizeOptions(type);
      document.getElementById('productSizeStatus').textContent = `Vyberte velikost pro ${type.label.toLocaleLowerCase('cs')} tričko.`;
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const size = form.querySelector('input[name="size"]:checked')?.value;
      const color = form.querySelector('input[name="color"]:checked')?.value;
      const type = shirtTypes.find(option => option.id === form.querySelector('input[name="type"]:checked')?.value);
      const quantity = Number(document.getElementById('productQuantity').value);
      if (!type || !type.sizes.includes(size) || !shirtColors.some(option => option.name === color) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
      addProduct(product, quantity, size, color, type.id);
    });
    related.innerHTML = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3).map(item => productCard(item)).join('');
  }

  function setupGallery() {
    const gallery = document.getElementById('productGallery');
    const slides = Array.from(gallery.querySelectorAll('[data-gallery-slide]'));
    const thumbnails = Array.from(gallery.querySelectorAll('[data-gallery-index]'));
    if (slides.length < 2) return;
    const toggle = document.getElementById('productGalleryToggle');
    const position = document.getElementById('productGalleryPosition');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let paused = false;
    let hovered = false;
    let focused = false;
    let visible = true;
    let timer = null;

    function show(index) {
      current = index;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        thumbnails[slideIndex].setAttribute('aria-pressed', String(active));
      });
      position.textContent = `${current + 1} / ${slides.length}`;
    }

    function syncPlayback() {
      clearTimeout(timer);
      timer = null;
      if (paused || hovered || focused || !visible || document.hidden || reducedMotion.matches) return;
      timer = setTimeout(() => {
        show((current + 1) % slides.length);
        syncPlayback();
      }, 3000);
    }

    thumbnails.forEach((thumbnail, index) => thumbnail.addEventListener('click', () => {
      show(index);
      syncPlayback();
    }));
    toggle.addEventListener('click', () => {
      paused = !paused;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'Spustit střídání' : 'Pozastavit střídání';
      syncPlayback();
    });
    gallery.addEventListener('pointerenter', () => { hovered = true; syncPlayback(); });
    gallery.addEventListener('pointerleave', () => { hovered = false; syncPlayback(); });
    gallery.addEventListener('focusin', () => { focused = true; syncPlayback(); });
    gallery.addEventListener('focusout', event => { focused = gallery.contains(event.relatedTarget); syncPlayback(); });
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    window.addEventListener('pagehide', () => { clearTimeout(timer); });
    window.addEventListener('pageshow', syncPlayback);
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        syncPlayback();
      }).observe(gallery);
    }
    syncPlayback();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    activeCategory = button.dataset.filter;
    currentPage = 1;
    render();
  }));

  pagination?.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.page);
    render();
    pagination.querySelector('[aria-current="page"]').focus({ preventScroll: true });
    document.getElementById('catalog-title').scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });

  cart.addEventListener('click', () => showToast(count
    ? `Počet položek v košíku: ${count}. Objednání zatím není dostupné.`
    : 'Košík je prázdný.'));

  document.getElementById('shopYear').textContent = new Date().getFullYear();
  restoreCart();
  window.addEventListener('pageshow', restoreCart);
  window.addEventListener('storage', event => {
    if (event.key === cartKey || event.key === null) restoreCart();
  });
  if (bestsellers) renderStrip(bestsellers, importedProducts.length ? importedProducts.slice(0, 6) : [0, 16, 32, 64, 96, 176].map(index => demoProducts[index]), true);
  if (grid) render();
  if (detail) renderDetail();
})();
