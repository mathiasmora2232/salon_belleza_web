(function renderSalonSidebar() {
  const nav = document.querySelector('.sidebar__nav');
  if (!nav) return;

  const icons = {
    'Dashboard': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    'Agenda': '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    'Citas': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-5"/>',
    'Calendario': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><circle cx="15" cy="16" r="3"/><path d="M15 15v1l.7.7"/>',
    'Clientes': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'Historial': '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 5.6 6.6L3 8"/><path d="M12 7v5l3 2"/>',
    'Fidelización': '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    'Reseñas': '<polygon points="12 2 15 8.5 22 9.3 17 14.2 18.3 21 12 17.6 5.7 21 7 14.2 2 9.3 9 8.5 12 2"/>',
    'Estilistas': '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9"/><path d="M14.5 14.5 20 20"/><path d="M8.1 8.1 12 12"/>',
    'Horarios': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'Comisiones': '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'Asistencia': '<path d="M9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'Servicios': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    'Categorías': '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    'Productos': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12l8.73-5.04"/><path d="M12 22.08V12"/>',
    'Paquetes': '<path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><path d="M12 3v18"/>',
    'Inventario': '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    'Caja / POS': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M7 13h.01"/><path d="M11 13h6"/><path d="M7 17h10"/>',
    'Pedidos': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    'Facturación': '<path d="M14 2H6a2 2 0 0 0-2 2v18l4-2 4 2 4-2 4 2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    'Métodos de pago': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    'Cupones': '<path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M9 9h.01"/><path d="M15 15h.01"/><path d="M16 8 8 16"/>',
    'Promociones': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    'Reportes': '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    'Impuestos': '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
    'Proveedores': '<path d="M16 3h5v5"/><path d="M21 3 14 10"/><path d="M3 21h18"/><path d="M5 21V8h7v13"/><path d="M14 21v-7h5v7"/>',
    'Gastos': '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M20 20 4 4"/>',
    'Campañas': '<path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    'Notificaciones': '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    'Galería': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    'Clientes inactivos': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M18 8l5 5"/><path d="m23 8-5 5"/>',
    'Usuarios': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/>',
    'Roles': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'Seguridad': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    'Configuración': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    'Auditoría': '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
  };
  const menuIcon = label => `<svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${icons[label] || icons.Dashboard}</svg>`;
  const sections = [
    ['Principal', [['Dashboard', 'admin.html'], ['Agenda', '#'], ['Citas', 'citas.html'], ['Calendario', 'calendario.html']]],
    ['Clientes', [['Clientes', 'clientes.html'], ['Historial', 'historial.html'], ['Fidelización', '#'], ['Reseñas', '#']]],
    ['Personal', [['Estilistas', 'estilistas.html'], ['Horarios', '#'], ['Comisiones', 'comisiones.html'], ['Asistencia', '#']]],
    ['Catálogo', [['Servicios', 'servicios.html'], ['Categorías', 'categorias.html'], ['Productos', 'productos.html'], ['Paquetes', 'paquetes.html'], ['Inventario', '#']]],
    ['Ventas', [['Caja / POS', '#'], ['Pedidos', 'pedidos.html'], ['Facturación', '#'], ['Métodos de pago', '#'], ['Cupones', 'cupones.html'], ['Promociones', '#']]],
    ['Negocio', [['Reportes', '#'], ['Impuestos', 'impuestos.html'], ['Proveedores', '#'], ['Gastos', '#']]],
    ['Marketing', [['Campañas', '#'], ['Notificaciones', '#'], ['Galería', '#'], ['Clientes inactivos', '#']]],
    ['Sistema', [['Usuarios', 'usuarios.html'], ['Roles', 'roles.html'], ['Seguridad', 'seguridad.html'], ['Configuración', 'configuracion.html'], ['Auditoría', '#']]]
  ];

  nav.innerHTML = sections.map(([section, links]) => `
    <p class="sidebar__section-label">${section}</p>
    ${links.map(([label, href]) => `
      <a href="${href}" class="sidebar__link${href === '#' ? ' sidebar__link--pending' : ''}" data-tooltip="${label}">
        ${menuIcon(label)}
        <span>${label}</span>
      </a>`).join('')}
  `).join('');
})();

