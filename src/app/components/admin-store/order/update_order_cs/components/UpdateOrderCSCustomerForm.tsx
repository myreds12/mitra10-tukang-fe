import React from 'react'
import {Row, Col, Form, InputGroup} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {MemberSelect, Order} from '../types'

interface UpdateOrderCSCustomerFormProps {
  staffStoreName: string
  paymentTypeValue: string[]
  setPaymentTypeValue: (val: string[]) => void
  member: MemberSelect[]
  selectedMember: SingleValue<MemberSelect>
  setSelectedMember: (val: SingleValue<MemberSelect>) => void
  isWhatsapp: boolean
  setIsWhatsapp: (val: boolean) => void
  orderForm: Order
  orderFormHandler: (e: any) => void
  isOverdistance: number
  handleCheckboxChange: (checked: boolean) => void
}

export const UpdateOrderCSCustomerForm: React.FC<UpdateOrderCSCustomerFormProps> = ({
  staffStoreName,
  paymentTypeValue,
  setPaymentTypeValue,
  member,
  selectedMember,
  setSelectedMember,
  isWhatsapp,
  setIsWhatsapp,
  orderForm,
  orderFormHandler,
  isOverdistance,
  handleCheckboxChange,
}) => {
  return (
    <div className='form-costumer'>
      <Row className='form-header'>
        <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='mb-3'>
          <Form.Group>
            <Form.Label className='title'>
              Nama Toko
              <span className='fs-5 ms-2 pt-2 pb-2 fw-semibold bg-secondary'>
                {staffStoreName}
              </span>
            </Form.Label>
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
              <Form.Label className='title'>WA / Phone Number</Form.Label>

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
            <Form.Label className='title'>Nama Customer</Form.Label>
            <Form.Control type='text' disabled value={selectedMember?.full_name || ''} />
          </Form.Group>
        </Col>

        <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
          <Form.Group className='mb-5'>
            <Form.Label className='title'>Email</Form.Label>
            <Form.Control type='text' disabled value={selectedMember?.email || ''} />
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
                checked={isOverdistance === 1}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
              />
            </div>

            <Form.Control
              as='textarea'
              name='project_address mb-2'
              className='field-alamat'
              value={orderForm.project_address}
              onChange={(event) => orderFormHandler(event)}
            />

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
          </Form.Group>
        </Col>
      </Row>
    </div>
  )
}
