import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import * as scoringApi from '../../api/scoring.api';
import { FileText, Download, Loader2, Leaf, Users, Scale, BarChart3 } from 'lucide-react';

const REPORT_TYPES = [
  {
    id: 'env',
    title: 'Environmental Report',
    description: 'Carbon emissions, sustainability goals, and emission factors breakdown.',
    icon: Leaf,
    color: 'border-module-environmental',
    accent: 'text-module-environmental',
  },
  {
    id: 'social',
    title: 'Social Report',
    description: 'CSR activity participation, diversity metrics, and training completion.',
    icon: Users,
    color: 'border-module-social',
    accent: 'text-module-social',
  },
  {
    id: 'governance',
    title: 'Governance Report',
    description: 'Policy acknowledgement rates, audit findings, and compliance issue status.',
    icon: Scale,
    color: 'border-module-governance',
    accent: 'text-module-governance',
  },
  {
    id: 'esg-summary',
    title: 'ESG Summary Report',
    description: 'Full combined Env/Social/Gov score rollup per department.',
    icon: BarChart3,
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
      const blob = await scoringApi.exportReport({ module: type, type: format });
      // axiosClient returns response.data directly (already the blob due to responseType)
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ESG_${type}_Report.${format === 'Excel' ? 'xlsx' : format.toLowerCase()}`);
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
        <p className="text-sm text-neutral-textMuted font-medium">
          Download pre-built standard reports. Data is pulled live from the database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORT_TYPES.map(({ id, title, description, icon: Icon, color, accent }) => (
          <div
            key={id}
            className={`bg-neutral-surface rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60 border-l-4 ${color} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2.5 bg-neutral-bg/60 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={18} className={accent} />
              </div>
              <div>
                <h3 className={`font-display font-bold text-neutral-text text-sm`}>{title}</h3>
                <p className="text-xs text-neutral-textMuted font-medium mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['CSV', 'Excel', 'PDF'].map((fmt) => {
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
