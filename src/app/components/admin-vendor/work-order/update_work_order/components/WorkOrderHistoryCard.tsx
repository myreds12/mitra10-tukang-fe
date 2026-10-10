import React from 'react'
import {Card} from 'react-bootstrap'
import {Steps} from 'antd'

interface WorkOrderHistoryCardProps {
  OrderHistory: any[]
}

export const WorkOrderHistoryCard: React.FC<WorkOrderHistoryCardProps> = ({OrderHistory}) => {
  return (
    <Card className='mb-5'>
      <Card.Header>
        <Card.Title className='fw-bold'>Order History</Card.Title>
      </Card.Header>

      <Card.Body>
        <div className='work-order-history'>
          <Steps
            progressDot
            current={OrderHistory.length - 1}
            direction='vertical'
            items={OrderHistory.map((item) => ({
              title: item?.status,
              description: `Terakhir update : ${item?.created_at} ${
                item.updated_by ? `oleh ${item?.updated_by}` : ''
              }`,
            }))}
          />
        </div>
      </Card.Body>
    </Card>
  )
}
