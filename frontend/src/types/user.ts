export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Plant Director' | 'Reliability Engineer' | 'Maintenance Lead' | 'AI Operations Specialist';
  avatar: string;
  department: string;
  companyName: string;
  phone: string;
  location: string;
  timezone: string;
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    criticalSound: boolean;
    weeklyReports: boolean;
  };
  theme: 'dark' | 'light' | 'system';
  twoFactorEnabled: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
}
