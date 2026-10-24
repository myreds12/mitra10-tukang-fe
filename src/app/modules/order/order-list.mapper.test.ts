import {mapOrderListItem} from './order-list.mapper'

describe('mapOrderListItem', () => {
  it('maps only list fields and preserves payment status rules', () => {
    const row = mapOrderListItem({
      id: 10,
      project_number: '08123456789',
      created_at: '2026-01-01T00:00:00.000Z',
      payment_type: 'survey',
      receipt_number: null,
      store: {id: 2, store_name: 'Store A'},
      members: {member_number: 'M-1', full_name: 'Customer'},
      quotation: [{receipt_quotation: 'RECEIPT', quotation_files: [{type: 2}]}],
    })

    expect(row).toMatchObject({
      order_id: 10,
      assign_from: 'Store A',
      phone_number: '08123456789',
      payment_receipt: 'UNPAID',
      payment_quotation: 'PAID (RECEIPT DI UPLOAD OLEH TOKO)',
    })
  })

  it('handles incomplete optional relations safely', () => {
    expect(mapOrderListItem({id: 11, project_number: null})).toMatchObject({
      assign_from: '-',
      vendor_name: 'Vendor Belum Ditugaskan',
      costumer_name: '-',
      phone_number: '-',
      payment_receipt: '',
      payment_quotation: '',
      order_status_label: '-',
    })
  })
})
