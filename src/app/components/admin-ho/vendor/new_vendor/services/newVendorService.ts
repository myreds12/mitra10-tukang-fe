import axios from 'axios'
import axiosInstance from '../../../../../../_metronic/layout/core/axiosInterceptor'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchStoresApi = async (apiUrl?: string) => {
  return axiosInstance.get(`${apiUrl}/stores?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchAreaApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/area?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchServiceTypeApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/service-type`, {
    headers: getAuthHeaders(),
  })
}

export const fetchBankApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/bank?take=0`, {
    headers: getAuthHeaders(),
  })
}

export const fetchNextVendorCodeApi = async (apiUrl?: string) => {
  return axios.get(`${apiUrl}/vendor/next-code`, {
    headers: getAuthHeaders(),
  })
}

export const createNewVendorApi = async (apiUrl?: string, formData?: FormData) => {
  return axios.post(`${apiUrl}/vendor`, formData, {
    headers: getAuthHeaders(),
  })
}
