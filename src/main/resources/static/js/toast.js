/**
 * Toast notifications — Belleza & Estilo
 * Uso: Toast.success('Guardado') / Toast.error('Error') / Toast.warning('…') / Toast.info('…')
 */
(function () {
  let container = null;

  const icons = {
    success: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
    error:   `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>`,
    warning: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
    info:    `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 16v-4m0-4h.01"/></svg>`,
  };

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <span class="toast__msg">${message}</span>
      <button class="toast__close" aria-label="Cerrar">
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>`;

    const remove = () => {
      toast.classList.add('toast--out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 320);
    };

    toast.querySelector('.toast__close').addEventListener('click', remove);
    getContainer().appendChild(toast);
    setTimeout(remove, duration);
  }

  window.Toast = {
    success: (msg, d) => show(msg, 'success', d),
    error:   (msg, d) => show(msg, 'error',   d),
    warning: (msg, d) => show(msg, 'warning',  d),
    info:    (msg, d) => show(msg, 'info',     d),
  };
})();
