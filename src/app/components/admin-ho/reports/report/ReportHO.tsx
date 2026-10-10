import React, {useState, useEffect} from 'react'

import './ReportHO.css'

import {
  formatDate,
  formatDateWithTime,
  formatDateWithTimeZone,
} from '../../../../../_metronic/helpers'

import axios from 'axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import Select from 'react-select'
import type {ColumnsType} from 'antd/es/table'
import {InboxOutlined, LoadingOutlined} from '@ant-design/icons'
import {Table, Tag, PaginationProps, Spin, Pagination, DatePicker, Image, Upload} from 'antd'
import {Card, Row, Col, Button, Modal} from 'react-bootstrap'

const {RangePicker} = DatePicker
const {Dragger} = Upload

type Props = {
  endpoint: string
  statusName: string
  headerColor: string
  title: string
  params: string
}

interface Status {
  value: number
  category: string
}

interface StoreItem {
  value: number | null
  label: string
  area_id: number | null
}

interface AreaItem {
  value: number | null
  label: string
}

const ReportHO: React.FC<Props> = ({endpoint, statusName, headerColor, title, params}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status: any) => status.category === statusName)
  const statuses = desiredStatus.map((x) => x.value)

  const [reportData, setReportData] = useState<any[]>([])
  const [reportGrandTotal, setReportGrandTotal] = useState<any>()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [totalOrder, setTotalOrder] = useState<number>(0)

  const [loadData, setLoadData] = useState<boolean>(true)
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadingExport, setLoadingExport] = useState<boolean>(false)
  const [loadingTemplate, setLoadingTemplate] = useState<boolean>(false)
  const [loadingUploadExcel, setLoadingUploadExcel] = useState<boolean>(false)

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])

  // Store
  const [store, setStore] = useState<StoreItem[]>([])
  const storeOptions = [{value: null, label: 'All Store', area_id: null}, ...store]
  const [selectedStore, setSelectedStore] = useState<any>({
    value: null,
    label: 'All Store',
    area_id: null,
  })

  // Area
  const [area, setArea] = useState<AreaItem[]>([])
  const javaAreas = area.filter(
    (item) =>
      item.label === 'Jawa Barat' || item.label === 'Jawa Timur' || item.label === 'Jawa Tengah'
  )
  const javaAreaIds = javaAreas.map((item) => item.value).join(',')

  // Zone
  const [selectedZone, setSelectedZone] = useState<any>({
    value: null,
    label: 'All Zona',
    provice_id: null,
  })
  const zoneOptions = [{value: null, label: 'All Zona'}, ...area]

  const store_id =
    selectedStore.value && selectedZone.value
      ? `${selectedStore.value}`
      : !selectedStore.value && selectedZone.value
      ? `${store.map((item) => item.value).join(',')}`
      : null

  let columns: ColumnsType<any> = []

  switch (endpoint) {
    case 'orders':
      columns = [
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
      break

    case 'complaints':
      columns = [
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
            const orderStatus = order_status
            let color = ''

            switch (orderStatus) {
              case 'UNPAID':
                color = 'red'
                break
              case 'PAID':
                color = 'green'
                break
              case 'PICKLIST':
                color = 'green'
                break
              case 'BOOKED':
                color = 'lime'
                break
              case 'SURVEYREQ':
                color = 'blue'
                break
              case 'SURVEYSTART':
                color = 'blue'
                break
              case 'SURVEYDONE':
                color = 'blue'
                break
              case 'RESURVEYREQ':
                color = 'blue'
                break
              case 'RESURVEYSTART':
                color = 'blue'
                break
              case 'RESURVEYDONE':
                color = 'blue'
                break
              case 'QUOTE IN':
                color = 'blue'
                break
              case 'QUOTE OUT':
                color = 'blue'
                break
              case 'WORKREQ':
                color = 'blue'
                break
              case 'WORKSTART':
                color = 'blue'
                break
              case 'WORKEND':
                color = 'blue'
                break
              case 'INVOICED':
                color = 'blue'
                break
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
          width: 150,
          className: 'text-start',
        },
        {
          title: 'Work Status',
          dataIndex: 'work_status',
          key: 'work_status',
          className: 'col-complaint-date text-start',
          width: 180,
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
          width: 150,
          onFilter: (value, record) => record.complaint_date.includes(String(value)),
          sorter: (a, b) => a.complaint_date.length - b.complaint_date.length,
        },
        {
          title: 'Umur Komplain',
          dataIndex: 'complaint_age',
          key: 'complaint_age',
          className: 'col-complaint-date text-start',
          width: 150,
          onFilter: (value, record) => record.complaint_age.includes(String(value)),
          sorter: (a, b) => a.complaint_age.length - b.complaint_age.length,
        },
        {
          title: 'Status Komplain',
          dataIndex: 'complaint_status',
          key: 'complaint_status',
          className: 'col-complaint-status text-start',
          width: 180,
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
      break

    case 'quotation':
      columns = [
        {
          title: 'Quotation ID',
          dataIndex: 'quotation_id',
          key: 'quotation_id',
          align: 'center',
          width: 110,
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.quotation_id - b.quotation_id,
        },
        {
          title: 'Order ID',
          dataIndex: 'order_id',
          key: 'order_id',
          align: 'center',
          width: 90,
          className: 'col_order_id',
          sorter: (a, b) => a.order_id - b.order_id,
        },
        {
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'center',
          width: 130,
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
          title: 'Nama Customer',
          dataIndex: 'costumer_name',
          key: 'costumer_name',
          align: 'left',
          width: 130,
          onFilter: (value, record) => record.costumer_name.includes(String(value)),
          sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
        },
        {
          title: 'Nama Pemasangan',
          dataIndex: 'service_name',
          key: 'service_name',
          align: 'left',
          width: 130,
          onFilter: (value, record) => record.service_name.includes(String(value)),
          sorter: (a, b) => a.service_name.length - b.service_name.length,
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
          align: 'left',
          width: 120,
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
      ]
      break

    case 'refund':
      columns = [
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
          filters: [
            {text: 'BOOK', value: 'BOOK'},
            {text: 'BOOKED', value: 'BOOKED'},
          ],
          onFilter: (value, record) => record.order_status.includes(String(value)),
          sorter: (a, b) => a.order_status.length - b.order_status.length,
        },
      ]
      break

    case 'reschedule':
      columns = [
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
      break

    case 'sales-comission':
      columns = [
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
      break

    case 'invoices':
      columns = [
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
      break

    default:
      columns = [
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
      break
  }

  const fetchAllReportData = async (endpoint: string) => {
    try {
      const nonReportEndpoints = [
        'orders',
        'refund',
        'reschedule',
        'quotation',
        'claim garansi',
        'invoices',
        'complaints',
      ]
      const urlBase = nonReportEndpoints.includes(endpoint)
        ? `${apiUrl}/${endpoint}`
        : `${apiUrl}/reports/${endpoint}`

      let url = `${urlBase}?order_by=desc&take=0${params}`

      if (endpoint === 'sales-comission') {
        if (statusName === 'UNPAID') {
          url += `&status=1,2`
        } else if (statusName === 'PAID') {
          url += `&status=3`
        }
      } else {
        if (statuses && statuses.length) {
          url += `&status=${statuses}`
        }
        if (dateFrom && dateTo) {
          url += `&date_from=${dateFrom}&date_to=${dateTo}`
        }
        if (store_id) {
          url += `&store_id=${store_id}`
        }
      }

      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (response?.data) {
        switch (endpoint) {
          case 'orders':
            setReportGrandTotal(response?.data?.orderGrandTotal ?? 0)
            return response?.data?.orderGrandTotal ?? 0

          case 'complaints':
            setReportGrandTotal(response?.data?.complaintGrandTotal ?? 0)
            return response?.data?.complaintGrandTotal ?? 0

          case 'refund':
            if (title === 'Laporan Total Penalty') {
              setReportGrandTotal(response?.data?.totalPenalty ?? 0)
              return response?.data?.totalPenalty ?? 0
            } else {
              setReportGrandTotal(response?.data?.refundGrandTotal ?? 0)
              return response?.data?.refundGrandTotal ?? 0
            }

          case 'quotation':
            setReportGrandTotal(response?.data?.quotationGrandTotal ?? 0)
            return response?.data?.quotationGrandTotal ?? 0

          case 'sales-comission':
            setReportGrandTotal(response?.data?.totalIncentive?._sum?.nominal ?? 0)
            return response?.data?.totalIncentive?._sum?.nominal ?? 0

          case 'reschedule':
            setReportGrandTotal(response?.data?.rescheduleGrandTotal ?? 0)
            return response?.data?.rescheduleGrandTotal ?? 0

          default:
            setReportGrandTotal(response?.data?.orderGrandTotal ?? 0)
            break
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchReportData = async (endpoint: string, page: number, pageSize: number) => {
    try {
      const nonReportEndpoints = [
        'orders',
        'refund',
        'reschedule',
        'quotation',
        'claim garansi',
        'invoices',
        'complaints',
      ]

      let urlBase = nonReportEndpoints.includes(endpoint)
        ? `${apiUrl}/${endpoint}`
        : `${apiUrl}/reports/${endpoint}`
      let url = `${urlBase}?order_by=desc&page=${page}&take=${pageSize}${params}`

      if (endpoint === 'sales-comission') {
        if (statusName === 'UNPAID') {
          url += `&status=1,2`
        } else if (statusName === 'PAID') {
          url += `&status=3`
        }
      } else {
        if (statuses.length) {
          url += `&status=${statuses}`
        }
        if (dateFrom && dateTo) {
          url += `&date_from=${dateFrom}&date_to=${dateTo}`
        }
        if (store_id) {
          url += `&store_id=${store_id}`
        }
      }

      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setLoadData(false)

      if (['refund', 'reschedule'].includes(endpoint)) {
        if (response?.data) {
          setCurrentPage(response?.data?.page ?? 1)
          setTotalOrder(response?.data?.takeTotal ?? 0)
        }
      } else if (endpoint === 'orders') {
        setCurrentPage(response?.data?.page ?? 1)
        setTotalOrder(response?.data?.total ?? 0)
      } else {
        if (response?.data) {
          setCurrentPage(response?.data?.page ?? 1)
          setTotalOrder(response?.data?.total ?? 0)
        }
      }

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewReportData = async (endpoint: string, page: number, pageSize: number) => {
    try {
      const apiData = await fetchReportData(endpoint, page, pageSize)

      if (!apiData) {
        console.error('No data received from getReportData')
        return []
      }

      let orderData
      let complaintData
      let quotationData
      let refundData
      let rescheduleData
      let salesComissionData
      let invoicesData

      switch (endpoint) {
        case 'orders':
          orderData = apiData.map((item: any) => {
            let data

            const orderDate = formatDateWithTimeZone(item?.created_at)

            const grandTotal =
              item?.payment_type === 'survey'
                ? Number(item?.grand_total ?? 0) +
                  Number(item?.quotation?.[0]?.quotation_grand_total ?? 0)
                : Number(item?.grand_total ?? 0)

            const phoneNumber = item?.project_number.startsWith('0')
              ? item?.project_number
              : `+62${item?.project_number}`

            data = {
              order_id: item.id,
              store_name: item?.store?.store_name,
              member_number: item?.members?.whatsapp_number,
              costumer_name: item?.members?.full_name,
              phone_number: phoneNumber,
              vendor_name: item?.vendor?.company_name ?? '-',
              grand_total: `Rp. ${grandTotal.toLocaleString('id')}`,
              date_order: orderDate,
              status: item?.status?.description,
            }

            return data
          })
          break

        case 'complaints':
          complaintData = apiData.map((item: any) => {
            let data

            const orderDate = formatDateWithTimeZone(item?.orders?.created_at)

            const complaintDate = new Date(item.complaint_date)
            const currentDate = new Date()

            const timeDifferenceInMilliseconds = Number(currentDate) - Number(complaintDate)
            const timeDifferenceInMinutes = Math.floor(timeDifferenceInMilliseconds / (1000 * 60))
            const timeDifferenceInHours = Math.floor(
              timeDifferenceInMilliseconds / (1000 * 60 * 60)
            )
            const timeDifferenceInDays = Math.floor(
              timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24)
            )

            let complaintAge

            if (timeDifferenceInDays >= 1) {
              complaintAge = `${timeDifferenceInDays} Hari`
            } else if (timeDifferenceInHours >= 1) {
              complaintAge = `${timeDifferenceInHours} Jam`
            } else {
              complaintAge = `${timeDifferenceInMinutes} Menit`
            }

            const phoneNumber = item?.orders?.project_number.startsWith('0')
              ? item.orders?.project_number
              : `+62${item.orders?.project_number}`

            data = {
              complaint_id: item.id,
              assign_from: item.orders.store.store_name,
              order_id: item.orders.id,
              date_order: orderDate,
              no_member: item.orders.members.member_number,
              costumer_name: item.orders.members.full_name,
              phone_number: phoneNumber,
              service_name: item.orders.m_order_details[0].item_name ?? '-',
              order_status: item.orders.status.description,
              work_status: item.orders.status.description,
              complaint_date: formatDate(complaintDate),
              complaint_age: complaintAge,
              complaint_status: item.status.description,
            }

            return data
          })
          break

        case 'quotation':
          quotationData = apiData.map((item: any) => {
            let data

            const orderDate = formatDateWithTimeZone(item?.order?.created_at)

            const workOrderItems = item?.quotation_details
              .map((service: any) => service.name ?? '-')
              .join(', ')

            let paymentStatus = item?.receipt_quotation === null ? 'UNPAID' : 'PAID'

            data = {
              quotation_id: item.id,
              store_name: item?.store?.store_name ?? '-',
              order_id: item?.order?.id,
              date_order: orderDate,
              costumer_name: item?.order?.members?.full_name ?? '',
              service_name: workOrderItems,
              vendor_name: item?.order?.vendor?.company_name ?? '-',
              payment_status: paymentStatus,
              order_status: item?.status?.description ?? '',
              quotation_status: item?.status?.category ?? '',
            }

            return data
          })
          break

        case 'refund':
          refundData = apiData.map((item: any) => {
            let data

            const orderDate = formatDateWithTimeZone(item?.orders?.created_at)

            let paymentStatus = item.orders.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

            data = {
              refund_id: item?.id,
              order_id: item?.order_id,
              store_name: item?.orders?.store?.store_name,
              date_order: orderDate,
              member_id: item?.orders?.members?.id,
              member_name: item?.orders?.members?.full_name,
              phone_number: item?.orders?.project_number,
              vendor_name: item?.orders?.vendor?.company_name ?? '-',
              service_name:
                item?.orders?.payment_type === 'survey'
                  ? item?.orders?.m_order_details[0]?.item_notes ?? '-'
                  : item?.orders?.m_order_details[0]?.item?.service_name ?? '-',
              voucher: item?.voucher ?? '-',
              paid_status: item?.paid_status === 1 ? 'Sudah Dibayar' : 'Belum Dibayar',
              penalty_vendor: `Rp. ${parseInt(item?.penalty_nominal ?? 0).toLocaleString('id')}`,
              payment_status: paymentStatus,
              order_status: item?.status?.description,
            }

            return data
          })
          break

        case 'reschedule':
          rescheduleData = apiData.map((item: any) => {
            let data

            const orderDate = formatDateWithTimeZone(item?.order?.created_at)

            const phoneNumber = item?.order?.project_number.startsWith('0')
              ? item.order?.project_number
              : `+62${item.order?.project_number}`

            let paymentStatus = item.order.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

            data = {
              reschedule_id: item?.id,
              order_id: item?.order_id,
              store_name: item?.order?.store.store_name,
              date_order: orderDate,
              member_id: item?.order?.members.member_number,
              member_name: item?.order?.members.full_name,
              phone_number: phoneNumber,
              item_name: item?.order?.m_order_details[0]?.item?.item_name ?? '-',
              service_name: item?.order?.m_order_details[0]?.item?.service_name ?? '-',
              payment_status: paymentStatus,
              order_status: item?.order?.status.description,
            }

            return data
          })
          break

        case 'sales-comission':
          salesComissionData = apiData.map((item: any) => {
            let data

            const orderDate = formatDateWithTimeZone(item?.quotation?.created_at)

            data = {
              sales_comission_id: item?.id,
              order_id: item?.quotation?.order_id,
              date_order: orderDate,
              store_name: item?.sales?.store?.store_name ?? '-',
              costumer_name: item?.quotation?.order?.members?.full_name,
              incentive_name: item?.incentive?.name,
              sales_name: item?.sales?.full_name,
              account_name: item?.sales?.account_name ?? '-',
              account_number: item?.sales?.account_number ?? '-',
              sales_comission: `Rp. ${parseInt(item?.nominal ?? 0).toLocaleString('id')}`,
            }

            return data
          })
          break

        case 'invoices':
          invoicesData = apiData.map((item: any) => {
            let data

            const orderDate = formatDateWithTimeZone(item?.created_at)

            data = {
              order_id: item.id,
              vendor_name: item?.vendor?.company_name ?? '-',
              grand_total: `Rp. ${parseInt(item?.total_amount).toLocaleString('id')}`,
              date_order: orderDate,
            }

            return data
          })
          break

        default:
          break
      }

      return endpoint === 'orders'
        ? orderData
        : endpoint === 'quotation'
        ? quotationData
        : endpoint === 'complaints'
        ? complaintData
        : endpoint === 'refund'
        ? refundData
        : endpoint === 'reschedule'
        ? rescheduleData
        : endpoint === 'sales-comission'
        ? salesComissionData
        : endpoint === 'invoices'
        ? invoicesData
        : []
    } catch (error) {
      console.error('Error getting report list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number) => {
    const data = await ViewReportData(endpoint, page, pageSize)
    setReportData(data)
  }

  useEffect(() => {
    fetchAllReportData(endpoint)
    fetchData(currentPage, pageSize)
  }, [currentPage, pageSize])

  useEffect(() => {
    const selectedStoreCityId = selectedStore?.area_id
    const filteredZone = area.filter((item) => item.value === selectedStoreCityId)

    if (filteredZone.length === 1) {
      setSelectedZone(filteredZone[0])
    } else {
      setSelectedZone({value: null, label: 'All Zona', area_id: null})
    }
  }, [selectedStore])

  useEffect(() => {
    const getStore = async () => {
      let params: {take?: number; area_id?: string} = {}

      switch (selectedZone.label) {
        case 'Jawa':
          params.area_id = javaAreaIds
          break
        case 'All Zona':
          params.take = 0
          break
        default:
          params.area_id = selectedZone.value
          break
      }

      try {
        const response = await axios.get(`${apiUrl}/stores`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params,
        })

        if (Array.isArray(response.data.data)) {
          const tempStore = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.store_name,
            area_id: item.area_id,
          }))

          setStore(tempStore)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getArea = async () => {
      try {
        const response = await axios.get(`${apiUrl}/area?take=0`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
          params: {
            take: 0,
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempCity = response.data.data.map((item: any) => ({
            value: item?.id ?? null,
            label: item?.area ?? '',
          }))

          setArea(tempCity)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getStore()
    getArea()
  }, [selectedZone])

  // Render
  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  // Upload Excel
  const [excel, setExcel] = useState<File | null>(null)
  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleFileChange = (event: any) => {
    const files = event.fileList
    if (files && files[0]) {
      setExcel(files[0].originFileObj)
    }
  }

  const handleFileRemove = () => {
    setExcel(null)
  }

  const handleUpload = async () => {
    setLoadingUploadExcel(true)

    const formData = new FormData()
    if (excel !== null) {
      formData.append('file', excel)
    }

    await axios
      .post(`${apiUrl}/sales/upload-excel`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.statusCode === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil Upload Excel',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          })

          setLoadingUploadExcel(false)
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })

          setLoadingUploadExcel(false)
        }

        setTimeout(() => {
          window.location.reload()
        }, 2000)
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })

        setLoadingUploadExcel(false)
      })
  }

  const handleUploadExcel = () => {
    setShowModal(true)
  }

  // Export Excel
  const exportToExcel = () => {
    setLoadingExport(true)

    let url = ''

    if (title === 'Laporan General Report') {
      url = `${apiUrl}/reports/general-report?take=0${params}`
    } else {
      url = `${apiUrl}/${endpoint}/export-excel?take=0${params}`
    }

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        url += `${key}${value}`
      }
    }

    valueCheck(`&date_from=`, dateFrom)
    valueCheck(`&date_to=`, dateTo)
    valueCheck(`&store_id=`, store_id)

    axios
      .get(url, {
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `Report ${title} ${
            dateFrom && dateTo
              ? `Periode ${dateFrom} - ${dateTo}`
              : formatDateWithTime(new Date().toISOString())
          }.xlsx`
        )
        document.body.appendChild(link)
        link.click()

        setLoadingExport(false)
      })
  }

  // Export Template Excel
  const exportTemplate = (status: number) => {
    setLoadingTemplate(true)

    axios
      .get(`${apiUrl}/sales/export-excel-template?status=${status}`, {
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${title}.xlsx`)
        document.body.appendChild(link)
        link.click()

        setLoadingTemplate(false)
      })
  }

  // Submit Filter
  const handleSubmitFilter = async (endpoint: string) => {
    setLoadingButton(true)

    const reportGrandTotal = await fetchAllReportData(endpoint)
    setReportGrandTotal(reportGrandTotal)

    const data = await ViewReportData(endpoint, 1, pageSize)
    setReportData(data)

    setLoadingButton(false)
  }

  return (
    <section id='view-report-ho'>
      <Row className='mb-5'>
        <Col xxl={4} xl={4} sm={12}>
          <Row>
            <Col xxl={4} xl={4} lg={4} className='d-flex align-items-center'>
              <h3 className='title-header fs-5 fw-normal'>Pilih rentang waktu</h3>
            </Col>

            <Col xxl={8} xl={8} lg={8}>
              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range w-100'
                defaultValue={[dayjs().subtract(30, 'day'), dayjs()]}
                onChange={(values) => {
                  if (values && values.length === 2) {
                    const dateFromFormatted = values[0]?.format('YYYY-MM-DD')
                    const dateToFormatted = values[1]?.format('YYYY-MM-DD')

                    setDateFrom(dateFromFormatted)
                    setDateTo(dateToFormatted)
                  } else {
                    setDateFrom('')
                    setDateTo('')
                  }
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col xxl={3} xl={3} sm={12}>
          <Row>
            <Col xxl={4} xl={4} lg={12} className='d-flex align-items-center'>
              <h3 className='title-header fs-5 fw-normal'>Lihat Store Dashboard</h3>
            </Col>

            <Col xxl={8} xl={8} lg={12}>
              <div className='d-flex'>
                <Select
                  name='store_id'
                  className='form-control p-0'
                  classNamePrefix='select'
                  placeholder='Pilih Toko'
                  isSearchable={true}
                  options={storeOptions}
                  value={selectedStore}
                  onChange={(newValue) => setSelectedStore(newValue)}
                />
              </div>
            </Col>
          </Row>
        </Col>

        <Col xxl={3} xl={3} sm={12}>
          <Row>
            <Col xxl={4} xl={4} lg={12} className='d-flex align-items-center'>
              <h3 className='title-header fs-5 fw-normal'>Pilih Zona</h3>
            </Col>

            <Col xxl={8} xl={8} lg={12}>
              <div className='d-flex'>
                <Select
                  name='province_id'
                  className='form-control p-0'
                  classNamePrefix='select'
                  placeholder='Pilih Zona'
                  isSearchable={true}
                  options={zoneOptions}
                  value={selectedZone}
                  onChange={(newValue) => setSelectedZone(newValue)}
                />
              </div>
            </Col>
          </Row>
        </Col>

        <Col xxl={2} xl={2} sm={12}>
          <Button
            className='btn-dark-primary button-submit'
            disabled={loadingButton}
            onClick={() => handleSubmitFilter(endpoint)}
          >
            {loadingButton ? 'Filtering..' : 'Submit'}
          </Button>
        </Col>
      </Row>

      <Row className='mb-5'>
        <Col>
          <Card className={`border-top border-${headerColor} border-5`}>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center'>
                {['Laporan Refund'].includes(title) ? (
                  <h1 className='fs-3 fw-semibold text-uppercase mb-3'>
                    Total Laporan Refund : {totalOrder}
                  </h1>
                ) : (
                  <h3 className='fs-3 fw-semibold text-uppercase mb-3'>{title}</h3>
                )}

                <div className='d-flex justify-content-between gap-3'>
                  {['sales-comission'].includes(endpoint) && statusName === 'PAID' && (
                    <>
                      <button className='button-export' onClick={handleUploadExcel}>
                        <h3 className='fs-5 fw-semibold'>
                          {loadingUploadExcel ? 'Uploading..' : 'Upload Excel'}
                        </h3>
                      </button>

                      <button className='button-export' onClick={() => exportTemplate(3)}>
                        <h3 className='fs-5 fw-semibold'>
                          {loadingTemplate ? 'Exporting..' : 'Export Excel'}
                        </h3>
                      </button>
                    </>
                  )}

                  {['sales-comission'].includes(endpoint) && statusName === 'UNPAID' && (
                    <>
                      <button className='button-export' onClick={() => exportTemplate(2)}>
                        <h3 className='fs-5 fw-semibold'>
                          {loadingTemplate ? 'Exporting..' : 'Export Excel'}
                        </h3>
                      </button>
                    </>
                  )}

                  {!['sales-comission'].includes(endpoint) && (
                    <>
                      <button className='button-export' onClick={exportToExcel}>
                        <h3 className='fs-5 fw-semibold'>
                          {loadingExport ? 'Exporting..' : 'Export To Excel'}
                        </h3>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h1 className='fs-1 fw-bold'>{`Rp. ${parseInt(reportGrandTotal).toLocaleString(
                'id'
              )}`}</h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mb-5'>
        <Col>
          <Spin
            tip='Loading...'
            spinning={loadData}
            size='large'
            indicator={<LoadingOutlined style={{fontSize: 24}} spin />}
          >
            <div className='table-custom-wrapper'>
              <Table
                className='table-striped-rows'
                bordered
                columns={columns}
                dataSource={reportData}
                rowKey={(record) =>
                  endpoint === 'orders'
                    ? record.order_id
                    : endpoint === 'refund'
                    ? record.refund_id
                    : endpoint === 'reschedule'
                    ? record.reschedule_id
                    : endpoint === 'quotation'
                    ? record.quotation_id
                    : endpoint === 'invoices'
                    ? record.invoice_id
                    : endpoint === 'sales-comission'
                    ? record.sales_comission_id
                    : endpoint === 'complaints'
                    ? record.complaint_id
                    : record.order_id
                }
                tableLayout='auto'
                scroll={{x: 'max-content'}}
                pagination={false}
                sticky={true}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalOrder)} of {totalOrder} Order
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              total={totalOrder}
              showSizeChanger
              defaultPageSize={pageSize}
              pageSizeOptions={[5, 10, 20, 50, 100]}
              itemRender={itemRender}
              onShowSizeChange={(current, size) => {
                setPageSize(size)
              }}
              onChange={(page, pageSize) => {
                fetchData(page, pageSize)
              }}
            />
          </div>
        </Col>
      </Row>

      {/* Modal Upload Excel */}
      <Modal
        dialogClassName='modal-upload-excel'
        centered
        show={showModal}
        onHide={handleCloseModal}
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
            onChange={(e) => handleFileChange(e)}
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
    </section>
  )
}

export {ReportHO}
