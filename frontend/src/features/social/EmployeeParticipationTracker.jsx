import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParticipations } from '../../store/socialSlice';
import * as socialApi from '../../api/social.api';
import { Calendar, User, FileUp, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function EmployeeParticipationTracker() {
  const dispatch = useDispatch();
  const { participations, loading } = useSelector((s) => s.social);
  const { user } = useSelector((s) => s.auth);

  const [selectedFile, setSelectedFile] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const loadData = () => {
    // For employees, fetchParticipations filters own internally
    dispatch(fetchParticipations());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError('');
  };

  const handleUploadSubmit = async (e, id) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('proof', selectedFile);

    try {
      setUploadError('');
      setUploadSuccess('');
      const res = await socialApi.submitActivityProof(id, formData);
      if (res.success) {
        setUploadSuccess('Proof submitted successfully! Awaiting approval.');
        setSelectedFile(null);
        setSubmittingId(null);
        loadData();
      } else {
        setUploadError(res.message || 'Failed to submit proof');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Failed to submit proof');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[500px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🏃‍♂️ My Participation Tracker</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track the CSR activities you signed up for, upload evidence of completion, and view manager approvals.
        </p>
      </div>

      {uploadSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5 text-green-600" /> {uploadSuccess}
        </div>
      )}

      {uploadError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 text-red-600" /> {uploadError}
        </div>
      )}

      {loading && participations.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : participations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🌿</p>
          <p className="text-base font-semibold">You haven't signed up for any activities yet.</p>
          <p className="text-xs mt-1 text-gray-400">Browse CSR Activities and click "Sign Up" to get started.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {participations.map((p) => {
            const act = p.activity_id || {};
            const isPendingUpload = !p.proof;
            const isUploading = submittingId === p._id;

            return (
              <div key={p._id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-gray-900 text-base">{act.title || 'CSR Initiative'}</div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {act.date ? new Date(act.date).toLocaleDateString() : 'TBD'}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                      Points: {act.pointsReward || 50} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-4 md:justify-end">
                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(p.approval_status)}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${getStatusBadge(p.approval_status)}`}>
                      {p.approval_status === 'Pending' && !p.proof ? 'Pending Upload' : p.approval_status}
                    </span>
                  </div>

                  {/* Evidence indicator */}
                  {p.proof && (
                    <div className="text-xs text-gray-500">
                      Proof: <a href={`http://localhost:5000${p.proof}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Attached File</a>
                    </div>
                  )}

                  {/* Upload button/form */}
                  {isPendingUpload && (
                    <div>
                      {isUploading ? (
                        <form onSubmit={(e) => handleUploadSubmit(e, p._id)} className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-200 rounded-xl">
                          <input
                            type="file"
                            required
                            accept=".png,.jpg,.jpeg,.pdf"
                            onChange={handleFileChange}
                            className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                          >
                            Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSubmittingId(null); setSelectedFile(null); }}
                            className="text-xs text-gray-400 hover:text-gray-600 p-1"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setSubmittingId(p._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors text-xs font-semibold rounded-lg"
                        >
                          <FileUp className="w-3.5 h-3.5" /> Submit Proof
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
