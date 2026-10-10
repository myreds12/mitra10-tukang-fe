import React from 'react'
import {Form, Row, Col} from 'react-bootstrap'
import {Skeleton} from 'antd'
import {formatDateWithTime} from '../../../../../../_metronic/helpers'
import {WorkOrders} from '../types'

interface WorkOrderInfoSectionProps {
  isLoadingPage: boolean
  workOrderDetail: any
  workOrder: WorkOrders
  workOrderHandler: (value: any, target: string) => void
  evidencesSection: React.ReactNode
}

export const WorkOrderInfoSection: React.FC<WorkOrderInfoSectionProps> = ({
  isLoadingPage,
  workOrderDetail,
  workOrder,
  workOrderHandler,
  evidencesSection,
}) => {
  return (
    <Row>
      <Col xxl={8} xl={8} md={8} sm={12}>
        <Row>
          <Col xxl={6} xl={6} md={6} sm={12}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
              <Form.Group className='detail-info' as={Row}>
                <Form.Label className='fs-7' column md='4'>
                  Nama Toko
                </Form.Label>

                <Col md='8' className='d-flex align-items-center'>
                  <p className='fs-7 fw-semibold'>
                    {workOrderDetail?.order?.store?.store_name ?? ''}
                  </p>
                </Col>
              </Form.Group>
            </Skeleton>
          </Col>

          <Col xxl={6} xl={6} md={6} sm={12}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
              <Form.Group className='detail-info' as={Row}>
                <Form.Label className='fs-7' column md='4'>
                  Nama Vendor
                </Form.Label>

                <Col md='8' className='d-flex align-items-center'>
                  <p className='fs-7 fw-semibold'>
                    {workOrderDetail?.vendor?.company_name ?? ''}
                  </p>
                </Col>
              </Form.Group>
            </Skeleton>
          </Col>
        </Row>

        <Row>
          <Col xxl={6} xl={6} md={6} sm={12}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
              <Form.Group className='detail-info' as={Row}>
                <Form.Label className='fs-7' column md='4'>
                  Order ID
                </Form.Label>

                <Col md='8'>
                  <Form.Control readOnly value={workOrderDetail?.order_id ?? ''} />
                </Col>
              </Form.Group>

              <Row className='detail-info'>
                <Col md={4}>
                  <div className='title'>
                    <h1 className='fs-6'>Customer Info</h1>
                  </div>
                </Col>

                <Col md={8} className='mt-5'>
                  <div className='detail-info'>
                    <p className='fs-7 fw-bold '>
                      {workOrderDetail?.order?.members?.full_name ?? ''}
                    </p>
                    <p className='fs-7'>{workOrderDetail?.order?.members?.email ?? ''}</p>
                  </div>
                </Col>
              </Row>

              <Row className='detail-info'>
                <Col md={4}>
                  <div className='title'>
                    <h1 className='fs-6'>Catatan Toko</h1>
                  </div>
                </Col>

                <Col md={8} className='mt-5'>
                  <div className='detail-info'>
                    <p className='fs-7 fw-normal '>
                      {workOrderDetail?.order?.notes ?? 'Toko tidak memberikan catatan'}
                    </p>
                  </div>
                </Col>
              </Row>
            </Skeleton>
          </Col>

          <Col xxl={6} xl={6} md={6} sm={12}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 5}}>
              <Form.Group className='detail-info' as={Row}>
                <Form.Label className='fs-7' column sm='4'>
                  Work Order ID
                </Form.Label>

                <Col sm='8'>
                  <Form.Control readOnly value={workOrderDetail?.id ?? '-'} />
                </Col>
              </Form.Group>

              <Row className='detail-info'>
                <Col md={4}>
                  <div className='title'>
                    <h1 className='fs-6'>Work Order Info</h1>
                  </div>
                </Col>

                <Col md={8} className='mt-5'>
                  <div className='detail-info'>
                    {[
                      'SURVEYREQ',
                      'TUKANGSURVEY',
                      'SURVEYSTART',
                      'SURVEYDONE',
                      'RESURVEYREQ',
                      'RESURVEYSTART',
                      'RESURVEYDONE',
                    ].includes(workOrderDetail?.work_order_status[0]?.status?.category) && (
                      <>
                        {workOrderDetail?.order?.m_order_details?.map(
                          (item: any, index: number) => (
                            <p key={`${index}-work_order_tukang`} className='fs-7'>
                              {item?.item_notes ?? '-'}
                            </p>
                          )
                        )}
                      </>
                    )}

                    {[
                      'WORKREQ',
                      'TUKANGWORK',
                      'WORKSTART',
                      'WORKEND',
                      'REWORKSTART',
                      'REWORKEND',
                      'WORKDONE',
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
                    ].includes(workOrderDetail?.work_order_status[0]?.status?.category) && (
                      <>
                        {workOrderDetail?.work_order_status[0]?.work_order_items.map(
                          (item: any, index: number) => (
                            <p key={`${index}-work_order_tukang`} className='fs-7'>
                              {item?.name ?? '-'}
                            </p>
                          )
                        )}
                      </>
                    )}
                  </div>
                </Col>
              </Row>

              {evidencesSection}
            </Skeleton>
          </Col>
        </Row>

        <Row>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
            <Form.Group className='detail-info'>
              <Form.Label className='fs-7'>Catatan Tambahan</Form.Label>

              <Form.Control
                name='description'
                style={{minHeight: '170px'}}
                as='textarea'
                value={workOrder.description}
                onChange={(e) => workOrderHandler(e.target.value, 'description')}
              />
            </Form.Group>
          </Skeleton>
        </Row>
      </Col>

      <Col xxl={4} xl={4} md={4} sm={12}>
        <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
          <Form.Group as={Row} className='detail-info'>
            <Form.Label className='pt-3 fs-5 fw-semibold'>
              WORK ORDER STATUS :
              <span className='fw-bold'> {workOrderDetail?.order?.status?.description}</span>
            </Form.Label>
          </Form.Group>

          {[
            'SURVEYREQ',
            'TUKANGSURVEY',
            'SURVEYSTART',
            'SURVEYDONE',
            'RESURVEYREQ',
            'RESURVEYSTART',
            'RESURVEYDONE',
          ].includes(workOrderDetail?.order?.status?.category) && (
            <Row className='detail-info'>
              <div className='title'>
                <h1 className='fs-6'>Survey</h1>
              </div>

              <Form.Group className='detail-info'>
                <Form.Label className='fs-6'>Tanggal Survey</Form.Label>

                <Col sm='8'>
                  <p className='fs-6'>{formatDateWithTime(workOrderDetail?.survey_date)}</p>
                </Col>
              </Form.Group>

              <Form.Group className='detail-info'>
                <Form.Label className='fs-6'>Tehnisi Survey</Form.Label>

                <Col sm='8'>
                  <p>
                    {Array.from(
                      new Set(
                        workOrderDetail?.work_order_tukang
                          ?.filter((x: any) => x.type === 1)
                          ?.map((x: any) => x?.tukang?.full_name ?? '-')
                      )
                    ).join(', ')}
                  </p>
                </Col>
              </Form.Group>

              <Form.Group className='detail-info'>
                <Form.Label>Sesi :</Form.Label>

                {workOrderDetail?.session !== null ? (
                  <p>
                    {workOrderDetail?.session === 1
                      ? 'Sesi Pagi'
                      : workOrderDetail?.session === 2
                      ? 'Sesi Siang'
                      : workOrderDetail?.session === 3
                      ? 'Sesi Sore'
                      : 'Sesi belum ditentukan oleh vendor'}
                  </p>
                ) : (
                  <p>Sesi belum diset oleh vendor</p>
                )}
              </Form.Group>
            </Row>
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
          ].includes(workOrderDetail?.order?.status?.category) && (
            <Row className='detail-info'>
              <div className='title'>
                <h1 className='fs-6'>Pengerjaan</h1>
              </div>

              <Form.Group className='detail-info'>
                <Form.Label className='fs-6'>Tanggal Mulai dan Selesai Pekerjaan</Form.Label>

                <Col sm='8'>
                  <p>
                    {formatDateWithTime(workOrderDetail.work_start_date)} sampai{' '}
                    {formatDateWithTime(workOrderDetail.work_end_date)}
                  </p>
                </Col>
              </Form.Group>

              <Form.Group className='detail-info'>
                <Form.Label className='fs-6'>Tehnisi Pengerjaan</Form.Label>

                <Col sm='8'>
                  <p className='fs-6 fw-bold'>
                    {Array.from(
                      new Set(
                        workOrderDetail?.work_order_tukang
                          ?.filter((x: any) => x.type === 2)
                          ?.map((x: any) => x?.tukang?.full_name ?? '-')
                      )
                    ).join(', ')}
                  </p>
                </Col>
              </Form.Group>

              <Form.Group className='detail-info'>
                <Form.Label>Sesi :</Form.Label>

                {workOrderDetail?.session !== null ? (
                  <p>
                    {workOrderDetail?.session === 1
                      ? 'Sesi Pagi'
                      : workOrderDetail?.session === 2
                      ? 'Sesi Siang'
                      : workOrderDetail?.session === 3
                      ? 'Sesi Sore'
                      : 'Sesi belum ditentukan oleh vendor'}
                  </p>
                ) : (
                  <p>Sesi belum diset oleh vendor</p>
                )}
              </Form.Group>
            </Row>
          )}
        </Skeleton>
      </Col>
    </Row>
  )
}
