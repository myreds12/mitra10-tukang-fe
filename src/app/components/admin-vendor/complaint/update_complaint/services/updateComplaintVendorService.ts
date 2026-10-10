import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchComplaintDetailApi = async (apiUrl?: string, complaintId?: string) => {
  return axios.get(`${apiUrl}/complaints/${complaintId}`, {
    headers: getAuthHeaders(),
  })
}

export const resyncComplaintApi = async (apiUrl?: string, complaintId?: string | number) => {
  return axios.post(`${apiUrl}/complaints/${complaintId}/resync`, {}, {
    headers: getAuthHeaders(),
  })
}

export const fetchStatusListApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/status`, {
    headers: getAuthHeaders(),
  })
}

export const submitRemedialActionApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/remedials`, formData, {
    headers: getAuthHeaders(),
  })
}
