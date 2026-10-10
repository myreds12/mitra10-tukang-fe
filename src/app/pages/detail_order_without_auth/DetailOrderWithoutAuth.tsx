import React, {useState, useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {Card} from 'react-bootstrap'
import axios from 'axios'
import Swal from 'sweetalert2'
import './DetailOrderWithoutAuth.css'
import {Orders} from '../../interfaces/order'
import {formatDateWithTime} from '../../../_metronic/helpers'
import {Status, OrderHistory, PaymentStage} from './types'
import {DetailOrderHeaderSection} from './components/DetailOrderHeaderSection'
import {DetailOrderInstallationTable} from './components/DetailOrderInstallationTable'
import {DetailOrderVendorActivities} from './components/DetailOrderVendorActivities'
import {DetailOrderEvidenceSection} from './components/DetailOrderEvidenceSection'
import {DetailOrderTimelineSection} from './components/DetailOrderTimelineSection'
import {DetailOrderUploadReceiptModal} from './components/DetailOrderUploadReceiptModal'

const DetailOrderWithoutAuth = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const orderId = queryParams.get('order_id')

  const phoneNumber = queryParams.get('phone_number')
  const emailMember = queryParams.get('email_member')
  const memberNumber = queryParams.get('member_number')

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [loadingUploadReceipt, setLoadingUploadReceipt] = useState<boolean>(false)

  // Order
  const [order, setOrder] = useState<Orders>({
    id: null,
    member_id: null,
    seles_id: null,
    store_id: null,
    project_status_id: null,
    request_survey: '',
    request_work: '',
    notes: '',
    vendor_id: null,
    tukang_id: null,
    project_address: '',
    project_number: '',
    receipt_number: '',
    receipt_path: '',
    total_estimate_workdays: null,
    payment_type: '',
    grand_total: '',
    grand_total_comission: '',
    is_overdistance: 0,
    additional_fee: 0,
    print_counter: 0,
    created_by: null,
    updated_by: null,
    created_at: '',
    order_details: [],
    m_order_details: [],
    order_files: [],
    complaints: [],
    work_orders: {
      work_order_status: [],
    },
    quotation: [],
    order_history: null,
  })

  // Order History
  const [orderHistorical, setOrderHistorical] = useState<OrderHistory[]>([])
  const [status, setStatus] = useState<Status[]>([])

  // Modal / Preview states
  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const handleClose = () => setVisible(false)

  const [visibleComplaint, setVisibleComplaint] = useState(false)
  const [visibleReschedule, setVisibleReschedule] = useState(false)
  const [visibleWorkBefore, setVisibleWorkBefore] = useState(false)
  const [visibleWorkAfter, setVisibleWorkAfter] = useState(false)
  const [visibleQuotationReceipt, setVisibleQuotationReceipt] = useState(false)
  const [visibleQuotationFiles, setVisibleQuotationFiles] = useState(false)

  // Payment Stage
  const quotationGrandTotal = parseInt(order?.quotation?.[0]?.quotation_grand_total || '0')
  const [paymentStages, setPaymentStages] = useState<PaymentStage[]>([
    {stage: 'Tahap 1', percentage: '25%', amount: 0},
    {stage: 'Tahap 2', percentage: '50%', amount: 0},
    {stage: 'Tahap 3', percentage: '25%', amount: 0},
  ])

  // Upload Multiple Receipt
  const [receiptQuotation, setReceiptQuotation] = useState<Array<File | null>>([])
  const [showModal, setShowModal] = useState(false)

  const trackingOrderData = async (
    orderId: string | null,
    phoneNumbers: string | null,
    emailMembers: string | null,
    memberNumbers: string | null
  ) => {
    const queryPhoneNumber = phoneNumber ? `&phone_number=${phoneNumbers}` : ``
    const queryEmailMember = emailMember ? `&email_member=${emailMembers}` : ``
    const queryMemberNumber = memberNumber ? `&member_number=${memberNumbers}` : ``

    try {
      const response = await axios.get(
        `${apiUrl}/orders/data?order_id=${orderId}${queryPhoneNumber}${queryEmailMember}${queryMemberNumber}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )
      const data = response.data.data
      setOrder(data)
      setIsLoadingPage(false)

      if (data?.order_history) {
        const orderHistory = data?.order_history?.map((item: any) => ({
          order_id: item.order_id,
          order_status: item?.status?.description,
          updated_by: item?.created_at?.username,
          created_at: item?.created_at
            ? `${formatDateWithTime(item?.created_at)} ${
                item.created_by ? `oleh ${item?.created_by?.username}` : ''
              }`
            : '-',
        }))

        setOrderHistorical(orderHistory)
      }
    } catch (error: any) {
      if (error.response?.data?.statusCode === 400 || error.response?.data?.statusCode === 404) {
        navigate('/error/500')
      }
    }
  }

  useEffect(() => {
    if (orderId || phoneNumber || emailMember || memberNumber) {
      trackingOrderData(orderId, phoneNumber, emailMember, memberNumber)
    }
    // eslint-disable-next-line
  }, [orderId, phoneNumber, emailMember, memberNumber])

  // Get Status
  const getStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/status?take=0`, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempStatus = response.data.data.map((item: any) => ({
          value: item.id,
          category: item.category,
        }))

        setStatus(tempStatus)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    getStatus()
    // eslint-disable-next-line
  }, [])

  const getStatuses = (categories: string[]) =>
    status.filter((s: any) => categories.includes(s.category)).map((x) => x.value)

  // Statuses for Order Timeline
  const bookStatuses = getStatuses(['BOOK', 'BOOKED', 'PICKLIST', 'UNPAID', 'PAID'])
  const surveyStatuses = getStatuses([
    'SURVEYREQ',
    'TUKANGSURVEY',
    'SURVEYSTART',
    'SURVEYDONE',
    'QUOTEIN',
    'QUOTEOUT',
  ])
  const workStatuses = getStatuses([
    'WORKREQ',
    'TUKANGWORK',
    'WORKSTART',
    'WORKREQSTEPONE',
    'WORKREQSTEPTWO',
    'WORKREQSTEPTHREE',
    'WORKSTARTSTEPONE',
    'WORKSTARTSTEPTWO',
    'WORKSTARTSTEPTHREE',
    'TUKANGWORKSTEPONE',
    'TUKANGWORKSTEPTWO',
    'TUKANGWORKSTEPTHREE',
  ])
  const workDoneStatuses = getStatuses([
    'WORKEND',
    'DONE',
    'WORKENDSTEPONE',
    'WORKENDSTEPTWO',
    'WORKENDSTEPTHREE',
    'REWORKREQ',
    'REWORKSTART',
    'REWORKEND',
  ])

  const orderHistory = [
    {title: 'Booking Process', value: bookStatuses},
    {title: 'Survey Process', value: surveyStatuses},
    {title: 'Work in Progress', value: workStatuses},
    {title: 'Work Done', value: workDoneStatuses},
  ]

  // Statuses for Complaint Timeline
  const complaintReceivedStatuses = getStatuses(['INVESTIGATED'])
  const investigationProcessStatuses = getStatuses([
    'COMPLAINTAPPROVEDBYHO',
    'COMPLAINTREJECTEDBYHO',
  ])
  const remedialProgressStatuses = getStatuses([
    'RESURVEYREQ',
    'RESURVEYSTART',
    'REWORKREQ',
    'REWORKSTART',
  ])
  const complaintDoneStatuses = getStatuses(['RESURVEYDONE', 'REWORKEND'])
  const complaintHistory = [
    {
      title: 'Diselidiki',
      value: complaintReceivedStatuses,
    },
    {
      title: 'Disetujui atau Ditolak',
      value: investigationProcessStatuses,
    },
    {
      title: 'Survei/Pengerjaan Ulang',
      value: remedialProgressStatuses,
    },
    {
      title: 'Komplain Selesai',
      value: complaintDoneStatuses,
    },
  ]

  const calculatePaymentStages = (grandTotal: number) => {
    const stage1 = grandTotal * 0.25
    const stage2 = grandTotal * 0.5
    const stage3 = grandTotal * 0.25

    setPaymentStages([
      {stage: 'Tahap 1', percentage: '25%', amount: stage1},
      {stage: 'Tahap 2', percentage: '50%', amount: stage2},
      {stage: 'Tahap 3', percentage: '25%', amount: stage3},
    ])
  }

  useEffect(() => {
    calculatePaymentStages(quotationGrandTotal)
  }, [quotationGrandTotal])

  const handleUploadReceipt = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleFileChange = (event: any) => {
    const files = event.fileList.map((file: any) => file.originFileObj)
    setReceiptQuotation(files)
  }

  const handleFileRemove = (file: any) => {
    const updatedFiles = receiptQuotation.filter((item) => item !== file.originFileObj)
    setReceiptQuotation(updatedFiles)
  }

  const handleSubmitReceipt = async () => {
    setLoadingUploadReceipt(true)
    const formData = new FormData()

    if (receiptQuotation?.length) {
      receiptQuotation.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_receipt_customer`, item, item.name)
        }
      })
    }

    try {
      const response = await axios.post(
        `${apiUrl}/orders/receipt-public/${order.id}`,
        formData,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (response.data.status === 201 || response.data.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil Upload Bukti Pembayaran',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.data.message,
          icon: 'error',
        })
      }

      setLoadingUploadReceipt(false)
      window.location.reload()
    } catch (error: any) {
      setLoadingUploadReceipt(false)
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Gagal mengupload bukti pembayaran',
        icon: 'error',
      })
    }
  }

  return (
    <div className='wrapper d-flex flex-column flex-row-fluid' id='page_without_order'>
      <DetailOrderHeaderSection
        order={order}
        isLoadingPage={isLoadingPage}
        loadingUploadReceipt={loadingUploadReceipt}
        handleUploadReceipt={handleUploadReceipt}
      />

      <div
        id='kt_content_without_auth'
        className='content d-flex flex-column flex-column-fluid'
        style={{marginTop: '-5.5rem'}}
      >
        <section id='detail-order-without-auth'>
          <Card>
            <Card.Body>
              <DetailOrderInstallationTable
                order={order}
                isLoadingPage={isLoadingPage}
                paymentStages={paymentStages}
              />

              <DetailOrderVendorActivities
                order={order}
                isLoadingPage={isLoadingPage}
              />

              <DetailOrderEvidenceSection
                order={order}
                apiUrl={apiUrl}
                isLoadingPage={isLoadingPage}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
                visible={visible}
                setVisible={setVisible}
                handleClose={handleClose}
                visibleQuotationReceipt={visibleQuotationReceipt}
                setVisibleQuotationReceipt={setVisibleQuotationReceipt}
                visibleQuotationFiles={visibleQuotationFiles}
                setVisibleQuotationFiles={setVisibleQuotationFiles}
                visibleWorkBefore={visibleWorkBefore}
                setVisibleWorkBefore={setVisibleWorkBefore}
                visibleWorkAfter={visibleWorkAfter}
                setVisibleWorkAfter={setVisibleWorkAfter}
              />

              <DetailOrderTimelineSection
                order={order}
                apiUrl={apiUrl}
                isLoadingPage={isLoadingPage}
                orderHistory={orderHistory}
                complaintHistory={complaintHistory}
                orderHistorical={orderHistorical}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
                visible={visible}
                handleClose={handleClose}
                visibleComplaint={visibleComplaint}
                setVisibleComplaint={setVisibleComplaint}
                visibleReschedule={visibleReschedule}
                setVisibleReschedule={setVisibleReschedule}
              />
            </Card.Body>
          </Card>
        </section>
      </div>

      <DetailOrderUploadReceiptModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleFileChange={handleFileChange}
        handleFileRemove={handleFileRemove}
        handleSubmitReceipt={handleSubmitReceipt}
        loadingUploadReceipt={loadingUploadReceipt}
        receiptQuotation={receiptQuotation}
      />
    </div>
  )
}

export {DetailOrderWithoutAuth}
