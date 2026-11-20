/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { authService } from '../services';
import { demoUsers } from '../data';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  loginAsDemoUser: (index: number) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const state = authService.getInitialState();
        setUser(state.user);
        setToken(state.token);
        setIsAuthenticated(state.isAuthenticated);
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${res.user.name}`);
      return true;
    } catch {
      toast.error('Failed to log in. Please check credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password);
      setUser(res.user);
      setToken(res.token);
      setIsAuthenticated(true);
      toast.success(`Account created successfully! Welcome to PredictX.`);
      return true;
    } catch {
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = (index: number) => {
    const demo = demoUsers[index] || demoUsers[0];
    setUser(demo.user);
    setToken(`demo-token-${demo.user.id}`);
    setIsAuthenticated(true);
    localStorage.setItem('predictx_auth_token', `demo-token-${demo.user.id}`);
    localStorage.setItem('predictx_current_user', JSON.stringify(demo.user));
    toast.success(`Switched role to: ${demo.user.name} (${demo.user.role})`);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await authService.updateProfile(updates);
      setUser(updated);
      toast.success('Profile settings updated');
    } catch {
      toast.error('Failed to save profile changes');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        isLoading,
        login,
        register,
        loginAsDemoUser,
        logout,
        updateProfile,
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
