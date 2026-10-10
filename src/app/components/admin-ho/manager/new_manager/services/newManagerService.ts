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

export const fetchManagerNextCodeApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/manager/next-code`, {
    headers: getAuthHeaders(),
  })
}

export const fetchManagerListApi = async (
  apiUrl?: string,
  page: number = 1,
  pageSize: number = 10,
  storeIdParam: string = '',
  queryparams: string = ''
) => {
  const url = `${apiUrl}/manager?order_by=desc&page=${page}&take=${pageSize}&${storeIdParam}${queryparams}`
  return axios.get(url, {
    headers: getAuthHeaders(),
  })
}

export const createManagerApi = async (apiUrl?: string, payload?: any) => {
  return axios.post(`${apiUrl}/manager`, payload, {
    headers: getAuthHeaders(),
  })
}

export const deleteManagerApi = async (apiUrl?: string, id?: number | string) => {
  return axios.delete(`${apiUrl}/manager/${id}`, {
    headers: getAuthHeaders(),
  })
}

export const updateManagerStatusApi = async (
  apiUrl?: string,
  id?: number | string,
  isActive?: number
) => {
  return axios.post(
    `${apiUrl}/manager/${id}`,
    {is_active: isActive},
    {headers: getAuthHeaders()}
  )
}

export const exportManagerExcelApi = async (apiUrl?: string, urlParams: string = '') => {
  return axios.get(`${apiUrl}/manager/export-excel${urlParams}`, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}
