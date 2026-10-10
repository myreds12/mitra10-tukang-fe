import React, {FC} from 'react'
import {Skeleton, Image} from 'antd'
import {Modal, Row, Col, Form, Button, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faImage, faTrash, faFileImage} from '@fortawesome/free-solid-svg-icons'

export interface QuotationModalProps {
  show?: boolean
  handleClose?: () => void
  orderDetail: any
  loadingModal: boolean
  handleReceiptClick: () => void
  handleReceiptChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleUpdateQuotation: () => Promise<any>
  loadingUpdate: boolean
  receiptQuotation: any[]
  quotationFiles: any[]
  handleFileReceipt: (index: number) => void
  handleRemoveReceipt: (index: number) => void
  handleImageClick: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleFileClick: (index: number) => void
  handleRemoveFile: (index: number) => void
  singleReceipt?: any
  handleMultiReceiptChange?: (index: number, value: string) => void
  receiptRefs?: any
  evidenceRef?: any
  notes?: any
  quotation?: any
  setQuotation?: (v: any) => void
  today?: string
  paymentStages?: any
  visibleReceipt?: boolean
  setVisibleReceipt?: (v: boolean) => void
  previewReceipt?: string
  setPreviewReceipt?: (v: string) => void
  visible?: boolean
  setVisible?: (v: boolean) => void
  previewImage?: string
  setPreviewImage?: (v: string) => void
  apiUrl?: string
  setFocusedIndex?: (i: any) => void
  selectedReceiptIndex?: number | null
  selectedFileIndex?: number | null
  orderForm?: any
  setOrderForm?: (val: any) => void
  vendor?: any[]
  vendorAvailbility?: (data: any) => any
}

