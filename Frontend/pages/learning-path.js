// /pages/learning-path.js
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function LearningPath() {
  const roadmap = [
    {
      week: 'Week 1',
      title: 'Backend Fundamentals',
      description: 'Node.js & Express Basics\nBuild RESTful APIs and server-side architecture',
      modules: 3,
      hours: 6,
      xp: 150,
    },
    {
      week: 'Week 2',
      title: 'Frontend Basics',
      description: 'HTML, CSS, React Components\nBuild responsive user interfaces',
      modules: 3,
      hours: 7,
      xp: 170,
    },
    {
      week: 'Week 3',
      title: 'Database & APIs',
      description: 'SQL/NoSQL, RESTful APIs\nIntegrate backend services',
      modules: 3,
      hours: 6,
      xp: 150,
    },
    {
      week: 'Week 4',
      title: 'DevOps & Deployment',
      description: 'AWS, CI/CD Basics\nDeploy applications in cloud environments',
      modules: 3,
      hours: 5,
      xp: 140,
    },
    {
      week: 'Week 5',
      title: 'Advanced Frontend',
      description: 'State Management, Hooks, Testing\nBuild scalable frontend apps',
      modules: 3,
      hours: 8,
      xp: 180,
    },
    {
      week: 'Week 6',
      title: 'Full-Stack Project',
      description: 'Combine frontend & backend skills\nComplete a real-world project',
      modules: 4,
      hours: 10,
      xp: 250,
    },
  ];

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Learning Path" />

          <main className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Your 6-Week Learning Roadmap</h1>
            <p className="text-gray-600 mb-8">Follow this roadmap to level up your skills and earn XP!</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roadmap.map((weekItem) => (
                <div key={weekItem.week} className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition transform border-l-4 border-indigo-500">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {weekItem.week}: {weekItem.title}
                    </h2>
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  </div>

                  <p className="text-gray-600 whitespace-pre-line mb-4">{weekItem.description}</p>

                  <div className="flex flex-wrap gap-4 mb-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {weekItem.modules} Modules
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {weekItem.hours} Hours
                    </span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                      {weekItem.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button
                onClick={() => alert('Journey Started!')}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold hover:scale-105 transition transform"
              >
                Start Journey →
              </button>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
