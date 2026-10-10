import React, {useState, useEffect, FC, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {SingleValue} from 'react-select'
import {PaginationProps} from 'antd'
import Swal from 'sweetalert2'
import './NewSales.css'
import {BankSelect, CategorySelect, StoreItem, Sales, DataType} from './types'
import {
  fetchStoreListApi,
  fetchBankListApi,
  fetchCategoryListApi,
  fetchSalesNextCodeApi,
  fetchSalesListApi,
  createSalesApi,
  exportSalesExcelApi,
} from './services/newSalesService'
import {getSalesColumns} from './utils/columns'
import {NewSalesFormSection} from './components/NewSalesFormSection'
import {NewSalesTableSection} from './components/NewSalesTableSection'

const NewSales: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const userRole = localStorage.getItem('userRole')
  const staffStoreId = localStorage.getItem('storeId') as any
  const staffStoreName = localStorage.getItem('storeName') as string

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  // List Store
  const [store, setStore] = useState<StoreItem[]>([])
  const storeOptions = [{value: null, label: 'All Store'}, ...store]
  const [selectedStore, setSelectedStore] = useState<SingleValue<StoreItem>>({
    value: null,
    label: 'All Store',
  })

  // List Sales
  const [salesData, setSalesData] = useState<DataType[]>([])
  const [, setExportSales] = useState<any[]>([])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)

  const [dateFrom, setDateFrom] = useState<any>('')
  const [dateTo, setDateTo] = useState<any>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Sales
  const [salesId, setSalesId] = useState<any>()
  const [salesInfo, setSalesInfo] = useState<Sales>({
    store_id: null,
    bank_id: null,
    full_name: '',
    username: '',
    account_name: '',
    phone_number: '',
    account_number: '',
    sales_brand: '',
    nik: '',
    sales_categories: [],
    password: '',
    is_active: 1,
  })

  // Bank
  const [bank, setBank] = useState<BankSelect[]>([])
  const [selectedBank, setSelectedBank] = useState<SingleValue<BankSelect>>({
    value: null,
    label: '',
  })

  // Category
  const [categories, setCategories] = useState<CategorySelect[]>([])
  const [selectedCategories, setSelectedCategories] = useState<CategorySelect[]>([])

  // Fetch API Data
  useEffect(() => {
    const getStore = async () => {
      try {
        const response = await fetchStoreListApi(apiUrl)

        if (Array.isArray(response.data.data)) {
          const tempStore = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.store_name,
          }))

          setStore(tempStore)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getBank = async () => {
      try {
        const response = await fetchBankListApi(apiUrl)

        if (Array.isArray(response.data.data)) {
          const tempBank = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.bank_name,
          }))

          setBank(tempBank)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getCategories = async () => {
      try {
        const response = await fetchCategoryListApi(apiUrl)

        if (Array.isArray(response.data.data)) {
          const tempCategories = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.category_name,
          }))

          setCategories(tempCategories)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getStore()
    getBank()
    getCategories()
    // eslint-disable-next-line
  }, [])

  // Store ID
  const storeId =
    (userRole === 'Admin HO' || userRole === 'Super User') && selectedStore && selectedStore.value
      ? `store_id=${selectedStore.value}`
      : userRole === 'Store Staff' || userRole === 'Store CS'
      ? `store_id=${staffStoreId}`
      : ''

  const storeName =
    (userRole === 'Admin HO' || userRole === 'Super User') && selectedStore && selectedStore.label
      ? `${selectedStore.label}`
      : userRole === 'Store Staff' || userRole === 'Store CS'
      ? `${staffStoreName}`
      : ''

  useEffect(() => {
    const getSalesId = async () => {
      try {
        const response = await fetchSalesNextCodeApi(apiUrl)

        if (response.status === 200) {
          const {data} = response
          setSalesId(data.data.code)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getExportData = async () => {
      try {
        const response = await fetchSalesListApi(apiUrl, 1, 0, storeId, '')

        const salesDataExport = response.data.data.map((item: any) => ({
          ['Sales ID']: item.id,
          ['Nama Toko']: item?.store?.store_name ?? '-',
          ['Nama Lengkap']: item?.full_name ?? '-',
          ['NIK']: item?.nik ?? '-',
          ['Username']: item?.users?.username ?? '-',
          ['WA/Phone Number']: item?.phone_number ?? '-',
          ['Nama Bank']: item?.bank?.bank_name ?? '-',
          ['Nomor Akun Bank']: item?.account_number ?? '-',
          ['Nama Pemilik Akun Bank']: item?.account_name ?? '-',
          ['Brands']: item?.sales_brand ?? '-',
          ['Kategori Sales']: item.sales_categories
            .map((sales_categories: any) => sales_categories?.categories?.category_name ?? '')
            .join(', '),
          ['Status']: item.is_active === true && item.deleted_at === null ? 'ACTIVE' : 'NON ACTIVE',
        }))

        setExportSales(salesDataExport)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    getSalesId()
    getExportData()
    // eslint-disable-next-line
  }, [storeId])

  // Fetch Sales List
  const fetchSalesList = async (page: number, currentSize: number, queryparams: any) => {
    try {
      const response = await fetchSalesListApi(apiUrl, page, currentSize, storeId, queryparams)

      setCurrentPage(response.data.page)
      setTotalData(response.data.total)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewSales = async (page: number, currentSize: number, queryparams: any) => {
    try {
      const apiData = await fetchSalesList(page, currentSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchVendorList')
        return []
      }

      const formattedSalesData = apiData.map((item: any, index: number) => {
        const salesCategory = item.sales_categories.map(
          (sales_categories: any) => sales_categories.categories?.category_name
        )
        const uniqueCategory = Array.from(new Set(salesCategory)).join(', ')

        return {
          no: index + 1,
          sales_id: item?.id ?? '',
          store_name: item?.store?.store_name ?? '',
          full_name: item?.full_name ?? '',
          sales_brand: item?.sales_brand ?? '-',
          sales_category: uniqueCategory,
          is_active: item.is_active === true && item.deleted_at === null ? 'ACTIVE' : 'NON ACTIVE',
          deleted_at: item.deleted_at ?? null,
        }
      })

      return formattedSalesData
    } catch (error) {
      console.error('Error getting sales list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, currentSize: number, queryparams: any) => {
    const data = await ViewSales(page, currentSize, queryparams)
    setSalesData(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
    // eslint-disable-next-line
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

  // Sales Form
  const salesInfoFormHandler = (e: any) => {
    setSalesInfo((prevSalesInfo) => ({
      ...prevSalesInfo,
      [e.target.name]: e.target.value,
    }))
  }

  // Change Select Store
  useEffect(() => {
    setSalesInfo((prev) => ({
      ...prev,
      store_id:
        userRole === 'Admin HO' || userRole === 'Super User'
          ? selectedStore?.value ?? null
          : Number.parseInt(staffStoreId),
    }))
  }, [selectedStore, userRole, staffStoreId])

  // Change Select Bank
  useEffect(() => {
    setSalesInfo((prev) => ({
      ...prev,
      bank_id: selectedBank?.value ?? null,
    }))
  }, [selectedBank])

  // Change Select Category
  const handleChangeCategories = (element: any) => {
    const updatedCategories = element.map((option: any) => ({
      value: option.value,
      label: option.label,
    }))

    setSelectedCategories(updatedCategories)

    const updatedCategoriesId = element.map((option: any) => ({
      category_id: option.value,
    }))

    setSalesInfo((prevSalesInfo) => ({
      ...prevSalesInfo,
      sales_categories: updatedCategoriesId,
    }))
  }

  // Filter Search Handler
  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  // Columns definition
  const columns = useMemo(
    () =>
      getSalesColumns({
        currentPage,
        pageSize,
        navigate,
        apiUrl,
      }),
    [currentPage, pageSize, navigate, apiUrl]
  )

  // Sales Validation
  const SalesValidation = () => {
    let valid = true

    if (salesInfo.full_name === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir Nama Sales Consultant',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.store_id === null) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong pilih formulir Nama Toko',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.phone_number === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir WA/Phone Number',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.nik === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir NIK',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.bank_id === null) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong pilih formulir Nama Bank',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.account_number === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir Nomor Akun Bank',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.account_name === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir Nama Pemilik Akun Bank',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.sales_brand === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir Brands',
        icon: 'warning',
      })
      valid = false
    } else if (salesInfo.sales_categories.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong pilih formulir Nama Category',
        icon: 'warning',
      })
      valid = false
    }

    return valid
  }

  // Destructure Object if the value null or empty string
  const objectValueCheck = (data: Sales) => {
    let cleanedData: any = {}

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        cleanedData[key] = value
      }
    })

    return cleanedData
  }

  // Handle Submit New Sales
  const handleSubmitNewSales = async () => {
    if (!SalesValidation()) {
      setIsLoading(false)
      return false
    }

    setIsLoading(true)

    const salesDataPayload = objectValueCheck(salesInfo)

    await createSalesApi(apiUrl, salesDataPayload)
      .then((response) => {
        if (response.data.status === 200 || response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Success Create Sales',
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
      })
      .catch(() => {
        setIsLoading(false)
        Swal.fire({
          title: 'Terjadi Kesalahan Pada Server',
          text: 'Tolong untuk mencoba hubungi administrator',
          icon: 'error',
        })
      })
  }

  const handleCancelCreateSales = () => {
    navigate('/home')
  }

  // Export To Excel
  const exportToExcel = () => {
    setLoadingExport(true)

    let urlParams = ''

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        urlParams += `${key}${value}`
      }
    }

    valueCheck(`?`, storeId)
    valueCheck(`&date_from=`, dateFrom)
    valueCheck(`&date_to=`, dateTo)

    exportSalesExcelApi(apiUrl, urlParams)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `List Sales ${storeName}.xlsx`)
          document.body.appendChild(link)
          link.click()

          setLoadingExport(false)
        } else {
          Swal.fire({
            title: 'Warning',
            text: response.data.message,
            icon: 'warning',
          })

          setLoadingExport(false)
        }
      })
      .catch((error) => {
        console.log(error)
        Swal.fire({
          title: 'Warning',
          text: 'Anda harus memilih toko terlebih dahulu',
          icon: 'warning',
        })
        setLoadingExport(false)
      })
  }

  // Filtering Data
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
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
    valueCheck(`&search=`, searchFilter)

    const data = await ViewSales(1, 10, queryparams)
    setSalesData(data)

    setLoadingButton(false)
  }

  return (
    <>
      <NewSalesFormSection
        userRole={userRole}
        staffStoreName={staffStoreName}
        store={store}
        setSelectedStore={setSelectedStore}
        salesId={salesId}
        bank={bank}
        setSelectedBank={setSelectedBank}
        salesInfo={salesInfo}
        salesInfoFormHandler={salesInfoFormHandler}
        categories={categories}
        selectedCategories={selectedCategories}
        handleChangeCategories={handleChangeCategories}
        handleCancelCreateSales={handleCancelCreateSales}
        handleSubmitNewSales={handleSubmitNewSales}
        isLoading={isLoading}
      />

      <NewSalesTableSection
        exportToExcel={exportToExcel}
        loadingExport={loadingExport}
        handleKeyPress={handleKeyPress}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        handleChangeSearchFilter={handleChangeSearchFilter}
        userRole={userRole}
        storeOptions={storeOptions}
        setSelectedStore={setSelectedStore}
        loadingButton={loadingButton}
        handleSubmitFilter={handleSubmitFilter}
        loadData={loadData}
        columns={columns}
        salesData={salesData}
        totalData={totalData}
        currentPage={currentPage}
        pageSize={pageSize}
        itemRender={itemRender}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
        fetchData={fetchData}
      />
    </>
  )
}

export {NewSales}
