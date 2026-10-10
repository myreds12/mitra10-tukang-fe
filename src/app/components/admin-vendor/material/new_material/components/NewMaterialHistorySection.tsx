import React, {FC} from 'react'
import {Card} from 'react-bootstrap'
import {Steps} from 'antd'
import {OrderHistory} from '../types'

interface NewMaterialHistorySectionProps {
  orderHistory: OrderHistory[]
}

export const NewMaterialHistorySection: FC<NewMaterialHistorySectionProps> = ({
  orderHistory,
}) => {
  return (
    <Card className='mb-5'>
      <Card.Body>
        <div className='work-order-history'>
          <h1 className='title mb-5'>Order History</h1>

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
  )
}
