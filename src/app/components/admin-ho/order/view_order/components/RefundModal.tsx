import React, {FC, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import {Skeleton} from 'antd'
import {Modal, Row, Col, Form, Button} from 'react-bootstrap'

export interface RefundModalProps {
  orderDetail: any
  loadingModal: boolean
  orderForm?: any
  statusData?: any[]
  apiUrl?: string
  handleCancelRefund?: (type: number) => Promise<any>
}

export const RefundModal: FC<RefundModalProps> = ({
  orderDetail,
  loadingModal,
  orderForm,
  statusData,
  apiUrl = process.env.REACT_APP_API_URL,
  handleCancelRefund,
}) => {
  const navigate = useNavigate()
  const [loadingButton, setLoadingButton] = useState<boolean>(false)

  const onCancelRefund = async (type: number) => {
    if (handleCancelRefund) {
      return handleCancelRefund(type)
    }

    setLoadingButton(true)
    const formData = new FormData()

    const appendIfNotDefault = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    const cancelOrder = statusData?.find((status: any) => status.category === 'CANCEL')
    formData.append('order_id', String(orderForm?.id))
    formData.append('project_status_id', cancelOrder?.value)

    orderForm?.order_details?.forEach((item: any, index: number) => {
      if (item) {
        appendIfNotDefault(`order_details[${index}][id]`, item.id)
        appendIfNotDefault(`order_details[${index}][item_id]`, item.item_id)
        appendIfNotDefault(`order_details[${index}][item_code]`, item.item_code)
        appendIfNotDefault(`order_details[${index}][item_name]`, item.item_name)
        appendIfNotDefault(`order_details[${index}][item_notes]`, item.item_notes)
        appendIfNotDefault(`order_details[${index}][quantity]`, item.quantity)
      }
    })

    try {
      const response = await axios.post(`${apiUrl}/orders/${orderForm?.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Orderan berhasil dibatalkan.',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          setLoadingButton(false)
          if (type === 1) {
            navigate(`/refund/new-refund/${orderForm?.id}`)
          } else if (type === 2) {
            window.location.reload()
          }
        })
      } else {
        setLoadingButton(false)
        Swal.fire({
          icon: 'error',
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Terjadi kesalahan dari sisi server, mohon hubungi Administrator.',
        showConfirmButton: false,
      })
    }
  }

  const cancelHandler = handleCancelRefund ?? onCancelRefund
    return (
      <>
        <Modal.Header closeButton>
          <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
            <Modal.Title>Permintaan Refund - Order ID {orderDetail?.id}</Modal.Title>
          </Skeleton>
        </Modal.Header>

        <Modal.Body>
          <Row className='mb-5'>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-bold'>
                  Nama Toko :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {orderDetail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-bold'>
                  Quotation ID :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {orderDetail?.quotation?.length ? orderDetail?.quotation[0]?.id : ''}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-bold'>
                  Receipt Number :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.receipt_number ?? '-'}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-bold'>
                  Order Status :
                  <span className='fs-6 ms-2 fw-bold text-success'>
                    {orderDetail?.status?.description}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Row>

          <Row className='mb-5'>
            <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
              <div className='fs-4 fw-bold mb-1'>Informasi Pembeli</div>
            </Skeleton>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 2}}>
                <Form.Label className='fs-6 fw-semibold'>
                  No Member :{' '}
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.member_number}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Customer Name :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.full_name} </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Pemasangan :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_address} </span>
                </Form.Label>
              </Skeleton>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                <Form.Label className='fs-6 fw-semibold'>
                  Nomor Telp/WA :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.project_number}</span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Email :
                  <span className='fs-6 ms-2 fw-normal'>{orderDetail?.members?.email} </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Row>

          <Skeleton active loading={loadingModal} paragraph={{rows: 3}}>
            {(() => {
              if (
                (orderDetail?.payment_type === 'survey' && orderDetail?.work_orders === null) ||
                (orderDetail?.work_orders?.work_order_status.length === 1 &&
                  orderDetail?.payment_type === 'survey')
              ) {
                return (
                  <div className='table-warranty-content'>
                    {orderDetail?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari{' '}
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetail?.order_details.map((item: any, index: any) => (
                          <>
                            <tr key={`${index} - order_detail`}>
                              <td>{item?.item_code}</td>
                              <td>{item?.item_name}</td>
                              <td>{item?.item_notes}</td>
                              <td>{item?.quantity ?? 0}</td>
                            </tr>
                          </>
                        ))}

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Biaya Survey
                          </td>

                          <td className=' fw-bolder'>Rp. 99.000</td>
                        </tr>

                        {orderDetail?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.additional_fee
                              ).toLocaleString('id')}`}</td>
                            </tr>

                            <tr>
                              <td colSpan={3} className='text-end fw-bolder'>
                                Grand Total
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.grand_total
                              ).toLocaleString('id')}`}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              } else if (
                ['QUOTEIN', 'QUOTEOUT'].includes(orderDetail?.status?.category ?? '') &&
                orderDetail?.payment_type === 'survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th className='text-center' style={{width: '355px'}}>
                            Jenis Jasa
                          </th>

                          <th className='text-center' style={{width: '100px'}}>
                            QTY
                          </th>

                          <th className='text-center' style={{width: '250px'}}>
                            Satuan
                          </th>

                          <th className='text-center' style={{width: '250px'}}>
                            Final Price
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 2)
                          .map((item: any, index: any) => (
                            <tr key={`${index}-quotation`}>
                              <td>
                                {item?.name ?? '-'}{' '}
                                {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                              </td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit}</td>
                              <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                'id'
                              )}`}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>

                    {orderDetail?.quotation[0]?.quotation_details.filter(
                      (x: any) => x.item_type === 1
                    ).length ? (
                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Material Yang Dibutuhkan
                            </th>

                            <th className='text-center' style={{width: '100px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderDetail?.quotation[0]?.quotation_details
                            .filter((x: any) => x.item_type === 1)
                            .map((item: any, index: any) => (
                              <tr key={`${index}-quotation`}>
                                <td>
                                  {item?.name ?? '-'}{' '}
                                  {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                                </td>
                                <td>{item?.quantity ?? 0}</td>
                                <td>{item?.unit ?? '-'}</td>
                                <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                  'id'
                                )}`}</td>
                              </tr>
                            ))}

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Total Jasa
                            </td>
                            <td className='fw-bolder'>{`Rp. ${parseInt(
                              orderDetail?.quotation[0]?.quotation_details
                                .filter((x: any) => x.item_type === 2)
                                .reduce(
                                  (total: any, item: any) =>
                                    total + parseInt(item.final_price || 0),
                                  0
                                )
                            ).toLocaleString('id')}`}</td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Total Material
                            </td>
                            <td className='fw-bolder'>{`Rp. ${parseInt(
                              orderDetail?.quotation[0]?.quotation_details
                                .filter((x: any) => x.item_type === 1)
                                .reduce(
                                  (total: any, item: any) =>
                                    total + parseInt(item.final_price || 0),
                                  0
                                )
                            ).toLocaleString('id')}`}</td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Promosi
                            </td>
                            <td className=' fw-bolder'>
                              {`Rp. ${parseInt(
                                orderDetail?.quotation[0]?.quotation_disc ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              {`${
                                orderDetail?.quotation[0]?.promotion
                                  ? `Additional Promotion (${orderDetail?.quotation[0]?.promotion?.name})`
                                  : `Additional Promotion`
                              }`}
                            </td>

                            <td className=' fw-bolder'>
                              {orderDetail?.quotation[0]?.promotion?.promotion_type === 1
                                ? `${orderDetail?.quotation[0]?.promotion?.promotion} %`
                                : `Rp. ${parseInt(
                                    orderDetail?.quotation[0]?.promotion?.promotion
                                  ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Grand Total
                            </td>
                            <td className=' fw-bolder'>
                              {`Rp. ${parseInt(
                                orderDetail?.quotation[0]?.quotation_grand_total ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <></>
                    )}
                  </div>
                )
              } else if (
                ['SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE', 'WORKEND', 'DONE'].includes(
                  orderDetail?.work_orders?.work_order_status[0]?.status?.category
                ) &&
                orderDetail?.payment_type === 'survey' &&
                orderDetail?.work_orders?.work_order_status.length >= 1
              ) {
                return (
                  <div className='table-warranty-content'>
                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                          <th>Satuan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetail?.work_orders?.work_order_status[0]?.work_order_items.length ? (
                          orderDetail.work_orders.work_order_status[0].work_order_items.map(
                            (item: any, index: any) => (
                              <tr key={`${index}-work_order_detail`}>
                                <td>
                                  {item.name ?? ''}{' '}
                                  {item.is_customer ? '( Disediakan oleh customer )' : ''}
                                </td>
                                <td>{item.quantity ?? 0}</td>
                                <td>{item.unit ?? ''}</td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td>Item belum diset oleh Tukang/Vendor</td>
                            <td>Quantity belum diset oleh Tukang/Vendor</td>
                            <td>Satuan belum diset oleh Tukang/Vendor</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              } else if (
                orderDetail?.payment_type === 'gratis' ||
                orderDetail?.payment_type === 'pemasangan_tanpa_survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    {orderDetail?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari{' '}
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                          {!(orderDetail?.payment_type === 'gratis') && (
                            <>
                              <th>Harga Jasa</th>
                              <th>Jumlah</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail?.order_details.map((item: any, index: any) => (
                          <>
                            <tr key={`${index} - order_detail`}>
                              <td>{item?.item_code}</td>
                              <td>{item?.item_name}</td>
                              <td>{item?.item?.service_name}</td>
                              <td>{item?.quantity ?? 0}</td>
                              {!(orderDetail?.payment_type === 'gratis') && (
                                <>
                                  <td>{`Rp. ${parseInt(item?.unit_price || 0)?.toLocaleString(
                                    'id'
                                  )}`}</td>
                                  <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString(
                                    'id'
                                  )}`}</td>
                                </>
                              )}
                            </tr>
                          </>
                        ))}

                        {orderDetail?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td
                                colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                                className='text-end fw-bolder align-middle'
                              >
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                orderDetail?.additional_fee
                              ).toLocaleString('id')}`}</td>
                            </tr>
                          </>
                        )}

                        <tr>
                          <td
                            colSpan={orderDetail?.payment_type !== 'gratis' ? 5 : 3}
                            className='text-end fw-bolder'
                          >
                            Grand Total
                          </td>

                          <td className=' fw-bolder'>{`Rp. ${Number(
                            orderDetail?.grand_total
                          ).toLocaleString('id')}`}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              }
            })()}
          </Skeleton>

          <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
            <div className='button-submit d-flex justify-content-center align-items-center'>
              <Button
                className='d-flex justify-content-center align-items-center'
                onClick={() => cancelHandler(1)}
                variant='dark-primary'
              >
                Cancel & Refund
              </Button>

              <Button
                className='d-flex justify-content-center align-items-center'
                onClick={() => cancelHandler(2)}
                variant='dark-primary'
              >
                Cancel & Not Refund
              </Button>
            </div>
          </Skeleton>
        </Modal.Body>
      </>
    )
}
