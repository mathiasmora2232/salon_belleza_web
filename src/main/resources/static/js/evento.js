/* ===== EVENTO.JS — planificador con paquetes reales ===== */

let packageCatalog = [];
let selectedPackId = null;
let selectedPack = null;
let members = [];
let memberIdCounter = 0;
let currentStep = 1;
let packagesLoading = null;
let reservationCreated = false;

const ROLES = ['Novia', 'Mamá de la novia', 'Dama de honor', 'Hermana', 'Familiar', 'Amiga'];
const COLORS = ['#C9A84C', '#8B6B8B', '#5A7B8B', '#7B8B5A', '#8B5E3C', '#5A5A8B', '#8B5A5A', '#6B8B6B'];

document.addEventListener('DOMContentLoaded', () => {
  wireWizard();
  wireRadios();
  wireActions();
  setDefaultDate();
  loadEventPackages();
});

function wireWizard() {
  document.getElementById('evNext')?.addEventListener('click', handleNext);
  document.getElementById('evBack')?.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });
  document.getElementById('addMember')?.addEventListener('click', () => addMember());
  document.querySelector('.ev-packs')?.addEventListener('click', event => {
    const card = event.target.closest('.ev-pack');
    if (!card) return;
    if (!card.dataset.packId) {
      showEventStatus('Cargando paquetes reales. Intenta de nuevo en un momento.', '');
      return;
    }
    selectPackage(card.dataset.packId);
  });
}

function wireRadios() {
  document.querySelectorAll('.eradio').forEach(label => {
    label.querySelector('input')?.addEventListener('change', () => {
      document.querySelectorAll('.eradio').forEach(l => l.classList.remove('eradio--active'));
      label.classList.add('eradio--active');
    });
  });
}

function wireActions() {
  document.getElementById('shareWhatsApp')?.addEventListener('click', shareWhatsAppAction);
  document.getElementById('printTimeline')?.addEventListener('click', () => window.print());
  document.getElementById('fillEventDemo')?.addEventListener('click', fillEventDemo);
}

async function loadEventPackages() {
  if (packagesLoading) return packagesLoading;
  const container = document.querySelector('.ev-packs');
  if (!container) return;
  container.innerHTML = '<p class="ev-panel__hint" style="grid-column:1/-1">Cargando paquetes desde la base...</p>';

  packagesLoading = (async () => {
    const res = await fetch('/api/v1/paquetes/estado/Activo');
    if (!res.ok) throw new Error('No se pudieron cargar paquetes');
    packageCatalog = await res.json();
    renderPackages(packageCatalog);
    return packageCatalog;
  })();

  try {
    return await packagesLoading;
  } catch {
    container.innerHTML = `
      <div class="ev-empty-pack">
        <strong>No se pudieron cargar los paquetes.</strong>
        <span>Revisa la base de datos o crea un paquete activo desde el panel.</span>
      </div>`;
    return [];
  } finally {
    packagesLoading = null;
  }
}

function renderPackages(packages) {
  const container = document.querySelector('.ev-packs');
  if (!packages.length) {
    container.innerHTML = `
      <div class="ev-empty-pack">
        <strong>No hay paquetes activos.</strong>
        <span>Crea un paquete real en el panel para usarlo en el planificador.</span>
        <a href="paquetes.html">Ir a paquetes</a>
      </div>`;
    return;
  }

  container.innerHTML = packages.map((pack, index) => {
    const services = getPackServices(pack);
    return `
      <div class="ev-pack${index === 0 ? ' ev-pack--featured' : ''}" data-pack-id="${pack.id}">
        ${index === 0 ? '<div class="ev-pack__badge">Activo</div>' : ''}
        <div class="ev-pack__check">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 18 4 12"/></svg>
        </div>
        <h3 class="ev-pack__name">${escapeHtml(pack.nombre)}</h3>
        <p class="ev-pack__sub">${pack.duracionMin || totalDuration(services)} min · ${services.length} servicio${services.length !== 1 ? 's' : ''}</p>
        <div class="ev-pack__price">
          ${pack.precioReferencia ? `<span class="ev-pack__ref">$${formatMoney(pack.precioReferencia)}</span>` : ''}
          <strong>$${formatMoney(pack.precio)}</strong>
        </div>
        <ul class="ev-pack__list">
          ${services.length ? services.map(s => `<li>${escapeHtml(s.name)}</li>`).join('') : '<li>Sin servicios configurados</li>'}
        </ul>
      </div>`;
  }).join('');

  if (!selectedPack && packages[0]?.id) {
    selectPackage(packages[0].id);
  }
}

