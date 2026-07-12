import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings } from '../../store/scoringSlice';
import * as scoringApi from '../../api/scoring.api';
import axiosClient from '../../api/axiosClient';
import {
  Settings, Save, RotateCcw, ToggleLeft, ToggleRight, Plus, Edit2, Trash2,
  Building2, Tag, Bell, Sliders, CheckCircle2, X, Users, AlertCircle, Layers
} from 'lucide-react';

const WeightSlider = ({ label, name, value, color, onChange }) => (
  <div className="bg-neutral-surface/60 p-4 rounded-xl border border-neutral-border/60">
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-semibold text-neutral-text">{label}</label>
      <span className="text-sm font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
    <input
      type="range"
      name={name}
      min={0}
      max={1}
      step={0.01}
      value={value}
      onChange={onChange}
      className="w-full h-2 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: color }}
    />
  </div>
);

const Toggle = ({ label, description, name, value, onChange }) => (
  <div className="flex items-center justify-between py-4 px-4 bg-white rounded-xl border border-neutral-border/60 hover:border-brand-primary/30 transition-all shadow-sm">
    <div className="pr-4">
      <p className="text-sm font-semibold text-neutral-text">{label}</p>
      <p className="text-xs text-neutral-textMuted mt-0.5 leading-relaxed">{description}</p>
    </div>
    <button
      onClick={() => onChange(name, !value)}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
        value
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      {value ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      {value ? 'ON' : 'OFF'}
    </button>
  </div>
);

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.scoring);
  const [activeTab, setActiveTab] = useState('esg');

  // Departments State
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    head: '',
    parentDept: '—',
    employeesCount: 10,
    status: 'Active',
    description: ''
  });

  // Categories State
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '',
    type: 'Emission',
    code: '',
    scope: '',
    description: '',
    status: 'Active'
  });

  // Settings form state
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    dispatch(fetchSettings());
    loadDepartments();
    loadCategories();
  }, [dispatch]);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        ...settings,
        notifyNewComplianceIssue: settings.notifyNewComplianceIssue ?? true,
        notifyApprovalDecisions: settings.notifyApprovalDecisions ?? true,
        notifyPolicyReminders: settings.notifyPolicyReminders ?? true,
        notifyBadgeUnlocks: settings.notifyBadgeUnlocks ?? true,
        notifyEmailAlerts: settings.notifyEmailAlerts ?? true,
        rewardRedemptionEnabled: settings.rewardRedemptionEnabled ?? true,
      });
    }
  }, [settings]);

  const fallbackDepartments = [
    { _id: 'dept-hr', name: 'Human Resources', code: 'HR', head: 'Aditi Rao', parentDept: 'Corporate', employeesCount: 45, status: 'Active' },
    { _id: 'dept-it', name: 'Information Technology', code: 'IT', head: 'Karan Shah', parentDept: 'Operations', employeesCount: 120, status: 'Active' },
    { _id: 'dept-mfg', name: 'Manufacturing Operations', code: 'MFG', head: 'Priya Nair', parentDept: 'Operations', employeesCount: 310, status: 'Active' },
    { _id: 'dept-log', name: 'Fleet & Logistics', code: 'FLEET', head: 'Rohan Mehta', parentDept: 'Supply Chain', employeesCount: 85, status: 'Active' },
    { _id: 'dept-corp', name: 'Corporate Headquarters', code: 'CORP', head: 'Neelam Verma', parentDept: 'Executive', employeesCount: 60, status: 'Active' },
  ];

  const fallbackCategories = [
    { _id: 'cat-1', name: 'Purchased Electricity', code: 'ELEC-01', type: 'Emission', scope: 'Scope 2', status: 'Active' },
    { _id: 'cat-2', name: 'Fleet Travel', code: 'FLT-02', type: 'Emission', scope: 'Scope 1', status: 'Active' },
    { _id: 'cat-3', name: 'Manufacturing Operations', code: 'MFG-03', type: 'Emission', scope: 'Scope 1', status: 'Active' },
    { _id: 'cat-4', name: 'Business Travel', code: 'TRV-04', type: 'Emission', scope: 'Scope 3', status: 'Active' },
    { _id: 'cat-5', name: 'Eco-Volunteering', code: 'SOC-01', type: 'Social', scope: 'CSR Pillar', status: 'Active' },
    { _id: 'cat-6', name: 'Skill & Development', code: 'SOC-02', type: 'Social', scope: 'CSR Pillar', status: 'Active' },
    { _id: 'cat-7', name: 'Policy Agreement', code: 'GOV-01', type: 'Governance', scope: 'Compliance', status: 'Active' },
  ];

  const loadDepartments = async () => {
    try {
      const res = await axiosClient.get('/departments');
      const list = res?.success ? res.data : (Array.isArray(res) ? res : (res?.data || []));
      setDepartments(list && list.length > 0 ? list : fallbackDepartments);
    } catch (err) {
      console.error('Error loading departments:', err);
      setDepartments(fallbackDepartments);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      const list = res?.success ? res.data : (Array.isArray(res) ? res : (res?.data || []));
      setCategories(list && list.length > 0 ? list : fallbackCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories(fallbackCategories);
    }
  };

  // Department Handlers
  const handleOpenDeptModal = (dept = null) => {
    if (dept) {
      setSelectedDeptId(dept._id);
      setDeptForm({
        name: dept.name || '',
        code: dept.code || '',
        head: dept.head || '',
        parentDept: dept.parentDept || '—',
        employeesCount: dept.employeesCount || 10,
        status: dept.status || 'Active',
        description: dept.description || ''
      });
    } else {
      setSelectedDeptId(null);
      setDeptForm({
        name: '',
        code: '',
        head: 'S. Nair',
        parentDept: '—',
        employeesCount: 25,
        status: 'Active',
        description: ''
      });
    }
    setDeptModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      if (selectedDeptId) {
        await axiosClient.put(`/departments/${selectedDeptId}`, deptForm);
        setActionMsg('Department updated successfully.');
      } else {
        await axiosClient.post('/departments', deptForm);
        setActionMsg('New department created successfully.');
      }
      setDeptModalOpen(false);
      loadDepartments();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save department.');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDeptId) {
      alert('Please select a department row first.');
      return;
    }
    const dept = departments.find((d) => d._id === selectedDeptId);
    if (!window.confirm(`Are you sure you want to delete department "${dept?.name || 'Selected'}"?`)) return;

    try {
      await axiosClient.delete(`/departments/${selectedDeptId}`);
      setSelectedDeptId(null);
      loadDepartments();
      setActionMsg('Department deleted successfully.');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete department.');
    }
  };

  // Category Handlers
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setSelectedCatId(cat._id);
      setCatForm({
        name: cat.name || '',
        type: cat.type || 'Emission',
        code: cat.code || '',
        scope: cat.scope || '',
        description: cat.description || '',
        status: cat.status || 'Active'
      });
    } else {
      setSelectedCatId(null);
      setCatForm({
        name: '',
        type: 'Emission',
        code: '',
        scope: 'Scope 1 & 2',
        description: '',
        status: 'Active'
      });
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (selectedCatId) {
        await axiosClient.put(`/categories/${selectedCatId}`, catForm);
        setActionMsg('ESG Category updated successfully.');
      } else {
        await axiosClient.post('/categories', catForm);
        setActionMsg('New ESG Category created successfully.');
      }
      setCatModalOpen(false);
      loadCategories();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCatId) {
      alert('Please select a category row first.');
      return;
    }
    const cat = categories.find((c) => c._id === selectedCatId);
    if (!window.confirm(`Are you sure you want to delete category "${cat?.name || 'Selected'}"?`)) return;

    try {
      await axiosClient.delete(`/categories/${selectedCatId}`);
      setSelectedCatId(null);
      loadCategories();
      setActionMsg('Category deleted successfully.');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  // Settings Handlers
  const handleSlider = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleToggle = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await scoringApi.updateSettings(form);
      dispatch(fetchSettings());
      setSaved(true);
      setActionMsg('ESG configuration & notification rules saved successfully.');
      setTimeout(() => {
        setSaved(false);
        setActionMsg(null);
      }, 3000);
    } catch {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setForm({
      envWeight: 0.4,
      socialWeight: 0.3,
      govWeight: 0.3,
      evidenceRequiredForCSR: true,
      evidenceRequiredForCompliance: true,
      autoEmissionCalc: true,
      badgeAutoAward: true,
      complianceOverdueFlag: true,
      rewardRedemptionEnabled: true,
      notifyNewComplianceIssue: true,
      notifyApprovalDecisions: true,
      notifyPolicyReminders: true,
      notifyBadgeUnlocks: true,
      notifyEmailAlerts: true,
    });
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">Loading settings & administration...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-surface rounded-xl p-6 shadow-sm border border-neutral-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="text-brand-primary" size={24} />
            <h1 className="text-2xl font-display font-bold text-neutral-text">EcoSphere: Settings & Administration</h1>
          </div>
          <p className="text-sm text-neutral-textMuted mt-1">
            Core Configuration, Departments, Categories & Notification Rules (Section 8 In-Scope Specifications)
          </p>
        </div>
        {actionMsg && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
            <CheckCircle2 size={16} />
            {actionMsg}
          </div>
        )}
      </div>

      {/* Top Tabs Bar */}
      <div className="flex bg-neutral-surface p-1.5 rounded-xl border border-neutral-border shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('esg')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'esg'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-neutral-textMuted hover:text-neutral-text'
          }`}
        >
          <Sliders size={16} />
          ESG Configuration
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'departments'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-neutral-textMuted hover:text-neutral-text'
          }`}
        >
          <Building2 size={16} />
          Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-neutral-textMuted hover:text-neutral-text'
          }`}
        >
          <Tag size={16} />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-neutral-textMuted hover:text-neutral-text'
          }`}
        >
          <Bell size={16} />
          Notification Settings
        </button>
      </div>

      {/* TAB 1: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="bg-neutral-surface rounded-xl p-6 shadow-sm border border-neutral-border space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenDeptModal(null)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-bold transition"
              >
                <Plus size={16} />
                New Department
              </button>
              <button
                onClick={() => {
                  const dept = departments.find((d) => d._id === selectedDeptId);
                  if (!dept) return alert('Please select a department row below to edit.');
                  handleOpenDeptModal(dept);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition"
              >
                <Edit2 size={15} />
                Edit
              </button>
              <button
                onClick={handleDeleteDepartment}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
            <span className="text-xs text-neutral-textMuted">
              Click any row to select it for Edit or Delete actions
            </span>
          </div>

          {/* Table matching Image 3 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-surface/60 text-xs font-semibold uppercase text-neutral-textMuted tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Head</th>
                  <th className="py-3 px-4">Parent Dept</th>
                  <th className="py-3 px-4">Employees</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/60 text-sm">
                {departments.map((dept) => {
                  const isSelected = dept._id === selectedDeptId;
                  return (
                    <tr
                      key={dept._id}
                      onClick={() => setSelectedDeptId(dept._id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-primary/10 font-medium' : 'hover:bg-neutral-surface/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-neutral-text">{dept.name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-neutral-textMuted">{dept.code}</td>
                      <td className="py-3.5 px-4 text-neutral-text">{dept.head || 'S. Nair'}</td>
                      <td className="py-3.5 px-4 text-neutral-textMuted">{dept.parentDept || '—'}</td>
                      <td className="py-3.5 px-4 text-neutral-text">{dept.employeesCount || 25}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-700 border border-green-500/40">
                          {dept.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-neutral-surface rounded-xl p-6 shadow-sm border border-neutral-border space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCatModal(null)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-bold transition"
              >
                <Plus size={16} />
                New Category
              </button>
              <button
                onClick={() => {
                  const cat = categories.find((c) => c._id === selectedCatId);
                  if (!cat) return alert('Please select a category row below to edit.');
                  handleOpenCatModal(cat);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition"
              >
                <Edit2 size={15} />
                Edit
              </button>
              <button
                onClick={handleDeleteCategory}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
            <span className="text-xs text-neutral-textMuted">
              Click any row to select it for Edit or Delete actions
            </span>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-surface/60 text-xs font-semibold uppercase text-neutral-textMuted tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Code / Scope</th>
                  <th className="py-3 px-4">Pillar</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/60 text-sm">
                {categories.map((cat) => {
                  const isSelected = cat._id === selectedCatId;
                  const pillarBadge =
                    cat.type === 'Emission'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : cat.type === 'Social'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300';
                  return (
                    <tr
                      key={cat._id}
                      onClick={() => setSelectedCatId(cat._id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-primary/10 font-medium' : 'hover:bg-neutral-surface/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-neutral-text">{cat.name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-neutral-textMuted">{cat.code || cat.scope || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${pillarBadge}`}>
                          {cat.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-textMuted text-xs">{cat.description || 'Core ESG category tracking metric'}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-700 border border-green-500/40">
                          {cat.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ESG CONFIGURATION */}
      {activeTab === 'esg' && (
        <div className="space-y-6">
          {/* ESG Scoring Weights */}
          <div className="bg-neutral-surface rounded-xl p-6 shadow-sm border border-neutral-border">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sliders size={20} className="text-brand-primary" />
                <h2 className="text-lg font-display font-bold text-neutral-text">ESG Pillar Scoring Weights</h2>
              </div>
              <span className="text-xs text-neutral-textMuted">Total must balance across Environmental, Social & Governance</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <WeightSlider
                label="Environmental Pillar"
                name="envWeight"
                value={form.envWeight || 0}
                color="#1F5C4D"
                onChange={handleSlider}
              />
              <WeightSlider
                label="Social & CSR Pillar"
                name="socialWeight"
                value={form.socialWeight || 0}
                color="#2E6DA4"
                onChange={handleSlider}
              />
              <WeightSlider
                label="Governance Pillar"
                name="govWeight"
                value={form.govWeight || 0}
                color="#C9862A"
                onChange={handleSlider}
              />
            </div>
          </div>

          {/* Automation Toggles */}
          <div className="bg-neutral-surface rounded-xl p-6 shadow-sm border border-neutral-border space-y-4">
            <h2 className="text-lg font-display font-bold text-neutral-text mb-4">Automation Toggles</h2>

            <Toggle
              label="Evidence Required for CSR"
              description="Employees must upload proof when claiming CSR participation"
              name="evidenceRequiredForCSR"
              value={form.evidenceRequiredForCSR}
              onChange={handleToggle}
            />

            <Toggle
              label="Evidence Required for Compliance"
              description="Auditors must attach evidence when closing compliance issues"
              name="evidenceRequiredForCompliance"
              value={form.evidenceRequiredForCompliance}
              onChange={handleToggle}
            />

            <Toggle
              label="Auto Emission Calculation"
              description="Automatically calculate emission scores from new carbon transactions"
              name="autoEmissionCalc"
              value={form.autoEmissionCalc}
              onChange={handleToggle}
            />

            <Toggle
              label="Badge Auto-Award"
              description="Automatically grant badges when users reach required XP thresholds"
              name="badgeAutoAward"
              value={form.badgeAutoAward}
              onChange={handleToggle}
            />

            <Toggle
              label="Compliance Issue Ownership & Overdue Flagging"
              description="Every compliance issue must have an assigned owner and due date; automatically flag overdue issues while open"
              name="complianceOverdueFlag"
              value={form.complianceOverdueFlag}
              onChange={handleToggle}
            />

            <Toggle
              label="Reward Redemption Engine"
              description="Employees can redeem earned points/XP for rewards from catalog subject to stock availability"
              name="rewardRedemptionEnabled"
              value={form.rewardRedemptionEnabled}
              onChange={handleToggle}
            />
          </div>

            {/* Save Button for ESG Config */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={handleResetSettings}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-neutral-border hover:bg-neutral-surface/60 transition"
              >
                <RotateCcw size={15} />
                Reset Defaults
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-green-800 transition shadow-sm disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save ESG Configuration'}
              </button>
            </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATION SETTINGS */}
      {activeTab === 'notifications' && (
        <div className="bg-neutral-surface rounded-xl p-6 shadow-sm border border-neutral-border space-y-6">
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-text">Platform & Email Notification Rules</h2>
            <p className="text-sm text-neutral-textMuted mt-1">
              Configure automated in-app and email dispatch events as specified in Section 8
            </p>
          </div>

          <div className="space-y-4">
            <Toggle
              label="New compliance issue raised"
              description="Send instant in-app and email notifications to assigned officers when a compliance issue is created or flagged"
              name="notifyNewComplianceIssue"
              value={form.notifyNewComplianceIssue}
              onChange={handleToggle}
            />

            <Toggle
              label="CSR / Challenge approval decisions"
              description="Notify employees immediately via in-app alert when their CSR activity or challenge proof is approved or rejected"
              name="notifyApprovalDecisions"
              value={form.notifyApprovalDecisions}
              onChange={handleToggle}
            />

            <Toggle
              label="Policy acknowledgement reminders"
              description="Automatically dispatch reminder alerts to employees with pending compliance policy acknowledgements"
              name="notifyPolicyReminders"
              value={form.notifyPolicyReminders}
              onChange={handleToggle}
            />

            <Toggle
              label="Badge unlocks & achievement alerts"
              description="Broadcast reward and badge unlock notifications to user dashboards and gamification leaderboard feed"
              name="notifyBadgeUnlocks"
              value={form.notifyBadgeUnlocks}
              onChange={handleToggle}
            />

            <Toggle
              label="Email alerts for new compliance issues"
              description="Send external email digest summaries to compliance auditors and executive leadership"
              name="notifyEmailAlerts"
              value={form.notifyEmailAlerts}
              onChange={handleToggle}
            />

            {/* Save Button for Notifications */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={handleResetSettings}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-neutral-border hover:bg-neutral-surface/60 transition"
              >
                <RotateCcw size={15} />
                Reset Defaults
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-green-800 transition shadow-sm disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Notification Rules'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-neutral-border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-display font-bold text-neutral-text">
                {selectedDeptId ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button onClick={() => setDeptModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Manufacturing"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MFG"
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Employees</label>
                  <input
                    type="number"
                    value={deptForm.employeesCount}
                    onChange={(e) => setDeptForm({ ...deptForm, employeesCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Head of Dept</label>
                  <input
                    type="text"
                    value={deptForm.head}
                    onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                    placeholder="e.g. S. Nair"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Parent Dept</label>
                  <input
                    type="text"
                    value={deptForm.parentDept}
                    onChange={(e) => setDeptForm({ ...deptForm, parentDept: e.target.value })}
                    placeholder="e.g. — or Manufacturing"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Status</label>
                <select
                  value={deptForm.status}
                  onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-green-800"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-neutral-border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-display font-bold text-neutral-text">
                {selectedCatId ? 'Edit ESG Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Scope 1 Energy"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-text uppercase mb-1">ESG Pillar *</label>
                  <select
                    value={catForm.type}
                    onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  >
                    <option value="Emission">Environmental</option>
                    <option value="Social">Social & CSR</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Code / Scope</label>
                  <input
                    type="text"
                    value={catForm.code}
                    onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                    placeholder="e.g. Scope 1 & 2"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-green-800"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
