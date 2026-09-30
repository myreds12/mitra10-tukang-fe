/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import './ListDataMaster.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Table, PaginationProps, Spin, Pagination} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Form, InputGroup, Row, Col, Button, OverlayTrigger, Tooltip, Modal} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faPen, faSearch} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTime} from '../../../../../_metronic/helpers'

interface DataMaster {
  name:string
  value: number
}

interface DataType {
  nomer: number
  name: string
  value: number
  join_date: string
}

const ListDataMasterHO: React.FC = () => {
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
  const [dataMasterInfo, setDataMasterInfo] = useState<DataMaster>({
    name: '',
    value: 0,
  })


  // Bank Form Handler
  const dataMasterFormHandler = (e: any) => {
    setDataMasterInfo((prevStoreInfo) => ({
      ...prevStoreInfo,
      [e.target.name]: e.target.value,
    }))
  }

  // Bank Validation
  const bankValidation = () => {
    let valid = true

    if (!dataMasterInfo.value) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill value form',
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
      .post(`${apiUrl}/data-master`, dataMasterInfo, {
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
            text: 'Berhasil menambahkan data master',
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
      dataIndex: 'nomer',
      key: 'nomer',
      align: 'left',
      // width: 80,
      sorter: (a, b) => a.nomer - b.nomer,
      render: (text: any, record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      className: 'text-start',
      // width: 150,
      onFilter: (value, record) => record.name.includes(String(value)),
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: 'value',
      dataIndex: 'value',
      key: 'value',
      align: 'left',
      className: 'text-start',
      // width: 150,
      // onFilter: (value, record) => record.value.includes(value),
      sorter: (a, b) => a.value - b.value,
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
          const id = record.id
          navigate(`/data-master/update-data-master/${id}`)
        }

        const handleDeleteId = () => {
          const id = record.id
       
          
          Swal.fire({
            title: `Apakah anda yakin akan menghapus data ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                axios
                  .delete(`${apiUrl}/data-master/${id}`, {
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
              overlay={renderTooltip('Edit Data Master')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdate}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Hapus Data Master')}
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
    let apiUrlWithParams = `${apiUrl}/data-master?page=${page}&take=${pageSize}${queryparams}`

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
          id: item.id,
          nomer: index + 1,
          name: item?.name ?? '',
          value: item?.value ?? '',
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
                Tambah Data Master
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
                rowKey={(record) => record.nomer}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Data Master
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
            <Modal.Title>Formulir Tambah Data Master</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className='mb-5'>
              <Form.Label>Name</Form.Label>

              <Form.Control
                name='name'
                type='text'
                value={dataMasterInfo.name}
                onChange={(e) => dataMasterFormHandler(e)}
              />
            </Form.Group>

            <Form.Group className='mb-5'>
              <Form.Label>Value</Form.Label>

              <Form.Control
                name='value'
                type='number'
                placeholder='Silahkan isi value'
                value={dataMasterInfo.value}
                onChange={(e) => dataMasterFormHandler(e)}
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

export {ListDataMasterHO}
