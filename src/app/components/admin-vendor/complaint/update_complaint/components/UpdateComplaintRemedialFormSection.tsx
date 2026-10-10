import React from 'react'
import {Row, Col, Form, Button, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'

interface UpdateComplaintRemedialFormSectionProps {
  complaintDetail: any
  isLoading: boolean
  handleInputRemedialDesc: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleChangeSelectRemedialStatus: (event: React.ChangeEvent<HTMLSelectElement>) => void
  handleImageClick: () => void
  evidenceRef: React.RefObject<any>
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  remedialEvidence: Array<File | null>
  handleRemoveFile: (index: number) => void
  handleCancelRemedial: () => void
  handleSubmitRemedialAction: () => void
}

export const UpdateComplaintRemedialFormSection: React.FC<UpdateComplaintRemedialFormSectionProps> = ({
  complaintDetail,
  isLoading,
  handleInputRemedialDesc,
  handleChangeSelectRemedialStatus,
  handleImageClick,
  evidenceRef,
  handleFileChange,
  remedialEvidence,
  handleRemoveFile,
  handleCancelRemedial,
  handleSubmitRemedialAction,
}) => {
  if (['COMPLAINTREJECTEDBYHO'].includes(complaintDetail?.status?.category)) {
    return null
  }

  return (
    <>
      <hr />

      <Row>
        <Col xs={12} md={12} lg={12} xl={12} xxl={12}>
          <div className='fs-3 fw-bold text-success mb-3'>REMEDIAL ACTION</div>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Feedback ke Store :</Form.Label>
                <Form.Control
                  style={{minHeight: '255px'}}
                  as='textarea'
                  onChange={handleInputRemedialDesc}
                />
              </Form.Group>
            </Col>

            <Col>
              <Form.Group className='mb-3'>
                <Form.Label>Change Status :</Form.Label>

                <Form.Select defaultValue='Select Status' onChange={handleChangeSelectRemedialStatus}>
                  <option value='Select Status'>Select Status</option>
                  <option value='4'>Ditindaklanjuti</option>
                  <option value='1009'>Diterima </option>
                  <option value='1011'>Ditolak</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId='formFile'>
                <Form.Label>Upload Bukti</Form.Label>
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
                  {remedialEvidence.length ? (
                    remedialEvidence.map((item, index) => (
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
                          style={{cursor: 'pointer'}}
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
        </Col>
      </Row>

      <div className='d-flex justify-content-center align-items-center mt-5'>
        <Button
          variant='dark-danger'
          className='d-flex justify-content-center align-items-center'
          type='button'
          disabled={isLoading}
          onClick={handleCancelRemedial}
        >
          Cancel
        </Button>

        <Button
          variant='dark-primary'
          className='d-flex justify-content-center align-items-center'
          type='button'
          disabled={isLoading}
          onClick={handleSubmitRemedialAction}
        >
          {isLoading ? 'Submitting..' : 'Submit'}
        </Button>
      </div>
    </>
  )
}
