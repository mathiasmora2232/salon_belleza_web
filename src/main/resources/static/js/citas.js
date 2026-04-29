const API = '/api/v1';
let allCitas  = [];
let estados   = [];
let servicios = [];

function authHeaders() {
  return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

// ── Carga inicial ────────────────────────────────────────────────────────────

async function loadEstados() {
  try {
    const res = await fetch(`${API}/citas/estados`, { headers: authHeaders() });
    estados = await res.json();
    const sel = document.getElementById('filterEstado');
    estados.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.codigo;
      opt.textContent = e.nombre;
      sel.appendChild(opt);
    });
  } catch (err) { console.error('loadEstados:', err); }
}

async function loadCitas(fecha) {
  setLoading(true);
  try {
    const url = fecha ? `${API}/citas/fecha/${fecha}` : `${API}/citas/hoy`;
    const res  = await fetch(url, { headers: authHeaders() });
    allCitas = await res.json();
    renderTable();
  } catch (err) {
    console.error('loadCitas:', err);
    showError('No se pudieron cargar las citas.');
  } finally {
    setLoading(false);
  }
}

async function loadServiciosYEstilistas() {
  try {
    const [sRes, eRes] = await Promise.all([
      fetch(`${API}/servicios/estado/Activo`, { headers: authHeaders() }),
      fetch(`${API}/estilistas/estado/Activo`, { headers: authHeaders() })
    ]);
    servicios        = await sRes.json();
    const estilistas = await eRes.json();

    const sSelect = document.getElementById('modalServicio');
    if (sSelect) {
      sSelect.innerHTML = '<option value="" disabled selected>Selecciona un servicio</option>';
      servicios.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.nombre} — $${parseFloat(s.precio).toFixed(2)} (${s.duracionMin} min)`;
        sSelect.appendChild(opt);
      });
    }

    const eSelect = document.getElementById('modalEstilista');
    if (eSelect) {
      eSelect.innerHTML = '<option value="">Sin preferencia</option>';
      estilistas.forEach(est => {
        const opt = document.createElement('option');
        opt.value = est.id;
        opt.textContent = est.nombre;
        eSelect.appendChild(opt);
      });
    }
  } catch (err) { console.error('loadServiciosYEstilistas:', err); }
}

// ── Render tabla ─────────────────────────────────────────────────────────────

function renderTable() {
  const estadoFiltro = document.getElementById('filterEstado').value;
  const filtered = estadoFiltro
    ? allCitas.filter(c => c.estado?.codigo === estadoFiltro)
    : allCitas;

  const tbody = document.getElementById('citasBody');
  tbody.innerHTML = '';

  document.getElementById('citasCount').textContent =
    `${filtered.length} cita${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay citas para esta fecha.</td></tr>`;
    return;
  }

  filtered.forEach(cita => {
    const horaI    = fmtTime(cita.horaInicio);
    const horaF    = fmtTime(cita.horaFin);
    const cliente  = cita.cliente
      ? `${cita.cliente.nombre} ${cita.cliente.apellido || ''}`.trim()
      : '—';
    const telefono  = cita.cliente?.telefono || '';
    const estilista = cita.estilista?.nombre || '—';
    const estado    = cita.estado?.nombre    || '—';
    const codigo    = cita.estado?.codigo    || '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="citas-table__time">${horaI}${horaF ? '–' + horaF : ''}</td>
      <td>
        <div class="citas-table__client">
          <div class="citas-table__avatar" style="background:${avatarColor(cliente)}">${cliente.charAt(0)}</div>
          <div>
            <span>${escHtml(cliente)}</span>
            ${telefono ? `<br><small class="text-muted">${escHtml(telefono)}</small>` : ''}
          </div>
        </div>
      </td>
      <td>${escHtml(estilista)}</td>
      <td class="text-muted obs-cell">${escHtml(cita.observaciones || '—')}</td>
      <td><span class="badge ${badgeClass(codigo)}">${escHtml(estado)}</span></td>
      <td>
        <div class="action-btns">${buildActions(codigo, cita.id)}</div>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── Acciones de estado ───────────────────────────────────────────────────────

const TRANSITIONS = {
  PENDIENTE: [{ label: 'Agendar', next: 'AGE', cls: 'btn-xs btn-xs--blue' },
              { label: 'Cancelar', next: 'CAN', cls: 'btn-xs btn-xs--rose' }],
  AGE:       [{ label: 'Confirmar', next: 'CON', cls: 'btn-xs btn-xs--green' },
              { label: 'Cancelar', next: 'CAN', cls: 'btn-xs btn-xs--rose' }],
  CON:       [{ label: 'Iniciar', next: 'CUR', cls: 'btn-xs btn-xs--blue' },
              { label: 'Cancelar', next: 'CAN', cls: 'btn-xs btn-xs--rose' }],
  CUR:       [{ label: 'Finalizar', next: 'FIN', cls: 'btn-xs btn-xs--gold' }],
  FIN:       [],
  CAN:       [],
  NAS:       []
};

function buildActions(codigo, id) {
  return (TRANSITIONS[codigo] || [])
    .map(a => `<button class="${a.cls}" onclick="cambiarEstado(${id},'${a.next}')">${a.label}</button>`)
    .join('');
}

async function cambiarEstado(id, codigo) {
  try {
    const res = await fetch(`${API}/citas/${id}/estado/${codigo}`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (!res.ok) { alert('No se pudo cambiar el estado.'); return; }
    const updated = await res.json();
    const idx = allCitas.findIndex(c => c.id === id);
    if (idx !== -1) allCitas[idx] = updated;
    renderTable();
  } catch (err) { console.error('cambiarEstado:', err); }
}

// ── Modal nueva cita ─────────────────────────────────────────────────────────

async function crearCita() {
  const submitBtn = document.querySelector('#formNuevaCita [type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando…';

  const nombreCompleto = document.getElementById('modalNombre').value.trim();
  const partes = nombreCompleto.split(' ');
  const estilistaVal = document.getElementById('modalEstilista').value;

  const body = {
    nombre:      partes[0],
    apellido:    partes.slice(1).join(' '),
    telefono:    document.getElementById('modalTelefono').value.trim(),
    email:       document.getElementById('modalEmail').value.trim() || null,
    servicioId:  parseInt(document.getElementById('modalServicio').value),
    estilistaId: estilistaVal ? parseInt(estilistaVal) : null,
    fecha:       document.getElementById('modalFecha').value,
    horaInicio:  document.getElementById('modalHora').value + ':00',
    observaciones: document.getElementById('modalObs').value.trim() || null
  };

  try {
    const res = await fetch(`${API}/citas/publica`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.status === 201 || res.ok) {
      closeModal();
      document.getElementById('formNuevaCita').reset();
      await loadCitas(document.getElementById('filterFecha').value);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.message || 'Error al crear la cita.');
    }
  } catch {
    alert('Error de conexión.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar cita';
  }
}

function openModal()  { document.getElementById('modalNuevaCita').classList.add('open'); }
function closeModal() { document.getElementById('modalNuevaCita').classList.remove('open'); }

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(t) {
  if (!t) return '';
  return String(t).substring(0, 5);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badgeClass(codigo) {
  return { PENDIENTE: 'badge--pending', AGE: 'badge--blue',
           CON: 'badge--done', CUR: 'badge--progress', FIN: 'badge--done',
           CAN: 'badge--cancel', NAS: 'badge--cancel' }[codigo] || 'badge--pending';
}

function avatarColor(name) {
  const colors = [
    'linear-gradient(135deg,#D4A5A5,#8B6B6B)',
    'linear-gradient(135deg,#A5C4D4,#5A7B8B)',
    'linear-gradient(135deg,#C4D4A5,#7B8B5A)',
    'linear-gradient(135deg,#D4B5D4,#8B5A8B)',
    'linear-gradient(135deg,#C9A84C,#8B6B30)'
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function setLoading(on) {
  document.getElementById('citasBody').innerHTML = on
    ? `<tr><td colspan="6" class="table-empty">Cargando citas…</td></tr>`
    : '';
}

function showError(msg) {
  document.getElementById('citasBody').innerHTML =
    `<tr><td colspan="6" class="table-empty table-empty--error">${msg}</td></tr>`;
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date().toISOString().split('T')[0];
  const filterFecha = document.getElementById('filterFecha');
  filterFecha.value = today;
  document.getElementById('modalFecha').setAttribute('min', today);

  await loadEstados();
  await loadCitas(today);
  loadServiciosYEstilistas();

  filterFecha.addEventListener('change', () => loadCitas(filterFecha.value));
  document.getElementById('filterEstado').addEventListener('change', renderTable);

  document.getElementById('btnNuevaCita')?.addEventListener('click', openModal);
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalNuevaCita')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modalNuevaCita')) closeModal();
  });

  document.getElementById('formNuevaCita')?.addEventListener('submit', async e => {
    e.preventDefault();
    await crearCita();
  });
});
