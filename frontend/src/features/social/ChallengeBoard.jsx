import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchChallenges,
  joinChallenge,
  clearError,
  clearSuccess,
} from '../../store/socialSlice';

const DIFFICULTY_CONFIG = {
  Easy: { color: 'bg-green-100 text-green-700', icon: '🟢' },
  Medium: { color: 'bg-amber-100 text-amber-700', icon: '🟡' },
  Hard: { color: 'bg-red-100 text-red-700', icon: '🔴' },
};

const STATUS_BADGE = {
  Draft: 'bg-gray-100 text-gray-500',
  Active: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
  Archived: 'bg-gray-100 text-gray-400',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

function ChallengeCard({ challenge, onJoin, userRole }) {
  const diff = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.Easy;
  const daysLeft = challenge.deadline
    ? Math.max(0, Math.ceil((new Date(challenge.deadline) - Date.now()) / 86400000))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top accent */}
      <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />

      <div className="p-5 flex flex-col flex-1">
        {/* Status + Difficulty row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[challenge.status]}`}>
            {challenge.status}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${diff.color}`}>
            {diff.icon} {challenge.difficulty}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
          {challenge.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3">{challenge.description}</p>

        {/* XP reward */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-bold text-amber-700">{challenge.xp} XP</span>
          </div>
          {challenge.evidence_required && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <span>📎</span> Proof Required
            </div>
          )}
        </div>

        {/* Deadline */}
        {daysLeft !== null && (
          <div className={`text-xs mb-4 flex items-center gap-1.5 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            <span>⏱</span>
            {daysLeft === 0
              ? 'Due Today!'
              : daysLeft === 1
              ? '1 day left'
              : `${daysLeft} days left`}
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">{formatDate(challenge.deadline)}</span>
          </div>
        )}

        {/* CTA */}
        {challenge.status === 'Active' && userRole === 'Employee' && (
          <button
            onClick={() => onJoin(challenge._id)}
            className="mt-auto w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow"
          >
            🚀 Join Challenge
          </button>
        )}
        {challenge.status === 'Active' && ['Admin', 'Manager'].includes(userRole) && (
          <div className="mt-auto pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
            Manage via Approval Queue
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChallengeBoard() {
  const dispatch = useDispatch();
  const { challenges, loading, error, successMessage, actionLoading } = useSelector((s) => s.social);
  const { user } = useSelector((s) => s.auth);

  const [filterStatus, setFilterStatus] = useState('Active');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const filters = {};
    if (filterStatus) filters.status = filterStatus;
    if (filterDifficulty) filters.difficulty = filterDifficulty;
    dispatch(fetchChallenges(filters));
  }, [dispatch, filterStatus, filterDifficulty]);

  useEffect(() => {
    if (successMessage) setTimeout(() => dispatch(clearSuccess()), 3000);
    if (error) setTimeout(() => dispatch(clearError()), 4000);
  }, [successMessage, error, dispatch]);

  const handleJoin = (id) => dispatch(joinChallenge(id));

  const filtered = challenges.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const statCounts = {
    Active: challenges.filter((c) => c.status === 'Active').length,
    Draft: challenges.filter((c) => c.status === 'Draft').length,
    Completed: challenges.filter((c) => c.status === 'Completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      {/* Toasts */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          ✅ {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          🏆 <span>Challenge Board</span>
        </h1>
        <p className="text-gray-500 text-sm">Complete challenges to earn XP and unlock badges.</p>

        {/* Stats row */}
        <div className="flex gap-4 mt-5 flex-wrap">
          {Object.entries(statCounts).map(([key, val]) => (
            <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold text-gray-900">{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white w-60"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Under Review">Under Review</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">🟢 Easy</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Hard">🔴 Hard</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🎯</p>
          <p className="text-lg font-medium">No challenges found</p>
          <p className="text-sm mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((c) => (
            <ChallengeCard
              key={c._id}
              challenge={c}
              onJoin={handleJoin}
              userRole={user?.role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
