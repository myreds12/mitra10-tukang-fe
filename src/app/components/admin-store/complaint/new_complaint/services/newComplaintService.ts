import axios from 'axios'
import axiosInstance from '../../../../../../_metronic/layout/core/axiosInterceptor'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchOrdersApi = async (
  apiUrl?: string,
  userRole?: string | null,
  userStore?: string | null,
  userVendor?: string | null,
  searchQuery?: string
) => {
  const searchParam = searchQuery ? `&search=${searchQuery}` : ''
  const url = (() => {
    switch (userRole) {
      case 'Store CS':
        return `${apiUrl}/orders?order_by=desc&store_id=${userStore}${searchParam}`
      case 'Super User':
      case 'Admin HO':
        return `${apiUrl}/orders?order_by=desc${searchParam}`
      case 'Owner Vendor':
      case 'Admin Vendor':
        return `${apiUrl}/orders?order_by=desc&vendor_id=${userVendor}${searchParam}`
      default:
        return `${apiUrl}/orders?order_by=desc${searchParam}`
    }
  })()

  return axiosInstance.get(url, {
    headers: getAuthHeaders(),
  })
}

export const fetchOrderDetailApi = async (apiUrl?: string, orderId?: number | null) => {
  return axios.get(`${apiUrl}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchComplaintChannelsApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/complaint-channels`, {
    headers: getAuthHeaders(),
  })
}

export const fetchNextCodeApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/complaints/next-code`, {
    headers: getAuthHeaders(),
  })
}

export const createComplaintApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/complaints`, formData, {
    headers: getAuthHeaders(),
  })
}
