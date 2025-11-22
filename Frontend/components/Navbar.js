// /components/Navbar.js
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div>
        <span className="mr-4 text-gray-600">{user?.email}</span>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
