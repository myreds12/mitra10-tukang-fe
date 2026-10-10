import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {SalesSelect, Order} from '../types'

interface OrderStaffSalesFormProps {
  userRole: string | null
  salesId: any
  salesName: string | null
  selectedSales: SingleValue<SalesSelect>
  setSelectedSales: (v: any) => void
  sales: SalesSelect[]
  setSearchSales: (v: string) => void
  orderForm: Order
  orderFormHandler: (e: any) => void
}

export const OrderStaffSalesForm: React.FC<OrderStaffSalesFormProps> = ({
  userRole,
  salesId,
  salesName,
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
          {userRole === 'Sales' ? (
            <Form.Control type='number' disabled value={salesId} />
          ) : (
            <Form.Control
              type='number'
              readOnly
              disabled={userRole === 'Sales'}
              value={userRole === 'Sales' ? salesId : selectedSales?.value || ''}
            />
          )}
        </Col>
      </Form.Group>

      <Form.Group as={Row} className='mb-5'>
        <Form.Label className='title' column xxl='4' xl='5' md='2'>
          Nama Sales :
        </Form.Label>

        <Col xxl='8' xl='7' md='10'>
          {userRole === 'Sales' ? (
            <Form.Control type='text' disabled value={salesName || ''} />
          ) : (
            <Select
              name='sales_id'
              id='sales_id'
              className='form-control p-0 form-item-name'
              classNamePrefix='select'
              placeholder='Pilih/Ketik Nama Sales'
              isSearchable={true}
              isClearable={true}
              options={sales}
              onChange={(newValue) => setSelectedSales(newValue)}
              onInputChange={(newValue) => setSearchSales(newValue)}
            />
          )}
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
