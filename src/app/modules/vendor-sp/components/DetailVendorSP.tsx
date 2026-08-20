import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Button, Descriptions, Empty, Space, Spin, Table, Tag} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {ArrowLeftOutlined, FilePdfOutlined, FileTextOutlined} from '@ant-design/icons'
import Swal from 'sweetalert2'
import {vendorSpService} from '../../../services/vendorSpService'
import {
  VendorSpPill,
  vendorSpTableClassName,
} from './VendorSpTable'

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

const DetailVendorSP: React.FC = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [exportingPenalty, setExportingPenalty] = useState(false)
  const [exportingCertificate, setExportingCertificate] = useState(false)

  // [POIN 3] Cetak Bukti SP PDF
  const handleExportPenalty = async () => {
    if (!detail?.vendor?.id || !detail?.quarter || !detail?.year) return
    setExportingPenalty(true)
    try {
      await vendorSpService.generatePenaltyReceipt({
        vendor_id: detail.vendor.id,
        quarter: detail.quarter,
        year: detail.year,
      })
      Swal.fire('Sukses', 'Bukti SP PDF berhasil di-generate dan di-download', 'success')
    } catch (error: any) {
      Swal.fire(
        'Error',
        error?.message || 'Gagal generate Bukti SP PDF',
        'error',
      )
    } finally {
      setExportingPenalty(false)
    }
  }

  // [POIN 4] Cetak Surat Bebas Pelanggaran PDF
  // Disabled kalau vendor punya pelanggaran aktif di quarter yang dipilih.
  const handleExportCertificate = async () => {
    if (!detail?.vendor?.id || !detail?.quarter || !detail?.year) return
    setExportingCertificate(true)
    try {
      await vendorSpService.generateNoViolationCertificate({
        vendor_id: detail.vendor.id,
        quarter: detail.quarter,
        year: detail.year,
      })
      Swal.fire('Sukses', 'Surat Bebas Pelanggaran PDF berhasil di-generate dan di-download', 'success')
    } catch (error: any) {
      // Backend akan return 400 untuk dua skenario:
      // 1) Vendor punya pelanggaran aktif di quarter tsb
      // 2) Quarter masih berjalan (bukan lampau)
      Swal.fire(
        'Tidak Bisa Generate',
        error?.message || 'Gagal generate Surat Bebas Pelanggaran PDF',
        'warning',
      )
    } finally {
      setExportingCertificate(false)
    }
  }

  const hasActiveViolationsInQuarter =
    Array.isArray(detail?.sp_details) && detail.sp_details.length > 0

  const fetchDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await vendorSpService.getById(id)
      setDetail(response.data?.data || response.data || null)
    } catch (error: any) {
      Swal.fire('Error', error?.response?.data?.message || 'Gagal mengambil detail SP vendor', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const violationRows = Array.isArray(detail?.sp_details)
    ? detail.sp_details.map((item: any) => item.violation_log).filter(Boolean)
    : []

  const columns: ColumnsType<any> = [
    {
      title: 'Kode',
      key: 'code',
      width: 120,
      render: (_, record) => (
        <VendorSpPill color='primary'>{record.violation_type?.code || '-'}</VendorSpPill>
      ),
    },
    {
      title: 'Nama Pelanggaran',
      key: 'name',
      render: (_, record) => record.violation_type?.name || '-',
    },
    {
      title: 'Poin',
      key: 'point',
      width: 90,
      render: (_, record) => (
        <VendorSpPill color={(record.adjusted_point ?? record.violation_type?.point ?? 0) >= 2 ? 'red' : 'orange'}>
          {record.adjusted_point ?? record.violation_type?.point ?? 0} Poin
        </VendorSpPill>
      ),
    },
    {
      title: 'Order',
      key: 'order',
      width: 140,
      render: (_, record) => record.orders?.project_number || '-',
    },
    {
      title: 'Periode',
      key: 'period',
      width: 110,
      render: (_, record) => `Q${record.quarter || '-'} ${record.year || ''}`,
    },
    {
      // [POIN 6] Badge evidence — untuk legacy data (evidence_path=null) atau
      // tampilkan provenance (Sistem vs Upload) untuk data baru.
      title: 'Evidence',
      key: 'evidence',
      width: 130,
      render: (_, record) =>
        !record.evidence_path ? (
          <Tag color='warning'>⚠ Tanpa Evidence</Tag>
        ) : record.evidence_provenance === 'SYSTEM_GENERATED' ? (
          <Tag color='blue' title='Snapshot kejadian sistem (JSON)'>Sistem</Tag>
        ) : (
          <Tag color='green' title={record.evidence_path}>Upload</Tag>
        ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: formatDate,
    },
  ]

  return (
    <div className='card card-xxl-stretch mb-5 mb-xxl-8 vendor-sp-table'>
      <div className='card-header border-0 pt-5'>
        <div className='card-title d-flex flex-column'>
          <h3 className='card-label mb-1'>Detail Surat Peringatan Vendor</h3>
          <span className='text-muted'>Informasi vendor, status SP, dan daftar pelanggaran terkait.</span>
        </div>
        <div className='card-toolbar'>
          <Space>
            <Button
              type='primary'
              danger
              icon={<FilePdfOutlined />}
              loading={exportingPenalty}
              onClick={handleExportPenalty}
              disabled={!detail?.vendor?.id || !detail?.quarter || !detail?.year}
            >
              Cetak Bukti SP (PDF)
            </Button>
            <Button
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
                  ? 'Tidak bisa cetak surat bebas — vendor punya pelanggaran aktif di quarter ini'
                  : 'Generate Surat Keterangan Bebas Pelanggaran'
              }
            >
              Cetak Surat Bebas Pelanggaran (PDF)
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vendor-sp/view')}>
              Kembali
            </Button>
          </Space>
        </div>
      </div>

      <div className='card-body py-3'>
        <Spin spinning={loading}>
          {!detail ? (
            <Empty description='Detail SP tidak ditemukan' />
          ) : (
            <>
              <Descriptions bordered column={{xs: 1, sm: 1, md: 2}} size='small' className='mb-5'>
                <Descriptions.Item label='Vendor'>
                  <div className='fw-bold'>{detail.vendor?.company_name || '-'}</div>
                  <div className='text-muted small'>{detail.vendor?.pic_name || '-'}</div>
                </Descriptions.Item>
                <Descriptions.Item label='Status Vendor'>
                  <VendorSpPill color={detail.vendor?.is_active ? 'success' : 'red'}>
                    {detail.vendor?.is_active ? 'Aktif' : 'Nonaktif'}
                  </VendorSpPill>
                </Descriptions.Item>
                <Descriptions.Item label='Level SP'>
                  <VendorSpPill color={getSpLevelColor(detail.sp_level)}>
                    {getSpLevelText(detail.sp_level)}
                  </VendorSpPill>
                </Descriptions.Item>
                <Descriptions.Item label='Status SP'>
                  <VendorSpPill color={getStatusColor(detail.status)}>
                    {getStatusText(detail.status)}
                  </VendorSpPill>
                </Descriptions.Item>
                <Descriptions.Item label='Total Poin'>{detail.total_point ?? 0}</Descriptions.Item>
                <Descriptions.Item label='Periode'>
                  Q{detail.quarter || '-'} {detail.year || ''}
                </Descriptions.Item>
                <Descriptions.Item label='Tanggal Mulai'>{formatDate(detail.start_date)}</Descriptions.Item>
                <Descriptions.Item label='Tanggal Selesai'>{formatDate(detail.end_date)}</Descriptions.Item>
                <Descriptions.Item label='Pengurangan Alokasi'>
                  {detail.allocation_reduction ? `${detail.allocation_reduction}%` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label='Catatan'>{detail.notes || '-'}</Descriptions.Item>
              </Descriptions>

              <h5 className='mb-3'>Log Pelanggaran</h5>
              <Table
                className={vendorSpTableClassName}
                columns={columns}
                dataSource={violationRows}
                rowKey='id'
                pagination={false}
                scroll={{x: 900}}
              />
            </>
          )}
        </Spin>
      </div>
    </div>
  )
}

export {DetailVendorSP}
