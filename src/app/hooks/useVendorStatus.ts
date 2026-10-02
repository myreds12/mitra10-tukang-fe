import { useCallback, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export type HomeStage =
  | 'menunggu_approve'
  | 'proses_pitching'
  | 'approved'
  | 'rejected'
  | 'pendaftaran'
  | 'verifikasi'
  | 'review_admin'
  | 'approval';

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
  status_int?: number;
  stage_note?: string;
  rejection_reason?: string;
  reapply_date?: string | null;
  profile: ProfileFlags;
  profile_completion: number;
  profile_completed: number;
  profile_total: number;
  updated_at: number;
}

const STAGE_LABEL: Record<string, string> = {
  menunggu_approve: 'Menunggu Approve',
  proses_pitching: 'Proses Pitching',
  approved: 'Diterima sebagai Vendor',
  rejected: 'Ditolak',
  pendaftaran: 'Menunggu Approve',
  verifikasi: 'Proses Pitching',
  review_admin: 'Proses Pitching',
  approval: 'Proses Pitching',
};

const STAGE_STATUS_PILL: Record<string, { label: string; color: string }> = {
  menunggu_approve: { label: 'Menunggu Approve', color: '#FBC02D' },
  proses_pitching: { label: 'Proses Pitching', color: '#183383' },
  approved: { label: 'Vendor Diterima', color: '#16A34A' },
  rejected: { label: 'Pendaftaran Ditolak', color: '#E12429' },
  pendaftaran: { label: 'Menunggu Approve', color: '#FBC02D' },
  verifikasi: { label: 'Proses Pitching', color: '#183383' },
  review_admin: { label: 'Proses Pitching', color: '#183383' },
  approval: { label: 'Proses Pitching', color: '#183383' },
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

  const fetchStatus = useCallback(
    async (silent = false) => {
      if (!apiUrl) return;
      if (!silent) setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/vendor-portal/me', {
          params: {
            fresh: 'true',
            _t: Date.now(),
          },
        });
        const data = response.data?.data ?? response.data;
        if (data) {
          setStatus(data as VendorPortalStatus);
        }
      } catch (err: any) {
        console.error('useVendorStatus fetch error:', err);
        if (!silent) setError('Gagal memuat status registrasi. Coba lagi nanti.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [apiUrl]
  );

  const refresh = useCallback(async () => {
    await fetchStatus(false);
  }, [fetchStatus]);

  useEffect(() => {
    if (!apiUrl) return;

    // 1. Initial fetch
    fetchStatus(false);

    // 2. Realtime sync handler
    const handleSyncEvent = () => {
      fetchStatus(true);
    };

    // a) Local DOM CustomEvent (saat simpan data di tab yang sama)
    window.addEventListener('vendor-profile-updated', handleSyncEvent);

    // b) Window focus & tab visibility change (saat user beralih kembali ke tab Beranda)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus(true);
      }
    };
    window.addEventListener('focus', handleSyncEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // c) Storage event listener (saat simpan data di tab/jendela lain)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vendor_profile_updated_at') {
        fetchStatus(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    // d) BroadcastChannel listener (antar tab modern)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('vendor-portal-sync');
        channel.onmessage = (msg) => {
          if (msg?.data?.type === 'PROFILE_UPDATED') {
            fetchStatus(true);
          }
        };
      }
    } catch (e) {
      // ignore
    }

    // e) Polling periodik (setiap 20 detik saat window aktif)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStatus(true);
      }
    }, 20000);

    return () => {
      window.removeEventListener('vendor-profile-updated', handleSyncEvent);
      window.removeEventListener('focus', handleSyncEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
      clearInterval(intervalId);
    };
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
