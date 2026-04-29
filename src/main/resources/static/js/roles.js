const API_ROLES = '/api/v1/seguridad';
let roles = [];
let usuarios = [];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadRoles(), loadUsuarios()]);
  document.querySelector('.topbar__search-input')?.addEventListener('input', e => renderRoles(e.target.value));
  document.querySelector('.content__header .btn-action')?.addEventListener('click', () => {
    alert('La creación de roles debe hacerse directamente en la base de datos por el administrador del sistema.');
  });
});

async function loadRoles() {
  const tbody = document.querySelector('.citas-full-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Cargando roles…</td></tr>';
  try {
    const res = await fetch(`${API_ROLES}/roles`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`Error ${res.status} al cargar roles`);
    roles = await res.json();
    renderRoles();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty table-empty--error">${esc(err.message)}</td></tr>`;
  }
}

async function loadUsuarios() {
  try {
    const res = await fetch('/api/v1/usuarios', { headers: authHeaders() });
    if (!res.ok) return;
    usuarios = await res.json();
  } catch {
    usuarios = [];
  }
}

function countUsuariosByRol(rolNombre) {
  return usuarios.filter(u => u.rol?.nombre === rolNombre).length;
}

async function loadPermisos(rolId) {
  try {
    const res = await fetch(`${API_ROLES}/rol/${rolId}/permisos`, { headers: authHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function renderRoles(query = '') {
  const tbody = document.querySelector('.citas-full-table tbody');
  if (!tbody) return;
  const q = query.trim().toLowerCase();
  const list = q
    ? roles.filter(r => String(r.nombre || '').toLowerCase().includes(q) || String(r.descripcion || '').toLowerCase().includes(q))
    : roles;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">${q ? 'Sin resultados' : 'Sin roles configurados'}</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => {
    const userCount = countUsuariosByRol(r.nombre);
    return `
      <tr>
        <td><strong>${esc(r.nombre)}</strong></td>
        <td>${esc(r.descripcion || '—')}</td>
        <td>
          <button class="btn-xs btn-xs--blue" onclick="showPermisos(${r.id}, '${esc(r.nombre)}')">Ver permisos</button>
        </td>
        <td>
          <span class="badge badge--progress">${userCount}</span>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-xs btn-xs--blue" onclick="showPermisos(${r.id}, '${esc(r.nombre)}')">Permisos</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

async function showPermisos(rolId, rolNombre) {
  const permisos = await loadPermisos(rolId);
  const lines = permisos.length
    ? permisos.map(p => `• ${p.recurso?.nombre || ''} — ${p.accion?.nombre || ''}`).join('\n')
    : 'Sin permisos asignados.';
  alert(`Permisos del rol "${rolNombre}":\n\n${lines}`);
}

function esc(val) {
  return String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
