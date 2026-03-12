const chatToggle = document.querySelector('.chat-toggle');
const chatPanel = document.querySelector('.chat-panel');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.querySelector('.chat-form');
const chatMessages = document.querySelector('.chat-messages');

// === Configuration ===
// Provide your OpenAI API key below if you want actual model-powered responses.
//   - To keep your key safe, in production you should proxy the request through
a backend instead of embedding it in the page.
//   - Leave blank to use the built‑in rules engine.
const OPENAI_API_KEY = '';

// phone number used in replies
const SERVICE_NUMBER = '(647) 568-5861';

// simple industry rate ranges (hourly) for different service types
const industryRates = {
  electrical: [80, 120],
  handyman: [60, 90],
  "tv & low voltage": [50, 85],
  plumbing: [70, 100],
  hvac: [85, 130],
};


if (chatToggle && chatPanel && chatClose && chatForm && chatMessages) {
  const setPanelOpen = (open) => {
    chatPanel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('chat-open', open);
    if (open) {
      chatPanel.focus();
      // show introductory message once per session
      if (chatMessages.childElementCount === 0) {
        const welcome = OPENAI_API_KEY
          ? "Hi there! I'm your AI-powered Northern Current assistant. For direct help call " + SERVICE_NUMBER + ". Ask me about industry rates, estimates, or service questions."
          : "Hi there! I'm the Northern Current assistant. For direct help call " + SERVICE_NUMBER + ". Ask me about industry rates, estimates, or service questions.";
        addMessage(welcome, 'ai');
      }
    }
  };

  const addMessage = (message, from = 'user') => {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${from}`;
    messageEl.textContent = message;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // fall-back responder when no API key is provided or the call fails
  const respond = (question) => {
    const normalized = question.trim().toLowerCase();

    // placeholder replies used when no special keyword is detected
    const generic = [
      "Thanks for reaching out! We'll get back to you soon.",
      "Our team can help with service estimates, scheduling, and questions about your project.",
      "To book an on-site visit, please provide your location and a brief description of the issue.",
    ];

    const rateEstimate = () => {
      let category = 'electrical';
      if (normalized.includes('plumb')) category = 'plumbing';
      else if (normalized.includes('hvac')) category = 'hvac';
      else if (normalized.includes('handyman')) category = 'handyman';
      else if (normalized.includes('tv') || normalized.includes('low voltage')) category = 'tv & low voltage';

      const [low, high] = industryRates[category];
      return `Industry rates for ${category} work typically run about $${low}‑$${high} per hour. ` +
             `These are rough averages; we’ll give you a precise quote after reviewing your project.`;
    };

    if (normalized.includes('quote') || normalized.includes('estimate')) {
      return "I can help with that. Tell me a bit about your project and I'll help you prepare the right information for your quote.";
    }
    if (normalized.includes('rate') || normalized.includes('price') || normalized.includes('cost') || normalized.includes('industry')) {
      return rateEstimate();
    }
    if (normalized.includes('emergency') || normalized.includes('outage') || normalized.includes('repair')) {
      return `If this is urgent, please call ${SERVICE_NUMBER} so we can dispatch a technician quickly.`;
    }
    if (normalized.includes('hours') || normalized.includes('open')) {
      return "We are available 24/7 for emergency service. For regular appointments, we typically operate from 8am–6pm, Monday through Saturday.";
    }

    return generic[Math.floor(Math.random() * generic.length)] +
           ` Call us at ${SERVICE_NUMBER} for more details.`;
  };

  // AI call helper
  const askAi = async (prompt) => {
    if (!OPENAI_API_KEY) {
      return respond(prompt);
    }

    try {
      const systemMsg = `You are a helpful virtual assistant for Northern Current Electric. ` +
                        `The company phone number is ${SERVICE_NUMBER}. ` +
                        `When asked about rates, provide reasonable industry averages for electrical, plumbing, HVAC, handyman, or low-voltage work. ` +
                        `Keep replies concise and friendly.`;

      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
      };

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error(`AI error ${resp.status}`);
      const data = await resp.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.warn('AI request failed, falling back:', err);
      return respond(prompt);
    }
  };



  const sendUserMessage = async (text) => {
    addMessage(text, 'user');
    const typing = document.createElement('div');
    typing.className = 'chat-message ai typing';
    typing.textContent = 'Typing…';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // fetch response (either from OpenAI or fallback logic)
    const reply = await askAi(text);
    typing.remove();
    addMessage(reply, 'ai');
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
