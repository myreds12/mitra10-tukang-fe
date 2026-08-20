import apiClient from './apiClient';

// Helper: download blob PDF dengan filename dari response header.
// response Type dari axios untuk blob adalah Response (Blob), filename
// diambil dari header Content-Disposition kalau ada.
const downloadPdf = async (
  response: Response,
  fallbackFilename: string,
): Promise<void> => {
  const blob = await response.blob();
  // Parse filename dari Content-Disposition kalau ada
  const dispo = response.headers.get('Content-Disposition') ?? '';
  const match = /filename="?([^"]+)"?/i.exec(dispo);
  const filename = match?.[1] ?? fallbackFilename;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const vendorSpService = {
  getAll: (params: any) => apiClient.get('/vendor-sp', { params }),
  getById: (id: string | number) => apiClient.get(`/vendor-sp/${id}`),
  getByVendor: (vendorId: string | number) => apiClient.get(`/vendor-sp/vendor/${vendorId}`),
  checkStatus: (vendorId: string | number) => apiClient.get(`/vendor-sp/check/${vendorId}`),
  create: (data: any) => apiClient.post('/vendor-sp', data),
  complete: (id: string | number, data?: any) => apiClient.put(`/vendor-sp/complete/${id}`, data),
  extend: (id: string | number, data: any) => apiClient.put(`/vendor-sp/extend/${id}`, data),
  reactivate: (data: any) => apiClient.post('/vendor-sp/reactivate', data),
  // [POIN 5] Get reactivation logs dengan filter (search/status/date) + pagination
  getReactivationLogs: (params?: {
    page?: number;
    take?: number;
    search?: string;
    status?: 1 | 2 | 3;
    date_from?: string;
    date_to?: string;
    vendor_id?: number;
  }) => apiClient.get('/vendor-sp/reactivation', { params }),

  // [POIN 3] Generate PDF Bukti Surat Peringatan
  generatePenaltyReceipt: async (params: {
    vendor_id: number;
    quarter: number;
    year: number;
  }): Promise<void> => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/vendor-sp/penalty-receipt/export`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(params),
      },
    );
    if (!response.ok) {
      const text = await response.text();
      let msg = `HTTP ${response.status}`;
      try {
        const json = JSON.parse(text);
        msg = json.message ?? msg;
      } catch {
        // not JSON
      }
      throw new Error(msg);
    }
    await downloadPdf(response, `Bukti_SP_${params.vendor_id}.pdf`);
  },

  // [POIN 4] Generate PDF Surat Bebas Pelanggaran
  generateNoViolationCertificate: async (params: {
    vendor_id: number;
    quarter: number;
    year: number;
  }): Promise<void> => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/vendor-sp/no-violation-certificate/export`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(params),
      },
    );
    if (!response.ok) {
      const text = await response.text();
      let msg = `HTTP ${response.status}`;
      try {
        const json = JSON.parse(text);
        msg = json.message ?? msg;
      } catch {
        // not JSON
      }
      throw new Error(msg);
    }
    await downloadPdf(response, `Surat_Bebas_Pelanggaran_${params.vendor_id}.pdf`);
  },
};