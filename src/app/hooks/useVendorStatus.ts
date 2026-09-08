import { useCallback, useEffect, useState } from 'react';

export type HomeStage =
  | 'pendaftaran'
  | 'verifikasi'
  | 'review_admin'
  | 'approval'
  | 'approved'
  | 'rejected';

export interface ProfileFlags {
  company_data: boolean;
  legal_docs: boolean;
  portfolio_photos: boolean;
  certification: boolean;
  bank_account: boolean;
}

export interface VendorPortalStatus {
  vendor_id: number;
  vendor_name: string;
  stage: HomeStage;
  stage_note?: string;
  profile: ProfileFlags;
  profile_completion: number;
  profile_completed: number;
  profile_total: number;
  updated_at: number;
}

const STAGE_LABEL: Record<HomeStage, string> = {
  pendaftaran: 'Pendaftaran',
  verifikasi: 'Verifikasi',
  review_admin: 'Review Admin',
  approval: 'Approval',
  approved: 'Diterima sebagai Vendor',
  rejected: 'Pendaftaran Ditolak',
};

const STAGE_STATUS_PILL: Record<HomeStage, { label: string; color: string }> = {
  pendaftaran: { label: 'Menunggu Pendaftaran', color: '#FBC02D' },
  verifikasi: { label: 'Menunggu Verifikasi', color: '#FBC02D' },
  review_admin: { label: 'Menunggu Review Admin', color: '#FBC02D' },
  approval: { label: 'Menunggu Approval', color: '#FBC02D' },
  approved: { label: 'Vendor Aktif', color: '#16A34A' },
  rejected: { label: 'Pendaftaran Ditolak', color: '#E12429' },
};

export function useVendorStatus(
  apiUrl: string | undefined,
  initialVendorId: number | undefined,
): {
  status: VendorPortalStatus | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  STAGE_LABEL: typeof STAGE_LABEL;
  STAGE_STATUS_PILL: typeof STAGE_STATUS_PILL;
} {
  const [status, setStatus] = useState<VendorPortalStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchStatus = useCallback(async () => {
    if (!apiUrl) return;
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/vendor-portal/me`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const body = await response.json();
      const data = body?.data ?? body;
      if (data) {
        setStatus(data as VendorPortalStatus);
      }
    } catch (err: any) {
      console.error('useVendorStatus fetch error:', err);
      setError('Gagal memuat status registrasi. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!apiUrl) return;
    fetchStatus();
    // Catatan: WebSocket subscription dihapus karena CRACO/CRA bundle
    // untuk socket.io-client bermasalah (io is not a function). Update
    // status realtime diganti manual via tombol Refresh di UI.
  }, [apiUrl, fetchStatus]);

  return {
    status,
    loading,
    error,
    refresh,
    STAGE_LABEL,
    STAGE_STATUS_PILL,
  };
}

export function getStageStatus(stage: HomeStage): {
  status: 'pending' | 'done' | 'active' | 'rejected';
  label: string;
} {
  return { status: 'pending', label: STAGE_LABEL[stage] };
}
