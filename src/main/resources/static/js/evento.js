/* ===== EVENTO.JS — Planificador de eventos grupales ===== */

const SERVICES = [
  { id: 'corte',      name: 'Corte & Peinado',  dur: 60,  price: 15 },
  { id: 'color',      name: 'Color & Mechas',    dur: 120, price: 45 },
  { id: 'tratam',     name: 'Tratamiento',        dur: 90,  price: 30 },
  { id: 'maquillaje', name: 'Maquillaje',         dur: 60,  price: 25 },
  { id: 'unas',       name: 'Uñas Gel',           dur: 45,  price: 12 },
  { id: 'facial',     name: 'Facial & Spa',       dur: 90,  price: 35 },
];

const PACK_CONFIG = {
  esencial: { max: 3  },
  completo:  { max: 6  },
  premium:   { max: 10 }
};

const ROLES  = ['Novia', 'Mamá de la novia', 'Dama de honor', 'Hermana', 'Familiar', 'Amiga'];
const COLORS = ['#C9A84C','#8B6B8B','#5A7B8B','#7B8B5A','#8B5E3C','#5A5A8B','#8B5A5A','#6B8B6B'];

let members        = [];
let memberIdCounter = 0;
let currentStep    = 1;
let selectedPack   = null;

// ===== WIZARD =====

function goToStep(step) {
  [1, 2, 3].forEach(n => {
    document.getElementById(`evPanel${n}`).hidden = (n !== step);
    const s = document.getElementById(`evStep${n}`);
    s.classList.remove('ev-step--active', 'ev-step--done');
    if (n < step)  s.classList.add('ev-step--done');
    if (n === step) s.classList.add('ev-step--active');
  });

  [1, 2].forEach(n => {
    document.getElementById(`evLine${n}`)
      .classList.toggle('ev-track__line--done', n < step);
  });

  const backBtn = document.getElementById('evBack');
  const nextBtn = document.getElementById('evNext');

  backBtn.hidden = (step === 1);

  if (step === 3) {
    nextBtn.innerHTML = `Compartir
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="ev-next__icon">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>`;
  } else {
    nextBtn.innerHTML = `Siguiente
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="ev-next__icon">
        <polyline points="9 18 15 12 9 6"/>
      </svg>`;
  }

  currentStep = step;
}

// ===== PACK SELECTION =====

document.querySelectorAll('.ev-pack').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.ev-pack').forEach(c => c.classList.remove('ev-pack--selected'));
    card.classList.add('ev-pack--selected');
    selectedPack = card.dataset.pack;
  });
});

// ===== NAVIGATION =====

document.getElementById('evNext').addEventListener('click', () => {
  if (currentStep === 1) {
    if (!selectedPack) {
      document.getElementById('evPanel1').classList.add('ev-packs--shake');
      setTimeout(() => document.getElementById('evPanel1').classList.remove('ev-packs--shake'), 500);
      return;
    }
    updateMembersCap();
    goToStep(2);
  } else if (currentStep === 2) {
    const active = members.filter(m => m.services.length > 0);
    if (active.length === 0) {
      alert('Agrega al menos un integrante con servicios seleccionados.');
      return;
    }
    generateTimeline();
    goToStep(3);
  } else if (currentStep === 3) {
    shareWhatsAppAction();
  }
});

document.getElementById('evBack').addEventListener('click', () => {
  if (currentStep > 1) goToStep(currentStep - 1);
});

function updateMembersCap() {
  const max = PACK_CONFIG[selectedPack]?.max || 8;
  document.getElementById('membersCap').textContent = `(máx. ${max})`;
}

// ===== RADIO STYLING =====

document.querySelectorAll('.eradio').forEach(label => {
  label.querySelector('input').addEventListener('change', () => {
    document.querySelectorAll('.eradio').forEach(l => l.classList.remove('eradio--active'));
    label.classList.add('eradio--active');
  });
});

// ===== ADD MEMBER =====

document.getElementById('addMember').addEventListener('click', () => {
  const max = PACK_CONFIG[selectedPack]?.max || 8;
  if (members.length >= max) {
    alert(`El paquete ${capitalize(selectedPack)} permite máximo ${max} integrantes.`);
    return;
  }
  addMember();
});

