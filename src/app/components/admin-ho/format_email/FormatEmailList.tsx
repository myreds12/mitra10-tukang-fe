/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {FC, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import axios from 'axios'
import Swal from 'sweetalert2'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, PaginationProps, Spin, Pagination} from 'antd'
import {Form, InputGroup, Row, Col, Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faPen, faSearch, faCheck} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTime} from '../../../../_metronic/helpers'

interface DataType {
  numbering: number
  id: number
  name: string
  email_type: string
  created_at: string
  status_email_sent: string
  is_active: string
}

interface templateOption {
  value: number | null
  label: string
}

const FormatEmailList: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [formatEmail, setFormatEmail] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalData, setTotalData] = useState<number>(0)

  const [searchFilter, setSearchFilter] = useState<string>('')

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  // Email
  const [emailType, setEmailType] = useState<templateOption[]>([])

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  const columns: ColumnsType<DataType> = [
    {
      title: 'No.',
      dataIndex: 'numbering',
      key: 'numbering',
      align: 'center',
      sorter: (a, b) => a.numbering - b.numbering,
      width: 50,
    },
    {
      title: 'Judul Email',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      className: 'text-start',
      onFilter: (value, record) => record.name.includes(String(value)),
      sorter: (a, b) => a.name.length - b.name.length,
      width: 120,
    },
    {
      title: 'Email Type',
      dataIndex: 'email_type',
      key: 'email_type',
      align: 'center',
      className: 'text-start',
      onFilter: (value, record) => record.email_type.includes(String(value)),
      sorter: (a, b) => a.email_type.length - b.email_type.length,
      width: 120,
    },
    {
      title: 'Email Dibuat',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      onFilter: (value, record) => record.created_at.includes(String(value)),
      sorter: (a, b) => a.created_at.length - b.created_at.length,
      width: 120,
    },
    {
      title: 'Status Email Dikirimkan',
      dataIndex: 'status_email_sent',
      key: 'status_email_sent',
      align: 'center',
      onFilter: (value, record) => record.status_email_sent.includes(String(value)),
      sorter: (a, b) => a.status_email_sent.length - b.status_email_sent.length,
      width: 120,
    },
    {
      title: 'Status Email',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      onFilter: (value, record) => record.is_active.includes(String(value)),
      sorter: (a, b) => a.is_active.length - b.is_active.length,
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 30,
      render: (record) => {
        const handleUpdate = () => {
          const id = record.id
          navigate(`/email/update-format-email/${id}`)
        }

        const handleActive = () => {
          const id = record.id

          Swal.fire({
            title: `Apakah anda yakin akan mengaktifkan template email ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .patch(
                    `${apiUrl}/mails/${id}`,
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

        const handleNonActive = () => {
          const id = record.id

          Swal.fire({
            title: `Apakah anda yakin akan menonaktifkan template email ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .patch(
                    `${apiUrl}/mails/${id}`,
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
              overlay={renderTooltip('Edit Format Email')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdate}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            {record.is_active !== 'Active' && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Aktifkan Format Email')}
              >
                <Button variant='success' className='button-active' onClick={handleActive}>
                  <FontAwesomeIcon className='text-white' icon={faCheck} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Non Aktifkan Format Email')}
            >
              <Button variant='danger' className='button-disable' onClick={handleNonActive}>
                <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>
          </div>
        )
      },
    },
  ]

  const getFormatEmailList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/mails?order_by=desc&page=${page}&take=${pageSize}${queryparams}`

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setCurrentPage(response?.data?.data?.page)
      setTotalData(response?.data?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const getEmailType = async () => {
    try {
      const response = await axios.get(`${apiUrl}/mails/types`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      let emailTypes = Object.entries(response.data.data).map(([key, value]) => ({
        label: key as string,
        value: value as number,
      }))

      setEmailType(emailTypes)
    } catch (err) {
      console.error(err)
    }
  }

  const ViewFormatEmail = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getFormatEmailList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from getFormatEmailList')
        return []
      }

      const formatEmailData = apiData.map((item: any, index: number) => {
        let data

        const CreatedAt = formatDateWithTime(item?.created_at)

        const emailTypes: any = {
          1: 'ORDER',
          2: 'REFUND',
          3: 'CREDENTIALS',
          4: 'QUOTATIONS',
          5: 'COMPLAINT',
          6: 'RESCHEDULE',
          7: 'CSI',
        }

        const EmailType = emailTypes[item?.email_type] || ''

        data = {
          numbering: index + 1,
          id: item?.id,
          name: item?.title,
          email_type: EmailType,
          created_at: CreatedAt,
          status_email_sent: item?.trigger?.description ?? 'Status Trigger Belum Ditentukan',
          is_active: item?.is_active === true ? 'Active' : 'Non Active',
        }

        return data
      })

      return formatEmailData
    } catch (error) {
      console.error('Error getting format email list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewFormatEmail(page, pageSize, queryparams)
    setFormatEmail(data)
  }

  useEffect(() => {
    fetchData(1, 10, '')
    getEmailType()
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

    const data = await ViewFormatEmail(1, 10, queryparams)
    setFormatEmail(data)

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
                dataSource={formatEmail}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Format Email
            </span>

            <Pagination
              className='pagination'
              current={currentPage}
              pageSize={pageSize}
              total={totalData}
              showSizeChanger
              pageSizeOptions={[5, 10, 20, 50, 100]}
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

export {FormatEmailList}
