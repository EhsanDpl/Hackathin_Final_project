import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { sendChatMessage } from '../utils/api';

export default function BottomChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI career coach. I can help you with learning recommendations, skill development, and career advice based on your profile. What would you like to learn today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Extract skills/keywords from AI response
  const extractSkills = (text) => {
    const skills = [];
    const skillPatterns = [
      /(?:skill|learn|study|master|improve|develop)\s+(?:in\s+)?([A-Z][a-zA-Z\s]+?)(?:\.|,|$|and|or)/gi,
      /([A-Z][a-zA-Z\s]+?)\s+(?:skill|technology|framework|language|tool)/gi,
      /(?:recommend|suggest|focus on|work on)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|$|and|or)/gi,
    ];

    // Common tech skills to look for
    const techSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
      'Angular', 'Vue.js', 'Docker', 'Kubernetes', 'AWS', 'Azure',
      'Machine Learning', 'Data Science', 'SQL', 'MongoDB', 'PostgreSQL',
      'GraphQL', 'REST API', 'Microservices', 'DevOps', 'CI/CD',
      'Agile', 'Scrum', 'Project Management', 'Leadership', 'Communication'
    ];

    // Check for mentioned skills
    techSkills.forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'gi');
      if (regex.test(text) && !skills.includes(skill)) {
        skills.push(skill);
      }
    });

    // Extract from patterns
    skillPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const skill = match[1].trim();
          if (skill.length > 2 && skill.length < 50 && !skills.includes(skill)) {
            skills.push(skill);
          }
        }
      }
    });

    return skills.slice(0, 8); // Limit to 8 skills
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    if (!messageText) {
      setInputMessage('');
    }
    
    // Add user message to chat
    const newUserMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);
    setSuggestedSkills([]); // Clear previous suggestions

    try {
      // Build chat history
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to API
      const response = await sendChatMessage(textToSend, history);
      const aiResponse = response.response || 'Sorry, I could not generate a response.';
      
      // Extract skills from response
      const extractedSkills = extractSkills(aiResponse);
      if (extractedSkills.length > 0) {
        setSuggestedSkills(extractedSkills);
      }
      
      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSkillClick = (skill) => {
    handleSendMessage(`Tell me more about ${skill} and how I can learn it.`);
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-2xl">AI Career Coach</h3>
            {suggestedSkills.length > 0 && (
              <span className="text-sm bg-white/30 px-3 py-1 rounded-full font-medium">
                {suggestedSkills.length} skill suggestions
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => window.history.back()}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
          title="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Suggested Skills Tabs */}
      {suggestedSkills.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100 overflow-x-auto">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-indigo-700 font-bold whitespace-nowrap flex items-center">
              <span className="mr-2">💡</span> Suggested Skills:
            </span>
            <div className="flex space-x-3">
              {suggestedSkills.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => handleSkillClick(skill)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 to-indigo-50" style={{ height: 'calc(100vh - 200px)' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-5 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white text-gray-800 border-2 border-indigo-100'
              }`}
            >
              <p className="text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-4 shadow-md">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t-2 border-indigo-200 bg-white shadow-lg">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about learning, skills, career advice..."
            className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white text-base"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

