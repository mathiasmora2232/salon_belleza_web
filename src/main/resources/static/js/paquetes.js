const SERVICIOS_SAMPLE = [
  { id: 1, nombre: 'Corte & Peinado',      duracion: 60,  precio: 35 },
  { id: 2, nombre: 'Color & Mechas',        duracion: 120, precio: 85 },
  { id: 3, nombre: 'Manicure Gel',          duracion: 60,  precio: 30 },
  { id: 4, nombre: 'Pedicure Spa',          duracion: 60,  precio: 35 },
  { id: 5, nombre: 'Facial & Spa',          duracion: 90,  precio: 55 },
  { id: 6, nombre: 'Masaje Relajante',      duracion: 60,  precio: 50 },
  { id: 7, nombre: 'Tratamiento Keratina',  duracion: 150, precio: 90 },
  { id: 8, nombre: 'Depilación',            duracion: 45,  precio: 25 },
  { id: 9, nombre: 'Maquillaje Artístico',  duracion: 60,  precio: 45 },
  { id: 10, nombre: 'Uñas Acrílicas',       duracion: 90,  precio: 40 },
];

let PAQUETES = [
  {
    id: 1, nombre: 'Esencial',
    descripcion: 'Ideal para grupos pequeños que desean los servicios básicos del salón con precio especial.',
    precioRef: 220, precioPaquete: 180, maxPersonas: 5,
    fotografo: false, activo: true,
    restricciones: 'Reserva con mínimo 48 h de anticipación. No aplica en fines de semana.',
    servicios: [
      { id: 1, precioOverride: null },
      { id: 3, precioOverride: 25 },
      { id: 4, precioOverride: 28 },
    ],
  },
  {
    id: 2, nombre: 'Completo',
    descripcion: 'Perfecto para eventos medianos. Incluye fotógrafo y una selección amplia de servicios.',
    precioRef: 400, precioPaquete: 320, maxPersonas: 10,
    fotografo: true, activo: true,
    restricciones: 'Reserva con mínimo 72 h de anticipación.',
    servicios: [
      { id: 1, precioOverride: null },
      { id: 2, precioOverride: 75 },
      { id: 3, precioOverride: null },
      { id: 4, precioOverride: null },
      { id: 5, precioOverride: 48 },
      { id: 9, precioOverride: 38 },
    ],
  },
  {
    id: 3, nombre: 'Premium',
    descripcion: 'La experiencia completa para grupos grandes con todos los servicios y atención personalizada.',
    precioRef: 650, precioPaquete: 490, maxPersonas: 15,
    fotografo: true, activo: true,
    restricciones: 'Reserva con mínimo 1 semana. Pago del 50% al confirmar.',
    servicios: SERVICIOS_SAMPLE.map(s => ({ id: s.id, precioOverride: null })),
  },
];

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function checkIcon(size = 14) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;
}

function renderCards() {
  const container = document.getElementById('packCards');
  if (!container) return;
  container.innerHTML = PAQUETES.map(p => {
    const featured = p.nombre === 'Completo';
    const svcCount = p.servicios.length;
    return `
      <div class="pack-card${featured ? ' pack-card--featured' : ''}">
        ${featured ? '<span class="pack-card__badge">Más popular</span>' : ''}
        <div class="pack-card__name">${esc(p.nombre)}</div>
        <div class="pack-card__price-row">
          <span class="pack-card__price">$${p.precioPaquete}</span>
          ${p.precioRef ? `<span class="pack-card__price-ref">$${p.precioRef}</span>` : ''}
        </div>
        <div class="pack-card__meta">Hasta ${p.maxPersonas} personas</div>
        <ul class="pack-card__features">
          <li class="pack-card__feat">${checkIcon()}<span>${svcCount} servicio${svcCount !== 1 ? 's' : ''} incluido${svcCount !== 1 ? 's' : ''}</span></li>
          <li class="pack-card__feat">${checkIcon()}<span>Fotógrafo: ${p.fotografo ? 'incluido' : 'no incluido'}</span></li>
          <li class="pack-card__feat">${checkIcon()}<span>${p.activo ? 'Activo' : 'Inactivo'}</span></li>
        </ul>
        <div class="pack-card__footer">
          <button class="pack-card__btn" onclick="openModal(${p.id})">Editar</button>
          <button class="pack-card__btn pack-card__btn--primary" onclick="openModal(${p.id})">Configurar</button>
        </div>
      </div>`;
  }).join('');
}

