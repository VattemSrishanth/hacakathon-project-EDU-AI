import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, AlertCircle, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import Button from '../Button';






/**
 * Capability detection helper
 */
export const checkSpeechRecognitionSupport = () => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

const SpeechAssist = ({
  onTranscript,
  placeholder = "Type or speak your message..."
}) => {
  const { speechAssistEnabled } = useAccessibility();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize recognition
  useEffect(() => {
    const supported = checkSpeechRecognitionSupport();
    setIsSupported(supported);

    if (supported && !recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied.');
        } else {
          setError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition', err);
        setIsListening(false);
      }
    }
  }, [isListening, isSupported]);

  const handleSend = () => {
    if (transcript.trim() && onTranscript) {
      onTranscript(transcript);
      setTranscript('');
    }
  };

  // If speech assist is globally disabled, we just show a standard text input
  if (!speechAssistEnabled) {
    return (
      <div className="flex gap-2 w-full max-w-2xl mx-auto">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-app-bg border-4 border-app-border rounded-2xl px-6 py-4 font-bold text-app-text-main shadow-inner focus:border-primary/50 outline-none transition-all" />
        
        <Button onClick={handleSend} variant="primary" className="px-8 rounded-2xl">
          <Send size={20} />
        </Button>
      </div>);

  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Capability Feedback */}
      {!isSupported &&
      <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-xs font-black uppercase tracking-widest">
            Speech-to-text not supported in this browser. Falling back to text mode.
          </p>
        </div>
      }

      {error &&
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 animate-in shake duration-300">
          <AlertCircle size={20} />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      }

      <div className="relative group">
        <div className={`absolute inset-0 rounded-[2.5rem] transition-all duration-500 ${
        isListening ? 'bg-primary/10 blur-xl scale-105' : 'bg-transparent'}`
        } />
        
        <div className={`relative flex items-center gap-3 p-3 bg-app-bg-alt border-4 rounded-[2.5rem] transition-all ${
        isListening ? 'border-primary shadow-2xl scale-[1.02]' : 'border-app-border hover:border-app-border/80 shadow-lg'}`
        }>
          <div className="flex-1 px-4">
            <textarea
              rows={1}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={isListening ? "Listening..." : placeholder}
              className="w-full bg-transparent border-none resize-none font-bold text-app-text-main placeholder:text-app-text-muted outline-none py-2 max-h-32 overflow-y-auto"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }} />
            
          </div>

          <div className="flex items-center gap-2 pr-2">
            {isSupported &&
            <button
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isListening ?
              'bg-red-500 text-white shadow-lg shadow-red-500/30' :
              'bg-app-bg border-4 border-app-border text-app-text-muted hover:text-primary hover:border-primary/30 shadow-md'}`
              }
              title={isListening ? "Stop listening" : "Start voice assist"}>
              
                {isListening ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />}
              </button>
            }

            <button
              onClick={handleSend}
              disabled={!transcript.trim()}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              transcript.trim() ?
              'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95' :
              'bg-app-bg border-4 border-app-border text-app-text-muted opacity-40 cursor-not-allowed'}`
              }>
              
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-app-bg-alt rounded-full border border-app-border">
          <MessageSquare size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-app-text-sub">
            MVP Mode: Speech-to-Text via Web Speech API
          </span>
        </div>
      </div>
    </div>);

};

export default SpeechAssist;