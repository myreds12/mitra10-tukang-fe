const fs = require('fs');
const path = require('path');

const viewOrderDir = path.join(__dirname, '..', 'src', 'app', 'components', 'admin-ho', 'order', 'view_order');
const viewOrderPath = path.join(viewOrderDir, 'ViewOrder.tsx');
const raw = fs.readFileSync(viewOrderPath, 'utf8');
const lines = raw.split(/\r?\n/);

// 1. types.ts
const typesContent = `export interface DataType {
  order_id: number
  store_id: number
  date_order: Date
  assign_from: string
  vendor_name: string
  no_member: number
  costumer_name: string
  phone_number: number
  payment_receipt: string
  payment_quotation: string
  order_status: string
  order_status_label: string
  work_order_status: string
  print_counter: number
}

export interface StoreItem {
  value: number | null
  label: string
}

export interface VendorItem {
  value: number | null
  label: string
}

export interface Order {
  id: number | null
  project_status_id: number | null
  store_id: number | null
  request_survey: string
  request_work: string
  notes: string
  order_details: Array<{
    id: number | null
    item_id: number | null
    item_code: string
    item_name: string
    quantity: number
    unit_price: string
    total: string
    item_notes: string
  }>
}

export interface CSI {
  value: number | null
  label: string
}

export interface Quotation {
  id: number | null
  order_id: number | null
  store_id: number | null
  quotation_status: number | null
  quotation_special: number
  description: string
  quotation_number: string
  quotation_date: string
  quotation_validity: string
  quotation_disc: number
  quotation_promotion: number | null
  quotation_grand_total: number
  readiness: number
  receipt_quotation: string
  receipts_quotation: Array<{
    id: number | null
    index: number
    receipt_quotation: string
    quotation_step: number
  }>
  quotation_details: Array<{
    id: number | null
    index: string
    item_id: number | null
    work_order_item_id: number | null
    category_id: number | null
    type: number
    item_name: string
    unit_price: number
    unit: string
    description: string
    total: number
    final_price: number
    margin: number
    margin_type: number
    quantity: number
    is_user: number
    work_step?: number
  }>
}
`;

fs.writeFileSync(path.join(viewOrderDir, 'types.ts'), typesContent);

// 2. useOrderColumns.tsx
// columns lines in current ViewOrder.tsx: find 'const renderTooltip' and 'const columns'
let colStart = -1;
let colEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const renderTooltip =')) colStart = i;
  if (lines[i].includes('filter(Boolean) as ColumnsType<DataType>')) {
    colEnd = i;
    break;
  }
}

console.log('Columns range:', colStart + 1, 'to', colEnd + 1);

const colLines = lines.slice(colStart, colEnd + 1);

const useOrderColumnsContent = `import React from 'react'
import {Tooltip, OverlayTrigger, Button} from 'react-bootstrap'
import {Tag} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faSearch,
  faPen,
  faCheckCircle,
  faEnvelope,
  faPrint,
} from '@fortawesome/free-solid-svg-icons'
import {DataType} from '../types'

export interface UseOrderColumnsProps {
  userRole: string
  statusFilters: any[]
  navigate: (to: string) => void
  orderData: DataType[]
  fetchOrderData: (order_id: number | null) => Promise<void>
  getVendor: (store_id?: number | null) => Promise<void>
  exportToPDF: (order_id: number, receipt_quotation: string, customer_name: string) => void
  setShowModal: (show: boolean) => void
  setModalType: (type: number) => void
  setActiveKey: (key: number) => void
  setSelectedCSI: (val: any) => void
}

export const useOrderColumns = ({
  userRole,
  statusFilters,
  navigate,
  orderData,
  fetchOrderData,
  getVendor,
  exportToPDF,
  setShowModal,
  setModalType,
  setActiveKey,
  setSelectedCSI,
}: UseOrderColumnsProps): ColumnsType<DataType> => {
${colLines.join('\n')}

  return columns
}
`;

fs.writeFileSync(path.join(viewOrderDir, 'components', 'useOrderColumns.tsx'), useOrderColumnsContent);
console.log('types.ts and useOrderColumns.tsx created successfully');
