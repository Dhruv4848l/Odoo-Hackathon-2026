import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, Plus, Edit2, Trash2, Download } from 'lucide-react';
import environmentalApi from '../../api/environmental.api';
import axiosClient from '../../api/axiosClient';

export default function EnvironmentalGoalBoard() {
  const { user } = useSelector((state) => state.auth);
  const isAdminOrManager = ['Admin', 'Manager'].includes(user?.role);

  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Selected goal for Edit/Delete actions
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await environmentalApi.getEnvironmentalGoals();
      if (res.success) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormMetadata = async () => {
    try {
      const [deptRes, catRes] = await Promise.all([
        axiosClient.get('/departments'),
        axiosClient.get('/categories?type=Emission'),
      ]);
      if (deptRes.success) setDepartments(deptRes.data);
      if (catRes.success) setCategories(catRes.data.filter(c => c.type === 'Emission'));
    } catch (err) {
      console.error('Failed to load form metadata', err);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchFormMetadata();
  }, []);

  const getGoalName = (goal) => {
    if (goal.category?.name === 'Fleet Travel') return 'Reduce Fleet Emissions';
    if (goal.category?.name === 'Manufacturing Operations') return 'Cut Packaging Waste';
    if (goal.category?.name === 'Purchased Electricity') return 'Office Energy Cut';
    return `Reduce ${goal.category?.name || 'Emissions'}`;
  };

  const handleRowSelect = (id) => {
    setSelectedGoalId(selectedGoalId === id ? null : id);
  };

  const selectedGoal = goals.find(g => g._id === selectedGoalId);

  const handleOpenCreate = () => {
    setDepartment('');
    setCategory('');
    setTargetValue('');
    setStartDate('');
    setEndDate('');
    setErrorMsg('');
    setShowCreateModal(true);
  };

  const handleOpenEdit = () => {
    if (!selectedGoal) return;
    setTargetValue(selectedGoal.targetValue);
    setStartDate(selectedGoal.startDate.split('T')[0]);
    setEndDate(selectedGoal.endDate.split('T')[0]);
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!department || !category || !targetValue || !startDate || !endDate) {
      setErrorMsg('All fields are required.');
      return;
    }

    const payload = {
      department,
      category,
      targetValue: parseFloat(targetValue),
      startDate,
      endDate,
    };

    try {
      const res = await environmentalApi.createEnvironmentalGoal(payload);
      if (res.success) {
        setShowCreateModal(false);
        setSelectedGoalId(null);
        fetchGoals();
      } else {
        setErrorMsg(res.message || 'Failed to create goal.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!targetValue || !startDate || !endDate) {
      setErrorMsg('All fields are required.');
      return;
    }

    const payload = {
      targetValue: parseFloat(targetValue),
      startDate,
      endDate,
    };

    try {
      const res = await environmentalApi.updateEnvironmentalGoal(selectedGoalId, payload);
      if (res.success) {
        setShowEditModal(false);
        setSelectedGoalId(null);
        fetchGoals();
      } else {
        setErrorMsg(res.message || 'Failed to update goal.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.');
    }
  };

  const handleDelete = async () => {
    if (!selectedGoalId) return;
    if (!window.confirm('Are you sure you want to delete the selected goal?')) return;
    try {
      const res = await environmentalApi.deleteEnvironmentalGoal(selectedGoalId);
      if (res.success) {
        setSelectedGoalId(null);
        fetchGoals();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Delete failed.');
    }
  };

  const handleExport = () => {
    if (goals.length === 0) return;
    const headers = ['Goal Name', 'Department', 'Target CO2 (t)', 'Current CO2 (t)', 'Progress (%)', 'Deadline', 'Status'];
    const rows = goals.map(g => [
      getGoalName(g),
      g.department?.name || '',
      g.targetValue,
      g.currentValue?.toFixed(1) || 0,
      g.progressPercent || 0,
      new Date(g.endDate).toLocaleDateString(),
      g.progressPercent >= 100 ? 'Completed' : g.progressPercent >= 75 ? 'On Track' : 'Active'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Environmental_Goals_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered goals
  const filteredGoals = goals.filter(g => {
    const nameMatches = getGoalName(g).toLowerCase().includes(search.toLowerCase());
    const deptMatches = g.department?.name ? g.department.name.toLowerCase().includes(search.toLowerCase()) : false;
    return search === '' || nameMatches || deptMatches;
  });

  return (
    <div className="space-y-6">
      {/* Action Buttons & Search */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-neutral-surface/60 p-2 rounded-2xl border border-neutral-border shadow-sm">
        <div className="flex items-center gap-2">
          {isAdminOrManager && (
            <>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-[#4CAF50] text-white rounded-xl text-sm font-semibold hover:bg-[#43a047] transition shadow-sm"
              >
                + New Goal
              </button>
              <button
                onClick={handleOpenEdit}
                disabled={!selectedGoalId}
                className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition shadow-sm ${
                  selectedGoalId ? 'bg-[#FF9800] hover:bg-[#f57c00]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Edit
              </button>
              {user?.role === 'Admin' && (
                <button
                  onClick={handleDelete}
                  disabled={!selectedGoalId}
                  className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition shadow-sm ${
                    selectedGoalId ? 'bg-[#FF5252] hover:bg-[#ff1744]' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Delete
                </button>
              )}
            </>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-neutral-bg text-neutral-text border border-neutral-border rounded-xl text-sm font-semibold hover:bg-neutral-bg/85 transition"
          >
            Export ▾
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
          />
        </div>
      </div>

      {/* Goals Table */}
      <div className="bg-white rounded-2xl border border-neutral-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-bg/60 border-b border-neutral-border">
              <tr>
                {['Name', 'Department', 'Target CO₂', 'Current CO₂', 'Progress', 'Deadline', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-neutral-textSecondary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/40">
              {loading && filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-textSecondary">
                    Loading environmental goals...
                  </td>
                </tr>
              ) : filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-textSecondary">
                    No environmental goals found.
                  </td>
                </tr>
              ) : (
                filteredGoals.map((goal) => {
                  const isSelected = selectedGoalId === goal._id;
                  const isCompleted = goal.progressPercent >= 100;
                  const isOnTrack = goal.progressPercent >= 75 && goal.progressPercent < 100;

                  return (
                    <tr
                      key={goal._id}
                      onClick={() => handleRowSelect(goal._id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-green-50/50 hover:bg-green-50' : 'hover:bg-neutral-bg/30'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-neutral-text">
                        {getGoalName(goal)}
                      </td>
                      <td className="px-6 py-4 text-neutral-textSecondary">
                        {goal.department?.name || '—'}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold">
                        {goal.targetValue} t
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-textSecondary">
                        {goal.currentValue?.toFixed(0) || 0} t
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-[#4CAF50] h-2.5 rounded-full" style={{ width: `${Math.min(100, goal.progressPercent || 0)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-neutral-text">{goal.progressPercent || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-textSecondary text-xs">
                        {new Date(goal.endDate).toISOString().split('T')[0]}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          isCompleted ? 'bg-blue-100 text-blue-800' :
                          isOnTrack ? 'bg-green-100 text-green-800 border border-green-200' :
                          'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {isCompleted ? 'Completed' : isOnTrack ? 'On Track' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-neutral-border text-xs text-neutral-textSecondary flex justify-between items-center">
          <span>Row actions: Click a row to select it for Edit / Delete operations</span>
          <span>• Carbon Transactions auto-generated from Purchase/Manufacturing/Fleet/Expenses</span>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-border relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-neutral-text mb-4 pb-2 border-b border-neutral-border">
              🎯 Set Environmental Goal
            </h3>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-brand-alert border border-brand-alert/20 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Department</label>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                >
                  <option value="">Select department...</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Emission Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                >
                  <option value="">Select category...</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Target Value (t CO₂e)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">End Date (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-border">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4CAF50] text-white rounded-xl text-sm font-semibold hover:bg-[#43a047] transition shadow-sm"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-neutral-border rounded-xl text-sm font-semibold text-neutral-textSecondary hover:text-neutral-text transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-border relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-neutral-text mb-4 pb-2 border-b border-neutral-border">
              ✏️ Edit Environmental Goal
            </h3>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-brand-alert border border-brand-alert/20 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Target Value (t CO₂e)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-textSecondary uppercase mb-1">End Date (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 border border-neutral-border rounded-xl bg-neutral-bg/50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-border">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF9800] text-white rounded-xl text-sm font-semibold hover:bg-[#f57c00] transition shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
