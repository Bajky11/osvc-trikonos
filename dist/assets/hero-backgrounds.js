(() => {
  'use strict';
  const select = document.getElementById('heroBackground');
  const artwork = document.querySelector('#domu .hero-art');
  const status = document.getElementById('heroBackgroundStatus');
  if (!select || !artwork || !status) return;

  const scriptURL = document.currentScript.src;
  const filenames = Array.from(select.options, option => option.value);
  let current = 'varianta1.png';
  let request = 0;
  select.value = current;

  select.addEventListener('change', () => {
    const filename = select.value;
    if (!filenames.includes(filename)) return;
    const version = ++request;
    const url = new URL(`../background/${encodeURIComponent(filename)}`, scriptURL).href;
    const image = new Image();
    select.setAttribute('aria-busy', 'true');
    status.textContent = 'Načítání pozadí…';
    image.onload = () => {
      if (version !== request) return;
      artwork.style.backgroundImage = `url("${url}")`;
      current = filename;
      select.setAttribute('aria-busy', 'false');
      status.textContent = `Použité pozadí: ${filename}`;
    };
    image.onerror = () => {
      if (version !== request) return;
      select.value = current;
      select.setAttribute('aria-busy', 'false');
      status.textContent = 'Obrázek se nepodařilo načíst. Původní pozadí zůstává.';
    };
    image.src = url;
  });
})();
