import React from 'react'
import {Row, Col, Form, ListGroup, Button} from 'react-bootstrap'
import {Image} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'

interface UpdateOrderCSReceiptUploadProps {
  apiUrl?: string
  receiptFiles: Array<any>
  evidenceRef: React.RefObject<any>
  handleImageClick: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveFile: (index: number) => void
  handleFileClick: (index: number) => void
  selectedFileIndex: number | null
  previewImage: any
  visible: boolean
  setVisible: (val: boolean) => void
  orderDetail: any
  handleReprintOrder: () => void
  handleUpdateOrder: () => void
  isLoading: boolean
}

export const UpdateOrderCSReceiptUpload: React.FC<UpdateOrderCSReceiptUploadProps> = ({
  apiUrl,
  receiptFiles,
  evidenceRef,
  handleImageClick,
  handleFileChange,
  handleRemoveFile,
  handleFileClick,
  selectedFileIndex,
  previewImage,
  visible,
  setVisible,
  orderDetail,
  handleReprintOrder,
  handleUpdateOrder,
  isLoading,
}) => {
  return (
    <>
      <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Group>
            <Form.Label>Upload Receipt</Form.Label>
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
              {receiptFiles.length ? (
                receiptFiles.map((item, index) => (
                  <ListGroup key={`${(item as any)?.name}-${index}`}>
                    <ListGroup.Item
                      className='d-flex justify-content-between align-items-center'
                      key={`${(item as any)?.name}-${index}-${(item as any)?.type}`}
                    >
                      <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                      <span
                        className='upload-content'
                        onClick={() => handleFileClick(index)}
                      >
                        {(item as any)?.name}
                      </span>

                      <FontAwesomeIcon
                        icon={faTrash}
                        size='sm'
                        color='#ed2b2a'
                        style={{cursor: 'pointer'}}
                        onClick={() => handleRemoveFile(index)}
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
                            : `${apiUrl}/public/receipt/${previewImage}`
                        }
                        preview={{
                          visible,
                          src:
                            item instanceof File
                              ? URL.createObjectURL(item)
                              : `${apiUrl}/public/receipt/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisible(value)
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
        </Col>

        <Col xs={12} md={12} lg={12} xl={4} xxl={4}></Col>
        <Col xs={12} md={12} lg={12} xl={4} xxl={4}></Col>
      </Row>

      <div className='button-submit d-flex justify-content-center align-items-center'>
        {orderDetail?.print_counter >= 1 &&
          ['PICKLIST', 'BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
            orderDetail?.status?.category ?? ''
          ) && (
            <div className='d-flex justify-content-center align-items-center'>
              <Button type='submit' onClick={handleReprintOrder} variant='warning'>
                Reprint Order
              </Button>
            </div>
          )}

        <Button
          type='submit'
          disabled={isLoading}
          onClick={handleUpdateOrder}
          variant='dark-primary'
        >
          {isLoading ? ' Submitting Order...' : 'Update Order & Print'}
        </Button>
      </div>
    </>
  )
}
