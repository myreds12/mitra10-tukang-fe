import React from 'react'
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faCheckCircle,
  faEnvelope,
  faPen,
  faPrint,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons'
import {OrderListRow} from './order-list.mapper'

interface OrderListActionsProps {
  record: OrderListRow
  userRole: string
  onPrintout: (orderId: number, status?: string) => void
  onCancel: (orderId: number) => void
  onDetail: (orderId: number) => void
  onUpdate: (orderId: number) => void
  onEmail: (orderId: number) => void
  onVerify: (orderId: number) => void
  onExportPdf: (orderId: number, paymentQuotation: string, customerName: string) => void
}

const OrderListActions: React.FC<OrderListActionsProps> = ({
  record,
  userRole,
  onPrintout,
  onCancel,
  onDetail,
  onUpdate,
  onEmail,
  onVerify,
  onExportPdf,
}) => {
  const tooltip = (title: string) => <Tooltip id={`order-action-${title}`}>{title}</Tooltip>
  const canPrint = ['PICKLIST', 'BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
    record.order_status ?? ''
  )
  const canUpdate = ['PICKLIST', 'BOOK', 'BOOKED'].includes(record.order_status ?? '')
  const canHoUpdate = [
    'WORKREQ',
    'SURVEYREQ',
    'QUOTEOUT',
    'QUOTATIONPAID',
    'QUOTATIONPAIDSTEPONE',
    'QUOTATIONPAIDSTEPTWO',
    'QUOTATIONPAIDSTEPTHREE',
    'WORKENDSTEPONE',
    'WORKENDSTEPTWO',
    'WORKENDSTEPTHREE',
  ].includes(record.order_status ?? '')

  return (
    <div className='d-flex justify-content-center gap-4'>
      {canPrint && !['Admin HO', 'Super User'].includes(userRole) && (
        <OverlayTrigger placement='bottom' delay={{show: 250, hide: 400}} overlay={tooltip('Print Order')}>
          <Button className='button-request' variant='warning' onClick={() => onPrintout(record.order_id, record.order_status)}>
            <FontAwesomeIcon className='text-white' icon={faPrint} fontSize='13px' />
          </Button>
        </OverlayTrigger>
      )}

      {(!['Sales', 'Admin HO', 'Super User'].includes(userRole) &&
        ['BOOK', 'BOOKED'].includes(record.order_status ?? '')) ||
      ['Super User', 'Admin HO'].includes(userRole) ? (
        <OverlayTrigger placement='bottom' delay={{show: 250, hide: 400}} overlay={tooltip('Cancel Order')}>
          <Button className='button-cancel' variant='danger' onClick={() => onCancel(record.order_id)}>
            <FontAwesomeIcon className='text-white' icon={faXmarkCircle} fontSize='13px' />
          </Button>
        </OverlayTrigger>
      ) : null}

      <OverlayTrigger placement='bottom' delay={{show: 250, hide: 400}} overlay={tooltip('Detail Order')}>
        <a
          href={`/order/detail-order/${record.order_id}`}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-primary button-detail'
          onClick={(event) => {
            event.preventDefault()
            onDetail(record.order_id)
          }}
        >
          <FontAwesomeIcon className='text-white' icon={faBook} fontSize='13px' />
        </a>
      </OverlayTrigger>

      {(!['Sales'].includes(userRole) && canUpdate) ||
      (['Super User', 'Admin HO'].includes(userRole) && canHoUpdate) ? (
        <OverlayTrigger placement='bottom' delay={{show: 250, hide: 400}} overlay={tooltip('Update Order')}>
          <a
            href={`/order/update-order/${record.order_id}`}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-primary button-edit'
            onClick={(event) => {
              event.preventDefault()
              onUpdate(record.order_id)
            }}
          >
            <FontAwesomeIcon className='text-white' icon={faPen} fontSize='13px' />
          </a>
        </OverlayTrigger>
      ) : null}

      <OverlayTrigger placement='bottom' delay={{show: 250, hide: 400}} overlay={tooltip('Aktivitas Email')}>
        <Button variant='success' className='button-email' onClick={() => onEmail(record.order_id)}>
          <FontAwesomeIcon className='text-white' icon={faEnvelope} fontSize='13px' />
        </Button>
      </OverlayTrigger>

      {['QUOTATIONPAID', 'QUOTEOUT', 'WORKENDSTEPONE', 'WORKENDSTEPTWO'].includes(record.order_status ?? '') &&
        userRole === 'Store CS' && (
          <OverlayTrigger placement='bottom' delay={{show: 250, hide: 400}} overlay={tooltip('Verifikasi Pembayaran Quotation')}>
            <Button variant='primary' className='button-verif' onClick={() => onVerify(record.order_id)}>
              <FontAwesomeIcon className='text-white' icon={faCheckCircle} fontSize='13px' />
            </Button>
          </OverlayTrigger>
        )}

      {['QUOTEIN', 'UNPAID', 'PAID', 'QUOTEOUT', 'QUOTATIONPAID'].includes(record.order_status ?? '') && (
        <OverlayTrigger placement='bottom' delay={{show: 250, hide: 400}} overlay={tooltip('Cetak PDF Quotation')}>
          <Button
            className='button-request'
            variant='warning'
            onClick={() => onExportPdf(record.order_id, record.payment_quotation, record.costumer_name)}
          >
            <FontAwesomeIcon className='text-white' icon={faPrint} fontSize='13px' />
          </Button>
        </OverlayTrigger>
      )}
    </div>
  )
}

export default OrderListActions
