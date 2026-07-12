import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPolicies, createPolicy, acknowledgePolicy } from '../../store/governanceSlice';
import axiosClient from '../../api/axiosClient';
import { Search, CheckCircle, AlertCircle, Plus, FileText, Lock, Check } from 'lucide-react';
import GovernanceHeader from './GovernanceHeader';

export default function PolicyList() {
  const dispatch = useDispatch();
  
  // Selectors
  const { policies, loading, error } = useSelector((state) => state.governance);
  const { user } = useSelector((state) => state.auth);
  
  // State
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [myAcknowledgements, setMyAcknowledgements] = useState([]);

  // Form State (New Policy)
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    content: '',
    category: '',
    version: '1.0',
    mandatory: true
  });

  const [formError, setFormError] = useState('');
  const [ackError, setAckError] = useState('');

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchPolicies());
    
    // Fetch categories for policy creation
    axiosClient.get('/departments') // just dummy request to make sure APIs work
      .catch(err => console.log(err));
      
    // Fetch real governance categories from backend
    axiosClient.get('/categories')
      .then((res) => {
        // Handle standard envelope { success: true, data: [...] } or direct array
        const list = res.success && res.data ? res.data : (Array.isArray(res) ? res : []);
        const govCats = list.filter(cat => cat.type === 'Governance');
        if (govCats.length > 0) {
          setCategories(govCats);
        } else {
          setCategories([
            { _id: '660a95fa9b1d8f8d689b25aa', name: 'Policy Agreement', type: 'Governance' },
            { _id: '660a95fa9b1d8f8d689b25bb', name: 'Audit & Review', type: 'Governance' }
          ]);
        }
      }).catch(() => {
        setCategories([
          { _id: '660a95fa9b1d8f8d689b25aa', name: 'Policy Agreement', type: 'Governance' },
          { _id: '660a95fa9b1d8f8d689b25bb', name: 'Audit & Review', type: 'Governance' }
        ]);
      });

    // Fetch user's acknowledgements
    if (user) {
      axiosClient.get('/acknowledgements/my-acknowledgements')
        .then((res) => {
          if (res.success) {
            setMyAcknowledgements(res.data.map(ack => ack.policy));
          }
        })
        .catch(() => {
          setMyAcknowledgements([]);
        });
    }
  }, [dispatch, user]);

  // Select first policy by default once loaded
  useEffect(() => {
    if (policies.length > 0 && !selectedPolicy) {
      setSelectedPolicy(policies[0]);
    }
  }, [policies, selectedPolicy]);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newPolicy.title || !newPolicy.content || !newPolicy.category) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const action = await dispatch(createPolicy(newPolicy));
    if (createPolicy.fulfilled.match(action)) {
      setShowPublishModal(false);
      setNewPolicy({ title: '', content: '', category: '', version: '1.0', mandatory: true });
      dispatch(fetchPolicies()); // reload policy list
    } else {
      setFormError(action.payload || 'Failed to create policy');
    }
  };

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    setAckError('');
    if (!signatureName) {
      setAckError('Signature is required.');
      return;
    }
    if (signatureName.toLowerCase() !== user?.username.toLowerCase()) {
      setAckError(`Signature must exactly match your username: "${user?.username}"`);
      return;
    }

    const action = await dispatch(acknowledgePolicy({
      policyId: selectedPolicy._id,
      signature: signatureName
    }));

    if (acknowledgePolicy.fulfilled.match(action)) {
      setSignatureName('');
      // Add to acknowledged list
      setMyAcknowledgements([...myAcknowledgements, selectedPolicy._id]);
      
      // Update selected policy display state
      setSelectedPolicy({ ...selectedPolicy });
    } else {
      setAckError(action.payload || 'Failed to acknowledge policy');
    }
  };

  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSigned = (policyId) => myAcknowledgements.includes(policyId);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <GovernanceHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-primary">📜 ESG Compliance Policies</h1>
          <p className="text-neutral-textMuted mt-1">Review corporate sustainability guidelines and submit mandatory sign-offs.</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-medium shadow hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" /> Publish Policy
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Policy Search & List */}
        <div className="bg-neutral-surface rounded-lg shadow-card border border-neutral-border p-4 flex flex-col h-[650px]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-neutral-textMuted w-5 h-5" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-bg pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading && policies.length === 0 ? (
              <div className="text-center py-8 text-neutral-textMuted">Loading policies...</div>
            ) : filteredPolicies.length === 0 ? (
              <div className="text-center py-8 text-neutral-textMuted">No policies found.</div>
            ) : (
              filteredPolicies.map((policy) => {
                const signed = isSigned(policy._id);
                return (
                  <div
                    key={policy._id}
                    onClick={() => setSelectedPolicy(policy)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPolicy?._id === policy._id
                        ? 'border-brand-primary bg-neutral-bg/50 shadow-sm'
                        : 'border-neutral-border hover:border-neutral-textMuted'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display font-medium text-neutral-text text-sm line-clamp-1">{policy.title}</h3>
                      <span className="text-xs font-mono bg-neutral-bg px-1.5 py-0.5 rounded text-neutral-textMuted">
                        v{policy.version}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-neutral-textMuted">
                        {policy.category?.name || 'Policy Agreement'}
                      </span>
                      {policy.mandatory ? (
                        signed ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-brand-alert font-medium bg-red-50 px-2 py-0.5 rounded animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> Required
                          </span>
                        )
                      ) : (
                        <span className="text-neutral-textMuted bg-neutral-bg px-2 py-0.5 rounded">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Policy Detail Panel */}
        <div className="lg:col-span-2 bg-neutral-surface rounded-lg shadow-card border border-neutral-border p-6 flex flex-col h-[650px]">
          {selectedPolicy ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b border-neutral-border pb-4 mb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-display font-semibold text-neutral-text">{selectedPolicy.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      <span className="text-neutral-textMuted bg-neutral-bg px-2 py-1 rounded">
                        Version: <strong>{selectedPolicy.version}</strong>
                      </span>
                      <span className="text-neutral-textMuted bg-neutral-bg px-2 py-1 rounded">
                        Published: {new Date(selectedPolicy.publishedDate || selectedPolicy.createdAt).toLocaleDateString()}
                      </span>
                      {selectedPolicy.mandatory && (
                        <span className="text-brand-alert bg-red-50 px-2 py-1 rounded font-medium">
                          Mandatory Compliance Document
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto pr-2 text-neutral-text leading-relaxed whitespace-pre-line border-b border-neutral-border pb-4 mb-4 font-sans text-sm">
                {selectedPolicy.content}
              </div>

              {/* Signature / Acknowledgement Footer */}
              {selectedPolicy.mandatory ? (
                isSigned(selectedPolicy._id) ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-800 text-sm">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold">Acknowledgement Recorded</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        You signed off on this compliance policy. Thank you for keeping EcoSphere compliant!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-150 rounded-lg p-5">
                    <div className="flex gap-2.5 items-start mb-3 text-brand-alert">
                      <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm">Mandatory Policy Acknowledgment</h4>
                        <p className="text-xs text-neutral-textMuted mt-0.5">
                          EcoSphere requires all active employees to sign off on this guideline.
                        </p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleAcknowledge} className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={`Type username: "${user?.username}" to confirm sign-off`}
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          className="w-full bg-white px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-brand-primary"
                        />
                        {ackError && <p className="text-xs text-brand-alert mt-1.5 font-medium">{ackError}</p>}
                      </div>
                      <button
                        type="submit"
                        className="bg-brand-primary text-white font-medium px-5 py-2 rounded-lg text-sm hover:opacity-95 transition-opacity"
                      >
                        Acknowledge & Sign
                      </button>
                    </form>
                  </div>
                )
              ) : (
                <div className="bg-neutral-bg rounded-lg p-4 text-center text-xs text-neutral-textMuted">
                  This document is for reading purposes and does not require an active signature sign-off.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-textMuted">
              <FileText className="w-16 h-16 mb-4 stroke-1" />
              <p className="text-sm">Select a policy from the list to review its details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-neutral-surface rounded-lg max-w-2xl w-full border border-neutral-border shadow-dropdown p-6">
            <h2 className="text-xl font-display font-semibold text-brand-primary mb-4">Publish New ESG Policy</h2>
            {formError && <p className="text-sm text-brand-alert font-medium bg-red-50 p-2.5 rounded-lg mb-4">{formError}</p>}

            <form onSubmit={handleCreatePolicy} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-neutral-text mb-1">Policy Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code of Conduct on Waste Reductions"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                  className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Governance Category *</label>
                  <select
                    required
                    value={newPolicy.category}
                    onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-text mb-1">Version String</label>
                  <input
                    type="text"
                    value={newPolicy.version}
                    onChange={(e) => setNewPolicy({ ...newPolicy, version: e.target.value })}
                    className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-text mb-1">Policy Markdown/Content *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write the policy documentation body..."
                  value={newPolicy.content}
                  onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                  className="w-full bg-neutral-bg p-2.5 border border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={newPolicy.mandatory}
                  onChange={(e) => setNewPolicy({ ...newPolicy, mandatory: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-primary accent-brand-primary"
                />
                <label htmlFor="mandatory" className="font-medium text-neutral-text select-none cursor-pointer">
                  Require active employee signature (Mandatory Document)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-bg rounded-lg font-medium text-neutral-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-white font-medium rounded-lg hover:opacity-90"
                >
                  Publish Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
