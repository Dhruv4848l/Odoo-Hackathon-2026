import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCSRActivities,
  signupForActivity,
  createCSRActivity,
  clearError,
  clearSuccess,
} from '../../store/socialSlice';

const STATUS_COLORS = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Create Activity Modal ──────────────────────────────────────────────────────
function CreateActivityModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createCSRActivity(form));
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">📋 New CSR Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Community Tree Planting"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief activity description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Venue"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Create Activity</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Activity Card ──────────────────────────────────────────────────────────────
function ActivityCard({ activity, onSignup, userRole }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Color accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-blue-700 transition-colors flex-1 mr-2">
            {activity.title}
          </h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[activity.status] || 'bg-gray-100 text-gray-600'}`}>
            {activity.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{activity.description}</p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-base">📅</span>
            <span>{formatDate(activity.date)}</span>
          </div>
          {activity.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-base">📍</span>
              <span>{activity.location}</span>
            </div>
          )}
          {activity.department_id?.name && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-base">🏢</span>
              <span>{activity.department_id.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              ✨ {activity.xpReward || 50} XP
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              💎 {activity.pointsReward || 50} pts
            </span>
          </div>
          {activity.status === 'Scheduled' && userRole === 'Employee' && (
            <button
              onClick={() => onSignup(activity._id)}
              className="text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CSRActivityList() {
  const dispatch = useDispatch();
  const { csrActivities, loading, error, successMessage } = useSelector((s) => s.social);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchCSRActivities({ status: filterStatus || undefined }));
  }, [dispatch, filterStatus]);

  useEffect(() => {
    if (successMessage) setTimeout(() => dispatch(clearSuccess()), 3000);
    if (error) setTimeout(() => dispatch(clearError()), 4000);
  }, [successMessage, error, dispatch]);

  const handleSignup = (activityId) => dispatch(signupForActivity(activityId));

  const filtered = csrActivities.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Toast notifications */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn">
          ✅ {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🤝 <span>CSR Activities</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Browse, sign up, and participate in community responsibility initiatives.
            </p>
          </div>
          {['Admin', 'Manager'].includes(user?.role) && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 transition-colors text-sm"
            >
              + New Activity
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-5">
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-64"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🌿</p>
          <p className="text-lg font-medium">No activities found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              onSignup={handleSignup}
              userRole={user?.role}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateActivityModal
          onClose={() => setShowCreate(false)}
          onCreated={() => dispatch(fetchCSRActivities())}
        />
      )}
    </div>
  );
}
