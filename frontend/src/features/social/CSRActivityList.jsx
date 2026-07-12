import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCSRActivities,
  signupForActivity,
  createCSRActivity,
  fetchParticipations,
  approveParticipation,
  clearError,
  clearSuccess,
} from '../../store/socialSlice';
import axiosClient from '../../api/axiosClient';

const STATUS_COLORS = {
  Scheduled: 'bg-blue-100 text-blue-700 border-blue-200 border',
  Completed: 'bg-green-100 text-green-700 border-green-200 border',
  Cancelled: 'bg-red-100 text-red-600 border-red-200 border',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Create Activity Modal ──────────────────────────────────────────────────────
// ── Create Activity Modal ──────────────────────────────────────────────────────
function CreateActivityModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category_id: '',
    department_id: '',
    xpReward: 50,
    pointsReward: 50
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Fetch social categories
    axiosClient.get('/categories?type=Social')
      .then(res => {
        if (res.success) setCategories(res.data);
      })
      .catch(err => console.error(err));

    // Fetch departments
    axiosClient.get('/departments')
      .then(res => {
        const list = res.success && res.data ? res.data : (Array.isArray(res) ? res : []);
        setDepartments(list);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.category_id || !form.department_id) {
      setErrorMsg('Please select both a category and a department.');
      return;
    }

    const action = await dispatch(createCSRActivity(form));
    if (createCSRActivity.fulfilled.match(action)) {
      onCreated();
      onClose();
    } else {
      setErrorMsg(action.payload || 'Failed to create CSR activity');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">📋 New CSR Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer">&times;</button>
        </div>
        {errorMsg && (
          <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg mb-4 font-medium">{errorMsg}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Community Tree Planting"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief activity description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                required
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Venue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
              <input
                type="number"
                min="0"
                value={form.xpReward}
                onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
              <input
                type="number"
                min="0"
                value={form.pointsReward}
                onChange={(e) => setForm({ ...form, pointsReward: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">Create Activity</button>
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
  const { csrActivities, participations, loading, error, successMessage, actionLoading } = useSelector((s) => s.social);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Row selection & proof modal states
  const [selectedParticipation, setSelectedParticipation] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState(null);

  useEffect(() => {
    dispatch(fetchCSRActivities({ status: filterStatus || undefined }));
    if (user && ['Admin', 'Manager'].includes(user.role)) {
      dispatch(fetchParticipations());
    }
  }, [dispatch, filterStatus, user]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleSignup = async (activityId) => {
    const action = await dispatch(signupForActivity(activityId));
    if (signupForActivity.fulfilled.match(action)) {
      dispatch(fetchCSRActivities({ status: filterStatus || undefined }));
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedParticipation) return;
    const action = await dispatch(approveParticipation({ id: selectedParticipation._id, decision }));
    if (approveParticipation.fulfilled.match(action)) {
      setSelectedParticipation(null);
      dispatch(fetchParticipations());
    }
  };

  const filtered = csrActivities.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Filter queue to show only Pending records or all for review
  const pendingQueue = participations.filter(p => p.approval_status === 'Pending' || p.approval_status === 'Approved');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 space-y-8">
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

      {/* Proof Modal */}
      {evidenceUrl && (
        <EvidenceModal proofUrl={evidenceUrl} onClose={() => setEvidenceUrl(null)} />
      )}

      {/* Header */}
      <div className="mb-6">
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
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 transition-colors text-sm cursor-pointer"
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
      {loading && csrActivities.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
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

      {/* Approval Queue Section (Shown only for Admin / Manager) */}
      {user && ['Admin', 'Manager'].includes(user.role) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Employee Participation: approval queue
            </h2>
            {selectedParticipation && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                Selected: {selectedParticipation.employee_id?.username}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            {participations.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No active employee participations in the queue.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase">
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Activity/Challenge</th>
                    <th className="px-6 py-3">Proof</th>
                    <th className="px-6 py-3">Points</th>
                    <th className="px-6 py-3">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participations.map((p) => {
                    const isSelected = selectedParticipation?._id === p._id;
                    const proofName = p.proof ? p.proof.split('/').pop() : '—';
                    return (
                      <tr
                        key={p._id}
                        onClick={() => setSelectedParticipation(isSelected ? null : p)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50/50 ${isSelected ? 'bg-blue-50/60 font-medium' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{p.employee_id?.username || '—'}</div>
                          <div className="text-xs text-gray-400 font-normal">{p.employee_id?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{p.activity_id?.title || '—'}</td>
                        <td className="px-6 py-4">
                          {p.proof ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEvidenceUrl(p.proof);
                              }}
                              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                            >
                              📎 {proofName}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No proof</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">{p.points_earned || p.activity_id?.pointsReward || 50}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 border rounded-full text-xs font-semibold uppercase ${
                            p.approval_status === 'Approved'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : p.approval_status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {p.approval_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Actions bar */}
          {selectedParticipation && selectedParticipation.approval_status === 'Pending' && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={handleReject}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          )}
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

// ── Evidence Preview Modal ──────────────────────────────────────────────────
function EvidenceModal({ proofUrl, onClose }) {
  if (!proofUrl) return null;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(proofUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">📎 Evidence File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer">&times;</button>
        </div>
        <div className="p-5">
          {isImage ? (
            <img
              src={`http://localhost:5000${proofUrl}`}
              alt="Proof"
              className="max-w-full rounded-xl border border-gray-200"
            />
          ) : (
            <a
              href={`http://localhost:5000${proofUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl">📄</span>
              <div>
                <div className="font-medium text-sm">View Attachment</div>
                <div className="text-xs text-gray-400 break-all">{proofUrl}</div>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
