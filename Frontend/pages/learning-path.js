import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function LearningPath() {
  const { user } = useAuth();
  const router = useRouter();
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/learning-path');
      setLearningPath(data);
    } catch (err) {
      console.error('Error fetching learning path:', err);
      setError('Failed to load learning path. Please create one first.');
    } finally {
      setLoading(false);
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
      // Redirect to dashboard or learning path progress
      router.push('/dashboard');
    } catch (err) {
      console.error('Error starting journey:', err);
      setError('Failed to start journey. Please try again.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Learning Path" />
            <main className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !learningPath) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Learning Path" />
            <main className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || 'Learning path not found. Please create one from your skill profile.'}
              </div>
              <button
                onClick={() => router.push('/skill-profile-results')}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Go to Skill Profile
              </button>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Parse weeks from description if stored as JSON
  let weeks = [];
  let pathDescription = '';
  let pathTitle = learningPath.title || 'Full-Stack Development Mastery';
  
  try {
    const weeksData = JSON.parse(learningPath.description || '{}');
    if (weeksData.weeks && Array.isArray(weeksData.weeks)) {
      weeks = weeksData.weeks;
    }
    // Extract description text if available
    if (weeksData.description) {
      pathDescription = weeksData.description;
    }
    if (weeksData.title) {
      pathTitle = weeksData.title;
    }
  } catch (e) {
    // Description is not JSON, use as plain text
    pathDescription = learningPath.description || 'A comprehensive learning journey designed to enhance your skills';
  }

  // If no weeks, create default structure
  if (weeks.length === 0) {
    weeks = [
      { week: 1, title: 'Backend Fundamentals', subtitle: 'Node.js & Express Basics', description: 'Build RESTful APIs and server-side architecture', modules: 4, hours: 8, xp: 200 },
      { week: 2, title: 'Database Integration', subtitle: 'SQL & NoSQL Databases', description: 'Master database design and queries', modules: 4, hours: 10, xp: 250 },
      { week: 3, title: 'Authentication & Security', subtitle: 'Secure Your Applications', description: 'Implement JWT, OAuth, and best practices', modules: 3, hours: 7, xp: 200 },
      { week: 4, title: 'Frontend Integration', subtitle: 'React & API Integration', description: 'Connect frontend to backend APIs', modules: 4, hours: 10, xp: 250 },
      { week: 5, title: 'Advanced Patterns', subtitle: 'State Management & Architecture', description: 'Learn advanced patterns and best practices', modules: 5, hours: 12, xp: 300 },
      { week: 6, title: 'Deployment & DevOps', subtitle: 'Production Ready', description: 'Deploy applications and CI/CD pipelines', modules: 4, hours: 10, xp: 250 },
    ];
  }

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
          <Navbar title="Learning Path" />
          
          <main className="p-6">
            {/* Header with Animation */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Your Personalized Learning Journey 🗺️
              </h1>
              <p className="text-gray-600 text-lg">
                {learningPath.duration || '6-week'} roadmap to master your skills
              </p>
            </div>

            {/* Learning Path Hero Card with Enhanced Design */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white p-8 rounded-3xl shadow-2xl mb-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                      {learningPath.status === 'in-progress' ? 'In Progress' : learningPath.status === 'planned' ? 'Ready to Start' : 'Planned'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold mb-3 leading-tight">
                    {pathTitle}
                  </h2>
                  <p className="text-white/90 text-lg leading-relaxed mb-4">
                    {pathDescription || 'A comprehensive learning journey designed to enhance your skills and advance your career'}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                      <div className="text-sm text-white/80">Duration</div>
                      <div className="text-xl font-bold">{learningPath.duration || '6 weeks'}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                      <div className="text-sm text-white/80">Difficulty</div>
                      <div className="text-xl font-bold">{learningPath.difficulty || 'Intermediate'}</div>
                    </div>
                    {learningPath.progress !== undefined && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="text-sm text-white/80">Progress</div>
                        <div className="text-xl font-bold">{learningPath.progress}%</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center transform transition-transform duration-300 hover:scale-110">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
                    <div className="text-7xl font-bold mb-2">{weeks.length}</div>
                    <div className="text-xl font-semibold">Weeks</div>
                    <div className="text-sm text-white/80 mt-2">{learningPath.totalModules || weeks.length * 4} Modules</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Breakdown with Enhanced Design */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Weekly Breakdown
              </h2>
              <div className="space-y-6">
                {weeks.map((week, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-purple-400 cursor-pointer group relative overflow-hidden"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Gradient accent on hover */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex items-start gap-6">
                      {/* Week Number Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xl">
                          {week.week || index + 1}
                        </div>
                      </div>
                      
                      {/* Week Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                              {week.title}
                            </h3>
                            {week.subtitle && (
                              <p className="text-lg text-gray-600 mb-2 font-semibold">{week.subtitle}</p>
                            )}
                            <p className="text-gray-700 leading-relaxed mb-4">{week.description}</p>
                          </div>
                        </div>
                        
                        {/* Stats Badges */}
                        <div className="flex gap-3 flex-wrap">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 px-5 py-2.5 rounded-xl text-sm font-semibold transform transition-all duration-300 hover:scale-110 hover:shadow-md flex items-center gap-2">
                            <span className="text-lg">📚</span>
                            <span>{week.modules || 0} Modules</span>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 px-5 py-2.5 rounded-xl text-sm font-semibold transform transition-all duration-300 hover:scale-110 hover:shadow-md flex items-center gap-2">
                            <span className="text-lg">⏱️</span>
                            <span>{week.hours || 0} hours</span>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-800 px-5 py-2.5 rounded-xl text-sm font-semibold transform transition-all duration-300 hover:scale-110 hover:shadow-md flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <span>{week.xp || 0} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons with Enhanced Interactions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => router.push('/skill-profile-results')}
                className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <ArrowLeftIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                Back
              </button>
              <button
                onClick={() => router.push('/ai-content-generator')}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Go to Content Generator
                  <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

