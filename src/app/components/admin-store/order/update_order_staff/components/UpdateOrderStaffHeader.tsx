import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'

interface UpdateOrderStaffHeaderProps {
  staffStoreName: string
  paymentTypeValue: string[]
  setPaymentTypeValue: (val: string[]) => void
}

export const UpdateOrderStaffHeader: React.FC<UpdateOrderStaffHeaderProps> = ({
  staffStoreName,
  paymentTypeValue,
  setPaymentTypeValue,
}) => {
  return (
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
                  onChange={() => setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])}
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
                    paymentTypeValue[0] === 'berbayar' && paymentTypeValue[1] === 'survey'
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
                    setPaymentTypeValue([paymentTypeValue[0], 'pemasangan_tanpa_survey'])
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <Form.Label className='fs-7 fw-normal'>
          <span className='text-danger fw-bold'>Note :</span>
          <br></br>Tidak dapat memilih gratis dan survey secara bersamaan
        </Form.Label>
      </Col>
    </Row>
  )
}
