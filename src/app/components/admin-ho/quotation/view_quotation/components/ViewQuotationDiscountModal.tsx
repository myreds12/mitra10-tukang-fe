import React from 'react'
import {Modal, Row, Col, Form, Button, ListGroup} from 'react-bootstrap'
import Select from 'react-select'
import {Image} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faImage, faFileImage, faTrash} from '@fortawesome/free-solid-svg-icons'
import {DiscountType, TotalQuotationState} from '../types'

interface ViewQuotationDiscountModalProps {
  showModalQuotation: boolean
  handleCloseModalQuotation: () => void
  modalType: number | null
  selectedQuotation: any
  quotationNotes: any
  setQuotationNotes: (val: any) => void
  totalQuotation: TotalQuotationState
  discountType: DiscountType[]
  selectedDiscountType: DiscountType | null
  handleDiscountTypeChange: (val: DiscountType | null) => void
  discountNominal: string
  setDiscountNominal: (val: string) => void
  handleInvoiceClick: () => void
  evidenceRef: React.RefObject<any>
  handleChangeQuotationFile: (event: React.ChangeEvent<HTMLInputElement>) => void
  quotationEvidence: Array<File | null>
  handleFileQuotation: (index: number) => void
  handleRemoveFiles: (index: number) => void
  selectedQuotationIndex: number | null
  previewQuotation: any
  visibleInvoice: boolean
  setVisibleQuotation: (val: boolean) => void
  apiUrl?: string
  handleCreateRequest: () => void
  isLoading: boolean
}

