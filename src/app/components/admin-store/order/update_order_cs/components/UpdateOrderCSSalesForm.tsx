import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {SalesSelect, Order} from '../types'

interface UpdateOrderCSSalesFormProps {
  userRole: string | null
  salesId: any
  sales: SalesSelect[]
  selectedSales: SingleValue<SalesSelect>
  setSelectedSales: (val: SingleValue<SalesSelect>) => void
  setSearchSales: (val: string) => void
  orderForm: Order
  orderFormHandler: (e: any) => void
}

export const UpdateOrderCSSalesForm: React.FC<UpdateOrderCSSalesFormProps> = ({
  userRole,
  salesId,
  sales,
  selectedSales,
  setSelectedSales,
  setSearchSales,
  orderForm,
  orderFormHandler,
}) => {
  return (
    <div className='form-sales'>
      <div className='form-header'>
        <h1 className='text-end fw-bold'>SALES INFORMATION</h1>
      </div>
      <Form.Group as={Row} className='mb-5'>
        <Form.Label column sm='4'>
          Sales ID :
        </Form.Label>

        <Col sm='8'>
          <Form.Control
            type='number'
            disabled
            value={
              userRole === 'SALES' ? salesId : selectedSales?.value?.toString() || ''
            }
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className='mb-5'>
        <Form.Label column sm='4'>
          Nama Sales :
        </Form.Label>

        <Col sm='8'>
          <Select
            name='sales_id'
            id='sales_id'
            className='form-control p-0 form-item-name'
            classNamePrefix='select'
            placeholder='Pilih/Ketik Nama Sales'
            isSearchable={true}
            isClearable={true}
            options={sales}
            value={selectedSales}
            onChange={(newValue) => setSelectedSales(newValue)}
            onInputChange={(newValue) => setSearchSales(newValue)}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className='mb-5'>
        <Form.Label className='title' column xxl='4' xl='5' md='2'>
          Catatan :
        </Form.Label>

        <Col xxl='8' xl='7' md='10'>
          <Form.Control
            as='textarea'
            name='notes'
            className='additional-notes'
            style={{minHeight: '150px'}}
            value={orderForm.notes}
            onChange={(event) => {
              orderFormHandler(event)
            }}
          />
        </Col>
      </Form.Group>
    </div>
  )
}
