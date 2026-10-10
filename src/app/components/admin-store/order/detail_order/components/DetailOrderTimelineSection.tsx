import React, {FC} from 'react'
import {Button} from 'react-bootstrap'
import {Skeleton, Steps} from 'antd'
import {Orders} from '../../../../../interfaces/order'

interface DetailOrderTimelineSectionProps {
  order: Orders
  isLoadingPage: boolean
  orderHistoryTimeline: Array<{title: string; value: Array<number | null>}>
  onReprintOrder: () => void
}

export const DetailOrderTimelineSection: FC<DetailOrderTimelineSectionProps> = ({
  order,
  isLoadingPage,
  orderHistoryTimeline,
  onReprintOrder,
}) => {
  const showReprint =
    order?.print_counter >= 1 &&
    ['PICKLIST', 'BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
      order?.status?.category ?? ''
    )

  const currentStep = orderHistoryTimeline.findIndex((step) =>
    step.value.includes(
      order?.work_orders?.work_order_status?.length > 0
        ? order?.work_orders?.work_order_status[0]?.status?.id
        : order?.project_status_id
    )
  )

  return (
    <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
      <div className='order-history mt-3 mb-3'>
        <div className='fs-3 fw-bold text-success mb-4'>Order History</div>
        <Steps
          className='order-history-timeline'
          current={currentStep}
          labelPlacement='vertical'
          items={orderHistoryTimeline}
        />
      </div>

      {showReprint && (
        <div className='d-flex justify-content-center align-items-center'>
          <Button type='submit' onClick={onReprintOrder} variant='warning'>
            Reprint Order
          </Button>
        </div>
      )}
    </Skeleton>
  )
}
