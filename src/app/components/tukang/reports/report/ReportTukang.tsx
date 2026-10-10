import React, {useState, useEffect} from 'react'
import './ReportTukang.css'

import {Table, PaginationProps} from 'antd'
import {Row, Col} from 'react-bootstrap'

import {ReportTukangProps, Status} from './types'
import {getReportTukangColumns} from './utils/columns'
import {mapReportTukangData} from './utils/dataMapper'
import {
  fetchReportTukangDataApi,
  fetchAllReportTukangDataApi,
  exportReportTukangExcelApi,
} from './services/reportTukangService'
import {ReportTukangFilterBar} from './components/ReportTukangFilterBar'
import {ReportTukangSummaryCard} from './components/ReportTukangSummaryCard'

const ReportTukang: React.FC<ReportTukangProps> = ({
  endpoint,
  statusName,
  headerColor,
  title,
  params,
}) => {
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

  const [dateFrom, setDateFrom] = useState<any>(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])

  const columns = getReportTukangColumns(endpoint)

  const fetchAllReportData = async (targetEndpoint: string, queryparams: any) => {
    try {
      const response = await fetchAllReportTukangDataApi({
        apiUrl,
        endpoint: targetEndpoint,
        tukangId,
        queryparams,
      })

      if (response?.data) {
        let total = 0
        switch (targetEndpoint) {
          case 'orders':
            total = response?.data?.orderGrandTotal ?? 0
            break
          case 'complaints':
            total = response?.data?.complaintGrandTotal ?? 0
            break
          case 'refund':
            total = response?.data?.refundGrandTotal ?? 0
            break
          case 'quotation':
            total = response?.data?.quotationGrandTotal ?? 0
            break
          case 'invoices':
            total = response?.data?.grandTotalAmount ?? 0
            break
          default:
            total = response?.data?.orderGrandTotal ?? 0
            break
        }
        setReportGrandTotal(total)
        return total
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchReportData = async (
    targetEndpoint: string,
    page: number,
    pageSize: number,
    queryparams: any
  ) => {
    try {
      const response = await fetchReportTukangDataApi({
        apiUrl,
        endpoint: targetEndpoint,
        tukangId,
        page,
        pageSize,
        params,
        queryparams,
      })

      if (targetEndpoint === 'refund') {
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
    targetEndpoint: string,
    page: number,
    pageSize: number,
    queryparams: any
  ) => {
    try {
      const apiData = await fetchReportData(targetEndpoint, page, pageSize, queryparams)
      if (!apiData) {
        console.error('No data received from getReportData')
        return []
      }
      return mapReportTukangData(targetEndpoint, apiData)
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

  const exportToExcel = () => {
    setLoadingExport(true)
    exportReportTukangExcelApi({
      apiUrl,
      endpoint,
      dateFrom,
      dateTo,
    })
      .then((response: any) => {
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
      .catch((error: any) => {
        console.error(error)
        setLoadingExport(false)
      })
  }

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

  return (
    <section id='view-report-tukang'>
      <ReportTukangFilterBar
        loadingButton={loadingButton}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        handleSubmitFilter={handleSubmitFilter}
      />

      <ReportTukangSummaryCard
        headerColor={headerColor}
        title={title}
        loadingExport={loadingExport}
        exportToExcel={exportToExcel}
        endpoint={endpoint}
        reportGrandTotal={reportGrandTotal}
      />

      <Row className='mb-5'>
        <Col>
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
        </Col>
      </Row>
    </section>
  )
}

export {ReportTukang}
