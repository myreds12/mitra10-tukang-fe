import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Modal, Spin, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  EyeOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'
import { vendorSpService } from '../../../services/vendorSpService'
import {
  VendorSpActionButton,
  VendorSpOrderLink,
  VendorSpPill,
  vendorSpTableClassName,
  formatQuarterDateBounds,
  formatViolationIncidentDate,
  formatViolationIncidentDateTime,
} from './VendorSpTable'
import './VendorSpFilter.css'

const getSpLevelText = (level?: number | null) => (level ? `SP${level}` : '-')

const getSpLevelColor = (level?: number | null) => {
  if (level === 1) return 'orange'
  if (level === 2) return 'red'
  if (level === 3) return 'dark'
  return 'default'
}

const getStatusText = (status?: number | null) => {
  if (status === 1) return 'Aktif'
  if (status === 2) return 'Selesai'
  if (status === 3) return 'Diperpanjang'
  return '-'
}

const getStatusColor = (status?: number | null) => {
  if (status === 1) return 'processing'
  if (status === 2) return 'success'
  if (status === 3) return 'warning'
  return 'default'
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('id-ID') : '-'

interface DetailVendorSpModalProps {
  spId: number | string | null
  open: boolean
  onClose: () => void
  onUpdated?: () => void
}

const DetailVendorSpModal: React.FC<DetailVendorSpModalProps> = ({
  spId,
  open,
  onClose,
  onUpdated,
}) => {
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  const isVendorRole = userRole === 'Admin Vendor' || userRole === 'Owner Vendor'
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [notesInput, setNotesInput] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [selectedViolation, setSelectedViolation] = useState<any>(null)
  const [exportingPenalty, setExportingPenalty] = useState(false)
  const [exportingCertificate, setExportingCertificate] = useState(false)

  const handleExportPenalty = async () => {
    if (!detail?.vendor?.id || !detail?.quarter || !detail?.year) return
    setExportingPenalty(true)
    try {
      await vendorSpService.generatePenaltyReceipt({
        vendor_id: detail.vendor.id,
        quarter: detail.quarter,
        year: detail.year,
      })
      Swal.fire('Berhasil', 'Bukti SP PDF berhasil dibuat dan diunduh', 'success')
    } catch (error: any) {
      Swal.fire(
        'Error',
        error?.message || 'Gagal membuat Bukti SP PDF',
        'error',
      )
    } finally {
      setExportingPenalty(false)
    }
  }

  const handleExportCertificate = async () => {
    if (!detail?.vendor?.id || !detail?.quarter || !detail?.year) return
    setExportingCertificate(true)
    try {
      await vendorSpService.generateNoViolationCertificate({
        vendor_id: detail.vendor.id,
        quarter: detail.quarter,
        year: detail.year,
      })
      Swal.fire('Berhasil', 'Surat Bebas Pelanggaran PDF berhasil dibuat dan diunduh', 'success')
    } catch (error: any) {
      Swal.fire(
        'Tidak Bisa Generate',
        error?.message || 'Gagal membuat Surat Bebas Pelanggaran PDF',
        'warning',
      )
    } finally {
      setExportingCertificate(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!detail?.id) return
    setSavingNotes(true)
    try {
      const response = await vendorSpService.updateNotes(detail.id, notesInput)
      const updated = response.data?.data || response.data
      setDetail((prev: any) => ({
        ...prev,
        ...(updated || {}),
        notes: notesInput,
      }))
      onUpdated?.()
      Swal.fire('Berhasil', 'Catatan Surat Peringatan berhasil disimpan', 'success')
    } catch (error: any) {
      Swal.fire(
        'Error',
        error?.response?.data?.message || 'Gagal menyimpan catatan Surat Peringatan',
        'error',
      )
    } finally {
      setSavingNotes(false)
    }
  }

  const hasActiveViolationsInQuarter =
    Array.isArray(detail?.sp_details) && detail.sp_details.length > 0

  const fetchDetail = async (targetId: number | string) => {
    setLoading(true)
    try {
      const response = await vendorSpService.getById(targetId)
      const data = response.data?.data || response.data || null
      setDetail(data)
      setNotesInput(data?.notes ?? '')
    } catch (error: any) {
      Swal.fire('Error', error?.response?.data?.message || 'Gagal mengambil detail SP vendor', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && spId) {
      fetchDetail(spId)
    } else if (!open) {
      setSelectedViolation(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, spId])

  const violationRows = Array.isArray(detail?.sp_details)
    ? detail.sp_details.map((item: any) => item.violation_log).filter(Boolean)
    : []

  const quarterBounds = formatQuarterDateBounds(
    detail?.quarter,
    detail?.year,
    detail?.end_date,
    detail?.status,
  )

  const columns: ColumnsType<any> = [
    {
      title: 'No',
      key: 'no',
      width: 65,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Order ID',
      key: 'order_id',
      width: 115,
      align: 'center',
      render: (_, record) => (
        <VendorSpOrderLink orderId={record.order_id ?? record.orders?.id} />
      ),
    },
    {
      title: 'Kode',
      key: 'code',
      width: 150,
      render: (_, record) => (
        <VendorSpPill color='primary'>{record.violation_type?.code || '-'}</VendorSpPill>
      ),
    },
    {
      title: 'Nama Pelanggaran',
      key: 'name',
      render: (_, record) => (
        <span className='fw-semibold'>{record.violation_type?.name || '-'}</span>
      ),
    },
    {
      title: 'Poin',
      key: 'point',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <VendorSpPill
          color={(record.adjusted_point ?? record.violation_type?.point ?? 0) >= 2 ? 'red' : 'orange'}
        >
          {record.adjusted_point ?? record.violation_type?.point ?? 0} Poin
        </VendorSpPill>
      ),
    },
    {
      title: 'Periode',
      key: 'period',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <span className='fw-semibold'>Q{record.quarter || '-'} {record.year || ''}</span>
      ),
    },
    {
      title: 'Tanggal Kejadian',
      key: 'incident_date',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <span className='fw-semibold text-gray-800' style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatViolationIncidentDate(record)}
        </span>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <VendorSpActionButton
          title='Lihat Detail Pelanggaran'
          tone='primary'
          icon={<EyeOutlined />}
          onClick={() => setSelectedViolation(record)}
        />
      ),
    },
  ]

  return (
    <>
      <Modal
        title='Detail Surat Peringatan Vendor'
        open={open}
        onCancel={onClose}
        width={960}
        centered
        className='vendor-sp-popup-modal'
        footer={[
          ...(!isVendorRole && detail
            ? [
                <Button
                  key='penalty-pdf'
                  type='primary'
                  danger
                  icon={<FilePdfOutlined />}
                  loading={exportingPenalty}
                  onClick={handleExportPenalty}
                  disabled={!detail?.vendor?.id || !detail?.quarter || !detail?.year}
                >
                  Cetak Bukti SP (PDF)
                </Button>,
                <Button
                  key='cert-pdf'
                  icon={<FileTextOutlined />}
                  loading={exportingCertificate}
                  onClick={handleExportCertificate}
                  disabled={
                    !detail?.vendor?.id ||
                    !detail?.quarter ||
                    !detail?.year ||
                    hasActiveViolationsInQuarter
                  }
                  title={
                    hasActiveViolationsInQuarter
                      ? 'Tidak bisa cetak surat bebas: vendor punya pelanggaran aktif di quarter ini'
                      : 'Generate Surat Keterangan Bebas Pelanggaran'
                  }
                >
                  Cetak Surat Bebas Pelanggaran (PDF)
                </Button>,
              ]
            : []),
          <Button
            key='close'
            type='primary'
            className='vendor-sp-modal-close-btn'
            onClick={onClose}
          >
            Tutup
          </Button>,
        ]}
      >
        <div className='vendor-sp-table'>
          <Spin spinning={loading}>
            {!detail ? (
              <div className='vendor-sp-empty-state py-4'>
                <FileSearchOutlined className='vendor-sp-empty-icon' />
                <div className='vendor-sp-empty-title'>Detail SP Tidak Ditemukan</div>
                <div className='vendor-sp-empty-desc'>
                  Data Surat Peringatan tidak tersedia atau telah dihapus.
                </div>
              </div>
            ) : (
              <>
                <div className='vendor-sp-detail-banner'>
                  <div>
                    <div className='eyebrow'>Vendor Terkait</div>
                    <div className='name'>
                      {detail.vendor?.company_name || '-'}
                    </div>
                    <div className='pic'>
                      PIC: {detail.vendor?.pic_name || '-'}
                    </div>
                  </div>
                  <div className='badges'>
                    <span className='vendor-sp-detail-badge warn'>
                      {getSpLevelText(detail.sp_level)} ({detail.total_point ?? 0} Poin)
                    </span>
                    <span className='vendor-sp-detail-badge info'>
                      {getStatusText(detail.status)}
                    </span>
                    <span
                      className={`vendor-sp-detail-badge ${
                        detail.vendor?.is_active ? 'ok' : 'danger'
                      }`}
                    >
                      {detail.vendor?.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <div className='vendor-sp-detail-grid'>
                  <section className='vendor-sp-info-card'>
                    <div className='vendor-sp-info-card-title'>
                      <span>Informasi Vendor & Evaluasi</span>
                    </div>
                    <div className='vendor-sp-info-list'>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Level Surat Peringatan</span>
                        <span className='vendor-sp-info-row-value'>
                          <VendorSpPill color={getSpLevelColor(detail.sp_level)}>
                            {getSpLevelText(detail.sp_level)}
                          </VendorSpPill>
                        </span>
                      </div>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Total Poin Akumulasi</span>
                        <span className='vendor-sp-info-row-value'>
                          {detail.total_point ?? 0} Poin ({violationRows.length} Pelanggaran)
                        </span>
                      </div>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Pengurangan Alokasi Order</span>
                        <span className='vendor-sp-info-row-value'>
                          {detail.allocation_reduction
                            ? `-${detail.allocation_reduction}%`
                            : 'Tidak Ada (0%)'}
                        </span>
                      </div>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Periode Evaluasi</span>
                        <span className='vendor-sp-info-row-value'>
                          {quarterBounds.quarterLabel} ({quarterBounds.rangeFormatted})
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className='vendor-sp-info-card'>
                    <div className='vendor-sp-info-card-title'>
                      <span>Masa Berlaku & Ketentuan Sanksi</span>
                    </div>
                    <div className='vendor-sp-info-list'>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Status Surat Peringatan</span>
                        <span className='vendor-sp-info-row-value'>
                          <span className='vendor-sp-detail-badge info'>
                            {getStatusText(detail.status)}
                          </span>
                        </span>
                      </div>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Tanggal Mulai</span>
                        <span className='vendor-sp-info-row-value'>
                          {quarterBounds.startFormatted} ({quarterBounds.quarterLabel})
                        </span>
                      </div>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Tanggal Berakhir</span>
                        <span className='vendor-sp-info-row-value'>
                          {quarterBounds.endFormatted}
                        </span>
                      </div>
                      <div className='vendor-sp-info-row'>
                        <span className='vendor-sp-info-row-label'>Catatan SP</span>
                        {isVendorRole ? (
                          <div className='vendor-sp-note-box mb-0'>
                            {detail.notes || 'Tidak ada catatan khusus.'}
                          </div>
                        ) : (
                          <div className='vendor-sp-notes-editor'>
                            <Input.TextArea
                              rows={2}
                              value={notesInput}
                              onChange={(e) => setNotesInput(e.target.value)}
                              placeholder='Tulis catatan atau keterangan tambahan untuk Surat Peringatan ini...'
                              className='vendor-sp-notes-textarea'
                            />
                            <div className='vendor-sp-notes-actions'>
                              <Button
                                type='primary'
                                icon={<SaveOutlined />}
                                loading={savingNotes}
                                onClick={handleSaveNotes}
                                className='vendor-sp-save-notes-btn'
                              >
                                Simpan Catatan
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>

                <section className='vendor-sp-info-card full'>
                  <div className='vendor-sp-info-card-title'>
                    <span>Daftar Pelanggaran Terkait</span>
                    <span className='vendor-sp-detail-badge info'>
                      {violationRows.length} Pelanggaran
                    </span>
                  </div>
                  <div className='mt-2 mb-2'>
                    <Table
                      className={vendorSpTableClassName}
                      columns={columns}
                      dataSource={violationRows}
                      rowKey='id'
                      pagination={false}
                      scroll={{ x: 860 }}
                      locale={{
                        emptyText: (
                          <div className='vendor-sp-empty-state py-3'>
                            <FileSearchOutlined className='vendor-sp-empty-icon' />
                            <div className='vendor-sp-empty-title'>
                              Tidak Ada Pelanggaran Terkait
                            </div>
                            <div className='vendor-sp-empty-desc'>
                              SP ini tidak memiliki log pelanggaran yang terkait.
                            </div>
                          </div>
                        ),
                      }}
                    />
                  </div>
                </section>
              </>
            )}
          </Spin>
        </div>
      </Modal>

      <Modal
        title='Detail Pelanggaran Vendor'
        open={Boolean(selectedViolation)}
        onCancel={() => setSelectedViolation(null)}
        width={680}
        centered
        zIndex={1100}
        className='vendor-sp-popup-modal'
        footer={[
          <Button
            key='close'
            type='primary'
            className='vendor-sp-modal-close-btn'
            onClick={() => setSelectedViolation(null)}
          >
            Tutup
          </Button>,
        ]}
      >
        {selectedViolation && (
          <div className='vendor-sp-table'>
            <div className='vendor-sp-detail-banner'>
              <div>
                <div className='eyebrow'>Vendor Terkait</div>
                <div className='name'>
                  {detail?.vendor?.company_name || '-'}
                </div>
                <div className='pic'>
                  PIC: {detail?.vendor?.pic_name || '-'}
                </div>
              </div>
              <div className='badges'>
                <span className='vendor-sp-detail-badge'>
                  {selectedViolation.violation_type?.category || 'Lainnya'}
                </span>
                <span className='vendor-sp-detail-badge warn'>
                  {selectedViolation.adjusted_point ?? selectedViolation.violation_type?.point ?? 0} Poin
                </span>
                <span
                  className={`vendor-sp-detail-badge ${
                    selectedViolation.is_active !== false ? 'ok' : ''
                  }`}
                >
                  {selectedViolation.is_active !== false ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            <div className='vendor-sp-detail-grid'>
              <section className='vendor-sp-info-card'>
                <div className='vendor-sp-info-card-title'>
                  <span>Informasi Pelanggaran</span>
                </div>
                <div className='vendor-sp-info-list'>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Order ID</span>
                    <span className='vendor-sp-info-row-value'>
                      <VendorSpOrderLink
                        orderId={selectedViolation.order_id ?? selectedViolation.orders?.id}
                      />
                    </span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Kode Pelanggaran</span>
                    <span className='vendor-sp-info-row-value mono'>
                      {selectedViolation.violation_type?.code || '-'}
                    </span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Nama Pelanggaran</span>
                    <span className='vendor-sp-info-row-value'>
                      {selectedViolation.violation_type?.name || '-'}
                    </span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Periode Evaluasi</span>
                    <span className='vendor-sp-info-row-value'>
                      {
                        formatQuarterDateBounds(
                          selectedViolation.quarter || detail?.quarter,
                          selectedViolation.year || detail?.year,
                        ).quarterLabel
                      }{' '}
                      (
                      {
                        formatQuarterDateBounds(
                          selectedViolation.quarter || detail?.quarter,
                          selectedViolation.year || detail?.year,
                        ).rangeFormatted
                      }
                      )
                    </span>
                  </div>
                </div>
              </section>

              <section className='vendor-sp-info-card'>
                <div className='vendor-sp-info-card-title'>
                  <span>Bukti & Pencatatan</span>
                </div>
                <div className='vendor-sp-info-list'>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Sumber Bukti</span>
                    <span className='vendor-sp-info-row-value'>
                      {!selectedViolation.evidence_path ? (
                        <span className='vendor-sp-detail-badge warn'>Tanpa Evidence</span>
                      ) : selectedViolation.evidence_provenance === 'SYSTEM_GENERATED' ? (
                        <span className='vendor-sp-detail-badge info'>Sistem</span>
                      ) : (
                        <span className='vendor-sp-detail-badge ok'>Upload Manual</span>
                      )}
                    </span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Tanggal Kejadian</span>
                    <span className='vendor-sp-info-row-value'>
                      {formatViolationIncidentDateTime(selectedViolation)}
                    </span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Poin Dasar</span>
                    <span className='vendor-sp-info-row-value'>
                      {selectedViolation.violation_type?.point ?? 0} Poin
                    </span>
                  </div>
                  <div className='vendor-sp-info-row'>
                    <span className='vendor-sp-info-row-label'>Tanggal Tercatat</span>
                    <span className='vendor-sp-info-row-value'>
                      {selectedViolation.created_at
                        ? new Date(selectedViolation.created_at).toLocaleString('id-ID')
                        : '-'}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            <section className='vendor-sp-info-card full'>
              <div className='vendor-sp-info-card-title'>
                <span>Deskripsi / Keterangan Tambahan</span>
              </div>
              <div className='vendor-sp-note-box'>
                {selectedViolation.description || 'Tidak ada keterangan tambahan.'}
              </div>
            </section>
          </div>
        )}
      </Modal>
    </>
  )
}

const DetailVendorSP: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  const isVendorRole = userRole === 'Admin Vendor' || userRole === 'Owner Vendor'
  const backRoute = isVendorRole ? '/vendor-sp/violation-log' : '/vendor-sp/view'

  return (
    <DetailVendorSpModal
      spId={id ?? null}
      open={Boolean(id)}
      onClose={() => navigate(backRoute)}
    />
  )
}

export { DetailVendorSP, DetailVendorSpModal }
