import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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

const POLL_INTERVAL_MS = 30_000;

export function useVendorStatus(
  apiUrl: string | undefined,
  initialVendorId: number | undefined,
): {
  status: VendorPortalStatus | null;
  loading: boolean;
  error: string;
  STAGE_LABEL: typeof STAGE_LABEL;
  STAGE_STATUS_PILL: typeof STAGE_STATUS_PILL;
} {
  const [status, setStatus] = useState<VendorPortalStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!apiUrl) return;

    let cancelled = false;
    const token = localStorage.getItem('accessToken');

    const fetchInitial = async () => {
      try {
        setLoading(true);
        setError('');
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
        if (!cancelled && data) {
          setStatus(data as VendorPortalStatus);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('useVendorStatus fetch error:', err);
          setError('Gagal memuat status registrasi. Coba lagi nanti.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInitial();

    // Set up WebSocket subscription for live updates
    const wsUrl = apiUrl
      .replace(/^http:\/\//, 'ws://')
      .replace(/^https:\/\//, 'wss://');
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (initialVendorId) {
        socket.emit('subscribe', { vendorId: initialVendorId });
      }
    });

    socket.on('status_update', (newStatus: VendorPortalStatus) => {
      if (!cancelled) setStatus(newStatus);
    });

    socket.on('connect_error', (err) => {
      console.warn('WS connect_error, falling back to polling', err);
    });

    return () => {
      cancelled = true;
      if (initialVendorId) {
        socket.emit('unsubscribe', { vendorId: initialVendorId });
      }
      socket.disconnect();
    };
  }, [apiUrl, initialVendorId]);

  return { status, loading, error, STAGE_LABEL, STAGE_STATUS_PILL };
}

export function getStageStatus(stage: HomeStage): {
  status: 'pending' | 'done' | 'active' | 'rejected';
  label: string;
} {
  // This is a hook helper not used in this file but exported for component use
  return { status: 'pending', label: STAGE_LABEL[stage] };
}
