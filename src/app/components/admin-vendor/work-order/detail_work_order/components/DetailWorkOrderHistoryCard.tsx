import React from 'react'
import {Card} from 'react-bootstrap'
import {Skeleton, Steps} from 'antd'
import {OrderHistory} from '../types'

interface DetailWorkOrderHistoryCardProps {
  OrderHistory: OrderHistory[]
  isLoadingPage: boolean
}

export const DetailWorkOrderHistoryCard: React.FC<DetailWorkOrderHistoryCardProps> = ({
  OrderHistory,
  isLoadingPage,
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
    </Skeleton>
  )
}
