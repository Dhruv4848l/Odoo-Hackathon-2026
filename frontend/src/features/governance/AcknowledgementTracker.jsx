import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPolicies, fetchAcknowledgementRate } from '../../store/governanceSlice';
import axiosClient from '../../api/axiosClient';
import { Check, ClipboardList, RefreshCw, BarChart2, Users, FileText, CheckCircle2 } from 'lucide-react';
import GovernanceHeader from './GovernanceHeader';

export default function AcknowledgementTracker() {
  const dispatch = useDispatch();

  // Redux Selectors
  const { policies, acknowledgementRate, loading, error } = useSelector((state) => state.governance);

  // Local State
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [detailedLogs, setDetailedLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPolicies());
  }, [dispatch]);

  // Set default policy selection
  useEffect(() => {
    if (policies.length > 0 && !selectedPolicyId) {
      const mandatoryPolicies = policies.filter(p => p.mandatory);
      const defaultId = mandatoryPolicies.length > 0 ? mandatoryPolicies[0]._id : policies[0]._id;
      setSelectedPolicyId(defaultId);
    }
  }, [policies, selectedPolicyId]);

  // Fetch rates and detailed logs on policy selection
  useEffect(() => {
    if (selectedPolicyId) {
      dispatch(fetchAcknowledgementRate(selectedPolicyId));
      
      // Fetch detailed logs directly from backend
      setLogsLoading(true);
      axiosClient.get(`/acknowledgements/policy/${selectedPolicyId}`)
        .then(res => {
          if (res.success) {
            setDetailedLogs(res.data);
          }
          setLogsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setDetailedLogs([]);
          setLogsLoading(false);
        });
    }
  }, [selectedPolicyId, dispatch]);

  const handleRefresh = () => {
    if (selectedPolicyId) {
      dispatch(fetchAcknowledgementRate(selectedPolicyId));
      setLogsLoading(true);
      axiosClient.get(`/acknowledgements/policy/${selectedPolicyId}`)
        .then(res => {
          if (res.success) {
            setDetailedLogs(res.data);
          }
          setLogsLoading(false);
        }).catch(() => {
          setLogsLoading(false);
        });
    }
  };

  // Helper to color code percentages
  const getPercentageColor = (pct) => {
    if (pct >= 85) return 'text-green-600';
    if (pct >= 50) return 'text-brand-secondary'; // Gold
    return 'text-brand-alert'; // Maroon/Red
  };

  const getProgressBg = (pct) => {
    if (pct >= 85) return 'bg-green-500';
    if (pct >= 50) return 'bg-brand-secondary';
    return 'bg-brand-alert';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <GovernanceHeader />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-primary">⚖️ Policy Acknowledgement Tracker</h1>
          <p className="text-neutral-textMuted mt-1">Track compliance sign-off logs and department percentages.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-neutral-text whitespace-nowrap">Filter Policy:</label>
          <select
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            className="bg-neutral-surface border border-neutral-border text-sm p-2 rounded-lg focus:outline-none focus:border-brand-primary"
          >
            {policies.map(p => (
              <option key={p._id} value={p._id}>
                {p.title} {p.mandatory ? '(Mandatory)' : '(Optional)'}
              </option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            className="p-2 border border-neutral-border rounded-lg bg-neutral-surface hover:bg-neutral-bg text-neutral-textMuted hover:text-neutral-text transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && !acknowledgementRate ? (
        <div className="text-center py-12 text-neutral-textMuted">Loading statistics...</div>
      ) : acknowledgementRate ? (
        <div className="space-y-6">
          {/* Top Panel: Overall Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Org Rate */}
            <div className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-neutral-textMuted uppercase font-bold">Overall Sign-off</span>
                <h2 className={`text-4xl font-display font-bold ${getPercentageColor(acknowledgementRate.overall?.percentage)}`}>
                  {acknowledgementRate.overall?.percentage}%
                </h2>
                <p className="text-xs text-neutral-textMuted">
                  Organization compliance rate
                </p>
              </div>
              <div className="p-3 bg-neutral-bg rounded-lg">
                <BarChart2 className="w-8 h-8 text-brand-primary" />
              </div>
            </div>

            {/* Card 2: Signed Count */}
            <div className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-neutral-textMuted uppercase font-bold">Signed Signatures</span>
                <h2 className="text-4xl font-display font-bold text-neutral-text">
                  {acknowledgementRate.overall?.acknowledgedCount}
                </h2>
                <p className="text-xs text-neutral-textMuted">
                  Total acknowledged employees
                </p>
              </div>
              <div className="p-3 bg-neutral-bg rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Card 3: Pending Count */}
            <div className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-neutral-textMuted uppercase font-bold">Pending Sign-off</span>
                <h2 className="text-4xl font-display font-bold text-brand-alert">
                  {acknowledgementRate.overall?.totalEmployees - acknowledgementRate.overall?.acknowledgedCount}
                </h2>
                <p className="text-xs text-neutral-textMuted">
                  Employees remaining to sign
                </p>
              </div>
              <div className="p-3 bg-neutral-bg rounded-lg">
                <Users className="w-8 h-8 text-neutral-textMuted" />
              </div>
            </div>
          </div>

          {/* Department Breakdown Layout Grid */}
          <div>
            <h2 className="text-lg font-display font-semibold text-neutral-text mb-4">Department Sign-off Rates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {acknowledgementRate.departments?.map((dept) => (
                <div key={dept.departmentId} className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-semibold text-sm text-neutral-text">{dept.departmentName}</h3>
                      <span className="text-xs font-mono text-neutral-textMuted uppercase">{dept.departmentCode}</span>
                    </div>
                    <span className={`text-base font-bold font-display ${getPercentageColor(dept.percentage)}`}>
                      {dept.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-bg rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBg(dept.percentage)}`}
                      style={{ width: `${dept.percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-neutral-textMuted">
                    <span>Employees: {dept.totalEmployees}</span>
                    <span className="font-medium text-neutral-text">Signed: {dept.acknowledgedCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Sign-off Logs Table */}
          <div className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-border flex justify-between items-center bg-neutral-surface">
              <h2 className="text-base font-display font-semibold text-neutral-text">Detailed Signature Logs</h2>
              <span className="text-xs text-neutral-textMuted font-mono">
                Total Logs: {detailedLogs.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              {logsLoading ? (
                <div className="text-center py-12 text-neutral-textMuted">Loading signature logs...</div>
              ) : detailedLogs.length === 0 ? (
                <div className="text-center py-12 text-neutral-textMuted flex flex-col items-center justify-center gap-2">
                  <ClipboardList className="w-10 h-10 stroke-1" />
                  <p className="text-sm">No signature records found for this policy yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-bg border-b border-neutral-border text-neutral-textMuted font-semibold text-xs uppercase">
                      <th className="px-6 py-3">Employee Name</th>
                      <th className="px-6 py-3">Email Address</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Acknowledged Date</th>
                      <th className="px-6 py-3">Signature Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-border">
                    {detailedLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-neutral-bg/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-neutral-text">{log.user?.username || 'N/A'}</td>
                        <td className="px-6 py-4 text-neutral-textMuted">{log.user?.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                          {log.user?.department ? (
                            <span className="bg-neutral-bg px-2.5 py-0.5 rounded text-xs font-mono text-neutral-text">
                              {log.user.department.code || 'DEPT'}
                            </span>
                          ) : (
                            <span className="text-neutral-textMuted">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-neutral-textMuted">
                          {new Date(log.acknowledgedDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-green-700 font-medium font-mono text-xs italic bg-green-50 px-2.5 py-1 rounded border border-green-200">
                            <Check className="w-3.5 h-3.5" /> /s/ {log.signature}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card p-12 text-center text-neutral-textMuted flex flex-col items-center justify-center">
          <FileText className="w-16 h-16 mb-4 stroke-1" />
          <p className="text-sm">Select a mandatory policy above to view compliance track data.</p>
        </div>
      )}
    </div>
  );
}
