import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../../store/socialSlice';

const TROPHY = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_COLORS = {
  1: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900',
  2: 'bg-gradient-to-r from-gray-300 to-slate-200 text-slate-700',
  3: 'bg-gradient-to-r from-orange-300 to-amber-200 text-orange-800',
};

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm ${RANK_COLORS[rank]}`}>
        {TROPHY[rank]}
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
      {rank}
    </div>
  );
}

function XPBar({ xp, maxXp }) {
  const pct = maxXp > 0 ? Math.min(100, (xp / maxXp) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-16 text-right">
        {xp?.toLocaleString()} XP
      </span>
    </div>
  );
}

function TopThreeCard({ entry }) {
  if (!entry) return <div />;
  const rank = entry.rank;
  return (
    <div
      className={`relative rounded-2xl p-5 text-center flex flex-col items-center overflow-hidden shadow-md
        ${rank === 1
          ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300'
          : rank === 2
          ? 'bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200'
          : 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200'
        }
        ${rank === 1 ? 'mt-0 scale-100' : 'mt-6 scale-95'}`}
    >
      {rank === 1 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
      )}
      <div className="text-4xl mb-2">{TROPHY[rank]}</div>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl mb-2 shadow">
        {entry.username?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="font-bold text-gray-900 text-sm mb-0.5">{entry.username}</div>
      <div className="text-xs text-gray-500 mb-3">{entry.department?.name || '—'}</div>
      <div className="bg-white rounded-lg px-3 py-1.5 text-sm font-bold text-purple-700 shadow-sm">
        ⚡ {entry.xp?.toLocaleString()} XP
      </div>
      {entry.badgeCount > 0 && (
        <div className="mt-2 text-xs text-amber-700">🏅 {entry.badgeCount} badges</div>
      )}
    </div>
  );
}

export default function Leaderboard() {
  const dispatch = useDispatch();
  const { leaderboard, loading } = useSelector((s) => s.social);
  const { user } = useSelector((s) => s.auth);

  const [view, setView] = useState('org'); // 'org' | 'department'

  useEffect(() => {
    dispatch(fetchLeaderboard({ type: view, deptId: view === 'department' ? user?.department : undefined }));
  }, [dispatch, view, user]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const maxXp = leaderboard[0]?.xp || 1;

  // Highlight logged-in user's rank
  const myEntry = leaderboard.find((e) => e.userId === user?._id || e.userId === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 p-6">
      {/* Header */}
      <div className="text-center mb-10 pt-4">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
          🏆 Leaderboard
        </h1>
        <p className="text-purple-300 text-sm">
          Top performers ranked by XP earned through CSR activities & challenges
        </p>

        {/* View toggle */}
        <div className="flex justify-center mt-5">
          <div className="bg-white/10 backdrop-blur rounded-xl p-1 inline-flex gap-1">
            {[{ key: 'org', label: '🌍 Org-wide' }, { key: 'department', label: '🏢 My Department' }].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  view === v.key
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-lg">No data yet</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="max-w-2xl mx-auto mb-10">
              <div className="grid grid-cols-3 gap-4">
                {/* Reorder: 2nd, 1st, 3rd for visual podium effect */}
                <TopThreeCard entry={top3[1]} />
                <TopThreeCard entry={top3[0]} />
                <TopThreeCard entry={top3[2]} />
              </div>
            </div>
          )}

          {/* My rank banner (if not in top 3) */}
          {myEntry && myEntry.rank > 3 && (
            <div className="max-w-3xl mx-auto mb-6">
              <div className="bg-purple-600/40 backdrop-blur border border-purple-400/30 rounded-xl px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RankBadge rank={myEntry.rank} />
                  <div>
                    <div className="text-white font-semibold text-sm">Your Rank</div>
                    <div className="text-purple-300 text-xs">{myEntry.username}</div>
                  </div>
                </div>
                <div className="text-amber-300 font-bold">⚡ {myEntry.xp?.toLocaleString()} XP</div>
              </div>
            </div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/5">
                {rest.map((entry) => {
                  const isMe = entry.userId === user?._id || entry.userId === user?.id;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors ${isMe ? 'bg-purple-600/20' : 'hover:bg-white/5'}`}
                    >
                      <RankBadge rank={entry.rank} />
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {entry.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm ${isMe ? 'text-purple-200' : 'text-white'}`}>
                          {entry.username} {isMe && <span className="text-xs text-purple-400">(You)</span>}
                        </div>
                        <div className="text-xs text-white/40">{entry.department?.name || 'N/A'}</div>
                      </div>
                      <div className="hidden sm:block flex-1 max-w-[200px]">
                        <XPBar xp={entry.xp} maxXp={maxXp} />
                      </div>
                      <div className="text-amber-400 text-sm font-bold w-24 text-right">
                        ⚡ {entry.xp?.toLocaleString()}
                      </div>
                      {entry.badgeCount > 0 && (
                        <div className="text-xs text-amber-300/80 w-16 text-right">
                          🏅 {entry.badgeCount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
