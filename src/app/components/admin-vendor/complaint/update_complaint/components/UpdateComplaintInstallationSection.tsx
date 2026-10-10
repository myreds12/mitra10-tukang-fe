import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {Skeleton} from 'antd'

interface UpdateComplaintInstallationSectionProps {
  complaintDetail: any
  isLoadingPage: boolean
}

export const UpdateComplaintInstallationSection: React.FC<UpdateComplaintInstallationSectionProps> = ({
  complaintDetail,
  isLoadingPage,
}) => {
  return (
    <Row className='table-warranty d-flex align-items-center mb-5'>
      <div className='table-title-warranty'>
        <Skeleton active loading={isLoadingPage} paragraph={{rows: 2}}>
          <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

          <Row>
            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>
                {complaintDetail?.orders?.payment_type === 'survey'
                  ? 'Tanggal request survey :'
                  : 'Tanggal request pemasangan :'}
              </Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {complaintDetail?.orders?.request_survey
                    ? new Date(complaintDetail?.orders?.request_survey).toLocaleDateString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )
                    : '-'}
                </p>
              </Col>
            </Form.Group>

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {complaintDetail?.orders?.vendor?.company_name ?? '-'}
                </p>
              </Col>
            </Form.Group>

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Payment Type:</Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {(() => {
                    if (complaintDetail?.orders?.payment_type === 'survey') {
                      return `Berbayar & Survey`
                    } else if (complaintDetail?.orders?.payment_type === 'gratis') {
                      return `Gratis`
                    } else if (
                      complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
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
        </Skeleton>
      </div>

      <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
        {(() => {
          if (
            (complaintDetail?.orders?.payment_type === 'survey' &&
              complaintDetail?.orders?.work_orders === null) ||
            (complaintDetail?.orders?.work_orders?.work_order_status?.length === 1 &&
              complaintDetail?.orders?.payment_type === 'survey')
          ) {
            return (
              <div className='table-warranty-content'>
                {complaintDetail?.orders?.is_overdistance === 1 && (
                  <Form.Text className='fs-8 text-dark'>
                    *Order ini lebih dari{' '}
                    <span className='fw-bolder text-decoration-underline'>10 KM</span> dari toko
                    sehingga dikenakan biaya tambahan
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
                    {complaintDetail?.orders?.m_order_details?.map((item: any, index: any) => (
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

                    {complaintDetail?.orders?.is_overdistance === 1 && (
                      <>
                        <tr>
                          <td colSpan={3} className='text-end fw-bolder align-middle'>
                            Biaya Tambahan
                          </td>
                          <td className=' fw-bolder'>{`Rp. ${Number(
                            complaintDetail?.orders?.additional_fee
                          ).toLocaleString('id')}`}</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className='text-end fw-bolder'>
                            Grand Total
                          </td>
                          <td className=' fw-bolder'>{`Rp. ${Number(
                            complaintDetail?.orders?.grand_total
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
              complaintDetail?.orders?.work_orders?.work_order_status?.[0]?.status?.category
            ) &&
            complaintDetail?.orders?.payment_type === 'survey' &&
            (complaintDetail?.orders?.work_orders?.work_order_status?.length ?? 0) >= 1 &&
            complaintDetail?.orders?.quotation?.length === 0
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
                    {complaintDetail?.orders?.work_orders?.work_order_status?.[0]?.work_order_items
                      ?.length ? (
                      complaintDetail?.orders?.work_orders?.work_order_status?.[0]?.work_order_items?.map(
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
            (complaintDetail?.orders?.work_orders?.work_order_status?.length ?? 0) >= 1 &&
            (complaintDetail?.orders?.quotation?.length ?? 0) >= 1 &&
            complaintDetail?.orders?.payment_type === 'survey'
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
                    {complaintDetail?.orders?.quotation?.[0]?.quotation_details
                      ?.filter((x: any) => x.item_type === 2)
                      ?.map((item: any, index: any) => (
                        <tr key={`${index}-quotation`}>
                          <td>
                            {item?.name ?? '-'}{' '}
                            {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                          </td>
                          <td>{item?.quantity ?? 0}</td>
                          <td>{item?.unit}</td>
                          <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString('id')}`}</td>
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
                    {complaintDetail?.orders?.quotation?.[0]?.quotation_details
                      ?.filter((x: any) => x.item_type === 1)
                      ?.map((item: any, index: any) => (
                        <tr key={`${index}-quotation`}>
                          <td>
                            {item?.name ?? '-'}{' '}
                            {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                          </td>
                          <td>{item?.quantity ?? 0}</td>
                          <td>{item?.unit ?? '-'}</td>
                          <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString('id')}`}</td>
                        </tr>
                      ))}

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        Total Jasa
                      </td>
                      <td className='fw-bolder'>{`Rp. ${parseInt(
                        complaintDetail?.orders?.quotation?.[0]?.quotation_details
                          ?.filter((x: any) => x.item_type === 2)
                          ?.reduce(
                            (total: any, item: any) => total + parseInt(item.final_price || 0),
                            0
                          ) || 0
                      ).toLocaleString('id')}`}</td>
                    </tr>

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        Total Material
                      </td>
                      <td className='fw-bolder'>{`Rp. ${parseInt(
                        complaintDetail?.orders?.quotation?.[0]?.quotation_details
                          ?.filter((x: any) => x.item_type === 1)
                          ?.reduce(
                            (total: any, item: any) => total + parseInt(item.final_price || 0),
                            0
                          ) || 0
                      ).toLocaleString('id')}`}</td>
                    </tr>

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        Promosi
                      </td>
                      <td className=' fw-bolder'>
                        {`Rp. ${parseInt(
                          complaintDetail?.orders?.quotation?.[0]?.quotation_disc ?? 0
                        ).toLocaleString('id')}`}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        {complaintDetail?.orders?.quotation?.[0]?.promotion
                          ? `Additional Promotion (${complaintDetail?.orders?.quotation?.[0]?.promotion?.name})`
                          : `Additional Promotion`}
                      </td>
                      <td className=' fw-bolder'>
                        {complaintDetail?.orders?.quotation?.[0]?.promotion?.promotion_type === 1
                          ? `${complaintDetail?.orders?.quotation?.[0]?.promotion?.promotion} %`
                          : `Rp. ${parseInt(
                              complaintDetail?.orders?.quotation?.[0]?.promotion?.promotion ?? 0
                            ).toLocaleString('id')}`}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={3} className='text-end fw-bolder'>
                        Grand Total
                      </td>
                      <td className=' fw-bolder'>
                        {`Rp. ${parseInt(
                          complaintDetail?.orders?.quotation?.[0]?.quotation_grand_total ?? 0
                        ).toLocaleString('id')}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          } else if (
            complaintDetail?.orders?.payment_type === 'gratis' ||
            complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
          ) {
            return (
              <div className='table-warranty-content'>
                {complaintDetail?.orders?.is_overdistance === 1 && (
                  <Form.Text className='fs-8 text-dark'>
                    *complaintDetail?.orders ini lebih dari{' '}
                    <span className='fw-bolder text-decoration-underline'>10 KM</span> dari toko
                    sehingga dikenakan biaya tambahan
                  </Form.Text>
                )}

                <table className='table hover responsive'>
                  <thead className='table-warranty-head'>
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>Nama Pemasangan</th>
                      <th>QTY Pemasangan</th>
                      {complaintDetail?.orders?.payment_type !== 'gratis' && (
                        <>
                          <th>Harga Jasa</th>
                          <th>Jumlah</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {complaintDetail?.orders?.m_order_details?.map((item: any, index: any) => (
                      <tr key={`${index} - order_detail`}>
                        <td>{item?.item_code}</td>
                        <td>{item?.item_name}</td>
                        <td>{item?.item?.service_name}</td>
                        <td>{item?.quantity ?? 0}</td>
                        {complaintDetail?.orders?.payment_type !== 'gratis' && (
                          <>
                            <td>{`Rp. ${parseInt(item?.unit_price || 0)?.toLocaleString(
                              'id'
                            )}`}</td>
                            <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString('id')}`}</td>
                          </>
                        )}
                      </tr>
                    ))}

                    {complaintDetail?.orders?.is_overdistance === 1 && (
                      <tr>
                        <td
                          colSpan={complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3}
                          className='text-end fw-bolder align-middle'
                        >
                          Biaya Tambahan
                        </td>
                        <td className=' fw-bolder'>{`Rp. ${Number(
                          complaintDetail?.orders?.additional_fee
                        ).toLocaleString('id')}`}</td>
                      </tr>
                    )}

                    <tr>
                      <td
                        colSpan={complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3}
                        className='text-end fw-bolder'
                      >
                        Grand Total
                      </td>
                      <td className=' fw-bolder'>{`Rp. ${Number(
                        complaintDetail?.orders?.grand_total
                      ).toLocaleString('id')}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          }
          return null
        })()}
      </Skeleton>
    </Row>
  )
}
