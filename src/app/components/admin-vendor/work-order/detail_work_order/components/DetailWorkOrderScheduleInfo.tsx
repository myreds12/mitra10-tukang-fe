import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {Skeleton} from 'antd'

interface DetailWorkOrderScheduleInfoProps {
  orderDetail: any
  isLoadingPage: boolean
  formatDateWithTime: (date: any) => string
}

export const DetailWorkOrderScheduleInfo: React.FC<DetailWorkOrderScheduleInfoProps> = ({
  orderDetail,
  isLoadingPage,
  formatDateWithTime,
}) => {
  return (
    <Col xs={12} sm={12} md={4} lg={4} xl={4} xxl={4} className='sales-info mb-5'>
      <Row>
        {[
          'SURVEYREQ',
          'TUKANGSURVEY',
          'SURVEYSTART',
          'SURVEYDONE',
          'RESURVEYREQ',
          'RESURVEYSTART',
          'RESURVEYDONE',
        ].includes(orderDetail?.status?.category) && (
          <Col>
            <div className='survey mb-3'>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                <div className='fs-4 fw-bold'>Survey</div>
              </Skeleton>

              <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                <Form.Group className='detail-info mb-3'>
                  <Form.Label>Tanggal Survey :</Form.Label>

                  {orderDetail?.work_orders !== null &&
                  orderDetail?.work_orders?.survey_date !== null ? (
                    <p>{formatDateWithTime(orderDetail?.work_orders?.survey_date)}</p>
                  ) : (
                    <p>Tanggal survey belum diset oleh vendor</p>
                  )}
                </Form.Group>

                <Form.Group className='detail-info mb-3'>
                  <Form.Label>Nama Lengkap Tehnisi :</Form.Label>

                  {orderDetail?.work_orders !== null ? (
                    <p>
                      {Array.from(
                        new Set(
                          orderDetail?.work_orders?.work_order_tukang
                            ?.filter((x: any) => x.type === 1)
                            ?.map((x: any) => x?.tukang?.full_name ?? '-')
                        )
                      ).join(', ')}
                    </p>
                  ) : (
                    <p>Tukang belum diset oleh vendor</p>
                  )}
                </Form.Group>

                <Form.Group className='detail-info mb-3'>
                  <Form.Label>Sesi :</Form.Label>

                  {orderDetail?.work_orders !== null ? (
                    <p>
                      {orderDetail?.work_orders?.session === 1
                        ? 'Sesi Pagi'
                        : orderDetail?.work_orders?.session === 2
                        ? 'Sesi Siang'
                        : orderDetail?.work_orders?.session === 3
                        ? 'Sesi Sore'
                        : 'Sesi belum ditentukan oleh vendor'}
                    </p>
                  ) : (
                    <p>Sesi belum ditentukan oleh vendor</p>
                  )}
                </Form.Group>
              </Skeleton>
            </div>
          </Col>
        )}

        {[
          'WORKREQ',
          'TUKANGWORK',
          'WORKSTART',
          'WORKEND',
          'REWORKREQ',
          'REWORKSTART',
          'REWORKEND',
          'RESCHEDULE',
          'DONE',
          'WORKREQSTEPONE',
          'WORKREQSTEPTWO',
          'WORKREQSTEPTHREE',
          'WORKSTARTSTEPONE',
          'WORKSTARTSTEPTWO',
          'WORKSTARTSTEPTHREE',
          'WORKENDSTEPONE',
          'WORKENDSTEPTWO',
          'WORKENDSTEPTHREE',
          'TUKANGWORKSTEPONE',
          'TUKANGWORKSTEPTWO',
          'TUKANGWORKSTEPTHREE',
        ].includes(orderDetail?.status?.category) && (
          <Col>
            <div className='work-date'>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                <div className='fs-4 fw-bold'>Pengerjaan</div>
              </Skeleton>

              <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                <Form.Group className='detail-info mb-3'>
                  <Form.Label>Tanggal mulai pengerjaan :</Form.Label>

                  {orderDetail?.work_orders !== null &&
                  orderDetail?.work_orders?.work_start_date !== null &&
                  orderDetail?.work_orders?.work_end_date !== null ? (
                    <p>
                      {formatDateWithTime(orderDetail?.work_orders?.work_start_date)} sampai{' '}
                      {formatDateWithTime(orderDetail?.work_orders?.work_end_date)}
                    </p>
                  ) : (
                    <p>Tanggal Pengerjaan belum diset oleh vendor</p>
                  )}
                </Form.Group>

                <Form.Group className='detail-info mb-3'>
                  <Form.Label>Nama Lengkap Tehnisi :</Form.Label>

                  {orderDetail?.work_orders?.work_order_tukang?.filter(
                    (x: any) => x.type === 2
                  )?.length ? (
                    <p>
                      {Array.from(
                        new Set(
                          orderDetail?.work_orders?.work_order_tukang
                            ?.filter((x: any) => x.type === 2)
                            ?.map((x: any) => x?.tukang?.full_name ?? '-')
                        )
                      ).join(', ')}
                    </p>
                  ) : (
                    <p>Tukang belum diset oleh vendor</p>
                  )}
                </Form.Group>

                <Form.Group className='detail-info mb-3'>
                  <Form.Label>Sesi :</Form.Label>

                  {orderDetail?.work_orders !== null ? (
                    <p>
                      {orderDetail?.work_orders?.session === 1
                        ? 'Sesi Pagi'
                        : orderDetail?.work_orders?.session === 2
                        ? 'Sesi Siang'
                        : orderDetail?.work_orders?.session === 3
                        ? 'Sesi Sore'
                        : 'Sesi belum ditentukan oleh vendor'}
                    </p>
                  ) : (
                    <p>Sesi belum ditentukan oleh vendor</p>
                  )}
                </Form.Group>
              </Skeleton>
            </div>
          </Col>
        )}
      </Row>
    </Col>
  )
}
