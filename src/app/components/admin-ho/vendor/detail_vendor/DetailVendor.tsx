import React, {FC, useState, useEffect} from 'react'
import axiosInstance from '../../../../../_metronic/layout/core/axiosInterceptor'
import {Vendor} from '../../../../interfaces/vendor'
import {vendorSpService} from '../../../../services/vendorSpService'
import {vendorViolationService} from '../../../../services/vendorViolationService'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faExclamationTriangle,
  faUser,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons'
import './DetailVendor.css'
import {useParams} from 'react-router-dom'
import {Row, Col, Nav, Tab} from 'react-bootstrap'
import Swal from 'sweetalert2'
import {VendorProfileSection} from './components/VendorProfileSection'
import {VendorDocumentsSection} from './components/VendorDocumentsSection'
import {VendorBankInfoSection} from './components/VendorBankInfoSection'
import {VendorSpHistoryTab} from './components/VendorSpHistoryTab'
import {VendorViolationLogsTab} from './components/VendorViolationLogsTab'
import {VendorTukangListTab} from './components/VendorTukangListTab'
import {VendorRevisionModal} from './components/VendorRevisionModal'

const DetailVendorHO: FC<{updatePageTitle: (vendor: Vendor) => void}> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()

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
  const userRole = localStorage.getItem('userRole')
  const canSubmitRevision = userRole === 'Admin HO' || userRole === 'Super User'
  const isVendorSpEnabled = process.env.REACT_APP_ENABLE_VENDOR_SP === 'true'

  // Vendor Evidence
  const [imageKTP, setimageKTP] = useState<{blob: string; fileName: string}>({
    blob: '',
    fileName: '',
  })
  const [imageNPWP, setimageNPWP] = useState<{blob: string; fileName: string}>({
    blob: '',
    fileName: '',
  })
  const [imageCompro, setimageCompro] = useState<{blob: string; fileName: string}>({
    blob: '',
    fileName: '',
  })
  const [imageSuratPermohonan, setimageSuratPermohonan] = useState<{blob: string; fileName: string}>({
    blob: '',
    fileName: '',
  })

  // Fetch API
  const fetchVendorData = async () => {
    try {
      const response = await axiosInstance.get(`${apiUrl}/vendor/${params.id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
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
    } catch (error) {
      console.error(error)
    }
  }

  // Fetch SP Status
  const fetchSpStatus = async (vendorId: number) => {
    try {
      const response = await axiosInstance.get(`${apiUrl}/vendor-sp/check/${vendorId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Access-Control-Allow-Origin': '*',
          'ngrok-skip-browser-warning': 'true',
        },
      })
      setSpStatus(response.data)
    } catch (error) {
      console.error('Error fetching SP status:', error)
      setSpStatus({has_active_sp: false})
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
      const response = await vendorViolationService.getLogsByVendor(vendorId, {take: 50})
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
      if (isVendorSpEnabled) {
        fetchSpStatus(vendorDetail.id)
        fetchSpHistory(vendorDetail.id)
        fetchViolationLogs(vendorDetail.id)
        fetchQuarterPoints(vendorDetail.id)
        fetchRevisionRequests(vendorDetail.id)
      }
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

  return (
    <section id='detail-vendor'>
      <div className='card mb-5'>
        <div className='card-body'>
          <Row>
            <VendorProfileSection
              vendorDetail={vendorDetail}
              isVendorSpEnabled={isVendorSpEnabled}
              spStatus={spStatus}
              formatDate={formatDate}
              getSpLevelText={getSpLevelText}
            />

            <Col xl={9}>
              <VendorDocumentsSection
                imageKTP={imageKTP}
                imageNPWP={imageNPWP}
                imageCompro={imageCompro}
                imageSuratPermohonan={imageSuratPermohonan}
                apiUrl={apiUrl}
              />

              <hr />

              <VendorBankInfoSection vendorDetail={vendorDetail} />

              <hr />
              <h5 className='fw-bold mb-3'>RIWAYAT & DETAIL</h5>
              <Tab.Container defaultActiveKey={isVendorSpEnabled ? 'sp-history' : 'tukang-list'}>
                <Nav variant='tabs' className='mb-3'>
                  {isVendorSpEnabled && (
                    <>
                      <Nav.Item>
                        <Nav.Link eventKey='sp-history'>
                          <FontAwesomeIcon icon={faUserShield} className='me-2' />
                          Riwayat SP ({spHistory.length})
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey='violation-logs'>
                          <FontAwesomeIcon icon={faExclamationTriangle} className='me-2' />
                          Log Pelanggaran ({violationLogs.length})
                        </Nav.Link>
                      </Nav.Item>
                    </>
                  )}
                  <Nav.Item>
                    <Nav.Link eventKey='tukang-list'>
                      <FontAwesomeIcon icon={faUser} className='me-2' />
                      Daftar Tukang ({tukangList.filter((t: any) => !t.deleted_at).length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {isVendorSpEnabled && (
                    <>
                      <Tab.Pane eventKey='sp-history'>
                        <VendorSpHistoryTab
                          spHistoryLoading={spHistoryLoading}
                          spHistory={spHistory}
                          formatDate={formatDate}
                        />
                      </Tab.Pane>

                      <Tab.Pane eventKey='violation-logs'>
                        <VendorViolationLogsTab
                          violationLogsLoading={violationLogsLoading}
                          quarterPointsLoading={quarterPointsLoading}
                          violationLogs={violationLogs}
                          quarterPoints={quarterPoints}
                          canSubmitRevision={canSubmitRevision}
                          openRevisionModal={openRevisionModal}
                          formatDate={formatDate}
                          revisionRequests={revisionRequests}
                        />
                      </Tab.Pane>
                    </>
                  )}

                  <Tab.Pane eventKey='tukang-list'>
                    <VendorTukangListTab
                      tukangLoading={tukangLoading}
                      tukangList={tukangList}
                    />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Col>
          </Row>
        </div>
      </div>

      <VendorRevisionModal
        revisionModal={revisionModal}
        setRevisionModal={setRevisionModal}
        revisionType={revisionType}
        setRevisionType={setRevisionType}
        revisionTargetLogId={revisionTargetLogId}
        setRevisionTargetLogId={setRevisionTargetLogId}
        violationLogs={violationLogs}
        revisionNewPoint={revisionNewPoint}
        setRevisionNewPoint={setRevisionNewPoint}
        revisionReason={revisionReason}
        setRevisionReason={setRevisionReason}
        revisionSubmitting={revisionSubmitting}
        submitRevisionRequest={submitRevisionRequest}
      />
    </section>
  )
}

export {DetailVendorHO}
