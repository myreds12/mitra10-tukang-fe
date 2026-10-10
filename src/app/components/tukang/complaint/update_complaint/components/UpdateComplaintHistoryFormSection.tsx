import React from 'react'
import {Col, Row, Form, ListGroup} from 'react-bootstrap'
import Select from 'react-select'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faImage, faFileImage, faTrash} from '@fortawesome/free-solid-svg-icons'
import {ComplaintChannel} from '../types'

interface UpdateComplaintHistoryFormSectionProps {
  complaintDetail: any
  complaintChannel: ComplaintChannel[]
  complaintChannelId: any
  complaintChannelName: any
  handleChangeSelectComplaintChannel: (element: any) => void
  complaintDesc: string
  handleInputComplaintDesc: (e: any) => void
  today: string
  complaintDate: string
  handleChangeComplaintDate: (e: any) => void
  handleComplaintImageClick: () => void
  evidenceRef: React.RefObject<any>
  handleFileComplaintChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  complaintEvidence: Array<File | null>
  setPreviewImage: (name: string) => void
  setVisible: (visible: boolean) => void
  handleComplaintRemoveFile: (index: number) => void
}

export const UpdateComplaintHistoryFormSection: React.FC<
  UpdateComplaintHistoryFormSectionProps
> = ({
  complaintDetail,
  complaintChannel,
  complaintChannelId,
  complaintChannelName,
  handleChangeSelectComplaintChannel,
  complaintDesc,
  handleInputComplaintDesc,
  today,
  complaintDate,
  handleChangeComplaintDate,
  handleComplaintImageClick,
  evidenceRef,
  handleFileComplaintChange,
  complaintEvidence,
  setPreviewImage,
  setVisible,
  handleComplaintRemoveFile,
}) => {
  return (
    <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
      <div className='fs-3 fw-bold text-danger'>COMPLAINT HISTORY</div>
      <Row>
        <Col>
          <Form.Group className='detail-info mt-3'>
            <Form.Label>Complaint ID :</Form.Label>
            <Col>
              <Form.Control type='text' readOnly value={complaintDetail?.id} />
            </Col>
          </Form.Group>

          <Form.Group className='mt-3'>
            <Form.Label>Complaint Channel : </Form.Label>
            <Select
              name='complaint_channel_id'
              className='form-control p-0'
              classNamePrefix='select'
              placeholder='Complaint Via'
              isSearchable={true}
              options={complaintChannel}
              value={{
                value: complaintChannelId,
                label: complaintChannelName,
              }}
              onChange={(element) => handleChangeSelectComplaintChannel(element)}
            />
          </Form.Group>

          <Form.Group className='mt-3'>
            <Form.Label>Complaint Detail :</Form.Label>
            <Form.Control
              style={{minHeight: '250px'}}
              as='textarea'
              value={complaintDesc}
              onChange={handleInputComplaintDesc}
            ></Form.Control>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className='mt-3'>
            <Form.Label>Complaint Date :</Form.Label>
            <Form.Control
              type='date'
              min={today}
              value={complaintDate}
              onChange={handleChangeComplaintDate}
            />
          </Form.Group>

          <Form.Group className='mt-3' controlId='formFile'>
            <Form.Label>Complaint Evidence</Form.Label>
            <Form className='form-input-image' onClick={handleComplaintImageClick}>
              <Form.Control
                type='file'
                accept='image/*'
                className='input-field-image-complaint'
                multiple
                hidden
                id='file-input'
                ref={evidenceRef}
                onChange={handleFileComplaintChange}
              />

              <div className='input-image-text'>
                <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                <p>Add File</p>
              </div>
            </Form>

            <ListGroup className='pt-3'>
              {complaintEvidence.length ? (
                complaintEvidence.map((item, index) => (
                  <ListGroup.Item
                    key={`${item?.name}-${index}-${item?.type}`}
                    className='d-flex justify-content-between'
                    onClick={() => {
                      setPreviewImage(item?.name || '')
                      setVisible(true)
                    }}
                  >
                    <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                    <span className='upload-content'>{item?.name}</span>

                    <FontAwesomeIcon
                      icon={faTrash}
                      size='sm'
                      color='#ed2b2a'
                      style={{cursor: 'pointer'}}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleComplaintRemoveFile(index)
                      }}
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
