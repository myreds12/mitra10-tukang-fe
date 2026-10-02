import React, {useState, useEffect, FC} from 'react'
import {useNavigate} from 'react-router-dom'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'

import './NewSales.css'

import axios from 'axios'
import Select, {SingleValue} from 'react-select'
import {Table, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import Swal from 'sweetalert2'
import makeAnimated from 'react-select/animated'
import {Row, Col, Form, InputGroup, Button, Card, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faPen,
  faTrash,
  faSearch,
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'

const {RangePicker} = DatePicker

interface BankSelect {
  value: number | null
  label: string
}

interface CategorySelect {
  value: number | null
  label: string
}

interface StoreItem {
  value: number | null
  label: string
}

interface Sales {
  store_id: number | null
  bank_id: number | null
  full_name: string
  username: string
  account_name: string
  phone_number: string
  account_number: string
  nik: string
  sales_brand: string
  sales_categories: CategorySelect[]
  password: string
  is_active: number
}

const NewSales: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const animatedComponents = makeAnimated()

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
        const response = await axiosInstance.get(`${apiUrl}/stores?take=0`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

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
        const response = await axios.get(`${apiUrl}/bank?take=0`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

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
        const response = await axios.get(`${apiUrl}/categories?take=0`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

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

  useEffect(() => {
    const getSalesId = async () => {
      try {
        const response = await axios.get(`${apiUrl}/sales/next-code`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

        if (response.status === 200) {
          const {data} = response
          setSalesId(data.data.code)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const getExportData = async () => {
      let apiUrlWithParams = `${apiUrl}/sales?order_by=desc&take=0&${storeId}`

      try {
        const response = await axios.get(apiUrlWithParams, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

        const salesData = response.data.data.map((item: any) => ({
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

        setExportSales(salesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    getSalesId()
    getExportData()
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

  // Fetch Sales List
  const fetchSalesList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/sales?order_by=desc&page=${page}&take=${pageSize}&${storeId}${queryparams}`

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response.data.page)
      setTotalData(response.data.total)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewSales = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await fetchSalesList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchVendorList')
        return []
      }

      const salesData = apiData.map((item: any, index: number) => {
        let data

        const salesCategory = item.sales_categories.map(
          (sales_categories: any) => sales_categories.categories.category_name
        )
        const uniqueCategory = Array.from(new Set(salesCategory)).join(', ')

        data = {
          no: index + 1,
          sales_id: item?.id ?? '',
          store_name: item?.store?.store_name ?? '',
          full_name: item?.full_name ?? '',
          sales_brand: item?.sales_brand ?? '-',
          sales_category: uniqueCategory,
          is_active: item.is_active === true && item.deleted_at === null ? 'ACTIVE' : 'NON ACTIVE',
          deleted_at: item.deleted_at ?? null,
        }

        return data
      })

      return salesData
    } catch (error) {
      console.error('Error getting sales list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewSales(page, pageSize, queryparams)
    setSalesData(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
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
  }, [selectedStore])

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

  // Data Type List Sales
  interface DataType {
    no: number
    sales_id: number
    store_name: string
    full_name: string
    sales_brand: string
    sales_category: string
    is_active: string
    deleted_at: string | null
  }

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: 70,
      className: 'col_order_id',
      sorter: (a, b) => a.no - b.no,
      render: (text: any, record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Sales ID',
      dataIndex: 'sales_id',
      key: 'sales_id',
      align: 'center',
      width: 70,
      className: 'col_order_id',
      sorter: (a, b) => a.sales_id - b.sales_id,
    },
    {
      title: 'Assign From Store',
      dataIndex: 'store_name',
      key: 'store_name',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.store_name.includes(String(value)),
      sorter: (a, b) => a.store_name.length - b.store_name.length,
    },
    {
      title: 'Nama Sales',
      dataIndex: 'full_name',
      key: 'full_name',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.full_name.includes(String(value)),
      sorter: (a, b) => a.full_name.length - b.full_name.length,
    },
    {
      title: 'Brands',
      dataIndex: 'sales_brand',
      key: 'sales_brand',
      align: 'left',
      width: 120,
      onFilter: (value, record) => record.sales_brand.includes(String(value)),
      sorter: (a, b) => a.sales_brand.length - b.sales_brand.length,
    },
    {
      title: 'Category',
      dataIndex: 'sales_category',
      key: 'sales_category',
      align: 'left',
      width: 120,
      onFilter: (value, record) => record.sales_category.includes(String(value)),
      sorter: (a, b) => a.sales_category.length - b.sales_category.length,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'left',
      width: 110,
      onFilter: (value, record) => record.is_active.includes(String(value)),
      sorter: (a, b) => a.is_active.length - b.is_active.length,
      filters: [
        {text: 'ACTIVE', value: 'ACTIVE'},
        {text: 'INACTIVE', value: 'INACTIVE'},
      ],
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 45,
      render: (record) => {
        const id = record.sales_id
        const isActive = record.is_active
        const isDeleted = record.deleted_at

        const handleUpdateId = () => {
          navigate(`/sales/update-sales/${id}`)
        }

        const handleDeleteId = () => {
          Swal.fire({
            title: 'Konfirmasi Penghapusan Data Sales',
            text: 'Anda akan menghapus data sales ini. Harap diperhatikan bahwa seluruh informasi terkait sales ini akan hilang dan tidak dapat dipulihkan. Apakah Anda yakin?',
            icon: 'error',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Hapus Permanen',
            denyButtonText: 'Batal',
            denyButtonColor: '#183383',
            confirmButtonColor: '#6E010F',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .delete(`${apiUrl}/sales/${id}`, {
                    headers: {
                      Accept: 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                      // 'Access-Control-Allow-Origin': '*',
                     // 'ngrok-skip-browser-warning':  'true',
                    },
                  })
                  .then((response) => {
                    Swal.fire({
                      title: 'Berhasil',
                      text: 'Akun sales berhasil dihapus',
                      icon: 'success',
                    }).then(() => {
                      window.location.reload()
                    })
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.response.data.message,
                      icon: 'error',
                    })
                  })
              }
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error',
                text: error.response.data.message,
                icon: 'error',
              })
            })
        }

        const handleActive = () => {
          Swal.fire({
            title: 'Konfirmasi Aktivasi Akun Sales',
            text: 'Anda akan mengaktifkan kembali akun sales ini. Sales akan memiliki akses penuh.',
            icon: 'question',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya, Aktifkan',
            denyButtonText: 'Batal',
            denyButtonColor: '#6E010F',
            confirmButtonColor: '#3D6500',
          })
            .then((willActive) => {
              if (willActive.value) {
                axios
                  .post(
                    `${apiUrl}/sales/${id}`,
                    {
                      is_active: 1,
                    },
                    {
                      headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        // 'Access-Control-Allow-Origin': '*',
                       // 'ngrok-skip-browser-warning':  'true',
                      },
                    }
                  )
                  .then((response) => {
                    Swal.fire({
                      title: 'Berhasil',
                      text: 'Berhasil mengaktifkan akun sales',
                      icon: 'success',
                      showConfirmButton: false,
                    }).then(() => {
                      window.location.reload()
                    })
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.response.data.message,
                      icon: 'error',
                    })
                  })
              }
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error',
                text: error.response.data.message,
                icon: 'error',
              })
            })
        }

        const handleNonActive = () => {
          Swal.fire({
            title: 'Konfirmasi Penonaktifan Akun',
            text: 'Anda akan menonaktifkan akun sales ini. Tindakan ini akan membatasi akses sales terkait. Lanjutkan?',
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya, Nonaktifkan',
            denyButtonText: 'Batal',
            denyButtonColor: '#183383',
            confirmButtonColor: '#6E010F',
          })
            .then((willActive) => {
              if (willActive.value) {
                axios
                  .post(
                    `${apiUrl}/sales/${id}`,
                    {
                      is_active: 0,
                    },
                    {
                      headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        // 'Access-Control-Allow-Origin': '*',
                       // 'ngrok-skip-browser-warning':  'true',
                      },
                    }
                  )
                  .then((response) => {
                    Swal.fire({
                      title: 'Berhasil',
                      text: 'Berhasil menonaktifkan akun sales',
                      icon: 'success',
                      showConfirmButton: false,
                    }).then(() => {
                      window.location.reload()
                    })
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.response.data.message,
                      icon: 'error',
                    })
                  })
              }
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error',
                text: error.response.data.message,
                icon: 'error',
              })
            })
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            {isActive === 'NON ACTIVE' && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Aktifkan Sales')}
              >
                <Button className='button-active' variant='success' onClick={handleActive}>
                  <FontAwesomeIcon className='text-white' icon={faCircleCheck} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}

            {isActive === 'ACTIVE' && !isDeleted && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Nonaktifkan Sales')}
              >
                <Button className='button-disable' variant='danger' onClick={handleNonActive}>
                  <FontAwesomeIcon className='text-white' icon={faCircleXmark} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Edit Sales')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdateId}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Hapus Sales')}
            >
              <Button className='button-delete' variant='danger' onClick={handleDeleteId}>
                <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>
          </div>
        )
      },
    },
  ]

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

  // Desctructure Object if the value null or empty string
  const objectValueCheck = (data: Sales) => {
    let cleanedData: Partial<Sales> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        cleanedData[key as keyof Sales] = value
      }
    })

    return cleanedData
  }

  // Clear State After Submit
  const clear = () => {
    setSalesInfo({
      ...salesInfo,
      bank_id: null,
      full_name: '',
      username: '',
      nik: '',
      account_name: '',
      phone_number: '',
      account_number: '',
      sales_brand: '',
      password: '',
      sales_categories: [],
    })

    setSelectedBank({
      value: null,
      label: 'Pilih Nama Bank',
    })
  }

  // Handle Submit New Sales
  const handleSubmitNewSales = async () => {
    if (!SalesValidation()) {
      setIsLoading(false)
      return false
    }

    setIsLoading(true)

    const salesData = objectValueCheck(salesInfo)

    await axios
      .post(`${apiUrl}/sales`, salesData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
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
          // setIsSuccess(true)
          // clear()
          // handleSubmitFilter()
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
      .catch((error) => {
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

    let url = `${apiUrl}/sales/export-excel`

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        url += `${key}${value}`
      }
    }

    valueCheck(`?`, storeId)
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
      <section id='new-sales'>
        <Card className='mb-5'>
          <Card.Header>
            <Card.Title>Profile</Card.Title>
          </Card.Header>

          <Card.Body>
            <div className='form-wrapper'>
              <Row className='form-header'>
                <Form.Group as={Row}>
                  <Form.Label column sm='4'>
                    Nama Toko
                    {userRole === 'Admin HO' || userRole === 'Super User' ? (
                      <Select
                        name='store_id'
                        className='form-control p-0'
                        classNamePrefix='select'
                        placeholder='Pilih Toko'
                        isSearchable={true}
                        options={store}
                        onChange={(newValue) => setSelectedStore(newValue)}
                      />
                    ) : (
                      <span className='fs-6 ms-2 pt-2 pb-2 fw-semibold bg-secondary'>
                        {staffStoreName}
                      </span>
                    )}
                  </Form.Label>
                </Form.Group>
              </Row>

              <Row>
                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>Sales ID</Form.Label>
                    <Form.Control readOnly type='number' value={salesId} />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>Nama Bank</Form.Label>

                    <Select
                      classNamePrefix='select'
                      placeholder='Pilih Nama Bank'
                      isSearchable={true}
                      options={bank}
                      onChange={(newValue) => setSelectedBank(newValue)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>Brands</Form.Label>

                    <Form.Control
                      name='sales_brand'
                      type='text'
                      value={salesInfo.sales_brand}
                      onChange={(e) => salesInfoFormHandler(e)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>Nama Sales Consultant</Form.Label>
                    <Form.Control
                      name='full_name'
                      type='text'
                      value={salesInfo.full_name}
                      onChange={(e) => salesInfoFormHandler(e)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>Nomor Akun Bank</Form.Label>
                    <Form.Control
                      name='account_number'
                      type='number'
                      value={salesInfo.account_number}
                      onChange={(e) => salesInfoFormHandler(e)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>Category</Form.Label>
                    <Select
                      placeholder='Pilih Category'
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      options={categories}
                      value={selectedCategories}
                      onChange={(element) => handleChangeCategories(element)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>WA / Phone Number</Form.Label>
                    <Form.Control
                      name='phone_number'
                      type='number'
                      value={salesInfo.phone_number}
                      onChange={(e) => salesInfoFormHandler(e)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>Nama Pemilik Akun Bank</Form.Label>
                    <Form.Control
                      name='account_name'
                      type='text'
                      value={salesInfo.account_name}
                      onChange={(e) => salesInfoFormHandler(e)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Form.Group className='mb-5'>
                    <Form.Label>NIK</Form.Label>
                    <Form.Control
                      name='nik'
                      type='number'
                      value={salesInfo.nik}
                      onChange={(e) => salesInfoFormHandler(e)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        <hr />

        <Card className='mb-5'>
          <Card.Header>
            <Card.Title>Account</Card.Title>
          </Card.Header>

          <Card.Body>
            <Row>
              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Group className='mb-5'>
                  <Form.Label>Username</Form.Label>

                  <Form.Control
                    name='username'
                    type='text'
                    value={salesInfo.username}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />

                  <Form.Text className='fs-8 fs-l text-dark-danger'>
                    *Jika username kosong, maka sistem akan menghasilkan username secara otomatis
                    dari nama lengkap, nama toko dengan format semua huruf kecil dan spasi diganti
                    menjadi underscore ( _ ). Contoh : john_doe_mitra10_gading_serpong
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <Form.Group className='mb-5'>
                  <Form.Label>Default Password</Form.Label>
                  <Form.Control
                    name='password'
                    type='text'
                    value={salesInfo.password}
                    onChange={(e) => salesInfoFormHandler(e)}
                  />

                  <Form.Text className='fs-8 fs-l text-dark-danger'>
                    *Default password yang digenerate oleh sistem jika kosong adalah{' '}
                    <b>"password"</b>
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className='d-flex justify-content-center mt-5'>
              <Button variant='dark-danger' type='submit' onClick={handleCancelCreateSales}>
                Cancel
              </Button>

              <Button
                className='d-flex justify-content-center align-items-center'
                variant='dark-primary'
                type='submit'
                disabled={isLoading}
                onClick={() => {
                  handleSubmitNewSales()
                }}
              >
                {isLoading ? 'Saving..' : 'Save'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </section>

      <section id='view-sales'>
        <div className='card'>
          <div className='card-body table-view-order'>
            <div className='d-flex justify-content-end mb-4'>
              <button className='button-export' onClick={exportToExcel}>
                <h3 className='fs-5 fw-semibold'>
                  {loadingExport ? 'Exporting..' : 'Export To Excel'}
                </h3>
              </button>
            </div>

            <Row className='table-head-wrapper' onKeyDown={handleKeyPress}>
              <Col xxl={4} xl={4} lg={4} md={4} sm={12}>
                <Form.Group as={Row}>
                  <Form.Label className='fs-3' column sm='4'>
                    Date :
                  </Form.Label>

                  <Col sm='8'>
                    <RangePicker
                      className='date-range ms-3'
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
                </Form.Group>
              </Col>

              <Col xxl={4} xl={4} lg={4} md={4} sm={12}>
                <div className='filter-search'>
                  <InputGroup>
                    <InputGroup.Text className='filter-ltr'>
                      <FontAwesomeIcon icon={faSearch} size='sm' />
                    </InputGroup.Text>

                    <Form.Control
                      placeholder='Search'
                      className='filter-ltr'
                      onChange={handleChangeSearchFilter}
                    />
                  </InputGroup>
                </div>
              </Col>

              <Col xxl={4} xl={4} lg={4} md={4} sm={12}>
                {userRole === 'Admin HO' || userRole === 'Super User' ? (
                  <div className='d-flex'>
                    <Select
                      name='store_id'
                      className='form-control p-0'
                      classNamePrefix='select'
                      placeholder='Pilih Toko'
                      isSearchable={true}
                      isClearable={true}
                      options={storeOptions}
                      onChange={(newValue) => setSelectedStore(newValue)}
                    />

                    <Button
                      className='btn-dark-primary button-submit'
                      disabled={loadingButton}
                      onClick={handleSubmitFilter}
                    >
                      {loadingButton ? 'Filtering..' : 'Submit'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    className='btn-dark-primary button-submit'
                    disabled={loadingButton}
                    onClick={handleSubmitFilter}
                  >
                    {loadingButton ? 'Filtering..' : 'Submit'}
                  </Button>
                )}
              </Col>
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
                  dataSource={salesData}
                  rowKey={(record) => record.sales_id}
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
                {Math.min(currentPage * pageSize, totalData)} of {totalData} Total Sales
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
                  fetchData(page, newPageSize, '')
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export {NewSales}
