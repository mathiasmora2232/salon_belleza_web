const HIST_API = '/api/v1/clientes';
let historyClientes = [];
let selectedClienteId = null;

function histHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('historialSearch')?.addEventListener('input', e => renderClienteList(e.target.value));
  document.getElementById('fichaForm')?.addEventListener('submit', saveFicha);
  document.getElementById('notaForm')?.addEventListener('submit', saveNota);
  loadHistoryClientes();
});

async function loadHistoryClientes() {
  try {
    const res = await fetch(HIST_API, { headers: histHeaders() });
    if (!res.ok) throw new Error('No se pudieron cargar los clientes');
    historyClientes = await res.json();
    renderClienteList();

    const fromUrl = Number(new URLSearchParams(window.location.search).get('cliente'));
    const firstId = fromUrl || historyClientes[0]?.id;
    if (firstId) selectCliente(firstId);
  } catch (err) {
    document.getElementById('historialClientes').innerHTML = `<p class="dashboard-empty dashboard-empty--error">${escHist(err.message)}</p>`;
  }
}

function renderClienteList(query = '') {
  const wrap = document.getElementById('historialClientes');
  const q = query.trim().toLowerCase();
  const list = q
    ? historyClientes.filter(c => [c.nombre, c.apellido, c.telefono, c.email].some(v => String(v || '').toLowerCase().includes(q)))
    : historyClientes;

  if (!list.length) {
    wrap.innerHTML = '<p class="dashboard-empty">No hay clientes para mostrar.</p>';
    return;
  }

  wrap.innerHTML = list.map(c => {
    const name = fullName(c);
    return `
      <button type="button" class="history-client${Number(c.id) === Number(selectedClienteId) ? ' history-client--active' : ''}" onclick="selectCliente(${c.id})">
        <span class="history-client__avatar">${escHist((name || 'C').charAt(0).toUpperCase())}</span>
        <span class="history-client__body">
          <strong>${escHist(name)}</strong>
          <small>${escHist(c.telefono || c.email || 'Sin contacto')}</small>
        </span>
      </button>`;
  }).join('');
}

async function selectCliente(id) {
  selectedClienteId = Number(id);
  renderClienteList(document.getElementById('historialSearch')?.value || '');
  setLoadingDetail();

  try {
    const res = await fetch(`${HIST_API}/${id}/historial`, { headers: histHeaders() });
    if (!res.ok) throw new Error('No se pudo cargar el historial');
    renderHistory(await res.json());
  } catch (err) {
    document.getElementById('historyProfile').innerHTML = `<p class="dashboard-empty dashboard-empty--error">${escHist(err.message)}</p>`;
  }
}

function setLoadingDetail() {
  document.getElementById('historyProfile').innerHTML = '<p class="dashboard-empty">Cargando historial...</p>';
  document.getElementById('historyNotes').innerHTML = '';
  document.getElementById('historyCitas').innerHTML = '';
  document.getElementById('historyVentas').innerHTML = '';
}

function renderHistory(data) {
  const cliente = data.cliente || {};
  const ficha = data.ficha || {};
  renderProfile(cliente, ficha);
  fillFicha(ficha);
  renderNotes(data.notas || []);
  renderCitas(data.citas || []);
  renderVentas(data.ventas || []);
}

function renderProfile(cliente, ficha) {
  document.getElementById('historyProfile').innerHTML = `
    <div class="history-profile__avatar">${escHist(fullName(cliente).charAt(0).toUpperCase() || 'C')}</div>
    <div class="history-profile__main">
      <h2>${escHist(fullName(cliente))}</h2>
      <p>${escHist(cliente.telefono || 'Sin teléfono')} · ${escHist(cliente.email || 'Sin email')}</p>
      <div class="history-tags">
        <span>${escHist(cliente.estado || 'Activo')}</span>
        <span>${escHist(cliente.ciudad || 'Sin ciudad')}</span>
        <span>${ficha.formulaColor ? 'Color registrado' : 'Sin fórmula de color'}</span>
      </div>
    </div>`;
}

