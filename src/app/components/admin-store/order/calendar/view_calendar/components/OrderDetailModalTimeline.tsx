import React from 'react'
import {Row, Card} from 'react-bootstrap'
import {Steps} from 'antd'
import {Order, OrderHistory} from '../types'

interface OrderDetailModalTimelineProps {
  selectedOrder: Order | null
  orderHistory: any[]
  complaintHistory: any[]
  orderHistorical: OrderHistory[]
}

export const OrderDetailModalTimeline: React.FC<OrderDetailModalTimelineProps> = ({
  selectedOrder,
  orderHistory,
  complaintHistory,
  orderHistorical,
}) => {
  return (
    <>
      <Row className='mt-3 mb-3'>
        <div className='order-history'>
          <div className='fs-3 fw-bold text-success mb-4'>Order History</div>
          <Steps
            className='order-history-timeline'
            current={orderHistory.findIndex((step) =>
              step.value.includes(
                selectedOrder?.order_detail?.work_orders?.work_order_status?.length > 0
                  ? selectedOrder?.order_detail?.work_orders?.work_order_status[0]?.status?.id
                  : selectedOrder?.order_detail?.project_status_id
              )
            )}
            labelPlacement='vertical'
            items={orderHistory}
          />
        </div>
      </Row>

      <Row className='mt-3 mb-3'>
        {selectedOrder?.order_detail?.complaints &&
          selectedOrder?.order_detail?.complaints?.length >= 1 && (
            <div className='complaint-history'>
              <div className='fs-3 fw-bold text-danger mb-4'>Complaint History</div>
              <Steps
                className='complaint-history-timeline'
                current={complaintHistory.findIndex((step) =>
                  step.value.includes(
                    selectedOrder?.order_detail?.work_orders?.work_order_status?.length > 0
                      ? selectedOrder?.order_detail?.work_orders?.work_order_status[0]?.status?.id
                      : selectedOrder?.order_detail?.project_status_id
                  )
                )}
                labelPlacement='vertical'
                items={complaintHistory}
              />
            </div>
          )}
      </Row>

      <Row className='mt-3 mb-3'>
        <Card className='mt-5'>
          <Card.Header>
            <Card.Title className='fw-bold'>Order History</Card.Title>
          </Card.Header>

          <Card.Body>
            <div className='work-order-history'>
              <Steps
                progressDot
                current={orderHistorical.length - 1}
                direction='vertical'
                items={orderHistorical.map((item) => ({
                  title: item?.order_status,
                  description: `Terakhir update : ${item?.created_at} ${
                    item.updated_by ? `oleh ${item?.updated_by}` : ''
                  }`,
                }))}
              />
            </div>
          </Card.Body>
        </Card>
      </Row>
    </>
  )
}
