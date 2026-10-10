const fs = require('fs');
const path = require('path');

const viewOrderDir = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order');
const viewOrderPath = path.join(viewOrderDir, 'ViewOrder.tsx');
const raw = fs.readFileSync(viewOrderPath, 'utf8');
const lines = raw.split(/\r?\n/);

// lines 550 to 670: upload handlers
const fileHandlers = lines.slice(550, 671).join('\n');

// lines 1064 to 1243: QuotationValidation & handleUpdateQuotation
const updateHandlers = lines.slice(1064, 1244).join('\n');

const hookContent = `import React, {useState, useRef, useEffect} from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import {Quotation, Order} from '../types'

export interface UseQuotationHandlersProps {
  quotation: Quotation
  setQuotation: React.Dispatch<React.SetStateAction<Quotation>>
  orderForm: Order
  receiptQuotation: any[]
  setReceiptQuotation: React.Dispatch<React.SetStateAction<any[]>>
  quotationFiles: any[]
  setQuotationFiles: React.Dispatch<React.SetStateAction<any[]>>
  evidenceRef: React.RefObject<HTMLInputElement>
  statusData: any[]
  apiUrl?: string
  handleUpdateRequestSurvey?: () => Promise<any>
}

export const useQuotationHandlers = ({
  quotation,
  setQuotation,
  orderForm,
  receiptQuotation,
  setReceiptQuotation,
  quotationFiles,
  setQuotationFiles,
  evidenceRef,
  statusData,
  apiUrl = process.env.REACT_APP_API_URL,
  handleUpdateRequestSurvey,
}: UseQuotationHandlersProps) => {
  const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false)
  const verificationStatus = statusData.find((status: any) => status.category === 'QUOTATIONPAID')

${fileHandlers}

${updateHandlers}

  return {
    singleReceipt,
    notes,
    receiptRefs,
    focusedIndex,
    setFocusedIndex,
    loadingUpdate,
    setLoadingUpdate,
    handleMultiReceiptChange,
    handleReceiptChange,
    handleFileChange,
    handleReceiptClick,
    handleImageClick,
    handleRemoveReceipt,
    handleRemoveFile,
    handleFileReceipt,
    handleFileClick,
    QuotationValidation,
    handleUpdateQuotation,
  }
}
`;

fs.writeFileSync(path.join(viewOrderDir, 'hooks', 'useQuotationHandlers.ts'), hookContent);
console.log('useQuotationHandlers.ts created successfully');
