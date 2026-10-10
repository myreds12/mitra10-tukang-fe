import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchInvoiceListApi = async (
  apiUrl?: string,
  page: number = 1,
  pageSize: number = 10,
  queryparams: string = '',
  statuses: string = '',
  dateFrom: string = '',
  dateTo: string = ''
) => {
  const url = `${apiUrl}/invoices?order_by=desc&page=${page}&take=${pageSize}${queryparams}${statuses}&date_from=${dateFrom}&date_to=${dateTo}`
  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const fetchVendorPageApi = async (
  apiUrl?: string,
  page: number = 1,
  pageSize: number = 20
) => {
  return axios.get(`${apiUrl}/vendor?page=${page}&take=${pageSize}`, {
    headers: getAuthHeaders(),
  })
}

export const updateInvoiceStatusApi = async (
  apiUrl?: string,
  invoiceId?: number | string,
  formData?: FormData
) => {
  return axios.post(`${apiUrl}/invoices/${invoiceId}`, formData, {
    headers: getAuthHeaders(),
  })
}

export const uploadExcelInvoiceApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/invoices/upload-excel-invoice`, formData, {
    headers: getAuthHeaders(),
  })
}

export const exportInvoiceExcelApi = async (
  apiUrl?: string,
  dateFrom?: string,
  dateTo?: string,
  vendorId?: number | null
) => {
  return axios.get(`${apiUrl}/invoices/export-excel`, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    params: {
      date_from: dateFrom,
      date_to: dateTo,
      vendor_id: vendorId,
    },
  })
}
