import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Chart from '../components/Chart';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();

  // Example employee list for Admin
  const employees = [
    { id: 1, name: 'John Doe', email: 'john@example.com', completedSkills: 12, ongoingCourses: 3, points: 250 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', completedSkills: 8, ongoingCourses: 2, points: 180 },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', completedSkills: 15, ongoingCourses: 4, points: 320 },
  ];

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');

  // Determine displayed data
  const displayData = () => {
    if (!user) {
      return { completedSkills: 0, ongoingCourses: 0, points: 0, name: 'Guest' };
    }
    if (user.role === 'learner') {
      return { completedSkills: 12, ongoingCourses: 3, points: 250, name: user.email };
    } else if (selectedEmployee) {
      return selectedEmployee;
    } else {
      // Admin overall stats
      const totalCompleted = employees.reduce((acc, emp) => acc + emp.completedSkills, 0);
      const totalOngoing = employees.reduce((acc, emp) => acc + emp.ongoingCourses, 0);
      const totalPoints = employees.reduce((acc, emp) => acc + emp.points, 0);
      return { completedSkills: totalCompleted, ongoingCourses: totalOngoing, points: totalPoints, name: 'Overall' };
    }
  };

  const data = displayData();

  // Generate link for selected employee
  const handleGenerateLink = () => {
    if (!selectedEmployee) return;
    setGeneratedLink(`https://example.com/learner/${selectedEmployee.id}`);
  };

  const handleCopyLink = () => navigator.clipboard.writeText(generatedLink);
  const handleSendEmail = () => {
    if (!selectedEmployee) return;
    alert(`Link sent to ${selectedEmployee.email}`);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar />

          <main className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              Welcome, {user && (user.role === 'admin' || user.role === 'super_admin') && !selectedEmployee ? 'Admin' : data.name}!
            </h1>

            {/* Admin Employee Filter */}
            {user && (user.role === 'admin' || user.role === 'super_admin') && (
              <div className="mb-6">
                <label className="block mb-2 font-medium">Filter by Employee</label>
                <select
                  className="p-3 border rounded-lg w-full"
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                    setSelectedEmployee(emp || null);
                    setGeneratedLink(''); // clear link on selection
                  }}
                >
                  <option value="">Overall Dashboard</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card title="Completed Skills" value={data.completedSkills} icon="✓" />
              <Card title="Ongoing Courses" value={data.ongoingCourses} icon="📚" />
              <Card title="Points Earned" value={data.points} icon="⭐" />
              {user && (user.role === 'admin' || user.role === 'super_admin') && !selectedEmployee && (
                <Card title="Employee Management" value="Manage" icon="👤" />
              )}
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg transform transition duration-500 hover:scale-105 mb-6">
              <h3 className="text-lg font-bold mb-4 text-gray-700">
                {user && user.role === 'learner' ? 'Learning Progress' : selectedEmployee ? `${selectedEmployee.name} Progress` : 'Overall Progress'}
              </h3>
              <Chart />
            </div>

            {/* Admin Link Generation */}
            {user && (user.role === 'admin' || user.role === 'super_admin') && selectedEmployee && (
              <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 animate-fadeInUp">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 bg-gray-100 p-2 rounded-md border border-gray-300 focus:outline-none"
                  placeholder="Click 'Generate Link'..."
                />
                <button
                  onClick={handleGenerateLink}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Generate Link
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition"
                >
                  <ClipboardIcon className="w-5 h-5" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
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
