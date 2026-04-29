const API       = '/api/v1/citas';
const API_RPT   = '/api/v1/reportes';
let allEventos  = [];
let currentFilter = 'todos';

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

document.addEventListener('DOMContentLoaded', () => {
  loadEventos();
  document.querySelector('.topbar__search-input')?.addEventListener('input', e => renderEventos(e.target.value));
  document.getElementById('eventoDetailClose')?.addEventListener('click', closeDetail);
  document.getElementById('eventoDetailOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDetail();
  });
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('btn-filter--active'));
      btn.classList.add('btn-filter--active');
      currentFilter = btn.dataset.filter;
      renderEventos(document.querySelector('.topbar__search-input')?.value || '');
    });
  });

  // PDF viewer controls
  document.getElementById('pdfVisorClose')?.addEventListener('click', () => {
    document.getElementById('pdfVisorOverlay').classList.remove('open');
    document.getElementById('pdfVisorFrame').src = '';
    if (_pdfBlobUrl) { URL.revokeObjectURL(_pdfBlobUrl); _pdfBlobUrl = null; }
  });
  document.getElementById('pdfVisorDownload')?.addEventListener('click', () => {
    if (!_pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = _pdfBlobUrl; a.download = _pdfFilename || 'reporte.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  });
});

async function loadEventos() {
  const tbody = document.getElementById('eventosTbody');
  tbody.innerHTML = '<tr><td colspan="8" class="table-empty">Cargando eventos…</td></tr>';
  try {
    const res = await fetch(API, { headers: authHeaders() });
    if (!res.ok) throw new Error(`Error ${res.status} al cargar citas`);
    const citas = await res.json();
    allEventos = (Array.isArray(citas) ? citas : [])
      .filter(c => c.observaciones?.includes('Evento grupal:'));
    renderEventos();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty table-empty--error">${esc(err.message)}</td></tr>`;
  }
}

function parseEventoNotes(obs) {
  const lines = (obs || '').split('\n');
  const get = prefix => {
    const line = lines.find(l => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : '—';
  };
  // Extract per-person services lines
  const serviciosIdx = lines.findIndex(l => l.startsWith('Servicios por integrante:'));
  const servicios = serviciosIdx >= 0
    ? lines.slice(serviciosIdx + 1).filter(l => l.trim().startsWith('-')).map(l => l.trim())
    : [];
  // Extra notes (anything after services that doesn't start with -)
  const extras = serviciosIdx >= 0
    ? lines.slice(serviciosIdx + 1).filter(l => l.trim() && !l.trim().startsWith('-'))
    : [];
  return {
    tipo: get('Evento grupal:'),
    paquete: get('Paquete:'),
    integrantes: get('Integrantes:'),
    servicios,
    extras,
    raw: obs
  };
}

function renderEventos(query = '') {
  const tbody = document.getElementById('eventosTbody');
  const q = query.trim().toLowerCase();

  let list = allEventos;
  if (currentFilter !== 'todos') {
    list = list.filter(c => c.estado?.codigo === currentFilter || c.estado?.nombre?.toUpperCase() === currentFilter);
  }
  if (q) {
    list = list.filter(c => {
      const { tipo, paquete } = parseEventoNotes(c.observaciones);
      return [tipo, paquete, c.cliente?.nombre, c.cliente?.apellido, c.cliente?.telefono]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty">${q || currentFilter !== 'todos' ? 'Sin resultados' : 'No hay eventos registrados aún.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
    .map(c => {
      const { tipo, paquete, integrantes } = parseEventoNotes(c.observaciones);
      const cliente = c.cliente ? `${c.cliente.nombre || ''} ${c.cliente.apellido || ''}`.trim() : '—';
      const tel = c.cliente?.telefono || '';
      const estado = c.estado?.nombre || 'Pendiente';
      const codigo = c.estado?.codigo || '';
      return `
        <tr>
          <td>${c.fecha ? formatDate(c.fecha) : '—'}</td>
          <td><strong>${esc(tipo)}</strong></td>
          <td>
            ${esc(cliente)}
            ${tel ? `<br><small class="text-muted">${esc(tel)}</small>` : ''}
          </td>
          <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(paquete)}">${esc(paquete)}</td>
          <td style="text-align:center">${esc(integrantes)}</td>
          <td>${c.horaInicio ? String(c.horaInicio).substring(0, 5) : '—'}</td>
          <td><span class="badge ${badgeCls(codigo)}">${esc(estado)}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn-xs btn-xs--blue" onclick="openDetail(${c.id})">Ver</button>
              <button class="btn-xs btn-xs--green" onclick="cambiarEstado(${c.id}, 'CON')">Confirmar</button>
              <button class="btn-xs btn-xs--rose" onclick="cambiarEstado(${c.id}, 'CAN')">Cancelar</button>
            </div>
          </td>
        </tr>`;
    }).join('');
}

const AVATAR_COLORS = [
  '#c9a84c','#b07040','#8b6b6b','#6b8b8b','#6b7b8b',
  '#8b6b8b','#7b8b6b','#c97070','#70a0c9','#70c990'
];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

async function openDetail(id) {
  const c = allEventos.find(x => x.id === id);
  if (!c) return;

  const { tipo, paquete, integrantes, servicios, extras } = parseEventoNotes(c.observaciones);
  const cliente  = c.cliente ? `${c.cliente.nombre || ''} ${c.cliente.apellido || ''}`.trim() : '—';
  const tel      = c.cliente?.telefono || '—';
  const fecha    = c.fecha ? formatDate(c.fecha) : '—';
  const hora     = c.horaInicio ? String(c.horaInicio).substring(0, 5) : '—';
  const estado   = c.estado?.nombre || 'Pendiente';
  const codigo   = c.estado?.codigo || '';

  document.getElementById('eventoDetailTitle').textContent = tipo;
  document.getElementById('eventoDetailSub').innerHTML =
    `${fecha} &nbsp;·&nbsp; ${hora} &nbsp;·&nbsp; <span class="badge ${badgeCls(codigo)}">${esc(estado)}</span>`;

  // Service rows with avatars
  const serviciosHtml = servicios.length
    ? servicios.map(s => {
        const [persona, ...svcs] = s.replace(/^-\s*/, '').split(':');
        const name   = persona.trim();
        const initial = name.charAt(0).toUpperCase();
        const color  = avatarColor(name);
        return `<div class="ev-service-row">
          <div class="ev-person-avatar" style="background:${color}">${initial}</div>
          <div class="ev-service-info">
            <span class="ev-service-person">${esc(name)}</span>
            <span class="ev-service-list">${esc((svcs.join(':') || '').trim())}</span>
          </div>
        </div>`;
      }).join('')
    : '<p class="text-muted" style="margin:0;font-size:0.85rem">Sin detalle de servicios registrado</p>';

  const extrasHtml = extras.length
    ? `<div class="ev-extras">${extras.map(e => `<span>${esc(e)}</span>`).join('')}</div>`
    : '';

  document.getElementById('eventoDetailBody').innerHTML = `
    <div class="ev-info-grid">
      <div class="ev-info-cell">
        <span class="ev-info-label">Contacto</span>
        <span class="ev-info-value">${esc(cliente)}</span>
      </div>
      <div class="ev-info-cell">
        <span class="ev-info-label">Teléfono</span>
        <span class="ev-info-value">${esc(tel)}</span>
      </div>
      <div class="ev-info-cell">
        <span class="ev-info-label">Integrantes</span>
        <span class="ev-info-value">${esc(integrantes)}</span>
      </div>
      <div class="ev-info-cell ev-info-cell--wide">
        <span class="ev-info-label">Paquete</span>
        <span class="ev-info-value">${esc(paquete)}</span>
      </div>
    </div>

    <div class="ev-section">
      <h4 class="ev-section-title">Servicios por integrante</h4>
      <div class="ev-services-list">${serviciosHtml}</div>
      ${extrasHtml}
    </div>
  `;

  // Estado buttons
  const btnWrap = document.getElementById('eventoEstadoBtns');
  const estados = [
    { codigo: 'AGE', label: 'Agendado',   cls: 'btn-xs--blue'  },
    { codigo: 'CON', label: 'Confirmado', cls: 'btn-xs--green' },
    { codigo: 'CUR', label: 'En curso',   cls: 'btn-xs--blue'  },
    { codigo: 'FIN', label: 'Finalizado', cls: 'btn-xs--green' },
    { codigo: 'CAN', label: 'Cancelado',  cls: 'btn-xs--rose'  }
  ];
  btnWrap.innerHTML = estados
    .map(e => `<button class="btn-xs ${e.cls}${e.codigo === codigo ? ' btn-xs--active' : ''}" onclick="cambiarEstado(${id},'${e.codigo}')">${e.label}</button>`)
    .join('');

  // PDF buttons
  const pdfWrap = document.getElementById('eventoPdfBtns');
  pdfWrap.innerHTML = `
    <button class="btn-xs btn-xs--gold" id="btnGenerarPdf" onclick="generarPdf(${id})">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1px;margin-right:5px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>Generar PDF
    </button>
    <button class="btn-xs btn-xs--blue" id="btnVerPdf" style="display:none" onclick="verPdf(${id})">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1px;margin-right:5px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Ver guardado
    </button>
  `;

  checkReporteExiste(id);
  document.getElementById('eventoDetailOverlay').classList.add('show');
}

// ── PDF inline viewer ─────────────────────────────────────────────────────────

let _pdfBlobUrl  = null;
let _pdfFilename = null;

function abrirVisorPdf(blob, filename) {
  if (_pdfBlobUrl) URL.revokeObjectURL(_pdfBlobUrl);
  _pdfBlobUrl  = URL.createObjectURL(blob);
  _pdfFilename = filename;
  document.getElementById('pdfVisorTitle').textContent = filename;
  document.getElementById('pdfVisorFrame').src = _pdfBlobUrl;
  document.getElementById('pdfVisorOverlay').classList.add('open');
}

async function checkReporteExiste(id) {
  try {
    const res = await fetch(`${API_RPT}/evento/${id}/existe`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('btnVerPdf').style.display = data.existe ? 'inline-flex' : 'none';
  } catch { /* silencioso */ }
}

const PDF_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1px;margin-right:5px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`;

async function generarPdf(id) {
  const btn = document.getElementById('btnGenerarPdf');
  btn.disabled = true;
  btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1px;margin-right:5px;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Generando…`;
  try {
    const res = await fetch(`${API_RPT}/evento/${id}`, { method: 'POST', headers: authHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Error ${res.status}`);
    }
    const blob = await res.blob();
    document.getElementById('btnVerPdf').style.display = 'inline-flex';
    abrirVisorPdf(blob, `evento_${id}.pdf`);
  } catch (err) {
    alert('Error generando PDF: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = PDF_ICON + 'Generar PDF';
  }
}

async function verPdf(id) {
  const btn = document.getElementById('btnVerPdf');
  btn.disabled = true;
  try {
    const res = await fetch(`${API_RPT}/evento/${id}`, { headers: authHeaders() });
    if (res.status === 404) { alert('No hay reporte guardado. Genera uno primero.'); return; }
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const blob = await res.blob();
    abrirVisorPdf(blob, `evento_${id}.pdf`);
  } catch (err) {
    alert('Error cargando PDF: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

function closeDetail() {
  document.getElementById('eventoDetailOverlay').classList.remove('show');
}

async function cambiarEstado(id, codigo) {
  try {
    const res = await fetch(`${API}/${id}/estado/${codigo}`, { method: 'PATCH', headers: authHeaders() });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    closeDetail();
    await loadEventos();
  } catch (err) {
    alert('No se pudo cambiar el estado: ' + err.message);
  }
}

function badgeCls(codigo) {
  if (codigo === 'FIN') return 'badge--done';
  if (codigo === 'CUR' || codigo === 'CON' || codigo === 'AGE') return 'badge--progress';
  if (codigo === 'CAN' || codigo === 'NAS') return 'badge--cancel';
  return 'badge--pending';
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

function esc(val) {
  return String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
