const steps     = [document.getElementById('step1'), document.getElementById('step2'), document.getElementById('step3')];
const stepDots  = document.querySelectorAll('.reg-step');
const stepLines = document.querySelectorAll('.reg-step__line');
let current = 0;

function goToStep(n) {
  steps[current].classList.add('rform__step--hidden');
  steps[n].classList.remove('rform__step--hidden');

  stepDots.forEach((dot, i) => {
    dot.classList.remove('reg-step--active', 'reg-step--done');
    if (i < n)  dot.classList.add('reg-step--done');
    if (i === n) dot.classList.add('reg-step--active');
  });
  stepLines.forEach((line, i) => {
    line.classList.toggle('done', i < n);
  });

  if (n === 2) {
    document.getElementById('googleSection')?.style && (document.getElementById('googleSection').style.display = 'none');
  }

  current = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Step 1 → 2
document.getElementById('toStep2').addEventListener('click', () => {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  if (!firstName || !lastName) {
    [document.getElementById('firstName'), document.getElementById('lastName')].forEach(el => {
      if (!el.value.trim()) el.classList.add('error');
    });
    return;
  }
  document.getElementById('firstName').classList.remove('error');
  document.getElementById('lastName').classList.remove('error');
  goToStep(1);
});

// Step 2 → 1
document.getElementById('toStep1').addEventListener('click', () => goToStep(0));

// Password strength
const pwdInput = document.getElementById('regPassword');
const strengthFill  = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

const levels = [
  { label: 'Muy débil',  cls: 'weak' },
  { label: 'Regular',    cls: 'fair' },
  { label: 'Buena',      cls: 'good' },
  { label: 'Muy segura', cls: 'strong' },
];

pwdInput.addEventListener('input', () => {
  const v = pwdInput.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  strengthFill.className = 'rform__strength-fill';
  if (!v) {
    strengthLabel.textContent = 'Introduce una contraseña';
  } else {
    const lvl = levels[Math.min(score - 1, 3)] || levels[0];
    strengthFill.classList.add(lvl.cls);
    strengthLabel.textContent = lvl.label;
  }
});

// Toggle password
document.getElementById('toggleRegPwd').addEventListener('click', () => {
  const isHidden = pwdInput.type === 'password';
  pwdInput.type = isHidden ? 'text' : 'password';
});

// Form submit (step 2)
document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('regError');
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const terms    = document.getElementById('terms').checked;

  errorBox.classList.remove('visible');

  if (!email) { showError('Ingresa tu correo electrónico.'); return; }
  if (password.length < 8) { showError('La contraseña debe tener al menos 8 caracteres.'); return; }
  if (password !== confirm) { showError('Las contraseñas no coinciden.'); return; }
  if (!terms) { showError('Debes aceptar los términos de uso.'); return; }

  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');

  setTimeout(() => {
    btn.classList.remove('loading');
    goToStep(2);
  }, 1400);

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
  }
});

// Clear errors on input
['firstName','lastName','regEmail','regPassword','regConfirm'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => el.classList.remove('error'));
});
