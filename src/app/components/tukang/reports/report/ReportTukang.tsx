import React, {useState, useEffect} from 'react'

import './ReportTukang.css'

import axios from 'axios'
import dayjs from 'dayjs'
import {Table, PaginationProps, Tag} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {Card, Row, Col, Button} from 'react-bootstrap'

import {DatePicker} from 'antd'
const {RangePicker} = DatePicker

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

const ReportTukang: React.FC<Props> = ({endpoint, statusName, headerColor, title, params}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const userTukang = localStorage.getItem('tukang_id')
  const tukangId = userTukang ? `&tukang_id=${userTukang}` : ''

  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status: any) => status.category.includes(statusName))
  const statuses = desiredStatus.map((x) => x.value)

  const [reportData, setReportData] = useState<any[]>([])
  const [reportGrandTotal, setReportGrandTotal] = useState<any>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalOrder, setTotalOrder] = useState<number>(0)

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadingExport, setLoadingExport] = useState<boolean>(false)

  const today = new Date()
  const [dateFrom, setDateFrom] = useState<any>(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])

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
          title: 'Nama Toko',
          dataIndex: 'store_name',
          key: 'store_name',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.store_name.includes(String(value)),
          sorter: (a, b) => a.store_name.length - b.store_name.length,
        },
        {
          title: 'Nomor Member',
          dataIndex: 'member_number',
          key: 'member_number',
          align: 'left',
          width: 140,
          onFilter: (value, record) => record.member_number.includes(String(value)),
          sorter: (a, b) => a.member_number.length - b.member_number.length,
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
          title: 'Tanggal Order',
          dataIndex: 'date_order',
          key: 'date_order',
          align: 'left',
          width: 110,
          sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
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
          title: 'No Member',
          dataIndex: 'no_member',
          key: 'no_member',
          align: 'center',
          width: 140,
          className: 'text-start',
          sorter: (a, b) => a.no_member - b.no_member,
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
          title: 'Refund Id',
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
          title: 'Nomor Member',
          dataIndex: 'member_id',
          key: 'member_id',
          align: 'left',
          width: 110,
          sorter: (a, b) => a.member_id - b.member_id,
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
          title: 'Refund Id',
          dataIndex: 'refund_id',
          key: 'refund_id',
          align: 'center',
          width: 80,
          sorter: (a, b) => a.refund_id - b.refund_id,
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

  const fetchAllReportData = async (endpoint: string, queryparams: any) => {
    try {
      const nonReportEndpoints = [
        'orders',
        'refund',
        'reschedule',
        'quotation',
        'claim garansi',
        'invoices',
      ]
      const urlBase = nonReportEndpoints.includes(endpoint)
        ? `${apiUrl}/${endpoint}`
        : `${apiUrl}/reports/${endpoint}`

      let url = `${urlBase}?order_by=desc&take=0${tukangId}`
      // if (statuses && statuses.length) {
      //   url += `&status=${statuses}`
      // }
      if (queryparams) {
        url += queryparams
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
            setReportGrandTotal(response?.data?.refundGrandTotal ?? 0)
            return response?.data?.refundGrandTotal ?? 0

          case 'quotation':
            setReportGrandTotal(response?.data?.quotationGrandTotal ?? 0)
            return response?.data?.quotationGrandTotal ?? 0

          case 'invoices':
            setReportGrandTotal(response?.data?.grandTotalAmount ?? 0)
            return response?.data?.grandTotalAmount ?? 0

          default:
            setReportGrandTotal(response?.data?.orderGrandTotal ?? 0)
            break
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchReportData = async (
    endpoint: string,
    page: number,
    pageSize: number,
    queryparams: any
  ) => {
    try {
      const nonReportEndpoints = [
        'orders',
        'refund',
        'reschedule',
        'quotation',
        'claim garansi',
        'invoices',
      ]

      let urlBase = nonReportEndpoints.includes(endpoint)
        ? `${apiUrl}/${endpoint}`
        : `${apiUrl}/reports/${endpoint}`

      let url = `${urlBase}?order_by=desc${tukangId}&page=${page}&take=${pageSize}${params}`

      // if (statuses.length) {
      //   url += `&status=${statuses}`
      // }
      if (queryparams) {
        url += queryparams
      }

      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (endpoint === 'refund') {
        if (response?.data) {
          setCurrentPage(response?.data?.page ?? 1)
          setTotalOrder(response?.data?.takeTotal ?? 0)
        }
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

  const ViewReportData = async (
    endpoint: string,
    page: number,
    pageSize: number,
    queryparams: any
  ) => {
    try {
      const apiData = await fetchReportData(endpoint, page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from getReportData')
        return []
      }

      let orderData
      let complaintData
      let quotationData
      let refundData
      let rescheduleData
      let invoicesData

      switch (endpoint) {
        case 'orders':
          orderData = apiData.map((item: any) => {
            let data

            const orderDate = new Date(item?.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })

            const grandTotal =
              item?.payment_type === 'survey'
                ? Number(item?.grand_total ?? 0) +
                  Number(item?.quotation?.[0]?.quotation_grand_total ?? 0)
                : Number(item?.grand_total ?? 0)

            data = {
              order_id: item.id,
              store_name: item?.store?.store_name,
              member_number: item?.members?.whatsapp_number,
              costumer_name: item?.members?.full_name,
              phone_number: item?.project_number,
              vendor_name: item?.vendor?.company_name ?? '-',
              grand_total: `Rp. ${grandTotal.toLocaleString('id')}`,
              date_order: orderDate,
            }

            return data
          })
          break

        case 'complaints':
          complaintData = apiData.map((item: any) => {
            let data

            const orderDate = new Date(item?.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })

            const complaintDate = new Date(item?.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })

            const phoneNumber = item?.orders?.project_number.startsWith('0')
              ? item?.orders?.project_number
              : `+62${item?.orders?.project_number}`

            const currentDate = new Date()
            const complaintDates = new Date(item?.created_at)

            const timeDifferenceInMilliseconds = Number(currentDate) - Number(complaintDates)
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
              work_status: item?.orders?.work_orders?.work_order_status[0]?.status?.description,
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

            const orderDate = new Date(item?.order?.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })

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
              order_status: item?.status?.category ?? '',
              quotation_status: item?.status?.category ?? '',
            }

            return data
          })
          break

        case 'refund':
          refundData = apiData.map((item: any) => {
            let data

            const orderDate = new Date(item?.orders?.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })

            let paymentStatus = item.orders.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

            data = {
              refund_id: item?.id,
              order_id: item?.order_id,
              store_name: item?.orders?.store?.store_name,
              date_order: orderDate,
              member_id: item?.orders?.members?.id,
              member_name: item?.orders?.members?.full_name,
              phone_number: item?.orders?.project_number,
              voucher: item?.voucher ?? '-',
              penalty_vendor: `Rp. ${parseInt(item?.penalty_nominal).toLocaleString('id')}` ?? 0,
              payment_status: paymentStatus,
              order_status: item?.status?.description,
            }

            return data
          })
          break

        case 'reschedule':
          rescheduleData = apiData.map((item: any) => {
            let data

            const orderDate = new Date(item?.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })

            let phoneNumber =
              item.order.members.phone_number !== 'null'
                ? item.order.members.phone_number
                : item.order.members.whatsapp_number

            let paymentStatus = item.order.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

            data = {
              refund_id: item?.id,
              order_id: item?.order_id,
              store_name: item?.order?.store.store_name,
              date_order: orderDate,
              member_id: item?.order?.members.member_number,
              member_name: item?.order?.members.full_name,
              phone_number: phoneNumber,
              item_name: item?.order?.m_order_details[0]?.item?.item_name ?? '-',
              service_name: item?.order?.m_order_details[0]?.item?.service_name ?? '-',
              payment_status: paymentStatus,
              order_status: item?.order?.status.category,
            }

            return data
          })
          break

        case 'invoices':
          invoicesData = apiData.map((item: any) => {
            let data

            const orderDate = new Date(item?.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })

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
        : endpoint === 'invoices'
        ? invoicesData
        : []
    } catch (error) {
      console.error('Error getting report list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewReportData(endpoint, page, pageSize, queryparams)
    setReportData(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
    fetchAllReportData(endpoint, '')
  }, [])

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  // Format Date
  const formatDate = (date: any) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Export To Excel
  const exportToExcel = () => {
    setLoadingExport(true)

    let url = `${apiUrl}/${endpoint}/export-excel?take=0`

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        url += `${key}${value}`
      }
    }

    valueCheck(`&date_from=`, dateFrom)
    valueCheck(`&date_to=`, dateTo)

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
          `Report ${title} ${dateFrom && dateTo ? `Periode ${dateFrom} - ${dateTo}` : ''}.xlsx`
        )
        document.body.appendChild(link)
        link.click()

        setLoadingExport(false)
      })
  }

  // Submit Filter
  const handleSubmitFilter = async () => {
    setLoadingButton(true)

    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&date_from=`, dateFrom)
    valueCheck(`&date_to=`, dateTo)

    const data = await ViewReportData('orders', 1, 10, queryparams)
    setReportData(data)

    setLoadingButton(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  return (
    <section id='view-report-tukang'>
      <Row className='mb-5'>
        <Col xxl={4} xl={4} lg={12}>
          <Row>
            <Col
              xxl={4}
              xl={4}
              lg={4}
              className='d-flex align-items-center'
              onKeyDown={handleKeyPress}
            >
              <h3 className='title-header fs-5 fw-normal'>Pilih rentang waktu</h3>
            </Col>

            <Col xxl={8} xl={8} lg={8}>
              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range w-100'
                defaultValue={[
                  dayjs(`${formatDate(today)}`, 'DD-MM-YYYY'),
                  dayjs(`${formatDate(today)}`, 'DD-MM-YYYY'),
                ]}
                onChange={(values) => {
                  if (values && values.length === 2) {
                    const dateFromFormatted = values[0]?.format('YYYY-MM-DD')
                    const dateToFormatted = values[1]?.format('YYYY-MM-DD')

                    setDateFrom(dateFromFormatted)
                    setDateTo(dateToFormatted)
                  } else {
                    setDateFrom(new Date().toISOString().split('T')[0])
                    setDateTo(new Date().toISOString().split('T')[0])
                  }
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col xxl={4} xl={4} lg={12}>
          <Button
            className='btn-dark-primary button-submit'
            disabled={loadingButton}
            onClick={handleSubmitFilter}
          >
            {loadingButton ? 'Filtering..' : 'Submit'}
          </Button>
        </Col>

        <Col xxl={4} xl={4} lg={12}></Col>
      </Row>

      <Row className='mb-5'>
        <Col>
          <Card className={`border-top border-${headerColor} border-5`}>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center'>
                <h3 className='fs-3 fw-semibold text-uppercase mb-3'>{title}</h3>

                <button className='button-export' onClick={exportToExcel}>
                  <h3 className='fs-5 fw-semibold'>
                    {loadingExport ? 'Exporting..' : 'Export To Excel'}
                  </h3>
                </button>
              </div>

              {!['csi', 'complaints', 'reschedule', 'work-orders'].includes(endpoint) ? (
                <h1 className='fs-1 fw-bold'>{`Rp. ${parseInt(reportGrandTotal).toLocaleString(
                  'id'
                )}`}</h1>
              ) : (
                <></>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mb-5'>
        <Col>
          {endpoint === 'complaints' ? (
            <Table
              className='table-striped-rows'
              bordered
              columns={columns}
              dataSource={reportData}
              rowKey={(record) => record.order_id}
              tableLayout='auto'
              scroll={{x: 'max-content'}}
              pagination={{
                position: ['bottomRight'],
                current: currentPage,
                total: totalOrder,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20, 50, 100],
                onChange: (page, pageSize) => {
                  fetchData(page, pageSize, '')
                },
                itemRender: itemRender,
                showTotal: (total, range) => (
                  <span style={{left: 0, position: 'absolute'}}>
                    Showing {range[0]} - {range[1]} of {total} List
                  </span>
                ),
              }}
            />
          ) : (
            <Table
              className='table-striped-rows'
              bordered
              columns={columns}
              dataSource={reportData}
              rowKey={(record) => record.order_id}
              tableLayout='auto'
              scroll={{x: 'max-content'}}
              pagination={{
                position: ['bottomRight'],
                current: currentPage,
                total: totalOrder,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20, 50, 100],
                onChange: (page, pageSize) => {
                  fetchData(page, pageSize, '')
                },
                itemRender: itemRender,
                showTotal: (total, range) => (
                  <span style={{left: 0, position: 'absolute'}}>
                    Showing {range[0]} - {range[1]} of {total} List
                  </span>
                ),
              }}
            />
          )}
        </Col>
      </Row>
    </section>
  )
}

export {ReportTukang}
