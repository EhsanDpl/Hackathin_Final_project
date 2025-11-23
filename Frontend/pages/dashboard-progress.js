// /pages/learner-dashboard.js
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { CurrencyDollarIcon, ClockIcon, ChartPieIcon, BookOpenIcon, AcademicCapIcon, ClipboardIcon } from '@heroicons/react/24/outline';

export default function LearnerDashboard() {
  const { user } = useAuth();

  const modulesInProgress = [
    { title: "Backend Fundamentals", description: "Node.js & Express Basics", modules: 4, hours: 8, xp: 200, completed: 2, icon: <AcademicCapIcon className="w-6 h-6 text-indigo-500" /> },
    { title: "Frontend Advanced", description: "React & State Management", modules: 3, hours: 6, xp: 150, completed: 1, icon: <BookOpenIcon className="w-6 h-6 text-pink-500" /> },
    { title: "Database & API", description: "SQL & REST APIs", modules: 2, hours: 4, xp: 100, completed: 0, icon: <ClipboardIcon className="w-6 h-6 text-green-500" /> },
  ];

  const missionsToday = [
    { title: "Complete Backend Module", type: "Module", icon: <AcademicCapIcon className="w-5 h-5 text-indigo-500" /> },
    { title: "Node.js Quiz", type: "Quiz", icon: <ClipboardIcon className="w-5 h-5 text-yellow-500" /> },
  ];

  const missionsTomorrow = [
    { title: "Frontend Project", type: "Module", icon: <BookOpenIcon className="w-5 h-5 text-pink-500" /> },
    { title: "React Quiz", type: "Quiz", icon: <ClipboardIcon className="w-5 h-5 text-yellow-500" /> },
  ];

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Learner Dashboard" />

          <main className="p-6 space-y-6">

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center hover:shadow-2xl transition">
                <CurrencyDollarIcon className="w-8 h-8 text-indigo-500 mb-2" />
                <p className="text-gray-500 text-sm">XP Earned</p>
                <h3 className="text-xl font-bold">350</h3>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center hover:shadow-2xl transition">
                <ClockIcon className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-gray-500 text-sm">Hours Served</p>
                <h3 className="text-xl font-bold">12</h3>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center hover:shadow-2xl transition">
                <ChartPieIcon className="w-8 h-8 text-yellow-500 mb-2" />
                <p className="text-gray-500 text-sm">Progress</p>
                <h3 className="text-xl font-bold">45%</h3>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center hover:shadow-2xl transition">
                <BookOpenIcon className="w-8 h-8 text-pink-500 mb-2" />
                <p className="text-gray-500 text-sm">Modules Done</p>
                <h3 className="text-xl font-bold">4</h3>
              </div>
            </div>

            {/* Modules in Progress */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Modules in Progress</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {modulesInProgress.map((mod, idx) => {
                  const completion = (mod.completed / mod.modules) * 100;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-xl shadow-lg p-5 flex flex-col border-l-4 border-indigo-500 hover:shadow-2xl transition"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {mod.icon}
                        <h3 className="font-bold text-lg">{mod.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{mod.description}</p>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="h-3 rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>

                      {/* Completed / To-Do */}
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Completed: {mod.completed}</span>
                        <span>To-Do: {mod.modules - mod.completed}</span>
                      </div>

                      {/* XP / Hours / Modules */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{mod.modules} Modules</span>
                        <span>{mod.hours} Hours</span>
                        <span>{mod.xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Missions */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Missions</h2>
              <div className="grid md:grid-cols-2 gap-4">

                {/* Today */}
                <div className="bg-white p-4 rounded-xl shadow space-y-2 hover:shadow-2xl transition">
                  <h3 className="font-semibold mb-2">Today</h3>
                  {missionsToday.map((mission, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">{mission.icon}<span>{mission.title}</span></div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        mission.type === 'Module' ? 'bg-indigo-200 text-indigo-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>{mission.type}</span>
                    </div>
                  ))}
                </div>

                {/* Tomorrow */}
                <div className="bg-white p-4 rounded-xl shadow space-y-2 hover:shadow-2xl transition">
                  <h3 className="font-semibold mb-2">Tomorrow</h3>
                  {missionsTomorrow.map((mission, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">{mission.icon}<span>{mission.title}</span></div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        mission.type === 'Module' ? 'bg-indigo-200 text-indigo-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>{mission.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Start Journey Button */}
            <div className="flex justify-center mt-6">
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transform transition">
                Start Next Mission →
              </button>
            </div>

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
