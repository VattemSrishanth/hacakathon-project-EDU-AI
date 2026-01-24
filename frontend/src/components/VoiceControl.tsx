import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

/**
 * GLOBAL VOICE CONTROL SYSTEM (WAKE-WORD ARCHITECTURE)
 * 1. Passively listens for "Hey Chat" wake word.
 * 2. Wakes up into Active Listening mode for 5-7 seconds.
 * 3. Parses commands (Navigation, AI Interaction, Logout).
 * 4. Sleeps automatically after action or timeout.
 * 5. Integrated with AI Tutor for hands-free query execution.
 */

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const VoiceControl: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth() || {};
  const { settings } = useSettings();
  const { accessibilityMode, voiceLanguage } = settings.themeAccessibility;
  
  const [status, setStatus] = useState<'sleeping' | 'listening'>('sleeping');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const statusRef = useRef<'sleeping' | 'listening'>('sleeping');

  // Keep ref in sync for event handlers
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Reset to passive wake-word detection
  const resetToSleep = useCallback(() => {
    setStatus('sleeping');
    statusRef.current = 'sleeping';
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Execute recognized commands
  const executeCommand = useCallback((transcript: string) => {
    const text = transcript.toLowerCase();
    console.log('Voice Command Received:', text);

    // 1. Accessibility Check: Dumb Mode disables all voice
    if (accessibilityMode === 'Dumb') return;

    // 2. Parse Logout
    if (text.includes('logout')) {
      logout?.();
      resetToSleep();
      return;
    }

    // 3. Multi-language Navigation Parsing
    const navKeywords = {
      home: ['home', 'mukhy', 'inicio', 'accueil', 'మఖయ', 'మఖపట'],
      dashboard: ['dashboard', 'tablero', 'tableau', 'డషబరడ', 'डशबरड'],
      lessons: ['lesson', 'paath', 'lecciones', 'leçons', 'పఠల', 'లసనస', 'सबक'],
      tutor: ['tutor', 'sikshak', 'ayudante', 'tuteur', 'శకషకడ', 'शकषक'],
      settings: ['settings', 'vshisht', 'ajuste', 'paramètre', 'సటటగల', 'అమరకల', 'वकलप'],
      back: ['back', 'pichhe', 'peeche', 'venukku', 'atrás', 'retour', 'వనకక', 'पछ']
    };

    let targetPath = '';
    if (navKeywords.home.some(k => text.includes(k))) targetPath = '/';
    else if (navKeywords.dashboard.some(k => text.includes(k))) targetPath = '/dashboard';
    else if (navKeywords.lessons.some(k => text.includes(k))) targetPath = '/lessons';
    else if (navKeywords.tutor.some(k => text.includes(k))) targetPath = '/ai-tutor';
    else if (navKeywords.settings.some(k => text.includes(k))) targetPath = '/settings';
    else if (navKeywords.back.some(k => text.includes(k))) { navigate(-1); resetToSleep(); return; }

    // 4. AI Query Parsing
    const askKeywords = ['ask', 'what is', "what's", 'search', 'tell me', 'बतओ', 'చపప', 'నడ', 'कय ह'];
    const foundAskIndex = askKeywords.find(k => text.includes(k));
    
    let aiQuery = '';
    if (foundAskIndex) {
      const parts = text.split(foundAskIndex);
      if (parts.length > 1) aiQuery = parts[1].trim();
    }

    // 5. Execution Flow
    if (targetPath) {
      // Chained Command: Navigate + Send Query
      if (aiQuery) {
        navigate(targetPath, { state: { voiceQuery: aiQuery } });
      } else {
        navigate(targetPath);
      }
      resetToSleep();
    } else if (aiQuery) {
      // Direct Question
      navigate('/ai-tutor', { state: { voiceQuery: aiQuery } });
      resetToSleep();
    } else if (text.length > 3) {
      // Assume query if no command matched but text exists
      navigate('/ai-tutor', { state: { voiceQuery: text } });
      resetToSleep();
    }
  }, [navigate, logout, resetToSleep, accessibilityMode]);

  useEffect(() => {
    if (!SpeechRecognition || accessibilityMode === 'Dumb') {
      setIsSupported(!!SpeechRecognition);
      return;
    }

    const reco = new SpeechRecognition();
    reco.continuous = true;
    reco.interimResults = true;
    const langMap: Record<string, string> = {
      'English': 'en-US', 'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Spanish': 'es-ES', 'French': 'fr-FR'
    };
    reco.lang = langMap[voiceLanguage] || 'en-US';

    reco.onresult = (event: any) => {
      let currentTranscript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      
      const normalized = currentTranscript.toLowerCase().trim();
      if (!normalized) return;

      // WAKE WORD DETECTION (Monitor both interim and final results for faster response)
      if (statusRef.current === 'sleeping') {
        const wakeWords = ['hey chat', 'hi chat', 'hello chat', 'ay chat', 'oye chat', 'హే చాట్', 'हे चैट'];
        if (wakeWords.some(w => normalized.includes(w))) {
          console.log('[Voice] Wake word detected:', normalized);
          setStatus('listening');
          statusRef.current = 'listening';
          
          if (accessibilityMode === 'Blind') {
            const msg = new SpeechSynthesisUtterance("How can I help you?");
            msg.lang = langMap[voiceLanguage] || 'en-US';
            window.speechSynthesis.speak(msg);
          }

          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            resetToSleep();
          }, 10000);

          // If this was a final segment and contains a command, process it immediately
          if (isFinal) {
            executeCommand(normalized);
          }
        }
      } else if (statusRef.current === 'listening' && isFinal) {
        executeCommand(normalized);
      }
    };

    reco.onend = () => {
      // Auto-restart for continuous listening with safety delay
      setTimeout(() => {
        try { 
          recognitionRef.current.start(); 
        } catch (e) {
          // Usually means already started
        }
      }, 300);
    };

    reco.start();
    recognitionRef.current = reco;

    return () => {
      reco.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [voiceLanguage, accessibilityMode, executeCommand, resetToSleep]);

  if (!isSupported || accessibilityMode === 'Dumb') return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[100] pointer-events-none">
      {status === 'listening' && (
        <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce shadow-primary/50 pointer-events-auto">
          <div className="flex gap-1">
            <span className="w-1 h-4 bg-white rounded-full animate-pulse"></span>
            <span className="w-1 h-6 bg-white rounded-full animate-pulse delay-75"></span>
            <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-150"></span>
          </div>
          <span className="font-medium text-sm text-white">Hey Chat: Active</span>
        </div>
      )}
      
      <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-white/80 backdrop-blur-sm border border-gray-200 transition-opacity duration-500 ${status === 'listening' ? 'opacity-0' : 'opacity-100 shadow-sm'}`}>
        Say "Hey Chat"
      </div>
    </div>
  );
};

export default VoiceControl;
