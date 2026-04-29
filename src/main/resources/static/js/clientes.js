const API = '/api/v1/clientes';
let clientes = [];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

document.addEventListener('DOMContentLoaded', () => {
  loadClientes();
  document.getElementById('btnNuevoCliente').addEventListener('click', () => openModal());
  document.getElementById('clienteModalClose').addEventListener('click', closeModal);
  document.getElementById('clienteModalCancel').addEventListener('click', closeModal);
  document.getElementById('clienteForm').addEventListener('submit', saveCliente);
  document.getElementById('clientesTbody').addEventListener('click', handleTableAction);
  document.getElementById('clienteModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.querySelector('.topbar__search-input').addEventListener('input', e => renderClientes(e.target.value));
});

async function loadClientes() {
  const tbody = document.getElementById('clientesTbody');
  tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Cargando…</td></tr>';
  try {
    const res = await fetch(API, { headers: authHeaders() });
    if (!res.ok) throw new Error('No se pudieron cargar los clientes');
    clientes = await res.json();
    renderClientes();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty table-empty--error">${esc(err.message)}</td></tr>`;
  }
}

function renderClientes(query = '') {
  const tbody = document.getElementById('clientesTbody');
  const q = query.trim().toLowerCase();
  const list = q
    ? clientes.filter(c => [c.nombre, c.apellido, c.telefono, c.email, c.ciudad].some(v => String(v || '').toLowerCase().includes(q)))
    : clientes;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty">${q ? 'Sin resultados para "' + esc(q) + '"' : 'Sin clientes registrados'}</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => `
    <tr>
      <td>
        <div class="citas-table__client">
          <div class="citas-table__avatar">${(c.nombre || 'C')[0].toUpperCase()}</div>
          <div>
            <strong>${esc(c.nombre)} ${esc(c.apellido || '')}</strong>
            ${c.numeroIdentificacion ? `<br><small class="text-muted">${esc(c.numeroIdentificacion)}</small>` : ''}
          </div>
        </div>
      </td>
      <td>${esc(c.telefono || '—')}</td>
      <td>${esc(c.email || '—')}</td>
      <td>${esc(c.ciudad || '—')}</td>
      <td>${c.fechaRegistro ? formatDate(c.fechaRegistro) : '—'}</td>
      <td><span class="badge ${c.estado === 'Activo' ? 'badge--done' : 'badge--cancel'}">${esc(c.estado || 'Activo')}</span></td>
      <td>
        <div class="action-btns">
          <button type="button" class="btn-xs btn-xs--gold" data-cliente-action="history" data-cliente-id="${c.id}">Historial</button>
          <button type="button" class="btn-xs btn-xs--blue" data-cliente-action="edit" data-cliente-id="${c.id}">Editar</button>
          <button type="button" class="btn-xs ${c.estado === 'Activo' ? 'btn-xs--rose' : 'btn-xs--green'}" data-cliente-action="toggle" data-cliente-id="${c.id}">${c.estado === 'Activo' ? 'Inactivar' : 'Activar'}</button>
          <button type="button" class="btn-xs btn-xs--rose" data-cliente-action="delete" data-cliente-id="${c.id}">Borrar</button>
        </div>
      </td>
    </tr>`).join('');
}

function handleTableAction(e) {
  const btn = e.target.closest('[data-cliente-action]');
  if (!btn) return;

  const id = Number(btn.dataset.clienteId);
  if (!id) return;

  if (btn.dataset.clienteAction === 'edit') editCliente(id);
  if (btn.dataset.clienteAction === 'history') window.location.href = `historial.html?cliente=${id}`;
  if (btn.dataset.clienteAction === 'toggle') toggleCliente(id);
  if (btn.dataset.clienteAction === 'delete') deleteCliente(id);
}

function openModal(cliente = null) {
  document.getElementById('clienteModalTitle').textContent = cliente ? 'Editar cliente' : 'Nuevo cliente';
  document.getElementById('clienteId').value = cliente?.id || '';
  document.getElementById('clienteNombre').value = cliente?.nombre || '';
  document.getElementById('clienteApellido').value = cliente?.apellido || '';
  document.getElementById('clienteTelefono').value = cliente?.telefono || '';
  document.getElementById('clienteEmail').value = cliente?.email || '';
  document.getElementById('clienteCiudad').value = cliente?.ciudad || '';
  document.getElementById('clienteDireccion').value = cliente?.direccion || '';
  document.getElementById('clienteEstado').value = cliente?.estado || 'Activo';
  const overlay = document.getElementById('clienteModalOverlay');
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('show'));
  document.getElementById('clienteNombre').focus();
}

function closeModal() {
  const overlay = document.getElementById('clienteModalOverlay');
  overlay.classList.remove('show');
  window.setTimeout(() => {
    if (!overlay.classList.contains('show')) overlay.hidden = true;
  }, 180);
}

function editCliente(id) {
  const c = clientes.find(x => Number(x.id) === Number(id));
  if (c) openModal(c);
}

async function toggleCliente(id) {
  const c = clientes.find(x => Number(x.id) === Number(id));
  if (!c) return;
  const newEstado = c.estado === 'Activo' ? 'Inactivo' : 'Activo';
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...c, estado: newEstado })
    });
    if (!res.ok) throw new Error('No se pudo actualizar el estado');
    await loadClientes();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteCliente(id) {
  const c = clientes.find(x => Number(x.id) === Number(id));
  if (!c) return;
  if (!confirm(`¿Eliminar a ${c.nombre} ${c.apellido || ''}? Esta acción no se puede deshacer.`)) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) throw new Error('No se pudo eliminar el cliente');
    await loadClientes();
  } catch (err) {
    alert(err.message);
  }
}

async function saveCliente(e) {
  e.preventDefault();
  const id = document.getElementById('clienteId').value;
  const payload = {
    nombre: document.getElementById('clienteNombre').value.trim(),
    apellido: document.getElementById('clienteApellido').value.trim(),
    telefono: document.getElementById('clienteTelefono').value.trim(),
    email: document.getElementById('clienteEmail').value.trim(),
    ciudad: document.getElementById('clienteCiudad').value.trim(),
    direccion: document.getElementById('clienteDireccion').value.trim(),
    estado: document.getElementById('clienteEstado').value
  };

  if (!payload.nombre) {
    document.getElementById('clienteNombre').focus();
    return;
  }

  const btn = document.getElementById('clienteSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    const url = id ? `${API}/${id}` : API;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'No se pudo guardar el cliente');
    }
    closeModal();
    await loadClientes();
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

function esc(val) {
  return String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
