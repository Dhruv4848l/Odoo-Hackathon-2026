/**
 * Social & Gamification API Client (Dev B)
 * All calls use the shared axiosClient with JWT auth injection.
 */
import axiosClient from './axiosClient';

// ─── CSR Activities ───────────────────────────────────────────────────────────

export const getCSRActivities = (filters = {}) =>
  axiosClient.get('/csr-activities', { params: filters });

export const getCSRActivityById = (id) =>
  axiosClient.get(`/csr-activities/${id}`);

export const createCSRActivity = (data) =>
  axiosClient.post('/csr-activities', data);

export const updateCSRActivity = (id, data) =>
  axiosClient.put(`/csr-activities/${id}`, data);

export const deleteCSRActivity = (id) =>
  axiosClient.delete(`/csr-activities/${id}`);

// ─── CSR Participation ────────────────────────────────────────────────────────

export const signupForActivity = (activityId) =>
  axiosClient.post('/participation/signup', { activity_id: activityId });

export const submitActivityProof = (participationId, formData) =>
  axiosClient.post(`/participation/submit-proof/${participationId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const approveParticipation = (id, decision) =>
  axiosClient.post(`/participation/approve/${id}`, { decision });

export const getParticipations = (filters = {}) =>
  axiosClient.get('/participation', { params: filters });

// ─── Challenges ───────────────────────────────────────────────────────────────

export const getChallenges = (filters = {}) =>
  axiosClient.get('/challenges', { params: filters });

export const getChallengeById = (id) =>
  axiosClient.get(`/challenges/${id}`);

export const createChallenge = (data) =>
  axiosClient.post('/challenges', data);

export const updateChallenge = (id, data) =>
  axiosClient.put(`/challenges/${id}`, data);

export const changeChallengeStatus = (id, status) =>
  axiosClient.post(`/challenges/${id}/status`, { status });

export const joinChallenge = (id) =>
  axiosClient.post(`/challenges/${id}/join`);

export const submitChallengeProof = (id, formData) =>
  axiosClient.post(`/challenges/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const reviewChallenge = (id, employeeId, decision) =>
  axiosClient.post(`/challenges/${id}/review`, { employee_id: employeeId, decision });

// ─── Badges ───────────────────────────────────────────────────────────────────

export const getAllBadges = () =>
  axiosClient.get('/badges');

export const getMyBadges = () =>
  axiosClient.get('/badges/my-badges');

export const createBadge = (data) =>
  axiosClient.post('/badges', data);

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const getRewards = (params = {}) =>
  axiosClient.get('/rewards', { params });

export const createReward = (data) =>
  axiosClient.post('/rewards', data);

export const redeemReward = (rewardId) =>
  axiosClient.post(`/rewards/redeem/${rewardId}`);

export const getMyRedemptions = () =>
  axiosClient.get('/rewards/my-redemptions');

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const getLeaderboard = (type = 'org', deptId) => {
  if (type === 'department' && deptId) {
    return axiosClient.get(`/leaderboard/department/${deptId}`);
  }
  return axiosClient.get('/leaderboard');
};