function selectPackage(packId) {
  selectedPackId = packId;
  selectedPack = packageCatalog.find(p => String(p.id) === String(packId)) || null;
  if (!selectedPack) {
    showEventStatus('Ese paquete no está disponible en la base. Espera a que carguen los paquetes reales.', 'error');
    return;
  }
  document.querySelectorAll('.ev-pack').forEach(c => c.classList.toggle('ev-pack--selected', c.dataset.packId === String(packId)));
  resetMembers();
  updateMembersCap();
  showEventStatus(`Paquete seleccionado: ${selectedPack.nombre}`, '');
}

async function handleNext() {
  if (currentStep === 1) {
    if (!selectedPack && !(await ensurePackageSelected())) {
      const panel = document.getElementById('evPanel1');
      panel.classList.add('ev-packs--shake');
      setTimeout(() => panel.classList.remove('ev-packs--shake'), 500);
      showEventStatus('Selecciona un paquete real para continuar.', 'error');
      return;
    }
    if (!members.length) addMember('Novia', 'Novia');
    goToStep(2);
    return;
  }

  if (currentStep === 2) {
    const validation = validateEventForm();
    if (!validation.ok) {
      showEventStatus(validation.message, 'error');
      return;
    }
    reservationCreated = false;
    generateTimeline();
    goToStep(3);
    showEventStatus('Revisa el resumen. La cita todavía no se agenda hasta confirmar.', '');
    return;
  }

  if (reservationCreated) {
    shareWhatsAppAction();
    return;
  }

  submitEventReservation();
}

async function ensurePackageSelected() {
  if (selectedPack) return true;
  if (!packageCatalog.length) {
    showEventStatus('Cargando paquetes reales...', '');
    await loadEventPackages();
  }
  if (!selectedPack && packageCatalog[0]?.id) {
    selectPackage(packageCatalog[0].id);
  }
  return Boolean(selectedPack);
}

function goToStep(step) {
  [1, 2, 3].forEach(n => {
    document.getElementById(`evPanel${n}`).hidden = n !== step;
    const s = document.getElementById(`evStep${n}`);
    s.classList.remove('ev-step--active', 'ev-step--done');
    if (n < step) s.classList.add('ev-step--done');
    if (n === step) s.classList.add('ev-step--active');
  });
  [1, 2].forEach(n => {
    document.getElementById(`evLine${n}`).classList.toggle('ev-track__line--done', n < step);
  });

  document.getElementById('evBack').hidden = step === 1;
  const nextBtn = document.getElementById('evNext');
  if (step === 3) {
    nextBtn.innerHTML = reservationCreated ? 'Compartir' : 'Confirmar reserva';
  } else {
    nextBtn.innerHTML = 'Siguiente <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="ev-next__icon"><polyline points="9 18 15 12 9 6"/></svg>';
  }
  currentStep = step;
}

function resetMembers() {
  members = [];
  memberIdCounter = 0;
  const list = document.getElementById('membersList');
  if (list) list.innerHTML = '';
}

function addMember(name = '', role = ROLES[members.length] || 'Invitada') {
  if (!selectedPack) {
    showEventStatus('Primero selecciona un paquete.', 'error');
    return;
  }
  const max = getSelectedPackMaxMembers();
  if (members.length >= max) {
    showEventStatus(`El paquete ${selectedPack.nombre} permite máximo ${max} integrantes.`, 'error');
    return;
  }

  const member = {
    id: ++memberIdCounter,
    name,
    role,
    services: [],
    color: COLORS[members.length % COLORS.length]
  };
  members.push(member);
  renderMemberCard(member);
}

