import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {Order, PaymentStage} from '../types'

interface OrderDetailModalInstallationProps {
  selectedOrder: Order | null
  paymentStages: PaymentStage[]
  formatDate: (date: any) => string
}

export const OrderDetailModalInstallation: React.FC<OrderDetailModalInstallationProps> = ({
  selectedOrder,
  paymentStages,
  formatDate,
}) => {
  return (
    <>
      <Row className='table-warranty d-flex align-items-center mb-5'>
        <div className='table-title-warranty'>
          <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

          <Row>
            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>
                {(() => {
                  if (selectedOrder?.order_detail?.payment_type === 'survey') {
                    return `Tanggal Request Survey`
                  } else {
                    return `Tanggal request pemasangan`
                  }
                })()}
              </Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {formatDate(selectedOrder?.order_detail?.request_survey)}
                </p>
              </Col>
            </Form.Group>

            {selectedOrder?.order_detail?.payment_type === 'survey' && (
              <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                <Form.Label column>Tanggal request pemasangan</Form.Label>
                <Col>
                  <p className='fs-7 p-0'>
                    {selectedOrder?.order_detail?.request_work
                      ? formatDate(selectedOrder?.order_detail?.request_work)
                      : 'Tanggal belum diset oleh toko'}
                  </p>
                </Col>
              </Form.Group>
            )}

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {selectedOrder?.order_detail?.vendor?.company_name ?? '-'}
                </p>
              </Col>
            </Form.Group>

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Payment Type:</Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {(() => {
                    if (selectedOrder?.order_detail?.payment_type === 'survey') {
                      return `Berbayar & Survey`
                    } else if (selectedOrder?.order_detail?.payment_type === 'gratis') {
                      return `Gratis`
                    } else if (
                      selectedOrder?.order_detail?.payment_type === 'pemasangan_tanpa_survey'
                    ) {
                      return `Berbayar & Pemasangan Tanpa Survey`
                    } else {
                      return ``
                    }
                  })()}
                </p>
              </Col>
            </Form.Group>
          </Row>
        </div>

        {(() => {
          if (
            (selectedOrder?.order_detail?.payment_type === 'survey' &&
              selectedOrder?.order_detail?.work_orders === null &&
              selectedOrder?.order_detail?.quotation?.length === 0) ||
            (selectedOrder?.order_detail?.work_orders?.work_order_status[0]?.work_order_items
              .length === 0 &&
              selectedOrder?.order_detail?.payment_type === 'survey' &&
              selectedOrder?.order_detail?.quotation?.length === 0)
          ) {
            return (
              <div className='table-warranty-content'>
                {selectedOrder?.order_detail?.is_overdistance === 1 && (
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
                    {selectedOrder?.order_detail?.m_order_details?.map(
                      (item: any, index: any) => (
                        <tr key={`${index} - order_detail`}>
                          <td>{item?.item_code}</td>
                          <td>{item?.item_name}</td>
                          <td>{item?.item_notes}</td>
                          <td>{item?.quantity ?? 0}</td>
                        </tr>
                      )
                    )}

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        Biaya Survey
                      </td>
                      <td className=' fw-bolder'>Rp. 99.000</td>
                    </tr>

                    {selectedOrder?.order_detail?.is_overdistance === 1 && (
                      <>
                        <tr>
                          <td colSpan={3} className='text-end fw-bolder align-middle'>
                            Biaya Tambahan
                          </td>
                          <td className=' fw-bolder'>{`Rp. ${Number(
                            selectedOrder?.order_detail?.additional_fee
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Grand Total
                          </td>
                          <td className=' fw-bolder'>{`Rp. ${Number(
                            selectedOrder?.order_detail?.grand_total
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
              selectedOrder?.order_detail?.work_orders?.work_order_status[0]?.status?.category
            ) &&
            selectedOrder?.order_detail?.payment_type === 'survey' &&
            selectedOrder?.order_detail?.work_orders?.work_order_status[0]?.work_order_items
              .length >= 1 &&
            selectedOrder?.order_detail?.quotation?.length === 0
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
                    {selectedOrder?.order_detail?.work_orders?.work_order_status[0]
                      ?.work_order_items.length ? (
                      selectedOrder?.order_detail.work_orders.work_order_status[0].work_order_items.map(
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
            selectedOrder?.order_detail?.quotation?.length >= 1 &&
            selectedOrder?.order_detail?.payment_type === 'survey'
          ) {
            return (
              <div className='table-warranty-content'>
                <div className='table-warranty-content'>
                  {selectedOrder?.order_detail?.is_overdistance === 1 && (
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
                      {selectedOrder?.order_detail?.m_order_details?.map(
                        (item: any, index: any) => (
                          <tr key={`${index} - order_detail`}>
                            <td>{item?.item_code}</td>
                            <td>{item?.item_name}</td>
                            <td>{item?.item_notes}</td>
                            <td>{item?.quantity ?? 0}</td>
                          </tr>
                        )
                      )}

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Biaya Survey
                        </td>
                        <td className=' fw-bolder'>Rp. 99.000</td>
                      </tr>

                      {selectedOrder?.order_detail?.is_overdistance === 1 && (
                        <>
                          <tr>
                            <td colSpan={3} className='text-end fw-bolder align-middle'>
                              Biaya Tambahan
                            </td>
                            <td className=' fw-bolder'>{`Rp. ${Number(
                              selectedOrder?.order_detail?.additional_fee
                            ).toLocaleString('id')}`}</td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Grand Total
                            </td>
                            <td className=' fw-bolder'>{`Rp. ${Number(
                              selectedOrder?.order_detail?.grand_total
                            ).toLocaleString('id')}`}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {selectedOrder?.order_detail?.quotation?.[0]?.quotation_special === 0 ? (
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
                      {selectedOrder?.order_detail?.quotation[0]?.quotation_details
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
                ) : (
                  <>
                    <div className='fs-6 fw-bold mb-2'>Jasa Pemasangan Tahap 1</div>

                    {selectedOrder?.order_detail?.quotation[0]?.quotation_receipt[0]
                      ?.receipt_quotation &&
                      selectedOrder?.order_detail?.quotation[0]?.quotation_special === 1 && (
                        <div className='fs-6 fw-bold'>
                          Receipt Quotation Tahap 1 :{' '}
                          <span className='fs-6 fw-semibold'>
                            {selectedOrder?.order_detail?.quotation[0]?.quotation_receipt[0]
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
                        {selectedOrder?.order_detail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 2 && x.work_step === 1)
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

                    <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                    {selectedOrder?.order_detail?.quotation[0]?.quotation_receipt[1]
                      ?.receipt_quotation &&
                      selectedOrder?.order_detail?.quotation[0]?.quotation_special === 1 && (
                        <div className='fs-6 fw-bold'>
                          Receipt Quotation Tahap 1 :{' '}
                          <span className='fs-6 fw-semibold'>
                            {selectedOrder?.order_detail?.quotation[0]?.quotation_receipt[1]
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
                        {selectedOrder?.order_detail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 2 && x.work_step === 2)
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

                    <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                    {selectedOrder?.order_detail?.quotation[0]?.quotation_receipt[2]
                      ?.receipt_quotation &&
                      selectedOrder?.order_detail?.quotation[0]?.quotation_special === 1 && (
                        <div className='fs-6 fw-bold'>
                          Receipt Quotation Tahap 1 :{' '}
                          <span className='fs-6 fw-semibold'>
                            {selectedOrder?.order_detail?.quotation[0]?.quotation_receipt[2]
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
                        {selectedOrder?.order_detail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 2 && x.work_step === 3)
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
                    {selectedOrder?.order_detail?.quotation[0]?.quotation_details
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
                        selectedOrder?.order_detail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 2)
                          .reduce(
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
                        selectedOrder?.order_detail?.quotation[0]?.quotation_details
                          .filter((x: any) => x.item_type === 1)
                          .reduce(
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
                          selectedOrder?.order_detail?.quotation[0]?.quotation_disc ?? 0
                        ).toLocaleString('id')}`}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        {`${
                          selectedOrder?.order_detail?.quotation[0]?.promotion
                            ? `Additional Promotion (${selectedOrder?.order_detail?.quotation[0]?.promotion?.name})`
                            : `Additional Promotion`
                        }`}
                      </td>

                      <td className=' fw-bolder'>
                        {selectedOrder?.order_detail?.quotation[0]?.promotion
                          ?.promotion_type === 1
                          ? `${selectedOrder?.order_detail?.quotation[0]?.promotion?.promotion} %`
                          : `Rp. ${parseInt(
                              selectedOrder?.order_detail?.quotation[0]?.promotion?.promotion ??
                                0
                            ).toLocaleString('id')}`}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        Grand Total
                      </td>
                      <td className=' fw-bolder'>
                        {`Rp. ${parseInt(
                          selectedOrder?.order_detail?.quotation[0]?.quotation_grand_total ?? 0
                        ).toLocaleString('id')}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          } else if (
            selectedOrder?.order_detail?.payment_type === 'gratis' ||
            selectedOrder?.order_detail?.payment_type === 'pemasangan_tanpa_survey'
          ) {
            return (
              <div className='table-warranty-content'>
                {selectedOrder?.order_detail?.is_overdistance === 1 && (
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
                      {!(selectedOrder?.order_detail?.payment_type === 'gratis') && (
                        <>
                          <th>Harga Jasa</th>
                          <th>Jumlah</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder?.order_detail?.m_order_details?.map(
                      (item: any, index: any) => (
                        <tr key={`${index} - order_detail`}>
                          <td>{item?.item_code}</td>
                          <td>{item?.item_name}</td>
                          <td>{item?.item?.service_name}</td>
                          <td>{item?.quantity ?? 0}</td>
                          {!(selectedOrder?.order_detail?.payment_type === 'gratis') && (
                            <>
                              <td>{`Rp. ${parseInt(item?.unit_price || 0)?.toLocaleString(
                                'id'
                              )}`}</td>
                              <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString('id')}`}</td>
                            </>
                          )}
                        </tr>
                      )
                    )}

                    {selectedOrder?.order_detail?.is_overdistance === 1 && (
                      <tr>
                        <td
                          colSpan={
                            selectedOrder?.order_detail?.payment_type !== 'gratis' ? 5 : 3
                          }
                          className='text-end fw-bolder align-middle'
                        >
                          Biaya Tambahan
                        </td>

                        <td className=' fw-bolder'>{`Rp. ${Number(
                          selectedOrder?.order_detail?.additional_fee
                        ).toLocaleString('id')}`}</td>
                      </tr>
                    )}

                    <tr>
                      <td
                        colSpan={selectedOrder?.order_detail?.payment_type !== 'gratis' ? 5 : 3}
                        className='text-end fw-bolder'
                      >
                        Grand Total
                      </td>

                      <td className=' fw-bolder'>{`Rp. ${Number(
                        selectedOrder?.order_detail?.grand_total
                      ).toLocaleString('id')}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          }
        })()}
      </Row>

      {selectedOrder?.order_detail?.quotation?.[0]?.quotation_special === 1 && (
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
