import React from 'react'
import {Row, Col, Form, Table} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {VendorSelect, Order} from '../types'

interface OrderVendorSectionProps {
  selectedVendor: SingleValue<VendorSelect>
  setSelectedVendor: (v: any) => void
  vendorSelect: VendorSelect[]
  setSearchVendor: (v: string) => void
  orderForm: Order
  orderFormHandler: (e: any) => void
  today: string
  vendor: any[]
  vendorAvailbility: (data: any, requestSurvey: string) => React.ReactNode
}

export const OrderVendorSection: React.FC<OrderVendorSectionProps> = ({
  selectedVendor,
  setSelectedVendor,
  vendorSelect,
  setSearchVendor,
  orderForm,
  orderFormHandler,
  today,
  vendor,
  vendorAvailbility,
}) => {
  return (
    <>
      <Row className='table-order-header d-flex align-items-center mb-5'>
        <Col xs={12} md={3} lg={3} xl={3} xxl={3} className='request-date order-md-2 order-sm-1'>
          <Form.Group>
            <Form.Label>Nama Vendor :</Form.Label>
            <Select
              name='vendor'
              id='vendor'
              className='form-control p-0 form-item-name'
              classNamePrefix='select'
              placeholder='Pilih/Ketik Nama Vendor'
              isSearchable={true}
              isClearable={true}
              value={selectedVendor && selectedVendor.value ? selectedVendor : null}
              options={vendorSelect}
              onChange={(newValue) => setSelectedVendor(newValue)}
              onInputChange={(newValue) => setSearchVendor(newValue)}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={3} lg={3} xl={3} xxl={3} className='request-date order-md-1 order-sm-2'>
          <Form.Group>
            <Form.Label>Tanggal Request</Form.Label>
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

        <Col xs={12} md={3} lg={3} xl={3} xxl={3} className='order-status order-md-3 order-sm-4'>
          <h1 className='fs-3 fw-bold'>
            ORDER STATUS : <span className='fw-bold text-success'>BOOKED</span>
          </h1>
        </Col>

        <Col
          xs={12}
          md={3}
          lg={3}
          xl={3}
          xxl={3}
          className='button-add text-end order-md-4'
        ></Col>
      </Row>

      <Row className='mb-5'>
        <div className='description fs-7 mb-2'>Informasi mengenai ketersediaan dari Vendor</div>

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
