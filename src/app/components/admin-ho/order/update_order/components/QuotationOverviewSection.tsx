import React, { FC } from 'react'
import { Row, Col, Form, ListGroup } from 'react-bootstrap'
import { Image } from 'antd'

interface QuotationOverviewSectionProps {
  orderDetail: any
  previewImage: string
  setPreviewImage: (val: string) => void
  visible: boolean
  setVisible: (val: boolean) => void
  visibleQuotationReceipt: boolean
  setVisibleQuotationReceipt: (val: boolean) => void
  visibleQuotationFiles: boolean
  setVisibleQuotationFiles: (val: boolean) => void
  apiUrl: string | undefined
}

export const QuotationOverviewSection: FC<QuotationOverviewSectionProps> = ({
  orderDetail,
  previewImage,
  setPreviewImage,
  visible,
  setVisible,
  visibleQuotationReceipt,
  setVisibleQuotationReceipt,
  visibleQuotationFiles,
  setVisibleQuotationFiles,
  apiUrl,
}) => {
  return (
    <>
      <div className='table-warranty-content'>
        {orderDetail?.quotation?.[0]?.quotation_special === 0 ? (
          <table className='table hover responsive'>
            <thead className='table-warranty-head'>
              <tr>
                <th className='text-center' style={{ width: '355px' }}>
                  Jenis Jasa
                </th>
                <th className='text-center' style={{ width: '100px' }}>
                  QTY
                </th>
                <th className='text-center' style={{ width: '250px' }}>
                  Satuan
                </th>
                <th className='text-center' style={{ width: '250px' }}>
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
        ) : (
          <>
            <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>

            {orderDetail?.quotation[0]?.quotation_receipt[0]?.receipt_quotation &&
              orderDetail?.quotation[0]?.quotation_special === 1 && (
                <div className='fs-6 fw-bold'>
                  Receipt Transaksi Tahap 1 :{' '}
                  <span className='fs-6 fw-semibold'>
                    {orderDetail?.quotation[0]?.quotation_receipt[0]
                      ?.receipt_quotation ?? '-'}
                  </span>
                </div>
              )}

            <table className='table hover responsive'>
              <thead className='table-warranty-head'>
                <tr>
                  <th className='text-center' style={{ width: '355px' }}>
                    Jenis Jasa
                  </th>
                  <th className='text-center' style={{ width: '100px' }}>
                    QTY
                  </th>
                  <th className='text-center' style={{ width: '250px' }}>
                    Satuan
                  </th>
                  <th className='text-center' style={{ width: '250px' }}>
                    Final Price
                  </th>
                </tr>
              </thead>

              <tbody>
                {orderDetail?.quotation[0]?.quotation_details
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

            {orderDetail?.quotation[0]?.quotation_receipt[1]?.receipt_quotation &&
              orderDetail?.quotation[0]?.quotation_special === 1 && (
                <div className='fs-6 fw-bold'>
                  Receipt Transaksi Tahap 1 :{' '}
                  <span className='fs-6 fw-semibold'>
                    {orderDetail?.quotation[0]?.quotation_receipt[1]
                      ?.receipt_quotation ?? '-'}
                  </span>
                </div>
              )}

            <table className='table hover responsive'>
              <thead className='table-warranty-head'>
                <tr>
                  <th className='text-center' style={{ width: '355px' }}>
                    Jenis Jasa
                  </th>
                  <th className='text-center' style={{ width: '100px' }}>
                    QTY
                  </th>
                  <th className='text-center' style={{ width: '250px' }}>
                    Satuan
                  </th>
                  <th className='text-center' style={{ width: '250px' }}>
                    Final Price
                  </th>
                </tr>
              </thead>

              <tbody>
                {orderDetail?.quotation[0]?.quotation_details
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

            {orderDetail?.quotation[0]?.quotation_receipt[2]?.receipt_quotation &&
              orderDetail?.quotation[0]?.quotation_special === 1 && (
                <div className='fs-6 fw-bold'>
                  Receipt Transaksi Tahap 1 :{' '}
                  <span className='fs-6 fw-semibold'>
                    {orderDetail?.quotation[0]?.quotation_receipt[2]
                      ?.receipt_quotation ?? '-'}
                  </span>
                </div>
              )}

            <table className='table hover responsive'>
              <thead className='table-warranty-head'>
                <tr>
                  <th className='text-center' style={{ width: '355px' }}>
                    Jenis Jasa
                  </th>
                  <th className='text-center' style={{ width: '100px' }}>
                    QTY
                  </th>
                  <th className='text-center' style={{ width: '250px' }}>
                    Satuan
                  </th>
                  <th className='text-center' style={{ width: '250px' }}>
                    Final Price
                  </th>
                </tr>
              </thead>

              <tbody>
                {orderDetail?.quotation[0]?.quotation_details
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
              <th className='text-center' style={{ width: '355px' }}>
                Material Yang Dibutuhkan
              </th>
              <th className='text-center' style={{ width: '100px' }}>
                QTY
              </th>
              <th className='text-center' style={{ width: '250px' }}>
                Satuan
              </th>
              <th className='text-center' style={{ width: '250px' }}>
                Price
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
                  <td>{`Rp. ${parseInt(item?.price ?? 0).toLocaleString('id')}`}</td>
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
                {`${orderDetail?.quotation[0]?.promotion
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

      <Row className='upload-receipt d-flex align-items-start mt-5'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='mt-3'>Bukti Receipt :</Form.Label>
          <ListGroup>
            {orderDetail?.order_files.map((item: any) => (
              <ListGroup.Item
                key={item.id}
                action
                onClick={() => {
                  setPreviewImage(item.path)
                  setVisible(true)
                }}
              >
                {item.path}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {previewImage && (
            <div>
              <Image
                key={previewImage}
                width={200}
                style={{ display: 'none' }}
                src={`${apiUrl}/public/receipt/${previewImage}`}
                preview={{
                  visible: visible,
                  src: `${apiUrl}/public/receipt/${previewImage}`,
                  onVisibleChange: (value) => {
                    setVisible(value)
                  },
                }}
              />
            </div>
          )}
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='mt-3'>Bukti Receipt Pembayaran :</Form.Label>
          <ListGroup>
            {orderDetail?.quotation[0]?.quotation_files
              .filter((x: any) => x.type === 2)
              .map((item: any) => (
                <ListGroup.Item
                  key={item.id}
                  action
                  onClick={() => {
                    setPreviewImage(item.path)
                    setVisibleQuotationReceipt(true)
                  }}
                >
                  {item.path}
                </ListGroup.Item>
              ))}
          </ListGroup>

          {orderDetail?.quotation[0]?.quotation_files.length ? (
            <>
              {previewImage && (
                <div>
                  <Image
                    key={previewImage}
                    width={200}
                    style={{ display: 'none' }}
                    src={`${apiUrl}/public/quotation/${previewImage}`}
                    preview={{
                      visible: visibleQuotationReceipt,
                      src: `${apiUrl}/public/quotation/${previewImage}`,
                      onVisibleChange: (value) => {
                        setVisibleQuotationReceipt(value)
                      },
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className='d-flex justify-content-start align-items-center'>
              <p className='fs-7 text-danger'>
                Pembayaran belum diverifikasi oleh Toko
              </p>
            </div>
          )}
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Label className='mt-3'>Bukti Transfer :</Form.Label>
          <ListGroup>
            {orderDetail?.quotation[0].quotation_files
              .filter((x: any) => x.type === 1 || x.type === 3)
              .map((item: any) => (
                <ListGroup.Item
                  key={item.id}
                  action
                  onClick={() => {
                    setPreviewImage(item.path)
                    setVisibleQuotationFiles(true)
                  }}
                >
                  {item.path}
                  {item.type === 3 ? ' ( Bukti transfer dikirim oleh customer)' : ''}
                </ListGroup.Item>
              ))}
          </ListGroup>

          {orderDetail?.quotation[0]?.quotation_files.length ? (
            <>
              {previewImage && (
                <div>
                  <Image
                    key={previewImage}
                    width={200}
                    style={{ display: 'none' }}
                    src={`${apiUrl}/public/quotation/${previewImage}`}
                    preview={{
                      visible: visibleQuotationFiles,
                      src: `${apiUrl}/public/quotation/${previewImage}`,
                      onVisibleChange: (value) => {
                        setVisibleQuotationFiles(value)
                      },
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className='d-flex justify-content-start align-items-center'>
              <p className='fs-7 text-danger'>
                Pembayaran belum diverifikasi oleh Toko
              </p>
            </div>
          )}
        </Col>
      </Row>
    </>
  )
}
