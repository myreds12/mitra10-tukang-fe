/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {FC, useEffect, useState, useRef} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from '../../../../../store'
import {
  setQueryParams,
  setCurrentPage,
  setPageSize,
  setDateFrom,
  setDateTo,
  setSearchFilter,
  setSelectedStore,
  setSelectedVendor,
  setSelectedOrderStatus,
  setSelectedPaymentReceiptStatus,
  setSelectedPaymentQuotationStatus,
} from '../../../../../store/orderSlice'

import './ViewOrder.css'
import {CustomerIndexModal} from './components/CustomerIndexModal'
import {QuotationModal} from './components/QuotationModal'
import {RefundModal} from './components/RefundModal'
import {useOrderColumns} from './components/useOrderColumns'
import {useOrderDetail} from './hooks/useOrderDetail'
import {useQuotationHandlers} from './hooks/useQuotationHandlers'
import {vendorAvailbility, exportToPDF, calculatePaymentStages} from './utils/orderHelpers'
import {DataType, StoreItem, VendorItem, Order, CSI, Quotation} from './types'

import axios from 'axios'
import dayjs from 'dayjs'
import Select, {SingleValue} from 'react-select'
import type {ColumnsType} from 'antd/es/table'
import {Table, Tag, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import type {FilterValue, SorterResult, TableCurrentDataSource} from 'antd/es/table/interface'
import {LoadingOutlined} from '@ant-design/icons'
import {Image, Skeleton} from 'antd'
import Swal from 'sweetalert2'
import {
  Nav,
  Row,
  Col,
  Form,
  Button,
  FormGroup,
  Modal,
  Card,
  ListGroup,
  OverlayTrigger,
  Tooltip,
  Tab,
} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faSearch,
  faPen,
  faCheckCircle,
  faImage,
  faTrash,
  faFileImage,
  faXmarkCircle,
  faEnvelope,
  faPrint,
} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

