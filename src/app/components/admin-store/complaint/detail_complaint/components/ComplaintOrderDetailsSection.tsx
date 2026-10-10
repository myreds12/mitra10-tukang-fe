import React, { FC } from 'react'
import { Row, Col, Form, ListGroup, Modal } from 'react-bootstrap'
import { Skeleton, Image } from 'antd'
import { formatDateWithTime } from '../../../../../../_metronic/helpers'

interface ComplaintOrderDetailsSectionProps {
  isLoadingPage: boolean
  complaintDetail: any
  warrantyData: {
    workEndDate?: string
    warrantyEndDate?: string
    status?: string
  }
  previewImage: string
  setPreviewImage: (val: string) => void
  visibleReceipt: boolean
  setVisibleReceipt: (val: boolean) => void
  visibleQuotationReceipt: boolean
  setVisibleQuotationReceipt: (val: boolean) => void
  visibleQuotationFiles: boolean
  setVisibleQuotationFiles: (val: boolean) => void
  apiUrl: string | undefined
  handleClose: () => void
}

export const ComplaintOrderDetailsSection: FC<ComplaintOrderDetailsSectionProps> = ({
  isLoadingPage,
  complaintDetail,
  warrantyData,
  previewImage,
  setPreviewImage,
  visibleReceipt,
  setVisibleReceipt,
  visibleQuotationReceipt,
  setVisibleQuotationReceipt,
  visibleQuotationFiles,
  setVisibleQuotationFiles,
  apiUrl,
  handleClose,
}) => {
  return (
    <>
      <Row className='table-warranty d-flex align-items-center mb-5'>
        <Skeleton active loading={isLoadingPage} paragraph={{ rows: 3 }}>
          {(() => {
            if (
              (complaintDetail?.orders?.payment_type === 'survey' &&
                complaintDetail?.orders?.work_orders === null) ||
              (complaintDetail?.orders?.work_orders?.work_order_status.length === 1 &&
                complaintDetail?.orders?.payment_type === 'survey')
            ) {
              return (
                <div className='table-warranty-content'>
                  {complaintDetail?.orders?.is_overdistance === 1 && (
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
                      {complaintDetail?.orders?.m_order_details?.map(
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
                complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
              ) &&
              complaintDetail?.orders?.payment_type === 'survey' &&
              complaintDetail?.orders?.work_orders?.work_order_status.length >= 1 &&
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
                      {complaintDetail?.orders?.work_orders?.work_order_status[0]
                        ?.work_order_items?.length ? (
                        complaintDetail?.orders?.work_orders?.work_order_status[0]?.work_order_items?.map(
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
              complaintDetail?.orders?.work_orders?.work_order_status?.length >= 1 &&
              complaintDetail?.orders?.quotation?.length >= 1 &&
              complaintDetail?.orders?.payment_type === 'survey'
            ) {
              return (
                <div className='table-warranty-content'>
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
                      {complaintDetail?.orders?.quotation[0]?.quotation_details
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
                          Final Price
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {complaintDetail?.orders?.quotation[0]?.quotation_details
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
                          complaintDetail?.orders?.quotation[0]?.quotation_details
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
                          complaintDetail?.orders?.quotation[0]?.quotation_details
                            ?.filter((x: any) => x.item_type === 1)
                            ?.reduce(
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
                            complaintDetail?.orders?.quotation[0]?.quotation_disc ?? 0
                          ).toLocaleString('id')}`}
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          {`${
                            complaintDetail?.orders?.quotation[0]?.promotion
                              ? `Additional Promotion (${complaintDetail?.orders?.quotation[0]?.promotion?.name})`
                              : `Additional Promotion`
                          }`}
                        </td>

                        <td className=' fw-bolder'>
                          {complaintDetail?.orders?.quotation[0]?.promotion?.promotion_type ===
                          1
                            ? `${complaintDetail?.orders?.quotation[0]?.promotion?.promotion} %`
                            : `Rp. ${parseInt(
                                complaintDetail?.orders?.quotation[0]?.promotion?.promotion ?? 0
                              ).toLocaleString('id')}`}
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Grand Total
                        </td>
                        <td className=' fw-bolder'>
                          {`Rp. ${parseInt(
                            complaintDetail?.orders?.quotation[0]?.quotation_grand_total ?? 0
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
                        {!(complaintDetail?.orders?.payment_type === 'gratis') && (
                          <>
                            <th>Harga Jasa</th>
                            <th>Jumlah</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {complaintDetail?.orders?.m_order_details?.map(
                        (item: any, index: any) => (
                          <tr key={`${index} - order_detail`}>
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
                        )
                      )}

                      {complaintDetail?.orders?.is_overdistance === 1 && (
                        <tr>
                          <td
                            colSpan={
                              complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3
                            }
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
          })()}
        </Skeleton>
      </Row>

      <Row>
        <Col>
          <Skeleton active loading={isLoadingPage} paragraph={{ rows: 3 }}>
            <Row className='information-detail'>
              <div className='fs-3 fw-bold'>Informasi Survei Yang Dilakukan Oleh Vendor</div>

              <div className='survey'>
                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Survey dikerjakan pada:</p>

                  <div className='fs-7 p-0'>
                    {complaintDetail?.orders?.payment_type === 'survey' ? (
                      <>
                        {complaintDetail?.orders?.work_orders?.work_order_status.length ? (
                          <p className='fs-7'>
                            Tanggal :{' '}
                            {formatDateWithTime(
                              complaintDetail?.orders?.work_orders?.survey_date
                            )}
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

                  {complaintDetail?.orders?.payment_type === 'survey' ? (
                    <>
                      {complaintDetail?.orders?.work_orders?.work_order_status.length ? (
                        <p className='fs-7'>
                          {complaintDetail?.orders?.work_orders?.work_order_tukang
                            .filter((x: any) => x.type === 1)
                            .map((item: any) => item?.tukang?.full_name)
                            .join(', ')}
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
            </Row>
          </Skeleton>
        </Col>

        <Col>
          <Skeleton active loading={isLoadingPage} paragraph={{ rows: 3 }}>
            <Row className='information-detail'>
              <div className='fs-3 fw-bold'>
                Informasi Pengerjaan Yang Dilakukan Oleh Vendor
              </div>

              <div className='work-date'>
                <p className='fs-5 fw-bold'>Pekerjaan dilakukan pada:</p>

                <div className='detail-info mb-3'>
                  {complaintDetail?.orders?.work_orders !== null &&
                  complaintDetail?.orders?.work_orders?.work_start_date !== null ? (
                    <div>
                      <p className='fs-7'>
                        MULAI{' '}
                        <span className='ms-5'>
                          {formatDateWithTime(
                            complaintDetail?.orders?.work_orders?.work_start_date
                          )}
                        </span>
                      </p>

                      <p className='fs-7'>
                        SELESAI{' '}
                        <span className='ms-3'>
                          {formatDateWithTime(
                            complaintDetail?.orders?.work_orders?.work_end_date
                          )}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className='fs-7'>Jadwal belum ditentukan oleh vendor</p>
                  )}
                </div>

                <div className='detail-info mb-3'>
                  <p className='fs-5 fw-bold'>Oleh:</p>

                  {complaintDetail?.orders?.work_orders?.work_order_tukang?.filter(
                    (x: any) => x.type === 2
                  )?.length ? (
                    <p className='fs-7'>
                      {complaintDetail?.orders?.work_orders?.work_order_tukang
                        ?.filter((x: any) => x.type === 2)
                        ?.map((item: any) => item?.tukang?.full_name)
                        .join(', ')}
                    </p>
                  ) : (
                    <p className='fs-7'>Tukang belum diset oleh vendor</p>
                  )}
                </div>
              </div>
            </Row>
          </Skeleton>
        </Col>
      </Row>

      <Row>
        <Col>
          <Row className='information-detail'>
            <div className='fs-3 fw-bold'>Catatan Order</div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Catatan Toko :</p>

              <p className='fs-7'>
                {complaintDetail?.orders?.notes
                  ? complaintDetail?.orders?.notes
                  : 'Toko tidak memberikan catatan'}
              </p>
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Catatan Tukang :</p>

              <p className='fs-7'>
                {complaintDetail?.orders?.work_orders?.work_order_status[0]?.description
                  ? complaintDetail?.orders?.work_orders?.work_order_status[0]?.description
                  : 'Tukang tidak memberikan catatan'}
              </p>
            </div>

            <div className='detail-info mb-3'>
              <p className='fs-5 fw-bold'>Intruksi Spesial :</p>

              <p className='fs-7'>
                {complaintDetail?.orders?.quotation[0]?.description
                  ? complaintDetail?.orders?.quotation[0]?.description
                  : 'Vendor tidak memberikan catatan'}
              </p>
            </div>
          </Row>
        </Col>

        {['WORKEND', 'WORKENDSTEPONE', 'WORKENDSTEPTWO', 'WORKENDSTEPTHREE'].includes(
          complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
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

      {complaintDetail?.orders?.order_files?.length >= 1 ? (
        <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{ rows: 1 }}>
              <Form.Label className='mt-3'>Bukti Receipt :</Form.Label>
              <ListGroup>
                {complaintDetail?.orders?.order_files.map((item: any) => (
                  <ListGroup.Item
                    key={item.id}
                    action
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setPreviewImage(item.path)
                      setVisibleReceipt(true)
                    }}
                  >
                    {item.path}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {previewImage && (
                <div>
                  {previewImage.endsWith('.pdf') ? (
                    <Modal
                      dialogClassName='modal-show-pdf'
                      centered
                      show={visibleReceipt}
                      onHide={handleClose}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>File - {previewImage}</Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        <iframe
                          key={previewImage}
                          width='100%'
                          height='100%'
                          src={`${apiUrl}/public/receipt/${previewImage}`}
                          style={{ border: 'none' }}
                        />
                      </Modal.Body>
                    </Modal>
                  ) : (
                    <Image
                      key={previewImage}
                      width={200}
                      style={{ display: 'none' }}
                      src={`${apiUrl}/public/receipt/${previewImage}`}
                      preview={{
                        visible: visibleReceipt,
                        src: `${apiUrl}/public/receipt/${previewImage}`,
                        onVisibleChange: (value) => {
                          setVisibleReceipt(value)
                        },
                      }}
                    />
                  )}
                </div>
              )}
            </Skeleton>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Form.Label className='mt-3'>Bukti Receipt Quotation :</Form.Label>
            <ListGroup>
              {complaintDetail?.orders?.quotation[0]?.quotation_files
                ?.filter((x: any) => x.type === 2)
                ?.map((item: any) => (
                  <ListGroup.Item
                    key={item.id}
                    action
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setPreviewImage(item.path)
                      setVisibleQuotationReceipt(true)
                    }}
                  >
                    {item.path}
                  </ListGroup.Item>
                ))}
            </ListGroup>

            {complaintDetail?.orders?.quotation[0]?.quotation_files?.length ? (
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
                <p className='fs-7 text-danger'>Pembayaran belum diverifikasi oleh Toko</p>
              </div>
            )}
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Form.Label className='mt-3'>Bukti Transfer Quotation :</Form.Label>
            <ListGroup>
              {complaintDetail?.orders?.quotation[0]?.quotation_files
                ?.filter((x: any) => x.type === 1 || x.type === 3)
                ?.map((item: any) => (
                  <ListGroup.Item
                    key={item.id}
                    action
                    style={{ cursor: 'pointer' }}
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

            {complaintDetail?.orders?.quotation[0]?.quotation_files?.length ? (
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
                <p className='fs-7 text-danger'>Pembayaran belum diverifikasi oleh Toko</p>
              </div>
            )}
          </Col>
        </Row>
      ) : null}
    </>
  )
}
