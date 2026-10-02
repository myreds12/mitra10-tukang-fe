/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import {useSelector, useDispatch} from 'react-redux'
import {RootState} from '../../../../../store'

import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'

import {
  setQueryParams,
  setCurrentPage,
  setPageSize,
  setDateFrom,
  setDateTo,
  setSearchFilter,
  setSelectedStore,
} from '../../../../../store/vendorSlice'

import './ViewVendor.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import Select, {SingleValue} from 'react-select'

import {formatDate} from '../../../../../_metronic/helpers'
import {Table, PaginationProps, Spin, Pagination, DatePicker} from 'antd'
import {Row, Form, Button, OverlayTrigger, Tooltip, FormGroup} from 'react-bootstrap'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {LoadingOutlined} from '@ant-design/icons'
import {faBook, faPen, faTrash, faSearch} from '@fortawesome/free-solid-svg-icons'

import type {ColumnsType} from 'antd/es/table'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface StoreItem {
  value: number | null
  label: string
}

interface DataType {
  no: number
  vendor_id: number
  pic_name: string
  company_name: string
  email_address: string
  phone_number: number
  date_join: string
  service_type: string
  serving_area: string
  vendor_type: string
  vendor_status: string
  sp_level: number | null
  total_point: number
}

const ViewVendorHO: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const userRole = localStorage.getItem('userRole')
  const isAuthorizedToDelete = userRole === 'Super User' || userRole === 'Admin HO'

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Loading state
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  // Table State
  const [vendorData, setVendorData] = useState<DataType[]>([])
  const [vendorDatas, setVendorDatas] = useState<[]>([])
  const [totalData, setTotalData] = useState<number>(0)
  const {queryParams, searchFilter, currentPage, pageSize, dateFrom, dateTo, selectedStore} =
    useSelector((state: RootState) => state.vendor)

  // Store
  const [store, setStore] = useState<StoreItem[]>([])
  const storeOptions = [{value: null, label: 'All Vendor'}, ...vendorDatas]

  // Filter Table
  const handleChangeSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value))
  }

  const handleStoreChange = (newValue: SingleValue<StoreItem>) => {
    const selectedStore: StoreItem = newValue || {value: null, label: 'All Vendor'}
    dispatch(setSelectedStore(selectedStore))
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

  // Table
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>
  const columns: ColumnsType<DataType> = [
    {
      title: 'No. ',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: 60,
      className: 'col_order_id',
      render: (text: any, record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Vendor ID',
      dataIndex: 'vendor_id',
      key: 'vendor_id',
      align: 'center',
      width: 90,
      className: 'col_order_id',
    },
    {
      title: 'Nama PIC',
      dataIndex: 'pic_name',
      key: 'pic_name',
      align: 'left',
      width: 130,
    },
    {
      title: 'Nama Perusahaan',
      dataIndex: 'company_name',
      key: 'company_name',
      align: 'left',
      width: 130,
    },
    {
      title: 'Email Address',
      dataIndex: 'email_address',
      key: 'email_address',
      align: 'left',
      width: 120,
    },
    {
      title: 'No. Handphone',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'left',
      width: 120,
    },
    {
      title: 'Service Type',
      dataIndex: 'service_type',
      key: 'service_type',
      align: 'left',
      width: 160,
    },
    {
      title: 'Serving Area',
      dataIndex: 'serving_area',
      key: 'serving_area',
      align: 'left',
      width: 160,
    },
    {
      title: 'Tanggal Join',
      dataIndex: 'date_join',
      key: 'date_join',
      align: 'center',
      width: 110,
    },
    {
      title: 'Tipe Vendor',
      dataIndex: 'vendor_type',
      key: 'vendor_type',
      align: 'center',
      width: 110,
    },
    {
      title: 'Vendor Status',
      dataIndex: 'vendor_status',
      key: 'vendor_status',
      align: 'center',
      width: 110,
    },
    {
      title: 'Status SP',
      dataIndex: 'sp_level',
      key: 'sp_level',
      align: 'center',
      width: 100,
      render: (level: number | null, record: DataType) => {
        if (!level || level === 0) {
          return <span className='badge badge-light-success fw-semibold'>NORMAL</span>
        }
        const badgeClass = level === 1 ? 'badge-light-warning text-warning' : level === 2 ? 'badge-light-danger text-danger' : 'badge-light-dark'
        return (
          <div className='d-flex flex-column align-items-center'>
            <span className={`badge ${badgeClass} fw-bold`}>SP{level}</span>
            <small className='text-muted' style={{fontSize: '10px'}}>{record.total_point} pts</small>
          </div>
        )
      }
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 110,
      render: (record) => {
        const id = record.vendor_id

        const handleDetailId = () => {
          navigate(`/vendor/detail-vendor/${id}`)
        }

        const handleUpdateId = () => {
          navigate(`/vendor/update-vendor/${id}`)
        }

        const handleDeleteId = () => {
          if (!isAuthorizedToDelete) {
            Swal.fire({
              title: 'Access Denied',
              text: 'Anda tidak memiliki akses untuk menghapus data vendor.',
              icon: 'error',
            })
            return
          }
          const id = record.vendor_id

          Swal.fire({
            title: `Apakah anda yakin akan menghapus data Vendor ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .delete(`${apiUrl}/vendor/${id}`, {
                    headers: {
                      Accept: 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                      // 'Access-Control-Allow-Origin': '*',
                     // 'ngrok-skip-browser-warning':  'true',
                    },
                  })
                  .then((response) => {
                    Swal.fire({
                      title: 'Success',
                      text: response.data.message,
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

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Vendor')}
            >
              <a
                href={`/vendor/detail-vendor/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-detail'
                onClick={(e) => {
                  e.preventDefault()
                  handleDetailId()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Edit Vendor')}
            >
              <a
                href={`/vendor/update-vendor/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-edit'
                onClick={(e) => {
                  e.preventDefault()
                  handleUpdateId()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {isAuthorizedToDelete && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Hapus Vendor')}
              >
                <Button className='button-delete' variant='danger' onClick={handleDeleteId}>
                  <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        )
      },
    },
  ]

  const fetchVendorList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/vendor?order_by=desc${queryparams}`

    try {
      const response = await axiosInstance.get(apiUrlWithParams, {
        params: {
          dateFrom: dateFrom ? dateFrom : null,
          dateTo: dateTo ? dateTo : null,
          page: page,
          take: pageSize,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response.data.page)
      setTotalData(response?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchVendorFilter = async () => {
    let apiUrlWithParams = `${apiUrl}/vendor?order_by=desc`

    try {
      const response = await axiosInstance.get(apiUrlWithParams, {
        params: {
          page: 1,
          take: 100,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewVendor = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await fetchVendorList(page, pageSize, queryparams)
      const dataFilter = await fetchVendorFilter()

      if (!apiData) {
        console.error('No data received from fetchVendorList')
        return []
      }

        if (!dataFilter) {
        console.error('No data received from fetchVendorList')
        return []
      }

      const vendorData = apiData.map((item: any, index: number) => {
        let data

        const joinDate = formatDate(item?.join_date)

        const vendorServiceIds = item?.vendor_service?.map(
          (item: any) => item?.service_type?.service_type
        )
        const uniqueService = Array.from(new Set(vendorServiceIds)).join(', ')

        const vendorAreaIds = item.vendor_store.map(
          (vendor_store: any) => vendor_store.store.store_name
        )
        const uniqueArea = Array.from(new Set(vendorAreaIds)).join(', ')

        data = {
          no: index + 1,
          vendor_id: item.id,
          pic_name: item?.pic_name,
          company_name: item.company_name,
          email_address: item.email_address,
          phone_number: item.phone_number,
          date_join: joinDate,
          service_type: uniqueService,
          serving_area: uniqueArea,
          vendor_type: item.type === 1 ? 'VENDOR PKP' : 'VENDOR NON PKP',
          vendor_status: item.is_active ? 'ACTIVE' : 'NON ACTIVE',
          sp_level: item.sp_level || 0,
          total_point: item.total_point || 0,
        }

        return data
      })
      const vendorOptions = dataFilter.map((item: any) => ({
        label: `${item.company_name}`,
        value: item.id,
      }))
      setVendorDatas(vendorOptions)
      return vendorData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewVendor(page, pageSize, queryparams)
    setVendorData(data)
    dispatch(setSelectedStore(data))
  }

  useEffect(() => {
    fetchData(currentPage, pageSize, queryParams)
    // eslint-disable-next-line
  }, [currentPage, pageSize, queryParams])

  useEffect(() => {
    const getStore = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stores?take=0`, {
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
            city_id: item.city_id,
          }))

          setStore(tempStore)
        } else {
          console.error('API response data is not an array:', response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getStore()
    // eslint-disable-next-line
  }, [])

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)
    valueCheck(`&id_vendor=`, selectedStore?.value)
    dispatch(setQueryParams(queryparams))

    const data = await ViewVendor(currentPage, pageSize, queryparams)
    setVendorData(data)
    dispatch(setSelectedStore(data))

    setLoadingButton(false)
  }

  return (
    <section id='view-vendor'>
      <div className={`card ${className}`}>
        <div className='card-body'>
          <Row className='table-head-wrapper'>
            <div
              className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'
              onKeyDown={handleKeyPress}
            >
              <h3 className='d-flex align-items-center fs-5 fw-normal'>Date</h3>

              <RangePicker
                format={'DD-MM-YYYY'}
                className='date-range'
                onChange={(values) => {
                  if (values && values.length === 2) {
                    const dateFromFormatted = values[0]?.format('YYYY-MM-DD') || ''
                    const dateToFormatted = values[1]?.format('YYYY-MM-DD') || ''

                    dispatch(setDateFrom(dateFromFormatted))
                    dispatch(setDateTo(dateToFormatted))
                  } else {
                    dispatch(setDateFrom(''))
                    dispatch(setDateTo(''))
                  }
                }}
              />

              <div className='filter-search'>
                <FormGroup>
                  <Form.Control
                    placeholder='Search'
                    className='filter-ltr'
                    onChange={handleChangeSearchFilter}
                  />

                  <span className='search-icon'>
                    <FontAwesomeIcon icon={faSearch} className='text-black' size='sm' />
                  </span>
                </FormGroup>
              </div>

              <Select
                name='store_id'
                className='form-control p-0'
                classNamePrefix='select'
                placeholder='Pilih Vendor'
                isSearchable={true}
                isClearable={true}
                options={storeOptions}
                value={selectedStore}
                onChange={handleStoreChange}
              />

              <Button
                className='btn-dark-primary button-submit m-0'
                disabled={loadingButton}
                onClick={handleSubmitFilter}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
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
                dataSource={vendorData}
                rowKey={(record) => record.vendor_id}
                pagination={false}
                sticky={true}
                tableLayout='auto'
                scroll={{x: 'max-content'}}
              />
            </div>
          </Spin>

          <div className='pagination-container mt-5'>
            <span className='total-text'>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Vendor
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
        </div>
      </div>
    </section>
  )
}

export {ViewVendorHO}
