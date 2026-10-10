import React from 'react'
import {Modal, Button, Row, Form, ListGroup} from 'react-bootstrap'
import {Image} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faImage, faFileImage, faTrash} from '@fortawesome/free-solid-svg-icons'

interface ViewInvoiceActionModalProps {
  showModalInvoice: boolean
  handleCloseModalInvoice: () => void
  modalType: number | null
  invoiceNotes: string
  setInvoiceNotes: (val: string) => void
  handleInvoiceClick: () => void
  evidenceRef: React.RefObject<any>
  handleInvoiceEvidenceChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  invoiceEvidence: Array<File | null>
  handleFileInvoice: (index: number) => void
  handleRemoveFiles: (index: number) => void
  selectedInvoiceIndex: number | null
  previewInvoice: any
  apiUrl?: string
  visibleInvoice: boolean
  setVisibleInvoice: (val: boolean) => void
  handleDeclineInvoice: (statusInvoice: number) => void
  handleUploadInvoiceFile: () => void
  isLoading: boolean
}

export const ViewInvoiceActionModal: React.FC<ViewInvoiceActionModalProps> = ({
  showModalInvoice,
  handleCloseModalInvoice,
  modalType,
  invoiceNotes,
  setInvoiceNotes,
  handleInvoiceClick,
  evidenceRef,
  handleInvoiceEvidenceChange,
  invoiceEvidence,
  handleFileInvoice,
  handleRemoveFiles,
  selectedInvoiceIndex,
  previewInvoice,
  apiUrl,
  visibleInvoice,
  setVisibleInvoice,
  handleDeclineInvoice,
  handleUploadInvoiceFile,
  isLoading,
}) => {
  return (
    <Modal
      dialogClassName='modal-upload-excel'
      centered
      show={showModalInvoice}
      onHide={handleCloseModalInvoice}
    >
      {modalType === 1 && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Formulir Alasan Penolakan Invoice</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className='notes mb-5'>
              <Form.Group>
                <Form.Label className='fs-5 fw-bold'>Alasan Ditolak :</Form.Label>
                <Form.Control
                  style={{minHeight: '140px'}}
                  as='textarea'
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  value={invoiceNotes}
                />
              </Form.Group>
            </Row>

            <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
              <Form.Group>
                <Form.Label>Upload File</Form.Label>

                <Form className='form-input-image' onClick={handleInvoiceClick}>
                  <Form.Control
                    type='file'
                    accept='image/jpeg, image/png'
                    className='input-field-invoice'
                    multiple
                    hidden
                    id='file-input'
                    ref={evidenceRef}
                    onChange={handleInvoiceEvidenceChange}
                  />

                  <div className='input-image-text'>
                    <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                    <p>Add File</p>
                  </div>
                </Form>

                <ListGroup className='pt-3'>
                  {invoiceEvidence.length ? (
                    invoiceEvidence.map((item: any, index: number) => (
                      <React.Fragment key={`${item?.name}-${index}-${item?.type}`}>
                        <ListGroup.Item
                          className='d-flex justify-content-between align-items-center'
                        >
                          <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                          <span
                            className='upload-content'
                            style={{cursor: 'pointer'}}
                            onClick={() => handleFileInvoice(index)}
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

                        {selectedInvoiceIndex === index && item && (
                          <Image
                            key={`${previewInvoice} - ${index}`}
                            width={200}
                            style={{display: 'none'}}
                            src={
                              item instanceof File
                                ? URL.createObjectURL(item)
                                : `${apiUrl}/public/invoices/${previewInvoice}`
                            }
                            preview={{
                              visible: visibleInvoice,
                              src:
                                item instanceof File
                                ? URL.createObjectURL(item)
                                : `${apiUrl}/public/invoices/${previewInvoice}`,
                              onVisibleChange: (value) => {
                                setVisibleInvoice(value)
                              },
                            }}
                          />
                        )}
                      </React.Fragment>
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
              onClick={() => handleDeclineInvoice(3)}
              variant='primary'
            >
              {isLoading ? 'Submitting..' : 'Submit'}
            </Button>
          </Modal.Body>
        </>
      )}

      {modalType === 2 && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Formulir Upload Tagihan Invoice</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
              <Form.Group>
                <Form.Label>Upload File</Form.Label>

                <Form className='form-input-image' onClick={handleInvoiceClick}>
                  <Form.Control
                    type='file'
                    accept='.jpg, .jpeg, .png, .pdf'
                    className='input-field-invoice'
                    multiple
                    hidden
                    id='file-input'
                    ref={evidenceRef}
                    onChange={handleInvoiceEvidenceChange}
                  />

                  <div className='input-image-text'>
                    <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                    <p>Add File</p>
                  </div>
                </Form>

                <ListGroup className='pt-3'>
                  {invoiceEvidence.length ? (
                    invoiceEvidence.map((item: any, index: number) => (
                      <React.Fragment key={`${item?.name}-${index}-${item?.type}`}>
                        <ListGroup.Item
                          className='d-flex justify-content-between align-items-center'
                        >
                          <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                          <span
                            className='upload-content'
                            style={{cursor: 'pointer'}}
                            onClick={() => handleFileInvoice(index)}
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

                        {selectedInvoiceIndex === index && item && (
                          <Image
                            key={`${previewInvoice} - ${index}`}
                            width={200}
                            style={{display: 'none'}}
                            src={
                              item instanceof File
                                ? URL.createObjectURL(item)
                                : `${apiUrl}/public/invoices/${previewInvoice}`
                            }
                            preview={{
                              visible: visibleInvoice,
                              src:
                                item instanceof File
                                ? URL.createObjectURL(item)
                                : `${apiUrl}/public/invoices/${previewInvoice}`,
                              onVisibleChange: (value) => {
                                setVisibleInvoice(value)
                              },
                            }}
                          />
                        )}
                      </React.Fragment>
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
              onClick={handleUploadInvoiceFile}
              variant='primary'
            >
              Submit
            </Button>
          </Modal.Body>
        </>
      )}

      {modalType === 3 && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Formulir Alasan Penolakan Dokumen Tagihan</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className='notes mb-5'>
              <Form.Group>
                <Form.Label className='fs-5 fw-bold'>Alasan Ditolak :</Form.Label>
                <Form.Control
                  style={{minHeight: '140px'}}
                  as='textarea'
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  value={invoiceNotes}
                />
              </Form.Group>
            </Row>

            <Button
              className='d-flex justify-content-center align-items-center w-100 mt-5'
              onClick={() => handleDeclineInvoice(7)}
              variant='primary'
            >
              Submit
            </Button>
          </Modal.Body>
        </>
      )}
    </Modal>
  )
}
