import { useState, useEffect } from 'react'
import { NavigateFunction } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Order } from '../types'

interface UseUpdateOrderSubmitParams {
  apiUrl?: string
  apiChat: string
  orderId?: string
  orderForm: Order
  isOverdistance: number
  receiptFiles: any[]
  template: any[]
  orderStatusLabel: string
  userRole: string
  orderDetail: any
  isCanceledOrder: boolean
  setIsCanceledOrder: (val: boolean) => void
  navigate: NavigateFunction
}

export const useUpdateOrderSubmit = ({
  apiUrl,
  apiChat,
  orderId,
  orderForm,
  isOverdistance,
  receiptFiles,
  template,
  orderStatusLabel,
  userRole,
  orderDetail,
  isCanceledOrder,
  setIsCanceledOrder,
  navigate,
}: UseUpdateOrderSubmitParams) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [emailDetail, setEmailDetail] = useState<any>()

  const API_BASE = process.env.REACT_APP_WA_BACKEND_API_URL

  const fetchEmailData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/mails`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        params: {
          order_by: 'asc',
          type_email_message: 1,
        },
      })
      const data = response.data?.data?.data?.[1]
      setEmailDetail(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchEmailData()
  }, [])

  const sentWA = async () => {
    let invoiceMessage = ''
    if (orderDetail?.status?.category === 'BOOKED') {
      const information_detail = emailDetail?.information_detail
        ?.map((item: any) => item.information)
        .join('\n• ')
      invoiceMessage = `
Hi *${orderDetail?.members?.full_name || '-'}*, terima kasih telah menggunakan layanan instalasi Mitra10.

Order Anda saat ini *sedang dijadwalkan untuk Survey Lokasi* oleh tim instalasi kami.

👷 *Tujuan Survey:*
Untuk memastikan kebutuhan material serta kondisi lokasi agar pemasangan berjalan lancar.

📌 *Sebelum Survey Dimulai, Mohon Pastikan:*
• Area dapat diakses dan aman (tidak licin / tidak ada renovasi besar)
• Area kerja tidak tertutup barang
• Untuk layanan air: sumber air dapat diakses
• Untuk apartemen/perumahan: izin dan akses teknisi sudah disiapkan
• Hewan peliharaan tidak berada di area kerja

⚠️ *Catatan Penting:*
• Pihak bertanggung jawab harus ada di lokasi saat survey
• Reschedule maksimal H-1 konfirmasi
• Biaya survey *tidak dapat dikembalikan* jika customer tidak hadir sesuai jadwal

Tim kami akan menghubungi Anda untuk konfirmasi jadwal survey.
──────────────────────
📞 *Informasi & Bantuan*
${information_detail}

Terima kasih telah memilih *Mitra10* 🙏
`
    } else if (orderDetail?.status?.category === 'QUOTATIONPAID') {
      invoiceMessage = `
${emailDetail?.welcome_header} , ${orderDetail?.members?.full_name || '-'}, terima kasih atas pembayaran Anda.
Pembayaran untuk layanan instalasi Mitra10 telah kami terima dan terverifikasi.

Order Anda saat ini sedang **dalam tahap persiapan pengerjaan** oleh tim instalasi.
Tim kami akan segera menghubungi Anda untuk **mengonfirmasi jadwal pemasangan** dan memastikan
teknisi siap di lokasi sesuai waktu yang disepakati.

**Catatan**:
Dengan terselesaikannya pembayaran, Anda dianggap telah menyetujui seluruh **Syarat & Ketentuan
Layanan Mitra10** sesuai penawaran sebelumnya.

