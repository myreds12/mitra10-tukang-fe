import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {SingleValue} from 'react-select'
import {SalesSelect, Order} from '../types'

interface UpdateOrderStaffSalesFormProps {
  userRole: string | null
  salesId: any
  username: string
  selectedSales: SingleValue<SalesSelect>
  orderForm: Order
  orderFormHandler: (e: any) => void
}

export const UpdateOrderStaffSalesForm: React.FC<UpdateOrderStaffSalesFormProps> = ({
  userRole,
  salesId,
  username,
  selectedSales,
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
          <Form.Control
            type='number'
            disabled
            value={userRole === 'SALES' ? salesId : selectedSales?.value?.toString() || ''}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className='mb-5'>
        <Form.Label className='title' column xxl='4' xl='5' md='2'>
          Nama Sales :
        </Form.Label>

        <Col xxl='8' xl='7' md='10'>
          <Form.Control
            type='text'
            disabled
            value={userRole === 'SALES' ? username : selectedSales?.full_name || ''}
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
