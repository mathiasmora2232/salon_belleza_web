// Rellena nombre/rol del usuario desde localStorage y conecta logout
const usuario = getUsuario();
if (usuario) {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  if (nameEl) nameEl.textContent = usuario.nombreCompleto || usuario.email;
  if (roleEl) roleEl.textContent = usuario.rol || '';
}
document.getElementById('logoutBtn')?.addEventListener('click', logout);

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

// Dynamic greeting based on hour
const titleEl = document.querySelector('.content__title');
if (titleEl) {
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
