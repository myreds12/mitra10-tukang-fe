import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Form, Button, Card, Modal } from 'react-bootstrap';
import { publicVendorService } from '../../services/vendorRegistrationService';

import { useVendorRegistrationForm } from './hooks/useVendorRegistrationForm';
import { CompanyInfoForm } from './components/forms/CompanyInfoForm';
import { PicInfoForm } from './components/forms/PicInfoForm';
import { DocumentUploadForm } from './components/forms/DocumentUploadForm';
import { TukangInfoForm } from './components/forms/TukangInfoForm';

import '../../components/admin-ho/vendor/new_vendor/NewVendor.css';
import './VendorRegisterPage.css';

interface ActiveTerms {
  id: number
  title: string
  content: string
  document_type: 'HTML' | 'PDF'
  version: number
}

const VendorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTncModal, setShowTncModal] = useState<boolean>(false);
  const [tnc, setTnc] = useState<ActiveTerms | null>(null);
  const [tncLoading, setTncLoading] = useState<boolean>(false);
  const [tncAgreed, setTncAgreed] = useState<boolean>(false);
  const tncScrollRef = useRef<HTMLDivElement | null>(null);
  const [tncScrolledToEnd, setTncScrolledToEnd] = useState<boolean>(false);

  const { formData, images, tukangList, updateField, updateImage, addTukang, removeTukang, updateTukang } =
    useVendorRegistrationForm();

  useEffect(() => {
    if (!showTncModal || tnc) return;
    let cancelled = false;
    setTncLoading(true);
    const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')
    const token = localStorage.getItem('accessToken')
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    fetch(`${apiUrl}/vendor-registration/terms-and-conditions`, { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((body) => {
        const data = body?.data ?? body
        if (!cancelled && data) {
          setTnc({
            id: data.id,
            title: data.name || 'Syarat & Ketentuan',
            content: data.content || '',
            document_type: data.document_type || 'HTML',
            version: data.version || 1,
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load active T&C:', err)
        }
      })
      .finally(() => {
        if (!cancelled) setTncLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [showTncModal, tnc])

  const handleTncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
    if (atBottom) setTncScrolledToEnd(true)
  }

  const validateForm = () => {
    let valid = true

    if (!formData.company_name) {
      Swal.fire({ title: 'Warning', text: 'Nama Perusahaan wajib diisi', icon: 'warning' })
      valid = false
    } else if (!formData.pic_name) {
      Swal.fire({ title: 'Warning', text: 'Nama PIC wajib diisi', icon: 'warning' })
      valid = false
    }
    return valid
  }

  const doActualSubmit = async () => {
    setIsLoading(true)
    try {
      const submitData = new FormData()

      submitData.append('company_name', formData.company_name)
      submitData.append('address', formData.address)
      submitData.append('phone_number', formData.phone_number)
      submitData.append('email_address', formData.email_address)
      submitData.append('pic_name', formData.pic_name)
      submitData.append('pic_email', formData.pic_email)
      submitData.append('pic_phone', formData.pic_phone)
      submitData.append('pdp_consent', String(Boolean(formData.pdp_consent)))

      if (formData.ktp_number) submitData.append('ktp_number', formData.ktp_number)
      if (formData.npwp_number) submitData.append('npwp_number', formData.npwp_number)
      if (formData.bank_id) submitData.append('bank_id', String(formData.bank_id))

      if (formData.areas.length > 0) {
        submitData.append('areas', JSON.stringify(formData.areas))
      }
      if (formData.service_types.length > 0) {
        submitData.append('service_types', JSON.stringify(formData.service_types))
      }

      if (images.vendor_image?.file) submitData.append('vendor_photo', images.vendor_image.file, images.vendor_image.fileName)
      if (images.ktp_image?.file) submitData.append('ktp_photo', images.ktp_image.file, images.ktp_image.fileName)
      if (images.npwp_image?.file) submitData.append('npwp_photo', images.npwp_image.file, images.npwp_image.fileName)
      if (images.compro_image?.file) submitData.append('compro_photo', images.compro_image.file, images.compro_image.fileName)
      if (images.surat_permohonan_image?.file) submitData.append('surat_permohonan_photo', images.surat_permohonan_image.file, images.surat_permohonan_image.fileName)
      if (images.pks_image?.file) submitData.append('pks_photo', images.pks_image.file, images.pks_image.fileName)
      if (images.siup_image?.file) submitData.append('siup_photo', images.siup_image.file, images.siup_image.fileName)

      if (tukangList.length > 0) {
        submitData.append('tukang_data', JSON.stringify(tukangList))
      }

      await publicVendorService.register(submitData)

      Swal.fire({
        title: 'Success',
        text: 'Pendaftaran berhasil disubmit! Mohon tunggu konfirmasi dari admin.',
        icon: 'success',
      })

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Terjadi kesalahan saat pendaftaran',
        icon: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setTncAgreed(false)
    setTncScrolledToEnd(false)
    setShowTncModal(true)
  }

  const handleTncLanjutkan = () => {
    setShowTncModal(false)
    doActualSubmit()
  }

  return (
    <section id="new-vendor" className="vendor-register-page">
      <Card className="vendor-register-card">
        <Card.Header className="vendor-register-header">
          <Card.Title className="vendor-register-title">
            Pendaftaran Vendor Baru
          </Card.Title>
        </Card.Header>

        <Card.Body className="vendor-register-body">
          <Form onSubmit={handleSubmit}>
            <CompanyInfoForm data={formData} onChange={updateField} />
            <PicInfoForm data={formData} onChange={updateField} />
            <TukangInfoForm
              tukangList={tukangList}
              onAdd={addTukang}
              onRemove={removeTukang}
              onUpdate={updateTukang}
            />
            <DocumentUploadForm images={images} onChange={updateImage} />

            <div className="pdp-consent-box">
              <Form.Check
                id="pdp-consent"
                type="checkbox"
                checked={Boolean(formData.pdp_consent)}
                onChange={(e) => updateField('pdp_consent', e.target.checked)}
                label={
                  <span>
                    Saya menyetujui pemrosesan data pribadi perusahaan, PIC, dokumen, dan data
                    tukang untuk keperluan verifikasi pendaftaran vendor sesuai Undang-Undang
                    Perlindungan Data Pribadi (UU PDP).
                  </span>
                }
              />
            </div>

            <div className="vendor-register-submit">
              <Button
                className="vendor-register-submit-button"
                type="submit"
                disabled={isLoading || !formData.pdp_consent}
              >
                {isLoading ? 'Menyimpan...' : 'Daftar Sekarang'}
              </Button>
            </div>
          </Form>

          <div className="text-center mt-4">
            <Link to="/login" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
              Sudah punya akun? <strong style={{ color: '#020080' }}>Login</strong>
            </Link>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showTncModal}
        onHide={() => {
          if (!isLoading) setShowTncModal(false)
        }}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
        className="vendor-tnc-modal"
      >
        <Modal.Header closeButton={!isLoading}>
          <Modal.Title>Syarat & Ketentuan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tncLoading ? (
            <div className="text-center py-4">Memuat syarat & ketentuan…</div>
          ) : !tnc ? (
            <div className="text-center py-4 text-danger">
              Gagal memuat syarat & ketentuan. Coba refresh halaman.
            </div>
          ) : (
            <>
              <h5 className="mb-2">{tnc.title}</h5>
              {tnc.document_type === 'PDF' ? (
                <iframe
                  src={
                    tnc.content.startsWith('http')
                      ? tnc.content
                      : `${(process.env.REACT_APP_API_URL || '').replace(/\/$/, '')}/public/${tnc.content.replace(/^uploads\//, '')}`
                  }
                  title={tnc.title}
                  className="vendor-tnc-iframe"
                />
              ) : (
                <div
                  className="vendor-tnc-content"
                  onScroll={handleTncScroll}
                  ref={tncScrollRef}
                  dangerouslySetInnerHTML={{ __html: tnc.content }}
                />
              )}
          </>
        )}
        </Modal.Body>
        <Modal.Footer className="vendor-tnc-footer">
          <div className="vendor-tnc-agree">
            <Form.Check
              id="vendor-tnc-agree"
              type="checkbox"
              checked={tncAgreed}
              disabled={tncLoading}
              onChange={(e) => setTncAgreed(e.target.checked)}
              label={
                <span>
                  Saya telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan di
                  atas.
                </span>
              }
            />
          </div>
          <div>
            <Button
              variant="secondary"
              onClick={() => setShowTncModal(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleTncLanjutkan}
              disabled={isLoading || !tncAgreed}
            >
              {isLoading ? 'Menyimpan…' : 'Lanjutkan Pendaftaran'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default VendorRegisterPage
