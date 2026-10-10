import React from 'react'
import {Row, Col, Form, Button, ListGroup} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {DatePicker, Image} from 'antd'
import dayjs from 'dayjs'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'
import {Complaint, ComplaintChannel, CrmType} from '../types'

interface NewComplaintFormInputsProps {
  complaintForm: Complaint
  setComplaintForm: React.Dispatch<React.SetStateAction<Complaint>>
  complaintFormHandler: (e: any) => void
  today: string
  complaintChannel: ComplaintChannel[]
  selectedComplaintChannel: SingleValue<ComplaintChannel>
  setSelectedComplaintChannel: (val: SingleValue<ComplaintChannel>) => void
  crmType: CrmType[]
  selectedCrmType: SingleValue<CrmType>
  setSelectedCrmType: (val: SingleValue<CrmType>) => void
  evidenceRef: React.RefObject<any>
  handleImageClick: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  complaintEvidence: Array<File | null>
  handleFileClick: (index: number) => void
  handleRemoveFile: (index: number) => void
  selectedFileIndex: number | null
  previewImage: any
  visible: boolean
  setVisible: (val: boolean) => void
  isLoading: boolean
  handleCancelComplaint: () => void
  handleSubmitNewComplaint: (e: any) => void
}

export const NewComplaintFormInputs: React.FC<NewComplaintFormInputsProps> = ({
  complaintForm,
  setComplaintForm,
  complaintFormHandler,
  today,
  complaintChannel,
  selectedComplaintChannel,
  setSelectedComplaintChannel,
  crmType,
  selectedCrmType,
  setSelectedCrmType,
  evidenceRef,
  handleImageClick,
  handleFileChange,
  complaintEvidence,
  handleFileClick,
  handleRemoveFile,
  selectedFileIndex,
  previewImage,
  visible,
  setVisible,
  isLoading,
  handleCancelComplaint,
  handleSubmitNewComplaint,
}) => {
  return (
    <>
      <Row className='mb-5'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
          <Form.Group className='mb-3'>
            <Form.Label>Nama PIC :</Form.Label>
            <Form.Control
              name='pic_name'
              type='text'
              placeholder='Isi Nama PIC'
              value={complaintForm?.pic_name ?? ''}
              onChange={(e) => complaintFormHandler(e)}
            />
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Tanggal Komplain Dibuat :</Form.Label>
            <Form.Control
              name='complaint_date'
              type='date'
              value={today}
              readOnly
              onChange={(e) => complaintFormHandler(e)}
            />
          </Form.Group>

          <Form.Group className='detail-info mb-3'>
            <Form.Label>Tanggal Komplain Diterima :</Form.Label>

            <DatePicker
              name='complaint_received_date'
              showTime={{
                format: 'HH:mm',
              }}
              className='date-range w-100'
              format='DD-MM-YYYY HH:mm'
              value={
                complaintForm.complaint_received_date
                  ? dayjs(complaintForm.complaint_received_date, 'YYYY-MM-DD HH:mm')
                  : null
              }
              onChange={(value) => {
                const complaintDate = value ? value.format('YYYY-MM-DDTHH:mm') : ''
                setComplaintForm((prev) => ({
                  ...prev,
                  complaint_received_date: complaintDate,
                }))
              }}
            />
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Komplain melalui : </Form.Label>

            <Select
              name='complaint_channel_id'
              className='form-control p-0'
              classNamePrefix='select'
              placeholder='Complaint Via'
              isSearchable={true}
              options={complaintChannel}
              value={selectedComplaintChannel}
              onChange={(newValue) => setSelectedComplaintChannel(newValue)}
            />
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Jenis Pengaduan : </Form.Label>

            <Select
              name='crm_type_id'
              className='form-control p-0'
              classNamePrefix='select'
              placeholder='Jenis Pengaduan'
              isSearchable={true}
              options={crmType}
              value={selectedCrmType}
              onChange={(newValue) => setSelectedCrmType(newValue)}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
          <Form.Label>Alasan :</Form.Label>
          <Form.Control
            as='textarea'
            name='description'
            style={{minHeight: '355px'}}
            value={complaintForm?.description ?? ''}
            onChange={(e) => complaintFormHandler(e)}
          />
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='mb-3'>
          <Form.Group>
            <Form.Label>UPLOAD BUKTI COMPLAINT</Form.Label>
            <Form className='form-input-image' onClick={handleImageClick}>
              <Form.Control
                type='file'
                accept='image/jpeg, image/png'
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
              {complaintEvidence.length ? (
                complaintEvidence.map((item, index) => (
                  <ListGroup key={`${item?.name}-${index}`}>
                    <ListGroup.Item
                      key={`${item?.name}-${index}-${item?.type}`}
                      className='d-flex justify-content-between align-items-center'
                    >
                      <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                      <span
                        className='upload-content'
                        onClick={() => handleFileClick(index)}
                      >
                        {item?.name}
                      </span>

                      <FontAwesomeIcon
                        icon={faTrash}
                        size='sm'
                        color='#ed2b2a'
                        style={{cursor: 'pointer'}}
                        onClick={() => handleRemoveFile(index)}
                      />
                    </ListGroup.Item>

                    {selectedFileIndex === index && item && (
                      <Image
                        key={`${previewImage} - ${index}`}
                        width={200}
                        style={{display: 'none'}}
                        src={URL.createObjectURL(item)}
                        preview={{
                          visible,
                          src: URL.createObjectURL(item),
                          onVisibleChange: (val) => {
                            setVisible(val)
                          },
                        }}
                      />
                    )}
                  </ListGroup>
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

      <div className='d-flex justify-content-center align-items-center mt-5'>
        <Button
          variant='dark-danger'
          className='d-flex justify-content-center align-items-center'
          type='submit'
          disabled={isLoading}
          onClick={handleCancelComplaint}
        >
          Cancel
        </Button>

        <Button
          variant='dark-primary'
          className='d-flex justify-content-center align-items-center'
          type='submit'
          disabled={isLoading}
          onClick={handleSubmitNewComplaint}
        >
          {isLoading ? 'Submitting..' : 'Submit'}
        </Button>
      </div>
    </>
  )
}
