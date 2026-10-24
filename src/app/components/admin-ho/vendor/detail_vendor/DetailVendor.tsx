import React, {FC, useState, useEffect} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'
import {Vendor} from '../../../../interfaces/vendor'
import {vendorSpService} from '../../../../services/vendorSpService'
import {vendorViolationService} from '../../../../services/vendorViolationService'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faExclamationTriangle,
  faUser,
  faUserShield,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons'

import './DetailVendor.css'

import {useParams, useNavigate, Link} from 'react-router-dom'
import {Form, Row, Col, Nav, Tab, Modal, Button, Alert} from 'react-bootstrap'
import Swal from 'sweetalert2'

const DetailVendorHO: FC<{updatePageTitle: (vendor: Vendor) => void}> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole')
  const isVendorRole = userRole === 'Admin Vendor' || userRole === 'Owner Vendor'

  const getOrderTargetRoute = (orderId: number | string) =>
    isVendorRole
      ? `/work-order/detail-work-order/${orderId}`
      : `/order/detail-order/${orderId}`

  const [vendorDetail, setVendorDetail] = useState<any>()

  // SP History state
  const [spHistory, setSpHistory] = useState<any[]>([])
  const [spHistoryLoading, setSpHistoryLoading] = useState(false)

  // Violation logs state
  const [violationLogs, setViolationLogs] = useState<any[]>([])
  const [violationLogsLoading, setViolationLogsLoading] = useState(false)

  // Quarter points state
  const [quarterPoints, setQuarterPoints] = useState<any>(null)
  const [quarterPointsLoading, setQuarterPointsLoading] = useState(false)
  const [revisionRequests, setRevisionRequests] = useState<any[]>([])
  const [revisionModal, setRevisionModal] = useState(false)
  const [revisionType, setRevisionType] = useState<'REVISE' | 'RESET'>('REVISE')
  const [revisionTargetLogId, setRevisionTargetLogId] = useState<number | ''>('')
  const [revisionNewPoint, setRevisionNewPoint] = useState<number>(0)
  const [revisionReason, setRevisionReason] = useState('')
  const [revisionSubmitting, setRevisionSubmitting] = useState(false)

  // Tukang list state
  const [tukangList, setTukangList] = useState<any[]>([])
  const [tukangLoading, setTukangLoading] = useState(false)

  // SP Status
  const [spStatus, setSpStatus] = useState<any>(null)
  const [spLoading, setSpLoading] = useState(false)
  const canSubmitRevision = userRole === 'Admin HO' || userRole === 'Super User'

  // Fetch API
  const fetchVendorData = async () => {
    try {
      await axiosInstance
        .get(`${apiUrl}/vendor/${params.id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Access-Control-Allow-Origin': '*',
           // 'ngrok-skip-browser-warning':  'true',
          },
        })
        .then((response) => {
          const data = response.data.data

          setVendorDetail(data)
          updatePageTitle(data)

          if (data?.vendor_document) {
            const documentTypes = ['npwp_file', 'ktp_file', 'compro_file', 'surat_permohonan_file']

            type DocumentStateSetter = (state: {blob: string; fileName: string}) => void

            const documentStateSetters: Record<string, DocumentStateSetter> = {
              npwp_file: setimageNPWP,
              ktp_file: setimageKTP,
              compro_file: setimageCompro,
              surat_permohonan_file: setimageSuratPermohonan,
            }

            data.vendor_document.forEach((document: any) => {
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
      console.error(error)
    }
  }

  // Fetch SP Status
  const fetchSpStatus = async (vendorId: number) => {
    setSpLoading(true)
    try {
      const response = await axiosInstance.get(
        `${apiUrl}/vendor-sp/check/${vendorId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Access-Control-Allow-Origin': '*',
            'ngrok-skip-browser-warning': 'true',
          },
        }
      )
      setSpStatus(response.data)
    } catch (error) {
      console.error('Error fetching SP status:', error)
      setSpStatus({ has_active_sp: false })
    } finally {
      setSpLoading(false)
    }
  }

  // Fetch SP History
  const fetchSpHistory = async (vendorId: number) => {
    setSpHistoryLoading(true)
    try {
      const response = await vendorSpService.getByVendor(vendorId)
      setSpHistory(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error fetching SP history:', error)
      setSpHistory([])
    } finally {
      setSpHistoryLoading(false)
    }
  }

  // Fetch Violation Logs
  const fetchViolationLogs = async (vendorId: number) => {
    setViolationLogsLoading(true)
    try {
      const response = await vendorViolationService.getLogsByVendor(vendorId, { take: 50 })
      setViolationLogs(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error fetching violation logs:', error)
      setViolationLogs([])
    } finally {
      setViolationLogsLoading(false)
    }
  }

  // Fetch Quarter Points
  const fetchQuarterPoints = async (vendorId: number) => {
    setQuarterPointsLoading(true)
    try {
      const response = await vendorViolationService.getVendorQuarterPoints(vendorId)
      setQuarterPoints(response.data || response || null)
    } catch (error) {
      console.error('Error fetching quarter points:', error)
      setQuarterPoints(null)
    } finally {
      setQuarterPointsLoading(false)
    }
  }

  const fetchRevisionRequests = async (vendorId: number) => {
    try {
      const response = await vendorViolationService.getRevisionRequests({
        vendor_id: vendorId,
        take: 20,
      })
      setRevisionRequests(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error fetching revision requests:', error)
      setRevisionRequests([])
    }
  }

  // Fetch Tukang List
  const fetchTukangList = async (vendorId: number) => {
    setTukangLoading(true)
    try {
      const response = await axiosInstance.get(`${apiUrl}/tukang/vendor/${vendorId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      })
      const data = response.data?.data || response.data || []
      setTukangList(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching tukang list:', error)
      setTukangList([])
    } finally {
      setTukangLoading(false)
    }
  }

  useEffect(() => {
    fetchVendorData()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (vendorDetail?.id) {
      fetchSpStatus(vendorDetail.id)
      fetchSpHistory(vendorDetail.id)
      fetchViolationLogs(vendorDetail.id)
      fetchQuarterPoints(vendorDetail.id)
      fetchRevisionRequests(vendorDetail.id)
      fetchTukangList(vendorDetail.id)
    }
    // eslint-disable-next-line
  }, [vendorDetail?.id])

  const formatDate = (date: any) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Get SP Level Color
  const getSpLevelColor = (level: number | null) => {
    if (!level) return 'default'
    switch (level) {
      case 1:
        return 'orange'
      case 2:
        return 'red'
      case 3:
        return 'purple'
      default:
        return 'default'
    }
  }

  // Get SP Level Text
  const getSpLevelText = (level: number | null) => {
    if (!level) return '-'
    switch (level) {
      case 1:
        return 'SP1'
      case 2:
        return 'SP2'
      case 3:
        return 'SP3'
      default:
        return '-'
    }
  }

  // Get SP Warning Message
  const getSpWarningMessage = (level: number) => {
    switch (level) {
      case 1:
        return 'Pengurangan alokasi 50%'
      case 2:
        return 'Pengurangan alokasi 75%'
      case 3:
        return 'Vendor dinonaktifkan'
      default:
        return ''
    }
  }

  const openRevisionModal = (type: 'REVISE' | 'RESET', logId?: number) => {
    setRevisionType(type)
    setRevisionTargetLogId(logId || '')
    setRevisionNewPoint(0)
    setRevisionReason('')
    setRevisionModal(true)
  }

  const submitRevisionRequest = async () => {
    if (!vendorDetail?.id) return
    if (!revisionReason.trim()) {
      Swal.fire('Warning', 'Alasan wajib diisi', 'warning')
      return
    }
    if (revisionType === 'REVISE' && !revisionTargetLogId) {
      Swal.fire('Warning', 'Pilih log pelanggaran yang akan direvisi', 'warning')
      return
    }

    setRevisionSubmitting(true)
    try {
      await vendorViolationService.createRevisionRequest({
        vendor_id: vendorDetail.id,
        type: revisionType,
        target_log_id: revisionType === 'REVISE' ? revisionTargetLogId : undefined,
        new_point: revisionType === 'REVISE' ? revisionNewPoint : undefined,
        reason: revisionReason,
      })
      setRevisionModal(false)
      await fetchRevisionRequests(vendorDetail.id)
      Swal.fire('Berhasil', 'Request revisi/reset berhasil diajukan', 'success')
    } catch (error: any) {
      Swal.fire(
        'Error',
        error?.response?.data?.message || 'Gagal mengajukan request revisi/reset',
        'error'
      )
    } finally {
      setRevisionSubmitting(false)
    }
  }

  // Vendor Evidence
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

  const [imageCompro, setimageCompro] = useState<{
    blob: string
    fileName: string
  }>({
    blob: '',
    fileName: '',
  })

  const [imageSuratPermohonan, setimageSuratPermohonan] = useState<{
    blob: string
    fileName: string
  }>({
    blob: '',
    fileName: '',
  })

  return (
    <section id='detail-vendor'>
      <div className='card mb-5'>
        <div className='card-body'>
          <Row>
            <Col xl={3}>
              <div className='vendor-profile'>
                <img
                  className='d-block m-auto mb-4'
                  src={toAbsoluteUrl('/media/avatars/blank.png')}
                  alt='Avatar'
                />
              </div>

              <h1 className='text-center fs-1 fw-bold'>{vendorDetail?.company_name}</h1>

              <Row className='d-flex justify-content-center'>
                <Col>
                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Vendor ID :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.id}</p>
                    </Col>
                  </Form.Group>

                  {spStatus?.has_ever_sp && (
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='6'>
                        Riwayat SP :
                      </Form.Label>
                      <Col sm='6'>
                        <span className='badge badge-light-danger fw-semibold'>Pernah SP</span>
                      </Col>
                    </Form.Group>
                  )}

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Join Since :
                    </Form.Label>

                    <Col sm='6'>
                      <p className='fw-normal mt-3'>
                        {vendorDetail ? formatDate(new Date(vendorDetail?.created_at)) : ''}
                      </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Status :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>
                        {vendorDetail?.is_active ? 'ACTIVE' : 'NON ACTIVE'}
                      </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Status SP :
                    </Form.Label>
                    <Col sm='6'>
                      {spStatus?.has_active_sp ? (
                        <span
                          className={`badge fw-semibold ${
                            spStatus?.sp_level === 1
                              ? 'badge-warning'
                              : spStatus?.sp_level === 2
                              ? 'badge-danger'
                              : 'badge-dark'
                          }`}
                        >
                          {getSpLevelText(spStatus?.sp_level)} ({spStatus?.total_point ?? 0} poin)
                        </span>
                      ) : (
                        <span className='badge badge-light-success fw-semibold'>NORMAL</span>
                      )}
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Margin :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.margin_nominal ?? 0} %</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Phone Number :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.phone_number}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Email Address :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.email_address}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Address :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.address}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Nama PIC :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.pic_name ?? ''}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Phone Number :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.phone_number}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Email Address :
                    </Form.Label>

                    <Col sm='6'>
                      <p className='fw-normal mt-3'>{vendorDetail?.email_address}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Service Type :
                    </Form.Label>

                    <Col sm='6'>
                      {vendorDetail?.vendor_service.length ? (
                        <p className='fw-normal mt-3'>
                          {Array.from(
                            new Set(
                              vendorDetail?.vendor_service.map(
                                (item: any) => item?.service_type?.service_type ?? '-'
                              )
                            )
                          ).join(', ')}
                        </p>
                      ) : (
                        <p className='fw-normal mt-3'>Service type belum diset</p>
                      )}
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Area Toko :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fw-normal mt-3'>
                        {Array.from(
                          new Set(
                            vendorDetail?.vendor_store.map(
                              (item: any) => item?.store?.store_name ?? '-'
                            )
                          )
                        ).join(', ')}
                      </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Jumlah Teknisi :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fs-1 fw-semibold mt-2'>
                        {vendorDetail?.tukang?.filter((x: any) => x.deleted_at === null).length}
                      </p>
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
            </Col>

            <Col xl={9}>
              <Row>
                <Col xxl={4}>
                  <div className='d-flex flex-column'>
                    <div className='mb-5'>
                      <Form.Group controlId='formFile'>
                        <Form.Label>Foto KTP</Form.Label>
                        <Form className='form-input-image'>
                          <Form.Control
                            type='file'
                            accept='image/*'
                            className='input-field-image'
                            hidden
                          />

                          {imageKTP?.fileName ? (
                            <img
                              src={`${apiUrl}/public/vendors/${imageKTP.fileName}`}
                              alt={imageKTP.fileName}
                              className='image-preview'
                            />
                          ) : (
                            <></>
                          )}
                        </Form>
                      </Form.Group>
                    </div>

                    <div className='mb-5'>
                      <Form.Group controlId='formFile'>
                        <Form.Label>Foto NPWP</Form.Label>
                        <Form className='form-input-image'>
                          <Form.Control
                            type='file'
                            accept='image/*'
                            className='input-field-image'
                            hidden
                          />

                          {imageNPWP?.fileName ? (
                            <img
                              src={`${apiUrl}/public/vendors/${imageNPWP.fileName}`}
                              alt={imageNPWP.fileName}
                              className='image-preview'
                            />
                          ) : (
                            <></>
                          )}
                        </Form>
                      </Form.Group>
                    </div>
                  </div>
                </Col>

                <Col xxl={4}>
                  <Form.Group controlId='formFile'>
                    <Form.Label>Foto Company Profile</Form.Label>
                    {imageCompro.fileName ? (
                      <Form className='form-input-image'>
                        <Form.Control
                          type='file'
                          accept='image/*'
                          className='input-field-image'
                          hidden
                        />

                        <img
                          src={`${apiUrl}/public/vendors/${imageCompro.fileName}`}
                          alt={imageCompro.fileName}
                          className='image-preview'
                        />
                      </Form>
                    ) : (
                      <p className='fw-semibold text-danger'>File belum tersedia</p>
                    )}
                  </Form.Group>
                </Col>

                <Col xxl={4}>
                  <Form.Group controlId='formFile'>
                    <Form.Label>Foto Surat Permohonan</Form.Label>
                    {imageSuratPermohonan.fileName ? (
                      <Form className='form-input-image'>
                        <Form.Control
                          type='file'
                          accept='image/*'
                          className='input-field-image'
                          hidden
                        />

                        <img
                          src={`${apiUrl}/public/vendors/${imageSuratPermohonan.fileName}`}
                          alt={imageSuratPermohonan.fileName}
                          className='image-preview'
                        />
                      </Form>
                    ) : (
                      <p className='fw-semibold text-danger'>File belum tersedia</p>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <hr />

              <Row>
                <div className='bank-information'>
                  <h1 className='fs-3 text-decoration-underline fw-bold mb-2'>INFORMASI BANK</h1>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='2' className='fw-semibold'>
                      NAMA BANK :
                    </Form.Label>
                    <Col sm='10'>
                      <Form.Label className='fw-normal mt-3'>
                        {vendorDetail?.bank?.bank_name}
                      </Form.Label>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='2' className='fw-semibold'>
                      NOMOR REKENING :
                    </Form.Label>
                    <Col sm='10'>
                      <Form.Label className='fw-normal mt-3'>
                        {vendorDetail?.account_number}
                      </Form.Label>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='2' className='fw-semibold'>
                      PEMILIK REKENING :
                    </Form.Label>
                    <Col sm='10'>
                      <Form.Label className='fw-normal mt-3'>
                        {vendorDetail?.account_name}
                      </Form.Label>
                    </Col>
                  </Form.Group>
                </div>
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      {/* Card 2: Riwayat SP & Log Pelanggaran */}
      <div className='card mb-5'>
        <div className='card-header border-0 pt-6 pb-2'>
          <h3 className='card-title align-items-start flex-column'>
            <span className='card-label fw-bolder fs-3 mb-1 text-gray-900'>
              Riwayat Surat Peringatan & Log Pelanggaran
            </span>
            <span className='text-muted mt-1 fw-semibold fs-7'>
              Evaluasi kinerja operasional, log kasus pelanggaran, dan daftar teknisi vendor
            </span>
          </h3>
        </div>
        <div className='card-body pt-3'>
          <Tab.Container defaultActiveKey='violation-logs'>
            <Nav variant='tabs' className='nav-line-tabs mb-6 fs-6'>
              <Nav.Item>
                <Nav.Link eventKey='violation-logs' className='py-3'>
                  <FontAwesomeIcon icon={faExclamationTriangle} className='me-2 text-warning' />
                  Log Pelanggaran ({violationLogs.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey='sp-history' className='py-3'>
                  <FontAwesomeIcon icon={faUserShield} className='me-2 text-primary' />
                  Riwayat SP ({spHistory.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey='tukang-list' className='py-3'>
                  <FontAwesomeIcon icon={faUser} className='me-2 text-info' />
                  Daftar Tukang ({tukangList.filter((t: any) => !t.deleted_at).length})
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* SP History Tab */}
              <Tab.Pane eventKey='sp-history'>
                {spHistoryLoading ? (
                  <div className='text-center py-5'>
                    <div className='spinner-border text-primary' role='status' />
                  </div>
                ) : spHistory.length === 0 ? (
                  <div className='alert alert-light-success d-flex align-items-center p-5 mb-0'>
                    <FontAwesomeIcon icon={faUserShield} className='fs-2hx text-success me-4' />
                    <div className='d-flex flex-column'>
                      <h5 className='mb-1 text-success'>Status Vendor Bersih</h5>
                      <span>Vendor ini tidak memiliki catatan atau riwayat Surat Peringatan.</span>
                    </div>
                  </div>
                ) : (
                  <div className='card border border-gray-200 shadow-none rounded-3 mb-6'>
                    <div className='card-header border-0 pt-4 pb-2 px-5 d-flex align-items-center justify-content-between'>
                      <div>
                        <h6 className='card-title fw-bolder text-gray-800 m-0 fs-6'>
                          Daftar Surat Peringatan (SP)
                        </h6>
                        <span className='text-muted fs-7'>
                          Riwayat penerbitan SP, masa berlaku, dan sanksi pemotongan alokasi
                        </span>
                      </div>
                      <span className='badge badge-light-secondary text-gray-700 fw-bold fs-7'>
                        {spHistory.length} Riwayat
                      </span>
                    </div>
                    <div className='card-body p-0'>
                      <div className='table-responsive'>
                        <table className='table table-hover table-row-dashed table-row-gray-200 align-middle gs-5 gy-3 mb-0 fs-7'>
                          <thead className='bg-light text-gray-700 fw-bold fs-8 text-uppercase'>
                            <tr>
                              <th className='min-w-100px'>Tingkat SP</th>
                              <th className='min-w-140px'>Tanggal Mulai</th>
                              <th className='min-w-140px'>Tanggal Berakhir</th>
                              <th className='min-w-100px text-center'>Total Poin</th>
                              <th className='min-w-120px text-center'>Status</th>
                              <th className='min-w-140px text-center'>Pengurangan Alokasi</th>
                            </tr>
                          </thead>
                          <tbody className='text-gray-600'>
                            {spHistory.map((sp: any) => (
                              <tr key={sp.id}>
                                <td>
                                  <span
                                    className={`badge ${
                                      sp.sp_level === 1
                                        ? 'badge-warning text-dark'
                                        : sp.sp_level === 2
                                        ? 'badge-danger text-white'
                                        : 'badge-dark text-white'
                                    } fw-bolder fs-8 px-2 py-1`}
                                  >
                                    SP {sp.sp_level}
                                  </span>
                                </td>
                                <td className='text-gray-700 fw-normal'>{formatDate(new Date(sp.start_date))}</td>
                                <td className='text-gray-700 fw-normal'>{formatDate(new Date(sp.end_date))}</td>
                                <td className='text-center'>
                                  <span className='badge badge-light-danger fw-bolder fs-7 px-2 py-1'>
                                    {sp.total_point} Poin
                                  </span>
                                </td>
                                <td className='text-center'>
                                  <span
                                    className={`badge ${
                                      sp.status === 1
                                        ? 'badge-light-success text-success'
                                        : sp.status === 2
                                        ? 'badge-light-secondary text-secondary'
                                        : 'badge-light-info text-info'
                                    } fw-bold fs-8 px-2 py-1`}
                                  >
                                    {sp.status === 1
                                      ? 'AKTIF'
                                      : sp.status === 2
                                      ? 'SELESAI'
                                      : 'DIPERPANJANG'}
                                  </span>
                                </td>
                                <td className='text-center text-gray-700 fw-semibold'>
                                  {sp.allocation_reduction
                                    ? `${sp.allocation_reduction}%`
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </Tab.Pane>

              {/* Violation Logs Tab */}
              <Tab.Pane eventKey='violation-logs'>
                {violationLogsLoading || quarterPointsLoading ? (
                  <div className='text-center py-5'>
                    <div className='spinner-border text-primary' role='status' />
                  </div>
                ) : violationLogs.length === 0 ? (
                  <div className='alert alert-light-success d-flex align-items-center p-5 mb-0'>
                    <FontAwesomeIcon icon={faExclamationTriangle} className='fs-2hx text-success me-4' />
                    <div className='d-flex flex-column'>
                      <h5 className='mb-1 text-success'>Tidak Ada Pelanggaran</h5>
                      <span>Vendor tidak memiliki log pelanggaran operasional.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Action buttons */}
                    {canSubmitRevision && (
                      <div className='d-flex flex-wrap gap-2 mb-4'>
                        <button
                          type='button'
                          className='btn btn-sm btn-light-primary fw-semibold'
                          onClick={() => openRevisionModal('REVISE')}
                        >
                          Ajukan Revisi Poin
                        </button>
                        <button
                          type='button'
                          className='btn btn-sm btn-light-danger fw-semibold'
                          onClick={() => openRevisionModal('RESET')}
                        >
                          Reset Poin Quarter
                        </button>
                      </div>
                    )}

                    {quarterPoints?.has_ever_sp && (
                      <Alert variant='warning' className='d-flex align-items-center py-3 mb-4'>
                        <FontAwesomeIcon icon={faUserShield} className='me-2 fs-5 text-warning' />
                        <div>
                          Vendor pernah mencapai Surat Peringatan (SP). Histori SP tetap dipertahankan meskipun poin evaluasi telah direvisi atau di-reset.
                        </div>
                      </Alert>
                    )}

                    {/* Summary Metric Header */}
                    <div className='d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-4 mb-5 rounded bg-light-primary border border-primary border-dashed gap-3'>
                      <div className='d-flex align-items-center gap-4'>
                        <div
                          className={`d-flex align-items-center justify-content-center rounded-circle ${
                            (quarterPoints?.total_points || 0) > 25
                              ? 'bg-danger text-white'
                              : (quarterPoints?.total_points || 0) > 0
                              ? 'bg-warning text-white'
                              : 'bg-success text-white'
                          }`}
                          style={{ width: '48px', height: '48px', minWidth: '48px' }}
                        >
                          <FontAwesomeIcon icon={faExclamationTriangle} size='lg' />
                        </div>
                        <div>
                          <p className='mb-0 text-muted fw-semibold fs-8 text-uppercase tracking-wider'>
                            TOTAL POIN PELANGGARAN (QUARTER INI)
                          </p>
                          <div className='d-flex align-items-baseline gap-2'>
                            <span
                              className={`fs-2hx fw-bolder ${
                                (quarterPoints?.total_points || 0) > 25
                                  ? 'text-danger'
                                  : (quarterPoints?.total_points || 0) > 0
                                  ? 'text-warning'
                                  : 'text-success'
                              }`}
                            >
                              {quarterPoints?.total_points || 0}
                            </span>
                            <span className='text-gray-600 fw-semibold fs-7'>Poin</span>
                          </div>
                        </div>
                      </div>
                      <div className='text-sm-end'>
                        <p className='mb-1 text-muted fw-semibold fs-7'>
                          Periode Evaluasi: Q{quarterPoints?.quarter || '-'} {quarterPoints?.year || '-'}
                        </p>
                        <span
                          className={`badge ${
                            (quarterPoints?.violation_count || 0) > 0
                              ? 'badge-light-danger'
                              : 'badge-light-success'
                          } fw-bold fs-7`}
                        >
                          {quarterPoints?.violation_count || 0} Kasus Pelanggaran
                        </span>
                      </div>
                    </div>

                    {/* Metronic Card & Styled Table matching Order History */}
                    <div className='card border border-gray-200 shadow-none rounded-3 mb-6'>
                      <div className='card-header border-0 pt-4 pb-2 px-5 d-flex align-items-center justify-content-between'>
                        <div>
                          <h6 className='card-title fw-bolder text-gray-800 m-0 fs-6'>
                            Rincian Log Pelanggaran
                          </h6>
                          <span className='text-muted fs-7'>
                            Daftar seluruh pelanggaran operasional dan alokasi Order ID terkait
                          </span>
                        </div>
                        <span className='badge badge-light-secondary text-gray-700 fw-bold fs-7'>
                          {violationLogs.length} Data
                        </span>
                      </div>
                      <div className='card-body p-0'>
                        <div className='table-responsive'>
                          <table className='table table-hover table-row-dashed table-row-gray-200 align-middle gs-5 gy-3 mb-0 fs-7'>
                            <thead className='bg-light text-gray-700 fw-bold fs-8 text-uppercase'>
                              <tr>
                                <th className='min-w-110px text-center'>Order ID</th>
                                <th className='min-w-110px'>Tanggal</th>
                                <th className='min-w-200px'>Jenis Pelanggaran</th>
                                <th className='min-w-130px'>Kategori</th>
                                <th className='min-w-90px text-center'>Poin</th>
                                <th className='min-w-220px'>Keterangan</th>
                              </tr>
                            </thead>
                            <tbody className='text-gray-600'>
                              {violationLogs.map((log: any) => {
                                const orderTargetId = log.order_id ?? log.orders?.id
                                const projectNum = log.orders?.project_number
                                const displayOrderId = orderTargetId
                                  ? String(orderTargetId)
                                  : projectNum
                                  ? String(projectNum)
                                  : null
                                return (
                                  <tr key={log.id}>
                                    <td className='text-center'>
                                      {orderTargetId && displayOrderId ? (
                                        <Link
                                          to={getOrderTargetRoute(orderTargetId)}
                                          className='btn btn-sm btn-light-primary py-1 px-3 fw-bold fs-7'
                                          title={
                                            projectNum
                                              ? `Nomor Project: ${projectNum}`
                                              : `Detail Order ${displayOrderId}`
                                          }
                                        >
                                          <span>{displayOrderId}</span>
                                        </Link>
                                      ) : (
                                        <span className='text-muted fs-7'>-</span>
                                      )}
                                    </td>
                                    <td className='text-gray-700 fw-normal text-nowrap'>
                                      {formatDate(new Date(log.created_at))}
                                    </td>
                                    <td>
                                      <span className='text-gray-900 fw-semibold'>
                                        {log.violation_type?.name || '-'}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`badge ${
                                          log.violation_type?.category === 'SLA'
                                            ? 'badge-light-primary text-primary'
                                            : log.violation_type?.category === 'KUALITAS'
                                            ? 'badge-light-info text-info'
                                            : log.violation_type?.category === 'KONFIRMASI_ORDER'
                                            ? 'badge-light-primary text-primary'
                                            : log.violation_type?.category === 'RESCHEDULE'
                                            ? 'badge-light-warning text-warning'
                                            : log.violation_type?.category === 'REFUND'
                                            ? 'badge-light-danger text-danger'
                                            : 'badge-light-secondary text-secondary'
                                        } fw-bold fs-8 px-2 py-1`}
                                      >
                                        {log.violation_type?.category || '-'}
                                      </span>
                                    </td>
                                    <td className='text-center'>
                                      <span className='badge badge-light-danger fw-bolder fs-7 px-2 py-1'>
                                        +{log.adjusted_point ?? log.violation_type?.point ?? 0}
                                      </span>
                                    </td>
                                    <td className='text-gray-700 fw-normal'>
                                      {log.description || '-'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Revision Requests */}
                {revisionRequests.length > 0 && (
                  <div className='mt-6 pt-4 border-top'>
                    <h6 className='fw-bolder text-gray-800 mb-3'>Riwayat Request Revisi / Reset Poin</h6>
                    <div className='table-responsive'>
                      <table className='table table-sm table-hover table-rounded table-striped border gy-3 gs-4 align-middle'>
                        <thead className='bg-light text-gray-700 fw-bold fs-7 text-uppercase'>
                          <tr>
                            <th>Tanggal</th>
                            <th>Tipe</th>
                            <th>Status</th>
                            <th>Alasan</th>
                            <th>Catatan Review</th>
                          </tr>
                        </thead>
                        <tbody className='fs-7'>
                          {revisionRequests.map((request: any) => (
                            <tr key={request.id}>
                              <td className='text-gray-600 text-nowrap'>
                                {formatDate(new Date(request.created_at))}
                              </td>
                              <td>
                                <span className='badge badge-light-primary fw-bold'>
                                  {request.type}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    request.status === 'APPROVED'
                                      ? 'badge-light-success'
                                      : request.status === 'REJECTED'
                                      ? 'badge-light-danger'
                                      : 'badge-light-warning'
                                  } fw-bold`}
                                >
                                  {request.status}
                                </span>
                              </td>
                              <td className='text-gray-800'>{request.reason}</td>
                              <td className='text-gray-600'>{request.review_note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Tab.Pane>

                  {/* Tukang List Tab */}
                  <Tab.Pane eventKey='tukang-list'>
                    {tukangLoading ? (
                      <div className='text-center py-4'>
                        <div className='spinner-border text-primary' role='status' />
                      </div>
                    ) : tukangList.filter((t: any) => !t.deleted_at).length === 0 ? (
                      <div className='alert alert-secondary mb-0'>
                        <FontAwesomeIcon icon={faUser} className='me-2' />
                        Vendor tidak memiliki tukang.
                      </div>
                    ) : (
                      <Row className='g-3'>
                        {tukangList
                          .filter((t: any) => !t.deleted_at)
                          .map((tukang: any) => (
                            <Col key={tukang.id} md={6} lg={4}>
                              <div
                                className='card h-100'
                                style={{
                                  borderRadius: '12px',
                                  border: '1px solid #e9ecef',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    background: 'linear-gradient(135deg, #183383 0%, #1a42b8 100%)',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      background: 'rgba(255,255,255,0.2)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#fff',
                                      fontSize: '14px',
                                      fontWeight: '700',
                                    }}
                                  >
                                    {tukang.full_name?.charAt(0) || 'T'}
                                  </div>
                                  <div>
                                    <p className='mb-0 text-white fw-semibold' style={{fontSize: '13px'}}>
                                      {tukang.full_name || '-'}
                                    </p>
                                    <p className='mb-0 text-white-50' style={{fontSize: '11px'}}>
                                      {tukang.ktp_number || 'No. KTP belum ada'}
                                    </p>
                                  </div>
                                </div>
                                <div className='card-body p-3'>
                                  <Row className='g-2'>
                                    <Col xs={6}>
                                      <small className='text-muted d-block'>No. HP</small>
                                      <span className='fw-semibold' style={{fontSize: '12px'}}>
                                        {tukang.phone_number || '-'}
                                      </span>
                                    </Col>
                                    <Col xs={6}>
                                      <small className='text-muted d-block'>Email</small>
                                      <span className='fw-semibold' style={{fontSize: '12px'}}>
                                        {tukang.email || '-'}
                                      </span>
                                    </Col>
                                    <Col xs={12}>
                                      <small className='text-muted d-block'>Keahlian / Service Type</small>
                                      <div className='d-flex flex-wrap gap-1 mt-1'>
                                        {(tukang.tukang_service || []).map(
                                          (ts: any, idx: number) => (
                                            <span
                                              key={idx}
                                              style={{
                                                background: 'rgba(24, 51, 131, 0.08)',
                                                color: '#183383',
                                                borderRadius: '20px',
                                                padding: '2px 8px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                              }}
                                            >
                                              {ts.service_type?.service_type || `Service #${ts.service_type_id}`}
                                            </span>
                                          )
                                        )}
                                        {(!tukang.tukang_service || tukang.tukang_service.length === 0) && (
                                          <span className='text-muted' style={{fontSize: '11px'}}>
                                            Belum ada keahlian
                                          </span>
                                        )}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            </Col>
                          ))}
                      </Row>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </div>

      <Modal show={revisionModal} onHide={() => setRevisionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{revisionType === 'RESET' ? 'Reset Poin Quarter' : 'Ajukan Revisi Poin'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className='mb-3'>
            <Form.Label>Tipe</Form.Label>
            <Form.Select
              value={revisionType}
              onChange={(event) => setRevisionType(event.target.value as 'REVISE' | 'RESET')}
            >
              <option value='REVISE'>REVISE</option>
              <option value='RESET'>RESET</option>
            </Form.Select>
          </Form.Group>

          {revisionType === 'REVISE' && (
            <>
              <Form.Group className='mb-3'>
                <Form.Label>Log Pelanggaran</Form.Label>
                <Form.Select
                  value={revisionTargetLogId}
                  onChange={(event) => setRevisionTargetLogId(Number(event.target.value))}
                >
                  <option value=''>Pilih log</option>
                  {violationLogs.map((log: any) => (
                    <option key={log.id} value={log.id}>
                      #{log.id} - {log.violation_type?.name || log.violation_type?.code}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Poin Baru</Form.Label>
                <Form.Select
                  value={revisionNewPoint}
                  onChange={(event) => setRevisionNewPoint(Number(event.target.value))}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          <Form.Group>
            <Form.Label>Alasan</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={revisionReason}
              onChange={(event) => setRevisionReason(event.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='light' onClick={() => setRevisionModal(false)}>
            Batal
          </Button>
          <Button variant='primary' disabled={revisionSubmitting} onClick={submitRevisionRequest}>
            Ajukan
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export {DetailVendorHO}
