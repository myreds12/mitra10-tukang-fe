import React from 'react'
import {Row, Col, Form, ListGroup, Card, Modal} from 'react-bootstrap'
import {Skeleton, Steps, Image} from 'antd'
import {formatDate, formatDateWithTime} from '../../../../_metronic/helpers'
import {Orders} from '../../../interfaces/order'
import {OrderHistory} from '../types'

interface DetailOrderTimelineSectionProps {
  order: Orders
  apiUrl: string | undefined
  isLoadingPage: boolean
  orderHistory: any[]
  complaintHistory: any[]
  orderHistorical: OrderHistory[]
  previewImage: any
  setPreviewImage: (v: any) => void
  visible: boolean
  handleClose: () => void
  visibleComplaint: boolean
  setVisibleComplaint: (v: boolean) => void
  visibleReschedule: boolean
  setVisibleReschedule: (v: boolean) => void
}

export const DetailOrderTimelineSection: React.FC<DetailOrderTimelineSectionProps> = ({
  order,
  apiUrl,
  isLoadingPage,
  orderHistory,
  complaintHistory,
  orderHistorical,
  previewImage,
  setPreviewImage,
  visible,
  handleClose,
  visibleComplaint,
  setVisibleComplaint,
  visibleReschedule,
  setVisibleReschedule,
}) => {
  return (
    <>
      <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
        <div className='order-history mt-3 mb-3'>
          <div className='fs-3 fw-bold text-success mb-4'>Order History</div>
          <Steps
            className='order-history-timeline'
            current={orderHistory.findIndex((step) =>
              step.value.includes(
                order?.work_orders?.work_order_status?.length > 0
                  ? order?.work_orders?.work_order_status[0]?.status?.id
                  : order?.project_status_id
              )
            )}
            labelPlacement='vertical'
            items={orderHistory}
          />
        </div>
      </Skeleton>

      {order?.complaints && order?.complaints?.length > 0 && (
        <Card className='mt-5'>
          <Card.Header>
            <Card.Title className='fw-bold'>Complaint History</Card.Title>
          </Card.Header>

          <Card.Body>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
              <Form.Label className='mt-3'>Bukti Komplain :</Form.Label>
              <ListGroup>
                {order?.complaints?.[0]?.complaint_histories?.[0]?.complaint_evidence?.map(
                  (item: any) => (
                    <ListGroup.Item
                      key={item.id}
                      action
                      style={{cursor: 'pointer'}}
                      onClick={() => {
                        setPreviewImage(item.evidence_location)
                        setVisibleComplaint(true)
                      }}
                    >
                      {item.evidence_location}
                    </ListGroup.Item>
                  )
                )}
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
                          src={`${apiUrl}/public/complaints/${previewImage}`}
                          style={{border: 'none'}}
                        />
                      </Modal.Body>
                    </Modal>
                  ) : (
                    <Image
                      key={previewImage}
                      width={200}
                      style={{display: 'none'}}
                      src={`${apiUrl}/public/complaints/${previewImage}`}
                      preview={{
                        visible: visibleComplaint,
                        src: `${apiUrl}/public/complaints/${previewImage}`,
                        onVisibleChange: (value) => {
                          setVisibleComplaint(value)
                        },
                      }}
                    />
                  )}
                </div>
              )}
            </Skeleton>

            <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
              {order?.complaints && order?.complaints?.length >= 1 && (
                <div className='complaint-history  mt-3 mb-3'>
                  <div className='fs-3 fw-bold text-danger mb-4'>Complaint History</div>
                  <Steps
                    className='complaint-history-timeline'
                    current={complaintHistory.findIndex((step) =>
                      step.value.includes(
                        order?.work_orders?.work_order_status?.length > 0
                          ? order?.work_orders?.work_order_status[0]?.status?.id
                          : order?.project_status_id
                      )
                    )}
                    labelPlacement='vertical'
                    items={complaintHistory}
                  />
                </div>
              )}
            </Skeleton>
          </Card.Body>
        </Card>
      )}

      {order?.reschedule && order?.reschedule?.length > 0 && (
        <Card className='mt-5'>
          <Card.Header>
            <Card.Title>Reschedule History</Card.Title>
          </Card.Header>

          <Card.Body>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
              <Row className='mb-5'>
                <Col>
                  <Form.Group>
                    <Form.Label>Tanggal Konfirmasi Awal Vendor :</Form.Label>

                    <p className='fs-6'>
                      {order?.work_orders
                        ? order.work_orders.work_start_date && order.work_orders.work_end_date
                          ? `${formatDateWithTime(
                              order?.work_orders?.work_start_date
                            )} sampai ${formatDateWithTime(order?.work_orders?.work_end_date)}`
                          : order.work_orders.survey_date
                          ? formatDateWithTime(order?.work_orders?.survey_date)
                          : 'Tanggal belum dikonfirmasi vendor'
                        : 'Tanggal belum dikonfirmasi vendor'}
                    </p>
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group>
                    <Form.Label>Tanggal Pengajuan Reschedule :</Form.Label>

                    <p className='fs-6'>
                      {order?.reschedule[0]?.reschedule_date
                        ? `${formatDate(order?.reschedule[0]?.reschedule_date)}`
                        : 'Tanggal belum ditentukan vendor'}
                    </p>
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group>
                    <Form.Label>Tanggal Konfirmasi Vendor :</Form.Label>

                    <p className='fs-6'>
                      {order?.reschedule[0]?.confirm_date
                        ? ` ${formatDate(order?.reschedule[0]?.confirm_date)}`
                        : 'Tanggal belum ditentukan vendor'}
                    </p>
                  </Form.Group>
                </Col>
              </Row>

              <Row className='mb-5'>
                <Col>
                  <Form.Group>
                    <Form.Label>Nama Lengkap Tehnisi :</Form.Label>

                    <p className='fs-6'>
                      {order?.reschedule[0]?.reschedule_date
                        ? `${formatDate(order?.reschedule[0]?.reschedule_date)}`
                        : 'Tanggal belum ditentukan vendor'}
                    </p>
                  </Form.Group>
                </Col>
              </Row>
            </Skeleton>

            <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
              <Row className='mb-5'>
                <Col>
                  <Form.Label className='mt-3'>Bukti File :</Form.Label>
                  <ListGroup>
                    {order?.reschedule?.[0]?.reschedule_evidences?.map((item: any) => (
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
            </Skeleton>
          </Card.Body>
        </Card>
      )}

      <Card className='mt-5'>
        <Card.Header>
          <Card.Title className='fw-bold'>Order History</Card.Title>
        </Card.Header>

        <Card.Body>
          <div className='work-order-history'>
            <Steps
              progressDot
              current={orderHistorical.length - 1}
              direction='vertical'
              items={orderHistorical.map((item) => ({
                title: item?.order_status,
                description: `Terakhir update : ${item?.created_at} ${
                  item.updated_by ? `oleh ${item?.updated_by}` : ''
                }`,
              }))}
            />
          </div>
        </Card.Body>
      </Card>
    </>
  )
}
