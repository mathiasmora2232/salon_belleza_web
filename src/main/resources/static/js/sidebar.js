(function renderSalonSidebarOnly() {
  const nav = document.querySelector('.sidebar__nav');
  if (!nav) return;

  const paths = {
    'Dashboard': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    'Agenda': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01"/>',
    'Citas': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="m9 16 2 2 4-5"/>',
    'Calendario': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><circle cx="15" cy="16" r="3"/><path d="M15 15v1l.7.7"/>',
    'Clientes': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>',
    'Historial': '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 5.6 6.6L3 8"/><path d="M12 7v5l3 2"/>',
    'Fidelización': '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    'Reseñas': '<polygon points="12 2 15 8.5 22 9.3 17 14.2 18.3 21 12 17.6 5.7 21 7 14.2 2 9.3 9 8.5 12 2"/>',
    'Estilistas': '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    'Horarios': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'Comisiones': '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'Asistencia': '<path d="M9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'Servicios': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    'Categorías': '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    'Productos': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12l8.73-5.04M12 22.08V12"/>',
    'Paquetes': '<path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><path d="M12 3v18"/>',
    'Inventario': '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    'Caja / POS': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M7 13h.01M11 13h6M7 17h10"/>',
    'Pedidos': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    'Facturación': '<path d="M14 2H6a2 2 0 0 0-2 2v18l4-2 4 2 4-2 4 2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    'Métodos de pago': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    'Cupones': '<path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M9 9h.01M15 15h.01M16 8 8 16"/>',
    'Promociones': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    'Reportes': '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    'Impuestos': '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
    'Proveedores': '<path d="M16 3h5v5"/><path d="M21 3 14 10"/><path d="M3 21h18M5 21V8h7v13M14 21v-7h5v7"/>',
    'Gastos': '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M20 20 4 4"/>',
    'Campañas': '<path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    'Notificaciones': '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    'Galería': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    'Clientes inactivos': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M18 8l5 5M23 8l-5 5"/>',
    'Usuarios': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
    'Roles': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'Seguridad': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    'Configuración': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    'Auditoría': '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
  };
  const sections = [
    ['Principal', [['Dashboard', 'admin.html'], ['Agenda', '#'], ['Citas', 'citas.html'], ['Calendario', 'calendario.html']]],
    ['Clientes', [['Clientes', 'clientes.html'], ['Historial', 'historial.html'], ['Fidelización', '#'], ['Reseñas', '#']]],
    ['Personal', [['Estilistas', 'estilistas.html'], ['Horarios', '#'], ['Comisiones', 'comisiones.html'], ['Asistencia', '#']]],
    ['Catálogo', [['Servicios', 'servicios.html'], ['Categorías', 'categorias.html'], ['Productos', 'productos.html'], ['Paquetes', 'paquetes.html'], ['Inventario', '#']]],
    ['Ventas', [['Caja / POS', '#'], ['Pedidos', 'pedidos.html'], ['Facturación', '#'], ['Métodos de pago', '#'], ['Cupones', 'cupones.html'], ['Promociones', '#']]],
    ['Negocio', [['Reportes', '#'], ['Impuestos', 'impuestos.html'], ['Proveedores', '#'], ['Gastos', '#']]],
    ['Marketing', [['Campañas', '#'], ['Notificaciones', '#'], ['Galería', '#'], ['Clientes inactivos', '#']]],
    ['Sistema', [['Usuarios', 'usuarios.html'], ['Roles', 'roles.html'], ['Seguridad', 'seguridad.html'], ['Configuración', 'configuracion.html'], ['Auditoría', '#']]]
  ];
  const page = window.location.pathname.split('/').pop() || 'admin.html';
  const svg = label => `<svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${paths[label] || paths.Dashboard}</svg>`;

  nav.innerHTML = sections.map(([section, links]) => `
    <p class="sidebar__section-label">${section}</p>
    ${links.map(([label, href]) => `
      <a href="${href}" class="sidebar__link${href === page ? ' sidebar__link--active' : ''}${href === '#' ? ' sidebar__link--pending' : ''}" data-tooltip="${label}">
        ${svg(label)}
        <span>${label}</span>
      </a>`).join('')}
  `).join('');
})();
