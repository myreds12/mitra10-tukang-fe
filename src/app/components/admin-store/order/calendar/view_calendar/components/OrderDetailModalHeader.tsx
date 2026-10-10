import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {Order} from '../types'

interface OrderDetailModalHeaderProps {
  selectedOrder: Order | null
}

export const OrderDetailModalHeader: React.FC<OrderDetailModalHeaderProps> = ({selectedOrder}) => {
  return (
    <div className='form-wrapper'>
      <Row className='form-header'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='fs-4 fw-bold'>
            Nama Toko :{' '}
            <span className='fs-4 ms-2 fw-normal'>
              {selectedOrder?.order_detail?.store?.store_name ?? ''}
            </span>
          </Form.Label>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='fs-4 fw-bold'>
            Order ID : <span className='fs-4 ms-2 fw-normal'>{selectedOrder?.id}</span>
          </Form.Label>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Col>
            <Form.Label className='fs-4 fw-bold'>
              Receipt Number :
              <span className='fs-4 ms-2 fw-normal'>
                {selectedOrder?.order_detail?.receipt_number ?? '-'}
              </span>
            </Form.Label>
          </Col>

          <Col>
            <Form.Label className='fs-4 fw-bold'>
              Order Status :
              <span className='fs-4 ms-2 fw-bold text-success'>
                {selectedOrder?.order_detail?.status?.description ?? '-'}
              </span>
            </Form.Label>
          </Col>
        </Col>
      </Row>

      <Row className='information-detail'>
        <Col xs={12} md={8} lg={8} xl={8} xxl={8} className='costumer-info'>
          <div className='fs-3 fw-bold'>Informasi Pembeli</div>

          <Row>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='5'>
                  No Member :
                </Form.Label>

                <Col sm='7'>
                  <p className='fs-7'>{selectedOrder?.order_detail?.members?.member_number}</p>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='5'>
                  Customer Name :
                </Form.Label>

                <Col sm='7'>
                  <p className='fs-7'>{selectedOrder?.order_detail?.members?.full_name}</p>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='5'>
                  Alamat Pemasangan :
                </Form.Label>

                <Col sm='7'>
                  <p className='fs-7'>{selectedOrder?.order_detail?.project_address}</p>
                </Col>
              </Form.Group>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='4'>
                  Nomor WA :
                </Form.Label>

                <Col sm='8'>
                  <p className='fs-7'>
                    {!selectedOrder?.order_detail?.project_number.startsWith('0')
                      ? `+62${selectedOrder?.order_detail?.members?.whatsapp_number}`
                      : '-'}
                  </p>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='4'>
                  Nomor Telepon :
                </Form.Label>
                <Col sm='8'>
                  <p className='fs-7'>
                    {selectedOrder?.order_detail?.project_number.startsWith('0')
                      ? selectedOrder?.order_detail?.members?.phone_number
                      : '-'}
                  </p>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='4'>
                  Alamat Email :
                </Form.Label>
                <Col sm='8'>
                  <p className='fs-7'>{selectedOrder?.order_detail?.members?.email} </p>
                </Col>
              </Form.Group>
            </Col>
          </Row>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='sales-info'>
          <div className='fs-3 fw-bold'>Informasi Penjual</div>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='4'>
              Sales ID :
            </Form.Label>

            <Col sm='8'>
              <p className='fs-7'>{selectedOrder?.order_detail?.sales?.id} </p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='4'>
              Sales Person :
            </Form.Label>

            <Col sm='8'>
              <p className='fs-7'>{selectedOrder?.order_detail?.sales?.full_name} </p>
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </div>
  )
}