Terima kasih telah memilih Mitra10.
            `
    }

    const payload = {
      phonenumber: orderDetail?.members?.member_number,
      message: invoiceMessage,
      location: '',
      img: '',
      document: '',
      audio: '',
      video: '',
      types: 'Order',
    }

    try {
      await axios.post(`${API_BASE}/conversation`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (e) {
      console.error('Error sending conversation WA:', e)
    }
  }

  const sendMessage = async () => {
    const filteredTemplates: any = template.find(
      (t: any) => t.subCategory === orderStatusLabel && t.status === 'Active'
    )
    if (!filteredTemplates) return

    if (filteredTemplates.withImage) {
      const data = {
        message: filteredTemplates?.content,
        chatId: `62${orderForm.project_number}@c.us`,
        adminRole: userRole,
        imagePath: filteredTemplates?.imageUrl,
      }

      await axios
        .post(`${apiChat}/send-message-change-status-image`, data)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.error(error)
        })
    } else {
      const data = {
        message: filteredTemplates?.content,
        chatId: `62${orderForm.project_number}@c.us`,
        adminRole: userRole,
      }

      await axios
        .post(`${apiChat}/send-message-change-status`, data)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  const handleUpdateOrder = async (canceledOverride?: boolean) => {
    const isCanceled = canceledOverride !== undefined ? canceledOverride : isCanceledOrder
    setIsLoading(true)
    const formData = new FormData()

    const appendIfNotDefault = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    const url = `${apiUrl}/orders/${orderId}`

    const errorBags: Array<{ message: string }> = []
    const requiredOrderFields = [
      { key: 'member_id', fieldName: 'Nomor Member' },
      { key: 'sales_id', fieldName: 'Sales Information' },
      { key: 'store_id', fieldName: 'Store' },
      { key: 'vendor_id', fieldName: 'Vendor' },
      { key: 'project_status_id', fieldName: 'Proyek Status' },
      { key: 'project_address', fieldName: 'Alamat Proyek' },
      { key: 'project_number', fieldName: 'Nomor Proyek' },
      { key: 'request_survey', fieldName: 'Request Survey' },
      { key: 'payment_type', fieldName: 'Payment Type' },
      { key: 'receipt_number', fieldName: 'Nomor Receipt' },
      { key: 'is_overdistance', fieldName: 'Overdistance' },
      { key: 'additional_fee', fieldName: 'Additional Fee' },
      { key: 'notes', fieldName: 'Catatan' },
    ]

    const requiredOrderDetailsFields = [
      { key: 'item_id', fieldName: 'Nama Pemasangan' },
      { key: 'item_notes', fieldName: 'Nama Pemasangan' },
      { key: 'item_code', fieldName: 'Item Code' },
      { key: 'item_name', fieldName: 'Item Name' },
      { key: 'quantity', fieldName: 'Quantity' },
    ]

    for (const { key, fieldName } of requiredOrderFields) {
      const value = orderForm[key]
      if (!value && key !== 'order_details') {
        if (key === 'additional_fee' && isOverdistance === 1) {
          if (value) formData.append(key, value.toString())
        } else if (key === 'is_overdistance' || key === 'notes') {
          if (value) formData.append(key, value.toString())
        } else {
          errorBags.push({ message: `Mohon isi kolom ${fieldName}` })
          setIsLoading(false)
        }
      } else {
        formData.append(key, value)
      }
    }

    if (orderForm.order_details && Array.isArray(orderForm.order_details)) {
      orderForm.order_details.forEach((item: any, index: number) => {
        requiredOrderDetailsFields.forEach(({ key, fieldName }) => {
          const value = item[key]

          if (
            (key === 'item_notes' && orderForm.payment_type === 'survey' && !value) ||
            (key === 'item_id' && orderForm.payment_type !== 'survey' && !value) ||
            (!value && key !== 'item_notes' && key !== 'item_id')
          ) {
            errorBags.push({
              message: `Mohon isi kolom "${fieldName}"`,
            })
            setIsLoading(false)
          }
        })

        if (item) {
          appendIfNotDefault(`order_details[${index}][item_code]`, item.item_code ?? '')
          appendIfNotDefault(`order_details[${index}][item_name]`, item.item_name ?? '')
          appendIfNotDefault(`order_details[${index}][item_notes]`, item.item_notes ?? '')
          appendIfNotDefault(`order_details[${index}][item_id]`, item.item_id ?? '')
          appendIfNotDefault(`order_details[${index}][quantity]`, item.quantity ?? '')
        }
      })
    }

    if (errorBags.length > 0) {
      setIsLoading(false)
      Swal.fire({
        title: 'Warning',
        text: errorBags[0].message,
        icon: 'warning',
      })
      return false
    }

    if (receiptFiles?.length) {
      receiptFiles.forEach((item: any) => {
        if (item instanceof Blob) {
          const fileName = (item as any)?.name || 'receipt.jpg'
          formData.append(`order_files`, item, fileName)
        }
      })
    }

    if (receiptFiles?.length) {
      receiptFiles.forEach((item: any, index: number) => {
        if (item.id) {
          formData.append(`existing_order_files[${index}][order_file_id]`, item.id)
        }
      })
    }

    await axios
      .post(url, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        const returnedOrderId = response.data?.data?.id

        if (response.data.status === 200 || response.data.status === 201) {
          sendMessage()
          sentWA()
          Swal.fire({
            title: 'Success',
            text: 'Success Update Order',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            if (
              orderDetail?.quotation?.length >= 1 &&
              orderDetail?.payment_type === 'survey' &&
              isCanceled === false
            ) {
              navigate(`/order/view-order`)
            } else if (isCanceled === true) {
              navigate(`/refund/new-refund/${returnedOrderId}`)
            } else {
              navigate(`/order/preview-email/${returnedOrderId}`)
            }
          })
          setIsLoading(false)
        } else {
          setIsLoading(false)
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })
        }
      })
      .catch((error) => {
        setIsLoading(false)
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Error occurred',
          icon: 'error',
        })
      })
  }

  const handleCancelOrder = async () => {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah anda yakin ingin membatalkan orderan ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      confirmButtonColor: '#6b9230',
      cancelButtonText: 'Tidak',
      cancelButtonColor: '#a30014',
    }).then((result) => {
      if (result.isConfirmed) {
        setIsCanceledOrder(true)
        handleUpdateOrder(true)
      }
    })
  }

  return {
    isLoading,
    handleUpdateOrder,
    handleCancelOrder,
  }
}
