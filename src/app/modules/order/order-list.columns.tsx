import React from 'react'
import {Tag} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import OrderListActions from './OrderListActions'
import {OrderListRow} from './order-list.mapper'

interface OrderListColumnsOptions {
  userRole: string
  statusFilters: Array<{text: string; value: string | number}>
  selectedOrderStatus: string[]
  selectedPaymentReceiptStatus: string[]
  selectedPaymentQuotationStatus: string[]
  onPrintout: (orderId: number, status?: string) => void
  onCancel: (orderId: number) => void
  onDetail: (orderId: number) => void
  onUpdate: (orderId: number) => void
  onEmail: (orderId: number) => void
  onVerify: (orderId: number) => void
  onExportPdf: (orderId: number, paymentQuotation: string, customerName: string) => void
}

export const createOrderListColumns = ({
  userRole,
  statusFilters,
  selectedOrderStatus,
  selectedPaymentReceiptStatus,
  selectedPaymentQuotationStatus,
  onPrintout,
  onCancel,
  onDetail,
  onUpdate,
  onEmail,
  onVerify,
  onExportPdf,
}: OrderListColumnsOptions): ColumnsType<OrderListRow> => {
  const columns: ColumnsType<OrderListRow> = [
  {
    title: 'Order ID',
    dataIndex: 'order_id',
    key: 'order_id',
    align: 'center',
    className: 'col_order_id',
    defaultSortOrder: 'descend',
    width: 100,
    sorter: (a: OrderListRow, b: OrderListRow) => a.order_id - b.order_id,
  },
  {
    title: 'Tanggal Order',
    dataIndex: 'date_order',
    key: 'date_order',
    align: 'left',
    sorter: (a: OrderListRow, b: OrderListRow) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
  },
  !['Store Staff', 'Store CS'].includes(userRole) && {
    title: 'Nama Toko',
    dataIndex: 'assign_from',
    key: 'assign_from',
    align: 'left',
    className: 'col_order_id',
    width: 120,
    onFilter: (value: string | number | boolean, record: OrderListRow) => record.assign_from.includes(String(value)),
    sorter: (a: OrderListRow, b: OrderListRow) => a.assign_from.length - b.assign_from.length,
  },
  {
    title: 'Nama Vendor',
    dataIndex: 'vendor_name',
    key: 'vendor_name',
    align: 'center',
    className: 'col_order_id',
    onFilter: (value: string | number | boolean, record: OrderListRow) => record.vendor_name.includes(String(value)),
    sorter: (a: OrderListRow, b: OrderListRow) => a.vendor_name.length - b.vendor_name.length,
  },
  {
    title: 'Nama Customer',
    dataIndex: 'costumer_name',
    key: 'costumer_name',
    align: 'left',
    width: 140,
    onFilter: (value: string | number | boolean, record: OrderListRow) => record.costumer_name.includes(String(value)),
    sorter: (a: OrderListRow, b: OrderListRow) => a.costumer_name.length - b.costumer_name.length,
  },
  {
    title: 'No. Telp / WA',
    dataIndex: 'phone_number',
    key: 'phone_number',
    align: 'left',
    width: 120,
    sorter: (a: OrderListRow, b: OrderListRow) => a.phone_number.localeCompare(b.phone_number),
  },
  {
    title: 'Status Pembayaran Receipt',
    dataIndex: 'payment_receipt',
    key: 'payment_receipt',
    align: 'left',
    width: 200,
    filters: [{text: 'UNPAID', value: '0'}, {text: 'PAID', value: '1'}],
    filterMultiple: true,
    filteredValue: selectedPaymentReceiptStatus.length ? selectedPaymentReceiptStatus : null,
    sorter: (a: OrderListRow, b: OrderListRow) => a.payment_receipt.length - b.payment_receipt.length,
  },
  {
    title: 'Status Order',
    dataIndex: 'order_status_label',
    key: 'order_status_label',
    align: 'left',
    filters: statusFilters,
    filterMultiple: true,
    filteredValue: selectedOrderStatus.length ? selectedOrderStatus : null,
    sorter: (a: OrderListRow, b: OrderListRow) => a.order_status_label.length - b.order_status_label.length,
    render: (status: string) => <Tag color={status === 'UNPAID' ? 'red' : status === 'PAID' ? 'green' : 'blue'}>{status}</Tag>,
  },
  {
    title: 'Status Pembayaran Quotation',
    dataIndex: 'payment_quotation',
    key: 'payment_quotation',
    align: 'left',
    width: 230,
    filters: [{text: 'UNPAID', value: '0'}, {text: 'PAID', value: '1'}],
    filteredValue: selectedPaymentQuotationStatus.length ? selectedPaymentQuotationStatus : null,
    sorter: (a: OrderListRow, b: OrderListRow) => a.payment_quotation.length - b.payment_quotation.length,
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    fixed: 'right',
    render: (record: OrderListRow) => (
      <OrderListActions
        record={record}
        userRole={userRole}
        onPrintout={onPrintout}
        onCancel={onCancel}
        onDetail={onDetail}
        onUpdate={onUpdate}
        onEmail={onEmail}
        onVerify={onVerify}
        onExportPdf={onExportPdf}
      />
    ),
  },
  ].filter(Boolean) as ColumnsType<OrderListRow>

  return columns
}
