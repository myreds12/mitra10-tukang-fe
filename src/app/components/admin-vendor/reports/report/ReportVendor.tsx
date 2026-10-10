import React, {useState, useEffect} from 'react'
import './ReportVendor.css'

import {Table, PaginationProps, Spin, Pagination} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import {Row, Col} from 'react-bootstrap'

import {ReportVendorProps, Status} from './types'
import {getReportVendorColumns} from './utils/columns'
import {mapReportVendorData} from './utils/dataMapper'
import {
  fetchReportVendorDataApi,
  fetchAllReportVendorDataApi,
  exportReportVendorExcelApi,
} from './services/reportVendorService'
import {ReportVendorFilterBar} from './components/ReportVendorFilterBar'
import {ReportVendorSummaryCard} from './components/ReportVendorSummaryCard'

const ReportVendor: React.FC<ReportVendorProps> = ({
  endpoint,
  statusName,
  headerColor,
  title,
  params,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const userVendor = localStorage.getItem('vendor_id')
  const vendorId = userVendor ? `&vendor_id=${userVendor}` : ''

  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status: any) => status.category.includes(statusName))
  const statuses = desiredStatus.map((x) => x.value)

  const [reportData, setReportData] = useState<any[]>([])
  const [reportGrandTotal, setReportGrandTotal] = useState<any>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalOrder, setTotalOrder] = useState<number>(0)

  const [loadData, setLoadData] = useState<boolean>(true)
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadingExport, setLoadingExport] = useState<boolean>(false)

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])

  const columns = getReportVendorColumns(endpoint)

  const fetchAllReportData = async (targetEndpoint: string, queryparams: any) => {
    try {
      const response = await fetchAllReportVendorDataApi({
        apiUrl,
        endpoint: targetEndpoint,
        vendorId,
        statuses,
        queryparams,
        dateFrom,
        dateTo,
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
    currentPageSize: number,
    queryparams: any
  ) => {
    try {
      const response = await fetchReportVendorDataApi({
        apiUrl,
        endpoint: targetEndpoint,
        vendorId,
        page,
        pageSize: currentPageSize,
        params,
        statuses,
        queryparams,
        dateFrom,
        dateTo,
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

      setLoadData(false)
      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewReportData = async (
    targetEndpoint: string,
    page: number,
    currentPageSize: number,
    queryparams: any
  ) => {
    try {
      const apiData = await fetchReportData(targetEndpoint, page, currentPageSize, queryparams)
      if (!apiData) {
        console.error('No data received from getReportData')
        return []
      }
      return mapReportVendorData(targetEndpoint, apiData)
    } catch (error) {
      console.error('Error getting report list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, currentPageSize: number, queryparams: any) => {
    const data = await ViewReportData(endpoint, page, currentPageSize, queryparams)
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
    exportReportVendorExcelApi({
      apiUrl,
      endpoint,
      vendorId,
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

    const grandTotalVal = await fetchAllReportData(endpoint, queryparams)
    setReportGrandTotal(grandTotalVal)

    const data = await ViewReportData(endpoint, 1, 10, queryparams)
    setReportData(data)
    setLoadingButton(false)
  }

  return (
    <section id='view-report-vendor'>
      <ReportVendorFilterBar
        loadingButton={loadingButton}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        handleSubmitFilter={handleSubmitFilter}
      />

      <ReportVendorSummaryCard
        headerColor={headerColor}
        title={title}
        loadingExport={loadingExport}
        exportToExcel={exportToExcel}
        endpoint={endpoint}
        reportGrandTotal={reportGrandTotal}
      />

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
                onChange: (page, curPageSize) => {
                  fetchData(page, curPageSize, '')
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
            <>
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
                    rowKey={(record) => record.order_id}
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
                  {Math.min(currentPage * pageSize, totalOrder)} of {totalOrder} Work Order
                </span>

                <Pagination
                  className='pagination'
                  current={currentPage}
                  total={totalOrder}
                  showSizeChanger
                  pageSizeOptions={[5, 10, 20, 50, 100]}
                  itemRender={itemRender}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size)
                  }}
                  onChange={(page, curPageSize) => {
                    fetchData(page, curPageSize, '')
                  }}
                />
              </div>
            </>
          )}
        </Col>
      </Row>
    </section>
  )
}

export {ReportVendor}
