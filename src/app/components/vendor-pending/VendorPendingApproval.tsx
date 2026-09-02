import React, { useEffect, useMemo, useState } from 'react';
import { useVendorStatus, HomeStage } from '../../hooks/useVendorStatus';
import './VendorPendingApproval.css';

const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

const STAGE_ORDER: HomeStage[] = [
  'pendaftaran',
  'verifikasi',
  'review_admin',
  'approval',
  'approved',
];

const STAGE_LABEL: Record<HomeStage, string> = {
  pendaftaran: 'Pendaftaran',
  verifikasi: 'Verifikasi',
  review_admin: 'Review Admin',
  approval: 'Approval',
  approved: 'Diterima sebagai Vendor',
  rejected: 'Pendaftaran Ditolak',
};

const STATUS_PILL: Record<HomeStage, { label: string; className: string }> = {
  pendaftaran: { label: 'Menunggu Pendaftaran', className: 'pill-pending' },
  verifikasi: { label: 'Menunggu Verifikasi', className: 'pill-pending' },
  review_admin: { label: 'Menunggu Review Admin', className: 'pill-pending' },
  approval: { label: 'Menunggu Approval', className: 'pill-pending' },
  approved: { label: 'Vendor Aktif', className: 'pill-active' },
  rejected: { label: 'Pendaftaran Ditolak', className: 'pill-rejected' },
};

const PROFILE_LABELS: Array<{
  key: keyof import('../../hooks/useVendorStatus').ProfileFlags;
  label: string;
}> = [
  { key: 'company_data', label: 'Data perusahaan / usaha' },
  { key: 'legal_docs', label: 'Dokumen legal (KTP/NIB)' },
  { key: 'portfolio_photos', label: 'Foto portofolio pekerjaan' },
  { key: 'certification', label: 'Sertifikasi keahlian' },
  { key: 'bank_account', label: 'Rekening bank untuk pencairan' },
];

function getStageClass(
  stage: HomeStage,
  currentStage: HomeStage,
): 'done' | 'active' | 'pending' | 'rejected' {
  if (currentStage === 'rejected') {
    const idx = STAGE_ORDER.indexOf(stage);
    const curIdx = STAGE_ORDER.indexOf('approval');
    return idx <= curIdx ? 'done' : 'pending';
  }
  const idx = STAGE_ORDER.indexOf(stage);
  const curIdx = STAGE_ORDER.indexOf(currentStage);
  if (idx < curIdx) return 'done';
  if (idx === curIdx) return 'active';
  return 'pending';
}

function getCurrentVendorId(): number | undefined {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return undefined;
    const u = JSON.parse(raw);
    return u?.vendor_id ?? u?.id;
  } catch {
    return undefined;
  }
}

export const VendorPendingApproval: React.FC = () => {
  const vendorId = useMemo(() => getCurrentVendorId(), []);
  const { status, loading, error } = useVendorStatus(apiUrl, vendorId);
  const [vendorNameFallback, setVendorNameFallback] = useState('Vendor');
  const [stageFallback, setStageFallback] = useState<HomeStage>('pendaftaran');
  const [statusPillFallback] = useState(STATUS_PILL.pendaftaran);

  useEffect(() => {
    // Best-effort local fallback: read from localStorage.user if WS not yet returned data
    if (!status) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.company_name) setVendorNameFallback(u.company_name);
          if (u?.registration_status) setStageFallback(u.registration_status);
        }
      } catch {
        // ignore
      }
    }
  }, [status]);

  const isRejected = status?.stage === 'rejected' || stageFallback === 'rejected';
  const currentStage = (status?.stage ?? stageFallback) as HomeStage;
  const currentStageIdx = STAGE_ORDER.indexOf(currentStage);
  const activeIdx = isRejected
    ? STAGE_ORDER.indexOf('approval')
    : currentStageIdx;
  const vendorName = status?.vendor_name ?? vendorNameFallback;
  const statusPill =
    STATUS_PILL[status?.stage ?? stageFallback] ?? STATUS_PILL.pendaftaran;

  return (
    <>
      {/* Topbar */}
      <section className='vp-topbar'>
        <div className='vp-topbar-logo'>
          <span className='vp-topbar-mark'>
            <span className='vp-topbar-mark-1'>Mitra</span>
            <span className='vp-topbar-mark-2'>10</span>
          </span>
        </div>
        <div className='vp-topbar-vendor'>
          <span className='vp-topbar-vendor-name'>{vendorName}</span>
          <span className={`vp-topbar-pill ${statusPill.className}`}>
            <span className='vp-topbar-pill-dot' />
            {statusPill.label}
          </span>
        </div>
      </section>

      {/* Status card: 5-step stepper */}
      <div className='vp-status-card'>
        <div className='vp-status-card-head'>
          <div>
            <h2>Status Pendaftaran Anda</h2>
            <p className='vp-status-card-sub'>
              {status?.stage_note ||
                'Pendaftaran Anda sedang diproses oleh tim Mitra10. Tim kami akan menghubungi lewat email & WhatsApp setiap ada update.'}
            </p>
          </div>
          <a className='vp-btn-outline' href='#hubungi-tim'>
            Hubungi Tim Support
          </a>
        </div>
        <div className='vp-steps'>
          {STAGE_ORDER.map((s, idx) => {
            const cls = isRejected
              ? s === 'approval'
                ? 'rejected'
                : getStageClass(s, currentStage)
              : getStageClass(s, currentStage);
            return (
              <div key={s} className={`vp-step vp-step-${cls}`}>
                <div className='vp-step-line' />
                <div className='vp-step-circ'>
                  {cls === 'done' ? '✓' : cls === 'rejected' ? '✕' : idx + 1}
                </div>
                <div className='vp-step-label'>{STAGE_LABEL[s]}</div>
                <div className='vp-step-sublabel'>
                  {cls === 'done'
                    ? 'Selesai'
                    : cls === 'active'
                    ? 'Sedang berjalan'
                    : cls === 'rejected'
                    ? 'Ditolak'
                    : 'Menunggu'}
                </div>
              </div>
            );
          })}
        </div>
        {status?.stage === 'rejected' && status.stage_note && (
          <div className='vp-stage-note-rejected'>{status.stage_note}</div>
        )}
      </div>

      {/* Profile completion card */}
      <div className='vp-profile-card'>
        <div className='vp-profile-left'>
          <h3>Profil Anda {status?.profile_completion ?? 0}% lengkap</h3>
          <div className='vp-profile-pct'>
            {status?.profile_completed ?? 0} dari {status?.profile_total ?? 5} dokumen sudah dilengkapi
          </div>
          <div className='vp-bar'>
            <div
              className='vp-bar-fill'
              style={{width: `${status?.profile_completion ?? 0}%`}}
            />
          </div>
          <a className='vp-btn-primary' href='#lengkapi-profil'>
            Lengkapi Profil Sekarang
          </a>
        </div>
        <ul className='vp-checklist'>
          {PROFILE_LABELS.map(({key, label}) => {
            const done = status?.profile?.[key] ?? false;
            return (
              <li key={key} className={done ? 'done' : ''}>
                <span className='vp-check'>{done ? '✓' : ''}</span>
                {label}
              </li>
            );
          })}
        </ul>
      </div>
      {error && <div className='vp-error-banner'>{error}</div>}
      {loading && !status && (
        <div className='vp-loading'>Memuat status registrasi...</div>
      )}
    </>
  );
};
