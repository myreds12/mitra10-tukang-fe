import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

const nonReportEndpoints = [
  'orders',
  'refund',
  'reschedule',
  'quotation',
  'claim garansi',
  'invoices',
]

export const fetchReportVendorDataApi = async ({
  apiUrl,
  endpoint,
  vendorId = '',
  page,
  pageSize,
  params = '',
  statuses,
  queryparams = '',
  dateFrom,
  dateTo,
}: {
  apiUrl?: string
  endpoint: string
  vendorId?: string
  page: number
  pageSize: number
  params?: string
  statuses?: any[]
  queryparams?: string
  dateFrom?: string
  dateTo?: string
}) => {
  const urlBase = nonReportEndpoints.includes(endpoint)
    ? `${apiUrl}/${endpoint}`
    : `${apiUrl}/reports/${endpoint}`

  let url = `${urlBase}?order_by=desc${vendorId}&page=${page}&take=${pageSize}${params}`

  if (statuses && statuses.length) {
    url += `&status=${statuses}`
  }
  if (queryparams) {
    url += queryparams
  }
  if (dateFrom && dateTo) {
    url += `&date_from=${dateFrom}&date_to=${dateTo}`
  }

  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const fetchAllReportVendorDataApi = async ({
  apiUrl,
  endpoint,
  vendorId = '',
  statuses,
  queryparams = '',
  dateFrom,
  dateTo,
}: {
  apiUrl?: string
  endpoint: string
  vendorId?: string
  statuses?: any[]
  queryparams?: string
  dateFrom?: string
  dateTo?: string
}) => {
  const urlBase = nonReportEndpoints.includes(endpoint)
    ? `${apiUrl}/${endpoint}`
    : `${apiUrl}/reports/${endpoint}`

  let url = `${urlBase}?order_by=desc&take=0${vendorId}`

  if (statuses && statuses.length) {
    url += `&status=${statuses}`
  }
  if (queryparams) {
    url += queryparams
  }
  if (dateFrom && dateTo) {
    url += `&date_from=${dateFrom}&date_to=${dateTo}`
  }

  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const exportReportVendorExcelApi = async ({
  apiUrl,
  endpoint,
  vendorId = '',
  dateFrom,
  dateTo,
}: {
  apiUrl?: string
  endpoint: string
  vendorId?: string
  dateFrom?: string
  dateTo?: string
}) => {
  let url = `${apiUrl}/${endpoint}/export-excel?take=0${vendorId}`
  if (dateFrom) url += `&date_from=${dateFrom}`
  if (dateTo) url += `&date_to=${dateTo}`

  return axios.get(url, {
    method: 'GET',
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}
