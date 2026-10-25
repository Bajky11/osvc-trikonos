(() => {
  'use strict';
  const titles = { prehled: 'Přehled', objednavky: 'Objednávky', produkty: 'Produkty', sezony: 'Sezóny', klienti: 'Klienti', ciselniky: 'Číselníky' };
  const links = Array.from(document.querySelectorAll('.admin-sidebar nav a'));
  const search = document.getElementById('admin-search');
  const rows = Array.from(document.querySelectorAll('#admin-orders tbody tr'));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('cs');

  function filterOrders() {
    const query = normalize(search.value.trim());
    rows.forEach(row => { row.hidden = !normalize(row.textContent).includes(query); });
    document.getElementById('admin-no-results').hidden = rows.some(row => !row.hidden);
  }

  function showSection() {
    const section = location.hash.slice(1);
    const key = Object.hasOwn(titles, section) ? section : 'prehled';
    const ordersVisible = key === 'prehled' || key === 'objednavky';
    links.forEach(link => {
      if (link.hash === `#${key}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.getElementById('admin-title').textContent = titles[key];
    document.title = `${titles[key]} — Trikonoš admin`;
    document.getElementById('admin-stats').hidden = key !== 'prehled';
    document.getElementById('admin-orders').hidden = !ordersVisible;
    document.getElementById('admin-placeholder').hidden = ordersVisible || key === 'ciselniky' || key === 'sezony';
    document.getElementById('admin-seasons').hidden = key !== 'sezony';
    document.getElementById('admin-dictionaries').hidden = key !== 'ciselniky';
    document.getElementById('admin-section-title').textContent = titles[key];
    document.getElementById('orders-title').textContent = key === 'objednavky' ? 'Objednávky' : 'Poslední objednávky';
    search.closest('label').hidden = !ordersVisible;
  }
  search.addEventListener('input', filterOrders);
  window.addEventListener('hashchange', showSection);
  showSection();
})();
