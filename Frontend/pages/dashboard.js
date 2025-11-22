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
  const skills = [
    { id: 1, name: 'React Basics', progress: 80, points: 50 },
    { id: 2, name: 'Next.js Fundamentals', progress: 60, points: 40 },
    { id: 3, name: 'Tailwind CSS', progress: 90, points: 30 },
  ];

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');

  const displayData = () => {
    if (selectedSkill) return selectedSkill;
    const totalProgress = Math.round(skills.reduce((acc, s) => acc + s.progress, 0) / skills.length);
    const totalPoints = skills.reduce((acc, s) => acc + s.points, 0);
    return { progress: totalProgress, points: totalPoints, name: 'Overall' };
  };

  const data = displayData();

  const handleGenerateLink = () => {
    if (!selectedSkill) return;
    setGeneratedLink(`https://example.com/skill/${selectedSkill.id}`);
  };

  const handleCopyLink = () => navigator.clipboard.writeText(generatedLink);
  const handleSendEmail = () => alert(`Link sent for ${selectedSkill.name}`);

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Learner Dashboard" />

          <main className="p-6">
            <h1 className="text-3xl font-bold mb-6 animate-fade-in-up">Learner Dashboard</h1>

            {/* Skill Selector */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <label className="block mb-2 font-medium">Select Skill</label>
              <select
                className="p-3 border rounded-lg w-full"
                value={selectedSkill?.id || ''}
                onChange={(e) => {
                  const skill = skills.find(s => s.id === parseInt(e.target.value));
                  setSelectedSkill(skill || null);
                  setGeneratedLink('');
                }}
              >
                <option value="">Overall Progress</option>
                {skills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card title="Skill Progress" value={`${data.progress}%`} icon="📈" />
              <Card title="Points Earned" value={data.points} icon="⭐" />
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 animate-fade-in-up">
              <h3 className="text-lg font-bold mb-4">{selectedSkill ? `${selectedSkill.name} Progress` : 'Overall Progress'}</h3>
              <Chart />
            </div>

            {/* Link Section */}
            {selectedSkill && (
              <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 animate-fade-in-up">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 bg-gray-100 p-2 rounded-md border border-gray-300 focus:outline-none"
                  placeholder="Click 'Generate Link'..."
                />
                <button
                  onClick={handleGenerateLink}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-6 py-2 rounded-lg hover:scale-105 transition transform"
                >
                  Generate Link
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
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
