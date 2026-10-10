/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-computed-key */
import React, {useState, useEffect, FC, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {SingleValue} from 'react-select'
import {PaginationProps} from 'antd'
import Swal from 'sweetalert2'
import './NewManager.css'
import {BankSelect, StoreItem, Manager, DataType} from './types'
import {
  fetchStoreListApi,
  fetchBankListApi,
  fetchManagerNextCodeApi,
  fetchManagerListApi,
  createManagerApi,
  exportManagerExcelApi,
} from './services/newManagerService'
import {getManagerColumns} from './utils/columns'
import {NewManagerFormSection} from './components/NewManagerFormSection'
import {NewManagerTableSection} from './components/NewManagerTableSection'

const NewManager: FC = () => {
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

  // List Manager
  const [managerData, setManagerData] = useState<DataType[]>([])
  const [, setExportSales] = useState<any[]>([])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)

  const [dateFrom, setDateFrom] = useState<any>('')
  const [dateTo, setDateTo] = useState<any>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Manager
  const [managerId, setManagerId] = useState<any>()
  const [managerInfo, setManagerInfo] = useState<Manager>({
    id: null,
    store_id: null,
    bank_id: null,
    full_name: '',
    username: '',
    nik: '',
    account_name: '',
    phone_number: '',
    account_number: '',
    password: '',
    is_active: 1,
  })

  // Bank
  const [bank, setBank] = useState<BankSelect[]>([])
  const [selectedBank, setSelectedBank] = useState<SingleValue<BankSelect>>({
    value: null,
    label: '',
  })

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

    getStore()
    getBank()
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
        const response = await fetchManagerNextCodeApi(apiUrl)

        if (response.status === 200) {
          const {data} = response
          setManagerId(data.data.code)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getExportData = async () => {
      try {
        const response = await fetchManagerListApi(apiUrl, 1, 0, storeId, '')

        const managerDataExport = response.data.data.map((item: any) => ({
          ['Manager ID']: item.id,
          ['Nama Toko']: item?.store?.store_name ?? '-',
          ['Nama Lengkap']: item?.full_name ?? '-',
          ['Username']: item?.users?.username ?? '-',
          ['WA/Phone Number']: item?.phone_number ?? '-',
          ['NIK']: item?.nik ?? '-',
          ['Nama Bank']: item?.bank?.bank_name ?? '-',
          ['Nomor Akun Bank']: item?.account_number ?? '-',
          ['Nama Pemilik Akun Bank']: item?.account_name ?? '-',
          ['Status']: item.is_active === true ? 'ACTIVE' : 'NON ACTIVE',
        }))

        setExportSales(managerDataExport)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    getSalesId()
    getExportData()
    // eslint-disable-next-line
  }, [storeId])

  // Fetch Manager List
  const fetchManagerList = async (page: number, currentSize: number, queryparams: any) => {
    try {
      const response = await fetchManagerListApi(apiUrl, page, currentSize, storeId, queryparams)

      setCurrentPage(response.data.page)
      setTotalData(response.data.total)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewManager = async (page: number, currentSize: number, queryparams: any) => {
    try {
      const apiData = await fetchManagerList(page, currentSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchManagerList')
        return []
      }

      const formattedManagerData = apiData.map((item: any, index: number) => {
        return {
          no: index + 1,
          manager_id: item?.id ?? '',
          store_name: item?.store?.store_name ?? '',
          full_name: item?.full_name ?? '',
          nik: item?.nik ?? '',
          is_active: item.is_active === true ? 'ACTIVE' : 'NON ACTIVE',
        }
      })

      return formattedManagerData
    } catch (error) {
      console.error('Error getting sales list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, currentSize: number, queryparams: any) => {
    const data = await ViewManager(page, currentSize, queryparams)
    setManagerData(data)
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

  // Manager Form
  const salesInfoFormHandler = (e: any) => {
    setManagerInfo((prevSalesInfo: any) => ({
      ...prevSalesInfo,
      [e.target.name]: e.target.value,
    }))
  }

  // Change Select Store
  useEffect(() => {
    setManagerInfo((prev: any) => ({
      ...prev,
      store_id:
        userRole === 'Admin HO' || userRole === 'Super User'
          ? selectedStore?.value ?? null
          : Number.parseInt(staffStoreId),
    }))
  }, [staffStoreId, userRole, selectedStore])

  // Change Select Bank
  useEffect(() => {
    setManagerInfo((prev: any) => ({
      ...prev,
      bank_id: selectedBank?.value ?? null,
    }))
  }, [selectedBank])

  // Filter Search Handler
  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  // Columns definition
  const columns = useMemo(
    () =>
      getManagerColumns({
        currentPage,
        pageSize,
        navigate,
        apiUrl,
      }),
    [currentPage, pageSize, navigate, apiUrl]
  )

  // Manager Validation
  const SalesValidation = () => {
    let valid = true

    if (managerInfo.full_name === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir Nama Manajer',
        icon: 'warning',
      })
      valid = false
    } else if (managerInfo.phone_number === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir WA/Phone Number',
        icon: 'warning',
      })
      valid = false
    } else if (managerInfo.bank_id === null) {
      Swal.fire({
        title: 'Warning',
        text: 'Please pilih formulir Nama Bank',
        icon: 'warning',
      })
      valid = false
    } else if (managerInfo.account_number === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir Nomor Akun Bank',
        icon: 'warning',
      })
      valid = false
    } else if (managerInfo.account_name === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir Nama Pemilik Akun Bank',
        icon: 'warning',
      })
      valid = false
    }

    return valid
  }

  // Destructure Object if the value null or empty string
  const objectValueCheck = (data: Manager) => {
    let cleanedData: any = {}

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        cleanedData[key] = value
      }
    })

    return cleanedData
  }

  // Handle Submit New Manager
  const handleSubmitNewManager = async () => {
    if (!SalesValidation()) {
      setIsLoading(false)
      return false
    }

    setIsLoading(true)

    const managerDataPayload = objectValueCheck(managerInfo)

    await createManagerApi(apiUrl, managerDataPayload)
      .then((response) => {
        if (response.data.status === 200 || response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Success Create Manager',
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

    exportManagerExcelApi(apiUrl, urlParams)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `List Manager ${storeName}.xlsx`)
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

    const data = await ViewManager(1, 10, queryparams)
    setManagerData(data)

    setLoadingButton(false)
  }

  return (
    <>
      <NewManagerFormSection
        userRole={userRole}
        staffStoreName={staffStoreName}
        store={store}
        setSelectedStore={setSelectedStore}
        managerId={managerId}
        bank={bank}
        setSelectedBank={setSelectedBank}
        managerInfo={managerInfo}
        salesInfoFormHandler={salesInfoFormHandler}
        handleCancelCreateSales={handleCancelCreateSales}
        handleSubmitNewManager={handleSubmitNewManager}
        isLoading={isLoading}
      />

      <NewManagerTableSection
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
        managerData={managerData}
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

export {NewManager}
