import React, { FC } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

interface ComplaintModalsProps {
  showModal: boolean
  setShowModal: (val: boolean) => void
  handleCloseModal: () => void
  modalType: number
  handleInputReason: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleApprovalComplaint: (status: number) => void
  complaintStatusCancel: number
  isLoading: boolean
  handleInputStatus: (e: any) => void
  statusData: any[]
  handleChangeStatusComplaint: () => void
}

export const ComplaintModals: FC<ComplaintModalsProps> = ({
  showModal,
  setShowModal,
  handleCloseModal,
  modalType,
  handleInputReason,
  handleApprovalComplaint,
  complaintStatusCancel,
  isLoading,
  handleInputStatus,
  statusData,
  handleChangeStatusComplaint,
}) => {
  return (
    <Modal centered show={showModal} onHide={handleCloseModal}>
      {modalType === 1 && (
        <>
          <Modal.Body>
            <Form.Label className='fs-5 fw-bolder'>Reason Rejected :</Form.Label>
            <Form.Group>
              <Form.Control as='textarea' rows={3} onChange={handleInputReason} />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='dark-danger' onClick={() => setShowModal(false)}>
              Close
            </Button>

            <Button
              className='d-flex justify-content-center align-items-center'
              variant='dark-primary'
              onClick={() => handleApprovalComplaint(complaintStatusCancel)}
              disabled={isLoading}
            >
              {isLoading ? 'Rejected..' : 'Rejected'}
            </Button>
          </Modal.Footer>
        </>
      )}

      {modalType === 2 && (
        <>
          <Modal.Body>
            <Form.Group className='mb-3'>
              <Form.Label>Pilih status :</Form.Label>

              <Form.Select onChange={(e) => handleInputStatus(e)}>
                <option value=''>Pilih status</option>

                {statusData
                  .filter((status: any) =>
                    ['RESURVEYREQ', 'REWORKREQ', 'RESURVEYDONE', 'REWORKEND'].includes(
                      status.category
                    )
                  )
                  .map((status: any) => (
                    <option key={status.value} value={status.value}>
                      {status.description}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Alasan :</Form.Label>
              <Form.Control rows={3} as='textarea' onChange={handleInputReason} />
            </Form.Group>

            <Button
              className='d-flex justify-content-center align-items-center w-100 m-0'
              variant='dark-primary'
              onClick={handleChangeStatusComplaint}
            >
              Submit
            </Button>
          </Modal.Body>
        </>
      )}
    </Modal>
  )
}
