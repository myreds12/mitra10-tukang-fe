/* eslint-disable jsx-a11y/iframe-has-title */
import React, {FC, useState, useEffect, useRef} from 'react'

import './DetailWorkOrder.css'

import {useParams} from 'react-router-dom'
import {Card, Row} from 'react-bootstrap'
import Swal from 'sweetalert2'

import {
  formatDate,
  formatDateWithTime,
  formatDateWithTimeZone,
} from '../../../../../_metronic/helpers'

import {Status, OrderHistory, DetailWorkVendorProps} from './types'
import {
  fetchOrderDetailApi,
  replaceWorkOrderFotoApi,
  deleteWorkOrderFotoApi,
  addFotoBeforeApi,
  addFotoAfterApi,
} from './services/detailWorkOrderService'

import {DetailWorkOrderHeader} from './components/DetailWorkOrderHeader'
import {DetailWorkOrderBuyerInfo} from './components/DetailWorkOrderBuyerInfo'
import {DetailWorkOrderScheduleInfo} from './components/DetailWorkOrderScheduleInfo'
import {DetailWorkOrderInstallationTable} from './components/DetailWorkOrderInstallationTable'
import {DetailWorkOrderNotes} from './components/DetailWorkOrderNotes'
import {DetailWorkOrderEvidences} from './components/DetailWorkOrderEvidences'
import {DetailWorkOrderComplaintTimeline} from './components/DetailWorkOrderComplaintTimeline'
import {DetailWorkOrderRescheduleCard} from './components/DetailWorkOrderRescheduleCard'
import {DetailWorkOrderHistoryCard} from './components/DetailWorkOrderHistoryCard'

const DetailWorkVendor: FC<DetailWorkVendorProps> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const params = useParams()
  const userRole = localStorage.getItem('userRole')
  const [orderDetail, setOrderDetail] = useState<any>()
  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const [visibleReschedule, setVisibleReschedule] = useState(false)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [editingItemId, setEditingItemId] = useState<any>()
  const handleClose = () => setVisible(false)

  // Order History
  const [OrderHistory, setOrderHistory] = useState<OrderHistory[]>([])

  const fetchOrderData = async () => {
    try {
      const response = await fetchOrderDetailApi(apiUrl, params.id)
      const data = response.data.data

      setOrderDetail(data)
      updatePageTitle(data)
      setIsLoadingPage(false)

      if (data?.order_history) {
        const orderHistory = data.order_history.map((item: any) => ({
          status: item?.status?.description,
          created_at: item?.created_at ? formatDateWithTimeZone(item?.created_at) : '-',
          updated_by: item?.created_by?.username,
        }))

        setOrderHistory(orderHistory)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchOrderData()
    // eslint-disable-next-line
  }, [])

  // Statuses for Complaint Timeline
  const storedStatus = localStorage.getItem('statusData')
  const statusData: Array<Status> = storedStatus ? JSON.parse(storedStatus) : []

  const getStatuses = (categories: string[]) =>
    statusData.filter((status: any) => categories.includes(status.category)).map((x) => x.value)

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, item: any) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0]
      const formData = new FormData()
      formData.append(`work_order_evidences`, newFile)

      const res = await replaceWorkOrderFotoApi(apiUrl, item.id, formData)

      if (res.data.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Work Order Evidence Updated',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        })
        fetchOrderData()
      }
      setEditingItemId(null)
    }
  }

  const deleteFoto = async (item: any) => {
    const res = await deleteWorkOrderFotoApi(apiUrl, item.id)

    if (res.data.status === 200) {
      Swal.fire({
        title: 'Success',
        text: 'Work Order Evidence Deleted',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      })
      fetchOrderData()
    }
  }

  const fileInputRef = useRef<any>(null)
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange2 = async (e: any) => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append(`work_order_before`, file)

    const res = await addFotoBeforeApi(apiUrl, orderDetail?.work_orders?.id, formData)

    if (res.data.status === 201) {
      Swal.fire({
        title: 'Success',
        text: 'Work Order Evidence Updated',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      })
      fetchOrderData()
    }
  }

  const fileInputAfterRef = useRef<any>(null)
  const handleButtonAfterClick = () => {
    fileInputAfterRef.current?.click()
  }

  const handleFileAfterChange2 = async (e: any) => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append(`work_order_after`, file)

    const res = await addFotoAfterApi(apiUrl, orderDetail?.work_orders?.id, formData)

    if (res.data.status === 201) {
      Swal.fire({
        title: 'Success',
        text: 'Work Order Evidence Updated',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      })
      fetchOrderData()
    }
  }

  return (
    <section id='detail-work-order'>
      <Card className='mb-5'>
        <Card.Body>
          <DetailWorkOrderHeader
            orderDetail={orderDetail}
            isLoadingPage={isLoadingPage}
          />

          <Row className='information-detail'>
            <DetailWorkOrderBuyerInfo
              orderDetail={orderDetail}
              isLoadingPage={isLoadingPage}
            />

            <DetailWorkOrderScheduleInfo
              orderDetail={orderDetail}
              isLoadingPage={isLoadingPage}
              formatDateWithTime={formatDateWithTime}
            />
          </Row>

          <DetailWorkOrderInstallationTable
            orderDetail={orderDetail}
            isLoadingPage={isLoadingPage}
            formatDate={formatDate}
          />

          <DetailWorkOrderNotes orderDetail={orderDetail} />

          <DetailWorkOrderEvidences
            orderDetail={orderDetail}
            isLoadingPage={isLoadingPage}
            userRole={userRole}
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
            visible={visible}
            setVisible={setVisible}
            editingItemId={editingItemId}
            setEditingItemId={setEditingItemId}
            apiUrl={apiUrl}
            handleButtonClick={handleButtonClick}
            fileInputRef={fileInputRef}
            handleFileChange2={handleFileChange2}
            handleButtonAfterClick={handleButtonAfterClick}
            fileInputAfterRef={fileInputAfterRef}
            handleFileAfterChange2={handleFileAfterChange2}
            handleFileChange={handleFileChange}
            deleteFoto={deleteFoto}
          />

          <DetailWorkOrderComplaintTimeline
            orderDetail={orderDetail}
            isLoadingPage={isLoadingPage}
            complaintHistory={complaintHistory}
          />
        </Card.Body>
      </Card>

      <DetailWorkOrderRescheduleCard
        orderDetail={orderDetail}
        isLoadingPage={isLoadingPage}
        formatDateWithTime={formatDateWithTime}
        formatDateWithTimeZone={formatDateWithTimeZone}
        apiUrl={apiUrl}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        visible={visible}
        handleClose={handleClose}
        visibleReschedule={visibleReschedule}
        setVisibleReschedule={setVisibleReschedule}
      />

      <DetailWorkOrderHistoryCard
        OrderHistory={OrderHistory}
        isLoadingPage={isLoadingPage}
      />
    </section>
  )
}

export {DetailWorkVendor}
export default DetailWorkVendor
