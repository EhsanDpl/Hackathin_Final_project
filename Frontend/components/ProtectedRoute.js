// /components/ProtectedRoute.js
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user]);

  if (!user) return <div className="p-6">Loading...</div>;

  if (roles && !roles.includes(user.role)) {
    return <div className="p-6 text-red-600 font-bold">Access Denied</div>;
  }

  return children;
}
