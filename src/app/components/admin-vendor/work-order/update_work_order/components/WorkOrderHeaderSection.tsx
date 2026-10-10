import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'

interface WorkOrderHeaderSectionProps {
  orderDetail: any
}

export const WorkOrderHeaderSection: React.FC<WorkOrderHeaderSectionProps> = ({orderDetail}) => {
  return (
    <Row className='form-header'>
      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Form.Label className='fs-4 fw-bold'>
          Nama Toko :{' '}
          <span className='fs-4 ms-2 fw-normal'>
            {orderDetail?.store?.store_name ?? ''}
          </span>
        </Form.Label>
      </Col>

      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Col>
          <Form.Label className='fs-4 fw-bold'>
            Order ID : <span className='fs-4 ms-2 fw-normal'>{orderDetail?.id ?? ''}</span>
          </Form.Label>
        </Col>

        <Col>
          <Form.Label className='fs-4 fw-bold'>
            Work Order ID :{' '}
            <span className='fs-4 ms-2 fw-normal'>
              {orderDetail?.work_orders?.id ?? '-'}
            </span>
          </Form.Label>
        </Col>
      </Col>

      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Col>
          <Form.Label className='fs-4 fw-bold'>
            Receipt Number :
            <span className='fs-4 ms-2 fw-normal'>
              {orderDetail?.receipt_number ?? '-'}
            </span>
          </Form.Label>
        </Col>

        <Col>
          <Form.Group as={Row}>
            <Form.Label className='fs-4 fw-bold pt-0'>
              {orderDetail?.work_orders === null
                ? 'New Work Status : '
                : 'Update Work Status : '}
              <span className='fw-normal'>
                {orderDetail?.status?.category === 'SURVEYREQ'
                  ? 'Tukang ditugaskan untuk survei'
                  : [
                      'WORKREQ',
                      'WORKREQSTEPONE',
                      'WORKREQSTEPTWO',
                      'WORKREQSTEPTHREE',
                    ].includes(orderDetail?.status?.category)
                  ? 'Tukang ditugaskan untuk pengerjaan'
                  : orderDetail?.status?.description}
              </span>
            </Form.Label>
          </Form.Group>
        </Col>
      </Col>
    </Row>
  )
}
