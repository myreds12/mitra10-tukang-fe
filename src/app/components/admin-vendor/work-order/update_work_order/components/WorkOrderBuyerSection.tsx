import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'

interface WorkOrderBuyerSectionProps {
  orderDetail: any
}

export const WorkOrderBuyerSection: React.FC<WorkOrderBuyerSectionProps> = ({orderDetail}) => {
  return (
    <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12} className='costumer-info mb-5'>
      <div className='fs-4 fw-bold'>Informasi Pembeli</div>

      <Row>
        <Col xxl={6} xl={6} lg={6} md={6} sm={12} xs={12}>
          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              No Member
            </Form.Label>
            <Col sm='6'>
              <p className='fs-7'>{orderDetail?.members?.member_number ?? ''}</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Customer Name
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

        <Col xxl={6} xl={6} lg={6} md={6} sm={12} xs={12}>
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
    </Col>
  )
}
