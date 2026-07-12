import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Wind, FileText, Target, CheckCircle, BarChart3, RefreshCw, Leaf } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EnvironmentalHeader from './EnvironmentalHeader';
import CarbonTransactionBoard from './CarbonTransactionBoard';
import EnvironmentalGoalBoard from './EnvironmentalGoalBoard';

const COLORS = ['#1F5C4D', '#2E6DA4', '#C9862A', '#8E3B46', '#4CAF50', '#FF9800'];

const StatCard = ({ label, value, unit, icon: Icon, color = 'text-[#1F5C4D]', trend }) => (
  <div className="bg-neutral-surface rounded-2xl p-5 border border-neutral-border/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider leading-none mb-1.5">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <p className={`text-2xl font-display font-black ${color}`}>{value}</p>
        {unit && <span className="text-xs text-neutral-textMuted font-semibold ml-1">{unit}</span>}
      </div>
    </div>
    <div className="p-2 bg-neutral-bg/60 rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <EnvironmentalHeader />

      {/* Dashboard Title Section */}
      <div className="flex flex-wrap justify-between items-center bg-neutral-surface p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60 gap-4">
        <div>
          <h1 className="text-lg font-display font-black text-[#1F5C4D] flex items-center gap-2">
            <Leaf className="w-5 h-5 text-brand-primary" /> Environmental Dashboard
          </h1>
          <p className="text-xs text-neutral-textMuted mt-0.5 font-medium">Real-time carbon emission tracking and goal attainment</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider">Period</label>
          <select
            value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 border border-neutral-border rounded-xl text-xs bg-neutral-bg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
          <button 
            onClick={fetchData} 
            className="px-3.5 py-1.5 border border-brand-primary text-brand-primary font-bold rounded-xl text-xs hover:bg-brand-primary hover:text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Sub-tabs Selector */}
      <div className="flex bg-neutral-surface p-1 rounded-2xl border border-neutral-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'transactions', label: 'Transactions', icon: FileText },
          { key: 'goals', label: 'Goals', icon: Target },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-center font-bold rounded-xl text-xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                  : 'text-neutral-textMuted hover:text-neutral-text hover:bg-neutral-bg/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total CO₂ Emitted" value={totalCarbon.toFixed(1)} unit="kg" icon={Wind} />
            <StatCard label="Transactions Logged" value={transactions.length} unit="entries" icon={FileText} />
            <StatCard label="Active Goals" value={activeGoals} unit="targets" icon={Target} />
            <StatCard label="Goals Achieved" value={achievedGoals} unit="completed" icon={CheckCircle} color="text-green-600" />
          </div>

          {/* Area Chart – Emissions over time */}
          <div className="bg-neutral-surface rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60 p-6">
            <h3 className="text-sm font-bold text-neutral-text mb-4 font-display">Carbon Emissions Over Time (kg CO₂e)</h3>
            {emissionsByDay.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-neutral-textMuted text-xs font-semibold">No transaction data in this period.</div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emissionsByDay}>
                    <defs>
                      <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1F5C4D" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1F5C4D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 12 }}
                      formatter={(v) => [`${v} kg CO₂e`, 'Emissions']} 
                    />
                    <Area type="monotone" dataKey="carbon" stroke="#1F5C4D" strokeWidth={2} fill="url(#carbonGrad)" dot={{ r: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Two-column lower charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Bar Chart */}
            <div className="bg-neutral-surface rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60 p-6">
              <h3 className="text-sm font-bold text-neutral-text mb-4 font-display">Emissions by Department (kg CO₂e)</h3>
              {emissionsByDept.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-neutral-textMuted text-xs font-semibold">No data yet.</div>
              ) : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emissionsByDept}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                      <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 12 }}
                        formatter={(v) => [`${v} kg CO₂e`, 'Carbon']} 
                      />
                      <Bar dataKey="carbon" fill="#1F5C4D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Pie Chart */}
            <div className="bg-neutral-surface rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-border/60 p-6">
              <h3 className="text-sm font-bold text-neutral-text mb-4 font-display">Emissions by Category</h3>
              {emissionsByCategory.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-neutral-textMuted text-xs font-semibold">No data yet.</div>
              ) : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={emissionsByCategory} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {emissionsByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 12 }}
                        formatter={(v) => [`${v} kg CO₂e`]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
