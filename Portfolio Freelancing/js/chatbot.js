(function () {
  'use strict';

  /* ── State ── */
  var messages = [];
  var isOpen = false;
  var isLoading = false;
  var emailSent = false;

  /* ── EmailJS config (user fills these in) ── */
  var EMAILJS_SERVICE_ID  = 'service_f6inkto';
  var EMAILJS_TEMPLATE_ID = 'template_v8z8mqd';
  var EMAILJS_PUBLIC_KEY  = 'VEaBwSV__6DqYsv3C';

  /* ── DOM refs ── */
  var floatBtn, chatWindow, messagesEl, inputEl, sendBtn, closeBtn;

  function init() {
    floatBtn    = document.getElementById('chatFloatBtn');
    chatWindow  = document.getElementById('chatWindow');
    messagesEl  = document.getElementById('chatMessages');
    inputEl     = document.getElementById('chatInput');
    sendBtn     = document.getElementById('chatSend');
    closeBtn    = document.getElementById('chatClose');

    if (!floatBtn) return;

    floatBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', handleSend);
    /* touchend als Fallback für mobile Browser die click verzögern */
    sendBtn.addEventListener('touchend', function (e) { e.preventDefault(); handleSend(); });
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    /* iOS-Keyboard-Fix: wenn Tastatur aufgeht, Fenster nach oben schieben */
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        if (!isOpen) return;
        var kbHeight = window.innerHeight - window.visualViewport.height;
        if (kbHeight > 100) {
          chatWindow.style.bottom = (kbHeight + 8) + 'px';
        } else {
          chatWindow.style.bottom = '';
        }
      });
    }

    /* Also init the embedded section chat if present */
    var embedSend  = document.getElementById('chatEmbedSend');
    var embedInput = document.getElementById('chatEmbedInput');
    if (embedSend && embedInput) {
      embedSend.addEventListener('click', function () { handleSend(true); });
      embedInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(true); }
      });
    }

    /* Aufmerksamkeit wenn Contact Section sichtbar */
    var triggered = false;
    window.addEventListener('scroll', function () {
      if (triggered || isOpen) return;
      var contact = document.getElementById('contact');
      if (!contact) return;
      var rect = contact.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.75) {
        triggered = true;
        triggerBotAttention();
      }
    }, { passive: true });

    window.addEventListener('beforeunload', function () {
      if (messages.length >= 2 && !emailSent) sendEmail();
    });
    /* Hinweis: E-Mail wird nur gesendet wenn Chat geöffnet war (mind. 1 Antwort) */

    /* Greeting */
    pushMessage('assistant', 'Hi! Ich bin Lucas digitaler Assistent. Stell mir gerne Fragen zu seinen Services, Projekten oder wie eine Zusammenarbeit aussehen könnte. 👋');
  }

  /* ── Bot Attention ── */
  function triggerBotAttention() {
    var btn = document.getElementById('chatFloatBtn');
    var bubble = document.querySelector('.cb-speech-bubble');
    if (!btn) return;

    setTimeout(function () {
      /* Bounce via keyframe direkt auf dem Button */
      btn.style.transition = 'none';
      var steps = [0, -28, 0, -16, 0, -8, 0];
      var delays = [0, 100, 220, 320, 420, 500, 580];
      steps.forEach(function (y, i) {
        setTimeout(function () {
          btn.style.transform = 'translateY(' + y + 'px) scale(' + (y === 0 ? 1 : 1.05) + ')';
        }, delays[i]);
      });
      setTimeout(function () {
        btn.style.transform = '';
        btn.style.transition = '';
      }, 700);

      /* Bubble aufleuchten */
      if (bubble) {
        bubble.style.transition = 'all 0.3s ease';
        bubble.style.background = 'rgba(58,82,212,0.9)';
        bubble.style.color = '#fff';
        bubble.style.borderColor = 'rgba(106,127,255,0.8)';
        bubble.style.boxShadow = '0 0 20px rgba(58,82,212,0.5)';
        setTimeout(function () {
          bubble.style.background = '';
          bubble.style.color = '';
          bubble.style.borderColor = '';
          bubble.style.boxShadow = '';
        }, 3500);
      }
    }, 600);
  }

  /* ── Toggle ── */
  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('cb-open');
    floatBtn.classList.add('cb-active');
    var bubble = document.querySelector('.cb-speech-bubble');
    if (bubble) bubble.style.display = 'none';
    setTimeout(function () { inputEl && inputEl.focus(); }, 300);
  }
  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('cb-open');
    floatBtn.classList.remove('cb-active');
    var bubble = document.querySelector('.cb-speech-bubble');
    if (bubble) bubble.style.display = '';
    if (messages.length >= 2 && !emailSent) sendEmail();
  }

  /* ── Send ── */
  function handleSend(embedded) {
    var el = embedded ? document.getElementById('chatEmbedInput') : inputEl;
    if (!el) return;
    var text = el.value.trim();
    if (!text || isLoading) return;
    el.value = '';

    pushMessage('user', text);
    if (embedded) syncEmbedMessages();
    showTyping();
    isLoading = true;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      hideTyping();
      isLoading = false;
      var reply = data.reply || 'Entschuldigung, ich konnte keine Antwort generieren.';
      pushMessage('assistant', reply);
      if (embedded) syncEmbedMessages();
      /* E-Mail wird nur beim Schließen des Chats oder der Seite gesendet */
    })
    .catch(function (err) {
      hideTyping();
      isLoading = false;
      console.error('Chat error:', err);
      pushMessage('assistant', 'Ups, da ist etwas schiefgelaufen. Versuch es nochmal oder schreib Luca direkt an.');
    });
  }

  /* ── Messages ── */
  function pushMessage(role, content) {
    messages.push({ role: role, content: content });
    renderMessage(messagesEl, role, content);
    scrollBottom(messagesEl);
  }

  function renderMessage(container, role, content) {
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'cb-msg cb-msg--' + role;
    var bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    if (role === 'assistant') {
      bubble.innerHTML = content.replace(/\n/g, '<br>');
    } else {
      bubble.textContent = content;
    }
    div.appendChild(bubble);
    container.appendChild(div);
  }

  function syncEmbedMessages() {
    var embedEl = document.getElementById('chatEmbedMessages');
    if (!embedEl) return;
    embedEl.innerHTML = '';
    messages.forEach(function (m) { renderMessage(embedEl, m.role, m.content); });
    scrollBottom(embedEl);
  }

  function showTyping() {
    if (!messagesEl) return;
    var div = document.createElement('div');
    div.className = 'cb-msg cb-msg--assistant';
    div.id = 'cb-typing';
    div.innerHTML = '<div class="cb-bubble cb-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(div);
    scrollBottom(messagesEl);
  }

  function hideTyping() {
    var el = document.getElementById('cb-typing');
    if (el) el.remove();
  }

  function scrollBottom(el) {
    if (el) el.scrollTop = el.scrollHeight;
  }

  /* ── EmailJS ── */
  function sendEmail() {
    if (emailSent) return;
    if (typeof emailjs === 'undefined') return;
    emailSent = true;

    var htmlTranscript = '<div style="font-family:Arial,sans-serif;font-size:14px;max-width:600px;">' +
      messages.map(function (m) {
        var isUser = m.role === 'user';
        var bg    = isUser ? '#3a52d4' : '#eef0ff';
        var color = isUser ? '#ffffff' : '#111111';
        var label = isUser ? '👤 Kunde' : '🤖 KI-Assistent';
        var text  = m.content.replace(/<[^>]*>/g, '');
        return '<div style="margin:16px 0;">' +
          '<div style="font-size:11px;font-weight:bold;color:#999;margin-bottom:6px;letter-spacing:0.5px;">' + label + '</div>' +
          '<div style="background:' + bg + ';color:' + color + ';border-radius:12px;padding:14px 18px;line-height:1.7;">' +
          text + '</div></div>';
      }).join('') + '</div>';

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      name: 'Portfolio Besucher',
      title: 'Neuer Chat – ' + new Date().toLocaleString('de-DE'),
      message: htmlTranscript,
      transcript: htmlTranscript,
      date: new Date().toLocaleString('de-DE')
    }, EMAILJS_PUBLIC_KEY).catch(function (err) {
      console.warn('EmailJS error:', err);
    });
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
