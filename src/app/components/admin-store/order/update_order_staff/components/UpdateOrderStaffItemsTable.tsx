import React from 'react'
import {Row, Col, Form, Table, Button} from 'react-bootstrap'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash} from '@fortawesome/free-solid-svg-icons'
import {ItemSelect, Order} from '../types'

interface UpdateOrderStaffItemsTableProps {
  orderForm: Order
  setOrderForm: React.Dispatch<React.SetStateAction<Order>>
  orderDetail: any
  paymentTypeValue: string[]
  today: string
  orderFormHandler: (e: any) => void
  orderDetailsFormHandler: (e: any, index: number) => void
  addOrderDetails: () => void
  handleRemoveForm: (index: number) => void
  isOverdistance: number
  handleCheckboxChange: (checked: boolean) => void
  isLoadingItem: boolean
  item: ItemSelect[]
  setSearchItem: (val: string) => void
  setSearchPemasangan: (val: string) => void
  calcEachDetails: () => void
  grandTotal: number
}

export const UpdateOrderStaffItemsTable: React.FC<UpdateOrderStaffItemsTableProps> = ({
  orderForm,
  setOrderForm,
  orderDetail,
  paymentTypeValue,
  today,
  orderFormHandler,
  orderDetailsFormHandler,
  addOrderDetails,
  handleRemoveForm,
  isOverdistance,
  handleCheckboxChange,
  isLoadingItem,
  item,
  setSearchItem,
  setSearchPemasangan,
  calcEachDetails,
  grandTotal,
}) => {
  return (
    <>
      <Row className='table-order-header d-flex align-items-center mb-5'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='request-date order-2 order-md-1'>
          <Form.Group>
            <Form.Label>Tanggal Request</Form.Label>
            <Form.Control
              name='request_survey'
              type='date'
              value={orderForm.request_survey}
              onChange={(e) => orderFormHandler(e)}
              min={today}
            />
            <Form.Text className='fs-8 text-dark-danger'>
              *Tanggal Request{' '}
              <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
              pasti. Konfirmasi kunjungan dilakukan oleh Vendor
            </Form.Text>
          </Form.Group>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='order-status order-1 order-md-2'>
          <h1 className='fs-3 fw-bold'>
            ORDER STATUS :{' '}
            <span className='fw-bold text-success'>{orderDetail?.status?.category}</span>
          </h1>
        </Col>

        <Col
          xs={12}
          md={4}
          lg={4}
          xl={4}
          xxl={4}
          className='button-add text-end order-3 order-md-3'
        >
          <button onClick={() => addOrderDetails()}>Tambah Order</button>
        </Col>
      </Row>

      <Row className='mb-2'>
        <Col>
          <Form.Check
            inline
            label='Lebih dari 10 KM dari Store'
            type='checkbox'
            checked={isOverdistance === 1}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
          />
        </Col>
      </Row>

      <div className='table-order-content'>
        <Table hover responsive='md'>
          <thead className='table-order-head'>
            <tr>
              {orderForm.order_details.length >= 2 && <th>Action</th>}
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Nama Pemasangan</th>
              <th>QTY Pemasangan</th>
              {!(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey') && (
                <>
                  <th>Harga Jasa</th>
                  <th>Total</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {orderForm.order_details.map((element, index) => (
              <tr key={`${index}-order_details`}>
                {orderForm.order_details.length >= 2 && (
                  <td align='center'>
                    <Button
                      className='btn-remove'
                      variant='danger'
                      onClick={() => handleRemoveForm(index)}
                    >
                      <span className='text'>Remove</span>
                      <span className='icon'>
                        <FontAwesomeIcon icon={faTrash} />
                      </span>
                    </Button>
                  </td>
                )}

                <td>
                  {paymentTypeValue[1] === 'survey' ? (
                    <CreatableSelect
                      id={`item_id-${index}`}
                      className='form-control p-0 form-item-code'
                      classNamePrefix='select'
                      placeholder='Pilih/Ketik Item Code / Nama'
                      isSearchable={true}
                      isClearable={true}
                      isLoading={isLoadingItem}
                      options={item.filter((x: any) => Number(x?.type) === 3)}
                      name={`item_id`}
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          overflow: 'auto',
                          whiteSpace: 'normal',
                          textOverflow: '',
                        }),
                      }}
                      value={orderForm.order_details[index]?.item ?? null}
                      getOptionLabel={(option: any) => {
                        if (option?.__isNew__) {
                          return option?.label || option?.value || ''
                        }
                        const code = option?.item_code || ''
                        const name = option?.item_name || option?.service_name || ''
                        if (code && name) {
                          return `${code} - ${name}`
                        }
                        return option?.label || code || name || ''
                      }}
                      getOptionValue={(option: any) =>
                        String(option?.value ?? option?.item_code ?? '')
                      }
                      filterOption={(candidate: any, input: string) => {
                        if (!input) return true
                        const query = input.toLowerCase().trim()
                        const d = candidate.data
                        return (
                          (d.label || '').toLowerCase().includes(query) ||
                          (d.item_code || '').toLowerCase().includes(query) ||
                          (d.item_name || '').toLowerCase().includes(query) ||
                          (d.service_name || '').toLowerCase().includes(query)
                        )
                      }}
                      onInputChange={(newValue, actionMeta) => {
                        if (actionMeta.action === 'input-change') {
                          setSearchItem(newValue)
                        }
                      }}
                      onChange={(newValue) => {
                        setOrderForm((prev) => {
                          const cache = {...prev}
                          cache.order_details[index] = {
                            ...cache.order_details[index],
                            item_id:
                              newValue?.__isNew__ === true ? null : newValue?.value ?? null,
                            item_code: newValue?.__isNew__
                              ? ((newValue?.value ?? '') as string)
                              : ((newValue?.item_code ?? '') as string),
                            item_name:
                              newValue?.item_name ||
                              newValue?.service_name ||
                              (newValue?.__isNew__ ? '' : newValue?.label ?? ''),
                            item_notes: newValue?.service_name ?? newValue?.item_name ?? '',
                            item: newValue,
                          }
                          return cache
                        })
                        calcEachDetails()
                      }}
                    />
                  ) : (
                    <Form.Control
                      id={`item-code-${index}`}
                      name={`item_code`}
                      plaintext
                      readOnly={paymentTypeValue[1] === 'pemasangan_tanpa_survey'}
                      value={element.item_code ?? ''}
                      onChange={(e) => orderDetailsFormHandler(e, index)}
                    />
                  )}
                </td>

                <td style={{maxWidth: '200px', minWidth: '200px'}}>
                  <Form.Control
                    id={`item-name-${index}`}
                    name={`item_name`}
                    plaintext
                    as='textarea'
                    readOnly={paymentTypeValue[1] === 'pemasangan_tanpa_survey'}
                    value={element.item_name ?? ''}
                    onChange={(e) => {
                      orderDetailsFormHandler(e, index)
                    }}
                  />
                </td>

                <td>
                  {paymentTypeValue[1] === 'survey' ? (
                    <Form.Control
                      id={`item-notes-${index}`}
                      plaintext
                      as='textarea'
                      name={`item_notes`}
                      value={element.item_notes ?? ''}
                      onChange={(e) => {
                        orderDetailsFormHandler(e, index)
                      }}
                    />
                  ) : (
                    <Select
                      id={`item_id-${index}`}
                      className='form-control p-0 form-item-name'
                      classNamePrefix='select'
                      placeholder='Pilih/Ketik Nama Pemasangan'
                      isSearchable={true}
                      isClearable={true}
                      isLoading={isLoadingItem}
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          overflow: 'auto',
                          whiteSpace: 'normal',
                          textOverflow: '',
                        }),
                      }}
                      options={item.filter(
                        (x: any) =>
                          Number(x?.type) === (paymentTypeValue[0] === 'gratis' ? 1 : 2)
                      )}
                      name={`item_id`}
                      getOptionLabel={(option) => option?.service_name || option?.label || ''}
                      getOptionValue={(option) => String(option?.value ?? '')}
                      filterOption={(candidate: any, input: string) => {
                        if (!input) return true
                        const query = input.toLowerCase().trim()
                        const d = candidate.data
                        return (
                          (d.label || '').toLowerCase().includes(query) ||
                          (d.item_code || '').toLowerCase().includes(query) ||
                          (d.item_name || '').toLowerCase().includes(query) ||
                          (d.service_name || '').toLowerCase().includes(query)
                        )
                      }}
                      onInputChange={(newValue, actionMeta) => {
                        if (actionMeta.action === 'input-change') {
                          setSearchPemasangan(newValue)
                        }
                      }}
                      value={{
                        value: orderForm.order_details[index]?.item_id ?? null,
                        label: orderForm.order_details[index]?.item?.label ?? '',
                        item_code: orderForm.order_details[index]?.item_code ?? '',
                        item_name: orderForm.order_details[index]?.item_name ?? '',
                        service_name:
                          orderForm.order_details[index]?.item?.service_name ?? '',
                        category_id:
                          orderForm.order_details[index]?.item?.category_id ?? null,
                        default_price:
                          orderForm.order_details[index]?.item?.default_price ?? 0,
                        type: orderForm.order_details[index]?.item?.type ?? null,
                        prices: orderForm.order_details[index]?.item?.prices ?? [],
                      }}
                      onChange={(newValue) => {
                        setOrderForm((prev) => {
                          const cache = {...prev}
                          cache.order_details[index] = {
                            ...cache.order_details[index],
                            item_id: newValue?.value ?? null,
                            item_code: newValue?.item_code ?? '',
                            item_name: newValue?.item_name ?? '',
                            item: newValue,
                          }
                          return cache
                        })
                        calcEachDetails()
                      }}
                    />
                  )}
                </td>

                <td>
                  <Form.Control
                    id={`quantity-${index}`}
                    name={`quantity`}
                    type='number'
                    value={element.quantity ?? ''}
                    onChange={(e) => {
                      orderDetailsFormHandler(e, index)
                      calcEachDetails()
                    }}
                  />
                </td>

                {!(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey') && (
                  <>
                    <td>
                      <Form.Control
                        id={`unit-price-${index}`}
                        readOnly
                        plaintext
                        value={`Rp. ${
                          element?.unit_price
                            ? parseInt(element?.unit_price).toLocaleString('id')
                            : 0
                        }`}
                      />
                    </td>

                    <td>
                      <Form.Control
                        id={`total-${index}`}
                        readOnly
                        plaintext
                        value={`Rp. ${
                          element?.total ? parseInt(element?.total).toLocaleString('id') : 0
                        }`}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}

            {!(
              paymentTypeValue[0] === 'gratis' ||
              paymentTypeValue[1] === 'pemasangan_tanpa_survey'
            ) && (
              <tr>
                <td
                  className='text-end fw-bolder'
                  colSpan={orderForm.order_details.length >= 2 ? 4 : 3}
                >
                  Biaya Survey
                </td>

                <td className=' fw-bolder'>
                  {paymentTypeValue[1] === 'survey' ? `Rp. 99.000` : `Rp. 0`}
                </td>
              </tr>
            )}

            {isOverdistance === 1 && (
              <tr>
                <td
                  className='text-end fw-bolder align-middle'
                  colSpan={
                    !(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey')
                      ? orderForm.order_details.length >= 2
                        ? 6
                        : 5
                      : orderForm.order_details.length === 1
                      ? 3
                      : 4
                  }
                >
                  Biaya Tambahan
                </td>

                <td className=' fw-bolder'>
                  <Form.Control
                    name='additional_fee'
                    type='number'
                    value={orderForm.additional_fee}
                    onChange={(e) => orderFormHandler(e)}
                  />
                </td>
              </tr>
            )}

            {(paymentTypeValue[1] !== 'survey' || isOverdistance === 1) && (
              <tr>
                <td
                  className='text-end fw-bolder'
                  colSpan={
                    !(paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey')
                      ? orderForm.order_details.length >= 2
                        ? 6
                        : 5
                      : orderForm.order_details.length === 1
                      ? 3
                      : 4
                  }
                >
                  Grand Total
                </td>
                <td className=' fw-bolder'>Rp. {grandTotal.toLocaleString('id')}</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Form.Text className='fs-8 fs-l text-dark-danger'>
          *Penulisan Item code dan Item Name sama persis dengan yang tercantum di NAV
        </Form.Text>
      </div>
    </>
  )
}
