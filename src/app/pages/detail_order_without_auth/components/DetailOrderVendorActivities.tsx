import React from 'react'
import {Row, Col} from 'react-bootstrap'
import {Skeleton} from 'antd'
import {formatDateWithTime} from '../../../../_metronic/helpers'
import {Orders} from '../../../interfaces/order'

interface DetailOrderVendorActivitiesProps {
  order: Orders
  isLoadingPage: boolean
}

export const DetailOrderVendorActivities: React.FC<DetailOrderVendorActivitiesProps> = ({
  order,
  isLoadingPage,
}) => {
  return (
    <>
      <Row>
        <Col>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
            <Row className='information-detail'>
              <div className='fs-3 fw-bold'>
                Informasi Survei Yang Dilakukan Oleh Vendor
              </div>

              <div className='survey'>
                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

                  <div className='fs-7 p-0'>
                    {order?.payment_type === 'survey' ? (
                      <>
                        {order?.work_orders?.work_order_status?.length ? (
                          <p className='fs-7'>
                            Tanggal : {formatDateWithTime(order?.work_orders?.survey_date)}
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

                  {order?.payment_type === 'survey' ? (
                    <>
                      {order?.work_orders?.work_order_status?.length ? (
                        <p className='fs-7'>
                          {order?.work_orders?.work_order_tukang
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

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Sesi:</p>

                  {order?.work_orders?.work_order_status?.length ? (
                    <p className='fs-7'>
                      {order?.work_orders?.session === 1
                        ? 'Sesi Pagi'
                        : order?.work_orders?.session === 2
                        ? 'Sesi Siang'
                        : order?.work_orders?.session === 3
                        ? 'Sesi Sore'
                        : order?.work_orders?.session === 4
                        ? 'Sesi Malam'
                        : 'Sesi belum ditentukan oleh vendor'}
                    </p>
                  ) : (
                    <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
                  )}
                </div>
              </div>
            </Row>
          </Skeleton>
        </Col>

        <Col>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
            <Row className='information-detail'>
              <div className='fs-3 fw-bold'>
                Informasi Pengerjaan Yang Dilakukan Oleh Vendor
              </div>

              <div className='work-date'>
                <p className='fs-5 fw-bold'>Pekerjaan dilakukan pada:</p>

                <div className='detail-info mb-3'>
                  {order?.work_orders !== null &&
                  order?.work_orders?.work_start_date !== null ? (
                    <div>
                      <p className='fs-7'>
                        MULAI{' '}
                        <span className='ms-5'>
                          {formatDateWithTime(order?.work_orders?.work_start_date)}
                        </span>
                      </p>

                      <p className='fs-7'>
                        SELESAI{' '}
                        <span className='ms-3'>
                          {formatDateWithTime(order?.work_orders?.work_end_date)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                  )}
                </div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Oleh:</p>

                  {order?.work_orders?.work_order_tukang?.filter((x: any) => x.type === 2)
                    ?.length ? (
                    <p className='fs-7'>
                      {order?.work_orders?.work_order_tukang
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

                  {order?.work_orders?.work_order_status?.length ? (
                    <p className='fs-7'>
                      {order?.work_orders?.session === 1
                        ? 'Sesi Pagi'
                        : order?.work_orders?.session === 2
                        ? 'Sesi Siang'
                        : order?.work_orders?.session === 3
                        ? 'Sesi Sore'
                        : order?.work_orders?.session === 4
                        ? 'Sesi Malam'
                        : 'Sesi belum ditentukan oleh vendor'}
                    </p>
                  ) : (
                    <p className='fs-7'>Sesi belum ditentukan oleh vendor</p>
                  )}
                </div>
              </div>
            </Row>
          </Skeleton>
        </Col>
      </Row>

      <Row>
        <Col>
          <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
            <Row className='information-detail'>
              <div className='fs-3 fw-bold'>Catatan Order</div>

              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Catatan Toko :</p>

                <p className='fs-7'>
                  {order.notes ? order.notes : 'Toko tidak memberikan catatan'}
                </p>
              </div>

              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Catatan Tukang :</p>

                <p className='fs-7'>
                  {order?.work_orders?.work_order_status?.[0]?.description
                    ? order?.work_orders?.work_order_status[0]?.description
                    : 'Tukang tidak memberikan catatan'}
                </p>
              </div>

              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Intruksi Spesial :</p>

                <p className='fs-7'>
                  {order?.quotation?.[0]?.description
                    ? order?.quotation[0]?.description
                    : 'Vendor tidak memberikan catatan'}
                </p>
              </div>
            </Row>
          </Skeleton>
        </Col>
      </Row>
    </>
  )
}
