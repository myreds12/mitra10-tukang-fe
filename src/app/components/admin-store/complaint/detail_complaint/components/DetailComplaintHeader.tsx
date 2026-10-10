import React, { FC } from 'react'
import { Row, Col, Form } from 'react-bootstrap'
import { Skeleton } from 'antd'
import { formatDate } from '@fullcalendar/core'

interface DetailComplaintHeaderProps {
  isLoadingPage: boolean
  complaintDetail: any
}

export const DetailComplaintHeader: FC<DetailComplaintHeaderProps> = ({
  isLoadingPage,
  complaintDetail,
}) => {
  return (
    <>
      <div className='form-wrapper'>
        <Row className='form-header'>
          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{ rows: 0 }}>
              <Form.Label className='fs-4 fw-bold'>
                Nama Toko :{' '}
                <span className='fs-4 ms-2 fw-normal'>
                  {complaintDetail?.orders?.store?.store_name ?? ''}
                </span>
              </Form.Label>
            </Skeleton>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{ rows: 0 }}>
              <Form.Label className='fs-4 fw-bold'>
                Order ID :{' '}
                <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.orders?.id}</span>
              </Form.Label>
            </Skeleton>
            <br></br>
            <Skeleton active loading={isLoadingPage} paragraph={{ rows: 0 }}>
              <Form.Label className='fs-4 fw-bold'>
                Complaint ID :{' '}
                <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.id}</span>
              </Form.Label>
            </Skeleton>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Col>
              <Skeleton active loading={isLoadingPage} paragraph={{ rows: 0 }}>
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
                      {complaintDetail?.orders?.quotation[0]?.receipt_quotation ?? '-'}
                    </span>
                  </Form.Label>
                )}
              </Skeleton>
            </Col>

            <Col>
              <Skeleton active loading={isLoadingPage} paragraph={{ rows: 0 }}>
                <Form.Label className='fs-4 fw-bold'>
                  Status Order :
                  <span className='fs-4 ms-2 fw-bold text-success'>
                    {complaintDetail?.orders?.status?.description ?? '-'}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Col>
        </Row>

        <Row className='information-detail'>
          <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
            <Skeleton active loading={isLoadingPage} paragraph={{ rows: 3 }}>
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
                        {complaintDetail?.orders?.project_number &&
                        !complaintDetail?.orders?.project_number.startsWith('0')
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
                        {complaintDetail?.orders?.project_number &&
                        complaintDetail?.orders?.project_number.startsWith('0')
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
            <Skeleton active loading={isLoadingPage} paragraph={{ rows: 3 }}>
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

      <Row className='table-warranty d-flex align-items-center mb-5'>
        <div className='table-title-warranty'>
          <Skeleton active loading={isLoadingPage} paragraph={{ rows: 2 }}>
            <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

            <Row>
              <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                <Form.Label column>
                  {complaintDetail?.orders?.payment_type === 'survey'
                    ? 'Tanggal request survey :'
                    : 'Tanggal request pemasangan :'}
                </Form.Label>
                <Col>
                  <p className='fs-7 p-0'>
                    {formatDate(complaintDetail?.orders?.request_survey)}
                  </p>
                </Col>
              </Form.Group>

              <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                <Col>
                  <p className='fs-7 p-0'>
                    {complaintDetail?.orders?.vendor?.company_name ?? '-'}
                  </p>
                </Col>
              </Form.Group>

              <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                <Form.Label column>Payment Type:</Form.Label>
                <Col>
                  <p className='fs-7 p-0'>
                    {(() => {
                      if (complaintDetail?.orders?.payment_type === 'survey') {
                        return `Berbayar & Survey`
                      } else if (complaintDetail?.orders?.payment_type === 'gratis') {
                        return `Gratis`
                      } else if (
                        complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
                      ) {
                        return `Berbayar & Pemasangan Tanpa Survey`
                      } else {
                        return ``
                      }
                    })()}
                  </p>
                </Col>
              </Form.Group>
            </Row>
          </Skeleton>
        </div>
      </Row>
    </>
  )
}
