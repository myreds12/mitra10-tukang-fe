import axios from 'axios'
import axiosInstance from '../../../../../../_metronic/layout/core/axiosInterceptor'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchStoreListApi = async (apiUrl?: string) => {
  return axiosInstance.get(`${apiUrl}/stores?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchBankListApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/bank?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchCategoryListApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/categories?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchSalesNextCodeApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/sales/next-code`, {
    headers: getAuthHeaders(),
  })
}

export const fetchSalesListApi = async (
  apiUrl?: string,
  page: number = 1,
  pageSize: number = 10,
  storeIdParam: string = '',
  queryparams: string = ''
) => {
  const url = `${apiUrl}/sales?order_by=desc&page=${page}&take=${pageSize}&${storeIdParam}${queryparams}`
  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const createSalesApi = async (apiUrl?: string, payload?: any) => {
  return axios.post(`${apiUrl}/sales`, payload, {
    headers: getAuthHeaders(),
  })
}

export const deleteSalesApi = async (apiUrl?: string, id?: number | string) => {
  return axios.delete(`${apiUrl}/sales/${id}`, {
    headers: getAuthHeaders(),
  })
}

export const updateSalesStatusApi = async (
  apiUrl?: string,
  id?: number | string,
  isActive?: number
) => {
  return axios.post(
    `${apiUrl}/sales/${id}`,
    {is_active: isActive},
    {headers: getAuthHeaders()}
  )
}

export const exportSalesExcelApi = async (apiUrl?: string, urlParams: string = '') => {
  return axios.get(`${apiUrl}/sales/export-excel${urlParams}`, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}
