import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings } from '../../store/scoringSlice';
import AppLayout from '../../components/layout/AppLayout';
import * as scoringApi from '../../api/scoring.api';
import { Settings, Save, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react';

const WeightSlider = ({ label, name, value, color, onChange }) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="text-sm font-medium text-neutral-text">{label}</label>
      <span className="text-sm font-bold" style={{ color }}>
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
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-neutral-text">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <button
      onClick={() => onChange(name, !value)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        value
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {value ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
      {value ? 'ON' : 'OFF'}
    </button>
  </div>
);

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.scoring);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings && !form) setForm({ ...settings });
  }, [settings]);

  const handleSlider = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleToggle = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const totalWeight = form
    ? (form.envWeight || 0) + (form.socialWeight || 0) + (form.govWeight || 0)
    : 1;
  const isBalanced = Math.abs(totalWeight - 1) < 0.02;

  const handleSave = async () => {
    setSaving(true);
    try {
      await scoringApi.updateSettings(form);
      dispatch(fetchSettings());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      envWeight: 0.4,
      socialWeight: 0.3,
      govWeight: 0.3,
      evidenceRequiredForCSR: true,
      evidenceRequiredForCompliance: true,
      autoEmissionCalc: true,
      badgeAutoAward: true,
      complianceOverdueFlag: true,
    });
  };

  if (loading || !form) {
    return (
      <AppLayout title="Settings">
        <div className="flex items-center justify-center h-64 text-gray-400">Loading settings...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl space-y-6">

        {/* ESG Scoring Weights */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <Settings size={18} className="text-brand-primary" />
            <h2 className="text-base font-display font-semibold text-neutral-text">
              ESG Scoring Weights
            </h2>
          </div>
          <div className="space-y-5">
            <WeightSlider
              label="Environmental"
              name="envWeight"
              value={form.envWeight || 0}
              color="#1F5C4D"
              onChange={handleSlider}
            />
            <WeightSlider
              label="Social"
              name="socialWeight"
              value={form.socialWeight || 0}
              color="#2E6DA4"
              onChange={handleSlider}
            />
            <WeightSlider
              label="Governance"
              name="govWeight"
              value={form.govWeight || 0}
              color="#8E3B46"
              onChange={handleSlider}
            />
          </div>

          {/* Balance indicator */}
          <div
            className={`mt-4 px-3 py-2 rounded-lg text-xs font-medium ${
              isBalanced
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}
          >
            {isBalanced
              ? '✅ Weights balanced (sum ≈ 100%)'
              : `⚠️ Weights sum to ${(totalWeight * 100).toFixed(0)}% — should equal 100%`}
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-display font-semibold text-neutral-text mb-4">
            Automation Toggles
          </h2>
          <Toggle
            label="Evidence Required for CSR"
            description="Employees must upload proof when claiming CSR participation"
            name="evidenceRequiredForCSR"
            value={form.evidenceRequiredForCSR ?? true}
            onChange={handleToggle}
          />
          <Toggle
            label="Evidence Required for Compliance"
            description="Auditors must attach evidence when closing compliance issues"
            name="evidenceRequiredForCompliance"
            value={form.evidenceRequiredForCompliance ?? true}
            onChange={handleToggle}
          />
          <Toggle
            label="Auto Emission Calculation"
            description="Automatically calculate emission scores from new carbon transactions"
            name="autoEmissionCalc"
            value={form.autoEmissionCalc ?? true}
            onChange={handleToggle}
          />
          <Toggle
            label="Badge Auto-Award"
            description="Automatically grant badges when users reach required XP thresholds"
            name="badgeAutoAward"
            value={form.badgeAutoAward ?? true}
            onChange={handleToggle}
          />
          <Toggle
            label="Compliance Overdue Flagging"
            description="Automatically flag unresolved compliance issues when due date passes"
            name="complianceOverdueFlag"
            value={form.complianceOverdueFlag ?? true}
            onChange={handleToggle}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-brand-primary text-white hover:bg-green-800'
            } disabled:opacity-60`}
          >
            <Save size={15} />
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <RotateCcw size={15} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsScreen;
