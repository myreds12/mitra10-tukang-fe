import React from 'react'
import {Row, Col, Form, Table} from 'react-bootstrap'

interface UpdateComplaintInstallationSectionProps {
  complaintDetail: any
  formatDate: (date: any) => string
}

export const UpdateComplaintInstallationSection: React.FC<
  UpdateComplaintInstallationSectionProps
> = ({complaintDetail, formatDate}) => {
  return (
    <Row className='table-warranty d-flex align-items-center mb-5'>
      <div className='table-title-warranty mb-2'>
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
                {formatDate(new Date(complaintDetail?.orders?.request_survey))}
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
      </div>

      {(() => {
        if (
          complaintDetail?.orders?.payment_type === 'survey' ||
          complaintDetail?.orders?.work_orders?.work_order_status.length === 1
        ) {
          return (
            <div className='table-warranty-content'>
              {complaintDetail?.orders?.is_overdistance === 1 && (
                <>
                  <Form.Text className='fs-8 text-dark'>
                    *Order ini lebih dari
                    <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                    toko sehingga dikenakan biaya tambahan
                  </Form.Text>
                </>
              )}

              <Table hover responsive='md'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Nama Pemasangan</th>
                    <th>QTY Pemasangan</th>
                  </tr>
                </thead>

                <tbody>
                  {complaintDetail?.orders?.m_order_details.map((item: any, index: any) => (
                    <React.Fragment key={`${index} - order_detail`}>
                      <tr>
                        <td>{item?.item_code}</td>
                        <td>{item?.item_name}</td>
                        <td>{item?.item_notes}</td>
                        <td>{item?.quantity ?? 0}</td>
                      </tr>
                    </React.Fragment>
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
              </Table>
            </div>
          )
        } else if (
          ['QUOTEIN', 'QUOTEOUT'].includes(complaintDetail?.orders?.status?.category ?? '') &&
          complaintDetail?.orders?.payment_type === 'survey'
        ) {
          return (
            <div className='table-warranty-content'>
              {complaintDetail?.orders?.is_overdistance === 1 && (
                <>
                  <Form.Text className='fs-8 text-dark'>
                    *Order ini lebih dari
                    <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                    toko sehingga dikenakan biaya tambahan
                  </Form.Text>
                </>
              )}

              <Table hover responsive='md'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th className='text-center'>Jenis Jasa</th>
                    <th className='text-center'>QTY</th>
                    <th className='text-center'>Satuan</th>
                    <th className='text-center'>Price</th>
                    <th className='text-center'>Total</th>
                    <th className='text-center'>Keterangan</th>
                  </tr>
                </thead>

                <tbody>
                  {complaintDetail?.orders?.quotation[0]?.quotation_details.map(
                    (item: any, index: any) => (
                      <tr key={`${index}-quotation`}>
                        <td>{item?.name ?? '-'}</td>
                        <td>{item?.quantity ?? 0}</td>
                        <td>{item?.unit}</td>
                        <td>{`Rp. ${parseInt(item?.price || 0).toLocaleString('id')}`}</td>
                        <td>{`Rp. ${parseInt(item?.final_price || 0).toLocaleString(
                          'id'
                        )}`}</td>
                        <td>{item?.description ? '' : '-'}</td>
                      </tr>
                    )
                  )}

                  <tr>
                    <td colSpan={6} className='text-end fw-bolder'>
                      Promosi ( Free Survey )
                    </td>
                    <td className=' fw-bolder'>
                      {`Rp. ${parseInt(
                        complaintDetail?.orders?.quotation[0]?.quotation_disc ?? 0
                      ).toLocaleString('id')}`}
                    </td>
                  </tr>

                  {complaintDetail?.orders?.is_overdistance === 1 && (
                    <>
                      <tr>
                        <td colSpan={3} className='text-end fw-bolder align-middle'>
                          Biaya Tambahan
                        </td>

                        <td className=' fw-bolder'>{`Rp. ${Number(
                          complaintDetail?.orders?.additional_fee
                        ).toLocaleString('id')}.`}</td>
                      </tr>
                    </>
                  )}

                  <tr>
                    <td colSpan={5} className='text-end fw-bolder'>
                      Grand Total
                    </td>
                    <td className=' fw-bolder'>
                      {`Rp. ${parseInt(
                        complaintDetail?.orders?.quotation[0]?.quotation_grand_total ?? 0
                      ).toLocaleString('id')}`}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )
        } else if (
          ['SURVEYSTART', 'SURVEYDONE', 'WORKEND', 'DONE'].includes(
            complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
          ) &&
          complaintDetail?.orders?.work_orders?.work_order_status.length > 1 &&
          complaintDetail?.orders?.payment_type === 'survey'
        ) {
          return (
            <div className='table-warranty-content'>
              <Table hover responsive='md'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th>Item / Nama Pemasangan</th>
                    <th>QTY Pemasangan</th>
                    <th>Satuan</th>
                  </tr>
                </thead>

                <tbody>
                  {complaintDetail?.orders?.work_orders?.work_order_status[0]?.work_order_items.map(
                    (item: any, index: any) => (
                      <tr key={`${index}-work_order_detail`}>
                        <td>{item?.name ?? '-'}</td>
                        <td>{item?.quantity ?? 0}</td>
                        <td>{item?.unit ?? ''}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </Table>
            </div>
          )
        } else if (
          complaintDetail?.orders?.payment_type === 'gratis' ||
          complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
        ) {
          return (
            <div className='table-warranty-content'>
              {complaintDetail?.orders?.is_overdistance === 1 && (
                <>
                  <Form.Text className='fs-8 text-dark'>
                    *Order ini lebih dari
                    <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                    toko sehingga dikenakan biaya tambahan
                  </Form.Text>
                </>
              )}

              <Table hover responsive='md'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Nama Pemasangan</th>
                    <th>QTY Pemasangan</th>
                    {!(complaintDetail?.orders?.payment_type === 'gratis') && (
                      <>
                        <th>Harga Jasa</th>
                        <th>Jumlah</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {complaintDetail?.orders?.m_order_details.map((item: any, index: any) => (
                    <React.Fragment key={`${index} - order_detail`}>
                      <tr>
                        <td>{item?.item_code}</td>
                        <td>{item?.item_name}</td>
                        <td>{item?.item?.service_name}</td>
                        <td>{item?.quantity ?? 0}</td>
                        {!(complaintDetail?.orders?.payment_type === 'gratis') && (
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
                    </React.Fragment>
                  ))}

                  {complaintDetail?.orders?.is_overdistance === 1 && (
                    <>
                      <tr>
                        <td colSpan={3} className='text-end fw-bolder align-middle'>
                          Biaya Tambahan
                        </td>

                        <td className=' fw-bolder'>{`Rp. ${Number(
                          complaintDetail?.orders?.additional_fee
                        ).toLocaleString('id')}.`}</td>
                      </tr>
                    </>
                  )}

                  <tr>
                    <td
                      colSpan={complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3}
                      className='text-end fw-bolder'
                    >
                      Grand Total
                    </td>

                    <td className=' fw-bolder'>
                      {(() => {
                        if (complaintDetail?.orders?.payment_type === 'gratis') {
                          return `Rp. ${(0).toLocaleString('id')}`
                        } else if (
                          complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
                        ) {
                          return `Rp. ${parseInt(
                            complaintDetail?.orders?.grand_total
                          ).toLocaleString('id')}`
                        } else {
                          return `Rp. ${(0).toLocaleString('id')}`
                        }
                      })()}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )
        }
        return null
      })()}
    </Row>
  )
}
