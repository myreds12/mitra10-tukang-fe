import React from 'react'
import {Card} from 'react-bootstrap'
import {Steps, Skeleton} from 'antd'
import {OrderHistory} from '../types'

interface WorkOrderHistoryCardProps {
  isLoadingPage: boolean
  orderHistory: OrderHistory[]
}

export const WorkOrderHistoryCard: React.FC<WorkOrderHistoryCardProps> = ({
  isLoadingPage,
  orderHistory,
}) => {
  return (
    <Skeleton active loading={isLoadingPage}>
      <Card>
        <Card.Header>
          <Card.Title className='fw-bold'>Order History</Card.Title>
        </Card.Header>

        <Card.Body>
          <div className='work-order-history'>
            <Steps
              progressDot
              current={orderHistory.length - 1}
              direction='vertical'
              items={orderHistory.map((item) => ({
                title: item?.status,
                description: `Terakhir update : ${item?.created_at} ${
                  item.updated_by ? `oleh ${item?.updated_by}` : ''
                }`,
              }))}
            />
          </div>
        </Card.Body>
      </Card>
    </Skeleton>
  )
}
