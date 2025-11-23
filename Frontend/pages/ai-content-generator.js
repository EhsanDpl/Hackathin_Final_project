import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { useRouter } from 'next/router';
import { 
  DocumentTextIcon, 
  CodeBracketIcon,
  ArrowLeftIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function AIContentGenerator() {
  const { user } = useAuth();
  const router = useRouter();
  const [skillsGap, setSkillsGap] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState('quiz');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState('15 minutes');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [learningPath, setLearningPath] = useState(null);

  useEffect(() => {
    fetchSkillsGap();
    fetchSuggestions();
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      const data = await apiRequest('/learning-path');
      setLearningPath(data);
    } catch (err) {
      // Learning path might not exist yet, that's okay
      console.log('No learning path found yet');
    }
  };

  const handleStartJourney = async () => {
    try {
      // Update learning path status to 'in-progress'
      await apiRequest('/learning-path', {
        method: 'PUT',
        body: JSON.stringify({
          status: 'in-progress',
        }),
      });
      // Redirect to content generator to start learning
      router.push('/ai-content-generator');
    } catch (err) {
      console.error('Error starting journey:', err);
      setError('Failed to start journey. Please try again.');
    }
  };

  const fetchSkillsGap = async () => {
    try {
      const data = await apiRequest('/content-generator/skills-gap');
      setSkillsGap(data);
    } catch (err) {
      console.error('Error fetching skills gap:', err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const data = await apiRequest('/content-generator/suggestions');
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTopic(suggestion.title);
  };

  const handleGenerateContent = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or select a suggestion');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setGeneratedContent(null);

      const content = await apiRequest('/content-generator/generate', {
        method: 'POST',
        body: JSON.stringify({
          contentType: selectedContentType,
          topic: topic.trim(),
          difficulty,
          duration,
        }),
      });

      setGeneratedContent(content);
      
      // Redirect to content view based on type
      if (selectedContentType === 'quiz') {
        router.push(`/quiz/${content.id}`);
      } else if (selectedContentType === 'coding-challenge') {
        router.push(`/coding-challenge/${content.id}`);
      } else {
        // Default to quiz if type not recognized
        router.push(`/quiz/${content.id}`);
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickGenerate = async (gapTopic) => {
    setTopic(gapTopic);
    setSelectedContentType('quiz');
    setDifficulty('Intermediate');
    setDuration('15 minutes');
    
    // Auto-generate after setting values
    setTimeout(() => {
      handleGenerateContent();
    }, 100);
  };

  const contentTypes = [
    { id: 'quiz', name: 'Quiz', icon: DocumentTextIcon, color: 'purple' },
    { id: 'coding-challenge', name: 'Coding Challenge', icon: CodeBracketIcon, color: 'orange' },
  ];

  return (
    <ProtectedRoute roles={['learner']}>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="AI Content Generator" />
          
          <main className="p-6">
            {/* Header */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
                AI Content Generator ✨✨
              </h1>
              <p className="text-gray-600 text-lg">
                Create personalized learning materials instantly
              </p>
            </div>

            {/* AI Detected Skills Gap */}
            {skillsGap && skillsGap.gap && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6 shadow-lg transform transition-all duration-300 hover:shadow-xl animate-fade-in-up">
                <div className="flex items-start mb-4">
                  <AcademicCapIcon className="w-8 h-8 text-yellow-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">AI Detected Skills Gap</h2>
                    <p className="text-gray-700 leading-relaxed">
                      {skillsGap.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleQuickGenerate(skillsGap.gap)}
                    disabled={generating}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    Generate {skillsGap.gap} Quick-Start
                  </button>
                  <button
                    onClick={() => setTopic(skillsGap.gap)}
                    className="bg-white border-2 border-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                  >
                    View Full Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-6 shadow-lg transform transition-all duration-300 hover:shadow-xl animate-fade-in-up">
                <div className="flex items-center mb-4">
                  <LightBulbIcon className="w-8 h-8 text-green-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800">Smart Suggestions Based on Your Activity</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-white border-2 border-green-200 rounded-lg p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-400 group"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mr-3 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                          {suggestion.icon}
                        </div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                          {suggestion.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Type Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Select Content Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedContentType === type.id;
                  const iconColorClass = isSelected 
                    ? 'text-white' 
                    : type.color === 'purple' 
                      ? 'text-purple-600' 
                      : 'text-orange-600';
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedContentType(type.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-purple-600 shadow-lg'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:shadow-md'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${iconColorClass}`} />
                      <div className="font-semibold">{type.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Generation Form */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 animate-fade-in-up">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Generate Content</h2>
              
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic or Concept
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., MongoDB Aggregation Pipeline"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="5 minutes">5 minutes</option>
                      <option value="10 minutes">10 minutes</option>
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateContent}
                  disabled={generating || !topic.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">+</span>
                        Generate Content
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                </button>
              </div>
            </div>

            {/* Start Journey Button (if learning path exists) */}
            {learningPath && learningPath.status !== 'in-progress' && (
              <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white p-6 rounded-2xl shadow-lg mb-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready to Start Your Learning Journey?</h3>
                    <p className="text-white/90">Begin your personalized {learningPath.duration || '6-week'} learning path</p>
                  </div>
                  <button
                    onClick={handleStartJourney}
                    className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    Start Journey
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Back Button */}
            <div className="flex justify-start">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
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

