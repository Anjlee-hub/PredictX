import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { Link } from 'react-router-dom';

export const NotificationsPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { alerts, activeCount, acknowledgeAlert } = useAlerts();
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

  const activeAlerts = alerts.filter((a) => a.status === 'active').slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        title="Industrial Notifications"
      >
        <Bell className="h-5 w-5" />
        {activeCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5DE] dark:border-slate-800 bg-[#F8F7F4]/60 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Active Alerts</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500">
                {activeCount} active
              </span>
            </div>
            <Link
              to="/alerts"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#EA580C] hover:underline flex items-center gap-1 font-semibold"
            >
              View all <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {activeAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCheck className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                All factory machines operating normally!
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div key={alert.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {alert.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        alert.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{alert.machineName}</span>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
            <Link
              to="/alerts"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600"
            >
              Open Alert Command Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
