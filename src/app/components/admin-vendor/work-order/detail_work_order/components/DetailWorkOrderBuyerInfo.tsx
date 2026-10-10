import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {Skeleton} from 'antd'

interface DetailWorkOrderBuyerInfoProps {
  orderDetail: any
  isLoadingPage: boolean
}

export const DetailWorkOrderBuyerInfo: React.FC<DetailWorkOrderBuyerInfoProps> = ({
  orderDetail,
  isLoadingPage,
}) => {
  return (
    <Col xs={12} sm={12} md={8} lg={8} xl={8} xxl={8} className='costumer-info mb-5'>
      <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
        <div className='fs-4 fw-bold'>Informasi Pembeli</div>
      </Skeleton>

      <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
        <Row>
          <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='6'>
                No Member :
              </Form.Label>
              <Col sm='6'>
                <p className='fs-7'>{orderDetail?.members?.member_number ?? ''}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='6'>
                Customer Name :
              </Form.Label>
              <Col sm='6'>
                <p className='fs-7'>{orderDetail?.members?.full_name ?? ''}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='6'>
                Alamat Pemasangan
              </Form.Label>
              <Col sm='6'>
                <p className='fs-7'>{orderDetail?.project_address ?? ''}</p>
              </Col>
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='4'>
                Nomor Telp/WA
              </Form.Label>

              <Col sm='8'>
                <p className='fs-7'>{orderDetail?.project_number ?? ''}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='4'>
                Alamat Email
              </Form.Label>

              <Col sm='8'>
                <p className='fs-7'>{orderDetail?.members?.email ?? ''} </p>
              </Col>
            </Form.Group>
          </Col>
        </Row>
      </Skeleton>
    </Col>
  )
}
