import axiosClient from './axiosClient';

export const environmentalApi = {
  // Product ESG Profiles
  getProductProfiles: (search = '') => axiosClient.get(`/product-esg-profiles?search=${search}`),
  getProductProfileById: (id) => axiosClient.get(`/product-esg-profiles/${id}`),
  createProductProfile: (data) => axiosClient.post('/product-esg-profiles', data),
  updateProductProfile: (id, data) => axiosClient.put(`/product-esg-profiles/${id}`, data),
  deleteProductProfile: (id) => axiosClient.delete(`/product-esg-profiles/${id}`),

  // Carbon Transactions
  getCarbonTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return axiosClient.get(`/carbon-transactions?${query}`);
  },
  createCarbonTransaction: (data) => axiosClient.post('/carbon-transactions', data),
  updateCarbonTransaction: (id, data) => axiosClient.put(`/carbon-transactions/${id}`, data),
  deleteCarbonTransaction: (id) => axiosClient.delete(`/carbon-transactions/${id}`),

  // Environmental Goals
  getEnvironmentalGoals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return axiosClient.get(`/environmental-goals?${query}`);
  },
  createEnvironmentalGoal: (data) => axiosClient.post('/environmental-goals', data),
  updateEnvironmentalGoal: (id, data) => axiosClient.put(`/environmental-goals/${id}`, data),
  deleteEnvironmentalGoal: (id) => axiosClient.delete(`/environmental-goals/${id}`),
};

export default environmentalApi;
