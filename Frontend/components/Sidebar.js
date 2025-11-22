import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { HomeIcon, LinkIcon, UserIcon } from '@heroicons/react/24/outline';


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
    { name: 'Create Link', icon: <LinkIcon className="w-5 h-5" />, path: '/create-link' },
    { name: 'Create Employee', icon: <UserIcon className="w-5 h-5" />, path: '/create-employee' } // <- new
  );
}

  return (
       <aside className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient w-64 p-6 text-white">
        <h2
        className="text-2xl font-bold mb-8 cursor-pointer hover:text-gray-200 transition"
        onClick={() => router.push(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard')}
      >
        Skiller
      </h2>
      <ul className="flex flex-col space-y-4">
        {navItems.map((item) => (
          <li
            key={item.name}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition 
            ${router.pathname === item.path ? 'bg-white/30 text-white' : 'hover:bg-white/20 hover:text-white'}`}
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
