import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Trash2,
  Plus,
} from 'lucide-react';
import { useMachines } from '../context/MachineContext';
import { reportService } from '../services';
import type { GeneratedReport, ReportType, ReportFormat } from '../types';
import { initialReports } from '../data';
import { exportToCsv, triggerPrint } from '../utils/exportUtils';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const { machines } = useMachines();
  const [reports, setReports] = useState<GeneratedReport[]>(initialReports);

  // Form generator state
  const [reportType, setReportType] = useState<ReportType>('machine_health');
  const [dateRange, setDateRange] = useState<'today' | 'last_7_days' | 'last_30_days' | 'last_quarter' | 'year_to_date'>('last_30_days');
  const [selectedFactory, setSelectedFactory] = useState('All Global Facilities');
  const [format, setFormat] = useState<ReportFormat>('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTemplates: { type: ReportType; title: string; desc: string; icon: any }[] = [
    {
      type: 'machine_health',
      title: 'Machine Fleet Condition Report',
      desc: 'Sensor telemetry, tool wear degradation, and risk scores across 50 production units.',
      icon: FileBarChart,
    },
    {
      type: 'maintenance_audit',
      title: 'Maintenance & Work Order Audit',
      desc: 'Preventive intervention logs, technician hours, parts cost, and failure modes avoided.',
      icon: FileText,
    },
    {
      type: 'prediction_anomaly',
      title: 'AI Prediction & Anomaly Log',
      desc: 'Model inference confidence, XGBoost forewarnings, and SHAP feature importance attributions.',
      icon: FileSpreadsheet,
    },
    {
      type: 'factory_oee',
      title: 'Factory OEE & Availability Benchmark',
      desc: 'TPM metrics: Availability × Performance × Quality pillar breakdowns by shift.',
      icon: FileBarChart,
    },
    {
      type: 'downtime_root_cause',
      title: 'Downtime & Pareto Root Cause Analysis',
      desc: 'Categorized machine stoppages, MTBF, MTTR, and financial downtime impact.',
      icon: FileText,
    },
  ];

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const newRep = await reportService.generateReport({
        type: reportType,
        dateRange,
        factory: selectedFactory,
        format,
      });

      setReports([newRep, ...reports]);
      toast.success(`Generated: ${newRep.title}`);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCsv = (report: GeneratedReport) => {
    exportToCsv(
      `predictx-${report.type}-${report.id}`,
      machines.map((m) => ({
        ID: m.id,
        Name: m.name,
        Factory: m.factory,
        Status: m.status,
        Risk: m.risk,
        Health: `${m.healthPercentage}%`,
        ProcTemp: `${m.processTemperature}°C`,
        RPM: m.rpm,
        Torque: `${m.torque} Nm`,
        ToolWear: `${m.toolWear} min`,
        LastMaintenance: m.lastMaintenance,
      }))
    );
    toast.success(`Downloaded ${report.title} (CSV)`);
  };

  const handleDelete = async (id: string) => {
    await reportService.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success('Report deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reports & Regulatory Compliance Audit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              ISO 13374 Ready
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Generate and export industrial maintenance records, OEE efficiency audits, and AI prognostic logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E5E5DE] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Current View</span>
          </button>
        </div>
      </div>

      {/* Generator Form & Template Selection */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Configure New Plant Report
        </h2>

        <form onSubmit={handleGenerateReport} className="space-y-5">
          {/* Template Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Report Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTemplates.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = reportType === tmpl.type;
                return (
                  <div
                    key={tmpl.type}
                    onClick={() => setReportType(tmpl.type)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {tmpl.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {tmpl.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reporting Period
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="today">Today (Shift 1 & 2)</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days (Monthly Audit)</option>
                <option value="last_quarter">Last Quarter (Q4 Review)</option>
                <option value="year_to_date">Year to Date (Annual)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturing Facility
              </label>
              <select
                value={selectedFactory}
                onChange={(e) => setSelectedFactory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="All Global Facilities">All Global Facilities (Aggregate)</option>
                <option value="Factory Alpha (Detroit Hub)">Factory Alpha (Detroit Hub)</option>
                <option value="Factory Beta (Munich Gigaplant)">Factory Beta (Munich Gigaplant)</option>
                <option value="Factory Gamma (Yokohama Plant)">Factory Gamma (Yokohama Plant)</option>
                <option value="Factory Delta (Austin Facility)">Factory Delta (Austin Facility)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Export Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ReportFormat)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="csv">CSV (Comma-Separated Values Data Stream)</option>
                <option value="pdf">PDF (Printable Formatted Document)</option>
                <option value="xlsx">XLSX (Microsoft Excel Industrial Workbook)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{isGenerating ? 'Compiling Dataset...' : 'Generate Plant Report'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Reports Archive */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Generated Reports Archive ({reports.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Permanently archived for quality audits and safety compliance
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Storage: 24.8 MB</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {reports.map((report) => (
            <div
              key={report.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {report.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {report.title}
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {report.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">{report.summary}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                  <span>Period: {report.period}</span>
                  <span>Size: {report.fileSize}</span>
                  <span>Records: {report.recordCount}</span>
                  <span>Author: {report.generatedBy}</span>
                </div>
              </div>

              {/* Download / Export actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownloadCsv(report)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
                  title="Download CSV"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={triggerPrint}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  title="Print Report"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500"
                  title="Delete Report"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
