import React from 'react'
import {Modal, Button} from 'react-bootstrap'
import {Upload} from 'antd'
import {InboxOutlined} from '@ant-design/icons'

const {Dragger} = Upload

interface ReportHOUploadModalProps {
  showModal: boolean
  onClose: () => void
  excel: File | null
  loadingUploadExcel: boolean
  onFileChange: (e: any) => void
  onFileRemove: () => void
  onUpload: () => void
}

export const ReportHOUploadModal: React.FC<ReportHOUploadModalProps> = ({
  showModal,
  onClose,
  excel,
  loadingUploadExcel,
  onFileChange,
  onFileRemove,
  onUpload,
}) => {
  return (
    <Modal
      dialogClassName='modal-upload-excel'
      centered
      show={showModal}
      onHide={onClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Upload Insentif Sales yang sudah dibayar</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Dragger
          className='input-excel'
          accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
          multiple={false}
          maxCount={1}
          beforeUpload={() => false}
          onChange={onFileChange}
          onRemove={onFileRemove}
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
          onClick={onUpload}
          variant='primary'
        >
          {loadingUploadExcel ? 'Uploading..' : 'Upload Excel'}
        </Button>
      </Modal.Body>
    </Modal>
  )
}
