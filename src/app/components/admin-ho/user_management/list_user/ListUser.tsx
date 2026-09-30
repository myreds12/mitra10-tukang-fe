/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

import axios from 'axios'
import Swal from 'sweetalert2'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, PaginationProps, Spin, Pagination} from 'antd'
import {Row, Col, Form, InputGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch, faPen, faTrash} from '@fortawesome/free-solid-svg-icons'

type Props = {
  className: string
}

interface DataType {
  index: number
  id: number
  username: string
  email: string
  role: string
}

const ListUserHO: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const userRole = localStorage.getItem('userRole')
  const userVendor = localStorage.getItem('vendor_id') as any
  const vendorId = userRole === 'Owner Vendor' ? `&vendor_id=${userVendor}` : ''

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [userData, setUserData] = useState<DataType[]>([])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)

  const [searchFilter, setSearchFilter] = useState<string>('')

  // Handle Change Search Filter
  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'No.',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 90,
      className: 'col_order_id',
      sorter: (a, b) => a.index - b.index,
      render: (text: any, record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.username.includes(String(value)),
      sorter: (a, b) => a.username.length - b.username.length,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.email.includes(String(value)),
      sorter: (a, b) => a.email.length - b.email.length,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      align: 'start',
      width: 110,
      onFilter: (value, record) => record.role.includes(String(value)),
      sorter: (a, b) => a.role.length - b.role.length,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 80,
      render: (record) => {
        const id = record.id
        const role = record.role

        const handleUpdateId = () => {
          navigate(`/user/update-user/${id}`)
        }

        const handleDeleteId = () => {
          Swal.fire({
            title: `Apakah anda yakin akan menghapus User ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .delete(`${apiUrl}/auth/delete-user/${id}`, {
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
                      text: 'Berhasil menghapus akun user',
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
            {!['Owner Vendor', 'Tukang', 'Employee', 'Member'].includes(role) &&
            userRole === 'Owner Vendor' ? (
              <>
                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={renderTooltip('Edit User')}
                >
                  <Button variant='primary' className='button-edit' onClick={handleUpdateId}>
                    <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={renderTooltip('Hapus User')}
                >
                  <Button className='button-delete' variant='danger' onClick={handleDeleteId}>
                    <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
                  </Button>
                </OverlayTrigger>
              </>
            ) : !['Owner Vendor', 'Admin Vendor', 'Tukang', 'Employee', 'Member'].includes(role) &&
              userRole === 'Super User' ? (
              <>
                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={renderTooltip('Edit User')}
                >
                  <Button variant='primary' className='button-edit' onClick={handleUpdateId}>
                    <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={renderTooltip('Hapus User')}
                >
                  <Button className='button-delete' variant='danger' onClick={handleDeleteId}>
                    <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
                  </Button>
                </OverlayTrigger>
              </>
            ) : (
              <></>
            )}
          </div>
        )
      },
    },
  ]

  const getUser = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/auth/get?page=${page}&take=${pageSize}${queryparams}${vendorId}`

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response?.data?.page ?? 1)
      setTotalData(response?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewUser = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getUser(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from user data')
        return []
      }

      const userData = apiData.map((item: any, index: number) => {
        let data

        data = {
          index: index + 1,
          id: item.id,
          username: item?.username ?? '-',
          email: item?.email ?? '-',
          role: item?.roles.name ?? '-',
        }

        return data
      })

      return userData
    } catch (error) {
      console.error('Error getting user list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewUser(page, pageSize, queryparams)
    setUserData(data)
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

    const data = await ViewUser(1, 10, queryparams)
    setUserData(data)

    setLoadingButton(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  return (
    <section id='view-item'>
      <div className={`card ${className}`}>
        <div className='card-body table-view-order'>
          <Row className='table-head-wrapper' onKeyDown={handleKeyPress}>
            <Col xs={12} md={4} lg={4} xl={4} xxl={4}></Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <div className='filter-search mb-3'>
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

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Button
                className='btn-dark-primary button-submit m-0'
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
                dataSource={userData}
                rowKey={(record) => record.id}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} List User
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

export {ListUserHO}
