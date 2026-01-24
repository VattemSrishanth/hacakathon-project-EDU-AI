import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import type { ChatMessage } from '../types';
import { aiAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

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
      }, offlineMsg]);
      setInput('');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: activeInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
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
        fileContext, 
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
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Image uploaded.',
        imageUrl: base64,
        attachmentType: 'image',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "File uploaded. What would you like to do with this image?",
        timestamp: new Date(),
      }]);
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
      const text = (reader.result as string).slice(0, 5000); 
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: `PDF uploaded: ${file.name}`,
        attachmentType: 'pdf',
        attachmentTitle: file.name,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "File uploaded. What would you like to do with this document?",
        timestamp: new Date(),
      }]);
      setFileContext({ type: 'pdf', data: text, name: file.name });
    };
    reader.onerror = () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I couldn't read the PDF file. Please try again with a different document.",
        timestamp: new Date(),
      }]);
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleYoutubePrompt = async () => {
    setPlusMenuOpen(false);
    const url = prompt("Please enter a YouTube URL:");
    if (!url) return;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, but that YouTube URL appears to be invalid. Please provide a full link to a public video.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    if (!navigator.onLine) {
      const offlineMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, but video analysis requires an active internet connection. Please connect to the internet and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, offlineMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Analyze this video: ${url}`,
      attachmentType: 'youtube',
      attachmentTitle: url,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "Video linked. What would you like to know about this video?",
      timestamp: new Date(),
    }]);
    setFileContext({ type: 'youtube', data: url, name: 'YouTube Video' });
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t.aiTutor.title}</h1>
            <p className="text-gray-900 mt-2">{t.aiTutor.subtitle}</p>
          </div>

          <Card className="h-100 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.aiTutor.disabled}</h2>
              <p className="text-gray-700 mb-4">{t.aiTutor.disabledMessage}</p>
              <Link to="/settings">
                <Button variant="primary">{t.nav.settings}</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* History Sidebar */}
          <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Chat History</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
                  title="Close sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <button
                onClick={createNewChat}
                className="w-full mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Chat
              </button>

              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {chatSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No chat history yet</p>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                        session.id === currentSessionId
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                      onClick={() => loadSession(session)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(session.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this chat?')) {
                              deleteSession(session.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-opacity"
                          title="Delete chat"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="mb-4 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Show History
              </button>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t.aiTutor.title}</h1>
              <p className="text-gray-900 mt-2">{t.aiTutor.subtitle}</p>
              <div className="mt-2 text-sm text-gray-600">
                {t.settings.aiTutorSettings.answerStyle}: {answerStyle === 'Short' ? t.settings.aiTutorSettings.short : t.settings.aiTutorSettings.detailed}
              </div>
            </div>

        <Card className="h-150 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-wrap ${
                    message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.imageUrl && (
                    <img src={message.imageUrl} alt="Attached" className="max-w-full rounded mb-2 border border-white/20" />
                  )}
                  {message.attachmentType === 'pdf' && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <span className="text-xs font-medium truncate">{message.attachmentTitle}</span>
                    </div>
                  )}
                  {message.attachmentType === 'youtube' && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                      <span className="text-xs font-medium truncate">YouTube Video</span>
                    </div>
                  )}
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                  <span className="animate-pulse">Analyzing context...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            {fileContext && (
              <div className="mb-2 p-2 bg-indigo-50 rounded-lg flex items-center justify-between border border-indigo-100 animate-in slide-in-from-bottom-1 popup-interactive">
                <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold uppercase tracking-wider">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  Active Context: {fileContext.name}
                </div>
                <button 
                  onClick={() => setFileContext(null)}
                  className="p-1 hover:bg-indigo-100 rounded-full text-indigo-500 transition-colors"
                  title="Remove context"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            
            <div className="flex gap-2 relative">
              <div className="relative flex items-center">
                <button
                  onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                  className="p-2 text-gray-500 hover:text-primary transition-colors bg-gray-100 rounded-lg"
                  title="Add attachment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>

                {plusMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 popup-interactive">
                    <button
                      onClick={() => { fileInputRef.current?.click(); setPlusMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      Upload Image
                    </button>
                    <button
                      onClick={() => { pdfInputRef.current?.click(); setPlusMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      Upload PDF
                    </button>
                    <button
                      onClick={handleYoutubePrompt}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                      Add YouTube URL
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={createNewChat}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      New Chat
                    </button>
                    <button
                      onClick={() => { setMessages([{ id: '1', role: 'assistant', content: t.aiTutor.greeting, timestamp: new Date() }]); setFileContext(null); setPlusMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      Clear Current Chat
                    </button>
                  </div>
                )}
              </div>

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

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={fileContext ? `Ask about "${fileContext.name}"...` : t.aiTutor.placeholder}
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading || isRecording}
                />
                <button
                  onClick={startVoiceInput}
                  disabled={loading || accessibilityMode === 'Dumb'}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-primary hover:bg-gray-100'
                  } ${accessibilityMode === 'Dumb' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                >
                  {isRecording ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>

              <Button onClick={() => handleSend()} disabled={loading || (!input.trim() && !fileContext)}>
                {loading ? t.aiTutor.sending : t.aiTutor.send}
              </Button>
            </div>
          </div>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
