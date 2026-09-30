import React, {FC, useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import './DetailTukang.css'

import axios from 'axios'
import type {ColumnsType} from 'antd/es/table'
import {LoadingOutlined} from '@ant-design/icons'
import {Table, Tag, PaginationProps, Spin, Pagination, Image, Rate} from 'antd'
import {Form, Row, Col, Tabs, Tab, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleUser, faUser} from '@fortawesome/free-solid-svg-icons'
import {formatDate, formatDateWithTimeZone} from '../../../../../_metronic/helpers'

interface DataTypeOrder {
  number: number
  work_order_id: number
  store_name: string
  costumer_name: string
  date_order: string
  status: string
}

interface DataTypeComplaint {
  number: number
  complaint_id: number
  store_name: string
  costumer_name: string
  complaint_date: string
}

const columnsOrder: ColumnsType<DataTypeOrder> = [
  {
    title: 'No.',
    dataIndex: 'number',
    key: 'number',
    align: 'center',
    width: 90,
    sorter: (a, b) => a.number - b.number,
  },
  {
    title: 'Work Order ID',
    dataIndex: 'work_order_id',
    key: 'work_order_id',
    align: 'center',
    width: 130,
    sorter: (a, b) => a.work_order_id - b.work_order_id,
  },
  {
    title: 'Nama Toko',
    dataIndex: 'store_name',
    key: 'store_name',
    align: 'center',
    width: 180,
    onFilter: (value, record) => record.store_name.includes(String(value)),
    sorter: (a, b) => a.store_name.length - b.store_name.length,
  },
  {
    title: 'Nama Konsumen',
    dataIndex: 'costumer_name',
    key: 'costumer_name',
    align: 'center',
    width: 180,
    onFilter: (value, record) => record.costumer_name.includes(String(value)),
    sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
  },
  {
    title: 'Tanggal Pengerjaan',
    dataIndex: 'date_order',
    key: 'date_order',
    width: 150,
    sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const orderStatus = status
      let color = ''

      switch (orderStatus) {
        case 'UNPAID':
          color = 'red'
          break
        case 'PAID':
          color = 'green'
          break
        default:
          color = 'blue'
          break
      }

      return <Tag color={color}>{orderStatus}</Tag>
    },
  },
]

const columnsComplaint: ColumnsType<DataTypeComplaint> = [
  {
    title: 'No',
    dataIndex: 'number',
    key: 'number',
    align: 'center',
    width: 90,
    sorter: (a, b) => a.number - b.number,
  },
  {
    title: 'Complaint ID',
    dataIndex: 'complaint_id',
    key: 'complaint_id',
    align: 'center',
    width: 90,
    sorter: (a, b) => a.complaint_id - b.complaint_id,
  },
  {
    title: 'Nama Toko',
    dataIndex: 'store_name',
    key: 'store_name',
    align: 'center',
    width: 180,
    onFilter: (value, record) => record.store_name.includes(String(value)),
    sorter: (a, b) => a.store_name.length - b.store_name.length,
  },
  {
    title: 'Nama Konsumen',
    dataIndex: 'costumer_name',
    key: 'costumer_name',
    align: 'center',
    width: 180,
    onFilter: (value, record) => record.costumer_name.includes(String(value)),
    sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
  },
  {
    title: 'Tanggal Komplain',
    dataIndex: 'complaint_date',
    key: 'complaint_date',
    width: 120,
    sorter: (a, b) => new Date(a.complaint_date).getTime() - new Date(b.complaint_date).getTime(),
  },
]

