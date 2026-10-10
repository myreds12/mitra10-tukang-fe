import React from 'react'
import dayjs from 'dayjs'
import {Form, Button, Row, Col, ListGroup} from 'react-bootstrap'
import {Image, DatePicker} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'
import {formatDate, formatDateWithTime} from '../../../../../../_metronic/helpers'
import {Reschedule} from '../types'

interface NewRescheduleFormSectionProps {
  orderDetail: any
  reschedule: Reschedule
  setReschedule: React.Dispatch<React.SetStateAction<Reschedule>>
  RescheduleFormHandler: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  evidenceRef: React.RefObject<any>
  rescheduleEvidence: any[]
  handleImageClick: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFileClick: (index: number) => void
  handleRemoveFile: (index: number) => void
  selectedFileIndex: number | null
  previewImage: string
  visible: boolean
  setVisible: (visible: boolean) => void
  isLoading: boolean
  handleSubmitReschedule: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const NewRescheduleFormSection: React.FC<NewRescheduleFormSectionProps> = ({
  orderDetail,
  reschedule,
  setReschedule,
  RescheduleFormHandler,
  evidenceRef,
  rescheduleEvidence,
  handleImageClick,
  handleFileChange,
  handleFileClick,
  handleRemoveFile,
  selectedFileIndex,
  previewImage,
  visible,
  setVisible,
  isLoading,
  handleSubmitReschedule,
}) => {
  return (
    <>
      <hr />

      <div className='title mb-3'>
        <h1 className='text-uppercase'>formulir reschedule</h1>
      </div>

      <Row className='mb-3'>
        <Col xxl={4} xl={4} md={4} sm={12}>
          <Form.Group className='detail-info mb-3'>
            <Form.Label>Tanggal Request Survey/Pekerjaan :</Form.Label>

            <p className='fs-6'>
              {orderDetail?.request_survey
                ? `${formatDate(orderDetail?.request_survey)}`
                : 'Tanggal belum ditentukan toko'}
            </p>
          </Form.Group>

          <Form.Group className='detail-info mb-3'>
            <Form.Label>Tanggal Konfirmasi Awal Vendor :</Form.Label>
            <p className='fs-6'>
              {orderDetail?.work_orders
                ? orderDetail.work_orders.work_start_date &&
                  orderDetail.work_orders.work_end_date
                  ? ` ${formatDateWithTime(
                      orderDetail.work_orders.work_start_date
                    )} sampai  ${formatDateWithTime(orderDetail?.work_orders?.work_end_date)}`
                  : orderDetail.work_orders.survey_date
                  ? formatDateWithTime(orderDetail?.work_orders?.survey_date)
                  : 'Tanggal belum dikonfirmasi vendor'
                : 'Tanggal belum dikonfirmasi vendor'}
            </p>
          </Form.Group>

          <Form.Group className='detail-info mb-3'>
            <Form.Label>Tanggal Pengajuan Reschedule :</Form.Label>

            <DatePicker
              name='reschedule_date'
              showTime={{
                format: 'HH:mm',
              }}
              className='date-range w-100'
              format='DD-MM-YYYY HH:mm'
              value={
                reschedule.reschedule_date
                  ? dayjs(reschedule.reschedule_date, 'YYYY-MM-DD HH:mm')
                  : null
              }
              onChange={(value) => {
                const rescheduleDate = value ? value.format('YYYY-MM-DDTHH:mm') : ''
                setReschedule((prev) => ({
                  ...prev,
                  reschedule_date: rescheduleDate,
                }))
              }}
            />
          </Form.Group>
        </Col>

        <Col xxl={4} xl={4} md={4} sm={12}>
          <Form.Group className='detail-info mb-3'>
            <Form.Label>Alasan :</Form.Label>
            <Form.Control
              as='textarea'
              className='reason'
              name='description'
              onChange={(e) => RescheduleFormHandler(e)}
            />
          </Form.Group>
        </Col>

        <Col xxl={4} xl={4} md={4} sm={12}>
          <Form.Group>
            <Form.Label>UPLOAD FILE PENDUKUNG</Form.Label>
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
              {rescheduleEvidence.length ? (
                rescheduleEvidence.map((item, index) => (
                  <ListGroup key={index}>
                    <ListGroup.Item
                      key={`${item?.name}-${index}-${item?.type}`}
                      className='d-flex justify-content-between align-items-center'
                    >
                      <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                      <span className='upload-content' onClick={() => handleFileClick(index)}>
                        {item?.name}
                      </span>

                      <FontAwesomeIcon
                        icon={faTrash}
                        size='sm'
                        color='#ed2b2a'
                        style={{cursor: 'pointer'}}
                        onClick={(e) => handleRemoveFile(index)}
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
                          onVisibleChange: (value) => {
                            setVisible(value)
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

      <div className='d-flex justify-content-center mt-5'>
        <Button
          className='button-submit m-0'
          variant='dark-primary'
          type='submit'
          disabled={isLoading}
          onClick={handleSubmitReschedule}
        >
          {isLoading ? 'Submitting..' : 'Submit'}
        </Button>
      </div>
    </>
  )
}