function renderTable() {
  const tbody = document.getElementById('packBody');
  if (!tbody) return;
  if (PAQUETES.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No hay paquetes configurados</td></tr>';
    return;
  }
  tbody.innerHTML = PAQUETES.map(p => {
    const svcNames = p.servicios
      .map(sv => SERVICIOS_SAMPLE.find(x => x.id === sv.id)?.nombre || '')
      .filter(Boolean);
    const preview = svcNames.slice(0, 3).join(', ') + (svcNames.length > 3 ? ` +${svcNames.length - 3}` : '');
    const allNames = svcNames.join(', ');
    return `
      <tr>
        <td><strong>${esc(p.nombre)}</strong></td>
        <td style="color:var(--muted);text-decoration:line-through">$${p.precioRef}</td>
        <td class="text-gold">$${p.precioPaquete}</td>
        <td>${p.maxPersonas} personas</td>
        <td>${p.fotografo
          ? '<span class="badge badge--done">Sí</span>'
          : '<span class="badge badge--muted">No</span>'}</td>
        <td title="${esc(allNames)}" style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(preview)}</td>
        <td>${p.activo
          ? '<span class="badge badge--done">Activo</span>'
          : '<span class="badge badge--muted">Inactivo</span>'}</td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-btn" onclick="openModal(${p.id})" title="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="tbl-btn tbl-btn--danger" onclick="confirmDelete(${p.id})" title="Eliminar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function buildServiceRows(selectedIds = [], overrides = {}) {
  return SERVICIOS_SAMPLE.map(s => {
    const checked = selectedIds.includes(s.id);
    const override = overrides[s.id] ?? '';
    return `
      <div class="svc-row">
        <input type="checkbox" class="svc-row__check" id="svc-chk-${s.id}" value="${s.id}"
               ${checked ? 'checked' : ''} onchange="toggleSvcPrice(this, ${s.id})" />
        <label for="svc-chk-${s.id}" class="svc-row__name">${esc(s.nombre)}
          <small style="color:var(--muted);font-size:.72rem"> — $${s.precio}</small>
        </label>
        <div class="svc-row__price${checked ? ' visible' : ''}" id="svc-price-${s.id}">
          <span class="svc-row__price-label">Precio:</span>
          <input type="number" class="svc-row__price-input" placeholder="${s.precio}"
                 value="${override}" min="0" step="0.01" id="svc-ovr-${s.id}" />
        </div>
      </div>`;
  }).join('');
}

function toggleSvcPrice(checkbox, svcId) {
  const priceDiv = document.getElementById(`svc-price-${svcId}`);
  if (priceDiv) priceDiv.classList.toggle('visible', checkbox.checked);
}

let editingId = null;

function openModal(packId = null) {
  editingId = packId;
  const title = document.getElementById('modalPackTitle');

  if (packId) {
    const pack = PAQUETES.find(p => p.id === packId);
    if (!pack) return;
    title.textContent = `Editar paquete — ${pack.nombre}`;
    document.getElementById('packNombre').value       = pack.nombre;
    document.getElementById('packDesc').value         = pack.descripcion;
    document.getElementById('packPrecioRef').value    = pack.precioRef;
    document.getElementById('packPrecio').value       = pack.precioPaquete;
    document.getElementById('packMaxP').value         = pack.maxPersonas;
    document.getElementById('packFotografo').checked  = pack.fotografo;
    document.getElementById('packActivo').checked     = pack.activo;
    document.getElementById('packRestricciones').value = pack.restricciones;

    const selIds    = pack.servicios.map(sv => sv.id);
    const overrides = Object.fromEntries(
      pack.servicios.filter(sv => sv.precioOverride != null).map(sv => [sv.id, sv.precioOverride])
    );
    document.getElementById('svcListContainer').innerHTML = buildServiceRows(selIds, overrides);
  } else {
    title.textContent = 'Nuevo paquete';
    document.getElementById('formPaquete').reset();
    document.getElementById('packActivo').checked = true;
    document.getElementById('svcListContainer').innerHTML = buildServiceRows();
  }

  document.getElementById('modalPaquete').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalPaquete').classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
}

function confirmDelete(packId) {
  const pack = PAQUETES.find(p => p.id === packId);
  if (!pack) return;
  if (!confirm(`¿Eliminar el paquete "${pack.nombre}"? Esta acción no se puede deshacer.`)) return;
  PAQUETES = PAQUETES.filter(p => p.id !== packId);
  renderCards();
  renderTable();
}

document.getElementById('formPaquete')?.addEventListener('submit', e => {
  e.preventDefault();

  const selectedSvcs = [...document.querySelectorAll('.svc-row__check:checked')].map(chk => {
    const id  = parseInt(chk.value);
    const inp = document.getElementById(`svc-ovr-${id}`);
    const ov  = inp?.value ? parseFloat(inp.value) : null;
    return { id, precioOverride: ov };
  });

  const nombre = document.getElementById('packNombre').value.trim();
  if (!nombre) { alert('El nombre del paquete es obligatorio.'); return; }

  const data = {
    nombre,
    descripcion:    document.getElementById('packDesc').value.trim(),
    precioRef:      parseFloat(document.getElementById('packPrecioRef').value) || 0,
    precioPaquete:  parseFloat(document.getElementById('packPrecio').value) || 0,
    maxPersonas:    parseInt(document.getElementById('packMaxP').value) || 1,
    fotografo:      document.getElementById('packFotografo').checked,
    activo:         document.getElementById('packActivo').checked,
    restricciones:  document.getElementById('packRestricciones').value.trim(),
    servicios:      selectedSvcs,
  };

  if (editingId) {
    const pack = PAQUETES.find(p => p.id === editingId);
    if (pack) Object.assign(pack, data);
  } else {
    data.id = Date.now();
    PAQUETES.push(data);
  }

  renderCards();
  renderTable();
  closeModal();
});

document.getElementById('modalPackClose')?.addEventListener('click', closeModal);
document.getElementById('modalPackCancel')?.addEventListener('click', closeModal);
document.getElementById('modalPaquete')?.addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});
document.getElementById('btnNuevoPaquete')?.addEventListener('click', () => openModal());

renderCards();
renderTable();
