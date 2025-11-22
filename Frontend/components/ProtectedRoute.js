// /components/ProtectedRoute.js
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) return <div className="p-6">Loading...</div>;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm text-gray-700">
                <strong>Your role:</strong> <span className="font-mono">{user.role}</span>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Required roles:</strong> <span className="font-mono">{roles.join(', ')}</span>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition transform hover:scale-105 font-medium"
            >
              Logout
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
