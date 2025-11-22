// /components/Navbar.js
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600 font-medium">
          <span className="text-gray-400">Signed in as</span>{' '}
          <span className="text-indigo-600">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
