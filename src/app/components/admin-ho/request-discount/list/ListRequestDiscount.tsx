/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'

import axios from 'axios'
import Swal from 'sweetalert2'
import {Table, DatePicker, PaginationProps, Spin, Pagination, Skeleton, Image} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {
  Form,
  Row,
  Col,
  Button,
  OverlayTrigger,
  Tooltip,
  Modal,
  ListGroup,
  InputGroup,
} from 'react-bootstrap'
import {LoadingOutlined} from '@ant-design/icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faSearch,
  faBook,
  faImage,
  faFileImage,
  faTrash,
  faPen,
} from '@fortawesome/free-solid-svg-icons'
import {formatDateWithTimeZone} from '../../../../../_metronic/helpers'

const {RangePicker} = DatePicker

type Props = {
  className: string
}

interface DataType {
  request_discount_id: number
  quotation_id: number
  created_at: Date
  total_amount: number
  total_request: number
  status_id: number
  status_name: string
}

interface IncentiveGroup {
  id: number | null
  status: number | null
  comission_sales_incentive_evidence: Array<any>
  sales_incentive: Array<{
    id?: number | null
  }>
}

const ListRequestDiscountHO: React.FC<Props> = ({className}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole')

  const [, setIsLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [loadData, setLoadData] = useState<boolean>(true)

  const [incentiveData, setIncentiveData] = useState<DataType[]>([])
  const [totalData, setTotalData] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const [dateFrom, setDateFrom] = useState<any>('')
  const [dateTo, setDateTo] = useState<any>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Incentive Group
  const [incentiveGroup, setIncentiveGroup] = useState<IncentiveGroup>({
    id: null,
    status: null,
    comission_sales_incentive_evidence: [],
    sales_incentive: [
      {
        id: null,
      },
    ],
  })

  const handleChangeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSearchFilter = event.target.value
    setSearchFilter(updatedSearchFilter)
  }

  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>
  const columns: ColumnsType<DataType> = [
    {
      title: 'ID Pengajuan',
      dataIndex: 'request_discount_id',
      key: 'request_discount_id',
      align: 'center',
      width: 110,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.request_discount_id - b.request_discount_id,
    },
    {
      title: 'Quotation ID',
      dataIndex: 'quotation_id',
      key: 'quotation_id',
      align: 'center',
      width: 110,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.quotation_id - b.quotation_id,
    },
    {
      title: 'Tanggal Pengajuan',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      width: 110,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Grand Total Quotation',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'center',
      width: 135,
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
    {
      title: 'Nominal Pengajuan',
      dataIndex: 'total_request',
      key: 'total_request',
      align: 'center',
      width: 135,
      sorter: (a, b) => a.total_request - b.total_request,
    },
    {
      title: 'Status Pengajuan',
      dataIndex: 'status_name',
      key: 'status_name',
      align: 'center',
      width: 135,
      onFilter: (value, record) => record.status_name.includes(String(value)),
      sorter: (a, b) => a.status_name.length - b.status_name.length,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (record) => {
        const id = record.request_discount_id

        const handleDetailIncentiveGroup = () => {
          navigate(`/quotation/detail-request-discount/${id}`)
        }

        // const findOneData = async (id: number) => {
        //   const selected = incentiveData.find((incentive) => incentive.request_discount_id === id)

        //   if (selected) {
        //     findOneIncentiveGroup(selected.request_discount_id)
        //   }
        // }

        // const handleShowModal = (id: number, type: number) => {
        //   const selected = incentiveData.find((incentive) => incentive.request_discount_id === id)

        //   if (selected) {
        //     findOneIncentiveGroup(selected.request_discount_id)
        //     setShowModal(true)
        //     setModalType(type)
        //   }
        // }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Pengajuan')}
            >
              <Button
                variant='primary'
                className='button-detail'
                onClick={handleDetailIncentiveGroup}
              >
                <FontAwesomeIcon
                  className='text-white'
                  icon={userRole === 'Admin HO' ? faBook : faPen}
                  fontSize={'13px'}
                />
              </Button>
            </OverlayTrigger>
            {/* 
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Pengajuan disetujui')}
            >
              <Button
                variant='primary'
                className='button-verif'
                onClick={() => handleUpdateIncentive(id, 2, 'Pengajuan disetujui')}
              >
                <FontAwesomeIcon className='text-white' icon={faCheckCircle} fontSize='13px' />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Pengajuan ditolak')}
            >
              <Button
                variant='danger'
                className='button-cancel'
                onClick={() => handleUpdateIncentive(id, 3, 'Pengajuan ditolak')}
              >
                <FontAwesomeIcon className='text-white' icon={faXmarkCircle} fontSize='13px' />
              </Button>
            </OverlayTrigger>

            {[2, 3].includes(record.status_id) ? (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Upload Dokumen Bukti Pembayaran')}
              >
                <Button
                  variant='primary'
                  className='button-verif'
                  onClick={() => handleShowModal(id, 1)}
                >
                  <FontAwesomeIcon className='text-white' icon={faFile} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            ) : (
              <></>
            )} */}
          </div>
        )
      },
    },
  ]

  const getRequestIncentive = async (page: number, pageSize: number, queryparams: any) => {
    let apiUrlWithParams = `${apiUrl}/quotation-promotion?order_by=desc&page=${page}&take=${pageSize}${queryparams}`

    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      setTotalData(response?.data?.total ?? 0)
      setCurrentPage(response?.data?.page ?? 1)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const findOneIncentiveGroup = async (incentive_group_id: number | null) => {
    if (incentive_group_id === null) return

    try {
      await axios
        .get(`${apiUrl}/comission-sales-incentive/${incentive_group_id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data

          setTimeout(() => {
            setLoadingModal(false)
          }, 2000)

          setIncentiveGroup((prevIncentive) => ({
            ...prevIncentive,
            id: data?.id ?? null,
            status: data?.status,
            sales_incentive: data?.sales_incentive?.map((item: any) => ({
              id: item.id,
            })),
          }))

          if (data?.comission_sales_incentive_evidence?.length) {
            const files = data?.comission_sales_incentive_evidence?.map((item: any) => ({
              id: item.id,
              name: item.path,
            }))

            setUploadFiles(files)
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  const ViewIncentive = async (page: number, pageSize: number, queryparams: any) => {
    try {
      const apiData = await getRequestIncentive(page, pageSize, queryparams)

      if (!apiData) {
        console.error('No data received from getRequestIncentive')
        return []
      }

      const incentiveData = apiData.map((item: any) => {
        let data

        const requestDate = formatDateWithTimeZone(item?.created_at)

        const requestDiscount = (status: number) => {
          switch (status) {
            case 1:
              return 'Pengajuan Diskon'
            case 2:
              return 'Pengajuan Disetujui'
            case 3:
              return 'Pengajuan Ditolak'
            default:
              return ''
          }
        }

        data = {
          request_discount_id: item?.id,
          quotation_id: item?.quotation_id,
          created_at: requestDate,
          status: item?.status,
          status_name: requestDiscount(item?.status),
          total_request: `${
            item?.promotion_nominal < 100
              ? `${item?.promotion_nominal}%`
              : `Rp. ${parseInt(item?.promotion_nominal).toLocaleString('id')}`
          }`,
          total_amount: `Rp. ${parseInt(item?.quotation?.quotation_grand_total ?? 0).toLocaleString(
            'id'
          )}`,
        }

        return data
      })

      return incentiveData
    } catch (error) {
      console.error('Error getting incentive list data:', error)
      return []
    }
  }

  const fetchData = async (page: number, pageSize: number, queryparams: any) => {
    const data = await ViewIncentive(page, pageSize, queryparams)
    setIncentiveData(data)
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

  // Export To Excel
  const exportToExcel = () => {
    setLoadingExport(true)

    axios
      .get(
        `${apiUrl}/comission-sales-incentive/export-excel?take=0${
          dateFrom && dateTo ? `&date_from=${dateFrom}&date_to=${dateTo}` : ''
        }`,
        {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Report Insentif Sales.xlsx`)
        document.body.appendChild(link)
        link.click()

        setLoadingExport(false)
      })
  }

  // Handler Submit Filter
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

    const data = await ViewIncentive(1, 10, queryparams)
    setIncentiveData(data)

    setLoadingButton(false)
  }

  // Modal
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [loadingModal, setLoadingModal] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType] = useState<number | null>(null)
  const handleCloseModal = () => {
    setShowModal(false)
  }

  // Upload File
  const evidenceRef = useRef<HTMLInputElement>(null)
  const [uploadFiles, setUploadFiles] = useState<Array<File | null>>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...uploadFiles]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setUploadFiles(mergedFiles)
    }
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...uploadFiles]
    newEvidances.splice(index, 1)
    setUploadFiles(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileClick = (index: number) => {
    setPreviewImage(uploadFiles[index]?.name)
    setVisible(true)
    setSelectedFileIndex(index)
  }

  // Handle Upload File Incentive
  const handleUploadFile = async () => {
    setLoadingUpdate(true)
    const formData = new FormData()

    formData.append('status', String(incentiveGroup.status))
    incentiveGroup?.sales_incentive?.forEach((incentive, index) => {
      if (incentive.id !== null) {
        formData.append(`sales_incentive[${index}][sales_incentive_id]`, String(incentive.id))
      }
    })

    if (uploadFiles?.length) {
      uploadFiles.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`comission_sales_incentive_evidences`, item, item.name)
        }
      })
    }

    // if (uploadFiles?.length) {
    //   uploadFiles.forEach((item: any, index: number) => {
    //     if (item.id) {
    //       formData.append(`preserve_files[${index}]`, item.id)
    //     }
    //   })
    // }

    await axios
      .patch(`${apiUrl}/comission-sales-incentive/${incentiveGroup.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil Upload Dokumen',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          })

          setLoadingUpdate(false)
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })

          setLoadingUpdate(false)
        }

        window.location.reload()
      })
      .catch((error) => {
        setLoadingUpdate(false)

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }

  const UploadFile = ({
    incentiveDetail,
    loadingModal,
    handleUploadFile,
    loadingUpdate,
    uploadFiles,
    handleImageClick,
    handleFileChange,
    handleFileClick,
    handleRemoveFile,
  }: any) => {
    return (
      <>
        <Modal.Header closeButton>
          <Skeleton active loading={loadingModal} paragraph={{rows: 0}}>
            <Modal.Title>Upload Dokumen Bukti Pembayaran Pengajuan Insentif</Modal.Title>
          </Skeleton>
        </Modal.Header>

        <Modal.Body>
          <Skeleton active loading={loadingModal} paragraph={{rows: 1}}>
            <Row>
              <Col md={12}>
                <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
                  <Form.Group>
                    <Form.Label>Upload Dokumen Bukti Pembayaran</Form.Label>

                    <Form className='form-input-image' onClick={handleImageClick}>
                      <Form.Control
                        type='file'
                        accept='.jpeg, .jpg, .png, .pdf'
                        className='input-field-image'
                        multiple
                        hidden
                        id='file-input'
                        ref={evidenceRef}
                        onChange={handleFileChange}
                      />

                      <div className='input-image-text'>
                        <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                        <p>Add File</p>
                      </div>
                    </Form>

                    <ListGroup className='pt-3'>
                      {uploadFiles.length ? (
                        uploadFiles.map((item: any, index: number) => (
                          <ListGroup>
                            <ListGroup.Item
                              className='d-flex justify-content-between align-items-center'
                              key={`${item?.name}-${index}-${item?.type}`}
                            >
                              <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                              <span
                                className='upload-content'
                                style={{cursor: 'pointer'}}
                                onClick={() => handleFileClick(index)}
                              >
                                {item?.name}
                              </span>

                              <FontAwesomeIcon
                                icon={faTrash}
                                size='sm'
                                color='#ed2b2a'
                                style={{cursor: 'pointer'}}
                                onClick={(e) => handleRemoveFile(index)}
                              />
                            </ListGroup.Item>

                            {selectedFileIndex === index && item && (
                              <Image
                                key={`${previewImage} - ${index}`}
                                width={200}
                                style={{display: 'none'}}
                                src={
                                  item instanceof File
                                    ? URL.createObjectURL(item)
                                    : `${apiUrl}/public/invoices/${previewImage}`
                                }
                                preview={{
                                  visible: visible,
                                  src:
                                    item instanceof File
                                      ? URL.createObjectURL(item)
                                      : `${apiUrl}/public/invoices/${previewImage}`,
                                  onVisibleChange: (value) => {
                                    setVisible(value)
                                  },
                                }}
                              />
                            )}
                          </ListGroup>
                        ))
                      ) : (
                        <ListGroup.Item className='d-flex justify-content-center'>
                          Tidak ada file yang dipilih
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Form.Group>
                </Row>
              </Col>
            </Row>

            <div className='button-submit d-flex justify-content-center align-items-center'>
              <Button
                className='d-flex justify-content-center align-items-center'
                onClick={handleUploadFile}
                disabled={loadingUpdate}
                variant='dark-primary'
              >
                {loadingUpdate ? 'Submitting..' : 'Submit'}
              </Button>
            </div>
          </Skeleton>
        </Modal.Body>
      </>
    )
  }

  // Handle Update Incentive
  const handleUpdateIncentive = async (id: number, status: number, statusName: string) => {
    if (id === null) return

    await findOneIncentiveGroup(id)
    const textConfirmation = `Apakah Anda yakin ingin mengubah status pengajuan ini menjadi ${statusName} ?`

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
          const formData = new FormData()

          formData.append('status', String(status))

          const response = await axios.post(`${apiUrl}/quotation-promotion/${id}`, formData, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
          })
          if (response.data.status === 200 || response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Berhasil mengubah status pengajuan',
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
        } catch (error: any) {
          setIsLoading(false)
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message,
            icon: 'error',
          })
        }
      } else {
        setIsLoading(false)
      }
    })
  }

  return (
    <section id='report-insentif'>
      <div className={`card ${className}`}>
        <div className='card-body table-view-report'>
          <Row className='table-head-wrapper'>
            <Col xs={12} md={12} lg={12} xl={4} xxl={4} className='d-flex mb-2'>
              <div className='d-flex align-items-center me-3'>
                <h3 className='fs-5 fw-normal'>Date : </h3>
              </div>

              <RangePicker
                format={'DD-MM-YYYY'}
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

            <Col>
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

            <Col>
              <Button
                className='btn-dark-primary button-submit'
                onClick={handleSubmitFilter}
                disabled={loadingButton}
              >
                {loadingButton ? 'Filtering..' : 'Submit'}
              </Button>
            </Col>

            <Col>
              <div className='d-flex justify-content-end'>
                <Button
                  variant='success m-0'
                  className='d-flex justify-content-center align-items-center'
                  onClick={exportToExcel}
                  disabled={loadingExport}
                >
                  {loadingExport ? 'Exporting..' : 'Export To Excel'}
                </Button>
              </div>
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
                dataSource={incentiveData}
                rowKey={(record) => record.request_discount_id}
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
              {Math.min(currentPage * pageSize, totalData)} of {totalData} Total Pengajuan Diskon
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

      <Modal
        dialogClassName='modal-verification'
        centered
        show={showModal}
        onHide={handleCloseModal}
      >
        {modalType === 1 && (
          <UploadFile
            incentiveDetail={incentiveData}
            loadingModal={loadingModal}
            loadingUpdate={loadingUpdate}
            uploadFiles={uploadFiles}
            handleImageClick={handleImageClick}
            handleFileChange={handleFileChange}
            handleFileClick={handleFileClick}
            handleRemoveFile={handleRemoveFile}
            handleUploadFile={handleUploadFile}
          />
        )}
      </Modal>
    </section>
  )
}

export {ListRequestDiscountHO}
