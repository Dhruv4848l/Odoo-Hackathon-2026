import axiosClient from './axiosClient';

export const scoringApi = {
  getData: () => axiosClient.get(`/scoring`),
  getById: (id) => axiosClient.get(`/scoring/${id}`),
  create: (data) => axiosClient.post(`/scoring`, data),
  update: (id, data) => axiosClient.put(`/scoring/${id}`, data),
  delete: (id) => axiosClient.delete(`/scoring/${id}`),
};

export default scoringApi;
