import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import Swal from 'sweetalert2'
import {Button, Form, Card} from 'react-bootstrap'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import apiClient from '../../../services/apiClient'
import './TermsAndConditionsSetting.css'

/**
 * Form edit Syarat & Ketentuan (SETTING - Admin HO / Super User).
 * Edit source versi manapun -> submit selalu membuat VERSI BARU dari konten
 * yang diedit (audit trail; versi lama otomatis jadi arsip).
 * Konten: rich text editor Quill (react-quill) -> output HTML.
 */

// Toolbar Quill: heading, list, bold/italic, warna, link - cukup untuk dokumen T&C.
const QUILL_MODULES = {
  toolbar: [
    [{header: [1, 2, 3, 4, 5, 6, false]}],
    ['bold', 'italic', 'underline', 'strike'],
    [{list: 'ordered'}, {list: 'bullet'}],
    [{color: []}, {background: []}],
    [{align: []}],
    ['link'],
    ['clean'],
  ],
}

const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'color',
  'background',
  'align',
  'link',
]

const UpdateTermsAndConditions: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [baseVersion, setBaseVersion] = useState<number | null>(null)
  const [documentType, setDocumentType] = useState<'HTML' | 'PDF'>('HTML')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const isNew = params.id === 'new'

  const loadContent = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (isNew) {
        // Ambil versi aktif sebagai basis edit
        const response = await apiClient.get('/vendor-registration/terms-and-conditions')
        const data = response.data?.data ?? response.data
        setTitle(data.title ?? '')
        setContent(data.content ?? '')
        setDocumentType(data.document_type === 'PDF' ? 'PDF' : 'HTML')
        setBaseVersion(data.version ?? null)
      } else {
        // Ambil versi spesifik (aktif atau arsip) via endpoint detail
        const response = await apiClient.get(
          `/vendor-registration/terms-and-conditions/versions/${params.id}`
        )
        const data = response.data?.data ?? response.data
        setTitle(data.title ?? '')
        setContent(data.content ?? '')
        setDocumentType(data.document_type === 'PDF' ? 'PDF' : 'HTML')
        setBaseVersion(data.version ?? null)
        if (!data.is_active) {
          setError(
            `Anda sedang edit versi ARSIP v${data.version}. Submit akan membuat versi baru berdasarkan konten ini.`
          )
        }
      }
    } catch (err) {
      console.error('Error loading terms content:', err)
      setError('Gagal memuat konten T&C. Silakan coba beberapa saat lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      Swal.fire('Validasi', 'Judul wajib diisi.', 'warning')
      return
    }

    // Validasi per tipe dokumen
    if (documentType === 'HTML') {
      // Quill menghasilkan "<p><br></p>" untuk konten kosong - strip tag untuk cek.
      const plainContent = content.replace(/<[^>]*>/g, '').trim()
      if (!plainContent) {
        Swal.fire('Validasi', 'Konten T&C wajib diisi.', 'warning')
        return
      }
    } else {
      if (!pdfFile) {
        Swal.fire('Validasi', 'File PDF wajib diunggah untuk tipe dokumen PDF.', 'warning')
        return
      }
      if (pdfFile.type !== 'application/pdf') {
        Swal.fire('Validasi', 'File harus berformat PDF.', 'warning')
        return
      }
    }

    setIsSubmitting(true)
    try {
      // multipart/form-data supaya bisa kirim file PDF
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('document_type', documentType)
      if (documentType === 'HTML') {
        formData.append('content', content)
      }
      if (documentType === 'PDF' && pdfFile) {
        formData.append('file', pdfFile)
      }

      await apiClient.put('/vendor-registration/terms-and-conditions', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      })

      Swal.fire({
        title: 'Berhasil',
        text: 'Syarat & Ketentuan berhasil diperbarui (versi baru dibuat & otomatis aktif).',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      }).then(() => {
        navigate('/vendor-registration/terms-setting/view')
      })
    } catch (err: unknown) {
      console.error('Error updating terms:', err)
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as {response?: {data?: {message?: string[] | string}}}).response?.data?.message
          : undefined
      const errorText = Array.isArray(message)
        ? message.join(', ')
        : typeof message === 'string'
          ? message
          : 'Gagal memperbarui Syarat & Ketentuan.'
      Swal.fire('Gagal', errorText, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section id='terms-setting-update'>
        <div className='card'>
          <div className='card-body text-center py-5 terms-setting-loading'>
            Memuat konten...
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id='terms-setting-update'>
      <div className='card'>
        <div className='card-body'>
          <h1 className='terms-setting-title'>Edit Syarat &amp; Ketentuan</h1>
          <p className='terms-setting-subtitle'>
            {baseVersion ? `Basis edit: versi aktif v${baseVersion}. ` : ''}
            Submit akan membuat versi baru dan menonaktifkan versi lama.
          </p>

          {error ? <div className='terms-setting-warning'>{error}</div> : null}

          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-4'>
              <Form.Label className='fw-semibold'>Tipe Dokumen</Form.Label>
              <div className='d-flex gap-4'>
                <Form.Check
                  type='radio'
                  id='doc-type-html'
                  name='documentType'
                  label='HTML (Editor Rich Text)'
                  checked={documentType === 'HTML'}
                  onChange={() => setDocumentType('HTML')}
                />
                <Form.Check
                  type='radio'
                  id='doc-type-pdf'
                  name='documentType'
                  label='PDF (Upload File)'
                  checked={documentType === 'PDF'}
                  onChange={() => setDocumentType('PDF')}
                />
              </div>
              <Form.Text className='text-muted'>
                HTML: diedit via editor rich text. PDF: upload file - disajikan read-only
                via viewer inline, tidak bisa didownload.
              </Form.Text>
            </Form.Group>

            {documentType === 'HTML' ? (
              <Form.Group className='mb-4'>
                <Form.Label className='fw-semibold'>Konten</Form.Label>
                <ReactQuill
                  theme='snow'
                  value={content}
                  onChange={setContent}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder='Tulis konten Syarat & Ketentuan di sini...'
                  className='terms-setting-quill'
                />
                <Form.Text className='text-muted'>
                  Konten diformat sebagai rich text dan disimpan sebagai HTML.
                </Form.Text>
              </Form.Group>
            ) : (
              <Form.Group className='mb-4'>
                <Form.Label className='fw-semibold'>File PDF</Form.Label>
                <Form.Control
                  type='file'
                  accept='application/pdf,.pdf'
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0] ?? null
                    setPdfFile(file)
                  }}
                />
                {pdfFile ? (
                  <Form.Text className='text-success'>
                    File terpilih: {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
                  </Form.Text>
                ) : (
                  <Form.Text className='text-muted'>
                    Upload file PDF baru untuk mengganti konten T&C.
                  </Form.Text>
                )}
              </Form.Group>
            )}

            {/* Preview output HTML final (apa yang dilihat pendaftar read-only) */}
            {documentType === 'HTML' && content.replace(/<[^>]*>/g, '').trim() ? (
              <Card className='mb-4 terms-setting-preview-card'>
                <Card.Header className='terms-setting-preview-header'>
                  Preview (tampilan pendaftar - read-only)
                </Card.Header>
                <Card.Body>
                  <div
                    className='terms-setting-preview-content'
                    dangerouslySetInnerHTML={{__html: content}}
                  />
                </Card.Body>
              </Card>
            ) : null}

            <div className='button-wrapper d-flex justify-content-start align-items-center gap-3'>
              <Button
                type='submit'
                className='btn-dark-primary button-submit m-0'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan sebagai Versi Baru'}
              </Button>
              <Button
                type='button'
                variant='light'
                className='button-submit m-0'
                disabled={isSubmitting}
                onClick={() => navigate('/vendor-registration/terms-setting/view')}
              >
                Batal
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </section>
  )
}

export {UpdateTermsAndConditions}
