import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Building,
  Lock,
  Bell,
  Palette,
  LogOut,
  Save,
  Server,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchParams] = useSearchParams();

  type TabType = 'profile' | 'company' | 'password' | 'notifications' | 'theme' | 'backend';

  const [internalTab, setInternalTab] = useState<TabType>('profile');
  const tabParam = searchParams.get('tab') as TabType;
  const activeTab: TabType =
    tabParam && ['profile', 'company', 'password', 'notifications', 'theme', 'backend'].includes(tabParam)
      ? tabParam
      : internalTab;

  const setActiveTab = (tab: TabType) => {
    setInternalTab(tab);
  };

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Dr. Marcus Vance',
    email: user?.email || 'm.vance@predictx.factory.io',
    phone: user?.phone || '+1 (555) 782-9901',
    role: user?.role || 'Plant Director',
    department: user?.department || 'Smart Manufacturing & Plant Reliability',
    location: user?.location || 'Detroit Hub - Facility Alpha',
    timezone: user?.timezone || 'America/Detroit (EST, UTC-5)',
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: 'Apex Industrial Automation & Robotics Corp.',
    plantCode: 'PLANT-ALPHA-DETROIT',
    sector: 'Advanced Automotive & CNC Precision Machining',
    licenseTier: 'Enterprise AI Fleet (50 Nodes Activated)',
    gatewayIp: '192.168.10.45',
    mqttPort: '8883 (MQTTS TLS)',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: true,
  });

  const [notifForm, setNotifForm] = useState({
    emailAlerts: true,
    smsAlerts: true,
    criticalSound: true,
    weeklyReports: true,
  });

  // FastAPI integration setting
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('predictx_api_base_url') || 'http://localhost:8000/api/v1';
  });
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'idle' | 'connected' | 'offline'>('idle');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileForm);
  };

  const handleSaveBackend = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('predictx_api_base_url', backendUrl);
    toast.success('FastAPI endpoint configuration saved');
  };

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    try {
      // Ping check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${backendUrl}/health`, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && res.ok) {
        setBackendStatus('connected');
        toast.success('FastAPI backend connected successfully!');
      } else {
        setBackendStatus('offline');
        toast('FastAPI offline (Frontend is running in Mock Mode)', { icon: 'ℹ️' });
      }
    } catch {
      setBackendStatus('offline');
      toast('FastAPI offline (Frontend is running in Mock Mode)', { icon: 'ℹ️' });
    } finally {
      setIsTestingBackend(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'company', label: 'Plant & Company', icon: Building },
    { id: 'backend', label: 'FastAPI Integration', icon: Server },
    { id: 'notifications', label: 'Alert Notifications', icon: Bell },
    { id: 'theme', label: 'Theme & Display', icon: Palette },
    { id: 'password', label: 'Security & 2FA', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & Account Settings
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Manage engineer profile, plant infrastructure parameters, notifications, and FastAPI connection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#111827] text-white dark:bg-slate-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-500/30"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                  <p className="text-xs text-slate-500">{user?.role} • {user?.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / Emergency Comms
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Plant Duty Location
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#E5E5DE] dark:border-slate-800">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* Company & Infrastructure Tab */}
          {activeTab === 'company' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                Plant Facility Infrastructure Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Enterprise Name</label>
                  <input
                    type="text"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Plant Identifier Code</label>
                  <input
                    type="text"
                    value={companyForm.plantCode}
                    onChange={(e) => setCompanyForm({ ...companyForm, plantCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Edge Gateway IP Address</label>
                  <input
                    type="text"
                    value={companyForm.gatewayIp}
                    onChange={(e) => setCompanyForm({ ...companyForm, gatewayIp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telemetry Broker Protocol</label>
                  <input
                    type="text"
                    value={companyForm.mqttPort}
                    onChange={(e) => setCompanyForm({ ...companyForm, mqttPort: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">PredictX Node License:</span>
                  <span className="text-slate-500">{companyForm.licenseTier}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Active Verified
                </span>
              </div>
            </div>
          )}

          {/* FastAPI Integration Tab */}
          {activeTab === 'backend' && (
            <form onSubmit={handleSaveBackend} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-1">
                  FastAPI Backend Bridge Configuration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect PredictX frontend to a live Python FastAPI microservice (or maintain offline mock fallback).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    FastAPI Base URL Endpoint
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      placeholder="http://localhost:8000/api/v1"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleTestBackend}
                      disabled={isTestingBackend}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-100"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isTestingBackend ? 'animate-spin' : ''}`} />
                      <span>Test Connection</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Status:</span>
                  {backendStatus === 'connected' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected to Live FastAPI Service
                    </span>
                  ) : backendStatus === 'offline' ? (
                    <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Offline (Operating seamlessly in Mock Engine mode)
                    </span>
                  ) : (
                    <span className="text-slate-400">Ready to test</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                  Ready for FastAPI Python Backend:
                </span>
                The service layer (`src/services/`) uses standard Axios endpoints (`/machines`, `/predict`, `/maintenance`, `/alerts`, `/analytics`). When your FastAPI server is started, simply provide its URL here and all requests will route directly without changing any React components!
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Save API Configuration
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                Industrial Alert Notification Channels
              </h3>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Critical Audio Alarm Sound</span>
                    <span className="text-slate-500">Play SCADA acoustic warning tone when critical threshold exceeds 80%</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifForm.criticalSound}
                    onChange={(e) => setNotifForm({ ...notifForm, criticalSound: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Emergency SMS Paging</span>
                    <span className="text-slate-500">Send urgent SMS to lead engineer for immediate line stops</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifForm.smsAlerts}
                    onChange={(e) => setNotifForm({ ...notifForm, smsAlerts: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Weekly Reliability Digest</span>
                    <span className="text-slate-500">Receive Sunday night automated fleet OEE and MTBF summaries</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifForm.weeklyReports}
                    onChange={(e) => setNotifForm({ ...notifForm, weeklyReports: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 text-blue-600"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => toast.success('Notification preferences saved')}
                  className="px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Save Notification Rules
                </button>
              </div>
            </div>
          )}

          {/* Theme & Display Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                Display & Theme Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-[#EA580C] bg-white text-slate-900 ring-2 ring-[#EA580C]/20 shadow-xs'
                      : 'border-[#E5E5DE] dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Architectural Light (Recommended)</span>
                    <span className="h-2 w-2 rounded-full bg-[#EA580C]" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Warm architectural cream (#F8F7F4), crisp white cards, and signature Burnt Orange primary pop.
                  </p>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#EA580C] bg-slate-900 text-white ring-2 ring-[#EA580C]/20 shadow-xs'
                      : 'border-[#E5E5DE] dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Industrial Dark (SCADA)</span>
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Stealth Black & Charcoal Grey (#08080A) with Burnt Orange telemetry accents for high-contrast, low-glare control rooms.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Security & 2FA Tab */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                Security & Authentication
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-slate-500">FIDO2 / TOTP Hardware Token Verification</span>
                </div>
                <input
                  type="checkbox"
                  checked={passwordForm.twoFactor}
                  onChange={(e) => setPasswordForm({ ...passwordForm, twoFactor: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => toast.success('Security settings updated')}
                  className="px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Update Credentials
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
