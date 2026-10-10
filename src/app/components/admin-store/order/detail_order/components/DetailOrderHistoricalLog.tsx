import React, {FC} from 'react'
import {Card} from 'react-bootstrap'
import {Steps} from 'antd'
import {OrderHistory} from '../types'

interface DetailOrderHistoricalLogProps {
  orderHistorical: OrderHistory[]
}

export const DetailOrderHistoricalLog: FC<DetailOrderHistoricalLogProps> = ({
  orderHistorical,
}) => {
  return (
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
  )
}
