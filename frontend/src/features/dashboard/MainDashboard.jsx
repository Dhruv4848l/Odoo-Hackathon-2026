import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import { useSelector } from 'react-redux';

const ESG_COLORS = {
  env: '#1F5C4D',
  social: '#2E6DA4',
  governance: '#8E3B46',
  gold: '#C9862A',
};

const StatCard = ({ label, value, sub, icon, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.06)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontSize: '22px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '32px', fontWeight: '800', color: color || '#1F5C4D', fontFamily: 'Poppins, sans-serif', lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: '12px', color: '#6B7280' }}>{sub}</div>}
  </div>
);

const ModuleCard = ({ title, icon, description, route, color, status }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(route)}
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: `1px solid ${color}22`,
        borderLeft: `4px solid ${color}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '28px' }}>{icon}</span>
        <span style={{
          fontSize: '11px', fontWeight: '600', padding: '2px 10px',
          borderRadius: '99px', background: `${color}18`, color: color
        }}>{status}</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: '0 0 6px 0' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>{description}</p>
      <div style={{ marginTop: '14px', fontSize: '12px', fontWeight: '600', color: color }}>View Module →</div>
    </div>
  );
};

export default function MainDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [emissionFactors, setEmissionFactors] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [txRes, goalRes, deptRes, efRes] = await Promise.all([
          axiosClient.get('/carbon-transactions'),
          axiosClient.get('/environmental-goals'),
          axiosClient.get('/departments'),
          axiosClient.get('/emission-factors'),
        ]);
        if (txRes.success) setTransactions(txRes.data);
        if (goalRes.success) setGoals(goalRes.data);
        if (deptRes.success) setDepartments(deptRes.data);
        if (efRes.success) setEmissionFactors(efRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived stats
  const totalCarbon = transactions.reduce((s, t) => s + (t.carbonEmitted || 0), 0);
  const activeGoals = goals.filter(g => g.status === 'Active').length;
  const achievedGoals = goals.filter(g => g.status === 'Achieved').length;

  // Emissions by department bar data
  const byDept = departments.map(d => {
    const total = transactions
      .filter(t => t.department?._id === d._id || t.department === d._id)
      .reduce((s, t) => s + (t.carbonEmitted || 0), 0);
    return { name: d.code, value: parseFloat(total.toFixed(1)) };
  }).filter(d => d.value > 0);

  // Category pie
  const byCat = {};
  transactions.forEach(t => {
    const cat = t.emissionFactor?.category?.name || 'Other';
    byCat[cat] = (byCat[cat] || 0) + (t.carbonEmitted || 0);
  });
  const catData = Object.entries(byCat).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }));

  // Monthly trend
  const monthly = {};
  transactions.forEach(t => {
    const key = new Date(t.transactionDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    monthly[key] = (monthly[key] || 0) + (t.carbonEmitted || 0);
  });
  const trendData = Object.entries(monthly).map(([month, carbon]) => ({ month, carbon: parseFloat(carbon.toFixed(1)) }));

  const PIE_COLORS = [ESG_COLORS.env, ESG_COLORS.social, ESG_COLORS.governance, ESG_COLORS.gold, '#10B981', '#F59E0B'];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '28px', background: '#F7F5F0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1F5C4D 0%, #2D7A67 50%, #174739 100%)',
          borderRadius: '20px',
          padding: '32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '160px', opacity: 0.06, userSelect: 'none' }}>🌱</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>
              {greeting}, {user?.username || 'User'} 👋
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px', fontFamily: 'Poppins, sans-serif' }}>
              EcoSphere ESG Dashboard
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              Environmental · Social · Governance — unified at a glance
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/environmental/log')}
                style={{
                  padding: '9px 18px', background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px',
                  color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  backdropFilter: 'blur(8px)', transition: 'all 0.15s',
                }}
              >
                + Log Carbon Activity
              </button>
              <button
                onClick={() => navigate('/environmental')}
                style={{
                  padding: '9px 18px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px',
                  color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                  transition: 'all 0.15s',
                }}
              >
                View Environmental Report
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard
            label="Total CO₂ Emitted"
            value={`${totalCarbon.toFixed(1)}`}
            sub="kg CO₂e — all departments"
            icon="💨"
            color={ESG_COLORS.env}
            onClick={() => navigate('/environmental')}
          />
          <StatCard
            label="Transactions Logged"
            value={transactions.length}
            sub="carbon activity records"
            icon="📊"
            color="#2D7A67"
          />
          <StatCard
            label="Active Goals"
            value={activeGoals}
            sub="sustainability targets"
            icon="🎯"
            color={ESG_COLORS.gold}
          />
          <StatCard
            label="Goals Achieved"
            value={achievedGoals}
            sub="targets met"
            icon="✅"
            color="#10B981"
          />
          <StatCard
            label="Departments"
            value={departments.length}
            sub="org units tracked"
            icon="🏢"
            color={ESG_COLORS.social}
            onClick={() => navigate('/admin')}
          />
          <StatCard
            label="Emission Factors"
            value={emissionFactors.length}
            sub="conversion rates configured"
            icon="⚗️"
            color={ESG_COLORS.governance}
            onClick={() => navigate('/environmental/factors')}
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Trend Chart */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>
              Carbon Emissions Trend
            </h3>
            {trendData.length === 0 ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                No emissions data yet. <button onClick={() => navigate('/environmental/log')} style={{ marginLeft: '6px', color: ESG_COLORS.env, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Log first activity →</button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="envGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ESG_COLORS.env} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={ESG_COLORS.env} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Emissions']} />
                  <Area type="monotone" dataKey="carbon" stroke={ESG_COLORS.env} strokeWidth={2.5} fill="url(#envGrad)" dot={{ r: 4, fill: ESG_COLORS.env }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Pie */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>
              By Category
            </h3>
            {catData.length === 0 ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                    label={({ name, percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''}>
                    {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} kg`, '']} />
                  <Legend iconSize={9} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dept Bar + Goals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Department Comparison */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>
              Emissions by Department
            </h3>
            {byDept.length === 0 ? (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} width={36} />
                  <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Carbon']} />
                  <Bar dataKey="value" fill={ESG_COLORS.env} radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Environmental Goals */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>Goal Attainment</h3>
              <button onClick={() => navigate('/environmental')} style={{ background: 'none', border: 'none', color: ESG_COLORS.env, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View all →</button>
            </div>
            {goals.length === 0 ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '0 20px' }}>
                No goals set yet. Admins/Managers can create targets.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                {goals.slice(0, 5).map(g => {
                  const pct = Math.min(100, g.progressPercent || 0);
                  const barColor = pct >= 100 ? '#EF4444' : pct >= 75 ? '#F59E0B' : ESG_COLORS.env;
                  return (
                    <div key={g._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{g.category?.name}</span>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>{g.department?.code} · {pct}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Module Navigation Cards */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: '0 0 14px' }}>ESG Modules</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <ModuleCard
              title="Environmental"
              icon="🌿"
              description="Track carbon emissions, configure emission factors, and monitor sustainability goals."
              route="/environmental"
              color={ESG_COLORS.env}
              status="Active"
            />
            <ModuleCard
              title="Social"
              icon="🤝"
              description="CSR activities, employee challenges, gamification leaderboard and reward catalog."
              route="/social"
              color={ESG_COLORS.social}
              status="Dev B"
            />
            <ModuleCard
              title="Governance"
              icon="⚖️"
              description="ESG policies, acknowledgements, audits, and compliance issue tracking."
              route="/governance"
              color={ESG_COLORS.governance}
              status="Dev C"
            />
            {user?.role === 'Admin' && (
              <ModuleCard
                title="Admin Console"
                icon="🛡️"
                description="Manage users, departments, categories and platform-wide settings."
                route="/admin"
                color={ESG_COLORS.gold}
                status="Admin"
              />
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>Recent Carbon Activities</h3>
            <button onClick={() => navigate('/environmental/log')} style={{ padding: '7px 14px', background: ESG_COLORS.env, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              + Log Activity
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Date', 'Activity', 'Dept', 'Activity Value', 'CO₂ Emitted', 'Logged By'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                      No activities logged yet. <button onClick={() => navigate('/environmental/log')} style={{ color: ESG_COLORS.env, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Log your first activity →</button>
                    </td>
                  </tr>
                ) : transactions.slice(0, 8).map(tx => (
                  <tr key={tx._id} style={{ borderTop: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{new Date(tx.transactionDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1F2937' }}>{tx.emissionFactor?.name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', background: '#F3F4F6', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{tx.department?.code || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{tx.activityValue} {tx.emissionFactor?.unit}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: '700', color: ESG_COLORS.env, fontFamily: 'monospace' }}>{tx.carbonEmitted?.toFixed(3)} kg</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{tx.user?.username || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#9CA3AF' }}>
          EcoSphere ESG Platform · Developer A — Environmental &amp; Core Setup · Phase 1–3 Complete
        </div>
      </div>
    </div>
  );
}
