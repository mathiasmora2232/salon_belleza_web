// Toggle password visibility
const toggleBtn = document.getElementById('togglePwd');
const pwdInput  = document.getElementById('password');
const eyeShow   = document.getElementById('eyeShow');
const eyeHide   = document.getElementById('eyeHide');

if (toggleBtn && pwdInput) {
  toggleBtn.addEventListener('click', () => {
    const isHidden = pwdInput.type === 'password';
    pwdInput.type  = isHidden ? 'text' : 'password';
    eyeShow.style.display = isHidden ? 'none'  : 'block';
    eyeHide.style.display = isHidden ? 'block' : 'none';
    toggleBtn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
}

// Form submission
const loginForm = document.getElementById('loginForm');
const errorBox  = document.getElementById('loginError');
const submitBtn = loginForm ? loginForm.querySelector('.lform__btn') : null;

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Por favor completa todos los campos.');
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('usuario', JSON.stringify({
          userId: data.userId,
          email: data.email,
          nombreCompleto: data.nombreCompleto,
          rol: data.rol,
        }));

        if (data.debeCambiarPass) {
          window.location.href = '/cambiar-password.html';
        } else if (['Administrador', 'Recepcionista', 'Cajero'].includes(data.rol)) {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/index.html';
        }
      } else {
        const msg = data.error || 'Correo o contraseña incorrectos.';
        showError(msg);
      }
    } catch {
      showError('Error de conexión. Intenta de nuevo.');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add('visible');
  setTimeout(() => errorBox.classList.remove('visible'), 5000);
}

// Clear error on input
['email', 'password'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => errorBox.classList.remove('visible'));
});
