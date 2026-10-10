import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchComplaintDataApi = async (apiUrl?: string, complaintId?: string) => {
  return axios.get(`${apiUrl}/complaints/${complaintId}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchRemedialStatusApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/status`, {
    headers: getAuthHeaders(),
  })
}

export const fetchComplaintChannelApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/complaint-channels`, {
    headers: getAuthHeaders(),
  })
}

export const updateComplaintApi = async (
  apiUrl?: string,
  complaintId?: string,
  formData?: FormData
) => {
  return axios.post(`${apiUrl}/complaints/${complaintId}`, formData, {
    headers: getAuthHeaders(),
  })
}

export const submitRemedialActionApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/remedials`, formData, {
    headers: getAuthHeaders(),
  })
}