function addMember(name = '', role = ROLES[members.length] || 'Invitada') {
  const id    = ++memberIdCounter;
  const color = COLORS[members.length % COLORS.length];
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

  item.querySelector('.member-item__name').addEventListener('input', e => {
    const m = getMember(member.id);
    if (m) {
      m.name = e.target.value;
      item.querySelector('.member-item__avatar').textContent = m.name ? m.name[0].toUpperCase() : '?';
    }
  });

  item.querySelector('.member-item__role-select').addEventListener('change', e => {
    const m = getMember(member.id);
    if (m) m.role = e.target.value;
  });

  item.querySelector('.member-remove').addEventListener('click', () => {
    members = members.filter(m => m.id !== member.id);
    item.remove();
  });

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

  const eventDate = document.getElementById('eventDate').value;
  const eventType = document.querySelector('input[name="eventType"]:checked')?.value || 'evento';
  document.getElementById('timelineTitle').textContent =
    `Timeline — ${capitalize(eventType)}${eventDate ? ' · ' + formatDate(eventDate) : ''}`;
}

function renderGantt(schedule, startMin, maxEnd) {
  const gantt = document.getElementById('ganttChart');
  gantt.innerHTML = '';
  const span = maxEnd - startMin || 60;

  const headerRow = document.createElement('div');
  headerRow.className = 'gantt-row gantt-header';
  const headerLabel = document.createElement('div');
  headerLabel.className = 'gantt-label';
  const headerTrack = document.createElement('div');
  headerTrack.className = 'gantt-header-track';

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

  schedule.forEach(({ member, blocks }) => {
    const row = document.createElement('div');
    row.className = 'gantt-row';

    const label = document.createElement('div');
    label.className = 'gantt-label';
    label.innerHTML = `<strong style="color:${member.color};font-size:0.8rem">${member.name || member.role}</strong>`;

    const track = document.createElement('div');
    track.className = 'gantt-track';

    blocks.forEach(({ service, start, end }) => {
      const left  = ((start - startMin) / span) * 100;
      const width = ((end - start) / span) * 100;
      const block = document.createElement('div');
      block.className = 'gantt-block';
      block.style.left       = `${left}%`;
      block.style.width      = `${Math.max(width, 2)}%`;
      block.style.background = member.color + '33';
      block.style.borderLeft = `3px solid ${member.color}`;
      block.title      = `${service.name} · ${minToTime(start)} – ${minToTime(end)}`;
      block.textContent = service.name;
      track.appendChild(block);
    });

    row.appendChild(label);
    row.appendChild(track);
    gantt.appendChild(row);
  });
}

function renderSummary(schedule, startMin, maxEnd) {
  const totalPrice = schedule.reduce((acc, { member }) =>
    acc + member.services.reduce((s, sid) => s + (SERVICES.find(x => x.id === sid)?.price || 0), 0), 0);

  document.getElementById('timelineSummary').innerHTML = `
    <div class="summary-item">
      <span class="summary-item__label">Paquete</span>
      <span class="summary-item__value">${capitalize(selectedPack || '—')}</span>
    </div>
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
      <span class="summary-item__label">Total estimado</span>
      <span class="summary-item__value summary-item__value--gold">$${totalPrice}</span>
    </div>`;
}

// ===== SHARE WHATSAPP =====

function shareWhatsAppAction() {
  const contact   = document.getElementById('contactName').value.trim();
  const photoPhone = document.getElementById('photoPhone').value.trim();
  const eventDate  = document.getElementById('eventDate').value;
  const eventType  = document.querySelector('input[name="eventType"]:checked')?.value || 'evento';

  const active = members.filter(m => m.services.length > 0);
  let msg = `✦ *BELLEZA & ESTILO — ${capitalize(eventType).toUpperCase()}*\n`;
  if (contact)   msg += `👰 ${contact}\n`;
  if (eventDate) msg += `📅 ${formatDate(eventDate)}\n`;
  msg += `📦 Paquete: ${capitalize(selectedPack || '')}\n\n*Integrantes:*\n`;

  active.forEach(m => {
    const svcs = m.services.map(sid => SERVICES.find(s => s.id === sid)?.name).filter(Boolean).join(', ');
    msg += `• ${m.name || m.role}: ${svcs}\n`;
  });

  msg += `\n¿Consultas? Escríbenos al +593 98 765 4321 💛`;

  const url = `https://wa.me/${photoPhone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

document.getElementById('shareWhatsApp').addEventListener('click', shareWhatsAppAction);
document.getElementById('printTimeline').addEventListener('click', () => window.print());

// ===== DATE MIN =====
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
  const [y, mo, d] = iso.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${months[parseInt(mo,10)-1]} ${y}`;
}

// ===== INIT =====
addMember('Novia', 'Novia');
