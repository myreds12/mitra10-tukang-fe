import axiosInstance from '../../../../../../../_metronic/layout/core/axiosInterceptor'

export const getAuthHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export const fetchVendorsPageApi = async (apiUrl?: string, page: number = 1, take: number = 20) => {
  return axiosInstance.get(`${apiUrl}/vendor?page=${page}&take=${take}`, {
    headers: getAuthHeaders(),
  })
}

export const fetchCalendarOrdersApi = async (
  apiUrl?: string,
  page: number = 1,
  take: number = 100,
  dateFrom: string = '',
  dateTo: string = '',
  extraParams: string = ''
) => {
  return axiosInstance.get(
    `${apiUrl}/orders/calender?take=${take}&page=${page}${extraParams}`,
    {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
      },
      headers: getAuthHeaders(),
    }
  )
}

export const fetchCalendarOrdersVendorApi = async (
  apiUrl?: string,
  page: number = 1,
  take: number = 100,
  dateFrom: string = '',
  dateTo: string = '',
  vendorIds: string = ''
) => {
  return axiosInstance.get(
    `${apiUrl}/orders/calender?page=${page}&take=${take}&date_from=${dateFrom}&date_to=${dateTo}${vendorIds}`,
    {
      headers: getAuthHeaders(),
    }
  )
}
