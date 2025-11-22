// /pages/admin-dashboard.js
import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Chart from '../components/Chart';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { user } = useAuth();
  const employees = [
    { id: 1, name: 'John Doe', email: 'john@example.com', completedSkills: 12, ongoingCourses: 3, points: 250 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', completedSkills: 8, ongoingCourses: 2, points: 180 },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', completedSkills: 15, ongoingCourses: 4, points: 320 },
  ];

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');

  const displayData = () => {
    if (selectedEmployee) return selectedEmployee;
    const totalCompleted = employees.reduce((acc, emp) => acc + emp.completedSkills, 0);
    const totalOngoing = employees.reduce((acc, emp) => acc + emp.ongoingCourses, 0);
    const totalPoints = employees.reduce((acc, emp) => acc + emp.points, 0);
    return { completedSkills: totalCompleted, ongoingCourses: totalOngoing, points: totalPoints, name: 'Overall' };
  };

  const data = displayData();

  const handleGenerateLink = () => {
    if (!selectedEmployee) return;
    setGeneratedLink(`https://example.com/learner/${selectedEmployee.id}`);
  };

  const handleCopyLink = () => navigator.clipboard.writeText(generatedLink);
  const handleSendEmail = () => alert(`Link sent to ${selectedEmployee.email}`);

  return (
    <ProtectedRoute roles={['admin', 'super_admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Admin Dashboard" />

          <main className="p-6">
            <h1 className="text-3xl font-bold mb-6 animate-fade-in-up">Admin Dashboard</h1>

            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <label className="block mb-2 font-medium">Filter by Employee</label>
              <select
                className="p-3 border rounded-lg w-full"
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                  setSelectedEmployee(emp || null);
                  setGeneratedLink('');
                }}
              >
                <option value="">Overall Dashboard</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card title="Completed Skills" value={data.completedSkills} icon="✓" />
              <Card title="Ongoing Courses" value={data.ongoingCourses} icon="📚" />
              <Card title="Points Earned" value={data.points} icon="⭐" />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 animate-fade-in-up">
              <h3 className="text-lg font-bold mb-4">{selectedEmployee ? `${selectedEmployee.name} Progress` : 'Overall Progress'}</h3>
              <Chart />
            </div>

            {selectedEmployee && (
              <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 animate-fade-in-up">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 bg-gray-100 p-2 rounded-md border border-gray-300 focus:outline-none"
                  placeholder="Click 'Generate Link'..."
                />
                <button onClick={handleGenerateLink} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-105">
                  Generate Link
                </button>
                <button onClick={handleCopyLink} className="flex items-center space-x-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition">
                  <ClipboardIcon className="w-5 h-5" />
                  <span>Copy</span>
                </button>
                <button onClick={handleSendEmail} className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition">
                  <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                  <span>Send Email</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
