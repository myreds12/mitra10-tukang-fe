import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Spin, Radio, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPen,
  faCheck,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import {
  homeContentService,
  HomeContentItem,
  UnifiedHomePayload,
} from '../../../services/homeContentService';
import { LivePreviewPanel } from '../../home-content-shared/LivePreviewPanel';
import { formatDateWithTime } from '../../../../_metronic/helpers';
import './HomeContentSettings.css';

export const HomeContentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [item, setItem] = useState<HomeContentItem | null>(null);
  const [previewSectionMode, setPreviewSectionMode] = useState<
    'FULL' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'PROGRAM' | 'ARTICLE' | 'JOB_RESULT'
  >('FULL');
  const [selectedProgramIndex, setSelectedProgramIndex] = useState<number>(0);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const items = await homeContentService.getAll();
      const found = items.find((it) => String(it.id) === String(id));
      if (found) {
        setItem(found);
      } else {
        message.error('Paket konten tidak ditemukan.');
        navigate('/home-content-settings');
      }
    } catch (err: any) {
      console.error('Error fetching detail:', err);
      message.error('Gagal memuat detail paket konten.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleActive = async () => {
    if (!item) return;
    if (item.is_active) {
      message.warning('Minimal harus ada 1 paket Home Content yang aktif di sistem.');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Aktifkan Paket Ini?',
      text: `Mengaktifkan "${item.title || 'Paket'}" akan secara otomatis menonaktifkan paket lain yang sedang aktif di portal vendor.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Aktifkan Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#183383',
    });
    if (!confirm.isConfirmed) return;

    try {
      await homeContentService.toggleActive(item.id, true);
      message.success(`Paket "${item.title}" sekarang aktif sebagai tampilan Home Vendor.`);
      fetchDetail();
    } catch (err: any) {
      message.error('Gagal mengaktifkan paket home content.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} tip='Memuat detail paket konten...' />
      </div>
    );
  }

  if (!item) return null;

  const p: UnifiedHomePayload = item.payload || {};
  const bCount = Array.isArray(p.benefits) ? p.benefits.length : 0;
  const cCount = Array.isArray(p.catalogs) ? p.catalogs.length : 0;
  const progCount = Array.isArray(p.programs) ? p.programs.length : 0;
  const jobCount = Array.isArray(p.job_results) ? p.job_results.length : 0;

  return (
    <section id='home-content-settings'>
      <div className='card mb-5 mb-xl-8'>
        {/* CARD HEADER */}
        <div className='card-header border-0 pt-5'>
          <div className='d-flex align-items-center gap-3'>
            <button
              type='button'
              className='btn btn-sm btn-light d-inline-flex align-items-center gap-2'
              onClick={() => navigate('/home-content-settings')}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>
            <div className='d-flex flex-column'>
              <div className='d-flex align-items-center gap-2'>
                <h3 className='card-title fw-bolder fs-3 m-0 text-gray-900'>
                  {item.title || 'Detail Paket Konten Home'}
                </h3>
                <span className={`badge ${item.is_active ? 'badge-light-success' : 'badge-light-danger'} fw-bold`}>
                  {item.is_active ? '● SEDANG AKTIF DI VENDOR' : 'NONAKTIF'}
                </span>
              </div>
              <span className='text-muted fw-bold fs-7 mt-1'>
                Pratinjau lengkap isi konten yang ditampilkan pada beranda vendor pendaftar
              </span>
            </div>
          </div>

          <div className='card-toolbar d-flex gap-3'>
            {!item.is_active && (
              <button
                type='button'
                className='btn btn-sm btn-success d-inline-flex align-items-center gap-2'
                onClick={handleToggleActive}
              >
                <FontAwesomeIcon icon={faCheck} />
                Aktifkan Paket Ini
              </button>
            )}

            <button
              type='button'
              className='btn btn-sm btn-primary d-inline-flex align-items-center gap-2'
              style={{ backgroundColor: '#183383', borderColor: '#183383' }}
              onClick={() => navigate(`/home-content-settings/edit/${item.id}`)}
            >
              <FontAwesomeIcon icon={faPen} />
              Edit Paket Ini
            </button>
          </div>
        </div>

        {/* CARD BODY */}
        <div className='card-body py-4'>
          {/* PACKAGE METRICS SUMMARY */}
          <div className='card card-bordered p-4 mb-4 bg-lighten' style={{ border: '1px solid #E2E8F0', borderRadius: 8 }}>
            <div className='d-flex flex-wrap justify-content-between align-items-center gap-3'>
              <div className='d-flex flex-wrap gap-2'>
                <span className='badge badge-light-primary fw-bold fs-7 py-2 px-3'>
                  🌟 Hero Section
                </span>
                <span className='badge badge-light-success fw-bold fs-7 py-2 px-3'>
                  🎁 {bCount} Keuntungan
                </span>
                <span className='badge badge-light-warning fw-bold fs-7 py-2 px-3'>
                  🛠️ {cCount} Katalog Jasa
                </span>
                <span className='badge badge-light-info fw-bold fs-7 py-2 px-3'>
                  📢 {progCount} Program Promosi
                </span>
                <span className='badge badge-light-dark fw-bold fs-7 py-2 px-3'>
                  📸 {jobCount} Hasil Pekerjaan
                </span>
              </div>

              <div className='d-flex align-items-center gap-4 text-muted fs-7'>
                <span>
                  <FontAwesomeIcon icon={faCalendarAlt} className='me-1 text-primary' />
                  Terakhir diperbarui: <strong>{formatDateWithTime(item.updated_at || item.created_at)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION FILTER BAR */}
          <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 p-3 bg-light rounded border'>
            <div className='d-flex align-items-center gap-2'>
              <span className='fw-bold text-gray-800 fs-7'>Bagian Tampilan:</span>
              <Radio.Group
                value={previewSectionMode}
                onChange={(e) => setPreviewSectionMode(e.target.value)}
                size='small'
              >
                <Radio.Button value='FULL'>✨ Halaman Utuh</Radio.Button>
                <Radio.Button value='HERO'>🌟 Hero</Radio.Button>
                <Radio.Button value='BENEFIT'>🎁 Keuntungan</Radio.Button>
                <Radio.Button value='CATALOG'>🛠️ Katalog</Radio.Button>
                <Radio.Button value='PROGRAM'>📢 Program Promosi</Radio.Button>
                <Radio.Button value='ARTICLE'>📰 Artikel Program</Radio.Button>
                <Radio.Button value='JOB_RESULT'>📸 Portofolio</Radio.Button>
              </Radio.Group>
            </div>

            <span className='badge badge-light-primary fw-bold'>
              Full Interactive Preview
            </span>
          </div>

          {/* INTERACTIVE PREVIEW PANEL */}
          <div className='border rounded p-4 bg-white shadow-xs'>
            <LivePreviewPanel
              sectionType={previewSectionMode}
              unifiedPayload={p}
              selectedProgramIndex={selectedProgramIndex}
              onSelectProgramIndex={(idx) => setSelectedProgramIndex(idx)}
              payload={
                previewSectionMode === 'HERO'
                  ? p.hero
                  : previewSectionMode === 'BENEFIT'
                  ? p.benefits
                  : previewSectionMode === 'CATALOG'
                  ? p.catalogs
                  : previewSectionMode === 'PROGRAM' || previewSectionMode === 'ARTICLE'
                  ? p.programs
                  : previewSectionMode === 'JOB_RESULT'
                  ? p.job_results
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};
