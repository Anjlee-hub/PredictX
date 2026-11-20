import React, { useState, useMemo } from 'react';
import {
  Plus,
  Calendar,
  List,
  Layers,
  Search,
  Trash2,
  CheckSquare,
  CalendarDays,
} from 'lucide-react';
import { useMachines } from '../context/MachineContext';
import type { MaintenanceRecord, MaintenancePriority, MaintenanceStatus } from '../types';
import { initialMaintenanceRecords, mockEngineers } from '../data';
import { PriorityBadge } from '../components/Badges';
import { Modal, ConfirmationDialog } from '../components/Modal';
import toast from 'react-hot-toast';

export const Maintenance: React.FC = () => {
  const { machines } = useMachines();
  const [records, setRecords] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);

  // View toggle: table vs timeline vs calendar
  const [viewMode, setViewMode] = useState<'table' | 'timeline' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);

  // New Work order form state
  const [formData, setFormData] = useState(() => ({
    machineId: machines[0]?.id || 'MAC-004',
    title: 'Routine Spindle Inspection & Vibration Audit',
    priority: 'high' as MaintenancePriority,
    engineerId: mockEngineers[0].id,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    estimatedHours: 3.5,
    cost: 1200,
    description: 'Inspect bearing play and lubricant clarity after continuous machining cycle.',
    tasks: 'Inspect drive belt\nMeasure laser runout\nSample lubrication oil',
  }));

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.engineer.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [records, searchQuery, statusFilter, priorityFilter]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = machines.find((m) => m.id === formData.machineId);
    const engineer = mockEngineers.find((eng) => eng.id === formData.engineerId) || mockEngineers[0];

    const newRecord: MaintenanceRecord = {
      id: `WO-${Math.floor(8050 + Math.random() * 500)}`,
      machineId: formData.machineId,
      machineName: machine ? machine.name : 'Factory Unit',
      title: formData.title,
      priority: formData.priority,
      engineer,
      status: 'scheduled',
      dueDate: formData.dueDate,
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedHours: formData.estimatedHours,
      cost: formData.cost,
      description: formData.description,
      tasks: formData.tasks.split('\n').filter((t) => t.trim()),
      checklist: formData.tasks
        .split('\n')
        .filter((t) => t.trim())
        .map((t) => ({ item: t, completed: false })),
    };

    setRecords([newRecord, ...records]);
    setIsCreateModalOpen(false);
    toast.success(`Work Order ${newRecord.id} scheduled`);
  };

  const handleMarkComplete = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'completed',
              completedDate: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
    toast.success(`Work Order ${id} marked as Completed`);
  };

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
    toast.success('Work order deleted');
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const config = {
      scheduled: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      in_progress: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      overdue: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    }[status] || 'bg-slate-500/10 text-slate-500 border-slate-200';

    const label = status.replace('_', ' ').toUpperCase();
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${config}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Maintenance & Work Order Dispatch
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              CMMS Integrated
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Schedule prescriptive repairs, assign certified reliability engineers, and track preventive tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Timeline View"
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Calendar Schedule"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Work Order</span>
          </button>
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
              placeholder="Search work orders, machines, engineers..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Maintenance Status"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by Maintenance Priority"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View: Table vs Timeline vs Calendar */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Order ID & Title</th>
                  <th className="py-3 px-4">Target Machine</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Lead Engineer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Est. Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold block text-[11px]">
                        {record.id}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                        {record.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">
                        {record.machineName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{record.machineId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={record.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={record.engineer.avatar}
                          alt={record.engineer.name}
                          className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-200 block">
                            {record.engineer.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{record.engineer.role.split(' ')[0]}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(record.status)}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {record.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {record.estimatedHours} hrs
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {record.status !== 'completed' && (
                          <button
                            onClick={() => handleMarkComplete(record.id)}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Mark as Completed"
                          >
                            <CheckSquare className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setRecordToDelete(record);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {filteredRecords.map((record) => (
              <div key={record.id} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 ${
                    record.priority === 'urgent'
                      ? 'border-rose-500 text-rose-500'
                      : 'border-blue-500 text-blue-500'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      record.priority === 'urgent' ? 'bg-rose-500' : 'bg-blue-500'
                    }`}
                  />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {record.id}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {record.title}
                      </h4>
                      <PriorityBadge priority={record.priority} />
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(record.status)}
                      <span className="font-mono text-slate-400">Target: {record.dueDate}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mb-3">{record.description}</p>

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <img
                        src={record.engineer.avatar}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      <span>Assigned: {record.engineer.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>Machine: {record.machineName}</span>
                      <span>Est: {record.estimatedHours} hrs</span>
                      <span>Cost: ${record.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Schedule View */}
      {viewMode === 'calendar' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                November 2026 Shift Maintenance Schedule
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Plant Shift A & B</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-2 font-bold uppercase text-[11px] text-slate-400">
                {day}
              </div>
            ))}

            {Array.from({ length: 14 }).map((_, i) => {
              const dayNum = 10 + i;
              const dayOrders = records.filter(
                (r) => r.dueDate.includes(String(dayNum)) || (i === 4 && r.priority === 'urgent')
              );

              return (
                <div
                  key={i}
                  className="min-h-28 p-2 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/30 text-left flex flex-col justify-between"
                >
                  <span className="font-mono text-xs font-bold text-slate-400">{dayNum}</span>

                  <div className="space-y-1 my-1">
                    {dayOrders.slice(0, 2).map((ord) => (
                      <div
                        key={ord.id}
                        className={`p-1 rounded text-[10px] font-medium truncate ${
                          ord.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-500 font-bold border border-rose-500/30'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                        title={ord.title}
                      >
                        {ord.title}
                      </div>
                    ))}
                  </div>

                  {dayOrders.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{dayOrders.length - 2} more</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Preventive Work Order"
        subtitle="Assign technical resources and specify maintenance tasks."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Order Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Machine
              </label>
              <select
                value={formData.machineId}
                onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="urgent">Urgent (Immediate line stoppage risk)</option>
                <option value="high">High (Next 24h)</option>
                <option value="medium">Medium (Within 7d)</option>
                <option value="low">Low (Standard routine)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Certified Engineer
              </label>
              <select
                value={formData.engineerId}
                onChange={(e) => setFormData({ ...formData, engineerId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                {mockEngineers.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.name} ({eng.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Failure Mode Addressed
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Checklist Items (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.tasks}
              onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E5DE] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5E5DE] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs cursor-pointer"
            >
              Dispatch Work Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete Work Order ${recordToDelete?.id}?`}
        message="Are you sure you want to cancel this maintenance order? Logged technician history will be removed."
        confirmText="Delete Order"
        variant="danger"
      />
    </div>
  );
};
