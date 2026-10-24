import {buildOrderListFilterQuery, buildOrderListParams} from './order-list.query'

describe('order list query builders', () => {
  it('builds stable request params for the list contract', () => {
    expect(
      buildOrderListParams({
        searchFilter: 'customer',
        currentPage: 2,
        pageSize: 50,
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
        salesId: null,
        storeId: '3',
        selectedStoreId: 4,
        selectedVendorId: 5,
      })
    ).toMatchObject({
      view: 'order-list',
      page: 2,
      take: 50,
      store_id: '3',
      vendor_id: 5,
    })
  })

  it('preserves API filter names and omits empty filters', () => {
    expect(
      buildOrderListFilterQuery({
        order_status_label: ['BOOK', 'DONE'],
        payment_receipt: [],
        payment_quotation: ['1'],
      })
    ).toBe('&status=BOOK,DONE&is_receipt_quotation=1')
  })
})
