import axiosClient from './axiosClient';

export const getScores = () => axiosClient.get('/scores');
export const recalculateScore = (data) => axiosClient.post('/scores/recalculate', data);

export const getSettings = () => axiosClient.get('/settings');
export const updateSettings = (data) => axiosClient.put('/settings', data);

export const exportReport = (data) =>
  axiosClient.post('/reports/export', data, {
    responseType: 'blob', // needed for file downloads
  });

