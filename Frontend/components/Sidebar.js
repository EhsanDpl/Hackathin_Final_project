import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { HomeIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { isAdmin } from '../utils/auth';

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  const navItems = [];

  // Check if user has admin privileges (admin or super_admin)
  const userIsAdmin = isAdmin(user);

  if (user?.role === 'learner') {
    navItems.push({ name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' });
    navItems.push({ name: 'Skill Profile Results', icon: <AcademicCapIcon className="w-5 h-5" />, path: '/skill-profile-results' });
    navItems.push({ name: 'Learning Path', icon: <AcademicCapIcon className="w-5 h-5" />, path: '/learning-path' });
    navItems.push({ name: 'AI Content Generator', icon: <AcademicCapIcon className="w-5 h-5" />, path: '/ai-content-generator' });
    navItems.push({ name: 'AI Career Coach', icon: <AcademicCapIcon className="w-5 h-5" />, path: '/career-coach' });
  }

  if (userIsAdmin) {
    navItems.push(
      { name: 'Manager Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/manager-dashboard' },
      { name: 'Create Employee', icon: <UserIcon className="w-5 h-5" />, path: '/create-employee' }
    );
  }

  return (
    <aside className="w-72 bg-gradient-to-b from-purple-600 via-pink-500 to-red-500 text-white flex flex-col p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 cursor-pointer hover:text-gray-200 transition" onClick={() => router.push(userIsAdmin ? '/manager-dashboard' : '/dashboard')}>
        SkillPilot AI
      </h2>
      <ul className="flex flex-col space-y-2">
        {navItems.map((item, index) => (
          <li
            key={item.name}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition ${router.pathname === item.path ? 'bg-white/30' : ''}`}
            onClick={() => router.push(item.path)}
          >
            <span className="text-sm font-bold mr-2">{index + 1}</span>
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
