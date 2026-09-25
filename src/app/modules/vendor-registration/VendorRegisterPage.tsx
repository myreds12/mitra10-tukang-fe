import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Form, Button, Card, Modal } from 'react-bootstrap';
import { publicVendorService } from '../../services/vendorRegistrationService';

import { useVendorRegistrationForm, TukangItem } from './hooks/useVendorRegistrationForm';
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
  const [, setTncScrolledToEnd] = useState<boolean>(false);

  const { formData, images, tukangList, updateField, updateImage, addTukang, removeTukang, updateTukang } =
    useVendorRegistrationForm();

  useEffect(() => {
    if (!showTncModal || tnc || tncLoading) return;
    let cancelled = false;
    setTncLoading(true);
    const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')
    const token = localStorage.getItem('accessToken')
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    fetch(`${apiUrl}/vendor-registration/terms-and-conditions`, { headers })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status} — endpoint /vendor-registration/terms-and-conditions`)
        }
        return r.json()
      })
      .then((body) => {
        const data = body?.data ?? body
        if (!cancelled && data) {
          setTnc({
            id: data.id,
            title: data.title || 'Syarat & Ketentuan',
            content: data.content || '',
            document_type: data.document_type || 'HTML',
            version: data.version || 1,
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[T&C] Failed to load active T&C:', err)
          console.error('[T&C] apiUrl =', apiUrl)
          console.error('[T&C] token present =', Boolean(token))
        }
      })
      .finally(() => {
        if (!cancelled) setTncLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [showTncModal, tnc, tncLoading])

  const handleTncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
    if (atBottom) setTncScrolledToEnd(true)
  }

  const [fieldErrors, setFieldErrors] = useState<{
    npwp_number?: string;
    ktp_number?: string;
  }>({});
  const [tukangKtpErrors, setTukangKtpErrors] = useState<Record<number, string>>({});

  const handleUpdateField = (field: string, value: any) => {
    updateField(field, value);
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof typeof fieldErrors];
        return next;
      });
    }
  };

  const handleUpdateTukang = (index: number, field: keyof TukangItem, value: any) => {
    updateTukang(index, field, value);
    if (field === 'ktp_number' && tukangKtpErrors[index]) {
      setTukangKtpErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const handleRemoveTukang = (index: number) => {
    removeTukang(index);
    setTukangKtpErrors((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const i = Number(key);
        if (i < index) next[i] = val;
        else if (i > index) next[i - 1] = val;
      });
      return next;
    });
  };

  const handleNpwpBlur = async (_field: string, value: string) => {
    const val = (value || '').trim();
    if (!val) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.npwp_number;
        return next;
      });
      return;
    }
    try {
      const res = await publicVendorService.checkUnique('npwp', val);
      const data = res.data?.data ?? res.data;
      if (data?.is_registered) {
        setFieldErrors((prev) => ({
          ...prev,
          npwp_number: data.message || 'No NPWP sudah terdaftar',
        }));
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.npwp_number;
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to check NPWP uniqueness', err);
    }
  };

  const handlePicKtpBlur = async (_field: string, value: string) => {
    const val = (value || '').trim();
    if (!val) {
      setFieldErrors((prev) => ({
        ...prev,
        ktp_number: 'Nomor KTP PIC wajib diisi',
      }));
      return;
    }
    try {
      const res = await publicVendorService.checkUnique('ktp_pic', val);
      const data = res.data?.data ?? res.data;
      if (data?.is_registered) {
        setFieldErrors((prev) => ({
          ...prev,
          ktp_number: data.message || 'KTP Sudah terdaftar',
        }));
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.ktp_number;
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to check PIC KTP uniqueness', err);
    }
  };

  const handleTukangKtpBlur = async (idx: number, value: string) => {
    const val = (value || '').trim();
    if (!val) {
      setTukangKtpErrors((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
      return;
    }

    const digits = val.replace(/\D/g, '');
    const isInternalDuplicate = tukangList.some((t, i) => {
      if (i === idx) return false;
      const otherVal = (t.ktp_number || '').trim();
      const otherDigits = otherVal.replace(/\D/g, '');
      return (otherVal && otherVal === val) || (digits && otherDigits && digits === otherDigits);
    });

    if (isInternalDuplicate) {
      setTukangKtpErrors((prev) => ({
        ...prev,
        [idx]: 'No KTP sudah terdaftar',
      }));
      return;
    }

    try {
      const res = await publicVendorService.checkUnique('ktp_tukang', val);
      const data = res.data?.data ?? res.data;
      if (data?.is_registered) {
        setTukangKtpErrors((prev) => ({
          ...prev,
          [idx]: data.message || 'No KTP sudah terdaftar',
        }));
      } else {
        setTukangKtpErrors((prev) => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to check Tukang KTP uniqueness', err);
    }
  };

  const validateForm = async () => {
    if (!formData.company_name) {
      Swal.fire({ title: 'Warning', text: 'Nama Perusahaan wajib diisi', icon: 'warning' })
      return false
    }
    if (!formData.pic_name) {
      Swal.fire({ title: 'Warning', text: 'Nama PIC wajib diisi', icon: 'warning' })
      return false
    }
    if (!formData.ktp_number || !formData.ktp_number.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        ktp_number: 'Nomor KTP PIC wajib diisi',
      }))
      Swal.fire({ title: 'Warning', text: 'Nomor KTP PIC wajib diisi', icon: 'warning' })
      return false
    }

    if (fieldErrors.npwp_number) {
      Swal.fire({ title: 'Warning', text: fieldErrors.npwp_number, icon: 'warning' })
      return false
    }
    if (fieldErrors.ktp_number) {
      Swal.fire({ title: 'Warning', text: fieldErrors.ktp_number, icon: 'warning' })
      return false
    }
    const hasTukangKtpError = Object.values(tukangKtpErrors).some(Boolean)
    if (hasTukangKtpError) {
      Swal.fire({
        title: 'Warning',
        text: 'Terdapat Nomor KTP Tukang yang sudah terdaftar atau duplikat.',
        icon: 'warning',
      })
      return false
    }

    // Pre-flight uniqueness check before submit
    try {
      if (formData.npwp_number && formData.npwp_number.trim()) {
        const npwpRes = await publicVendorService.checkUnique('npwp', formData.npwp_number.trim())
        const npwpData = npwpRes.data?.data ?? npwpRes.data
        if (npwpData?.is_registered) {
          setFieldErrors((prev) => ({ ...prev, npwp_number: npwpData.message || 'No NPWP sudah terdaftar' }))
          Swal.fire({ title: 'Warning', text: 'No NPWP sudah terdaftar', icon: 'warning' })
          return false
        }
      }

      const ktpRes = await publicVendorService.checkUnique('ktp_pic', formData.ktp_number.trim())
      const ktpData = ktpRes.data?.data ?? ktpRes.data
      if (ktpData?.is_registered) {
        setFieldErrors((prev) => ({ ...prev, ktp_number: ktpData.message || 'KTP Sudah terdaftar' }))
        Swal.fire({ title: 'Warning', text: 'KTP Sudah terdaftar', icon: 'warning' })
        return false
      }

      for (const [idx, t] of tukangList.entries()) {
        const ktp = (t.ktp_number || '').trim()
        if (ktp) {
          const tRes = await publicVendorService.checkUnique('ktp_tukang', ktp)
          const tData = tRes.data?.data ?? tRes.data
          if (tData?.is_registered) {
            setTukangKtpErrors((prev) => ({ ...prev, [idx]: tData.message || 'No KTP sudah terdaftar' }))
            Swal.fire({ title: 'Warning', text: `No KTP tukang (${ktp}) sudah terdaftar`, icon: 'warning' })
            return false
          }
        }
      }
    } catch (err) {
      console.error('Validation uniqueness check error', err)
    }

    return true
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = await validateForm()
    if (!isValid) return
    setTncAgreed(false)
    setTncScrolledToEnd(false)

    setIsLoading(true)
    setTncLoading(true)

    const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')
    const token = localStorage.getItem('accessToken')
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    try {
      const response = await fetch(
        `${apiUrl}/vendor-registration/terms-and-conditions`,
        { headers },
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const body = await response.json()
      const data = body?.data ?? body
      if (data) {
        setTnc({
          id: data.id,
          title: data.title || 'Syarat & Ketentuan',
          content: data.content || '',
          document_type: data.document_type || 'HTML',
          version: data.version || 1,
        })
      }
    } catch (err) {
      console.error('[T&C] Fetch saat submit gagal:', err)
      console.error('[T&C] apiUrl =', apiUrl)
      console.error('[T&C] token present =', Boolean(token))
    } finally {
      setTncLoading(false)
      setIsLoading(false)
      setShowTncModal(true)
    }
  }

  const handleTncLanjutkan = () => {
    if (!tnc) {
      Swal.fire({
        title: 'T&C Belum Dimuat',
        text: 'Syarat & Ketentuan belum berhasil dimuat. Coba tutup modal dan klik Daftar Sekarang lagi.',
        icon: 'warning',
      })
      return
    }
    const hasContent =
      tnc.document_type === 'PDF' ||
      (typeof tnc.content === 'string' && tnc.content.trim().length > 0)
    if (!hasContent) {
      Swal.fire({
        title: 'T&C Belum Tersedia',
        text: 'Syarat & Ketentuan belum di-set oleh Admin. Silakan hubungi Admin Mitra10.',
        icon: 'warning',
      })
      return
    }
    setShowTncModal(false)
    doActualSubmit()
  }

  const tncAvailable = !!tnc && (
    tnc.document_type === 'PDF' ||
    (typeof tnc.content === 'string' && tnc.content.trim().length > 0)
  )

  return (
    <section id="new-vendor" className="vendor-register-page">
      <Card className="vendor-register-card">
        <Card.Header className="vendor-register-header">
          <Card.Title className="vendor-register-title">
            Pendaftaran Vendor Baru
          </Card.Title>
        </Card.Header>

        <Card.Body className="vendor-register-body">
          <Form onSubmit={handleSubmit} noValidate>
            <CompanyInfoForm
              data={formData}
              onChange={handleUpdateField}
              errors={fieldErrors}
              onBlur={handleNpwpBlur}
            />
            <PicInfoForm
              data={formData}
              onChange={handleUpdateField}
              errors={fieldErrors}
              onBlur={handlePicKtpBlur}
            />
            <TukangInfoForm
              tukangList={tukangList}
              onAdd={addTukang}
              onRemove={handleRemoveTukang}
              onUpdate={handleUpdateTukang}
              ktpErrors={tukangKtpErrors}
              onKtpBlur={handleTukangKtpBlur}
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
                disabled={isLoading || tncLoading || !formData.pdp_consent}
              >
                {isLoading || tncLoading
                  ? 'Memuat Syarat & Ketentuan…'
                  : 'Daftar Sekarang'}
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
          ) : tnc.document_type === 'PDF' ? (
            <>
              <h5 className="mb-2">{tnc.title}</h5>
              <div
                className="vendor-tnc-pdf-container"
                onContextMenu={(e) => e.preventDefault()}
              >
                <iframe
                  src={`${(process.env.REACT_APP_API_URL || '').replace(/\/$/, '')}/vendor-registration/terms-and-conditions/file#toolbar=0&navpanes=0&scrollbar=1`}
                  title={tnc.title}
                  className="vendor-tnc-iframe"
                />
              </div>
            </>
          ) : !tnc.content || !tnc.content.trim() ? (
            <div className="vendor-tnc-empty p-4 text-center">
              <div className="vendor-tnc-empty-icon mb-3">
                <span style={{fontSize: 48}}>📄</span>
              </div>
              <h5 className="mb-2">Syarat & Ketentuan Belum Tersedia</h5>
              <p className="text-muted mb-0">
                Syarat & ketentuan pendaftaran vendor belum di-set oleh Admin.
                <br />
                Silakan hubungi Admin Mitra10 untuk informasi lebih lanjut.
              </p>
            </div>
          ) : (
            <>
              <h5 className="mb-2">{tnc.title}</h5>
              <div
                className="vendor-tnc-content"
                onScroll={handleTncScroll}
                ref={tncScrollRef}
                dangerouslySetInnerHTML={{ __html: tnc.content }}
              />
            </>
          )}
          </Modal.Body>
          <Modal.Footer className="vendor-tnc-footer">
          <div className="vendor-tnc-agree">
            <Form.Check
              id="vendor-tnc-agree"
              type="checkbox"
              checked={tncAgreed}
              disabled={tncLoading || !tncAvailable}
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
              disabled={isLoading || !tncAgreed || !tncAvailable}
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
