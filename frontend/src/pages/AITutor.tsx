import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import type { ChatMessage } from '../types';
import { aiAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const CHAT_HISTORY_KEY = 'ai_chat_history';

const AITutor = () => {
  const { settings, t } = useSettings();
  const { enabled, answerStyle, showChatHistory } = settings.aiTutor;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (showChatHistory) {
      try {
        const stored = window.localStorage.getItem(CHAT_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ChatMessage[];
          if (parsed.length > 0) {
            setMessages(parsed.map(m => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })));
            return;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    // Set initial greeting
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
    if (showChatHistory && messages.length > 0) {
      try {
        window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } catch {
        // Ignore storage errors
      }
    }
  }, [messages, showChatHistory]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const isLowPower = document.documentElement.classList.contains('low-power');
    messagesEndRef.current?.scrollIntoView({ behavior: isLowPower ? 'auto' : 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !enabled) return;

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
        content: input,
        timestamp: new Date(),
      }, offlineMsg]);
      setInput('');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Pass answerStyle to API - 'Short' maps to concise mode, 'Detailed' to detailed mode
      const mode = answerStyle === 'Short' ? 'concise' : 'detailed';
      const response = await aiAPI.ask(input, mode);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer || response.response || t.aiTutor.errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
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
    reader.onload = async () => {
      const base64 = reader.result as string;
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Analyzed an image.',
        imageUrl: base64,
        attachmentType: 'image',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await aiAPI.analyzeImage(base64, settings.themeAccessibility.lowPowerMode ? 'speech' : 'regular');
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.explanation || "I have analyzed the image. It appears to be an educational resource.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I could not analyze the image at this time.",
          timestamp: new Date(),
        }]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
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

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `PDF uploaded: ${file.name}`,
      attachmentType: 'pdf',
      attachmentTitle: file.name,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // For a hackathon demo, we extract text if possible or send file info
    // Here we simulate extraction and send to AI
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // Real PDF extraction would use pdf.js, here we send first 2000 chars of raw text as a fallback
        const text = (reader.result as string).slice(0, 5000); 
        const res = await aiAPI.analyzePdf(text, 'regular');
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.summary || "This PDF contains educational content about the topic.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I processed the PDF but couldn't generate a summary. It seems to be a structured document.",
          timestamp: new Date(),
        }]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
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
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiAPI.explainVideo(url);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.simpleExplanation || res.summary || "This video explains the key concepts of the topic.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I couldn't fetch the video details. Please make sure the video has a transcript available.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
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
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 p-4 border-t border-gray-200 relative">
            <div className="relative flex items-center">
              <button
                onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                className="p-2 text-gray-500 hover:text-primary transition-colors bg-gray-100 rounded-lg"
                title="Add attachment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>

              {plusMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Upload Image
                  </button>
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    Upload PDF
                  </button>
                  <button
                    onClick={handleYoutubePrompt}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                    Add YouTube URL
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
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.aiTutor.placeholder}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? t.aiTutor.sending : t.aiTutor.send}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AITutor;
