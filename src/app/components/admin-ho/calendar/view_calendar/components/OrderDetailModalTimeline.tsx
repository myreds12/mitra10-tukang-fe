import React from 'react'
import {Row} from 'react-bootstrap'
import {Steps} from 'antd'
import {Order, TimelineHistoryItem} from '../types'

interface OrderDetailModalTimelineProps {
  orderDetail: any
  selectedOrder: Order | null
  orderHistory: TimelineHistoryItem[]
  complaintHistory: TimelineHistoryItem[]
}

export const OrderDetailModalTimeline: React.FC<OrderDetailModalTimelineProps> = ({
  orderDetail,
  selectedOrder,
  orderHistory,
  complaintHistory,
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
                orderDetail?.work_orders?.work_order_status?.length > 0
                  ? orderDetail?.work_orders?.work_order_status[0]?.status?.id
                  : orderDetail?.project_status_id
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
    </>
  )
}
