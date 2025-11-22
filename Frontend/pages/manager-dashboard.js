import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [quizStatus, setQuizStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeLearners: 0,
    engagement: 0,
    hoursThisMonth: 0,
    pathsCompleted: 0,
  });

  useEffect(() => {
    fetchQuizStatus();
    fetchStats();
  }, []);

  const fetchQuizStatus = async () => {
    try {
      const data = await apiRequest('/content-generator/employee-quiz-status');
      setQuizStatus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching quiz status:', err);
      setQuizStatus([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from quiz status
      const activeCount = quizStatus.length;
      const avgScore = quizStatus.reduce((sum, emp) => sum + (emp.averageScore || 0), 0) / (activeCount || 1);
      const totalQuizzes = quizStatus.reduce((sum, emp) => sum + (emp.totalQuizzes || 0), 0);
      
      setStats({
        activeLearners: activeCount,
        engagement: Math.round(avgScore),
        hoursThisMonth: totalQuizzes * 2, // Estimate 2 hours per quiz
        pathsCompleted: quizStatus.filter(emp => emp.averageScore >= 70).length,
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  useEffect(() => {
    if (quizStatus.length > 0) {
      fetchStats();
    }
  }, [quizStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Track':
        return 'text-green-600';
      case 'Needs Improvement':
        return 'text-yellow-600';
      case 'Behind':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['admin', 'super_admin']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Manager Dashboard" />
            <main className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['admin', 'super_admin']}>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Manager Dashboard" />
          
          <main className="p-6 max-w-7xl mx-auto w-full">
            {/* Team Learning Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Team Learning Overview</h2>
              </div>
              <p className="text-gray-600 mb-6">Engineering Team - Frontend & Backend Squad</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-700">{stats.activeLearners}</div>
                  <div className="text-sm text-blue-600 font-medium">Active Learners</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="text-3xl font-bold text-green-700">{stats.engagement}%</div>
                  <div className="text-sm text-green-600 font-medium">Engagement</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-700">{stats.hoursThisMonth}</div>
                  <div className="text-sm text-purple-600 font-medium">Hours This Month</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                  <div className="text-3xl font-bold text-pink-700">{stats.pathsCompleted}</div>
                  <div className="text-sm text-pink-600 font-medium">Paths Completed</div>
                </div>
              </div>
            </div>

            {/* Team Members Quiz Status */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
              </div>
              
              {quizStatus.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No quiz data available yet. Employees need to complete quizzes first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizStatus.map((employee) => {
                    const progress = employee.averageScore || 0;
                    const initials = employee.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);
                    
                    // Determine avatar color based on status
                    let avatarColorClass = 'from-purple-500 to-pink-500';
                    if (employee.status === 'On Track') {
                      avatarColorClass = 'from-green-500 to-emerald-500';
                    } else if (employee.status === 'Needs Improvement') {
                      avatarColorClass = 'from-yellow-500 to-orange-500';
                    } else if (employee.status === 'Behind') {
                      avatarColorClass = 'from-orange-500 to-red-500';
                    }
                    
                    return (
                      <div
                        key={employee.id}
                        className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          {/* Avatar */}
                          <div className={`w-14 h-14 bg-gradient-to-br ${avatarColorClass} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                            {initials}
                          </div>
                          
                          {/* Employee Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{employee.name}</h3>
                            <p className="text-sm text-gray-500">{employee.role || 'Learner'}</p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`${getProgressColor(progress)} h-2.5 rounded-full transition-all duration-300`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <span>📊 {employee.totalQuizzes} Quizzes</span>
                          <span>💻 {employee.codingChallengeCount} Challenges</span>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full font-semibold text-xs ${
                            employee.status === 'On Track' 
                              ? 'text-green-600 bg-green-50 border border-green-200' 
                              : employee.status === 'Needs Improvement'
                              ? 'text-yellow-600 bg-yellow-50 border border-yellow-200'
                              : 'text-orange-600 bg-orange-50 border border-orange-200'
                          }`}>
                            {employee.status || 'No Status'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI-Powered Learning Impact Analysis */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">AI-Powered Learning Impact Analysis</h2>
              </div>
              <p className="text-gray-600 mb-6">Real-time correlation between learning and work performance.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 mb-1">+32%</div>
                  <div className="text-sm text-green-600 font-medium">Code Quality</div>
                  <div className="text-xs text-gray-500 mt-1">After training</div>
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 mb-1">-18%</div>
                  <div className="text-sm text-green-600 font-medium">Bug Rate</div>
                  <div className="text-xs text-gray-500 mt-1">Last quarter</div>
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 mb-1">+24%</div>
                  <div className="text-sm text-green-600 font-medium">PR Velocity</div>
                  <div className="text-xs text-gray-500 mt-1">Faster merges</div>
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 mb-1">+41%</div>
                  <div className="text-sm text-green-600 font-medium">Task Completion</div>
                  <div className="text-xs text-gray-500 mt-1">Complex tickets</div>
                </div>
              </div>
            </div>

            {/* ROI Highlight */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AcademicCapIcon className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-800">ROI Highlight</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Engineers who completed the Backend Development path showed <strong>38% reduction</strong> in production bugs and <strong>2.3x faster</strong> ticket resolution on backend tasks within 30 days.
              </p>
            </div>

            {/* Switch to Learner View */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Switch to Learner View
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

