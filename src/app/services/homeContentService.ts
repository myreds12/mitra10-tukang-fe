import apiClient from './apiClient';

export interface HomeContentItem {
  id: number;
  section: 'HERO' | 'BENEFIT' | 'BANNER' | 'CATALOG';
  title: string | null;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  updated_by: number | null;
}

export const homeContentService = {
  // Public: any auth user
  getActive: async (): Promise<HomeContentItem[]> => {
    const response = await apiClient.get('/home-content');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Admin: all (active + inactive)
  getAll: async (): Promise<HomeContentItem[]> => {
    const response = await apiClient.get('/home-content/admin');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<HomeContentItem> => {
    const response = await apiClient.get(`/home-content/admin/${id}`);
    return response.data?.data ?? response.data;
  },

  create: async (payload: Partial<HomeContentItem>): Promise<HomeContentItem> => {
    const response = await apiClient.post('/home-content/admin', payload);
    return response.data?.data ?? response.data;
  },

  update: async (
    id: number,
    payload: Partial<HomeContentItem>,
  ): Promise<HomeContentItem> => {
    const response = await apiClient.put(`/home-content/admin/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/home-content/admin/${id}`);
  },

  // Upload image - returns { image_url, file_url, ... }
  // PENTING: jangan set Content-Type manual. Axios auto-generate dengan boundary
  // yang benar untuk FormData. Set manual tanpa boundary = multer BE gak bisa parse.
  uploadImage: async (file: File): Promise<{image_url: string; file_url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(
      '/home-content/admin/upload-image',
      formData,
    );
    return response.data?.data ?? response.data;
  },
};
