import React, {FC, useState} from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import {Skeleton} from 'antd'
import {Modal, Tab, Nav, Row, Col, Form, Button} from 'react-bootstrap'
import Select from 'react-select'
import {formatDateWithTimeZone} from '../../../../../../_metronic/helpers'

export interface CustomerIndexModalProps {
  orderDetail: any
  loadingModal: boolean
  mailLogs: any[]
  activeKey: number
  setActiveKey: (key: number) => void
  userRole: string
  csiData: any[]
  selectedCSI: any
  setSelectedCSI: (val: any) => void
  loadingUpdate?: boolean
  apiUrl?: string
  handleTriggerEmail?: () => Promise<any>
}

export const CustomerIndexModal: FC<CustomerIndexModalProps> = ({
  orderDetail,
  loadingModal,
  mailLogs,
  activeKey,
  setActiveKey,
  userRole,
  csiData,
  selectedCSI,
  setSelectedCSI,
  loadingUpdate,
  apiUrl = process.env.REACT_APP_API_URL,
  handleTriggerEmail,
}) => {
  const [internalLoading, setInternalLoading] = useState<boolean>(false)
  const isUpdating = loadingUpdate !== undefined ? loadingUpdate : internalLoading

  const onTriggerEmail = async () => {
    if (handleTriggerEmail) {
      return handleTriggerEmail()
    }

    if (orderDetail?.members?.email === '') {
      Swal.fire({
        title: 'Member ini tidak mempunyai email sehingga tidak dapat mengirimkan email',
        icon: 'warning',
        showConfirmButton: true,
        showDenyButton: false,
        confirmButtonColor: '#6b9230',
        confirmButtonText: 'Ok',
      })
      return false
    }

    Swal.fire({
      title: 'Apakah anda yakin ingin mengirim email berisi formulir csi kepada customer?',
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#6b9230',
      cancelButtonColor: '#d33',
      showDenyButton: true,
      confirmButtonText: 'Ya',
      denyButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `${apiUrl}/csi/${selectedCSI?.value}/send/${orderDetail?.id}`,
            null,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
            }
          )

          if (response.data.status === 200 || response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Success Send Email',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
            })
            setInternalLoading(false)
          } else {
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error',
            })
            setInternalLoading(false)
          }

          window.location.reload()
        } catch (error: any) {
          setInternalLoading(false)
          Swal.fire({
            title: 'Error',
            text: error?.response?.data?.message ?? 'Terjadi kesalahan',
            icon: 'error',
          })
        }
      }
    })
  }

  const triggerEmailHandler = handleTriggerEmail ?? onTriggerEmail
    return (
      <>
        <Modal.Header closeButton>
          <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
            <Modal.Title>History Aktivitas Email - Order ID {orderDetail?.id}</Modal.Title>
          </Skeleton>
        </Modal.Header>

        <Modal.Body>
          <Tab.Container activeKey={activeKey} onSelect={(key) => setActiveKey(Number(key))}>
            <Nav fill variant='tabs' className='mt-2 mb-5'>
              <Nav.Item style={{cursor: 'pointer'}}>
                <Nav.Link eventKey={1}>Log Aktivitas Email</Nav.Link>
              </Nav.Item>

              {!['Sales', 'Store CS'].includes(userRole) && (
                <Nav.Item style={{cursor: 'pointer'}}>
                  <Nav.Link eventKey={2}>Kirim Email CSI</Nav.Link>
                </Nav.Item>
              )}
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey={1}>
                <div className='fs-6 mb-3'>
                  *Informasi yang tertera pada tabel dibawah ini adalah informasi mengenai aktivitas
                  email yang telah dikirimkan oleh sistem
                </div>

                <table className='table hover responsive'>
                  <thead className='table-warranty-head'>
                    <tr>
                      <th>Judul Email</th>
                      <th>Waktu dan Tanggal Email Dikirimkan</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mailLogs && mailLogs.length > 0 ? (
                      mailLogs.map((item: any, index: number) => (
                        <tr key={`${index} - email_log`}>
                          <td>{item?.emailMessages?.title || 'No Title'}</td>
                          <td>{formatDateWithTimeZone(item?.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>-</td>
                        <td>Belum ada email yang dikirim oleh sistem</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Tab.Pane>

              <Tab.Pane eventKey={2}>
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
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.receipt_number ?? '-'}
                        </span>
                      </Form.Label>
                      <br></br>
                      {orderDetail?.quotation[0]?.receipt_quotation && (
                        <>
                          <Form.Label className='fs-6 fw-bold'>
                            Receipt Transaksi :
                            <span className='fs-6 ms-2 fw-normal'>
                              {orderDetail?.quotation[0]?.receipt_quotation}
                            </span>
                          </Form.Label>
                          <br></br>
                        </>
                      )}
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
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.members?.member_number}
                        </span>
                      </Form.Label>
                      <br></br>
                      <Form.Label className='fs-6 fw-semibold'>
                        Customer Name :
                        <span className='fs-6 ms-2 fw-normal'>
                          {orderDetail?.members?.full_name}{' '}
                        </span>
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
                      (orderDetail?.payment_type === 'survey' &&
                        orderDetail?.work_orders === null) ||
                      (orderDetail?.work_orders?.work_order_status.length === 1 &&
                        orderDetail?.payment_type === 'survey')
                    ) {
                      return (
                        <div className='table-warranty-content'>
                          {orderDetail?.is_overdistance === 1 && (
                            <>
                              <Form.Text className='fs-8 text-dark'>
                                *Order ini lebih dari{' '}
                                <span className='fw-bolder text-decoration-underline'>10 KM</span>{' '}
                                dari toko sehingga dikenakan biaya tambahan
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
                      ['SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
                        orderDetail?.work_orders?.work_order_status[0]?.status?.category
                      ) &&
                      orderDetail?.payment_type === 'survey' &&
                      orderDetail?.work_orders?.work_order_status.length >= 1 &&
                      orderDetail?.quotation?.length === 0
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
                              {orderDetail?.work_orders?.work_order_status[0]?.work_order_items
                                .length ? (
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
                      orderDetail?.work_orders?.work_order_status.length >= 1 &&
                      orderDetail?.quotation?.length >= 1 &&
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
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
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
                                      {item?.is_customer === true
                                        ? '( Disediakan oleh customer )'
                                        : ''}
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
                                        orderDetail?.quotation[0]?.promotion?.promotion ?? 0
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
                                <span className='fw-bolder text-decoration-underline'>10 KM</span>{' '}
                                dari toko sehingga dikenakan biaya tambahan
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

                <Row className='mt-5 mb-5'>
                  <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                    <Form.Group className='header-template mb-4'>
                      <Form.Label className='fs-5'>Pilih Format Formulir CSI :</Form.Label>
                      <Select
                        className='form-control p-0'
                        isSearchable={true}
                        placeholder='Pilih Judul Format'
                        options={csiData}
                        value={{
                          label: selectedCSI?.label ?? '',
                          value: selectedCSI?.value ?? null,
                        }}
                        onChange={(newValue) => setSelectedCSI(newValue)}
                      />
                    </Form.Group>
                  </Skeleton>
                </Row>

                <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
                  <div className='button-submit d-flex justify-content-center align-items-center'>
                    <Button
                      className='d-flex justify-content-center align-items-center'
                      onClick={triggerEmailHandler}
                      disabled={
                        orderDetail?.members?.email === '' ? true : isUpdating ? true : false
                      }
                      variant='dark-primary'
                    >
                      {orderDetail?.members?.email === ''
                        ? 'Tidak dapat mengirim email karena user tidak mempunyai email'
                        : isUpdating
                        ? 'Submitting..'
                        : 'Submit'}
                    </Button>
                  </div>
                </Skeleton>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </>
    )
}
