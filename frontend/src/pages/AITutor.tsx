import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import type { AccessibilityMode } from '../context/SettingsContext';
import type { SupportedLanguage } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { aiAPI, userDataAPI } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import type { ChatMessage } from '../types';
import { 
  Plus, 
  Mic, 
  Trash2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ImagePlus,
  FileText,
  Youtube,
  MessageSquare,
  Zap,
  X,
  Send,
} from 'lucide-react';

// Extend Window interface to include SpeechRecognition properties
interface SpeechRecognitionResult {
  [index: number]: {
    transcript: string;
    confidence: number;
  };
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
    };
  }
}

const CHAT_SESSIONS_KEY = 'ai_chat_sessions';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
}

// Themed delete confirmation modal centered on the viewport.
const DeleteConfirmModal = ({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm bg-app-bg border border-app-border rounded-2xl shadow-2xl p-6 space-y-4 text-app-text-main"
      >
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold text-app-text-muted">Delete this conversation?</p>
          {title && <p className="text-base font-black truncate" title={title}>{title}</p>}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-app-bg-alt text-app-text-main font-bold border border-app-border hover:bg-app-border transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AITutor = () => {
  const { settings, t, updateLearning, updateThemeAccessibility, updateAiTutor } = useSettings();
  const { auth } = useAuth();
  const { isOffline } = useOffline();
  const navigate = useNavigate();
  const location = useLocation();
  const { enabled, answerStyle } = settings.aiTutor;
  const { accessibilityMode } = settings.themeAccessibility;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fileContext, setFileContext] = useState<{
    type: 'image' | 'pdf' | 'youtube' | null;
    data: string;
    name?: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const hasInteractedRef = useRef(false);
  const lastProcessedVoiceQueryRef = useRef<string | null>(null);
  const lastLocalTranscriptRef = useRef<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isSpeakingRef = useRef(false);

  // Speech Recognition Setup
  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

  // Always enter the page scrolled to the top, even if coming from a scrolled view.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const handleSend = useCallback(async (forcedQuery?: string) => {
    if (!enabled) return;
    // Enable auto-scroll after the first user-triggered action.
    hasInteractedRef.current = true;
    
    const queryToUse = forcedQuery || input;

    // Allow sending if there's either text input OR an active file context
    if (!queryToUse.trim() && !fileContext) return;

    // Use default summary request if input is empty but context exists
    const activeInput = queryToUse.trim() || (fileContext ? "Please summarize and explain this context for me." : "");
    if (!activeInput) return;

    if (isOffline) {
      const offlineMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I am sorry, but I need an internet connection to process your request. Please reconnect and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, {
        id: (Date.now() - 1).toString(),
        role: 'user',
        content: activeInput,
        timestamp: new Date(),
        imageUrl: fileContext?.type === 'image' ? fileContext.data : undefined,
        attachmentType: fileContext?.type ?? undefined,
        attachmentTitle: fileContext?.name,
      }, offlineMsg]);
      setInput('');
      // Keep file context for retry/follow-up even in offline mode
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: activeInput,
      timestamp: new Date(),
      imageUrl: fileContext?.type === 'image' ? fileContext.data : undefined,
      attachmentType: fileContext?.type ?? undefined,
      attachmentTitle: fileContext?.name,
    };

    // Save current file context for the request
    const currentContext = fileContext;

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    // We KEEP the fileContext active so it's sent along with follow-up questions.
    // The user can manually clear it using the 'X' button in the UI.
    setLoading(true);

    try {
      /**
       * Send unified request to backend.
       */
      const response = await aiAPI.ask(
        activeInput, 
        'regular', 
        currentContext, 
        true, 
        settings.learning.language,
        answerStyle
      );
      
      let aiContent = response.answer || response.response || response.explanation || response.summary || t.aiTutor.errorMessage;
      
      // Intent Checking Logic
      try {
        interface AiParsedResponse {
          action?: { command: string; value: unknown };
          command?: string;
          value?: unknown;
          explanation?: string;
          answer?: string;
        }
        let parsed: AiParsedResponse | null = null;
        
        // Handle if backend returned a direct object
        if (typeof aiContent === 'object' && aiContent !== null) {
            parsed = aiContent as AiParsedResponse;
        } 
        // Handle if backend returned a JSON string
        else if (typeof aiContent === 'string' && (aiContent.trim().startsWith('{') || aiContent.includes('"command":'))) {
             const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
                 parsed = JSON.parse(jsonMatch[0]);
             }
        }

        if (parsed) {
             // Handle Action (can be in 'action' field or top level if raw command)
             const cmd = parsed.action || (parsed.command ? parsed : null);
             
             if (cmd && cmd.command) {
                 console.log("Executing AI Command:", cmd);
                 
                 if (cmd.command === 'NAVIGATE') {
                    navigate(cmd.value as string);
                 } else if (cmd.command === 'SET_ACCESSIBILITY') {
                    updateThemeAccessibility({ accessibilityMode: cmd.value as AccessibilityMode });
                 } else if (cmd.command === 'SET_LANGUAGE') {
                    // Update both app UI language and voice language for consistency
                    updateLearning({ language: cmd.value as SupportedLanguage });
                    updateThemeAccessibility({ voiceLanguage: cmd.value as SupportedLanguage });
                 } else if (cmd.command === 'SET_THEME') {
                     const themeVal = String(cmd.value).toLowerCase();
                     if (themeVal.includes('maroon') || themeVal.includes('dark')) updateThemeAccessibility({ theme: 'Academic Maroon' });
                     else if (themeVal.includes('amber') || themeVal.includes('sunset')) updateThemeAccessibility({ theme: 'Sunrise Amber' });
                     else if (themeVal.includes('white') || themeVal.includes('light')) updateThemeAccessibility({ theme: 'Institutional White' });
                     
                     if (themeVal.includes('low') || themeVal.includes('power')) updateThemeAccessibility({ lowPowerMode: true });
                     if (themeVal.includes('high') || themeVal.includes('contrast')) updateThemeAccessibility({ highContrast: true });
                 }
             }
             
      // Update text to show clean explanation from JSON
      if (parsed.explanation) {
          aiContent = parsed.explanation;
      } else if (parsed.answer && typeof parsed.answer === 'string') {
          aiContent = parsed.answer;
      } else if (typeof aiContent === 'object') {
          // Fallback if it's still an object and we have no explanation field
          aiContent = "Action performed successfully.";
      }
    }
  } catch (e) {
      console.log("Not a command JSON or error parsing", e);
  }

  // Increment questions asked count in progress
  if (auth?.user?.id) {
    try {
      const progRes = await userDataAPI.getProgress(String(auth.user.id));
      if (progRes.success) {
        const currentProg = progRes.progress;
        const updatedActivities = [
          { type: 'ai' as const, text: `Asked AI: ${activeInput.slice(0, 30)}...`, timestamp: new Date().toISOString() },
          ...(currentProg.activities || [])
        ].slice(0, 20);

        await userDataAPI.updateProgress(String(auth.user.id), {
          ...currentProg,
          questionsAsked: (currentProg.questionsAsked || 0) + 1,
          activities: updatedActivities,
          lastActivity: new Date().toISOString().split('T')[0]
        });
      }
    } catch (e) {
      console.error('Failed to update questions count', e);
    }
  }

  const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: String(aiContent), // Ensure it's a string for rendering
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // BLIND MODE ONLY - Auto-speak responses
      if (accessibilityMode === 'Blind' && !isSpeakingRef.current) {
        isSpeakingRef.current = true;
        const speech = new SpeechSynthesisUtterance(assistantMessage.content);
        const langMap: Record<string, string> = {
          'English': 'en-US', 'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Spanish': 'es-ES', 'French': 'fr-FR'
        };
        speech.lang = langMap[settings.learning.language] || 'en-US';
        speech.onend = () => { isSpeakingRef.current = false; };
        speech.onerror = () => { isSpeakingRef.current = false; };
        window.speechSynthesis.speak(speech);
      }
    } catch (error) {
      console.error("AI Send Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t.aiTutor.errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [enabled, input, fileContext, isOffline, accessibilityMode, settings.learning.language, answerStyle, t.aiTutor.errorMessage, navigate, updateThemeAccessibility, updateLearning, auth?.user?.id]);

  const startVoiceInput = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    const langMap: Record<string, string> = {
      'English': 'en-US', 'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Spanish': 'es-ES', 'French': 'fr-FR'
    };
    recognition.lang = langMap[settings.learning.language] || 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      
      // Auto-send when speech is final
      if (event.results[event.results.length - 1].isFinal) {
        const finalTranscript = transcript.trim();
        if (!finalTranscript || finalTranscript === lastLocalTranscriptRef.current) return;
        lastLocalTranscriptRef.current = finalTranscript;

        setIsRecording(false);
        recognition.stop();

        // Small delay to show the transcribed text before sending
        setTimeout(() => {
          handleSend(finalTranscript);
          // Clear the ref after a delay so the user can say the same thing again later
          setTimeout(() => { lastLocalTranscriptRef.current = ""; }, 2000);
        }, 300);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'no-speech') {
        // Silent failure for no speech detected
      } else if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone access to use voice input.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Load chat history from MongoDB
  useEffect(() => {
    const loadHistory = async () => {
      if (!auth?.user?.id) return;
      try {
        const data = await userDataAPI.getChatHistory(String(auth.user.id));
        if (data.success && data.history.length > 0) {
          const sessions: ChatSession[] = data.history.map((h: { id: string; messages: ChatMessage[]; created_at: string }) => ({
            id: h.id,
            title: h.messages?.[1]?.content.substring(0, 30) + '...' || 'AI Conversation',
            messages: h.messages,
            timestamp: new Date(h.created_at)
          }));
          setChatSessions(sessions);
          if (sessions.length > 0) {
            setCurrentSessionId(sessions[0].id);
            setMessages(sessions[0].messages);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load history', err);
      }

      // Fallback: Create new session if none found
      const newSessionId = Date.now().toString();
      setCurrentSessionId(newSessionId);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: t.aiTutor.greeting,
          timestamp: new Date(),
        },
      ]);
    };
    
    loadHistory();
  }, [auth, t.aiTutor.greeting]);

  // Save chat history to MongoDB
  useEffect(() => {
    const hasUserMessage = messages.some(m => m.role === 'user');
    if (messages.length > 0 && currentSessionId && hasUserMessage && auth?.user?.id) {
      const syncChat = async () => {
        try {
          // Generate session title from first user message
          const firstUserMsg = messages.find(m => m.role === 'user');
          const title = firstUserMsg 
            ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')
            : 'New Chat';

          const currentSession: ChatSession = {
            id: currentSessionId,
            title,
            messages,
            timestamp: new Date(),
          };

          // Update local state first for responsiveness
          setChatSessions(prev => {
            const filtered = prev.filter(s => s.id !== currentSessionId);
            return [currentSession, ...filtered].slice(0, 50);
          });

          // Sync to DB
          if (auth?.user?.id) {
            await userDataAPI.saveChatHistory(String(auth.user.id), messages);
          }
        } catch (e) {
          console.error('DB Sync Error', e);
        }
      };
      
      const timer = setTimeout(syncChat, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages, currentSessionId, auth]);

  // Scroll to bottom on new messages
  useEffect(() => {
    // Avoid auto-scrolling on first load; only scroll after user has interacted.
    if (!hasInteractedRef.current) return;
    const isLowPower = document.documentElement.classList.contains('low-power');
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: isLowPower ? 'auto' : 'smooth' });
    }
  }, [messages]);

  // Handle voice query from navigation
  useEffect(() => {
    const voiceQuery = location.state?.voiceQuery;
    if (voiceQuery && voiceQuery !== lastProcessedVoiceQueryRef.current) {
      lastProcessedVoiceQueryRef.current = voiceQuery;
      handleSend(voiceQuery);
      
      // Clear voiceQuery to avoid double-processing on re-renders or navigation
      navigate(location.pathname, { 
        replace: true, 
        state: { ...location.state, voiceQuery: null } 
      });
    }
  }, [location.state, location.pathname, navigate, handleSend]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlusMenuOpen(false);

    if (isOffline) {
      const offlineMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, but analyzing images requires an active internet connection. Please connect to the internet and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, offlineMsg]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFileContext({ type: 'image', data: base64, name: file.name });
    };
    reader.onerror = () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I couldn't read the image file. Please try again.",
        timestamp: new Date(),
      }]);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlusMenuOpen(false);

    if (isOffline) {
      const offlineMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, but analyzing documents requires an active internet connection. Please connect to the internet and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, offlineMsg]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string; 
      setFileContext({ type: 'pdf', data: base64, name: file.name });
    };
    reader.onerror = () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I couldn't read the PDF file. Please try again with a different document.",
        timestamp: new Date(),
      }]);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const createNewChat = () => {
    hasInteractedRef.current = true;
    const newSessionId = Date.now().toString();
    setCurrentSessionId(newSessionId);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: t.aiTutor.greeting,
        timestamp: new Date(),
      },
    ]);
    setFileContext(null);
    setPlusMenuOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    hasInteractedRef.current = true;
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setFileContext(null);
  };

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filtered));
      return filtered;
    });
    
    // If deleted current session, create new one
    if (sessionId === currentSessionId) {
      createNewChat();
    }
  };

  // If AI Tutor is disabled, show a message
  if (!enabled) {
    return (
      <div className="min-h-screen bg-app-bg py-12 px-4 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-xl w-full">
          <Card className="p-12 text-center border-2 border-app-border bg-app-bg shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-ai-accent to-secondary" />
            <div className="w-24 h-24 bg-app-bg rounded-3xl flex items-center justify-center mx-auto mb-8 text-app-text-muted group-hover:scale-110 transition-transform duration-500">
              <Zap size={48} className="text-ai-accent" />
            </div>
            <h1 className="text-3xl font-black text-app-text-main mb-4 tracking-tight">
              {t.aiTutor.disabled}
            </h1>
            <p className="text-app-text-sub mb-10 font-medium leading-relaxed">
              {t.aiTutor.disabledMessage}
            </p>
            <Link to="/settings" className="block">
              <Button variant="ai-accent" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-ai-accent/25">
                Go to Settings
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 transition-colors duration-300">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={pdfInputRef}
        onChange={handlePdfUpload}
        accept="application/pdf"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 h-187.5 max-h-[85vh]">
          
          {/* Sidebar - Chat History */}
          <div 
            className={`
              ${sidebarOpen ? 'w-full lg:w-80' : 'w-0'} 
              transition-all duration-300 overflow-hidden shrink-0 flex flex-col
              bg-app-bg rounded-3xl border border-app-border shadow-xl
            `}
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-ai-accent/10 flex items-center justify-center">
                    <Clock size={20} className="text-ai-accent" />
                  </div>
                  <h2 className="text-xl font-black text-app-text-main tracking-tight">History</h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-app-bg-alt rounded-xl text-app-text-muted transition-colors lg:block hidden"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <button
                onClick={createNewChat}
                className="w-full mb-8 px-6 py-4 bg-ai-accent text-white rounded-2xl hover:bg-ai-accent/90 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-lg shadow-ai-accent/25"
              >
                <Plus size={20} />
                New Conversation
              </button>

              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-12 px-4 flex flex-col items-center gap-4 border-2 border-dashed border-app-border rounded-2xl">
                    <MessageSquare size={32} className="text-app-text-muted" />
                    <p className="text-sm font-bold text-app-text-muted">No conversations yet</p>
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`
                        group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border
                        ${session.id === currentSessionId
                          ? 'bg-ai-accent/5 border-ai-accent/20 ring-1 ring-ai-accent/10'
                          : 'bg-app-bg-alt border-transparent hover:border-app-border shadow-sm'
                        }
                      `}
                      onClick={() => loadSession(session)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-black truncate ${session.id === currentSessionId ? 'text-ai-accent' : 'text-app-text-main'}`}>
                            {session.title}
                          </p>
                          <p className="text-[10px] font-bold text-app-text-muted mt-1 uppercase tracking-widest">
                            {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDelete({ id: session.id, title: session.title });
                          }}
                          className={`${session.id === currentSessionId ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-all`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-app-bg rounded-3xl border border-app-border shadow-xl overflow-hidden relative">
            
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-app-border flex items-center justify-between bg-app-bg z-10 sticky top-0 backdrop-blur-md bg-opacity-80">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 bg-app-bg-alt rounded-xl hover:bg-app-border transition-colors text-app-text-muted"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-ai-accent to-secondary flex items-center justify-center text-white shadow-lg">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-black text-app-text-main tracking-tight leading-none">
                      {t.aiTutor.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">

                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">
                        AI Model Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Style Selector */}
              <div className="flex items-center gap-1 p-1 bg-app-bg-alt rounded-xl border border-app-border shadow-inner">
                <button
                  onClick={() => updateAiTutor({ answerStyle: 'Short' })}
                  className={`px-2.5 py-1.5 text-[9px] md:text-[10px] font-black rounded-lg transition-all duration-200 uppercase tracking-widest ${
                    answerStyle === 'Short'
                      ? 'bg-ai-accent text-white shadow-lg scale-105'
                      : 'text-app-text-muted hover:bg-app-border/50'
                  }`}
                >
                  Short
                </button>
                <button
                  onClick={() => updateAiTutor({ answerStyle: 'Detailed' })}
                  className={`px-2.5 py-1.5 text-[9px] md:text-[10px] font-black rounded-lg transition-all duration-200 uppercase tracking-widest ${
                    answerStyle === 'Detailed'
                      ? 'bg-ai-accent text-white shadow-lg scale-105'
                      : 'text-app-text-muted hover:bg-app-border/50'
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                    <div
                      className={`
                        px-6 py-4 rounded-3xl whitespace-pre-wrap text-sm md:text-base leading-relaxed relative
                        ${message.role === 'user' 
                          ? 'bg-ai-accent text-white rounded-br-none shadow-lg shadow-ai-accent/20 font-medium' 
                          : 'bg-app-bg-alt text-app-text-main rounded-bl-none border border-app-border'
                        }
                      `}
                    >
                      {message.imageUrl && (
                        <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                          <img src={message.imageUrl} alt="Context" className="w-full h-auto object-cover" />
                        </div>
                      )}
                      {message.attachmentType === 'pdf' && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-black/10 rounded-2xl border border-white/5">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <FileText size={18} />
                          </div>
                          <span className="text-xs font-black truncate">{message.attachmentTitle}</span>
                        </div>
                      )}
                      {message.attachmentType === 'youtube' && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-black/10 rounded-2xl border border-white/5">
                          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white">
                            <Youtube size={18} />
                          </div>
                          <span className="text-xs font-black truncate">YouTube: {message.attachmentTitle}</span>
                        </div>
                      )}
                      {message.content}
                    </div>
                    <span className="text-[10px] font-bold text-app-text-muted mt-2 uppercase tracking-widest px-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-app-bg-alt border border-app-border rounded-3xl rounded-bl-none p-4 flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-ai-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-ai-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-ai-accent rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs font-black text-app-text-muted uppercase tracking-widest">Studying Context...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="p-4 md:p-6 bg-app-bg border-t border-app-border">
              {/* File Context Indicator */}
              {fileContext && (
                <div className="mb-4 p-3 bg-ai-accent/10 rounded-2xl flex items-center justify-between border border-ai-accent/20 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-ai-accent/20 flex items-center justify-center text-ai-accent">
                      {fileContext.type === 'image' ? <ImagePlus size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-ai-accent uppercase tracking-widest">Active Context</p>
                      <p className="text-xs font-bold text-app-text-main truncate max-w-50">{fileContext.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFileContext(null)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-ai-accent transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              <div className="flex items-end gap-3 relative">
                {/* Plus Menu */}
                <div className="relative">
                  <button
                    onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                    className={`
                      p-3.5 rounded-2xl transition-all duration-300
                      ${plusMenuOpen ? 'bg-ai-accent text-white rotate-45' : 'bg-app-bg-alt text-app-text-muted hover:text-ai-accent border border-app-border'}
                    `}
                  >
                    <Plus size={24} />
                  </button>

                  {plusMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-4 w-56 bg-app-bg rounded-2xl shadow-2xl border border-app-border py-3 z-50 animate-in fade-in slide-in-from-bottom-4">
                      <button
                        onClick={() => { fileInputRef.current?.click(); setPlusMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-app-text-main hover:bg-app-bg-alt flex items-center gap-3 transition-colors"
                      >
                        <ImagePlus size={20} className="text-ai-accent" />
                        Analyze Image
                      </button>
                      <button
                        onClick={() => { pdfInputRef.current?.click(); setPlusMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-app-text-main hover:bg-app-bg-alt flex items-center gap-3 transition-colors"
                      >
                        <FileText size={20} className="text-ai-accent" />
                        Read PDF Document
                      </button>
                      <div className="h-px bg-app-border mx-3 my-2" />
                      <button
                        className="w-full text-left px-4 py-3 text-sm font-bold text-app-text-main hover:bg-app-bg-alt flex items-center gap-3 transition-colors opacity-50 cursor-not-allowed"
                      >
                        <Youtube size={20} className="text-ai-accent" />
                        Video Analysis
                      </button>
                    </div>
                  )}
                </div>

                {/* Textarea */}
                <div className="flex-1 relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask LearnBridge AI..."
                    className="w-full bg-app-bg-alt border border-app-border rounded-2xl py-3.5 pl-4 pr-12 text-app-text-main font-medium focus:outline-none focus:ring-2 focus:ring-ai-accent/20 focus:border-ai-accent transition-all resize-none max-h-32 min-h-13 custom-scrollbar"
                    rows={1}
                  />
                  
                  {/* Voice Button */}
                  <button
                    onClick={startVoiceInput}
                    className={`
                      absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-300
                      ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : 'text-app-text-muted hover:text-ai-accent'}
                    `}
                  >
                    <Mic size={24} />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSend()}
                  disabled={loading || (!input.trim() && !fileContext)}
                  className={`
                    p-3.5 rounded-2xl transition-all duration-300 shadow-lg
                    ${loading || (!input.trim() && !fileContext)
                      ? 'bg-app-bg-alt text-app-text-muted border border-app-border cursor-not-allowed grayscale'
                      : 'bg-ai-accent text-white hover:scale-105 active:scale-95 shadow-ai-accent/25'
                    }
                  `}
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={!!pendingDelete}
        title={pendingDelete?.title}
        onConfirm={() => {
          if (pendingDelete) {
            deleteSession(pendingDelete.id);
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default AITutor;
