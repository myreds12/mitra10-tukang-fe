import axios from 'axios'
import {Status} from '../types'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchOrderById = async (apiUrl?: string, orderId?: string) => {
  return axios.get(`${apiUrl}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  })
}

export const postReprintCounter = async (apiUrl?: string, orderId?: string) => {
  return axios.request({
    url: `${apiUrl}/orders/${orderId}/counter`,
    method: 'post',
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const downloadQuotationPdf = async (apiUrl?: string, orderId?: number | string) => {
  return axios.get(`${apiUrl}/orders/quotation-pdf/${orderId}`, {
    method: 'GET',
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const getStatusValues = (statusData: Array<Status>, categories: string[]) =>
  statusData.filter((status: any) => categories.includes(status.category)).map((x) => x.value)

export const initialOrderState = {
  member_id: null,
  seles_id: null,
  store_id: null,
  project_status_id: null,
  request_survey: '',
  request_work: '',
  vendor_id: null,
  tukang_id: null,
  notes: '',
  project_address: '',
  project_number: '',
  receipt_number: '',
  receipt_path: '',
  total_estimate_workdays: null,
  payment_type: '',
  grand_total: '',
  grand_total_comission: '',
  is_overdistance: 0,
  additional_fee: 0,
  print_counter: 0,
  created_by: null,
  updated_by: null,
  created_at: '',
  order_details: [],
  m_order_details: [],
  order_files: [],
  complaints: [],
  work_orders: {
    work_order_status: [],
  },
  quotation: [],
  order_history: null,
}
