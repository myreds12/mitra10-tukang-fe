import dayjs from 'dayjs'
import {formatDateWithTimeZone} from '../../../../../../../_metronic/helpers'
import {Order, OrderHistory, Status} from '../types'

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

export const parseCalendarOrderData = (
  data: any[],
  setOrderHistorical?: (history: OrderHistory[]) => void
): Order[] => {
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

    const orderStatus = (() => {
      return item?.reschedule?.length > 0 ? 'RESCHEDULE' : item?.status?.category
    })()

    const contextualColor = getContextualColor(orderStatus)

    if (item?.order_history && setOrderHistorical) {
      const orderHistory = item?.order_history?.map((historyItem: any) => ({
        order_id: historyItem?.order_id,
        order_status: historyItem?.status?.description,
        updated_by: historyItem?.created_at?.username,
        created_at: historyItem?.created_at
          ? `${formatDateWithTimeZone(historyItem?.created_at)} ${
              historyItem.created_by ? `oleh ${historyItem?.created_by?.username}` : ''
            }`
          : '-',
      }))

      setOrderHistorical(orderHistory)
    }

    return {
      id: item?.id.toString(),
      title: `#${item?.id ?? ''} ${
        item.vendor ? `- ${item.vendor.company_name}` : '- Vendor Belum Ditugaskan'
      } - ${item?.members?.full_name ?? ''} `,
      start: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
      end: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss'),
      order_status: orderStatus,
      status_order: orderStatus,
      className: contextualColor,
      order_detail: item,
    }
  })
}

export const getOrderHistorySteps = (statusData: Status[]) => {
  const getStatuses = (categories: string[]) =>
    statusData.filter((status: any) => categories.includes(status.category)).map((x) => x.value)

  const bookStatuses = getStatuses(['BOOK', 'BOOKED', 'PICKLIST', 'UNPAID', 'PAID'])
  const surveyStatuses = getStatuses([
    'SURVEYREQ',
    'TUKANGSURVEY',
    'SURVEYSTART',
    'SURVEYDONE',
    'QUOTEIN',
    'QUOTATIONPAID',
    'QUOTATIONPAIDSTEPONE',
    'QUOTATIONPAIDSTEPTWO',
    'QUOTATIONPAIDSTEPTHREE',
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
  ])

  return [
    {title: 'Booking Process', value: bookStatuses},
    {title: 'Survey Process', value: surveyStatuses},
    {title: 'Work in Progress', value: workStatuses},
    {title: 'Work Done', value: workDoneStatuses},
  ]
}

export const getComplaintHistorySteps = (statusData: Status[]) => {
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

  return [
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
}
