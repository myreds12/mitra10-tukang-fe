import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {OrderSelectOption} from '../types'

interface NewComplaintHeaderSectionProps {
  orderDetail: any
  complaintCode: string | number
  order: OrderSelectOption[]
  selectedOrderId: SingleValue<OrderSelectOption>
  setSelectedOrderId: (val: SingleValue<OrderSelectOption>) => void
  setSearchOrder: (val: string) => void
}

export const NewComplaintHeaderSection: React.FC<NewComplaintHeaderSectionProps> = ({
  orderDetail,
  complaintCode,
  order,
  selectedOrderId,
  setSelectedOrderId,
  setSearchOrder,
}) => {
  return (
    <Row className='form-header'>
      <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='d-flex flex-column'>
        <Form.Label className='fs-4 fw-bold'>
          Nama Toko :{' '}
          <span className='fs-4 ms-2 fw-normal'>
            {orderDetail?.store?.store_name ?? ''}
          </span>
        </Form.Label>

        <Form.Label className='fs-4 fw-bold'>
          Complaint ID : <span className='fs-4 ms-2 fw-normal'>{complaintCode}</span>
        </Form.Label>
      </Col>

      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Form.Group as={Row} className='order-id-complaint'>
          <Form.Label column sm='3' className='fs-4 fw-bold'>
            Order ID :
          </Form.Label>

          <Col sm='9'>
            <Select
              name='order-id'
              className='form-control p-0'
              placeholder='Ketik/Pilih Order Id'
              isSearchable={true}
              options={order}
              value={selectedOrderId}
              onChange={(newValue) => setSelectedOrderId(newValue)}
              onInputChange={(newValue) => setSearchOrder(newValue)}
            />
          </Col>
        </Form.Group>
      </Col>

      <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
        <Col>
          <Form.Label className='fs-4 fw-bold'>
            Receipt Number :
            <span className='fs-4 ms-2 fw-normal'>
              {orderDetail?.receipt_number ?? '-'}
            </span>
          </Form.Label>

          {orderDetail?.quotation?.[0]?.receipt_quotation &&
            orderDetail?.quotation?.[0]?.quotation_special === 0 && (
              <Form.Label className='fs-4 fw-bold'>
                Receipt Quotation :
                <span className='fs-4 ms-2 fw-normal'>
                  {orderDetail?.quotation[0]?.receipt_quotation ?? '-'}
                </span>
              </Form.Label>
            )}
        </Col>

        <Col>
          <Form.Label className='fs-4 fw-bold'>
            Order Status :
            <span className='fs-4 ms-2 fw-bold text-success'>
              {orderDetail?.status?.description}
            </span>
          </Form.Label>
        </Col>
      </Col>
    </Row>
  )
}
