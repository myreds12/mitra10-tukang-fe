import axios from 'axios';
import apiClient from './apiClient';

export const vendorRegistrationService = {
  getAll: (params: any) => apiClient.get('/vendor-registration', { params }),
  getById: (id: string | number) => apiClient.get(`/vendor-registration/${id}`),
  getHistory: (id: string | number) => apiClient.get(`/vendor-registration/${id}/history`),
  getStats: () => apiClient.get('/vendor-registration/stats'),
  approve: (id: string | number, data?: any) => apiClient.put(`/vendor-registration/${id}/approve`, data),
  startPitching: (id: string | number, data?: any) => apiClient.put(`/vendor-registration/${id}/start-pitching`, data),
  finalApprove: (id: string | number, data?: any) => apiClient.put(`/vendor-registration/${id}/final-approve`, data),
  reject: (id: string | number, data: any) => apiClient.put(`/vendor-registration/${id}/reject`, data),
  resendEmail: (id: string | number) => apiClient.post(`/vendor-registration/${id}/resend-email`),
  getEmailStatus: (id: string | number) => apiClient.get(`/vendor-registration/${id}/email-status`),
};

// Public endpoints (no auth)
export const publicVendorService = {
  register: (data: any) => axios.post(`${process.env.REACT_APP_API_URL}/vendor-registration/register`, data),
  validateToken: (token: string) => axios.get(`${process.env.REACT_APP_API_URL}/vendor-registration/validate-token`, { params: { token } }),
  createUser: (data: any) => axios.post(`${process.env.REACT_APP_API_URL}/vendor-registration/create-user`, data),
};
