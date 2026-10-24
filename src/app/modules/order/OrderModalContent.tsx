import React from 'react'
import {Modal} from 'react-bootstrap'

interface OrderModalContentProps {
  show: boolean
  modalType: number | null
  orderDetail: unknown
  onClose: () => void
  renderCustomer: () => React.ReactNode
  renderQuotation: () => React.ReactNode
  renderRefund: () => React.ReactNode
}

const OrderModalContent: React.FC<OrderModalContentProps> = ({
  show,
  modalType,
  orderDetail,
  onClose,
  renderCustomer,
  renderQuotation,
  renderRefund,
}) => {
  if (!orderDetail) return null

  return (
    <Modal dialogClassName='modal-verification' centered show={show} onHide={onClose}>
      {modalType === 1 && renderCustomer()}
      {modalType === 2 && renderQuotation()}
      {modalType === 3 && renderRefund()}
    </Modal>
  )
}

export default OrderModalContent
