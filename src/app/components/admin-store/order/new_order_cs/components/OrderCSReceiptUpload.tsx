import React from 'react'
import {Row, Col, Form, ListGroup} from 'react-bootstrap'
import {Image} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'

interface OrderCSReceiptUploadProps {
  receiptFiles: Array<File | null>
  handleImageClick: () => void
  evidenceRef: React.RefObject<any>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFileClick: (index: number) => void
  handleRemoveFile: (index: number) => void
  selectedFileIndex: number | null
  previewImage: any
  visible: boolean
  setVisible: (v: boolean) => void
  apiUrl?: string
}

export const OrderCSReceiptUpload: React.FC<OrderCSReceiptUploadProps> = ({
  receiptFiles,
  handleImageClick,
  evidenceRef,
  handleFileChange,
  handleFileClick,
  handleRemoveFile,
  selectedFileIndex,
  previewImage,
  visible,
  setVisible,
  apiUrl,
}) => {
  return (
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
                <ListGroup key={`${item?.name}-${index}-${item?.type}`}>
                  <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                    <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                    <span className='upload-content' onClick={() => handleFileClick(index)}>
                      {item?.name}
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

      <Col xs={12} md={4} lg={4} xl={4} xxl={4} />
      <Col xs={12} md={4} lg={4} xl={4} xxl={4} />
    </Row>
  )
}
