import {formatDate, formatDateWithTimeZone} from '../../../../../../_metronic/helpers'

export const mapReportData = (endpoint: string, apiData: any[]): any[] => {
  if (!apiData || !Array.isArray(apiData)) {
    return []
  }

  switch (endpoint) {
    case 'orders':
      return apiData.map((item: any) => {
        const orderDate = formatDateWithTimeZone(item?.created_at)
        const grandTotal =
          item?.payment_type === 'survey'
            ? Number(item?.grand_total ?? 0) +
              Number(item?.quotation?.[0]?.quotation_grand_total ?? 0)
            : Number(item?.grand_total ?? 0)

        const phoneNumber = item?.project_number?.startsWith('0')
          ? item?.project_number
          : `+62${item?.project_number}`

        return {
          order_id: item.id,
          store_name: item?.store?.store_name,
          member_number: item?.members?.whatsapp_number,
          costumer_name: item?.members?.full_name,
          phone_number: phoneNumber,
          vendor_name: item?.vendor?.company_name ?? '-',
          grand_total: `Rp. ${grandTotal.toLocaleString('id')}`,
          date_order: orderDate,
          status: item?.status?.description,
        }
      })

    case 'complaints':
      return apiData.map((item: any) => {
        const orderDate = formatDateWithTimeZone(item?.orders?.created_at)
        const complaintDate = new Date(item.complaint_date)
        const currentDate = new Date()

        const timeDifferenceInMilliseconds = Number(currentDate) - Number(complaintDate)
        const timeDifferenceInMinutes = Math.floor(timeDifferenceInMilliseconds / (1000 * 60))
        const timeDifferenceInHours = Math.floor(
          timeDifferenceInMilliseconds / (1000 * 60 * 60)
        )
        const timeDifferenceInDays = Math.floor(
          timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24)
        )

        let complaintAge: string
        if (timeDifferenceInDays >= 1) {
          complaintAge = `${timeDifferenceInDays} Hari`
        } else if (timeDifferenceInHours >= 1) {
          complaintAge = `${timeDifferenceInHours} Jam`
        } else {
          complaintAge = `${timeDifferenceInMinutes} Menit`
        }

        const phoneNumber = item?.orders?.project_number?.startsWith('0')
          ? item.orders?.project_number
          : `+62${item.orders?.project_number}`

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
          work_status: item.orders?.status?.description,
          complaint_date: formatDate(complaintDate),
          complaint_age: complaintAge,
          complaint_status: item.status?.description,
        }
      })

    case 'quotation':
      return apiData.map((item: any) => {
        const orderDate = formatDateWithTimeZone(item?.order?.created_at)
        const workOrderItems = item?.quotation_details
          ?.map((service: any) => service.name ?? '-')
          .join(', ')

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
          order_status: item?.status?.description ?? '',
          quotation_status: item?.status?.category ?? '',
        }
      })

    case 'refund':
      return apiData.map((item: any) => {
        const orderDate = formatDateWithTimeZone(item?.orders?.created_at)
        const paymentStatus = item.orders?.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

        return {
          refund_id: item?.id,
          order_id: item?.order_id,
          store_name: item?.orders?.store?.store_name,
          date_order: orderDate,
          member_id: item?.orders?.members?.id,
          member_name: item?.orders?.members?.full_name,
          phone_number: item?.orders?.project_number,
          vendor_name: item?.orders?.vendor?.company_name ?? '-',
          service_name:
            item?.orders?.payment_type === 'survey'
              ? item?.orders?.m_order_details?.[0]?.item_notes ?? '-'
              : item?.orders?.m_order_details?.[0]?.item?.service_name ?? '-',
          voucher: item?.voucher ?? '-',
          paid_status: item?.paid_status === 1 ? 'Sudah Dibayar' : 'Belum Dibayar',
          penalty_vendor: `Rp. ${Number(item?.penalty_nominal ?? 0).toLocaleString('id')}`,
          payment_status: paymentStatus,
          order_status: item?.status?.description,
        }
      })

    case 'reschedule':
      return apiData.map((item: any) => {
        const orderDate = formatDateWithTimeZone(item?.order?.created_at)
        const phoneNumber = item?.order?.project_number?.startsWith('0')
          ? item.order?.project_number
          : `+62${item.order?.project_number}`

        const paymentStatus = item.order?.receipt_path !== 'null' ? 'PAID' : 'UNPAID'

        return {
          reschedule_id: item?.id,
          order_id: item?.order_id,
          store_name: item?.order?.store?.store_name,
          date_order: orderDate,
          member_id: item?.order?.members?.member_number,
          member_name: item?.order?.members?.full_name,
          phone_number: phoneNumber,
          item_name: item?.order?.m_order_details?.[0]?.item?.item_name ?? '-',
          service_name: item?.order?.m_order_details?.[0]?.item?.service_name ?? '-',
          payment_status: paymentStatus,
          order_status: item?.order?.status?.description,
        }
      })

    case 'sales-comission':
      return apiData.map((item: any) => {
        const orderDate = formatDateWithTimeZone(item?.quotation?.created_at)

        return {
          sales_comission_id: item?.id,
          order_id: item?.quotation?.order_id,
          date_order: orderDate,
          store_name: item?.sales?.store?.store_name ?? '-',
          costumer_name: item?.quotation?.order?.members?.full_name,
          incentive_name: item?.incentive?.name,
          sales_name: item?.sales?.full_name,
          account_name: item?.sales?.account_name ?? '-',
          account_number: item?.sales?.account_number ?? '-',
          sales_comission: `Rp. ${Number(item?.nominal ?? 0).toLocaleString('id')}`,
        }
      })

    case 'invoices':
      return apiData.map((item: any) => {
        const orderDate = formatDateWithTimeZone(item?.created_at)

        return {
          order_id: item.id,
          vendor_name: item?.vendor?.company_name ?? '-',
          grand_total: `Rp. ${Number(item?.total_amount || 0).toLocaleString('id')}`,
          date_order: orderDate,
        }
      })

    default:
      return []
  }
}
