const API = '/api/v1';
let usuarios = [];
let roles = [];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

document.addEventListener('DOMContentLoaded', async () => {
  buildUsuarioModal();
  await Promise.all([loadRoles(), loadUsuarios()]);
  document.querySelector('.content__header .btn-action')?.addEventListener('click', () => openUsuarioModal());
  document.querySelector('.topbar__search-input')?.addEventListener('input', e => renderUsuarios(e.target.value));
});

async function loadRoles() {
  const res = await fetch(`${API}/seguridad/roles`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudieron cargar roles');
  roles = await res.json();
}

async function loadUsuarios() {
  const tbody = document.querySelector('.citas-full-table tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Cargando usuarios...</td></tr>';
  try {
    const res = await fetch(`${API}/usuarios`, { headers: authHeaders() });
    if (!res.ok) throw new Error('No se pudieron cargar usuarios');
    usuarios = await res.json();
    renderUsuarios();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty table-empty--error">${err.message}</td></tr>`;
  }
}

function renderUsuarios(query = '') {
  const tbody = document.querySelector('.citas-full-table tbody');
  const q = query.trim().toLowerCase();
  const list = q
    ? usuarios.filter(u => [u.nombreCompleto, u.email, u.username, u.rol?.nombre].some(v => String(v || '').toLowerCase().includes(q)))
    : usuarios;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Sin usuarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(u => `
    <tr>
      <td><strong>${esc(u.nombreCompleto)}</strong><br><small class="text-muted">@${esc(u.username)}</small></td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.rol?.nombre || 'Sin rol')}</td>
      <td>${u.ultimoLogin ? formatDateTime(u.ultimoLogin) : 'Nunca'}</td>
      <td><span class="badge ${u.estado === 'Activo' ? 'badge--done' : 'badge--cancel'}">${esc(u.estado || 'Activo')}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-xs btn-xs--blue" onclick="editUsuario(${u.id})">Editar</button>
          <button class="btn-xs ${u.estado === 'Activo' ? 'btn-xs--rose' : 'btn-xs--green'}" onclick="toggleUsuario(${u.id})">${u.estado === 'Activo' ? 'Inactivar' : 'Activar'}</button>
          <button class="btn-xs btn-xs--rose" onclick="deleteUsuario(${u.id})">Borrar</button>
        </div>
      </td>
    </tr>`).join('');
}

function buildUsuarioModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'usuarioModal';
  modal.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__header">
        <h2 class="modal__title" id="usuarioModalTitle">Nuevo usuario</h2>
        <button type="button" class="modal__close" onclick="closeUsuarioModal()" aria-label="Cerrar">×</button>
      </div>
      <div class="modal__body">
        <form id="usuarioForm" novalidate>
          <input type="hidden" id="usuarioId">
          <div class="modal__form-grid">
            <div class="form-group"><label class="form-label">Username *</label><input class="form-input" id="usuarioUsername" required></div>
            <div class="form-group"><label class="form-label">Email *</label><input class="form-input" id="usuarioEmail" type="email" required></div>
            <div class="form-group"><label class="form-label">Nombre completo *</label><input class="form-input" id="usuarioNombre" required></div>
            <div class="form-group"><label class="form-label">Teléfono</label><input class="form-input" id="usuarioTelefono"></div>
            <div class="form-group"><label class="form-label">Rol *</label><select class="form-input" id="usuarioRol" required></select></div>
            <div class="form-group"><label class="form-label">Estado</label><select class="form-input" id="usuarioEstado"><option>Activo</option><option>Inactivo</option></select></div>
            <div class="form-group span-2"><label class="form-label">Contraseña <span id="passwordHint">*</span></label><input class="form-input" id="usuarioPassword" type="password" autocomplete="new-password"></div>
          </div>
          <div class="modal__footer">
            <button type="button" class="btn-cancel" onclick="closeUsuarioModal()">Cancelar</button>
            <button type="submit" class="btn-save">Guardar usuario</button>
          </div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('usuarioForm').addEventListener('submit', saveUsuario);
}

function fillRoleSelect(selectedId) {
  const select = document.getElementById('usuarioRol');
  select.innerHTML = '<option value="">Selecciona rol</option>' + roles.map(r => `<option value="${r.id}" ${String(r.id) === String(selectedId) ? 'selected' : ''}>${esc(r.nombre)}</option>`).join('');
}

function openUsuarioModal(usuario = null) {
  document.getElementById('usuarioModalTitle').textContent = usuario ? 'Editar usuario' : 'Nuevo usuario';
  document.getElementById('usuarioId').value = usuario?.id || '';
  document.getElementById('usuarioUsername').value = usuario?.username || '';
  document.getElementById('usuarioEmail').value = usuario?.email || '';
  document.getElementById('usuarioNombre').value = usuario?.nombreCompleto || '';
  document.getElementById('usuarioTelefono').value = usuario?.telefono || '';
  document.getElementById('usuarioEstado').value = usuario?.estado || 'Activo';
  document.getElementById('usuarioPassword').value = '';
  document.getElementById('passwordHint').textContent = usuario ? '(opcional)' : '*';
  fillRoleSelect(usuario?.rol?.id);
  document.getElementById('usuarioModal').classList.add('open');
}

function closeUsuarioModal() {
  document.getElementById('usuarioModal').classList.remove('open');
}

async function saveUsuario(e) {
  e.preventDefault();
  const id = document.getElementById('usuarioId').value;
  const password = document.getElementById('usuarioPassword').value;
  if (!id && !password) {
    alert('La contraseña es obligatoria para crear usuarios.');
    return;
  }
  const body = {
    username: document.getElementById('usuarioUsername').value.trim(),
    email: document.getElementById('usuarioEmail').value.trim(),
    nombreCompleto: document.getElementById('usuarioNombre').value.trim(),
    telefono: document.getElementById('usuarioTelefono').value.trim(),
    rolId: parseInt(document.getElementById('usuarioRol').value),
    estado: document.getElementById('usuarioEstado').value
  };
  if (password) body.password = password;

  const res = await fetch(id ? `${API}/usuarios/${id}` : `${API}/usuarios`, {
    method: id ? 'PUT' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || 'No se pudo guardar el usuario.');
    return;
  }
  closeUsuarioModal();
  await loadUsuarios();
}

window.editUsuario = id => openUsuarioModal(usuarios.find(u => u.id === id));

window.toggleUsuario = async id => {
  const u = usuarios.find(x => x.id === id);
  if (!u) return;
  await fetch(`${API}/usuarios/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      username: u.username,
      email: u.email,
      nombreCompleto: u.nombreCompleto,
      telefono: u.telefono,
      rolId: u.rol?.id,
      estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo'
    })
  });
  await loadUsuarios();
};

window.deleteUsuario = async id => {
  if (!confirm('¿Eliminar este usuario?')) return;
  const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) alert('No se pudo eliminar el usuario.');
  await loadUsuarios();
};

function formatDateTime(value) {
  return new Date(value).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });
}

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
