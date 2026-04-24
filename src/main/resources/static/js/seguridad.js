/**
 * seguridad.js — módulo de permisos por rol
 */
(function () {
  const API = '/api/v1/seguridad';
  let roles    = [];
  let permisos = [];
  let assigned = new Set();
  let activeRolId   = null;
  let activeRolName = '';
  let saving = false;

  function authHeaders() {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  // ── Saving indicator ──────────────────────────────────────
  const savingEl = document.getElementById('segSaving');
  function showSaving() { savingEl?.classList.add('visible'); }
  function hideSaving() { savingEl?.classList.remove('visible'); }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    try {
      [roles, permisos] = await Promise.all([
        fetch(`${API}/roles`,    { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API}/permisos`, { headers: authHeaders() }).then(r => r.json()),
      ]);
      renderRoles();
    } catch {
      Toast.error('Error al cargar datos de seguridad');
    }
  }

  // ── Render roles list ─────────────────────────────────────
  function renderRoles() {
    const list = document.getElementById('segRoleList');
    if (!list) return;
    list.innerHTML = roles.map(r => `
      <button class="seg-role-item" id="roleBtn-${r.id}" onclick="selectRol(${r.id}, '${r.nombre.replace(/'/g,"\\'")}')">
        <span class="seg-role-dot"></span>
        <span>${r.nombre}</span>
        <span class="seg-role-count" id="roleCount-${r.id}">—</span>
      </button>`).join('');

    // load counts for all roles in background
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
    activeRolId   = rolId;
    activeRolName = rolName;

    document.querySelectorAll('.seg-role-item').forEach(btn => btn.classList.remove('seg-role-item--active'));
    document.getElementById(`roleBtn-${rolId}`)?.classList.add('seg-role-item--active');

    document.getElementById('segEmptyState').style.display  = 'none';
    document.getElementById('segMatrixHeader').style.display = '';
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

    // group permisos by tipo_recurso
    const pantallas  = permisos.filter(p => p.tipoRecurso?.nombre === 'pantalla');
    const capacidades = permisos.filter(p => p.tipoRecurso?.nombre === 'capacidad');

    container.appendChild(buildSection(
      'Pantallas',
      `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8m-4-4v4"/>
      </svg>`,
      pantallas
    ));

    container.appendChild(buildSection(
      'Capacidades backend',
      `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M5 12h14M12 5l7 7-7 7"/>
      </svg>`,
      capacidades
    ));
  }

  function buildSection(title, iconSvg, sectionPermisos) {
    // group by recurso
    const byRecurso = {};
    sectionPermisos.forEach(p => {
      const rid = p.recurso.id;
      if (!byRecurso[rid]) byRecurso[rid] = { recurso: p.recurso, acciones: [] };
      byRecurso[rid].acciones.push(p);
    });

    const section = document.createElement('div');
    section.className = 'seg-section';

    const assignedInSection = sectionPermisos.filter(p => assigned.has(p.id)).length;

    section.innerHTML = `
      <div class="seg-section-header">
        <span class="seg-section-icon">${iconSvg}</span>
        <span class="seg-section-title">${title}</span>
        <span class="seg-section-badge">${assignedInSection} / ${sectionPermisos.length}</span>
      </div>`;

    Object.values(byRecurso).forEach(({ recurso, acciones }) => {
      const row = document.createElement('div');
      row.className = 'seg-resource-row';

      const accionesHtml = acciones
        .sort((a, b) => a.accion.nombre.localeCompare(b.accion.nombre))
        .map(p => {
          const checked = assigned.has(p.id) ? 'checked' : '';
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

      // update label style
      const lbl = document.getElementById(`lbl-${permisoId}`);
      if (lbl) lbl.classList.toggle('seg-check--active', checked);

      // update subtitle and role count
      document.getElementById('segMatrixSub').textContent =
        `${assigned.size} de ${permisos.length} permisos asignados`;
      const countEl = document.getElementById(`roleCount-${activeRolId}`);
      if (countEl) countEl.textContent = assigned.size;

      Toast.success(checked ? 'Permiso asignado' : 'Permiso removido', 1800);
    } catch {
      checkboxEl.checked = !checked; // revert
      Toast.error('No se pudo actualizar el permiso');
    } finally {
      checkboxEl.disabled = false;
      hideSaving();
    }
  };

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
  }

  // ── Start ─────────────────────────────────────────────────
  init();
})();
