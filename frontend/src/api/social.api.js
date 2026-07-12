import axiosClient from './axiosClient';

export const socialApi = {
  getData: () => axiosClient.get(`/social`),
  getById: (id) => axiosClient.get(`/social/${id}`),
  create: (data) => axiosClient.post(`/social`, data),
  update: (id, data) => axiosClient.put(`/social/${id}`, data),
  delete: (id) => axiosClient.delete(`/social/${id}`),
};

export default socialApi;
