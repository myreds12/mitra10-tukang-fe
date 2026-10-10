import React, { FC } from 'react'
import { Row, Col, Form, ListGroup, Button, Alert } from 'react-bootstrap'
import Select, { SingleValue } from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faImage, faFileImage, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { Remedial, Position } from '../types'

interface ComplaintFeedbackFormProps {
  userRole: string
  complaintDetail: any
  remedialForm: Remedial
  remedialFormHandler: (e: any) => void
  handleImageClick: () => void
  evidenceRef: React.RefObject<any>
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  feedbackEvidence: Array<File | null>
  handleRemoveFile: (index: number) => void
  picPositions: Position[]
  selectedPosition: SingleValue<Position>
  setSelectedPosition: (val: SingleValue<Position>) => void
  handleCancel: () => void
  handleSubmitNewFeedback: () => void
  handleApprovalComplaint: (status: number) => void
  complaintStatusDone: number
  isLoading: boolean
}

export const ComplaintFeedbackForm: FC<ComplaintFeedbackFormProps> = ({
  userRole,
  complaintDetail,
  remedialForm,
  remedialFormHandler,
  handleImageClick,
  evidenceRef,
  handleFileChange,
  feedbackEvidence,
  handleRemoveFile,
  picPositions,
  selectedPosition,
  setSelectedPosition,
  handleCancel,
  handleSubmitNewFeedback,
  handleApprovalComplaint,
  complaintStatusDone,
  isLoading,
}) => {
  return (
    <>
      {!['Tukang'].includes(userRole) && (
        <>
          {!['WARRANTYCLAIM', 'INVESTIGATED', 'COMPLAINTREJECTEDBYHO', 'DONE'].includes(
            complaintDetail?.status?.category
          ) && (
            <>
              <hr />

              <Row>
                <Col xs={12} md={8} lg={8} xl={8} xxl={8} className='mb-3'>
                  <Form.Label className='fs-3 fw-bold'>Feedback</Form.Label>
                  <Form.Control
                    style={{ minHeight: '170px' }}
                    as='textarea'
                    placeholder='Isi feedback..'
                    name='remedial_action'
                    value={remedialForm.remedial_action}
                    onChange={(e) => remedialFormHandler(e)}
                  />
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
                  <Form.Group controlId='formFile'>
                    <Form.Label className='fs-3 fw-bold'>Upload Bukti</Form.Label>
                    <Form className='form-input-image' onClick={handleImageClick}>
                      <Form.Control
                        type='file'
                        accept='image/*'
                        className='input-field-image'
                        multiple
                        hidden
                        id='file-input'
                        ref={evidenceRef}
                        onChange={handleFileChange}
                      />

                      <div className='input-image-text'>
                        <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                        <p>Add File</p>
                      </div>
                    </Form>

                    <ListGroup className='pt-3'>
                      {feedbackEvidence.length ? (
                        feedbackEvidence.map((item, index) => (
                          <ListGroup.Item
                            key={`${item?.name}-${index}-${item?.type}`}
                            className='d-flex justify-content-between'
                          >
                            <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                            <span className='upload-content'> {item?.name}</span>

                            <FontAwesomeIcon
                              icon={faTrash}
                              size='sm'
                              color='#ed2b2a'
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleRemoveFile(index)}
                            />
                          </ListGroup.Item>
                        ))
                      ) : (
                        <ListGroup.Item className='d-flex justify-content-center'>
                          Tidak ada file yang dipilih
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Form.Group>
                </Col>
              </Row>

              {['Store Staff', 'Store CS'].includes(userRole) && (
                <Row>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                    <Form.Group>
                      <Form.Label>Nama Pemberi Feedback</Form.Label>

                      <Form.Control
                        name='remedial_pic'
                        type='text'
                        placeholder='Isi Nama Pemberi Feedback'
                        value={remedialForm.remedial_pic}
                        onChange={(e) => remedialFormHandler(e)}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
                    <Form.Group>
                      <Form.Label>Jabatan</Form.Label>
                      <Select
                        name='pic_position'
                        id='pic_position'
                        className='form-control p-0 form-item-name'
                        classNamePrefix='select'
                        placeholder='Jabatan'
                        isSearchable={true}
                        isClearable={true}
                        options={picPositions}
                        value={{
                          value: selectedPosition?.value ?? '',
                          label: selectedPosition?.label ?? '',
                        }}
                        onChange={(newValue) => setSelectedPosition(newValue)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <div className='d-flex justify-content-center align-items-center gap-3 mt-5'>
                <Button
                  variant='dark-danger'
                  className='d-flex justify-content-center align-items-center'
                  type='button'
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button
                  variant='dark-primary'
                  className='d-flex justify-content-center align-items-center'
                  type='button'
                  disabled={isLoading}
                  onClick={handleSubmitNewFeedback}
                >
                  {isLoading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>

              {['REWORKEND', 'RESURVEYDONE'].includes(
                complaintDetail?.orders?.status?.category
              ) && (
                <div className='d-flex justify-content-center align-items-center mt-4'>
                  <Button
                    className='d-flex justify-content-center align-items-center'
                    variant='dark-primary'
                    disabled={isLoading}
                    onClick={() => handleApprovalComplaint(complaintStatusDone)}
                  >
                    Selesaikan Komplain
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {['COMPLAINTAPPROVEDBYHO'].includes(complaintDetail?.status?.category) && (
        <>
          <hr />

          <Alert variant='success' className='d-flex align-items-center'>
            <FontAwesomeIcon className='text-black' icon={faCircleInfo} fontSize={'15px'} />

            <p className='fw-normal text-black ms-2 mb-0'>
              Komplain telah disetujui oleh HO{' '}
              <span className='fw-bold text-black'>
                {complaintDetail?.complaint_histories?.[0]?.reason} (Komplain sedang ditindaklanjuti)
              </span>
            </p>
          </Alert>
        </>
      )}

      {['COMPLAINTREJECTEDBYHO'].includes(complaintDetail?.status?.category) && (
        <>
          <hr />

          <Alert variant='danger' className='d-flex align-items-center'>
            <FontAwesomeIcon className='text-black' icon={faCircleInfo} fontSize={'15px'} />

            <p className='fw-normal text-black ms-2 mb-0'>
              Komplain telah ditolak oleh HO dengan alasan{' '}
              <span className='fw-bold text-black'>
                {complaintDetail?.complaint_histories?.[0]?.reason} (Komplain ini sudah ditindaklanjuti)
              </span>
            </p>
          </Alert>
        </>
      )}
    </>
  )
}
