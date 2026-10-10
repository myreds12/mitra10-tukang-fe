import React from 'react'
import {Modal, Button, Form} from 'react-bootstrap'

interface VendorRevisionModalProps {
  revisionModal: boolean
  setRevisionModal: (val: boolean) => void
  revisionType: 'REVISE' | 'RESET'
  setRevisionType: (val: 'REVISE' | 'RESET') => void
  revisionTargetLogId: number | ''
  setRevisionTargetLogId: (val: number | '') => void
  violationLogs: any[]
  revisionNewPoint: number
  setRevisionNewPoint: (val: number) => void
  revisionReason: string
  setRevisionReason: (val: string) => void
  revisionSubmitting: boolean
  submitRevisionRequest: () => void
}

export const VendorRevisionModal: React.FC<VendorRevisionModalProps> = ({
  revisionModal,
  setRevisionModal,
  revisionType,
  setRevisionType,
  revisionTargetLogId,
  setRevisionTargetLogId,
  violationLogs,
  revisionNewPoint,
  setRevisionNewPoint,
  revisionReason,
  setRevisionReason,
  revisionSubmitting,
  submitRevisionRequest,
}) => {
  return (
    <Modal show={revisionModal} onHide={() => setRevisionModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{revisionType === 'RESET' ? 'Reset Poin Quarter' : 'Ajukan Revisi Poin'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className='mb-3'>
          <Form.Label>Tipe</Form.Label>
          <Form.Select
            value={revisionType}
            onChange={(event) => setRevisionType(event.target.value as 'REVISE' | 'RESET')}
          >
            <option value='REVISE'>REVISE</option>
            <option value='RESET'>RESET</option>
          </Form.Select>
        </Form.Group>

        {revisionType === 'REVISE' && (
          <>
            <Form.Group className='mb-3'>
              <Form.Label>Log Pelanggaran</Form.Label>
              <Form.Select
                value={revisionTargetLogId}
                onChange={(event) => setRevisionTargetLogId(Number(event.target.value))}
              >
                <option value=''>Pilih log</option>
                {violationLogs.map((log: any) => (
                  <option key={log.id} value={log.id}>
                    #{log.id} - {log.violation_type?.name || log.violation_type?.code}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Poin Baru</Form.Label>
              <Form.Select
                value={revisionNewPoint}
                onChange={(event) => setRevisionNewPoint(Number(event.target.value))}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </Form.Select>
            </Form.Group>
          </>
        )}

        <Form.Group>
          <Form.Label>Alasan</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            value={revisionReason}
            onChange={(event) => setRevisionReason(event.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='light' onClick={() => setRevisionModal(false)}>
          Batal
        </Button>
        <Button variant='primary' disabled={revisionSubmitting} onClick={submitRevisionRequest}>
          Ajukan
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
