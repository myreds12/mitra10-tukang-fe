import React from 'react'
import {Tag} from 'antd'
import type {ColumnsType} from 'antd/es/table'

export const getReportVendorColumns = (endpoint: string): ColumnsType<any> => {
  switch (endpoint) {
    case 'orders':
      return [
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          className: 'col_order_id',
          width: 90,
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Invoice ID',
          dataIndex: 'invoice_id',
          key: 'invoice_id',
          align: 'center',
          className: 'col_order_id',
          width: 90,
          sorter: (a, b) => a.invoice_id - b.invoice_id,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'left',
          width: 110,
          sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
        },
        {
          title: 'Tanggal Invoice Dibuat',
          dataIndex: 'date_invoice',
          key: 'date_invoice',
          align: 'left',
          width: 120,
          sorter: (a, b) => new Date(a.date_invoice).getTime() - new Date(b.date_invoice).getTime(),
        },
        {
          title: 'Nama Costumer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'Nama Pemasangan',
          dataIndex: 'service_name',
          key: 'service_name',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.service_name.includes(String(value)),
          sorter: (a, b) => a.service_name.length - b.service_name.length,
        },
        {
          title: 'No. Telp/WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.phone_number.includes(String(value)),
          sorter: (a, b) => a.phone_number.length - b.phone_number.length,
        },
        {
          title: 'Grand Total',
          dataIndex: 'grand_total',
          key: 'grand_total',
          align: 'center',
          width: 120,
          sorter: (a, b) => a.grand_total - b.grand_total,
        },
        {
          title: 'Status Order',
          dataIndex: 'order_status',
          key: 'order_status',
          width: 120,
          render: (order_status) => {
            const orderStatus = order_status
            return <Tag color='blue'>{orderStatus}</Tag>
          },
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
          className: 'text-start',
        },
      ]

    case 'complaints':
      return [
        {
          title: 'Complaint ID',
          dataIndex: 'complaint_id',
          key: 'complaint_id',
          align: 'center',
          className: 'text-start',
          width: 90,
          sorter: (a, b) => a.complaint_id - b.complaint_id,
        },
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          className: 'text-start',
          width: 90,
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'center',
          className: 'text-start',
          width: 120,
          onFilter: (value, record) => record.date_order.includes(String(value)),
          sorter: (a, b) => a.date_order.length - b.date_order.length,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'assign_from',
          key: 'assign_from',
          align: 'center',
          className: 'text-start',
          width: 120,
          onFilter: (value, record) => record.assign_from.includes(String(value)),
          sorter: (a, b) => a.assign_from.length - b.assign_from.length,
        },
        {
          title: 'Nama Customer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          className: 'text-start',
          width: 120,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'No. Telp/WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          className: 'text-start',
          width: 120,
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Status Order',
          dataIndex: 'order_status',
          key: 'order_status',
          width: 120,
          render: (order_status) => {
            const orderStatus = order_status
            return <Tag color='blue'>{orderStatus}</Tag>
          },
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
          className: 'text-start',
        },
        {
          title: 'Work Status',
          dataIndex: 'work_status',
          key: 'work_status',
          width: 120,
          className: 'col-complaint-date text-start',
          onFilter: (value, record) => record.work_status.includes(String(value)),
          sorter: (a, b) => a.work_status.length - b.work_status.length,
          render: (complaint_status) => {
            const complaintStatus = complaint_status
            let color = ''

            switch (complaintStatus) {
              case 'INVESTIGATED':
                color = 'volcano'
                break
              case 'ACCEPTED':
                color = 'green'
                break
              default:
                color = 'blue'
                break
            }

            return <Tag color={color}>{complaintStatus}</Tag>
          },
        },
        {
          title: 'Tanggal Komplain',
          dataIndex: 'complaint_date',
          key: 'complaint_date',
          className: 'col-complaint-date text-start',
          width: 120,
          onFilter: (value, record) => record.complaint_date.includes(String(value)),
          sorter: (a, b) => a.complaint_date.length - b.complaint_date.length,
        },
        {
          title: 'Umur Komplain',
          dataIndex: 'complaint_age',
          key: 'complaint_age',
          className: 'col-complaint-date text-start',
          width: 120,
          onFilter: (value, record) => record.complaint_age.includes(String(value)),
          sorter: (a, b) => a.complaint_age.length - b.complaint_age.length,
        },
        {
          title: 'Status Komplain',
          dataIndex: 'complaint_status',
          key: 'complaint_status',
          width: 120,
          className: 'col-complaint-status text-start',
          render: (complaint_status) => {
            const complaintStatus = complaint_status
            let color = ''

            switch (complaintStatus) {
              case 'INVESTIGATED':
                color = 'volcano'
                break
              case 'ACCEPTED':
                color = 'green'
                break
              default:
                color = 'blue'
                break
            }

            return <Tag color={color}>{complaintStatus}</Tag>
          },
          onFilter: (value, record) => record.complaint_status.includes(String(value)),
          sorter: (a, b) => a.complaint_status.length - b.complaint_status.length,
        },
      ]

    case 'quotation':
      return [
        {
          title: 'Quotation ID',
          dataIndex: 'quotation_id',
          key: 'quotation_id',
          align: 'center',
          width: 90,
          sorter: (a, b) => a.quotation_id - b.quotation_id,
        },
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          className: 'col_order_id',
          width: 90,
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.date_order.includes(String(value)),
          sorter: (a, b) => a.date_order.length - b.date_order.length,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Nama Customer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'Nama Pemasangan',
          dataIndex: 'service_name',
          key: 'service_name',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.service_name.includes(String(value)),
          sorter: (a, b) => a.service_name.length - b.service_name.length,
        },
        {
          title: 'Grand Total Quotation',
          dataIndex: 'grand_total_quotation',
          key: 'grand_total_quotation',
          align: 'left',
          width: 120,
          sorter: (a, b) => a.grand_total_quotation - b.grand_total_quotation,
        },
        {
          title: 'Payment Status',
          dataIndex: 'payment_status',
          key: 'payment_status',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.payment_status.includes(String(value)),
          sorter: (a, b) => a.payment_status.length - b.payment_status.length,
        },
        {
          title: 'Status Order',
          dataIndex: 'order_status',
          key: 'order_status',
          width: 120,
          className: 'text-start',
          render: (order_status) => {
            const orderStatus = order_status
            return <Tag color='blue'>{orderStatus}</Tag>
          },
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
      ]

    case 'refund':
      return [
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          width: 90,
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.date_order.includes(String(value)),
          sorter: (a, b) => a.date_order.length - b.date_order.length,
        },
        {
          title: 'Refund ID',
          dataIndex: 'refund_id',
          key: 'refund_id',
          align: 'center',
          width: 90,
          sorter: (a, b) => a.refund_id - b.refund_id,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Nama Costumer',
          dataIndex: 'member_name',
          key: 'member_name',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.member_name.includes(String(value)),
          sorter: (a, b) => a.member_name.length - b.member_name.length,
        },
        {
          title: 'No Telp / WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'center',
          width: 120,
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Voucher Customer',
          dataIndex: 'voucher',
          key: 'voucher',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.voucher.includes(String(value)),
          sorter: (a, b) => a.voucher.length - b.voucher.length,
        },
        {
          title: 'Penalti Vendor',
          dataIndex: 'penalty_vendor',
          key: 'penalty_vendor',
          align: 'center',
          width: 120,
          sorter: (a, b) => a.penalty_vendor - b.penalty_vendor,
        },
        {
          title: 'Status Pembayaran Pinalti',
          dataIndex: 'payment_status_penalty',
          key: 'payment_status_penalty',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.payment_status_penalty.includes(String(value)),
          sorter: (a, b) => a.payment_status_penalty.length - b.payment_status_penalty.length,
        },
        {
          title: 'Order Status',
          dataIndex: 'order_status',
          key: 'order_status',
          width: 120,
          align: 'left',
          render: (order_status) => {
            const orderStatus = order_status
            let color = ''

            switch (orderStatus) {
              case 'BOOK':
                color = 'green'
                break
              case 'BOOKED':
                color = 'lime'
                break
              case 'SURVEYREQ':
                color = 'blue'
                break
              case 'SURVEYSTART':
              case 'SURVEYDONE':
              case 'QUOTE IN':
              case 'QUOTE OUT':
              case 'WORKREQ':
              case 'WORKSTART':
              case 'WORKEND':
              case 'CISOUT':
                color = 'green'
                break
              default:
                color = 'blue'
                break
            }

            return <Tag color={color}>{orderStatus}</Tag>
          },
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
      ]

    case 'reschedule':
      return [
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          className: 'col_order_id',
          width: 90,
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Reschedule ID',
          dataIndex: 'refund_id',
          key: 'refund_id',
          align: 'center',
          width: 100,
          sorter: (a, b) => a.refund_id - b.refund_id,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.date_order.includes(String(value)),
          sorter: (a, b) => a.date_order.length - b.date_order.length,
        },
        {
          title: 'Tanggal Konfirmasi Awal Vendor',
          dataIndex: 'reschedule_date',
          key: 'reschedule_date',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.work_date.includes(String(value)),
          sorter: (a, b) => a.work_date.length - b.work_date.length,
        },
        {
          title: 'Tanggal Pengajuan Reschedule',
          dataIndex: 'reschedule_date',
          key: 'reschedule_date',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.reschedule_date.includes(String(value)),
          sorter: (a, b) => a.reschedule_date.length - b.reschedule_date.length,
        },
        {
          title: 'Tanggal Konfirmasi Vendor',
          dataIndex: 'confirm_date',
          key: 'confirm_date',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.confirm_date.includes(String(value)),
          sorter: (a, b) => a.confirm_date.length - b.confirm_date.length,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'center',
          width: 120,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Nama Member',
          dataIndex: 'member_name',
          key: 'member_name',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.member_name.includes(String(value)),
          sorter: (a, b) => a.member_name.length - b.member_name.length,
        },
        {
          title: 'No Telp / WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'center',
          width: 120,
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Status Order',
          dataIndex: 'order_status',
          key: 'order_status',
          width: 120,
          align: 'left',
          render: (order_status) => {
            const orderStatus = order_status
            let color = ''

            switch (orderStatus) {
              case 'BOOK':
                color = 'green'
                break
              case 'BOOKED':
                color = 'lime'
                break
              case 'SURVEYREQ':
                color = 'blue'
                break
              case 'SURVEYSTART':
              case 'SURVEYDONE':
              case 'QUOTE IN':
              case 'QUOTE OUT':
              case 'WORKREQ':
              case 'WORKSTART':
              case 'WORKEND':
              case 'CISOUT':
                color = 'green'
                break
              default:
                color = 'blue'
                break
            }

            return <Tag color={color}>{orderStatus}</Tag>
          },
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
      ]

    case 'invoices':
      return [
        {
          title: 'Invoice ID',
          dataIndex: 'invoice_id',
          key: 'invoice_id',
          align: 'center',
          className: 'col_order_id',
          width: 110,
          sorter: (a, b) => a.invoice_id - b.invoice_id,
        },
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          className: 'col_order_id',
          width: 110,
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Invoice Dibuat',
          dataIndex: 'invoice_date',
          key: 'invoice_date',
          align: 'left',
          width: 120,
          sorter: (a, b) => new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime(),
        },
        {
          title: 'Status Invoice',
          dataIndex: 'invoice_status',
          key: 'invoice_status',
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.invoice_status.includes(String(value)),
          sorter: (a, b) => a.invoice_status.length - b.invoice_status.length,
        },
        {
          title: 'Grand Total',
          dataIndex: 'grand_total',
          key: 'grand_total',
          align: 'center',
          width: 120,
          sorter: (a, b) => a.grand_total - b.grand_total,
        },
      ]

    default:
      return [
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'left',
          sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
        },
        {
          title: 'Nama Costumer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'No Telepon',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'left',
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          align: 'left',
          onFilter: (value, record) => record.email.includes(String(value)),
          sorter: (a, b) => a.email.length - b.email.length,
        },
        {
          title: 'Alamat',
          dataIndex: 'address',
          key: 'address',
          align: 'left',
          onFilter: (value, record) => record.address.includes(String(value)),
          sorter: (a, b) => a.address.length - b.address.length,
        },
        {
          title: 'Grand Total',
          dataIndex: 'grand_total',
          key: 'grand_total',
          align: 'center',
          sorter: (a, b) => a.grand_total - b.grand_total,
        },
      ]
  }
}