export const QuotationModal: FC<QuotationModalProps> = ({
  orderDetail,
  loadingModal,
  handleReceiptClick,
  handleReceiptChange,
  handleUpdateQuotation,
  loadingUpdate,
  receiptQuotation,
  quotationFiles,
  handleFileReceipt,
  handleRemoveReceipt,
  handleImageClick,
  handleFileChange,
  handleFileClick,
  handleRemoveFile,
  singleReceipt,
  handleMultiReceiptChange,
  receiptRefs,
  evidenceRef,
  notes,
  quotation,
  setQuotation,
  today = new Date().toISOString().split('T')[0],
  paymentStages,
  visibleReceipt,
  setVisibleReceipt,
  previewReceipt,
  setPreviewReceipt,
  visible,
  setVisible,
  previewImage,
  setPreviewImage,
  apiUrl = process.env.REACT_APP_API_URL,
  setFocusedIndex,
  selectedReceiptIndex,
  selectedFileIndex,
  orderForm,
  setOrderForm,
  vendor,
  vendorAvailbility,
}) => {
    return (
      <>
        <Modal.Header closeButton>
          <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
            <Modal.Title>Verifikasi Pembayaran Quotation - Order ID {orderDetail?.id}</Modal.Title>
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

                {orderDetail?.quotation[0]?.receipt_quotation &&
                  orderDetail?.quotation[0]?.quotation_special === 0 && (
                    <>
                      <br></br>
                      <Form.Label className='fs-6 fw-bold'>
                        Receipt Quotation :
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

          <Row>
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
            {orderDetail?.quotation?.length && (
              <Row className='information-detail'>
                <div className='table-warranty-content'>
                  {orderDetail?.quotation[0]?.quotation_special === 0 ? (
                    <table className='table hover responsive'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th className='text-center' style={{width: '355px'}}>
                            Jenis Jasa
                          </th>

                          <th className='text-center' style={{width: '80px'}}>
                            QTY
                          </th>

                          <th className='text-center' style={{width: '150px'}}>
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
                  ) : (
                    <>
                      <div className='mt-2 mb-2'>
                        <p className='fs-6 text-black'>Keterangan : </p>
                        <p className='fs-6 fw-semibold text-black'>
                          *Quotation ini menggunakan quotation tipe spesial
                        </p>
                        <p className='fs-6 fw-semibold text-black'>
                          *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
                        </p>
                      </div>

                      <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>

                      {orderDetail?.quotation[0]?.quotation_receipt[0]?.receipt_quotation &&
                        orderDetail?.quotation[0]?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {orderDetail?.quotation[0]?.quotation_receipt[0]?.receipt_quotation ??
                                '-'}
                            </span>
                          </div>
                        )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '80px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '150px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
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

                      <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>

                      {orderDetail?.quotation[0]?.quotation_receipt[1]?.receipt_quotation &&
                        orderDetail?.quotation[0]?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {orderDetail?.quotation[0]?.quotation_receipt[1]?.receipt_quotation ??
                                '-'}
                            </span>
                          </div>
                        )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '80px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '150px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
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

                      <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>

                      {orderDetail?.quotation[0]?.quotation_receipt[2]?.receipt_quotation &&
                        orderDetail?.quotation[0]?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {orderDetail?.quotation[0]?.quotation_receipt[2]?.receipt_quotation ??
                                '-'}
                            </span>
                          </div>
                        )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '80px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '150px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
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
                    </>
                  )}

                  <table className='table hover responsive'>
                    <thead className='table-warranty-head'>
                      <tr>
                        <th className='text-center' style={{width: '355px'}}>
                          Material Yang Dibutuhkan
                        </th>

                        <th className='text-center' style={{width: '80px'}}>
                          QTY
                        </th>

                        <th className='text-center' style={{width: '150px'}}>
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
                            ? `${orderDetail?.quotation[0]?.promotion?.promotion ?? 0} %`
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
              </Row>
            )}
          </Skeleton>

          {orderDetail?.quotation[0]?.quotation_special === 1 && (
            <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
              <hr />

              <div className='fs-6 fw-semibold p-0 mb-2'>Preview Pembayaran</div>

              <table className='table hover responsive'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th>Tahap Pembayaran</th>
                    <th>Persentase</th>
                    <th>Nominal Pembayaran</th>
                  </tr>
                </thead>

                <tbody>
                  {paymentStages?.map((stage: any, index: number) => (
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
            </Skeleton>
          )}

          <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
            {orderDetail?.quotation[0]?.quotation_special === 0 ? (
              <Row>
                <Form.Group className='mb-5'>
                  <Form.Label className='title'>Receipt Quotation</Form.Label>
                  <Form.Control
                    ref={singleReceipt}
                    type='text'
                    placeholder='Isi nomor receipt transaksi..'
                    value={quotation.receipt_quotation}
                    onChange={(e) =>
                      setQuotation?.((prev: any) => ({
                        ...prev,
                        receipt_quotation: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Row>
            ) : (
              <>
                {quotation?.receipts_quotation?.map((receipt: any, index: number) => (
                  <Form.Group className='mb-5' key={`receipt-${index}`}>
                    <Form.Label className='title'>Receipt Quotation Tahap {index + 1}</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder={`Isi nomor receipt transaksi tahap ${index + 1}`}
                      value={receipt.receipt_quotation}
                      onChange={(e) => handleMultiReceiptChange?.(receipt.index, e.target.value)}
                      ref={(el: any) => (receiptRefs.current[receipt.index] = el)}
                      onFocus={() => setFocusedIndex?.(receipt.index)}
                    />
                  </Form.Group>
                ))}
              </>
            )}

            <Row>
              <Col md={6}>
                <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                  <Form.Group>
                    <Form.Label>Upload Bukti Receipt Quotation</Form.Label>

                    <Form className='form-input-image' onClick={handleReceiptClick}>
                      <Form.Control
                        type='file'
                        accept='image/jpeg, image/png'
                        className='input-field-receipt'
                        multiple
                        hidden
                        id='file-input'
                        ref={evidenceRef}
                        onChange={handleReceiptChange}
                      />

                      <div className='input-image-text'>
                        <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                        <p>Add File</p>
                      </div>
                    </Form>

                    <ListGroup className='pt-3'>
                      {receiptQuotation.length ? (
                        receiptQuotation.map((item: any, index: number) => (
                          <ListGroup>
                            <ListGroup.Item
                              className='d-flex justify-content-between align-items-center'
                              key={`${item?.name}-${index}-${item?.type}`}
                            >
                              <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                              <span
                                className='upload-content'
                                style={{cursor: 'pointer'}}
                                onClick={() => handleFileReceipt(index)}
                              >
                                {item?.name}
                              </span>

                              <FontAwesomeIcon
                                icon={faTrash}
                                size='sm'
                                color='#ed2b2a'
                                style={{cursor: 'pointer'}}
                                onClick={(e) => handleRemoveReceipt(index)}
                              />
                            </ListGroup.Item>

                            {selectedReceiptIndex === index && item && (
                              <Image
                                key={`${previewReceipt} - ${index}`}
                                width={200}
                                style={{display: 'none'}}
                                src={
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/quotation/${previewReceipt}`
                                }
                                preview={{
                                  visible: visibleReceipt,
                                  src:
                                    item instanceof File
                                      ? URL.createObjectURL(item)
                                      : `${apiUrl}/public/quotation/${previewReceipt}`,
                                  onVisibleChange: (value) => {
                                    setVisibleReceipt?.(value)
                                  },
                                }}
                              />
                            )}
                          </ListGroup>
                        ))
                      ) : (
                        <ListGroup.Item className='d-flex justify-content-center'>
                          Tidak ada file yang dipilih
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Form.Group>
                </Row>
              </Col>

              <Col md={6}>
                <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                  <Form.Group>
                    <Form.Label>Upload Bukti Transfer Quotation</Form.Label>

                    <Form className='form-input-image' onClick={handleImageClick}>
                      <Form.Control
                        type='file'
                        accept='image/jpeg, image/png'
                        className='input-field-image'
                        multiple
                        hidden
                        id='file-input'
                        ref={evidenceRef}
                        onChange={handleFileChange}
                      />

                      <div className='input-image-text'>
                        <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                        <p>Add File</p>
                      </div>
                    </Form>

                    <ListGroup className='pt-3'>
                      {quotationFiles.length ? (
                        quotationFiles.map((item: any, index: number) => (
                          <ListGroup>
                            <ListGroup.Item
                              className='d-flex justify-content-between align-items-center'
                              key={`${item?.name}-${index}-${item?.type}`}
                            >
                              <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                              <span
                                className='upload-content'
                                style={{cursor: 'pointer'}}
                                onClick={() => handleFileClick(index)}
                              >
                                {item?.name}
                              </span>

                              <FontAwesomeIcon
                                icon={faTrash}
                                size='sm'
                                color='#ed2b2a'
                                style={{cursor: 'pointer'}}
                                onClick={(e) => handleRemoveFile(index)}
                              />
                            </ListGroup.Item>

                            {selectedFileIndex === index && item && (
                              <Image
                                key={`${previewImage} - ${index}`}
                                width={200}
                                style={{display: 'none'}}
                                src={
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/quotation/${previewImage}`
                                }
                                preview={{
                                  visible: visible,
                                  src:
                                    item instanceof File
                                      ? URL.createObjectURL(item)
                                      : `${apiUrl}/public/quotation/${previewImage}`,
                                  onVisibleChange: (value) => {
                                    setVisible?.(value)
                                  },
                                }}
                              />
                            )}
                          </ListGroup>
                        ))
                      ) : (
                        <ListGroup.Item className='d-flex justify-content-center'>
                          Tidak ada file yang dipilih
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Form.Group>
                </Row>
              </Col>
            </Row>

            <hr />

            <Row>
              <Col>
                <Form.Group className='mb-5'>
                  <Form.Label className='title'>Tanggal Request Pengerjaan</Form.Label>
                  <Form.Control
                    name='request_work'
                    type='date'
                    placeholder='Isi tanggal request pengerjaan..'
                    min={today}
                    value={orderForm?.request_work ?? ''}
                    onChange={(e) => setOrderForm?.({...orderForm, request_work: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className='mb-5'>
                  <Form.Label className='title'>Catatan</Form.Label>
                  <Form.Control
                    name='notes'
                    type='text'
                    placeholder='Isi catatan toko..'
                    value={orderForm?.notes ?? ''}
                    ref={notes}
                    onChange={(e) => setOrderForm?.({...orderForm, notes: e.target.value})}
                  />
                </Form.Group>

                <div className='description fs-7 mb-5'>
                  Informasi mengenai ketersediaan dari Vendor
                </div>

                <div className='vendor-avail'>
                  <table className='table hover responsive'>
                    <thead className='table-warranty-head'>
                      <tr>
                        <th>Nama Vendor</th>
                        <th>Service Type</th>
                        <th>Ketersediaan Vendor</th>
                      </tr>
                    </thead>

                    <tbody>
                      {vendor?.map((item: any) => (
                        <tr key={item?.id}>
                          <td>{item?.company_name ?? '-'}</td>
                          <td>
                            {Array.from(
                              new Set(
                                item?.vendor_service?.map(
                                  (item: any) => item?.service_type?.service_type
                                )
                              )
                            ).join(', ')}
                          </td>
                          <td>{vendorAvailbility?.(item)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>

            <div className='button-submit d-flex justify-content-center align-items-center'>
              <Button
                className='d-flex justify-content-center align-items-center'
                onClick={handleUpdateQuotation}
                disabled={loadingUpdate}
                variant='dark-primary'
              >
                {loadingUpdate ? 'Submitting..' : 'Submit'}
              </Button>
            </div>
          </Skeleton>
        </Modal.Body>
      </>
    )
}
