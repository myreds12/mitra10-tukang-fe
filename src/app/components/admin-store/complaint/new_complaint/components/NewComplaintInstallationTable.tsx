import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {formatDate} from '../../../../../../_metronic/helpers'

interface NewComplaintInstallationTableProps {
  orderDetail: any
  paymentStages: Array<{stage: string; percentage: string; amount: number}>
}

export const NewComplaintInstallationTable: React.FC<NewComplaintInstallationTableProps> = ({
  orderDetail,
  paymentStages,
}) => {
  return (
    <>
      <Row className='table-warranty d-flex align-items-center mb-3'>
        <div className='table-title-warranty'>
          <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

          <Row>
            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>
                {orderDetail?.payment_type === 'survey'
                  ? 'Tanggal Request Survey'
                  : 'Tanggal request pemasangan'}
              </Form.Label>
              <Col>
                <p className='fs-7 p-0'>{formatDate(orderDetail?.request_survey)}</p>
              </Col>
            </Form.Group>

            {orderDetail?.payment_type === 'survey' && (
              <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                <Form.Label column>Tanggal request pemasangan</Form.Label>
                <Col>
                  <p className='fs-7 p-0'>
                    {orderDetail?.request_work
                      ? formatDate(orderDetail?.request_work)
                      : 'Tanggal belum diset oleh toko'}
                  </p>
                </Col>
              </Form.Group>
            )}

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
              <Col>
                <p className='fs-7 p-0'>{orderDetail?.vendor?.company_name ?? '-'}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Payment Type:</Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {(() => {
                    if (orderDetail?.payment_type === 'survey') {
                      return 'Berbayar & Survey'
                    } else if (orderDetail?.payment_type === 'gratis') {
                      return 'Gratis'
                    } else if (orderDetail?.payment_type === 'pemasangan_tanpa_survey') {
                      return 'Berbayar & Pemasangan Tanpa Survey'
                    } else {
                      return ''
                    }
                  })()}
                </p>
              </Col>
            </Form.Group>
          </Row>
        </div>

        {(() => {
          if (
            (orderDetail?.payment_type === 'survey' &&
              orderDetail?.work_orders === null &&
              orderDetail?.quotation?.length === 0) ||
            (orderDetail?.work_orders?.work_order_status?.[0]?.work_order_items?.length === 0 &&
              orderDetail?.payment_type === 'survey' &&
              orderDetail?.quotation?.length === 0)
          ) {
            return (
              <div className='table-warranty-content'>
                {orderDetail?.is_overdistance === 1 && (
                  <Form.Text className='fs-8 text-dark'>
                    *Order ini lebih dari{' '}
                    <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                    toko sehingga dikenakan biaya tambahan
                  </Form.Text>
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
                    {orderDetail?.order_details?.map((item: any, index: any) => (
                      <tr key={`${index} - order_detail`}>
                        <td>{item?.item_code}</td>
                        <td>{item?.item_name}</td>
                        <td>{item?.item_notes}</td>
                        <td>{item?.quantity ?? 0}</td>
                      </tr>
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
            ['SURVEYREQ', 'TUKANGSURVEY', 'SURVEYSTART', 'SURVEYDONE'].includes(
              orderDetail?.work_orders?.work_order_status?.[0]?.status?.category
            ) &&
            orderDetail?.payment_type === 'survey' &&
            orderDetail?.work_orders?.work_order_status?.[0]?.work_order_items?.length >= 1 &&
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
                    {orderDetail?.work_orders?.work_order_status?.[0]?.work_order_items?.length ? (
                      orderDetail?.work_orders?.work_order_status[0].work_order_items.map(
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
            orderDetail?.quotation?.length >= 1 &&
            orderDetail?.payment_type === 'survey'
          ) {
            return (
              <div className='table-warranty-content'>
                {orderDetail?.quotation?.[0]?.quotation_special === 0 ? (
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
                        ?.filter((x: any) => x.item_type === 2)
                        ?.map((item: any, index: any) => (
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
                ) : (
                  <>
                    <div className='fs-6 fw-bold mb-2'>Jasa Pemasangan Tahap 1</div>

                    {orderDetail?.quotation[0]?.quotation_receipt?.[0]?.receipt_quotation &&
                      orderDetail?.quotation[0]?.quotation_special === 1 && (
                        <div className='fs-6 fw-bold'>
                          Receipt Quotation Tahap 1 :{' '}
                          <span className='fs-6 fw-semibold'>
                            {orderDetail?.quotation[0]?.quotation_receipt[0]
                              ?.receipt_quotation ?? '-'}
                          </span>
                        </div>
                      )}

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
                          ?.filter((x: any) => x.item_type === 2 && x.work_step === 1)
                          ?.map((item: any, index: any) => (
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

                    <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                    {orderDetail?.quotation[0]?.quotation_receipt?.[1]?.receipt_quotation &&
                      orderDetail?.quotation[0]?.quotation_special === 1 && (
                        <div className='fs-6 fw-bold'>
                          Receipt Quotation Tahap 1 :{' '}
                          <span className='fs-6 fw-semibold'>
                            {orderDetail?.quotation[0]?.quotation_receipt[1]
                              ?.receipt_quotation ?? '-'}
                          </span>
                        </div>
                      )}

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
                          ?.filter((x: any) => x.item_type === 2 && x.work_step === 2)
                          ?.map((item: any, index: any) => (
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

                    <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                    {orderDetail?.quotation[0]?.quotation_receipt?.[2]?.receipt_quotation &&
                      orderDetail?.quotation[0]?.quotation_special === 1 && (
                        <div className='fs-6 fw-bold'>
                          Receipt Quotation Tahap 1 :{' '}
                          <span className='fs-6 fw-semibold'>
                            {orderDetail?.quotation[0]?.quotation_receipt[2]
                              ?.receipt_quotation ?? '-'}
                          </span>
                        </div>
                      )}

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
                          ?.filter((x: any) => x.item_type === 2 && x.work_step === 3)
                          ?.map((item: any, index: any) => (
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
                  </>
                )}

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
                      ?.filter((x: any) => x.item_type === 1)
                      ?.map((item: any, index: any) => (
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
                          ?.filter((x: any) => x.item_type === 2)
                          ?.reduce(
                            (total: any, item: any) => total + parseInt(item.final_price || 0),
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
                          ?.filter((x: any) => x.item_type === 1)
                          ?.reduce(
                            (total: any, item: any) => total + parseInt(item.final_price || 0),
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
                        {orderDetail?.quotation[0]?.promotion
                          ? `Additional Promotion (${orderDetail?.quotation[0]?.promotion?.name})`
                          : 'Additional Promotion'}
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
                  <Form.Text className='fs-8 text-dark'>
                    *Order ini lebih dari{' '}
                    <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                    toko sehingga dikenakan biaya tambahan
                  </Form.Text>
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
                    {orderDetail?.order_details?.map((item: any, index: any) => (
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
                            <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString('id')}`}</td>
                          </>
                        )}
                      </tr>
                    ))}

                    {orderDetail?.is_overdistance === 1 && (
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
      </Row>

      {orderDetail?.quotation?.[0]?.quotation_special === 1 && (
        <Row className='information-detail mb-3'>
          <Col>
            <div className='fs-3 fw-bold'>Preview Pembayaran</div>

            <table className='table hover responsive'>
              <thead className='table-warranty-head'>
                <tr>
                  <th>Tahap Pembayaran</th>
                  <th>Persentase</th>
                  <th>Nominal Pembayaran</th>
                </tr>
              </thead>

              <tbody>
                {paymentStages.map((stage, index) => (
                  <tr key={index}>
                    <td>{stage.stage}</td>
                    <td>{stage.percentage}</td>
                    <td>{`${stage.amount.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    })}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Col>
        </Row>
      )}
    </>
  )
}
