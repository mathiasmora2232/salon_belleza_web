// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile menu
const burger      = document.getElementById('burger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const overlay     = document.getElementById('mobileOverlay');

function openMenu() {
  mobileMenu.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (burger)      burger.addEventListener('click', openMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (overlay)     overlay.addEventListener('click', closeMenu);

document.querySelectorAll('.mobile-menu__links a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Set min date to today
const dateInput = document.getElementById('fecha');
if (dateInput) {
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

// ── Formulario de reserva ────────────────────────────────────────────────────

async function loadServiciosParaReserva() {
  try {
    const res = await fetch('/api/v1/servicios/estado/Activo');
    if (!res.ok) return;
    const servicios = await res.json();
    const select = document.getElementById('servicio');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Selecciona un servicio</option>';
    servicios.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.nombre} — $${s.precio}`;
      select.appendChild(opt);
    });
  } catch { /* sin conexión: las opciones hardcoded del HTML permanecen */ }
}

async function loadEstilistasParaReserva() {
  try {
    const res = await fetch('/api/v1/estilistas/estado/Activo');
    if (!res.ok) return;
    const estilistas = await res.json();
    const select = document.getElementById('estilista');
    if (!select) return;
    select.innerHTML = '<option value="">Sin preferencia</option>';
    estilistas.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = e.nombre;
      select.appendChild(opt);
    });
  } catch { /* sin conexión: opciones hardcoded permanecen */ }
}

const reservaForm = document.getElementById('reservaForm');
if (reservaForm) {
  loadServiciosParaReserva();
  loadEstilistasParaReserva();

  reservaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = reservaForm.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const nombreCompleto = document.getElementById('nombre').value.trim();
    const partes = nombreCompleto.split(' ');
    const nombre = partes[0];
    const apellido = partes.slice(1).join(' ');

    const servicioVal  = document.getElementById('servicio').value;
    const estilistaVal = document.getElementById('estilista').value;
    const horaVal      = document.getElementById('hora').value;

    const body = {
      nombre,
      apellido: apellido || '',
      telefono: document.getElementById('telefono').value.trim(),
      servicioId:  servicioVal  ? parseInt(servicioVal)  : null,
      estilistaId: estilistaVal ? parseInt(estilistaVal) : null,
      fecha:       document.getElementById('fecha').value,
      horaInicio:  horaVal ? horaVal + ':00' : null,
      observaciones: ''
    };

    try {
      const res = await fetch('/api/v1/citas/publica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.status === 201 || res.ok) {
        const success = document.getElementById('formSuccess');
        success.classList.add('visible');
        e.target.reset();
        loadServiciosParaReserva();
        loadEstilistasParaReserva();
        setTimeout(() => success.classList.remove('visible'), 6000);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Error al enviar la reserva. Por favor intenta de nuevo.');
      }
    } catch {
      alert('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
