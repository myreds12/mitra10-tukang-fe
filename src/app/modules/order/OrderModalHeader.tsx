import React from 'react'
import {Skeleton} from 'antd'
import {Modal} from 'react-bootstrap'

interface OrderModalHeaderProps {
  title: string
  orderId?: number | null
  loading: boolean
}

const OrderModalHeader: React.FC<OrderModalHeaderProps> = ({title, orderId, loading}) => (
  <Modal.Header closeButton>
    <Skeleton active loading={loading} paragraph={{rows: 0}}>
      <Modal.Title>
        {title} - Order ID {orderId}
      </Modal.Title>
    </Skeleton>
  </Modal.Header>
)

export default OrderModalHeader
