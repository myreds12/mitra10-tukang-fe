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
  'complaints',
]

export const fetchGrandTotalApi = async ({
  apiUrl,
  endpoint,
  title,
  statusName,
  statuses,
  dateFrom,
  dateTo,
  storeId,
  params,
}: {
  apiUrl?: string
  endpoint: string
  title: string
  statusName: string
  statuses: number[]
  dateFrom?: string
  dateTo?: string
  storeId?: string | null
  params: string
}) => {
  const urlBase = nonReportEndpoints.includes(endpoint)
    ? `${apiUrl}/${endpoint}`
    : `${apiUrl}/reports/${endpoint}`

  let url = `${urlBase}?order_by=desc&take=0${params}`

  if (endpoint === 'sales-comission') {
    if (statusName === 'UNPAID') {
      url += `&status=1,2`
    } else if (statusName === 'PAID') {
      url += `&status=3`
    }
  } else {
    if (statuses && statuses.length) {
      url += `&status=${statuses}`
    }
    if (dateFrom && dateTo) {
      url += `&date_from=${dateFrom}&date_to=${dateTo}`
    }
    if (storeId) {
      url += `&store_id=${storeId}`
    }
  }

  const response = await axios.get(url, {
    headers: getAuthHeaders(),
  })

  if (response?.data) {
    switch (endpoint) {
      case 'orders':
        return response?.data?.orderGrandTotal ?? 0
      case 'complaints':
        return response?.data?.complaintGrandTotal ?? 0
      case 'refund':
        if (title === 'Laporan Total Penalty') {
          return response?.data?.totalPenalty ?? 0
        } else {
          return response?.data?.refundGrandTotal ?? 0
        }
      case 'quotation':
        return response?.data?.quotationGrandTotal ?? 0
      case 'sales-comission':
        return response?.data?.totalIncentive?._sum?.nominal ?? 0
      case 'reschedule':
        return response?.data?.rescheduleGrandTotal ?? 0
      default:
        return response?.data?.orderGrandTotal ?? 0
    }
  }
  return 0
}

export const fetchReportDataApi = async ({
  apiUrl,
  endpoint,
  page,
  pageSize,
  statusName,
  statuses,
  dateFrom,
  dateTo,
  storeId,
  params,
}: {
  apiUrl?: string
  endpoint: string
  page: number
  pageSize: number
  statusName: string
  statuses: number[]
  dateFrom?: string
  dateTo?: string
  storeId?: string | null
  params: string
}) => {
  const urlBase = nonReportEndpoints.includes(endpoint)
    ? `${apiUrl}/${endpoint}`
    : `${apiUrl}/reports/${endpoint}`

  let url = `${urlBase}?order_by=desc&page=${page}&take=${pageSize}${params}`

  if (endpoint === 'sales-comission') {
    if (statusName === 'UNPAID') {
      url += `&status=1,2`
    } else if (statusName === 'PAID') {
      url += `&status=3`
    }
  } else {
    if (statuses.length) {
      url += `&status=${statuses}`
    }
    if (dateFrom && dateTo) {
      url += `&date_from=${dateFrom}&date_to=${dateTo}`
    }
    if (storeId) {
      url += `&store_id=${storeId}`
    }
  }

  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const fetchStoresApi = async (
  apiUrl?: string,
  params?: {take?: number; area_id?: string}
) => {
  return axios.get(`${apiUrl}/stores`, {
    headers: getAuthHeaders(),
    params,
  })
}

export const fetchAreasApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/area?take=0`, {
    headers: getAuthHeaders(),
    params: {
      take: 0,
    },
  })
}

export const uploadExcelApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/sales/upload-excel`, formData, {
    headers: getAuthHeaders(),
  })
}

export const exportExcelBlobApi = async ({
  apiUrl,
  endpoint,
  title,
  params,
  dateFrom,
  dateTo,
  storeId,
}: {
  apiUrl?: string
  endpoint: string
  title: string
  params: string
  dateFrom?: string
  dateTo?: string
  storeId?: string | null
}) => {
  let url = ''

  if (title === 'Laporan General Report') {
    url = `${apiUrl}/reports/general-report?take=0${params}`
  } else {
    url = `${apiUrl}/${endpoint}/export-excel?take=0${params}`
  }

  const valueCheck = (key: any, value: any) => {
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      url += `${key}${value}`
    }
  }

  valueCheck('&date_from=', dateFrom)
  valueCheck('&date_to=', dateTo)
  valueCheck('&store_id=', storeId)

  return axios.get(url, {
    method: 'GET',
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const exportTemplateBlobApi = async (apiUrl?: string, status?: number) => {
  return axios.get(`${apiUrl}/sales/export-excel-template?status=${status}`, {
    method: 'GET',
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}
