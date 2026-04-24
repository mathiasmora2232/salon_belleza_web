(function () {
  const COLORS = [
    '#c9a84c', '#e87878', '#4a6fa5', '#7ba17b',
    '#8b6b8b', '#5a8b8b', '#b87c5a', '#6b7a8b'
  ];

  const usuario    = getUsuario();
  const avatarEl   = document.getElementById('avatarPreview');
  const initialEl  = document.getElementById('avatarInitial');
  const imgEl      = document.getElementById('avatarImg');
  const fileInput  = document.getElementById('avatarFileInput');
  const swatchWrap = document.getElementById('colorSwatches');
  const removeBtn  = document.getElementById('removeAvatarBtn');
  const fNombre    = document.getElementById('fieldNombre');
  const fEmail     = document.getElementById('fieldEmail');
  const fTelefono  = document.getElementById('fieldTelefono');
  const fRol       = document.getElementById('fieldRol');
  const saveBtn    = document.getElementById('saveProfileBtn');
  const saveMsg    = document.getElementById('saveMsg');

  let selColor = localStorage.getItem('profile_avatar_color') || COLORS[0];
  let selType  = localStorage.getItem('profile_avatar_type')  || 'color';
  let selImage = localStorage.getItem('profile_avatar_image') || null;

  // Populate form fields
  if (usuario) {
    if (fNombre)   fNombre.value   = usuario.nombreCompleto || '';
    if (fEmail)    fEmail.value    = usuario.email || '';
    if (fTelefono) fTelefono.value = usuario.telefono || '';
    if (fRol)      fRol.textContent = usuario.rol || '—';
  }

  // Build color swatches
  COLORS.forEach(hex => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-swatch';
    btn.style.background = hex;
    btn.title = hex;
    btn.dataset.color = hex;
    btn.addEventListener('click', () => pickColor(hex));
    swatchWrap.appendChild(btn);
  });

  function refreshSwatches() {
    document.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('selected', s.dataset.color === selColor && selType === 'color');
    });
  }

  function renderPreview() {
    if (selType === 'image' && selImage) {
      imgEl.src = selImage;
      imgEl.hidden = false;
      initialEl.hidden = true;
      avatarEl.style.background = '';
      if (removeBtn) removeBtn.hidden = false;
    } else {
      imgEl.hidden = true;
      initialEl.hidden = false;
      initialEl.textContent = (usuario?.nombreCompleto || usuario?.email || 'A')[0].toUpperCase();
      avatarEl.style.background = selColor;
      if (removeBtn) removeBtn.hidden = true;
    }
    refreshSwatches();
  }

  function pickColor(hex) {
    selColor = hex;
    selType  = 'color';
    renderPreview();
  }

  // Photo upload
  fileInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      selImage = ev.target.result;
      selType  = 'image';
      renderPreview();
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  // Remove photo
  removeBtn?.addEventListener('click', () => {
    selImage = null;
    selType  = 'color';
    renderPreview();
  });

  // Save
  saveBtn?.addEventListener('click', () => {
    // Persist avatar prefs
    localStorage.setItem('profile_avatar_type',  selType);
    localStorage.setItem('profile_avatar_color', selColor);
    if (selType === 'image' && selImage) {
      localStorage.setItem('profile_avatar_image', selImage);
    } else {
      localStorage.removeItem('profile_avatar_image');
    }

    // Persist user fields
    if (usuario) {
      usuario.nombreCompleto = fNombre?.value.trim() || usuario.nombreCompleto;
      usuario.telefono       = fTelefono?.value.trim() || '';
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }

    // Sync topbar + sidebar avatars immediately
    if (typeof applyAvatars === 'function') applyAvatars();

    // Show confirmation
    if (saveMsg) {
      saveMsg.classList.add('visible');
      setTimeout(() => saveMsg.classList.remove('visible'), 3000);
    }
  });

  renderPreview();
})();
