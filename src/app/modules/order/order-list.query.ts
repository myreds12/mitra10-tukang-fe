import type {FilterValue} from 'antd/es/table/interface'

export interface OrderListRequestState {
  searchFilter: string
  currentPage: number
  dateFrom: string
  dateTo: string
  salesId: string | null
  storeId: string | null
  selectedStoreId: number | null
  selectedVendorId: number | null
}

export const buildOrderListParams = ({
  searchFilter,
  currentPage,
  dateFrom,
  dateTo,
  salesId,
  storeId,
  selectedStoreId,
  selectedVendorId,
  pageSize,
}: OrderListRequestState & {pageSize: number}) => ({
  view: 'order-list',
  order_by: 'desc',
  search: searchFilter || null,
  page: currentPage,
  take: pageSize,
  date_from: dateFrom || null,
  date_to: dateTo || null,
  sales_id: salesId || null,
  store_id: storeId || selectedStoreId || null,
  vendor_id: selectedVendorId || null,
})

export const buildOrderListFilterQuery = (
  filters: Record<string, FilterValue | null>
) => {
  const params: string[] = []
  const appendFilter = (key: string, filterKey: string) => {
    const values = filters[filterKey] as string[] | null | undefined
    if (values?.length) params.push(`${key}=${values.join(',')}`)
  }

  appendFilter('status', 'order_status_label')
  appendFilter('is_receipt', 'payment_receipt')
  appendFilter('is_receipt_quotation', 'payment_quotation')

  return params.length ? `&${params.join('&')}` : ''
}
