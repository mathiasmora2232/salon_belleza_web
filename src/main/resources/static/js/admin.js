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

    setDashMeta('citasHoy', `${formatNumber(stats.citasPendientesFactura)} pendientes de factura`, 'stat-card__trend--up');
    setDashMeta('clientesActivos', `${formatNumber(stats.estilistaActivos)} estilistas activos`, 'stat-card__trend--up');
    setDashMeta('ingresosMesActual', `${formatNumber(stats.facturasPendientes)} facturas pendientes`, stats.facturasPendientes > 0 ? 'stat-card__trend--down' : 'stat-card__trend--up');
    setDashMeta('serviciosActivos', 'Catálogo disponible', 'stat-card__trend--up');
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
