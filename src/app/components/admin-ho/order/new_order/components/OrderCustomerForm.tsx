import React, {ChangeEvent} from 'react'
import {Row, Col, Form, FormGroup} from 'react-bootstrap'
import Select from 'react-select'
import {StoreItemSelect, MemberSelect, Order} from '../types'

interface OrderCustomerFormProps {
  store: StoreItemSelect[]
  setSelectedStore: (v: any) => void
  paymentTypeValue: string[]
  setPaymentTypeValue: (v: string[]) => void
  member: MemberSelect[]
  setSearchByPhoneNumber: (v: string) => void
  handleChangeSelectMember: (v: MemberSelect | null) => void
  selectedMember: MemberSelect
  isWhatsapp: boolean
  setIsWhatsapp: (v: boolean) => void
  orderForm: Order
  orderFormHandler: (e: any) => void
  handleCheckboxChange: (checked: boolean) => void
}

export const OrderCustomerForm: React.FC<OrderCustomerFormProps> = ({
  store,
  setSelectedStore,
  paymentTypeValue,
  setPaymentTypeValue,
  member,
  setSearchByPhoneNumber,
  handleChangeSelectMember,
  selectedMember,
  isWhatsapp,
  setIsWhatsapp,
  orderForm,
  orderFormHandler,
  handleCheckboxChange,
}) => {
  return (
    <div className='form-costumer'>
      <Row className='form-header'>
        <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
          <Form.Group as={Row}>
            <Form.Label column sm='4' className='title'>
              Nama Toko
            </Form.Label>

            <Col sm='8'>
              <Select
                name='store_id'
                className='form-control p-0'
                classNamePrefix='select'
                placeholder='Pilih Toko'
                isSearchable={true}
                isClearable={true}
                options={store}
                onChange={(newValue) => setSelectedStore(newValue)}
              />
            </Col>
          </Form.Group>
        </Col>

        <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
          <Row>
            <Col xxl={3}>
              <Form.Label className='payment-type title'>Payment Type :</Form.Label>
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
                    onChange={() => setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])}
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
                      paymentTypeValue[0] === 'berbayar' && paymentTypeValue[1] === 'survey'
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
                      setPaymentTypeValue([paymentTypeValue[0], 'pemasangan_tanpa_survey'])
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          <Form.Label className='fs-7 fw-normal'>
            <span className='text-danger fw-bold'>Note :</span>
            <br />
            Tidak dapat memilih gratis dan survey secara bersamaan
          </Form.Label>
        </Col>
      </Row>

      <Row className='input-order'>
        <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
          <Form.Group className='mb-5'>
            <Form.Label className='title'>No Member</Form.Label>
            <Select
              name='member'
              id='member'
              className='form-control p-0 form-item-name'
              classNamePrefix='select'
              placeholder='Ketik No Telepon Member/Nomor Member'
              isSearchable={true}
              isClearable={true}
              options={member}
              onInputChange={(newValue) => setSearchByPhoneNumber(newValue)}
              onChange={(newValue) => handleChangeSelectMember(newValue)}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
          <Form.Group className='mb-5'>
            <div className='d-flex justify-content-between'>
              <Form.Label className='title'>WA / Phone Number</Form.Label>

              <div className='form-check-request'>
                <Form.Check
                  inline
                  label='Bukan Whatsapp'
                  name='group1'
                  value='1'
                  type='checkbox'
                  onChange={() => setIsWhatsapp(!isWhatsapp)}
                />
              </div>
            </div>

            <FormGroup>
              <Form.Control
                className={isWhatsapp === true ? 'form-project-number-wa' : ''}
                name='project_number'
                value={orderForm.project_number}
                onChange={(event) => {
                  const name = isWhatsapp ? 'whatsapp_number' : 'phone_number'
                  orderFormHandler(event)
                  handleChangeSelectMember({
                    ...selectedMember,
                    [name]: event.target.value,
                  })
                }}
              />

              {isWhatsapp === true && (
                <span className='project-number'>
                  <div className='prefix-number text-black'>+62</div>
                </span>
              )}
            </FormGroup>
          </Form.Group>
        </Col>
      </Row>

      <Row className='input-order'>
        <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
          <Form.Group className='mb-5'>
            <Form.Label className='title'>Nama Customer</Form.Label>
            <Form.Control
              type='text'
              value={selectedMember?.full_name || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChangeSelectMember({
                  ...selectedMember,
                  full_name: e.target.value,
                })
              }
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
          <Form.Group className='mb-5'>
            <Form.Label className='title'>
              Email <span className='fs-8 fw-bold text-danger'>*Wajib di isi</span>
            </Form.Label>

            <Form.Control
              type='email'
              value={selectedMember?.email || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChangeSelectMember({
                  ...selectedMember,
                  email: e.target.value,
                })
              }
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='alamat-order'>
        <Col>
          <Form.Group className='mb-5'>
            <div className='d-flex gap-3'>
              <Form.Label className='title'>Alamat</Form.Label>

              <Form.Check
                inline
                label='Lebih dari 10 KM dengan maksimal jarak 40 KM'
                type='checkbox'
                onChange={(e) => handleCheckboxChange(e.target.checked)}
              />
            </div>

            <Form.Control
              as='textarea'
              name='project_address'
              className='field-alamat'
              value={orderForm.project_address}
              onChange={(event) => {
                orderFormHandler(event)
                handleChangeSelectMember({
                  ...selectedMember,
                  address_1: event.target.value,
                })
              }}
            />
          </Form.Group>

          <Form.Label className='fs-7 fw-normal'>
            <span className='text-danger fw-bold'>Note :</span>
            <br />
            Jika member baru, maka semua field wajib di isi, kecuali field{' '}
            <span className='fw-bolder'>No Member</span>
            <br />
            Segala informasi akan di update melalui email
            <br />
            Untuk melihat history pengerjaan dapat melalui Aplikasi Mitra10
          </Form.Label>
        </Col>
      </Row>
    </div>
  )
}
