import React from 'react'
import {Card, Row, Col, Form} from 'react-bootstrap'
import Select from 'react-select'
import {CategorySelect, QuotationDetail} from '../types'

interface UpdateQuotationServiceItemCardProps {
  element: QuotationDetail
  categories: CategorySelect[]
  handleCategoryChange: (index: any, value: any) => void
}

export const UpdateQuotationServiceItemCard: React.FC<UpdateQuotationServiceItemCardProps> = ({
  element,
  categories,
  handleCategoryChange,
}) => {
  return (
    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
      <div className='d-flex border-rounded-3'>
        <Card.Body>
          <Row>
            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                <Form.Control readOnly value={element?.item_name ?? '-'} />
              </Form.Group>
            </Col>

            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                <Form.Control readOnly value={element?.quantity ?? 0} />
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>
                <Form.Control
                  readOnly
                  value={
                    element.margin_type === 1
                      ? `${element.margin}%`
                      : `Rp. ${element?.margin?.toLocaleString('id')}`
                  }
                />
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                <Form.Control
                  readOnly
                  value={`Rp. ${element?.unit_price?.toLocaleString('id')}`}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>
                <Form.Control readOnly value={element?.unit ?? '-'} />
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Category</Form.Label>
                <Select
                  name='category_id'
                  className='form-control p-0'
                  classNamePrefix='select'
                  placeholder='Pilih Kategori'
                  isSearchable={true}
                  options={categories}
                  value={{
                    value: element.category_id ?? null,
                    label: element.category_name ?? 'Pilih Category',
                  }}
                  onChange={(newValue) => handleCategoryChange(element.index, newValue)}
                />
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                <Form.Control
                  readOnly
                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </div>
    </Card>
  )
}
