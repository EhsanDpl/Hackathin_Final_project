import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function CareerCoach() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI Career Coach. I can help you with:\n- Technical questions about your modules\n- Guidance on your learning path\n- Career advice and skill recommendations",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Prepare chat history (excluding system messages)
      const history = messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Store the message before clearing input
      const messageToSend = inputMessage.trim();
      setInputMessage('');

      // Call career coach API
      const response = await apiRequest('/api/v1/llama-chat/career-coach', {
        method: 'POST',
        body: JSON.stringify({
          message: messageToSend,
          history: history,
        }),
      });

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: response.data?.response || 'I apologize, but I could not generate a response.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (content) => {
    // Simple formatting for bullet points and line breaks
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="mr-2">•</span>
            <span>{line.trim().substring(1).trim()}</span>
          </div>
        );
      }
      return <div key={index} className={index < lines.length - 1 ? 'mb-2' : ''}>{line || '\u00A0'}</div>;
    });
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ProtectedRoute roles={['learner']}>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .message-enter {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar title="AI Career Coach" />
          
          <main className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
                AI Career Coach 🦉
              </h1>
              <p className="text-gray-600 text-lg">
                Ask me anything about your learning journey
              </p>
            </div>

            {/* Chat Container */}
            <div
              ref={chatContainerRef}
              className="flex-1 bg-white rounded-2xl shadow-lg p-6 mb-4 overflow-y-auto flex flex-col"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
              <div className="flex-1 space-y-4">
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const isError = message.error;

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 message-enter ${
                        isUser ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          isUser
                            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                            : 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                        }`}
                      >
                        {isUser ? (
                          getUserInitials(user?.name || 'User')
                        ) : (
                          'AI'
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`flex-1 max-w-[75%] ${
                          isUser ? 'text-right' : ''
                        }`}
                      >
                        <div
                          className={`inline-block rounded-2xl px-4 py-3 ${
                            isUser
                              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                              : isError
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-gray-100 text-gray-800'
                          } shadow-md`}
                        >
                          <div className="whitespace-pre-wrap">
                            {formatMessage(message.content)}
                          </div>
                        </div>
                        {message.timestamp && (
                          <div
                            className={`text-xs text-gray-500 mt-1 ${
                              isUser ? 'text-right' : ''
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex items-start gap-3 message-enter">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      AI
                    </div>
                    <div className="flex-1">
                      <div className="inline-block bg-gray-100 rounded-2xl px-4 py-3 shadow-md">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden group"
              >
                <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Send
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              </button>
            </form>

            {/* Back Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

