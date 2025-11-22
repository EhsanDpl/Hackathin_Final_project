import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { HomeIcon, LinkIcon, UserIcon, ChatBubbleLeftRightIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { isAdmin, isLearner, isMentor, isSuperAdmin } from '../utils/auth';

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  const navItems = [];

  // Check if user has admin privileges (admin or super_admin)
  const userIsAdmin = isAdmin(user);

  if (user?.role === 'learner') {
    navItems.push({ name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' });
    navItems.push({ name: 'Setup Profile', icon: <HomeIcon className="w-5 h-5" />, path: '/setup-profile' });
    navItems.push({ name: 'AI Chat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, path: '/chat' });
  }

  if (isMentor(user)) {
    navItems.push(
      { name: 'Mentor Dashboard', icon: <AcademicCapIcon className="w-5 h-5" />, path: '/dashboard' },
      { name: 'My Learners', icon: <UserIcon className="w-5 h-5" />, path: '/dashboard' }
    );
  }

  if (userIsAdmin) {
    navItems.push(
      { name: 'Admin Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/admin-dashboard' },
      { name: 'Create Growth Plan', icon: <LinkIcon className="w-5 h-5" />, path: '/create-link' },
      { name: 'Create Employee', icon: <UserIcon className="w-5 h-5" />, path: '/create-employee' }
    );
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 text-white flex flex-col p-6 min-h-screen shadow-2xl">
      <div 
        className="text-3xl font-bold mb-8 cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-2"
        onClick={() => {
          if (userIsAdmin) {
            router.push('/admin-dashboard');
          } else if (isMentor(user)) {
            router.push('/dashboard');
          } else {
            router.push('/dashboard');
          }
        }}
      >
        <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          SkillPilot AI
        </span>
      </div>
      <ul className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <li
            key={item.name}
            className={`group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              router.pathname === item.path 
                ? 'bg-white/30 shadow-lg transform scale-105' 
                : 'hover:bg-white/20 hover:transform hover:scale-105'
            }`}
            onClick={() => router.push(item.path)}
          >
            <div className={`${router.pathname === item.path ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
              {item.icon}
            </div>
            <span className={`font-semibold ${router.pathname === item.path ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
