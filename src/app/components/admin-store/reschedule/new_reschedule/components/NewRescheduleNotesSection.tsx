import React from 'react'
import {Row, Col} from 'react-bootstrap'

interface NewRescheduleNotesSectionProps {
  orderDetail: any
}

export const NewRescheduleNotesSection: React.FC<NewRescheduleNotesSectionProps> = ({
  orderDetail,
}) => {
  return (
    <Row>
      <Col>
        <div className='fs-3 fw-bold'>Catatan Order</div>

        <div className='detail-info mb-3'>
          <p className='fs-5 fw-bold'>Catatan Toko :</p>
          <p className='fs-7'>
            {orderDetail?.notes ? orderDetail?.notes : 'Toko tidak memberikan catatan'}
          </p>
        </div>

        <div className='detail-info mb-3'>
          <p className='fs-5 fw-bold'>Catatan Tukang :</p>
          <p className='fs-7'>
            {orderDetail?.work_orders?.work_order_status?.[0]?.description
              ? orderDetail?.work_orders?.work_order_status?.[0]?.description
              : 'Tukang tidak memberikan catatan'}
          </p>
        </div>

        <div className='detail-info mb-3'>
          <p className='fs-5 fw-bold'>Intruksi Spesial :</p>
          <p className='fs-7'>
            {orderDetail?.quotation?.[0]?.description
              ? orderDetail?.quotation?.[0]?.description
              : 'Vendor tidak memberikan catatan'}
          </p>
        </div>
      </Col>
    </Row>
  )
}
