/**
 * Validación de formularios — Belleza & Estilo
 * Uso: validateForm(formEl, { campoId: { required: 'msg', email: 'msg', min: [0,'msg'] } })
 */

function showFieldError(input, message) {
  clearFieldError(input);
  const err = document.createElement('div');
  err.className = 'field-error';
  err.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink:0">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${message}`;
  input.style.borderColor = 'var(--rose)';
  input.parentElement.appendChild(err);
}

function clearFieldError(input) {
  const ex = input.parentElement.querySelector('.field-error');
  if (ex) ex.remove();
  input.style.borderColor = '';
}

function clearAllErrors(container) {
  container.querySelectorAll('.field-error').forEach(e => e.remove());
  container.querySelectorAll('.form-input, .form-select').forEach(i => { i.style.borderColor = ''; });
}

function validateForm(container, rules) {
  clearAllErrors(container);
  let valid = true;
  let first = null;

  for (const [id, r] of Object.entries(rules)) {
    const input = container.querySelector(`#${id}`) || container.querySelector(`[name="${id}"]`);
    if (!input) continue;
    const val = input.value.trim();

    if (r.required && !val) {
      showFieldError(input, r.required); if (!first) first = input; valid = false; continue;
    }
    if (r.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showFieldError(input, r.email); if (!first) first = input; valid = false; continue;
    }
    if (r.minLength && val && val.length < r.minLength[0]) {
      showFieldError(input, r.minLength[1]); if (!first) first = input; valid = false; continue;
    }
    if (r.min !== undefined && val && parseFloat(val) < r.min[0]) {
      showFieldError(input, r.min[1]); if (!first) first = input; valid = false; continue;
    }
    if (r.max !== undefined && val && parseFloat(val) > r.max[0]) {
      showFieldError(input, r.max[1]); if (!first) first = input; valid = false; continue;
    }
    if (r.match) {
      const other = container.querySelector(`#${r.match[0]}`) || container.querySelector(`[name="${r.match[0]}"]`);
      if (other && val !== other.value.trim()) {
        showFieldError(input, r.match[1]); if (!first) first = input; valid = false; continue;
      }
    }
  }

  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return valid;
}

document.addEventListener('input', (e) => {
  if (e.target.parentElement?.querySelector('.field-error')) clearFieldError(e.target);
});
