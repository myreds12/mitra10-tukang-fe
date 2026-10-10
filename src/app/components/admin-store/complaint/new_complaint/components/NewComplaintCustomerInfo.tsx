import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'

interface NewComplaintCustomerInfoProps {
  orderDetail: any
}

export const NewComplaintCustomerInfo: React.FC<NewComplaintCustomerInfoProps> = ({
  orderDetail,
}) => {
  return (
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
                <p className='fs-7'>{orderDetail?.members?.member_number}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='6'>
                Customer Name :
              </Form.Label>
              <Col sm='6'>
                <p className='fs-7'>{orderDetail?.members?.full_name}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='6'>
                Alamat Pemasangan :
              </Form.Label>
              <Col sm='6'>
                <p className='fs-7'>{orderDetail?.project_address}</p>
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
                  {!orderDetail?.project_number?.startsWith('0')
                    ? `${
                        orderDetail?.members?.whatsapp_number
                          ? `+62 ${orderDetail?.members?.whatsapp_number}`
                          : '-'
                      }`
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
                  {orderDetail?.project_number?.startsWith('0')
                    ? orderDetail?.members?.phone_number
                    : '-'}
                </p>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='5'>
                Alamat Email :
              </Form.Label>
              <Col sm='7'>
                <p className='fs-7'>{orderDetail?.members?.email} </p>
              </Col>
            </Form.Group>
          </Col>
        </Row>
      </Col>

      <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
        <div className='fs-3 fw-bold'>Informasi Penjual</div>

        <Form.Group as={Row} className='detail-info'>
          <Form.Label column sm='3'>
            Sales ID :
          </Form.Label>
          <Col sm='9'>
            <p className='fs-7'>{orderDetail?.sales?.id} </p>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className='detail-info'>
          <Form.Label column sm='3'>
            Sales Person :
          </Form.Label>
          <Col sm='9'>
            <p className='fs-7'>{orderDetail?.sales?.full_name} </p>
          </Col>
        </Form.Group>
      </Col>
    </Row>
  )
}