const DetailTukangVendor: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()

  const [tukangId, setTukangId] = useState<any>('')
  const [tukangDetail, setTukangDetail] = useState<any>()

  const [workOrderData, setWorkOrderData] = useState<any[]>([])
  const [complaintData, setComplaintData] = useState<DataTypeComplaint[]>([])

  const [loadData, setLoadData] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalData, setTotalData] = useState<number>(0)

  // Tukang Evidence
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleKTP, setVisibleKTP] = useState<boolean>(false)
  const [visibelNPWP, setVisibleNPWP] = useState<boolean>(false)

  const [imageKTP, setimageKTP] = useState<{
    blob: string
    fileName: string
  }>({
    blob: '',
    fileName: '',
  })

  const [imageNPWP, setimageNPWP] = useState<{
    blob: string
    fileName: string
  }>({
    blob: '',
    fileName: '',
  })

  console.log('image Ktp', imageKTP)

  const fetchTukangDetail = async () => {
    try {
      await axios
        .get(`${apiUrl}/tukang/${params.id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data

          setTukangDetail(data)
          setTukangId(response.data.data.id)

          if (data?.tukang_document) {
            const documentTypes = ['npwp_file', 'ktp_file', 'compro_file', 'surat_permohonan_file']

            type DocumentStateSetter = (state: {blob: string; fileName: string}) => void

            const documentStateSetters: Record<string, DocumentStateSetter> = {
              npwp_file: setimageNPWP,
              ktp_file: setimageKTP,
            }

            data.tukang_document.forEach((document: any) => {
              const {document_name, path} = document

              if (documentTypes.includes(document_name)) {
                const setter = documentStateSetters[document_name]

                if (setter) {
                  setter({
                    blob: '',
                    fileName: path,
                  })
                }
              }
            })
          }
        })
    } catch (error) {
      console.log(error)
    }
  }

  const getWorkOrder = async (page: number, pageSize: number) => {
    try {
      const response = await axios.get(
        `${apiUrl}/work-orders?order_by=desc&page=${page}&take=${pageSize}&tukang_id=${params.id}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        }
      )

      setCurrentPage(response?.data?.page ?? 1)
      setTotalData(response?.data?.total ?? 0)
      setLoadData(false)

      return response.data.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ViewWorkOrder = async (page: number, pageSize: number) => {
    try {
      const apiData = await getWorkOrder(page, pageSize)

      if (!apiData) {
        console.error('No data received from getWorkOrder')
        return []
      }

      const workOrderData = apiData.map((item: any, index: number) => {
        let data

        const orderDate = formatDateWithTimeZone(item?.created_at)

        data = {
          number: index + 1,
          work_order_id: item.id,
          date_order: orderDate,
          store_name: item?.order?.store?.store_name ?? '-',
          costumer_name: item?.order?.members?.full_name ?? '-',
          status: item?.work_order_status[0]?.status?.description ?? '-',
        }

        return data
      })

      return workOrderData
    } catch (error) {
      console.error('Error getting order list data:', error)
      return []
    }
  }

  const fetchWorkOrder = async (page: number, pageSize: number) => {
    const data = await ViewWorkOrder(page, pageSize)
    setWorkOrderData(data)
  }

  useEffect(() => {
    fetchWorkOrder(1, 10)
  }, [])

  useEffect(() => {
    fetchTukangDetail()
  }, [])

  // Item Render
  const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
      return <a>Prev</a>
    }
    if (type === 'next') {
      return <a>Next</a>
    }
    return originalElement
  }

  return (
    <section id='detail-tukang'>
      <Row className='row-1'>
        <Col xxl={3} xl={3} lg={3} md={3} sm={12}>
          <FontAwesomeIcon icon={faCircleUser} style={{fontSize: '150px'}} />
        </Col>

        <Col xxl={9} xl={9} lg={9} md={9} sm={12}>
          <div className='tukang-profile'>
            <h1 className='fs-1 mb-3'>{tukangDetail?.full_name}</h1>
            <p className='fs-3 mb-1'>TUKANG</p>
            <p className='fs-4 mb-1'>{tukangDetail?.vendor?.company_name}</p>
            <p className='fs-4 text-muted mb-1'>Rating</p>

            <Rate disabled defaultValue={tukangDetail?.rating} />
          </div>
        </Col>
      </Row>

      <Row className='row-2 mb-3'>
        <Col xxl={3} xl={3} lg={12} md={12} sm={12} className='mb-5'>
          <div className='basic-info'>
            <hr />

            <div className='d-flex'>
              <p>Info </p>
            </div>

            <div className='data'>
              <Form.Group as={Row}>
                <Form.Group as={Row}>
                  <Form.Label column sm='4'>
                    Email :
                  </Form.Label>

                  <Col sm='8'>
                    <Form.Control plaintext readOnly value={tukangDetail?.email} />
                  </Col>
                </Form.Group>

                <Form.Label column sm='4'>
                  No. Telp :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control plaintext readOnly value={tukangDetail?.phone_number} />
                </Col>
              </Form.Group>

              <Form.Group as={Row}>
                <Form.Label column sm='4'>
                  Address :
                </Form.Label>

                <Col sm='8'>
                  <Form.Control plaintext readOnly as='textarea' value={tukangDetail?.address} />
                </Col>
              </Form.Group>
            </div>
          </div>
        </Col>

        <Col xxl={9} xl={9} lg={12} md={12} sm={12} className='mb-5'>
          <div className='tab mb-3'>
            <div className='tab-title'>
              <div className='title'>
                <FontAwesomeIcon icon={faUser} size='2xl' />
                <p>About</p>
              </div>
            </div>

            <div className='data-diri'>
              <Row>
                <Col>
                  <Form.Group as={Row}>
                    <Form.Label column md='7'>
                      Tanggal Lahir :
                    </Form.Label>

                    <Col md='5'>
                      <Form.Control
                        plaintext
                        readOnly
                        type='text'
                        value={tukangDetail ? formatDate(tukangDetail?.bod) : ''}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row}>
                    <Form.Label column md='7'>
                      Nomor Telepon :
                    </Form.Label>

                    <Col md='5'>
                      <Form.Control plaintext readOnly value={tukangDetail?.phone_number ?? ''} />
                    </Col>
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Form.Group as={Row}>
                    <Form.Label column sm='6'>
                      Nomor KTP :
                    </Form.Label>

                    <Col sm='6'>
                      <Form.Control
                        plaintext
                        readOnly
                        type='text'
                        value={tukangDetail?.ktp_number}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row}>
                    <Form.Label column sm='6'>
                      Complain :
                    </Form.Label>

                    <Col sm='6'>
                      <Form.Control plaintext readOnly defaultValue='0' />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row}>
                    <Form.Label column sm='6'>
                      Refund :
                    </Form.Label>

                    <Col sm='6'>
                      <Form.Control plaintext readOnly defaultValue='0' />
                    </Col>
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group as={Row}>
                    <Form.Label column sm='6'>
                      Total Pekerjaan :
                    </Form.Label>

                    <Col sm='6'>
                      <Form.Control plaintext readOnly value={totalData} />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>

          <div className='tab mb-3'>
            <div className='tab-title'>
              <div className='title'>
                <FontAwesomeIcon icon={faUser} size='2xl' />
                <p>Dokumen Pendukung</p>
              </div>
            </div>

            <div className='data-diri'>
              <Row>
                <Col xxl={6} xl={6} lg={6} md={6} sm={12}>
                  <Form.Group controlId='formFile'>
                    <Form.Label>Foto KTP</Form.Label>

                    {imageKTP.fileName !== '' && imageKTP.blob !== '' ? (
                      <>
                        <ListGroup>
                          <ListGroup.Item
                            action
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              setPreviewImage(imageKTP.fileName)
                              setVisibleKTP(true)
                            }}
                          >
                            {imageKTP.fileName}
                          </ListGroup.Item>
                        </ListGroup>

                        {previewImage && (
                          <div>
                            <Image
                              key={previewImage}
                              width={200}
                              style={{display: 'none'}}
                              src={`${apiUrl}/public/tukang/${imageKTP.fileName}`}
                              preview={{
                                visible: visibleKTP,
                                src: `${apiUrl}/public/tukang/${imageKTP.fileName}`,
                                onVisibleChange: (value) => {
                                  setVisibleKTP(value)
                                },
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className='d-flex justify-content-start align-items-center'>
                        <p className='fs-7 text-danger'>Foto KTP belum diupload</p>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col xxl={6} xl={6} lg={6} md={6} sm={12}>
                  <Form.Group controlId='formFile'>
                    <Form.Label>Foto NPWP</Form.Label>

                    {imageNPWP.fileName !== '' && imageNPWP.blob !== '' ? (
                      <>
                        <ListGroup>
                          <ListGroup.Item
                            action
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              setPreviewImage(imageNPWP.fileName)
                              setVisibleKTP(true)
                            }}
                          >
                            {imageNPWP.fileName}
                          </ListGroup.Item>
                        </ListGroup>

                        {previewImage && (
                          <div>
                            <Image
                              key={previewImage}
                              width={200}
                              style={{display: 'none'}}
                              src={`${apiUrl}/public/tukang/${imageNPWP.fileName}`}
                              preview={{
                                visible: visibelNPWP,
                                src: `${apiUrl}/public/tukang/${imageNPWP.fileName}`,
                                onVisibleChange: (value) => {
                                  setVisibleNPWP(value)
                                },
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className='d-flex justify-content-start align-items-center'>
                        <p className='fs-7 text-danger'>Foto NPWP belum diupload</p>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      <Row className='row-3'>
        <Col xxl={3} xl={3} lg={12} md={12} sm={12}></Col>

        <Col xxl={9} xl={9} lg={12} md={12} sm={12}>
          <hr />

          <Tabs fill defaultActiveKey={1} className='navtab-detail-costumer'>
            <Tab eventKey={1} title='Historical Pengerjaan' className='tab-1'>
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
                    columns={columnsOrder}
                    dataSource={workOrderData}
                    rowKey={(record) => record.work_order_id}
                    tableLayout='auto'
                    scroll={{x: 'max-content'}}
                    pagination={false}
                    sticky={true}
                  />
                </div>
              </Spin>

              <div className='pagination-container mt-5'>
                <span className='total-text'>
                  Showing {totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, totalData)} of {totalData} Work Order
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
                    fetchWorkOrder(page, newPageSize)
                  }}
                />
              </div>
            </Tab>

            <Tab eventKey={2} title='Historical Pengaduan' className='tab-2'>
              <Table
                className='table-striped-rows mt-3'
                bordered
                columns={columnsComplaint}
                dataSource={complaintData}
                rowKey={(record) => record.complaint_id}
                pagination={{position: ['bottomRight']}}
                scroll={{x: 400}}
              />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </section>
  )
}

export {DetailTukangVendor}
