/**
 * Modal — adaptado para Belleza & Estilo
 * Uso: Modal.open('id')  /  Modal.close('id')
 *      Modal.confirm('Título', 'Mensaje', () => accion())
 */
const Modal = {
  openModals: new Set(),

  open(id, options = {}) {
    const el = document.getElementById(id);
    if (!el) return;

    if (el._escHandler) {
      document.removeEventListener('keydown', el._escHandler);
      el._escHandler = null;
    }

    el.classList.remove('closing');
    el.classList.add('show');
    this.openModals.add(id);
    document.body.style.overflow = 'hidden';

    if (typeof options.onOpen === 'function') options.onOpen();

    const escHandler = (e) => {
      if (e.key === 'Escape' && this.openModals.has(id)) this.close(id);
    };
    el._escHandler = escHandler;
    document.addEventListener('keydown', escHandler);
  },

  close(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.add('closing');

    const done = () => {
      el.classList.remove('show', 'closing');
      this.openModals.delete(id);
      if (this.openModals.size === 0) document.body.style.overflow = '';
      if (el._escHandler) {
        document.removeEventListener('keydown', el._escHandler);
        el._escHandler = null;
      }
      if (typeof callback === 'function') callback();
    };

    el.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 280);
  },

  closeAll() {
    [...this.openModals].forEach(id => this.close(id));
  },

  isOpen(id) {
    return this.openModals.has(id);
  },

  confirm(title, message, onConfirm, confirmText = 'Confirmar', danger = false) {
    let el = document.getElementById('_confirm-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = '_confirm-modal';
      el.className = 'modal-overlay';
      el.innerHTML = `
        <div class="modal-content modal-content--sm">
          <div class="modal-header">
            <span class="modal-title" id="_confirm-title"></span>
            <button type="button" class="modal-close" data-modal-close aria-label="Cerrar">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p id="_confirm-msg" style="font-size:.87rem;color:var(--text);line-height:1.55"></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="modal-btn modal-btn-secondary" data-modal-close>Cancelar</button>
            <button type="button" class="modal-btn modal-btn-primary" id="_confirm-ok"></button>
          </div>
        </div>`;
      document.body.appendChild(el);
      _initModal(el);
    }

    document.getElementById('_confirm-title').textContent = title;
    document.getElementById('_confirm-msg').textContent   = message;

    const okBtn = document.getElementById('_confirm-ok');
    okBtn.textContent  = confirmText;
    okBtn.className    = `modal-btn ${danger ? 'modal-btn-danger' : 'modal-btn-primary'}`;
    const fresh = okBtn.cloneNode(true);
    okBtn.replaceWith(fresh);
    fresh.addEventListener('click', () => {
      this.close('_confirm-modal');
      if (typeof onConfirm === 'function') onConfirm();
    });

    this.open('_confirm-modal');
  },

  _attachHandlers(el) { _initModal(el); }
};

function _initModal(el) {
  el.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => Modal.close(el.id));
  });
  el.addEventListener('click', (e) => {
    if (e.target === el) Modal.close(el.id);
  });
  const content = el.querySelector('.modal-content');
  if (content) content.addEventListener('click', e => e.stopPropagation());
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(_initModal);
});

window.Modal = Modal;
