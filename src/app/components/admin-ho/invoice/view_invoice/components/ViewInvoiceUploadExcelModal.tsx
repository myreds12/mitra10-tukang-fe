import React from 'react'
import {Modal, Button} from 'react-bootstrap'
import {Upload} from 'antd'
import {InboxOutlined} from '@ant-design/icons'

const {Dragger} = Upload

interface ViewInvoiceUploadExcelModalProps {
  showModalUpload: boolean
  handleCloseModalUpload: () => void
  handleFileChange: (event: any) => void
  handleFileRemove: () => void
  excel: File | null
  handleUpload: () => void
  loadingUploadExcel: boolean
}

export const ViewInvoiceUploadExcelModal: React.FC<ViewInvoiceUploadExcelModalProps> = ({
  showModalUpload,
  handleCloseModalUpload,
  handleFileChange,
  handleFileRemove,
  excel,
  handleUpload,
  loadingUploadExcel,
}) => {
  return (
    <Modal
      dialogClassName='modal-upload-excel'
      centered
      show={showModalUpload}
      onHide={handleCloseModalUpload}
    >
      <Modal.Header closeButton>
        <Modal.Title>Import Excel Invoice</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Dragger
          className='input-excel'
          accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
          multiple={false}
          maxCount={1}
          beforeUpload={() => false}
          onChange={handleFileChange}
          onRemove={handleFileRemove}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined style={{fontSize: 32}} />
          </p>

          <p className='ant-upload-text'>Klik atau seret file ke area ini untuk mengunggah</p>
          <p className='ant-upload-hint text-danger'>Maksimal upload file excel adalah satu</p>
        </Dragger>

        <Button
          className='d-flex justify-content-center align-items-center w-100 mt-5'
          disabled={excel === null}
          onClick={handleUpload}
          variant='primary'
        >
          {loadingUploadExcel ? 'Uploading..' : 'Upload Excel'}
        </Button>
      </Modal.Body>
    </Modal>
  )
}
