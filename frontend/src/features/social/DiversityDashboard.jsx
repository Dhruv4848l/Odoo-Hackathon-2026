import React from 'react';
import { Users, ShieldAlert, Award, Heart, CheckCircle2, TrendingUp } from 'lucide-react';

export default function DiversityDashboard() {
  // Mock data representing live diversity rollups
  const metrics = {
    totalEmployees: 248,
    diversityIndex: 86,
    genderRatio: { female: 46, male: 51, other: 3 },
    trainingRate: 92,
    ageGroups: [
      { label: '18-25 (Gen Z)', percentage: 15, color: 'bg-emerald-400' },
      { label: '26-35 (Millennials)', percentage: 45, color: 'bg-blue-500' },
      { label: '36-45 (Gen X)', percentage: 25, color: 'bg-indigo-500' },
      { label: '46+ (Boomers/Older)', percentage: 15, color: 'bg-amber-500' },
    ],
    initiatives: [
      { name: 'Workplace Diversity & Inclusion Charter', status: 'Active', compliance: 100 },
      { name: 'Equal Pay Equity Assessment 2026', status: 'Completed', compliance: 98 },
      { name: 'Inclusive Interview Panel Certification', status: 'Ongoing', compliance: 85 },
      { name: 'Anti-Harassment Training Refreshers', status: 'Active', compliance: 95 },
    ]
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-8 min-h-[500px]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📊 Diversity, Equality & Inclusion Dashboard</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitor organizational composition, training completion rates, and equal employment metrics.
        </p>
      </div>

      {/* Top Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total employees */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-blue-100 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">Headcount</div>
            <div className="text-2xl font-bold text-gray-800">{metrics.totalEmployees}</div>
          </div>
        </div>

        {/* Diversity Index */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-purple-100 text-purple-600 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">Diversity Index</div>
            <div className="text-2xl font-bold text-gray-800">{metrics.diversityIndex} / 100</div>
          </div>
        </div>

        {/* Training Rate */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">Training Completed</div>
            <div className="text-2xl font-bold text-gray-800">{metrics.trainingRate}%</div>
          </div>
        </div>

        {/* Opportunity index */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-amber-100 text-amber-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">Equal Opportunity</div>
            <div className="text-2xl font-bold text-gray-800">94 / 100</div>
          </div>
        </div>
      </div>

      {/* Main composition grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender distribution */}
        <div className="border border-gray-100 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Gender Diversity Composition</h3>
          <div className="space-y-3">
            {/* Female */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-500">Female</span>
                <span className="text-gray-800 font-bold">{metrics.genderRatio.female}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: `${metrics.genderRatio.female}%` }} />
              </div>
            </div>

            {/* Male */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-500">Male</span>
                <span className="text-gray-800 font-bold">{metrics.genderRatio.male}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${metrics.genderRatio.male}%` }} />
              </div>
            </div>

            {/* Non-Binary/Other */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-500">Non-Binary / Undisclosed</span>
                <span className="text-gray-800 font-bold">{metrics.genderRatio.other}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${metrics.genderRatio.other}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Age groups distribution */}
        <div className="border border-gray-100 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Age Demographics Breakdown</h3>
          <div className="space-y-3.5">
            {metrics.ageGroups.map((group, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-500">{group.label}</span>
                  <span className="text-gray-800 font-bold">{group.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${group.color} h-full rounded-full`} style={{ width: `${group.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance / Training list */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Diversity & Inclusion Compliance Initiatives</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {metrics.initiatives.map((item, index) => (
            <div key={index} className="p-4 flex items-center justify-between gap-4 flex-wrap text-sm">
              <div className="font-semibold text-gray-800">{item.name}</div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.status}
                </span>
                <span className="text-gray-500 font-medium">Compliance: <strong className="text-gray-800">{item.compliance}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