function fillFicha(ficha) {
  setValue('tipoCabello', ficha.tipoCabello);
  setValue('tipoPiel', ficha.tipoPiel);
  setValue('preferencias', ficha.preferencias);
  setValue('formulaColor', ficha.formulaColor);
  setValue('alergias', ficha.alergias);
  setValue('productosEvitar', ficha.productosEvitar);
  setValue('notasFicha', ficha.notas);
  setValue('fotoAntesUrl', ficha.fotoAntesUrl);
  setValue('fotoDespuesUrl', ficha.fotoDespuesUrl);
}

async function saveFicha(e) {
  e.preventDefault();
  if (!selectedClienteId) return;

  const btn = document.getElementById('guardarFichaBtn');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const payload = {
    tipoCabello: val('tipoCabello'),
    tipoPiel: val('tipoPiel'),
    preferencias: val('preferencias'),
    formulaColor: val('formulaColor'),
    alergias: val('alergias'),
    productosEvitar: val('productosEvitar'),
    notas: val('notasFicha'),
    fotoAntesUrl: val('fotoAntesUrl'),
    fotoDespuesUrl: val('fotoDespuesUrl')
  };

  try {
    const res = await fetch(`${HIST_API}/${selectedClienteId}/ficha`, {
      method: 'POST',
      headers: histHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('No se pudo guardar la ficha');
    await selectCliente(selectedClienteId);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar ficha';
  }
}

async function saveNota(e) {
  e.preventDefault();
  if (!selectedClienteId) return;
  const contenido = val('notaContenido');
  if (!contenido) return;

  try {
    const res = await fetch(`${HIST_API}/${selectedClienteId}/notas`, {
      method: 'POST',
      headers: histHeaders(),
      body: JSON.stringify({ tipo: val('notaTipo') || 'General', contenido })
    });
    if (!res.ok) throw new Error('No se pudo guardar la nota');
    setValue('notaContenido', '');
    await selectCliente(selectedClienteId);
  } catch (err) {
    alert(err.message);
  }
}

function renderNotes(notas) {
  const wrap = document.getElementById('historyNotes');
  if (!notas.length) {
    wrap.innerHTML = '<p class="dashboard-empty">Sin notas internas todavía.</p>';
    return;
  }
  wrap.innerHTML = notas.map(n => `
    <article class="history-note">
      <span>${escHist(n.tipo || 'General')}</span>
      <p>${escHist(n.contenido || '')}</p>
      <small>${formatDateTime(n.createdAt)}</small>
    </article>`).join('');
}

function renderCitas(citas) {
  const wrap = document.getElementById('historyCitas');
  if (!citas.length) {
    wrap.innerHTML = '<p class="dashboard-empty">Sin citas registradas.</p>';
    return;
  }
  wrap.innerHTML = `
    <table class="citas-full-table">
      <thead><tr><th>Fecha</th><th>Hora</th><th>Estilista</th><th>Estado</th></tr></thead>
      <tbody>${citas.map(c => `<tr>
        <td>${formatDate(c.fecha)}</td>
        <td>${escHist(String(c.horaInicio || '').substring(0, 5) || '-')}</td>
        <td>${escHist(fullName(c.estilista) || 'Sin asignar')}</td>
        <td><span class="badge ${c.estado?.codigo === 'CAN' ? 'badge--cancel' : 'badge--progress'}">${escHist(c.estado?.nombre || 'Pendiente')}</span></td>
      </tr>`).join('')}</tbody>
    </table>`;
}

function renderVentas(ventas) {
  const wrap = document.getElementById('historyVentas');
  if (!ventas.length) {
    wrap.innerHTML = '<p class="dashboard-empty">Sin compras registradas en POS.</p>';
    return;
  }
  wrap.innerHTML = `
    <table class="citas-full-table">
      <thead><tr><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
      <tbody>${ventas.map(v => `<tr>
        <td>${formatDateTime(v.fechaVenta)}</td>
        <td>${formatMoney(v.total)}</td>
        <td><span class="badge badge--done">${escHist(v.estado || 'Pagada')}</span></td>
      </tr>`).join('')}</tbody>
    </table>`;
}

function fullName(person) {
  if (!person) return '';
  return `${person.nombre || ''} ${person.apellido || ''}`.trim() || person.nombreCompleto || '';
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function val(id) {
  return document.getElementById(id)?.value.trim() || '';
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function escHist(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
