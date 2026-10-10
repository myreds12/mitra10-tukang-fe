import React from 'react'
import {Row, Col} from 'react-bootstrap'
import {formatDateWithTime} from '../../../../../../_metronic/helpers'

interface NewComplaintVendorActivitiesProps {
  orderDetail: any
  warrantyData: {
    workEndDate: string
    warrantyEndDate: string
    status: string
  }
}

export const NewComplaintVendorActivities: React.FC<NewComplaintVendorActivitiesProps> = ({
  orderDetail,
  warrantyData,
}) => {
  return (
    <>
      <Row>
        <Col>
          <Row className='information-detail'>
            <div className='fs-3 fw-bold'>Informasi Survei Yang Dilakukan Oleh Vendor</div>

            <div className='survey'>
              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

                <p className='fs-7 p-0'>
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
                    <p className='fs-7'>Order ini tanpa survey</p>
                  )}
                </p>
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
                  <p className='fs-7'>Order ini tanpa survey</p>
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

        <Col>
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

      <Row>
        <Col>
          <Row className='information-detail'>
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
                  ? orderDetail?.work_orders?.work_order_status[0]?.description
                  : 'Tukang tidak memberikan catatan'}
              </p>
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Intruksi Spesial :</p>
              <p className='fs-7'>
                {orderDetail?.quotation?.[0]?.description
                  ? orderDetail?.quotation[0]?.description
                  : 'Vendor tidak memberikan catatan'}
              </p>
            </div>
          </Row>
        </Col>

        {['WORKEND', 'WORKENDSTEPONE', 'WORKENDSTEPTWO', 'WORKENDSTEPTHREE'].includes(
          orderDetail?.status?.category
        ) && (
          <Col>
            <Row className='information-detail'>
              <div className='fs-3 fw-bold'>Informasi Garansi</div>

              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Tanggal Aktif Garansi :</p>
                <p className='fs-7'>{warrantyData?.workEndDate}</p>
              </div>

              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Tanggal Berakhir Garansi :</p>
                <p className='fs-7'>{warrantyData?.warrantyEndDate}</p>
              </div>

              <div className='detail-info mb-3'>
                <p className='fs-5 fw-bold'>Status Garansi :</p>
                <p className='fs-7'>{warrantyData?.status}</p>
              </div>
            </Row>
          </Col>
        )}
      </Row>
    </>
  )
}
