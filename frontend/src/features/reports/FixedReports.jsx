import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import * as scoringApi from '../../api/scoring.api';
import { FileText, Download, Loader2 } from 'lucide-react';

const REPORT_TYPES = [
  {
    id: 'env',
    title: 'Environmental Report',
    description: 'Carbon emissions, sustainability goals, and emission factors breakdown.',
    icon: '🌱',
    color: 'border-module-environmental',
    accent: 'text-module-environmental',
  },
  {
    id: 'social',
    title: 'Social Report',
    description: 'CSR activity participation, diversity metrics, and training completion.',
    icon: '🤝',
    color: 'border-module-social',
    accent: 'text-module-social',
  },
  {
    id: 'governance',
    title: 'Governance Report',
    description: 'Policy acknowledgement rates, audit findings, and compliance issue status.',
    icon: '⚖️',
    color: 'border-module-governance',
    accent: 'text-module-governance',
  },
  {
    id: 'esg-summary',
    title: 'ESG Summary Report',
    description: 'Full combined Env/Social/Gov score rollup per department.',
    icon: '📊',
    color: 'border-brand-primary',
    accent: 'text-brand-primary',
  },
];

const FixedReports = () => {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type, format) => {
    const key = `${type}-${format}`;
    setExporting(key);
    try {
      const blob = await scoringApi.exportReport({ type: format });
      // axiosClient returns response.data directly (already the blob due to responseType)
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ESG_Report.${format === 'Excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Export failed. Make sure the backend is running.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Download pre-built standard reports. Data is pulled live from the database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORT_TYPES.map(({ id, title, description, icon, color, accent }) => (
          <div
            key={id}
            className={`bg-white rounded-xl p-6 shadow-sm border-l-4 border border-gray-100 ${color} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <h3 className={`font-display font-semibold text-neutral-text`}>{title}</h3>
                <p className="text-xs text-gray-400 mt-1">{description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['CSV', 'Excel'].map((fmt) => {
                const key = `${id}-${fmt}`;
                const loading = exporting === key;
                return (
                  <button
                    key={fmt}
                    onClick={() => handleExport(id, fmt)}
                    disabled={!!exporting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                      fmt === 'CSV'
                        ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        : `border-current ${accent} hover:opacity-80`
                    }`}
                  >
                    {loading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    {loading ? 'Exporting…' : fmt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FixedReports;
