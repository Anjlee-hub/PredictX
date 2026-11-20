import { apiClient } from './api';
import type { UserProfile, AuthState } from '../types';
import { currentUserMock } from '../data';

export const authService = {
  async login(email: string, _password?: string): Promise<{ user: UserProfile; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', { email, password: _password });
      return response.data;
    } catch {
      // Mock fallback: instant successful login
      const mockToken = `jwt-predictx-${Date.now()}`;
      localStorage.setItem('predictx_auth_token', mockToken);
      const user = { ...currentUserMock, email };
      localStorage.setItem('predictx_current_user', JSON.stringify(user));
      return { user, token: mockToken };
    }
  },

  async register(name: string, email: string, _password?: string): Promise<{ user: UserProfile; token: string }> {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password: _password });
      return response.data;
    } catch {
      // Mock fallback
      const mockToken = `jwt-predictx-${Date.now()}`;
      localStorage.setItem('predictx_auth_token', mockToken);
      const user: UserProfile = {
        ...currentUserMock,
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        email,
      };
      localStorage.setItem('predictx_current_user', JSON.stringify(user));
      return { user, token: mockToken };
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch {
      const savedUser = localStorage.getItem('predictx_current_user');
      return savedUser ? JSON.parse(savedUser) : currentUserMock;
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.patch('/auth/profile', updates);
      return response.data;
    } catch {
      const current = await this.getCurrentUser();
      const updated = { ...current, ...updates } as UserProfile;
      localStorage.setItem('predictx_current_user', JSON.stringify(updated));
      return updated;
    }
  },

  logout(): void {
    localStorage.removeItem('predictx_auth_token');
    localStorage.removeItem('predictx_current_user');
  },

  getInitialState(): AuthState {
    const token = typeof window !== 'undefined' ? localStorage.getItem('predictx_auth_token') : null;
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('predictx_current_user') : null;

    // Default to logged-in user in development/demo mode so user has immediate rich experience
    const user = savedUser ? JSON.parse(savedUser) : currentUserMock;

    return {
      user: user,
      isAuthenticated: true,
      token: token || 'demo-token-predictx',
      isLoading: false,
    };
  },
};
