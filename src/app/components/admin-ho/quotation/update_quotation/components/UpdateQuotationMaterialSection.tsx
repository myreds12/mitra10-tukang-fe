import React from 'react'
import {Card, Row, Col, Form} from 'react-bootstrap'
import {QuotationDetail} from '../types'

interface UpdateQuotationMaterialSectionProps {
  quotationDetail: QuotationDetail[]
  handleCheckboxChange: (index: any, isChecked: boolean) => void
}

export const UpdateQuotationMaterialSection: React.FC<UpdateQuotationMaterialSectionProps> = ({
  quotationDetail,
  handleCheckboxChange,
}) => {
  return (
    <>
      <hr />

      <div className='item-material'>
        <h4 className='fs-5 fw-semibold mb-5'>Item Material</h4>

        {quotationDetail.filter((x) => x.type === 1).length ? (
          <>
            {quotationDetail
              .filter((x) => x.type === 1)
              .map((element, index) => (
                <Card key={`${element.index}-material`} className='card-item-material mb-5'>
                  <div className='d-flex border-rounded-3'>
                    <div className='d-flex flex-column align-items-center justify-content-between border-end p-2'>
                      <Form.Check
                        id={`is-user-${index}`}
                        type='checkbox'
                        className='mt-2'
                        checked={element.is_user === 1}
                        onChange={(e) => handleCheckboxChange(element.index, e.target.checked)}
                      />
                    </div>

                    <Card.Body>
                      <Row>
                        <Col xxl={4} xl={6} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>
                              Material Yang Dibutuhkan
                            </Form.Label>

                            <Form.Control
                              readOnly
                              value={element?.item_name ?? '-'}
                              disabled={element.is_user === 1}
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={2} xl={2} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>QTY</Form.Label>
                            <Form.Control
                              id={`quantity-${index}`}
                              name='quantity'
                              readOnly
                              value={element?.quantity ?? 0}
                              disabled={element.is_user === 1}
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Price</Form.Label>
                            <Form.Control
                              readOnly
                              value={element.unit_price}
                              disabled={element.is_user === 1}
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Total</Form.Label>
                            <Form.Control
                              readOnly
                              value={`Rp. ${element?.unit_price?.toLocaleString('id')}`}
                              disabled={element.is_user === 1}
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
                              value={element?.unit ?? '-'}
                              disabled={element.is_user === 1}
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Margin</Form.Label>

                            <Form.Control
                              readOnly
                              value={
                                element.margin_type === 1
                                  ? `${element.margin}%`
                                  : `Rp. ${element?.margin?.toLocaleString('id')}`
                              }
                              disabled={element.is_user === 1}
                            />
                          </Form.Group>
                        </Col>

                        <Col xxl={3} xl={3} lg={12} md={12} sm={12}>
                          <Form.Group className='mb-3'>
                            <Form.Label className='fs-5 fw-bold'>Final Price</Form.Label>

                            <Form.Control
                              readOnly
                              value={`Rp. ${element.final_price.toLocaleString('id')}`}
                              disabled={element.is_user === 1}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </div>
                </Card>
              ))}
          </>
        ) : (
          <Card className='mb-3'>
            <Card.Body>
              <div className='fs-5'>Tidak ada material yang dibutuhkan</div>
            </Card.Body>
          </Card>
        )}
      </div>

      <hr />

      <Form.Text className='fs-7 text-black'>Catatan : </Form.Text>
      <br />
      <Form.Text className='fs-8 fw-normal text-danger'>
        *Jika <span className='fw-bolder text-decoration-underline'>Material</span> diceklis,
        maka material tersebut disediakan oleh customer
      </Form.Text>
      <br />
      <Form.Text className='fs-8 text-danger'>
        *Harap masukkan angka tanpa tanda koma (,) sebagai pengganti gunakan tanda titik (.).
      </Form.Text>
    </>
  )
}
