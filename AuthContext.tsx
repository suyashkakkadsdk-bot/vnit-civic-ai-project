import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthRole } from '../types/api';
import { logout as apiLogout } from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  role: AuthRole | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'auth_user';
const AUTH_ROLE_KEY = 'auth_role';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<AuthRole | null>(() => {
    try {
      const storedRole = localStorage.getItem(AUTH_ROLE_KEY) as AuthRole | null;
      if (storedRole === 'citizen' || storedRole === 'government') {
        return storedRole;
      }
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.role || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_ROLE_KEY, user.role);
        setRole(user.role);
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_ROLE_KEY);
        setRole(null);
      }
    } catch (e) {
      console.warn('Failed to update localStorage auth keys:', e);
    }
  }, [user]);

  const login = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_ROLE_KEY, authenticatedUser.role);
    } catch (e) {
      console.warn('Failed to persist auth state:', e);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_ROLE_KEY);
    } catch (e) {
      console.warn('Failed to clear auth state:', e);
    }
    apiLogout();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
