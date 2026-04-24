/**
 * seguridad.js — módulo de permisos por rol
 */
(function () {
  const API = '/api/v1/seguridad';
  let roles     = [];
  let permisos  = [];
  let recursos  = [];
  let assigned  = new Set();
  let activeRolId = null;

  function authHeaders() {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  // ── Saving indicator ──────────────────────────────────────
  const savingEl = document.getElementById('segSaving');
  function showSaving() { savingEl?.classList.add('visible'); }
  function hideSaving() { savingEl?.classList.remove('visible'); }

  // ── Tab switch ────────────────────────────────────────────
  window.showTab = function (tab) {
    const isRecursos = tab === 'recursos';
    document.getElementById('tabPanelRecursos').classList.toggle('seg-tab-panel--hidden', !isRecursos);
    document.getElementById('tabPanelPermisos').classList.toggle('seg-tab-panel--hidden',  isRecursos);
    document.getElementById('tabRecursos').classList.toggle('seg-tab--active',  isRecursos);
    document.getElementById('tabPermisos').classList.toggle('seg-tab--active', !isRecursos);
  };

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    try {
      [roles, permisos, recursos] = await Promise.all([
        fetch(`${API}/roles`,    { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API}/permisos`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API}/recursos`, { headers: authHeaders() }).then(r => r.json()),
      ]);
      renderRoles();
      renderRecursos();
    } catch {
      Toast.error('Error al cargar datos de seguridad');
    }
  }

  // ── Render recursos tab ───────────────────────────────────
  function renderRecursos() {
    const grid = document.getElementById('segRecursosGrid');
    if (!grid) return;

    const pantallas   = recursos.filter(r => r.tipoRecurso?.nombre === 'pantalla');
    const capacidades = recursos.filter(r => r.tipoRecurso?.nombre === 'capacidad');

    grid.innerHTML = '';
    grid.appendChild(buildRecursosCard(
      'Pantallas frontend',
      `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
      </svg>`,
      pantallas
    ));
    grid.appendChild(buildRecursosCard(
      'Capacidades backend',
      `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>`,
      capacidades
    ));
  }

  function buildRecursosCard(title, iconSvg, list) {
    const card = document.createElement('div');
    card.className = 'seg-recursos-card';

    const permisosPorRecurso = (rid) =>
      permisos.filter(p => p.recurso.id === rid).map(p => capitalize(p.accion.nombre)).join(' · ');

    card.innerHTML = `
      <div class="seg-recursos-card-header">
        <span class="seg-recursos-card-icon">${iconSvg}</span>
        <span class="seg-recursos-card-title">${title}</span>
        <span class="seg-recursos-card-count">${list.length}</span>
      </div>
      ${list.map(r => `
        <div class="seg-recurso-row">
          <span class="seg-recurso-estado seg-recurso-estado--${r.estado}"></span>
          <span class="seg-recurso-name">${capitalize(r.nombre)}</span>
          <span class="seg-recurso-ruta">${r.ruta ?? '—'}</span>
        </div>`).join('')}`;

    return card;
  }

  // ── Render roles list ─────────────────────────────────────
  function renderRoles() {
    const list = document.getElementById('segRoleList');
    if (!list) return;
    list.innerHTML = roles.map(r => `
      <button type="button" class="seg-role-item" id="roleBtn-${r.id}"
              onclick="selectRol(${r.id}, '${r.nombre.replace(/'/g, "\\'")}')">
        <span class="seg-role-dot"></span>
        <span>${r.nombre}</span>
        <span class="seg-role-count" id="roleCount-${r.id}">—</span>
      </button>`).join('');

    roles.forEach(r => loadRolCount(r.id));
  }

  async function loadRolCount(rolId) {
    try {
      const ids = await fetch(`${API}/rol/${rolId}/permisos`, { headers: authHeaders() }).then(r => r.json());
      const el = document.getElementById(`roleCount-${rolId}`);
      if (el) el.textContent = ids.length;
    } catch { /* ignore */ }
  }

  // ── Select a role ─────────────────────────────────────────
  window.selectRol = async function (rolId, rolName) {
    activeRolId = rolId;

    document.querySelectorAll('.seg-role-item').forEach(btn => btn.classList.remove('seg-role-item--active'));
    document.getElementById(`roleBtn-${rolId}`)?.classList.add('seg-role-item--active');

    const emptyEl  = document.getElementById('segEmptyState');
    const headerEl = document.getElementById('segMatrixHeader');
    emptyEl.classList.add('seg-tab-panel--hidden');
    headerEl.classList.remove('seg-tab-panel--hidden');
    document.getElementById('segMatrix').innerHTML = '';

    document.getElementById('segMatrixTitle').textContent = rolName;
    document.getElementById('segMatrixSub').textContent   = 'Cargando permisos…';

    try {
      const ids = await fetch(`${API}/rol/${rolId}/permisos`, { headers: authHeaders() }).then(r => r.json());
      assigned = new Set(ids);
      renderMatrix();
      document.getElementById('segMatrixSub').textContent =
        `${ids.length} de ${permisos.length} permisos asignados`;
    } catch {
      Toast.error('No se pudieron cargar los permisos del rol');
    }
  };

  // ── Render permission matrix ──────────────────────────────
  function renderMatrix() {
    const container = document.getElementById('segMatrix');
    container.innerHTML = '';

    const pantallas   = permisos.filter(p => p.tipoRecurso?.nombre === 'pantalla');
    const capacidades = permisos.filter(p => p.tipoRecurso?.nombre === 'capacidad');

    container.appendChild(buildSection(
      'Pantallas frontend',
      `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
      </svg>`,
      pantallas
    ));
    container.appendChild(buildSection(
      'Capacidades backend',
      `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>`,
      capacidades
    ));
  }

  function buildSection(title, iconSvg, sectionPermisos) {
    const byRecurso = {};
    sectionPermisos.forEach(p => {
      const rid = p.recurso.id;
      if (!byRecurso[rid]) byRecurso[rid] = { recurso: p.recurso, acciones: [] };
      byRecurso[rid].acciones.push(p);
    });

    const section = document.createElement('div');
    section.className = 'seg-section';

    const assignedCount = sectionPermisos.filter(p => assigned.has(p.id)).length;
    section.innerHTML = `
      <div class="seg-section-header">
        <span class="seg-section-icon">${iconSvg}</span>
        <span class="seg-section-title">${title}</span>
        <span class="seg-section-badge">${assignedCount} / ${sectionPermisos.length}</span>
      </div>`;

    Object.values(byRecurso).forEach(({ recurso, acciones }) => {
      const row = document.createElement('div');
      row.className = 'seg-resource-row';

      const accionesHtml = acciones
        .sort((a, b) => a.accion.nombre.localeCompare(b.accion.nombre))
        .map(p => {
          const checked     = assigned.has(p.id) ? 'checked' : '';
          const activeClass = assigned.has(p.id) ? 'seg-check--active' : '';
          return `
            <label class="seg-check ${activeClass}" id="lbl-${p.id}">
              <input type="checkbox" ${checked}
                onchange="togglePermiso(${p.id}, this.checked, this)"
                id="chk-${p.id}" />
              ${capitalize(p.accion.nombre)}
            </label>`;
        }).join('');

      row.innerHTML = `
        <div class="seg-resource-info">
          <div class="seg-resource-name">${capitalize(recurso.nombre)}</div>
          ${recurso.ruta ? `<div class="seg-resource-ruta">${recurso.ruta}</div>` : ''}
        </div>
        <div class="seg-actions">${accionesHtml}</div>`;

      section.appendChild(row);
    });

    return section;
  }

  // ── Toggle a permission ───────────────────────────────────
  window.togglePermiso = async function (permisoId, checked, checkboxEl) {
    if (!activeRolId) return;

    showSaving();
    checkboxEl.disabled = true;

    try {
      if (checked) {
        await fetch(`${API}/rol-permisos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ rolId: activeRolId, permisoId }),
        });
        assigned.add(permisoId);
      } else {
        await fetch(`${API}/rol-permisos/${activeRolId}/${permisoId}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        assigned.delete(permisoId);
      }

      const lbl = document.getElementById(`lbl-${permisoId}`);
      if (lbl) lbl.classList.toggle('seg-check--active', checked);

      document.getElementById('segMatrixSub').textContent =
        `${assigned.size} de ${permisos.length} permisos asignados`;
      const countEl = document.getElementById(`roleCount-${activeRolId}`);
      if (countEl) countEl.textContent = assigned.size;

      Toast.success(checked ? 'Permiso asignado' : 'Permiso removido', 1800);
    } catch {
      checkboxEl.checked = !checked;
      Toast.error('No se pudo actualizar el permiso');
    } finally {
      checkboxEl.disabled = false;
      hideSaving();
    }
  };

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
  }

  init();
})();
