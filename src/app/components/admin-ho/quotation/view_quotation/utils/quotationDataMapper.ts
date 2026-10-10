import {formatDateWithTimeZone} from '../../../../../../_metronic/helpers'
import {DataType, TimeLeft} from '../types'

export const calculateTimeLeft = (timeLeft: number): TimeLeft => {
  let time: TimeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
  }

  if (timeLeft > 0) {
    time = {
      days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
      hours: Math.floor((timeLeft / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((timeLeft / 1000 / 60) % 60),
    }
  } else {
    time = {
      days: 0,
      hours: 0,
      minutes: 0,
    }
  }

  return time
}

export const mapQuotationItemToDataType = (item: any): DataType => {
  const orderDate = formatDateWithTimeZone(item?.order?.created_at)

  const paymentStatus = (() => {
    if (item?.receipt_quotation !== null && item?.quotation_files?.length) {
      return 'PAID'
    } else {
      return 'UNPAID'
    }
  })()

  const createdAt = item?.quotation_validity ? new Date(item.quotation_validity) : null
  const createdAtMinus = createdAt
    ? new Date(createdAt.getTime() - 6 * 24 * 60 * 60 * 1000)
    : null

  const quotationCreatedAt = createdAtMinus
    ? createdAtMinus.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Quotation belum aktif'

  let quotationEndDate = '-'
  let cooldownQuotation = 0

  if (createdAtMinus) {
    const quotationEnd = new Date(createdAtMinus.getTime() + 7 * 24 * 60 * 60 * 1000)
    quotationEndDate = quotationEnd.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    cooldownQuotation = quotationEnd.getTime() - new Date().getTime()
  }

  const quotationCountdown = calculateTimeLeft(cooldownQuotation)
  const quotationCountdownText =
    item?.quotation_validity === null
      ? 'Quotation Belum Aktif'
      : quotationCountdown.days === 0 &&
        quotationCountdown.hours === 0 &&
        quotationCountdown.minutes === 0
      ? 'Quotation Expired'
      : `${quotationCountdown.days} Hari ${quotationCountdown.hours} Jam ${quotationCountdown.minutes} Menit`

  const quotationStatus =
    item?.quotation_validity === null
      ? 'Quotation Belum Aktif'
      : quotationCountdown.days === 0 &&
        quotationCountdown.hours === 0 &&
        quotationCountdown.minutes === 0
      ? 'Quotation Expired'
      : 'Quotation Aktif'

  return {
    key: item.id,
    quotation_id: item.id,
    store_name: item?.store?.store_name ?? '-',
    order_id: item.order?.id,
    date_order: orderDate,
    costumer_name: item?.order?.members?.full_name ?? '',
    vendor_name: item?.order?.vendor?.company_name ?? '-',
    payment_status: paymentStatus,
    order_status: item?.order?.status?.category,
    order_status_label: item?.order?.status?.description ?? '',
    period_active: quotationCreatedAt,
    period_expired: quotationEndDate,
    countdown_to_expired: quotationCountdownText,
    quotation_status: quotationStatus,
    quotation_detail: item.quotation_details,
    order_detail: item.order,
    promotion: item.promotion,
    quotation_grand_total: item?.quotation_grand_total,
    quotation_special: item?.quotation_special,
    quotation_receipt: item?.quotation_receipt,
    grand_total: `Rp. ${[
      parseInt(item?.quotation_grand_total ?? 0).toLocaleString('id-ID'),
    ]}`,
    receipt_quotation: item.receipt_quotation
      ? item.receipt_quotation
      : 'Quotation belum dibayar',
  }
}
