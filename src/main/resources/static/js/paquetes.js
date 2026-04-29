/**
 * paquetes.js — gestión de paquetes de servicios
 */
(function () {
  const API = '/api/v1';
  let allPaquetes = [];

  function authHeaders() {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  function fmt(n) {
    if (n == null) return '—';
    return '$' + parseFloat(n).toFixed(2);
  }

  function badgeEstado(estado) {
    const cls = estado === 'Activo' ? 'badge badge--green' : 'badge badge--muted';
    return `<span class="${cls}">${estado}</span>`;
  }

  // ── Render table ─────────────────────────────────────────
  function renderTable(list) {
    const tbody   = document.getElementById('packBody');
    const counter = document.getElementById('packCount');
    if (counter) counter.textContent = `${list.length} paquete${list.length !== 1 ? 's' : ''}`;

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No hay paquetes registrados</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(p => {
      const tags = (p.servicios || [])
        .sort((a, b) => a.orden - b.orden)
        .map(ps => `<span class="svc-tag">${ps.servicio.nombre}</span>`)
        .join('');

      const svcCell = tags
        ? `<div class="svc-tags">${tags}</div>`
        : '<span style="color:var(--muted);font-size:.78rem">Sin servicios</span>';

      const desc = p.descuentoPorcentaje
        ? `<span class="badge badge--gold">${parseFloat(p.descuentoPorcentaje).toFixed(0)}%</span>`
        : '—';

      const precioRef = p.precioReferencia
        ? `<span class="price-ref">${fmt(p.precioReferencia)}</span><br>`
        : '';

      const safeName = p.nombre.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

      return `<tr data-id="${p.id}">
        <td>
          <strong>${p.nombre}</strong>
          ${p.descripcion ? `<br><span style="font-size:.75rem;color:var(--muted)">${p.descripcion}</span>` : ''}
        </td>
        <td>${svcCell}</td>
        <td>${p.duracionMin ? `${p.duracionMin} min` : '—'}</td>
        <td>${precioRef}</td>
        <td><span class="price-pack">${fmt(p.precio)}</span></td>
        <td>${desc}</td>
        <td>${badgeEstado(p.estado)}</td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-btn" title="Editar" onclick="editPaquete(${p.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                     m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button class="tbl-btn tbl-btn--danger" title="Eliminar"
                    onclick="deletePaquete(${p.id}, '${safeName}')">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                     m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // ── Load paquetes ─────────────────────────────────────────
  async function loadPaquetes() {
    try {
      const res = await fetch(`${API}/paquetes`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Error al cargar paquetes');
      allPaquetes = await res.json();
      renderTable(allPaquetes);
    } catch {
      document.getElementById('packBody').innerHTML =
        '<tr><td colspan="8" class="table-empty">Error al cargar datos</td></tr>';
      Toast.error('No se pudieron cargar los paquetes');
    }
  }

  // ── Load servicios into checkboxes ────────────────────────
  async function loadServicios(selectedIds = []) {
    const container = document.getElementById('svcChecks');
    container.innerHTML = '<p style="color:var(--muted);font-size:.82rem;grid-column:1/-1">Cargando…</p>';
    try {
      const res = await fetch(`${API}/servicios/estado/Activo`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const servicios = await res.json();

      if (!servicios.length) {
        container.innerHTML =
          '<p style="color:var(--muted);font-size:.82rem;grid-column:1/-1">No hay servicios activos</p>';
        return;
      }

      container.innerHTML = servicios.map(s => `
        <label class="svc-check-item">
          <input type="checkbox" value="${s.id}" ${selectedIds.includes(s.id) ? 'checked' : ''} />
          ${s.nombre}
        </label>`).join('');
    } catch {
      container.innerHTML =
        '<p style="color:var(--rose,#e57373);font-size:.82rem;grid-column:1/-1">Error al cargar servicios</p>';
    }
  }

  // ── Open modal ────────────────────────────────────────────
  function openModal(paquete = null) {
    const form = document.getElementById('formPaquete');
    document.getElementById('modalTitle').textContent = paquete ? 'Editar paquete' : 'Nuevo paquete';
    document.getElementById('packId').value           = paquete ? paquete.id : '';
    document.getElementById('packNombre').value       = paquete ? paquete.nombre : '';
    document.getElementById('packDuracion').value     = paquete ? paquete.duracionMin : '';
    document.getElementById('packPrecioRef').value    = paquete ? (paquete.precioReferencia ?? '') : '';
    document.getElementById('packPrecio').value       = paquete ? paquete.precio : '';
    document.getElementById('packDescuento').value    = paquete ? (paquete.descuentoPorcentaje ?? '') : '';
    document.getElementById('packEstado').value       = paquete ? paquete.estado : 'Activo';
    document.getElementById('packDesc').value         = paquete ? (paquete.descripcion ?? '') : '';

    if (typeof clearAllErrors === 'function') clearAllErrors(form);

    const selectedIds = paquete
      ? (paquete.servicios || []).map(ps => ps.servicio.id)
      : [];

    loadServicios(selectedIds);
    Modal.open('modalPaquete');
  }

  // ── Submit form ───────────────────────────────────────────
  async function submitForm() {
    const form  = document.getElementById('formPaquete');
    const valid = validateForm(form, {
      packNombre:   { required: 'El nombre es obligatorio' },
      packDuracion: { required: 'La duración es obligatoria', min: [1, 'Debe ser al menos 1 min'] },
      packPrecio:   { required: 'El precio paquete es obligatorio', min: [0, 'No puede ser negativo'] },
    });
    if (!valid) return;

    const id         = document.getElementById('packId').value;
    const servicioIds = [...document.querySelectorAll('#svcChecks input:checked')]
      .map(cb => parseInt(cb.value));
    if (!servicioIds.length) {
      Toast.error('Selecciona al menos un servicio');
      return;
    }

    const body = {
      nombre:              document.getElementById('packNombre').value.trim(),
      duracionMin:         parseInt(document.getElementById('packDuracion').value) || null,
      precioReferencia:    parseFloat(document.getElementById('packPrecioRef').value) || null,
      precio:              parseFloat(document.getElementById('packPrecio').value),
      descuentoPorcentaje: parseFloat(document.getElementById('packDescuento').value) || null,
      estado:              document.getElementById('packEstado').value,
      descripcion:         document.getElementById('packDesc').value.trim() || null,
      servicioIds,
    };

    const btn        = document.getElementById('btnGuardar');
    btn.disabled     = true;
    btn.textContent  = 'Guardando…';

    try {
      const url    = id ? `${API}/paquetes/${id}` : `${API}/paquetes`;
      const method = id ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar');
      }

      Modal.close('modalPaquete');
      Toast.success(id ? 'Paquete actualizado' : 'Paquete creado');
      await loadPaquetes();
    } catch (e) {
      Toast.error(e.message || 'No se pudo guardar el paquete');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Guardar paquete';
    }
  }

  // ── Delete ────────────────────────────────────────────────
  window.deletePaquete = function (id, nombre) {
    Modal.confirm(
      'Eliminar paquete',
      `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const res = await fetch(`${API}/paquetes/${id}`, { method: 'DELETE', headers: authHeaders() });
          if (!res.ok) throw new Error('Error al eliminar');
          Toast.success('Paquete eliminado');
          await loadPaquetes();
        } catch {
          Toast.error('No se pudo eliminar el paquete');
        }
      },
      'Eliminar',
      true
    );
  };

  // ── Edit (global for inline onclick) ─────────────────────
  window.editPaquete = function (id) {
    const p = allPaquetes.find(x => x.id === id);
    if (p) openModal(p);
  };

  // ── Search filter ─────────────────────────────────────────
  document.getElementById('searchInput')?.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    if (!q) { renderTable(allPaquetes); return; }
    renderTable(allPaquetes.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q) ||
      (p.servicios || []).some(ps => ps.servicio.nombre.toLowerCase().includes(q))
    ));
  });

  // ── Wire up ───────────────────────────────────────────────
  document.getElementById('btnNuevo')?.addEventListener('click', () => openModal());
  document.getElementById('btnGuardar')?.addEventListener('click', submitForm);

  // ── Init ──────────────────────────────────────────────────
  loadPaquetes();
})();
