import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import * as scoringApi from '../../api/scoring.api';
import { Filter, Download, Loader2, FileSpreadsheet, FileText } from 'lucide-react';

const MODULES = ['Environmental', 'Social', 'Governance', 'All'];
const FORMATS = ['CSV', 'Excel'];

const CustomReportBuilder = () => {
  const [filters, setFilters] = useState({
    module: 'All',
    dateFrom: '',
    dateTo: '',
    format: 'CSV',
  });
  const [exporting, setExporting] = useState(false);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await scoringApi.exportReport({ type: filters.format, filters });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ESG_Custom_${filters.module}_${Date.now()}.${filters.format === 'Excel' ? 'xlsx' : 'csv'}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Export failed. Make sure the backend is running.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-gray-500">
        Build a custom report by selecting filters below, then export as CSV or Excel.
      </p>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={16} className="text-brand-primary" />
          <h2 className="text-base font-display font-semibold text-neutral-text">Report Filters</h2>
        </div>

        {/* Module selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">ESG Module</label>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <button
                key={m}
                onClick={() => setFilters((prev) => ({ ...prev, module: m }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filters.module === m
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
        </div>

        {/* Format selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-1">Export Format</label>
          <div className="flex gap-3">
            {FORMATS.map((f) => (
              <label
                key={f}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                  filters.format === f
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={filters.format === f}
                  onChange={handleChange}
                  className="hidden"
                />
                {f === 'CSV' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}
                {f}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Summary preview */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800">
        <p className="font-medium mb-1">Export Preview</p>
        <p>
          Module: <strong>{filters.module}</strong> &nbsp;|&nbsp; Format:{' '}
          <strong>{filters.format}</strong>
          {filters.dateFrom && ` | From: ${filters.dateFrom}`}
          {filters.dateTo && ` → ${filters.dateTo}`}
        </p>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-green-800 transition-all disabled:opacity-60 shadow-md"
      >
        {exporting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {exporting ? 'Generating Report…' : 'Generate & Download Report'}
      </button>
    </div>
  );
};

export default CustomReportBuilder;
