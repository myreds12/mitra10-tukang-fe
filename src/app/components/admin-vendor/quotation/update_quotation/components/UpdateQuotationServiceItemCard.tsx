import React, {ChangeEvent} from 'react'
import {Card, Row, Col, Form, Button} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash} from '@fortawesome/free-solid-svg-icons'
import {QuotationDetailItem} from '../types'

interface UpdateQuotationServiceItemCardProps {
  element: QuotationDetailItem
  index: number
  workStep?: number
  handleChangeQuotationDetails: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number | string,
    item_type: number,
    work_step?: number
  ) => void
  validateQtyInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number | string,
    item_type: number,
    work_step?: number
  ) => void
  calculateEachDetail: (isNominal: number, index: number | string) => void
  handleMarginType: (index: number | string, isChecked: boolean) => void
  handleRemoveQuotationDetailForm: (index: number | string) => void
}

export const UpdateQuotationServiceItemCard: React.FC<UpdateQuotationServiceItemCardProps> = ({
  element,
  index,
  workStep,
  handleChangeQuotationDetails,
  validateQtyInput,
  calculateEachDetail,
  handleMarginType,
  handleRemoveQuotationDetailForm,
}) => {
  return (
    <Card key={`${element.index}-service`} className='card-item-jasa mb-5'>
      <div className='d-flex border-rounded-3'>
        <Card.Body>
          <Row>
            <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Jenis Jasa</Form.Label>
                <Form.Control
                  id={`item-name-${index}`}
                  name='item_name'
                  type='text'
                  value={element.item_name}
                  onChange={(e) =>
                    handleChangeQuotationDetails(
                      e as ChangeEvent<HTMLInputElement>,
                      element.index,
                      2,
                      workStep
                    )
                  }
                />
              </Form.Group>
            </Col>

            <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                <Form.Control
                  id={`quantity-${index}`}
                  name='quantity'
                  type='number'
                  value={element.quantity}
                  onKeyDown={(e) => {
                    if (e.key === ',') {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => {
                    validateQtyInput(
                      e as ChangeEvent<HTMLInputElement>,
                      element.index,
                      2,
                      workStep
                    )
                    calculateEachDetail(element.margin_type, element.index)
                  }}
                />
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                <Form.Control
                  id={`unit-price-${index}`}
                  type='number'
                  name='unit_price'
                  value={element.unit_price}
                  onKeyDown={(e) => {
                    if (e.key === ',') {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => {
                    handleChangeQuotationDetails(
                      e as ChangeEvent<HTMLInputElement>,
                      element.index,
                      2,
                      workStep
                    )
                    calculateEachDetail(element.margin_type, element.index)
                  }}
                />
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                <Form.Control
                  readOnly
                  plaintext
                  value={`Rp. ${(
                    Number(element.quantity) * Number(element.unit_price)
                  ).toLocaleString('id')}`}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xxl={6} xl={6} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Satuan</Form.Label>

                <Form.Control
                  id={`satuan-${index}`}
                  name='unit'
                  value={element.unit}
                  onChange={(e) => {
                    handleChangeQuotationDetails(
                      e as ChangeEvent<HTMLInputElement>,
                      element.index,
                      2,
                      workStep
                    )
                  }}
                />
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Profit</Form.Label>

                <Form.Control
                  id={`margin-${index}`}
                  type='number'
                  name='margin'
                  value={element.margin}
                  onKeyDown={(e) => {
                    if (e.key === ',') {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => {
                    handleChangeQuotationDetails(
                      e as ChangeEvent<HTMLInputElement>,
                      element.index,
                      2,
                      workStep
                    )
                    calculateEachDetail(element.margin_type, element.index)
                  }}
                />

                <div className='d-flex flex-inline mt-2'>
                  <div className='me-1'>
                    <Form.Check
                      id={`margin-type-${index}`}
                      type='checkbox'
                      checked={element.margin_type === 1}
                      onChange={(e) => {
                        handleMarginType(element.index, e.target.checked)
                        calculateEachDetail(element.margin_type, element.index)
                      }}
                    />
                  </div>

                  <div className='ms-1'>Persen</div>
                </div>
              </Form.Group>
            </Col>

            <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
              <Form.Group className='mb-3'>
                <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                <Form.Control
                  readOnly
                  plaintext
                  value={`Rp. ${element.final_price.toLocaleString('id')}`}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>

        <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
          <Button
            className='button-transparent text-danger'
            variant='primary'
            onClick={() => handleRemoveQuotationDetailForm(element.index)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