const ViewOrders: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const userRole = localStorage.getItem('userRole') as string
  const salesId = localStorage.getItem('sales_id')
  const storeId = localStorage.getItem('storeId')

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)
  const [orderData, setOrderData] = useState<DataType[]>([])
  const [totalData, setTotalData] = useState<number>(0)
  const [storeOptions, setStoreOptions] = useState<StoreItem[]>([])
  const [vendorOptions, setVendorOptions] = useState<VendorItem[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [user_id, setUserId] = useState<any>()
  const [vendor, setVendor] = useState<any>()
  const [csiData, setCsiData] = useState<any[]>([])
  const [selectedCSI, setSelectedCSI] = useState<any>()

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<number>(0)
  const [activeKey, setActiveKey] = useState<number>(1)
  const evidenceRef = useRef<HTMLInputElement>(null)

  // Redux State
  const currentPage = useSelector((state: RootState) => state.order.currentPage)
  const pageSize = useSelector((state: RootState) => state.order.pageSize)
  const dateFrom = useSelector((state: RootState) => state.order.dateFrom)
  const dateTo = useSelector((state: RootState) => state.order.dateTo)
  const searchFilter = useSelector((state: RootState) => state.order.searchFilter)
  const selectedStore = useSelector((state: RootState) => state.order.selectedStore)
  const selectedVendor = useSelector((state: RootState) => state.order.selectedVendor)
  const queryParams = useSelector((state: RootState) => state.order.queryParams)
  const selectedOrderStatus = useSelector((state: RootState) => state.order.selectedOrderStatus)
  const selectedPaymentReceiptStatus = useSelector(
    (state: RootState) => state.order.selectedPaymentReceiptStatus
  )
  const selectedPaymentQuotationStatus = useSelector(
    (state: RootState) => state.order.selectedPaymentQuotationStatus
  )

  // Status mapping
  const statusFilters = statusData.map((item: any) => ({
    text: item.description,
    value: item.category,
  }))

  const paymentStages = calculatePaymentStages(0)

  // Custom Hooks
  const {
    orderDetail,
    setOrderDetail,
    mailLogs,
    loadingModal,
    setLoadingModal,
    orderForm,
    setOrderForm,
    quotation,
    setQuotation,
    receiptFiles,
    setReceiptFiles,
    receiptQuotation,
    setReceiptQuotation,
    quotationFiles,
    setQuotationFiles,
    fetchOrderData,
  } = useOrderDetail({apiUrl})

  const {
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
    selectedReceiptIndex,
    selectedFileIndex,
    previewReceipt,
    setPreviewReceipt,
    previewImage,
    setPreviewImage,
    visibleReceipt,
    setVisibleReceipt,
    visible,
    setVisible,
  } = useQuotationHandlers({
    quotation,
    setQuotation,
    orderForm,
    receiptQuotation,
    setReceiptQuotation,
    quotationFiles,
    setQuotationFiles,
    evidenceRef,
    statusData,
    apiUrl,
  })

  const getStore = async () => {
    try {
      const response = await axios.get(`${apiUrl}/stores`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      const data = response.data.data

      const formattedStores = data.map((item: any) => ({
        value: item.id,
        label: item.store_name,
      }))

      if (['Sales', 'Store CS'].includes(userRole)) {
        const storeOption = formattedStores.find(
          (option: any) => option.value === parseInt(storeId ?? '')
        )
        if (storeOption) {
          dispatch(setSelectedStore(storeOption))
        }
      }

      setStoreOptions(formattedStores)
    } catch (error) {
      console.error(error)
    }
  }

  const getVendor = async (store_id?: number | null) => {
    try {
      const role = localStorage.getItem('userRole')
      const id = localStorage.getItem('storeId')
      let endPoint = ''

      if (['Sales', 'Store CS', 'Store Staff'].includes(role ?? '')) {
        endPoint = `?store_id=${id}`
      }

      if (store_id) {
        endPoint = `?store_id=${store_id}`
      }

      const response = await axios.get(`${apiUrl}/vendor${endPoint}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      const data = response.data.data
      setVendor(data)

      const formattedVendors = data.map((item: any) => ({
        value: item.id,
        label: item.company_name,
      }))

      setVendorOptions(formattedVendors)
    } catch (error) {
      console.error(error)
    }
  }

  const getCSI = async () => {
    try {
      const response = await axios.get(`${apiUrl}/csi`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      const data = response.data.data

      const formattedCsi = data.map((item: any) => ({
        value: item.id,
        label: item.title,
      }))

      setCsiData(formattedCsi)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const fetchOrderList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/orders?order_by=desc${queryparams}`
    setLoadData(true)
    try {
      const response = await axiosInstance.get(apiUrlWithParams, {
        params: {
          page: page,
          take: pageSize,
        },
      })

      const formattedData = response.data.data.map((item: any) => {
        const costumerName =
          item.members?.full_name ||
          item.customer_name ||
          item.costumer_name ||
          '-'

        let phoneNumber = '-'
        if (item.members?.phone_number && item.members.phone_number !== 'null') {
          phoneNumber = item.members.phone_number
        } else if (item.members?.whatsapp_number && item.members.whatsapp_number !== 'null') {
          phoneNumber = item.members.whatsapp_number
        } else if (item.project_number && item.project_number !== '0' && item.project_number !== 'null') {
          phoneNumber = item.project_number.startsWith('0')
            ? item.project_number
            : item.project_number.startsWith('62')
            ? `+${item.project_number}`
            : `0${item.project_number}`
        } else if (item.customer_phone && item.customer_phone !== 'null') {
          phoneNumber = item.customer_phone
        }

        return {
          key: item.id,
          order_id: item.id,
          date_order: formatDateWithTimeZone(item.created_at),
          assign_from: item.store?.store_name ?? '',
          vendor_name: item.vendor ? item.vendor.company_name : '-',
          no_member: item.members?.member_number ?? item.members?.id ?? '-',
          costumer_name: costumerName,
          phone_number: phoneNumber,
          order_status: item.status?.category ?? '',
          order_status_label: item.status?.description ?? '',
          work_order_status: item.work_orders?.length ? item.work_orders[0]?.status?.description : '-',
          print_counter: item.print_counter,
          payment_receipt: item.payment_type ?? '',
          payment_quotation:
            item.quotation?.length && item.quotation[0].receipt_quotation !== null
              ? item.quotation[0].receipt_quotation
              : 'UNPAID',
        }
      })

      setOrderData(formattedData)
      setTotalData(response.data.meta.total)
      setLoadData(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoadData(false)
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    setLoadData(true)
    await fetchOrderList(page, pageSize, queryparams)
  }

  const handleChangeSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value))
  }

  const handlePageChange = (page: number, size?: number) => {
    dispatch(setCurrentPage(page))
    if (size) {
      dispatch(setPageSize(size))
    }
  }

  const handleStoreChange = (newValue: SingleValue<StoreItem>) => {
    dispatch(setSelectedStore(newValue as any))
  }

  const handleVendorChange = (newValue: SingleValue<VendorItem>) => {
    dispatch(setSelectedVendor(newValue as any))
  }

  const handleFilterTable = (
    pagination: any,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<DataType> | SorterResult<DataType>[],
    extra: TableCurrentDataSource<DataType>
  ) => {
    const paymentReceiptFilter = filters['payment_receipt']
    const paymentQuotationFilter = filters['payment_quotation']
    const orderStatusFilter = filters['order_status']

    dispatch(setSelectedPaymentReceiptStatus((paymentReceiptFilter as string[]) || []))
    dispatch(setSelectedPaymentQuotationStatus((paymentQuotationFilter as string[]) || []))
    dispatch(setSelectedOrderStatus((orderStatusFilter as string[]) || []))

    let formattedStatusFilter = ''
    if (orderStatusFilter && orderStatusFilter.length > 0) {
      orderStatusFilter.forEach((status) => {
        formattedStatusFilter += `&status[]=${status}`
      })
    }

    let formattedPaymentReceiptFilter = ''
    if (paymentReceiptFilter && paymentReceiptFilter.length > 0) {
      paymentReceiptFilter.forEach((payment) => {
        formattedPaymentReceiptFilter += `&payment_type[]=${payment}`
      })
    }

    let formattedPaymentQuotationFilter = ''
    if (paymentQuotationFilter && paymentQuotationFilter.length > 0) {
      paymentQuotationFilter.forEach((payment) => {
        formattedPaymentQuotationFilter += `&payment_quotation[]=${payment}`
      })
    }

    let query = ''
    if (dateFrom && dateTo) {
      query += `&date_from=${dateFrom}&date_to=${dateTo}`
    }
    if (searchFilter) {
      query += `&search=${searchFilter}`
    }
    if (selectedStore && selectedStore.value !== null) {
      query += `&store_id=${selectedStore.value}`
    }
    if (selectedVendor && selectedVendor.value !== null) {
      query += `&vendor_id=${selectedVendor.value}`
    }

    query += formattedStatusFilter
    query += formattedPaymentReceiptFilter
    query += formattedPaymentQuotationFilter

    dispatch(setQueryParams(query))
    dispatch(setCurrentPage(1))
  }

  const handleSubmitFilter = async () => {
    let query = ''
    if (dateFrom && dateTo) {
      query += `&date_from=${dateFrom}&date_to=${dateTo}`
    }
    if (searchFilter) {
      query += `&search=${searchFilter}`
    }
    if (selectedStore && selectedStore.value !== null) {
      query += `&store_id=${selectedStore.value}`
    }
    if (selectedVendor && selectedVendor.value !== null) {
      query += `&vendor_id=${selectedVendor.value}`
    }

    dispatch(setQueryParams(query))
    dispatch(setCurrentPage(1))
  }

  const handleResetFilter = () => {
    dispatch(setDateFrom(''))
    dispatch(setDateTo(''))
    dispatch(setSearchFilter(''))
    dispatch(setSelectedStore(null as any))
    dispatch(setSelectedVendor(null as any))
    dispatch(setSelectedPaymentReceiptStatus([]))
    dispatch(setSelectedPaymentQuotationStatus([]))
    dispatch(setSelectedOrderStatus([]))
    dispatch(setQueryParams(''))
    dispatch(setCurrentPage(1))
  }

  const handleKeyPress = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Previous</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  // Columns hook
  const columns = useOrderColumns({
    userRole,
    statusFilters,
    navigate,
    orderData,
    fetchOrderData,
    getVendor,
    exportToPDF: (id, receipt, name) => exportToPDF(id, receipt, name, apiUrl),
    setShowModal,
    setModalType,
    setActiveKey,
    setSelectedCSI,
    selectedPaymentReceiptStatus,
    selectedOrderStatus,
    selectedPaymentQuotationStatus,
  })

  // Effects
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get(`${apiUrl}/status`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        setStatusData(response.data.data)
      } catch (error) {
        console.error('Error fetching statuses:', error)
      }
    }

    fetchStatuses()
    getStore()
    getVendor()
    getCSI()
  }, [])

  useEffect(() => {
    fetchData(currentPage, pageSize, queryParams)
  }, [currentPage, pageSize, queryParams])

  return (
    <section id='view-order'>
      <Card>
        <Card.Body className='table-view-order'>
          <Row className='table-head-wrapper mb-4'>
            <div className='filter-controls-container' onKeyDown={handleKeyPress}>
              <div className='d-flex align-items-center gap-2'>
                <h3 className='fs-6 fw-bold text-gray-700 m-0'>Date:</h3>
                <RangePicker
                  className='date-range-filter'
                  placeholder={['Tanggal Awal', 'Tanggal Akhir']}
                  format={'YYYY-MM-DD'}
                  value={dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : undefined}
                  onChange={(dates, dateStrings) => {
                    dispatch(setDateFrom(dateStrings[0]))
                    dispatch(setDateTo(dateStrings[1]))
                  }}
                />
              </div>

              <div className='filter-search position-relative'>
                <Form.Control
                  type='text'
                  className='filter-ltr'
                  placeholder='Cari Berdasarkan No. Order / Customer...'
                  value={searchFilter}
                  onChange={handleChangeSearchFilter}
                  onKeyDown={handleKeyPress}
                />

                <span className='search-icon'>
                  <FontAwesomeIcon icon={faSearch} size='sm' />
                </span>
              </div>

              {['Super User', 'Admin HO'].includes(userRole ?? '') && (
                <div className='select-filter-item'>
                  <Select
                    name='store_id'
                    className='form-control p-0'
                    classNamePrefix='select'
                    placeholder='Pilih Toko'
                    isSearchable={true}
                    isClearable={true}
                    options={storeOptions}
                    value={selectedStore}
                    onChange={handleStoreChange}
                  />
                </div>
              )}

              {['Super User', 'Admin HO'].includes(userRole ?? '') && (
                <div className='select-filter-item'>
                  <Select
                    name='vendor_id'
                    className='form-control p-0'
                    classNamePrefix='select'
                    placeholder='Pilih Vendor'
                    isSearchable={true}
                    isClearable={true}
                    options={vendorOptions}
                    value={selectedVendor}
                    onChange={handleVendorChange}
                  />
                </div>
              )}

              <div className='d-flex align-items-center gap-2'>
                <Button
                  className='btn-filter-submit'
                  disabled={loadingButton}
                  onClick={() => handleSubmitFilter()}
                >
                  {loadingButton ? 'Filtering..' : 'Filter'}
                </Button>
                {(dateFrom || dateTo || searchFilter || selectedStore || selectedVendor) && (
                  <Button
                    variant='light'
                    className='btn-filter-reset text-gray-700 border'
                    onClick={handleResetFilter}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </Row>

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
                dataSource={orderData}
                rowKey={(record) => record.order_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
                onChange={handleFilterTable}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Orders
            </span>

            <Pagination
              className='pagination'
              pageSize={pageSize}
              current={currentPage}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
              itemRender={itemRender}
              onChange={(page, pageSize) => {
                handlePageChange(page, pageSize)
              }}
            />
          </div>
        </Card.Body>
      </Card>

      {orderDetail && (
        <Modal
          dialogClassName='modal-verification'
          centered
          show={showModal}
          onHide={handleCloseModal}
        >
          {modalType === 1 && (
            <CustomerIndexModal
              mailLogs={mailLogs}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              userRole={userRole}
              csiData={csiData}
              selectedCSI={selectedCSI}
              setSelectedCSI={setSelectedCSI}
              loadingUpdate={loadingUpdate}
              apiUrl={apiUrl}
            />
          )}

          {modalType === 2 && (
            <QuotationModal
              show={showModal}
              handleClose={handleCloseModal}
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              handleReceiptClick={handleReceiptClick}
              handleReceiptChange={handleReceiptChange}
              handleUpdateQuotation={handleUpdateQuotation}
              loadingUpdate={loadingUpdate}
              receiptQuotation={receiptQuotation}
              quotationFiles={quotationFiles}
              handleFileReceipt={handleFileReceipt}
              handleRemoveReceipt={handleRemoveReceipt}
              handleImageClick={handleImageClick}
              handleFileChange={handleFileChange}
              handleFileClick={handleFileClick}
              handleRemoveFile={handleRemoveFile}
              singleReceipt={singleReceipt}
              handleMultiReceiptChange={handleMultiReceiptChange}
              receiptRefs={receiptRefs}
              evidenceRef={evidenceRef}
              notes={notes}
              quotation={quotation}
              setQuotation={setQuotation}
              paymentStages={paymentStages}
              visibleReceipt={visibleReceipt}
              setVisibleReceipt={setVisibleReceipt}
              previewReceipt={previewReceipt}
              setPreviewReceipt={setPreviewReceipt}
              visible={visible}
              setVisible={setVisible}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              apiUrl={apiUrl}
              setFocusedIndex={setFocusedIndex}
              selectedReceiptIndex={selectedReceiptIndex}
              selectedFileIndex={selectedFileIndex}
              orderForm={orderForm}
              setOrderForm={setOrderForm}
              vendor={vendor}
              vendorAvailbility={(d) => vendorAvailbility(d, orderForm?.request_survey)}
            />
          )}

          {modalType === 3 && (
            <RefundModal
              orderDetail={orderDetail}
              loadingModal={loadingModal}
              orderForm={orderForm}
              statusData={statusData}
              apiUrl={apiUrl}
            />
          )}
        </Modal>
      )}
    </section>
  )
}

export {ViewOrders}
