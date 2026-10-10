import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchOrderByIdApi = async (apiUrl?: string, orderId?: string) => {
  return axios.get(`${apiUrl}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchMembersApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/member`, {
    headers: getAuthHeaders(),
  })
}

export const fetchItemsApi = async (
  apiUrl?: string,
  take: number = 0,
  searchQuery: string = '',
  itemTypeParam: string = ''
) => {
  return axios.get(`${apiUrl}/items?take=${take}${searchQuery}${itemTypeParam}`, {
    headers: getAuthHeaders(),
  })
}

export const updateOrderStaffApi = async (apiUrl?: string, orderId?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/orders/${orderId}`, formData, {
    headers: getAuthHeaders(),
  })
}

export const reprintOrderStaffApi = async (apiUrl?: string, orderId?: string) => {
  return axios.request({
    url: `${apiUrl}/orders/${orderId}/counter`,
    method: 'post',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}
