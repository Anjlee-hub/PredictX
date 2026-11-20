import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ShieldCheck, ChevronDown, Sun, Moon, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { demoUsers } from '../data';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loginAsDemoUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#18181C] transition-colors cursor-pointer group"
        title="Operator Profile & Mode Settings"
      >
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-lg object-cover ring-2 ring-[#EA580C]/25"
          />
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#121215]" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{user.name}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <span>{user.role}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[#EA580C] font-mono uppercase text-[9px] font-bold">
              {theme === 'dark' ? 'DARK' : 'LIGHT'}
            </span>
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#EA580C] transition-colors hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#121215] border border-[#E5E5DE] dark:border-[#272730] shadow-2xl z-50 overflow-hidden divide-y divide-[#E5E5DE] dark:divide-[#272730] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Header */}
          <div className="p-4 bg-[#F8F7F4]/60 dark:bg-[#16161A]">
            <div className="font-bold text-sm text-[#111827] dark:text-white">{user.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200/60 dark:bg-[#1F1F24] text-slate-800 dark:text-slate-300 border border-[#E5E5DE] dark:border-[#2A2A33]">
              <ShieldCheck className="h-3 w-3 text-[#EA580C]" />
              {user.department}
            </div>
          </div>

          {/* ─── DEDICATED MODE PLACE: DISPLAY & THEME SHIFTER ─── */}
          <div className="p-3 bg-slate-50/70 dark:bg-[#141417]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Display Mode
              </span>
              <span className="text-[10px] font-mono font-bold text-[#EA580C]">
                {theme === 'dark' ? 'STEALTH BLACK' : 'WARM CREAM'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E5E5DE] dark:border-[#272730]">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#25252A]'
                }`}
              >
                <Sun className={`h-3.5 w-3.5 ${theme === 'light' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#25252A]'
                }`}
              >
                <Moon className={`h-3.5 w-3.5 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Switch Demo Roles */}
          <div className="p-2">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Switch Persona (Simulation)
            </div>
            {demoUsers.map((item, idx) => (
              <button
                key={item.user.id}
                onClick={() => {
                  loginAsDemoUser(idx);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  user.id === item.user.id
                    ? 'bg-blue-50 dark:bg-[#1C1C21] text-[#EA580C] font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#18181C]'
                }`}
              >
                <span>{item.label}</span>
                {user.id === item.user.id && (
                  <span className="text-[10px] font-mono font-bold text-[#EA580C]">Active</span>
                )}
              </button>
            ))}
          </div>

          {/* Navigation Links */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => {
                navigate('/settings?tab=theme');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#18181C] transition-colors cursor-pointer"
            >
              <Palette className="h-4 w-4 text-[#EA580C]" />
              <span>Theme Preferences</span>
            </button>
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#18181C] transition-colors cursor-pointer"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>User Profile</span>
            </button>
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#18181C] transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Plant & API Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className="p-1.5">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
                navigate('/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
