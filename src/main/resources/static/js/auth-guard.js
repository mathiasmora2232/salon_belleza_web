// Protege páginas que requieren sesión activa.
// Incluir ANTES de cualquier otro script en páginas privadas.
(async function () {
  function parseJwt(t) {
    try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
  }

  function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
  }

  async function tryRefresh() {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return false;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.token) return false;
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.replace('/login.html');
    return;
  }

  const payload = parseJwt(token);
  if (!payload) {
    clearSession();
    window.location.replace('/login.html');
    return;
  }

  const expiresIn = payload.exp ? (payload.exp - Date.now() / 1000) : -1;

  if (expiresIn <= 0) {
    // Token expirado — ocultar página mientras intentamos renovar
    document.documentElement.style.visibility = 'hidden';
    const ok = await tryRefresh();
    document.documentElement.style.visibility = '';
    if (!ok) {
      clearSession();
      window.location.replace('/login.html');
    }
    return;
  }

  if (expiresIn < 300) {
    // Menos de 5 minutos — renovar silenciosamente en background
    tryRefresh();
  }
})();

// Helpers disponibles para otras páginas
function getToken()   { return localStorage.getItem('token'); }
function getUsuario() { return JSON.parse(localStorage.getItem('usuario') || 'null'); }
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('usuario');
  window.location.replace('/login.html');
}
