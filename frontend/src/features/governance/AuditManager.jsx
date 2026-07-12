import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAudits,
  scheduleAudit,
  updateAudit,
  fetchComplianceIssues,
  updateComplianceIssue,
  resolveComplianceIssue
} from '../../store/governanceSlice';
import axiosClient from '../../api/axiosClient';
import {
  ClipboardList, AlertTriangle, Plus, Calendar, User, FileCheck, CheckCircle2,
  Clock, ShieldAlert, ArrowRight, X, FileUp, Download, RefreshCw, BarChart2,
  AlertOctagon, Check, ChevronDown
} from 'lucide-react';
import GovernanceHeader from './GovernanceHeader';

export default function AuditManager() {
  const dispatch = useDispatch();

  // Redux Selectors
  const { audits, complianceIssues, loading } = useSelector((state) => state.governance);
  const { user } = useSelector((state) => state.auth);

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]); // managers/auditors

  // Modals state
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null); // card details modal
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Schedule Audit Form State
  const [newAudit, setNewAudit] = useState({
    title: '',
    auditorId: '',
    departmentId: '',
    auditDate: '',
  });

  // Action Form States
  const [findingsText, setFindingsText] = useState('');
  const [auditScore, setAuditScore] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchComplianceIssues());
    dispatch(fetchAudits());

    // Fetch departments list
    axiosClient.get('/departments')
      .then(res => {
        const list = res.success && res.data ? res.data : (Array.isArray(res) ? res : []);
        setDepartments(list);
      })
      .catch(() => {
        setDepartments([
          { _id: 'dept-01', name: 'Human Resources', code: 'HR' },
          { _id: 'dept-02', name: 'Information Technology', code: 'IT' },
          { _id: 'dept-03', name: 'Manufacturing & Operations', code: 'MFG' },
          { _id: 'dept-04', name: 'Finance & Expense Management', code: 'FIN' },
          { _id: 'dept-05', name: 'Logistics & Fleet', code: 'FLEET' }
        ]);
      });

    // Fetch user lists (managers / auditors)
    axiosClient.get('/departments') // placeholder to make sure APIs work
      .then(() => {
        setUsers([
          { _id: 'user-manager-01', username: 'Vinayak Manager', role: 'Manager' },
          { _id: 'user-auditor-01', username: 'Sarah Auditor', role: 'Auditor' },
          { _id: 'user-admin-01', username: 'Admin User', role: 'Admin' }
        ]);
      }).catch(() => {
        setUsers([
          { _id: 'user-manager-01', username: 'Vinayak Manager', role: 'Manager' },
          { _id: 'user-auditor-01', username: 'Sarah Auditor', role: 'Auditor' },
          { _id: 'user-admin-01', username: 'Admin User', role: 'Admin' }
        ]);
      });
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchComplianceIssues());
    dispatch(fetchAudits());
  };

  const handleScheduleAudit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newAudit.title || !newAudit.auditorId || !newAudit.departmentId || !newAudit.auditDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const action = await dispatch(scheduleAudit(newAudit));
    if (scheduleAudit.fulfilled.match(action)) {
      setShowAuditModal(false);
      setNewAudit({ title: '', auditorId: '', departmentId: '', auditDate: '' });
      dispatch(fetchAudits());
    } else {
      setFormError(action.payload || 'Failed to schedule audit');
    }
  };

  // Resolve compliance issue
  const handleResolveIssue = async (e) => {
    e.preventDefault();
    setFormError('');

    const formData = new FormData();
    if (evidenceFile) {
      formData.append('evidence', evidenceFile);
    }

    const action = await dispatch(resolveComplianceIssue({ id: selectedCard._id, formData }));
    if (resolveComplianceIssue.fulfilled.match(action)) {
      setSelectedCard(null);
      setEvidenceFile(null);
      dispatch(fetchComplianceIssues());
    } else {
      setFormError(action.payload || 'Failed to resolve compliance issue');
    }
  };

  // Complete Audit logging findings and score
  const handleCompleteAudit = async (e) => {
    e.preventDefault();
    setFormError('');

    const scoreVal = parseInt(auditScore);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      setFormError('Audit score must be a number between 0 and 100.');
      return;
    }

    const formData = new FormData();
    formData.append('findings', findingsText);
    formData.append('score', scoreVal);
    formData.append('status', 'Completed');
    if (evidenceFile) {
      formData.append('evidence', evidenceFile);
    }

    const action = await dispatch(updateAudit({ id: selectedCard._id, formData }));
    if (updateAudit.fulfilled.match(action)) {
      setSelectedCard(null);
      setFindingsText('');
      setAuditScore('');
      setEvidenceFile(null);
      dispatch(fetchAudits());
    } else {
      setFormError(action.payload || 'Failed to submit audit report');
    }
  };

  const handleUpdateAuditStatus = async (id, status) => {
    const formData = new FormData();
    formData.append('status', status);
    const action = await dispatch(updateAudit({ id, formData }));
    if (updateAudit.fulfilled.match(action)) {
      dispatch(fetchAudits());
      setSelectedCard(action.payload.data || null);
    }
  };

  const handleUpdateIssueStatus = async (id, status) => {
    const action = await dispatch(updateComplianceIssue({ id, data: { status } }));
    if (updateComplianceIssue.fulfilled.match(action)) {
      dispatch(fetchComplianceIssues());
      setSelectedCard(action.payload.data || null);
    }
  };

  const handleExportAudits = () => {
    const headers = ['Title', 'Department', 'Auditor', 'Date', 'Findings', 'Score', 'Status'];
    const rows = audits.map(a => [
      a.title,
      a.department?.name || 'Unknown',
      a.auditor?.username || 'Unknown',
      new Date(a.auditDate).toLocaleDateString(),
      a.findings || '—',
      a.score !== undefined ? a.score : '—',
      a.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += [headers.join(','), ...rows.map(r => r.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ESG_Audits_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportIssues = () => {
    const headers = ['Issue', 'Severity', 'Department', 'Owner', 'Due Date', 'Status'];
    const rows = complianceIssues.map(i => [
      i.title,
      i.severity,
      i.department?.name || 'Unknown',
      i.owner?.username || 'Unknown',
      new Date(i.dueDate).toLocaleDateString(),
      i.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += [headers.join(','), ...rows.map(r => r.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Compliance_Issues_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Helper status badge styles
  const getAuditStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'InProgress': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Scheduled': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getIssueStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'InProgress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200 font-bold';
      default: return 'bg-red-50 text-red-700 border-red-200'; // Open
    }
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <GovernanceHeader />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-primary">🔍 Environmental Audits</h1>
          <p className="text-neutral-textMuted mt-1">Conduct internal ESG department reviews and track corrective compliance issues.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 border border-neutral-border rounded-lg bg-neutral-surface hover:bg-neutral-bg text-neutral-textMuted hover:text-neutral-text transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-4 py-2 border border-neutral-border rounded-lg bg-neutral-surface hover:bg-neutral-bg font-medium text-sm text-neutral-text transition-colors"
            >
              <Download className="w-4 h-4" /> Export <ChevronDown className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-border rounded-lg shadow-dropdown z-10 py-1">
                <button
                  onClick={handleExportAudits}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors"
                >
                  Export Audits to CSV
                </button>
                <button
                  onClick={handleExportIssues}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors"
                >
                  Export Issues to CSV
                </button>
              </div>
            )}
          </div>

          {user?.role !== 'Employee' && (
            <button
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-1.5 bg-brand-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4.5 h-4.5" /> New Audit
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Audits Table */}
        <div className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-border bg-neutral-surface">
            <h2 className="text-base font-display font-semibold text-neutral-text">Scheduled & Completed Audits</h2>
          </div>

          <div className="overflow-x-auto">
            {loading && audits.length === 0 ? (
              <div className="text-center py-12 text-neutral-textMuted">Loading audit logs...</div>
            ) : audits.length === 0 ? (
              <div className="text-center py-12 text-neutral-textMuted flex flex-col items-center justify-center gap-2">
                <ClipboardList className="w-10 h-10 stroke-1" />
                <p className="text-sm">No environmental audits scheduled yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-bg border-b border-neutral-border text-neutral-textMuted font-semibold text-xs uppercase">
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Auditor</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Findings</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {audits.map((audit) => (
                    <tr
                      key={audit._id}
                      onClick={() => setSelectedCard(audit)}
                      className="hover:bg-neutral-bg/20 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-neutral-text">{audit.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-neutral-bg px-2.5 py-0.5 rounded text-xs font-mono text-neutral-text">
                          {audit.department?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-textMuted">{audit.auditor?.username || 'N/A'}</td>
                      <td className="px-6 py-4 text-neutral-textMuted">
                        {new Date(audit.auditDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-neutral-textMuted truncate max-w-[200px]">
                        {audit.findings || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 border rounded-full text-xs font-semibold uppercase ${getAuditStatusStyle(audit.status)}`}>
                          {audit.status === 'InProgress' ? 'Under Review' : audit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Compliance Issues Raised From Audits */}
        <div className="bg-neutral-surface border border-neutral-border rounded-lg shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-border bg-neutral-surface">
            <h2 className="text-base font-display font-semibold text-neutral-text">
              Compliance Issues raised from Audits — severity-tagged, resolution tracked
            </h2>
          </div>

          <div className="overflow-x-auto">
            {complianceIssues.length === 0 ? (
              <div className="text-center py-12 text-neutral-textMuted flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-10 h-10 stroke-1" />
                <p className="text-sm">No compliance issues raised yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-bg border-b border-neutral-border text-neutral-textMuted font-semibold text-xs uppercase">
                    <th className="px-6 py-3">Issue</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {complianceIssues.map((issue) => (
                    <tr
                      key={issue._id}
                      onClick={() => setSelectedCard(issue)}
                      className="hover:bg-neutral-bg/20 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-neutral-text">
                        <div>
                          <p>{issue.title}</p>
                          <p className="text-xs text-neutral-textMuted mt-0.5 font-normal line-clamp-1">{issue.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 border rounded-full text-xs font-semibold uppercase ${getSeverityStyle(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-neutral-bg px-2.5 py-0.5 rounded text-xs font-mono text-neutral-text">
                          {issue.department?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 border rounded-full text-xs font-semibold uppercase ${getIssueStatusStyle(issue.status)}`}>
                          {issue.status}
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

      {/* Schedule Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-neutral-surface rounded-lg max-w-xl w-full border border-neutral-border shadow-dropdown p-6">
            <h2 className="text-xl font-display font-semibold text-brand-primary mb-4">Schedule Department Audit</h2>
            {formError && <p className="text-sm text-brand-alert font-medium bg-red-50 p-2.5 rounded-lg mb-4">{formError}</p>}

            <form onSubmit={handleScheduleAudit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-neutral-text mb-1">Audit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scope 2 Carbon Audit - Manufacturing line"
                  value={newAudit.title}
                  onChange={(e) => setNewAudit({ ...newAudit, title: e.target.value })}
                  className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Audit Department *</label>
                  <select
                    required
                    value={newAudit.departmentId}
                    onChange={(e) => setNewAudit({ ...newAudit, departmentId: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Assign Auditor *</label>
                  <select
                    required
                    value={newAudit.auditorId}
                    onChange={(e) => setNewAudit({ ...newAudit, auditorId: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                  >
                    <option value="">Select Auditor</option>
                    {users.filter(u => u.role === 'Auditor' || u.role === 'Admin').map((u) => (
                      <option key={u._id} value={u._id}>{u.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-text mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  required
                  value={newAudit.auditDate}
                  onChange={(e) => setNewAudit({ ...newAudit, auditDate: e.target.value })}
                  className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-bg rounded-lg font-medium text-neutral-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-white font-medium rounded-lg hover:opacity-90"
                >
                  Schedule Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Card Actions Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-neutral-surface rounded-lg max-w-xl w-full border border-neutral-border shadow-dropdown p-6">
            <div className="flex justify-between items-start border-b border-neutral-border pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono bg-neutral-bg px-2 py-0.5 rounded text-neutral-textMuted uppercase">
                  {selectedCard.department?.name || 'DEPT'}
                </span>
                <h2 className="text-lg font-display font-semibold text-neutral-text mt-1">{selectedCard.title}</h2>
              </div>
              <button onClick={() => setSelectedCard(null)} className="p-1 text-neutral-textMuted hover:text-neutral-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <p className="text-xs text-brand-alert font-medium bg-red-50 p-2.5 rounded-lg mb-4">{formError}</p>}

            {/* IF COMPLIANCE ISSUE CARD SELECTED */}
            {selectedCard.severity !== undefined ? (
              <div className="space-y-4 text-sm text-neutral-text leading-relaxed">
                <div>
                  <h4 className="font-semibold text-xs text-neutral-textMuted uppercase mb-1">Description</h4>
                  <p className="bg-neutral-bg p-3 rounded-lg">{selectedCard.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-textMuted block uppercase font-bold text-[10px]">Severity</span>
                    <span className={`inline-block mt-1 font-semibold px-2 py-0.5 border rounded-full uppercase ${getSeverityStyle(selectedCard.severity)}`}>
                      {selectedCard.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-textMuted block uppercase font-bold text-[10px]">Due Date</span>
                    <span className="inline-block mt-1 font-medium">{new Date(selectedCard.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {selectedCard.status !== 'Resolved' ? (
                  <div className="border-t border-neutral-border pt-4">
                    <h4 className="font-semibold text-sm mb-2 text-brand-primary">Update Status & Resolution</h4>

                    <div className="flex gap-2.5 mb-4">
                      {selectedCard.status === 'Open' && (
                        <button
                          onClick={() => handleUpdateIssueStatus(selectedCard._id, 'InProgress')}
                          className="flex items-center gap-1.5 bg-neutral-bg text-neutral-text border border-neutral-border px-3 py-1.5 rounded-lg text-xs hover:bg-neutral-border/20 transition-colors"
                        >
                          Move to In-Progress <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleResolveIssue} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1.5">
                          Upload Evidence of Resolution (Image/PDF)
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-border hover:border-brand-primary rounded-lg cursor-pointer bg-neutral-bg hover:bg-neutral-bg/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-3 pb-4">
                              <FileUp className="w-8 h-8 text-neutral-textMuted mb-1" />
                              <p className="text-xs text-neutral-textMuted">
                                {evidenceFile ? `Selected: ${evidenceFile.name}` : 'Click to select image or PDF (Max 5MB)'}
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => setEvidenceFile(e.target.files[0])}
                              accept=".pdf,.png,.jpg,.jpeg"
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-primary text-white font-medium py-2 rounded-lg text-sm hover:opacity-90"
                      >
                        Submit Resolution
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 space-y-1.5">
                    <p className="font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4.5 h-4.5 text-green-600" /> Resolved on {new Date(selectedCard.resolvedDate).toLocaleDateString()}
                    </p>
                    {selectedCard.evidenceUrl && (
                      <p className="text-xs">
                        Evidence file:{' '}
                        <a
                          href={`http://localhost:5000${selectedCard.evidenceUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline hover:text-green-950"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* IF AUDIT CARD SELECTED */
              <div className="space-y-4 text-sm text-neutral-text leading-relaxed">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-textMuted block uppercase font-bold text-[10px]">Auditor</span>
                    <span className="inline-block mt-1 font-semibold">{selectedCard.auditor?.username || 'Auditor'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-textMuted block uppercase font-bold text-[10px]">Scheduled Date</span>
                    <span className="inline-block mt-1 font-medium">{new Date(selectedCard.auditDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {selectedCard.status !== 'Completed' ? (
                  <div className="border-t border-neutral-border pt-4 space-y-4">
                    <h4 className="font-semibold text-sm text-brand-primary">Audit Findings Report</h4>

                    <div className="flex gap-2.5">
                      {selectedCard.status === 'Scheduled' && (
                        <button
                          onClick={() => handleUpdateAuditStatus(selectedCard._id, 'InProgress')}
                          className="flex items-center gap-1.5 bg-neutral-bg text-neutral-text border border-neutral-border px-3.5 py-1.5 rounded-lg text-xs hover:bg-neutral-border/20 transition-colors"
                        >
                          Mark as In-Progress <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {selectedCard.status === 'InProgress' && (
                      <form onSubmit={handleCompleteAudit} className="space-y-4">
                        <div>
                          <label className="block font-medium mb-1">Audit Score (0-100) *</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 85"
                            value={auditScore}
                            onChange={(e) => setAuditScore(e.target.value)}
                            className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1">Audit Findings & Notes *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Describe your audit evaluations, notes, and remarks..."
                            value={findingsText}
                            onChange={(e) => setFindingsText(e.target.value)}
                            className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-textMuted uppercase mb-1.5">
                            Upload Audit Evidence Document (Image/PDF)
                          </label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-border hover:border-brand-primary rounded-lg cursor-pointer bg-neutral-bg hover:bg-neutral-bg/50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                <FileUp className="w-8 h-8 text-neutral-textMuted mb-1" />
                                <p className="text-xs text-neutral-textMuted">
                                  {evidenceFile ? `Selected: ${evidenceFile.name}` : 'Click to select file (Max 5MB)'}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => setEvidenceFile(e.target.files[0])}
                                accept=".pdf,.png,.jpg,.jpeg"
                              />
                            </label>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-brand-primary text-white font-medium py-2 rounded-lg text-sm hover:opacity-90"
                        >
                          Complete Audit & Save Report
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-neutral-border pt-4 space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 space-y-1.5">
                      <p className="font-semibold text-sm">Audit Completed successfully</p>
                      <p className="text-xs">
                        Audit score: <strong>{selectedCard.score} / 100</strong>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-neutral-textMuted uppercase mb-1">Findings Notes</h4>
                      <p className="bg-neutral-bg p-3 rounded-lg text-sm">{selectedCard.findings}</p>
                    </div>

                    {selectedCard.evidenceUrl && (
                      <div className="bg-neutral-bg p-3 rounded-lg text-xs flex justify-between items-center">
                        <span className="text-neutral-textMuted">Audit Evidence Documentation:</span>
                        <a
                          href={`http://localhost:5000${selectedCard.evidenceUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-primary hover:underline"
                        >
                          Download File
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
