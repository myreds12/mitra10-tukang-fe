import React, {useEffect, useMemo, useState} from 'react'
import Swal from 'sweetalert2'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Upload,
  Spin,
  message,
  Tag,
  Card,
  Divider,
  Image,
} from 'antd'
import {LoadingOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import './HomeContentSettings.css'
import { HomeContentItem, homeContentService } from '../../../services/homeContentService'

const {Option} = Select
const SECTIONS = ['HERO', 'BENEFIT', 'BANNER', 'CATALOG'] as const
const SECTION_LABELS: Record<string, string> = {
  HERO: 'Hero (Banner Utama)',
  BENEFIT: 'Benefit Cards',
  BANNER: 'Banner Images',
  CATALOG: 'Catalog Items',
}
const ICON_OPTIONS = [
  {value: 'briefcase', label: 'Briefcase (Peluang Order)'},
  {value: 'graduation-cap', label: 'Graduation Cap (Pelatihan)'},
  {value: 'book-open', label: 'Book Open (Katalog)'},
  {value: 'gift', label: 'Gift (Benefit Program)'},
  {value: 'chart-line', label: 'Chart Line (Monitoring)'},
  {value: 'handshake', label: 'Handshake (Kembangkan Bisnis)'},
  {value: 'th-large', label: 'Th Large (Catalog)'},
]

/**
 * Image dengan fallback div saat src kosong atau error load.
 * Antd Image 'fallback' prop cuma expect string URL, bukan ReactElement,
 * jadi kita handle state error sendiri + conditional render.
 */
const ImageWithFallback: React.FC<{
  src: string | null | undefined
  alt: string
  width: number
  height: number
  preview?: boolean
  className?: string
  emptyText?: string
}> = ({src, alt, width, height, preview = false, className, emptyText = 'N/A'}) => {
  const [errored, setErrored] = useState(false)
  useEffect(() => {
    setErrored(false)
  }, [src])
  if (!src || errored) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: 6,
          color: '#999',
          fontSize: 11,
        }}
      >
        {emptyText}
      </div>
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{objectFit: 'cover', borderRadius: 6}}
      preview={preview ? {mask: 'zoom'} : false}
      onError={() => setErrored(true)}
    />
  )
}

