// /pages/dashboard.js
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Chart from '../components/Chart';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const learnerData = { completedSkills: 12, ongoingCourses: 3, points: 250 };

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar />
          <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">Welcome, {user?.email}!</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card title="Completed Skills" value={learnerData.completedSkills} icon="✓" />
              <Card title="Ongoing Courses" value={learnerData.ongoingCourses} icon="📚" />
              <Card title="Points Earned" value={learnerData.points} icon="⭐" />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">Learning Progress</h3>
              <Chart />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
