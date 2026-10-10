import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'

import './UpdateComplaint.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import Select from 'react-select'
import {Image, Skeleton} from 'antd'
import {Card, Row, Col, Form, Table, Button, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage, faRotate, faCircleInfo} from '@fortawesome/free-solid-svg-icons'
import {Tag} from 'antd'

interface RemedialStatus {
  value: number | null
  label: string
}

const UpdateComplaintVendor: FC<{updatePageTitle: (complaint: any) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const navigate = useNavigate()

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [resyncLoading, setResyncLoading] = useState<boolean>(false)

  const username = localStorage.getItem('username') as string
  const userRole = localStorage.getItem('userRole') as string

  // Complaint Detail
  const [complaintId, setComplaintId] = useState<any>()
  const [complaintDetail, setComplaintDetail] = useState<any>()

  // Complaint Evidence
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleComplaintEvidence, setVisibleComplaintEvidence] = useState(false)

  // Remedial Evidence
  const [visibleRemedial, setVisibleRemedial] = useState(false)

  const getCrmSyncLabel = (isSync: number) => {
    switch (isSync) {
      case 1:
        return {text: 'Tersinkronisasi', color: 'green'}
      case 2:
        return {text: 'Gagal Sync', color: 'red'}
      default:
        return {text: 'Belum Sync', color: 'default'}
    }
  }

  const handleResync = async () => {
    if (!complaintDetail?.id) return
    setResyncLoading(true)
    try {
      const response = await axios.post(
        `${apiUrl}/complaints/${complaintDetail.id}/resync`,
        {},
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
           // 'ngrok-skip-browser-warning':  'true',
          },
        }
      )

      if (response.data?.status === 200 || response.data?.status === 201) {
        Swal.fire({
          title: 'Berhasil',
          text: 'Data pengaduan berhasil dikirim ulang ke CRM',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
        fetchComplaintData()
      } else {
        Swal.fire({
          title: 'Gagal',
          text: response.data?.message || 'Gagal mengirim ulang ke CRM',
          icon: 'error',
        })
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Gagal',
        text: error?.response?.data?.message || 'Terjadi kesalahan saat resubmit ke CRM',
        icon: 'error',
      })
    } finally {
      setResyncLoading(false)
    }
  }

  const fetchComplaintData = async () => {
    try {
      await axios
        .get(`${apiUrl}/complaints/${params.id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data

          setIsLoadingPage(false)
          setComplaintDetail(data)
          updatePageTitle(data)

          if (data?.id) {
            setComplaintId(data.id)
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRemedialStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/status`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempComplaintChannel = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.category,
        }))

        setOptionRemedialStatus(tempComplaintChannel)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchComplaintData()
    fetchRemedialStatus()
  }, [])

  // Add Remedial Action
  const [picFeedback, setPicFeedback] = useState<string>(username)
  const [picPosition, setPicPosition] = useState<string>(userRole)
  const [remedialDesc, setRemedialDesc] = useState<any>('')
  const [remedialStartDate, setremedialStartDate] = useState<string>('')
  const [remedialEvidence, setRemedialEvidence] = useState<Array<File | null>>([])

  const evidenceRef = useRef<HTMLInputElement>(null)

  // Remedial Status
  const [optionRemedialStatus, setOptionRemedialStatus] = useState<RemedialStatus[]>([])
  const [optionRemedialStatusId, setOptionRemedialStatusId] = useState<string>('')

  // Handle Input Change
  const handleInputRemedialDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedInputValue = event.target.value
    setRemedialDesc(updatedInputValue)
  }

  // Handle Change Remedial Status
  const handleChangeSelectRemedialStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedOptionRemedialStatusId = event.target.value
    setOptionRemedialStatusId(updatedOptionRemedialStatusId)
  }

  // Handle Change Upload File
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList && fileList.length <= 5) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...remedialEvidence]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setRemedialEvidence(mergedFiles)
    } else {
      Swal.fire({
        title: 'Error',
        text: 'File yang diupload maksimal 5',
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
      })
    }
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...remedialEvidence]

    newEvidances.splice(index, 1)

    setRemedialEvidence(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // Remedial Validation
  const RemedialValidation = () => {
    let valid = true

    if (!remedialDesc) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial notes form',
        icon: 'error',
      })
      valid = false
    } else if (!optionRemedialStatus) {
      Swal.fire({
        title: 'Error',
        text: 'Please select remedial status',
        icon: 'error',
      })
      valid = false
    } else if (!remedialEvidence) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial evidence form',
        icon: 'error',
      })
      valid = false
    }
    return valid
  }

  // Handle Submit Remedial Action
  const handleSubmitRemedialAction = async () => {
    if (RemedialValidation()) {
      setIsLoading(true)
      const formData = new FormData()

      formData.append('complaint_id', complaintId)
      formData.append('remedial_action', remedialDesc)
      formData.append('ra_date_start', remedialStartDate)
      formData.append('remedial_pic', picFeedback)
      formData.append('remedial_pic_position', picPosition)
      formData.append('remedial_status', optionRemedialStatusId)

      if (remedialEvidence?.length) {
        remedialEvidence.forEach((item) => {
          if (item) {
            formData.append(`remedial_evidences`, item, item?.name)
          }
        })
      }

      await axios
        .post(`${apiUrl}/remedials`, formData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          if (response.data.status === 200 || response.data.status === 201) {
            Swal.fire({
              title: 'Success',
              text: 'Berhasil menambahkan feedback',
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

          navigate('/complaint/view-complaint')
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
  }

  const handleCancelRemedial = () => {
    navigate('/complaint/view-complaint')
  }

  return (
    <section id='detail-complaint'>
      <div className='card'>
        <div className='card-body'>
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                  <Form.Label className='fs-4 fw-bold'>
                    Nama Toko :{' '}
                    <span className='fs-4 ms-2 fw-normal'>
                      {complaintDetail?.orders?.store?.store_name ?? ''}
                    </span>
                  </Form.Label>
                </Skeleton>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                  <Form.Label className='fs-4 fw-bold'>
                    Order ID :{' '}
                    <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.orders?.id}</span>
                  </Form.Label>
                </Skeleton>
                <br></br>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                  <Form.Label className='fs-4 fw-bold'>
                    Complaint ID :{' '}
                    <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.id}</span>
                  </Form.Label>
                </Skeleton>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Col>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                    <Form.Label className='fs-4 fw-bold'>
                      Receipt Number :
                      <span className='fs-4 ms-2 fw-normal'>
                        {complaintDetail?.orders?.receipt_number ?? '-'}
                      </span>
                    </Form.Label>

                    {complaintDetail?.orders?.quotation[0]?.receipt_quotation && (
                      <Form.Label className='fs-4 fw-bold'>
                        Receipt Quotation :
                        <span className='fs-4 ms-2 fw-normal'>
                          {complaintDetail?.orders?.quotation[0]?.receipt_quotation ?? '-'}
                        </span>
                      </Form.Label>
                    )}
                  </Skeleton>
                </Col>

                <Col>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                    <Form.Label className='fs-4 fw-bold'>
                      Order Status :
                      <span className='fs-4 ms-2 fw-bold text-success'>
                        {(() => {
                          if (
                            complaintDetail?.orders?.work_orders?.work_order_status?.length >= 0
                          ) {
                            if (
                              [
                                'QUOTEIN',
                                'QUOTEOUT',
                                'CANCEL',
                                'WARRANTYCLAIM',
                                'INVESTIGATED',
                                'COMPLAINTAPPROVEDBYHO',
                                'COMPLAINTREJECTEDBYHO',
                                'RESCHEDULE',
                                'RESURVEYREQ',
                                'REWORKREQ',
                              ].includes(complaintDetail?.orders?.status?.category ?? '')
                            ) {
                              return complaintDetail?.orders?.status?.description
                            } else if (
                              ['WORKREQ'].includes(
                                complaintDetail?.orders?.status?.category ?? ''
                              ) &&
                              complaintDetail?.orders?.payment_type === 'survey' &&
                              !['WORKSTART', 'WORKEND'].includes(
                                complaintDetail?.orders?.work_orders?.work_order_status[0]?.status
                                  ?.category ?? ''
                              )
                            ) {
                              return complaintDetail?.orders?.status?.description
                            } else {
                              return complaintDetail?.orders?.work_orders?.work_order_status[0]
                                ?.status?.description
                            }
                          } else {
                            return complaintDetail?.orders?.status?.description
                          }
                        })()}
                      </span>
                    </Form.Label>
                  </Skeleton>
                </Col>

                {/* CRM Sync Status */}
                <div className='mt-3 p-2 border rounded bg-light'>
                  <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center gap-2'>
                      <span className='fw-bold text-warning'>CRM:</span>
                      <Tag color={getCrmSyncLabel(complaintDetail?.is_sync ?? 0).color}>
                        {getCrmSyncLabel(complaintDetail?.is_sync ?? 0).text}
                      </Tag>
                    </div>
                    {(complaintDetail?.is_sync ?? 0) !== 1 && (
                      <Button
                        variant='outline-warning'
                        size='sm'
                        disabled={resyncLoading}
                        onClick={handleResync}
                        title='Resubmit ke CRM'
                      >
                        <FontAwesomeIcon icon={faRotate} spin={resyncLoading} />
                      </Button>
                    )}
                    {(complaintDetail?.is_sync ?? 0) === 1 && (
                      <span className='text-success fw-bold' style={{fontSize: '12px'}}>
                        <FontAwesomeIcon icon={faCircleInfo} className='me-1' />
                        Tersinkronisasi
                      </span>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <Row className='information-detail'>
              <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                  <div className='fs-3 fw-bold'>Informasi Pembeli</div>

                  <Row>
                    <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='6'>
                          No Member :
                        </Form.Label>
                        <Col sm='6'>
                          <p className='fs-7'>{complaintDetail?.orders?.members?.member_number}</p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='6'>
                          Customer Name :
                        </Form.Label>
                        <Col sm='6'>
                          <p className='fs-7'>{complaintDetail?.orders?.members?.full_name}</p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='6'>
                          Alamat Pemasangan :
                        </Form.Label>
                        <Col sm='6'>
                          <p className='fs-7'>{complaintDetail?.orders?.project_address}</p>
                        </Col>
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='5'>
                          Nomor Whatsapp :
                        </Form.Label>
                        <Col sm='7'>
                          <p className='fs-7'>
                            {!complaintDetail?.orders?.project_number.startsWith('0')
                              ? `+62${complaintDetail?.orders?.members?.whatsapp_number}`
                              : '-'}
                          </p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='5'>
                          Nomor Telepon :
                        </Form.Label>
                        <Col sm='7'>
                          <p className='fs-7'>
                            {complaintDetail?.orders?.project_number.startsWith('0')
                              ? complaintDetail?.orders?.members?.phone_number
                              : '-'}
                          </p>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className='detail-info'>
                        <Form.Label column sm='5'>
                          Alamat Email :
                        </Form.Label>
                        <Col sm='7'>
                          <p className='fs-7'>{complaintDetail?.orders?.members?.email} </p>
                        </Col>
                      </Form.Group>
                    </Col>
                  </Row>
                </Skeleton>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                  <div className='fs-3 fw-bold'>Informasi Penjual</div>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='3'>
                      Sales ID :
                    </Form.Label>
                    <Col sm='9'>
                      <p className='fs-7'>{complaintDetail?.orders?.sales?.id} </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='3'>
                      Sales Person :
                    </Form.Label>
                    <Col sm='9'>
                      <p className='fs-7'>{complaintDetail?.orders?.sales?.full_name} </p>
                    </Col>
                  </Form.Group>
                </Skeleton>
              </Col>
            </Row>
          </div>

          <Row className='table-warranty d-flex align-items-center mb-5'>
            <div className='table-title-warranty'>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 2}}>
                <div className='fs-3 fw-bold'>Informasi Pemasangan</div>

                <Row>
                  <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                    <Form.Label column>
                      {complaintDetail?.orders?.payment_type === 'survey'
                        ? 'Tanggal request survey :'
                        : 'Tanggal request pemasangan :'}
                    </Form.Label>
                    <Col>
                      <p className='fs-7 p-0'>
                        {new Date(complaintDetail?.orders?.request_survey).toLocaleDateString(
                          'id-ID',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                    <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
                    <Col>
                      <p className='fs-7 p-0'>
                        {complaintDetail?.orders?.vendor?.company_name ?? '-'}
                      </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
                    <Form.Label column>Payment Type:</Form.Label>
                    <Col>
                      <p className='fs-7 p-0'>
                        {(() => {
                          if (complaintDetail?.orders?.payment_type === 'survey') {
                            return `Berbayar & Survey`
                          } else if (complaintDetail?.orders?.payment_type === 'gratis') {
                            return `Gratis`
                          } else if (
                            complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
                          ) {
                            return `Berbayar & Pemasangan Tanpa Survey`
                          } else {
                            return ``
                          }
                        })()}
                      </p>
                    </Col>
                  </Form.Group>
                </Row>
              </Skeleton>
            </div>

            <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
              {(() => {
                if (
                  (complaintDetail?.orders?.payment_type === 'survey' &&
                    complaintDetail?.orders?.work_orders === null) ||
                  (complaintDetail?.orders?.work_orders?.work_order_status.length === 1 &&
                    complaintDetail?.orders?.payment_type === 'survey')
                ) {
                  return (
                    <div className='table-warranty-content'>
                      {complaintDetail?.orders?.is_overdistance === 1 && (
                        <>
                          <Form.Text className='fs-8 text-dark'>
                            *Order ini lebih dari{' '}
                            <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                            toko sehingga dikenakan biaya tambahan
                          </Form.Text>
                        </>
                      )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Nama Pemasangan</th>
                            <th>QTY Pemasangan</th>
                          </tr>
                        </thead>

                        <tbody>
                          {complaintDetail?.orders?.m_order_details?.map(
                            (item: any, index: any) => (
                              <>
                                <tr key={`${index} - order_detail`}>
                                  <td>{item?.item_code}</td>
                                  <td>{item?.item_name}</td>
                                  <td>{item?.item_notes}</td>
                                  <td>{item?.quantity ?? 0}</td>
                                </tr>
                              </>
                            )
                          )}

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Biaya Survey
                            </td>

                            <td className=' fw-bolder'>Rp. 99.000</td>
                          </tr>

                          {complaintDetail?.orders?.is_overdistance === 1 && (
                            <>
                              <tr>
                                <td colSpan={3} className='text-end fw-bolder align-middle'>
                                  Biaya Tambahan
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  complaintDetail?.orders?.additional_fee
                                ).toLocaleString('id')}`}</td>
                              </tr>

                              <tr>
                                <td colSpan={3} className='text-end fw-bolder'>
                                  Grand Total
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  complaintDetail?.orders?.grand_total
                                ).toLocaleString('id')}`}</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )
                } else if (
                  ['SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
                    complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
                  ) &&
                  complaintDetail?.orders?.payment_type === 'survey' &&
                  complaintDetail?.orders?.work_orders?.work_order_status.length >= 1 &&
                  complaintDetail?.orders?.quotation?.length === 0
                ) {
                  return (
                    <div className='table-warranty-content'>
                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th>Nama Pemasangan</th>
                            <th>QTY Pemasangan</th>
                            <th>Satuan</th>
                          </tr>
                        </thead>

                        <tbody>
                          {complaintDetail?.orders?.work_orders?.work_order_status[0]
                            ?.work_order_items?.length ? (
                            complaintDetail?.orders?.work_orders?.work_order_status[0]?.work_order_items?.map(
                              (item: any, index: any) => (
                                <tr key={`${index}-work_order_detail`}>
                                  <td>
                                    {item.name ?? ''}{' '}
                                    {item.is_customer ? '( Disediakan oleh customer )' : ''}
                                  </td>
                                  <td>{item.quantity ?? 0}</td>
                                  <td>{item.unit ?? ''}</td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              <td>Item belum diset oleh Tukang/Vendor</td>
                              <td>Quantity belum diset oleh Tukang/Vendor</td>
                              <td>Satuan belum diset oleh Tukang/Vendor</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )
                } else if (
                  complaintDetail?.orders?.work_orders?.work_order_status?.length >= 1 &&
                  complaintDetail?.orders?.quotation?.length >= 1 &&
                  complaintDetail?.orders?.payment_type === 'survey'
                ) {
                  return (
                    <div className='table-warranty-content'>
                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Jenis Jasa
                            </th>

                            <th className='text-center' style={{width: '100px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {complaintDetail?.orders?.quotation[0]?.quotation_details
                            ?.filter((x: any) => x.item_type === 2)
                            ?.map((item: any, index: any) => (
                              <tr key={`${index}-quotation`}>
                                <td>
                                  {item?.name ?? '-'}{' '}
                                  {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                                </td>
                                <td>{item?.quantity ?? 0}</td>
                                <td>{item?.unit}</td>
                                <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                  'id'
                                )}`}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th className='text-center' style={{width: '355px'}}>
                              Material Yang Dibutuhkan
                            </th>

                            <th className='text-center' style={{width: '100px'}}>
                              QTY
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Satuan
                            </th>

                            <th className='text-center' style={{width: '250px'}}>
                              Final Price
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {complaintDetail?.orders?.quotation[0]?.quotation_details
                            ?.filter((x: any) => x.item_type === 1)
                            ?.map((item: any, index: any) => (
                              <tr key={`${index}-quotation`}>
                                <td>
                                  {item?.name ?? '-'}{' '}
                                  {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                                </td>
                                <td>{item?.quantity ?? 0}</td>
                                <td>{item?.unit ?? '-'}</td>
                                <td>{`Rp. ${parseInt(item?.final_price ?? 0).toLocaleString(
                                  'id'
                                )}`}</td>
                              </tr>
                            ))}

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Total Jasa
                            </td>
                            <td className='fw-bolder'>{`Rp. ${parseInt(
                              complaintDetail?.orders?.quotation[0]?.quotation_details
                                .filter((x: any) => x.item_type === 2)
                                .reduce(
                                  (total: any, item: any) =>
                                    total + parseInt(item.final_price || 0),
                                  0
                                )
                            ).toLocaleString('id')}`}</td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Total Material
                            </td>
                            <td className='fw-bolder'>{`Rp. ${parseInt(
                              complaintDetail?.orders?.quotation[0]?.quotation_details
                                ?.filter((x: any) => x.item_type === 1)
                                ?.reduce(
                                  (total: any, item: any) =>
                                    total + parseInt(item.final_price || 0),
                                  0
                                )
                            ).toLocaleString('id')}`}</td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Promosi
                            </td>
                            <td className=' fw-bolder'>
                              {`Rp. ${parseInt(
                                complaintDetail?.orders?.quotation[0]?.quotation_disc ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              {`${
                                complaintDetail?.orders?.quotation[0]?.promotion
                                  ? `Additional Promotion (${complaintDetail?.orders?.quotation[0]?.promotion?.name})`
                                  : `Additional Promotion`
                              }`}
                            </td>

                            <td className=' fw-bolder'>
                              {complaintDetail?.orders?.quotation[0]?.promotion?.promotion_type ===
                              1
                                ? `${complaintDetail?.orders?.quotation[0]?.promotion?.promotion} %`
                                : `Rp. ${parseInt(
                                    complaintDetail?.orders?.quotation[0]?.promotion?.promotion ?? 0
                                  ).toLocaleString('id')}`}
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className='text-end fw-bolder'>
                              Grand Total
                            </td>
                            <td className=' fw-bolder'>
                              {`Rp. ${parseInt(
                                complaintDetail?.orders?.quotation[0]?.quotation_grand_total ?? 0
                              ).toLocaleString('id')}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                } else if (
                  complaintDetail?.orders?.payment_type === 'gratis' ||
                  complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
                ) {
                  return (
                    <div className='table-warranty-content'>
                      {complaintDetail?.orders?.is_overdistance === 1 && (
                        <>
                          <Form.Text className='fs-8 text-dark'>
                            *complaintDetail?.orders ini lebih dari{' '}
                            <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                            toko sehingga dikenakan biaya tambahan
                          </Form.Text>
                        </>
                      )}

                      <table className='table hover responsive'>
                        <thead className='table-warranty-head'>
                          <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Nama Pemasangan</th>
                            <th>QTY Pemasangan</th>
                            {!(complaintDetail?.orders?.payment_type === 'gratis') && (
                              <>
                                <th>Harga Jasa</th>
                                <th>Jumlah</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {complaintDetail?.orders?.m_order_details?.map(
                            (item: any, index: any) => (
                              <>
                                <tr key={`${index} - order_detail`}>
                                  <td>{item?.item_code}</td>
                                  <td>{item?.item_name}</td>
                                  <td>{item?.item?.service_name}</td>
                                  <td>{item?.quantity ?? 0}</td>
                                  {!(complaintDetail?.orders?.payment_type === 'gratis') && (
                                    <>
                                      <td>{`Rp. ${parseInt(item?.unit_price || 0)?.toLocaleString(
                                        'id'
                                      )}`}</td>
                                      <td>{`Rp. ${parseInt(item?.total || 0).toLocaleString(
                                        'id'
                                      )}`}</td>
                                    </>
                                  )}
                                </tr>
                              </>
                            )
                          )}

                          {complaintDetail?.orders?.is_overdistance === 1 && (
                            <>
                              <tr>
                                <td
                                  colSpan={
                                    complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3
                                  }
                                  className='text-end fw-bolder align-middle'
                                >
                                  Biaya Tambahan
                                </td>

                                <td className=' fw-bolder'>{`Rp. ${Number(
                                  complaintDetail?.orders?.additional_fee
                                ).toLocaleString('id')}`}</td>
                              </tr>
                            </>
                          )}

                          <tr>
                            <td
                              colSpan={complaintDetail?.orders?.payment_type !== 'gratis' ? 5 : 3}
                              className='text-end fw-bolder'
                            >
                              Grand Total
                            </td>

                            <td className=' fw-bolder'>{`Rp. ${Number(
                              complaintDetail?.orders?.grand_total
                            ).toLocaleString('id')}`}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                }
              })()}
            </Skeleton>
          </Row>

          <hr />

          <Card className='mb-5'>
            <Card.Body>
              <Row className='complaint-info'>
                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Nama PIC Komplain
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>: {complaintDetail?.pic_name ?? '-'}</p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Tanggal Komplain
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>
                          :{' '}
                          {new Date(complaintDetail?.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                          })}
                        </p>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Komplain melalui
                      </Form.Label>

                      <Col sm='7'>
                        <p className='fs-7'>: {complaintDetail?.complaint_channels?.name}</p>
                      </Col>
                    </Form.Group>
                  </Skeleton>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                    <Form.Group className='detail-info'>
                      <Form.Label className='mb-2'>Alasan Komplain :</Form.Label>
                      <p className='fs-7'>{complaintDetail?.description}</p>
                    </Form.Group>
                  </Skeleton>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                  <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                    <Form.Label>Complaint Evidence :</Form.Label>

                    <ListGroup>
                      {complaintDetail?.complaint_histories.map((item: any) =>
                        item.complaint_evidence.map((evidence: any) => (
                          <ListGroup.Item
                            key={evidence.id}
                            action
                            onClick={() => {
                              setPreviewImage(evidence?.evidence_location)
                              setVisibleComplaintEvidence(true)
                            }}
                          >
                            {evidence?.evidence_location}
                          </ListGroup.Item>
                        ))
                      )}
                    </ListGroup>

                    {previewImage && (
                      <div>
                        <Image
                          key={previewImage}
                          width={200}
                          style={{display: 'none'}}
                          src={`${apiUrl}/public/complaints/${previewImage}`}
                          preview={{
                            visible: visibleComplaintEvidence,
                            src: `${apiUrl}/public/complaints/${previewImage}`,
                            onVisibleChange: (value) => {
                              setVisibleComplaintEvidence(value)
                            },
                          }}
                        />
                      </div>
                    )}
                  </Skeleton>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {complaintDetail?.remedials && complaintDetail.remedials.length > 0 && (
            <>
              {complaintDetail.remedials.map((item: any) => (
                <Card className='mb-5'>
                  <Card.Body>
                    <Row key={item.id} className='remedial-info'>
                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              PIC Feedback :
                            </Form.Label>

                            <Col sm='7'>
                              <p className='fs-7'>: {item?.remedial_pic ?? '-'}</p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              Jabatan :
                            </Form.Label>

                            <Col sm='7'>
                              <p className='fs-7'>: {item?.remedial_pic_positon ?? '-'}</p>
                            </Col>
                          </Form.Group>

                          <Form.Group as={Row} className='detail-info'>
                            <Form.Label column sm='5'>
                              Tanggal Feedback
                            </Form.Label>

                            <Col sm='7'>
                              <p className='fs-7'>
                                :{' '}
                                {new Date(item?.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                })}
                              </p>
                            </Col>
                          </Form.Group>

                          {['Owner Vendor', 'Admin Vendor'].includes(
                            item?.remedial_pic_positon
                          ) && (
                            <Form.Group as={Row} className='detail-info'>
                              <Form.Label column sm='5'>
                                Status Vendor
                              </Form.Label>

                              <Col sm='7'>
                                <p className='fs-7'>: {item?.status?.description ?? '-'}</p>
                              </Col>
                            </Form.Group>
                          )}
                        </Skeleton>
                      </Col>

                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                          <Form.Group className='detail-info'>
                            <Form.Label className='mb-2'>Deskripsi Feedback :</Form.Label>
                            <p className='fs-7'>{item?.remedial_action}</p>
                          </Form.Group>
                        </Skeleton>
                      </Col>

                      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                          <Form.Group className='detail-info'>
                            <Form.Label className='mb-2'>Remedial Evidence:</Form.Label>
                            <ListGroup>
                              {item?.remedial_evidences?.map((evidenceItem: any) => (
                                <ListGroup.Item
                                  key={evidenceItem.id}
                                  action
                                  onClick={() => {
                                    setPreviewImage(evidenceItem.evidence_location)
                                    setVisibleRemedial(true)
                                  }}
                                >
                                  {evidenceItem.evidence_location}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>

                            {previewImage && (
                              <div>
                                <Image
                                  key={previewImage}
                                  width={200}
                                  style={{display: 'none'}}
                                  src={`${apiUrl}/public/remedials/${previewImage}`}
                                  preview={{
                                    visible: visibleRemedial,
                                    src: `${apiUrl}/public/remedials/${previewImage}`,
                                    onVisibleChange: (value) => {
                                      setVisibleRemedial(value)
                                    },
                                  }}
                                />
                              </div>
                            )}
                          </Form.Group>
                        </Skeleton>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}

          {!['COMPLAINTREJECTEDBYHO'].includes(complaintDetail?.status?.category) && (
            <>
              <hr />

              <Row>
                <Col xs={12} md={12} lg={12} xl={12} xxl={12}>
                  <div className='fs-3 fw-bold text-success mb-3'>REMEDIAL ACTION</div>

                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Feedback ke Store :</Form.Label>
                        <Form.Control
                          style={{minHeight: '255px'}}
                          as='textarea'
                          onChange={handleInputRemedialDesc}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                    <Col>
                      <Form.Group className='mb-3'>
                        <Form.Label>Change Status :</Form.Label>

                        <Form.Select onChange={handleChangeSelectRemedialStatus}>
                          <option selected>Select Status</option>
                          <option value='4'>Ditindaklanjuti</option>
                          <option value='1009'>Diterima </option>
                          <option value='1011'>Ditolak</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group controlId='formFile'>
                        <Form.Label>Upload Bukti</Form.Label>
                        <Form className='form-input-image' onClick={handleImageClick}>
                          <Form.Control
                            type='file'
                            accept='image/*'
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
                          {remedialEvidence.length ? (
                            remedialEvidence.map((item, index) => (
                              <ListGroup.Item
                                key={`${item?.name}-${index}-${item?.type}`}
                                className='d-flex justify-content-between'
                              >
                                <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                                <span className='upload-content'> {item?.name}</span>

                                <FontAwesomeIcon
                                  icon={faTrash}
                                  size='sm'
                                  color='#ed2b2a'
                                  style={{cursor: 'pointer'}}
                                  onClick={(e) => handleRemoveFile(index)}
                                />
                              </ListGroup.Item>
                            ))
                          ) : (
                            <ListGroup.Item className='d-flex justify-content-center'>
                              Tidak ada file yang dipilih
                            </ListGroup.Item>
                          )}
                        </ListGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <div className='d-flex justify-content-center align-items-center mt-5'>
                <Button
                  variant='dark-danger'
                  className='d-flex justify-content-center align-items-center'
                  type='submit'
                  disabled={isLoading}
                  onClick={handleCancelRemedial}
                >
                  Cancel
                </Button>

                <Button
                  variant='dark-primary'
                  className='d-flex justify-content-center align-items-center'
                  type='submit'
                  disabled={isLoading}
                  onClick={handleSubmitRemedialAction}
                >
                  {isLoading ? 'Submitting..' : 'Submit'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export {UpdateComplaintVendor}
