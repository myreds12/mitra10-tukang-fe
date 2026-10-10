import React from 'react'
import {Modal, Button} from 'react-bootstrap'
import {Upload} from 'antd'
import {InboxOutlined} from '@ant-design/icons'

const {Dragger} = Upload

interface DetailOrderUploadReceiptModalProps {
  showModal: boolean
  handleCloseModal: () => void
  handleFileChange: (e: any) => void
  handleFileRemove: (files: any) => void
  handleSubmitReceipt: () => void
  loadingUploadReceipt: boolean
  receiptQuotation: Array<File | null>
}

export const DetailOrderUploadReceiptModal: React.FC<DetailOrderUploadReceiptModalProps> = ({
  showModal,
  handleCloseModal,
  handleFileChange,
  handleFileRemove,
  handleSubmitReceipt,
  loadingUploadReceipt,
  receiptQuotation,
}) => {
  return (
    <Modal
      dialogClassName='modal-upload-receipt'
      centered
      show={showModal}
      onHide={handleCloseModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>Upload Bukti Pembayaran Quotation</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Dragger
          className='input-excel'
          accept='image/*'
          multiple={true}
          beforeUpload={() => false}
          onChange={(e) => handleFileChange(e)}
          onDrop={(e) => handleFileRemove(e.dataTransfer.files)}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined style={{fontSize: 32}} />
          </p>

          <p className='ant-upload-text'>Klik atau seret file ke area ini untuk mengunggah</p>
        </Dragger>

        <Button
          className='d-flex justify-content-center align-items-center w-100 mt-5'
          disabled={receiptQuotation === null}
          onClick={handleSubmitReceipt}
          variant='primary'
        >
          {loadingUploadReceipt ? 'Uploading..' : 'Upload Bukti'}
        </Button>
      </Modal.Body>
    </Modal>
  )
}
