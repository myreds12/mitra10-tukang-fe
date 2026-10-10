import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchQuotationByIdApi = async (apiUrl?: string, quotationId?: string) => {
  return axios.get(`${apiUrl}/quotation/${quotationId}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchCategoriesApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/categories`, {
    headers: getAuthHeaders(),
  })
}

export const fetchPromotionsApi = async (apiUrl?: string, storeId?: string) => {
  return axios.get(`${apiUrl}/promotion?store_id=${storeId}`, {
    headers: getAuthHeaders(),
  })
}

export const saveQuotationApi = async (
  apiUrl?: string,
  quotationId?: string,
  formData?: FormData
) => {
  return axios.post(`${apiUrl}/quotation/${quotationId}`, formData, {
    headers: getAuthHeaders(),
  })
}

export const sendWaConversationApi = async (apiBase?: string, payload?: any) => {
  return axios.post(`${apiBase}/conversation`, payload, {
    headers: {'Content-Type': 'application/json'},
  })
}
