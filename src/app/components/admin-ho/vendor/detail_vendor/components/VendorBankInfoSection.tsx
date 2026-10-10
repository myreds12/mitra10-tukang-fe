import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'

interface VendorBankInfoSectionProps {
  vendorDetail: any
}

export const VendorBankInfoSection: React.FC<VendorBankInfoSectionProps> = ({vendorDetail}) => {
  return (
    <Row>
      <div className='bank-information'>
        <h1 className='fs-3 text-decoration-underline fw-bold mb-2'>INFORMASI BANK</h1>

        <Form.Group as={Row} className='detail-info'>
          <Form.Label column sm='2' className='fw-semibold'>
            NAMA BANK :
          </Form.Label>
          <Col sm='10'>
            <Form.Label className='fw-normal mt-3'>
              {vendorDetail?.bank?.bank_name}
            </Form.Label>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className='detail-info'>
          <Form.Label column sm='2' className='fw-semibold'>
            NOMOR REKENING :
          </Form.Label>
          <Col sm='10'>
            <Form.Label className='fw-normal mt-3'>
              {vendorDetail?.account_number}
            </Form.Label>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className='detail-info'>
          <Form.Label column sm='2' className='fw-semibold'>
            PEMILIK REKENING :
          </Form.Label>
          <Col sm='10'>
            <Form.Label className='fw-normal mt-3'>
              {vendorDetail?.account_name}
            </Form.Label>
          </Col>
        </Form.Group>
      </div>
    </Row>
  )
}
