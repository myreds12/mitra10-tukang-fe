import apiClient from './apiClient';

export type BenefitAccentColor = 'brand-blue' | 'brand-red' | 'brand-yellow';
export type CatalogButtonStyle = 'primary' | 'secondary';

export interface HeroPayload {
  headline_main: string;
  headline_highlight: string;
  description: string;
  illustration_image?: string | null;
}

export interface BenefitPayload {
  icon: string; // Karakter emoji, e.g. 📦 💰 🧾 🛡️ ⭐ 🎓
  title: string;
  description: string;
  accent_color: BenefitAccentColor;
}

export interface CatalogPayload {
  name: string;
  image?: string | null;
  icon_fallback?: string | null;
  badge_text?: string | null;
  link_url: string;
  button_label?: string;
  button_style?: CatalogButtonStyle;
}

export interface SupportPayload {
  support_label: string; // e.g. "Hubungi Tim Support"
  support_email: string; // e.g. "vendor-support@mitra10.com"
  support_phone: string; // e.g. "+6281234567890" (WhatsApp)
  support_hours?: string; // e.g. "Senin - Jumat, 08:00 - 17:00 WIB"
  support_note?: string;
}

export interface UnifiedHomePayload {
  hero: HeroPayload;
  benefits: BenefitPayload[];
  catalogs: CatalogPayload[];
  support: SupportPayload;
}

export interface HomeContentItem {
  id: number;
  section: 'UNIFIED_HOME' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'SUPPORT' | string;
  section_type: 'UNIFIED_HOME' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'SUPPORT';
  payload: UnifiedHomePayload | HeroPayload | BenefitPayload | CatalogPayload | SupportPayload | any;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  order_index: number;
  is_active: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string | null;
  updated_by: number | null;
}

export interface SyncIssue {
  id: number;
  section_type: string;
  title: string;
  issue_type: 'data' | 'asset' | 'render';
  severity: 'error' | 'warning';
  message: string;
}

export interface SyncVerificationResult {
  timestamp: string;
  status: 'ok' | 'warning' | 'error';
  total_active: number;
  issues_count: number;
  section_counts: {
    hero: number;
    benefit: number;
    catalog: number;
  };
  vendor_render_parity: {
    db_active_count: number;
    vendor_render_count: number;
    is_synced: boolean;
    diff: number;
  };
  issues: SyncIssue[];
}

export const homeContentService = {
  // Public: any auth user (active items only - decomposed for vendor views)
  getActive: async (): Promise<HomeContentItem[]> => {
    const response = await apiClient.get('/home-content');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Admin: all (active + inactive packages)
  getAll: async (): Promise<HomeContentItem[]> => {
    const response = await apiClient.get('/home-content/admin');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<HomeContentItem> => {
    const response = await apiClient.get(`/home-content/admin/${id}`);
    return response.data?.data ?? response.data;
  },

  // Admin: get active unified package directly
  getActiveUnified: async (): Promise<HomeContentItem | null> => {
    const response = await apiClient.get('/home-content/admin/active-unified');
    return response.data?.data ?? response.data;
  },

  create: async (payload: {
    section_type: 'UNIFIED_HOME' | 'HERO' | 'BENEFIT' | 'CATALOG';
    title?: string;
    payload: any;
    order_index?: number;
    is_active?: boolean;
    status?: 'active' | 'inactive';
  }): Promise<HomeContentItem> => {
    const response = await apiClient.post('/home-content/admin', payload);
    return response.data?.data ?? response.data;
  },

  update: async (
    id: number,
    payload: {
      section_type?: 'UNIFIED_HOME' | 'HERO' | 'BENEFIT' | 'CATALOG';
      title?: string;
      payload?: any;
      order_index?: number;
      is_active?: boolean;
      status?: 'active' | 'inactive';
    },
  ): Promise<HomeContentItem> => {
    const response = await apiClient.put(`/home-content/admin/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  // Simpan / update 1 paket kesatuan Home Content
  saveUnified: async (
    payload: UnifiedHomePayload,
    title = 'Paket Konten Home Mitra10',
    id?: number,
    isActive = true,
  ): Promise<HomeContentItem> => {
    const body = {
      section_type: 'UNIFIED_HOME',
      title,
      payload,
      is_active: isActive,
    };
    if (id) {
      const res = await apiClient.put(`/home-content/admin/${id}`, body);
      return res.data?.data ?? res.data;
    } else {
      const res = await apiClient.post('/home-content/admin', body);
      return res.data?.data ?? res.data;
    }
  },

  // Toggle status aktif paket (hanya boleh 1 aktif)
  toggleActive: async (id: number, isActive: boolean): Promise<HomeContentItem> => {
    const res = await apiClient.put(`/home-content/admin/${id}`, { is_active: isActive });
    return res.data?.data ?? res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/home-content/admin/${id}`);
  },

  // Verifikasi sinkronisasi
  checkSync: async (): Promise<SyncVerificationResult> => {
    const response = await apiClient.get('/home-content/admin/sync-check');
    return response.data?.data ?? response.data;
  },

  uploadImage: async (file: File): Promise<{image_url: string; file_url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(
      '/home-content/admin/upload-image',
      formData,
    );
    const d = response.data?.data ?? response.data;
    return d?.data ?? d;
  },
};
