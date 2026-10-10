import React from 'react'
import {Row, Col, Form, Button} from 'react-bootstrap'
import {Skeleton, Tag} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRotate, faCircleInfo} from '@fortawesome/free-solid-svg-icons'

interface UpdateComplaintHeaderSectionProps {
  complaintDetail: any
  isLoadingPage: boolean
  resyncLoading: boolean
  handleResync: () => void
  getCrmSyncLabel: (isSync: number) => {text: string; color: string}
}

export const UpdateComplaintHeaderSection: React.FC<UpdateComplaintHeaderSectionProps> = ({
  complaintDetail,
  isLoadingPage,
  resyncLoading,
  handleResync,
  getCrmSyncLabel,
}) => {
  return (
    <div className='form-wrapper'>
      <Row className='form-header'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
            <Form.Label className='fs-4 fw-bold'>
              Nama Toko :{' '}
              <span className='fs-4 ms-2 fw-normal'>
                {complaintDetail?.orders?.store?.store_name ?? ''}
              </span>
            </Form.Label>
          </Skeleton>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
            <Form.Label className='fs-4 fw-bold'>
              Order ID :{' '}
              <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.orders?.id}</span>
            </Form.Label>
          </Skeleton>
          <br />
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
            <Form.Label className='fs-4 fw-bold'>
              Complaint ID :{' '}
              <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.id}</span>
            </Form.Label>
          </Skeleton>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Col>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
              <Form.Label className='fs-4 fw-bold'>
                Receipt Number :
                <span className='fs-4 ms-2 fw-normal'>
                  {complaintDetail?.orders?.receipt_number ?? '-'}
                </span>
              </Form.Label>

              {complaintDetail?.orders?.quotation?.[0]?.receipt_quotation && (
                <Form.Label className='fs-4 fw-bold'>
                  Receipt Quotation :
                  <span className='fs-4 ms-2 fw-normal'>
                    {complaintDetail?.orders?.quotation?.[0]?.receipt_quotation ?? '-'}
                  </span>
                </Form.Label>
              )}
            </Skeleton>
          </Col>

          <Col>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
              <Form.Label className='fs-4 fw-bold'>
                Order Status :
                <span className='fs-4 ms-2 fw-bold text-success'>
                  {(() => {
                    if (
                      (complaintDetail?.orders?.work_orders?.work_order_status?.length ?? 0) >= 0
                    ) {
                      if (
                        [
                          'QUOTEIN',
                          'QUOTEOUT',
                          'CANCEL',
                          'WARRANTYCLAIM',
                          'INVESTIGATED',
                          'COMPLAINTAPPROVEDBYHO',
                          'COMPLAINTREJECTEDBYHO',
                          'RESCHEDULE',
                          'RESURVEYREQ',
                          'REWORKREQ',
                        ].includes(complaintDetail?.orders?.status?.category ?? '')
                      ) {
                        return complaintDetail?.orders?.status?.description
                      } else if (
                        ['WORKREQ'].includes(
                          complaintDetail?.orders?.status?.category ?? ''
                        ) &&
                        complaintDetail?.orders?.payment_type === 'survey' &&
                        !['WORKSTART', 'WORKEND'].includes(
                          complaintDetail?.orders?.work_orders?.work_order_status?.[0]?.status
                            ?.category ?? ''
                        )
                      ) {
                        return complaintDetail?.orders?.status?.description
                      } else {
                        return complaintDetail?.orders?.work_orders?.work_order_status?.[0]
                          ?.status?.description
                      }
                    } else {
                      return complaintDetail?.orders?.status?.description
                    }
                  })()}
                </span>
              </Form.Label>
            </Skeleton>
          </Col>

          {/* CRM Sync Status */}
          <div className='mt-3 p-2 border rounded bg-light'>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-2'>
                <span className='fw-bold text-warning'>CRM:</span>
                <Tag color={getCrmSyncLabel(complaintDetail?.is_sync ?? 0).color}>
                  {getCrmSyncLabel(complaintDetail?.is_sync ?? 0).text}
                </Tag>
              </div>
              {(complaintDetail?.is_sync ?? 0) !== 1 && (
                <Button
                  variant='outline-warning'
                  size='sm'
                  disabled={resyncLoading}
                  onClick={handleResync}
                  title='Resubmit ke CRM'
                >
                  <FontAwesomeIcon icon={faRotate} spin={resyncLoading} />
                </Button>
              )}
              {(complaintDetail?.is_sync ?? 0) === 1 && (
                <span className='text-success fw-bold' style={{fontSize: '12px'}}>
                  <FontAwesomeIcon icon={faCircleInfo} className='me-1' />
                  Tersinkronisasi
                </span>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row className='information-detail'>
        <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
            <div className='fs-3 fw-bold'>Informasi Pembeli</div>

            <Row>
              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='6'>
                    No Member :
                  </Form.Label>
                  <Col sm='6'>
                    <p className='fs-7'>{complaintDetail?.orders?.members?.member_number}</p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='6'>
                    Customer Name :
                  </Form.Label>
                  <Col sm='6'>
                    <p className='fs-7'>{complaintDetail?.orders?.members?.full_name}</p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='6'>
                    Alamat Pemasangan :
                  </Form.Label>
                  <Col sm='6'>
                    <p className='fs-7'>{complaintDetail?.orders?.project_address}</p>
                  </Col>
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='5'>
                    Nomor Whatsapp :
                  </Form.Label>
                  <Col sm='7'>
                    <p className='fs-7'>
                      {!complaintDetail?.orders?.project_number?.startsWith('0')
                        ? `+62${complaintDetail?.orders?.members?.whatsapp_number}`
                        : '-'}
                    </p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='5'>
                    Nomor Telepon :
                  </Form.Label>
                  <Col sm='7'>
                    <p className='fs-7'>
                      {complaintDetail?.orders?.project_number?.startsWith('0')
                        ? complaintDetail?.orders?.members?.phone_number
                        : '-'}
                    </p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='5'>
                    Alamat Email :
                  </Form.Label>
                  <Col sm='7'>
                    <p className='fs-7'>{complaintDetail?.orders?.members?.email} </p>
                  </Col>
                </Form.Group>
              </Col>
            </Row>
          </Skeleton>
        </Col>

        <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
            <div className='fs-3 fw-bold'>Informasi Penjual</div>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='3'>
                Sales ID :
              </Form.Label>
              <Col sm='9'>
                <p className='fs-7'>{complaintDetail?.orders?.sales?.id} </p>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='3'>
                Sales Person :
              </Form.Label>
              <Col sm='9'>
                <p className='fs-7'>{complaintDetail?.orders?.sales?.full_name} </p>
              </Col>
            </Form.Group>
          </Skeleton>
        </Col>
      </Row>
    </div>
  )
}