function renderMemberCard(member) {
  const list = document.getElementById('membersList');
  const services = getPackServices(selectedPack);
  const item = document.createElement('div');
  item.className = 'member-item';
  item.id = `member-${member.id}`;
  item.innerHTML = `
    <div class="member-item__header">
      <div class="member-item__avatar" style="background:${member.color}">${member.name ? escapeHtml(member.name[0].toUpperCase()) : '?'}</div>
      <div class="member-item__name-wrap">
        <input class="einput member-item__name" type="text" placeholder="Nombre" value="${escapeHtml(member.name)}" data-id="${member.id}" />
        <select class="einput member-item__role-select" data-id="${member.id}">
          ${ROLES.map(r => `<option ${r === member.role ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
      <button type="button" class="member-remove" data-id="${member.id}" aria-label="Eliminar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="member-services">
      ${services.map(s => `
        <button type="button" class="service-tag" data-mid="${member.id}" data-sid="${s.id}">
          ${escapeHtml(s.name)} <span class="service-tag__dur">${s.dur}min</span>
        </button>`).join('')}
    </div>`;
  list.appendChild(item);

  item.querySelector('.member-item__name').addEventListener('input', e => {
    member.name = e.target.value;
    item.querySelector('.member-item__avatar').textContent = member.name ? member.name[0].toUpperCase() : '?';
  });
  item.querySelector('.member-item__role-select').addEventListener('change', e => member.role = e.target.value);
  item.querySelector('.member-remove').addEventListener('click', () => {
    members = members.filter(m => m.id !== member.id);
    item.remove();
  });
  item.querySelectorAll('.service-tag').forEach(btn => {
    btn.addEventListener('click', () => toggleService(member, btn));
  });
}

function toggleService(member, btn) {
  const sid = btn.dataset.sid;
  if (member.services.includes(sid)) {
    member.services = member.services.filter(s => s !== sid);
    btn.classList.remove('selected');
  } else {
    member.services.push(sid);
    btn.classList.add('selected');
  }
}

function validateEventForm() {
  if (!selectedPack) return { ok: false, message: 'Selecciona un paquete.' };
  if (!getPackServices(selectedPack).length) return { ok: false, message: 'El paquete seleccionado no tiene servicios configurados.' };
  if (!document.getElementById('eventDate').value) return { ok: false, message: 'Selecciona la fecha del evento.' };
  if (!document.getElementById('contactName').value.trim()) return { ok: false, message: 'Escribe el nombre de contacto.' };
  if (!document.getElementById('contactPhone').value.trim()) return { ok: false, message: 'Escribe el WhatsApp de contacto.' };
  if (!members.some(m => m.services.length > 0)) return { ok: false, message: 'Selecciona al menos un servicio para un integrante.' };
  return { ok: true };
}

function generateTimeline() {
  const eventTimeVal = document.getElementById('eventTime').value || '09:00';
  const [startH, startM] = eventTimeVal.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const active = members.filter(m => m.services.length > 0);
  const schedule = [];
  let maxEnd = startMin;

  active.forEach((member, idx) => {
    const blocks = [];
    let t = startMin + idx * 15;
    member.services.forEach(sid => {
      const service = findSelectedService(sid);
      if (!service) return;
      blocks.push({ service, start: t, end: t + service.dur });
      t += service.dur;
    });
    if (blocks.length) {
      schedule.push({ member, blocks });
      maxEnd = Math.max(maxEnd, t);
    }
  });

  renderGantt(schedule, startMin, maxEnd);
  renderSummary(schedule, startMin, maxEnd);

  const eventDate = document.getElementById('eventDate').value;
  const eventType = document.querySelector('input[name="eventType"]:checked')?.value || 'evento';
  document.getElementById('timelineTitle').textContent = `Timeline — ${capitalize(eventType)}${eventDate ? ' · ' + formatDate(eventDate) : ''}`;
}

function renderGantt(schedule, startMin, maxEnd) {
  const gantt = document.getElementById('ganttChart');
  gantt.innerHTML = '';
  const span = maxEnd - startMin || 60;

  const header = document.createElement('div');
  header.className = 'gantt-row gantt-header';
  header.innerHTML = '<div class="gantt-label"></div><div class="gantt-header-track"></div>';
  const track = header.querySelector('.gantt-header-track');
  for (let m = startMin; m <= maxEnd + 30; m += 60) {
    const label = document.createElement('span');
    label.className = 'gantt-hour';
    label.style.left = `${((m - startMin) / span) * 100}%`;
    label.textContent = minToTime(m);
    track.appendChild(label);
  }
  gantt.appendChild(header);

  schedule.forEach(({ member, blocks }) => {
    const row = document.createElement('div');
    row.className = 'gantt-row';
    const label = document.createElement('div');
    label.className = 'gantt-label';
    label.innerHTML = `<strong style="color:${member.color};font-size:0.8rem">${escapeHtml(member.name || member.role)}</strong>`;
    const rowTrack = document.createElement('div');
    rowTrack.className = 'gantt-track';
    blocks.forEach(({ service, start, end }) => {
      const block = document.createElement('div');
      block.className = 'gantt-block';
      block.style.left = `${((start - startMin) / span) * 100}%`;
      block.style.width = `${Math.max(((end - start) / span) * 100, 2)}%`;
      block.style.background = member.color + '33';
      block.style.borderLeft = `3px solid ${member.color}`;
      block.title = `${service.name} · ${minToTime(start)} - ${minToTime(end)}`;
      block.textContent = service.name;
      rowTrack.appendChild(block);
    });
    row.appendChild(label);
    row.appendChild(rowTrack);
    gantt.appendChild(row);
  });
}

function renderSummary(schedule, startMin, maxEnd) {
  const totalPrice = schedule.reduce((acc, { member }) =>
    acc + member.services.reduce((s, sid) => s + (findSelectedService(sid)?.price || 0), 0), 0);
  const eventDate = document.getElementById('eventDate').value;
  const eventType = document.querySelector('input[name="eventType"]:checked')?.value || 'evento';
  const contactName = document.getElementById('contactName').value.trim();
  const contactPhone = document.getElementById('contactPhone').value.trim();
  const people = schedule.map(({ member }) => {
    const svcs = member.services.map(sid => findSelectedService(sid)?.name).filter(Boolean).join(', ');
    return `<li><strong>${escapeHtml(member.name || member.role)}</strong><span>${escapeHtml(member.role)} · ${escapeHtml(svcs)}</span></li>`;
  }).join('');
  document.getElementById('timelineSummary').innerHTML = `
    <div class="summary-confirm">
      <span class="summary-confirm__eyebrow">Confirmación pendiente</span>
      <strong>Revisa estos datos antes de agendar.</strong>
      <p>Al presionar Confirmar reserva se creará la cita en la base.</p>
    </div>
    <div class="summary-item"><span class="summary-item__label">Paquete</span><span class="summary-item__value">${escapeHtml(selectedPack.nombre)}</span></div>
    <div class="summary-item"><span class="summary-item__label">Tipo de evento</span><span class="summary-item__value">${escapeHtml(capitalize(eventType))}</span></div>
    <div class="summary-item"><span class="summary-item__label">Fecha</span><span class="summary-item__value">${formatDate(eventDate)}</span></div>
    <div class="summary-item"><span class="summary-item__label">Contacto</span><span class="summary-item__value">${escapeHtml(contactName)} · ${escapeHtml(contactPhone)}</span></div>
    <div class="summary-item"><span class="summary-item__label">Inicio</span><span class="summary-item__value">${minToTime(startMin)}</span></div>
    <div class="summary-item"><span class="summary-item__label">Finalización estimada</span><span class="summary-item__value">${minToTime(maxEnd)}</span></div>
    <div class="summary-item"><span class="summary-item__label">Total de personas</span><span class="summary-item__value">${schedule.length}</span></div>
    <div class="summary-item"><span class="summary-item__label">Total estimado servicios</span><span class="summary-item__value summary-item__value--gold">$${formatMoney(totalPrice)}</span></div>
    <div class="summary-people">
      <span class="summary-item__label">Integrantes y servicios</span>
      <ul>${people}</ul>
    </div>`;
}

async function submitEventReservation() {
  const nextBtn = document.getElementById('evNext');
  nextBtn.disabled = true;
  showEventStatus('Enviando solicitud de evento...', '');

  const active = members.filter(m => m.services.length > 0);
  const leadService = findSelectedService(active[0].services[0]);
  const contactName = document.getElementById('contactName').value.trim();
  const [nombre, ...apellidoParts] = contactName.split(/\s+/);
  const eventType = document.querySelector('input[name="eventType"]:checked')?.value || 'boda';

  const payload = {
    nombre: nombre || contactName,
    apellido: apellidoParts.join(' ') || 'Evento',
    telefono: document.getElementById('contactPhone').value.trim(),
    email: '',
    servicioId: leadService.apiId,
    estilistaId: 1,
    fecha: document.getElementById('eventDate').value,
    horaInicio: document.getElementById('eventTime').value,
    observaciones: buildEventNotes(eventType, active)
  };

  try {
    const res = await fetch('/api/v1/citas/publica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'No se pudo crear la reserva.');
    reservationCreated = true;
    goToStep(3);
    showEventStatus(`Reserva creada con paquete "${selectedPack.nombre}". Cita #${data.id || 'registrada'}.`, 'ok');
  } catch (err) {
    showEventStatus(err.message || 'No se pudo enviar la solicitud.', 'error');
  } finally {
    nextBtn.disabled = false;
  }
}

