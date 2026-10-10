import axios from 'axios'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchVendorOrdersCalendarApi = async (
  apiUrl?: string,
  vendorId?: string | null,
  page: number = 1,
  take: number = 100,
  dateFrom?: string,
  dateTo?: string
) => {
  return axios.get(`${apiUrl}/orders/calender`, {
    params: {
      vendor: vendorId ? vendorId : null,
      page,
      take,
      date_from: dateFrom,
      date_to: dateTo,
    },
    headers: getAuthHeaders(),
  })
}

export const fetchOrderDetailApi = async (apiUrl?: string, orderId?: string) => {
  return axios.get(`${apiUrl}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  })
}
