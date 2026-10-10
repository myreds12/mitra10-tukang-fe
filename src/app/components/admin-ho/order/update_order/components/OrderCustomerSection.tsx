import React, { FC } from 'react'
import { Row, Col, Form, InputGroup } from 'react-bootstrap'
import Select from 'react-select'
import { StoreItemSelect, MemberSelect, SalesSelect, Order } from '../types'

interface OrderCustomerSectionProps {
  orderDetail: any
  orderForm: Order
  selectedStore: StoreItemSelect | null
  setSelectedStore: (item: any) => void
  store: StoreItemSelect[]
  paymentTypeValue: string[]
  setPaymentTypeValue: (val: string[]) => void
  selectedMember: MemberSelect | null
  setSelectedMember: (item: any) => void
  member: MemberSelect[]
  isWhatsapp: boolean
  setIsWhatsapp: (val: boolean) => void
  orderFormHandler: (e: any) => void
  isOverdistance: number
  handleCheckboxChange: (checked: boolean) => void
  selectedSales: SalesSelect | null
  setSelectedSales: (item: any) => void
  sales: SalesSelect[]
  setSearchSales: (val: string) => void
}

export const OrderCustomerSection: FC<OrderCustomerSectionProps> = ({
  orderDetail,
  orderForm,
  selectedStore,
  setSelectedStore,
  store,
  paymentTypeValue,
  setPaymentTypeValue,
  selectedMember,
  setSelectedMember,
  member,
  isWhatsapp,
  setIsWhatsapp,
  orderFormHandler,
  isOverdistance,
  handleCheckboxChange,
  selectedSales,
  setSelectedSales,
  sales,
  setSearchSales,
}) => {
  return (
    <div className='form-order'>
      <div className='form-customer'>
        <Row className='form-header'>
          <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
            <Form.Group as={Row} className='mb-5'>
              <Form.Label column sm='4'>
                Nama Toko tes
              </Form.Label>

              <Col sm='8'>
                {orderDetail?.status?.category === 'QUOTEOUT' ? (
                  <Form.Control readOnly type='text' value={selectedStore?.label ?? ''} />
                ) : (
                  <Select
                    name='store_id'
                    className='form-control p-0'
                    classNamePrefix='select'
                    placeholder='Pilih Toko'
                    isSearchable={true}
                    isClearable={true}
                    options={store}
                    value={{
                      value: selectedStore?.value ?? null,
                      label: selectedStore?.label ?? '',
                      address: selectedStore?.address ?? '',
                      city_id: selectedStore?.city_id ?? null,
                      zip_code: selectedStore?.zip_code ?? '',
                    }}
                    onChange={(newValue) => setSelectedStore(newValue)}
                  />
                )}
              </Col>
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
            <Row>
              <Col xxl={3}>
                <Form.Label className='payment-type'>Payment Type :</Form.Label>
              </Col>

              <Col className='form-check-request' xxl={9}>
                <Row>
                  <Col xxl={5}>
                    <Form.Check
                      inline
                      label='Gratis'
                      id='gratis'
                      name='type'
                      type='radio'
                      value='gratis'
                      checked={paymentTypeValue[0] === 'gratis'}
                      onChange={() =>
                        setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
                      }
                    />
                  </Col>

                  <Col xxl={7}>
                    <Form.Check
                      inline
                      label='Survey'
                      id='survey'
                      name='paymentType'
                      type='radio'
                      value='survey'
                      checked={
                        paymentTypeValue[0] === 'berbayar' &&
                        paymentTypeValue[1] === 'survey'
                      }
                      disabled={paymentTypeValue[0] === 'gratis'}
                      onChange={() => {
                        setPaymentTypeValue(['berbayar', 'survey'])
                      }}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col xxl={5}>
                    <Form.Check
                      inline
                      label='Berbayar'
                      id='berbayar'
                      name='type'
                      type='radio'
                      value='berbayar'
                      checked={paymentTypeValue[0] === 'berbayar'}
                      onChange={() => {
                        setPaymentTypeValue(['berbayar', 'survey'])
                      }}
                    />
                  </Col>

                  <Col xxl={7}>
                    <Form.Check
                      inline
                      label='Pemasangan Tanpa Survey'
                      id='pemasangan_tanpa_survey'
                      name='paymentType'
                      type='radio'
                      value='pemasangan_tanpa_survey'
                      checked={
                        (paymentTypeValue[0] === 'gratis' &&
                          paymentTypeValue[1] === 'pemasangan_tanpa_survey') ||
                        (paymentTypeValue[0] === 'berbayar' &&
                          paymentTypeValue[1] === 'pemasangan_tanpa_survey')
                      }
                      disabled={paymentTypeValue[0] === 'gratis'}
                      onChange={() => {
                        setPaymentTypeValue([
                          paymentTypeValue[0],
                          'pemasangan_tanpa_survey',
                        ])
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            <Form.Label className='fs-7 fw-normal'>
              <span className='text-danger fw-bold'>Note :</span>
              <br></br>Tidak dapat memilih gratis dan survey secara bersamaan
            </Form.Label>
          </Col>
        </Row>

        <Row className='input-order'>
          <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
            <Form.Group className='mb-5'>
              <Form.Label>No Member</Form.Label>
              <Select
                name='member'
                id='member'
                className='form-control p-0 form-item-name'
                classNamePrefix='select'
                placeholder='Ketik No Telepon Member/Nomor Member'
                isSearchable={true}
                isClearable={true}
                isDisabled={true}
                options={member}
                value={{
                  value: selectedMember?.value ?? null,
                  label: selectedMember?.label ?? '',
                  full_name: selectedMember?.full_name ?? '',
                  email: selectedMember?.email ?? '',
                  phone_number: selectedMember?.phone_number ?? '',
                  whatsapp_number: selectedMember?.whatsapp_number ?? '',
                  address_1: selectedMember?.address_1 ?? '',
                }}
                onChange={(newValue) => setSelectedMember(newValue)}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
            <Form.Group className='mb-5'>
              <div className='d-flex justify-content-between'>
                <Form.Label>WA / Phone Number</Form.Label>

                <div className='form-check-request'>
                  <Form.Check
                    inline
                    disabled
                    label='Bukan Whatsapp'
                    name='group1'
                    value='1'
                    type='checkbox'
                    onChange={() => setIsWhatsapp(!isWhatsapp)}
                  />
                </div>
              </div>

              <InputGroup className='mb-5'>
                <Form.Control
                  disabled
                  name='project_number'
                  value={orderForm.project_number}
                  onChange={(event) => orderFormHandler(event)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Row className='input-order'>
          <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
            <Form.Group className='mb-5'>
              <Form.Label>Nama Customer</Form.Label>
              <Form.Control type='text' disabled value={selectedMember?.full_name || ''} />
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
            <Form.Group className='mb-5'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='text' disabled value={selectedMember?.email || ''} />
            </Form.Group>
          </Col>
        </Row>

        <Row className='alamat-order'>
          <Col>
            <Form.Group className='mb-5'>
              <div className='d-flex gap-3'>
                <Form.Label>Alamat</Form.Label>
                <Form.Check
                  inline
                  label='Lebih dari 10 KM dengan maksimal jarak 40 KM'
                  type='checkbox'
                  checked={isOverdistance === 1}
                  onChange={(e) => handleCheckboxChange(e.target.checked)}
                />
              </div>

              <Form.Control
                as='textarea'
                name='project_address'
                className='field-alamat'
                disabled={
                  orderDetail?.quotation?.length >= 1 &&
                    orderDetail?.payment_type === 'survey'
                    ? true
                    : false
                }
                value={orderForm.project_address}
                onChange={(event) => orderFormHandler(event)}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      <div className='form-sales'>
        <div className='form-header'>
          <h1 className='text-end fw-bold'>SALES INFORMATION</h1>
        </div>
        <Form.Group as={Row} className='mb-5'>
          <Form.Label column sm='4'>
            Sales ID :
          </Form.Label>

          <Col sm='8'>
            <Form.Control disabled type='number' value={selectedSales?.value || ''} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className='mb-5'>
          <Form.Label column sm='4'>
            Nama Sales :
          </Form.Label>

          <Col sm='8'>
            {orderDetail?.status?.category === 'QUOTEOUT' ? (
              <Form.Control readOnly type='text' value={selectedSales?.full_name ?? ''} />
            ) : (
              <Select
                name='sales'
                id='sales'
                className='form-control p-0 form-item-name'
                classNamePrefix='select'
                placeholder='Pilih/Ketik Nama Sales'
                isSearchable={true}
                isClearable={true}
                options={sales}
                value={{
                  value: selectedSales?.value ?? null,
                  label: selectedSales?.full_name ?? '',
                  full_name: selectedSales?.full_name ?? '',
                }}
                onChange={(newValue) => setSelectedSales(newValue)}
                onInputChange={(newValue) => setSearchSales(newValue)}
              />
            )}
          </Col>
        </Form.Group>

        <Form.Group as={Row} className='mb-5'>
          <Form.Label column sm='4'>
            No Receipt
          </Form.Label>
          <Col sm='8'>
            <Form.Control
              name='receipt_number'
              type='text'
              value={orderForm.receipt_number}
              readOnly={
                orderDetail?.quotation?.length >= 1 &&
                  orderDetail?.payment_type === 'survey'
                  ? true
                  : false
              }
              onChange={(e) => orderFormHandler(e)}
            />
          </Col>
        </Form.Group>

        {orderDetail?.quotation[0]?.receipt_quotation &&
          orderDetail?.quotation[0]?.quotation_special === 0 && (
            <Form.Group as={Row} className='mb-5'>
              <Form.Label column sm='4'>
                Receipt Transaksi
              </Form.Label>
              <Col sm='8'>
                <Form.Control
                  type='text'
                  value={orderDetail?.quotation[0]?.receipt_quotation}
                  readOnly={
                    orderDetail?.quotation?.length >= 1 &&
                      orderDetail?.payment_type === 'survey'
                      ? true
                      : false
                  }
                  onChange={(e) => orderFormHandler(e)}
                />
              </Col>
            </Form.Group>
          )}

        <Form.Group as={Row} className='mb-5'>
          <Form.Label className='title' column xxl='4' xl='5' md='2'>
            Catatan :
          </Form.Label>

          <Col xxl='8' xl='7' md='10'>
            <Form.Control
              as='textarea'
              name='notes'
              className='additional-notes'
              style={{ minHeight: '150px' }}
              value={orderForm.notes}
              onChange={(event) => {
                orderFormHandler(event)
              }}
            />
          </Col>
        </Form.Group>
      </div>
    </div>
  )
}