const HomeContentSettings: React.FC = () => {
  const [items, setItems] = useState<HomeContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string>('ALL')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<HomeContentItem | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const isActive = Form.useWatch('is_active', form) as boolean | undefined
  const imageUrl = Form.useWatch('image_url', form) as string | undefined

  const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')
  const resolveImageUrl = (imageUrl: string | null | undefined): string | null => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('http')) return imageUrl
    if (imageUrl.startsWith('uploads/')) {
      return `${apiUrl}/public/${imageUrl.replace(/^uploads\//, '')}`
    }
    return `${apiUrl}/${imageUrl.replace(/^\//, '')}`
  }

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await homeContentService.getAll()
      setItems(data)
    } catch (err: any) {
      console.error('Error fetching home content:', err)
      setError('Gagal memuat data home content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') return items
    return items.filter((i) => i.section === activeTab)
  }, [items, activeTab])

  const counts = useMemo(() => {
    const result: Record<string, number> = {ALL: items.length}
    SECTIONS.forEach((s) => {
      result[s] = items.filter((i) => i.section === s).length
    })
    return result
  }, [items])

  // Modal handlers
  const openCreate = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({section: 'HERO', order_index: 0, is_active: true})
    setModalOpen(true)
  }

  const openEdit = (record: HomeContentItem) => {
    setEditingRecord(record)
    form.setFieldsValue({
      section: record.section,
      title: record.title || '',
      subtitle: record.subtitle || '',
      description: record.description || '',
      icon: record.icon || '',
      image_url: record.image_url || '',
      order_index: record.order_index,
      is_active: record.is_active,
    })
    setModalOpen(true)
  }

  const handleImageUpload = async (file: File): Promise<boolean> => {
    setUploading(true)
    try {
      const result = await homeContentService.uploadImage(file)
      form.setFieldsValue({image_url: result.image_url})
      message.success(`Gambar berhasil diupload (${(file.size / 1024).toFixed(1)} KB)`)
      return false // prevent antd default upload (return false = handled)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal upload gambar'
      message.error(Array.isArray(msg) ? msg.join(', ') : String(msg))
      return false
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      const payload = {
        section: values.section,
        title: values.title || null,
        subtitle: values.subtitle || null,
        description: values.description || null,
        icon: values.icon || null,
        image_url: values.image_url || null,
        order_index: values.order_index ?? 0,
        is_active: values.is_active ?? true,
      }
      if (editingRecord) {
        await homeContentService.update(editingRecord.id, payload)
        Swal.fire('Berhasil', 'Home content berhasil diperbarui', 'success')
      } else {
        await homeContentService.create(payload)
        Swal.fire('Berhasil', 'Home content berhasil ditambah', 'success')
      }
      setModalOpen(false)
      fetchItems()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Gagal menyimpan home content'
      Swal.fire('Gagal', Array.isArray(msg) ? msg.join(', ') : msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (record: HomeContentItem) => {
    const confirm = await Swal.fire({
      title: 'Hapus Home Content?',
      text: `Yakin hapus "${record.title || record.section}"? Tindakan ini tidak bisa dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await homeContentService.remove(record.id)
      Swal.fire('Berhasil', 'Home content berhasil dihapus', 'success')
      fetchItems()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Gagal menghapus home content'
      Swal.fire('Gagal', Array.isArray(msg) ? msg.join(', ') : msg, 'error')
    }
  }

  const handleToggleActive = async (record: HomeContentItem) => {
    const nextState = !record.is_active
    const action = nextState ? 'Aktifkan' : 'Nonaktifkan'
    const confirm = await Swal.fire({
      title: `${action} entry ini?`,
      text: `Entry "${record.title || record.section}" akan ${nextState ? 'tampil' : 'disembunyikan'} di dashboard pendaftar.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Ya, ${action}`,
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return

    try {
      await homeContentService.update(record.id, {is_active: nextState})
      Swal.fire('Berhasil', `Entry berhasil di${nextState ? 'aktifkan' : 'nonaktifkan'}.`, 'success')
      fetchItems()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        `Gagal ${action.toLowerCase()} entry`
      Swal.fire('Gagal', Array.isArray(msg) ? msg.join(', ') : msg, 'error')
    }
  }

  const columns: ColumnsType<HomeContentItem> = [
    {
      title: '#',
      key: 'no',
      align: 'center',
      width: 50,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      align: 'center',
      width: 110,
      render: (section: string) => (
        <Tag color={section === 'HERO' ? 'blue' : section === 'BANNER' ? 'cyan' : section === 'BENEFIT' ? 'geekblue' : 'purple'}>
          {section}
        </Tag>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      align: 'center',
      width: 80,
      render: (url: string | null) => (
        <ImageWithFallback
          src={resolveImageUrl(url)}
          alt="thumb"
          width={44}
          height={44}
          preview
          emptyText="N/A"
        />
      ),
    },
    {
      title: 'Order',
      dataIndex: 'order_index',
      key: 'order_index',
      align: 'center',
      width: 70,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      width: 100,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag
            color="success"
            style={{fontWeight: 600, borderRadius: 6, padding: '2px 10px'}}
          >
            Aktif
          </Tag>
        ) : (
          <Tag
            color="default"
            style={{fontWeight: 600, borderRadius: 6, padding: '2px 10px'}}
          >
            Non-aktif
          </Tag>
        ),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 220,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>
          {record.is_active ? (
            <Button
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleToggleActive(record)}
            >
              Nonaktifkan
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleToggleActive(record)}
            >
              Aktifkan
            </Button>
          )}
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Hapus
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <section id="home-content-settings" className="home-content-settings">
      <div className="hc-header">
        <h1 className="hc-title">Kelola Konten Home Vendor</h1>
        <p className="hc-subtitle">
          Atur konten hero, benefit, banner, dan katalog yang tampil di dashboard
          Pendaftar Vendor.
        </p>
      </div>

      {error && <div className="hc-error-banner">{error}</div>}

      <div className="hc-toolbar">
        <div className="hc-tabs">
          <button
            type="button"
            className={`hc-tab ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            Semua <span className="hc-tab-count">({counts.ALL})</span>
          </button>
          {SECTIONS.map((s) => (
            <button
              type="button"
              key={s}
              className={`hc-tab ${activeTab === s ? 'active' : ''}`}
              onClick={() => setActiveTab(s)}
            >
              {SECTION_LABELS[s]} <span className="hc-tab-count">({counts[s]})</span>
            </button>
          ))}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tambah
        </Button>
      </div>

      <Spin spinning={loading} indicator={<LoadingOutlined style={{fontSize: 24}} spin />}>
        <Table
          className="hc-table"
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          pagination={{pageSize: 20, showSizeChanger: false}}
          bordered
          size="small"
          scroll={{x: 900}}
          locale={{
            emptyText:
              activeTab === 'ALL'
                ? 'Belum ada home content. Klik "Tambah" untuk membuat entry baru.'
                : `Belum ada entry di section ${activeTab}.`,
          }}
        />
      </Spin>

      <Modal
        title={editingRecord ? 'Edit Home Content' : 'Tambah Home Content'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {/* ====== Section 1: Content ====== */}
          <div className="hc-form-section">
            <div className="hc-form-section-title">Content</div>

            <Form.Item
              name="section"
              label="Section"
              rules={[{required: true, message: 'Section wajib diisi'}]}
            >
              <Select placeholder="Pilih section" disabled={!!editingRecord}>
                {SECTIONS.map((s) => (
                  <Option key={s} value={s}>
                    {SECTION_LABELS[s]}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="title" label="Judul">
              <Input placeholder="Judul (mis. 'Peluang Order')" maxLength={200} />
            </Form.Item>

            <Form.Item
              name="subtitle"
              label="Sub-judul"
              tooltip="Untuk section HERO. Sub-judul tampil di bawah judul utama."
            >
              <Input.TextArea
                rows={2}
                placeholder="Sub-judul (untuk section HERO)"
                maxLength={500}
              />
            </Form.Item>

            <Form.Item name="description" label="Deskripsi">
              <Input.TextArea
                rows={3}
                placeholder="Deskripsi (untuk BENEFIT/CATALOG)"
              />
            </Form.Item>

            <Form.Item
              name="icon"
              label="Icon (FontAwesome key)"
              tooltip="Untuk section BENEFIT/CATALOG. Pilih dari daftar atau kosongkan."
            >
              <Select placeholder="Pilih icon (opsional)" allowClear>
                {ICON_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Divider />

          {/* ====== Section 2: Media ====== */}
          <div className="hc-form-section">
            <div className="hc-form-section-title">Media</div>

            <Form.Item
              label="Gambar (untuk section HERO/BANNER)"
              tooltip="JPG/PNG/WEBP/GIF, max 10MB. Preview akan muncul otomatis setelah upload berhasil."
            >
              <Upload
                accept="image/jpeg,image/png,image/webp,image/gif"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImageUpload(file as File)
                  return false
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {uploading ? 'Mengupload...' : 'Pilih & Upload Gambar'}
                </Button>
              </Upload>
            </Form.Item>

            {/* Hidden Form.Item untuk menyimpan image_url di form state */}
            <Form.Item name="image_url" hidden>
              <Input />
            </Form.Item>

            {/* Preview — reactive via Form.useWatch */}
            {imageUrl && (
              <div className="hc-image-preview">
                <div className="hc-image-preview-header">
                  <span className="hc-image-preview-label">Preview (klik untuk memperbesar)</span>
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => form.setFieldsValue({image_url: null})}
                  >
                    Hapus Gambar
                  </Button>
                </div>
                <ImageWithFallback
                  src={resolveImageUrl(imageUrl) || ''}
                  alt="preview"
                  width={0}
                  height={220}
                  preview
                  emptyText="Gambar tidak dapat dimuat"
                />
                <div className="hc-image-preview-hint">
                  Path: <code>{imageUrl}</code>
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* ====== Section 3: Display ====== */}
          <div className="hc-form-section">
            <div className="hc-form-section-title">Display</div>

            <Form.Item
              name="order_index"
              label="Order Index"
              tooltip="Urutan tampil. Lebih kecil = lebih awal. Berlaku global lintas section."
            >
              <InputNumber min={0} style={{width: '100%'}} placeholder="0" />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Status"
              tooltip="Non-aktifkan untuk menyembunyikan tanpa menghapus. HERO dan minimal 1 BANNER harus tetap aktif."
            >
              <Button
                type={isActive ? 'primary' : 'default'}
                danger={!isActive}
                icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                onClick={() => form.setFieldsValue({is_active: !isActive})}
                style={{minWidth: 200}}
              >
                {isActive ? 'Aktif' : 'Non-aktif'} — klik untuk toggle
              </Button>
            </Form.Item>
          </div>

          {/* ====== Footer actions ====== */}
          <div className="hc-form-footer">
            <Button onClick={() => setModalOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
}

export default HomeContentSettings
