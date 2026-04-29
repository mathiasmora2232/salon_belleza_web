const API = '/api/v1/estilistas';
let estilistas = [];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

document.addEventListener('DOMContentLoaded', () => {
  loadEstilistas();
  document.getElementById('btnNuevoEstilista').addEventListener('click', () => openModal());
  document.getElementById('estilistaModalClose').addEventListener('click', closeModal);
  document.getElementById('estilistaModalCancel').addEventListener('click', closeModal);
  document.getElementById('estilistaForm').addEventListener('submit', saveEstilista);
  document.getElementById('estilistaModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.querySelector('.topbar__search-input').addEventListener('input', e => renderEstilistas(e.target.value));
});

async function loadEstilistas() {
  const tbody = document.getElementById('estilistasTbody');
  tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Cargando…</td></tr>';
  try {
    const res = await fetch(API, { headers: authHeaders() });
    if (!res.ok) throw new Error('No se pudieron cargar los estilistas');
    estilistas = await res.json();
    renderEstilistas();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty table-empty--error">${esc(err.message)}</td></tr>`;
  }
}

function renderEstilistas(query = '') {
  const tbody = document.getElementById('estilistasTbody');
  const q = query.trim().toLowerCase();
  const list = q
    ? estilistas.filter(e => [e.nombre, e.telefono, e.especialidad].some(v => String(v || '').toLowerCase().includes(q)))
    : estilistas;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty">${q ? 'Sin resultados para "' + esc(q) + '"' : 'Sin estilistas registrados'}</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(e => `
    <tr>
      <td>
        <div class="citas-table__client">
          <div class="citas-table__avatar">${(e.nombre || 'E')[0].toUpperCase()}</div>
          <strong>${esc(e.nombre)}</strong>
        </div>
      </td>
      <td>${esc(e.telefono || '—')}</td>
      <td>${esc(e.especialidad || '—')}</td>
      <td>${e.experienciaAnios != null ? e.experienciaAnios + ' año' + (e.experienciaAnios !== 1 ? 's' : '') : '—'}</td>
      <td>${e.comisionPorcentaje != null ? Number(e.comisionPorcentaje).toFixed(1) + '%' : '—'}</td>
      <td><span class="badge ${e.estado === 'Activo' ? 'badge--done' : 'badge--cancel'}">${esc(e.estado || 'Activo')}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-xs btn-xs--blue" onclick="editEstilista(${e.id})">Editar</button>
          <button class="btn-xs ${e.estado === 'Activo' ? 'btn-xs--rose' : 'btn-xs--green'}" onclick="toggleEstilista(${e.id})">${e.estado === 'Activo' ? 'Inactivar' : 'Activar'}</button>
          <button class="btn-xs btn-xs--rose" onclick="deleteEstilista(${e.id})">Borrar</button>
        </div>
      </td>
    </tr>`).join('');
}

function openModal(est = null) {
  document.getElementById('estilistaModalTitle').textContent = est ? 'Editar estilista' : 'Nuevo estilista';
  document.getElementById('estilistaId').value = est?.id || '';
  document.getElementById('estilistaNombre').value = est?.nombre || '';
  document.getElementById('estilistaTelefono').value = est?.telefono || '';
  document.getElementById('estilistaEspecialidad').value = est?.especialidad || '';
  document.getElementById('estilistaExperiencia').value = est?.experienciaAnios ?? '';
  document.getElementById('estilistaComision').value = est?.comisionPorcentaje != null ? Number(est.comisionPorcentaje).toFixed(2) : '';
  document.getElementById('estilistaFechaIngreso').value = est?.fechaIngreso || '';
  document.getElementById('estilistaEstado').value = est?.estado || 'Activo';
  document.getElementById('estilistaModalOverlay').hidden = false;
  document.getElementById('estilistaNombre').focus();
}

function closeModal() {
  document.getElementById('estilistaModalOverlay').hidden = true;
}

function editEstilista(id) {
  const e = estilistas.find(x => x.id === id);
  if (e) openModal(e);
}

async function toggleEstilista(id) {
  const e = estilistas.find(x => x.id === id);
  if (!e) return;
  const newEstado = e.estado === 'Activo' ? 'Inactivo' : 'Activo';
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...e, estado: newEstado })
    });
    if (!res.ok) throw new Error('No se pudo actualizar el estado');
    await loadEstilistas();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteEstilista(id) {
  const e = estilistas.find(x => x.id === id);
  if (!e) return;
  if (!confirm(`¿Eliminar a ${e.nombre}? Esta acción no se puede deshacer.`)) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) throw new Error('No se pudo eliminar el estilista');
    await loadEstilistas();
  } catch (err) {
    alert(err.message);
  }
}

async function saveEstilista(ev) {
  ev.preventDefault();
  const id = document.getElementById('estilistaId').value;
  const exp = document.getElementById('estilistaExperiencia').value;
  const com = document.getElementById('estilistaComision').value;

  const payload = {
    nombre: document.getElementById('estilistaNombre').value.trim(),
    telefono: document.getElementById('estilistaTelefono').value.trim(),
    especialidad: document.getElementById('estilistaEspecialidad').value.trim(),
    experienciaAnios: exp !== '' ? parseInt(exp, 10) : null,
    comisionPorcentaje: com !== '' ? parseFloat(com) : null,
    fechaIngreso: document.getElementById('estilistaFechaIngreso').value || null,
    estado: document.getElementById('estilistaEstado').value
  };

  if (!payload.nombre) {
    document.getElementById('estilistaNombre').focus();
    return;
  }

  const btn = document.getElementById('estilistaSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    const url = id ? `${API}/${id}` : API;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'No se pudo guardar el estilista');
    }
    closeModal();
    await loadEstilistas();
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
}

function esc(val) {
  return String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
