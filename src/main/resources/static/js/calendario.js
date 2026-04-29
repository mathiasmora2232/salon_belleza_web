const API_CAL   = '/api/v1/calendario';
const API_CITAS = '/api/v1/citas';

let semanaOffset = 0;    // semanas desde hoy
let citasSemana  = [];
let slotsSemana  = {};   // fecha -> [slots]

const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

// ── Fechas ──────────────────────────────────────────────────────────────────

function lunesDeHoy() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dow = hoy.getDay(); // 0=Dom
  const diff = (dow === 0) ? -6 : 1 - dow;
  hoy.setDate(hoy.getDate() + diff);
  return hoy;
}

function addDias(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtIso(d) {
  return d.toISOString().slice(0, 10);
}

function fmtLabel(d) {
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtHora(t) {
  if (!t) return '';
  return String(t).substring(0, 5);
}

// ── Carga de datos ───────────────────────────────────────────────────────────

async function cargarSemana() {
  const lunes  = addDias(lunesDeHoy(), semanaOffset * 7);
  const sabado = addDias(lunes, 5);

  document.getElementById('semanaLabel').textContent =
    `${fmtLabel(lunes)} – ${fmtLabel(sabado)}`;

  const inicio = fmtIso(lunes);
  const fin    = fmtIso(sabado);

  renderLoading();
  try {
    const [resCitas, resSlotsArray] = await Promise.all([
      fetch(`${API_CAL}?inicio=${inicio}&fin=${fin}`, { headers: authHeaders() }),
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const f = fmtIso(addDias(lunes, i));
          return fetch(`${API_CAL}/slots?fecha=${f}`, { headers: authHeaders() })
            .then(r => r.json())
            .then(slots => ({ fecha: f, slots }));
        })
      )
    ]);

    if (!resCitas.ok) throw new Error(`Error ${resCitas.status}`);
    citasSemana = await resCitas.json();

    slotsSemana = {};
    for (const { fecha, slots } of resSlotsArray) {
      slotsSemana[fecha] = slots;
    }

    // Info capacidad
    const cap = resSlotsArray[0]?.slots?.[0]?.capacidad ?? 0;
    document.getElementById('capacidadInfo').textContent =
      cap > 0 ? `Capacidad: ${cap} estilista${cap !== 1 ? 's' : ''}` : '';

    renderGrid(lunes);
  } catch (err) {
    document.getElementById('calGrid').innerHTML =
      `<div class="cal-loading cal-loading--error">Error cargando datos: ${err.message}</div>`;
  }
}

// ── Render ───────────────────────────────────────────────────────────────────

function renderLoading() {
  document.getElementById('calGrid').innerHTML =
    '<div class="cal-loading">Cargando…</div>';
}

function slotColor(slot) {
  if (!slot || slot.capacidad === 0) return '';
  const ratio = slot.ocupados / slot.capacidad;
  if (ratio >= 1)   return 'cal-cell--full';
  if (ratio >= 0.5) return 'cal-cell--almost';
  return 'cal-cell--free';
}

function badgeCls(codigo) {
  if (!codigo) return 'badge--pending';
  if (['FIN','COMPLETADA'].includes(codigo)) return 'badge--done';
  if (['CUR','CON','AGE','PENDIENTE'].includes(codigo)) return 'badge--progress';
  if (['CAN','NAS','CANCELADA','CANCELADO'].includes(codigo)) return 'badge--cancel';
  return 'badge--pending';
}

function renderGrid(lunes) {
  const hoyIso = fmtIso(new Date());
  const grid   = document.getElementById('calGrid');

  // Columnas: hora + 6 días (lun-sab)
  const cols  = 7;
  const slots = slotsSemana[fmtIso(lunes)] ?? [];
  const horas = slots.map(s => s.hora);

  let html = `<div class="cal-table" style="--cal-cols:${cols}">`;

  // Cabecera
  html += '<div class="cal-thead">';
  html += '<div class="cal-th cal-th--hora"></div>';
  for (let d = 0; d < 6; d++) {
    const dia    = addDias(lunes, d);
    const iso    = fmtIso(dia);
    const esHoy  = iso === hoyIso;
    const nombre = DIAS[dia.getDay()];
    html += `<div class="cal-th${esHoy ? ' cal-th--today' : ''}">
      <span class="cal-th__dia">${nombre}</span>
      <span class="cal-th__num${esHoy ? ' cal-th__num--today' : ''}">${dia.getDate()}</span>
    </div>`;
  }
  html += '</div>';

  // Filas por cada slot de 30 min
  for (const horaStr of horas) {
    html += '<div class="cal-row">';
    html += `<div class="cal-hora">${fmtHora(horaStr)}</div>`;

    for (let d = 0; d < 6; d++) {
      const dia  = addDias(lunes, d);
      const iso  = fmtIso(dia);
      const slot = (slotsSemana[iso] ?? []).find(s => s.hora === horaStr);
      const cls  = slotColor(slot);
      const isFull = slot?.lleno ?? false;

      // Citas en este slot (horaInicio == horaStr)
      const citas = citasSemana.filter(c =>
        c.fecha === iso && fmtHora(c.horaInicio) === fmtHora(horaStr)
      );

      const capLabel = slot
        ? `<span class="cal-cap ${isFull ? 'cal-cap--full' : ''}">${slot.ocupados}/${slot.capacidad}</span>`
        : '';

      html += `<div class="cal-cell ${cls}" data-fecha="${iso}" data-hora="${horaStr}">
        ${capLabel}
        ${citas.map(c => citaChip(c)).join('')}
      </div>`;
    }
    html += '</div>';
  }

  html += '</div>';
  grid.innerHTML = html;

  // Eventos click en chips
  grid.querySelectorAll('.cal-chip').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(el.dataset.id, 10);
      abrirDetalle(id);
    });
  });
}

