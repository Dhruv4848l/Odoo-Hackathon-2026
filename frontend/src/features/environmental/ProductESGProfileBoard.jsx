import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, Plus, Edit2, Trash2, ShieldAlert, Award } from 'lucide-react';
import environmentalApi from '../../api/environmental.api';
import EnvironmentalHeader from './EnvironmentalHeader';

export default function ProductESGProfileBoard() {
  const { user } = useSelector((state) => state.auth);
  const isAdminOrManager = ['Admin', 'Manager'].includes(user?.role);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [socialScore, setSocialScore] = useState(50);
  const [governanceScore, setGovernanceScore] = useState(50);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await environmentalApi.getProductProfiles(search);
      if (res.success) {
        setProfiles(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [search]);

  const resetForm = () => {
    setName('');
    setSku('');
    setCarbonFootprint('');
    setSocialScore(50);
    setGovernanceScore(50);
    setEditingProfile(null);
    setErrorMsg('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setName(p.name);
    setSku(p.sku);
    setCarbonFootprint(p.carbonFootprint);
    setSocialScore(p.socialScore);
    setGovernanceScore(p.governanceScore);
    setEditingProfile(p);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !sku || carbonFootprint === '') {
      setErrorMsg('Name, SKU, and Carbon Footprint are required.');
      return;
    }

    const payload = {
      name,
      sku,
      carbonFootprint: parseFloat(carbonFootprint),
      socialScore: parseInt(socialScore),
      governanceScore: parseInt(governanceScore),
    };

    try {
      let res;
      if (editingProfile) {
        res = await environmentalApi.updateProductProfile(editingProfile._id, payload);
      } else {
        res = await environmentalApi.createProductProfile(payload);
      }

      if (res.success) {
        setShowModal(false);
        resetForm();
        fetchProfiles();
      } else {
        setErrorMsg(res.message || 'Operation failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.');
    }
  };

  const handleDelete = async (id, prodName) => {
    if (!window.confirm(`Are you sure you want to delete the ESG profile for "${prodName}"?`)) return;
    try {
      const res = await environmentalApi.deleteProductProfile(id);
      if (res.success) {
        fetchProfiles();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Delete failed.');
    }
  };

  // Stats calculation
  const totalProducts = profiles.length;
  const avgCarbon = totalProducts > 0 
    ? (profiles.reduce((sum, p) => sum + p.carbonFootprint, 0) / totalProducts).toFixed(2)
    : '0.00';
  const greenestProduct = totalProducts > 0
    ? [...profiles].sort((a, b) => a.carbonFootprint - b.carbonFootprint)[0]
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <EnvironmentalHeader />

        {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl">
            <Plus size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-textSecondary uppercase tracking-wider">Total Products Profiled</p>
            <p className="text-2xl font-bold text-neutral-text mt-0.5">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-textSecondary uppercase tracking-wider">Average Carbon Footprint</p>
            <p className="text-2xl font-bold text-neutral-text mt-0.5">{avgCarbon} <span className="text-sm font-normal text-neutral-textSecondary">kg CO₂e</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <Award size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-neutral-textSecondary uppercase tracking-wider">Lowest Footprint Product</p>
            <p className="text-base font-bold text-neutral-text mt-0.5 truncate">{greenestProduct ? greenestProduct.name : '—'}</p>
            <p className="text-xs text-neutral-textSecondary">{greenestProduct ? `${greenestProduct.carbonFootprint} kg CO₂e` : ''}</p>
          </div>
        </div>
      </div>

      {/* Actions and Search */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>
        {isAdminOrManager && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-brand-primary text-neutral-surface rounded-xl text-sm font-semibold hover:bg-brand-primary/95 transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} />
            Add Profile
          </button>
        )}
      </div>

      {/* Profiles List */}
      <div className="bg-white rounded-2xl border border-neutral-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-bg/60 border-b border-neutral-border">
              <tr>
                {['Product Details', 'SKU', 'Carbon Footprint', 'Social Score', 'Governance Score', ...(isAdminOrManager ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-neutral-textSecondary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/40">
              {loading && profiles.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrManager ? 6 : 5} className="px-6 py-12 text-center text-neutral-textSecondary">
                    Loading profiles...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrManager ? 6 : 5} className="px-6 py-12 text-center text-neutral-textSecondary">
                    No product ESG profiles found.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-text">{p.name}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-textSecondary">
                      {p.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-brand-primary">{p.carbonFootprint}</span> <span className="text-xs text-neutral-textSecondary">kg CO₂e</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-500 h-2" style={{ width: `${p.socialScore}%` }} />
                        </div>
                        <span className="text-xs font-bold text-neutral-text">{p.socialScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-purple-500 h-2" style={{ width: `${p.governanceScore}%` }} />
                        </div>
                        <span className="text-xs font-bold text-neutral-text">{p.governanceScore}</span>
                      </div>
                    </td>
                    {isAdminOrManager && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-neutral-textSecondary hover:text-brand-primary hover:bg-gray-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          {user?.role === 'Admin' && (
                            <button
                              onClick={() => handleDelete(p._id, p.name)}
                              className="p-1.5 text-neutral-textSecondary hover:text-brand-alert hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-border relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-neutral-text mb-4 pb-2 border-b border-neutral-border">
              {editingProfile ? '✏️ Edit Product ESG Profile' : '➕ Add Product ESG Profile'}
            </h3>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-brand-alert border border-brand-alert/20 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Recycled Notebook"
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. ECO-NTE-01"
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Lifecycle Carbon Footprint (kg CO₂e)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={carbonFootprint}
                  onChange={(e) => setCarbonFootprint(e.target.value)}
                  placeholder="e.g. 2.45"
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Social Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={socialScore}
                    onChange={(e) => setSocialScore(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Governance Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={governanceScore}
                    onChange={(e) => setGovernanceScore(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-border">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-primary text-neutral-surface rounded-xl text-sm font-semibold hover:bg-brand-primary/95 transition shadow-sm"
                >
                  {editingProfile ? 'Update Profile' : 'Create Profile'}
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