function buildEventNotes(eventType, active) {
  const photoName = document.getElementById('photoName').value.trim();
  const photoPhone = document.getElementById('photoPhone').value.trim();
  const lines = [
    `Evento grupal: ${capitalize(eventType)}`,
    `Paquete: ${selectedPack.nombre} (#${selectedPack.id})`,
    `Integrantes: ${active.length}`,
    'Servicios por integrante:'
  ];
  active.forEach(m => {
    const svcs = m.services.map(sid => findSelectedService(sid)?.name).filter(Boolean).join(', ');
    lines.push(`- ${m.name || m.role} (${m.role}): ${svcs}`);
  });
  if (photoName || photoPhone) lines.push(`Fotografo: ${photoName || 'Sin nombre'} ${photoPhone || ''}`.trim());
  return lines.join('\n');
}

function shareWhatsAppAction() {
  const active = members.filter(m => m.services.length > 0);
  const eventDate = document.getElementById('eventDate').value;
  const eventType = document.querySelector('input[name="eventType"]:checked')?.value || 'evento';
  let msg = `*BELLEZA & ESTILO — ${capitalize(eventType).toUpperCase()}*\n`;
  msg += `Paquete: ${selectedPack?.nombre || ''}\n`;
  if (eventDate) msg += `Fecha: ${formatDate(eventDate)}\n`;
  msg += '\nIntegrantes:\n';
  active.forEach(m => {
    const svcs = m.services.map(sid => findSelectedService(sid)?.name).filter(Boolean).join(', ');
    msg += `- ${m.name || m.role}: ${svcs}\n`;
  });
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

function fillEventDemo() {
  const firstPack = document.querySelector('.ev-pack');
  if (!firstPack) {
    showEventStatus('Primero crea al menos un paquete activo.', 'error');
    return;
  }
  firstPack.click();
  document.getElementById('eventDate').value = nextDateIso();
  document.getElementById('eventTime').value = '09:00';
  document.getElementById('contactName').value = 'María Novia';
  document.getElementById('contactPhone').value = '0998887777';
  document.getElementById('photoName').value = 'Foto Studio';
  document.getElementById('photoPhone').value = '0991112222';
  if (currentStep === 1) goToStep(2);
  resetMembers();
  addMember('María', 'Novia');
  addMember('Lucía', 'Dama de honor');
  const services = getPackServices(selectedPack);
  selectMemberServices(1, services.slice(0, 2).map(s => s.id));
  selectMemberServices(2, services.slice(0, 2).map(s => s.id));
  showEventStatus('Datos de prueba cargados con el primer paquete real.', '');
}

function selectMemberServices(memberId, services) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  member.services = services;
  services.forEach(sid => {
    const btn = document.querySelector(`.service-tag[data-mid="${memberId}"][data-sid="${sid}"]`);
    if (btn) btn.classList.add('selected');
  });
}

