import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import {toAbsoluteUrl} from '../../../../../../_metronic/helpers'

interface UpdateQuotationHeaderSectionProps {
  quotationData: any
  today: string
  quotationDate: string
  handleChangeQuotationDate: (event: React.ChangeEvent<HTMLInputElement>) => void
  quotationValidity: any
  formatDate: (date: any) => string
  quotationDescription: string
  handleInputQuotationDesc: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const UpdateQuotationHeaderSection: React.FC<UpdateQuotationHeaderSectionProps> = ({
  quotationData,
  today,
  quotationDate,
  handleChangeQuotationDate,
  quotationValidity,
  formatDate,
  quotationDescription,
  handleInputQuotationDesc,
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
            <img
              alt='Logo'
              className='h-50px logo mb-3'
              src={toAbsoluteUrl('/media/auth/logo-mitra.png')}
            />

            <Form.Group>
              <Form.Label className='fs-5 fw-semibold'>Nama Toko :</Form.Label>

              <Col>
                <Form.Label className='fs-5 fw-bold'>
                  {quotationData?.store?.store_name}
                </Form.Label>
              </Col>
            </Form.Group>

            <Form.Group>
              <Form.Label className='fs-5 fw-bold'>
                {quotationData?.store?.address ?? ''}
              </Form.Label>
              <br />
              <Form.Label className='fs-5 fw-bold'>
                {`Telp : ${
                  quotationData?.store?.phone_number_1 ??
                  quotationData?.store?.phone_number_2 ??
                  'Nomor telepon belum tersedia'
                }`}
              </Form.Label>
            </Form.Group>
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
                value={quotationData?.status?.description}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Tanggal :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                type='date'
                min={today}
                value={quotationDate}
                onChange={handleChangeQuotationDate}
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
                value={quotationData?.order_id}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Quotation ID :
            </Form.Label>

            <Col sm='8'>
              <Form.Control type='number' value={quotationData?.id} readOnly />
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
                value={quotationData?.order?.members?.member_number}
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
                min={today}
                value={formatDate(new Date(quotationValidity))}
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
              <h1 className='fs-3 fw-semibold mt-2'>
                {quotationData?.order?.members?.full_name}
              </h1>
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
                readOnly
                value={quotationDescription}
                onChange={handleInputQuotationDesc}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>
    </>
  )
}
