import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAudits,
  scheduleAudit,
  updateAudit,
  fetchComplianceIssues,
  createComplianceIssue,
  updateComplianceIssue,
  resolveComplianceIssue
} from '../../store/governanceSlice';
import axiosClient from '../../api/axiosClient';
import { 
  ClipboardList, AlertTriangle, Plus, Calendar, User, FileCheck, CheckCircle2, 
  Clock, ShieldAlert, ArrowRight, X, FileUp, Info, AlertOctagon 
} from 'lucide-react';
import GovernanceHeader from './GovernanceHeader';

export default function ComplianceKanban() {
  const dispatch = useDispatch();

  // Redux Selectors
  const { audits, complianceIssues, loading } = useSelector((state) => state.governance);
  const { user } = useSelector((state) => state.auth);

  // View state: 'issues' or 'audits'
  const [kanbanView, setKanbanView] = useState('issues');

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]); // active managers/auditors

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null); // card details modal
  const [evidenceFile, setEvidenceFile] = useState(null);

  // Raise Issue Form State
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    departmentId: '',
    severity: 'Medium',
    ownerId: '',
    dueDate: '',
  });

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
        if (res.success) setDepartments(res.data);
      })
      .catch(() => {
        // Fallback mockup
        setDepartments([
          { _id: 'dept-01', name: 'Human Resources', code: 'HR' },
          { _id: 'dept-02', name: 'Information Technology', code: 'IT' },
          { _id: 'dept-03', name: 'Manufacturing & Operations', code: 'MFG' },
          { _id: 'dept-04', name: 'Finance & Expense Management', code: 'FIN' },
          { _id: 'dept-05', name: 'Logistics & Fleet', code: 'FLEET' }
        ]);
      });

    // Fetch user lists (managers / auditors)
    axiosClient.get('/departments') // placeholder
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

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newIssue.title || !newIssue.description || !newIssue.departmentId || !newIssue.ownerId || !newIssue.dueDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const action = await dispatch(createComplianceIssue(newIssue));
    if (createComplianceIssue.fulfilled.match(action)) {
      setShowIssueModal(false);
      setNewIssue({ title: '', description: '', departmentId: '', severity: 'Medium', ownerId: '', dueDate: '' });
      dispatch(fetchComplianceIssues());
    } else {
      setFormError(action.payload || 'Failed to raise compliance issue');
    }
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
    
    // Create multipart form data for uploading files
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
    }
  };

  const handleUpdateIssueStatus = async (id, status) => {
    const action = await dispatch(updateComplianceIssue({ id, data: { status } }));
    if (updateComplianceIssue.fulfilled.match(action)) {
      dispatch(fetchComplianceIssues());
    }
  };

  // Filter lists by column lanes
  const getIssueLanes = () => {
    return {
      Open: complianceIssues.filter(i => i.status === 'Open'),
      InProgress: complianceIssues.filter(i => i.status === 'InProgress'),
      Resolved: complianceIssues.filter(i => i.status === 'Resolved'),
      Overdue: complianceIssues.filter(i => i.status === 'Overdue'),
    };
  };

  const getAuditLanes = () => {
    return {
      Scheduled: audits.filter(a => a.status === 'Scheduled'),
      InProgress: audits.filter(a => a.status === 'InProgress'),
      Completed: audits.filter(a => a.status === 'Completed'),
    };
  };

  // Helpers and card components are defined at the bottom of the file

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <GovernanceHeader />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-primary">📋 Governance Kanban</h1>
          <p className="text-neutral-textMuted mt-1">Schedule environmental audits and trace compliance violations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle View */}
          <div className="bg-neutral-surface border border-neutral-border rounded-lg p-1 flex">
            <button
              onClick={() => setKanbanView('issues')}
              className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-md font-medium text-sm transition-colors ${
                kanbanView === 'issues' 
                  ? 'bg-brand-alert text-white shadow-sm' 
                  : 'text-neutral-textMuted hover:text-neutral-text'
              }`}
            >
              <AlertTriangle className="w-4.5 h-4.5" /> Issues
            </button>
            <button
              onClick={() => setKanbanView('audits')}
              className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-md font-medium text-sm transition-colors ${
                kanbanView === 'audits' 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'text-neutral-textMuted hover:text-neutral-text'
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5" /> Audits
            </button>
          </div>

          {/* Action buttons based on Role */}
          {user?.role !== 'Employee' && (
            kanbanView === 'issues' ? (
              <button
                onClick={() => setShowIssueModal(true)}
                className="flex items-center gap-1.5 bg-brand-alert text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4.5 h-4.5" /> Raise Issue
              </button>
            ) : (
              <button
                onClick={() => setShowAuditModal(true)}
                className="flex items-center gap-1.5 bg-brand-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4.5 h-4.5" /> Schedule Audit
              </button>
            )
          )}
        </div>
      </div>

      {/* --- KANBAN LANES: COMPLIANCE ISSUES --- */}
      {kanbanView === 'issues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[650px]">
          {/* Lane 1: Open */}
          <div className="bg-neutral-bg/40 rounded-lg p-3 flex flex-col h-full border border-neutral-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-neutral-text text-sm">Open Issues</span>
              <span className="bg-neutral-surface border border-neutral-border text-neutral-textMuted text-xs font-semibold px-2 py-0.5 rounded-full">
                {getIssueLanes().Open.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {getIssueLanes().Open.map(issue => (
                <ComplianceCard key={issue._id} issue={issue} onClick={() => setSelectedCard(issue)} />
              ))}
            </div>
          </div>

          {/* Lane 2: In Progress */}
          <div className="bg-neutral-bg/40 rounded-lg p-3 flex flex-col h-full border border-neutral-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-neutral-text text-sm">In Progress</span>
              <span className="bg-neutral-surface border border-neutral-border text-neutral-textMuted text-xs font-semibold px-2 py-0.5 rounded-full">
                {getIssueLanes().InProgress.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {getIssueLanes().InProgress.map(issue => (
                <ComplianceCard key={issue._id} issue={issue} onClick={() => setSelectedCard(issue)} />
              ))}
            </div>
          </div>

          {/* Lane 3: Resolved */}
          <div className="bg-neutral-bg/40 rounded-lg p-3 flex flex-col h-full border border-neutral-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-neutral-text text-sm">Resolved</span>
              <span className="bg-neutral-surface border border-neutral-border text-neutral-textMuted text-xs font-semibold px-2 py-0.5 rounded-full">
                {getIssueLanes().Resolved.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {getIssueLanes().Resolved.map(issue => (
                <ComplianceCard key={issue._id} issue={issue} onClick={() => setSelectedCard(issue)} />
              ))}
            </div>
          </div>

          {/* Lane 4: Overdue */}
          <div className="bg-red-50/20 rounded-lg p-3 flex flex-col h-full border border-red-100">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-brand-alert text-sm flex items-center gap-1">
                <AlertOctagon className="w-4.5 h-4.5" /> Overdue
              </span>
              <span className="bg-brand-alert text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {getIssueLanes().Overdue.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {getIssueLanes().Overdue.map(issue => (
                <ComplianceCard key={issue._id} issue={issue} onClick={() => setSelectedCard(issue)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- KANBAN LANES: AUDITS --- */}
      {kanbanView === 'audits' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
          {/* Lane 1: Scheduled */}
          <div className="bg-neutral-bg/40 rounded-lg p-4 flex flex-col h-full border border-neutral-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-neutral-text text-sm">Scheduled Audits</span>
              <span className="bg-neutral-surface border border-neutral-border text-neutral-textMuted text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {getAuditLanes().Scheduled.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {getAuditLanes().Scheduled.map(audit => (
                <AuditCard key={audit._id} audit={audit} onClick={() => setSelectedCard(audit)} />
              ))}
            </div>
          </div>

          {/* Lane 2: In Progress */}
          <div className="bg-neutral-bg/40 rounded-lg p-4 flex flex-col h-full border border-neutral-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-neutral-text text-sm">In Progress</span>
              <span className="bg-neutral-surface border border-neutral-border text-neutral-textMuted text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {getAuditLanes().InProgress.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {getAuditLanes().InProgress.map(audit => (
                <AuditCard key={audit._id} audit={audit} onClick={() => setSelectedCard(audit)} />
              ))}
            </div>
          </div>

          {/* Lane 3: Completed */}
          <div className="bg-neutral-bg/40 rounded-lg p-4 flex flex-col h-full border border-neutral-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-brand-primary text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4.5 h-4.5 text-brand-primary" /> Completed
              </span>
              <span className="bg-brand-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {getAuditLanes().Completed.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {getAuditLanes().Completed.map(audit => (
                <AuditCard key={audit._id} audit={audit} onClick={() => setSelectedCard(audit)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cards are rendered dynamically */}

      {/* --- MODAL DIALOGS --- */}

      {/* 1. Raise Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-neutral-surface rounded-lg max-w-xl w-full border border-neutral-border shadow-dropdown p-6">
            <h2 className="text-xl font-display font-semibold text-brand-alert mb-4">Raise Compliance Issue</h2>
            {formError && <p className="text-sm text-brand-alert font-medium bg-red-50 p-2.5 rounded-lg mb-4">{formError}</p>}

            <form onSubmit={handleCreateIssue} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-neutral-text mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Defective safety valve on assembly line"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-text mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the compliance or ESG policy violation..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Affected Department *</label>
                  <select
                    required
                    value={newIssue.departmentId}
                    onChange={(e) => setNewIssue({ ...newIssue, departmentId: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Issue Severity</label>
                  <select
                    value={newIssue.severity}
                    onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Assign Owner (Manager) *</label>
                  <select
                    required
                    value={newIssue.ownerId}
                    onChange={(e) => setNewIssue({ ...newIssue, ownerId: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                  >
                    <option value="">Select Owner</option>
                    {users.filter(u => u.role !== 'Auditor').map((u) => (
                      <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Resolution Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newIssue.dueDate}
                    onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-bg rounded-lg font-medium text-neutral-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-alert text-white font-medium rounded-lg hover:opacity-90"
                >
                  Raise Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Schedule Audit Modal */}
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

      {/* 3. Detailed Card Actions Modal (Acknowledge, Progress lane movements, file uploads) */}
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
                    <span className={`inline-block mt-1 font-semibold px-2 py-0.5 border rounded-full uppercase ${getSeverityBadge(selectedCard.severity)}`}>
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
                    
                    {/* Action buttons */}
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

                    {/* Resolve issue form */}
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
                    
                    {/* Action buttons */}
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

// --- HELPERS AND COMPONENT CARDS (MODULE LEVEL) ---

const getSeverityBorder = (sev) => {
  switch (sev) {
    case 'Critical': return 'border-l-red-600';
    case 'High': return 'border-l-orange-500';
    case 'Medium': return 'border-l-blue-400';
    default: return 'border-l-gray-300';
  }
};

const getSeverityBadge = (sev) => {
  switch (sev) {
    case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
    case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Medium': return 'bg-blue-50 text-blue-700 border-blue-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

function ComplianceCard({ issue, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-neutral-surface rounded-lg border-l-4 p-3.5 shadow-sm border border-neutral-border \${getSeverityBorder(issue.severity)} hover:shadow transition-shadow cursor-pointer space-y-2`}
    >
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-mono text-neutral-textMuted bg-neutral-bg px-2 py-0.5 rounded uppercase">
          {issue.department?.code || 'DEPT'}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full uppercase \${getSeverityBadge(issue.severity)}`}>
          {issue.severity}
        </span>
      </div>
      <h4 className="font-display font-medium text-neutral-text text-sm line-clamp-1">{issue.title}</h4>
      <div className="flex justify-between items-center text-xs text-neutral-textMuted pt-1.5">
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-neutral-textMuted" /> {issue.owner?.username || 'Owner'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-neutral-textMuted" /> {new Date(issue.dueDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function AuditCard({ audit, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-neutral-surface rounded-lg p-4 shadow-sm border border-neutral-border hover:shadow transition-all cursor-pointer space-y-3"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-display font-semibold text-neutral-text text-sm line-clamp-2">{audit.title}</h4>
        <span className="text-[10px] font-mono text-neutral-textMuted bg-neutral-bg px-2 py-0.5 rounded uppercase">
          {audit.department?.code || 'DEPT'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-textMuted pt-1 border-t border-neutral-border/50">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" /> 
          <span className="truncate">{audit.auditor?.username || 'Auditor'}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <Calendar className="w-3.5 h-3.5" /> 
          <span>{new Date(audit.auditDate).toLocaleDateString()}</span>
        </div>
      </div>

      {audit.status === 'Completed' && audit.score !== undefined && (
        <div className="flex justify-between items-center pt-1 text-xs">
          <span className="text-neutral-textMuted">Audit Score:</span>
          <span className="font-bold text-brand-primary">{audit.score} / 100</span>
        </div>
      )}
    </div>
  );
}
