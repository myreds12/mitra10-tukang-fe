import React from 'react'
import {Row, Col, Form, Table, Button} from 'react-bootstrap'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash} from '@fortawesome/free-solid-svg-icons'
import {Order, ItemSelect} from '../types'

interface OrderStaffItemsTableProps {
  addOrderDetails: () => void
  orderForm: Order
  paymentTypeValue: string[]
  isLoadingItem: boolean
  item: ItemSelect[]
  setSearchItem: (v: string) => void
  setSearchPemasangan: (v: string) => void
  setOrderForm: React.Dispatch<React.SetStateAction<Order>>
  calcEachDetails: () => void
  orderDetailsFormHandler: (e: any, index: number) => void
  handleRemoveForm: (index: any) => void
  textAreaRefs: React.MutableRefObject<(HTMLTextAreaElement | null)[]>
  isOverdistance: number
  grandTotal: number
}

export const OrderStaffItemsTable: React.FC<OrderStaffItemsTableProps> = ({
  addOrderDetails,
  orderForm,
  paymentTypeValue,
  isLoadingItem,
  item,
  setSearchItem,
  setSearchPemasangan,
  setOrderForm,
  calcEachDetails,
  orderDetailsFormHandler,
  handleRemoveForm,
  textAreaRefs,
  isOverdistance,
  grandTotal,
}) => {
  const isGratisOrSurvey =
    paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey'

  return (
    <>
      <Row>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4} />
        <Col xs={12} md={4} lg={4} xl={4} xxl={4} />
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

      <div className='table-order-content'>
        <Form.Text className='fs-8 fs-l text-dark-danger'>
          *Penulisan Item code dan Item Name sama persis dengan yang tercantum di NAV
        </Form.Text>

        <Table hover responsive='md'>
          <thead className='table-order-head'>
            <tr>
              <th className='content'>Item Code</th>
              <th className='content'>Item Name</th>
              <th className='content'>Nama Pemasangan</th>
              <th className='content'>QTY Pemasangan</th>
              {!isGratisOrSurvey && (
                <>
                  <th className='content'>Harga Jasa</th>
                  <th className='content'>Total</th>
                </>
              )}
              {orderForm.order_details.length >= 2 && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {orderForm.order_details.map((element, index) => (
              <tr key={`${index}-order_details`}>
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
                      name='item_id'
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
                            service_name: newValue?.service_name ?? '',
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
                      as='textarea'
                      plaintext
                      ref={(el: any) => (textAreaRefs.current[index] = el)}
                      readOnly={paymentTypeValue[1] === 'pemasangan_tanpa_survey'}
                      name='item_code'
                      value={element?.item_code ?? ''}
                      onChange={(e) => orderDetailsFormHandler(e, index)}
                      onInput={() => {
                        const textarea = textAreaRefs.current[index]
                        if (textarea) {
                          textarea.style.height = 'auto'
                          textarea.style.height = textarea.scrollHeight + 'px'
                        }
                      }}
                    />
                  )}
                </td>

                <td style={{maxWidth: '200px', minWidth: '200px'}}>
                  <Form.Control
                    id={`item-name-${index}`}
                    as='textarea'
                    plaintext
                    ref={(el: any) =>
                      (textAreaRefs.current[orderForm.order_details.length + index] = el)
                    }
                    readOnly={paymentTypeValue[1] === 'pemasangan_tanpa_survey'}
                    name='item_name'
                    value={element?.item_name ?? ''}
                    onChange={(e) => {
                      orderDetailsFormHandler(e, index)
                    }}
                    onInput={() => {
                      const textarea =
                        textAreaRefs.current[orderForm.order_details.length + index]
                      if (textarea) {
                        textarea.style.height = 'auto'
                        textarea.style.height = textarea.scrollHeight + 'px'
                      }
                    }}
                  />
                </td>

                <td>
                  {paymentTypeValue[1] === 'survey' ? (
                    <Form.Control
                      id={`item-notes-${index}`}
                      as='textarea'
                      plaintext
                      name='item_notes'
                      value={element?.item_notes ?? ''}
                      ref={(el: any) =>
                        (textAreaRefs.current[2 * orderForm.order_details.length + index] = el)
                      }
                      onChange={(e) => {
                        orderDetailsFormHandler(e, index)
                      }}
                      onInput={() => {
                        const textarea =
                          textAreaRefs.current[2 * orderForm.order_details.length + index]
                        if (textarea) {
                          textarea.style.height = 'auto'
                          textarea.style.height = textarea.scrollHeight + 'px'
                        }
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
                      name='item_id'
                      getOptionLabel={(option: any) =>
                        option?.service_name || option?.label || ''
                      }
                      getOptionValue={(option: any) => String(option?.value ?? '')}
                      value={orderForm.order_details[index]?.item ?? null}
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
                      onChange={(newValue: any) => {
                        setOrderForm((prev) => {
                          const cache = {...prev}
                          cache.order_details[index] = {
                            ...cache.order_details[index],
                            item_id: newValue?.value ?? null,
                            item_code: newValue?.item_code ?? '',
                            item_name: newValue?.item_name ?? '',
                            service_name: newValue?.service_name ?? '',
                            item_notes: newValue?.service_name ?? '',
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
                    name='quantity'
                    type='number'
                    value={element.quantity}
                    onChange={(e) => {
                      orderDetailsFormHandler(e, index)
                      calcEachDetails()
                    }}
                  />
                </td>

                {!isGratisOrSurvey && (
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

                {orderForm.order_details.length >= 2 && (
                  <td align='center'>
                    <Button
                      className='btn-remove'
                      variant='danger'
                      onClick={() => {
                        handleRemoveForm(index)
                        calcEachDetails()
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
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
                    !isGratisOrSurvey
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
                  Rp. {orderForm.additional_fee.toLocaleString('id')}
                </td>
              </tr>
            )}

            {(paymentTypeValue[1] !== 'survey' || isOverdistance === 1) && (
              <tr>
                <td
                  className='text-end fw-bolder'
                  colSpan={
                    !isGratisOrSurvey
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
      </div>
    </>
  )
}
