/* ============================================================
   CHATBOT — Luna | Belleza & Estilo
   Para activar OpenAI: reemplaza OPENAI_API_KEY con tu key real.
   Sin key usa respuestas inteligentes por palabras clave.
   ============================================================ */

const OPENAI_API_KEY = ''; // la key ahora vive en el servidor Java, no aquí

const SYSTEM_PROMPT = `Eres Luna, asistente virtual del Salón Belleza & Estilo en Quito, Ecuador.
Ayudas a las clientas con reservas, servicios, precios, horarios y dudas generales.
Responde siempre en español, de forma amable, concisa y con un tono cálido y profesional.
No uses emojis en exceso.

SERVICIOS Y PRECIOS:
- Corte & Peinado: desde $15 (60 min)
- Color & Mechas / Balayage: desde $45 (120 min)
- Tratamientos capilares (keratina, botox capilar): desde $30 (90 min)
- Maquillaje social o nupcial: desde $25 (60 min)
- Manicure / Pedicure / Uñas gel: desde $12 (45 min)
- Facial & Spa: desde $35 (90 min)
- Agendamiento grupal (novias, quinceañeras): consúltanos para paquetes especiales

EQUIPO: Valentina Ríos (colorista), Andrés Morales (barbero/estilista), Gabriela Salas (uñas), Carolina Vega (facial)
HORARIO: Lunes–Sábado 9:00–19:00. Domingo 10:00–15:00
UBICACIÓN: Av. República 123 y Naciones Unidas, Quito
TELÉFONO: +593 98 765 4321
EMAIL: hola@bellezayestilo.ec

Si la clienta quiere reservar, dile que puede hacerlo en el sitio web (sección Reservar) o escribirnos al WhatsApp.
Si preguntas algo que no sabes con certeza, indícalo y ofrece contacto directo.`;

// Respuestas por palabras clave (fallback sin API key)
const KB = [
  { keys: ['hola','buenas','buenos','buen día','hi','hey'],
    reply: '¡Hola! 😊 Bienvenida a Belleza & Estilo. Soy Luna, tu asistente. ¿En qué puedo ayudarte hoy?' },
  { keys: ['precio','costo','vale','cuánto','cuanto','tarifa'],
    reply: 'Nuestros precios van desde:\n• Corte & Peinado: desde $15\n• Color & Mechas: desde $45\n• Tratamientos: desde $30\n• Maquillaje: desde $25\n• Uñas: desde $12\n• Facial & Spa: desde $35\n\n¿Te interesa algún servicio en especial?' },
  { keys: ['reservar','reserva','cita','agendar','agenda','turno'],
    reply: 'Puedes reservar tu cita directamente en nuestra web (sección "Reservar cita") o escribirnos al WhatsApp +593 98 765 4321. ¿Qué servicio te gustaría?' },
  { keys: ['horario','hora','abierto','abren','cierran','cuando'],
    reply: 'Nuestros horarios:\n• Lunes a Sábado: 9:00 – 19:00\n• Domingo: 10:00 – 15:00\n\n¿Necesitas más información?' },
  { keys: ['dirección','donde','ubicación','lugar','cómo llegar','como llegar'],
    reply: 'Estamos en Av. República 123 y Naciones Unidas, Quito. ¿Quieres que te comparta el mapa de ubicación?' },
  { keys: ['novia','boda','novias','quinceañera','quinceaños','evento','grupo'],
    reply: '¡Tenemos un servicio especial para novias y eventos grupales! Coordinamos citas simultáneas para la novia y su grupo (mamá, damas, etc.) con timeline personalizado.\n\nConsúltanos por WhatsApp para armar tu paquete: +593 98 765 4321' },
  { keys: ['color','mechas','balayage','tinte','decoloración'],
    reply: 'En Color & Mechas ofrecemos:\n• Coloración completa\n• Mechas y balayage\n• Decoloración\n• Matizados\n\nTodo desde $45, con nuestra colorista senior Valentina Ríos. ¿Quieres reservar?' },
  { keys: ['keratina','botox capilar','tratamiento','hidratación'],
    reply: 'Nuestros tratamientos capilares incluyen keratina, botox capilar, hidratación profunda y tratamientos anticaída, desde $30. Resultados visibles desde la primera sesión. ¿Te agendamos?' },
  { keys: ['maquillaje','makeup','nupcial','social'],
    reply: 'Ofrecemos maquillaje social, nupcial y artístico desde $25. Carolina Vega es nuestra especialista facial. ¿Es para una ocasión especial?' },
  { keys: ['uña','manicure','pedicure','gel','nail art','acrílico'],
    reply: 'Gabriela Salas es nuestra especialista en uñas:\n• Manicure / Pedicure: desde $12\n• Uñas de gel y acrílico\n• Nail art personalizado\n\n¿Quieres reservar?' },
  { keys: ['facial','spa','limpieza','masaje','ritual'],
    reply: 'Nuestros servicios Facial & Spa incluyen limpiezas faciales, masajes relajantes y rituales de belleza desde $35. Carolina Vega te atenderá. ¿Te reservamos?' },
  { keys: ['estilista','quien','quién','equipo','personal'],
    reply: 'Nuestro equipo:\n• Valentina Ríos — Colorista Senior (8 años)\n• Andrés Morales — Barbero & Estilista (6 años)\n• Gabriela Salas — Especialista en Uñas (5 años)\n• Carolina Vega — Esteticista Facial (7 años)\n\n¿Con quién te gustaría agendar?' },
  { keys: ['gracias','muchas gracias','perfecto','genial','listo'],
    reply: '¡Con mucho gusto! 💛 Si necesitas algo más, aquí estaré. ¡Hasta pronto!' },
  { keys: ['whatsapp','número','número','teléfono','llamar','contacto'],
    reply: 'Puedes contactarnos por:\n• WhatsApp: +593 98 765 4321\n• Email: hola@bellezayestilo.ec\n\n¡Te respondemos enseguida!' },
];

