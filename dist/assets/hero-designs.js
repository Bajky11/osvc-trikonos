(() => {
  'use strict';
  const hero = document.getElementById('domu');
  const artwork = hero?.querySelector('.hero-art');
  if (!artwork) return;

  const filenames = [
    'exec-b0dc95ca-7a61-4dc0-a834-047e90b497fe.png',
    'exec-ff03d2c4-003b-4d42-b991-7f3ec1a15006.png',
    'exec-2e94d129-f556-40db-9c33-daf742a8508a.png',
    'exec-0e333bb4-82c9-488e-9988-79341364877b.png',
    'exec-294f0fca-e649-4bd8-aa80-1924fdbcd222.png'
  ];
  const scriptURL = document.currentScript.src;
  const urls = filenames.map(filename => new URL(`designs/${filename}`, scriptURL).href);
  const svgNS = 'http://www.w3.org/2000/svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const scene = document.createElementNS(svgNS, 'svg');
  scene.setAttribute('viewBox', '0 0 1671 941');
  scene.setAttribute('aria-hidden', 'true');
  scene.setAttribute('focusable', 'false');
  scene.classList.add('hero-design-scene');
  artwork.classList.add('hero-art--prints');
  artwork.append(scene);

  // Coordinates belong to the original illustration, not to viewport pixels.
  // A slight skew follows the angle of each person's chest.
  function createShirt(transform, size) {
    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('transform', transform);
    const layers = Array.from({ length: 2 }, () => {
      const image = document.createElementNS(svgNS, 'image');
      image.setAttribute('width', size);
      image.setAttribute('height', size);
      image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      image.classList.add('hero-design-layer');
      group.append(image);
      return image;
    });
    scene.append(group);
    return layers;
  }

  const shirts = [
    createShirt('matrix(1 .05 -.06 1 935 382)', 164),
    createShirt('matrix(.98 .09 -.10 .98 1365 450)', 146)
  ];

  function positionScene() {
    const width = artwork.clientWidth;
    const height = artwork.clientHeight;
    const scale = mobile.matches ? height / 941 : Math.max(width / 1671, height / 941);
    const imageWidth = 1671 * scale;
    const imageHeight = 941 * scale;
    // Match hero.css: desktop cover/center, mobile auto 100%/82% bottom.
    Object.assign(scene.style, {
      width: `${imageWidth}px`, height: `${imageHeight}px`,
      left: `${(width - imageWidth) * (mobile.matches ? .82 : .5)}px`,
      top: `${(height - imageHeight) * (mobile.matches ? 1 : .5)}px`
    });
  }

  const resizeObserver = new ResizeObserver(positionScene);
  resizeObserver.observe(artwork);
  mobile.addEventListener('change', positionScene);
  positionScene();

  let designs = [];
  const shirtStates = shirts.map(() => ({ design: 0, layer: 0 }));
  let lastShirt = -1;
  let visible = false;
  let timer = null;

  function displayDesign(index) {
    const layers = shirts[index];
    const state = shirtStates[index];
    layers[state.layer].setAttribute('href', designs[state.design]);
    layers[state.layer].classList.add('is-visible');
    layers[1 - state.layer].classList.remove('is-visible');
  }

  function scheduleChange() {
    timer = setTimeout(() => {
      // Change one shirt every two seconds, alternating between them.
      const index = (lastShirt + 1) % shirts.length;
      const state = shirtStates[index];
      state.design = (state.design + 1 + Math.floor(Math.random() * (designs.length - 1))) % designs.length;
      state.layer = 1 - state.layer;
      displayDesign(index);
      lastShirt = index;
      scheduleChange();
    }, 2000);
  }

  function syncPlayback() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (designs.length < 2 || !visible || document.hidden || reducedMotion.matches) return;
    scheduleChange();
  }

  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncPlayback();
  });
  visibilityObserver.observe(hero);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', syncPlayback);

  // Only cycle images that loaded successfully: never fade to a broken PNG.
  Promise.all(urls.map(url => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(url);
    image.onerror = () => resolve(null);
    image.src = url;
  }))).then(loaded => {
    designs = loaded.filter(Boolean);
    if (!designs.length) return;
    shirtStates.forEach((state, index) => {
      state.design = (index * 2) % designs.length;
      displayDesign(index);
    });
    syncPlayback();
  });
})();
