import React, {useState, useEffect} from 'react'
import Swal from 'sweetalert2'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, Spin, Pagination, PaginationProps} from 'antd'
import {Row, Col} from 'react-bootstrap'
import {formatDateWithTime} from '../../../../../_metronic/helpers'
import './ReportHO.css'

import {ReportHOProps, Status, StoreItem, AreaItem} from './types'
import {getReportColumns} from './utils/columns'
import {mapReportData} from './utils/dataMapper'
import {
  fetchGrandTotalApi,
  fetchReportDataApi,
  fetchStoresApi,
  fetchAreasApi,
  uploadExcelApi,
  exportExcelBlobApi,
  exportTemplateBlobApi,
} from './services/reportHOService'
import {ReportHOFilterBar} from './components/ReportHOFilterBar'
import {ReportHOSummaryCard} from './components/ReportHOSummaryCard'
import {ReportHOUploadModal} from './components/ReportHOUploadModal'

const ReportHO: React.FC<ReportHOProps> = ({endpoint, statusName, headerColor, title, params}) => {
  const apiUrl = process.env.REACT_APP_API_URL

  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []
  const desiredStatus = statusData.filter((status: any) => status.category === statusName)
  const statuses = desiredStatus.map((x) => x.value)

  const [reportData, setReportData] = useState<any[]>([])
  const [reportGrandTotal, setReportGrandTotal] = useState<any>(0)

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

  const columns: ColumnsType<any> = getReportColumns(endpoint)

  const fetchAllReportData = async (targetEndpoint: string) => {
    try {
      const total = await fetchGrandTotalApi({
        apiUrl,
        endpoint: targetEndpoint,
        title,
        statusName,
        statuses,
        dateFrom,
        dateTo,
        storeId: store_id,
        params,
      })
      setReportGrandTotal(total)
      return total
    } catch (error) {
      console.error('Error fetching grand total:', error)
      return 0
    }
  }

  const fetchReportData = async (targetEndpoint: string, page: number, size: number) => {
    try {
      setLoadData(true)
      const response = await fetchReportDataApi({
        apiUrl,
        endpoint: targetEndpoint,
        page,
        pageSize: size,
        statusName,
        statuses,
        dateFrom,
        dateTo,
        storeId: store_id,
        params,
      })

      setLoadData(false)

      if (['refund', 'reschedule'].includes(targetEndpoint)) {
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

      return response?.data?.data ?? []
    } catch (error) {
      setLoadData(false)
      console.error('Error fetching data:', error)
      return []
    }
  }

  const fetchData = async (page: number, size: number) => {
    const rawData = await fetchReportData(endpoint, page, size)
    const formatted = mapReportData(endpoint, rawData)
    setReportData(formatted)
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
      let storeParams: {take?: number; area_id?: string} = {}

      switch (selectedZone.label) {
        case 'Jawa':
          storeParams.area_id = javaAreaIds
          break
        case 'All Zona':
          storeParams.take = 0
          break
        default:
          storeParams.area_id = selectedZone.value
          break
      }

      try {
        const response = await fetchStoresApi(apiUrl, storeParams)
        if (Array.isArray(response.data?.data)) {
          const tempStore = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.store_name,
            area_id: item.area_id,
          }))
          setStore(tempStore)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getArea = async () => {
      try {
        const response = await fetchAreasApi(apiUrl)
        if (Array.isArray(response.data?.data)) {
          const tempCity = response.data.data.map((item: any) => ({
            value: item?.id ?? null,
            label: item?.area ?? '',
          }))
          setArea(tempCity)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getStore()
    getArea()
  }, [selectedZone])

  // Pagination item render
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

    try {
      const response = await uploadExcelApi(apiUrl, formData)
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
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error?.response?.data?.message ?? 'Failed to upload',
        icon: 'error',
      })
      setLoadingUploadExcel(false)
    }
  }

  const handleUploadExcel = () => {
    setShowModal(true)
  }

  // Export Excel
  const exportToExcel = async () => {
    setLoadingExport(true)
    try {
      const response = await exportExcelBlobApi({
        apiUrl,
        endpoint,
        title,
        params,
        dateFrom,
        dateTo,
        storeId: store_id,
      })

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
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingExport(false)
    }
  }

  // Export Template Excel
  const exportTemplate = async (status: number) => {
    setLoadingTemplate(true)
    try {
      const response = await exportTemplateBlobApi(apiUrl, status)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${title}.xlsx`)
      document.body.appendChild(link)
      link.click()
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingTemplate(false)
    }
  }

  // Submit Filter
  const handleSubmitFilter = async (targetEndpoint: string) => {
    setLoadingButton(true)
    const total = await fetchAllReportData(targetEndpoint)
    setReportGrandTotal(total)

    const rawData = await fetchReportData(targetEndpoint, 1, pageSize)
    const formatted = mapReportData(targetEndpoint, rawData)
    setReportData(formatted)
    setLoadingButton(false)
  }

  const getRowKey = (record: any) => {
    switch (endpoint) {
      case 'orders':
        return record.order_id
      case 'refund':
        return record.refund_id
      case 'reschedule':
        return record.reschedule_id
      case 'quotation':
        return record.quotation_id
      case 'invoices':
        return record.invoice_id
      case 'sales-comission':
        return record.sales_comission_id
      case 'complaints':
        return record.complaint_id
      default:
        return record.order_id
    }
  }

  return (
    <section id='view-report-ho'>
      <ReportHOFilterBar
        storeOptions={storeOptions}
        selectedStore={selectedStore}
        onStoreChange={(newValue) => setSelectedStore(newValue)}
        zoneOptions={zoneOptions}
        selectedZone={selectedZone}
        onZoneChange={(newValue) => setSelectedZone(newValue)}
        loadingButton={loadingButton}
        onSubmitFilter={() => handleSubmitFilter(endpoint)}
        onDateChange={(from, to) => {
          setDateFrom(from)
          setDateTo(to)
        }}
      />

      <ReportHOSummaryCard
        headerColor={headerColor}
        title={title}
        totalOrder={totalOrder}
        endpoint={endpoint}
        statusName={statusName}
        reportGrandTotal={reportGrandTotal}
        loadingUploadExcel={loadingUploadExcel}
        loadingTemplate={loadingTemplate}
        loadingExport={loadingExport}
        onUploadExcel={handleUploadExcel}
        onExportTemplate={exportTemplate}
        onExportToExcel={exportToExcel}
      />

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
                rowKey={getRowKey}
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
              onShowSizeChange={(_, size) => {
                setPageSize(size)
              }}
              onChange={(page, size) => {
                fetchData(page, size)
              }}
            />
          </div>
        </Col>
      </Row>

      <ReportHOUploadModal
        showModal={showModal}
        onClose={handleCloseModal}
        excel={excel}
        loadingUploadExcel={loadingUploadExcel}
        onFileChange={handleFileChange}
        onFileRemove={handleFileRemove}
        onUpload={handleUpload}
      />
    </section>
  )
}

export {ReportHO}