function citaChip(c) {
  const nombre  = c.clienteNombre || '—';
  const estil   = c.estillistaNombre ? ` · ${c.estillistaNombre}` : '';
  const horaFin = fmtHora(c.horaFin);
  const colorCls = c.esEvento ? 'cal-chip--evento' : `cal-chip--${(c.estadoCodigo || '').toLowerCase()}`;
  return `<div class="cal-chip ${colorCls}" data-id="${c.id}" title="${esc(nombre)}${esc(estil)}\n${fmtHora(c.horaInicio)}–${horaFin}">
    <span class="cal-chip__hora">${fmtHora(c.horaInicio)}–${horaFin}</span>
    <span class="cal-chip__nombre">${esc(truncar(nombre, 18))}</span>
    ${c.estillistaNombre ? `<span class="cal-chip__estil">${esc(truncar(c.estillistaNombre, 14))}</span>` : ''}
  </div>`;
}

function truncar(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ── Detalle modal ─────────────────────────────────────────────────────────────

function abrirDetalle(id) {
  const c = citasSemana.find(x => x.id === id);
  if (!c) return;

  document.getElementById('detailTitle').textContent = c.clienteNombre || 'Cita';
  const color = c.estadoColor || '#f59e0b';
  document.getElementById('detailBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem 1rem;margin-bottom:1rem">
      <div><p style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 .2rem">Fecha</p>
           <p style="margin:0;font-weight:500">${c.fecha ? formatDate(c.fecha) : '—'}</p></div>
      <div><p style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 .2rem">Horario</p>
           <p style="margin:0;font-weight:500">${fmtHora(c.horaInicio)} – ${fmtHora(c.horaFin)}</p></div>
      <div><p style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 .2rem">Cliente</p>
           <p style="margin:0">${esc(c.clienteNombre || '—')}</p></div>
      <div><p style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 .2rem">Estilista</p>
           <p style="margin:0">${esc(c.estillistaNombre || '—')}</p></div>
      <div><p style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 .2rem">Estado</p>
           <p style="margin:0"><span class="badge ${badgeCls(c.estadoCodigo)}">${esc(c.estadoNombre || '—')}</span></p></div>
      ${c.esEvento ? `<div><p style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 .2rem">Tipo</p>
           <p style="margin:0"><span class="badge badge--progress">Evento grupal</span></p></div>` : ''}
    </div>
    ${c.clienteTelefono ? `<p style="font-size:.82rem;color:var(--text-muted);margin:0">📞 ${esc(c.clienteTelefono)}</p>` : ''}
  `;

  document.getElementById('citaDetailOverlay').classList.add('show');
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).split('-');
  return `${d} ${MESES[parseInt(m, 10) - 1]} ${y}`;
}

function esc(val) {
  return String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  cargarSemana();

  document.getElementById('btnPrevSem').addEventListener('click', () => { semanaOffset--; cargarSemana(); });
  document.getElementById('btnNextSem').addEventListener('click', () => { semanaOffset++; cargarSemana(); });
  document.getElementById('btnHoy').addEventListener('click', () => { semanaOffset = 0; cargarSemana(); });

  document.getElementById('detailClose').addEventListener('click', cerrarDetalle);
  document.getElementById('detailCloseBtn').addEventListener('click', cerrarDetalle);
  document.getElementById('citaDetailOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarDetalle();
  });
});

function cerrarDetalle() {
  document.getElementById('citaDetailOverlay').classList.remove('show');
}
