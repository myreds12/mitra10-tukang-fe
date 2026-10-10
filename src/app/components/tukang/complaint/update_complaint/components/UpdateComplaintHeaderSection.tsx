import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'

interface UpdateComplaintHeaderSectionProps {
  complaintDetail: any
  phoneNumber: string
  formatDate: (date: any) => string
}

export const UpdateComplaintHeaderSection: React.FC<UpdateComplaintHeaderSectionProps> = ({
  complaintDetail,
  phoneNumber,
  formatDate,
}) => {
  return (
    <div className='form-wrapper'>
      <Row className='form-header'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='fs-4 fw-bold'>
            Nama Toko :
            <span className='fs-4 ms-2 fw-normal'>
              {complaintDetail?.orders?.store?.store_name}
            </span>
          </Form.Label>
          <br />
          <Form.Label className='fs-4 fw-bold'>
            Complaint ID : <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.id}</span>
          </Form.Label>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='fs-4 fw-bold'>
            Order ID :
            <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.orders?.id}</span>
          </Form.Label>

          <Form.Group as={Row}>
            <Form.Label column sm='4' className='fs-4 fw-bold m-0'>
              Order Date :
            </Form.Label>
            <Col sm='8'>
              <Form.Control
                type='text'
                plaintext
                readOnly
                value={
                  complaintDetail?.orders
                    ? formatDate(new Date(complaintDetail?.orders?.created_at))
                    : ''
                }
              />
            </Col>
          </Form.Group>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='fs-4 fw-bold'>
            Receipt Number :
            <span className='fs-4 ms-2 fw-normal'>
              {complaintDetail?.orders?.receipt_number}
            </span>
          </Form.Label>
        </Col>
      </Row>

      <Row className='information-detail'>
        <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
          <div className='fs-3 fw-bold'>Informasi Pembeli</div>
          <Row>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='6'>
                  No Member :
                </Form.Label>
                <Col sm='6'>
                  <Form.Control
                    plaintext
                    readOnly
                    value={complaintDetail?.orders?.members?.id ?? ''}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='6'>
                  Customer Name :
                </Form.Label>
                <Col sm='6'>
                  <Form.Control
                    plaintext
                    readOnly
                    value={complaintDetail?.orders?.members?.full_name ?? ''}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='6'>
                  Alamat Pemasangan :
                </Form.Label>
                <Col sm='6'>
                  <Form.Control
                    as='textarea'
                    plaintext
                    readOnly
                    rows={3}
                    value={complaintDetail?.orders?.project_address ?? ''}
                  />
                </Col>
              </Form.Group>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='4'>
                  Nomor Telp/WA :
                </Form.Label>
                <Col sm='8'>
                  <Form.Control plaintext readOnly value={phoneNumber ?? ''} />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='4'>
                  Alamat Email :
                </Form.Label>
                <Col sm='8'>
                  <Form.Control
                    plaintext
                    readOnly
                    value={complaintDetail?.orders?.members?.email ?? ''}
                  />
                </Col>
              </Form.Group>
            </Col>
          </Row>
        </Col>

        <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
          <div className='fs-3 fw-bold'>Informasi Penjual</div>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Sales ID :
            </Form.Label>
            <Col sm='6'>
              <Form.Control plaintext readOnly value={complaintDetail?.orders?.sales?.id ?? ''} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Sales Person :
            </Form.Label>
            <Col sm='6'>
              <Form.Control
                plaintext
                readOnly
                value={complaintDetail?.orders?.sales?.full_name ?? ''}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </div>
  )
}
