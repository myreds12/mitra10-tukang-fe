import axios from 'axios'
import axiosInstance from '../../../../../../_metronic/layout/core/axiosInterceptor'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchQuotationListApi = async (
  apiUrl?: string,
  page: number = 1,
  pageSize: number = 50,
  queryparams: string = '',
  dateFrom?: string,
  dateTo?: string
) => {
  let apiUrlWithParams = `${apiUrl}/quotation?order_by=desc&page=${page}&take=${pageSize}${queryparams}`
  if (dateFrom && dateTo) {
    apiUrlWithParams += `&date_from=${dateFrom}&date_to=${dateTo}`
  }

  return axiosInstance.get(apiUrlWithParams, {
    headers: getAuthHeaders(),
  })
}

export const fetchVendorsPageApi = async (
  apiUrl?: string,
  page: number = 1,
  take: number = 20
) => {
  return axios.get(`${apiUrl}/vendor?page=${page}&take=${take}`, {
    headers: getAuthHeaders(),
  })
}

export const exportQuotationPdfApi = async (apiUrl?: string, orderId?: number) => {
  return axios.get(`${apiUrl}/orders/quotation-pdf/${orderId}`, {
    method: 'GET',
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const createQuotationPromotionApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/quotation-promotion`, formData, {
    headers: getAuthHeaders(),
  })
}
