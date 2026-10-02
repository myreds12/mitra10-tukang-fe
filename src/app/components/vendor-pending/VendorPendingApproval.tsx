import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Modal } from 'antd';
import { useVendorStatus, HomeStage } from '../../hooks/useVendorStatus';
import { homeContentService, HomeContentItem } from '../../services/homeContentService';
import './VendorPendingApproval.css';
import { openYellowChat } from '../../utils/yellowMessenger';

const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

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
  const { status, loading, error, refresh } = useVendorStatus(apiUrl, vendorId);
  const [vendorNameFallback, setVendorNameFallback] = useState('Vendor');
  const [stageFallback, setStageFallback] = useState<HomeStage>('menunggu_approve');
  const [supportInfo, setSupportInfo] = useState<HomeContentItem | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Jika pendaftar sudah disetujui, alihkan langsung ke dashboard vendor (/home).
  // Status "Disetujui" tidak perlu muncul di dashboard pendaftar karena akun sudah menjadi vendor aktif.
  useEffect(() => {
    const isApprovedFromStatus =
      status?.stage === 'approved' ||
      status?.status_int === 3 ||
      (status as any)?.status === 3;

    if (isApprovedFromStatus) {
      localStorage.setItem('userRole', 'Owner Vendor');
      window.location.replace('/home');
    }
  }, [status]);

  useEffect(() => {
    if (!status) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.company_name) setVendorNameFallback(u.company_name);
          if (u?.registration_status) {
            const s = Number(u.registration_status);
            if (s === 1) setStageFallback('menunggu_approve');
            else if (s === 2) setStageFallback('proses_pitching');
            else if (s === 3) {
              localStorage.setItem('userRole', 'Owner Vendor');
              window.location.replace('/home');
            } else if (s === 4) setStageFallback('rejected');
          }
        }
      } catch {
        // ignore
      }
    }
  }, [status]);

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
        // Silent
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLengkapiProfil = () => {
    navigate('/pendaftar/dokumen');
  };

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: 'Keluar dari Akun?',
      text: 'Apakah Anda yakin ingin keluar dari akun pendaftar vendor?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#183383',
      cancelButtonColor: '#7e8299',
    });
    if (!confirm.isConfirmed) return;

    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const payloadSupport = (supportInfo?.payload as any) || {};
  const supportLabel = payloadSupport.support_label || supportInfo?.title || 'Hubungi Tim Support';
  const supportNote = payloadSupport.support_note || 'Tim kami siap membantu kendala dan kelengkapan dokumen pendaftaran vendor Anda.';

  const normalizedStage = status?.stage || stageFallback;
  const statusInt = status?.status_int;

  const isRejected = normalizedStage === 'rejected' || statusInt === 4;
  const isApproved = normalizedStage === 'approved' || statusInt === 3;
  const isPitching =
    !isRejected &&
    !isApproved &&
    (normalizedStage === 'proses_pitching' ||
      normalizedStage === 'verifikasi' ||
      normalizedStage === 'review_admin' ||
      normalizedStage === 'approval' ||
      statusInt === 2);
  const isWaitingApproval = !isRejected && !isApproved && !isPitching;

  // Jika sudah disetujui, cegah render konten pendaftar selama proses redirect berlangsung
  if (isApproved) {
    return null;
  }

  const vendorName = status?.vendor_name ?? vendorNameFallback;

  // Topbar Pill: hanya menampilkan status pendaftar aktif (Menunggu Approve / Proses Pitching) atau Ditolak
  let topbarPill = { label: 'Menunggu Approve', className: 'pill-pending' };
  if (isRejected) {
    topbarPill = { label: 'Pendaftaran Ditolak', className: 'pill-rejected' };
  } else if (isPitching) {
    topbarPill = { label: 'Proses Pitching', className: 'pill-pitching' };
  }

  // Definisi alur status:
  // - Saat proses berjalan: HANYA 2 STATUS (Menunggu Approve & Proses Pitching)
  // - Saat ditolak: 3 STATUS (Menunggu Approve, Proses Pitching, Ditolak)
  // - Disetujui TIDAK MUNCUL karena otomatis masuk dashboard vendor
  type StepItem = {
    key: string;
    num: number;
    label: string;
    sublabel: string;
    cls: 'done' | 'active' | 'pending' | 'rejected';
  };

  let steps: StepItem[] = [];

  if (isRejected) {
    steps = [
      {
        key: 'menunggu_approve',
        num: 1,
        label: 'Menunggu Approve',
        sublabel: 'Selesai',
        cls: 'done',
      },
      {
        key: 'proses_pitching',
        num: 2,
        label: 'Proses Pitching',
        sublabel: 'Selesai',
        cls: 'done',
      },
      {
        key: 'ditolak',
        num: 3,
        label: 'Ditolak',
        sublabel: 'Ditolak',
        cls: 'rejected',
      },
    ];
  } else {
    // Tepat 2 status saat proses pendaftaran berlangsung
    steps = [
      {
        key: 'menunggu_approve',
        num: 1,
        label: 'Menunggu Approve',
        sublabel: isPitching ? 'Selesai' : 'Sedang berjalan',
        cls: isPitching ? 'done' : 'active',
      },
      {
        key: 'proses_pitching',
        num: 2,
        label: 'Proses Pitching',
        sublabel: isPitching ? 'Sedang berjalan' : 'Menunggu',
        cls: isPitching ? 'active' : 'pending',
      },
    ];
  }

  let statusCardSub =
    status?.stage_note ||
    'Pendaftaran Anda sedang diproses oleh tim Mitra10. Tim kami akan menghubungi lewat email & WhatsApp setiap ada update.';

  if (isRejected) {
    statusCardSub =
      'Pengajuan pendaftaran vendor Anda belum dapat disetujui setelah melalui tahap evaluasi.';
  } else if (isPitching) {
    statusCardSub =
      'Pendaftaran Anda telah lolos verifikasi awal dan saat ini sedang dalam proses pitching bersama tim Mitra10.';
  } else if (isWaitingApproval) {
    statusCardSub =
      'Pendaftaran Anda telah kami terima dan saat ini sedang menunggu antrean review & approval tim Mitra10.';
  }

  return (
    <>
      {/* Topbar */}
      <section className='vp-topbar'>
        <div className='vp-topbar-title'>
          Register Vendor
        </div>
        <div className='vp-topbar-vendor'>
          <span className='vp-topbar-vendor-name'>
            {vendorName}
          </span>
          <span className={`vp-topbar-pill ${topbarPill.className}`}>
            <span className='vp-topbar-pill-dot' />
            {topbarPill.label}
          </span>
          <button
            type='button'
            className='vp-btn-logout'
            onClick={handleLogout}
            title='Keluar dari akun'
          >
            Keluar
          </button>
        </div>
      </section>

      {/* Status card: Stepper (2 status saat proses berjalan, 3 status saat ditolak) */}
      <div className='vp-status-card'>
        <div className='vp-status-card-head'>
          <div>
            <h2>Status Pendaftaran Anda</h2>
            <p className='vp-status-card-sub'>{statusCardSub}</p>
          </div>
        </div>

        <div className={`vp-steps vp-steps-count-${steps.length}`}>
          {steps.map((step) => {
            return (
              <div key={step.key} className={`vp-step vp-step-${step.cls}`}>
                <div className='vp-step-line' />
                <div className='vp-step-circ'>
                  {step.cls === 'done' ? '✓' : step.cls === 'rejected' ? '✕' : step.num}
                </div>
                <div className='vp-step-label'>{step.label}</div>
                <div className='vp-step-sublabel'>{step.sublabel}</div>
              </div>
            );
          })}
        </div>

        {/* Tampilan Khusus: Jika Ditolak (3 Poin Informasi & Ketentuan Penolakan) */}
        {isRejected && (
          <div className='vp-rejection-card'>
            <div className='vp-rejection-header'>
              <div className='vp-rejection-icon'>✕</div>
              <div>
                <h4 className='vp-rejection-title'>Pendaftaran Belum Memenuhi Kriteria</h4>
                <p className='vp-rejection-desc'>
                  Terima kasih atas minat Anda bermitra dengan Mitra10. Mohon maaf, saat ini pendaftaran Anda belum dapat kami setujui.
                </p>
              </div>
            </div>
            <div className='vp-rejection-box'>
              <div className='vp-rejection-box-title'>Informasi &amp; Ketentuan Penolakan:</div>
              <ul className='vp-rejection-list'>
                <li>
                  <span className='vp-rejection-dot'>•</span>
                  <div>
                    <strong>Alasan:</strong> {status?.rejection_reason || status?.stage_note || 'Belum memenuhi kriteria'}
                  </div>
                </li>
                <li>
                  <span className='vp-rejection-dot'>•</span>
                  <div>
                    <strong>Dapat melakukan pendaftaran ulang setelah 1 bulan</strong>
                    {status?.reapply_date ? ` (mulai tanggal ${status.reapply_date})` : ''}
                  </div>
                </li>
                <li>
                  <span className='vp-rejection-dot'>•</span>
                  <div>
                    <strong>Data pendaftaran akan dihapus dari sistem 3 hari setelah pengajuan di tolak</strong>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Profile completion card (tampil saat proses pendaftaran berlangsung) */}
      {!isRejected && (
        <div className='vp-profile-card'>
          <div className='vp-profile-left'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3 style={{ margin: 0 }}>Profil Anda {status?.profile_completion ?? 0}% lengkap</h3>
              <button
                type='button'
                onClick={() => refresh()}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '2px 6px',
                  fontSize: 14,
                  color: '#6B7280',
                  borderRadius: 4,
                  lineHeight: 1,
                  opacity: loading ? 0.5 : 1,
                }}
                title='Segarkan data profil secara realtime'
              >
                🔄
              </button>
            </div>
            <div className='vp-profile-pct'>
              {status?.profile_completed ?? 0} dari {status?.profile_total ?? 5} dokumen sudah dilengkapi
            </div>
            <div className='vp-bar'>
              <div
                className='vp-bar-fill'
                style={{ width: `${status?.profile_completion ?? 0}%` }}
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
            {PROFILE_LABELS.map(({ key, label }) => {
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
      )}

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
            <button
              type='button'
              onClick={() => {
                setSupportModalOpen(false);
                openYellowChat();
              }}
              style={{
                flex: 1,
                background: '#1E2A78',
                color: '#fff',
                border: 'none',
                textAlign: 'center',
                padding: '10px 14px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>💬 Buka Live Chat Support</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
