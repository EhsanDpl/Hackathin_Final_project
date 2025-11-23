// /contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle different error cases
        const errorMessage = responseData.message || responseData.error || 'Login failed';
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!responseData.access_token || !responseData.user) {
        throw new Error('Invalid response from server');
      }

      const loggedUser = responseData.user;
      const authToken = responseData.access_token;

      setUser(loggedUser);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      localStorage.setItem('token', authToken);

      // Redirect based on role
      if (loggedUser.role === 'super_admin' || loggedUser.role === 'admin') {
        router.push('/manager-dashboard');
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error so the UI can display it
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  const getAuthHeaders = () => {
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
