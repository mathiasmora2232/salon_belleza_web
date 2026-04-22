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

// Close menu on link click
document.querySelectorAll('.mobile-menu__links a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Form submission
const reservaForm = document.getElementById('reservaForm');
if (reservaForm) {
  reservaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = document.getElementById('formSuccess');
    success.classList.add('visible');
    e.target.reset();
    setTimeout(() => success.classList.remove('visible'), 5000);
  });
}

// Set min date to today
const dateInput = document.getElementById('fecha');
if (dateInput) {
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}
