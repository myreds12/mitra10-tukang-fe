import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {SalesSelect, Order} from '../types'

interface OrderSalesFormProps {
  selectedSales: SingleValue<SalesSelect>
  setSelectedSales: (v: any) => void
  sales: SalesSelect[]
  setSearchSales: (v: string) => void
  orderForm: Order
  orderFormHandler: (e: any) => void
}

export const OrderSalesForm: React.FC<OrderSalesFormProps> = ({
  selectedSales,
  setSelectedSales,
  sales,
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
        <Form.Label className='title' column xxl='4' xl='5' md='2'>
          Sales ID :
        </Form.Label>

        <Col xxl='8' xl='7' md='10'>
          <Form.Control type='number' readOnly value={selectedSales?.value || ''} />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className='mb-5'>
        <Form.Label className='title' column xxl='4' xl='5' md='2'>
          Nama Sales :
        </Form.Label>

        <Col xxl='8' xl='7' md='10'>
          <Select
            name='sales'
            id='sales'
            className='form-control p-0 form-item-name'
            classNamePrefix='select'
            placeholder='Pilih/Ketik Nama Sales'
            isSearchable={true}
            isClearable={true}
            options={sales}
            onChange={(newValue) => setSelectedSales(newValue)}
            onInputChange={(newValue) => setSearchSales(newValue)}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className='mb-5'>
        <Form.Label column xxl='4' xl='5' md='2'>
          No Receipt
        </Form.Label>

        <Col xxl='8' xl='7' md='10'>
          <Form.Control
            name='receipt_number'
            type='text'
            value={orderForm.receipt_number}
            onChange={(e) => orderFormHandler(e)}
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
