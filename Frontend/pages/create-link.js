// /pages/create-link.js
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { getLearners } from '../utils/api';

export default function CreateLinkPage() {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch learners from API
  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLearners();
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
    if (!selectedEmployee) return;
    // Generate link using learner ID
    setGeneratedLink(`${window.location.origin}/shareLink?learnerId=${selectedEmployee.id}`);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copied to clipboard!');
    }
  };

  const handleSendEmail = () => {
    if (selectedEmployee) {
      alert(`Link sent to ${selectedEmployee.email}`);
    }
  };

  return (
    <ProtectedRoute roles={['admin', 'super_admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Create Learner Link" />

          <main className="p-6 flex justify-center items-start">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-gradient-to-r from-purple-500 via-pink-500 to-red-500 transform transition hover:scale-105 animate-fade-in-up">
              
              <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center animate-fade-in-up">Create Learner Link</h1>

              <div className="mb-6 animate-fade-in-up">
                <label className="block mb-2 font-medium text-gray-700">Select Learner</label>
                {loading ? (
                  <div className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 text-center">
                    Loading learners...
                  </div>
                ) : error ? (
                  <div className="w-full p-3 border rounded-lg bg-red-50 text-red-600 text-center">
                    {error}
                  </div>
                ) : (
                  <select
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => {
                      const learner = learners.find(l => l.id === parseInt(e.target.value));
                      setSelectedEmployee(learner || null);
                      setGeneratedLink('');
                    }}
                    disabled={learners.length === 0}
                  >
                    <option value="">Select Learner</option>
                    {learners.map(learner => (
                      <option key={learner.id} value={learner.id}>
                        {learner.name} ({learner.email})
                      </option>
                    ))}
                  </select>
                )}
                {learners.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    {learners.length} learner{learners.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </div>

              {selectedEmployee && (
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 animate-fade-in-up">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    placeholder="Click 'Generate Link'..."
                    className="flex-1 p-3 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button onClick={handleGenerateLink} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition transform hover:scale-105">
                    Generate Link
                  </button>
                  <button onClick={handleCopyLink} className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 px-4 py-3 rounded-lg transition">
                    <ClipboardIcon className="w-5 h-5" />
                    <span>Copy</span>
                  </button>
                  <button onClick={handleSendEmail} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition">
                    <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                    <span>Send Email</span>
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
