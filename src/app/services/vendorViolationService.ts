import apiClient from './apiClient';

export const vendorViolationService = {
  // Violation Types
  getTypes: (params?: any) => apiClient.get('/vendor-violation/type', { params }),
  getTypeById: (id: string | number) => apiClient.get(`/vendor-violation/type/${id}`),
  createType: (data: any) => apiClient.post('/vendor-violation/type', data),
  updateType: (id: string | number, data: any) => apiClient.put(`/vendor-violation/type/${id}`, data),
  deleteType: (id: string | number) => apiClient.delete(`/vendor-violation/type/${id}`),

  // Violation Logs
  getLogs: (params?: any) => apiClient.get('/vendor-violation/log', { params }),
  getLogsByVendor: (vendorId: string | number, params?: any) =>
    apiClient.get('/vendor-violation/log', { params: { ...params, vendor_id: vendorId } }),
  createLog: (data: any) => apiClient.post('/vendor-violation/log', data),
  getVendorQuarterPoints: (vendorId: string | number, quarter?: number, year?: number) =>
    apiClient.get(`/vendor-violation/vendor/${vendorId}/points`, {
      params: { quarter, year },
    }),

  exportLogs: (filters: Record<string, unknown> = {}) => {
    const params: Record<string, unknown> = { format: 'excel' };
    for (const k of ['vendor_id', 'quarter', 'year', 'category', 'search', 'date_from', 'date_to']) {
      const v = filters[k];
      if (v !== undefined && v !== null && v !== '') params[k] = v;
    }
    return apiClient.get('/vendor-violation/log/export', {
      params,
      responseType: 'blob',
    });
  },

  // Violation Revision / Reset Requests
  getRevisionRequests: (params?: any) => apiClient.get('/vendor-violation/revision-request', { params }),
  getRevisionRequestById: (id: string | number) => apiClient.get(`/vendor-violation/revision-request/${id}`),
  createRevisionRequest: (data: any) => apiClient.post('/vendor-violation/revision-request', data),
  approveRevisionRequest: (id: string | number, data?: any) =>
    apiClient.put(`/vendor-violation/revision-request/${id}/approve`, data),
  rejectRevisionRequest: (id: string | number, data?: any) =>
    apiClient.put(`/vendor-violation/revision-request/${id}/reject`, data),
};
