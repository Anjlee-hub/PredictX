import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Bell,
  Search,
  ArrowRight,
  Clock,
  Eye,
  Check,
} from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { SeverityBadge } from '../components/Badges';

export const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, acknowledgeAlert, resolveAlert } = useAlerts();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  const highCount = alerts.filter((a) => a.severity === 'high' && a.status === 'active').length;
  const mediumCount = alerts.filter((a) => a.severity === 'medium' && a.status === 'active').length;
  const lowCount = alerts.filter((a) => a.severity === 'low' && a.status === 'active').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Factory Alarms & Anomaly Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              ISA-18.2 Alarm Mgmt
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-tier threshold alarms, vibration envelope exceedances, and AI telemetry anomalies.
          </p>
        </div>

        <button
          onClick={() => navigate('/machines')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs transition-all cursor-pointer"
        >
          <span>View Telemetry Fleet</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Severity Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => { setSeverityFilter('critical'); setStatusFilter('active'); }}
          className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 cursor-pointer hover:shadow-xs transition-all"
        >
          <div className="flex justify-between items-center text-xs font-bold text-rose-600 dark:text-rose-400">
            <span>Critical</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {criticalCount}
          </div>
          <span className="text-[10px] text-slate-500">Immediate action</span>
        </div>

        <div
          onClick={() => { setSeverityFilter('high'); setStatusFilter('active'); }}
          className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-orange-950/20 cursor-pointer hover:shadow-xs transition-all"
        >
          <div className="flex justify-between items-center text-xs font-bold text-orange-600 dark:text-orange-400">
            <span>High Risk</span>
            <Bell className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-orange-600 dark:text-orange-400 mt-1">
            {highCount}
          </div>
          <span className="text-[10px] text-slate-500">Address in 24h</span>
        </div>

        <div
          onClick={() => { setSeverityFilter('medium'); setStatusFilter('active'); }}
          className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 cursor-pointer hover:shadow-xs transition-all"
        >
          <div className="flex justify-between items-center text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Medium</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {mediumCount}
          </div>
          <span className="text-[10px] text-slate-500">Next shift audit</span>
        </div>

        <div
          onClick={() => { setSeverityFilter('low'); setStatusFilter('active'); }}
          className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer hover:shadow-xs transition-all"
        >
          <div className="flex justify-between items-center text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Low Info</span>
            <Bell className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {lowCount}
          </div>
          <span className="text-[10px] text-slate-500">Informational logs</span>
        </div>

        <div
          onClick={() => { setStatusFilter('resolved'); setSeverityFilter('all'); }}
          className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer hover:shadow-xs transition-all"
        >
          <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Resolved</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedCount}
          </div>
          <span className="text-[10px] text-slate-500">Closed alarms</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alarm titles, messages, machine names..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filter by Alarm Severity"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Alarms</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Informational</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Resolution Status"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All States</option>
              <option value="active">Active Unresolved</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved / Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No alarms found matching criteria
            </h3>
            <p className="text-xs text-slate-400 mt-1">All monitored machine threshold criteria are nominal.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4.5 transition-all shadow-xs ${
                alert.status === 'resolved'
                  ? 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 opacity-70'
                  : alert.severity === 'critical'
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                  : alert.severity === 'high'
                  ? 'border-orange-300 dark:border-orange-900/60 bg-orange-50/30 dark:bg-orange-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {alert.id}
                    </span>
                    <SeverityBadge severity={alert.severity} />
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : alert.status === 'acknowledged'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                      }`}
                    >
                      {alert.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {alert.timestamp}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>
                </div>

                {/* Actions Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/machines/${alert.machineId}`)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    title="Inspect Machine Sensors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Metric & Machine Footer */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span>
                    Machine:{' '}
                    <button
                      onClick={() => navigate(`/machines/${alert.machineId}`)}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {alert.machineName} ({alert.machineId})
                    </button>
                  </span>
                  {alert.metric && (
                    <span className="font-mono text-[11px]">
                      Trigger: <strong className="text-slate-800 dark:text-slate-200">{alert.triggerValue}</strong> (Limit: {alert.thresholdLimit})
                    </span>
                  )}
                </div>

                {alert.acknowledgedBy && (
                  <span className="text-[11px] text-slate-400">
                    Acknowledged by: <strong>{alert.acknowledgedBy}</strong>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
