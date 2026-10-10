import React from 'react'
import {Skeleton, Steps} from 'antd'

interface DetailWorkOrderComplaintTimelineProps {
  orderDetail: any
  isLoadingPage: boolean
  complaintHistory: any[]
}

export const DetailWorkOrderComplaintTimeline: React.FC<DetailWorkOrderComplaintTimelineProps> = ({
  orderDetail,
  isLoadingPage,
  complaintHistory,
}) => {
  if (!orderDetail?.complaints || orderDetail?.complaints?.length < 1) {
    return null
  }

  return (
    <Skeleton active loading={isLoadingPage}>
      <div className='complaint-history mt-3 mb-3'>
        <div className='fs-3 text-uppercase fw-bold text-black mb-4'>Complaint History</div>
        <Steps
          className='complaint-history-timeline'
          current={complaintHistory.findIndex((step) =>
            step.value.includes(orderDetail?.complaints?.[0]?.complaint_status ?? 0)
          )}
          labelPlacement='vertical'
          items={complaintHistory}
        />
      </div>
    </Skeleton>
  )
}
