// Protege páginas que requieren sesión activa.
// Incluir ANTES de cualquier otro script en páginas privadas.
(function () {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.replace('/login.html');
    return;
  }

  // Decodifica el payload sin verificar firma (solo para leer exp)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.replace('/login.html');
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.replace('/login.html');
  }
})();

// Helpers disponibles para otras páginas
function getToken()   { return localStorage.getItem('token'); }
function getUsuario() { return JSON.parse(localStorage.getItem('usuario') || 'null'); }
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.replace('/login.html');
}
