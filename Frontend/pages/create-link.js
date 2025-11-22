// /pages/create-link.js
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function CreateLinkPage() {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');

  const employees = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const handleGenerateLink = () => {
    if (!selectedEmployee) return;
    setGeneratedLink(`https://example.com/learner/${selectedEmployee.id}`);
  };

  const handleCopyLink = () => navigator.clipboard.writeText(generatedLink);
  const handleSendEmail = () => alert(`Link sent to ${selectedEmployee.email}`);

  return (
    <ProtectedRoute roles={['admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Create Learner Link" />

          <main className="p-6 flex justify-center items-start">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-gradient-to-r from-purple-500 via-pink-500 to-red-500 transform transition hover:scale-105 animate-fade-in-up">
              
              <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center animate-fade-in-up">Create Learner Link</h1>

              <div className="mb-6 animate-fade-in-up">
                <label className="block mb-2 font-medium text-gray-700">Select Employee</label>
                <select
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                    setSelectedEmployee(emp || null);
                    setGeneratedLink('');
                  }}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
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
