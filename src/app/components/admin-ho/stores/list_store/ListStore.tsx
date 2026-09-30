/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import './ListStore.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Table, PaginationProps, Spin, Pagination} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Form, InputGroup, Row, Col, Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faPen, faSearch} from '@fortawesome/free-solid-svg-icons'

interface DataType {
  number_id: number
  store_id: number
  store_name: string
  username_store: string
  phone_number: number
  email: string
  address: string
  bank_name: string
  account_number: number
  account_name: string
}

const ListStoreHO: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [storeData, setStoreData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)

  const [searchFilter, setSearchFilter] = useState<string>('')

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'No.',
      dataIndex: 'number_id',
      key: 'number_id',
      align: 'center',
      width: 50,
      sorter: (a, b) => a.number_id - b.number_id,
      render: (index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Nama Toko',
      dataIndex: 'store_name',
      key: 'store_name',
      align: 'center',
      className: 'text-start',
      onFilter: (value, record) => record.store_name.includes(String(value)),
      sorter: (a, b) => a.store_name.length - b.store_name.length,
      width: 120,
    },
    {
      title: 'Username',
      dataIndex: 'username_store',
      key: 'username_store',
      align: 'center',
      className: 'text-start',
      onFilter: (value, record) => record.username_store.includes(String(value)),
      sorter: (a, b) => a.username_store.length - b.username_store.length,
      width: 120,
    },
    {
      title: 'Nomor Telp',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'center',
      sorter: (a, b) => a.phone_number - b.phone_number,
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
      onFilter: (value, record) => record.email.includes(String(value)),
      sorter: (a, b) => a.email.length - b.email.length,
      width: 130,
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      onFilter: (value, record) => record.address.includes(String(value)),
      sorter: (a, b) => a.address.length - b.address.length,
      width: 130,
    },
    {
      title: 'Nama Bank',
      dataIndex: 'bank_name',
      key: 'bank_name',
      align: 'center',
      onFilter: (value, record) => record.bank_name.includes(String(value)),
      sorter: (a, b) => a.bank_name.length - b.bank_name.length,
      width: 130,
    },
    {
      title: 'Nomor Akun',
      dataIndex: 'account_number',
      key: 'account_number',
      align: 'center',
      sorter: (a, b) => a.account_number - b.account_number,
      width: 130,
    },
    {
      title: 'Nama Akun',
      dataIndex: 'account_name',
      key: 'account_name',
      align: 'center',
      onFilter: (value, record) => record.account_name.includes(String(value)),
      sorter: (a, b) => a.account_name.length - b.account_name.length,
      width: 130,
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => {
        const handleUpdate = () => {
          const id = record.store_id
          navigate(`/store/update-store/${id}`)
        }

        const handleDeleteId = () => {
          const id = record.store_id

          Swal.fire({
            title: `Apakah anda yakin akan menghapus data Store ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .delete(`${apiUrl}/stores/${id}`, {
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
              overlay={renderTooltip('Edit Toko')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdate}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Hapus Toko')}
            >
              <Button className='button-delete' variant='danger' onClick={handleDeleteId}>
                <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>
          </div>
        )
      },
      fixed: 'right',
      width: 60,
    },
  ]

  const getStoresList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/stores?order_by=desc&page=${page}&take=${pageSize}${queryparams}`

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response.data?.page ?? 1)
      setTotalData(response?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewStores = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getStoresList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchOrderList')
        return []
      }

      const storeData = apiData.map((item: any, index: number) => {
        let data

        const phoneNumber =
          item?.phone_number_1 !== null ? item?.phone_number_1 : item?.phone_number_2

        data = {
          number_id: index + 1,
          store_id: item?.id,
          store_name: item?.store_name ?? '',
          username_store: item?.store_name,
          phone_number: phoneNumber,
          email: item?.email ?? '',
          address: item?.address ?? '',
          bank_name: item?.bank_name ?? '-',
          account_number: item?.bank_number ?? '-',
          account_name: item?.bank_account ?? '-',
        }

        return data
      })

      return storeData
    } catch (error) {
      console.error('Error getting store list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewStores(page, pageSize, queryparams)
    setStoreData(data)
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

  const handleSubmitFilter = async () => {
    setLoadingButton(true)
    let queryparams = ``

    const valueCheck = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        queryparams += `${key}${value}`
      }
    }

    valueCheck(`&search=`, searchFilter)

    const data = await ViewStores(1, 10, queryparams)
    setStoreData(data)

    setLoadingButton(false)
  }

  return (
    <section id='view-item'>
      <div className='card'>
        <div className='card-body'>
          <Row className='table-head-wrapper'>
            <Col xs={12} md={12} lg={12} xl={4} xxl={4}></Col>

            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
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

            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
              <Button
                className='btn-dark-primary button-submit'
                disabled={loadingButton}
                onClick={handleSubmitFilter}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
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
                dataSource={storeData}
                rowKey={(record) => record.store_id}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Total Store
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
  )
}

export {ListStoreHO}
