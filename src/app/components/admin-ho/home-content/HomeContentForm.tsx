import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Input,
  Select,
  Switch,
  Tabs,
  Row,
  Col,
  Upload,
  Button as AntButton,
  Spin,
  message,
  Radio,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faFileAlt,
  faEye,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  homeContentService,
  UnifiedHomePayload,
  BenefitAccentColor,
} from '../../../services/homeContentService';
import { LivePreviewPanel } from '../../home-content-shared/LivePreviewPanel';
import { resolveImageUrl } from '../../home-content-shared/imageHelper';
import { ProgramQuillEditor } from './ProgramQuillEditor';
import {
  validateVideoFile,
  compressVideo,
  formatFileSize,
  COMPRESS_THRESHOLD_BYTES,
  MAX_VIDEO_FILE_SIZE_BYTES,
} from './videoCompressor';
import './HomeContentSettings.css';
import '../../../modules/pendaftar/ProgramDetailPage.css';

const { TextArea } = Input;

const BENEFIT_EMOJI_PRESETS = ['📦', '💰', '🧾', '🛡️', '⭐', '🎓', '🔧', '🏆', '💡', '🤝'];

const ACCENT_OPTIONS: Array<{ value: BenefitAccentColor; label: string; color: string }> = [
  { value: 'brand-blue', label: 'Brand Blue (#1E2A78)', color: '#1E2A78' },
  { value: 'brand-red', label: 'Brand Red (#E12429)', color: '#E12429' },
  { value: 'brand-yellow', label: 'Brand Yellow (#FBC02D)', color: '#FBC02D' },
];

