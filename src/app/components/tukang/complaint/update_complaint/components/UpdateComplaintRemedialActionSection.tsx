import React from 'react'
import {Col, Row, Form, Button, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFileImage, faImage, faTrash} from '@fortawesome/free-solid-svg-icons'

interface UpdateComplaintRemedialActionSectionProps {
  complaintDetail: any
  today: string
  handleChangeremedialStartDate: (e: any) => void
  handleChangeSelectRemedialStatus: (e: any) => void
  handleInputRemedialDesc: (e: any) => void
  handleChangeremedialEndDate: (e: any) => void
  handleImageClick: () => void
  remedialEvidenceRef: React.RefObject<any>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  remedialEvidence: Array<File | null>
  handleRemoveFile: (index: number) => void
}

export const UpdateComplaintRemedialActionSection: React.FC<
  UpdateComplaintRemedialActionSectionProps
> = ({
  complaintDetail,
  today,
  handleChangeremedialStartDate,
  handleChangeSelectRemedialStatus,
  handleInputRemedialDesc,
  handleChangeremedialEndDate,
  handleImageClick,
  remedialEvidenceRef,
  handleFileChange,
  remedialEvidence,
  handleRemoveFile,
}) => {
  return complaintDetail?.status?.category === 'REJECT' ? (
    <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
      <div className='fs-3 fw-bold text-success'>
        REMEDIAL ACTION
        <span className='ms-3 fs-5 fw-semibold text-danger'>
          ( *Complaint is not approved yet )
        </span>
      </div>

      <Row>
        <Col>
          <Form.Group>
            <Form.Label className='mt-3'>Start Date :</Form.Label>
            <Form.Control disabled type='date' />
          </Form.Group>

          <Form.Group>
            <Form.Label className='mt-3'>Change Status :</Form.Label>

            <Form.Select disabled defaultValue='Select Status'>
              <option value='Select Status'>Select Status</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label className='mt-5'>Notes :</Form.Label>
            <Form.Control
              disabled
              style={{minHeight: '200px'}}
              as='textarea'
            ></Form.Control>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label className='mt-3'>End Date :</Form.Label>
            <Form.Control disabled type='date' />
          </Form.Group>

          <Form.Group controlId='formFile' className='mt-3'>
            <Form.Label>Upload Bukti</Form.Label>

            <ListGroup>
              <ListGroup.Item className='list-group-not-approve d-flex justify-content-center'>
                Tidak dapat memilih file
              </ListGroup.Item>
            </ListGroup>
          </Form.Group>
        </Col>

        <div className='d-flex justify-content-center align-items-center mt-5'>
          <Button
            variant='dark-success'
            className='d-flex justify-content-center align-items-center'
            type='submit'
          >
            Submit Remedial
          </Button>
        </div>
      </Row>
    </Col>
  ) : (
    <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
      <div className='fs-3 fw-bold text-success'>REMEDIAL ACTION</div>

      <Row>
        <Col>
          <Form.Group>
            <Form.Label className='mt-3'>Start Date :</Form.Label>
            <Form.Control
              type='date'
              min={today}
              onChange={handleChangeremedialStartDate}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className='mt-3'>Change Status :</Form.Label>

            <Form.Select defaultValue='Select Status' onChange={handleChangeSelectRemedialStatus}>
              <option value='Select Status'>Select Status</option>
              <option value='3'>INVESTIGATE</option>
              <option value='25'>ACCEPTED</option>
              <option value='27'>REJECTED</option>
              <option value='17'>REWORKREQ</option>
              <option value='18'>REWORKSTART</option>
              <option value='19'>REWORKEND</option>
              <option value='8'>RESURVEYREQ</option>
              <option value='28'>RESCHEDULE</option>
              <option value='24'>REFUND</option>
              <option value='1006'>DONE</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label className='mt-5'>Notes :</Form.Label>
            <Form.Control
              style={{minHeight: '200px'}}
              as='textarea'
              onChange={handleInputRemedialDesc}
            ></Form.Control>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label className='mt-3'>End Date :</Form.Label>
            <Form.Control
              type='date'
              min={today}
              onChange={handleChangeremedialEndDate}
            />
          </Form.Group>

          <Form.Group controlId='formFile' className='mt-3'>
            <Form.Label>Upload Bukti</Form.Label>
            <Form className='form-input-image' onClick={handleImageClick}>
              <Form.Control
                type='file'
                accept='image/*'
                className='input-field-image-remedial'
                multiple
                hidden
                id='file-input'
                ref={remedialEvidenceRef}
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
  )
}
