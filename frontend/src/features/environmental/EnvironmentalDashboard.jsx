import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import { useSelector } from 'react-redux';
import EnvironmentalHeader from './EnvironmentalHeader';

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
  const { user } = useSelector((state) => state.auth);

  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | transactions | goals
  const [dateRange, setDateRange] = useState('30'); // days

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const startStr = startDate.toISOString().split('T')[0];

      const [txRes, goalRes, deptRes] = await Promise.all([
        axiosClient.get(`/carbon-transactions?startDate=${startStr}`),
        axiosClient.get('/environmental-goals'),
        axiosClient.get('/departments'),
      ]);
      if (txRes.success) setTransactions(txRes.data);
      if (goalRes.success) setGoals(goalRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      console.error('Failed to fetch environmental data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  // --- Derived Data ---

  // Total emissions
  const totalCarbon = transactions.reduce((sum, tx) => sum + (tx.carbonEmitted || 0), 0);

  // Emissions grouped by day for area chart
  const emissionsByDay = (() => {
    const map = {};
    transactions.forEach(tx => {
      const day = new Date(tx.transactionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map[day] = (map[day] || 0) + tx.carbonEmitted;
    });
    return Object.entries(map)
      .map(([date, carbon]) => ({ date, carbon: parseFloat(carbon.toFixed(2)) }))
      .slice(-15); // last 15 data points
  })();

  // Emissions per department for bar chart
  const emissionsByDept = (() => {
    const map = {};
    transactions.forEach(tx => {
      const deptName = tx.department?.code || 'Unknown';
      map[deptName] = (map[deptName] || 0) + tx.carbonEmitted;
    });
    return Object.entries(map).map(([dept, carbon]) => ({ dept, carbon: parseFloat(carbon.toFixed(2)) }));
  })();

  // Emissions by category for pie chart
  const emissionsByCategory = (() => {
    const map = {};
    transactions.forEach(tx => {
      const cat = tx.emissionFactor?.category?.name || 'Other';
      map[cat] = (map[cat] || 0) + tx.carbonEmitted;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  })();

  // Goal progress data for radial chart
  const goalProgressData = goals.map(g => ({
    name: g.category?.name || 'Goal',
    progress: g.progressPercent || 0,
    status: g.status,
  }));

  const activeGoals = goals.filter(g => g.status === 'Active').length;
  const achievedGoals = goals.filter(g => g.status === 'Achieved').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 min-h-screen bg-neutral-bg">
        <div className="text-brand-primary font-medium text-lg animate-pulse">🌿 Loading Environmental Data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <EnvironmentalHeader />

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center bg-neutral-surface p-6 rounded-xl shadow-md border border-neutral-border/60 gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-brand-primary">🌿 Environmental Dashboard</h1>
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

        {/* Tabs */}
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

        {/* Overview Tab */}
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

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-neutral-surface rounded-xl shadow-md border border-neutral-border/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-border/60 flex justify-between items-center">
              <h3 className="font-bold text-neutral-text">Carbon Transactions</h3>
              <span className="text-xs text-neutral-textMuted">{transactions.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-bg/60">
                  <tr>
                    {['Date', 'Factor', 'Activity', 'Carbon (kg CO₂e)', 'Department', 'Logged By'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-textMuted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/40">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-textMuted">No transactions in this period. Use the Carbon Log form to add entries.</td></tr>
                  ) : transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-neutral-bg/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-neutral-textMuted whitespace-nowrap">
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-text">{tx.emissionFactor?.name || '—'}</td>
                      <td className="px-4 py-3 text-neutral-textMuted text-xs">
                        {tx.activityValue} {tx.emissionFactor?.unit}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold font-mono text-brand-primary">{tx.carbonEmitted?.toFixed(3)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-neutral-bg rounded text-xs">{tx.department?.code || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-textMuted">{tx.user?.username || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="bg-neutral-surface rounded-xl p-12 text-center border border-neutral-border/60 shadow-sm">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-neutral-textMuted text-sm">No environmental goals set yet. Admins and Managers can create reduction targets via the API.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(goal => (
                  <div key={goal._id} className="bg-neutral-surface rounded-xl p-5 shadow-sm border border-neutral-border/60">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-neutral-text">{goal.category?.name}</h4>
                        <p className="text-xs text-neutral-textMuted">{goal.department?.name}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        goal.status === 'Achieved' ? 'bg-green-100 text-green-700' :
                        goal.status === 'Failed' ? 'bg-red-100 text-red-700' :
                        'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {goal.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-neutral-textMuted mb-1">
                        <span>{goal.currentValue?.toFixed(1)} kg CO₂e used</span>
                        <span>Target: {goal.targetValue} kg</span>
                      </div>
                      <div className="w-full bg-neutral-bg rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            goal.progressPercent >= 100 ? 'bg-red-500' :
                            goal.progressPercent >= 75 ? 'bg-amber-500' :
                            'bg-brand-primary'
                          }`}
                          style={{ width: `${Math.min(100, goal.progressPercent || 0)}%` }}
                        />
                      </div>
                      <div className="text-right text-xs font-bold text-brand-primary mt-0.5">{goal.progressPercent || 0}%</div>
                    </div>

                    <div className="flex justify-between text-xs text-neutral-textMuted">
                      <span>📅 {new Date(goal.startDate).toLocaleDateString('en-IN')}</span>
                      <span>→ {new Date(goal.endDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
