import React, { FC } from 'react'
import { Table, Button, Form, Row, Col, ListGroup } from 'react-bootstrap'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faImage, faFileImage } from '@fortawesome/free-solid-svg-icons'
import { Image } from 'antd'
import { Order } from '../types'

interface OrderDetailsSectionProps {
  orderForm: Order
  setOrderForm: React.Dispatch<React.SetStateAction<Order>>
  paymentTypeValue: string[]
  isLoadingItem: boolean
  item: any[]
  textAreaRefs: React.MutableRefObject<(HTMLTextAreaElement | null)[]>
  evidenceRef: React.RefObject<any>
  setSearchItem: (val: string) => void
  setSearchPemasangan: (val: string) => void
  orderDetailsFormHandler: (e: any, index: number) => void
  calcEachDetails: () => void
  handleRemoveForm: (index: any) => void
  isOverdistance: number
  grandTotal: number
  handleImageClick: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  receiptFiles: any[]
  handleFileClick: (index: number) => void
  handleRemoveFile: (index: number) => void
  selectedFileIndex: number
  previewImage: string
  visible: boolean
  setVisible: (val: boolean) => void
  apiUrl: string | undefined
}

export const OrderDetailsSection: FC<OrderDetailsSectionProps> = ({
  orderForm,
  setOrderForm,
  paymentTypeValue,
  isLoadingItem,
  item,
  textAreaRefs,
  evidenceRef,
  setSearchItem,
  setSearchPemasangan,
  orderDetailsFormHandler,
  calcEachDetails,
  handleRemoveForm,
  isOverdistance,
  grandTotal,
  handleImageClick,
  handleFileChange,
  receiptFiles,
  handleFileClick,
  handleRemoveFile,
  selectedFileIndex,
  previewImage,
  visible,
  setVisible,
  apiUrl,
}) => {
  return (
    <>
      <div className='table-order-content'>
        <Table hover responsive='md'>
          <thead className='table-order-head'>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Nama Pemasangan</th>
              <th>QTY Pemasangan</th>
              {!(
                paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey'
              ) && (
                  <>
                    <th>Harga Jasa</th>
                    <th>Total</th>
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
                          const cache = { ...prev }
                          cache.order_details[index] = {
                            ...cache.order_details[index],
                            item_id:
                              newValue?.__isNew__ === true
                                ? null
                                : newValue?.value ?? null,
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
                      as='textarea'
                      ref={(el: any) => (textAreaRefs.current[index] = el)}
                      readOnly={
                        paymentTypeValue[1] === 'pemasangan_tanpa_survey'
                          ? true
                          : false
                      }
                      value={element.item_code ?? ''}
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

                <td style={{ maxWidth: '200px', minWidth: '200px' }}>
                  <Form.Control
                    id={`item-name-${index}`}
                    name={`item_name`}
                    as='textarea'
                    plaintext
                    ref={(el: any) =>
                    (textAreaRefs.current[orderForm.order_details.length + index] =
                      el)
                    }
                    readOnly={
                      paymentTypeValue[1] === 'pemasangan_tanpa_survey' ? true : false
                    }
                    value={element.item_name ?? ''}
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
                      plaintext
                      as='textarea'
                      name={`item_notes`}
                      ref={(el: any) =>
                      (textAreaRefs.current[
                        2 * orderForm.order_details.length + index
                      ] = el)
                      }
                      value={element.item_notes ?? ''}
                      onChange={(e) => {
                        orderDetailsFormHandler(e, index)
                      }}
                      onInput={() => {
                        const textarea =
                          textAreaRefs.current[
                          2 * orderForm.order_details.length + index
                          ]
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
                      options={item.filter((x: any) => Number(x?.type) === (paymentTypeValue[0] === 'gratis' ? 1 : 2))}
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
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          overflow: 'auto',
                          whiteSpace: 'normal',
                          textOverflow: '',
                        }),
                      }}
                      value={{
                        value: orderForm.order_details[index]?.item_id ?? null,
                        label: orderForm.order_details[index]?.item?.label ?? '',
                        item_code: orderForm.order_details[index]?.item_code ?? '',
                        item_name: orderForm.order_details[index]?.item_name ?? '',
                        service_name: orderForm.order_details[index]?.item?.service_name ?? '',
                        category_id:
                          orderForm.order_details[index]?.item?.category_id ?? null,
                        default_price:
                          orderForm.order_details[index]?.item?.default_price ?? 0,
                        type: orderForm.order_details[index]?.item?.type ?? null,
                        prices: orderForm.order_details[index]?.item?.prices ?? [],
                      }}
                      onChange={(newValue) => {
                        setOrderForm((prev) => {
                          const cache = { ...prev }
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

                {!(
                  paymentTypeValue[0] === 'gratis' || paymentTypeValue[1] === 'survey'
                ) && (
                    <>
                      <td>
                        <Form.Control
                          id={`unit-price-${index}`}
                          readOnly
                          plaintext
                          value={`Rp. ${element?.unit_price
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
                          value={`Rp. ${element?.total
                              ? parseInt(element?.total).toLocaleString('id')
                              : 0
                            }`}
                        />
                      </td>
                    </>
                  )}

                {orderForm.order_details.length >= 2 && (
                  <td align='center'>
                    <Button variant='danger' onClick={() => handleRemoveForm(index)}>
                      Remove
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
                    {(() => {
                      if (paymentTypeValue[1] === 'survey') {
                        return `Rp. 99.000`
                      } else {
                        return `Rp. 0`
                      }
                    })()}
                  </td>
                </tr>
              )}

            {isOverdistance === 1 && (
              <tr>
                <td
                  className='text-end fw-bolder align-middle'
                  colSpan={
                    !(
                      paymentTypeValue[0] === 'gratis' ||
                      paymentTypeValue[1] === 'survey'
                    )
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
                  Rp. {Number(orderForm.additional_fee).toLocaleString('id')}
                </td>
              </tr>
            )}

            {(paymentTypeValue[1] !== 'survey' || isOverdistance === 1) && (
              <tr>
                <td
                  className='text-end fw-bolder'
                  colSpan={
                    !(
                      paymentTypeValue[0] === 'gratis' ||
                      paymentTypeValue[1] === 'survey'
                    )
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

      <Row className='upload-receipt d-flex align-items-start mt-5 mb-5'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
          <Form.Group>
            <Form.Label>Upload Receipt</Form.Label>
            <Form className='form-input-image' onClick={handleImageClick}>
              <Form.Control
                type='file'
                accept='image/jpeg, image/png'
                className='input-field-image'
                multiple
                hidden
                id='file-input'
                ref={evidenceRef}
                onChange={handleFileChange}
              />

              <div className='input-image-text'>
                <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                <p>Add File</p>
              </div>
            </Form>

            <ListGroup className='pt-3'>
              {receiptFiles.length ? (
                receiptFiles.map((item, index) => (
                  <ListGroup key={index}>
                    <ListGroup.Item
                      className='d-flex justify-content-between align-items-center'
                      key={`${item?.name}-${index}-${item?.type}`}
                    >
                      <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                      <span
                        className='upload-content'
                        onClick={() => handleFileClick(index)}
                      >
                        {item?.name}
                      </span>

                      <FontAwesomeIcon
                        icon={faTrash}
                        size='sm'
                        color='#ed2b2a'
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveFile(index)}
                      />
                    </ListGroup.Item>

                    {selectedFileIndex === index && item && (
                      <Image
                        key={`${previewImage} - ${index}`}
                        width={200}
                        style={{ display: 'none' }}
                        src={
                          item instanceof File
                            ? URL.createObjectURL(item)
                            : `${apiUrl}/public/receipt/${previewImage}`
                        }
                        preview={{
                          visible,
                          src:
                            item instanceof File
                              ? URL.createObjectURL(item)
                              : `${apiUrl}/public/receipt/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisible(value)
                          },
                        }}
                      />
                    )}
                  </ListGroup>
                ))
              ) : (
                <ListGroup.Item className='d-flex justify-content-center'>
                  Tidak ada file yang dipilih
                </ListGroup.Item>
              )}
            </ListGroup>
          </Form.Group>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4}></Col>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4}></Col>
      </Row>
    </>
  )
}
