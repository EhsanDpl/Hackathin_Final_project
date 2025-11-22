// /contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = ({ email, password }) => {
    // Simple: if email includes "admin", role = admin
    const isAdmin = email.toLowerCase().includes('admin');
    const role = isAdmin ? 'admin' : 'learner';
    const loggedUser = { email, role };

    setUser(loggedUser);
    localStorage.setItem('user', JSON.stringify(loggedUser));

    // Redirect based on role
    if (role === 'admin') router.push('/admin-dashboard');
    else router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
