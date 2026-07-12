import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, Plus, Trash2, Calendar, FileText, BarChart2 } from 'lucide-react';
import environmentalApi from '../../api/environmental.api';
import axiosClient from '../../api/axiosClient';

export default function CarbonTransactionBoard() {
  const { user } = useSelector((state) => state.auth);
  const isAdminOrManager = ['Admin', 'Manager'].includes(user?.role);

  const [transactions, setTransactions] = useState([]);
  const [factors, setFactors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [emissionFactor, setEmissionFactor] = useState('');
  const [department, setDepartment] = useState('');
  const [activityValue, setActivityValue] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [selectedFactor, setSelectedFactor] = useState(null);
  const [previewCarbon, setPreviewCarbon] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept) params.departmentId = selectedDept;
      
      const [txRes, factorRes, deptRes] = await Promise.all([
        environmentalApi.getCarbonTransactions(params),
        axiosClient.get('/emission-factors'),
        axiosClient.get('/departments'),
      ]);

      if (txRes.success) setTransactions(txRes.data);
      if (factorRes.success) setFactors(factorRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  // Pre-fill department for the form
  useEffect(() => {
    if (showModal && user) {
      const userDeptId = user.department?._id || user.department;
      if (userDeptId) {
        setDepartment(userDeptId);
      }
    }
  }, [showModal, user]);

  // Live preview calculation
  useEffect(() => {
    if (emissionFactor && activityValue && parseFloat(activityValue) > 0) {
      const factorDoc = factors.find(f => f._id === emissionFactor);
      if (factorDoc) {
        setSelectedFactor(factorDoc);
        setPreviewCarbon((parseFloat(activityValue) * factorDoc.factor).toFixed(3));
      }
    } else {
      setSelectedFactor(null);
      setPreviewCarbon(null);
    }
  }, [emissionFactor, activityValue, factors]);

  const resetForm = () => {
    setEmissionFactor('');
    setDepartment('');
    setActivityValue('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setEvidenceUrl('');
    setSelectedFactor(null);
    setPreviewCarbon(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emissionFactor || !department || !activityValue) {
      setErrorMsg('Emission factor, department, and activity value are required.');
      return;
    }

    const payload = {
      emissionFactor,
      department,
      activityValue: parseFloat(activityValue),
      transactionDate,
      description,
      evidenceUrl: evidenceUrl || undefined,
    };

    try {
      const res = await environmentalApi.createCarbonTransaction(payload);
      if (res.success) {
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        setErrorMsg(res.message || 'Failed to log transaction.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this carbon transaction? This will recalculate department ESG scores.')) return;
    try {
      const res = await environmentalApi.deleteCarbonTransaction(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Delete failed.');
    }
  };

  // Filtered transactions for client-side search
  const filteredTransactions = transactions.filter(tx => {
    const descMatches = tx.description ? tx.description.toLowerCase().includes(search.toLowerCase()) : false;
    const factorMatches = tx.emissionFactor?.name ? tx.emissionFactor.name.toLowerCase().includes(search.toLowerCase()) : false;
    const deptMatches = tx.department?.code ? tx.department.code.toLowerCase().includes(search.toLowerCase()) : false;
    return search === '' || descMatches || factorMatches || deptMatches;
  });

  const totalCarbon = filteredTransactions.reduce((sum, tx) => sum + (tx.carbonEmitted || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-textSecondary uppercase tracking-wider">Total CO₂ Emitted</p>
            <p className="text-2xl font-bold text-neutral-text mt-0.5">
              {totalCarbon.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-sm font-normal text-neutral-textSecondary">kg CO₂e</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-textSecondary uppercase tracking-wider">Logs Count</p>
            <p className="text-2xl font-bold text-neutral-text mt-0.5">{filteredTransactions.length}</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative max-w-xs flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="p-2 border border-neutral-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
          </select>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-brand-primary text-neutral-surface rounded-xl text-sm font-semibold hover:bg-brand-primary/95 transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={16} />
          Log Carbon
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-neutral-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-bg/60 border-b border-neutral-border">
              <tr>
                {['Date', 'Factor Type', 'Activity Description', 'Value', 'Carbon Emitted', 'Department', 'Logged By', ...(isAdminOrManager ? [''] : [])].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-neutral-textSecondary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/40">
              {loading && filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrManager ? 8 : 7} className="px-6 py-12 text-center text-neutral-textSecondary">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrManager ? 8 : 7} className="px-6 py-12 text-center text-neutral-textSecondary">
                    No carbon transactions logged.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-neutral-bg/30 transition-colors">
                    <td className="px-6 py-4 text-neutral-textSecondary text-xs whitespace-nowrap">
                      {new Date(tx.transactionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-neutral-text">
                      {tx.emissionFactor?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-neutral-textSecondary text-xs">
                      {tx.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-neutral-textSecondary text-xs whitespace-nowrap">
                      {tx.activityValue} <span className="text-[10px]">{tx.emissionFactor?.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-brand-primary">{tx.carbonEmitted?.toFixed(2)}</span> <span className="text-xs text-neutral-textSecondary">kg CO₂e</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-neutral-bg rounded text-xs font-semibold text-neutral-textSecondary">{tx.department?.code || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-textSecondary">
                      {tx.user?.username || '—'}
                    </td>
                    {isAdminOrManager && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1.5 text-neutral-textSecondary hover:text-brand-alert hover:bg-red-50 rounded-lg transition"
                          title="Delete Transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-border relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-neutral-text mb-4 pb-2 border-b border-neutral-border">
              🌿 Log Carbon Activity
            </h3>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-brand-alert border border-brand-alert/20 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Emission Factor</label>
                <select
                  required
                  value={emissionFactor}
                  onChange={(e) => setEmissionFactor(e.target.value)}
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                >
                  <option value="">Select emission type...</option>
                  {factors.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.factor} kg CO₂ / {f.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Department</label>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                  disabled={user?.role === 'Employee'}
                >
                  <option value="">Select department...</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">
                  Activity Value {selectedFactor ? `(in ${selectedFactor.unit})` : ''}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={activityValue}
                  onChange={(e) => setActivityValue(e.target.value)}
                  placeholder={selectedFactor ? `Amount in ${selectedFactor.unit}` : 'Enter amount'}
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Activity Date</label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Monthly office utility consumption..."
                  rows={2}
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm resize-none"
                />
              </div>

              {/* Live Preview */}
              {previewCarbon && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider">Calculation Preview</span>
                  <p className="text-xl font-bold text-brand-primary mt-0.5">{previewCarbon} kg CO₂e</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-neutral-border">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-primary text-neutral-surface rounded-xl text-sm font-semibold hover:bg-brand-primary/95 transition shadow-sm"
                >
                  Log Carbon
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-neutral-border rounded-xl text-sm font-semibold text-neutral-textSecondary hover:text-neutral-text transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
