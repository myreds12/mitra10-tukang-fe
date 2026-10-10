export const formatCustomDate = (date: any) => {
  if (!date) return '-'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return String(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatLocaleDateTime = (dateStr: any) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

export const mapReportTukangData = (endpoint: string, apiData: any[]): any[] => {
  if (!apiData || !Array.isArray(apiData)) {
    return []
  }

  switch (endpoint) {
    case 'orders':
      return apiData.map((item: any) => {
        const orderDate = formatLocaleDateTime(item?.created_at)
        const grandTotal =
          item?.payment_type === 'survey'
            ? Number(item?.grand_total ?? 0) +
              Number(item?.quotation?.[0]?.quotation_grand_total ?? 0)
            : Number(item?.grand_total ?? 0)

        return {
          order_id: item.id,
          store_name: item?.store?.store_name,
          member_number: item?.members?.whatsapp_number,
          costumer_name: item?.members?.full_name,
          phone_number: item?.project_number,
          vendor_name: item?.vendor?.company_name ?? '-',
          grand_total: `Rp. ${grandTotal.toLocaleString('id')}`,
          date_order: orderDate,
        }
      })

    case 'complaints':
      return apiData.map((item: any) => {
        const orderDate = formatLocaleDateTime(item?.orders?.created_at)

        const phoneNumber = item?.orders?.project_number?.startsWith('0')
          ? item?.orders?.project_number
          : `+62${item?.orders?.project_number}`

        const currentDate = new Date()
        const complaintDates = new Date(item?.created_at)

        const timeDifferenceInMilliseconds = Number(currentDate) - Number(complaintDates)
        const timeDifferenceInMinutes = Math.floor(timeDifferenceInMilliseconds / (1000 * 60))
        const timeDifferenceInHours = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60))
        const timeDifferenceInDays = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24))

        let complaintAge: string
        if (timeDifferenceInDays >= 1) {
          complaintAge = `${timeDifferenceInDays} Hari`
        } else if (timeDifferenceInHours >= 1) {
          complaintAge = `${timeDifferenceInHours} Jam`
        } else {
          complaintAge = `${timeDifferenceInMinutes} Menit`
        }

        return {
          complaint_id: item.id,
          assign_from: item.orders?.store?.store_name,
          order_id: item.orders?.id,
          date_order: orderDate,
          no_member: item.orders?.members?.member_number,
          costumer_name: item.orders?.members?.full_name,
          phone_number: phoneNumber,
          service_name: item.orders?.m_order_details?.[0]?.item_name ?? '-',
          order_status: item.orders?.status?.description,
          work_status: item?.orders?.work_orders?.work_order_status?.[0]?.status?.description,
          complaint_date: formatCustomDate(item?.created_at),
          complaint_age: complaintAge,
          complaint_status: item.status?.description,
        }
      })

    case 'quotation':
      return apiData.map((item: any) => {
        const orderDate = formatLocaleDateTime(item?.order?.created_at)
        const workOrderItems = item?.quotation_details
          ?.map((service: any) => service.name ?? '-')
          ?.join(', ')
        const paymentStatus = item?.receipt_quotation === null ? 'UNPAID' : 'PAID'

        return {
          quotation_id: item.id,
          store_name: item?.store?.store_name ?? '-',
          order_id: item?.order?.id,
          date_order: orderDate,
          costumer_name: item?.order?.members?.full_name ?? '',
          service_name: workOrderItems,
          vendor_name: item?.order?.vendor?.company_name ?? '-',
          payment_status: paymentStatus,
          order_status: item?.status?.category ?? '',
          quotation_status: item?.status?.category ?? '',
        }
      })

    case 'refund':
      return apiData.map((item: any) => {
        const orderDate = formatLocaleDateTime(item?.orders?.created_at)
        const paymentStatus = item?.orders?.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

        return {
          refund_id: item?.id,
          order_id: item?.order_id,
          store_name: item?.orders?.store?.store_name,
          date_order: orderDate,
          member_id: item?.orders?.members?.id,
          member_name: item?.orders?.members?.full_name,
          phone_number: item?.orders?.project_number,
          voucher: item?.voucher ?? '-',
          penalty_vendor: `Rp. ${parseInt(item?.penalty_nominal || '0').toLocaleString('id')}`,
          payment_status: paymentStatus,
          order_status: item?.status?.description,
        }
      })

    case 'reschedule':
      return apiData.map((item: any) => {
        const orderDate = formatLocaleDateTime(item?.created_at)
        const phoneNumber =
          item.order?.members?.phone_number !== 'null'
            ? item.order?.members?.phone_number
            : item.order?.members?.whatsapp_number
        const paymentStatus = item.order?.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

        return {
          refund_id: item?.id,
          order_id: item?.order_id,
          store_name: item?.order?.store?.store_name,
          date_order: orderDate,
          member_id: item?.order?.members?.member_number,
          member_name: item?.order?.members?.full_name,
          phone_number: phoneNumber,
          item_name: item?.order?.m_order_details?.[0]?.item?.item_name ?? '-',
          service_name: item?.order?.m_order_details?.[0]?.item?.service_name ?? '-',
          payment_status: paymentStatus,
          order_status: item?.order?.status?.category,
        }
      })

    case 'invoices':
      return apiData.map((item: any) => {
        const orderDate = formatLocaleDateTime(item?.created_at)
        return {
          order_id: item.id,
          vendor_name: item?.vendor?.company_name ?? '-',
          grand_total: `Rp. ${parseInt(item?.total_amount || '0').toLocaleString('id')}`,
          date_order: orderDate,
        }
      })

    default:
      return []
  }
}
