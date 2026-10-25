(() => {
  'use strict';
  const root = document.getElementById('admin-dictionaries');
  if (!root) return;
  const storageKey = 'trikonos-admin-dictionaries-v1';
  const titles = { colors: 'Barvy', cuts: 'Střihy', clothing: 'Typy oblečení' };
  const defaults = {
    colors: [
      { id: 'white', name: 'Bílá', hex: '#ffffff' },
      { id: 'black', name: 'Černá', hex: '#252b28' },
      { id: 'natural', name: 'Přírodní bílá', hex: '#e9e1cf' },
      { id: 'green', name: 'Tmavě zelená', hex: '#0e584d' },
      { id: 'blue', name: 'Modrá', hex: '#426b8a' },
      { id: 'rust', name: 'Rezavá', hex: '#ad593e' }
    ],
    cuts: [
      { id: 'regular', name: 'Klasický' },
      { id: 'slim', name: 'Vypasovaný' },
      { id: 'oversized', name: 'Oversize' },
      { id: 'unisex', name: 'Unisex' }
    ],
    clothing: [
      { id: 'tshirt', name: 'Tričko' },
      { id: 'hoodie', name: 'Mikina' },
      { id: 'tank', name: 'Tílko' }
    ]
  };
  const form = document.getElementById('dictionary-form');
  const nameInput = document.getElementById('dictionary-name');
  const colorInput = document.getElementById('dictionary-color');
  const message = document.getElementById('dictionary-message');
  const rows = document.getElementById('dictionary-rows');
  const cancel = document.getElementById('dictionary-cancel');
  const editor = document.getElementById('dictionary-editor');
  const editorMessage = document.getElementById('dictionary-editor-message');
  const add = document.getElementById('dictionary-add');
  const switches = Array.from(root.querySelectorAll('[data-dictionary]'));
  let active = 'colors';
  let editing = null;
  let returnId = null;
  let data = JSON.parse(JSON.stringify(defaults));
  const normalize = name => name.normalize('NFC').toLocaleLowerCase('cs');
  const cleanName = name => name.trim().replace(/\s+/g, ' ');

  function notify(text, error = false) {
    const destination = editor.open ? editorMessage : message;
    message.textContent = '';
    editorMessage.textContent = '';
    destination.textContent = text;
    destination.classList.toggle('is-error', error);
  }

  function validData(value) {
    return value && Object.keys(titles).every(key => {
      if (!Array.isArray(value[key]) || value[key].length > 2000) return false;
      const ids = new Set();
      const names = new Set();
      return value[key].every(item => {
        if (!item || typeof item.id !== 'string' || !item.id || item.id.length > 100
          || typeof item.name !== 'string' || !cleanName(item.name) || item.name.length > 80
          || ids.has(item.id) || names.has(normalize(cleanName(item.name)))
          || (key === 'colors' && !/^#[0-9a-f]{6}$/i.test(item.hex))) return false;
        ids.add(item.id);
        names.add(normalize(cleanName(item.name)));
        return true;
      });
    });
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (!validData(parsed)) throw new Error('Invalid dictionaries');
      data = parsed;
    }
  } catch {
    notify('Uložené číselníky nelze načíst. Zobrazené jsou výchozí položky.', true);
  }

  function save(next) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      data = next;
      return true;
    } catch {
      notify('Změnu se nepodařilo uložit. Zkontrolujte, zda prohlížeč umožňuje místní úložiště.', true);
      return false;
    }
  }

  function resetEditor() {
    editing = null;
    form.reset();
    nameInput.setCustomValidity('');
    editorMessage.textContent = '';
  }

  function button(label, action, item) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `admin-icon-button${action === 'delete' ? ' admin-button-danger' : ''}`;
    element.title = label;
    const path = action === 'edit'
      ? '<path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5"/>'
      : '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>';
    element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
    element.dataset.action = action;
    element.dataset.id = item.id;
    element.setAttribute('aria-label', `${label}: ${item.name}`);
    return element;
  }

  function render() {
    const colors = active === 'colors';
    document.getElementById('dictionary-title').textContent = `${titles[active]} (${data[active].length})`;
    document.getElementById('dictionary-color-field').hidden = !colors;
    switches.forEach(element => element.setAttribute('aria-pressed', String(element.dataset.dictionary === active)));
    rows.replaceChildren();
    data[active].forEach(item => {
      const row = document.createElement('tr');
      const name = document.createElement('th');
      name.scope = 'row';
      if (colors) {
        const sample = document.createElement('span');
        sample.className = 'dictionary-swatch';
        sample.style.backgroundColor = item.hex;
        sample.setAttribute('aria-hidden', 'true');
        name.append(sample);
      }
      name.append(document.createTextNode(item.name));
      row.append(name);
      const actions = document.createElement('td');
      actions.className = 'dictionary-actions';
      actions.append(button('Upravit', 'edit', item), button('Smazat', 'delete', item));
      row.append(actions);
      rows.append(row);
    });
    document.getElementById('dictionary-empty').hidden = data[active].length > 0;
  }

  switches.forEach(element => element.addEventListener('click', () => {
    active = element.dataset.dictionary;
    resetEditor();
    notify('');
    render();
  }));
  nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
  add.addEventListener('click', () => {
    resetEditor();
    returnId = null;
    document.getElementById('dictionary-editor-title').textContent = `Přidat položku · ${titles[active]}`;
    notify('');
    editor.showModal();
    nameInput.focus();
  });
  cancel.addEventListener('click', () => editor.close());
  document.getElementById('dictionary-close').addEventListener('click', () => editor.close());
  editor.addEventListener('close', () => {
    resetEditor();
    const trigger = Array.from(rows.querySelectorAll('button[data-action="edit"]')).find(button => button.dataset.id === returnId);
    (trigger || add).focus();
  });
  editor.addEventListener('click', event => {
    if (event.target !== editor) return;
    const bounds = editor.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) editor.close();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    nameInput.setCustomValidity('');
    const name = cleanName(nameInput.value);
    if (!name) nameInput.setCustomValidity('Vyplňte název položky.');
    else if (data[active].some(item => item.id !== editing && normalize(item.name) === normalize(name))) {
      nameInput.setCustomValidity('Položka s tímto názvem už existuje.');
    }
    if (!form.reportValidity()) return;
    const item = { id: editing || `item-${crypto.randomUUID()}`, name };
    if (active === 'colors') item.hex = colorInput.value;
    const list = editing ? data[active].map(old => old.id === editing ? item : old) : [...data[active], item];
    const next = { ...data, [active]: list };
    if (!validData(next)) { notify('Položku nelze uložit. Zkontrolujte její údaje nebo počet položek.', true); return; }
    const wasEditing = editing !== null;
    if (!save(next)) return;
    render();
    editor.close();
    notify(wasEditing ? 'Změny byly uloženy.' : 'Položka byla přidána.');
  });

  rows.addEventListener('click', event => {
    const target = event.target.closest('button[data-action]');
    if (!target || !rows.contains(target)) return;
    const item = data[active].find(entry => entry.id === target.dataset.id);
    if (!item) return;
    if (target.dataset.action === 'edit') {
      editing = item.id;
      returnId = item.id;
      nameInput.value = item.name;
      nameInput.setCustomValidity('');
      if (active === 'colors') colorInput.value = item.hex;
      document.getElementById('dictionary-editor-title').textContent = `Upravit položku · ${titles[active]}`;
      notify('');
      editor.showModal();
      nameInput.focus();
    } else if (target.dataset.action === 'delete' && window.confirm(`Opravdu smazat položku „${item.name}“?`)) {
      if (!save({ ...data, [active]: data[active].filter(entry => entry.id !== item.id) })) return;
      if (editing === item.id) resetEditor();
      render();
      notify('Položka byla smazána.');
      add.focus();
    }
  });
  render();
})();
