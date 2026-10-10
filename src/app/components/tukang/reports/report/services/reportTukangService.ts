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

export const fetchReportTukangDataApi = async ({
  apiUrl,
  endpoint,
  tukangId = '',
  page,
  pageSize,
  params = '',
  queryparams = '',
}: {
  apiUrl?: string
  endpoint: string
  tukangId?: string
  page: number
  pageSize: number
  params?: string
  queryparams?: string
}) => {
  const urlBase = nonReportEndpoints.includes(endpoint)
    ? `${apiUrl}/${endpoint}`
    : `${apiUrl}/reports/${endpoint}`

  let url = `${urlBase}?order_by=desc${tukangId}&page=${page}&take=${pageSize}${params}`
  if (queryparams) {
    url += queryparams
  }

  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const fetchAllReportTukangDataApi = async ({
  apiUrl,
  endpoint,
  tukangId = '',
  queryparams = '',
}: {
  apiUrl?: string
  endpoint: string
  tukangId?: string
  queryparams?: string
}) => {
  const urlBase = nonReportEndpoints.includes(endpoint)
    ? `${apiUrl}/${endpoint}`
    : `${apiUrl}/reports/${endpoint}`

  let url = `${urlBase}?order_by=desc&take=0${tukangId}`
  if (queryparams) {
    url += queryparams
  }

  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const exportReportTukangExcelApi = async ({
  apiUrl,
  endpoint,
  dateFrom,
  dateTo,
}: {
  apiUrl?: string
  endpoint: string
  dateFrom?: string
  dateTo?: string
}) => {
  let url = `${apiUrl}/${endpoint}/export-excel?take=0`
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