// Auto-highlight del link activo en sidebar según la página actual
(function () {
  const page = window.location.pathname.split('/').pop() || 'admin.html';
  document.querySelectorAll('.sidebar__link').forEach(link => {
    const h = link.getAttribute('href');
    if (h && h !== '#') link.classList.toggle('sidebar__link--active', h === page);
  });
})();

// Rellena nombre/rol del usuario desde localStorage y conecta logout
const usuario = getUsuario();
if (usuario) {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  if (nameEl) nameEl.textContent = usuario.nombreCompleto || usuario.email;
  if (roleEl) roleEl.textContent = usuario.rol || '';
}
document.getElementById('logoutBtn')?.addEventListener('click', logout);

// Aplica color/imagen de avatar a ambos avatares (topbar + sidebar)
function applyAvatars() {
  const u       = getUsuario();
  const type    = localStorage.getItem('profile_avatar_type')  || 'color';
  const color   = localStorage.getItem('profile_avatar_color') || '#c9a84c';
  const image   = localStorage.getItem('profile_avatar_image');
  const initial = (u?.nombreCompleto || u?.email || 'A')[0].toUpperCase();
  [document.querySelector('.topbar__avatar'), document.querySelector('.sidebar__user-avatar')]
    .forEach(el => {
      if (!el) return;
      if (type === 'image' && image) {
        el.style.background = `url(${image}) center/cover`;
        el.textContent = '';
      } else {
        el.style.background = color;
        el.textContent = initial;
      }
    });
}
applyAvatars();

// Sidebar toggle (collapse/expand)
const sidebar       = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent   = document.getElementById('mainContent');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// Mobile sidebar
const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
mobileSidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 && sidebar.classList.contains('mobile-open')) {
    if (!sidebar.contains(e.target) && e.target !== mobileSidebarToggle) {
      sidebar.classList.remove('mobile-open');
    }
  }
});

// Display current date in topbar
const dateEl = document.getElementById('currentDate');
if (dateEl) {
  const now = new Date();
  const opts = { weekday: 'long', day: 'numeric', month: 'long' };
  dateEl.textContent = now.toLocaleDateString('es-ES', opts);
}

// Dynamic greeting (solo en admin.html)
const titleEl = document.querySelector('.content__title');
const _pg = window.location.pathname.split('/').pop() || 'admin.html';
if (titleEl && (_pg === 'admin.html' || _pg === '')) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Buenos días ✦' : hour < 19 ? 'Buenas tardes ✦' : 'Buenas noches ✦';
  titleEl.textContent = greet;
}

// Animate stat bars on load
window.addEventListener('load', () => {
  document.querySelectorAll('.service-bar__fill').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0';
    requestAnimationFrame(() => {
      setTimeout(() => { bar.style.width = target; }, 200);
    });
  });
});

// ── Dashboard conectado a endpoints existentes ───────────────────────────────

const DASHBOARD_API = '/api/v1';

function dashHeaders() {
  const token = typeof getToken === 'function' ? getToken() : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function setDashValue(key, value) {
  const el = document.querySelector(`[data-dashboard="${key}"]`);
  if (el) el.textContent = value;
}

function setDashMeta(key, value, tone = '') {
  const el = document.querySelector(`[data-dashboard-meta="${key}"]`);
  if (!el) return;
  el.textContent = value;
  el.classList.remove('stat-card__trend--up', 'stat-card__trend--down');
  if (tone) el.classList.add(tone);
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-EC').format(Number(value || 0));
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value || 0));
}

