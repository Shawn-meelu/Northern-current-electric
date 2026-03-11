const chatToggle = document.querySelector('.chat-toggle');
const chatPanel = document.querySelector('.chat-panel');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.querySelector('.chat-form');
const chatMessages = document.querySelector('.chat-messages');

if (chatToggle && chatPanel && chatClose && chatForm && chatMessages) {
  const setPanelOpen = (open) => {
    chatPanel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('chat-open', open);
    if (open) {
      chatPanel.focus();
    }
  };

  const addMessage = (message, from = 'user') => {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${from}`;
    messageEl.textContent = message;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const respond = (question) => {
    const normalized = question.trim().toLowerCase();

    const responses = [
      "Thanks for reaching out! We'll get back to you soon.",
      "Our team can help with service estimates, scheduling, and questions about your project.",
      "To book an on-site visit, please provide your location and a brief description of the issue.",
      "For emergency service, call us directly at (555) 123-4567.",
    ];

    if (normalized.includes('quote') || normalized.includes('estimate')) {
      return "I can help with that. Tell me a bit about your project and I'll help you prepare the right information for your quote.";
    }
    if (normalized.includes('emergency') || normalized.includes('outage') || normalized.includes('repair')) {
      return "If this is urgent, please call (555) 123-4567 so we can dispatch a technician quickly.";
    }
    if (normalized.includes('hours') || normalized.includes('open')) {
      return "We are available 24/7 for emergency service. For regular appointments, we typically operate from 8am–6pm, Monday through Saturday.";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendUserMessage = (text) => {
    addMessage(text, 'user');
    const typing = document.createElement('div');
    typing.className = 'chat-message ai typing';
    typing.textContent = 'Typing…';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate a short delay for the AI response
    setTimeout(() => {
      typing.remove();
      addMessage(respond(text), 'ai');
    }, 900);
  };

  chatToggle.addEventListener('click', () => setPanelOpen(true));
  chatClose.addEventListener('click', () => setPanelOpen(false));

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = chatForm.querySelector('input');
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    input.value = '';
    sendUserMessage(message);
  });

  // Close chat when clicking outside panel
  document.addEventListener('click', (event) => {
    if (!chatPanel.contains(event.target) && !chatToggle.contains(event.target)) {
      setPanelOpen(false);
    }
  });
}

// Shared UI helpers (year + mobile nav toggle)
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const navToggle = document.querySelector('.mobile-nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
}
