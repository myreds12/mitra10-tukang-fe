import React from 'react'
import {Row, Col} from 'react-bootstrap'
import {Order} from '../types'

interface OrderDetailModalVendorActivityProps {
  selectedOrder: Order | null
  formatDate: (date: any) => string
  formatDateWithTime: (date: any) => string
}

export const OrderDetailModalVendorActivity: React.FC<OrderDetailModalVendorActivityProps> = ({
  selectedOrder,
  formatDate,
  formatDateWithTime,
}) => {
  return (
    <Row>
      <Col>
        <Row className='information-detail'>
          <div className='fs-3 fw-bold'>Informasi Survei Yang Dilakukan Oleh Vendor</div>

          <div className='survey'>
            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

              <div className='fs-7 p-0'>
                {selectedOrder?.order_detail?.payment_type === 'survey' ? (
                  <>
                    {selectedOrder?.order_detail?.work_orders?.work_order_status?.length ? (
                      <p className='fs-7'>
                        Tanggal :{' '}
                        {formatDate(selectedOrder?.order_detail?.work_orders?.survey_date)}
                      </p>
                    ) : (
                      <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                    )}
                  </>
                ) : (
                  <p className='fs-7'>Order ini tanpa survey</p>
                )}
              </div>
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Oleh:</p>

              {selectedOrder?.order_detail?.payment_type === 'survey' ? (
                <>
                  {selectedOrder?.order_detail?.work_orders?.work_order_status?.length ? (
                    <p className='fs-7'>
                      {selectedOrder?.order_detail?.work_orders?.work_order_tukang
                        ?.filter((x: any) => x.type === 1)
                        ?.map((item: any) => item?.tukang?.full_name)
                        ?.join(', ')}
                    </p>
                  ) : (
                    <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                  )}
                </>
              ) : (
                <p className='fs-7'>Order ini tanpa survey</p>
              )}
            </div>
          </div>
        </Row>
      </Col>

      <Col>
        <Row className='information-detail'>
          <div className='fs-3 fw-bold'>Informasi Pengerjaan Yang Dilakukan Oleh Vendor</div>

          <div className='work-date'>
            <p className='fs-5 fw-bold'>Pekerjaan dilakukan pada:</p>

            <div className='detail-info mb-3'>
              {selectedOrder?.order_detail?.work_orders?.work_order_status?.length ? (
                <div>
                  <p className='fs-7'>
                    MULAI{' '}
                    <span className='ms-5'>
                      {formatDateWithTime(
                        selectedOrder?.order_detail?.work_orders?.work_start_date
                      )}
                    </span>
                  </p>

                  <p className='fs-7'>
                    SELESAI{' '}
                    <span className='ms-3'>
                      {formatDateWithTime(
                        selectedOrder?.order_detail?.work_orders?.work_end_date
                      )}
                    </span>
                  </p>
                </div>
              ) : (
                <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
              )}
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Oleh:</p>

              {selectedOrder?.order_detail?.work_orders?.work_order_tukang?.filter(
                (x: any) => x.type === 2
              )?.length ? (
                <p className='fs-7'>
                  {selectedOrder?.order_detail?.work_orders?.work_order_tukang
                    ?.filter((x: any) => x.type === 2)
                    ?.map((item: any) => item?.tukang?.full_name)
                    ?.join(', ')}
                </p>
              ) : (
                <p className='fs-7'>Tukang belum diset oleh vendor</p>
              )}
            </div>
          </div>
        </Row>
      </Col>
    </Row>
  )
}
