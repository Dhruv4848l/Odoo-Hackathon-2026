import axiosClient from './axiosClient';

export const governanceApi = {
  // Policies Endpoints
  getPolicies: (category) => axiosClient.get(`/policies${category ? `?category=${category}` : ''}`),
  getPolicy: (id) => axiosClient.get(`/policies/${id}`),
  createPolicy: (data) => axiosClient.post('/policies', data),
  updatePolicy: (id, data) => axiosClient.put(`/policies/${id}`, data),
  deletePolicy: (id) => axiosClient.delete(`/policies/${id}`),

  // Policy Acknowledgement Endpoints
  acknowledgePolicy: (policyId, signature) => axiosClient.post('/acknowledgements', { policyId, signature }),
  getPolicyAcknowledgements: (policyId) => axiosClient.get(`/acknowledgements/policy/${policyId}`),
  getAcknowledgementRate: (policyId) => axiosClient.get(`/acknowledgements/rate/${policyId}`),

  // Audits Endpoints
  getAudits: (params) => axiosClient.get('/audits', { params }),
  getAudit: (id) => axiosClient.get(`/audits/${id}`),
  scheduleAudit: (data) => axiosClient.post('/audits', data),
  // updateAudit supports Multi-part Form Data for files
  updateAudit: (id, formData) => axiosClient.put(`/audits/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Compliance Issues Endpoints
  getComplianceIssues: (params) => axiosClient.get('/compliance-issues', { params }),
  getComplianceIssue: (id) => axiosClient.get(`/compliance-issues/${id}`),
  createComplianceIssue: (data) => axiosClient.post('/compliance-issues', data),
  updateComplianceIssue: (id, data) => axiosClient.put(`/compliance-issues/${id}`, data),
  // resolveComplianceIssue supports Multi-part Form Data for files
  resolveComplianceIssue: (id, formData) => axiosClient.put(`/compliance-issues/${id}/resolve`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Notifications Endpoints
  getNotifications: (unreadOnly) => axiosClient.get(`/notifications?unreadOnly=${unreadOnly || false}`),
  markNotificationRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => axiosClient.put('/notifications/read-all'),
};

export default governanceApi;
