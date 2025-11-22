// /pages/create-link.js
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { getLearners } from '../utils/api';

export default function CreateGrowthPlanPage() {
  const { user } = useAuth();
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch learners from API (includes both learners and created employees)
  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLearners();
        // getLearners returns all learners including created employees
        setLearners(data || []);
      } catch (err) {
        console.error('Error fetching learners:', err);
        setError(err.message || 'Failed to load learners');
      } finally {
        setLoading(false);
      }
    };

    fetchLearners();
  }, []);

  const handleGenerateLink = () => {
    if (!selectedLearner) return;
    // Generate link using learner ID
    setGeneratedLink(`${window.location.origin}/shareLink?learnerId=${selectedLearner.id}`);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copied to clipboard!');
    }
  };

  const handleSendEmail = () => {
    if (selectedLearner) {
      alert(`Link sent to ${selectedLearner.email}`);
    }
  };

  return (
    <ProtectedRoute roles={['admin', 'super_admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Create Growth Plan" />

          <main className="p-6 flex justify-center items-start">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-gradient-to-r from-purple-500 via-pink-500 to-red-500 transform transition hover:scale-105 animate-fade-in-up">
              
              <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center animate-fade-in-up">Create Growth Plan</h1>

              <div className="mb-6 animate-fade-in-up">
                <label className="block mb-2 font-medium text-gray-700">Select Existing User</label>
                {loading ? (
                  <div className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 text-center">
                    Loading users...
                  </div>
                ) : error ? (
                  <div className="w-full p-3 border rounded-lg bg-red-50 text-red-600 text-center">
                    {error}
                  </div>
                ) : (
                  <select
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    value={selectedLearner?.id || ''}
                    onChange={(e) => {
                      const learner = learners.find(l => l.id === parseInt(e.target.value));
                      setSelectedLearner(learner || null);
                      setGeneratedLink('');
                    }}
                    disabled={learners.length === 0}
                  >
                    <option value="">Select User</option>
                    {learners.map(learner => (
                      <option key={learner.id} value={learner.id}>
                        {learner.name} ({learner.email})
                      </option>
                    ))}
                  </select>
                )}
                {learners.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    {learners.length} user{learners.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </div>

              {selectedLearner && (
                <div className="space-y-4 animate-fade-in-up">
                  {/* User Information Display */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-gray-700 mb-3">User Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        disabled
                        value={selectedLearner.name || ''}
                        className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        disabled
                        value={selectedLearner.email || ''}
                        className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    {selectedLearner.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                        <input
                          type="text"
                          disabled
                          value={selectedLearner.phone}
                          className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    )}

                    {selectedLearner.role && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                        <input
                          type="text"
                          disabled
                          value={selectedLearner.role}
                          className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    )}

                    {selectedLearner.department && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                        <input
                          type="text"
                          disabled
                          value={selectedLearner.department}
                          className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    )}

                    {selectedLearner.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                        <input
                          type="text"
                          disabled
                          value={selectedLearner.location}
                          className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    )}
                  </div>

                  {/* Link Generation */}
                  <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      placeholder="Click 'Generate Link' to create growth plan link..."
                      className="flex-1 p-3 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button onClick={handleGenerateLink} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition transform hover:scale-105">
                      Generate Link
                    </button>
                    <button onClick={handleCopyLink} disabled={!generatedLink} className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 px-4 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                      <ClipboardIcon className="w-5 h-5" />
                      <span>Copy</span>
                    </button>
                    <button onClick={handleSendEmail} disabled={!generatedLink} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                      <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                      <span>Send Email</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
