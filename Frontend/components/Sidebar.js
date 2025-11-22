import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { HomeIcon, LinkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { isAdmin } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navItems = [];
  const userIsAdmin = isAdmin(user);

  if (user?.role === 'learner') {
    navItems.push({ name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' });

    navItems.push({
      name: 'Profile',
      icon: <HomeIcon className="w-5 h-5" />,
      subItems: [
        {
          name: 'Profile Overview',
          path: '/setup-profile',
          icon: <HomeIcon className="w-4 h-4 text-purple-500" />,
        },
        {
          name: 'AI Insights',
          path: '/profile-overview',
          icon: <HomeIcon className="w-4 h-4 text-indigo-500" />,
        },
      ],
    });
  }

  if (userIsAdmin) {
    navItems.push(
      { name: 'Admin Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/admin-dashboard' },
      { name: 'Create Growth Plan', icon: <LinkIcon className="w-5 h-5" />, path: '/create-link' },
      { name: 'Create Employee', icon: <UserIcon className="w-5 h-5" />, path: '/create-employee' }
    );
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-600 via-pink-500 to-red-500 text-white flex flex-col p-6 min-h-screen">
      <h2
        className="text-2xl font-bold mb-8 cursor-pointer hover:text-gray-200 transition"
        onClick={() => router.push(userIsAdmin ? '/admin-dashboard' : '/dashboard')}
      >
        Skiller
      </h2>

      <ul className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <li key={item.name} className="flex flex-col">
            {/* Parent item */}
            <div
              className={`flex items-center justify-between space-x-3 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition ${
                router.pathname === item.path ? 'bg-white/30' : ''
              }`}
              onClick={() => {
                if (item.subItems) toggleMenu(item.name);
                else if (item.path) router.push(item.path);
              }}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </div>
              {item.subItems && <span className="text-sm">{openMenus[item.name] ? '▾' : '▸'}</span>}
            </div>

            {/* Submenu with animation */}
            {item.subItems && (
              <AnimatePresence>
                {openMenus[item.name] && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-1 flex flex-col space-y-1 overflow-hidden"
                  >
                    {item.subItems.map((sub) => (
                      <li
                        key={sub.name}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-white/20 transition ${
                          router.pathname === sub.path ? 'bg-white/30' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent parent toggle
                          router.push(sub.path);
                        }}
                      >
                        {sub.icon}
                        <span>{sub.name}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
