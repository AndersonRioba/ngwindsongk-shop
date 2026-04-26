'use client';
import { createContext, useState, useEffect } from 'react';
import { load } from '@/app/lib/storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);

  useEffect(() => {
    // Restore user and token from localStorage on app load
    const storedToken = load('token');
    const storedUser = load('user');

    if (storedToken) {
      setToken(storedToken);
      setIsVerifyingToken(true);
      
      // Re-verify token on mount to refresh user roles/permissions
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(response => {
        if (response.user) {
          const userData = response.user;
          setUser(userData);
          // Update storage with fresh data (including Spatie roles)
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      })
      .catch(err => {
        console.error('Initial shop verification failed:', err);
        if (storedUser) setUser(storedUser);
      })
      .finally(() => {
        setIsVerifyingToken(false);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    setUser,
    token,
    setToken,
    isLoading,
    isVerifyingToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
