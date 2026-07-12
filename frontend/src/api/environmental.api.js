import axiosClient from './axiosClient';

export const environmentalApi = {
  getData: () => axiosClient.get(`/environmental`),
  getById: (id) => axiosClient.get(`/environmental/${id}`),
  create: (data) => axiosClient.post(`/environmental`, data),
  update: (id, data) => axiosClient.put(`/environmental/${id}`, data),
  delete: (id) => axiosClient.delete(`/environmental/${id}`),
};

export default environmentalApi;
