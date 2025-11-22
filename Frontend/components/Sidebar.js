import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  LinkIcon,
  UserIcon, ChatBubbleLeftRightIcon, AcademicCapIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { isAdmin, isLearner, isMentor, isSuperAdmin } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems = [];
  const userIsAdmin = isAdmin(user);

  if (user?.role === 'learner') {
    navItems.push({ name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' });

    navItems.push({
      name: 'Profile',
      icon: <AcademicCapIcon className="w-5 h-5 text-purple-300" />,
      subItems: [
        { name: 'Profile Overview', path: '/setup-profile', icon: <HomeIcon className="w-4 h-4 text-purple-500" /> },
        { name: 'AI Insights', path: '/profile-overview', icon: <HomeIcon className="w-4 h-4 text-indigo-500" /> },
      ],
    });

    navItems.push({
      name: 'Road Map',
      icon: <ChartBarIcon className="w-5 h-5 text-pink-300" />,
      subItems: [
        { name: 'Learning Path', path: '/learning-path', icon: <BookOpenIcon className="w-4 h-4 text-purple-500" /> },
        { name: 'Learning Dashboard', path: '/dashboard-progress', icon: <BookOpenIcon className="w-4 h-4 text-indigo-500" /> },
         { name: 'Quiz', path: '/quiz', icon: <BookOpenIcon className="w-4 h-4 text-indigo-500" /> },
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
    <aside className="w-64 bg-gradient-to-b from-purple-600 via-pink-500 to-red-500 text-white flex flex-col p-6 min-h-screen overflow-y-auto">
      <h2
        className="text-2xl font-bold mb-8 cursor-pointer hover:text-gray-200 transition"
        onClick={() => router.push(userIsAdmin ? '/admin-dashboard' : '/dashboard')}
      >
        Skiller
      </h2>

      <ul className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <li key={item.name} className="flex flex-col">
            {/* Parent Item */}
            <div
              className={`group flex items-center justify-between space-x-3 p-3 rounded-xl cursor-pointer transition
               -all duration-200 ${
              router.pathname.startsWith(item.path) 
                ? 'bg-white/30 shadow-lg transform scale-105' 
                : 'hover:bg-white/20 hover:transform hover:scale-105'
            }`}
              onClick={() => (item.subItems ? toggleMenu(item.name) : router.push(item.path))}
            >
              <div className="flex items-center space-x-3">
                <div className={`${router.pathname === item.path ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
              {item.icon}
                </div>
            <span className={`font-semibold ${router.pathname === item.path ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
              {item.name}
            </span>
              </div>
              {item.subItems && (
                <motion.span
                  animate={{ rotate: openMenus[item.name] ? 90 : 0 }}
                  className="text-sm transition-transform"
                >
                  ▸
                </motion.span>
              )}
            </div>

            {/* Submenu */}
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
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-white/20 transition
                          ${router.pathname === sub.path ? 'bg-white/30' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(sub.path);
                        }}
                      >
                        {sub.icon}
                        <span className="text-sm">{sub.name}</span>
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