export const ViewQuotationDiscountModal: React.FC<ViewQuotationDiscountModalProps> = ({
  showModalQuotation,
  handleCloseModalQuotation,
  modalType,
  selectedQuotation,
  quotationNotes,
  setQuotationNotes,
  totalQuotation,
  discountType,
  selectedDiscountType,
  handleDiscountTypeChange,
  discountNominal,
  setDiscountNominal,
  handleInvoiceClick,
  evidenceRef,
  handleChangeQuotationFile,
  quotationEvidence,
  handleFileQuotation,
  handleRemoveFiles,
  selectedQuotationIndex,
  previewQuotation,
  visibleInvoice,
  setVisibleQuotation,
  apiUrl,
  handleCreateRequest,
  isLoading,
}) => {
  return (
    <Modal
      dialogClassName='modal-request-discount'
      centered
      show={showModalQuotation}
      onHide={handleCloseModalQuotation}
    >
      {modalType === 1 && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>
              Formulir Pengajuan Diskon Konsumen - Order ID {selectedQuotation?.order_id}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className='mb-5'>
              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Label className='fs-6 fw-bold'>
                  Nama Toko :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.order_detail?.store?.store_name ?? ''}
                  </span>
                </Form.Label>
                <br />
                <Form.Label className='fs-6 fw-bold'>
                  Quotation ID :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.quotation_id ?? ''}
                  </span>
                </Form.Label>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Label className='fs-6 fw-bold'>
                  Receipt Number :
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.order_detail?.receipt_number ?? ''}
                  </span>
                </Form.Label>

                {selectedQuotation?.receipt_quotation &&
                  selectedQuotation?.receipt_quotation?.quotation_special === 0 && (
                    <>
                      <br />
                      <Form.Label className='fs-6 fw-bold'>
                        Receipt Quotation :
                        <span className='fs-6 ms-2 fw-normal'>
                          {selectedQuotation?.receipt_quotation}
                        </span>
                      </Form.Label>
                      <br />
                    </>
                  )}

                <Form.Label className='fs-6 fw-bold'>
                  Order Status :
                  <span className='fs-6 ms-2 fw-bold text-success'>
                    {selectedQuotation?.order_detail?.status?.description ?? ''}
                  </span>
                </Form.Label>
              </Col>
            </Row>

            <Row>
              <div className='fs-4 fw-bold mb-1'>Informasi Pembeli</div>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Label className='fs-6 fw-semibold'>
                  No Member :{' '}
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.order_detail?.members?.member_number ?? ''}
                  </span>
                </Form.Label>
                <br />
                <Form.Label className='fs-6 fw-semibold'>
                  Customer Name :
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.order_detail?.members?.full_name ?? ''}
                  </span>
                </Form.Label>
                <br />
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Pemasangan :
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.order_detail?.project_address ?? ''}
                  </span>
                </Form.Label>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Label className='fs-6 fw-semibold'>
                  Nomor Telp/WA :
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.order_detail?.project_number ?? ''}
                  </span>
                </Form.Label>
                <br />
                <Form.Label className='fs-6 fw-semibold'>
                  Alamat Email :
                  <span className='fs-6 ms-2 fw-normal'>
                    {selectedQuotation?.order_detail?.members?.email ?? ''}
                  </span>
                </Form.Label>
              </Col>
            </Row>

            <hr />

            <Row className='notes mb-5'>
              <Form.Group>
                <Form.Label className='fs-5 fw-bold'>Alasan pengajuan :</Form.Label>
                <Form.Control
                  style={{minHeight: '140px'}}
                  as='textarea'
                  onChange={(e) => setQuotationNotes(e.target.value)}
                  value={quotationNotes}
                />
              </Form.Group>
            </Row>

            {selectedQuotation?.quotation_detail?.length && (
              <Row className='information-detail'>
                <div className='table-warranty-content'>
                  {selectedQuotation?.quotation_special === 0 ? (
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
                        {selectedQuotation?.quotation_detail
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

                      {selectedQuotation?.quotation_receipt[0]?.receipt_quotation &&
                        selectedQuotation?.quotation_receipt[0]?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {selectedQuotation?.quotation_receipt[0]?.quotation_receipt[0]
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
                          {selectedQuotation?.quotation_detail
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

                      {selectedQuotation?.quotation_receipt[1]?.receipt_quotation &&
                        selectedQuotation?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {selectedQuotation?.quotation_receipt[1]?.receipt_quotation ?? '-'}
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
                          {selectedQuotation?.quotation_detail
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

                      {selectedQuotation?.quotation_receipt[2]?.receipt_quotation &&
                        selectedQuotation?.quotation_special === 1 && (
                          <div className='fs-6 fw-bold'>
                            Receipt Quotation Tahap 1 :{' '}
                            <span className='fs-6 fw-semibold'>
                              {selectedQuotation?.quotation_receipt[2]?.receipt_quotation ?? '-'}
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
                          {selectedQuotation?.quotation_detail
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
                      {selectedQuotation?.quotation_detail
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
                          Harga NET dari Vendor
                        </td>
                        <td className='fw-bolder'>{`Rp. ${Number(
                          totalQuotation.grandTotalFromVendor
                        ).toLocaleString('id')}`}</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Harga dikurang Promo Survey
                        </td>
                        <td className=' fw-bolder'>{`- ${Number(
                          totalQuotation.promotionSurvey
                        ).toLocaleString('id')}`}</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Harga Yang di tawarkan ke customer
                        </td>

                        <td className=' fw-bolder'>{`${Number(
                          totalQuotation.grandTotalFromMitra
                        ).toLocaleString('id')}`}</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          {`Margin Mitra ${totalQuotation.mitraMargin} %`}
                        </td>

                        <td className=' fw-bolder'>
                          {`Rp. ${Number(totalQuotation.nominalMitraMargin).toLocaleString('id')}`}
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          {`Margin Vendor ${totalQuotation.vendorMargin} %`}
                        </td>

                        <td className=' fw-bolder'>
                          {`Rp. ${Number(totalQuotation.nominalVendorMargin).toLocaleString('id')}`}
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          <div className='d-flex justify-content-end align-items-center gap-3'>
                            <div className=''>Tipe Pengajuan Diskon</div>

                            <Select
                              name='discount-type'
                              className='p-0'
                              placeholder='Ketik/Pilih Diskon '
                              isSearchable={true}
                              options={discountType}
                              value={selectedDiscountType}
                              onChange={(newValue) => handleDiscountTypeChange(newValue)}
                            />
                          </div>
                        </td>

                        <td className=' fw-bolder'>
                          <Form.Control
                            name='input-discount'
                            id='discount'
                            type='number'
                            value={discountNominal}
                            onChange={(e) => setDiscountNominal(e.target.value)}
                            placeholder={
                              selectedDiscountType?.value === 1
                                ? 'Masukkan Persentase (%)'
                                : 'Masukkan Nominal (Rp)'
                            }
                          />
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Nominal Pengajuan Diskon
                        </td>

                        <td className=' fw-bolder'>{`Rp. ${Number(
                          totalQuotation.requestDiscount
                        ).toLocaleString('id')}`}</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Total Cust Transaksi
                        </td>

                        <td className=' fw-bolder'>{`Rp. ${Number(
                          totalQuotation.customerPay
                        ).toLocaleString('id')}`}</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Margin
                        </td>

                        <td className=' fw-bolder'>{`Rp. ${Number(
                          totalQuotation.margin
                        ).toLocaleString('id')}`}</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className='text-end fw-bolder'>
                          Margin Mitra setelah discount
                        </td>

                        <td className=' fw-bolder'>
                          {`${totalQuotation.marginMitraAfterDiscount} %`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Row>
            )}

            <Row className='upload-file d-flex align-items-start mt-5 mb-5'>
              <Form.Group>
                <Form.Label>Upload File</Form.Label>

                <Form className='form-input-image' onClick={handleInvoiceClick}>
                  <Form.Control
                    type='file'
                    accept='image/jpeg, image/png'
                    className='input-field-quotation'
                    multiple
                    hidden
                    id='file-input'
                    ref={evidenceRef}
                    onChange={handleChangeQuotationFile}
                  />

                  <div className='input-image-text'>
                    <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                    <p>Add File</p>
                  </div>
                </Form>

                <ListGroup className='pt-3'>
                  {quotationEvidence.length ? (
                    quotationEvidence.map((item: any, index: number) => (
                      <ListGroup key={`${item?.name}-${index}-${item?.type}`}>
                        <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                          <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                          <span
                            className='upload-content'
                            style={{cursor: 'pointer'}}
                            onClick={() => handleFileQuotation(index)}
                          >
                            {item?.name}
                          </span>

                          <FontAwesomeIcon
                            icon={faTrash}
                            size='sm'
                            color='#ed2b2a'
                            style={{cursor: 'pointer'}}
                            onClick={() => handleRemoveFiles(index)}
                          />
                        </ListGroup.Item>

                        {selectedQuotationIndex === index && item && (
                          <Image
                            key={`${previewQuotation} - ${index}`}
                            width={200}
                            style={{display: 'none'}}
                            src={
                              item instanceof File
                                ? URL.createObjectURL(item)
                                : `${apiUrl}/public/quotation-promotion/${previewQuotation}`
                            }
                            preview={{
                              visible: visibleInvoice,
                              src:
                                item instanceof File
                                ? URL.createObjectURL(item)
                                : `${apiUrl}/public/quotation-promotion/${previewQuotation}`,
                              onVisibleChange: (value) => {
                                setVisibleQuotation(value)
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

            <Button
              className='d-flex justify-content-center align-items-center w-100 mt-5'
              onClick={() => handleCreateRequest()}
              variant='primary'
            >
              {isLoading ? 'Submitting..' : 'Submit'}
            </Button>
          </Modal.Body>
        </>
      )}
    </Modal>
  )
}
