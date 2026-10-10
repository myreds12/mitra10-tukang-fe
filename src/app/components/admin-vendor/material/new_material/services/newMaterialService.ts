import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchWorkOrders = async (apiUrl?: string, vendorId?: string | null) => {
  const queryVendor = vendorId ? vendorId : ''
  return axios.get(`${apiUrl}/work-orders?order_by=desc&take=0${queryVendor}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchWorkOrderDetail = async (apiUrl?: string, workOrderId?: number | null) => {
  return axios.get(`${apiUrl}/work-orders/${workOrderId}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchTukang = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/tukang`, {
    headers: getAuthHeaders(),
  })
}

export const submitMaterialWorkOrder = async (
  apiUrl: string | undefined,
  workOrderId: number | null,
  formData: FormData
) => {
  return axios.post(`${apiUrl}/work-orders/${workOrderId}/set-materials`, formData, {
    headers: getAuthHeaders(),
  })
}

export const formatDateTime = (date: any) => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export const stringToHash = (string: string) => {
  let hash = 0

  if (string.length === 0) return hash

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return hash
}

export const getStatusNameByCategory = (category: string) => {
  switch (category) {
    case 'SURVEYREQ':
      return 'SURVEYSTART'
    case 'TUKANGSURVEY':
      return 'SURVEYSTART'
    case 'SURVEYSTART':
      return 'SURVEYDONE'
    case 'SURVEYDONE':
      return 'SURVEYDONE'
    case 'RESURVEYREQ':
      return 'RESURVEYSTART'
    case 'RESURVEYSTART':
      return 'RESURVEYDONE'
    case 'RESURVEYDONE':
      return 'RESURVEYDONE'
    case 'WORKREQ':
      return 'WORKSTART'
    case 'TUKANGWORK':
      return 'WORKSTART'
    case 'WORKSTART':
      return 'WORKEND'
    case 'WORKEND':
      return 'WORKEND'
    case 'REWORKREQ':
      return 'REWORKSTART'
    case 'REWORKSTART':
      return 'REWORKEND'
    case 'REWORKEND':
      return 'REWORKEND'
    case 'TUKANGWORKSTEPONE':
      return 'WORKSTARTSTEPONE'
    case 'WORKSTARTSTEPONE':
      return 'WORKENDSTEPONE'
    case 'TUKANGWORKSTEPTWO':
      return 'WORKSTARTSTEPTWO'
    case 'WORKSTARTSTEPTWO':
      return 'WORKENDSTEPTWO'
    case 'TUKANGWORKSTEPTHREE':
      return 'WORKSTARTSTEPTHREE'
    case 'WORKSTARTSTEPTHREE':
      return 'WORKENDSTEPTHREE'
    case 'WORKENDSTEPONE':
      return 'WORKENDSTEPONE'
    case 'WORKENDSTEPTWO':
      return 'WORKENDSTEPTWO'
    case 'WORKENDSTEPTHREE':
      return 'WORKENDSTEPTHREE'
    default:
      return null
  }
}
