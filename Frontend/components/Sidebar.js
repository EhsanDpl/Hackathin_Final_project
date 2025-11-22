import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { HomeIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  const navItems = [];

  if (user?.role === 'learner') {
    navItems.push({ name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' });
  }

  if (user?.role === 'admin') {
    navItems.push(
      { name: 'Admin Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/admin-dashboard' },
      { name: 'Create Link', icon: <LinkIcon className="w-5 h-5" />, path: '/create-link' }
    );
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-600 via-pink-500 to-red-500 text-white flex flex-col p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 cursor-pointer hover:text-gray-200 transition" onClick={() => router.push(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard')}>
        Skiller
      </h2>
      <ul className="flex flex-col space-y-4">
        {navItems.map((item) => (
          <li
            key={item.name}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition ${router.pathname === item.path ? 'bg-white/30' : ''}`}
            onClick={() => router.push(item.path)}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