function formatTime(value) {
  return value ? String(value).substring(0, 5) : '—';
}

function personName(person, fallback) {
  if (!person) return fallback;
  return `${person.nombre || ''} ${person.apellido || ''}`.trim() || person.nombreCompleto || fallback;
}

function badgeClass(codigo) {
  if (codigo === 'FIN') return 'badge--done';
  if (codigo === 'CUR' || codigo === 'CON' || codigo === 'AGE') return 'badge--progress';
  if (codigo === 'CAN' || codigo === 'NAS') return 'badge--cancel';
  return 'badge--pending';
}

function initialFor(name) {
  return (name || 'C').trim().charAt(0).toUpperCase() || 'C';
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: dashHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function loadDashboardStats() {
  try {
    const stats = await fetchJson(`${DASHBOARD_API}/dashboard`);
    setDashValue('citasHoy', formatNumber(stats.citasHoy));
    setDashValue('clientesActivos', formatNumber(stats.clientesActivos));
    setDashValue('ingresosMesActual', formatMoney(stats.ingresosMesActual));
    setDashValue('serviciosActivos', formatNumber(stats.serviciosActivos));
    setDashValue('ingresosDia', formatMoney(stats.ingresosDia));
    setDashValue('clientesNuevosHoy', formatNumber(stats.clientesNuevosHoy));
    setDashValue('clientesRecurrentes', formatNumber(stats.clientesRecurrentes));
    setDashValue('stockBajo', formatNumber(stats.stockBajo));
    setDashValue('citasCanceladasHoy', formatNumber(stats.citasCanceladasHoy));
    setDashValue('facturasPendientes', formatNumber(stats.facturasPendientes));
    setDashValue('productosActivos', formatNumber(stats.productosActivos));

    setDashMeta('citasHoy', `${formatNumber(stats.citasPendientesFactura)} pendientes de factura`, 'stat-card__trend--up');
    setDashMeta('clientesActivos', `${formatNumber(stats.estilistaActivos)} estilistas activos`, 'stat-card__trend--up');
    setDashMeta('ingresosMesActual', `${formatNumber(stats.facturasPendientes)} facturas pendientes`, stats.facturasPendientes > 0 ? 'stat-card__trend--down' : 'stat-card__trend--up');
    setDashMeta('serviciosActivos', 'Catálogo disponible', 'stat-card__trend--up');
    setDashMeta('ingresosDia', 'Cobros confirmados hoy', 'stat-card__trend--up');
    setDashMeta('clientesNuevosHoy', 'Registros del día', 'stat-card__trend--up');
    setDashMeta('clientesRecurrentes', 'Clientes que vuelven', 'stat-card__trend--up');
    setDashMeta('stockBajo', stats.stockBajo > 0 ? 'Revisar inventario' : 'Inventario estable', stats.stockBajo > 0 ? 'stat-card__trend--down' : 'stat-card__trend--up');
  } catch (err) {
    console.error('loadDashboardStats:', err);
    setDashMeta('citasHoy', 'No se pudo cargar el resumen', 'stat-card__trend--down');
  }
}

async function loadCitaServicios(citaId) {
  try {
    const servicios = await fetchJson(`${DASHBOARD_API}/citas/${citaId}/servicios`);
    return Array.isArray(servicios) ? servicios : [];
  } catch (err) {
    console.error('loadCitaServicios:', err);
    return [];
  }
}

async function renderTodayAppointments() {
  const tbody = document.getElementById('dashboardCitasBody');
  if (!tbody) return;

  try {
    const citas = await fetchJson(`${DASHBOARD_API}/citas/hoy`);
    const ordered = (Array.isArray(citas) ? citas : [])
      .sort((a, b) => String(a.horaInicio || '').localeCompare(String(b.horaInicio || '')))
      .slice(0, 6);

    if (ordered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="dashboard-empty">No hay citas para hoy.</td></tr>';
      return;
    }

    const rows = await Promise.all(ordered.map(async cita => {
      const servicios = await loadCitaServicios(cita.id);
      const serviceName = servicios[0]?.servicio?.nombre || 'Sin servicio asignado';
      const extra = servicios.length > 1 ? ` +${servicios.length - 1}` : '';
      const cliente = personName(cita.cliente, 'Cliente');
      const estilista = personName(cita.estilista, 'Sin asignar');
      const codigo = cita.estado?.codigo || '';
      const estado = cita.estado?.nombre || 'Pendiente';

      return `
        <tr>
          <td class="citas-table__time">${formatTime(cita.horaInicio)}</td>
          <td>
            <div class="citas-table__client">
              <div class="citas-table__avatar">${initialFor(cliente)}</div>
              ${escN(cliente)}
            </div>
          </td>
          <td>${escN(serviceName)}${extra}</td>
          <td>${escN(estilista)}</td>
          <td><span class="badge ${badgeClass(codigo)}">${escN(estado)}</span></td>
        </tr>`;
    }));

    tbody.innerHTML = rows.join('');
  } catch (err) {
    console.error('renderTodayAppointments:', err);
    tbody.innerHTML = '<tr><td colspan="5" class="dashboard-empty dashboard-empty--error">No se pudieron cargar las citas.</td></tr>';
  }
}

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toIso = date => date.toISOString().slice(0, 10);
  return { start: toIso(start), end: toIso(end) };
}

