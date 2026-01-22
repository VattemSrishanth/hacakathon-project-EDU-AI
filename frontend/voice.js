// voice.js
// Inclusive voice recognition + command + translation layer (vanilla JS)
// Uses Web Speech API with graceful fallbacks and accessibility-first UX.

(function () {
  'use strict';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;
  const synthSupported = 'speechSynthesis' in window;

  // App-level state
  const state = {
    recognition: null,
    listening: false,
    lastTranscript: '',
    lastFinalTranscript: '',
    targetLang: localStorage.getItem('voiceTargetLang') || 'en',
    globalEnabled: localStorage.getItem('voiceGlobalEnabled') === 'true',
    ttsEnabled: localStorage.getItem('voiceTtsEnabled') === 'true'
  };

  // DOM helpers
  function byId(id) {
    return document.getElementById(id);
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function setVisible(el, visible) {
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
  }

  // Accessibility-friendly status updates
  function setStatus(message, tone) {
    const statusEl = byId('voiceStatus') || byId('voiceGlobalStatus');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('voice-status--error', 'voice-status--ok');
    if (tone === 'error') statusEl.classList.add('voice-status--error');
    if (tone === 'ok') statusEl.classList.add('voice-status--ok');
  }

  function setError(message) {
    const errorEl = byId('voiceError');
    if (errorEl) {
      errorEl.textContent = message;
      setVisible(errorEl, true);
    }
    setStatus(message, 'error');
  }

  // Language utilities
  const languageLabels = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil'
  };

  function detectLanguage(text) {
    if (/\p{Script=Devanagari}/u.test(text)) return 'hi';
    if (/\p{Script=Telugu}/u.test(text)) return 'te';
    if (/\p{Script=Tamil}/u.test(text)) return 'ta';
    return 'en';
  }

  function getSpeechLang(code) {
    if (code === 'hi') return 'hi-IN';
    if (code === 'te') return 'te-IN';
    if (code === 'ta') return 'ta-IN';
    return 'en-US';
  }

  // Translation (mock/offline-friendly)
  const translationMap = {
    hi: {
      'Home': 'होम',
      'Dashboard': 'डैशबोर्ड',
      'Lessons': 'पाठ',
      'AI Tutor': 'एआई ट्यूटर',
      'Accessibility': 'सुलभता',
      'Support': 'सहायता',
      'Settings': 'सेटिंग्स',
      'Accessibility Settings': 'सुलभता सेटिंग्स',
      'Current Mode:': 'वर्तमान मोड:'
    },
    te: {
      'Home': 'హోమ్',
      'Dashboard': 'డ్యాష్‌బోర్డ్',
      'Lessons': 'పాఠాలు',
      'AI Tutor': 'ఏఐ ట్యూటర్',
      'Accessibility': 'అభ్యంతర సౌలభ్యం',
      'Support': 'మద్దతు',
      'Settings': 'సెట్టింగులు',
      'Accessibility Settings': 'అభ్యంతర సౌలభ్య సెట్టింగులు',
      'Current Mode:': 'ప్రస్తుత మోడ్:'
    },
    ta: {
      'Home': 'முகப்பு',
      'Dashboard': 'டாஷ்போர்டு',
      'Lessons': 'பாடங்கள்',
      'AI Tutor': 'ஏஐ ட்யூட்டர்',
      'Accessibility': 'அணுகல்',
      'Support': 'ஆதரவு',
      'Settings': 'அமைப்புகள்',
      'Accessibility Settings': 'அணுகல் அமைப்புகள்',
      'Current Mode:': 'தற்போதைய முறை:'
    }
  };

  function translateTextMock(text, targetLang) {
    if (!text) return '';
    if (targetLang === 'en') return text;
    const map = translationMap[targetLang] || {};
    if (map[text]) return map[text];
    return '[' + (languageLabels[targetLang] || targetLang) + '] ' + text;
  }

  function translatePageUI(targetLang) {
    const candidates = document.querySelectorAll(
      '.nav-item, .section h2, .section h3, .section h4, .button'
    );

    candidates.forEach((el) => {
      if (!el || !el.textContent) return;
      const original = el.getAttribute('data-voice-original') || el.textContent.trim();
      if (!el.getAttribute('data-voice-original')) {
        el.setAttribute('data-voice-original', original);
      }
      if (targetLang === 'en') {
        el.textContent = el.getAttribute('data-voice-original');
        return;
      }
      const translated = translationMap[targetLang] && translationMap[targetLang][original];
      if (translated) {
        el.textContent = translated;
      }
    });
  }

  function speakText(text, lang) {
    if (!synthSupported || !state.ttsEnabled) return;
    if (!text || text.trim() === '') return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLang(lang || 'en');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  // SpeechRecognition setup
  function ensureRecognition() {
    if (!speechSupported) return null;
    if (state.recognition) return state.recognition;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      state.listening = true;
      setStatus('Listening… Speak a command or question.', 'ok');
      setButtonsState(true);
    };

    recognition.onend = function () {
      state.listening = false;
      setStatus('Voice listening stopped.', 'ok');
      setButtonsState(false);
    };

    recognition.onerror = function (event) {
      const code = event && event.error ? event.error : 'unknown';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('Microphone access denied. Please allow mic permissions and try again.');
      } else if (code === 'audio-capture') {
        setError('No microphone detected. Please connect a mic and try again.');
      } else if (code === 'no-speech') {
        setError('No speech detected. Try speaking a little louder.');
      } else {
        setError('Voice recognition error: ' + code + '.');
      }
      state.listening = false;
      setButtonsState(false);
    };

    recognition.onresult = function (event) {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0] ? result[0].transcript : '';
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      const combined = (finalTranscript || '') + (interimTranscript ? ' ' + interimTranscript : '');
      const transcriptEl = byId('voiceTranscript');
      if (combined.trim()) {
        setText(transcriptEl, combined.trim());
      }

      if (finalTranscript.trim()) {
        state.lastFinalTranscript = finalTranscript.trim();
        state.lastTranscript = finalTranscript.trim();
        handleVoiceCommand(finalTranscript.trim());

        const detected = detectLanguage(finalTranscript.trim());
        const detectedEl = byId('voiceDetectedLang');
        if (detectedEl) {
          detectedEl.textContent = languageLabels[detected] || detected;
        }
      }
    };

    state.recognition = recognition;
    return recognition;
  }

  function setButtonsState(listening) {
    const startBtn = byId('voiceStartBtn');
    const stopBtn = byId('voiceStopBtn');
    if (startBtn) startBtn.disabled = listening;
    if (stopBtn) stopBtn.disabled = !listening;
  }

  function startListening() {
    const recognition = ensureRecognition();
    if (!recognition) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      // Prevent errors if start is called while already active
    }
  }

  function stopListening() {
    if (!state.recognition) return;
    try {
      state.recognition.stop();
    } catch (e) {
      // Ignore
    }
  }

  // Command parsing (extendable)
  const intents = [
    {
      name: 'go-home',
      patterns: [/^(go to|open) home$/i],
      action: () => navigateTo('home.html')
    },
    {
      name: 'open-dashboard',
      patterns: [/^(go to|open) dashboard$/i],
      action: () => navigateTo('dashboard.html')
    },
    {
      name: 'open-lessons',
      patterns: [/^(go to|open) lessons$/i],
      action: () => navigateTo('lessons.html')
    },
    {
      name: 'open-ai-tutor',
      patterns: [/^(go to|open) (ai|ai tutor|tutor)$/i],
      action: () => navigateTo('ai-tutor.html')
    },
    {
      name: 'open-accessibility',
      patterns: [/^(go to|open) accessibility$/i],
      action: () => navigateTo('accessibility.html')
    },
    {
      name: 'open-settings',
      patterns: [/^(go to|open) settings$/i],
      action: () => navigateTo('settings.html')
    },
    {
      name: 'enable-deaf',
      patterns: [/^enable deaf mode$/i, /^deaf mode$/i],
      action: () => applyAccessibilityMode('deaf')
    },
    {
      name: 'enable-normal',
      patterns: [/^enable regular mode$/i, /^enable normal mode$/i, /^regular mode$/i, /^normal mode$/i],
      action: () => applyAccessibilityMode('normal')
    },
    {
      name: 'enable-speech',
      patterns: [/^enable speech mode$/i, /^speech mode$/i],
      action: () => applyAccessibilityMode('speech')
    },
    {
      name: 'translate-page',
      patterns: [/^translate page to (english|hindi|telugu|tamil)$/i],
      action: (match) => {
        if (!match || !match[1]) return;
        const lang = langFromName(match[1]);
        if (!lang) return;
        state.targetLang = lang;
        localStorage.setItem('voiceTargetLang', lang);
        translatePageUI(lang);
        setStatus('Applied basic page translation: ' + languageLabels[lang], 'ok');
      }
    }
  ];

  function langFromName(name) {
    const key = (name || '').toLowerCase();
    if (key.includes('hindi')) return 'hi';
    if (key.includes('telugu')) return 'te';
    if (key.includes('tamil')) return 'ta';
    if (key.includes('english')) return 'en';
    return null;
  }

  function normalizeCommand(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .trim();
  }

  function handleVoiceCommand(text) {
    const normalized = normalizeCommand(text);
    if (!normalized) return;

    for (let i = 0; i < intents.length; i += 1) {
      const intent = intents[i];
      const matched = intent.patterns
        .map((pattern) => normalized.match(pattern))
        .find((match) => match);
      if (matched) {
        intent.action(matched);
        return;
      }
    }

    // If we are on AI Tutor page, use the final transcript as input
    const tutorInput = byId('aiTutorQuestion');
    if (tutorInput && tutorInput.value.trim() === '') {
      tutorInput.value = text;
      setStatus('Voice input added to AI Tutor.', 'ok');
    }
  }

  function navigateTo(path) {
    if (!path) return;
    if (window.location.pathname.endsWith(path)) return;
    window.location.href = path;
  }

  function applyAccessibilityMode(mode) {
    const modeValue = mode || 'normal';
    if (typeof window.setMode === 'function') {
      window.setMode(modeValue);
    } else {
      localStorage.setItem('accessibilityMode', modeValue);
    }

    const radio = document.querySelector('input[name="mode"][value="' + modeValue + '"]');
    if (radio) radio.checked = true;

    const modeNames = {
      normal: 'Normal Mode',
      deaf: 'Deaf Mode',
      speech: 'Speech-Impaired Mode'
    };
    const modeText = byId('currentModeText');
    if (modeText) modeText.textContent = modeNames[modeValue] || 'Normal Mode';

    setStatus('Accessibility mode set to ' + (modeNames[modeValue] || 'Normal Mode') + '.', 'ok');
  }

  // Accessibility page setup
  function setupAccessibilityPanel() {
    const panel = byId('voicePanel');
    if (!panel) return;

    const startBtn = byId('voiceStartBtn');
    const stopBtn = byId('voiceStopBtn');
    const translateBtn = byId('voiceTranslateBtn');
    const langSelect = byId('voiceLangSelect');
    const ttsToggle = byId('voiceTtsToggle');
    const globalToggle = byId('voiceGlobalToggle');

    if (!speechSupported) {
      setError('Your browser does not support the Web Speech API. Try Chrome or Edge.');
      setButtonsState(false);
      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = true;
    }

    if (langSelect) {
      langSelect.value = state.targetLang;
      langSelect.addEventListener('change', function (event) {
        state.targetLang = event.target.value;
        localStorage.setItem('voiceTargetLang', state.targetLang);
        setStatus('Translation language set to ' + languageLabels[state.targetLang] + '.', 'ok');
      });
    }

    if (ttsToggle) {
      ttsToggle.checked = state.ttsEnabled;
      ttsToggle.addEventListener('change', function (event) {
        state.ttsEnabled = !!event.target.checked;
        localStorage.setItem('voiceTtsEnabled', state.ttsEnabled ? 'true' : 'false');
      });
    }

    if (globalToggle) {
      globalToggle.checked = state.globalEnabled;
      globalToggle.addEventListener('change', function (event) {
        state.globalEnabled = !!event.target.checked;
        localStorage.setItem('voiceGlobalEnabled', state.globalEnabled ? 'true' : 'false');
        if (state.globalEnabled) {
          setStatus('Global voice commands enabled.', 'ok');
          createGlobalVoiceButton();
          startListening();
        } else {
          setStatus('Global voice commands disabled.', 'ok');
          removeGlobalVoiceButton();
          stopListening();
        }
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', function () {
        startListening();
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        stopListening();
      });
    }

    if (translateBtn) {
      translateBtn.addEventListener('click', function () {
        const input = state.lastFinalTranscript || state.lastTranscript;
        if (!input) {
          setStatus('Speak first, then translate.', 'error');
          return;
        }
        const translated = translateTextMock(input, state.targetLang);
        const output = byId('voiceTranslateOutput');
        if (output) output.textContent = translated;
        speakText(translated, state.targetLang);
      });
    }
  }

  // Global voice helper (lightweight)
  function createGlobalVoiceButton() {
    if (!state.globalEnabled) return;
    if (byId('voiceGlobalToggleButton')) return;

    const btn = document.createElement('button');
    btn.id = 'voiceGlobalToggleButton';
    btn.className = 'voice-fab';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle voice commands');
    btn.textContent = state.listening ? '🎙️ Voice On' : '🎙️ Voice';
    btn.addEventListener('click', function () {
      if (state.listening) {
        stopListening();
      } else {
        startListening();
      }
      btn.textContent = state.listening ? '🎙️ Voice On' : '🎙️ Voice';
    });

    document.body.appendChild(btn);

    // Add a hidden live region for screen readers
    if (!byId('voiceGlobalStatus')) {
      const live = document.createElement('div');
      live.id = 'voiceGlobalStatus';
      live.className = 'voice-sr-only';
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
  }

  function removeGlobalVoiceButton() {
    const btn = byId('voiceGlobalToggleButton');
    if (btn) btn.remove();
  }

  // Optional AI Tutor mic button (no HTML edits)
  function setupAiTutorVoiceButton() {
    const input = byId('aiTutorQuestion');
    const askBtn = byId('aiTutorAskBtn');
    if (!input || !askBtn) return;

    if (byId('aiTutorVoiceBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'aiTutorVoiceBtn';
    btn.className = 'button btn-small';
    btn.type = 'button';
    btn.textContent = '🎙️ Voice';
    btn.style.marginLeft = '8px';

    btn.addEventListener('click', function () {
      startListening();
      setStatus('Listening for your question…', 'ok');
    });

    askBtn.insertAdjacentElement('afterend', btn);
  }

  // Keyboard toggle (global listener): Ctrl+Shift+V
  document.addEventListener('keydown', function (event) {
    if (!event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== 'v') return;
    if (!state.globalEnabled) return;
    if (state.listening) {
      stopListening();
      setStatus('Voice commands paused.', 'ok');
    } else {
      startListening();
      setStatus('Voice commands active.', 'ok');
    }
  });

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    setupAccessibilityPanel();
    setupAiTutorVoiceButton();

    if (!speechSupported) {
      setStatus('Voice commands are not supported in this browser.', 'error');
      return;
    }

    if (state.globalEnabled) {
      createGlobalVoiceButton();
      // Attempt auto-start if permission already granted
      startListening();
    }
  });
})();
