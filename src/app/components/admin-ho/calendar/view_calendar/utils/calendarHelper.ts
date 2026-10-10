import dayjs from 'dayjs'
import {Order, PaymentStage, Status} from '../types'

export const getContextualColor = (orderStatus: string): string => {
  switch (orderStatus) {
    case 'PICKLIST':
      return 'bg-primary'
    case 'BOOKED':
      return 'bg-calendar-order-booked'
    case 'SURVEYREQ':
    case 'SURVEYSTART':
    case 'SURVEYDONE':
    case 'WORKREQ':
    case 'WORKSTART':
    case 'TUKANGSURVEY':
    case 'TUKANGWORK':
      return 'bg-calendar-order-wip'
    case 'QUOTATIONDRAFT':
    case 'QUOTEIN':
    case 'QUOTEOUT':
    case 'QUOTATIONPAID':
    case 'QUOTATIONPAIDSTEPONE':
    case 'QUOTATIONPAIDSTEPTWO':
    case 'QUOTATIONPAIDSTEPTHREE':
    case 'WORKEND':
    case 'WORKENDSTEPONE':
    case 'WORKENDSTEPTWO':
    case 'WORKENDSTEPTHREE':
    case 'REWORKEND':
      return 'bg-calendar-order-done'
    case 'RESCHEDULE':
      return 'bg-calendar-order-reschedule'
    case 'INVESTIGATED':
    case 'COMPLAINTAPPROVEDBYHO':
    case 'COMPLAINTREJECTEDBYHO':
      return 'bg-calendar-order-complaint'
    case 'CANCEL':
      return 'bg-calendar-order-cancel'
    default:
      return 'bg-primary'
  }
}

export const parseCalendarOrderData = (data: any[]): Order[] => {
  return data.map((item: any) => {
    const startDate = (() => {
      if (item?.work_orders) {
        if (item.work_order_survey_date !== null) {
          return item.work_orders.work_start_date === null
            ? item.work_orders.survey_date
            : item.work_orders.work_start_date
        }
      }
      return item?.request_survey
    })()

    const endDate = (() => {
      if (item?.work_orders) {
        if (item.work_order_survey_date !== null) {
          return item.work_orders.work_end_date === null
            ? item.work_orders.survey_date
            : item.work_orders.work_end_date
        }
        if (item.work_order_survey_date === null && item.work_orders.work_end_date !== null) {
          return item.work_orders.work_end_date
        }
      }
      return item?.request_survey
    })()

    const orderStatus = item?.reschedule?.length > 0 ? 'RESCHEDULE' : item?.status?.category
    const contextualColor = getContextualColor(orderStatus)

    return {
      id: item?.id.toString(),
      title: `#${item?.id ?? ''} - ${
        item.vendor ? item.vendor.company_name : '- Vendor Belum Ditugaskan'
      } - ${item?.members?.full_name ?? ''}`,
      start: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
      end: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss'),
      status_order: orderStatus,
      order_status: orderStatus,
      className: contextualColor,
    }
  })
}

export const getTimelineStatuses = (
  categories: string[],
  statusData: Status[]
): (number | null)[] => {
  return statusData
    .filter((status: any) => categories.includes(status.category))
    .map((x) => x.value)
}

export const calculatePaymentStages = (grandTotal: number = 0): PaymentStage[] => {
  const stage1 = grandTotal * 0.25
  const stage2 = grandTotal * 0.5
  const stage3 = grandTotal * 0.25

  return [
    {stage: 'Tahap 1', percentage: '25%', amount: stage1},
    {stage: 'Tahap 2', percentage: '50%', amount: stage2},
    {stage: 'Tahap 3', percentage: '25%', amount: stage3},
  ]
}
