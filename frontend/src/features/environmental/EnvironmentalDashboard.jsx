import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import EnvironmentalHeader from './EnvironmentalHeader';
import CarbonTransactionBoard from './CarbonTransactionBoard';
import EnvironmentalGoalBoard from './EnvironmentalGoalBoard';

const COLORS = ['#1F5C4D', '#2E6DA4', '#C9862A', '#8E3B46', '#4CAF50', '#FF9800'];

const StatCard = ({ label, value, unit, icon, color = 'brand-primary', trend }) => (
  <div className="bg-neutral-surface rounded-xl p-5 shadow-sm border border-neutral-border/60 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-semibold text-neutral-textMuted uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-display font-bold text-${color} mt-1`}>{value}</p>
        {unit && <p className="text-xs text-neutral-textMuted mt-0.5">{unit}</p>}
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
    {trend !== undefined && (
      <div className={`mt-3 text-xs font-medium ${trend <= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {trend <= 0 ? '↓' : '↑'} {Math.abs(trend)}% vs last period
      </div>
    )}
  </div>
);

export default function EnvironmentalDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | transactions | goals
  const [dateRange, setDateRange] = useState('30'); // days

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const startStr = startDate.toISOString().split('T')[0];

      const [txRes, goalRes] = await Promise.all([
        axiosClient.get(`/carbon-transactions?startDate=${startStr}`),
        axiosClient.get('/environmental-goals'),
      ]);
      if (txRes.success) setTransactions(txRes.data);
      if (goalRes.success) setGoals(goalRes.data);
    } catch (err) {
      console.error('Failed to fetch environmental data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // --- Derived Data ---
  const totalCarbon = transactions.reduce((sum, tx) => sum + (tx.carbonEmitted || 0), 0);

  const emissionsByDay = (() => {
    const map = {};
    transactions.forEach(tx => {
      const day = new Date(tx.transactionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map[day] = (map[day] || 0) + tx.carbonEmitted;
    });
    return Object.entries(map)
      .map(([date, carbon]) => ({ date, carbon: parseFloat(carbon.toFixed(2)) }))
      .slice(-15);
  })();

  const emissionsByDept = (() => {
    const map = {};
    transactions.forEach(tx => {
      const deptName = tx.department?.code || 'Unknown';
      map[deptName] = (map[deptName] || 0) + tx.carbonEmitted;
    });
    return Object.entries(map).map(([dept, carbon]) => ({ dept, carbon: parseFloat(carbon.toFixed(2)) }));
  })();

  const emissionsByCategory = (() => {
    const map = {};
    transactions.forEach(tx => {
      const cat = tx.emissionFactor?.category?.name || 'Other';
      map[cat] = (map[cat] || 0) + tx.carbonEmitted;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  })();

  const activeGoals = goals.filter(g => g.progressPercent < 100).length;
  const achievedGoals = goals.filter(g => g.progressPercent >= 100).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 min-h-screen bg-neutral-bg">
        <div className="text-brand-primary font-medium text-lg animate-pulse">🌿 Loading Environmental Data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <EnvironmentalHeader />

        {/* Dashboard Title Section */}
        <div className="flex flex-wrap justify-between items-center bg-neutral-surface p-6 rounded-xl shadow-sm border border-neutral-border/60 gap-4">
          <div>
            <h1 className="text-xl font-display font-bold text-brand-primary">🌿 Environmental Dashboard</h1>
            <p className="text-sm text-neutral-textMuted mt-1">Real-time carbon emission tracking and goal attainment</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-neutral-textMuted uppercase">Period</label>
            <select
              value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-neutral-border rounded-lg text-sm bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">This Year</option>
            </select>
            <button onClick={fetchData} className="px-3 py-2 border border-brand-primary text-brand-primary rounded-lg text-sm hover:bg-brand-primary hover:text-white transition-all">
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Sub-tabs Selector */}
        <div className="flex bg-neutral-surface p-1 rounded-xl border border-neutral-border/60 shadow-sm">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'transactions', label: '📋 Transactions' },
            { key: 'goals', label: '🎯 Goals' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-center font-medium rounded-lg text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-textMuted hover:text-neutral-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total CO₂ Emitted" value={totalCarbon.toFixed(1)} unit="kg CO₂e" icon="💨" />
              <StatCard label="Transactions Logged" value={transactions.length} unit={`in last ${dateRange} days`} icon="📝" />
              <StatCard label="Active Goals" value={activeGoals} unit="emission targets" icon="🎯" />
              <StatCard label="Goals Achieved" value={achievedGoals} unit="targets met" icon="✅" color="green-600" />
            </div>

            {/* Area Chart – Emissions over time */}
            <div className="bg-neutral-surface rounded-xl shadow-md border border-neutral-border/60 p-6">
              <h3 className="font-bold text-neutral-text mb-4">Carbon Emissions Over Time (kg CO₂e)</h3>
              {emissionsByDay.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-neutral-textMuted text-sm">No transaction data in this period.</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={emissionsByDay}>
                    <defs>
                      <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1F5C4D" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1F5C4D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Emissions']} />
                    <Area type="monotone" dataKey="carbon" stroke="#1F5C4D" strokeWidth={2} fill="url(#carbonGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Two-column lower charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Bar Chart */}
              <div className="bg-neutral-surface rounded-xl shadow-md border border-neutral-border/60 p-6">
                <h3 className="font-bold text-neutral-text mb-4">Emissions by Department (kg CO₂e)</h3>
                {emissionsByDept.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-neutral-textMuted text-sm">No data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={emissionsByDept}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Carbon']} />
                      <Bar dataKey="carbon" fill="#1F5C4D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category Pie Chart */}
              <div className="bg-neutral-surface rounded-xl shadow-md border border-neutral-border/60 p-6">
                <h3 className="font-bold text-neutral-text mb-4">Emissions by Category</h3>
                {emissionsByCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-neutral-textMuted text-sm">No data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={emissionsByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {emissionsByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} kg CO₂e`]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <CarbonTransactionBoard />
        )}

        {/* Goals Tab Content */}
        {activeTab === 'goals' && (
          <EnvironmentalGoalBoard />
        )}
    </div>
  );
}
