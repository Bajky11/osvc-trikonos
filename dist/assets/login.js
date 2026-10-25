(() => {
  'use strict';
  const footer = document.querySelector('.shop-footer-bottom');
  if (!footer) return;
  const trigger = document.createElement('a');
  trigger.href = 'admin.html';
  trigger.textContent = 'Login';
  trigger.setAttribute('aria-haspopup', 'dialog');
  footer.append(trigger);

  const dialog = document.createElement('dialog');
  dialog.className = 'login-dialog';
  dialog.setAttribute('aria-labelledby', 'login-title');
  dialog.innerHTML = `
    <button class="login-close" type="button" aria-label="Zavřít přihlášení">×</button>
    <p class="login-eyebrow">Trikonoš admin</p>
    <h2 id="login-title">Přihlášení</h2>
    <form class="login-form" novalidate>
      <label for="login-name">Přihlašovací jméno</label>
      <input id="login-name" name="username" autocomplete="username" autofocus>
      <label for="login-password">Heslo</label>
      <input id="login-password" name="password" type="password" autocomplete="current-password">
      <button class="login-submit" type="submit">Přihlásit se <span aria-hidden="true">→</span></button>
    </form>`;
  document.body.append(dialog);
  trigger.addEventListener('click', event => {
    event.preventDefault();
    dialog.showModal();
  });
  dialog.querySelector('.login-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.querySelector('form').reset();
    trigger.focus();
  });
  dialog.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    // Prototype only: never store or send the entered credentials.
    dialog.querySelector('form').reset();
    window.location.assign('admin.html');
  });
})();
