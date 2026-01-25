import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import type { ChatMessage } from '../types';
import { aiAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { 
  Plus, 
  Send, 
  Mic, 
  Trash2, 
  History, 
  PanelLeftClose, 
  PanelLeftOpen,
  Image as ImageIcon,
  FileText,
  Youtube,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';

const CHAT_SESSIONS_KEY = 'ai_chat_sessions';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
}

const AITutor = () => {
  const { settings, t } = useSettings();
  const location = useLocation();
  const { enabled, answerStyle, showChatHistory } = settings.aiTutor;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Speech Recognition Setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      
      // Auto-send when speech is final
      if (event.results[event.results.length - 1].isFinal) {
        setIsRecording(false);
        // Small delay to show the transcribed text before sending
        setTimeout(() => {
          if (transcript.trim()) {
            handleSend(transcript.trim());
          }
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
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

  // Load chat history from localStorage
  useEffect(() => {
    if (showChatHistory) {
      try {
        // Load sessions
        const storedSessions = window.localStorage.getItem(CHAT_SESSIONS_KEY);
        if (storedSessions) {
          const parsed = JSON.parse(storedSessions) as ChatSession[];
          const sessionsWithDates = parsed.map(s => ({
            ...s,
            timestamp: new Date(s.timestamp),
            messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
          }));
          setChatSessions(sessionsWithDates);
          
          // Load the most recent session
          if (sessionsWithDates.length > 0) {
            const latest = sessionsWithDates[0];
            setCurrentSessionId(latest.id);
            setMessages(latest.messages);
            return;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    // Create new session with initial greeting
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
  }, [showChatHistory, t.aiTutor.greeting]);

  // Save chat history to localStorage
  useEffect(() => {
    if (showChatHistory && messages.length > 0 && currentSessionId) {
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

        // Update or add current session
        setChatSessions(prev => {
          const filtered = prev.filter(s => s.id !== currentSessionId);
          const updated = [currentSession, ...filtered].slice(0, 50); // Keep max 50 sessions
          window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updated));
          return updated;
        });
      } catch {
        // Ignore storage errors
      }
    }
  }, [messages, showChatHistory, currentSessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const isLowPower = document.documentElement.classList.contains('low-power');
    messagesEndRef.current?.scrollIntoView({ behavior: isLowPower ? 'auto' : 'smooth' });
  }, [messages]);

  // Handle voice query from navigation
  useEffect(() => {
    if (location.state?.voiceQuery) {
      handleSend(location.state.voiceQuery);
      // Clean up state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSend = async (forcedQuery?: string) => {
    if (!enabled) return;
    
    const queryToUse = forcedQuery || input;

    // Allow sending if there's either text input OR an active file context
    if (!queryToUse.trim() && !fileContext) return;

    // Use default summary request if input is empty but context exists
    const activeInput = queryToUse.trim() || (fileContext ? "Please summarize and explain this context for me." : "");
    if (!activeInput) return;

    if (!navigator.onLine) {
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
       * 
       * ANSWER STYLE: We pass the user's preference (Short vs Detailed).
       * LANGUAGE SYNC: We include the current website language in all AI requests.
       */
      const response = await aiAPI.ask(
        activeInput, 
        'regular', 
        currentContext, 
        true, 
        settings.learning.language,
        answerStyle
      );
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer || response.response || response.explanation || response.summary || t.aiTutor.errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // BLIND MODE: Auto-speak assistant response
      if (accessibilityMode === 'Blind') {
        const speech = new SpeechSynthesisUtterance(assistantMessage.content);
        const langMap: Record<string, string> = {
          'English': 'en-US', 'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Spanish': 'es-ES', 'French': 'fr-FR'
        };
        speech.lang = langMap[settings.learning.language] || 'en-US';
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
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlusMenuOpen(false);

    if (!navigator.onLine) {
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

    if (!navigator.onLine) {
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
      <div className="min-h-screen bg-app-bg-alt py-12 px-4 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-xl w-full">
          <Card className="p-12 text-center border-2 border-app-border bg-app-bg shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary to-secondary" />
            <div className="w-24 h-24 bg-app-bg-alt rounded-3xl flex items-center justify-center mx-auto mb-8 text-app-text-muted group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={48} className="opacity-20" />
            </div>
            <h1 className="text-3xl font-black text-app-text-main mb-4 tracking-tight">
              {t.aiTutor.disabled}
            </h1>
            <p className="text-app-text-sub mb-10 font-medium leading-relaxed">
              {t.aiTutor.disabledMessage}
            </p>
            <Link to="/settings" className="block">
              <Button variant="primary" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/25">
                Go to Settings
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4 transition-colors duration-300">
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
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <History size={18} />
                  </div>
                  <h2 className="text-xl font-black text-app-text-main tracking-tight">History</h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-app-bg-alt rounded-xl text-app-text-muted transition-colors lg:block hidden"
                >
                  <PanelLeftClose size={20} />
                </button>
              </div>

              <button
                onClick={createNewChat}
                className="w-full mb-8 px-6 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/25"
              >
                <Plus size={18} />
                New Conversation
              </button>

              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-12 px-4 flex flex-col items-center gap-4 border-2 border-dashed border-app-border rounded-2xl">
                    <MessageSquare size={32} className="text-app-text-muted/30" />
                    <p className="text-sm font-bold text-app-text-muted">No conversations yet</p>
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`
                        group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border
                        ${session.id === currentSessionId
                          ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                          : 'bg-app-bg-alt border-transparent hover:border-app-border shadow-sm'
                        }
                      `}
                      onClick={() => loadSession(session)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-black truncate ${session.id === currentSessionId ? 'text-primary' : 'text-app-text-main'}`}>
                            {session.title}
                          </p>
                          <p className="text-[10px] font-bold text-app-text-muted mt-1 uppercase tracking-widest">
                            {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this conversation?')) {
                              deleteSession(session.id);
                            }
                          }}
                          className={`${session.id === currentSessionId ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-all`}
                        >
                          <Trash2 size={14} />
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
                    <PanelLeftOpen size={20} />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-black text-app-text-main tracking-tight leading-none">
                      {t.aiTutor.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">
                        AI Model Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-app-bg-alt rounded-lg border border-app-border">
                <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">
                  Style:
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {answerStyle}
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
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
                          ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20 font-medium' 
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
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
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
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
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
                <div className="mb-4 p-3 bg-primary/5 rounded-2xl flex items-center justify-between border border-primary/10 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      {fileContext.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Context</p>
                      <p className="text-xs font-bold text-app-text-main truncate max-w-50">{fileContext.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFileContext(null)}
                    className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                  >
                    <X size={16} />
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
                      ${plusMenuOpen ? 'bg-primary text-white rotate-45' : 'bg-app-bg-alt text-app-text-muted hover:text-primary border border-app-border'}
                    `}
                  >
                    <Plus size={20} />
                  </button>

                  {plusMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-4 w-56 bg-app-bg rounded-2xl shadow-2xl border border-app-border py-3 z-50 animate-in fade-in slide-in-from-bottom-4">
                      <button
                        onClick={() => { fileInputRef.current?.click(); setPlusMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-app-text-main hover:bg-app-bg-alt flex items-center gap-3 transition-colors"
                      >
                        <ImageIcon size={18} className="text-primary" />
                        Analyze Image
                      </button>
                      <button
                        onClick={() => { pdfInputRef.current?.click(); setPlusMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-app-text-main hover:bg-app-bg-alt flex items-center gap-3 transition-colors"
                      >
                        <FileText size={18} className="text-red-500" />
                        Read PDF Document
                      </button>
                      <div className="h-px bg-app-border mx-3 my-2" />
                      <button
                        className="w-full text-left px-4 py-3 text-sm font-bold text-app-text-main hover:bg-app-bg-alt flex items-center gap-3 transition-colors opacity-50 cursor-not-allowed"
                      >
                        <Youtube size={18} className="text-red-600" />
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
                    className="w-full bg-app-bg-alt border border-app-border rounded-2xl py-3.5 pl-4 pr-12 text-app-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none max-h-32 min-h-13 custom-scrollbar"
                    rows={1}
                  />
                  
                  {/* Voice Button */}
                  <button
                    onClick={startVoiceInput}
                    className={`
                      absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-300
                      ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : 'text-app-text-muted hover:text-primary'}
                    `}
                  >
                    <Mic size={18} />
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
                      : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-primary/25'
                    }
                  `}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
