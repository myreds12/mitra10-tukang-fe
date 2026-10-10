import React from 'react'
import {Row, Col, Form, ListGroup, Modal} from 'react-bootstrap'
import {Skeleton, Image} from 'antd'
import {Orders} from '../../../interfaces/order'

interface DetailOrderEvidenceSectionProps {
  order: Orders
  apiUrl: string | undefined
  isLoadingPage: boolean
  previewImage: any
  setPreviewImage: (v: any) => void
  visible: boolean
  setVisible: (v: boolean) => void
  handleClose: () => void
  visibleQuotationReceipt: boolean
  setVisibleQuotationReceipt: (v: boolean) => void
  visibleQuotationFiles: boolean
  setVisibleQuotationFiles: (v: boolean) => void
  visibleWorkBefore: boolean
  setVisibleWorkBefore: (v: boolean) => void
  visibleWorkAfter: boolean
  setVisibleWorkAfter: (v: boolean) => void
}

export const DetailOrderEvidenceSection: React.FC<DetailOrderEvidenceSectionProps> = ({
  order,
  apiUrl,
  isLoadingPage,
  previewImage,
  setPreviewImage,
  visible,
  setVisible,
  handleClose,
  visibleQuotationReceipt,
  setVisibleQuotationReceipt,
  visibleQuotationFiles,
  setVisibleQuotationFiles,
  visibleWorkBefore,
  setVisibleWorkBefore,
  visibleWorkAfter,
  setVisibleWorkAfter,
}) => {
  return (
    <>
      {order?.order_files?.length >= 1 && (
        <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
              <Form.Label className='mt-3'>Bukti Receipt :</Form.Label>
              <ListGroup>
                {order?.order_files.map((item: any) => (
                  <ListGroup.Item
                    key={item.id}
                    action
                    style={{cursor: 'pointer'}}
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
                  {previewImage.endsWith('.pdf') ? (
                    <Modal
                      dialogClassName='modal-show-pdf'
                      centered
                      show={visible}
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
                          style={{border: 'none'}}
                        />
                      </Modal.Body>
                    </Modal>
                  ) : (
                    <Image
                      key={previewImage}
                      width={200}
                      style={{display: 'none'}}
                      src={`${apiUrl}/public/receipt/${previewImage}`}
                      preview={{
                        visible,
                        src: `${apiUrl}/public/receipt/${previewImage}`,
                        onVisibleChange: (value) => {
                          setVisible(value)
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
              {order?.quotation?.[0]?.quotation_files
                ?.filter((x: any) => x.type === 2)
                ?.map((item: any) => (
                  <ListGroup.Item
                    key={item.id}
                    action
                    style={{cursor: 'pointer'}}
                    onClick={() => {
                      setPreviewImage(item.path)
                      setVisibleQuotationReceipt(true)
                    }}
                  >
                    {item.path}
                  </ListGroup.Item>
                ))}
            </ListGroup>

            {order?.quotation?.[0]?.quotation_files?.length ? (
              <>
                {previewImage && (
                  <div>
                    <Image
                      key={previewImage}
                      width={200}
                      style={{display: 'none'}}
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
              {order?.quotation?.[0]?.quotation_files
                ?.filter((x: any) => x.type === 1 || x.type === 3)
                ?.map((item: any) => (
                  <ListGroup.Item
                    key={item.id}
                    action
                    style={{cursor: 'pointer'}}
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

            {order?.quotation?.[0]?.quotation_files?.length ? (
              <>
                {previewImage && (
                  <div>
                    <Image
                      key={previewImage}
                      width={200}
                      style={{display: 'none'}}
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
      )}

      <Skeleton active loading={isLoadingPage}>
        {order?.work_orders?.work_order_evidences?.length > 0 && (
          <Row>
            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Form.Label className='mt-3'>Work Before :</Form.Label>
              <ListGroup>
                {order?.work_orders?.work_order_evidences
                  ?.filter((x: any) => x.type === 2)
                  ?.map((item: any) => (
                    <ListGroup.Item
                      key={item.id}
                      action
                      style={{cursor: 'pointer'}}
                      onClick={() => {
                        setPreviewImage(item.evidence_location)
                        setVisibleWorkBefore(true)
                      }}
                    >
                      {item.evidence_location}
                    </ListGroup.Item>
                  ))}
              </ListGroup>

              {order?.work_orders?.work_order_evidences?.filter((x: any) => x.type === 2)
                ?.length ? (
                <>
                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{display: 'none'}}
                        src={`${apiUrl}/public/work-orders/${previewImage}`}
                        preview={{
                          visible: visibleWorkBefore,
                          src: `${apiUrl}/public/work-orders/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisibleWorkBefore(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className='d-flex justify-content-start align-items-center'>
                  <p className='fs-7 text-danger'>Foto belum diupload oleh Tukang</p>
                </div>
              )}
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Form.Label className='mt-3'>Work After :</Form.Label>
              <ListGroup>
                {order?.work_orders?.work_order_evidences
                  ?.filter((x: any) => x.type === 3)
                  ?.map((item: any) => (
                    <ListGroup.Item
                      key={item.id}
                      action
                      style={{cursor: 'pointer'}}
                      onClick={() => {
                        setPreviewImage(item.evidence_location)
                        setVisibleWorkAfter(true)
                      }}
                    >
                      {item.evidence_location}
                    </ListGroup.Item>
                  ))}
              </ListGroup>

              {order?.work_orders?.work_order_evidences?.filter((x: any) => x.type === 3)
                ?.length ? (
                <>
                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{display: 'none'}}
                        src={`${apiUrl}/public/work-orders/${previewImage}`}
                        preview={{
                          visible: visibleWorkAfter,
                          src: `${apiUrl}/public/work-orders/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisibleWorkAfter(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className='d-flex justify-content-start align-items-center'>
                  <p className='fs-7 text-danger'>Foto belum diupload oleh Tukang</p>
                </div>
              )}
            </Col>
          </Row>
        )}
      </Skeleton>
    </>
  )
}
