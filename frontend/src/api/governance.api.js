import axiosClient from './axiosClient';

export const governanceApi = {
  getData: () => axiosClient.get(`/governance`),
  getById: (id) => axiosClient.get(`/governance/${id}`),
  create: (data) => axiosClient.post(`/governance`, data),
  update: (id, data) => axiosClient.put(`/governance/${id}`, data),
  delete: (id) => axiosClient.delete(`/governance/${id}`),
};

export default governanceApi;
