import type { UserProfile } from '../types';

export const currentUserMock: UserProfile = {
  id: 'USR-0941',
  name: 'Dr. Marcus Vance',
  email: 'm.vance@predictx.factory.io',
  role: 'Plant Director',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  department: 'Smart Manufacturing & Plant Reliability',
  companyName: 'Apex Industrial Automation & Robotics Corp.',
  phone: '+1 (555) 782-9901',
  location: 'Detroit Hub - Facility Alpha',
  timezone: 'America/Detroit (EST, UTC-5)',
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    criticalSound: true,
    weeklyReports: true,
  },
  theme: 'dark',
  twoFactorEnabled: true,
};

export const demoUsers: { label: string; user: UserProfile }[] = [
  {
    label: 'Plant Director (Full Admin)',
    user: {
      ...currentUserMock,
    },
  },
  {
    label: 'Lead Reliability Engineer',
    user: {
      id: 'USR-0942',
      name: 'Sarah Jenkins, PE',
      email: 's.jenkins@predictx.factory.io',
      role: 'Reliability Engineer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      department: 'Vibration & Mechanical Diagnostics',
      companyName: 'Apex Industrial Automation & Robotics Corp.',
      phone: '+1 (555) 234-8901',
      location: 'Munich Gigaplant - Hall A',
      timezone: 'Europe/Berlin (CET, UTC+1)',
      notifications: {
        emailAlerts: true,
        smsAlerts: false,
        criticalSound: true,
        weeklyReports: true,
      },
      theme: 'dark',
      twoFactorEnabled: true,
    },
  },
  {
    label: 'Maintenance Supervisor',
    user: {
      id: 'USR-0943',
      name: 'Kenji Sato',
      email: 'k.sato@predictx.factory.io',
      role: 'Maintenance Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      department: 'Field Tooling & Fluid Dynamics',
      companyName: 'Apex Industrial Automation & Robotics Corp.',
      phone: '+1 (555) 456-7890',
      location: 'Yokohama Plant - Section East',
      timezone: 'Asia/Tokyo (JST, UTC+9)',
      notifications: {
        emailAlerts: true,
        smsAlerts: true,
        criticalSound: false,
        weeklyReports: false,
      },
      theme: 'light',
      twoFactorEnabled: false,
    },
  },
];
