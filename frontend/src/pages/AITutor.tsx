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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !enabled) return;

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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-wrap ${{
                    user: 'bg-primary text-white',
                    assistant: 'bg-gray-100 text-gray-900',
                  }[message.role]}`}
                >
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

          <div className="flex gap-2 p-4 border-t border-gray-200">
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
