import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  Input,
  Switch,
  Tabs,
  Row,
  Col,
  Spin,
  message,
  Radio,
} from 'antd'
import {
  LoadingOutlined,
} from '@ant-design/icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faSave,
  faFileAlt,
  faEye,
} from '@fortawesome/free-solid-svg-icons'
import {
  homeContentService,
  UnifiedHomePayload,
} from '../../../services/homeContentService'
import {LivePreviewPanel} from '../../home-content-shared/LivePreviewPanel'
import {
  validateVideoFile,
  compressVideo,
  formatFileSize,
  COMPRESS_THRESHOLD_BYTES,
  MAX_VIDEO_FILE_SIZE_BYTES,
} from './videoCompressor'
import {DEFAULT_UNIFIED_PAYLOAD} from './constants'
import {HeroFormSection} from './components/HeroFormSection'
import {BenefitsFormSection} from './components/BenefitsFormSection'
import {CatalogsFormSection} from './components/CatalogsFormSection'
import {ProgramsFormSection} from './components/ProgramsFormSection'
import {JobResultsFormSection} from './components/JobResultsFormSection'
import './HomeContentSettings.css'
import '../../../modules/pendaftar/ProgramDetailPage.css'

interface Props {
  isEdit?: boolean
}

export const HomeContentForm: React.FC<Props> = ({isEdit: isEditProp}) => {
  const navigate = useNavigate()
  const {id} = useParams<{id?: string}>()
  const isEdit = Boolean(isEditProp || id)

  const [loadingInitial, setLoadingInitial] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // 2 Main Tabs: 'form' vs 'preview'
  const [mainTab, setMainTab] = useState<'form' | 'preview'>('form')

  // Sub-tabs inside Form tab
  const [formSubTab, setFormSubTab] = useState<string>('hero')

  // Preview Mode inside Preview tab
  const [previewSectionMode, setPreviewSectionMode] = useState<
    'FULL' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'PROGRAM' | 'ARTICLE' | 'JOB_RESULT'
  >('FULL')
  const [selectedProgramIndex, setSelectedProgramIndex] = useState<number>(0)

  // Form State
  const [packageTitle, setPackageTitle] = useState<string>(
    isEdit
      ? 'Paket Konten Home Mitra10'
      : `Paket Konten Home ${new Date().toLocaleDateString('id-ID', {
          month: 'short',
          year: 'numeric',
        })}`
  )
  const [unifiedPayload, setUnifiedPayload] = useState<UnifiedHomePayload>(
    JSON.parse(JSON.stringify(DEFAULT_UNIFIED_PAYLOAD))
  )
  const [packageIsActive, setPackageIsActive] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      setLoadingInitial(true)
      homeContentService
        .getAll()
        .then((items) => {
          const found = items.find((it) => String(it.id) === String(id))
          if (found) {
            setPackageTitle(found.title || 'Paket Konten Home Mitra10')
            setPackageIsActive(Boolean(found.is_active))
            const p = found.payload || {}
            setUnifiedPayload({
              hero: p.hero || DEFAULT_UNIFIED_PAYLOAD.hero,
              benefits:
                Array.isArray(p.benefits) && p.benefits.length > 0
                  ? p.benefits.map((b: any) => ({
                      ...b,
                      icon: b.icon && !b.icon.includes('?') ? b.icon : '',
                    }))
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
            })
          } else {
            message.error('Paket konten tidak ditemukan.')
            navigate('/home-content-settings')
          }
        })
        .catch((err) => {
          console.error(err)
          message.error('Gagal mengambil data paket konten.')
        })
        .finally(() => setLoadingInitial(false))
    }
  }, [id, navigate])

  // Save Package Handler
  const handleSavePackage = async () => {
    if (!packageTitle.trim()) {
      message.error('Nama paket konten wajib diisi.')
      return
    }
    if (!unifiedPayload.hero.headline_main || !unifiedPayload.hero.headline_highlight) {
      message.error('Headline Hero wajib diisi.')
      setFormSubTab('hero')
      setMainTab('form')
      return
    }
    if (unifiedPayload.benefits.length === 0) {
      message.error('Minimal harus ada 1 Keuntungan Menjadi Vendor.')
      setFormSubTab('benefits')
      setMainTab('form')
      return
    }
    if (unifiedPayload.catalogs.length === 0) {
      message.error('Minimal harus ada 1 Kategori Katalog Jasa.')
      setFormSubTab('catalogs')
      setMainTab('form')
      return
    }

    setSaving(true)
    try {
      const sanitizedPayload = {
        ...unifiedPayload,
        catalogs: unifiedPayload.catalogs.map((c) => ({
          ...c,
          name: c.name ? c.name.replace(/\?+/g, '').trim() : '',
          badge_text: c.badge_text ? c.badge_text.replace(/\?+/g, '').trim() : null,
          icon_fallback:
            c.icon_fallback && !c.icon_fallback.includes('?') ? c.icon_fallback.trim() : '',
        })),
      }

      await homeContentService.saveUnified(
        sanitizedPayload,
        packageTitle.trim(),
        id ? Number(id) : undefined,
        packageIsActive
      )
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Paket Home Content berhasil disimpan secara utuh.',
        icon: 'success',
        confirmButtonColor: '#183383',
      })
      navigate('/home-content-settings')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan paket home content'
      Swal.fire('Gagal Menyimpan', Array.isArray(msg) ? msg.join('<br/>') : String(msg), 'error')
    } finally {
      setSaving(false)
    }
  }

  // Hero Handlers
  const handleUploadHeroImage = async (file: File) => {
    const blobUrl = URL.createObjectURL(file)
    setUnifiedPayload((prev) => ({
      ...prev,
      hero: {...prev.hero, illustration_image: blobUrl},
    }))
    try {
      const res = await homeContentService.uploadImage(file)
      setUnifiedPayload((prev) => ({
        ...prev,
        hero: {...prev.hero, illustration_image: res.image_url},
      }))
      message.success('Ilustrasi Hero berhasil diunggah.')
    } catch (err: any) {
      message.error('Gagal mengunggah gambar ke server.')
    }
    return false
  }

  const handleClearHeroImage = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      hero: {...prev.hero, illustration_image: null},
    }))
  }

  // Benefits Handlers
  const addBenefitItem = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          icon: '',
          title: 'Keuntungan Tambahan',
          description: 'Deskripsi keuntungan baru bagi mitra instalasi.',
          accent_color: 'brand-blue',
          image: null,
        },
      ],
    }))
  }

  const removeBenefitItem = (index: number) => {
    if (unifiedPayload.benefits.length <= 1) {
      message.warning('Minimal harus ada 1 item keuntungan.')
      return
    }
    setUnifiedPayload((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  // Catalogs Handlers
  const handleUploadCatalogImage = async (file: File, index: number) => {
    const blobUrl = URL.createObjectURL(file)
    setUnifiedPayload((prev) => {
      const cats = [...prev.catalogs]
      cats[index] = {...cats[index], image: blobUrl}
      return {...prev, catalogs: cats}
    })
    try {
      const res = await homeContentService.uploadImage(file)
      setUnifiedPayload((prev) => {
        const cats = [...prev.catalogs]
        cats[index] = {...cats[index], image: res.image_url}
        return {...prev, catalogs: cats}
      })
      message.success(`Gambar katalog #${index + 1} berhasil diunggah.`)
    } catch (err: any) {
      message.error('Gagal mengunggah gambar katalog.')
    }
    return false
  }

  const handleClearCatalogImage = (index: number) => {
    setUnifiedPayload((prev) => {
      const cats = [...prev.catalogs]
      cats[index] = {...cats[index], image: null}
      return {...prev, catalogs: cats}
    })
  }

  const addCatalogItem = () => {
    setUnifiedPayload((prev) => ({
      ...prev,
      catalogs: [
        ...prev.catalogs,
        {
          name: 'Kategori Baru',
          link_url: 'https://www.mitra10.com',
          badge_text: null,
          icon_fallback: '',
          image: null,
          button_label: 'Lihat Produk →',
          button_style: 'primary',
        },
      ],
    }))
  }

  const removeCatalogItem = (index: number) => {
    if (unifiedPayload.catalogs.length <= 1) {
      message.warning('Minimal harus ada 1 item katalog.')
      return
    }
    setUnifiedPayload((prev) => ({
      ...prev,
      catalogs: prev.catalogs.filter((_, i) => i !== index),
    }))
  }

  // Programs Handlers
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
    }))
  }

  const handleRemoveProgram = (index: number) => {
    setUnifiedPayload((prev) => ({
      ...prev,
      programs: (prev.programs || []).filter((_, i) => i !== index),
    }))
  }

  const handleUploadProgramImage = async (file: File, index: number) => {
    const blobUrl = URL.createObjectURL(file)
    setUnifiedPayload((prev) => {
      const list = [...(prev.programs || [])]
      list[index] = {...list[index], image: blobUrl, image_url: blobUrl}
      return {...prev, programs: list}
    })
    try {
      const res = await homeContentService.uploadImage(file)
      setUnifiedPayload((prev) => {
        const list = [...(prev.programs || [])]
        list[index] = {...list[index], image: res.image_url, image_url: res.image_url}
        return {...prev, programs: list}
      })
      message.success('Banner program berhasil diunggah.')
    } catch (err: any) {
      message.error('Gagal mengunggah gambar program.')
    }
    return false
  }

  const handleClearProgramImage = (index: number) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.programs || [])]
      list[index] = {...list[index], image: '', image_url: ''}
      return {...prev, programs: list}
    })
  }

  // Job Results Handlers
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
    }))
  }

  const handleRemoveJobResult = (index: number) => {
    setUnifiedPayload((prev) => ({
      ...prev,
      job_results: (prev.job_results || []).filter((_, i) => i !== index),
    }))
  }

  const handleUploadJobResultImage = async (file: File, index: number, isBefore: boolean) => {
    const blobUrl = URL.createObjectURL(file)
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])]
      if (isBefore) {
        list[index] = {...list[index], before_image: blobUrl, image_before_url: blobUrl}
      } else {
        list[index] = {...list[index], image: blobUrl, image_after_url: blobUrl}
      }
      return {...prev, job_results: list}
    })
    try {
      const res = await homeContentService.uploadImage(file)
      setUnifiedPayload((prev) => {
        const list = [...(prev.job_results || [])]
        if (isBefore) {
          list[index] = {
            ...list[index],
            before_image: res.image_url,
            image_before_url: res.image_url,
          }
        } else {
          list[index] = {...list[index], image: res.image_url, image_after_url: res.image_url}
        }
        return {...prev, job_results: list}
      })
      message.success(`Foto ${isBefore ? 'Before' : 'After'} berhasil diunggah.`)
    } catch (err: any) {
      message.error('Gagal mengunggah foto.')
    }
    return false
  }

  const handleClearJobResultImage = (index: number, isBefore: boolean) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])]
      if (isBefore) {
        list[index] = {...list[index], before_image: '', image_before_url: ''}
      } else {
        list[index] = {...list[index], image: '', image_after_url: ''}
      }
      return {...prev, job_results: list}
    })
  }

  const handleUploadJobResultVideo = async (file: File, index: number) => {
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Format Video Tidak Didukung',
        text:
          validation.error || 'Format video tidak diizinkan. Gunakan MP4, WebM, MOV, atau MKV.',
        confirmButtonColor: '#183383',
      })
      return false
    }

    let fileToUpload = file
    let compressionSummary = ''

    if (file.size > COMPRESS_THRESHOLD_BYTES) {
      const hideCompress = message.loading(
        `Mengompresi video portofolio (${formatFileSize(file.size)} ke 720p HD)...`,
        0
      )
      try {
        const compResult = await compressVideo(file)
        hideCompress()
        if (compResult.wasCompressed) {
          fileToUpload = compResult.file
          compressionSummary = ` (Dikompresi: ${formatFileSize(
            compResult.originalSize
          )} ➔ ${formatFileSize(compResult.compressedSize)}, hemat ${compResult.ratioPercent}%)`
          message.info(
            `Video berhasil dikompresi: hemat ${compResult.ratioPercent}% ukuran file.`
          )
        }
      } catch (cErr) {
        hideCompress()
        console.warn('Kompresi video gagal, melanjutkan upload file asli:', cErr)
      }
    }

    if (fileToUpload.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      Swal.fire({
        icon: 'error',
        title: 'Ukuran Video Terlalu Besar',
        text: `Ukuran file video (${formatFileSize(
          fileToUpload.size
        )}) melebihi batas maksimal server (30 MB). Silakan gunakan video dengan durasi lebih pendek.`,
        confirmButtonColor: '#183383',
      })
      return false
    }

    const hide = message.loading('Mengunggah video ke server...', 0)
    try {
      const res = await homeContentService.uploadVideo(fileToUpload)
      hide()
      setUnifiedPayload((prev) => {
        const list = [...(prev.job_results || [])]
        list[index] = {
          ...list[index],
          media_type: 'video',
          video_url: res.video_url,
          tag: list[index]?.tag || 'Video Dokumentasi',
          badge_label: list[index]?.badge_label || 'Video Dokumentasi',
        }
        return {...prev, job_results: list}
      })
      message.success(`Video dokumentasi berhasil diunggah${compressionSummary}.`)
    } catch (err: any) {
      hide()
      const errMsg =
        err?.response?.data?.message || err?.message || 'Gagal mengunggah video ke server.'
      Swal.fire({
        icon: 'error',
        title: 'Upload Gagal',
        text: errMsg,
        confirmButtonColor: '#183383',
      })
    }
    return false
  }

  const handleClearJobResultVideo = (index: number) => {
    setUnifiedPayload((prev) => {
      const list = [...(prev.job_results || [])]
      list[index] = {...list[index], video_url: null}
      return {...prev, job_results: list}
    })
  }

  if (loadingInitial) {
    return (
      <div style={{textAlign: 'center', padding: '100px 0'}}>
        <Spin
          indicator={<LoadingOutlined style={{fontSize: 32}} spin />}
          tip='Memuat formulir paket konten...'
        />
      </div>
    )
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
                {isEdit
                  ? 'Edit Formulir Paket Konten Home'
                  : 'Formulir Tambah Paket Konten Home Baru'}
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
              style={{backgroundColor: '#183383', borderColor: '#183383', minWidth: 140}}
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
          <div
            className='card card-bordered p-4 mb-4 bg-lighten'
            style={{border: '1px solid #E2E8F0', borderRadius: 8}}
          >
            <Row gutter={16} align='middle'>
              <Col xs={24} md={15}>
                <label className='hc-form-label fs-6 fw-bold text-gray-800'>
                  Nama / Versi Paket Konten <span style={{color: '#E12429'}}>*</span>
                </label>
                <Input
                  value={packageTitle}
                  onChange={(e) => setPackageTitle(e.target.value)}
                  placeholder='Contoh: Paket Konten Home Q1 2026'
                  style={{height: 42, borderRadius: 6, fontSize: 13.5}}
                />
              </Col>
              <Col xs={24} md={9}>
                <div className='d-flex align-items-center justify-content-md-end gap-3 mt-3 mt-md-0'>
                  <div>
                    <span className='hc-form-label fs-6 fw-bold text-gray-800 mb-0'>
                      Status Tampil di Portal Vendor
                    </span>
                    <span className='hc-form-help'>
                      Jika aktif, paket ini otomatis menjadi tampilan utama &amp; paket lain dinonaktifkan
                    </span>
                  </div>
                  <Switch
                    checked={packageIsActive}
                    onChange={(val) => setPackageIsActive(val)}
                    checkedChildren='AKTIF'
                    unCheckedChildren='NONAKTIF'
                    style={{background: packageIsActive ? '#50cd89' : undefined}}
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
              {
                key: 'form',
                label: (
                  <span className='d-flex align-items-center gap-2'>
                    <FontAwesomeIcon icon={faFileAlt} />
                    1. Formulir Konten (Edit Data)
                  </span>
                ),
                children: (
                  <div className='hc-form-subtabs-wrap' style={{minHeight: 600}}>
                    <Tabs
                      activeKey={formSubTab}
                      onChange={(k) => setFormSubTab(k)}
                      className='hc-form-tabs-container'
                      type='card'
                      items={[
                        {
                          key: 'hero',
                          label: '🌟 1. Hero Section',
                          children: (
                            <HeroFormSection
                              hero={unifiedPayload.hero}
                              onChange={(hero) => setUnifiedPayload((prev) => ({...prev, hero}))}
                              onUploadImage={handleUploadHeroImage}
                              onClearImage={handleClearHeroImage}
                            />
                          ),
                        },
                        {
                          key: 'benefits',
                          label: `🎁 2. Keuntungan (${unifiedPayload.benefits.length})`,
                          children: (
                            <BenefitsFormSection
                              benefits={unifiedPayload.benefits}
                              onChange={(benefits) =>
                                setUnifiedPayload((prev) => ({...prev, benefits}))
                              }
                              onAdd={addBenefitItem}
                              onRemove={removeBenefitItem}
                            />
                          ),
                        },
                        {
                          key: 'catalogs',
                          label: `🛠️ 3. Katalog Jasa (${unifiedPayload.catalogs.length})`,
                          children: (
                            <CatalogsFormSection
                              catalogs={unifiedPayload.catalogs}
                              onChange={(catalogs) =>
                                setUnifiedPayload((prev) => ({...prev, catalogs}))
                              }
                              onAdd={addCatalogItem}
                              onRemove={removeCatalogItem}
                              onUploadImage={handleUploadCatalogImage}
                              onClearImage={handleClearCatalogImage}
                            />
                          ),
                        },
                        {
                          key: 'programs',
                          label: `📢 4. Program Promosi (${(unifiedPayload.programs || []).length})`,
                          children: (
                            <ProgramsFormSection
                              programs={unifiedPayload.programs}
                              onChange={(programs) =>
                                setUnifiedPayload((prev) => ({...prev, programs}))
                              }
                              onAdd={handleAddProgram}
                              onRemove={handleRemoveProgram}
                              onUploadImage={handleUploadProgramImage}
                              onClearImage={handleClearProgramImage}
                            />
                          ),
                        },
                        {
                          key: 'job_results',
                          label: `📸 5. Hasil Pekerjaan (${(unifiedPayload.job_results || []).length})`,
                          children: (
                            <JobResultsFormSection
                              jobResults={unifiedPayload.job_results}
                              onChange={(job_results) =>
                                setUnifiedPayload((prev) => ({...prev, job_results}))
                              }
                              onAdd={handleAddJobResult}
                              onRemove={handleRemoveJobResult}
                              onUploadImage={handleUploadJobResultImage}
                              onClearImage={handleClearJobResultImage}
                              onUploadVideo={handleUploadJobResultVideo}
                              onClearVideo={handleClearJobResultVideo}
                            />
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: 'preview',
                label: (
                  <span className='d-flex align-items-center gap-2'>
                    <FontAwesomeIcon icon={faEye} />
                    2. Live Preview Vendor (Hasil Nyata)
                  </span>
                ),
                children: (
                  <div style={{minHeight: 650}}>
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
              style={{backgroundColor: '#183383', borderColor: '#183383', minWidth: 160}}
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
  )
}