async function renderTopServices() {
  const wrap = document.getElementById('dashboardServices');
  if (!wrap) return;

  try {
    const { start, end } = monthRange();
    const period = document.getElementById('dashboardServicesPeriod');
    if (period) period.textContent = 'Este mes';

    const citas = await fetchJson(`${DASHBOARD_API}/citas/rango?inicio=${start}&fin=${end}`);
    const serviceEntries = await Promise.all((Array.isArray(citas) ? citas : []).map(c => loadCitaServicios(c.id)));
    const counts = new Map();

    serviceEntries.flat().forEach(item => {
      const name = item.servicio?.nombre || 'Sin nombre';
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (top.length === 0) {
      wrap.innerHTML = '<p class="dashboard-empty">Aún no hay servicios registrados en citas de este mes.</p>';
      return;
    }

    const max = Math.max(...top.map(([, count]) => count), 1);
    wrap.innerHTML = top.map(([name, count]) => {
      const pct = Math.max(8, Math.round((count / max) * 100));
      return `
        <div class="service-bar">
          <span class="service-bar__name" title="${escN(name)}">${escN(name)}</span>
          <div class="service-bar__track">
            <div class="service-bar__fill" style="width:${pct}%"></div>
          </div>
          <span class="service-bar__pct">${formatNumber(count)}</span>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('renderTopServices:', err);
    wrap.innerHTML = '<p class="dashboard-empty dashboard-empty--error">No se pudieron cargar los servicios.</p>';
  }
}

function initDashboard() {
  if (!document.querySelector('[data-dashboard]')) return;
  loadDashboardStats();
  renderTodayAppointments();
  renderTopServices();
}

initDashboard();

// ── Notificaciones ────────────────────────────────────────────────────────────

function escN(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getReadIds() {
  return JSON.parse(localStorage.getItem('notif_read') || '[]');
}

function saveReadIds(ids) {
  localStorage.setItem('notif_read', JSON.stringify(ids));
}

async function loadNotifications() {
  const token = typeof getToken === 'function' ? getToken() : null;
  if (!token) return;

  try {
    const res = await fetch('/api/v1/citas/hoy', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const citas = await res.json();

    const pendientes = Array.isArray(citas)
      ? citas.filter(c => c.estado?.codigo === 'PENDIENTE')
      : [];
    const readIds  = getReadIds();
    const unread   = pendientes.filter(c => !readIds.includes(c.id));

    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (unread.length > 0) {
        badge.textContent = unread.length > 9 ? '9+' : String(unread.length);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    const list = document.getElementById('notifList');
    if (!list) return;

    if (pendientes.length === 0) {
      list.innerHTML = '<p class="notif-empty">Sin notificaciones nuevas</p>';
      return;
    }

    list.innerHTML = pendientes.map(c => {
      const nombre  = c.cliente ? escN(`${c.cliente.nombre} ${c.cliente.apellido || ''}`.trim()) : 'Cliente';
      const hora    = c.horaInicio ? String(c.horaInicio).substring(0, 5) : '';
      const isRead  = readIds.includes(c.id);
      return `
        <a class="notif-item${isRead ? '' : ' notif-item--unread'}" href="citas.html" data-id="${c.id}">
          <div class="notif-item__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="notif-item__body">
            <span class="notif-item__text">Cita pendiente — ${nombre}</span>
            <span class="notif-item__meta">${hora}${hora ? ' · ' : ''}Requiere confirmación</span>
          </div>
          ${!isRead ? '<div class="notif-item__dot"></div>' : ''}
        </a>`;
    }).join('');
  } catch (err) {
    console.error('loadNotifications:', err);
  }
}

const notifBell     = document.getElementById('notifBell');
const notifDropdown = document.getElementById('notifDropdown');

notifBell?.addEventListener('click', e => {
  e.stopPropagation();
  const hidden = notifDropdown.hidden;
  notifDropdown.hidden = !hidden;
  if (!hidden) return;
  loadNotifications();
});

document.addEventListener('click', e => {
  const wrap = document.getElementById('notifWrap');
  if (notifDropdown && wrap && !wrap.contains(e.target)) {
    notifDropdown.hidden = true;
  }
});

document.getElementById('notifMarkRead')?.addEventListener('click', () => {
  const ids = [...document.querySelectorAll('.notif-item[data-id]')]
    .map(el => parseInt(el.dataset.id))
    .filter(Boolean);
  saveReadIds([...new Set([...getReadIds(), ...ids])]);
  loadNotifications();
  if (notifDropdown) notifDropdown.hidden = true;
});

// Carga inicial y refresco cada 60 s
loadNotifications();
setInterval(loadNotifications, 60_000);

// ── User menu dropdown ────────────────────────────────────────────────────────
(function initUserMenu() {
  const topbarUser = document.querySelector('.topbar__user');
  if (!topbarUser) return;

  // Actualiza nombre en topbar
  const nameSpan = topbarUser.querySelector('.topbar__user-name');
  if (nameSpan && usuario) nameSpan.textContent = usuario.nombreCompleto || usuario.email || 'Usuario';

  // Envuelve el área de usuario en un contenedor relativo
  const wrap = document.createElement('div');
  wrap.className = 'user-menu-wrap';
  wrap.id = 'userMenuWrap';
  topbarUser.parentNode.insertBefore(wrap, topbarUser);
  wrap.appendChild(topbarUser);

  // Crea dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'user-dropdown';
  dropdown.id = 'userDropdown';
  dropdown.hidden = true;
  dropdown.innerHTML = `
    <a href="perfil.html" class="user-drop__item">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      Mi perfil
    </a>
    <div class="user-drop__divider"></div>
    <button type="button" class="user-drop__item user-drop__item--danger" id="userDropLogout">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Cerrar sesión
    </button>`;
  wrap.appendChild(dropdown);

  topbarUser.style.cursor = 'pointer';
  topbarUser.addEventListener('click', e => {
    e.stopPropagation();
    const isHidden = dropdown.hidden;
    dropdown.hidden = !isHidden;
    // cierra la campana si estaba abierta
    const notifDrop = document.getElementById('notifDropdown');
    if (notifDrop && !isHidden === false) notifDrop.hidden = true;
  });

  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) dropdown.hidden = true;
  });

  document.getElementById('userDropLogout')?.addEventListener('click', logout);
})();
