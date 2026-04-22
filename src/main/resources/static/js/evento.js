/* ===== EVENTO.JS — Día de novia / Eventos grupales ===== */

const SERVICES = [
  { id: 'corte',      name: 'Corte & Peinado',  dur: 60,  price: 15 },
  { id: 'color',      name: 'Color & Mechas',    dur: 120, price: 45 },
  { id: 'tratam',     name: 'Tratamiento',        dur: 90,  price: 30 },
  { id: 'maquillaje', name: 'Maquillaje',         dur: 60,  price: 25 },
  { id: 'unas',       name: 'Uñas Gel',           dur: 45,  price: 12 },
  { id: 'facial',     name: 'Facial & Spa',       dur: 90,  price: 35 },
];

const ROLES  = ['Novia', 'Mamá de la novia', 'Dama de honor', 'Hermana', 'Familiar', 'Amiga'];
const COLORS = ['#C9A84C','#8B6B8B','#5A7B8B','#7B8B5A','#8B5E3C','#5A5A8B','#8B5A5A','#6B8B6B'];

let members = [];
let memberIdCounter = 0;

// ===== RADIO STYLING =====
document.querySelectorAll('.eradio').forEach(label => {
  label.querySelector('input').addEventListener('change', () => {
    document.querySelectorAll('.eradio').forEach(l => l.classList.remove('eradio--active'));
    label.classList.add('eradio--active');
  });
});

// ===== ADD MEMBER =====
document.getElementById('addMember').addEventListener('click', () => {
  if (members.length >= 8) {
    alert('Máximo 8 integrantes por evento.');
    return;
  }
  addMember();
});

function addMember(name = '', role = ROLES[members.length] || 'Invitada') {
  const id = ++memberIdCounter;
  const color = COLORS[(members.length) % COLORS.length];
  const member = { id, name, role, services: [], color };
  members.push(member);
  renderMemberCard(member);
}

function renderMemberCard(member) {
  const list = document.getElementById('membersList');
  const item = document.createElement('div');
  item.className = 'member-item';
  item.id = `member-${member.id}`;
  item.innerHTML = `
    <div class="member-item__header">
      <div class="member-item__avatar" style="background:${member.color}">${member.name ? member.name[0].toUpperCase() : '?'}</div>
      <div class="member-item__name-wrap">
        <input class="einput member-item__name" type="text" placeholder="Nombre" value="${member.name}" data-id="${member.id}" />
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
      ${SERVICES.map(s => `
        <button type="button" class="service-tag" data-mid="${member.id}" data-sid="${s.id}">
          ${s.name} <span class="service-tag__dur">${s.dur}min</span>
        </button>`).join('')}
    </div>`;
  list.appendChild(item);

  // Name change
  item.querySelector('.member-item__name').addEventListener('input', (e) => {
    const m = getMember(member.id);
    if (m) {
      m.name = e.target.value;
      item.querySelector('.member-item__avatar').textContent = m.name ? m.name[0].toUpperCase() : '?';
    }
  });

  // Role change
  item.querySelector('.member-item__role-select').addEventListener('change', (e) => {
    const m = getMember(member.id);
    if (m) m.role = e.target.value;
  });

  // Remove
  item.querySelector('.member-remove').addEventListener('click', () => {
    members = members.filter(m => m.id !== member.id);
    item.remove();
  });

  // Service tags
  item.querySelectorAll('.service-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = getMember(member.id);
      if (!m) return;
      const sid = btn.dataset.sid;
      if (m.services.includes(sid)) {
        m.services = m.services.filter(s => s !== sid);
        btn.classList.remove('selected');
      } else {
        m.services.push(sid);
        btn.classList.add('selected');
      }
    });
  });
}

function getMember(id) { return members.find(m => m.id === id); }

// ===== GENERATE TIMELINE =====
document.getElementById('generateBtn').addEventListener('click', generateTimeline);

function generateTimeline() {
  const eventTimeVal = document.getElementById('eventTime').value || '09:00';
  const [startH, startM] = eventTimeVal.split(':').map(Number);
  const startMin = startH * 60 + startM;

  const active = members.filter(m => m.services.length > 0);
  if (active.length === 0) {
    alert('Agrega al menos un integrante con servicios seleccionados.');
    return;
  }

  // Calculate schedule: greedy assignment - each member starts as soon as possible
  const schedule = [];
  let maxEnd = startMin;
  // Simple: each person starts after the previous, or at the same time if possible
  // For demo: stagger by longest block to avoid overlap on same stylist
  // We'll just stack them sequentially per person for clarity
  active.forEach((member, idx) => {
    let cursor = startMin + (idx * 0) ; // we'll figure out true start
    const blocks = [];
    let personStart = startMin;
    // Each person's services run back-to-back
    let t = startMin + idx * 15; // small stagger
    member.services.forEach(sid => {
      const svc = SERVICES.find(s => s.id === sid);
      if (!svc) return;
      blocks.push({ service: svc, start: t, end: t + svc.dur });
      t += svc.dur;
    });
    if (blocks.length) {
      schedule.push({ member, blocks, endTime: t });
      if (t > maxEnd) maxEnd = t;
    }
  });

  renderGantt(schedule, startMin, maxEnd);
  renderSummary(schedule, startMin, maxEnd);

  document.getElementById('timelineEmpty').style.display  = 'none';
  document.getElementById('timelineContent').style.display = 'flex';

  // Title
  const eventDate = document.getElementById('eventDate').value;
  const eventType = document.querySelector('input[name="eventType"]:checked')?.value || 'evento';
  document.getElementById('timelineTitle').textContent =
    `Timeline — ${capitalize(eventType)}${eventDate ? ' · ' + formatDate(eventDate) : ''}`;
}

