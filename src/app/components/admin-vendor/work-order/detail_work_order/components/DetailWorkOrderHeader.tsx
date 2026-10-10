import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {Skeleton} from 'antd'

interface DetailWorkOrderHeaderProps {
  orderDetail: any
  isLoadingPage: boolean
}

export const DetailWorkOrderHeader: React.FC<DetailWorkOrderHeaderProps> = ({
  orderDetail,
  isLoadingPage,
}) => {
  return (
    <Row className='form-header mb-5'>
      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
          <Form.Label className='fs-4 fw-bold'>
            Nama Toko :{' '}
            <span className='fs-4 ms-2 fw-normal'>
              {orderDetail?.store?.store_name ?? ''}
            </span>
          </Form.Label>
        </Skeleton>
      </Col>

      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
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
        </Skeleton>
      </Col>

      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
          <Col>
            <Form.Label className='fs-4 fw-bold'>
              Receipt Number :
              <span className='fs-4 ms-2 fw-normal'>
                {orderDetail?.receipt_number ?? '-'}
              </span>
            </Form.Label>
          </Col>

          <Col>
            <Form.Label className='fs-4 fw-bold'>
              Order Status :
              <span className='fs-4 ms-2 fw-bold text-success'>
                {orderDetail?.status?.description}
              </span>
            </Form.Label>
          </Col>
        </Skeleton>
      </Col>
    </Row>
  )
}
