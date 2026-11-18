import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Cpu, AlertTriangle, FileText, ArrowRight, X } from 'lucide-react';
import { useMachines } from '../context/MachineContext';
import { useAlerts } from '../context/AlertContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { machines } = useMachines();
  const { alerts } = useAlerts();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const quickPages = [
    { title: 'Dashboard', path: '/dashboard', category: 'Pages' },
    { title: 'Machine Fleet Management', path: '/machines', category: 'Pages' },
    { title: 'AI Prediction Studio', path: '/predictions', category: 'Pages' },
    { title: 'SHAP Explainability Engine', path: '/explainability', category: 'Pages' },
    { title: 'Survival Analysis (PHM)', path: '/survival-analysis', category: 'Pages' },
    { title: 'Factory OEE & Efficiency Analytics', path: '/factory-analytics', category: 'Pages' },
    { title: 'Maintenance & Work Orders', path: '/maintenance', category: 'Pages' },
    { title: 'Alerts & Anomalies', path: '/alerts', category: 'Pages' },
    { title: 'What-if Simulation Scenario Builder', path: '/simulation', category: 'Pages' },
    { title: 'Reports & Audit Generator', path: '/reports', category: 'Pages' },
    { title: 'Platform Settings & FastAPI Config', path: '/settings', category: 'Pages' },
  ];

  const filteredMachines = query.trim()
    ? machines
        .filter(
          (m) =>
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.id.toLowerCase().includes(query.toLowerCase()) ||
            m.type.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : machines.slice(0, 3);

  const filteredAlerts = query.trim()
    ? alerts
        .filter(
          (a) =>
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            a.machineName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
    : alerts.slice(0, 2);

  const filteredPages = query.trim()
    ? quickPages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : quickPages.slice(0, 4);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 rounded-xl shadow-2xl z-10 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5E5DE] dark:border-slate-800 bg-[#F8F7F4]/60 dark:bg-slate-900/50">
          <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search machines, alerts, pages, or sensor telemetry..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Machines Section */}
          {filteredMachines.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                <Cpu className="h-3 w-3" />
                <span>Machines ({filteredMachines.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredMachines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(`/machines/${m.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{m.id}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {m.status.toUpperCase()}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {filteredAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                <AlertTriangle className="h-3 w-3" />
                <span>Recent Alerts</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredAlerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect('/alerts')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 font-medium block truncate max-w-sm">
                        {a.title}
                      </span>
                      <span className="text-[11px] text-slate-400">{a.machineName}</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-rose-500">{a.severity.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Pages */}
          {filteredPages.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                <FileText className="h-3 w-3" />
                <span>Navigation & Tools</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredPages.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => handleSelect(p.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{p.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