function renderGantt(schedule, startMin, maxEnd) {
  const gantt = document.getElementById('ganttChart');
  gantt.innerHTML = '';
  const span = maxEnd - startMin || 60;

  // Header row with hour labels
  const headerRow = document.createElement('div');
  headerRow.className = 'gantt-row gantt-header';
  const headerLabel = document.createElement('div');
  headerLabel.className = 'gantt-label';
  headerLabel.textContent = '';
  const headerTrack = document.createElement('div');
  headerTrack.className = 'gantt-header-track';
  headerTrack.style.flex = '1';
  headerTrack.style.position = 'relative';
  headerTrack.style.height = '20px';

  // Place hour markers
  const numHours = Math.ceil(span / 60) + 1;
  for (let i = 0; i <= numHours; i++) {
    const m = startMin + i * 60;
    if (m > maxEnd + 30) break;
    const pct = ((m - startMin) / span) * 100;
    const label = document.createElement('span');
    label.className = 'gantt-hour';
    label.style.left = `${pct}%`;
    label.textContent = minToTime(m);
    headerTrack.appendChild(label);
  }
  headerRow.appendChild(headerLabel);
  headerRow.appendChild(headerTrack);
  gantt.appendChild(headerRow);

  // Member rows
  schedule.forEach(({ member, blocks }) => {
    const row = document.createElement('div');
    row.className = 'gantt-row';

    const label = document.createElement('div');
    label.className = 'gantt-label';
    label.innerHTML = `<strong style="color:${member.color};font-size:0.8rem">${member.name || member.role}</strong>`;

    const track = document.createElement('div');
    track.className = 'gantt-track';

    blocks.forEach(({ service, start, end }) => {
      const left = ((start - startMin) / span) * 100;
      const width = ((end - start) / span) * 100;
      const block = document.createElement('div');
      block.className = 'gantt-block';
      block.style.left   = `${left}%`;
      block.style.width  = `${Math.max(width, 2)}%`;
      block.style.background = member.color + '33';
      block.style.borderLeft = `3px solid ${member.color}`;
      block.title = `${service.name} · ${minToTime(start)} – ${minToTime(end)}`;
      block.textContent = `${service.name}`;
      track.appendChild(block);
    });

    row.appendChild(label);
    row.appendChild(track);
    gantt.appendChild(row);
  });
}

function renderSummary(schedule, startMin, maxEnd) {
  const summary = document.getElementById('timelineSummary');
  const totalPrice = schedule.reduce((acc, { member }) =>
    acc + member.services.reduce((s, sid) => s + (SERVICES.find(x => x.id === sid)?.price || 0), 0), 0);

  summary.innerHTML = `
    <div class="summary-item">
      <span class="summary-item__label">Inicio</span>
      <span class="summary-item__value">${minToTime(startMin)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-item__label">Finalización estimada</span>
      <span class="summary-item__value">${minToTime(maxEnd)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-item__label">Total de personas</span>
      <span class="summary-item__value">${schedule.length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-item__label">Total estimado del evento</span>
      <span class="summary-item__value" style="color:#c9a84c;font-weight:600">$${totalPrice}</span>
    </div>`;
}

// ===== SHARE WHATSAPP =====
document.getElementById('shareWhatsApp').addEventListener('click', () => {
  const contact = document.getElementById('contactName').value.trim();
  const photoPhone = document.getElementById('photoPhone').value.trim();
  const eventDate  = document.getElementById('eventDate').value;
  const eventType  = document.querySelector('input[name="eventType"]:checked')?.value || 'evento';

  const active = members.filter(m => m.services.length > 0);
  let msg = `✦ *BELLEZA & ESTILO — ${capitalize(eventType).toUpperCase()}*\n`;
  if (contact) msg += `👰 ${contact}\n`;
  if (eventDate) msg += `📅 ${formatDate(eventDate)}\n\n`;
  msg += `*Integrantes y servicios:*\n`;

  active.forEach(m => {
    const svcs = m.services.map(sid => SERVICES.find(s => s.id === sid)?.name).filter(Boolean).join(', ');
    msg += `• ${m.name || m.role}: ${svcs}\n`;
  });

  msg += `\n¿Consultas? Escríbenos al +593 98 765 4321 💛`;

  const target = photoPhone || '';
  const url = `https://wa.me/${target.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// ===== PRINT =====
document.getElementById('printTimeline').addEventListener('click', () => window.print());

// ===== DATE INPUT MIN =====
const dateInput = document.getElementById('eventDate');
if (dateInput) dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);

// ===== HELPERS =====
function minToTime(min) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function capitalize(str) { return str ? str[0].toUpperCase() + str.slice(1) : ''; }

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${months[parseInt(m,10)-1]} ${y}`;
}

// ===== INIT: add bride by default =====
addMember('Novia', 'Novia');
