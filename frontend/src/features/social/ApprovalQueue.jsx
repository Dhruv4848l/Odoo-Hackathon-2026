import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchParticipations,
  approveParticipation,
  clearError,
  clearSuccess,
} from '../../store/socialSlice';

const STATUS_BADGE = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-600',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// Evidence Preview Modal
function EvidenceModal({ proofUrl, onClose }) {
  if (!proofUrl) return null;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(proofUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">📎 Evidence File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
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

// Confirm Modal
function ConfirmModal({ action, participantName, onConfirm, onCancel }) {
  const isApprove = action === 'Approved';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{isApprove ? '✅' : '❌'}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isApprove ? 'Approve' : 'Reject'} Participation?
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          You are about to <strong>{action?.toLowerCase()}</strong> {participantName}'s participation.
          {isApprove && ' This will award them XP.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 font-medium rounded-xl transition-colors text-sm text-white ${isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalQueue() {
  const dispatch = useDispatch();
  const { participations, loading, error, successMessage, actionLoading } = useSelector((s) => s.social);

  const [filterStatus, setFilterStatus] = useState('Pending');
  const [evidenceUrl, setEvidenceUrl] = useState(null);
  const [confirm, setConfirm] = useState(null); // { id, decision, name }

  useEffect(() => {
    dispatch(fetchParticipations({ status: filterStatus || undefined }));
  }, [dispatch, filterStatus]);

  useEffect(() => {
    if (successMessage) setTimeout(() => dispatch(clearSuccess()), 3000);
    if (error) setTimeout(() => dispatch(clearError()), 4000);
  }, [successMessage, error, dispatch]);

  const handleDecision = (id, decision, name) => {
    setConfirm({ id, decision, name });
  };

  const confirmDecision = async () => {
    await dispatch(approveParticipation({ id: confirm.id, decision: confirm.decision }));
    setConfirm(null);
    dispatch(fetchParticipations({ status: filterStatus || undefined }));
  };

  const pendingCount = participations.filter((p) => p.approval_status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-6">
      {/* Toasts */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-40 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          ✅ {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-40 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Modals */}
      {evidenceUrl && <EvidenceModal proofUrl={evidenceUrl} onClose={() => setEvidenceUrl(null)} />}
      {confirm && (
        <ConfirmModal
          action={confirm.decision}
          participantName={confirm.name}
          onConfirm={confirmDecision}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            📋 <span>Approval Queue</span>
          </h1>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              {pendingCount} pending
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm">Review and approve CSR activity participation submissions.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['Pending', 'Approved', 'Rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : participations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-lg font-medium">Queue is empty!</p>
          <p className="text-sm mt-1">No participations match the current filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Employee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Activity</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Submitted</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Evidence</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {participations.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-sm">
                        {p.employee_id?.username || '—'}
                      </div>
                      <div className="text-xs text-gray-400">{p.employee_id?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-sm">
                        {p.activity_id?.title || '—'}
                      </div>
                      <div className="text-xs text-gray-400">{p.activity_id?.status}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(p.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {p.proof ? (
                        <button
                          onClick={() => setEvidenceUrl(p.proof)}
                          className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                        >
                          <span>📎</span> View Proof
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No proof</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[p.approval_status]}`}>
                        {p.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.approval_status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() =>
                              handleDecision(p._id, 'Approved', p.employee_id?.username)
                            }
                            className="text-xs px-3 py-1.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() =>
                              handleDecision(p._id, 'Rejected', p.employee_id?.username)
                            }
                            className="text-xs px-3 py-1.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
