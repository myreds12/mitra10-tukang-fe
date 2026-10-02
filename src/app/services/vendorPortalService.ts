import apiClient from './apiClient';

export interface VendorDocumentRegistration {
  id: number;
  company_name: string;
  address: string;
  phone_number: string;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  ktp_number: string | null;
  npwp_number: string | null;
  bank_id: number | null;
  ktp_photo: string | null;
  npwp_photo: string | null;
  compro_photo: string | null;
  siup_photo: string | null;
  vendor_photo: string | null;
  status: number;
  notes: string | null;
}

export interface VendorDocumentData {
  registration: VendorDocumentRegistration;
  profile_flags: {
    company_data: boolean;
    legal_docs: boolean;
    portfolio_photos: boolean;
    certification: boolean;
    bank_account: boolean;
  };
  profile_completion: number;
  profile_completed: number;
  profile_total: number;
  banks: Array<{
    id: number;
    bank_name: string;
    code?: string | null;
  }>;
}

export const vendorPortalService = {
  getMyDocuments: async (): Promise<VendorDocumentData> => {
    const res = await apiClient.get('/vendor-portal/me/documents');
    return res.data?.data ?? res.data;
  },

  updateMyDocuments: async (formData: FormData): Promise<any> => {
    const res = await apiClient.post('/vendor-portal/me/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data ?? res.data;
  },
};
