import React from 'react'
import {Row, Col, Form, InputGroup} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {MemberSelect, Order} from '../types'

interface UpdateOrderStaffCustomerFormProps {
  member: MemberSelect[]
  selectedMember: SingleValue<MemberSelect>
  setSelectedMember: (val: SingleValue<MemberSelect>) => void
  isWhatsapp: boolean
  setIsWhatsapp: (val: boolean) => void
  orderForm: Order
  orderFormHandler: (e: any) => void
}

export const UpdateOrderStaffCustomerForm: React.FC<UpdateOrderStaffCustomerFormProps> = ({
  member,
  selectedMember,
  setSelectedMember,
  isWhatsapp,
  setIsWhatsapp,
  orderForm,
  orderFormHandler,
}) => {
  return (
    <>
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
            <Form.Label className='title'>Alamat</Form.Label>
            <Form.Control
              as='textarea'
              name='project_address'
              className='field-alamat'
              value={orderForm.project_address}
              onChange={(event) => orderFormHandler(event)}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  )
}
