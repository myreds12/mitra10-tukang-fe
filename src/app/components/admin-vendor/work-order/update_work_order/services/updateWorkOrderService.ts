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

export const fetchTukangApi = async (
  apiUrl?: string,
  vendorId?: string | null,
  searchQuery?: string
) => {
  const searchParam = searchQuery ? `&search=${searchQuery}` : ''
  return axios.get(`${apiUrl}/tukang?vendor_id=${vendorId}${searchParam}&take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchChatTemplatesApi = async (apiChat?: string) => {
  return axios.get(`${apiChat}/templates`, {
    headers: getAuthHeaders(),
  })
}

export const saveWorkOrderApi = async (url: string, formData: FormData) => {
  return axios.post(url, formData, {
    headers: getAuthHeaders(),
  })
}

export const sendChatMessageApi = async (
  apiChat?: string,
  data?: any,
  withImage: boolean = false
) => {
  const endpoint = withImage
    ? `${apiChat}/send-message-change-status-image`
    : `${apiChat}/send-message-change-status`

  return axios.post(endpoint, data)
}
