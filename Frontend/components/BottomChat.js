import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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
  const [isMinimized, setIsMinimized] = useState(false);
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
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

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
    <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-indigo-200 shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-[500px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Career Coach</h3>
            {suggestedSkills.length > 0 && !isMinimized && (
              <span className="text-xs bg-white/30 px-2 py-1 rounded-full font-medium">
                {suggestedSkills.length} skill suggestions
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Suggested Skills Tabs */}
          {suggestedSkills.length > 0 && (
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100 overflow-x-auto">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-indigo-700 font-bold whitespace-nowrap flex items-center">
                  <span className="mr-1">💡</span> Suggested Skills:
                </span>
                <div className="flex space-x-2">
                  {suggestedSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => handleSkillClick(skill)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ height: 'calc(500px - 180px)' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white text-gray-800 border-2 border-indigo-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about learning, skills, career advice..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

