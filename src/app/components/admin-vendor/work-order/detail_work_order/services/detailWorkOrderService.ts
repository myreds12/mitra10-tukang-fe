import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchOrderDetailApi = async (apiUrl?: string, orderId?: string) => {
  return axios.get(`${apiUrl}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  })
}

export const replaceWorkOrderFotoApi = async (apiUrl?: string, itemId?: any, formData?: FormData) => {
  return axios.post(`${apiUrl}/work-orders/${itemId}/replace-foto`, formData, {
    headers: getAuthHeaders(),
  })
}

export const deleteWorkOrderFotoApi = async (apiUrl?: string, itemId?: any) => {
  return axios.delete(`${apiUrl}/work-orders/${itemId}/delete-foto`, {
    headers: getAuthHeaders(),
  })
}

export const addFotoBeforeApi = async (apiUrl?: string, workOrderId?: any, formData?: FormData) => {
  return axios.post(`${apiUrl}/work-orders/${workOrderId}/add-foto-before`, formData, {
    headers: getAuthHeaders(),
  })
}

export const addFotoAfterApi = async (apiUrl?: string, workOrderId?: any, formData?: FormData) => {
  return axios.post(`${apiUrl}/work-orders/${workOrderId}/add-foto-after`, formData, {
    headers: getAuthHeaders(),
  })
}
