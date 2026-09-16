import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Table, Spin, message, Switch } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {
  Row as BsRow,
  Col as BsCol,
  Form,
  Button as BsButton,
  OverlayTrigger,
  Tooltip as BsTooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPen,
  faTrash,
  faSearch,
  faCheck,
  faEye,
  faPlus,
  faCircleInfo,
  faPowerOff,
} from '@fortawesome/free-solid-svg-icons';
import { formatDateWithTime } from '../../../../_metronic/helpers';
import type { ColumnsType } from 'antd/es/table';
import { HomeContentItem, homeContentService } from '../../../services/homeContentService';
import './HomeContentSettings.css';

export const HomeContentList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HomeContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await homeContentService.getAll();
      setItems(data);
    } catch (err: any) {
      console.error('Error fetching home content packages:', err);
      setError('Gagal memuat daftar paket home content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleActive = async (record: HomeContentItem) => {
    if (record.is_active) {
      const confirm = await Swal.fire({
        title: 'Nonaktifkan Paket Konten?',
        text: `Paket "${record.title || 'Paket'}" akan dinonaktifkan. Halaman beranda vendor akan menggunakan tampilan default sistem sampai ada paket lain yang diaktifkan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Nonaktifkan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#7e8299',
      });
      if (!confirm.isConfirmed) return;

      try {
        await homeContentService.toggleActive(record.id, false);
        message.success(`Paket "${record.title}" berhasil dinonaktifkan.`);
        fetchItems();
      } catch (err: any) {
        message.error('Gagal menonaktifkan paket home content.');
      }
      return;
    }

    const confirm = await Swal.fire({
      title: 'Aktifkan Paket Ini?',
      text: `Mengaktifkan "${record.title || 'Paket'}" akan menjadikannya tampilan utama di portal vendor. Paket aktif sebelumnya akan otomatis dinonaktifkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Aktifkan Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#183383',
      cancelButtonColor: '#7e8299',
    });
    if (!confirm.isConfirmed) return;

    try {
      await homeContentService.toggleActive(record.id, true);
      message.success(`Paket "${record.title}" sekarang aktif sebagai tampilan Home Vendor.`);
      fetchItems();
    } catch (err: any) {
      message.error('Gagal mengaktifkan paket home content.');
    }
  };

  const handleDeletePackage = async (record: HomeContentItem) => {
    const isCurrentActive = record.is_active;
    const confirm = await Swal.fire({
      title: 'Hapus Paket Konten?',
      text: isCurrentActive
        ? `Paket "${record.title}" saat ini SEDANG AKTIF. Jika dihapus, tampilan beranda vendor akan kembali ke default sistem. Yakin ingin menghapus?`
        : `Yakin hapus "${record.title}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#7e8299',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });
    if (!confirm.isConfirmed) return;

    try {
      await homeContentService.remove(record.id);
      Swal.fire('Berhasil', 'Paket konten berhasil dihapus', 'success');
      fetchItems();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menghapus paket';
      Swal.fire('Gagal', Array.isArray(msg) ? msg.join(', ') : String(msg), 'error');
    }
  };

  const renderTooltip = (title: string) => <BsTooltip id='button-tooltip'>{title}</BsTooltip>;

  const filteredItems = items.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const headline = (item.payload?.hero?.headline_main || '').toLowerCase();
    const highlight = (item.payload?.hero?.headline_highlight || '').toLowerCase();
    return title.includes(q) || headline.includes(q) || highlight.includes(q);
  });

  const columns: ColumnsType<HomeContentItem> = [
    {
      title: 'No.',
      key: 'no',
      align: 'center',
      width: 55,
      className: 'col_order_id',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama Paket Home Content',
      key: 'package_title',
      render: (_, r) => {
        const p = r.payload || {};
        return (
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 13.5, color: '#183383', cursor: 'pointer' }}
              onClick={() => navigate(`/home-content-settings/detail/${r.id}`)}
            >
              {r.title || 'Paket Konten Home Mitra10'}
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>
              Hero: &ldquo;{p.hero?.headline_main || 'Selamat bergabung sebagai'}{' '}
              <strong style={{ color: '#183383' }}>{p.hero?.headline_highlight || 'Mitra Instalasi'}</strong>&rdquo;
            </div>
          </div>
        );
      },
    },
    {
      title: 'Komponen Konten',
      key: 'components',
      width: 290,
      render: (_, r) => {
        const p = r.payload || {};
        const bCount = Array.isArray(p.benefits) ? p.benefits.length : 6;
        const cCount = Array.isArray(p.catalogs) ? p.catalogs.length : 8;
        const progCount = Array.isArray(p.programs) ? p.programs.length : 0;
        const jobCount = Array.isArray(p.job_results) ? p.job_results.length : 0;
        return (
          <div className='d-flex flex-wrap gap-1'>
            <span className='badge badge-light-primary fw-bold'>🌟 Hero</span>
            <span className='badge badge-light-success fw-bold'>🎁 {bCount} Keuntungan</span>
            <span className='badge badge-light-warning fw-bold'>🛠️ {cCount} Katalog</span>
            {progCount > 0 && <span className='badge badge-light-info fw-bold'>📢 {progCount} Program</span>}
            {jobCount > 0 && <span className='badge badge-light-dark fw-bold'>📸 {jobCount} Portofolio</span>}
          </div>
        );
      },
    },
    {
      title: 'Status Tampil',
      key: 'is_active',
      width: 150,
      align: 'center',
      render: (_, r) => (
        <div className='d-flex flex-column align-items-center gap-1'>
          <span className={`badge ${r.is_active ? 'badge-light-success' : 'badge-light-danger'} fw-bold`}>
            {r.is_active ? '● AKTIF' : 'NONAKTIF'}
          </span>
          <Switch
            size='small'
            checked={r.is_active}
            onChange={() => handleToggleActive(r)}
            style={{ background: r.is_active ? '#50cd89' : undefined }}
          />
        </div>
      ),
    },
    {
      title: 'Terakhir Diperbarui',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 170,
      align: 'center',
      render: (val, r) => {
        const dt = val || r.created_at;
        return dt ? (
          <span style={{ fontSize: 12, color: '#3f4254', fontWeight: 500 }}>
            {formatDateWithTime(dt)}
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Action',
      key: 'actions',
      width: 160,
      align: 'center',
      render: (_, r) => (
        <div className='button-wrapper d-flex justify-content-center gap-2'>
          <OverlayTrigger
            placement='bottom'
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip('Detail & Preview Paket')}
          >
            <BsButton
              variant='primary'
              className='button-detail'
              onClick={() => navigate(`/home-content-settings/detail/${r.id}`)}
            >
              <FontAwesomeIcon icon={faEye} fontSize='13px' />
            </BsButton>
          </OverlayTrigger>

          <OverlayTrigger
            placement='bottom'
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip('Edit Paket')}
          >
            <BsButton
              variant='primary'
              className='button-edit'
              onClick={() => navigate(`/home-content-settings/edit/${r.id}`)}
            >
              <FontAwesomeIcon icon={faPen} fontSize='13px' />
            </BsButton>
          </OverlayTrigger>

          {r.is_active ? (
            <OverlayTrigger
              placement='bottom'
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip('Nonaktifkan Paket')}
            >
              <BsButton
                variant='warning'
                className='button-inactive'
                style={{ backgroundColor: '#ffc107', borderColor: '#ffc107', color: '#000' }}
                onClick={() => handleToggleActive(r)}
              >
                <FontAwesomeIcon icon={faPowerOff} fontSize='13px' />
              </BsButton>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger
              placement='bottom'
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip('Aktifkan Paket')}
            >
              <BsButton
                variant='success'
                className='button-active'
                onClick={() => handleToggleActive(r)}
              >
                <FontAwesomeIcon icon={faCheck} fontSize='13px' />
              </BsButton>
            </OverlayTrigger>
          )}

          <OverlayTrigger
            placement='bottom'
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip(r.is_active ? 'Hapus Paket (Sedang Aktif)' : 'Hapus Paket')}
          >
            <BsButton
              variant='danger'
              className='button-delete'
              onClick={() => handleDeletePackage(r)}
            >
              <FontAwesomeIcon icon={faTrash} fontSize='13px' />
            </BsButton>
          </OverlayTrigger>
        </div>
      ),
    },
  ];

  return (
    <section id='home-content-settings'>
      <div className='card mb-5 mb-xl-8'>
        {/* CARD HEADER METRONIC */}
        <div className='card-header border-0 pt-5'>
          <h3 className='card-title align-items-start flex-column'>
            <span className='card-label fw-bolder fs-3 mb-1 text-gray-900'>
              Kelola Konten Home Vendor
            </span>
            <span className='text-muted mt-1 fw-bold fs-7'>
              Konfigurasi paket konten halaman beranda vendor (Hero, Keuntungan, Katalog Jasa, Program Promosi, dan Hasil Pekerjaan)
            </span>
          </h3>
          <div className='card-toolbar d-flex gap-3'>
            <button
              type='button'
              className='btn btn-sm btn-primary d-inline-flex align-items-center gap-2'
              style={{ backgroundColor: '#183383', borderColor: '#183383' }}
              onClick={() => navigate('/home-content-settings/new')}
            >
              <FontAwesomeIcon icon={faPlus} />
              Tambah Paket Konten Baru
            </button>
          </div>
        </div>

        {/* CARD BODY */}
        <div className='card-body py-4'>
          {/* NOTICE BANNER */}
          <div className='notice d-flex bg-light-primary rounded border-primary border border-dashed p-4 mb-5'>
            <FontAwesomeIcon icon={faCircleInfo} className='fs-2 text-primary me-4 mt-1' />
            <div className='d-flex flex-stack flex-grow-1'>
              <div className='fw-semibold'>
                <h5 className='text-gray-900 fw-bold m-0'>Manajemen Paket Konten Home Vendor</h5>
                <div className='fs-7 text-gray-700 mt-1'>
                  Anda dapat membuat banyak paket konten (sebagai draft, variasi promo, atau versi berkala). Hanya 1 paket yang aktif sebagai tampilan portal vendor. Anda bebas mengaktifkan paket lain kapan saja (otomatis menggantikan paket aktif sebelumnya) atau menonaktifkan paket aktif.
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className='alert alert-danger d-flex align-items-center p-4 mb-5'>
              <span className='svg-icon svg-icon-2hx svg-icon-danger me-3'>⚠️</span>
              <div className='d-flex flex-column'>
                <span className='fw-bold'>{error}</span>
              </div>
            </div>
          )}

          {/* FILTER SEARCH ROW */}
          <BsRow className='table-head-wrapper align-items-center mb-4'>
            <BsCol xs={12} md={6} lg={4}>
              <div className='filter-search'>
                <Form.Group className='position-relative'>
                  <Form.Control
                    placeholder='Cari nama paket atau teks headline...'
                    className='filter-ltr'
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                  <span className='search-icon'>
                    <FontAwesomeIcon icon={faSearch} className='text-muted' size='sm' />
                  </span>
                </Form.Group>
              </div>
            </BsCol>

            <BsCol xs={12} md={6} lg={8} className='d-flex justify-content-md-end align-items-center gap-2 mt-3 mt-md-0'>
              {searchFilter && (
                <button
                  type='button'
                  className='btn btn-sm btn-light'
                  onClick={() => setSearchFilter('')}
                >
                  Reset Filter
                </button>
              )}
              <span className='badge badge-light-primary fw-bold py-2 px-3 fs-7'>
                Total: {filteredItems.length} Paket
              </span>
            </BsCol>
          </BsRow>

          {/* TABLE CONTAINER */}
          <Spin
            tip='Loading...'
            spinning={loading}
            size='large'
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          >
            <div className='table-custom-wrapper'>
              <Table
                className='table-striped-rows'
                bordered
                columns={columns}
                dataSource={filteredItems}
                rowKey='id'
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Spin>

          {/* PAGINATION / FOOTER INFO */}
          <div className='pagination-container mt-5 d-flex justify-content-between align-items-center'>
            <span className='total-text text-muted fs-7'>
              Showing {filteredItems.length > 0 ? 1 : 0} - {filteredItems.length} of {filteredItems.length} Paket Konten
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
