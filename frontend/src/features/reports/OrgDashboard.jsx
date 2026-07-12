import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScores, fetchSettings } from '../../store/scoringSlice';
import AppLayout from '../../components/layout/AppLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Leaf, Users, ShieldCheck, TrendingUp, RefreshCw } from 'lucide-react';
import * as scoringApi from '../../api/scoring.api';

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${bg}`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-display font-bold text-neutral-text">{value ?? '—'}</p>
    </div>
  </div>
);

const OrgDashboard = () => {
  const dispatch = useDispatch();
  const { scores, settings, loading } = useSelector((state) => state.scoring);

  useEffect(() => {
    dispatch(fetchScores());
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleRecalculate = async (departmentId) => {
    const date = new Date();
    await scoringApi.recalculateScore({
      departmentId,
      year: date.getFullYear(),
      month: date.getMonth(),
    });
    dispatch(fetchScores());
  };

  const barData = scores.map((s) => ({
    name: s.department?.name || 'Unknown',
    Environmental: Math.round(s.environmentalScore),
    Social: Math.round(s.socialScore),
    Governance: Math.round(s.governanceScore),
    Combined: Math.round(s.combinedScore),
  }));

  // Org-wide averages for stat cards
  const avg = (key) =>
    scores.length
      ? Math.round(scores.reduce((sum, s) => sum + (s[key] || 0), 0) / scores.length)
      : 0;

  // Top department by combined
  const topDept = scores.reduce(
    (best, s) => (s.combinedScore > (best?.combinedScore ?? -1) ? s : best),
    null
  );

  return (
    <AppLayout title="Org ESG Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Avg Environmental"
          value={avg('environmentalScore')}
          icon={Leaf}
          color="text-module-environmental"
          bg="bg-green-50"
        />
        <StatCard
          label="Avg Social"
          value={avg('socialScore')}
          icon={Users}
          color="text-module-social"
          bg="bg-blue-50"
        />
        <StatCard
          label="Avg Governance"
          value={avg('governanceScore')}
          icon={ShieldCheck}
          color="text-module-governance"
          bg="bg-red-50"
        />
        <StatCard
          label="Top Dept Combined"
          value={topDept ? Math.round(topDept.combinedScore) : '—'}
          icon={TrendingUp}
          color="text-brand-secondary"
          bg="bg-yellow-50"
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-base font-display font-semibold text-neutral-text mb-4">
          Department Scores Breakdown
        </h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="Environmental" fill="#1F5C4D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Social" fill="#2E6DA4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Governance" fill="#8E3B46" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Scores Table with Recalculate */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-display font-semibold text-neutral-text mb-4">
          Department Score Details
        </h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading scores...</p>
        ) : scores.length === 0 ? (
          <p className="text-gray-400 text-sm">No scores yet. Run a recalculation to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Period</th>
                  <th className="pb-3 pr-4 text-module-environmental">Env</th>
                  <th className="pb-3 pr-4 text-module-social">Social</th>
                  <th className="pb-3 pr-4 text-module-governance">Gov</th>
                  <th className="pb-3 pr-4 text-brand-primary font-bold">Combined</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scores.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 pr-4 font-medium text-neutral-text">
                      {s.department?.name || 'Unknown'}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {s.year}/{String(s.month + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 pr-4 font-mono">{Math.round(s.environmentalScore)}</td>
                    <td className="py-3 pr-4 font-mono">{Math.round(s.socialScore)}</td>
                    <td className="py-3 pr-4 font-mono">{Math.round(s.governanceScore)}</td>
                    <td className="py-3 pr-4 font-mono font-bold text-brand-primary">
                      {Math.round(s.combinedScore)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleRecalculate(s.department?._id)}
                        title="Recalculate"
                        className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-brand-primary transition"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default OrgDashboard;
