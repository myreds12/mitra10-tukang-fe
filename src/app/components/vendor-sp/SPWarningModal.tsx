import React from 'react'
import { Modal, Alert, Button, Space } from 'antd'
import { WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

interface VendorSPInfo {
  vendor_id: number
  vendor_name: string
  sp_level: number
  sp_status: string
  total_point: number
  allocation_reduction: number | null
}

interface SPWarningModalProps {
  visible: boolean
  vendorInfo: VendorSPInfo | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const SPWarningModal: React.FC<SPWarningModalProps> = ({
  visible,
  vendorInfo,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!vendorInfo) return null

  const getSpLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return '#faad14'
      case 2:
        return '#ff4d4f'
      case 3:
        return '#722ed1'
      default:
        return '#d9d9d9'
    }
  }

  const getWarningMessage = (level: number) => {
    switch (level) {
      case 1:
        return 'Vendor memiliki SP1. Alokasi order akan dikurangi 25%-50%.'
      case 2:
        return 'Vendor memiliki SP2. Alokasi order akan dikurangi 50%-75%.'
      case 3:
        return 'Vendor memiliki SP3 dan TIDAK DAPAT menerima order!'
      default:
        return ''
    }
  }

  const isSP3 = vendorInfo.sp_level === 3

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: getSpLevelColor(vendorInfo.sp_level) }} />
          <span>Peringatan Vendor {vendorInfo.sp_status}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      closable={!loading}
      maskClosable={!loading}
      keyboard={!loading}
    >
      <Alert
        message={
          <span style={{ fontWeight: 600 }}>
            Vendor: {vendorInfo.vendor_name}
          </span>
        }
        description={
          <div>
            <p className='mb-1'>
              <strong>{vendorInfo.sp_status}</strong> dengan total{' '}
              <strong>{vendorInfo.total_point} poin</strong> penalti.
            </p>
            <p className='mb-0'>{getWarningMessage(vendorInfo.sp_level)}</p>
          </div>
        }
        type={isSP3 ? 'error' : 'warning'}
        showIcon
        icon={<WarningOutlined />}
        className='mb-3'
      />

      {vendorInfo.allocation_reduction && !isSP3 && (
        <Alert
          message='Dampak pada Alokasi Order'
          description={
            <span>
              Pengurangan alokasi order: <strong>{vendorInfo.allocation_reduction}%</strong>
            </span>
          }
          type='info'
          className='mb-3'
        />
      )}

      {isSP3 ? (
        <>
          <Alert
            message='Tidak Dapat Dialokasikan'
            description='Vendor dalam status SP3 tidak dapat menerima order dalam kondisi apapun. Silakan pilih vendor lain.'
            type='error'
            className='mb-3'
          />
          <div className='text-end'>
            <Button onClick={onCancel}>Tutup</Button>
          </div>
        </>
      ) : (
        <div className='d-flex justify-content-end gap-2'>
          <Button onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type='primary' onClick={onConfirm} loading={loading} danger={vendorInfo.sp_level === 2}>
            Ya, Alokasikan
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default SPWarningModal
