import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useSelector } from 'react-redux';
import { Leaf } from 'lucide-react';
import EnvironmentalHeader from './EnvironmentalHeader';

export default function CarbonEntryForm({ onSuccess }) {
  const { user } = useSelector((state) => state.auth);

  const [emissionFactors, setEmissionFactors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [emissionFactor, setEmissionFactor] = useState('');
  const [department, setDepartment] = useState('');
  const [activityValue, setActivityValue] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  // Preview calculation
  const [previewCarbon, setPreviewCarbon] = useState(null);
  const [selectedFactor, setSelectedFactor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        const [factorRes, deptRes, txRes] = await Promise.all([
          axiosClient.get('/emission-factors'),
          axiosClient.get('/departments'),
          axiosClient.get('/carbon-transactions'),
        ]);
        if (factorRes.success) setEmissionFactors(factorRes.data);
        if (deptRes.success) setDepartments(deptRes.data);
        if (txRes.success) setRecentTransactions(txRes.data.slice(0, 5));
      } catch (err) {
        setErrorMsg('Failed to load form data.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pre-fill department from logged-in user
  useEffect(() => {
    if (user?.department?._id && !department) {
      setDepartment(user.department._id);
    } else if (user?.department && typeof user.department === 'string') {
      setDepartment(user.department);
    }
  }, [user]);

  // Live calculation preview
  useEffect(() => {
    if (emissionFactor && activityValue && parseFloat(activityValue) > 0) {
      const factor = emissionFactors.find(f => f._id === emissionFactor);
      if (factor) {
        setSelectedFactor(factor);
        setPreviewCarbon((parseFloat(activityValue) * factor.factor).toFixed(3));
      }
    } else {
      setPreviewCarbon(null);
      setSelectedFactor(null);
    }
  }, [emissionFactor, activityValue, emissionFactors]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidenceFile(file);
      // For demo: create a local object URL (real impl would upload to S3/Cloudinary)
      setEvidenceUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');

    if (!emissionFactor || !department || !activityValue) {
      setErrorMsg('Emission factor, department, and activity value are required.');
      return;
    }
    if (parseFloat(activityValue) <= 0) {
      setErrorMsg('Activity value must be greater than 0.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        emissionFactor,
        department,
        activityValue: parseFloat(activityValue),
        transactionDate,
        description,
        evidenceUrl: evidenceUrl || undefined,
      };

      const res = await axiosClient.post('/carbon-transactions', payload);
      if (res.success) {
        setSuccessMsg(`✓ Carbon transaction logged! ${previewCarbon} kg CO₂ emitted recorded.`);
        // Reset form
        setEmissionFactor('');
        setActivityValue('');
        setDescription('');
        setEvidenceFile(null);
        setEvidenceUrl('');
        setPreviewCarbon(null);
        setSelectedFactor(null);
        setTransactionDate(new Date().toISOString().split('T')[0]);

        // Refresh recent transactions
        const txRes = await axiosClient.get('/carbon-transactions');
        if (txRes.success) setRecentTransactions(txRes.data.slice(0, 5));

        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Failed to log transaction.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-brand-primary font-medium animate-pulse">Loading emission data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <EnvironmentalHeader />

      {/* Header */}
      <div className="bg-neutral-surface p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60">
        <h1 className="text-lg font-display font-black text-[#1F5C4D] flex items-center gap-2">
          <Leaf className="w-5 h-5 text-brand-primary" /> Log Carbon Activity
        </h1>
        <p className="text-xs text-neutral-textMuted mt-0.5 font-medium">Record energy consumption, fleet usage, or business activities for emissions tracking</p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-brand-primary/10 border-l-4 border-brand-primary text-brand-primary rounded-xl text-xs font-bold animate-fade-in">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-brand-alert/10 border-l-4 border-brand-alert text-brand-alert rounded-xl text-xs font-bold animate-fade-in">
          ✗ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Entry Form */}
        <div className="lg:col-span-2 bg-neutral-surface rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60 p-6">
          <h3 className="text-sm font-bold text-neutral-text mb-5 pb-3 border-b border-neutral-border/40 font-display">Activity Details</h3>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Emission Factor */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider mb-1.5">
                Emission Factor *
              </label>
              <select
                required value={emissionFactor} onChange={(e) => setEmissionFactor(e.target.value)}
                className="w-full p-3 border border-neutral-border rounded-xl bg-neutral-bg/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold transition-all duration-200"
              >
                <option value="">Select emission type...</option>
                {emissionFactors.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.factor} kg CO₂ / {f.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                required value={department} onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 border border-neutral-border rounded-xl bg-neutral-bg/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold transition-all duration-200"
                disabled={user?.role === 'Employee'}
              >
                <option value="">Select department...</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
              {user?.role === 'Employee' && (
                <p className="text-[10px] font-bold text-neutral-textMuted mt-1.5 uppercase tracking-wide">Auto-assigned to your department</p>
              )}
            </div>

            {/* Activity Value */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider mb-1.5">
                Activity Value *{selectedFactor ? ` (in ${selectedFactor.unit})` : ''}
              </label>
              <input
                type="number" step="0.01" min="0.01" required
                value={activityValue} onChange={(e) => setActivityValue(e.target.value)}
                placeholder={selectedFactor ? `Enter amount in ${selectedFactor.unit}` : 'Select factor first'}
                className="w-full p-3 border border-neutral-border rounded-xl bg-neutral-bg/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold transition-all duration-200"
              />
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider mb-1.5">
                Activity Date
              </label>
              <input
                type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-neutral-border rounded-xl bg-neutral-bg/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly electricity bill for Office Block A..."
                rows={3}
                className="w-full p-3 border border-neutral-border rounded-xl bg-neutral-bg/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-medium transition-all duration-200 resize-none"
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider mb-1.5">
                Evidence Attachment (Invoice / Receipt)
              </label>
              <div className="border-2 border-dashed border-neutral-border/60 rounded-2xl p-6 text-center hover:border-brand-primary/45 hover:bg-brand-primary/5 transition-all duration-300">
                <input
                  type="file" id="evidence-file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="evidence-file" className="cursor-pointer block w-full h-full">
                  {evidenceFile ? (
                    <div className="text-brand-primary text-sm font-bold flex items-center justify-center gap-2">
                      <span>📎</span> {evidenceFile.name}
                      <span className="text-xs text-[#10241A] font-semibold bg-[#2EE08A]/10 px-2.5 py-0.5 rounded-full">({(evidenceFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  ) : (
                    <div className="text-neutral-textMuted text-xs font-semibold">
                      <div className="text-3xl mb-2 filter grayscale opacity-60">📁</div>
                      Click or drag to attach invoice or receipt (PDF, JPG, PNG)
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-primary hover:bg-[#164237] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-brand-primary/10 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Logging Activity...' : 'Submit Carbon Log'}
            </button>
          </form>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">

          {/* Live Calculation Preview */}
          <div className={`bg-neutral-surface rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border p-5 transition-all duration-300 ${previewCarbon ? 'border-brand-primary/40 shadow-[0_8px_30px_rgba(31,92,77,0.08)]' : 'border-neutral-border/60'}`}>
            <h4 className="font-bold text-neutral-text mb-4 text-xs uppercase tracking-wider font-display">Live Preview</h4>
            {previewCarbon ? (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center py-4 bg-neutral-bg/40 rounded-2xl border border-neutral-border/40">
                  <div className="text-4xl font-display font-black text-brand-primary">{previewCarbon}</div>
                  <div className="text-[10px] text-neutral-textMuted font-bold uppercase tracking-wider mt-1.5">kg CO₂e emitted</div>
                </div>
                <div className="bg-neutral-bg/30 rounded-xl p-3.5 space-y-2 text-xs font-semibold text-neutral-textMuted border border-neutral-border/30">
                  <div className="flex justify-between">
                    <span>Activity</span>
                    <span className="text-neutral-text">{activityValue} {selectedFactor?.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate</span>
                    <span className="text-neutral-text">{selectedFactor?.factor} kg / {selectedFactor?.unit}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-border/30 pt-2 mt-2">
                    <span>Source</span>
                    <span className="text-neutral-text">{selectedFactor?.source || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-textMuted text-xs font-semibold leading-relaxed">
                Select an emission factor and enter activity value to preview CO₂ calculation in real-time
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-neutral-surface rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60 p-5">
            <h4 className="font-bold text-neutral-text mb-4 text-xs uppercase tracking-wider font-display">Recent Logs</h4>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-6 text-neutral-textMuted text-xs font-semibold">No transactions logged yet</div>
            ) : (
              <div className="space-y-3 divide-y divide-neutral-border/30">
                {recentTransactions.map(tx => (
                  <div key={tx._id} className="flex justify-between items-start pt-3 first:pt-0">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-text truncate">
                        {tx.emissionFactor?.name || 'Unknown factor'}
                      </div>
                      <div className="text-[10px] text-neutral-textMuted font-bold uppercase tracking-wider mt-0.5">
                        {tx.department?.code} • {new Date(tx.transactionDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-primary whitespace-nowrap ml-3 bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/15">
                      {tx.carbonEmitted?.toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
