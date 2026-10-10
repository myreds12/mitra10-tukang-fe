const fs = require('fs');
const path = require('path');

const viewOrderPath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'ViewOrder.tsx');
const raw = fs.readFileSync(viewOrderPath, 'utf8');
const lines = raw.split(/\r?\n/);

// QuotationModal lines: 1973 to 2735 (0-indexed)
const qLines = lines.slice(1973, 2736);

const componentContent = `import React, {FC} from 'react'
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
  handleUpdateQuotation: () => Promise<void>
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
}) => {
${qLines.slice(16, -1).join('\n')}
}
`;

const targetPath = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order', 'components', 'QuotationModal.tsx');
fs.writeFileSync(targetPath, componentContent);

console.log('QuotationModal created successfully');
