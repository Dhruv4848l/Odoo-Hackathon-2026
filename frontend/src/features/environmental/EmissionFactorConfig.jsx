import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useSelector } from 'react-redux';

export default function EmissionFactorConfig() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'Admin';

  const [factors, setFactors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [factor, setFactor] = useState('');
  const [unit, setUnit] = useState('');
  const [source, setSource] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [factorRes, catRes] = await Promise.all([
        axiosClient.get('/emission-factors'),
        axiosClient.get('/categories?type=Emission'),
      ]);
      if (factorRes.success) setFactors(factorRes.data);
      if (catRes.success) {
        // Filter to only emission categories for the dropdown
        setCategories(catRes.data.filter(c => c.type === 'Emission'));
      }
    } catch (err) {
      setErrorMsg('Failed to load emission factors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setName(''); setCategory(''); setFactor(''); setUnit(''); setSource('');
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (f) => {
    setName(f.name);
    setCategory(f.category._id);
    setFactor(f.factor);
    setUnit(f.unit);
    setSource(f.source || '');
    setEditingId(f._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    if (!name || !category || !factor || !unit) {
      setErrorMsg('Name, category, factor and unit are required.');
      return;
    }
    try {
      setLoading(true);
      const payload = { name, category, factor: parseFloat(factor), unit, source };
      let res;
      if (editingId) {
        res = await axiosClient.put(`/emission-factors/${editingId}`, payload);
      } else {
        res = await axiosClient.post('/emission-factors', payload);
      }
      if (res.success) {
        setSuccessMsg(editingId ? 'Emission factor updated!' : 'Emission factor created!');
        resetForm();
        fetchData();
      } else {
        setErrorMsg(res.message || 'Operation failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, factorName) => {
    if (!window.confirm(`Delete "${factorName}"? This cannot be undone.`)) return;
    setSuccessMsg(''); setErrorMsg('');
    try {
      const res = await axiosClient.delete(`/emission-factors/${id}`);
      if (res.success) {
        setSuccessMsg('Factor deleted successfully.');
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="p-6 bg-neutral-bg min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center bg-neutral-surface p-6 rounded-xl shadow-md border border-neutral-border/60">
          <div>
            <h1 className="text-2xl font-display font-bold text-brand-primary">📊 Emission Factor Library</h1>
            <p className="text-sm text-neutral-textMuted mt-1">Industry-standard kg CO₂ conversion rates per activity unit</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg font-medium text-sm hover:bg-brand-primary/90 transition-all shadow-sm"
            >
              {showForm ? '✕ Cancel' : '+ Add Factor'}
            </button>
          )}
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-3 bg-brand-primary/10 border-l-4 border-brand-primary text-brand-primary rounded text-sm font-medium">
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-brand-alert/10 border-l-4 border-brand-alert text-brand-alert rounded text-sm font-medium">
            ✗ {errorMsg}
          </div>
        )}

        {/* Create / Edit Form */}
        {isAdmin && showForm && (
          <div className="bg-neutral-surface border border-brand-primary/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-text mb-4 pb-2 border-b">
              {editingId ? '✏️ Edit Emission Factor' : '➕ New Emission Factor'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Factor Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Grid Electricity (IN)"
                  className="w-full p-2.5 border border-neutral-border rounded-lg bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Emission Category</label>
                <select
                  required value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-neutral-border rounded-lg bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Factor (kg CO₂ per unit)</label>
                <input
                  type="number" step="0.001" min="0.001" required value={factor} onChange={(e) => setFactor(e.target.value)}
                  placeholder="e.g. 0.708"
                  className="w-full p-2.5 border border-neutral-border rounded-lg bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Activity Unit</label>
                <input
                  type="text" required value={unit} onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. kWh, litre, km"
                  className="w-full p-2.5 border border-neutral-border rounded-lg bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1">Source / Reference</label>
                <input
                  type="text" value={source} onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. DEFRA 2023, IPCC AR6"
                  className="w-full p-2.5 border border-neutral-border rounded-lg bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-lg font-medium text-sm hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Factor' : 'Create Factor'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-neutral-border rounded-lg text-sm text-neutral-textMuted hover:text-neutral-text transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Factor Table */}
        <div className="bg-neutral-surface rounded-xl shadow-md border border-neutral-border/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-border/60 flex justify-between items-center">
            <h3 className="font-bold text-neutral-text">All Emission Factors</h3>
            <span className="text-xs text-neutral-textMuted">{factors.length} factors loaded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-bg/60">
                <tr>
                  {['Factor Name', 'Category', 'Rate (kg CO₂)', 'Unit', 'Source', ...(isAdmin ? ['Actions'] : [])].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-textMuted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/40">
                {loading && factors.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-neutral-textMuted">Loading...</td></tr>
                ) : factors.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-neutral-textMuted">No emission factors found.</td></tr>
                ) : factors.map((f) => (
                  <tr key={f._id} className="hover:bg-neutral-bg/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-text">{f.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium">
                        {f.category?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-brand-primary">{f.factor}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-textMuted">per {f.unit}</td>
                    <td className="px-4 py-3 text-neutral-textMuted text-xs">{f.source || '—'}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(f)}
                            className="px-3 py-1 text-xs border border-brand-primary text-brand-primary rounded hover:bg-brand-primary hover:text-white transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(f._id, f.name)}
                            className="px-3 py-1 text-xs border border-brand-alert text-brand-alert rounded hover:bg-brand-alert hover:text-white transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
