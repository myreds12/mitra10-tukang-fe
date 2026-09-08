import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Row,
  Col,
  Input,
  Select,
  Button,
  Upload,
  Spin,
  message,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  BankOutlined,
  FileProtectOutlined,
  IdcardOutlined,
  ShopOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import './RegistrantDocuments.css';
import {
  vendorPortalService,
  VendorDocumentData,
} from '../../services/vendorPortalService';
import { resolveImageUrl } from '../../components/home-content-shared/imageHelper';

const { Option } = Select;
const { TextArea } = Input;

const RegistrantDocuments: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docData, setDocData] = useState<VendorDocumentData | null>(null);

  // Form text fields
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [ktpNumber, setKtpNumber] = useState('');
  const [npwpNumber, setNpwpNumber] = useState('');
  const [bankId, setBankId] = useState<number | null>(null);

  // Uploaded new files & preview blobs
  const [ktpPhotoFile, setKtpPhotoFile] = useState<File | null>(null);
  const [ktpPhotoPreview, setKtpPhotoPreview] = useState<string | null>(null);

  const [npwpPhotoFile, setNpwpPhotoFile] = useState<File | null>(null);
  const [npwpPhotoPreview, setNpwpPhotoPreview] = useState<string | null>(null);

  const [comproPhotoFile, setComproPhotoFile] = useState<File | null>(null);
  const [comproPhotoPreview, setComproPhotoPreview] = useState<string | null>(null);

  const [siupPhotoFile, setSiupPhotoFile] = useState<File | null>(null);
  const [siupPhotoPreview, setSiupPhotoPreview] = useState<string | null>(null);

  const [vendorPhotoFile, setVendorPhotoFile] = useState<File | null>(null);
  const [vendorPhotoPreview, setVendorPhotoPreview] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await vendorPortalService.getMyDocuments();
      setDocData(data);
      const reg = data.registration || ({} as any);
      setCompanyName(reg.company_name || '');
      setAddress(reg.address || '');
      setPhoneNumber(reg.phone_number || '');
      setPicName(reg.pic_name || '');
      setPicPhone(reg.pic_phone || '');
      setKtpNumber(reg.ktp_number || '');
      setNpwpNumber(reg.npwp_number || '');
      setBankId(reg.bank_id || null);

      if (reg.ktp_photo) setKtpPhotoPreview(resolveImageUrl(reg.ktp_photo));
      if (reg.npwp_photo) setNpwpPhotoPreview(resolveImageUrl(reg.npwp_photo));
      if (reg.compro_photo) setComproPhotoPreview(resolveImageUrl(reg.compro_photo));
      if (reg.siup_photo) setSiupPhotoPreview(resolveImageUrl(reg.siup_photo));
      if (reg.vendor_photo) setVendorPhotoPreview(resolveImageUrl(reg.vendor_photo));
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      message.error('Gagal memuat data kelengkapan dokumen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSelectFile = (
    file: File,
    setFile: (f: File) => void,
    setPreview: (url: string) => void,
  ) => {
    setFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    message.info(`File "${file.name}" dipilih. Klik "Simpan Dokumen" untuk mengunggah.`);
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (companyName) fd.append('company_name', companyName.trim());
      if (address) fd.append('address', address.trim());
      if (phoneNumber) fd.append('phone_number', phoneNumber.trim());
      if (picName) fd.append('pic_name', picName.trim());
      if (picPhone) fd.append('pic_phone', picPhone.trim());
      if (ktpNumber) fd.append('ktp_number', ktpNumber.trim());
      if (npwpNumber) fd.append('npwp_number', npwpNumber.trim());
      if (bankId) fd.append('bank_id', String(bankId));

      if (ktpPhotoFile) fd.append('ktp_photo', ktpPhotoFile);
      if (npwpPhotoFile) fd.append('npwp_photo', npwpPhotoFile);
      if (comproPhotoFile) fd.append('compro_photo', comproPhotoFile);
      if (siupPhotoFile) fd.append('siup_photo', siupPhotoFile);
      if (vendorPhotoFile) fd.append('vendor_photo', vendorPhotoFile);

      await vendorPortalService.updateMyDocuments(fd);

      Swal.fire({
        title: 'Berhasil Disimpan!',
        text: 'Data dan berkas dokumen kelengkapan profil Anda berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#1E2A78',
      });

      // Refresh to calculate realtime percentage
      fetchDocuments();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan kelengkapan dokumen';
      Swal.fire('Gagal Menyimpan', Array.isArray(msg) ? msg.join('<br/>') : String(msg), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size='large' tip='Memuat data dokumen...' />
      </div>
    );
  }

  const flags = docData?.profile_flags || {
    company_data: false,
    legal_docs: false,
    portfolio_photos: false,
    certification: false,
    bank_account: false,
  };

  const completionPct = docData?.profile_completion ?? 0;
  const completedCount = docData?.profile_completed ?? 0;

  return (
    <div className='reg-doc-container'>
      {/* HEADER */}
      <div className='reg-doc-header'>
        <button
          type='button'
          className='reg-doc-back-btn'
          onClick={() => navigate('/pendaftar/home')}
        >
          <ArrowLeftOutlined /> Kembali ke Beranda Pendaftar
        </button>
        <h1 className='reg-doc-title'>Kelengkapan Dokumen Pendaftaran Vendor</h1>
        <p className='reg-doc-subtitle'>
          Lengkapi data profil dan unggah berkas fisik dokumen di bawah ini untuk mempercepat proses verifikasi oleh tim Admin Mitra10.
        </p>
      </div>

      {/* COMPLETION SUMMARY CARD */}
      <div className='reg-doc-summary-card'>
        <div className='reg-doc-summary-top'>
          <div className='reg-doc-summary-pct'>
            Profil Anda {completionPct}% Lengkap
          </div>
          <div className='reg-doc-summary-count'>
            {completedCount} dari 5 bagian dokumen sudah dilengkapi
          </div>
        </div>

        <div className='reg-doc-progress-bar'>
          <div
            className='reg-doc-progress-fill'
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className='reg-doc-badges'>
          <span className={`reg-doc-badge-item ${flags.company_data ? 'completed' : ''}`}>
            {flags.company_data ? <CheckCircleFilled /> : <CloseCircleFilled />} Data Usaha
          </span>
          <span className={`reg-doc-badge-item ${flags.legal_docs ? 'completed' : ''}`}>
            {flags.legal_docs ? <CheckCircleFilled /> : <CloseCircleFilled />} Dokumen Legalitas (KTP/NPWP)
          </span>
          <span className={`reg-doc-badge-item ${flags.portfolio_photos ? 'completed' : ''}`}>
            {flags.portfolio_photos ? <CheckCircleFilled /> : <CloseCircleFilled />} Portofolio &amp; Profil
          </span>
          <span className={`reg-doc-badge-item ${flags.certification ? 'completed' : ''}`}>
            {flags.certification ? <CheckCircleFilled /> : <CloseCircleFilled />} Sertifikasi &amp; SIUP
          </span>
          <span className={`reg-doc-badge-item ${flags.bank_account ? 'completed' : ''}`}>
            {flags.bank_account ? <CheckCircleFilled /> : <CloseCircleFilled />} Rekening Bank
          </span>
        </div>
      </div>

      {completionPct === 100 && (
        <Alert
          message='Selamat! Seluruh kelengkapan dokumen pendaftaran Anda telah lengkap. Tim verifikator Mitra10 sedang mereview berkas Anda.'
          type='success'
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {/* SECTION 1: DATA USAHA */}
      <div className='reg-doc-section-card'>
        <div className='reg-doc-section-head'>
          <div className='reg-doc-section-title-wrap'>
            <span className='reg-doc-section-icon'><ShopOutlined /></span>
            <h3 className='reg-doc-section-title'>1. Data Usaha / Perusahaan</h3>
          </div>
          <span className={`reg-doc-section-status-tag ${flags.company_data ? 'complete' : 'incomplete'}`}>
            {flags.company_data ? '✓ Lengkap' : 'Belum Lengkap'}
          </span>
        </div>

        <Row gutter={16}>
          <Col xs={24} md={12} style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Nama Usaha / Perusahaan</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder='Contoh: CV Berkah Teknik Jaya / Toko Bangunan Sentosa'
              style={{ marginTop: 4 }}
            />
          </Col>
          <Col xs={24} md={12} style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Nomor Telepon Usaha</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder='Contoh: 081234567890 / 021-1234567'
              style={{ marginTop: 4 }}
            />
          </Col>
          <Col xs={24} style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Alamat Lengkap Usaha</label>
            <TextArea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder='Alamat workshop, gudang, atau kantor operasional Anda...'
              style={{ marginTop: 4 }}
            />
          </Col>
          <Col xs={24} md={12} style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Nama Penanggung Jawab (PIC)</label>
            <Input
              value={picName}
              onChange={(e) => setPicName(e.target.value)}
              placeholder='Nama PIC utama'
              style={{ marginTop: 4 }}
            />
          </Col>
          <Col xs={24} md={12} style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>No. Handphone / WhatsApp PIC</label>
            <Input
              value={picPhone}
              onChange={(e) => setPicPhone(e.target.value)}
              placeholder='Nomor WhatsApp aktif PIC'
              style={{ marginTop: 4 }}
            />
          </Col>
        </Row>
      </div>

      {/* SECTION 2: DOKUMEN LEGALITAS */}
      <div className='reg-doc-section-card'>
        <div className='reg-doc-section-head'>
          <div className='reg-doc-section-title-wrap'>
            <span className='reg-doc-section-icon'><IdcardOutlined /></span>
            <h3 className='reg-doc-section-title'>2. Dokumen Legalitas (KTP &amp; NPWP)</h3>
          </div>
          <span className={`reg-doc-section-status-tag ${flags.legal_docs ? 'complete' : 'incomplete'}`}>
            {flags.legal_docs ? '✓ Lengkap' : 'Belum Lengkap'}
          </span>
        </div>

        <Row gutter={20}>
          {/* KTP */}
          <Col xs={24} md={12} style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Nomor KTP (NIK)</label>
            <Input
              value={ktpNumber}
              onChange={(e) => setKtpNumber(e.target.value)}
              placeholder='16 digit NIK pemilik / penanggung jawab'
              style={{ marginTop: 4, marginBottom: 8 }}
            />

            <div className='reg-doc-upload-box'>
              <div className='reg-doc-upload-preview'>
                {ktpPhotoPreview ? (
                  <img src={ktpPhotoPreview} alt='Foto KTP' className='reg-doc-upload-thumb' />
                ) : (
                  <div className='reg-doc-upload-thumb' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                    KTP
                  </div>
                )}
                <div className='reg-doc-upload-info'>
                  <span className='reg-doc-upload-label'>Foto / Scan KTP Asli</span>
                  {ktpPhotoPreview ? (
                    <span className='reg-doc-upload-status'>✓ Berkas tersedia</span>
                  ) : (
                    <span className='reg-doc-upload-empty'>Belum ada foto</span>
                  )}
                </div>
              </div>
              <Upload
                accept='image/*,application/pdf'
                showUploadList={false}
                beforeUpload={(f) => handleSelectFile(f, setKtpPhotoFile, setKtpPhotoPreview)}
              >
                <Button size='small' icon={<UploadOutlined />}>
                  {ktpPhotoPreview ? 'Ganti Foto' : 'Unggah KTP'}
                </Button>
              </Upload>
            </div>
          </Col>

          {/* NPWP */}
          <Col xs={24} md={12} style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Nomor Pokok Wajib Pajak (NPWP)</label>
            <Input
              value={npwpNumber}
              onChange={(e) => setNpwpNumber(e.target.value)}
              placeholder='Nomor NPWP Badan / Pribadi'
              style={{ marginTop: 4, marginBottom: 8 }}
            />

            <div className='reg-doc-upload-box'>
              <div className='reg-doc-upload-preview'>
                {npwpPhotoPreview ? (
                  <img src={npwpPhotoPreview} alt='Foto NPWP' className='reg-doc-upload-thumb' />
                ) : (
                  <div className='reg-doc-upload-thumb' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                    NPWP
                  </div>
                )}
                <div className='reg-doc-upload-info'>
                  <span className='reg-doc-upload-label'>Foto / Scan NPWP</span>
                  {npwpPhotoPreview ? (
                    <span className='reg-doc-upload-status'>✓ Berkas tersedia</span>
                  ) : (
                    <span className='reg-doc-upload-empty'>Belum ada foto</span>
                  )}
                </div>
              </div>
              <Upload
                accept='image/*,application/pdf'
                showUploadList={false}
                beforeUpload={(f) => handleSelectFile(f, setNpwpPhotoFile, setNpwpPhotoPreview)}
              >
                <Button size='small' icon={<UploadOutlined />}>
                  {npwpPhotoPreview ? 'Ganti Foto' : 'Unggah NPWP'}
                </Button>
              </Upload>
            </div>
          </Col>
        </Row>
      </div>

      {/* SECTION 3: PORTOFOLIO & PROFIL USAHA */}
      <div className='reg-doc-section-card'>
        <div className='reg-doc-section-head'>
          <div className='reg-doc-section-title-wrap'>
            <span className='reg-doc-section-icon'><FileDoneOutlined /></span>
            <h3 className='reg-doc-section-title'>3. Portofolio Pekerjaan &amp; Foto Usaha</h3>
          </div>
          <span className={`reg-doc-section-status-tag ${flags.portfolio_photos ? 'complete' : 'incomplete'}`}>
            {flags.portfolio_photos ? '✓ Lengkap' : 'Belum Lengkap'}
          </span>
        </div>

        <Row gutter={20}>
          {/* Company Profile / Portofolio */}
          <Col xs={24} md={12} style={{ marginBottom: 16 }}>
            <div className='reg-doc-upload-box'>
              <div className='reg-doc-upload-preview'>
                {comproPhotoPreview ? (
                  <img src={comproPhotoPreview} alt='Portofolio' className='reg-doc-upload-thumb' />
                ) : (
                  <div className='reg-doc-upload-thumb' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                    📁
                  </div>
                )}
                <div className='reg-doc-upload-info'>
                  <span className='reg-doc-upload-label'>Dokumen Portofolio / Hasil Pekerjaan</span>
                  {comproPhotoPreview ? (
                    <span className='reg-doc-upload-status'>✓ Berkas tersedia</span>
                  ) : (
                    <span className='reg-doc-upload-empty'>Unggah foto proyek/instalasi</span>
                  )}
                </div>
              </div>
              <Upload
                accept='image/*,application/pdf'
                showUploadList={false}
                beforeUpload={(f) => handleSelectFile(f, setComproPhotoFile, setComproPhotoPreview)}
              >
                <Button size='small' icon={<UploadOutlined />}>
                  {comproPhotoPreview ? 'Ganti Berkas' : 'Unggah Portofolio'}
                </Button>
              </Upload>
            </div>
          </Col>

          {/* Foto Tempat Usaha / Tim */}
          <Col xs={24} md={12} style={{ marginBottom: 16 }}>
            <div className='reg-doc-upload-box'>
              <div className='reg-doc-upload-preview'>
                {vendorPhotoPreview ? (
                  <img src={vendorPhotoPreview} alt='Tempat Usaha' className='reg-doc-upload-thumb' />
                ) : (
                  <div className='reg-doc-upload-thumb' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                    🏢
                  </div>
                )}
                <div className='reg-doc-upload-info'>
                  <span className='reg-doc-upload-label'>Foto Kantor / Workshop / Tim Vendor</span>
                  {vendorPhotoPreview ? (
                    <span className='reg-doc-upload-status'>✓ Berkas tersedia</span>
                  ) : (
                    <span className='reg-doc-upload-empty'>Unggah foto tempat usaha</span>
                  )}
                </div>
              </div>
              <Upload
                accept='image/*,application/pdf'
                showUploadList={false}
                beforeUpload={(f) => handleSelectFile(f, setVendorPhotoFile, setVendorPhotoPreview)}
              >
                <Button size='small' icon={<UploadOutlined />}>
                  {vendorPhotoPreview ? 'Ganti Foto' : 'Unggah Foto Usaha'}
                </Button>
              </Upload>
            </div>
          </Col>
        </Row>
      </div>

      {/* SECTION 4: SERTIFIKASI & PERIZINAN */}
      <div className='reg-doc-section-card'>
        <div className='reg-doc-section-head'>
          <div className='reg-doc-section-title-wrap'>
            <span className='reg-doc-section-icon'><FileProtectOutlined /></span>
            <h3 className='reg-doc-section-title'>4. Sertifikasi Keahlian &amp; SIUP/NIB</h3>
          </div>
          <span className={`reg-doc-section-status-tag ${flags.certification ? 'complete' : 'incomplete'}`}>
            {flags.certification ? '✓ Lengkap' : 'Belum Lengkap'}
          </span>
        </div>

        <div className='reg-doc-upload-box'>
          <div className='reg-doc-upload-preview'>
            {siupPhotoPreview ? (
              <img src={siupPhotoPreview} alt='SIUP/NIB' className='reg-doc-upload-thumb' />
            ) : (
              <div className='reg-doc-upload-thumb' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                📜
              </div>
            )}
            <div className='reg-doc-upload-info'>
              <span className='reg-doc-upload-label'>Surat Izin Usaha Perdagangan (SIUP) / NIB / Sertifikat Keahlian</span>
              {siupPhotoPreview ? (
                <span className='reg-doc-upload-status'>✓ Berkas perizinan/sertifikasi tersedia</span>
              ) : (
                <span className='reg-doc-upload-empty'>Unggah foto atau scan PDF surat izin/NIB</span>
              )}
            </div>
          </div>
          <Upload
            accept='image/*,application/pdf'
            showUploadList={false}
            beforeUpload={(f) => handleSelectFile(f, setSiupPhotoFile, setSiupPhotoPreview)}
          >
            <Button size='small' icon={<UploadOutlined />}>
              {siupPhotoPreview ? 'Ganti Berkas' : 'Unggah SIUP / Sertifikasi'}
            </Button>
          </Upload>
        </div>
      </div>

      {/* SECTION 5: REKENING BANK */}
      <div className='reg-doc-section-card'>
        <div className='reg-doc-section-head'>
          <div className='reg-doc-section-title-wrap'>
            <span className='reg-doc-section-icon'><BankOutlined /></span>
            <h3 className='reg-doc-section-title'>5. Rekening Bank untuk Pencairan Dana</h3>
          </div>
          <span className={`reg-doc-section-status-tag ${flags.bank_account ? 'complete' : 'incomplete'}`}>
            {flags.bank_account ? '✓ Lengkap' : 'Belum Lengkap'}
          </span>
        </div>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Pilih Bank Tujuan Pencairan</label>
            <Select
              value={bankId}
              onChange={(val) => setBankId(val)}
              placeholder='Pilih bank resmi untuk transfer pembayaran...'
              style={{ width: '100%', marginTop: 4 }}
            >
              {(docData?.banks || []).map((b) => (
                <Option key={b.id} value={b.id}>
                  {b.bank_name} {b.code ? `(${b.code})` : ''}
                </Option>
              ))}
            </Select>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'block', marginTop: 4 }}>
              Dana pembayaran order pekerjaan yang telah selesai akan ditransfer ke bank ini.
            </span>
          </Col>
        </Row>
      </div>

      {/* STICKY FOOTER ACTIONS */}
      <div className='reg-doc-footer-sticky'>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>
            Pastikan seluruh data dan berkas yang Anda unggah valid dan terbaca jelas.
          </span>
          <span style={{ display: 'block', fontSize: 11, color: '#6B7280' }}>
            Perubahan status kelengkapan profil akan otomatis terupdate secara realtime.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={() => navigate('/pendaftar/home')}>
            Batal
          </Button>
          <Button
            type='primary'
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            style={{ background: '#1E2A78', borderColor: '#1E2A78', minWidth: 150 }}
          >
            Simpan Dokumen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrantDocuments;
