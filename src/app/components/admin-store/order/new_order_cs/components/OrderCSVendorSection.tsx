import React from 'react'
import {Row, Col, Form, Table} from 'react-bootstrap'
import {Order} from '../types'

interface OrderCSVendorSectionProps {
  orderForm: Order
  orderFormHandler: (e: any) => void
  today: string
  vendor: any[]
  vendorAvailbility: (data: any, requestSurvey: string) => React.ReactNode
}

export const OrderCSVendorSection: React.FC<OrderCSVendorSectionProps> = ({
  orderForm,
  orderFormHandler,
  today,
  vendor,
  vendorAvailbility,
}) => {
  return (
    <>
      <Row className='table-order-header d-flex align-items-center mb-5'>
        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='request-date order-2 order-md-1'>
          <Form.Group>
            <Form.Label className='title'>Tanggal Request</Form.Label>
            <br />
            <Form.Text className='fs-8 text-dark-danger'>
              *Tanggal Request <span className='fw-bolder text-decoration-underline'>bukan</span>{' '}
              tanggal pasti. Konfirmasi kunjungan dilakukan oleh Vendor
            </Form.Text>

            <Form.Control
              name='request_survey'
              type='date'
              value={orderForm.request_survey}
              onChange={(e) => orderFormHandler(e)}
              min={today}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='order-status order-1 order-md-2'>
          <h1 className='fs-3 fw-bold'>
            ORDER STATUS : <span className='fw-bold text-success'>PICKLIST</span>
          </h1>
        </Col>

        <Col
          xs={12}
          md={4}
          lg={4}
          xl={4}
          xxl={4}
          className='button-add text-end order-3 order-md-3'
        />
      </Row>

      <Row className='mb-5'>
        <div className='description fs-7 mb-5'>Informasi mengenai ketersediaan dari Vendor</div>

        <div className='vendor-avail'>
          <Table>
            <thead>
              <tr>
                <th>Nama Vendor</th>
                <th>Service Type</th>
                <th>Ketersediaan Vendor</th>
              </tr>
            </thead>

            <tbody>
              {vendor.map((item: any) => (
                <tr key={item?.id}>
                  <td>{item?.company_name ?? '-'}</td>
                  <td>
                    {Array.from(
                      new Set(
                        item?.vendor_service?.map((s: any) => s?.service_type?.service_type)
                      )
                    ).join(', ')}
                  </td>
                  <td>{vendorAvailbility(item, orderForm.request_survey)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Row>
    </>
  )
}
