(function () {
  const ENDPOINT = (window.chatbotEndpoint || '').replace(/\/$/, '');
  const SITE_ID = window.chatbotSiteId || 'default';
  if (!ENDPOINT) { console.warn('[Chatbot] window.chatbotEndpoint is not set.'); return; }

  let themeColor = '#2563eb', botName = 'Assistant';
  let greeting = "Hi! 👋 How can I help you today?";
  let history = [], isOpen = false, isTyping = false;

  fetch(`${ENDPOINT}/site-config/${SITE_ID}`)
    .then(r => r.json())
    .then(c => {
      themeColor = c.themeColor || themeColor;
      botName = c.name || botName;
      greeting = c.greeting || greeting;
      document.documentElement.style.setProperty('--cb-color', themeColor);
      document.getElementById('cb-header-name').textContent = botName;
    }).catch(() => {});

  const style = document.createElement('style');
  style.textContent = `
    #cb-root * { box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; margin:0; padding:0; }
    #cb-bubble { position:fixed; bottom:24px; right:24px; width:58px; height:58px; background:var(--cb-color,#2563eb); border-radius:50%; cursor:pointer; z-index:99999; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 24px rgba(0,0,0,0.25); transition:transform 0.2s; border:none; }
    #cb-bubble:hover { transform:scale(1.08); }
    #cb-window { position:fixed; bottom:92px; right:24px; width:360px; height:520px; background:#fff; border-radius:18px; box-shadow:0 12px 48px rgba(0,0,0,0.18); z-index:99998; display:flex; flex-direction:column; overflow:hidden; opacity:0; pointer-events:none; transform:translateY(16px) scale(0.97); transition:opacity 0.25s ease,transform 0.25s ease; }
    #cb-window.cb-open { opacity:1; pointer-events:all; transform:translateY(0) scale(1); }
    #cb-header { background:var(--cb-color,#2563eb); color:#fff; padding:16px 20px; display:flex; align-items:center; gap:10px; }
    #cb-header-dot { width:10px; height:10px; background:#4ade80; border-radius:50%; flex-shrink:0; }
    #cb-header-name { font-weight:600; font-size:15px; flex:1; }
    #cb-header-close { background:none; border:none; color:rgba(255,255,255,0.8); cursor:pointer; font-size:20px; line-height:1; padding:0 2px; }
    #cb-header-close:hover { color:#fff; }
    #cb-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; background:#f8f9fb; }
    #cb-messages::-webkit-scrollbar { width:4px; }
    #cb-messages::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
    .cb-msg { max-width:82%; padding:10px 14px; border-radius:14px; font-size:14px; line-height:1.55; word-break:break-word; animation:cb-fadein 0.2s ease; }
    @keyframes cb-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
    .cb-msg.cb-bot { background:#fff; color:#1f2937; align-self:flex-start; border-bottom-left-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
    .cb-msg.cb-user { background:var(--cb-color,#2563eb); color:#fff; align-self:flex-end; border-bottom-right-radius:4px; }
    .cb-typing { display:flex; gap:5px; padding:12px 16px; background:#fff; border-radius:14px; border-bottom-left-radius:4px; align-self:flex-start; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
    .cb-typing span { width:7px; height:7px; background:#9ca3af; border-radius:50%; animation:cb-bounce 1.2s infinite ease-in-out; }
    .cb-typing span:nth-child(2){animation-delay:0.2s} .cb-typing span:nth-child(3){animation-delay:0.4s}
    @keyframes cb-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
    #cb-input-area { padding:12px 14px; border-top:1px solid #e5e7eb; display:flex; gap:8px; background:#fff; }
    #cb-input { flex:1; border:1.5px solid #e5e7eb; border-radius:10px; padding:10px 12px; font-size:14px; outline:none; color:#1f2937; transition:border-color 0.2s; }
    #cb-input:focus { border-color:var(--cb-color,#2563eb); }
    #cb-input:disabled { background:#f9fafb; }
    #cb-send { background:var(--cb-color,#2563eb); color:#fff; border:none; border-radius:10px; padding:10px 14px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:opacity 0.2s; }
    #cb-send:disabled { opacity:0.5; cursor:not-allowed; }
    #cb-powered { text-align:center; font-size:11px; color:#9ca3af; padding:4px 0 8px; background:#fff; }
    @media(max-width:420px){ #cb-window{width:calc(100vw - 20px);right:10px;bottom:82px;height:65vh;} #cb-bubble{bottom:16px;right:16px;} }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'cb-root';
  root.innerHTML = `
    <button id="cb-bubble" aria-label="Open chat">
      <svg id="cb-icon-chat" width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      <svg id="cb-icon-close" width="22" height="22" fill="white" viewBox="0 0 24 24" style="display:none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
    <div id="cb-window" role="dialog">
      <div id="cb-header">
        <div id="cb-header-dot"></div>
        <span id="cb-header-name">Assistant</span>
        <button id="cb-header-close">✕</button>
      </div>
      <div id="cb-messages"></div>
      <div id="cb-input-area">
        <input id="cb-input" placeholder="Type a message..." autocomplete="off" />
        <button id="cb-send">
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="cb-powered">Powered by AI</div>
    </div>
  `;
  document.body.appendChild(root);

  document.documentElement.style.setProperty('--cb-color', themeColor);

  const bubble = document.getElementById('cb-bubble');
  const win = document.getElementById('cb-window');
  const messagesEl = document.getElementById('cb-messages');
  const input = document.getElementById('cb-input');
  const sendBtn = document.getElementById('cb-send');
  const closeBtn = document.getElementById('cb-header-close');
  const iconChat = document.getElementById('cb-icon-chat');
  const iconClose = document.getElementById('cb-icon-close');

  function toggleChat(open) {
    isOpen = open !== undefined ? open : !isOpen;
    win.classList.toggle('cb-open', isOpen);
    iconChat.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';
    if (isOpen) {
      if (messagesEl.children.length === 0) addMessage('bot', greeting);
      setTimeout(() => input.focus(), 250);
    }
  }

  bubble.addEventListener('click', () => toggleChat());
  closeBtn.addEventListener('click', () => toggleChat(false));

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `cb-msg cb-${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'cb-typing'; el.id = 'cb-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() { const el = document.getElementById('cb-typing'); if (el) el.remove(); }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    isTyping = true; sendBtn.disabled = true; input.disabled = true;
    showTyping();
    try {
      const res = await fetch(`${ENDPOINT}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, siteId: SITE_ID, history: history.slice(-12) })
      });
      const data = await res.json();
      hideTyping();
      const reply = data.reply || "Sorry, couldn't get a response. Please try again.";
      addMessage('bot', reply);
      history.push({ role: 'bot', content: reply });
    } catch (e) {
      hideTyping();
      addMessage('bot', 'Connection issue. Please try again in a moment.');
    }
    isTyping = false; sendBtn.disabled = false; input.disabled = false; input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
})();
