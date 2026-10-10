import React from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

export const calculatePaymentStages = (grandTotal: number) => {
  const stage1 = grandTotal * 0.25
  const stage2 = grandTotal * 0.5
  const stage3 = grandTotal * 0.25

  return [
    {stage: 'Tahap 1', percentage: '25%', amount: stage1},
    {stage: 'Tahap 2', percentage: '50%', amount: stage2},
    {stage: 'Tahap 3', percentage: '25%', amount: stage3},
  ]
}

export const vendorAvailbility = (data: any, requestSurvey?: string) => {
  const maxOrder = data?.max_order ?? 0

  const orderVendor = (data?.orders || []).filter((x: any) => {
    const surveyDate = new Date(x.request_survey).toISOString().split('T')[0]
    return surveyDate === requestSurvey
  })

  const workOrderVendor = (data?.work_orders || []).filter((x: any) => {
    const surveyDate = new Date(x.survey_date).toISOString().split('T')[0]

    const workStartDate = x.work_start_date
      ? new Date(x.work_start_date).toISOString().split('T')[0]
      : null

    const workEndDate = x.work_end_date
      ? new Date(x.work_end_date).toISOString().split('T')[0]
      : null

    if (surveyDate && !workStartDate && !workEndDate) {
      return surveyDate === requestSurvey
    } else if (surveyDate && workStartDate && workEndDate) {
      return workStartDate <= (requestSurvey || '') && (requestSurvey || '') <= workEndDate
    } else if (!surveyDate && workStartDate && workEndDate) {
      return workStartDate <= (requestSurvey || '') && (requestSurvey || '') <= workEndDate
    } else {
      return surveyDate === requestSurvey
    }
  })

  const tukangActive = (data?.tukang || []).filter((x: any) => {
    const isActive = x.is_active === true && x.deleted_at === null
    return isActive
  }).length

  const tukangActiveAvailability = (data?.tukang || []).filter((x: any) => {
    const isAvailable =
      x.is_active === true &&
      x.deleted_at === null &&
      maxOrder > x.slot_order &&
      x.slot_order < orderVendor.length
    return isAvailable
  }).length

  if (tukangActive === 0 && orderVendor.length >= 0) {
    return <p className='text-danger'>UNAVAILABLE</p>
  } else if (tukangActiveAvailability === 0 && orderVendor.length > 0) {
    return <p className='text-danger'>FULL BOOKED</p>
  } else {
    return <p className='text-black'>AVAILABLE</p>
  }
}

export const exportToPDF = (
  order_id: number,
  receipt_quotation: string,
  customer_name: string,
  apiUrl: string = process.env.REACT_APP_API_URL || ''
) => {
  axios
    .get(`${apiUrl}/orders/quotation-pdf/${order_id}`, {
      method: 'GET',
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `Quotation ${
          receipt_quotation === 'UNPAID' ? 'Belum Dibayar' : 'Sudah Dibayar'
        } - ${customer_name} - Order ID ${order_id}.pdf`
      )
      document.body.appendChild(link)
      link.click()
    })
    .catch((error: any) => {
      Swal.fire('Error', 'Terjadi kesalahan saat mengekspor data', 'error')
    })
}
