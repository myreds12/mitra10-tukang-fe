import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { useVendorStatus, HomeStage } from '../../hooks/useVendorStatus';
import { homeContentService, HomeContentItem } from '../../services/homeContentService';
import './VendorPendingApproval.css';

const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function extractPhone(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/(\+?\d[\d\s-]{6,}\d)/);
  return match ? match[0].replace(/\s/g, '') : null;
}

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
  const navigate = useNavigate();
  const vendorId = useMemo(() => getCurrentVendorId(), []);
  const { status, loading, error } = useVendorStatus(apiUrl, vendorId);
  const [vendorNameFallback, setVendorNameFallback] = useState('Vendor');
  const [stageFallback, setStageFallback] = useState<HomeStage>('pendaftaran');
  const [supportInfo, setSupportInfo] = useState<HomeContentItem | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

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

  // Fetch support contact info dari home_content SUPPORT section (editable via admin).
  useEffect(() => {
    let cancelled = false;
    homeContentService
      .getActive()
      .then((items) => {
        if (cancelled) return;
        const support = items.find((i) => i.section === 'SUPPORT' && i.is_active);
        setSupportInfo(support ?? null);
      })
      .catch(() => {
        // Silent: kalau gagal, fallback ke default text
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLengkapiProfil = () => {
    navigate('/pendaftar/dokumen');
  };

  const payloadSupport = (supportInfo?.payload as any) || {};
  const supportPhone = payloadSupport.support_phone || extractPhone(supportInfo?.description) || '+6281234567890';
  const supportLabel = payloadSupport.support_label || supportInfo?.title || 'Hubungi Tim Support';
  const supportNote = payloadSupport.support_note || 'Tim kami siap membantu kendala dan kelengkapan dokumen pendaftaran vendor Anda.';

  const isRejected = status?.stage === 'rejected' || stageFallback === 'rejected';
  const currentStage = (status?.stage ?? stageFallback) as HomeStage;
  const vendorName = status?.vendor_name ?? vendorNameFallback;
  const statusPill =
    STATUS_PILL[status?.stage ?? stageFallback] ?? STATUS_PILL.pendaftaran;

  const cleanPhoneForWa = (supportPhone || '').replace(/[^0-9]/g, '');

  return (
    <>
      {/* Topbar */}
      <section className='vp-topbar'>
        <div className='vp-topbar-title'>
          Pendaftar Vendor
        </div>
        <div className='vp-topbar-vendor'>
          <span className='vp-topbar-vendor-name'>
            {vendorName}
          </span>
          <span className={`vp-topbar-pill ${statusPill.className}`}>
            <span className='vp-topbar-pill-dot' />
            {statusPill.label}
          </span>
          <button
            type='button'
            className='vp-btn-logout'
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            title='Keluar dari akun'
          >
            Keluar
          </button>
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
          <button
            type='button'
            className='vp-btn-primary'
            onClick={handleLengkapiProfil}
          >
            Lengkapi Profil Sekarang
          </button>
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

      {/* MODAL HUBUNGI TIM SUPPORT */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🎧</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1E2A78' }}>
              {supportLabel}
            </span>
          </div>
        }
        open={supportModalOpen}
        onCancel={() => setSupportModalOpen(false)}
        footer={null}
        width={460}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#4B5563', fontSize: 13, marginBottom: 16 }}>
            {supportNote}
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            {cleanPhoneForWa && (
              <a
                href={`https://wa.me/${cleanPhoneForWa}`}
                target='_blank'
                rel='noopener noreferrer'
                style={{
                  flex: 1,
                  background: '#00A651',
                  color: '#fff',
                  textAlign: 'center',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>💬 WhatsApp Tim Support</span>
              </a>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