// ===== STATE =====
const history = [];
let isOpen = false;
let isTyping = false;

// ===== DOM =====
let widget, panel, messagesEl, inputEl, sendBtn, toggleBtn, badgeEl;

function buildWidget() {
  // Toggle button
  toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'chat-toggle';
  toggleBtn.setAttribute('aria-label', 'Abrir chat');
  toggleBtn.innerHTML = `
    <svg class="chat-toggle__icon chat-toggle__icon--chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg class="chat-toggle__icon chat-toggle__icon--close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <span class="chat-toggle__badge" id="chatBadge">1</span>`;

  // Panel
  panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="chat-panel__header">
      <div class="chat-panel__avatar">L</div>
      <div class="chat-panel__info">
        <span class="chat-panel__name">Luna</span>
        <span class="chat-panel__status"><span class="chat-panel__dot"></span>En línea</span>
      </div>
      <button type="button" class="chat-panel__close" id="chatClose" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-panel__footer">
      <div class="chat-input-wrap">
        <textarea class="chat-input" id="chatInput" placeholder="Escribe tu mensaje…" rows="1"></textarea>
        <button type="button" class="chat-send" id="chatSend" aria-label="Enviar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p class="chat-panel__powered">Asistente IA · Belleza & Estilo</p>
    </div>`;

  widget = document.createElement('div');
  widget.className = 'chat-widget';
  widget.appendChild(panel);
  widget.appendChild(toggleBtn);
  document.body.appendChild(widget);

  messagesEl = document.getElementById('chatMessages');
  inputEl    = document.getElementById('chatInput');
  sendBtn    = document.getElementById('chatSend');
  badgeEl    = document.getElementById('chatBadge');

  // Events
  toggleBtn.addEventListener('click', toggleChat);
  document.getElementById('chatClose').addEventListener('click', closeChat);
  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  inputEl.addEventListener('input', autoResize);

  // Greeting after 2s
  setTimeout(() => {
    if (!isOpen) badgeEl.classList.add('visible');
    appendBot('¡Hola! Soy **Luna**, asistente de Belleza & Estilo. ¿En qué puedo ayudarte hoy? 💛', true);
  }, 2000);
}

function toggleChat() {
  isOpen ? closeChat() : openChat();
}

function openChat() {
  isOpen = true;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  toggleBtn.classList.add('open');
  badgeEl.classList.remove('visible');
  setTimeout(() => inputEl.focus(), 300);
}

function closeChat() {
  isOpen = false;
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  toggleBtn.classList.remove('open');
}

function autoResize() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
}

// ===== MESSAGES =====
function appendBot(text, withChips = false) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg chat-msg--bot';

  const bubble = document.createElement('div');
  bubble.className = 'chat-msg__bubble';
  bubble.innerHTML = formatText(text);
  wrap.appendChild(bubble);

  if (withChips) {
    const chips = document.createElement('div');
    chips.className = 'chat-chips';
    ['Reservar cita', 'Ver servicios', 'Precios', 'Horarios', 'Día de novia ✦'].forEach(label => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-chip';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        chips.remove();
        sendMessage(label);
      });
      chips.appendChild(btn);
    });
    wrap.appendChild(chips);
  }

  messagesEl.appendChild(wrap);
  scrollBottom();
}

function appendUser(text) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg chat-msg--user';
  wrap.innerHTML = `<div class="chat-msg__bubble">${escapeHtml(text)}</div>`;
  messagesEl.appendChild(wrap);
  scrollBottom();
}

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg chat-msg--bot chat-typing-wrap';
  wrap.id = 'typingIndicator';
  wrap.innerHTML = `<div class="chat-msg__bubble chat-typing">
    <span></span><span></span><span></span>
  </div>`;
  messagesEl.appendChild(wrap);
  scrollBottom();
}

function hideTyping() {
  document.getElementById('typingIndicator')?.remove();
}

function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== SEND LOGIC =====
function handleSend() {
  const text = inputEl.value.trim();
  if (!text || isTyping) return;
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendMessage(text);
}

async function sendMessage(text) {
  appendUser(text);
  history.push({ role: 'user', content: text });
  isTyping = true;
  sendBtn.disabled = true;

  showTyping();
  await delay(800 + Math.random() * 600);
  hideTyping();

  let reply;
  // Siempre llama al backend Java que maneja la key de OpenAI de forma segura
  reply = await callOpenAI();

  appendBot(reply);
  history.push({ role: 'assistant', content: reply });
  isTyping = false;
  sendBtn.disabled = false;
}

async function callOpenAI() {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    return data.reply || 'Disculpa, no pude procesar tu mensaje. Escríbenos al WhatsApp +593 98 765 4321.';
  } catch {
    return 'Disculpa, no pude conectarme en este momento. Puedes escribirnos al WhatsApp +593 98 765 4321.';
  }
}

function keywordMatch(text) {
  const lower = text.toLowerCase();
  for (const entry of KB) {
    if (entry.keys.some(k => lower.includes(k))) return entry.reply;
  }
  return `Gracias por tu mensaje. Para darte información más precisa, puedes contactarnos:\n• WhatsApp: +593 98 765 4321\n• Email: hola@bellezayestilo.ec\n\n¿Hay algo más en lo que pueda ayudarte?`;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== INIT =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildWidget);
} else {
  buildWidget();
}
