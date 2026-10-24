import {useCallback, useState} from 'react'
import axiosInstance from '../../../_metronic/layout/core/axiosInterceptor'
import {mapOrderList} from './order-list.mapper'
import {buildOrderListParams} from './order-list.query'

interface UseOrderListParams {
  apiUrl?: string
  searchFilter: string
  currentPage: number
  dateFrom: string
  dateTo: string
  salesId: string | null
  storeId: string | null
  selectedStoreId: number | null
  selectedVendorId: number | null
  onPageChange: (page: number) => void
}

export const useOrderList = ({
  apiUrl,
  searchFilter,
  currentPage,
  dateFrom,
  dateTo,
  salesId,
  storeId,
  selectedStoreId,
  selectedVendorId,
  onPageChange,
}: UseOrderListParams) => {
  const [loadData, setLoadData] = useState(true)
  const [totalData, setTotalData] = useState(0)

  const fetchOrderList = useCallback(
    async (page: number, pageSize: number, filterQuery: string) => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/orders${filterQuery}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: buildOrderListParams({
            searchFilter,
            currentPage: page || currentPage,
            pageSize,
            dateFrom,
            dateTo,
            salesId,
            storeId,
            selectedStoreId,
            selectedVendorId,
          }),
        })

        const responsePage = Number(
          response?.data?.page ?? response?.data?.meta?.page ?? page
        )
        const responseTotal = Number(response?.data?.total ?? response?.data?.meta?.total ?? 0)
        onPageChange(responsePage)
        setTotalData(responseTotal)

        return mapOrderList(response.data.data)
      } catch (error) {
        console.error('Error fetching order list:', error)
        return []
      } finally {
        setLoadData(false)
      }
    },
    [
      apiUrl,
      currentPage,
      dateFrom,
      dateTo,
      onPageChange,
      salesId,
      searchFilter,
      selectedStoreId,
      selectedVendorId,
      storeId,
    ]
  )

  return {fetchOrderList, loadData, totalData}
}
