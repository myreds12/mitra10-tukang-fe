import React from 'react'
import {Row, Col, Button} from 'react-bootstrap'

interface WorkOrderNotesActionSectionProps {
  orderDetail: any
  isLoading: boolean
  handleUpdateWorkOrder: (e: any) => void
}

export const WorkOrderNotesActionSection: React.FC<WorkOrderNotesActionSectionProps> = ({
  orderDetail,
  isLoading,
  handleUpdateWorkOrder,
}) => {
  return (
    <>
      <Row>
        <Col>
          <div className='fs-3 fw-bold'>Catatan Order</div>

          <div className='detail-info mb-3'>
            <p className='fs-5 fw-bold'>Catatan Toko :</p>

            <p className='fs-7'>
              {orderDetail.notes ? orderDetail.notes : 'Toko tidak memberikan catatan'}
            </p>
          </div>

          <div className='detail-info mb-3'>
            <p className='fs-5 fw-bold'>Catatan Tukang :</p>

            <p className='fs-7'>
              {orderDetail?.work_orders?.work_order_status[0]?.description
                ? orderDetail?.work_orders?.work_order_status[0]?.description
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

      {[
        'SURVEYDONE',
        'WORKEND',
        'WORKENDSTEPONE',
        'WORKENDSTEPTWO',
        'WORKENDSTEPTHREE',
      ].includes(orderDetail?.status?.category) ? (
        <div className='d-flex justify-content-center'>
          <Button
            className='btn-done d-flex justify-content-center align-items-center'
            // disabled
          >
            Order Selesai
          </Button>
        </div>
      ) : [
          'QUOTEOUT',
          'QUOTEPAID',
          'QUOTEPAIDSTEPONE',
          'QUOTEPAIDSTEPTWO',
          'QUOTEPAIDSTEPTHREE',
        ].includes(orderDetail?.status?.category) ? (
        <></>
      ) : (
        <div className='d-flex justify-content-center'>
          <Button
            className='d-flex justify-content-center align-items-center'
            variant='dark-primary'
            type='submit'
            // disabled={isLoading}
            onClick={handleUpdateWorkOrder}
          >
            {isLoading ? 'Submitting Order...' : 'Save'}
          </Button>
        </div>
      )}
    </>
  )
}
