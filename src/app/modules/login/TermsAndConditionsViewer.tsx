import './TermsAndConditionsViewer.css'
import {useEffect, useState} from 'react'
import {Modal, Spinner} from 'react-bootstrap'
import axios from 'axios'

interface TermsData {
  id: number
  title: string
  content: string // HTML content
  version: number
  updated_at: string
}

/**
 * Viewer READ-ONLY untuk dokumen Syarat & Ketentuan (T&C).
 *
 * Desain proteksi download:
 * - Konten T&C disimpan sebagai HTML di database (bukan file PDF) dan di-render
 *   langsung di modal - tidak ada file asli yang bisa di-download.
 * - Tidak ada tombol download/print di viewer ini.
 * - Render dengan `dangerouslySetInnerHTML` di container yang:
 *   - select-proof (`user-select: none`) supaya sulit di-copy,
 *   - tanpa toolbar/print UI.
 * - Print halaman diblok via CSS @media print (content disembunyikan saat print).
 *
 * Catatan: ini proteksi best-effort di sisi klien (sama seperti viewer PDF yang
 * menonaktifkan toolbar). User yang benar-benar mau menyalin teks selalu bisa
 * (screenshot dsb), tapi tidak ada file asli yang dibagikan.
 */
const TermsAndConditionsViewer: React.FC<{show: boolean; onClose: () => void}> = ({show, onClose}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const [terms, setTerms] = useState<TermsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTerms = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.get(`${apiUrl}/vendor-registration/terms-and-conditions`, {
        headers: {Accept: 'application/json'},
        timeout: 10000,
      })
      // Response shape: { status, message, data } (TransformInterceptor)
      const data = response.data?.data ?? response.data
      setTerms(data)
    } catch (err) {
      console.error('Error fetching terms and conditions:', err)
      setError('Dokumen Syarat & Ketentuan tidak dapat dimuat. Silakan coba beberapa saat lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (show && !terms && !isLoading) {
      fetchTerms()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      scrollable
      size='lg'
      dialogClassName='terms-viewer-modal'
      backdrop='static'
    >
      <Modal.Header closeButton className='terms-viewer-header'>
        <Modal.Title as='h5' className='terms-viewer-title'>
          {terms?.title || 'Syarat & Ketentuan'}
          {terms?.version ? (
            <span className='terms-viewer-version ms-2'>v{terms.version}</span>
          ) : null}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='terms-viewer-body'>
        {isLoading ? (
          <div className='d-flex justify-content-center align-items-center py-5'>
            <Spinner animation='border' variant='primary' />
            <span className='ms-3 text-muted'>Memuat dokumen...</span>
          </div>
        ) : error ? (
          <div className='text-center py-5'>
            <p className='text-danger mb-3'>{error}</p>
            <button type='button' className='btn btn-sm btn-outline-primary' onClick={fetchTerms}>
              Coba Lagi
            </button>
          </div>
        ) : terms ? (
          <div
            className='terms-viewer-content'
            // Konten HTML dari database (dikelola Admin). Read-only: user-select none + no download button.
            dangerouslySetInnerHTML={{__html: terms.content}}
          />
        ) : null}
      </Modal.Body>

      <Modal.Footer className='terms-viewer-footer'>
        <span className='text-muted fs-7'>
          Dokumen ini hanya dapat dilihat (read-only) dan tidak dapat diunduh.
        </span>
        <button type='button' className='btn btn-primary' onClick={onClose}>
          Tutup
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default TermsAndConditionsViewer
