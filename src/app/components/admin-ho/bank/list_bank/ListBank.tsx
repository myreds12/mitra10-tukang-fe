/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import './ListBank.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Table, PaginationProps, Spin, Pagination} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Form, InputGroup, Row, Col, Button, OverlayTrigger, Tooltip, Modal} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faPen, faSearch} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTime} from '../../../../../_metronic/helpers'

interface Bank {
  id: number | null
  bank_name: string
}

interface DataType {
  bank_id: number
  bank_name: string
  join_date: string
}

const ListBankHO: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [bankData, setBankData] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)

  const [searchFilter, setSearchFilter] = useState<string>('')

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  // Bank
  const [bankInfo, setBankInfo] = useState<Bank>({
    id: null,
    bank_name: '',
  })

  // Fetch API Data
  useEffect(() => {
    const getBankId = async () => {
      try {
        const response = await axios.get(`${apiUrl}/bank/next-code`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })

        console.log(response.data.data.code)

        if (response.status === 200) {
          const {data} = response
          setBankInfo((prev) => ({
            ...prev,
            id: data.data.code,
          }))
        }
      } catch (err) {
        console.error(err)
      }
    }

    getBankId()
  }, [])

  // Bank Form Handler
  const bankInfoFormHandler = (e: any) => {
    setBankInfo((prevStoreInfo) => ({
      ...prevStoreInfo,
      [e.target.name]: e.target.value,
    }))
  }

  // Bank Validation
  const bankValidation = () => {
    let valid = true

    if (!bankInfo.bank_name) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill Nama Bank form',
        icon: 'error',
      })
      valid = false
    }
    return valid
  }

  // Handle Submit Bank
  const handleSubmitNewBank = async () => {
    if (!bankValidation()) {
      return false
    }

    setIsLoading(true)

    await axios
      .post(`${apiUrl}/bank`, bankInfo, {
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
            text: 'Berhasil menambahkan bank',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            window.location.reload()
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
      })
      .catch((error) => {
        console.error(error)
        setIsLoading(false)

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  // Kolom Tabel
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>
  const columns: ColumnsType<DataType> = [
    {
      title: 'No.',
      dataIndex: 'bank_id',
      key: 'bank_id',
      align: 'left',
      // width: 80,
      sorter: (a, b) => a.bank_id - b.bank_id,
      render: (text: any, record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Nama Bank',
      dataIndex: 'bank_name',
      key: 'bank_name',
      align: 'left',
      className: 'text-start',
      // width: 150,
      onFilter: (value, record) => record.bank_name.includes(String(value)),
      sorter: (a, b) => a.bank_name.length - b.bank_name.length,
    },
    {
      title: 'Tanggal dibuat',
      dataIndex: 'join_date',
      key: 'join_date',
      align: 'left',
      onFilter: (value, record) => record.join_date.includes(String(value)),
      sorter: (a, b) => a.join_date.length - b.join_date.length,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 90,
      render: (record) => {
        const handleUpdate = () => {
          const id = record.bank_id
          navigate(`/bank/update-bank/${id}`)
        }

        const handleDeleteId = () => {
          const id = record.bank_id

          Swal.fire({
            title: `Apakah anda yakin akan menghapus data Bank ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .delete(`${apiUrl}/bank/${id}`, {
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
          <div className='button-wrapper d-flex  justify-content-center gap-4'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Edit Bank')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdate}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Hapus Bank')}
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

  const getBanksList = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/bank?page=${page}&take=${pageSize}${queryparams}`

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
      setTotalData(response?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewBanks = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getBanksList(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from fetchBankList')
        return []
      }

      const bankData = apiData.map((item: any, index: number) => {
        let data

        const joinDate = formatDateWithTime(item?.created_at)

        data = {
          bank_id: index + 1,
          bank_name: item?.bank_name ?? '',
          join_date: joinDate,
        }

        return data
      })

      return bankData
    } catch (error) {
      console.error('Error getting bank list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewBanks(page, pageSize, queryparams)
    setBankData(data)
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

    valueCheck(`&search=`, searchFilter)

    const data = await ViewBanks(1, 10, queryparams)
    setBankData(data)

    setLoadingButton(false)
  }

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false)
  const handleShowModal = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)

  return (
    <section id='view-item'>
      <div className='card'>
        <div className='card-body'>
          <Row className='table-head-wrapper' onKeyDown={handleKeyPress}>
            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
              <Button variant='primary' onClick={handleShowModal}>
                Tambah Bank
              </Button>
            </Col>

            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
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

            <Col xs={12} md={12} lg={12} xl={4} xxl={4}>
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
                dataSource={bankData}
                rowKey={(record) => record.bank_id}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Bank
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

        {/* Modal */}
        <Modal show={showModal} onHide={handleCloseModal} dialogClassName='modal-dialog-centered'>
          <Modal.Header closeButton>
            <Modal.Title>Formulir Tambah Bank</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className='mb-5'>
              <Form.Label>Bank ID</Form.Label>

              <Form.Control
                name='bank_id'
                type='number'
                readOnly
                value={bankInfo.id?.toString()}
                onChange={(e) => bankInfoFormHandler(e)}
              />
            </Form.Group>

            <Form.Group className='mb-5'>
              <Form.Label>Nama Bank</Form.Label>

              <Form.Control
                name='bank_name'
                type='text'
                placeholder='Silahkan isi nama bank'
                value={bankInfo.bank_name}
                onChange={(e) => bankInfoFormHandler(e)}
              />
            </Form.Group>

            <div className='d-flex justify-content-center align-items-center'>
              <Button
                className='d-flex justify-content-center align-items-center'
                variant='dark-primary'
                disabled={isLoading}
                onClick={handleSubmitNewBank}
              >
                {isLoading ? 'Saving..' : 'Save'}
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </section>
  )
}

export {ListBankHO}