const DEFAULT_UNIFIED_PAYLOAD: UnifiedHomePayload = {
  hero: {
    headline_main: 'Selamat bergabung sebagai',
    headline_highlight: 'Mitra Instalasi Mitra10',
    description:
      'Sambil menunggu verifikasi selesai, kenali dulu bagaimana platform ini membantu Anda mendapatkan order instalasi rutin dari pelanggan Mitra10 di kota Anda.',
    illustration_image: null,
  },
  benefits: [
    {
      icon: '📦',
      title: 'Order instalasi langsung dari pembeli',
      description:
        'Customer Mitra10 yang belanja material langsung memesan jasa pemasangan lewat platform. Tanpa perlu cari order sendiri.',
      accent_color: 'brand-blue',
    },
    {
      icon: '💰',
      title: 'Tarif jasa transparan & pasti',
      description:
        'Harga jasa terstandarisasi jelas per item pekerjaan. Tidak ada tawar-menawar yang memotong margin Anda.',
      accent_color: 'brand-red',
    },
    {
      icon: '🧾',
      title: 'Pencairan dana tepat waktu',
      description:
        'Begitu pekerjaan selesai & diverifikasi customer, pembayaran ditransfer langsung ke rekening bank vendor Anda.',
      accent_color: 'brand-yellow',
    },
    {
      icon: '🛡️',
      title: 'Perlindungan & jaminan kerja',
      description:
        'Sistem komplain & garansi ditangani bersama tim Mitra10, sehingga risiko pekerjaan lebih terukur.',
      accent_color: 'brand-blue',
    },
    {
      icon: '⭐',
      title: 'Tingkatkan reputasi vendor',
      description:
        'Rating & ulasan dari customer akan menaikkan level kemitraan Anda, membuka akses ke proyek bervolume lebih besar.',
      accent_color: 'brand-red',
    },
    {
      icon: '🎓',
      title: 'Dukungan & pelatihan berkala',
      description:
        'Akses SOP instalasi Mitra10, briefing produk baru dari brand prinsipal, serta bantuan teknis dari tim lapangan.',
      accent_color: 'brand-yellow',
    },
  ],
  catalogs: [
    {
      name: 'Cat & Dinding',
      link_url: 'https://www.mitra10.com/cat-lantai-dinding',
      badge_text: 'Populer',
      icon_fallback: '🎨',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Keramik & Granit',
      link_url: 'https://www.mitra10.com/cat-lantai-dinding/lantai',
      badge_text: null,
      icon_fallback: '🧱',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Sanitari & Kamar Mandi',
      link_url: 'https://www.mitra10.com/kamar-mandi',
      badge_text: 'Banyak Order',
      icon_fallback: '🚿',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Pintu & Jendela',
      link_url: 'https://www.mitra10.com/pintu-jendela-material-bangunan',
      badge_text: null,
      icon_fallback: '🚪',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Dapur & Sink',
      link_url: 'https://www.mitra10.com/dapur',
      badge_text: null,
      icon_fallback: '🍳',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Alat Listrik & Lampu',
      link_url: 'https://www.mitra10.com/lampu-elektronik',
      badge_text: null,
      icon_fallback: '💡',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Hardware & Kunci',
      link_url: 'https://www.mitra10.com/hardware-tools',
      badge_text: null,
      icon_fallback: '🔒',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Atap & Bahan Bangunan',
      link_url: 'https://www.mitra10.com/pintu-jendela-material-bangunan/bahan-bangunan',
      badge_text: null,
      icon_fallback: '🏗️',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
  ],
  programs: [
    {
      title: 'Program Insentif Awal Tahun Mitra10 2026',
      badge: 'Program Promosi',
      badge_label: 'Program Promosi',
      description:
        'Dapatkan bonus insentif tambahan sebesar 5% per penyelesaian order instalasi tepat waktu dan dengan rating bintang 5 dari pelanggan Mitra10 selama kuartal pertama tahun 2026.',
      image: '',
      image_url: '',
      cta_label: 'Lihat Detail',
      link_url: 'https://www.mitra10.com',
      external_cta_label: 'Ikuti Program',
      is_active: true,
      has_external_link: false,
      show_card_cta: true,
    },
  ],
  job_results: [
    {
      title: 'Pemasangan Granit Lantai Ruang Utama 60x60',
      description: 'Pengerjaan pemasangan keramik granit presisi tinggi dengan nat rata sempurna di area ruang tamu rumah tinggal.',
      badge_label: 'Before - After',
      tag: 'Before - After',
      media_type: 'before_after',
      before_image: '',
      image_before_url: '',
      image: '',
      image_after_url: '',
      video_url: null,
      order_index: 0,
      is_active: true,
    },
  ],
  support: {
    support_label: 'Hubungi Tim Support',
    support_email: 'vendor-support@mitra10.com',
    support_phone: '+6281234567890',
    support_hours: 'Senin - Jumat, 08:00 - 17:00 WIB',
    support_note: 'Tim kami siap membantu kendala dan verifikasi pendaftaran vendor Anda.',
  },
};

interface Props {
  isEdit?: boolean;
}

export const HomeContentForm: React.FC<Props> = ({ isEdit: isEditProp }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(isEditProp || id);

  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // 2 Main Tabs: 'form' vs 'preview'
  const [mainTab, setMainTab] = useState<'form' | 'preview'>('form');

  // Sub-tabs inside Form tab
  const [formSubTab, setFormSubTab] = useState<string>('hero');

  // Preview Mode inside Preview tab
  const [previewSectionMode, setPreviewSectionMode] = useState<
    'FULL' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'PROGRAM' | 'ARTICLE' | 'JOB_RESULT'
  >('FULL');
  const [selectedProgramIndex, setSelectedProgramIndex] = useState<number>(0);

  // Form State
  const [packageTitle, setPackageTitle] = useState<string>('Paket Konten Home Mitra10');
  const [unifiedPayload, setUnifiedPayload] = useState<UnifiedHomePayload>(
    JSON.parse(JSON.stringify(DEFAULT_UNIFIED_PAYLOAD))
  );
  const [packageIsActive, setPackageIsActive] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      setLoadingInitial(true);
      homeContentService
        .getAll()
        .then((items) => {
          const found = items.find((it) => String(it.id) === String(id));
          if (found) {
            setPackageTitle(found.title || 'Paket Konten Home Mitra10');
            setPackageIsActive(Boolean(found.is_active));
            const p = found.payload || {};
            setUnifiedPayload({
              hero: p.hero || DEFAULT_UNIFIED_PAYLOAD.hero,
              benefits:
                Array.isArray(p.benefits) && p.benefits.length > 0
                  ? p.benefits
                  : DEFAULT_UNIFIED_PAYLOAD.benefits,
              catalogs:
                Array.isArray(p.catalogs) && p.catalogs.length > 0
                  ? p.catalogs
                  : DEFAULT_UNIFIED_PAYLOAD.catalogs,
              programs:
                Array.isArray(p.programs) && p.programs.length > 0
                  ? p.programs
                  : DEFAULT_UNIFIED_PAYLOAD.programs,
              job_results:
                Array.isArray(p.job_results) && p.job_results.length > 0
                  ? p.job_results
                  : DEFAULT_UNIFIED_PAYLOAD.job_results,
              support: p.support || DEFAULT_UNIFIED_PAYLOAD.support,
            });
          } else {
            message.error('Paket konten tidak ditemukan.');
            navigate('/home-content-settings');
          }
        })
        .catch((err) => {
          console.error(err);
          message.error('Gagal mengambil data paket konten.');
        })
        .finally(() => setLoadingInitial(false));
    }
  }, [id, navigate]);

  // Save Package Handler
  const handleSavePackage = async () => {
    if (!packageTitle.trim()) {
      message.error('Nama paket konten wajib diisi.');
      return;
    }
    if (!unifiedPayload.hero.headline_main || !unifiedPayload.hero.headline_highlight) {
      message.error('Headline Hero wajib diisi.');
      setFormSubTab('hero');
      setMainTab('form');
      return;
    }
    if (unifiedPayload.benefits.length === 0) {
      message.error('Minimal harus ada 1 Keuntungan Menjadi Vendor.');
      setFormSubTab('benefits');
      setMainTab('form');
      return;
    }
    if (unifiedPayload.catalogs.length === 0) {
      message.error('Minimal harus ada 1 Kategori Katalog Jasa.');
      setFormSubTab('catalogs');
      setMainTab('form');
      return;
    }

    setSaving(true);
    try {
      await homeContentService.saveUnified(
        unifiedPayload,
        packageTitle.trim(),
        id ? Number(id) : undefined,
        packageIsActive
      );
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Paket Home Content berhasil disimpan secara utuh.',
        icon: 'success',
        confirmButtonColor: '#183383',
      });
      navigate('/home-content-settings');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan paket home content';
      Swal.fire('Gagal Menyimpan', Array.isArray(msg) ? msg.join('<br/>') : String(msg), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Image Upload Handlers
  const handleUploadHeroImage = async (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setUnifiedPayload((prev) => ({
      ...prev,
      hero: { ...prev.hero, illustration_image: blobUrl },
    }));
    try {
      const res = await homeContentService.uploadImage(file);
      setUnifiedPayload((prev) => ({
        ...prev,
        hero: { ...prev.hero, illustration_image: res.image_url },
      }));
      message.success('Ilustrasi Hero berhasil diunggah.');
    } catch (err: any) {
      message.error('Gagal mengunggah gambar ke server.');
    }
    return false;
  };

  const handleClearHeroImage = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      hero: { ...prev.hero, illustration_image: null },
    }));
  };

  const addBenefitItem = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          icon: '⭐',
          title: 'Keuntungan Tambahan',
          description: 'Deskripsi keuntungan baru bagi mitra instalasi.',
          accent_color: 'brand-blue',
          image: null,
        },
      ],
    }));
  };

  const removeBenefitItem = (index: number) => {
    if (unifiedPayload.benefits.length <= 1) {
      message.warning('Minimal harus ada 1 item keuntungan.');
      return;
    }
    setUnifiedPayload((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleUploadCatalogImage = async (file: File, index: number) => {
    const blobUrl = URL.createObjectURL(file);
    setUnifiedPayload((prev) => {
      const cats = [...prev.catalogs];
      cats[index] = { ...cats[index], image: blobUrl };
      return { ...prev, catalogs: cats };
    });
    try {
      const res = await homeContentService.uploadImage(file);
      setUnifiedPayload((prev) => {
        const cats = [...prev.catalogs];
        cats[index] = { ...cats[index], image: res.image_url };
        return { ...prev, catalogs: cats };
      });
      message.success(`Gambar katalog #${index + 1} berhasil diunggah.`);
    } catch (err: any) {
      message.error('Gagal mengunggah gambar katalog.');
    }
    return false;
  };

  const handleClearCatalogImage = (index: number) => {
    setUnifiedPayload((prev) => {
      const cats = [...prev.catalogs];
      cats[index] = { ...cats[index], image: null };
      return { ...prev, catalogs: cats };
    });
  };

  const addCatalogItem = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      catalogs: [
        ...prev.catalogs,
        {
          name: 'Kategori Baru',
          link_url: 'https://www.mitra10.com',
          badge_text: null,
          icon_fallback: '💡',
          image: null,
          button_label: 'Lihat Produk →',
          button_style: 'primary',
        },
      ],
    }));
  };

  const removeCatalogItem = (index: number) => {
    if (unifiedPayload.catalogs.length <= 1) {
      message.warning('Minimal harus ada 1 item katalog.');
      return;
    }
    setUnifiedPayload((prev) => ({
      ...prev,
      catalogs: prev.catalogs.filter((_, i) => i !== index),
    }));
  };

  const handleAddProgram = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      programs: [
        ...(prev.programs || []),
        {
          title: 'Program Promosi Baru',
          badge: 'Program Baru',
          badge_label: 'Program Baru',
          description: '',
          image: '',
          image_url: '',
          cta_label: 'Lihat Detail',
          link_url: '',
          external_cta_label: 'Ikuti Program',
          is_active: true,
          has_external_link: false,
          show_card_cta: true,
        },
      ],
    }));
  };

  const handleRemoveProgram = (index: number) => {
    setUnifiedPayload((prev) => ({
      ...prev,
      programs: (prev.programs || []).filter((_, i) => i !== index),
    }));
  };

  const handleUploadProgramImage = async (file: File, index: number) => {
    const blobUrl = URL.createObjectURL(file);
    setUnifiedPayload((prev) => {
      const list = [...(prev.programs || [])];
      list[index] = { ...list[index], image: blobUrl, image_url: blobUrl };
      return { ...prev, programs: list };
    });
    try {
      const res = await homeContentService.uploadImage(file);
      setUnifiedPayload((prev) => {
        const list = [...(prev.programs || [])];
        list[index] = { ...list[index], image: res.image_url, image_url: res.image_url };
        return { ...prev, programs: list };
      });
      message.success('Banner program berhasil diunggah.');
    } catch (err: any) {
      message.error('Gagal mengunggah gambar program.');
    }
    return false;
  };

  const handleClearProgramImage = (index: number) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.programs || [])];
      list[index] = { ...list[index], image: '', image_url: '' };
      return { ...prev, programs: list };
    });
  };

  const handleAddJobResult = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      job_results: [
        ...(prev.job_results || []),
        {
          title: 'Hasil Kerja Baru',
          description: 'Deskripsi pengerjaan instalasi...',
          badge_label: 'Before - After',
          tag: 'Before - After',
          media_type: 'before_after',
          before_image: '',
          image_before_url: '',
          image: '',
          image_after_url: '',
          video_url: null,
          order_index: (prev.job_results || []).length,
          is_active: true,
        },
      ],
    }));
  };

  const handleRemoveJobResult = (index: number) => {
    setUnifiedPayload((prev) => ({
      ...prev,
      job_results: (prev.job_results || []).filter((_, i) => i !== index),
    }));
  };

  const handleUploadJobResultImage = async (file: File, index: number, isBefore: boolean) => {
    const blobUrl = URL.createObjectURL(file);
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])];
      if (isBefore) {
        list[index] = { ...list[index], before_image: blobUrl, image_before_url: blobUrl };
      } else {
        list[index] = { ...list[index], image: blobUrl, image_after_url: blobUrl };
      }
      return { ...prev, job_results: list };
    });
    try {
      const res = await homeContentService.uploadImage(file);
      setUnifiedPayload((prev) => {
        const list = [...(prev.job_results || [])];
        if (isBefore) {
          list[index] = { ...list[index], before_image: res.image_url, image_before_url: res.image_url };
        } else {
          list[index] = { ...list[index], image: res.image_url, image_after_url: res.image_url };
        }
        return { ...prev, job_results: list };
      });
      message.success(`Foto ${isBefore ? 'Before' : 'After'} berhasil diunggah.`);
    } catch (err: any) {
      message.error('Gagal mengunggah foto.');
    }
    return false;
  };

  const handleClearJobResultImage = (index: number, isBefore: boolean) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])];
      if (isBefore) {
        list[index] = { ...list[index], before_image: '', image_before_url: '' };
      } else {
        list[index] = { ...list[index], image: '', image_after_url: '' };
      }
      return { ...prev, job_results: list };
    });
  };

  const handleUploadJobResultVideo = async (file: File, index: number) => {
    // 1. Validasi format file & batasan ukuran awal
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Format Video Tidak Didukung',
        text: validation.error || 'Format video tidak diizinkan. Gunakan MP4, WebM, MOV, atau MKV.',
        confirmButtonColor: '#183383',
      });
      return false;
    }

    let fileToUpload = file;
    let compressionSummary = '';

    // 2. Kompresi otomatis jika ukuran file > 2 MB
    if (file.size > COMPRESS_THRESHOLD_BYTES) {
      const hideCompress = message.loading(
        `Mengompresi video portofolio (${formatFileSize(file.size)} ke 720p HD)...`,
        0
      );
      try {
        const compResult = await compressVideo(file);
        hideCompress();
        if (compResult.wasCompressed) {
          fileToUpload = compResult.file;
          compressionSummary = ` (Dikompresi: ${formatFileSize(compResult.originalSize)} ➔ ${formatFileSize(compResult.compressedSize)}, hemat ${compResult.ratioPercent}%)`;
          message.info(`Video berhasil dikompresi: hemat ${compResult.ratioPercent}% ukuran file.`);
        }
      } catch (cErr) {
        hideCompress();
        console.warn('Kompresi video gagal, melanjutkan upload file asli:', cErr);
      }
    }

    // 3. Validasi batas maksimal server (30 MB)
    if (fileToUpload.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      Swal.fire({
        icon: 'error',
        title: 'Ukuran Video Terlalu Besar',
        text: `Ukuran file video (${formatFileSize(fileToUpload.size)}) melebihi batas maksimal server (30 MB). Silakan gunakan video dengan durasi lebih pendek.`,
        confirmButtonColor: '#183383',
      });
      return false;
    }

    // 4. Unggah ke backend server
    const hide = message.loading('Mengunggah video ke server...', 0);
    try {
      const res = await homeContentService.uploadVideo(fileToUpload);
      hide();
      setUnifiedPayload((prev) => {
        const list = [...(prev.job_results || [])];
        list[index] = {
          ...list[index],
          media_type: 'video',
          video_url: res.video_url,
          tag: list[index]?.tag || 'Video Dokumentasi',
          badge_label: list[index]?.badge_label || 'Video Dokumentasi',
        };
        return { ...prev, job_results: list };
      });
      message.success(`Video dokumentasi berhasil diunggah${compressionSummary}.`);
    } catch (err: any) {
      hide();
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Gagal mengunggah video ke server.';
      Swal.fire({
        icon: 'error',
        title: 'Upload Gagal',
        text: errMsg,
        confirmButtonColor: '#183383',
      });
    }
    return false;
  };

  const handleClearJobResultVideo = (index: number) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])];
      list[index] = { ...list[index], video_url: null };
      return { ...prev, job_results: list };
    });
  };

  if (loadingInitial) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} tip='Memuat formulir paket konten...' />
      </div>
    );
  }

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
              Kembali ke Daftar
            </button>
            <div className='d-flex flex-column'>
              <h3 className='card-title fw-bolder fs-3 m-0 text-gray-900'>
                {isEdit ? 'Edit Formulir Paket Konten Home' : 'Formulir Tambah Paket Konten Home Baru'}
              </h3>
              <span className='text-muted fw-bold fs-7 mt-1'>
                Konfigurasi lengkap Hero, Keuntungan, Katalog Jasa, Program Promosi, dan Portofolio
              </span>
            </div>
          </div>

          <div className='card-toolbar d-flex gap-3'>
            <button
              type='button'
              className='btn btn-sm btn-light'
              onClick={() => navigate('/home-content-settings')}
            >
              Batal
            </button>
            <button
              type='button'
              className='btn btn-sm btn-primary d-inline-flex align-items-center gap-2'
              style={{ backgroundColor: '#183383', borderColor: '#183383', minWidth: 140 }}
              disabled={saving}
              onClick={handleSavePackage}
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? 'Menyimpan...' : 'Simpan Paket Konten'}
            </button>
          </div>
        </div>

        {/* CARD BODY */}
        <div className='card-body py-4'>
          {/* TOP CONFIGURATION ROW */}
          <div className='card card-bordered p-4 mb-4 bg-lighten' style={{ border: '1px solid #E2E8F0', borderRadius: 8 }}>
            <Row gutter={16} align='middle'>
              <Col xs={24} md={15}>
                <label className='hc-form-label fs-6 fw-bold text-gray-800'>
                  Nama / Versi Paket Konten <span style={{ color: '#E12429' }}>*</span>
                </label>
                <Input
                  value={packageTitle}
                  onChange={(e) => setPackageTitle(e.target.value)}
                  placeholder='Contoh: Paket Konten Home Q1 2026'
                  style={{ height: 42, borderRadius: 6, fontSize: 13.5 }}
                />
              </Col>
              <Col xs={24} md={9}>
                <div className='d-flex align-items-center justify-content-md-end gap-3 mt-3 mt-md-0'>
                  <div>
                    <span className='hc-form-label fs-6 fw-bold text-gray-800 mb-0'>Status Tampil di Portal Vendor</span>
                    <span className='hc-form-help'>Jika aktif, paket ini akan langsung tampil bagi vendor</span>
                  </div>
                  <Switch
                    checked={packageIsActive}
                    onChange={(val) => setPackageIsActive(val)}
                    checkedChildren='AKTIF'
                    unCheckedChildren='NONAKTIF'
                    style={{ background: packageIsActive ? '#50cd89' : undefined }}
                  />
                </div>
              </Col>
            </Row>
          </div>

          {/* 2 MAIN TABS: TAB 1 FORMULIR & TAB 2 LIVE PREVIEW */}
          <Tabs
            activeKey={mainTab}
            onChange={(k) => setMainTab(k as 'form' | 'preview')}
            className='hc-main-tabs'
            items={[
              // ========================================================
              // TAB 1: FORMULIR KONTEN
              // ========================================================
              {
                key: 'form',
                label: (
                  <span className='d-flex align-items-center gap-2'>
                    <FontAwesomeIcon icon={faFileAlt} />
                    1. Formulir Konten (Edit Data)
                  </span>
                ),
                children: (
                  <div className='hc-form-subtabs-wrap' style={{ minHeight: 600 }}>
                    <Tabs
                      activeKey={formSubTab}
                      onChange={(k) => setFormSubTab(k)}
                      className='hc-form-tabs-container'
                      type='card'
                      items={[
                        // ----------------------------------------------
                        // SUBTAB 1: HERO
                        // ----------------------------------------------
                        {
                          key: 'hero',
                          label: '🌟 1. Hero Section',
                          children: (
                            <div style={{ padding: '8px 2px' }}>
                              <div className='mb-4'>
                                <label className='hc-form-label'>Headline Teks Utama <span style={{ color: '#E12429' }}>*</span></label>
                                <Input
                                  value={unifiedPayload.hero.headline_main}
                                  onChange={(e) =>
                                    setUnifiedPayload((prev) => ({
                                      ...prev,
                                      hero: { ...prev.hero, headline_main: e.target.value },
                                    }))
                                  }
                                  placeholder='Selamat bergabung sebagai'
                                  style={{ height: 38, borderRadius: 6 }}
                                />
                              </div>

                              <div className='mb-4'>
                                <label className='hc-form-label'>Headline Highlight (Teks Biru / Bold) <span style={{ color: '#E12429' }}>*</span></label>
                                <Input
                                  value={unifiedPayload.hero.headline_highlight}
                                  onChange={(e) =>
                                    setUnifiedPayload((prev) => ({
                                      ...prev,
                                      hero: { ...prev.hero, headline_highlight: e.target.value },
                                    }))
                                  }
                                  placeholder='Mitra Instalasi Mitra10'
                                  style={{ height: 38, borderRadius: 6 }}
                                />
                              </div>

                              <div className='mb-4'>
                                <label className='hc-form-label'>Deskripsi Sambutan Paragraf</label>
                                <TextArea
                                  rows={4}
                                  value={unifiedPayload.hero.description}
                                  onChange={(e) =>
                                    setUnifiedPayload((prev) => ({
                                      ...prev,
                                      hero: { ...prev.hero, description: e.target.value },
                                    }))
                                  }
                                  placeholder='Penjelasan sambutan vendor...'
                                  style={{ borderRadius: 6 }}
                                />
                              </div>

                              <div className='hc-item-card bg-lighten'>
                                <label className='hc-form-label mb-2'>
                                  Ilustrasi Gambar Hero (Opsional)
                                </label>
                                <div className='d-flex align-items-center gap-3 flex-wrap'>
                                  {unifiedPayload.hero.illustration_image ? (
                                    <div className='d-flex align-items-center gap-3'>
                                      <img
                                        src={resolveImageUrl(unifiedPayload.hero.illustration_image) || ''}
                                        alt='Preview Hero'
                                        style={{
                                          width: 100,
                                          height: 70,
                                          objectFit: 'contain',
                                          borderRadius: 6,
                                          border: '1px solid #D9D9D9',
                                          background: '#FFF',
                                        }}
                                      />
                                      <AntButton danger size='small' onClick={handleClearHeroImage}>
                                        Hapus Gambar
                                      </AntButton>
                                    </div>
                                  ) : (
                                    <div style={{ color: '#9CA3AF', fontSize: 12 }}>
                                      Menggunakan ilustrasi vektor default Mitra10.
                                    </div>
                                  )}

                                  <Upload
                                    accept='image/jpeg,image/png,image/webp'
                                    showUploadList={false}
                                    beforeUpload={handleUploadHeroImage}
                                  >
                                    <AntButton icon={<UploadOutlined />}>
                                      {unifiedPayload.hero.illustration_image ? 'Ganti Ilustrasi' : 'Unggah Ilustrasi Baru'}
                                    </AntButton>
                                  </Upload>
                                </div>
                                <span className='hc-form-help'>Format yang didukung: JPG, PNG, WEBP (Maksimal 2MB)</span>
                              </div>
                            </div>
                          ),
                        },

                        // ----------------------------------------------
                        // SUBTAB 2: BENEFITS
                        // ----------------------------------------------
                        {
                          key: 'benefits',
                          label: `🎁 2. Keuntungan (${unifiedPayload.benefits.length})`,
                          children: (
                            <div>
                              <div className='d-flex justify-content-between align-items-center mb-3'>
                                <span className='text-muted fs-7'>
                                  Daftar poin keuntungan yang didapatkan mitra saat bergabung di Mitra10.
                                </span>
                                <AntButton
                                  type='primary'
                                  icon={<PlusOutlined />}
                                  onClick={addBenefitItem}
                                  style={{ backgroundColor: '#183383', borderColor: '#183383' }}
                                >
                                  Tambah Keuntungan
                                </AntButton>
                              </div>

                              <Row gutter={[16, 16]}>
                                {unifiedPayload.benefits.map((ben, idx) => (
                                  <Col xs={24} md={12} key={`ben-${idx}`}>
                                    <div className='hc-item-card position-relative h-100'>
                                      <div className='d-flex justify-content-between align-items-center mb-2'>
                                        <span className='fw-bold text-gray-800 fs-7'>
                                          Keuntungan #{idx + 1}
                                        </span>
                                        <AntButton
                                          type='text'
                                          danger
                                          size='small'
                                          icon={<DeleteOutlined />}
                                          onClick={() => removeBenefitItem(idx)}
                                        />
                                      </div>

                                      <div className='mb-2'>
                                        <label className='hc-form-label'>Icon Emoji</label>
                                        <div className='d-flex align-items-center gap-2'>
                                          <Input
                                            value={ben.icon || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setUnifiedPayload((prev) => {
                                                const list = [...prev.benefits];
                                                list[idx] = { ...list[idx], icon: val };
                                                return { ...prev, benefits: list };
                                              });
                                            }}
                                            style={{ width: 80 }}
                                          />
                                          <div className='d-flex gap-1 flex-wrap'>
                                            {BENEFIT_EMOJI_PRESETS.map((em) => (
                                              <button
                                                key={em}
                                                type='button'
                                                className='btn btn-xs btn-light p-1'
                                                onClick={() => {
                                                  setUnifiedPayload((prev) => {
                                                    const list = [...prev.benefits];
                                                    list[idx] = { ...list[idx], icon: em };
                                                    return { ...prev, benefits: list };
                                                  });
                                                }}
                                              >
                                                {em}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className='mb-2'>
                                        <label className='hc-form-label'>Judul Keuntungan</label>
                                        <Input
                                          value={ben.title}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setUnifiedPayload((prev) => {
                                              const list = [...prev.benefits];
                                              list[idx] = { ...list[idx], title: val };
                                              return { ...prev, benefits: list };
                                            });
                                          }}
                                          placeholder='Judul keuntungan...'
                                        />
                                      </div>

                                      <div className='mb-2'>
                                        <label className='hc-form-label'>Deskripsi</label>
                                        <TextArea
                                          rows={2}
                                          value={ben.description}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setUnifiedPayload((prev) => {
                                              const list = [...prev.benefits];
                                              list[idx] = { ...list[idx], description: val };
                                              return { ...prev, benefits: list };
                                            });
                                          }}
                                          placeholder='Penjelasan keuntungan...'
                                        />
                                      </div>

                                      <div>
                                        <label className='hc-form-label'>Warna Aksen Border</label>
                                        <Select
                                          value={ben.accent_color || 'brand-blue'}
                                          onChange={(val) => {
                                            setUnifiedPayload((prev) => {
                                              const list = [...prev.benefits];
                                              list[idx] = { ...list[idx], accent_color: val };
                                              return { ...prev, benefits: list };
                                            });
                                          }}
                                          style={{ width: '100%' }}
                                        >
                                          {ACCENT_OPTIONS.map((opt) => (
                                            <Select.Option key={opt.value} value={opt.value}>
                                              <span style={{ color: opt.color, fontWeight: 600 }}>●</span> {opt.label}
                                            </Select.Option>
                                          ))}
                                        </Select>
                                      </div>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          ),
                        },

                        // ----------------------------------------------
                        // SUBTAB 3: CATALOGS
                        // ----------------------------------------------
                        {
                          key: 'catalogs',
                          label: `🛠️ 3. Katalog Jasa (${unifiedPayload.catalogs.length})`,
                          children: (
                            <div>
                              <div className='d-flex justify-content-between align-items-center mb-3'>
                                <span className='text-muted fs-7'>
                                  Kategori jasa & material yang sering diorder customer untuk dikerjakan vendor.
                                </span>
                                <AntButton
                                  type='primary'
                                  icon={<PlusOutlined />}
                                  onClick={addCatalogItem}
                                  style={{ backgroundColor: '#183383', borderColor: '#183383' }}
                                >
                                  Tambah Kategori Katalog
                                </AntButton>
                              </div>

                              <Row gutter={[16, 16]}>
                                {unifiedPayload.catalogs.map((cat, idx) => (
                                  <Col xs={24} md={12} key={`cat-${idx}`}>
                                    <div className='hc-item-card h-100'>
                                      <div className='d-flex justify-content-between align-items-center mb-2'>
                                        <span className='fw-bold text-gray-800 fs-7'>
                                          Kategori #{idx + 1}: {cat.name}
                                        </span>
                                        <AntButton
                                          type='text'
                                          danger
                                          size='small'
                                          icon={<DeleteOutlined />}
                                          onClick={() => removeCatalogItem(idx)}
                                        />
                                      </div>

                                      <Row gutter={8}>
                                        <Col span={16}>
                                          <div className='mb-2'>
                                            <label className='hc-form-label'>Nama Kategori</label>
                                            <Input
                                              value={cat.name}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setUnifiedPayload((prev) => {
                                                  const list = [...prev.catalogs];
                                                  list[idx] = { ...list[idx], name: val };
                                                  return { ...prev, catalogs: list };
                                                });
                                              }}
                                              placeholder='Contoh: Cat & Dinding'
                                            />
                                          </div>
                                        </Col>
                                        <Col span={8}>
                                          <div className='mb-2'>
                                            <label className='hc-form-label'>Icon Emoji</label>
                                            <Input
                                              value={cat.icon_fallback || '💡'}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setUnifiedPayload((prev) => {
                                                  const list = [...prev.catalogs];
                                                  list[idx] = { ...list[idx], icon_fallback: val };
                                                  return { ...prev, catalogs: list };
                                                });
                                              }}
                                            />
                                          </div>
                                        </Col>
                                      </Row>

                                      <Row gutter={8}>
                                        <Col span={14}>
                                          <div className='mb-2'>
                                            <label className='hc-form-label'>Link URL Belanja Produk</label>
                                            <Input
                                              value={cat.link_url || ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setUnifiedPayload((prev) => {
                                                  const list = [...prev.catalogs];
                                                  list[idx] = { ...list[idx], link_url: val };
                                                  return { ...prev, catalogs: list };
                                                });
                                              }}
                                              placeholder='https://www.mitra10.com/...'
                                            />
                                          </div>
                                        </Col>
                                        <Col span={10}>
                                          <div className='mb-2'>
                                            <label className='hc-form-label'>Badge (Opsional)</label>
                                            <Input
                                              value={cat.badge_text || ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setUnifiedPayload((prev) => {
                                                  const list = [...prev.catalogs];
                                                  list[idx] = { ...list[idx], badge_text: val || null };
                                                  return { ...prev, catalogs: list };
                                                });
                                              }}
                                              placeholder='Populer / Promo'
                                            />
                                          </div>
                                        </Col>
                                      </Row>

                                      <div className='mt-2 pt-2 border-top'>
                                        <label className='hc-form-label mb-1'>Foto Ilustrasi Kategori</label>
                                        <div className='d-flex align-items-center gap-2'>
                                          {cat.image && (
                                            <img
                                              src={resolveImageUrl(cat.image) || ''}
                                              alt={cat.name}
                                              style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                          )}
                                          <Upload
                                            accept='image/jpeg,image/png,image/webp'
                                            showUploadList={false}
                                            beforeUpload={(f) => handleUploadCatalogImage(f, idx)}
                                          >
                                            <AntButton size='small' icon={<UploadOutlined />}>
                                              {cat.image ? 'Ganti Foto' : 'Unggah Foto'}
                                            </AntButton>
                                          </Upload>
                                          {cat.image && (
                                            <AntButton size='small' type='text' danger onClick={() => handleClearCatalogImage(idx)}>
                                              Hapus
                                            </AntButton>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          ),
                        },

                        // ----------------------------------------------
                        // SUBTAB 4: PROGRAMS (QUILL & SWITCHES)
                        // ----------------------------------------------
                        {
                          key: 'programs',
                          label: `📢 4. Program Promosi (${(unifiedPayload.programs || []).length})`,
                          children: (
                            <div>
                              <div className='d-flex justify-content-between align-items-center mb-3'>
                                <span className='text-muted fs-7'>
                                  Program promosi, insentif, atau aktivasi berjalan lengkap dengan artikel detail dan opsi pendaftaran.
                                </span>
                                <AntButton
                                  type='primary'
                                  icon={<PlusOutlined />}
                                  onClick={handleAddProgram}
                                  style={{ backgroundColor: '#183383', borderColor: '#183383' }}
                                >
                                  Tambah Program Baru
                                </AntButton>
                              </div>

                              {(unifiedPayload.programs || []).map((prog, idx) => (
                                <div key={`prog-${idx}`} className='hc-item-card mb-4'>
                                  <div className='d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom'>
                                    <div className='d-flex align-items-center gap-2'>
                                      <span className='badge badge-light-primary fw-bold'>
                                        Program #{idx + 1}
                                      </span>
                                      <span className='fw-bold text-gray-800 fs-6'>
                                        {prog.title || 'Judul Program'}
                                      </span>
                                    </div>
                                    <AntButton
                                      type='text'
                                      danger
                                      size='small'
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleRemoveProgram(idx)}
                                    >
                                      Hapus Program
                                    </AntButton>
                                  </div>

                                  <Row gutter={12} className='mb-3'>
                                    <Col xs={24} md={16}>
                                      <label className='hc-form-label'>Judul Program Promosi</label>
                                      <Input
                                        value={prog.title}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setUnifiedPayload((prev) => {
                                            const list = [...(prev.programs || [])];
                                            list[idx] = { ...list[idx], title: val };
                                            return { ...prev, programs: list };
                                          });
                                        }}
                                        placeholder='Contoh: Program Insentif Vendor Q1 2026'
                                        style={{ height: 38 }}
                                      />
                                    </Col>
                                    <Col xs={24} md={8}>
                                      <label className='hc-form-label'>Badge Label</label>
                                      <Input
                                        value={prog.badge_label || prog.badge || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setUnifiedPayload((prev) => {
                                            const list = [...(prev.programs || [])];
                                            list[idx] = { ...list[idx], badge_label: val, badge: val };
                                            return { ...prev, programs: list };
                                          });
                                        }}
                                        placeholder='Program Promosi / Event'
                                        style={{ height: 38 }}
                                      />
                                    </Col>
                                  </Row>

                                  {/* BANNER & CTA CARD SWITCHES */}
                                  <div className='card card-bordered p-3 mb-3 bg-lighten' style={{ borderRadius: 6 }}>
                                    <Row gutter={16} align='middle'>
                                      <Col xs={24} md={12}>
                                        <div className='d-flex align-items-center justify-content-between'>
                                          <div>
                                            <span className='hc-form-label mb-0'>🎴 Tombol di Card Beranda</span>
                                            <span className='hc-form-help'>Tampilkan tombol CTA langsung di kartu beranda vendor</span>
                                          </div>
                                          <Switch
                                            size='small'
                                            checked={prog.show_card_cta !== false}
                                            onChange={(checked) => {
                                              setUnifiedPayload((prev) => {
                                                const list = [...(prev.programs || [])];
                                                list[idx] = { ...list[idx], show_card_cta: checked };
                                                return { ...prev, programs: list };
                                              });
                                            }}
                                            style={{ background: prog.show_card_cta !== false ? '#183383' : undefined }}
                                          />
                                        </div>
                                      </Col>

                                      <Col xs={24} md={12}>
                                        <div className='d-flex align-items-center gap-3'>
                                          {(prog.image_url || prog.image) && (
                                            <img
                                              src={resolveImageUrl(prog.image_url || prog.image) || ''}
                                              alt={prog.title}
                                              style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                          )}
                                          <Upload
                                            accept='image/jpeg,image/png,image/webp'
                                            showUploadList={false}
                                            beforeUpload={(f) => handleUploadProgramImage(f, idx)}
                                          >
                                            <AntButton size='small' icon={<UploadOutlined />}>
                                              {prog.image_url || prog.image ? 'Ganti Banner' : 'Unggah Banner'}
                                            </AntButton>
                                          </Upload>
                                          {(prog.image_url || prog.image) && (
                                            <AntButton size='small' type='text' danger onClick={() => handleClearProgramImage(idx)}>
                                              Hapus
                                            </AntButton>
                                          )}
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>

                                  {/* EXTERNAL LINK / IKUTI PROGRAM SWITCH */}
                                  <div className='card card-bordered p-3 mb-3' style={{ border: '1px solid #CBD5E1', borderRadius: 6, background: '#F8FAFC' }}>
                                    <div className='d-flex align-items-center justify-content-between mb-2'>
                                      <div>
                                        <span className='hc-form-label mb-0 text-primary'>🔗 Tombol Ikuti Program (Tautan Eksternal)</span>
                                        <span className='hc-form-help'>Aktifkan jika program ini memiliki link pendaftaran atau microsite khusus</span>
                                      </div>
                                      <Switch
                                        size='small'
                                        checked={prog.has_external_link ?? Boolean(prog.link_url)}
                                        onChange={(checked) => {
                                          setUnifiedPayload((prev) => {
                                            const list = [...(prev.programs || [])];
                                            list[idx] = {
                                              ...list[idx],
                                              has_external_link: checked,
                                              external_cta_label: checked
                                                ? list[idx].external_cta_label || 'Ikuti Program'
                                                : list[idx].external_cta_label,
                                            };
                                            return { ...prev, programs: list };
                                          });
                                        }}
                                        checkedChildren='Aktif'
                                        unCheckedChildren='Nonaktif'
                                        style={{ background: (prog.has_external_link ?? Boolean(prog.link_url)) ? '#50cd89' : undefined }}
                                      />
                                    </div>

                                    {(prog.has_external_link ?? Boolean(prog.link_url)) && (
                                      <Row gutter={12} className='pt-2 border-top'>
                                        <Col xs={24} md={14}>
                                          <label className='hc-form-label'>URL Tautan Eksternal</label>
                                          <Input
                                            value={prog.link_url || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setUnifiedPayload((prev) => {
                                                const list = [...(prev.programs || [])];
                                                list[idx] = { ...list[idx], link_url: val };
                                                return { ...prev, programs: list };
                                              });
                                            }}
                                            placeholder='https://bit.ly/... atau https://www.mitra10.com'
                                            style={{ height: 36 }}
                                          />
                                        </Col>
                                        <Col xs={24} md={10}>
                                          <label className='hc-form-label'>Label Tombol di Artikel</label>
                                          <Input
                                            value={prog.external_cta_label || 'Ikuti Program'}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setUnifiedPayload((prev) => {
                                                const list = [...(prev.programs || [])];
                                                list[idx] = { ...list[idx], external_cta_label: val };
                                                return { ...prev, programs: list };
                                              });
                                            }}
                                            placeholder='Ikuti Program / Daftar Sekarang'
                                            style={{ height: 36 }}
                                          />
                                        </Col>
                                      </Row>
                                    )}
                                  </div>

                                  {/* QUILL RICH TEXT EDITOR */}
                                  <div>
                                    <div className='d-flex align-items-center justify-content-between mb-2'>
                                      <label className='hc-form-label mb-0'>✍️ Isi Lengkap Artikel Program (Quill Editor)</label>
                                      <span className='hc-form-help'>💡 Klik icon 🖼️ pada toolbar Quill untuk menyisipkan gambar langsung ke dalam artikel</span>
                                    </div>
                                    <ProgramQuillEditor
                                      value={prog.description || ''}
                                      onChange={(val) => {
                                        setUnifiedPayload((prev) => {
                                          const list = [...(prev.programs || [])];
                                          list[idx] = { ...list[idx], description: val };
                                          return { ...prev, programs: list };
                                        });
                                      }}
                                      placeholder='Tuliskan detail ketentuan program atau artikel lengkap di sini...'
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ),
                        },

                        // ----------------------------------------------
                        // SUBTAB 5: JOB RESULTS (PORTOFOLIO)
                        // ----------------------------------------------
                        {
                          key: 'job_results',
                          label: `📸 5. Hasil Pekerjaan (${(unifiedPayload.job_results || []).length})`,
                          children: (
                            <div>
                              <div className='d-flex justify-content-between align-items-center mb-3'>
                                <span className='text-muted fs-7'>
                                  Dokumentasi foto nyata Before - After atau video pekerjaan instalasi vendor.
                                </span>
                                <AntButton
                                  type='primary'
                                  icon={<PlusOutlined />}
                                  onClick={handleAddJobResult}
                                  style={{ backgroundColor: '#183383', borderColor: '#183383' }}
                                >
                                  Tambah Hasil Kerja
                                </AntButton>
                              </div>

                              {(unifiedPayload.job_results || []).map((job, idx) => (
                                <div key={`job-${idx}`} className='hc-item-card mb-3'>
                                  <div className='d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom'>
                                    <span className='fw-bold text-gray-800 fs-7'>
                                      Dokumentasi #{idx + 1}: {job.title || 'Judul Pekerjaan'}
                                    </span>
                                    <AntButton
                                      type='text'
                                      danger
                                      size='small'
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleRemoveJobResult(idx)}
                                    >
                                      Hapus
                                    </AntButton>
                                  </div>

                                  <Row gutter={12} className='mb-3'>
                                    <Col xs={24} md={12}>
                                      <label className='hc-form-label'>Judul Pekerjaan</label>
                                      <Input
                                        value={job.title || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setUnifiedPayload((prev) => {
                                            const list = [...(prev.job_results || [])];
                                            list[idx] = { ...list[idx], title: val };
                                            return { ...prev, job_results: list };
                                          });
                                        }}
                                        placeholder='Contoh: Pemasangan Granit 60x60 Ruang Utama'
                                      />
                                    </Col>
                                    <Col xs={24} md={12}>
                                      <label className='hc-form-label'>Tipe Media Dokumentasi</label>
                                      <Select
                                        value={job.media_type === 'video' ? 'video' : 'before_after'}
                                        onChange={(val: 'before_after' | 'video') => {
                                          setUnifiedPayload((prev) => {
                                            const list = [...(prev.job_results || [])];
                                            list[idx] = {
                                              ...list[idx],
                                              media_type: val,
                                              badge_label: val === 'video' ? 'Video Dokumentasi' : 'Before - After',
                                              tag: val === 'video' ? 'Video Dokumentasi' : 'Before - After',
                                            };
                                            return { ...prev, job_results: list };
                                          });
                                        }}
                                        style={{ width: '100%' }}
                                      >
                                        <Select.Option value='before_after'>🖼️ Foto Perbandingan (Before - After)</Select.Option>
                                        <Select.Option value='video'>🎥 Video Dokumentasi</Select.Option>
                                      </Select>
                                    </Col>
                                  </Row>

                                  <div className='mb-3'>
                                    <label className='hc-form-label'>Deskripsi Pekerjaan</label>
                                    <TextArea
                                      rows={2}
                                      value={job.description || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setUnifiedPayload((prev) => {
                                          const list = [...(prev.job_results || [])];
                                          list[idx] = { ...list[idx], description: val };
                                          return { ...prev, job_results: list };
                                        });
                                      }}
                                      placeholder='Keterangan pekerjaan instalasi...'
                                    />
                                  </div>

                                  {/* MEDIA INPUT: BEFORE-AFTER OR VIDEO */}
                                  {job.media_type === 'video' ? (
                                    <div className='card card-bordered p-3 bg-lighten'>
                                      <label className='hc-form-label'>Tautan Video (YouTube / Vimeo) atau File Video</label>
                                      <Input
                                        value={job.video_url || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setUnifiedPayload((prev) => {
                                            const list = [...(prev.job_results || [])];
                                            list[idx] = { ...list[idx], video_url: val };
                                            return { ...prev, job_results: list };
                                          });
                                        }}
                                        placeholder='https://www.youtube.com/watch?v=... atau https://vimeo.com/...'
                                        style={{ marginBottom: 8 }}
                                      />
                                      <div className='d-flex align-items-center gap-2 flex-wrap'>
                                        <Upload
                                          accept='video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv'
                                          showUploadList={false}
                                          beforeUpload={(f) => handleUploadJobResultVideo(f, idx)}
                                        >
                                          <AntButton size='small' icon={<UploadOutlined />}>
                                            Unggah File Video (MP4 / WebM / MOV)
                                          </AntButton>
                                        </Upload>
                                        {job.video_url && (
                                          <AntButton size='small' type='text' danger onClick={() => handleClearJobResultVideo(idx)}>
                                            Hapus Video
                                          </AntButton>
                                        )}
                                      </div>
                                      <div
                                        className='mt-3 p-3 rounded'
                                        style={{
                                          backgroundColor: '#FFFBEB',
                                          border: '1px dashed #F59E0B',
                                          fontSize: 12,
                                          color: '#92400E',
                                        }}
                                      >
                                        <div className='d-flex align-items-center gap-2 mb-2 fw-bold' style={{ color: '#B45309' }}>
                                          <FontAwesomeIcon icon={faInfoCircle} />
                                          Catatan &amp; Batasan Upload Video:
                                        </div>
                                        <ul className='m-0 ps-3' style={{ lineHeight: 1.6 }}>
                                          <li>
                                            <strong>Batas Ukuran &amp; Format:</strong> Maksimal <strong>30 MB</strong> (format yang didukung: <strong>MP4, WebM, MOV, MKV</strong>).
                                          </li>
                                          <li>
                                            <strong>Kompresi Otomatis:</strong> Video &gt; 2 MB otomatis dikompresi ke resolusi <strong>720p HD</strong> (bitrate 1.2 Mbps) sebelum dikirim ke server.
                                          </li>
                                          <li className='fw-bold' style={{ color: '#B45309' }}>
                                            ⚠️ Harap upload video sebelum atau sesudah jam operasional mitra10.
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  ) : (
                                    <Row gutter={16}>
                                      <Col xs={24} md={12}>
                                        <div className='card card-bordered p-3 bg-lighten'>
                                          <label className='hc-form-label text-danger'>📷 Foto Sebelum (Before)</label>
                                          <div className='d-flex align-items-center gap-3'>
                                            {(job.before_image || job.image_before_url) && (
                                              <img
                                                src={resolveImageUrl(job.before_image || job.image_before_url) || ''}
                                                alt='Before'
                                                style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 4 }}
                                              />
                                            )}
                                            <Upload
                                              accept='image/jpeg,image/png,image/webp'
                                              showUploadList={false}
                                              beforeUpload={(f) => handleUploadJobResultImage(f, idx, true)}
                                            >
                                              <AntButton size='small' icon={<UploadOutlined />}>
                                                {job.before_image || job.image_before_url ? 'Ganti Foto' : 'Unggah Foto'}
                                              </AntButton>
                                            </Upload>
                                            {(job.before_image || job.image_before_url) && (
                                              <AntButton size='small' type='text' danger onClick={() => handleClearJobResultImage(idx, true)}>
                                                Hapus
                                              </AntButton>
                                            )}
                                          </div>
                                        </div>
                                      </Col>

                                      <Col xs={24} md={12}>
                                        <div className='card card-bordered p-3 bg-lighten'>
                                          <label className='hc-form-label text-success'>✨ Foto Sesudah (After)</label>
                                          <div className='d-flex align-items-center gap-3'>
                                            {(job.image || job.image_after_url) && (
                                              <img
                                                src={resolveImageUrl(job.image || job.image_after_url) || ''}
                                                alt='After'
                                                style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 4 }}
                                              />
                                            )}
                                            <Upload
                                              accept='image/jpeg,image/png,image/webp'
                                              showUploadList={false}
                                              beforeUpload={(f) => handleUploadJobResultImage(f, idx, false)}
                                            >
                                              <AntButton size='small' icon={<UploadOutlined />}>
                                                {job.image || job.image_after_url ? 'Ganti Foto' : 'Unggah Foto'}
                                              </AntButton>
                                            </Upload>
                                            {(job.image || job.image_after_url) && (
                                              <AntButton size='small' type='text' danger onClick={() => handleClearJobResultImage(idx, false)}>
                                                Hapus
                                              </AntButton>
                                            )}
                                          </div>
                                        </div>
                                      </Col>
                                    </Row>
                                  )}
                                </div>
                              ))}
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },

              // ========================================================
              // TAB 2: LIVE PREVIEW VENDOR (DALAM SATU HALAMAN)
              // ========================================================
              {
                key: 'preview',
                label: (
                  <span className='d-flex align-items-center gap-2'>
                    <FontAwesomeIcon icon={faEye} />
                    2. Live Preview Vendor (Hasil Nyata)
                  </span>
                ),
                children: (
                  <div style={{ minHeight: 650 }}>
                    {/* PREVIEW TOOLBAR */}
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
                        Interactive Live Preview
                      </span>
                    </div>

                    {/* LIVE PREVIEW PANEL */}
                    <div className='border rounded p-3 bg-white'>
                      <LivePreviewPanel
                        sectionType={previewSectionMode}
                        unifiedPayload={unifiedPayload}
                        selectedProgramIndex={selectedProgramIndex}
                        onSelectProgramIndex={(idx) => setSelectedProgramIndex(idx)}
                        payload={
                          previewSectionMode === 'HERO'
                            ? unifiedPayload.hero
                            : previewSectionMode === 'BENEFIT'
                            ? unifiedPayload.benefits
                            : previewSectionMode === 'CATALOG'
                            ? unifiedPayload.catalogs
                            : previewSectionMode === 'PROGRAM' || previewSectionMode === 'ARTICLE'
                            ? unifiedPayload.programs
                            : previewSectionMode === 'JOB_RESULT'
                            ? unifiedPayload.job_results
                            : undefined
                        }
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />

          {/* BOTTOM ACTIONS */}
          <div className='d-flex justify-content-between align-items-center pt-4 mt-4 border-top'>
            <button
              type='button'
              className='btn btn-light'
              onClick={() => navigate('/home-content-settings')}
            >
              Kembali ke Daftar
            </button>
            <button
              type='button'
              className='btn btn-primary d-inline-flex align-items-center gap-2'
              style={{ backgroundColor: '#183383', borderColor: '#183383', minWidth: 160 }}
              disabled={saving}
              onClick={handleSavePackage}
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? 'Menyimpan...' : 'Simpan Paket Konten'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
