(() => {
  const preview = document.getElementById('customShirtPreview');
  const value = document.getElementById('customShirtColorValue');
  if (!preview || !value) return;

  const swatches = [...document.querySelectorAll('[data-shirt-color]')];
  const garments = [...document.querySelectorAll('input[name="customGarment"]')];
  let colorName = 'Bílá';
  const updatePreviewLabel = () => {
    const garment = garments.find(input => input.checked)?.value || 'male';
    const names = { male: 'Pánské tričko', female: 'Dámské tričko', children: 'Dětské tričko' };
    preview.setAttribute('aria-label', `${names[garment]} – ${colorName}. Univerzální náhled střihu.`);
  };
  garments.forEach(input => input.addEventListener('change', updatePreviewLabel));
  const updateColor = (color) => {
    const selected = swatches.find((swatch) => swatch.dataset.shirtColor === color);
    const name = selected ? selected.dataset.colorName : 'Vlastní odstín';
    preview.style.setProperty('--shirt-color', color);
    colorName = name;
    updatePreviewLabel();
    value.textContent = name;
    swatches.forEach((swatch) => swatch.setAttribute('aria-pressed', String(swatch === selected)));
  };

  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => updateColor(swatch.dataset.shirtColor));
  });

  const design = document.getElementById('customShirtDesign');
  const editor = document.getElementById('customDesignEditor');
  const move = document.getElementById('customDesignMove');
  const resize = document.getElementById('customDesignResize');
  const svg = preview.querySelector('svg');
  const toggle = document.getElementById('customEditorToggle');
  const centerToggle = document.getElementById('customCenterToggle');
  let centerEnabled = true;
  centerToggle.addEventListener('click', () => {
    centerEnabled = !centerEnabled;
    preview.classList.toggle('center-disabled', !centerEnabled);
    centerToggle.setAttribute('aria-pressed', String(centerEnabled));
    centerToggle.querySelector('span').textContent = centerEnabled ? 'Vypnout centrování' : 'Zapnout centrování';
  });
  toggle.addEventListener('click', () => {
    const hidden = preview.classList.toggle('controls-hidden');
    toggle.setAttribute('aria-pressed', String(!hidden));
    toggle.querySelector('span').textContent = hidden ? 'Zobrazit ovládací prvky' : 'Skrýt ovládací prvky';
  });
  const area = { x: 330, y: 330, width: 470, height: 650 };
  const dimensions = document.getElementById('customDesignDimensions');
  const dimensionsValue = document.getElementById('customDesignDimensionsValue');
  const cmPerUnit = 30 / area.width;
  const formatCm = (units) => (units * cmPerUnit).toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  let box = { x: 350, y: 350, width: 430, height: 550 };
  let drag = null;
  let dragFrame = null;
  let pendingPointer = null;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const render = () => {
    for (const [key, value] of Object.entries(box)) {
      design.setAttribute(key, value);
      move.setAttribute(key, value);
    }
    resize.setAttribute('x', box.x + box.width - 22);
    resize.setAttribute('y', box.y + box.height - 22);
    const text = `${formatCm(box.width)} × ${formatCm(box.height)} cm`;
    if (dimensionsValue.textContent !== text) dimensionsValue.textContent = text;
  };
  const moveTo = (x, y, snap = false) => {
    if (snap && centerEnabled) {
      const centerX = area.x + area.width / 2;
      // Keep the magnetic zone roughly 10 screen pixels wide on either side.
      const matrix = svg.getScreenCTM();
      const scale = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
      const threshold = 10 / (scale || 1);
      if (Math.abs(x + box.width / 2 - centerX) <= threshold) {
        x = centerX - box.width / 2;
      }
    }
    box.x = clamp(x, area.x, area.x + area.width - box.width);
    box.y = clamp(y, area.y, area.y + area.height - box.height);
    render();
  };
  const resizeTo = (width) => {
    const ratio = box.height / box.width;
    const maxWidth = Math.min(area.x + area.width - box.x, (area.y + area.height - box.y) / ratio);
    box.width = clamp(width, Math.min(80, maxWidth), maxWidth);
    box.height = box.width * ratio;
    render();
  };
  const pointFromEvent = (event) => {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };
  const applyPointer = () => {
    if (!drag || !pendingPointer) return;
    const point = pointFromEvent(pendingPointer);
    pendingPointer = null;
    const dx = point.x - drag.start.x;
    const dy = point.y - drag.start.y;
    if (drag.control === move) moveTo(drag.box.x + dx, drag.box.y + dy, true);
    else {
      const ratio = drag.box.height / drag.box.width;
      resizeTo(drag.box.width + (dx + dy * ratio) / (1 + ratio * ratio));
    }
  };
  [move, resize].forEach((control) => {
    control.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      event.preventDefault();
      control.focus();
      drag = { id: event.pointerId, control, start: pointFromEvent(event), box: { ...box } };
      control.setPointerCapture(event.pointerId);
    });
    control.addEventListener('pointermove', (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      pendingPointer = { clientX: event.clientX, clientY: event.clientY };
      if (dragFrame === null) {
        dragFrame = requestAnimationFrame(() => {
          dragFrame = null;
          applyPointer();
        });
      }
    });
    const endDrag = (event) => {
      if (drag?.id !== event.pointerId) return;
      if (dragFrame !== null) cancelAnimationFrame(dragFrame);
      dragFrame = null;
      applyPointer();
      drag = null;
      if (control.hasPointerCapture(event.pointerId)) control.releasePointerCapture(event.pointerId);
    };
    control.addEventListener('pointerup', endDrag);
    control.addEventListener('pointercancel', endDrag);
    control.addEventListener('lostpointercapture', endDrag);
    control.addEventListener('keydown', (event) => {
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const step = event.shiftKey ? 20 : 5;
      if (control === move) moveTo(box.x + direction[0] * step, box.y + direction[1] * step);
      else resizeTo(box.width + (direction[0] + direction[1]) * step);
    });
  });
  const gallery = document.getElementById('customDesignGallery');
  const grid = document.getElementById('customDesignGrid');
  const fileInput = document.getElementById('customDesignFile');
  const status = document.getElementById('customDesignStatus');
  const remove = document.getElementById('customDesignRemove');
  const filenames = [
    'exec-b0dc95ca-7a61-4dc0-a834-047e90b497fe.png',
    'exec-ff03d2c4-003b-4d42-b991-7f3ec1a15006.png',
    'exec-2e94d129-f556-40db-9c33-daf742a8508a.png',
    'exec-0e333bb4-82c9-488e-9988-79341364877b.png',
    'exec-294f0fca-e649-4bd8-aa80-1924fdbcd222.png'
  ];
  let uploadUrl = null;
  let request = 0;
  let selectedDesign = null;
  const selectDesign = async (src, name, isUpload = false) => {
    const current = ++request;
    const image = new Image();
    image.src = src;
    try {
      await image.decode();
      if (current !== request) {
        if (isUpload) URL.revokeObjectURL(src);
        return;
      }
      design.setAttribute('href', src);
      const scale = Math.min(area.width * .8 / image.naturalWidth, area.height * .8 / image.naturalHeight);
      box = {
        width: image.naturalWidth * scale,
        height: image.naturalHeight * scale,
        x: area.x + (area.width - image.naturalWidth * scale) / 2,
        y: area.y + (area.height - image.naturalHeight * scale) / 2
      };
      render();
      editor.setAttribute('visibility', 'visible');
      selectedDesign = { src, name };
      dimensions.hidden = false;
      document.getElementById('customDesignName').textContent = name;
      if (uploadUrl) URL.revokeObjectURL(uploadUrl);
      uploadUrl = isUpload ? src : null;
      remove.hidden = false;
      status.textContent = '';
      grid.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.src === src));
      });
      if (gallery.open) gallery.close();
    } catch {
      if (isUpload) URL.revokeObjectURL(src);
      if (current === request) status.textContent = 'Obrázek se nepodařilo načíst. Zkuste prosím jiný.';
    }
  };
  filenames.forEach((filename, index) => {
    const src = `assets/designs/${filename}`;
    const name = `Motiv ${index + 1}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.src = src;
    button.setAttribute('aria-label', `Vybrat ${name.toLowerCase()}`);
    button.setAttribute('aria-pressed', 'false');
    const image = document.createElement('img');
    image.src = src;
    image.alt = name;
    image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => selectDesign(src, name));
    grid.append(button);
  });
  document.getElementById('customDesignGalleryOpen').addEventListener('click', () => gallery.showModal());
  document.getElementById('customDesignGalleryClose').addEventListener('click', () => gallery.close());
  document.getElementById('customDesignUpload').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    fileInput.value = '';
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
      status.textContent = 'Vyberte PNG, JPG nebo WebP do 15 MB.';
      return;
    }
    selectDesign(URL.createObjectURL(file), file.name, true);
  });
  remove.addEventListener('click', () => {
    ++request;
    editor.setAttribute('visibility', 'hidden');
    dimensions.hidden = true;
    selectedDesign = null;
    design.removeAttribute('href');
    if (uploadUrl) URL.revokeObjectURL(uploadUrl);
    uploadUrl = null;
    remove.hidden = true;
    grid.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', 'false'));
    status.textContent = 'Potisk byl odebrán.';
  });

  const orderForm = document.getElementById('customOrderForm');
  const sizeOptions = document.getElementById('customSize');
  const selectedSize = () => sizeOptions.value;
  const quantityInput = document.getElementById('customQuantity');
  const orderStatus = document.getElementById('customOrderStatus');
  const cart = window.TrikonosCart;
  const selectedType = () => garments.find(input => input.checked)?.value || 'male';
  const updateSizes = () => {
    const previous = selectedSize();
    const type = cart.types.find(type => type.id === selectedType());
    const selected = type.sizes.includes(previous) ? previous : type.sizes.includes('M') ? 'M' : type.sizes[0];
    sizeOptions.replaceChildren(...type.sizes.map(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      return option;
    }));
    sizeOptions.value = selected;
  };
  if (!cart) return;
  garments.forEach(input => input.addEventListener('change', updateSizes));
  updateSizes();
  document.getElementById('customQuantityDecrease').addEventListener('click', () => quantityInput.stepDown());
  document.getElementById('customQuantityIncrease').addEventListener('click', () => quantityInput.stepUp());
  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!orderForm.reportValidity()) return;
    if (!selectedDesign) {
      orderStatus.textContent = 'Nejprve vyberte nebo nahrajte potisk.';
      return;
    }
    const button = orderForm.querySelector('button[type="submit"]');
    const item = {
      id: 'custom-print', quantity: Number(quantityInput.value), size: selectedSize(),
      type: selectedType(), color: colorName, design: { ...selectedDesign, ...box }
    };
    button.disabled = true;
    orderStatus.textContent = 'Ukládání návrhu…';
    try {
      if (item.design.src.startsWith('blob:')) {
        const blob = await (await fetch(item.design.src)).blob();
        item.design.src = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Obrázek se nepodařilo uložit.'));
          reader.readAsDataURL(blob);
        });
      }
      cart.addCustom(item);
      orderStatus.textContent = 'Přidáno do košíku.';
    } catch (error) {
      orderStatus.textContent = error.message || 'Návrh se nepodařilo přidat do košíku.';
    } finally {
      button.disabled = false;
    }
  });
})();
