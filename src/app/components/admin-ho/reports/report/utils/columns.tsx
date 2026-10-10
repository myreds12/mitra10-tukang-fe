import React from 'react'
import type {ColumnsType} from 'antd/es/table'
import {Tag} from 'antd'

export const getReportColumns = (endpoint: string): ColumnsType<any> => {
  switch (endpoint) {
    case 'orders':
      return [
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 110,
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
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
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Nama Costumer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'No. Telp/WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'left',
          width: 170,
          onFilter: (value, record) => record.phone_number.includes(String(value)),
          sorter: (a, b) => a.phone_number.length - b.phone_number.length,
        },
        {
          title: 'Nama Vendor',
          dataIndex: 'vendor_name',
          key: 'vendor_name',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.vendor_name.includes(String(value)),
          sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
        },
        {
          title: 'Grand Total',
          dataIndex: 'grand_total',
          key: 'grand_total',
          align: 'center',
          width: 135,
          sorter: (a, b) => a.grand_total - b.grand_total,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.status.includes(String(value)),
          sorter: (a, b) => a.status.length - b.status.length,
        },
      ]

    case 'complaints':
      return [
        {
          title: 'Complaint ID',
          dataIndex: 'complaint_id',
          key: 'complaint_id',
          align: 'center',
          width: 120,
          className: 'text-start',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.complaint_id - b.complaint_id,
        },
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 110,
          className: 'text-start',
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'assign_from',
          key: 'assign_from',
          align: 'center',
          width: 120,
          className: 'text-start',
          onFilter: (value, record) => record.assign_from.includes(String(value)),
          sorter: (a, b) => a.assign_from.length - b.assign_from.length,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'center',
          width: 120,
          className: 'text-start',
          onFilter: (value, record) => record.date_order.includes(String(value)),
          sorter: (a, b) => a.date_order.length - b.date_order.length,
        },
        {
          title: 'Nama Customer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          width: 150,
          className: 'text-start',
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'No. Telp/WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          width: 160,
          className: 'text-start',
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Status Order',
          dataIndex: 'order_status',
          key: 'order_status',
          render: (order_status) => {
            let color = 'blue'
            switch (order_status) {
              case 'UNPAID':
                color = 'red'
                break
              case 'PAID':
              case 'PICKLIST':
              case 'BOOKED':
              case 'SURVEYREQ':
              case 'SURVEYSTART':
              case 'SURVEYDONE':
              case 'RESURVEYREQ':
              case 'RESURVEYSTART':
              case 'RESURVEYDONE':
              case 'QUOTE IN':
              case 'QUOTE OUT':
              case 'WORKREQ':
              case 'WORKSTART':
              case 'WORKEND':
              case 'INVOICED':
              case 'CISOUT':
                color = 'green'
                break
              default:
                break
            }
            return <Tag color={color}>{order_status}</Tag>
          },
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
        {
          title: 'Status Work Order',
          dataIndex: 'work_status',
          key: 'work_status',
          render: (work_status) => {
            let color = 'blue'
            switch (work_status) {
              case 'UNPAID':
                color = 'red'
                break
              case 'PAID':
              case 'PICKLIST':
              case 'BOOKED':
              case 'SURVEYREQ':
              case 'SURVEYSTART':
              case 'SURVEYDONE':
              case 'RESURVEYREQ':
              case 'RESURVEYSTART':
              case 'RESURVEYDONE':
              case 'QUOTE IN':
              case 'QUOTE OUT':
              case 'WORKREQ':
              case 'WORKSTART':
              case 'WORKEND':
              case 'INVOICED':
              case 'CISOUT':
                color = 'green'
                break
              default:
                break
            }
            return <Tag color={color}>{work_status}</Tag>
          },
          onFilter: (value, record) => record.work_status.includes(String(value)),
          sorter: (a, b) => a.work_status.length - b.work_status.length,
        },
        {
          title: 'Nama Pemasangan',
          dataIndex: 'service_name',
          key: 'service_name',
          width: 140,
          className: 'text-start',
          onFilter: (value, record) => record.service_name.includes(String(value)),
          sorter: (a, b) => a.service_name.length - b.service_name.length,
        },
        {
          title: 'Tanggal Komplain',
          dataIndex: 'complaint_date',
          key: 'complaint_date',
          width: 120,
          className: 'text-start',
          sorter: (a, b) =>
            new Date(a.complaint_date).getTime() - new Date(b.complaint_date).getTime(),
        },
        {
          title: 'Umur Komplain',
          dataIndex: 'complaint_age',
          key: 'complaint_age',
          width: 120,
          className: 'text-start',
          sorter: (a, b) => a.complaint_age.length - b.complaint_age.length,
        },
        {
          title: 'Status Komplain',
          dataIndex: 'complaint_status',
          key: 'complaint_status',
          render: (complaint_status) => {
            let color = 'blue'
            switch (complaint_status) {
              case 'INVESTIGATED':
                color = 'red'
                break
              case 'ACCEPTED':
                color = 'green'
                break
              default:
                break
            }
            return <Tag color={color}>{complaint_status}</Tag>
          },
          filters: [
            {text: 'INVESTIGATED', value: 'INVESTIGATED'},
            {text: 'ACCEPTED', value: 'ACCEPTED'},
          ],
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
          width: 110,
          className: 'col_quotation_id',
          sorter: (a, b) => a.quotation_id - b.quotation_id,
        },
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 110,
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
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
          title: 'Nama Customer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'Nama Pemasangan',
          dataIndex: 'service_name',
          key: 'service_name',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.service_name.includes(String(value)),
          sorter: (a, b) => a.service_name.length - b.service_name.length,
        },
        {
          title: 'Nama Vendor',
          dataIndex: 'vendor_name',
          key: 'vendor_name',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.vendor_name.includes(String(value)),
          sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
        },
        {
          title: 'Payment Status',
          dataIndex: 'payment_status',
          key: 'payment_status',
          align: 'left',
          width: 140,
          render: (payment_status) => (
            <Tag color={payment_status === 'UNPAID' ? 'red' : 'green'}>{payment_status}</Tag>
          ),
          onFilter: (value, record) => record.payment_status.includes(String(value)),
          sorter: (a, b) => a.payment_status.length - b.payment_status.length,
        },
        {
          title: 'Order Status',
          dataIndex: 'order_status',
          key: 'order_status',
          align: 'left',
          width: 140,
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
          width: 100,
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Refund ID',
          dataIndex: 'refund_id',
          key: 'refund_id',
          align: 'center',
          width: 100,
          sorter: (a, b) => a.refund_id - b.refund_id,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'center',
          width: 110,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'center',
          width: 110,
          onFilter: (value, record) => record.date_order.includes(String(value)),
          sorter: (a, b) => a.date_order.length - b.date_order.length,
        },
        {
          title: 'Nama Vendor',
          dataIndex: 'vendor_name',
          key: 'vendor_name',
          align: 'left',
          width: 110,
          onFilter: (value, record) => record.vendor_name.includes(String(value)),
          sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
        },
        {
          title: 'Nama Costumer',
          dataIndex: 'member_name',
          key: 'member_name',
          align: 'left',
          width: 110,
          onFilter: (value, record) => record.member_name.includes(String(value)),
          sorter: (a, b) => a.member_name.length - b.member_name.length,
        },
        {
          title: 'No Telp / WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'center',
          width: 110,
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Voucher Customer',
          dataIndex: 'voucher',
          key: 'voucher',
          align: 'center',
          width: 110,
          onFilter: (value, record) => record.voucher.includes(String(value)),
          sorter: (a, b) => a.voucher.length - b.voucher.length,
        },
        {
          title: 'Penalti Vendor',
          dataIndex: 'penalty_vendor',
          key: 'penalty_vendor',
          align: 'center',
          width: 110,
          sorter: (a, b) => a.penalty_vendor - b.penalty_vendor,
        },
        {
          title: 'Status Penalti',
          dataIndex: 'paid_status',
          key: 'paid_status',
          align: 'center',
          width: 110,
          sorter: (a, b) => a.paid_status - b.paid_status,
        },
        {
          title: 'Nama Pemasangan',
          dataIndex: 'service_name',
          key: 'service_name',
          align: 'left',
          width: 110,
          onFilter: (value, record) => record.service_name.includes(String(value)),
          sorter: (a, b) => a.service_name.length - b.service_name.length,
        },
        {
          title: 'Order Status',
          dataIndex: 'order_status',
          key: 'order_status',
          align: 'left',
          width: 140,
          render: (order_status) => {
            let color = 'blue'
            switch (order_status) {
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
                break
            }
            return <Tag color={color}>{order_status}</Tag>
          },
          filters: [
            {text: 'BOOK', value: 'BOOK'},
            {text: 'BOOKED', value: 'BOOKED'},
          ],
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
      ]

    case 'reschedule':
      return [
        {
          title: 'Reschedule ID',
          dataIndex: 'reschedule_id',
          key: 'reschedule_id',
          align: 'center',
          width: 80,
          sorter: (a, b) => a.reschedule_id - b.reschedule_id,
        },
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 80,
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'center',
          width: 150,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'center',
          width: 110,
          onFilter: (value, record) => record.date_order.includes(String(value)),
          sorter: (a, b) => a.date_order.length - b.date_order.length,
        },
        {
          title: 'Nomor Member',
          dataIndex: 'member_id',
          key: 'member_id',
          align: 'center',
          width: 110,
          sorter: (a, b) => a.member_id - b.member_id,
        },
        {
          title: 'Nama Member',
          dataIndex: 'member_name',
          key: 'member_name',
          align: 'left',
          width: 110,
          onFilter: (value, record) => record.member_name.includes(String(value)),
          sorter: (a, b) => a.member_name.length - b.member_name.length,
        },
        {
          title: 'No Telp / WA',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'center',
          width: 110,
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Payment Status',
          dataIndex: 'payment_status',
          key: 'payment_status',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.payment_status.includes(String(value)),
          sorter: (a, b) => a.payment_status.length - b.payment_status.length,
        },
        {
          title: 'Order Status',
          dataIndex: 'order_status',
          key: 'order_status',
          align: 'left',
          width: 140,
          render: (order_status) => {
            let color = 'blue'
            switch (order_status) {
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
                break
            }
            return <Tag color={color}>{order_status}</Tag>
          },
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
      ]

    case 'sales-comission':
      return [
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 110,
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
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
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'left',
          width: 110,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Nama Konsumen',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          width: 110,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'Jenis Insentif',
          dataIndex: 'incentive_name',
          key: 'incentive_name',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.incentive_name.includes(String(value)),
          sorter: (a, b) => a.incentive_name.length - b.incentive_name.length,
        },
        {
          title: 'Nama Sales',
          dataIndex: 'sales_name',
          key: 'sales_name',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.sales_name.includes(String(value)),
          sorter: (a, b) => a.sales_name.length - b.sales_name.length,
        },
        {
          title: 'Nama Akun Bank',
          dataIndex: 'account_name',
          key: 'account_name',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.account_name.includes(String(value)),
          sorter: (a, b) => a.account_name.length - b.account_name.length,
        },
        {
          title: 'Nomor Akun Bank',
          dataIndex: 'account_number',
          key: 'account_number',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.account_number.includes(String(value)),
          sorter: (a, b) => a.account_number.length - b.account_number.length,
        },
        {
          title: 'Komisi Sales',
          dataIndex: 'sales_comission',
          key: 'sales_comission',
          align: 'center',
          width: 135,
          sorter: (a, b) => a.sales_comission - b.sales_comission,
        },
      ]

    case 'invoices':
      return [
        {
          title: 'Invoice ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 110,
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Nama Vendor',
          dataIndex: 'vendor_name',
          key: 'vendor_name',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.vendor_name.includes(String(value)),
          sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
        },
        {
          title: 'Grand Total',
          dataIndex: 'grand_total',
          key: 'grand_total',
          align: 'center',
          width: 135,
          sorter: (a, b) => a.grand_total - b.grand_total,
        },
        {
          title: 'Invoice Dibuat',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'left',
          width: 110,
          sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
        },
      ]

    default:
      return [
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 110,
          className: 'col_order_id',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.order_id - b.order_id,
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
          title: 'Nama Costumer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'No Telepon',
          dataIndex: 'phone_number',
          key: 'phone_number',
          align: 'left',
          width: 130,
          sorter: (a, b) => a.phone_number - b.phone_number,
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          align: 'left',
          width: 170,
          onFilter: (value, record) => record.email.includes(String(value)),
          sorter: (a, b) => a.email.length - b.email.length,
        },
        {
          title: 'Alamat',
          dataIndex: 'address',
          key: 'address',
          align: 'left',
          width: 150,
          onFilter: (value, record) => record.address.includes(String(value)),
          sorter: (a, b) => a.address.length - b.address.length,
        },
        {
          title: 'Grand Total',
          dataIndex: 'grand_total',
          key: 'grand_total',
          align: 'center',
          width: 135,
          sorter: (a, b) => a.grand_total - b.grand_total,
        },
      ]
  }
}
