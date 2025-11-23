import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { useRouter } from 'next/router';

export default function SkillProfileResults() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/skill-profile');
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load skill profile. Please generate it first.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/learning-path/create', {
        method: 'POST',
        body: JSON.stringify({
          skillProfileId: profile?.id,
        }),
      });

      // Redirect to learning path page
      if (typeof window !== 'undefined') {
        window.location.href = '/learning-path';
      }
    } catch (err) {
      console.error('Error creating learning path:', err);
      setError('Failed to create learning path. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Skill Profile Results" />
            <main className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !profile) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Skill Profile Results" />
            <main className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || 'Profile not found. Please generate your profile first.'}
              </div>
              <button
                onClick={() => router.push('/home')}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Go to Dashboard
              </button>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const insights = profile.insights || [];
  const strengths = profile.strengths || [];
  const growthAreas = profile.growthAreas || [];
  const skillMap = profile.skillMap || [];

  const getAccountIcon = (accountType) => {
    switch (accountType.toLowerCase()) {
      case 'github':
        return 'GH';
      case 'jira':
        return 'J';
      case 'gitlab':
        return 'GL';
      case 'linkedin':
        return 'in';
      case 'aws':
        return 'AWS';
      case 'teams':
        return 'MS';
      default:
        return accountType.substring(0, 2).toUpperCase();
    }
  };

  const getAccountColor = (accountType) => {
    switch (accountType.toLowerCase()) {
      case 'github':
        return 'bg-gray-900';
      case 'jira':
        return 'bg-blue-500';
      case 'gitlab':
        return 'bg-orange-600';
      case 'linkedin':
        return 'bg-blue-600';
      case 'aws':
        return 'bg-orange-500';
      case 'teams':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

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
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Skill Profile Results" />
          
          <main className="p-6">
            {/* Header with Animation */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Your Skill Profile is Ready! 🚀
              </h1>
              <p className="text-gray-600 text-lg">
                AI-generated analysis from your work data and professional profiles
              </p>
            </div>

            {/* AI Insights from Connected Accounts with Interactive Cards */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 transform transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2 animate-pulse">🤖</span>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Insights from Your Connected Accounts
                </h2>
              </div>
              <p className="text-gray-500 mb-4">
                Analysis based on <span className="font-bold text-purple-600">{insights.length}</span> connected data sources
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="border-2 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-400 cursor-pointer group bg-gradient-to-br from-white to-gray-50"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 ${getAccountColor(insight.accountType)} rounded-lg flex items-center justify-center text-white font-bold text-sm mr-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md`}>
                        {getAccountIcon(insight.accountType)}
                      </div>
                      <h3 className="font-semibold capitalize group-hover:text-purple-600 transition-colors">
                        {insight.accountType} Analysis
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{insight.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation with Animation */}
            {profile.recommendation && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-2xl shadow-lg mb-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-2 animate-bounce">💡</span>
                  <h2 className="text-2xl font-bold text-gray-800">AI Recommendation</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{profile.recommendation}</p>
              </div>
            )}

            {/* Your Strengths with Interactive List */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-2xl shadow-lg mb-6 transform transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-2">👍</span>
                <h2 className="text-2xl font-bold text-green-800">Your Strengths</h2>
              </div>
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li 
                    key={index} 
                    className="flex items-start group cursor-pointer transform transition-all duration-300 hover:translate-x-2"
                    style={{
                      animation: `fadeInLeft 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <span className="text-green-500 mr-3 text-xl transform transition-transform duration-300 group-hover:scale-125">✓</span>
                    <span className="text-gray-700 text-lg group-hover:text-green-700 transition-colors font-medium">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Areas with Interactive List */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 p-6 rounded-2xl shadow-lg mb-6 transform transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-2">🎯</span>
                <h2 className="text-2xl font-bold text-red-800">Growth Areas</h2>
              </div>
              <ul className="space-y-3">
                {growthAreas.map((area, index) => (
                  <li 
                    key={index} 
                    className="flex items-start group cursor-pointer transform transition-all duration-300 hover:translate-x-2"
                    style={{
                      animation: `fadeInLeft 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <span className="text-red-500 mr-3 text-xl transform transition-transform duration-300 group-hover:scale-125 group-hover:translate-x-1">→</span>
                    <span className="text-gray-700 text-lg group-hover:text-red-700 transition-colors font-medium">{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skill Map with Interactive Cards */}
            {skillMap.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 transform transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-2 animate-pulse">🗺️</span>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Skill Map
                    </h2>
                  </div>
                  <button
                    onClick={handleCreateLearningPath}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {loading ? 'Creating...' : 'Create Learning Path'}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillMap.map((skill, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:border-purple-400 cursor-pointer group bg-gradient-to-br from-white to-purple-50"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                        {skill.skill}
                      </h3>
                      {skill.level && (
                        <p className="text-sm text-gray-600 mb-2">
                          Level: <span className="font-medium text-purple-600">{skill.level}</span>
                        </p>
                      )}
                      {skill.category && (
                        <p className="text-sm text-gray-600">
                          Category: <span className="font-medium text-purple-600">{skill.category}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons with Enhanced Interactions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => router.push('/home')}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                Back
              </button>
              {skillMap.length > 0 && (
                <button
                  onClick={handleCreateLearningPath}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? 'Creating...' : 'Create Learning Path'}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

