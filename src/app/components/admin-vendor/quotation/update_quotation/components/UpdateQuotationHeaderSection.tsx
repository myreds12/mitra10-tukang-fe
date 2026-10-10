import React, {ChangeEvent} from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {Quotation} from '../types'

interface UpdateQuotationHeaderSectionProps {
  quotationData: any
  quotation: Quotation
  today: string
  handleChangeQuotation: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleChangeQuotationType: (isChecked: boolean) => void
}

export const UpdateQuotationHeaderSection: React.FC<UpdateQuotationHeaderSectionProps> = ({
  quotationData,
  quotation,
  today,
  handleChangeQuotation,
  handleChangeQuotationType,
}) => {
  return (
    <>
      <Row className='mb-4'>
        <Col
          xs={{order: 'last'}}
          xxl={6}
          className='vendor-information order-1 order-xxl-1 order-xl-2 order-lg-2 order-md-2 order-sm-2 mb-3'
        >
          <div className='vendor-detail'>
            <Form.Group>
              <Form.Label className='fs-5 fw-semibold'>Nama Toko :</Form.Label>

              <Col>
                <Form.Label className='fs-3 fw-bold'>
                  {quotationData?.store?.store_name}
                </Form.Label>
              </Col>
            </Form.Group>

            <Form.Label className='fs-5 fw-bold'>{quotationData?.store?.address}</Form.Label>
            <br />
            <Form.Label className='fs-5 fw-bold'>
              {quotationData?.store?.phone_number_1
                ? `Telp : ${
                    quotationData?.store?.phone_number_1 ??
                    quotationData?.store?.phone_number_2 ??
                    'Nomor Telepon tidak tersedia'
                  }`
                : ''}
            </Form.Label>
          </div>
        </Col>

        <Col
          xs={{order: 'first'}}
          xxl={6}
          className='payment-request order-2 order-xxl-2 order-xl-1 order-lg-1 order-md-1 order-sm-1 mb-3'
        >
          <h1 className='fw-bolder'>QUOTATION</h1>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Status :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                readOnly
                plaintext
                className='fs-2 fw-bold text-black'
                type='text'
                value={quotationData?.status?.description || ''}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Tanggal :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                name='quotation_date'
                type='date'
                min={today}
                required
                value={quotation.quotation_date}
                onChange={(e) => handleChangeQuotation(e as ChangeEvent<HTMLInputElement>)}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Order ID :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                readOnly
                className='fs-5 text-black'
                type='text'
                value={quotationData?.order_id || ''}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Quotation ID :
            </Form.Label>

            <Col sm='8'>
              <Form.Control type='number' value={quotationData?.id || ''} readOnly />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Costumer ID :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                type='number'
                readOnly
                value={quotationData?.order?.members?.member_number || ''}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Quotation Valid Until :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                type='text'
                value={
                  quotationData?.quotation_validity
                    ? quotationData?.quotation_validity
                    : '--/--/----'
                }
                plaintext
                readOnly
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>

      <Row className='mb-5'>
        <Col xxl={6}>
          <div className='receiver-information mb-3'>
            <div className='receiver-detail'>
              <h1 className='fs-5 fw-semibold'>Ditunjukkan kepada :</h1>
              <h1 className='fs-3 fw-bold mt-2'>{quotationData?.order?.members?.full_name}</h1>
            </div>

            <div className='address'>
              <h3 className='fw-normal'>{quotationData?.order?.project_address}</h3>
              <h3 className='fw-normal'>
                {quotationData?.order?.project_number
                  ? `Telp : ${quotationData?.order?.project_number}`
                  : ''}
              </h3>
            </div>
          </div>
        </Col>

        <Col xxl={6}>
          <div className='payment-request'>
            <Form.Group>
              <Form.Label className='fs-5 fw-bold'>Instruksi Spesial</Form.Label>
              <Form.Control
                style={{minHeight: '140px'}}
                as='textarea'
                name='description'
                value={quotation.description}
                onChange={(e) => handleChangeQuotation(e as ChangeEvent<HTMLInputElement>)}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>

      <hr />

      <Row>
        <Col>
          <Form.Check
            id='quotation-type'
            type='checkbox'
            label='Tipe Quotation Spesial'
            className='mb-5'
            checked={quotation.quotation_special === 1}
            onChange={(e) => handleChangeQuotationType(e.target.checked)}
          />
          <Form.Text className='fs-7 text-black'>Catatan : </Form.Text>
          <br />
          <Form.Text className='fs-7 text-black'>
            *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
          </Form.Text>
          <br />
          <Form.Text className='fs-7 text-danger'>
            *Ceklis checkbox diatas untuk mengaktifkan quotation spesial
          </Form.Text>
          <br />
          <Form.Text className='fs-7 text-danger'>
            *Harap masukkan angka tanpa tanda koma (,) sebagai pengganti gunakan tanda titik (.).
          </Form.Text>
        </Col>
      </Row>
    </>
  )
}