function getPackServices(pack) {
  return (pack?.servicios || [])
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map(ps => ps.servicio)
    .filter(Boolean)
    .map(s => ({
      id: String(s.id),
      apiId: s.id,
      name: s.nombre,
      dur: s.duracionMin || 60,
      price: parseFloat(s.precio || 0)
    }));
}

function findSelectedService(id) {
  return getPackServices(selectedPack).find(s => String(s.id) === String(id));
}

function getSelectedPackMaxMembers() {
  return Math.max(1, Math.min(10, getPackServices(selectedPack).length || 6));
}

function updateMembersCap() {
  const cap = document.getElementById('membersCap');
  if (cap) cap.textContent = `(máx. ${getSelectedPackMaxMembers()})`;
}

function totalDuration(services) {
  return services.reduce((acc, s) => acc + (s.dur || 0), 0);
}

function showEventStatus(message, type) {
  const box = document.getElementById('eventFormStatus');
  if (!box) return;
  box.hidden = false;
  box.textContent = message;
  box.classList.remove('ev-form-status--ok', 'ev-form-status--error');
  if (type === 'ok') box.classList.add('ev-form-status--ok');
  if (type === 'error') box.classList.add('ev-form-status--error');
}

function setDefaultDate() {
  const dateInput = document.getElementById('eventDate');
  if (!dateInput) return;
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  dateInput.value = nextDateIso();
}

function nextDateIso() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

function minToTime(min) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, mo, d] = iso.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function capitalize(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
