import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  RotateCcw,
} from 'lucide-react';
import { useMachines } from '../context/MachineContext';
import type { Machine, MachineStatus, RiskLevel } from '../types';
import { StatusBadge, RiskBadge } from '../components/Badges';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Modal, ConfirmationDialog } from '../components/Modal';
import { exportToCsv } from '../utils/exportUtils';
import toast from 'react-hot-toast';

export const Machines: React.FC = () => {
  const navigate = useNavigate();
  const { machines, addMachine, updateMachine, deleteMachine, resetToDefaults } = useMachines();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState<Machine | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState(() => ({
    name: '',
    type: 'CNC 5-Axis Milling Center',
    factory: 'Factory Alpha (Detroit Hub)',
    location: 'Bay 1 - Machining',
    airTemperature: 24.5,
    processTemperature: 34.0,
    rpm: 1500,
    torque: 42.0,
    toolWear: 50,
    status: 'healthy' as MachineStatus,
    risk: 'Low' as RiskLevel,
    riskScore: 15,
    healthPercentage: 95,
    uptimeHours: 2400,
    serialNumber: 'SN-PX-2024-5100',
    operator: 'Dr. Marcus Vance',
    installedDate: '2023-01-15',
    firmwareVersion: 'v4.2.1-industrial',
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextScheduledMaintenance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  }));

  const uniqueFactories = useMemo(() => {
    return Array.from(new Set(machines.map((m) => m.factory)));
  }, [machines]);

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch =
        machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.operator.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFactory = selectedFactory === 'all' || machine.factory === selectedFactory;
      const matchesStatus = selectedStatus === 'all' || machine.status === selectedStatus;
      const matchesRisk = selectedRisk === 'all' || machine.risk === selectedRisk;

      return matchesSearch && matchesFactory && matchesStatus && matchesRisk;
    });
  }, [machines, searchQuery, selectedFactory, selectedStatus, selectedRisk]);

  const handleOpenAdd = () => {
    setFormData({
      name: `CNC Machining Center Unit #${machines.length + 1}`,
      type: 'CNC 5-Axis Milling Center',
      factory: 'Factory Alpha (Detroit Hub)',
      location: 'Bay 1 - Machining',
      airTemperature: 24.5,
      processTemperature: 34.0,
      rpm: 1520,
      torque: 41.5,
      toolWear: 45,
      status: 'healthy',
      risk: 'Low',
      riskScore: 12,
      healthPercentage: 98,
      uptimeHours: 120,
      serialNumber: `SN-PX-2026-${4200 + machines.length}`,
      operator: 'Dr. Marcus Vance',
      installedDate: new Date().toISOString().split('T')[0],
      firmwareVersion: 'v4.3.0-industrial',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextScheduledMaintenance: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (machine: Machine, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMachineToEdit(machine);
    setFormData({
      name: machine.name,
      type: machine.type,
      factory: machine.factory,
      location: machine.location,
      airTemperature: machine.airTemperature,
      processTemperature: machine.processTemperature,
      rpm: machine.rpm,
      torque: machine.torque,
      toolWear: machine.toolWear,
      status: machine.status,
      risk: machine.risk,
      riskScore: machine.riskScore,
      healthPercentage: machine.healthPercentage,
      uptimeHours: machine.uptimeHours,
      serialNumber: machine.serialNumber,
      operator: machine.operator,
      installedDate: machine.installedDate,
      firmwareVersion: machine.firmwareVersion,
      lastMaintenance: machine.lastMaintenance,
      nextScheduledMaintenance: machine.nextScheduledMaintenance,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (machine: Machine, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMachineToDelete(machine);
    setIsDeleteModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMachine(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineToEdit) return;
    await updateMachine(machineToEdit.id, formData);
    setIsEditModalOpen(false);
    setMachineToEdit(null);
  };

  const handleConfirmDelete = async () => {
    if (!machineToDelete) return;
    await deleteMachine(machineToDelete.id);
    setIsDeleteModalOpen(false);
    setMachineToDelete(null);
  };

  const handleExportCSV = () => {
    exportToCsv(
      `predictx-machines-${new Date().toISOString().split('T')[0]}`,
      filteredMachines.map((m) => ({
        ID: m.id,
        Name: m.name,
        Type: m.type,
        Factory: m.factory,
        Location: m.location,
        Status: m.status,
        Risk: m.risk,
        HealthPercent: m.healthPercentage,
        AirTemp_C: m.airTemperature,
        ProcessTemp_C: m.processTemperature,
        RPM: m.rpm,
        Torque_Nm: m.torque,
        ToolWear_min: m.toolWear,
        LastMaintenance: m.lastMaintenance,
        NextMaintenance: m.nextScheduledMaintenance,
        Operator: m.operator,
      }))
    );
    toast.success(`Exported ${filteredMachines.length} machines to CSV`);
  };

  const columns: Column<Machine>[] = [
    {
      key: 'id',
      header: 'Machine ID',
      sortable: true,
      render: (m) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{m.id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Machine Name',
      sortable: true,
      render: (m) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">{m.name}</span>
          <span className="text-[10px] text-slate-400">{m.type}</span>
        </div>
      ),
    },
    {
      key: 'factory',
      header: 'Factory & Bay',
      sortable: true,
      render: (m) => (
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300 block">{m.factory.split('(')[0]}</span>
          <span className="text-[10px] text-slate-400">{m.location}</span>
        </div>
      ),
    },
    {
      key: 'processTemperature',
      header: 'Temp (Air/Proc)',
      sortable: true,
      render: (m) => (
        <div className="font-mono text-[11px]">
          <span className={m.processTemperature > 40 ? 'text-rose-500 font-bold' : ''}>
            {m.processTemperature}°C
          </span>
          <span className="text-slate-400 text-[10px] ml-1">({m.airTemperature}°C)</span>
        </div>
      ),
    },
    {
      key: 'rpm',
      header: 'RPM',
      sortable: true,
      render: (m) => <span className="font-mono font-medium">{m.rpm.toLocaleString()}</span>,
    },
    {
      key: 'torque',
      header: 'Torque',
      sortable: true,
      render: (m) => (
        <span className={`font-mono font-medium ${m.torque > 60 ? 'text-rose-500 font-bold' : ''}`}>
          {m.torque} Nm
        </span>
      ),
    },
    {
      key: 'toolWear',
      header: 'Tool Wear',
      sortable: true,
      render: (m) => (
        <div className="w-24">
          <div className="flex justify-between text-[10px] font-mono mb-0.5">
            <span>{m.toolWear} min</span>
            <span className={m.toolWear > 200 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
              {m.toolWear > 200 ? 'EXCEEDED' : `${Math.round((m.toolWear / 240) * 100)}%`}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                m.toolWear > 200 ? 'bg-rose-500' : m.toolWear > 150 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (m.toolWear / 240) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: 'risk',
      header: 'Risk',
      sortable: true,
      render: (m) => <RiskBadge risk={m.risk} />,
    },
    {
      key: 'lastMaintenance',
      header: 'Last Maint',
      sortable: true,
      render: (m) => <span className="text-[11px] font-mono text-slate-500">{m.lastMaintenance}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/machines/${m.id}`)}
            className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            title="Inspect Machine Telemetry"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleOpenEdit(m, e)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Machine Specifications"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => handleOpenDelete(m, e)}
            className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Decommission Machine"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Machine Fleet Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Monitoring 50 connected CNCs, presses, turbines, and robotic workcells.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-all cursor-pointer"
            title="Reset Mock Fleet Data"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Fleet</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Machine</span>
          </button>
        </div>
      </div>

      {/* Search, Filter Bar & View Toggle */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, machine name, type, operator..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Filter: Factory */}
          <div className="relative">
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              aria-label="Filter by Factory Location"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Factories (Global)</option>
              {uniqueFactories.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by Machine Status"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="healthy">Healthy Only</option>
              <option value="warning">Warning Only</option>
              <option value="critical">Critical Only</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Filter: Risk */}
          <div className="relative">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              aria-label="Filter by Risk Category"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {filteredMachines.length} units
            </span>
          </div>
        </div>
      </div>

      {/* Main Machine View: Table vs Grid */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredMachines}
          keyExtractor={(m) => m.id}
          pageSize={10}
          onRowClick={(m) => navigate(`/machines/${m.id}`)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              onClick={() => navigate(`/machines/${machine.id}`)}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/50 transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {machine.id}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight mt-0.5">
                    {machine.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">{machine.location}</span>
                </div>
                <StatusBadge status={machine.status} />
              </div>

              {/* Sensor stats metrics mini grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Temperature</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {machine.processTemperature}°C
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Speed</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {machine.rpm} RPM
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Torque</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {machine.torque} Nm
                  </span>
                </div>
              </div>

              {/* Tool wear bar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <span>Tool Wear: {machine.toolWear} min</span>
                  <RiskBadge risk={machine.risk} />
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      machine.toolWear > 200
                        ? 'bg-rose-500'
                        : machine.toolWear > 150
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (machine.toolWear / 240) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer info & actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span>Health: {machine.healthPercentage}%</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleOpenEdit(machine, e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleOpenDelete(machine, e)}
                    className="p-1 rounded text-rose-400 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Machine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Factory Machine"
        subtitle="Provision a SCADA-connected industrial machine into PredictX."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Machine Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Machine Type / Model
              </label>
              <input
                type="text"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plant Facility
              </label>
              <select
                value={formData.factory}
                onChange={(e) => setFormData({ ...formData, factory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                {uniqueFactories.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shop Floor Location / Bay
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Sensor Parameters */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-3">
              Baseline Sensor Telemetry
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Air Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.airTemperature}
                  onChange={(e) => setFormData({ ...formData, airTemperature: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Process Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.processTemperature}
                  onChange={(e) => setFormData({ ...formData, processTemperature: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Spindle RPM</label>
                <input
                  type="number"
                  value={formData.rpm}
                  onChange={(e) => setFormData({ ...formData, rpm: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Torque (Nm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.torque}
                  onChange={(e) => setFormData({ ...formData, torque: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Tool Wear (min)</label>
                <input
                  type="number"
                  value={formData.toolWear}
                  onChange={(e) => setFormData({ ...formData, toolWear: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5DE] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5E5DE] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs cursor-pointer"
            >
              Register Machine
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Machine Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Machine: ${machineToEdit?.name || ''}`}
        subtitle="Modify machine status, telemetry tolerances, and metadata."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Machine Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operating Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MachineStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Proc Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.processTemperature}
                onChange={(e) => setFormData({ ...formData, processTemperature: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">RPM</label>
              <input
                type="number"
                value={formData.rpm}
                onChange={(e) => setFormData({ ...formData, rpm: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Torque (Nm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.torque}
                onChange={(e) => setFormData({ ...formData, torque: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Tool Wear (min)</label>
              <input
                type="number"
                value={formData.toolWear}
                onChange={(e) => setFormData({ ...formData, toolWear: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5DE] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5E5DE] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Decommission Machine ${machineToDelete?.id}?`}
        message={`Are you sure you want to remove ${machineToDelete?.name} (${machineToDelete?.id}) from the active monitoring fleet? All sensor historical telemetry streams will be archived.`}
        confirmText="Decommission Machine"
        variant="danger"
      />
    </div>
  );
};
