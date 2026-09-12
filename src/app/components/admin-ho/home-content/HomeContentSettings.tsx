import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  Space,
  Upload,
  Spin,
  message,
  Tag,
  Card,
  Switch,
  Alert,
  Tooltip,
  Radio,
  Row,
  Col,
  Tabs,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  ClearOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './HomeContentSettings.css';
import '../../../modules/pendaftar/ProgramDetailPage.css';
import {
  HomeContentItem,
  homeContentService,
  SyncVerificationResult,
  BenefitAccentColor,
  UnifiedHomePayload,
  ProgramPayload,
} from '../../../services/homeContentService';
import { LivePreviewPanel } from '../../home-content-shared/LivePreviewPanel';
import { resolveImageUrl } from '../../home-content-shared/imageHelper';
import { RenderInjectedContent } from '../../home-content-shared/ProgramSection';
import { ProgramQuillEditor } from './ProgramQuillEditor';

const { Option } = Select;
const { TextArea } = Input;

const BENEFIT_EMOJI_PRESETS = ['📦', '💰', '🧾', '🛡️', '⭐', '🎓', '🔧', '🏆', '💡', '🤝'];
const CATALOG_EMOJI_PRESETS = ['💡', '🧱', '🚿', '🎨', '🔒', '🏗️', '🧰', '🏠', '🔧', '🚪', '🚽', '🍳'];

const ACCENT_OPTIONS: Array<{ value: BenefitAccentColor; label: string; color: string }> = [
  { value: 'brand-blue', label: 'Brand Blue (#1E2A78)', color: '#1E2A78' },
  { value: 'brand-red', label: 'Brand Red (#E12429)', color: '#E12429' },
  { value: 'brand-yellow', label: 'Brand Yellow (#FBC02D)', color: '#FBC02D' },
];

const getEmbedVideoUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
};

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
      title: 'Program Promo Cuci AC',
      description: 'Dapatkan insentif ekstra dan cashback belanja perlengkapan untuk setiap order cuci & servis AC berkala melalui aplikasi.',
      badge: 'Promo Spesial',
      image: null,
      link_url: '',
    },
    {
      title: 'Program Free Pasangan Water Heater Heatsafe',
      description: 'Program kemitraan bundling instalasi unit pemanas air gratis bagi konsumen dengan komisi penuh untuk teknisi Mitra10.',
      badge: 'Program Berjalan',
      image: null,
      link_url: '',
    },
  ],
  job_results: [
    {
      title: 'Pemasangan Water Heater & Pipa Heatsafe',
      description: 'Instalasi water heater listrik kapasitas 30L beserta instalasi jalur pipa air panas berstandar SNI dan uji bebas bocor.',
      media_type: 'before_after',
      tag: 'Before - After',
      image: null,
      before_image: null,
      video_url: null,
    },
    {
      title: 'Dokumentasi Video Renovasi Kamar Mandi & Pemasangan Sanitair',
      description: 'Video tahapan instalasi kloset duduk dual-flush, shower box kaca tempered, dan keramik lantai anti-slip presisi.',
      media_type: 'video',
      tag: 'Video Dokumentasi',
      image: null,
      before_image: null,
      video_url: null,
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

const HomeContentSettings: React.FC = () => {
  const [items, setItems] = useState<HomeContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncVerificationResult | null>(null);
  const [syncDetailOpen, setSyncDetailOpen] = useState(false);

  // Unified Form Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HomeContentItem | null>(null);
  const [packageTitle, setPackageTitle] = useState('Paket Konten Home Mitra10');
  const [unifiedPayload, setUnifiedPayload] = useState<UnifiedHomePayload>(DEFAULT_UNIFIED_PAYLOAD);
  const [packageIsActive, setPackageIsActive] = useState(true);
  const [formActiveTab, setFormActiveTab] = useState<string>('hero');
  const [previewMode, setPreviewMode] = useState<'FULL' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'PROGRAM' | 'ARTICLE' | 'JOB_RESULT'>('FULL');
  const [selectedProgramIndex, setSelectedProgramIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Quick Preview modal
  const [quickPreviewOpen, setQuickPreviewOpen] = useState(false);
  const [previewPackage, setPreviewPackage] = useState<UnifiedHomePayload | null>(null);
  const [previewArticleModal, setPreviewArticleModal] = useState<Partial<ProgramPayload> | null>(null);

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

  const handleRunSyncCheck = async () => {
    setSyncLoading(true);
    try {
      const res = await homeContentService.checkSync();
      setSyncResult(res);
    } catch (err: any) {
      console.error('Error checking sync:', err);
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    handleRunSyncCheck();
  }, []);

  // Open Create Modal
  const openCreate = () => {
    setEditingRecord(null);
    setPackageTitle(`Paket Konten Home v${items.length + 1}`);
    setUnifiedPayload(JSON.parse(JSON.stringify(DEFAULT_UNIFIED_PAYLOAD)));
    setPackageIsActive(items.length === 0);
    setFormActiveTab('hero');
    setPreviewMode('FULL');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEdit = (record: HomeContentItem) => {
    setEditingRecord(record);
    setPackageTitle(record.title || 'Paket Konten Home Mitra10');
    const p = record.payload || {};
    const parsed: UnifiedHomePayload = {
      hero: p.hero || DEFAULT_UNIFIED_PAYLOAD.hero,
      benefits: Array.isArray(p.benefits) && p.benefits.length > 0 ? p.benefits : DEFAULT_UNIFIED_PAYLOAD.benefits,
      catalogs: Array.isArray(p.catalogs) && p.catalogs.length > 0 ? p.catalogs : DEFAULT_UNIFIED_PAYLOAD.catalogs,
      programs: Array.isArray(p.programs) && p.programs.length > 0 ? p.programs : DEFAULT_UNIFIED_PAYLOAD.programs,
      job_results: Array.isArray(p.job_results) && p.job_results.length > 0 ? p.job_results : DEFAULT_UNIFIED_PAYLOAD.job_results,
      support: p.support || DEFAULT_UNIFIED_PAYLOAD.support,
    };
    setUnifiedPayload(parsed);
    setPackageIsActive(Boolean(record.is_active));
    setFormActiveTab('hero');
    setPreviewMode('FULL');
    setModalOpen(true);
  };

  // Quick Full Page Preview Modal
  const openQuickPreview = (record: HomeContentItem) => {
    const p = record.payload || {};
    const parsed: UnifiedHomePayload = {
      hero: p.hero || DEFAULT_UNIFIED_PAYLOAD.hero,
      benefits: Array.isArray(p.benefits) ? p.benefits : DEFAULT_UNIFIED_PAYLOAD.benefits,
      catalogs: Array.isArray(p.catalogs) ? p.catalogs : DEFAULT_UNIFIED_PAYLOAD.catalogs,
      programs: Array.isArray(p.programs) ? p.programs : DEFAULT_UNIFIED_PAYLOAD.programs,
      job_results: Array.isArray(p.job_results) ? p.job_results : DEFAULT_UNIFIED_PAYLOAD.job_results,
      support: p.support || DEFAULT_UNIFIED_PAYLOAD.support,
    };
    setPreviewPackage(parsed);
    setQuickPreviewOpen(true);
  };

  // Upload image handlers with INSTANT local preview
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

  const handleUploadBenefitImage = async (file: File, index: number) => {
    const blobUrl = URL.createObjectURL(file);
    setUnifiedPayload((prev) => {
      const bens = [...prev.benefits];
      bens[index] = { ...bens[index], image: blobUrl };
      return { ...prev, benefits: bens };
    });

    try {
      const res = await homeContentService.uploadImage(file);
      setUnifiedPayload((prev) => {
        const bens = [...prev.benefits];
        bens[index] = { ...bens[index], image: res.image_url };
        return { ...prev, benefits: bens };
      });
      message.success(`Gambar keuntungan #${index + 1} berhasil diunggah.`);
    } catch (err: any) {
      message.error('Gagal mengunggah gambar keuntungan ke server.');
    }
    return false;
  };

  const handleClearBenefitImage = (index: number) => {
    setUnifiedPayload((prev) => {
      const bens = [...prev.benefits];
      bens[index] = { ...bens[index], image: null };
      return { ...prev, benefits: bens };
    });
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
      message.success(`Foto katalog #${index + 1} berhasil diunggah.`);
    } catch (err: any) {
      message.error('Gagal mengunggah foto katalog ke server.');
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

  // PROGRAM HANDLERS
  const handleAddProgram = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      programs: [
        ...(prev.programs || []),
        {
          title: `Program Baru #${(prev.programs?.length || 0) + 1}`,
          description: '',
          badge_label: 'Program Berjalan',
          badge: 'Program Berjalan',
          cta_label: 'Lihat Detail Program',
          external_cta_label: 'Ikuti Program',
          has_external_link: false,
          show_card_cta: true,
          image_url: null,
          image: null,
          link_url: '',
          order_index: (prev.programs?.length || 0) + 1,
          is_active: true,
        },
      ],
    }));
  };

  const handleDeleteProgram = (index: number) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.programs || [])];
      list.splice(index, 1);
      return { ...prev, programs: list };
    });
  };

  const handleUploadProgramImage = async (file: File, index: number) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error('Ukuran file maksimal 2MB.');
      return false;
    }

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
        list[index] = {
          ...list[index],
          image: res.image_url,
          image_url: res.image_url,
        };
        return { ...prev, programs: list };
      });
      message.success(`Gambar program #${index + 1} berhasil diunggah.`);
    } catch (err: any) {
      message.error('Gagal mengunggah gambar program ke server.');
    }
    return false;
  };

  const handleClearProgramImage = (index: number) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.programs || [])];
      list[index] = { ...list[index], image: null, image_url: null };
      return { ...prev, programs: list };
    });
  };

  // JOB RESULT HANDLERS
  const handleAddJobResult = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      job_results: [
        ...(prev.job_results || []),
        {
          title: `Hasil Pekerjaan #${(prev.job_results?.length || 0) + 1}`,
          description: '',
          media_type: 'before_after',
          badge_label: 'Before - After',
          tag: 'Before - After',
          image: null,
          image_after_url: null,
          before_image: null,
          image_before_url: null,
          video_url: null,
          order_index: (prev.job_results?.length || 0) + 1,
          is_active: true,
        },
      ],
    }));
  };

  const handleDeleteJobResult = (index: number) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])];
      list.splice(index, 1);
      return { ...prev, job_results: list };
    });
  };

  const handleUploadJobResultImage = async (file: File, index: number, isBefore = false) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error('Ukuran file maksimal 2MB.');
      return false;
    }

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
      message.success(`Foto ${isBefore ? 'Sebelum (Before)' : 'Sesudah/Utama (After)'} berhasil diunggah.`);
    } catch (err: any) {
      message.error('Gagal mengunggah foto ke server.');
    }
    return false;
  };

  const handleClearJobResultImage = (index: number, isBefore = false) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])];
      if (isBefore) {
        list[index] = { ...list[index], before_image: null, image_before_url: null };
      } else {
        list[index] = { ...list[index], image: null, image_after_url: null };
      }
      return { ...prev, job_results: list };
    });
  };

  const handleUploadJobResultVideo = async (file: File, index: number) => {
    if (file.size > 30 * 1024 * 1024) {
      message.error('Ukuran video maksimal 30MB.');
      return false;
    }

    const hide = message.loading('Mengunggah video dokumentasi (maks. 30MB)...', 0);
    try {
      const res = await homeContentService.uploadVideo(file);
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
      message.success('Video dokumentasi berhasil diunggah.');
    } catch (err: any) {
      hide();
      message.error('Gagal mengunggah video ke server.');
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

  // Save whole unified package
  const handleSavePackage = async () => {
    if (!packageTitle.trim()) {
      message.error('Nama paket wajib diisi.');
      return;
    }
    if (!unifiedPayload.hero.headline_main || !unifiedPayload.hero.headline_highlight) {
      message.error('Headline Hero wajib diisi.');
      return;
    }
    if (unifiedPayload.benefits.length === 0) {
      message.error('Minimal harus ada 1 Keuntungan Menjadi Vendor.');
      return;
    }
    if (unifiedPayload.catalogs.length === 0) {
      message.error('Minimal harus ada 1 Kategori Katalog Produk.');
      return;
    }

    setSaving(true);
    try {
      await homeContentService.saveUnified(
        unifiedPayload,
        packageTitle.trim(),
        editingRecord?.id,
        packageIsActive,
      );
      Swal.fire({
        title: 'Berhasil!',
        text: 'Paket Home Content berhasil disimpan secara utuh.',
        icon: 'success',
        confirmButtonColor: '#1E2A78',
      });
      setModalOpen(false);
      fetchItems();
      handleRunSyncCheck();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan paket home content';
      Swal.fire('Gagal Menyimpan', Array.isArray(msg) ? msg.join('<br/>') : String(msg), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Single Active Status
  const handleToggleActive = async (record: HomeContentItem) => {
    if (record.is_active) {
      message.warning('Minimal harus ada 1 paket Home Content yang aktif di sistem.');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Aktifkan Paket Ini?',
      text: `Mengaktifkan "${record.title || 'Paket'}" akan secara otomatis menonaktifkan paket lain yang sedang aktif di portal vendor.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Aktifkan Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#1E2A78',
    });
    if (!confirm.isConfirmed) return;

    try {
      await homeContentService.toggleActive(record.id, true);
      message.success(`Paket "${record.title}" sekarang aktif sebagai tampilan Home Vendor.`);
      fetchItems();
      handleRunSyncCheck();
    } catch (err: any) {
      message.error('Gagal mengaktifkan paket home content.');
    }
  };

  const handleDeletePackage = async (record: HomeContentItem) => {
    if (record.is_active) {
      message.error('Tidak dapat menghapus paket yang sedang aktif. Aktifkan paket lain terlebih dahulu.');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Hapus Paket Konten?',
      text: `Yakin hapus "${record.title}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });
    if (!confirm.isConfirmed) return;

    try {
      await homeContentService.remove(record.id);
      Swal.fire('Berhasil', 'Paket konten berhasil dihapus', 'success');
      fetchItems();
      handleRunSyncCheck();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menghapus paket';
      Swal.fire('Gagal', Array.isArray(msg) ? msg.join(', ') : String(msg), 'error');
    }
  };

  // Benefit item operations
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

  // Catalog item operations
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

  // Columns for Unified Packages Table
  const columns: ColumnsType<HomeContentItem> = [
    {
      title: 'Nama Paket Home Content',
      key: 'package_title',
      render: (_, r) => {
        const p = r.payload || {};
        return (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1E2A78' }}>
              {r.title || 'Paket Konten Home Mitra10'}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              Hero: &ldquo;{p.hero?.headline_main || 'Selamat bergabung sebagai'} <em>{p.hero?.headline_highlight || 'Mitra Instalasi'}</em>&rdquo;
            </div>
          </div>
        );
      },
    },
    {
      title: 'Komponen Konten',
      key: 'components',
      width: 280,
      render: (_, r) => {
        const p = r.payload || {};
        const bCount = Array.isArray(p.benefits) ? p.benefits.length : 6;
        const cCount = Array.isArray(p.catalogs) ? p.catalogs.length : 8;
        const progCount = Array.isArray(p.programs) ? p.programs.length : 0;
        const jobCount = Array.isArray(p.job_results) ? p.job_results.length : 0;
        return (
          <Space direction='vertical' size={2}>
            <Space wrap size={4}>
              <Tag color='blue'>🌟 Hero Section</Tag>
              <Tag color='green'>🎁 {bCount} Keuntungan</Tag>
              <Tag color='orange'>🛠️ {cCount} Katalog Jasa</Tag>
              {progCount > 0 && <Tag color='magenta'>📢 {progCount} Program</Tag>}
              {jobCount > 0 && <Tag color='cyan'>📸 {jobCount} Hasil Kerja</Tag>}
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Status Tampil',
      key: 'is_active',
      width: 170,
      align: 'center',
      render: (_, r) => {
        return (
          <Space direction='vertical' size={2} style={{ alignItems: 'center' }}>
            <Switch
              checked={r.is_active}
              onChange={() => handleToggleActive(r)}
              checkedChildren='AKTIF'
              unCheckedChildren='NONAKTIF'
              style={{ background: r.is_active ? '#00A651' : undefined }}
            />
            <span style={{ fontSize: 10, color: r.is_active ? '#00A651' : '#888', fontWeight: 600 }}>
              {r.is_active ? '● Sedang Digunakan' : 'Tidak Aktif'}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Terakhir Diperbarui',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 160,
      render: (val, r) => {
        const dt = val || r.created_at;
        return dt ? (
          <span style={{ fontSize: 12, color: '#555' }}>
            {new Date(dt).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 170,
      align: 'center',
      render: (_, r) => (
        <Space size='small'>
          <Tooltip title='Preview Tampilan Penuh'>
            <Button
              size='small'
              icon={<EyeOutlined />}
              onClick={() => openQuickPreview(r)}
            />
          </Tooltip>
          <Tooltip title='Edit Paket Ini'>
            <Button
              size='small'
              type='primary'
              icon={<EditOutlined />}
              onClick={() => openEdit(r)}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title={r.is_active ? 'Paket aktif tidak dapat dihapus' : 'Hapus Paket'}>
            <Button
              size='small'
              danger
              disabled={r.is_active}
              icon={<DeleteOutlined />}
              onClick={() => handleDeletePackage(r)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className='home-content-settings'>
      {/* HEADER SECTION */}
      <div className='hc-header'>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className='hc-title'>Kelola Konten Home Vendor</h1>
            <p className='hc-subtitle'>
              Konfigurasi satu kesatuan konten yang ditampilkan pada halaman awal pendaftar vendor (Hero, Keuntungan, dan Katalog Produk Mitra10). Sistem secara ketat memastikan <strong>hanya 1 paket konten yang aktif</strong> dalam satu waktu.
            </p>
          </div>
          <Space>
            <Button
              icon={<SyncOutlined spin={syncLoading} />}
              onClick={() => {
                handleRunSyncCheck();
                setSyncDetailOpen(true);
              }}
            >
              Cek Sinkronisasi
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={openCreate}
              style={{ background: '#1E2A78', borderColor: '#1E2A78' }}
            >
              Tambah Paket Konten Baru
            </Button>
          </Space>
        </div>
      </div>

      {error && <div className='hc-error-banner'>{error}</div>}

      {/* SINGLE ACTIVE ALERT BANNER */}
      <Alert
        message={
          <span>
            <strong>Aturan Konten Home:</strong> Konten dikelola sebagai <strong>satu kesatuan paket lengkap</strong>. Mengaktifkan satu paket otomatis menonaktifkan paket lain agar tampilan vendor selalu konsisten 100%.
          </span>
        }
        type='info'
        showIcon
        style={{ marginBottom: 16, borderRadius: 8 }}
      />

      {/* PACKAGES TABLE */}
      <Table
        className='hc-table'
        dataSource={items}
        columns={columns}
        rowKey='id'
        loading={loading}
        pagination={false}
      />

      {/* ======================================================== */}
      {/* MODAL EDIT / CREATE SATU KESATUAN HOME CONTENT           */}
      {/* ======================================================== */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎨</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1E2A78' }}>
                {editingRecord ? 'Edit Paket Home Content (Satu Kesatuan)' : 'Tambah Paket Home Content Baru'}
              </div>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 400 }}>
                Hero + 6 Keuntungan + 8 Katalog Jasa + Program Berjalan + Hasil Pekerjaan
              </div>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={1420}
        style={{ top: 16, maxWidth: '96vw' }}
        bodyStyle={{ padding: '16px 24px' }}
        footer={[
          <Button key='cancel' onClick={() => setModalOpen(false)}>
            Batal
          </Button>,
          <Button
            key='save'
            type='primary'
            loading={saving}
            onClick={handleSavePackage}
            style={{ background: '#1E2A78', borderColor: '#1E2A78', minWidth: 140 }}
          >
            Simpan Paket Konten
          </Button>,
        ]}
      >
        <Row gutter={24} style={{ minHeight: 720 }}>
          {/* KOLOM KIRI: FORM CONFIGURATION TABS (58%) */}
          <Col xs={24} lg={14} style={{ display: 'flex', flexDirection: 'column' }}>
            <Card
              size='small'
              style={{ marginBottom: 12, background: '#F8FAFC', borderColor: '#E2E8F0' }}
            >
              <Row gutter={12} align='middle'>
                <Col span={16}>
                  <label style={{ fontWeight: 600, fontSize: 12 }}>Nama / Versi Paket Konten</label>
                  <Input
                    value={packageTitle}
                    onChange={(e) => setPackageTitle(e.target.value)}
                    placeholder='Contoh: Paket Konten Q1 2026'
                    style={{ marginTop: 4 }}
                  />
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <label style={{ fontWeight: 600, fontSize: 12, display: 'block' }}>Status Paket</label>
                  <Switch
                    checked={packageIsActive}
                    onChange={(val) => setPackageIsActive(val)}
                    checkedChildren='Aktif'
                    unCheckedChildren='Nonaktif'
                    style={{ marginTop: 4, background: packageIsActive ? '#00A651' : undefined }}
                  />
                </Col>
              </Row>
            </Card>

            <Tabs
              activeKey={formActiveTab}
              onChange={(key) => {
                setFormActiveTab(key);
                if (previewMode !== 'FULL') {
                  const modeMap: Record<string, any> = {
                    hero: 'HERO',
                    benefits: 'BENEFIT',
                    catalogs: 'CATALOG',
                    programs: 'PROGRAM',
                    job_results: 'JOB_RESULT',
                  };
                  if (modeMap[key]) {
                    setPreviewMode(modeMap[key]);
                  }
                }
              }}
              items={[
                // ----------------------------------------------------
                // TAB 1: HERO SECTION
                // ----------------------------------------------------
                {
                  key: 'hero',
                  label: '🌟 1. Hero Section',
                  children: (
                    <div style={{ maxHeight: 650, overflowY: 'auto', paddingRight: 6 }}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Headline Teks Utama</label>
                        <Input
                          value={unifiedPayload.hero.headline_main}
                          onChange={(e) =>
                            setUnifiedPayload((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, headline_main: e.target.value },
                            }))
                          }
                          placeholder='Selamat bergabung sebagai'
                          style={{ marginTop: 4 }}
                        />
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Headline Highlight (Teks Miring)</label>
                        <Input
                          value={unifiedPayload.hero.headline_highlight}
                          onChange={(e) =>
                            setUnifiedPayload((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, headline_highlight: e.target.value },
                            }))
                          }
                          placeholder='Mitra Instalasi Mitra10'
                          style={{ marginTop: 4 }}
                        />
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontWeight: 600 }}>Deskripsi Paragraf</label>
                        <TextArea
                          rows={3}
                          value={unifiedPayload.hero.description}
                          onChange={(e) =>
                            setUnifiedPayload((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, description: e.target.value },
                            }))
                          }
                          placeholder='Penjelasan sambutan vendor...'
                          style={{ marginTop: 4 }}
                        />
                      </div>

                      <div style={{ background: '#F8F9FA', padding: 12, borderRadius: 8, border: '1px solid #E4E7EC' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                          Ilustrasi Gambar Hero (Opsional)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                          {unifiedPayload.hero.illustration_image ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={resolveImageUrl(unifiedPayload.hero.illustration_image) || ''}
                                alt='Preview'
                                style={{
                                  width: 80,
                                  height: 60,
                                  objectFit: 'contain',
                                  background: '#EEF1FF',
                                  borderRadius: 6,
                                  border: '1px solid #C7D2FE',
                                }}
                              />
                              <Button
                                size='small'
                                danger
                                icon={<ClearOutlined />}
                                onClick={handleClearHeroImage}
                              >
                                Hapus Gambar
                              </Button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#6B7280' }}>
                              Menggunakan ilustrasi SVG default Mitra10.
                            </span>
                          )}

                          <Upload
                            accept='image/jpeg,image/png,image/webp,image/gif'
                            showUploadList={false}
                            beforeUpload={handleUploadHeroImage}
                          >
                            <Button icon={<UploadOutlined />}>
                              {unifiedPayload.hero.illustration_image ? 'Ganti Gambar Hero' : 'Unggah Gambar Hero'}
                            </Button>
                          </Upload>
                        </div>
                      </div>
                    </div>
                  ),
                },

                // ----------------------------------------------------
                // TAB 2: KEUNTUNGAN VENDOR (BENEFITS)
                // ----------------------------------------------------
                {
                  key: 'benefit',
                  label: `🎁 2. Keuntungan (${unifiedPayload.benefits.length})`,
                  children: (
                    <div style={{ maxHeight: 650, overflowY: 'auto', paddingRight: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: '#666' }}>
                          Daftar poin keuntungan menjadi mitra instalasi Mitra10:
                        </span>
                        <Button
                          size='small'
                          type='dashed'
                          icon={<PlusOutlined />}
                          onClick={addBenefitItem}
                        >
                          Tambah Poin Keuntungan
                        </Button>
                      </div>

                      {unifiedPayload.benefits.map((b, idx) => (
                        <Card
                          key={idx}
                          size='small'
                          style={{ marginBottom: 12, borderColor: '#E5E7EB' }}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 16, display: 'inline-flex', alignItems: 'center' }}>
                                {b.image ? (
                                  <img
                                    src={resolveImageUrl(b.image) || ''}
                                    alt=''
                                    style={{
                                      width: 22,
                                      height: 22,
                                      objectFit: 'contain',
                                      borderRadius: 4,
                                      border: '1px solid #C7D2FE',
                                      padding: 2,
                                      background: '#fff',
                                    }}
                                  />
                                ) : (
                                  b.icon
                                )}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>Keuntungan #{idx + 1}</span>
                            </div>
                          }
                          extra={
                            <Popconfirm
                              title='Hapus poin keuntungan ini?'
                              onConfirm={() => removeBenefitItem(idx)}
                              okText='Hapus'
                              cancelText='Batal'
                            >
                              <Button size='small' type='text' danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          }
                        >
                          <Row gutter={8} style={{ marginBottom: 8 }}>
                            <Col span={8}>
                              <label style={{ fontSize: 11, fontWeight: 600 }}>Ikon Emoji</label>
                              <Space.Compact style={{ width: '100%', marginTop: 2 }}>
                                <Input
                                  value={b.icon}
                                  maxLength={4}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setUnifiedPayload((prev) => {
                                      const arr = [...prev.benefits];
                                      arr[idx] = { ...arr[idx], icon: val };
                                      return { ...prev, benefits: arr };
                                    });
                                  }}
                                  style={{ width: 50, textAlign: 'center' }}
                                />
                                <Select
                                  value={b.icon}
                                  style={{ width: 'calc(100% - 50px)' }}
                                  onChange={(val) => {
                                    setUnifiedPayload((prev) => {
                                      const arr = [...prev.benefits];
                                      arr[idx] = { ...arr[idx], icon: val };
                                      return { ...prev, benefits: arr };
                                    });
                                  }}
                                >
                                  {BENEFIT_EMOJI_PRESETS.map((em) => (
                                    <Option key={em} value={em}>
                                      {em}
                                    </Option>
                                  ))}
                                </Select>
                              </Space.Compact>
                            </Col>

                            <Col span={10}>
                              <label style={{ fontSize: 11, fontWeight: 600 }}>Judul</label>
                              <Input
                                value={b.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setUnifiedPayload((prev) => {
                                    const arr = [...prev.benefits];
                                    arr[idx] = { ...arr[idx], title: val };
                                    return { ...prev, benefits: arr };
                                  });
                                }}
                                style={{ marginTop: 2 }}
                              />
                            </Col>

                            <Col span={6}>
                              <label style={{ fontSize: 11, fontWeight: 600 }}>Aksen Garis</label>
                              <Select
                                value={b.accent_color}
                                onChange={(val) => {
                                  setUnifiedPayload((prev) => {
                                    const arr = [...prev.benefits];
                                    arr[idx] = { ...arr[idx], accent_color: val };
                                    return { ...prev, benefits: arr };
                                  });
                                }}
                                style={{ width: '100%', marginTop: 2 }}
                              >
                                {ACCENT_OPTIONS.map((opt) => (
                                  <Option key={opt.value} value={opt.value}>
                                    <span style={{ color: opt.color, fontWeight: 700 }}>● </span>
                                    {opt.value.replace('brand-', '')}
                                  </Option>
                                ))}
                              </Select>
                            </Col>
                          </Row>

                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600 }}>Deskripsi</label>
                            <TextArea
                              rows={2}
                              value={b.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUnifiedPayload((prev) => {
                                  const arr = [...prev.benefits];
                                  arr[idx] = { ...arr[idx], description: val };
                                  return { ...prev, benefits: arr };
                                });
                              }}
                              style={{ marginTop: 2 }}
                            />
                          </div>

                          <div
                            style={{
                              background: '#F9FAFB',
                              padding: 10,
                              borderRadius: 6,
                              border: '1px solid #EEF2F6',
                              marginTop: 10,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 6,
                                flexWrap: 'wrap',
                                gap: 6,
                              }}
                            >
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                                Gambar / Ikon Keuntungan (Opsional)
                              </label>
                              <span style={{ fontSize: 11, color: '#B45309', fontWeight: 500 }}>
                                💡 Disarankan mengupload gambar berupa icon
                              </span>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {b.image ? (
                                  <>
                                    <img
                                      src={resolveImageUrl(b.image) || ''}
                                      alt={b.title}
                                      style={{
                                        width: 38,
                                        height: 38,
                                        objectFit: 'contain',
                                        borderRadius: 6,
                                        border: '1px solid #D1D5DB',
                                        background: '#fff',
                                        padding: 4,
                                      }}
                                    />
                                    <Button
                                      size='small'
                                      danger
                                      icon={<ClearOutlined />}
                                      onClick={() => handleClearBenefitImage(idx)}
                                    >
                                      Hapus Gambar
                                    </Button>
                                  </>
                                ) : (
                                  <span style={{ fontSize: 11, color: '#6B7280' }}>
                                    Belum ada gambar (menggunakan ikon emoji: {b.icon}).
                                  </span>
                                )}
                              </div>

                              <Upload
                                accept='image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
                                showUploadList={false}
                                beforeUpload={(file) => handleUploadBenefitImage(file, idx)}
                              >
                                <Button size='small' icon={<UploadOutlined />}>
                                  {b.image ? 'Ganti Gambar' : 'Unggah Gambar'}
                                </Button>
                              </Upload>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ),
                },

                // ----------------------------------------------------
                // TAB 3: KATALOG JASA (CATALOGS)
                // ----------------------------------------------------
                {
                  key: 'catalog',
                  label: `🛠️ 3. Katalog Jasa (${unifiedPayload.catalogs.length})`,
                  children: (
                    <div style={{ maxHeight: 650, overflowY: 'auto', paddingRight: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: '#666' }}>
                          Kategori material &amp; jasa instalasi Mitra10:
                        </span>
                        <Button
                          size='small'
                          type='dashed'
                          icon={<PlusOutlined />}
                          onClick={addCatalogItem}
                        >
                          Tambah Kategori Katalog
                        </Button>
                      </div>

                      {unifiedPayload.catalogs.map((c, idx) => (
                        <Card
                          key={idx}
                          size='small'
                          style={{ marginBottom: 12, borderColor: '#E5E7EB' }}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14 }}>{c.icon_fallback || '💡'}</span>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>
                                #{idx + 1} {c.name || 'Kategori'}
                              </span>
                              {c.badge_text && <Tag color='red'>{c.badge_text}</Tag>}
                            </div>
                          }
                          extra={
                            <Popconfirm
                              title='Hapus kategori katalog ini?'
                              onConfirm={() => removeCatalogItem(idx)}
                              okText='Hapus'
                              cancelText='Batal'
                            >
                              <Button size='small' type='text' danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          }
                        >
                          <Row gutter={8} style={{ marginBottom: 8 }}>
                            <Col span={12}>
                              <label style={{ fontSize: 11, fontWeight: 600 }}>Nama Kategori</label>
                              <Input
                                value={c.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setUnifiedPayload((prev) => {
                                    const arr = [...prev.catalogs];
                                    arr[idx] = { ...arr[idx], name: val };
                                    return { ...prev, catalogs: arr };
                                  });
                                }}
                                style={{ marginTop: 2 }}
                              />
                            </Col>
                            <Col span={7}>
                              <label style={{ fontSize: 11, fontWeight: 600 }}>Badge (Opsional)</label>
                              <Input
                                value={c.badge_text || ''}
                                placeholder='Contoh: Populer'
                                onChange={(e) => {
                                  const val = e.target.value || null;
                                  setUnifiedPayload((prev) => {
                                    const arr = [...prev.catalogs];
                                    arr[idx] = { ...arr[idx], badge_text: val };
                                    return { ...prev, catalogs: arr };
                                  });
                                }}
                                style={{ marginTop: 2 }}
                              />
                            </Col>
                            <Col span={5}>
                              <label style={{ fontSize: 11, fontWeight: 600 }}>Ikon Fallback</label>
                              <Select
                                value={c.icon_fallback || '💡'}
                                onChange={(val) => {
                                  setUnifiedPayload((prev) => {
                                    const arr = [...prev.catalogs];
                                    arr[idx] = { ...arr[idx], icon_fallback: val };
                                    return { ...prev, catalogs: arr };
                                  });
                                }}
                                style={{ width: '100%', marginTop: 2 }}
                              >
                                {CATALOG_EMOJI_PRESETS.map((em) => (
                                  <Option key={em} value={em}>
                                    {em}
                                  </Option>
                                ))}
                              </Select>
                            </Col>
                          </Row>

                          <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 11, fontWeight: 600 }}>Link URL Mitra10</label>
                            <Input
                              value={c.link_url}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUnifiedPayload((prev) => {
                                  const arr = [...prev.catalogs];
                                  arr[idx] = { ...arr[idx], link_url: val };
                                  return { ...prev, catalogs: arr };
                                });
                              }}
                              style={{ marginTop: 2 }}
                            />
                          </div>

                          <div
                            style={{
                              background: '#F9FAFB',
                              padding: 8,
                              borderRadius: 6,
                              border: '1px solid #EEF2F6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {c.image ? (
                                <>
                                  <img
                                    src={resolveImageUrl(c.image) || ''}
                                    alt={c.name}
                                    style={{
                                      width: 44,
                                      height: 44,
                                      objectFit: 'cover',
                                      borderRadius: 4,
                                      border: '1px solid #D1D5DB',
                                    }}
                                  />
                                  <Button
                                    size='small'
                                    danger
                                    icon={<ClearOutlined />}
                                    onClick={() => handleClearCatalogImage(idx)}
                                  >
                                    Hapus Foto
                                  </Button>
                                </>
                              ) : (
                                <span style={{ fontSize: 11, color: '#6B7280' }}>
                                  Belum ada foto (menggunakan gradient &amp; ikon fallback).
                                </span>
                              )}
                            </div>

                            <Upload
                              accept='image/jpeg,image/png,image/webp,image/gif'
                              showUploadList={false}
                              beforeUpload={(file) => handleUploadCatalogImage(file, idx)}
                            >
                              <Button size='small' icon={<UploadOutlined />}>
                                {c.image ? 'Ganti Foto' : 'Unggah Foto'}
                              </Button>
                            </Upload>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ),
                },

                // ----------------------------------------------------
                // TAB 4: PROGRAM BERJALAN
                // ----------------------------------------------------
                {
                  key: 'programs',
                  label: `📢 4. Program Berjalan (${(unifiedPayload.programs || []).length})`,
                  children: (
                    <div style={{ maxHeight: 650, overflowY: 'auto', paddingRight: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <Alert
                          message='Program Berjalan (Promo & Aktivasi)'
                          description='Admin HO & Super User dapat mengunggah gambar banner promo dan menuliskan judul serta konten artikel lengkap menggunakan rich text editor Quill (lengkap dengan sisipan gambar di dalam teks).'
                          type='info'
                          showIcon
                          style={{ flex: 1, minWidth: 260 }}
                        />
                        <Space>
                          <Button
                            icon={<EyeOutlined />}
                            type={previewMode === 'ARTICLE' ? 'primary' : 'default'}
                            onClick={() => setPreviewMode('ARTICLE')}
                            style={previewMode !== 'ARTICLE' ? { borderColor: '#1E2A78', color: '#1E2A78' } : {}}
                          >
                            Preview Artikel
                          </Button>
                          <Button
                            type='primary'
                            icon={<PlusOutlined />}
                            onClick={handleAddProgram}
                            style={{ background: '#1E2A78', borderColor: '#1E2A78' }}
                          >
                            Tambah Program
                          </Button>
                        </Space>
                      </div>

                      {(unifiedPayload.programs || []).map((prog, idx) => (
                        <Card
                          key={`prog-edit-${idx}`}
                          size='small'
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, color: '#1E2A78' }}>
                                Program #{idx + 1}
                              </span>
                              <Input
                                size='small'
                                value={prog.badge || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setUnifiedPayload((prev) => {
                                    const list = [...(prev.programs || [])];
                                    list[idx] = { ...list[idx], badge: val };
                                    return { ...prev, programs: list };
                                  });
                                }}
                                placeholder='Badge (e.g. Promo Spesial)'
                                style={{ width: 170 }}
                              />
                            </div>
                          }
                          extra={
                            <Space size='small'>
                              <Button
                                size='small'
                                type={previewMode === 'ARTICLE' && selectedProgramIndex === idx ? 'primary' : 'default'}
                                icon={<EyeOutlined />}
                                onClick={() => {
                                  setSelectedProgramIndex(idx);
                                  setPreviewMode('ARTICLE');
                                }}
                                style={{ fontSize: 11.5 }}
                              >
                                Preview Artikel
                              </Button>
                              <Button
                                size='small'
                                icon={<FullscreenOutlined />}
                                onClick={() => setPreviewArticleModal(prog)}
                                title='Buka Modal Preview Layar Penuh'
                                style={{ fontSize: 11.5 }}
                              >
                                Layar Penuh
                              </Button>
                              <Popconfirm
                                title='Hapus program ini?'
                                onConfirm={() => handleDeleteProgram(idx)}
                                okText='Hapus'
                                cancelText='Batal'
                              >
                                <Button size='small' danger icon={<DeleteOutlined />}>
                                  Hapus
                                </Button>
                              </Popconfirm>
                            </Space>
                          }
                          style={{
                            marginBottom: 16,
                            border: previewMode === 'ARTICLE' && selectedProgramIndex === idx ? '2px solid #1E2A78' : '1px solid #E4E7EC',
                            boxShadow: previewMode === 'ARTICLE' && selectedProgramIndex === idx ? '0 2px 8px rgba(30, 42, 120, 0.12)' : 'none',
                          }}
                        >
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontWeight: 600, fontSize: 12.5 }}>Judul Program / Artikel (Tampil di Card &amp; Header)</label>
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
                              placeholder='Contoh: Program Promo Cuci AC, Program Free Pasangan Water Heater Heatsafe'
                              style={{ marginTop: 4, fontWeight: 500 }}
                            />
                          </div>

                          <Row gutter={16} style={{ marginBottom: 14 }}>
                            <Col span={12}>
                              <label style={{ fontWeight: 600, fontSize: 12 }}>Banner Utama / Featured (Card &amp; Header)</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                <div
                                  style={{
                                    width: 80,
                                    height: 56,
                                    borderRadius: 6,
                                    border: '1px solid #D9D9D9',
                                    background: '#FAFAFA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                  }}
                                >
                                  {prog.image ? (
                                    <img
                                      src={resolveImageUrl(prog.image) || ''}
                                      alt={prog.title}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <span style={{ fontSize: 22 }}>📢</span>
                                  )}
                                </div>
                                <div>
                                  <Upload
                                    accept='image/jpeg,image/png,image/webp,image/gif'
                                    showUploadList={false}
                                    beforeUpload={(file) => handleUploadProgramImage(file, idx)}
                                  >
                                    <Button size='small' icon={<UploadOutlined />}>
                                      {prog.image ? 'Ganti Banner' : 'Unggah Banner'}
                                    </Button>
                                  </Upload>
                                  {prog.image && (
                                    <Button
                                      size='small'
                                      type='link'
                                      danger
                                      onClick={() => handleClearProgramImage(idx)}
                                      style={{ padding: '2px 0 0', display: 'block', fontSize: 11 }}
                                    >
                                      Hapus
                                    </Button>
                                  )}
                                  <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                                    JPG, PNG, WEBP (Maks 10MB)
                                  </div>
                                </div>
                              </div>
                            </Col>

                            <Col span={12}>
                              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <span style={{ fontWeight: 600, fontSize: 12, color: '#1E2A78' }}>
                                    🎴 Tombol di Card Beranda
                                  </span>
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
                                    checkedChildren='Aktif'
                                    unCheckedChildren='Mati'
                                    style={{ background: prog.show_card_cta !== false ? '#1E2A78' : undefined }}
                                  />
                                </div>
                                {prog.show_card_cta !== false ? (
                                  <Input
                                    size='small'
                                    value={prog.cta_label || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setUnifiedPayload((prev) => {
                                        const list = [...(prev.programs || [])];
                                        list[idx] = { ...list[idx], cta_label: val };
                                        return { ...prev, programs: list };
                                      });
                                    }}
                                    placeholder='Default: Lihat Detail Program →'
                                  />
                                ) : (
                                  <div style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
                                    Card hanya menampilkan banner, badge &amp; judul bold
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>

                          {/* OPSI TOMBOL PROGRAM EKSTERNAL / IKUTI PROGRAM */}
                          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: (prog.has_external_link ?? Boolean(prog.link_url)) ? 8 : 0 }}>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: 12.5, color: '#1E2A78' }}>
                                  🔗 Tombol Ikuti Program (Tautan Eksternal)
                                </span>
                                <span style={{ fontSize: 11, color: '#64748B', marginLeft: 8 }}>
                                  (Opsional - aktifkan jika memiliki link pendaftaran / website luar)
                                </span>
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
                                      external_cta_label: checked ? (list[idx].external_cta_label || 'Ikuti Program') : list[idx].external_cta_label,
                                    };
                                    return { ...prev, programs: list };
                                  });
                                }}
                                checkedChildren='Aktif'
                                unCheckedChildren='Nonaktif'
                                style={{ background: (prog.has_external_link ?? Boolean(prog.link_url)) ? '#00A651' : undefined }}
                              />
                            </div>

                            {(prog.has_external_link ?? Boolean(prog.link_url)) && (
                              <Row gutter={12} style={{ paddingTop: 8, borderTop: '1px dashed #CBD5E1' }}>
                                <Col span={14}>
                                  <label style={{ fontWeight: 600, fontSize: 11.5 }}>Link URL Program Eksternal</label>
                                  <Input
                                    size='small'
                                    value={prog.link_url || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setUnifiedPayload((prev) => {
                                        const list = [...(prev.programs || [])];
                                        list[idx] = { ...list[idx], link_url: val };
                                        return { ...prev, programs: list };
                                      });
                                    }}
                                    placeholder='https://bit.ly/promo-vendor atau https://www.mitra10.com'
                                    style={{ marginTop: 3 }}
                                  />
                                </Col>
                                <Col span={10}>
                                  <label style={{ fontWeight: 600, fontSize: 11.5 }}>Label Tombol di Artikel</label>
                                  <Input
                                    size='small'
                                    value={prog.external_cta_label || 'Ikuti Program'}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setUnifiedPayload((prev) => {
                                        const list = [...(prev.programs || [])];
                                        list[idx] = { ...list[idx], external_cta_label: val };
                                        return { ...prev, programs: list };
                                      });
                                    }}
                                    placeholder='Contoh: Ikuti Program / Daftar Sekarang'
                                    style={{ marginTop: 3 }}
                                  />
                                </Col>
                              </Row>
                            )}
                          </div>

                          <div style={{ marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <label style={{ fontWeight: 600, fontSize: 12.5, color: '#1E2A78' }}>
                                ✍️ Konten Lengkap Artikel (Quill Rich Text &amp; Sisipkan Gambar)
                              </label>
                              <span style={{ fontSize: 11, color: '#64748B' }}>
                                💡 Klik ikon gambar 🖼️ di toolbar Quill untuk mengunggah &amp; menyisipkan foto ke dalam teks
                              </span>
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
                              placeholder='Tuliskan isi artikel lengkap di sini. Gunakan toolbar untuk styling teks dan menyisipkan gambar langsung...'
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ),
                },

                // ----------------------------------------------------
                // TAB 5: HASIL PEKERJAAN (Before-After / Portofolio)
                // ----------------------------------------------------
                {
                  key: 'job_results',
                  label: `📸 5. Hasil Pekerjaan (${(unifiedPayload.job_results || []).length})`,
                  children: (
                    <div style={{ maxHeight: 650, overflowY: 'auto', paddingRight: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Alert
                          message='Dokumentasi & Hasil Pekerjaan Mitra'
                          description='Admin HO & Super User dapat mengunggah foto sebelum & sesudah (Before-After) atau foto hasil kerja nyata beserta judul dan deskripsi pekerjaan.'
                          type='info'
                          showIcon
                          style={{ flex: 1, marginRight: 12 }}
                        />
                        <Button
                          type='primary'
                          icon={<PlusOutlined />}
                          onClick={handleAddJobResult}
                          style={{ background: '#1E2A78', borderColor: '#1E2A78' }}
                        >
                          Tambah Hasil Kerja
                        </Button>
                      </div>

                      {(unifiedPayload.job_results || []).map((job, idx) => (
                        <Card
                          key={`job-edit-${idx}`}
                          size='small'
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, color: '#1E2A78' }}>
                                Hasil Pekerjaan #{idx + 1}
                              </span>
                              <Input
                                size='small'
                                value={job.tag || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setUnifiedPayload((prev) => {
                                    const list = [...(prev.job_results || [])];
                                    list[idx] = { ...list[idx], tag: val };
                                    return { ...prev, job_results: list };
                                  });
                                }}
                                placeholder='Label Tag (e.g. Before - After)'
                                style={{ width: 170 }}
                              />
                            </div>
                          }
                          extra={
                            <Popconfirm
                              title='Hapus item ini?'
                              onConfirm={() => handleDeleteJobResult(idx)}
                              okText='Hapus'
                              cancelText='Batal'
                            >
                              <Button size='small' danger icon={<DeleteOutlined />}>
                                Hapus
                              </Button>
                            </Popconfirm>
                          }
                          style={{ marginBottom: 12, border: '1px solid #E4E7EC' }}
                        >
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ fontWeight: 600, fontSize: 12 }}>Judul Pekerjaan (Free Text)</label>
                            <Input
                              value={job.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUnifiedPayload((prev) => {
                                  const list = [...(prev.job_results || [])];
                                  list[idx] = { ...list[idx], title: val };
                                  return { ...prev, job_results: list };
                                });
                              }}
                              placeholder='Contoh: Pemasangan Water Heater Heatsafe & Jalur Pipa SNI, Renovasi Kamar Mandi'
                              style={{ marginTop: 4 }}
                            />
                          </div>

                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontWeight: 600, fontSize: 12 }}>Deskripsi & Rincian Pekerjaan (Free Text)</label>
                            <TextArea
                              rows={3}
                              value={job.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUnifiedPayload((prev) => {
                                  const list = [...(prev.job_results || [])];
                                  list[idx] = { ...list[idx], description: val };
                                  return { ...prev, job_results: list };
                                });
                              }}
                              placeholder='Tuliskan rincian hasil pengerjaan, spesifikasi teknis, kepuasan pelanggan, dll...'
                              style={{ marginTop: 4 }}
                            />
                          </div>

                          <div style={{ marginBottom: 14, background: '#F0F4FF', padding: '10px 14px', borderRadius: 8, border: '1px solid #D6E4FF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 12.5, color: '#1E2A78', display: 'block' }}>
                                  Pilih Tipe Portofolio:
                                </span>
                                <span style={{ fontSize: 11, color: '#555' }}>
                                  Pilih antara format perbandingan 2 foto (Before - After) atau Video dokumentasi pekerjaan.
                                </span>
                              </div>
                              <Radio.Group
                                value={job.media_type || (job.video_url ? 'video' : 'before_after')}
                                onChange={(e) => {
                                  const selectedType = e.target.value;
                                  setUnifiedPayload((prev) => {
                                    const list = [...(prev.job_results || [])];
                                    const isVid = selectedType === 'video';
                                    list[idx] = {
                                      ...list[idx],
                                      media_type: selectedType,
                                      tag: isVid ? 'Video Dokumentasi' : 'Before - After',
                                      badge_label: isVid ? 'Video Dokumentasi' : 'Before - After',
                                    };
                                    return { ...prev, job_results: list };
                                  });
                                }}
                                buttonStyle='solid'
                                size='small'
                              >
                                <Radio.Button value='before_after'>📸 Tipe 1: 2 Gambar (Before - After)</Radio.Button>
                                <Radio.Button value='video'>🎥 Tipe 2: Video Dokumentasi</Radio.Button>
                              </Radio.Group>
                            </div>
                          </div>

                          {(job.media_type === 'video' || (!job.media_type && job.video_url)) ? (
                            /* TIPE 2: VIDEO DOKUMENTASI */
                            <div style={{ background: '#F8F9FA', padding: 12, borderRadius: 8, border: '1px solid #E4E7EC' }}>
                              <Row gutter={16} align='middle'>
                                <Col xs={24} md={10}>
                                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#1E2A78' }}>
                                    🎥 Video Dokumentasi (Maks. 30MB)
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <Upload
                                      accept='video/mp4,video/webm,video/quicktime'
                                      showUploadList={false}
                                      beforeUpload={(file) => handleUploadJobResultVideo(file, idx)}
                                    >
                                      <Button size='small' icon={<UploadOutlined />} style={{ borderColor: '#1E2A78', color: '#1E2A78' }}>
                                        {job.video_url ? 'Ganti File Video' : 'Unggah File Video (MP4/WebM)'}
                                      </Button>
                                    </Upload>
                                    {job.video_url && (
                                      <Button
                                        size='small'
                                        type='link'
                                        danger
                                        onClick={() => handleClearJobResultVideo(idx)}
                                        style={{ padding: 0 }}
                                      >
                                        Hapus Video
                                      </Button>
                                    )}
                                  </div>
                                  <div style={{ marginBottom: 6 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>
                                      Atau Masukkan URL Video (YouTube / Direct MP4):
                                    </label>
                                    <Input
                                      size='small'
                                      value={job.video_url || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setUnifiedPayload((prev) => {
                                          const list = [...(prev.job_results || [])];
                                          list[idx] = {
                                            ...list[idx],
                                            video_url: val || null,
                                            media_type: 'video',
                                          };
                                          return { ...prev, job_results: list };
                                        });
                                      }}
                                      placeholder='https://www.youtube.com/watch?v=... atau link video'
                                      style={{ marginTop: 2 }}
                                    />
                                  </div>
                                  <div style={{ fontSize: 10.5, color: '#888' }}>
                                    Format: MP4, WebM, MOV. File disimpan di server internal atau via tautan embed.
                                  </div>
                                </Col>
                                <Col xs={24} md={14}>
                                  <div
                                    style={{
                                      height: 150,
                                      borderRadius: 6,
                                      overflow: 'hidden',
                                      background: '#000',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '1px solid #D9D9D9',
                                    }}
                                  >
                                    {job.video_url ? (
                                      getEmbedVideoUrl(job.video_url) ? (
                                        <iframe
                                          src={getEmbedVideoUrl(job.video_url)!}
                                          title={job.title || 'Preview Video'}
                                          style={{ width: '100%', height: '100%', border: 'none' }}
                                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                        />
                                      ) : (
                                        <video
                                          src={resolveImageUrl(job.video_url) || ''}
                                          controls
                                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                      )
                                    ) : (
                                      <div style={{ textAlign: 'center', color: '#999' }}>
                                        <span style={{ fontSize: 24, display: 'block' }}>🎥</span>
                                        <span style={{ fontSize: 11 }}>Belum ada video dipilih / diunggah</span>
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          ) : (
                            /* TIPE 1: 2 GAMBAR BEFORE - AFTER */
                            <Row gutter={12}>
                              <Col span={12}>
                                <div style={{ background: '#F8F9FA', padding: 10, borderRadius: 8, border: '1px solid #E4E7EC' }}>
                                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#1E2A78' }}>
                                    📸 1. Foto Sebelum (Before) <span style={{ color: '#E12429' }}>*</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div
                                      style={{
                                        width: 76,
                                        height: 52,
                                        borderRadius: 6,
                                        border: '1px solid #D9D9D9',
                                        background: '#FFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {(job.before_image || job.image_before_url) ? (
                                        <img
                                          src={resolveImageUrl(job.before_image || job.image_before_url) || ''}
                                          alt={job.title}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <span style={{ fontSize: 18 }}>📸</span>
                                      )}
                                    </div>
                                    <div>
                                      <Upload
                                        accept='image/jpeg,image/png,image/webp'
                                        showUploadList={false}
                                        beforeUpload={(file) => handleUploadJobResultImage(file, idx, true)}
                                      >
                                        <Button size='small' icon={<UploadOutlined />}>
                                          {(job.before_image || job.image_before_url) ? 'Ganti Foto' : 'Unggah Foto'}
                                        </Button>
                                      </Upload>
                                      {(job.before_image || job.image_before_url) && (
                                        <Button
                                          size='small'
                                          type='link'
                                          danger
                                          onClick={() => handleClearJobResultImage(idx, true)}
                                          style={{ padding: '2px 0 0', display: 'block', fontSize: 11 }}
                                        >
                                          Hapus Foto
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 10.5, color: '#888', marginTop: 4 }}>
                                    Format: JPG, PNG, WEBP (Maks. 2MB)
                                  </div>
                                </div>
                              </Col>

                              <Col span={12}>
                                <div style={{ background: '#F8F9FA', padding: 10, borderRadius: 8, border: '1px solid #E4E7EC' }}>
                                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#1E2A78' }}>
                                    ✨ 2. Foto Sesudah (After) <span style={{ color: '#E12429' }}>*</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div
                                      style={{
                                        width: 76,
                                        height: 52,
                                        borderRadius: 6,
                                        border: '1px solid #D9D9D9',
                                        background: '#FFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {(job.image || job.image_after_url) ? (
                                        <img
                                          src={resolveImageUrl(job.image || job.image_after_url) || ''}
                                          alt={`Sesudah ${job.title}`}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <span style={{ fontSize: 18 }}>✨</span>
                                      )}
                                    </div>
                                    <div>
                                      <Upload
                                        accept='image/jpeg,image/png,image/webp'
                                        showUploadList={false}
                                        beforeUpload={(file) => handleUploadJobResultImage(file, idx, false)}
                                      >
                                        <Button size='small' icon={<UploadOutlined />}>
                                          {(job.image || job.image_after_url) ? 'Ganti Foto' : 'Unggah Foto'}
                                        </Button>
                                      </Upload>
                                      {(job.image || job.image_after_url) && (
                                        <Button
                                          size='small'
                                          type='link'
                                          danger
                                          onClick={() => handleClearJobResultImage(idx, false)}
                                          style={{ padding: '2px 0 0', display: 'block', fontSize: 11 }}
                                        >
                                          Hapus Foto
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 10.5, color: '#888', marginTop: 4 }}>
                                    Tampil berdampingan sebagai Before - After
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          )}
                        </Card>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </Col>

          {/* KOLOM KANAN: LIVE WYSIWYG PREVIEW (42%) */}
          <Col xs={24} lg={10} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2430' }}>
                Mode Preview:
              </span>
              <Radio.Group
                size='small'
                value={previewMode}
                onChange={(e) => setPreviewMode(e.target.value)}
              >
                <Radio.Button value='FULL'>✨ Full</Radio.Button>
                <Radio.Button value='HERO'>🌟 Hero</Radio.Button>
                <Radio.Button value='BENEFIT'>🎁 Keuntungan</Radio.Button>
                <Radio.Button value='CATALOG'>🛠️ Katalog</Radio.Button>
                <Radio.Button value='PROGRAM'>📢 Program</Radio.Button>
                <Radio.Button value='ARTICLE'>📰 Artikel</Radio.Button>
                <Radio.Button value='JOB_RESULT'>📸 Hasil Kerja</Radio.Button>
              </Radio.Group>
            </div>

            <div style={{ flex: 1, minHeight: 520 }}>
              <LivePreviewPanel
                sectionType={previewMode}
                unifiedPayload={unifiedPayload}
                selectedProgramIndex={selectedProgramIndex}
                onSelectProgramIndex={(idx) => setSelectedProgramIndex(idx)}
                payload={
                  previewMode === 'HERO'
                    ? unifiedPayload.hero
                    : previewMode === 'BENEFIT'
                    ? unifiedPayload.benefits
                    : previewMode === 'CATALOG'
                    ? unifiedPayload.catalogs
                    : previewMode === 'PROGRAM' || previewMode === 'ARTICLE'
                    ? unifiedPayload.programs
                    : previewMode === 'JOB_RESULT'
                    ? unifiedPayload.job_results
                    : undefined
                }
              />
            </div>
          </Col>
        </Row>
      </Modal>

      {/* ======================================================== */}
      {/* QUICK PREVIEW MODAL (FULL WYSIWYG)                       */}
      {/* ======================================================== */}
      <Modal
        title='Preview Halaman Vendor Lengkap'
        open={quickPreviewOpen}
        onCancel={() => setQuickPreviewOpen(false)}
        width={900}
        footer={[
          <Button key='close' onClick={() => setQuickPreviewOpen(false)}>
            Tutup Preview
          </Button>,
        ]}
      >
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          <LivePreviewPanel
            sectionType='FULL'
            unifiedPayload={previewPackage}
          />
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL SINKRONISASI                                       */}
      {/* ======================================================== */}
      <Modal
        title='Laporan Lengkap Cek Sinkronisasi'
        open={syncDetailOpen}
        onCancel={() => setSyncDetailOpen(false)}
        width={780}
        footer={[
          <Button key='close' onClick={() => setSyncDetailOpen(false)}>
            Tutup
          </Button>,
          <Button key='recheck' type='primary' loading={syncLoading} onClick={handleRunSyncCheck}>
            Jalankan Ulang Cek
          </Button>,
        ]}
      >
        {syncResult ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              <Card size='small' title='Total Aktif' bordered>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1E2A78' }}>
                  {syncResult.total_active} paket
                </div>
              </Card>
              <Card size='small' title='Section Hero' bordered>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {syncResult.section_counts.hero} aktif
                </div>
              </Card>
              <Card size='small' title='Keuntungan' bordered>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {syncResult.section_counts.benefit} aktif
                </div>
              </Card>
              <Card size='small' title='Katalog Jasa' bordered>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {syncResult.section_counts.catalog} aktif
                </div>
              </Card>
            </div>

            <Card size='small' title='Paritas Render Vendor' style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  Item di Database: <strong>{syncResult.vendor_render_parity.db_active_count}</strong> | Item Render Vendor:{' '}
                  <strong>{syncResult.vendor_render_parity.vendor_render_count}</strong>
                </div>
                {syncResult.vendor_render_parity.is_synced ? (
                  <Tag color='success'>Sinkron 1:1</Tag>
                ) : (
                  <Tag color='error'>Selisih {syncResult.vendor_render_parity.diff} item</Tag>
                )}
              </div>
            </Card>

            <h4 style={{ marginBottom: 8 }}>Daftar Catatan &amp; Masalah ({syncResult.issues.length})</h4>
            {syncResult.issues.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', background: '#F6FFED', borderRadius: 8, color: '#389E0D' }}>
                <CheckCircleOutlined style={{ fontSize: 28, marginBottom: 8 }} />
                <div>Tidak ada masalah! Semua data lengkap, aset gambar valid, dan paritas render 100% cocok.</div>
              </div>
            ) : (
              <Table
                size='small'
                dataSource={syncResult.issues}
                rowKey={(r, idx) => `${r.id}-${idx}`}
                pagination={false}
                columns={[
                  {
                    title: 'Tipe',
                    dataIndex: 'issue_type',
                    width: 90,
                    render: (t) => <Tag>{String(t).toUpperCase()}</Tag>,
                  },
                  {
                    title: 'Section',
                    dataIndex: 'section_type',
                    width: 100,
                    render: (s) => <Tag color='blue'>{s}</Tag>,
                  },
                  {
                    title: 'Detail Catatan',
                    dataIndex: 'message',
                    render: (m, r) => (
                      <div>
                        <div style={{ fontWeight: 600, color: r.severity === 'error' ? '#cf1322' : '#d48806' }}>
                          {r.title}
                        </div>
                        <div style={{ fontSize: 12 }}>{m}</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Tingkat',
                    dataIndex: 'severity',
                    width: 100,
                    align: 'center',
                    render: (sev) => (
                      <Tag color={sev === 'error' ? 'error' : 'warning'}>
                        {sev === 'error' ? 'Kritis' : 'Peringatan'}
                      </Tag>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ) : (
          <Spin />
        )}
      </Modal>

      {/* MODAL PREVIEW HALAMAN ARTIKEL PROGRAM UNTUK ADMIN */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📰</span>
            <span style={{ fontWeight: 700, color: '#1E2A78' }}>
              Preview Halaman Artikel Program (Tampilan Vendor)
            </span>
          </div>
        }
        open={Boolean(previewArticleModal)}
        onCancel={() => setPreviewArticleModal(null)}
        footer={null}
        width={760}
        bodyStyle={{ maxHeight: '75vh', overflowY: 'auto', padding: '24px 28px' }}
      >
        {previewArticleModal && (
          <div className='program-article-card' style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
            <div style={{ marginBottom: 12 }}>
              {(previewArticleModal.badge || previewArticleModal.badge_label) && (
                <span className='program-article-badge'>
                  {previewArticleModal.badge || previewArticleModal.badge_label}
                </span>
              )}
            </div>
            <h2 className='program-article-title' style={{ marginBottom: 14 }}>
              {previewArticleModal.title || 'Program Mitra10'}
            </h2>
            {(previewArticleModal.image || previewArticleModal.image_url) && (
              <div className='program-article-hero-wrap' style={{ maxHeight: 320 }}>
                <img
                  src={resolveImageUrl(previewArticleModal.image || previewArticleModal.image_url) || ''}
                  alt={previewArticleModal.title || 'Banner'}
                  className='program-article-hero-img'
                />
              </div>
            )}
            <div className='program-article-body' style={{ marginTop: 18 }}>
              <RenderInjectedContent content={previewArticleModal.description || ''} />
            </div>
            {(previewArticleModal.has_external_link !== false && Boolean(previewArticleModal.link_url && previewArticleModal.link_url.trim().length > 0)) && (
              <div className='program-footer-cta-box' style={{ marginTop: 24 }}>
                <div className='cta-box-text'>
                  <strong>Tertarik mengikuti program ini?</strong>
                  <span>Kunjungi tautan resmi pendaftaran atau ketentuan program:</span>
                </div>
                <a
                  href={previewArticleModal.link_url || undefined}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='program-action-btn primary'
                >
                  {previewArticleModal.external_cta_label || previewArticleModal.cta_label || 'Ikuti Program →'}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomeContentSettings;
