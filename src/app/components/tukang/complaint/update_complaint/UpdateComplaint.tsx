import React, {FC, useState, useEffect, useRef} from 'react'

import './UpdateComplaint.css'

import axios from 'axios'
import Swal from 'sweetalert2'
import Select from 'react-select'
import {Image} from 'antd'
import {useNavigate, useParams} from 'react-router-dom'
import {Row, Col, Form, Table, Button, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faImage, faFileImage} from '@fortawesome/free-solid-svg-icons'

interface OptionRemedialStatus {
  value: any
  label: string
}

interface ComplaintChannel {
  value: string
  label: string
}

const UpdateComplaintTukang: FC<{updatePageTitle: (complaint: any) => void}> = ({
  updatePageTitle,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const userId = localStorage.getItem('user_id') as any

  // Complaint Detail
  const [orderId, setOrderId] = useState<any>()
  const [complaintId, setComplaintId] = useState<any>()
  const [complaintDetail, setComplaintDetail] = useState<any>()

  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)

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

          setComplaintDetail(data)
          updatePageTitle(data)

          if (data?.orders.id) {
            setOrderId(data.orders.id)
          }

          if (data?.id) {
            setComplaintId(data.id)
          }

          if (data?.description) {
            setComplaintDesc(data.description)
          }

          if (data?.complaint_date) {
            setComplaintDate(new Date(data.complaint_date).toISOString().split('T')[0])
          }

          if (data?.complaint_channels?.id && data?.complaint_channels?.name) {
            setComplaintChannelId(data.complaint_channels.id)
            setComplaintChannelName(data.complaint_channels.name)
          }

          if (data?.complaint_evidence) {
            const initialComplaintEvidenceValues = data.complaint_evidence.map((item: any) => ({
              id: item.id,
              name: item.evidence_location,
            }))

            setComplaintEvidence(initialComplaintEvidenceValues)
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

  const fetchComplaintChannel = async () => {
    try {
      const response = await axios.get(`${apiUrl}/complaint-channels`, {
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
          label: item.name,
        }))

        setComplaintChannel(tempComplaintChannel)
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
    fetchComplaintChannel()
  }, [])

  const phoneNumber =
    complaintDetail?.orders.members.phone_number !== null
      ? complaintDetail?.orders.members.phone_number
      : complaintDetail?.orders.members.whatsapp_number

  const formatDate = (date: any) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const today = new Date().toISOString().split('T')[0]

  // Update Complaint
  const [complaintDesc, setComplaintDesc] = useState<any>('')
  const [complaintDate, setComplaintDate] = useState<string>('')
  const [complaintStatus, setComplaintStatus] = useState<any>(1)
  const [complaintEvidence, setComplaintEvidence] = useState<Array<File | null>>([])

  const evidenceRef = useRef<HTMLInputElement>(null)

  // Complaint Channel
  const [complaintChannel, setComplaintChannel] = useState<ComplaintChannel[]>([])
  const [complaintChannelId, setComplaintChannelId] = useState<string>('')
  const [complaintChannelName, setComplaintChannelName] = useState<string>('')

  // Handle Input Change
  const handleInputComplaintDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedInputValue = event.target.value
    setComplaintDesc(updatedInputValue)
  }

  // Handle Change Complaint Channel
  const handleChangeSelectComplaintChannel = (element: any) => {
    const updatedComplaintChannelId = element.value
    const updatedComplaintChannelName = element.label

    setComplaintChannelId(updatedComplaintChannelId)
    setComplaintChannelName(updatedComplaintChannelName)
  }

  // Handle Complaint Date Change
  const handleChangeComplaintDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedComplaintDate = event.target.value
    setComplaintDate(updatedComplaintDate)
  }

  // Handle Change Complaint File
  const handleFileComplaintChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()

      const existingFiles = [...complaintEvidence]

      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setComplaintEvidence(mergedFiles)
    }
  }

  const handleComplaintImageClick = () => {
    const inputField = document.querySelector('.input-field-image-complaint') as HTMLInputElement
    inputField.click()
  }

  const handleComplaintRemoveFile = (index: number) => {
    const newEvidances = [...complaintEvidence]

    newEvidances.splice(index, 1)

    setComplaintEvidence(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // Update Complaint Validation
  const UpdateComplaintValidation = () => {
    let valid = true

    if (!complaintDesc) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill complaint description',
        icon: 'error',
      })
      valid = false
    } else if (!complaintChannelId) {
      Swal.fire({
        title: 'Error',
        text: 'Please select complaint via form',
        icon: 'error',
      })
      valid = false
    } else if (!complaintDate) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill complaint date form',
        icon: 'error',
      })
      valid = false
    } else if (!complaintEvidence) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill complaint evidence form',
        icon: 'error',
      })
      valid = false
    }
    return valid
  }

  // Handle Update Complaint
  const handleUpdateComplaint = async () => {
    if (UpdateComplaintValidation()) {
      setIsLoading(true)
      const formData = new FormData()

      formData.append('order_id', orderId)
      formData.append('description', complaintDesc)
      formData.append('complaint_channel', complaintChannelId)
      formData.append('complaint_date', complaintDate)

      if (complaintEvidence?.length) {
        complaintEvidence.forEach((item) => {
          if (item) {
            formData.append(`complaint_evidences-complaint`, item, item?.name)
          }
        })
      }

      const response = await axios
        .post(`${apiUrl}/complaints/${params.id}`, formData, {
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
              text: 'Success Update Complaint',
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

  // Add Remedial Action
  const [picRemedialId, setPicRemedialId] = useState<any>()
  const [remedialDesc, setRemedialDesc] = useState<any>('')
  const [remedialStartDate, setremedialStartDate] = useState<string>('')
  const [remedialEndDate, setremedialEndDate] = useState<string>('')
  const [remedialEvidence, setRemedialEvidence] = useState<Array<File | null>>([])

  const remedialEvidenceRef = useRef<HTMLInputElement>(null)

  // Remedial Status
  const [optionRemedialStatus, setOptionRemedialStatus] = useState<OptionRemedialStatus[]>([])
  const [optionRemedialStatusId, setOptionRemedialStatusId] = useState<string>('')
  const [optionRemedialStatusName, setOptionRemedialStatusName] = useState<string>('')

  // PIC Remedial
  useEffect(() => {
    const updatedPicRemedial = userId.toString()
    setPicRemedialId(updatedPicRemedial)
  }, [userId])

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

  // const handleChangeSelectRemedialStatus = (element: any) => {
  //   const updatedOptionRemedialStatusId = element.value
  //   const updatedOptionRemedialStatusName = element.label

  //   setOptionRemedialStatusId(updatedOptionRemedialStatusId)
  //   setOptionRemedialStatusName(updatedOptionRemedialStatusName)
  // }

  // Handle Complaint Date Change
  const handleChangeremedialStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedremedialStartDate = event.target.value
    setremedialStartDate(updatedremedialStartDate)
  }

  const handleChangeremedialEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedremedialEndDate = event.target.value
    setremedialEndDate(updatedremedialEndDate)
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
    const inputField = document.querySelector('.input-field-image-remedial') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...remedialEvidence]

    newEvidances.splice(index, 1)

    setRemedialEvidence(newEvidances)

    // Update element value
    if (remedialEvidenceRef.current?.value) {
      remedialEvidenceRef.current.value = ''
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
    } else if (!remedialStartDate) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial start date form',
        icon: 'error',
      })
      valid = false
    } else if (!remedialEndDate) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill remedial end date form',
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
      formData.append('ra_date_end', remedialEndDate)
      formData.append('remedial_pic', picRemedialId)
      formData.append('remedial_status', optionRemedialStatusId)

      if (remedialEvidence?.length) {
        remedialEvidence.forEach((item) => {
          if (item) {
            formData.append(`remedial_evidences`, item, item?.name)
          }
        })
      }

      const response = await axios
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
              text: 'Success Update Complaint',
              icon: 'success',
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

  return (
    <section id='update-complaint-vendor'>
      <div className='card'>
        <div className='card-body'>
          <div className='form-wrapper'>
            <Row className='form-header'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Nama Toko :
                  <span className='fs-4 ms-2 fw-normal'>
                    {complaintDetail?.orders.store.store_name}
                  </span>
                </Form.Label>
                <br></br>
                <Form.Label className='fs-4 fw-bold'>
                  Complaint ID : <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.id}</span>
                </Form.Label>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Order ID :
                  <span className='fs-4 ms-2 fw-normal'>{complaintDetail?.orders.id}</span>
                </Form.Label>

                <Form.Group as={Row}>
                  <Form.Label column sm='4' className='fs-4 fw-bold m-0'>
                    Order Date :
                  </Form.Label>
                  <Col sm='8'>
                    <Form.Control
                      type='text'
                      plaintext
                      readOnly
                      value={
                        complaintDetail?.orders
                          ? formatDate(new Date(complaintDetail?.orders.created_at))
                          : ''
                      }
                    />
                  </Col>
                </Form.Group>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Form.Label className='fs-4 fw-bold'>
                  Receipt Number :
                  <span className='fs-4 ms-2 fw-normal'>
                    {complaintDetail?.orders.receipt_number}
                  </span>
                </Form.Label>
              </Col>
            </Row>

            <Row className='information-detail'>
              <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
                <div className='fs-3 fw-bold'>Informasi Pembeli</div>
                <Row>
                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        No Member :
                      </Form.Label>
                      <Col sm='6'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders.members.id}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Customer Name :
                      </Form.Label>
                      <Col sm='6'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders.members.full_name}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Alamat Pemasangan :
                      </Form.Label>
                      <Col sm='6'>
                        <Form.Control
                          as='textarea'
                          plaintext
                          readOnly
                          rows={3}
                          value={complaintDetail?.orders.project_address}
                        />
                      </Col>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Nomor Telp/WA :
                      </Form.Label>
                      <Col sm='8'>
                        <Form.Control plaintext readOnly value={phoneNumber} />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='4'>
                        Alamat Email :
                      </Form.Label>
                      <Col sm='8'>
                        <Form.Control
                          plaintext
                          readOnly
                          value={complaintDetail?.orders.members.email}
                        />
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
                <div className='fs-3 fw-bold'>Informasi Penjual</div>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='6'>
                    Sales ID :
                  </Form.Label>
                  <Col sm='6'>
                    <Form.Control plaintext readOnly value={complaintDetail?.orders.sales.id} />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='6'>
                    Sales Person :
                  </Form.Label>
                  <Col sm='6'>
                    <Form.Control
                      plaintext
                      readOnly
                      value={complaintDetail?.orders.sales.full_name}
                    />
                  </Col>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <Row className='table-warranty d-flex align-items-center mb-5'>
            <div className='table-title-warranty mb-2'>
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
                      {formatDate(new Date(complaintDetail?.orders?.request_survey))}
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
            </div>

            {(() => {
              if (
                complaintDetail?.orders?.payment_type === 'survey' ||
                complaintDetail?.orders?.work_orders?.work_order_status.length === 1
              ) {
                return (
                  <div className='table-warranty-content'>
                    {complaintDetail?.orders?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive='md'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaintDetail?.orders?.m_order_details.map((item: any, index: any) => (
                          <>
                            <tr key={`${index} - order_detail`}>
                              <td>{item?.item_code}</td>
                              <td>{item?.item_name}</td>
                              <td>{item?.item_notes}</td>
                              <td>{item?.quantity ?? 0}</td>
                            </tr>
                          </>
                        ))}

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
                    </Table>
                  </div>
                )
              } else if (
                ['QUOTEIN', 'QUOTEOUT'].includes(complaintDetail?.orders?.status?.category ?? '') &&
                complaintDetail?.orders?.payment_type === 'survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    {complaintDetail?.orders?.is_overdistance === 1 && (
                      <>
                        <Form.Text className='fs-8 text-dark'>
                          *Order ini lebih dari
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive='md'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th className='text-center'>Jenis Jasa</th>
                          <th className='text-center'>QTY</th>
                          <th className='text-center'>Satuan</th>
                          <th className='text-center'>Price</th>
                          <th className='text-center'>Total</th>
                          <th className='text-center'>Keterangan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaintDetail?.orders?.quotation[0]?.quotation_details.map(
                          (item: any, index: any) => (
                            <tr key={`${index}-quotation`}>
                              <td>{item?.name ?? '-'}</td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit}</td>
                              <td>{`Rp. ${parseInt(item?.price || 0).toLocaleString('id')}`}</td>
                              <td>{`Rp. ${parseInt(item?.final_price || 0).toLocaleString(
                                'id'
                              )}`}</td>
                              <td>{item?.description ? '' : '-'}</td>
                            </tr>
                          )
                        )}

                        <tr>
                          <td colSpan={6} className='text-end fw-bolder'>
                            Promosi ( Free Survey )
                          </td>
                          <td className=' fw-bolder'>
                            {`Rp. ${parseInt(
                              complaintDetail?.orders?.quotation[0]?.quotation_disc ?? 0
                            ).toLocaleString('id')}`}
                          </td>
                        </tr>

                        {complaintDetail?.orders?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                complaintDetail?.orders?.additional_fee
                              ).toLocaleString('id')}.`}</td>
                            </tr>
                          </>
                        )}

                        <tr>
                          <td colSpan={5} className='text-end fw-bolder'>
                            Grand Total
                          </td>
                          <td className=' fw-bolder'>
                            {`Rp. ${parseInt(
                              complaintDetail?.orders?.quotation[0]?.quotation_grand_total ?? 0
                            ).toLocaleString('id')}`}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )
              } else if (
                ['SURVEYSTART', 'SURVEYDONE', 'WORKEND', 'DONE'].includes(
                  complaintDetail?.orders?.work_orders?.work_order_status[0]?.status?.category
                ) &&
                complaintDetail?.orders?.work_orders?.work_order_status.length > 1 &&
                complaintDetail?.orders?.payment_type === 'survey'
              ) {
                return (
                  <div className='table-warranty-content'>
                    <Table hover responsive='md'>
                      <thead className='table-warranty-head'>
                        <tr>
                          <th>Item / Nama Pemasangan</th>
                          <th>QTY Pemasangan</th>
                          <th>Satuan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaintDetail?.orders?.work_orders?.work_order_status[0]?.work_order_items.map(
                          (item: any, index: any) => (
                            <tr key={`${index}-work_order_detail`}>
                              <td>{item?.name ?? '-'}</td>
                              <td>{item?.quantity ?? 0}</td>
                              <td>{item?.unit ?? ''}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </Table>
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
                          *Order ini lebih dari
                          <span className='fw-bolder text-decoration-underline'>10 KM</span> dari
                          toko sehingga dikenakan biaya tambahan
                        </Form.Text>
                      </>
                    )}

                    <Table hover responsive='md'>
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
                        {complaintDetail?.orders?.m_order_details.map((item: any, index: any) => (
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
                        ))}

                        {complaintDetail?.orders?.is_overdistance === 1 && (
                          <>
                            <tr>
                              <td colSpan={3} className='text-end fw-bolder align-middle'>
                                Biaya Tambahan
                              </td>

                              <td className=' fw-bolder'>{`Rp. ${Number(
                                complaintDetail?.orders?.additional_fee
                              ).toLocaleString('id')}.`}</td>
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

                          <td className=' fw-bolder'>
                            {(() => {
                              if (complaintDetail?.orders?.payment_type === 'gratis') {
                                return `Rp. ${(0).toLocaleString('id')}`
                              } else if (
                                complaintDetail?.orders?.payment_type === 'pemasangan_tanpa_survey'
                              ) {
                                return `Rp. ${parseInt(
                                  complaintDetail?.orders?.grand_total
                                ).toLocaleString('id')}`
                              } else {
                                return `Rp. ${(0).toLocaleString('id')}`
                              }
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )
              }
            })()}
          </Row>

          <hr />

          <Row>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <div className='fs-3 fw-bold text-danger'>COMPLAINT HISTORY</div>
              <Row>
                <Col>
                  <Form.Group className='detail-info mt-3'>
                    <Form.Label>Complaint ID :</Form.Label>
                    <Col>
                      <Form.Control type='text' readOnly value={complaintDetail?.id} />
                    </Col>
                  </Form.Group>

                  <Form.Group className='mt-3'>
                    <Form.Label>Complaint Channel : </Form.Label>
                    <Select
                      name='complaint_channel_id'
                      className='form-control p-0'
                      classNamePrefix='select'
                      placeholder='Complaint Via'
                      isSearchable={true}
                      options={complaintChannel}
                      value={{
                        value: complaintChannelId,
                        label: complaintChannelName,
                      }}
                      onChange={(element) => handleChangeSelectComplaintChannel(element)}
                    />
                  </Form.Group>

                  <Form.Group className='mt-3'>
                    <Form.Label>Complaint Detail :</Form.Label>
                    <Form.Control
                      style={{minHeight: '250px'}}
                      as='textarea'
                      value={complaintDesc}
                      onChange={handleInputComplaintDesc}
                    ></Form.Control>
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group className='mt-3'>
                    <Form.Label>Complaint Date :</Form.Label>
                    <Form.Control
                      type='date'
                      min={today}
                      value={complaintDate}
                      onChange={handleChangeComplaintDate}
                    />
                  </Form.Group>

                  <Form.Group className='mt-3' controlId='formFile'>
                    <Form.Label>Complaint Evidence</Form.Label>
                    <Form className='form-input-image' onClick={handleComplaintImageClick}>
                      <Form.Control
                        type='file'
                        accept='image/*'
                        className='input-field-image-complaint'
                        multiple
                        hidden
                        id='file-input'
                        ref={evidenceRef}
                        onChange={handleFileComplaintChange}
                      />

                      <div className='input-image-text'>
                        <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                        <p>Add File</p>
                      </div>
                    </Form>

                    <ListGroup className='pt-3'>
                      {complaintEvidence.length ? (
                        complaintEvidence.map((item, index) => (
                          <ListGroup.Item
                            key={`${item?.name}-${index}-${item?.type}`}
                            className='d-flex justify-content-between'
                            onClick={() => {
                              setPreviewImage(item?.name)
                              setVisible(true)
                            }}
                          >
                            <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                            <span className='upload-content'>{item?.name}</span>

                            <FontAwesomeIcon
                              icon={faTrash}
                              size='sm'
                              color='#ed2b2a'
                              style={{cursor: 'pointer'}}
                              onClick={(e) => handleComplaintRemoveFile(index)}
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

            {complaintDetail?.status.category === 'REJECT' ? (
              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <div className='fs-3 fw-bold text-success'>
                  REMEDIAL ACTION
                  <span className='ms-3 fs-5 fw-semibold text-danger'>
                    ( *Complaint is not approved yet )
                  </span>
                </div>

                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label className='mt-3'>Start Date :</Form.Label>
                      <Form.Control disabled type='date' />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className='mt-3'>Change Status :</Form.Label>

                      <Form.Select disabled>
                        <option selected>Select Status</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className='mt-5'>Notes :</Form.Label>
                      <Form.Control
                        disabled
                        style={{minHeight: '200px'}}
                        as='textarea'
                      ></Form.Control>
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group>
                      <Form.Label className='mt-3'>End Date :</Form.Label>
                      <Form.Control disabled type='date' />
                    </Form.Group>

                    <Form.Group controlId='formFile' className='mt-3'>
                      <Form.Label>Upload Bukti</Form.Label>

                      <ListGroup>
                        <ListGroup.Item className='list-group-not-approve d-flex justify-content-center'>
                          Tidak dapat memilih file
                        </ListGroup.Item>
                      </ListGroup>
                    </Form.Group>
                  </Col>

                  <div className='d-flex justify-content-center align-items-center mt-5'>
                    <Button
                      variant='dark-success'
                      className='d-flex justify-content-center align-items-center'
                      type='submit'
                    >
                      Submit Remedial
                    </Button>
                  </div>
                </Row>
              </Col>
            ) : (
              <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                <div className='fs-3 fw-bold text-success'>REMEDIAL ACTION</div>

                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label className='mt-3'>Start Date :</Form.Label>
                      <Form.Control
                        type='date'
                        min={today}
                        onChange={handleChangeremedialStartDate}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className='mt-3'>Change Status :</Form.Label>

                      <Form.Select onChange={handleChangeSelectRemedialStatus}>
                        <option selected>Select Status</option>
                        <option value='3'>INVESTIGATE</option>
                        <option value='25'>ACCEPTED</option>
                        <option value='27'>REJECTED</option>
                        <option value='17'>REWORKREQ</option>
                        <option value='18'>REWORKSTART</option>
                        <option value='19'>REWORKEND</option>
                        <option value='8'>RESURVEYREQ</option>
                        <option value='28'>RESCHEDULE</option>
                        <option value='24'>REFUND</option>
                        <option value='1006'>DONE</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className='mt-5'>Notes :</Form.Label>
                      <Form.Control
                        style={{minHeight: '200px'}}
                        as='textarea'
                        onChange={handleInputRemedialDesc}
                      ></Form.Control>
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group>
                      <Form.Label className='mt-3'>End Date :</Form.Label>
                      <Form.Control
                        type='date'
                        min={today}
                        onChange={handleChangeremedialEndDate}
                      />
                    </Form.Group>

                    <Form.Group controlId='formFile' className='mt-3'>
                      <Form.Label>Upload Bukti</Form.Label>
                      <Form className='form-input-image' onClick={handleImageClick}>
                        <Form.Control
                          type='file'
                          accept='image/*'
                          className='input-field-image-remedial'
                          multiple
                          hidden
                          id='file-input'
                          ref={remedialEvidenceRef}
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
            )}
          </Row>

          <Row>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <div className='d-flex justify-content-center align-items-center mt-5'>
                <Button
                  variant='dark-primary'
                  className='d-flex justify-content-center align-items-center'
                  type='submit'
                  disabled={isLoading}
                  onClick={handleUpdateComplaint}
                >
                  {isLoading ? 'Updating..' : 'Update Complaint'}
                </Button>
              </div>
            </Col>

            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <div className='d-flex justify-content-center align-items-center mt-5'>
                <Button
                  variant='dark-success'
                  className='d-flex justify-content-center align-items-center'
                  type='submit'
                  disabled={isLoading}
                  onClick={handleSubmitRemedialAction}
                >
                  {isLoading ? 'Submitting..' : 'Submit Remedial'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </section>
  )
}

export {UpdateComplaintTukang}
