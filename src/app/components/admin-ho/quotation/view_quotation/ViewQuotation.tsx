/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {SingleValue} from 'react-select'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, Spin, Pagination, PaginationProps} from 'antd'

import './ViewQuotation.css'
import {Props, DataType, VendorItem, DiscountType, TotalQuotationState} from './types'
import {
  fetchQuotationListApi,
  fetchVendorsPageApi,
  exportQuotationPdfApi,
  createQuotationPromotionApi,
} from './services/viewQuotationService'
import {mapQuotationItemToDataType} from './utils/quotationDataMapper'
import {getViewQuotationColumns} from './components/ViewQuotationColumns'
import {ViewQuotationFilterBar} from './components/ViewQuotationFilterBar'
import {ViewQuotationDiscountModal} from './components/ViewQuotationDiscountModal'

const ViewQuotationHO: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole') as string

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [quotationData, setQuotationData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [totalData, setTotalData] = useState<number>(0)
  const [activeQueryParams, setActiveQueryParams] = useState<string>('')

  const [dateFrom, setDateFrom] = useState<any>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  )
  const [dateTo, setDateTo] = useState<any>(new Date().toISOString().split('T')[0])
  const [searchFilter, setSearchFilter] = useState<string>('')

  const [vendor, setVendor] = useState<VendorItem[]>([])
  const [selectedVendor, setSelectedVendor] = useState<SingleValue<VendorItem>>({
    value: null,
    label: 'All Vendor',
  })

  // Modal Request Discount state
  const [quotationId, setQuotationId] = useState<any>()
  const [selectedQuotation, setSelectedQuotation] = useState<any>()
  const [quotationNotes, setQuotationNotes] = useState<any>()
  const [discountNominal, setDiscountNominal] = useState<string>('')
  const [selectedDiscountType, setSelectedDiscountType] = useState<DiscountType | null>({
    value: 2,
    label: 'Nominal (Rp.)',
  })
  const [discountType] = useState<DiscountType[]>([
    {value: 1, label: 'Persentase (%)'},
    {value: 2, label: 'Nominal (Rp.)'},
  ])
  const [showModalQuotation, setModalInvoice] = useState(false)
  const [modalType, setModalType] = useState<number | null>(null)
  const [quotationEvidence, setQuotationEvidence] = useState<Array<File | null>>([])
  const [selectedQuotationIndex, setSelectedQuotationIndex] = useState<number | null>(null)
  const [previewQuotation, setPreviewQuotation] = useState<any>()
  const [visibleInvoice, setVisibleQuotation] = useState(false)
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [totalQuotation, setTotalQuotation] = useState<TotalQuotationState>({
    grandTotalFromVendor: 0,
    promotionSurvey: 0,
    grandTotalFromMitra: 0,
    mitraMargin: 0,
    nominalMitraMargin: 0,
    vendorMargin: 0,
    nominalVendorMargin: 0,
    requestDiscount: 0,
    customerPay: 0,
    margin: 0,
    marginMitraAfterDiscount: 0,
  })

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value)
  }

  const vendorOptions: VendorItem[] = [{value: null, label: 'All Vendor'}, ...vendor]

  const getQuotationList = async (page: number, currentTake: number, queryparams: any) => {
    try {
      const response = await fetchQuotationListApi(
        apiUrl,
        page,
        currentTake,
        queryparams,
        dateFrom,
        dateTo
      )

      const resPage = Number(response?.data?.page ?? response?.data?.meta?.page ?? page)
      const resTotal = Number(response?.data?.total ?? response?.data?.meta?.total ?? 0)
      setCurrentPage(resPage)
      setTotalData(resTotal)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoadData(false)
    }
  }

  const loadQuotationData = async (page: number, currentTake: number, queryparams: any) => {
    try {
      const apiData = await getQuotationList(page, currentTake, queryparams)

      if (!apiData) {
        console.error('No data received from getQuotationList')
        return []
      }

      return apiData.map(mapQuotationItemToDataType)
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, currentTake: number, queryparams: any) => {
    const data = await loadQuotationData(page, currentTake, queryparams)
    setQuotationData(data)
  }

  useEffect(() => {
    fetchData(1, 50, '')
  }, [])

  const getVendor = async () => {
    let currentPage = 1
    const size = 20
    let allVendors: any[] = []
    let hasMoreData = true

    try {
      while (hasMoreData) {
        const response = await fetchVendorsPageApi(apiUrl, currentPage, size)
        const data = response.data.data

        if (data.length > 0) {
          const tempVendor = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.company_name,
          }))

          allVendors = [...allVendors, ...tempVendor]
          currentPage += 1
        } else {
          hasMoreData = false
        }
      }

      setVendor(allVendors)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getVendor()
    //eslint-disable-next-line
  }, [])

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    setLoadData(true)
    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)
    valueCheck(`&vendor_id=`, selectedVendor?.value)

    setActiveQueryParams(queryparams)
    setCurrentPage(1)

    const data = await loadQuotationData(1, pageSize, queryparams)
    setQuotationData(data)
    setLoadingButton(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  const exportToPDF = (order_id: number, receipt_quotation: string, customer_name: string) => {
    exportQuotationPdfApi(apiUrl, order_id)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Quotation - ${customer_name} - Order ID ${order_id}.pdf`)
        document.body.appendChild(link)
        link.click()
      })
      .catch((error: any) => {
        Swal.fire('Error', 'Terjadi kesalahan saat mengekspor data', 'error')
      })
  }

  const handleShowModal = (id: number, type: number) => {
    const selected = quotationData.find((quotation) => quotation.quotation_id === id)

    if (selected) {
      setQuotationId(selected.quotation_id)
      setSelectedQuotation(selected)
      setModalInvoice(true)
      setModalType(type)
    }
  }

  const handleCloseModalQuotation = () => {
    setModalInvoice(false)
  }

  const handleDiscountTypeChange = (newValue: DiscountType | null) => {
    setSelectedDiscountType(newValue)
    setDiscountNominal('')
  }

  const handleChangeQuotationFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...quotationEvidence]
      const mergedFiles = existingFiles.concat(file)
      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setQuotationEvidence(mergedFiles)
    }
  }

  const handleInvoiceClick = () => {
    const inputField = document.querySelector('.input-field-quotation') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFiles = (index: number) => {
    const newEvidances = [...quotationEvidence]
    newEvidances.splice(index, 1)
    setQuotationEvidence(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileQuotation = (index: number) => {
    setPreviewQuotation(quotationEvidence[index]?.name)
    setVisibleQuotation(true)
    setSelectedQuotationIndex(index)
  }

  const handleCreateRequest = async () => {
    setIsLoading(true)
    const formData = new FormData()

    formData.append(`quotation_id`, quotationId)
    formData.append(`status`, String(1))
    formData.append(`description`, quotationNotes)
    formData.append(`promotion_nominal`, discountNominal)

    if (quotationEvidence?.length) {
      quotationEvidence.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_promotion_evidences`, item, (item as File).name)
        }
      })
    }

    try {
      const response = await createQuotationPromotionApi(apiUrl, formData)

      if (response.data.status === 201 || response.data.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil Melakukan Pengajuan',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate('/quotation/view-request-discount')
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
        Swal.fire({title: 'Error', text: response.data.message, icon: 'error'})
      }
    } catch (error) {
      console.log('error', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setTotalQuotation((prev) => {
      const discountAmount =
        selectedDiscountType?.value === 1
          ? totalQuotation.grandTotalFromVendor * (Number(discountNominal) / 100) || 0
          : Number(discountNominal) || 0

      return {
        ...prev,
        grandTotalFromVendor: selectedQuotation?.quotation_detail?.reduce(
          (total: any, item: any) => total + parseInt(item?.final_price ?? 0),
          0
        ),
        promotionSurvey: parseInt(selectedQuotation?.promotion?.promotion ?? 0),
        grandTotalFromMitra: parseInt(selectedQuotation?.quotation_grand_total ?? 0),
        mitraMargin: 100 - parseInt(selectedQuotation?.order_detail?.vendor?.margin_nominal ?? 0),
        nominalMitraMargin:
          totalQuotation.grandTotalFromVendor * (totalQuotation.mitraMargin / 100),
        vendorMargin: parseInt(selectedQuotation?.order_detail?.vendor?.margin_nominal ?? 0),
        nominalVendorMargin:
          (totalQuotation.grandTotalFromVendor * totalQuotation.vendorMargin) / 100,
        requestDiscount: discountAmount,
        customerPay: totalQuotation.grandTotalFromMitra - discountAmount,
        margin: totalQuotation.customerPay - totalQuotation.nominalVendorMargin,
        marginMitraAfterDiscount: Math.ceil(
          (totalQuotation.margin / totalQuotation.customerPay) * 100
        ),
      }
    })
  }, [
    selectedQuotation,
    discountNominal,
    totalQuotation.margin,
    totalQuotation.requestDiscount,
    totalQuotation.customerPay,
    totalQuotation.nominalVendorMargin,
  ])

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  const columns = getViewQuotationColumns({
    navigate,
    userRole,
    exportToPDF,
    handleShowModal,
  })

  return (
    <section id='view-quotation'>
      <div className={`card ${className}`}>
        <div className='card-body'>
          <ViewQuotationFilterBar
            handleKeyPress={handleKeyPress}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            handleChangeSearchFilter={handleChangeSearchFilter}
            vendorOptions={vendorOptions}
            selectedVendor={selectedVendor}
            setSelectedVendor={setSelectedVendor}
            loadingButton={loadingButton}
            handleSubmitFilter={handleSubmitFilter}
          />

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
                dataSource={quotationData}
                rowKey={(record) => record.quotation_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Total Quotation
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              pageSize={pageSize}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100, 250, 500]}
              itemRender={itemRender}
              onChange={(page, newPageSize) => {
                setPageSize(newPageSize)
                setCurrentPage(page)
                setLoadData(true)
                fetchData(page, newPageSize, activeQueryParams)
              }}
            />
          </div>
        </div>
      </div>

      <ViewQuotationDiscountModal
        showModalQuotation={showModalQuotation}
        handleCloseModalQuotation={handleCloseModalQuotation}
        modalType={modalType}
        selectedQuotation={selectedQuotation}
        quotationNotes={quotationNotes}
        setQuotationNotes={setQuotationNotes}
        totalQuotation={totalQuotation}
        discountType={discountType}
        selectedDiscountType={selectedDiscountType}
        handleDiscountTypeChange={handleDiscountTypeChange}
        discountNominal={discountNominal}
        setDiscountNominal={setDiscountNominal}
        handleInvoiceClick={handleInvoiceClick}
        evidenceRef={evidenceRef}
        handleChangeQuotationFile={handleChangeQuotationFile}
        quotationEvidence={quotationEvidence}
        handleFileQuotation={handleFileQuotation}
        handleRemoveFiles={handleRemoveFiles}
        selectedQuotationIndex={selectedQuotationIndex}
        previewQuotation={previewQuotation}
        visibleInvoice={visibleInvoice}
        setVisibleQuotation={setVisibleQuotation}
        apiUrl={apiUrl}
        handleCreateRequest={handleCreateRequest}
        isLoading={isLoading}
      />
    </section>
  )
}

export {ViewQuotationHO}
