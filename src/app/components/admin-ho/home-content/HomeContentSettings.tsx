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
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './HomeContentSettings.css';
import {
  HomeContentItem,
  homeContentService,
  SyncVerificationResult,
  BenefitAccentColor,
  UnifiedHomePayload,
} from '../../../services/homeContentService';
import { LivePreviewPanel } from '../../home-content-shared/LivePreviewPanel';
import { resolveImageUrl } from '../../home-content-shared/imageHelper';

const { Option } = Select;
const { TextArea } = Input;

const BENEFIT_EMOJI_PRESETS = ['📦', '💰', '🧾', '🛡️', '⭐', '🎓', '🔧', '🏆', '💡', '🤝'];
const CATALOG_EMOJI_PRESETS = ['💡', '🧱', '🚿', '🎨', '🔒', '🏗️', '🧰', '🏠', '🔧', '🚪', '🚽', '🍳'];

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
  const [previewMode, setPreviewMode] = useState<'FULL' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'SUPPORT'>('FULL');
  const [saving, setSaving] = useState(false);

  // Quick Preview modal
  const [quickPreviewOpen, setQuickPreviewOpen] = useState(false);
  const [previewPackage, setPreviewPackage] = useState<UnifiedHomePayload | null>(null);

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
        const sPhone = p.support?.support_phone || '+6281234567890';
        return (
          <Space direction='vertical' size={2}>
            <Space wrap size={4}>
              <Tag color='blue'>🌟 Hero Section</Tag>
              <Tag color='green'>🎁 {bCount} Keuntungan</Tag>
              <Tag color='orange'>🛠️ {cCount} Katalog Jasa</Tag>
            </Space>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              🎧 Support: {sPhone}
            </div>
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
              Konfigurasi satu kesatuan konten yang ditampilkan pada halaman awal pendaftar vendor (Hero, Keuntungan, Katalog Produk Mitra10, dan Layanan Support). Sistem secara ketat memastikan <strong>hanya 1 paket konten yang aktif</strong> dalam satu waktu.
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
                Hero + 6 Keuntungan + 8 Katalog Jasa + Dukungan Support
              </div>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={1280}
        style={{ top: 20 }}
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
        <Row gutter={20} style={{ minHeight: 640 }}>
          {/* KOLOM KIRI: FORM CONFIGURATION TABS (52%) */}
          <Col xs={24} lg={13} style={{ display: 'flex', flexDirection: 'column' }}>
            <Card
              size='small'
              style={{ marginBottom: 12, background: '#F8FAFC', borderColor: '#E2E8F0' }}
            >
              <Row gutter={12} align='middle'>
                <Col span={16}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                    Nama Paket Konten:
                  </label>
                  <Input
                    value={packageTitle}
                    onChange={(e) => setPackageTitle(e.target.value)}
                    placeholder='Contoh: Paket Konten Home Mitra10 (Default)'
                    style={{ marginTop: 4 }}
                  />
                </Col>
                <Col span={8}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block' }}>
                    Status Aktifkan:
                  </label>
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
                  setPreviewMode(key.toUpperCase() as any);
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
                    <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 6 }}>
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
                    <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 6 }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 16 }}>{b.icon}</span>
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
                    <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 6 }}>
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
                // TAB 4: HUBUNGI TIM SUPPORT
                // ----------------------------------------------------
                {
                  key: 'support',
                  label: '🎧 4. Hubungi Tim Support',
                  children: (
                    <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 6 }}>
                      <Alert
                        message='Informasi bantuan support ini akan tampil pada tombol header "Hubungi Tim Support" dan footer beranda pendaftar vendor.'
                        type='info'
                        showIcon
                        style={{ marginBottom: 14 }}
                      />

                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Label Tombol</label>
                        <Input
                          value={unifiedPayload.support.support_label}
                          onChange={(e) =>
                            setUnifiedPayload((prev) => ({
                              ...prev,
                              support: { ...prev.support, support_label: e.target.value },
                            }))
                          }
                          placeholder='Hubungi Tim Support'
                          style={{ marginTop: 4 }}
                        />
                      </div>

                      <Row gutter={12} style={{ marginBottom: 12 }}>
                        <Col span={12}>
                          <label style={{ fontWeight: 600 }}>
                            <PhoneOutlined /> Nomor WhatsApp / Telepon
                          </label>
                          <Input
                            value={unifiedPayload.support.support_phone}
                            onChange={(e) =>
                              setUnifiedPayload((prev) => ({
                                ...prev,
                                support: { ...prev.support, support_phone: e.target.value },
                              }))
                            }
                            placeholder='+6281234567890'
                            style={{ marginTop: 4 }}
                          />
                        </Col>
                        <Col span={12}>
                          <label style={{ fontWeight: 600 }}>
                            <MailOutlined /> Email Tim Support
                          </label>
                          <Input
                            value={unifiedPayload.support.support_email}
                            onChange={(e) =>
                              setUnifiedPayload((prev) => ({
                                ...prev,
                                support: { ...prev.support, support_email: e.target.value },
                              }))
                            }
                            placeholder='vendor-support@mitra10.com'
                            style={{ marginTop: 4 }}
                          />
                        </Col>
                      </Row>

                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>
                          <ClockCircleOutlined /> Jam Operasional Layanan
                        </label>
                        <Input
                          value={unifiedPayload.support.support_hours || ''}
                          onChange={(e) =>
                            setUnifiedPayload((prev) => ({
                              ...prev,
                              support: { ...prev.support, support_hours: e.target.value },
                            }))
                          }
                          placeholder='Senin - Jumat, 08:00 - 17:00 WIB'
                          style={{ marginTop: 4 }}
                        />
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Catatan / Pesan Bantuan</label>
                        <TextArea
                          rows={2}
                          value={unifiedPayload.support.support_note || ''}
                          onChange={(e) =>
                            setUnifiedPayload((prev) => ({
                              ...prev,
                              support: { ...prev.support, support_note: e.target.value },
                            }))
                          }
                          placeholder='Contoh: Tim kami siap membantu kendala dan verifikasi pendaftaran vendor Anda.'
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Col>

          {/* KOLOM KANAN: LIVE WYSIWYG PREVIEW (48%) */}
          <Col xs={24} lg={11} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2430' }}>
                Mode Preview:
              </span>
              <Radio.Group
                size='small'
                value={previewMode}
                onChange={(e) => setPreviewMode(e.target.value)}
              >
                <Radio.Button value='FULL'>✨ Halaman Penuh</Radio.Button>
                <Radio.Button value='HERO'>🌟 Hero</Radio.Button>
                <Radio.Button value='BENEFIT'>🎁 Keuntungan</Radio.Button>
                <Radio.Button value='CATALOG'>🛠️ Katalog</Radio.Button>
                <Radio.Button value='SUPPORT'>🎧 Support</Radio.Button>
              </Radio.Group>
            </div>

            <div style={{ flex: 1, minHeight: 520 }}>
              <LivePreviewPanel
                sectionType={previewMode}
                unifiedPayload={unifiedPayload}
                payload={
                  previewMode === 'HERO'
                    ? unifiedPayload.hero
                    : previewMode === 'BENEFIT'
                    ? unifiedPayload.benefits
                    : previewMode === 'CATALOG'
                    ? unifiedPayload.catalogs
                    : unifiedPayload.support
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
    </div>
  );
};

export default HomeContentSettings;
