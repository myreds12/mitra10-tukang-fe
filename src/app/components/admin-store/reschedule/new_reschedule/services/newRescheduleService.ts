import axios from 'axios'
import axiosInstance from '../../../../../../_metronic/layout/core/axiosInterceptor'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchOrdersForRescheduleApi = async (
  apiUrl?: string,
  statuses?: any,
  storeId: string = '',
  tukangId: string = '',
  search: string = ''
) => {
  return axiosInstance.get(
    `${apiUrl}/orders?order_by=desc&take=0&status=${statuses}${storeId}${tukangId}${search}`,
    {
      headers: getAuthHeaders(),
    }
  )
}

export const fetchOrderDetailForRescheduleApi = async (apiUrl?: string, orderId?: string | number) => {
  return axios.get(`${apiUrl}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  })
}

export const createRescheduleApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/reschedule`, formData, {
    headers: getAuthHeaders(),
  })
}
