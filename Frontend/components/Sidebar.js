import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import {HomeIcon,LinkIcon,UserIcon, ChatBubbleLeftRightIcon, AcademicCapIcon,ChartBarIcon,BookOpenIcon,} from '@heroicons/react/24/outline';
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
  const userIsAdmin = isAdmin(user) || isSuperAdmin(user);

  if (user?.role === 'learner') {
    // Home/Dashboard
    navItems.push({ name: 'Home', icon: <HomeIcon className="w-5 h-5" />, path: '/home' });

    // Profile section with submenus
    navItems.push({
      name: 'Profile',
      icon: <AcademicCapIcon className="w-5 h-5 text-purple-300" />,
      subItems: [
        { name: 'Setup Profile', path: '/setup-profile', icon: <HomeIcon className="w-4 h-4 text-purple-500" /> },
        { name: 'Profile Overview', path: '/profile-overview', icon: <HomeIcon className="w-4 h-4 text-indigo-500" /> },
        { name: 'Skill Profile Results', path: '/skill-profile-results', icon: <AcademicCapIcon className="w-4 h-4 text-purple-500" /> },
      ],
    });

    // Learning Roadmap section
    navItems.push({
      name: 'Road Map',
      icon: <ChartBarIcon className="w-5 h-5 text-pink-300" />,
      subItems: [
        { name: 'Learning Path', path: '/learning-path', icon: <BookOpenIcon className="w-4 h-4 text-purple-500" /> },
        { name: 'Learning Dashboard', path: '/dashboard-progress', icon: <BookOpenIcon className="w-4 h-4 text-indigo-500" /> },
        { name: 'Quiz', path: '/quiz', icon: <BookOpenIcon className="w-4 h-4 text-indigo-500" /> },
      ],
    });

    // AI Tools section
    navItems.push({
      name: 'AI Tools',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-300" />,
      subItems: [
        { name: 'AI Content Generator', path: '/ai-content-generator', icon: <AcademicCapIcon className="w-4 h-4 text-purple-500" /> },
        { name: 'AI Career Coach', path: '/career-coach', icon: <AcademicCapIcon className="w-4 h-4 text-indigo-500" /> },
      ],
    });
  }

  if (userIsAdmin) {
    navItems.push(
      { name: 'Manager Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/manager-dashboard' },
      { name: 'Create Growth Plan', icon: <LinkIcon className="w-5 h-5" />, path: '/create-link' },
      { name: 'Create Employee', icon: <UserIcon className="w-5 h-5" />, path: '/create-employee' }
    );
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-600 via-pink-500 to-red-500 text-white flex flex-col p-6 min-h-screen overflow-y-auto">
      <h2
        className="text-2xl font-bold mb-8 cursor-pointer hover:text-gray-200 transition"
        onClick={() => router.push(userIsAdmin ? '/manager-dashboard' : '/home')}
      >
        SkillPilot AI
      </h2>

      <ul className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <li key={item.name} className="flex flex-col">
            {/* Parent Item */}
            <div
              className={`group flex items-center justify-between space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                router.pathname.startsWith(item.path) || (item.subItems && item.subItems.some(sub => router.pathname === sub.path))
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
