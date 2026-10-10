import React from 'react'
import {Modal, Button, Form} from 'react-bootstrap'

interface VendorRejectModalProps {
  show: boolean
  submitting: boolean
  vendorCompanyName: string
  rejectReason: string
  setRejectReason: (val: string) => void
  onClose: () => void
  handleReject: () => void
}

export const VendorRejectModal: React.FC<VendorRejectModalProps> = ({
  show,
  submitting,
  vendorCompanyName,
  rejectReason,
  setRejectReason,
  onClose,
  handleReject,
}) => {
  return (
    <Modal
      show={show}
      onHide={() => {
        if (!submitting) {
          onClose()
        }
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title style={{fontWeight: 700, fontSize: '17px', color: '#181c32'}}>
          Tolak Pendaftaran Vendor
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{fontSize: '13px', color: '#5B6178', marginBottom: '14px', lineHeight: 1.5}}>
          Masukkan alasan penolakan pendaftaran vendor <strong>{vendorCompanyName}</strong>.
          Email dan kontak PIC akan dibatasi selama 30 hari.
        </p>
        <Form.Group>
          <Form.Label style={{fontSize: '12.5px', fontWeight: 600, color: '#181c32'}}>
            Alasan Penolakan <span className='text-danger'>*</span>
          </Form.Label>
          <Form.Control
            as='textarea'
            rows={4}
            placeholder='Contoh: Dokumen KTP atau NPWP tidak terbaca jelas, mohon mendaftar ulang dengan dokumen valid...'
            value={rejectReason}
            onChange={(e: any) => setRejectReason(e.target.value)}
            autoFocus
            style={{fontSize: '13px', borderRadius: '8px'}}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant='light'
          onClick={onClose}
          disabled={submitting}
          style={{fontWeight: 600, borderRadius: '8px'}}
        >
          Batal
        </Button>
        <Button
          variant='danger'
          onClick={handleReject}
          disabled={submitting || !rejectReason.trim()}
          style={{
            fontWeight: 700,
            background: '#DC2626',
            borderColor: '#DC2626',
            borderRadius: '8px',
          }}
        >
          {submitting ? 'Memproses...' : 'Konfirmasi Tolak'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
