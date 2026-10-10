import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select from 'react-select'

interface NewRescheduleHeaderSectionProps {
  orderDetail: any
  order: any[]
  setSelectedOrder: (val: any) => void
  setSearchOrder: (val: string) => void
}

export const NewRescheduleHeaderSection: React.FC<NewRescheduleHeaderSectionProps> = ({
  orderDetail,
  order,
  setSelectedOrder,
  setSearchOrder,
}) => {
  return (
    <div className='form-wrapper'>
      <Row className='form-header'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='fs-4 fw-bold'>
            Nama Toko :
            <span className='fs-4 ms-2 fw-normal'>
              {orderDetail?.store?.store_name ?? ''}
            </span>
          </Form.Label>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Group as={Row} className='order-id-complaint'>
            <Form.Label column sm='3' className='fs-4 fw-bold'>
              Order ID :
            </Form.Label>
            <Col sm='9'>
              <Select
                name='order_id'
                className='form-control p-0'
                placeholder='Ketik/Pilih Order Id'
                isSearchable={true}
                options={order}
                onChange={(newValue) => setSelectedOrder(newValue)}
                onInputChange={(newValue) => setSearchOrder(newValue)}
              />
            </Col>
          </Form.Group>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='fs-4 fw-bold'>
            Receipt Number :
            <span className='fs-4 ms-2 fw-normal'>{orderDetail?.receipt_number ?? '-'}</span>
          </Form.Label>
          <br></br>
          <Form.Label className='fs-4 fw-bold'>
            LAST ORDER STATUS :{' '}
            <span className='fs-4 ms-2 fw-bold text-success'>
              {orderDetail?.status?.description}
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
                  Nomor Telp/WA :
                </Form.Label>
                <Col sm='7'>
                  <p className='fs-7'>{orderDetail?.project_number}</p>
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
    </div>
  )
}
