import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

/**
 * GLOBAL VOICE CONTROL SYSTEM
 * Uses Browser Speech Recognition API to allow hands-free navigation.
 */

// Handle vendor prefixes for SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const VoiceControl: React.FC = () => {
  const navigate = useNavigate();
  const { t, settings } = useSettings();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const reco = new SpeechRecognition();
    reco.continuous = false;
    reco.interimResults = false;
    
    // Set language based on user settings
    const langMap: Record<string, string> = {
      'English': 'en-US',
      'Hindi': 'hi-IN',
      'Telugu': 'te-IN',
      'Spanish': 'es-ES',
      'French': 'fr-FR'
    };
    
    reco.lang = langMap[settings.themeAccessibility.voiceLanguage] || 'en-US';

    reco.onstart = () => {
      setIsListening(true);
      setStatusMessage(null);
    };

    reco.onend = () => {
      setIsListening(false);
    };

    reco.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setStatusMessage('Microphone access denied');
      }
    };

    reco.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      handleCommand(command);
    };

    setRecognition(reco);
  }, [settings.themeAccessibility.voiceLanguage]);

  const handleCommand = useCallback((command: string) => {
    console.log('Voice Command Received:', command);
    
    // Navigation logic (Supports English, Telugu, Hindi and more)
    // Uses broad matching to handle minor pronunciation variations and accent differences
    const matches = (keywords: string[]) => keywords.some(k => command.includes(k.toLowerCase()));

    if (matches(['home', 'mukhy', 'mukhya', 'inicio', 'accueil', 'hoam', 'ముఖ్య', 'హోమ్', 'ముఖపుట'])) {
      navigate('/');
    } else if (matches(['dashboard', 'dashbord', 'desbord', 'tablero', 'tableau', 'డాష్బోర్డ్', 'डैशबोर्ड'])) {
      navigate('/dashboard');
    } else if (matches(['lesson', 'paath', 'lecciones', 'leçons', 'lesan', 'పాఠాలు', 'లెసన్స్', 'सबक', 'पाठ'])) {
      navigate('/lessons');
    } else if (matches(['tutor', 'sikshak', 'shikshak', 'ayudante', 'tuteur', 'శిక్షకుడు', 'शिक्षक'])) {
      navigate('/ai-tutor');
    } else if (matches(['settings', 'seting', 'vshisht', 'ajuste', 'paramètre', 'సెట్టింగులు', 'सेटिंग', 'అమరికలు', 'विकल्प'])) {
      navigate('/settings');
    } else if (matches(['back', 'pichhe', 'peeche', 'venukku', 'atrás', 'retour', 'వెనుకకు', 'पीछे'])) {
      navigate(-1);
    } else {
      setStatusMessage(t.voiceControl.unrecognized);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }, [navigate, t.voiceControl.unrecognized]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        // Recognition might already be starting
      }
    }
  };

  if (!isSupported) {
    return (
      <button 
        disabled 
        title={t.voiceControl.notSupported}
        className="fixed bottom-6 right-6 p-4 bg-gray-300 text-gray-500 rounded-full shadow-lg cursor-not-allowed z-[100]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[100]">
      {statusMessage && (
        <div className="bg-gray-800 text-white text-xs py-1 px-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {statusMessage}
        </div>
      )}
      
      <button
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-lg transition-all active:scale-95 ${
          isListening 
            ? 'bg-red-500 text-white ring-4 ring-red-200' 
            : 'bg-primary text-white hover:bg-indigo-700'
        }`}
        title={isListening ? t.voiceControl.listening : t.voiceControl.start}
      >
        {isListening ? (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceControl;
