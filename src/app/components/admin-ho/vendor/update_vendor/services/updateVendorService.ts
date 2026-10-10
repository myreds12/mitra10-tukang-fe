import axios from 'axios'
import axiosInstance from '../../../../../../_metronic/layout/core/axiosInterceptor'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchVendorByIdApi = async (apiUrl?: string, vendorId?: string) => {
  return axiosInstance.get(`${apiUrl}/vendor/${vendorId}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchStoresApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/stores?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchAreasApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/area?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchServiceTypesApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/service-type`, {
    headers: getAuthHeaders(),
  })
}

export const fetchBanksApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/bank?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const updateVendorApi = async (
  apiUrl?: string,
  vendorId?: string,
  formData?: FormData
) => {
  return axios.post(`${apiUrl}/vendor/${vendorId}`, formData, {
    headers: getAuthHeaders(),
  })
}
