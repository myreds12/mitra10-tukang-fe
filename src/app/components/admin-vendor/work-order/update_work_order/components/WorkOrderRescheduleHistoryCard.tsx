import React from 'react'
import {Card, Row, Col, Form, ListGroup, Modal} from 'react-bootstrap'
import {Image} from 'antd'

interface WorkOrderRescheduleHistoryCardProps {
  orderDetail: any
  formatDateWithTime: (date: string) => string
  formatDateWithTimeZone: (date: string) => string
  apiUrl: string
  previewImage: any
  setPreviewImage: (val: any) => void
  visible: boolean
  handleClose: () => void
  visibleReschedule: boolean
  setVisibleReschedule: (val: boolean) => void
}

export const WorkOrderRescheduleHistoryCard: React.FC<WorkOrderRescheduleHistoryCardProps> = ({
  orderDetail,
  formatDateWithTime,
  formatDateWithTimeZone,
  apiUrl,
  previewImage,
  setPreviewImage,
  visible,
  handleClose,
  visibleReschedule,
  setVisibleReschedule,
}) => {
  if (!orderDetail?.reschedule || orderDetail?.reschedule?.length === 0) {
    return null
  }

  return (
    <Card className='mt-5 mb-5'>
      <Card.Header>
        <Card.Title>Reschedule History</Card.Title>
      </Card.Header>

      <Card.Body>
        <Row className='mb-5'>
          <Col>
            <Form.Group>
              <Form.Label>Tanggal Konfirmasi Awal Vendor :</Form.Label>

              <p className='fs-6'>
                {orderDetail?.work_orders
                  ? orderDetail.work_orders.work_start_date &&
                    orderDetail.work_orders.work_end_date
                    ? `${formatDateWithTime(
                        orderDetail.work_orders.work_start_date
                      )} sampai  ${formatDateWithTime(orderDetail.work_orders.work_end_date)}`
                    : orderDetail.work_orders.survey_date
                    ? formatDateWithTime(orderDetail?.work_orders?.survey_date)
                    : 'Tanggal belum dikonfirmasi vendor'
                  : 'Tanggal belum dikonfirmasi vendor'}
              </p>
            </Form.Group>
          </Col>

          <Col>
            <Form.Group>
              <Form.Label>Tanggal Pengajuan Reschedule :</Form.Label>

              <p className='fs-6'>
                {orderDetail?.reschedule[0]?.reschedule_date
                  ? `${formatDateWithTimeZone(orderDetail?.reschedule[0]?.reschedule_date)}`
                  : 'Tanggal belum ditentukan vendor'}
              </p>
            </Form.Group>
          </Col>

          <Col>
            <Form.Group>
              <Form.Label>Tanggal Konfirmasi Vendor :</Form.Label>

              <p className='fs-6'>
                {orderDetail?.reschedule[0]?.confirm_date
                  ? ` ${formatDateWithTime(orderDetail?.reschedule[0]?.confirm_date)}`
                  : 'Tanggal belum ditentukan vendor'}
              </p>
            </Form.Group>
          </Col>
        </Row>

        <Row className='mb-5'>
          <Col>
            <Form.Label className='mt-3'>Bukti File :</Form.Label>
            <ListGroup>
              {orderDetail?.reschedule?.[0]?.reschedule_evidences?.map((item: any) => (
                <ListGroup.Item
                  key={item.id}
                  action
                  style={{cursor: 'pointer'}}
                  onClick={() => {
                    setPreviewImage(item.evidence_location)
                    setVisibleReschedule(true)
                  }}
                >
                  {item.evidence_location}
                </ListGroup.Item>
              ))}
            </ListGroup>

            {previewImage && (
              <div>
                {previewImage.endsWith('.pdf') ? (
                  <Modal
                    dialogClassName='modal-show-pdf'
                    centered
                    show={visible}
                    onHide={handleClose}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>File - {previewImage}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                      <iframe
                        key={previewImage}
                        width='100%'
                        height='100%'
                        src={`${apiUrl}/public/reschedule/${previewImage}`}
                        style={{border: 'none'}}
                      />
                    </Modal.Body>
                  </Modal>
                ) : (
                  <Image
                    key={previewImage}
                    width={200}
                    style={{display: 'none'}}
                    src={`${apiUrl}/public/reschedule/${previewImage}`}
                    preview={{
                      visible: visibleReschedule,
                      src: `${apiUrl}/public/reschedule/${previewImage}`,
                      onVisibleChange: (value) => {
                        setVisibleReschedule(value)
                      },
                    }}
                  />
                )}
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
