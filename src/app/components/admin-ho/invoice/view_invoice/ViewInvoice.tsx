/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, FC, useRef, useCallback, useMemo} from 'react'
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
  setSelectedVendor,
} from '../../../../../store/invoiceSlice'
import './ViewInvoice.css'
import Swal from 'sweetalert2'
import {SingleValue} from 'react-select'
import {PaginationProps} from 'antd'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'
import {DataType, VendorItem} from './types'
import {
  fetchInvoiceListApi,
  fetchVendorPageApi,
  updateInvoiceStatusApi,
  uploadExcelInvoiceApi,
  exportInvoiceExcelApi,
} from './services/viewInvoiceService'
import {getInvoiceColumns} from './utils/columns'
import {ViewInvoiceFilterBar} from './components/ViewInvoiceFilterBar'
import {ViewInvoiceTableSection} from './components/ViewInvoiceTableSection'
import {ViewInvoiceUploadExcelModal} from './components/ViewInvoiceUploadExcelModal'
import {ViewInvoiceActionModal} from './components/ViewInvoiceActionModal'

const ViewInvoiceHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const userRole = localStorage.getItem('userRole') as string

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Loading State
  const [loadingTemplate, setLoadingTemplate] = useState<boolean>(false)
  const [loadingUploadExcel, setLoadingUploadExcel] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  // Table State
  const [invoiceData, setInvoiceData] = useState<DataType[]>([])
  const [totalData, setTotalData] = useState<number>(0)
  const {queryParams, searchFilter, currentPage, pageSize, dateFrom, dateTo, selectedVendor} =
    useSelector((state: RootState) => state.invoice)

  // Vendor
  const [vendor, setVendor] = useState<VendorItem[]>([])
  const vendorOptions = [{value: null, label: 'All Vendor'}, ...vendor]

  // Update Invoice
  const [invoiceId, setInvoiceId] = useState<any>()
  const [invoiceNotes, setInvoiceNotes] = useState<any>()

  // Filter Table
  const handleChangeSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value))
  }

  const handleVendorChange = (newValue: SingleValue<VendorItem>) => {
    const selectedVendorItem: VendorItem = newValue || {value: null, label: 'All Vendor'}
    dispatch(setSelectedVendor(selectedVendorItem))
  }

  const handlePageChange = (page: number, size?: number) => {
    dispatch(setCurrentPage(page))
    if (size) {
      dispatch(setPageSize(size))
    }
  }

  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  const handleDateChange = (values: any) => {
    if (values && values.length === 2) {
      const dateFromFormatted = values[0]?.format('YYYY-MM-DD') || ''
      const dateToFormatted = values[1]?.format('YYYY-MM-DD') || ''

      dispatch(setDateFrom(dateFromFormatted))
      dispatch(setDateTo(dateToFormatted))
    } else {
      dispatch(setDateFrom(''))
      dispatch(setDateTo(''))
    }
  }

  // Modals state
  const [invoiceEvidence, setInvoiceEvidence] = useState<Array<File | null>>([])
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<any>()
  const [visibleInvoice, setVisibleInvoice] = useState(false)
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [showModalInvoice, setModalInvoice] = useState(false)
  const [modalType, setModalType] = useState<number | null>(null)
  const handleCloseModalInvoice = () => {
    setModalInvoice(false)
  }

  const [excel, setExcel] = useState<File | null>(null)
  const [showModalUpload, setModalUpload] = useState(false)
  const handleCloseModalUpload = () => {
    setModalUpload(false)
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

  const handleShowModal = (id: number, type: number) => {
    const selected = invoiceData.find((inv) => inv.invoice_id === id)

    if (selected) {
      setInvoiceId(selected.invoice_id)
      setModalInvoice(true)
      setModalType(type)
    }
  }

  // Handle Update Status
  const handleUpdateInvoice = async (id: number, status: number, statusName: string) => {
    const formData = new FormData()
    formData.append('status', String(status))

    const textConfirmation = `Apakah Anda yakin ingin mengubah status invoice ini menjadi ${statusName} ?`

    Swal.fire({
      title: textConfirmation,
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#6b9230',
      showDenyButton: true,
      confirmButtonText: 'Ya',
      denyButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true)
        try {
          const response = await updateInvoiceStatusApi(apiUrl, id, formData)
          if (response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Berhasil mengubah status Invoice',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
            })
            setIsLoading(false)
          } else {
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error',
            })
            setIsLoading(false)
          }

          window.location.reload()
        } catch (error: any) {
          console.error(error)
          setIsLoading(false)
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Something went wrong',
            icon: 'error',
          })
        }
      } else {
        setIsLoading(false)
      }
    })
  }

  // Columns definition
  const columns = useMemo(
    () =>
      getInvoiceColumns({
        userRole,
        navigate,
        handleShowModal,
        handleUpdateInvoice,
      }),
    [userRole, navigate, invoiceData]
  )

  const getInvoiceList = async (page: number, size: number, params: any) => {
    const statuses = ['Finance'].includes(userRole) ? '&status=5,6' : ''
    const response = await fetchInvoiceListApi(
      apiUrl,
      page,
      size,
      params,
      statuses,
      dateFrom,
      dateTo
    )

    setLoadData(false)
    setCurrentPage(response?.data?.page ?? 1)
    setTotalData(response?.data?.total ?? 0)

    return response.data.data
  }

  const ViewInvoice = async (page: number, size: number, params: any) => {
    try {
      const apiData = await getInvoiceList(page, size, params)

      if (!apiData) {
        console.error('No data received from getInvoiceList')
        return []
      }

      const formattedInvoiceData = apiData.map((item: any) => {
        const invoiceDate = formatDateWithTimeZone(item?.created_at)

        const invoiceStatus = (status: number) => {
          switch (status) {
            case 1:
              return 'Pengecekan invoice'
            case 2:
              return 'Invoice disetujui'
            case 3:
              return 'Invoice ditolak'
            case 4:
              return 'Menunggu dokumen tagihan'
            case 5:
              return 'Invoice diberikan kepada finance'
            case 6:
              return 'Invoice sudah dibayarkan'
            case 7:
              return 'Dokumen ditolak'
            default:
              return ''
          }
        }

        return {
          invoice_id: item?.id,
          invoice_date: invoiceDate,
          vendor_name: item?.vendor?.company_name ?? '-',
          amount: `Rp. ${parseInt(item?.total_amount).toLocaleString('id')}`,
          status: item?.status,
          invoice_status: invoiceStatus(item?.status),
        }
      })

      return formattedInvoiceData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, size: number, params: any) => {
    const data = await ViewInvoice(page, size, params)
    setInvoiceData(data)
  }

  useEffect(() => {
    fetchData(currentPage, pageSize, queryParams)
    // eslint-disable-next-line
  }, [currentPage, pageSize, queryParams])

  const getVendor = async () => {
    let currentVendorPage = 1
    const vendorPageSize = 20
    let allVendors: any[] = []
    let hasMoreData = true

    try {
      while (hasMoreData) {
        const response = await fetchVendorPageApi(apiUrl, currentVendorPage, vendorPageSize)
        const data = response.data.data

        if (data.length > 0) {
          const tempVendor = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.company_name,
          }))

          allVendors = [...allVendors, ...tempVendor]
          currentVendorPage += 1
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
    // eslint-disable-next-line
  }, [])

  // Filter submit
  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    let params = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        params += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)
    valueCheck(`&vendor_id=`, selectedVendor?.value)
    dispatch(setQueryParams(params))

    const data = await ViewInvoice(currentPage, pageSize, params)
    setInvoiceData(data)

    setLoadingButton(false)
  }

  // Upload Evidence Handler
  const handleInvoiceEvidenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...invoiceEvidence]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setInvoiceEvidence(mergedFiles)
    }
  }

  const handleInvoiceClick = () => {
    const inputField = document.querySelector('.input-field-invoice') as HTMLInputElement
    inputField?.click()
  }

  const handleRemoveFiles = (index: number) => {
    const newEvidances = [...invoiceEvidence]
    newEvidances.splice(index, 1)
    setInvoiceEvidence(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileInvoice = (index: number) => {
    setPreviewInvoice(invoiceEvidence[index]?.name)
    setVisibleInvoice(true)
    setSelectedInvoiceIndex(index)
  }

  const handleDeclineInvoice = async (statusInvoice: number) => {
    setIsLoading(true)
    const formData = new FormData()

    formData.append(`invoice_id`, invoiceId)
    formData.append(`notes`, invoiceNotes)
    formData.append(`status`, String(statusInvoice))

    if (invoiceEvidence?.length) {
      invoiceEvidence.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`invoice_evidences`, item, item.name)
        }
      })
    }

    try {
      const response = await updateInvoiceStatusApi(apiUrl, invoiceId, formData)
      if (response.data.status === 201 || response.data.status === 200) {
        Swal.fire({
          title: 'Success',
          text: `${
            statusInvoice === 3
              ? 'Berhasil menolak invoice yang akan ditagihkan'
              : 'Berhasil menolak dokumen tagihan'
          }`,
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.data.message,
          icon: 'error',
        })
      }

      setIsLoading(false)
      window.location.reload()
    } catch (error: any) {
      setIsLoading(false)
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message,
        icon: 'error',
      })
    }
  }

  const handleUploadInvoiceFile = async () => {
    const formData = new FormData()

    formData.append(`invoice_id`, invoiceId)
    formData.append(`status`, String(6))

    if (invoiceEvidence?.length) {
      invoiceEvidence.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`invoice_evidences`, item, item.name)
        }
      })
    }

    try {
      const response = await updateInvoiceStatusApi(apiUrl, invoiceId, formData)
      if (response.data.status === 201 || response.data.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil Mengupload File Bukti Pembayaran',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.data.message,
          icon: 'error',
        })
      }

      window.location.reload()
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message,
        icon: 'error',
      })
    }
  }

  const handleUpload = async () => {
    setLoadingUploadExcel(true)

    const formData = new FormData()
    if (excel !== null) {
      formData.append('excel_file', excel)
    }

    try {
      const response = await uploadExcelInvoiceApi(apiUrl, formData)
      if (response.data.status === 201) {
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

      window.location.reload()
    } catch (error: any) {
      setLoadingUploadExcel(false)
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message,
        icon: 'error',
      })
    }
  }

  // Export Template Excel
  const exportTemplate = useCallback(() => {
    setLoadingTemplate(true)

    exportInvoiceExcelApi(
      apiUrl,
      dateFrom,
      dateTo,
      selectedVendor ? selectedVendor.value : null
    )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Invoice Periode ${dateFrom} - ${dateTo}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      })
      .catch((error) => {
        console.error('Export failed:', error)
      })
      .finally(() => {
        setLoadingTemplate(false)
      })
  }, [apiUrl, dateFrom, dateTo, selectedVendor])

  return (
    <section id='view-invoice'>
      <div className='card'>
        <div className='card-body table-view-order'>
          <ViewInvoiceFilterBar
            exportTemplate={exportTemplate}
            loadingTemplate={loadingTemplate}
            handleKeyPress={handleKeyPress}
            handleDateChange={handleDateChange}
            handleChangeSearchFilter={handleChangeSearchFilter}
            vendorOptions={vendorOptions}
            selectedVendor={selectedVendor}
            handleVendorChange={handleVendorChange}
            loadingButton={loadingButton}
            handleSubmitFilter={handleSubmitFilter}
          />

          <ViewInvoiceTableSection
            loadData={loadData}
            columns={columns}
            invoiceData={invoiceData}
            currentPage={currentPage}
            pageSize={pageSize}
            totalData={totalData}
            itemRender={itemRender}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>

      <ViewInvoiceUploadExcelModal
        showModalUpload={showModalUpload}
        handleCloseModalUpload={handleCloseModalUpload}
        handleFileChange={handleFileChange}
        handleFileRemove={handleFileRemove}
        excel={excel}
        handleUpload={handleUpload}
        loadingUploadExcel={loadingUploadExcel}
      />

      <ViewInvoiceActionModal
        showModalInvoice={showModalInvoice}
        handleCloseModalInvoice={handleCloseModalInvoice}
        modalType={modalType}
        invoiceNotes={invoiceNotes}
        setInvoiceNotes={setInvoiceNotes}
        handleInvoiceClick={handleInvoiceClick}
        evidenceRef={evidenceRef}
        handleInvoiceEvidenceChange={handleInvoiceEvidenceChange}
        invoiceEvidence={invoiceEvidence}
        handleFileInvoice={handleFileInvoice}
        handleRemoveFiles={handleRemoveFiles}
        selectedInvoiceIndex={selectedInvoiceIndex}
        previewInvoice={previewInvoice}
        apiUrl={apiUrl}
        visibleInvoice={visibleInvoice}
        setVisibleInvoice={setVisibleInvoice}
        handleDeclineInvoice={handleDeclineInvoice}
        handleUploadInvoiceFile={handleUploadInvoiceFile}
        isLoading={isLoading}
      />
    </section>
  )
}

export {ViewInvoiceHO}
