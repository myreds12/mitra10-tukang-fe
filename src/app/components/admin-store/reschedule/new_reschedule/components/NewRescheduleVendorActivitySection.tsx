import React from 'react'
import {Row, Col} from 'react-bootstrap'
import {formatDateWithTime} from '../../../../../../_metronic/helpers'

interface NewRescheduleVendorActivitySectionProps {
  orderDetail: any
}

export const NewRescheduleVendorActivitySection: React.FC<NewRescheduleVendorActivitySectionProps> = ({
  orderDetail,
}) => {
  return (
    <Row>
      <Col xxl={6} xl={6} md={6} sm={12}>
        <Row className='information-detail'>
          <div className='fs-3 fw-bold'>Informasi Survei Yang Dilakukan Oleh Vendor</div>

          <div className='survey'>
            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

              <div className='fs-7 p-0'>
                {orderDetail?.payment_type === 'survey' ? (
                  <>
                    {orderDetail?.work_orders?.work_order_status?.length ? (
                      <p className='fs-7'>
                        Tanggal : {formatDateWithTime(orderDetail?.work_orders?.survey_date)}
                      </p>
                    ) : (
                      <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                    )}
                  </>
                ) : (
                  <p className='fs-7'>orderDetail ini tanpa survey</p>
                )}
              </div>
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Oleh:</p>

              {orderDetail?.payment_type === 'survey' ? (
                <>
                  {orderDetail?.work_orders?.work_order_status?.length ? (
                    <p className='fs-7'>
                      {orderDetail?.work_orders?.work_order_tukang
                        ?.filter((x: any) => x.type === 1)
                        ?.map((item: any) => item?.tukang?.full_name)
                        ?.join(', ')}
                    </p>
                  ) : (
                    <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                  )}
                </>
              ) : (
                <p className='fs-7'>orderDetail ini tanpa survey</p>
              )}
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Sesi:</p>

              {orderDetail?.work_orders?.work_order_status?.length ? (
                <p className='fs-7'>
                  {orderDetail?.work_orders?.session === 1
                    ? 'Sesi Pagi'
                    : orderDetail?.work_orders?.session === 2
                    ? 'Sesi Siang'
                    : orderDetail?.work_orders?.session === 3
                    ? 'Sesi Sore'
                    : orderDetail?.work_orders?.session === 4
                    ? 'Sesi Malam'
                    : 'Sesi belum ditentukan oleh vendor'}
                </p>
              ) : (
                <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
              )}
            </div>
          </div>
        </Row>
      </Col>

      <Col xxl={6} xl={6} md={6} sm={12}>
        <Row className='information-detail'>
          <div className='fs-3 fw-bold'>Informasi Pengerjaan Yang Dilakukan Oleh Vendor</div>

          <div className='work-date'>
            <p className='fs-5 fw-bold'>Pekerjaan dilakukan pada:</p>

            <div className='detail-info mb-3'>
              {orderDetail?.work_orders !== null &&
              orderDetail?.work_orders?.work_start_date !== null ? (
                <div>
                  <p className='fs-7'>
                    MULAI{' '}
                    <span className='ms-5'>
                      {formatDateWithTime(orderDetail?.work_orders?.work_start_date)}
                    </span>
                  </p>

                  <p className='fs-7'>
                    SELESAI{' '}
                    <span className='ms-3'>
                      {formatDateWithTime(orderDetail?.work_orders?.work_end_date)}
                    </span>
                  </p>
                </div>
              ) : (
                <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
              )}
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Oleh:</p>

              {orderDetail?.work_orders?.work_order_tukang?.filter((x: any) => x.type === 2)
                ?.length ? (
                <p className='fs-7'>
                  {orderDetail?.work_orders?.work_order_tukang
                    ?.filter((x: any) => x.type === 2)
                    ?.map((item: any) => item?.tukang?.full_name)
                    ?.join(', ')}
                </p>
              ) : (
                <p className='fs-7'>Tukang belum diset oleh vendor</p>
              )}
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Sesi:</p>

              {orderDetail?.work_orders?.work_order_status?.length ? (
                <p className='fs-7'>
                  {orderDetail?.work_orders?.session === 1
                    ? 'Sesi Pagi'
                    : orderDetail?.work_orders?.session === 2
                    ? 'Sesi Siang'
                    : orderDetail?.work_orders?.session === 3
                    ? 'Sesi Sore'
                    : orderDetail?.work_orders?.session === 4
                    ? 'Sesi Malam'
                    : 'Sesi belum ditentukan oleh vendor'}
                </p>
              ) : (
                <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
              )}
            </div>
          </div>
        </Row>
      </Col>
    </Row>
  )
}
