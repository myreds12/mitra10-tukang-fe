import React, {FC, useState} from 'react'
import {Card, Row, Col, Form, ListGroup, Modal} from 'react-bootstrap'
import {Skeleton, Image} from 'antd'
import {formatDateWithTime} from '../../../../../../_metronic/helpers'
import {Orders} from '../../../../../interfaces/order'

interface DetailOrderRescheduleSectionProps {
  order: Orders
  apiUrl?: string
  isLoadingPage: boolean
}

export const DetailOrderRescheduleSection: FC<DetailOrderRescheduleSectionProps> = ({
  order,
  apiUrl,
  isLoadingPage,
}) => {
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleReschedule, setVisibleReschedule] = useState(false)

  if (!order?.reschedule || order?.reschedule?.length === 0) {
    return null
  }

  return (
    <Card className='mt-5'>
      <Card.Header>
        <Card.Title className='fw-bold'>Reschedule History</Card.Title>
      </Card.Header>

      <Card.Body>
        {order.reschedule.map((item: any, index: number) => (
          <Skeleton key={index} active loading={isLoadingPage} paragraph={{rows: 1}}>
            <Card className='mb-5'>
              <Card.Header>
                <Card.Title className='fs-5'>Reschedule History #{index + 1}</Card.Title>
              </Card.Header>

              <Card.Body>
                <Row className='mb-5'>
                  <Col>
                    <Form.Group>
                      <Form.Label>Tanggal Konfirmasi Awal Vendor :</Form.Label>
                      <p className='fs-6'>
                        {order?.work_orders
                          ? order.work_orders.work_start_date && order.work_orders.work_end_date
                            ? `${formatDateWithTime(
                                order?.work_orders?.work_start_date
                              )} sampai ${formatDateWithTime(
                                order?.work_orders?.work_end_date
                              )}`
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
                        {item?.reschedule_date
                          ? `${formatDateWithTime(item?.reschedule_date)}`
                          : 'Tanggal belum ditentukan vendor'}
                      </p>
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group>
                      <Form.Label>Tanggal Konfirmasi Vendor :</Form.Label>
                      <p className='fs-6'>
                        {item?.confirm_date
                          ? `${formatDateWithTime(item?.confirm_date)}`
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
                        {item?.reschedule_tukang?.length >= 1
                          ? item?.reschedule_tukang
                              ?.map((t: any) => t?.tukang?.full_name)
                              ?.join(', ')
                          : 'Tukang belum ditentukan vendor'}
                      </p>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='mb-5'>
                  <Col>
                    <Form.Label className='mt-3'>Bukti File :</Form.Label>
                    <ListGroup>
                      {item?.reschedule_evidences?.map((ev: any) => (
                        <ListGroup.Item
                          key={ev.id}
                          action
                          style={{cursor: 'pointer'}}
                          onClick={() => {
                            setPreviewImage(ev.evidence_location)
                            setVisibleReschedule(true)
                          }}
                        >
                          {ev.evidence_location}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    {previewImage && (
                      <div>
                        {previewImage.endsWith('.pdf') ? (
                          <Modal
                            dialogClassName='modal-show-pdf'
                            centered
                            show={visibleReschedule}
                            onHide={() => setVisibleReschedule(false)}
                          >
                            <Modal.Header closeButton>
                              <Modal.Title>File - {previewImage}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                              <iframe
                                key={previewImage}
                                title={previewImage}
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
          </Skeleton>
        ))}
      </Card.Body>
    </Card>
  )
}
