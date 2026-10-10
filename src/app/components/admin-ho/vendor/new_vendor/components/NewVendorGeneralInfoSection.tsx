import React from 'react'
import {Row, Col, Form, Badge} from 'react-bootstrap'
import Select from 'react-select'
import {CheckStates, ServiceArea, ServiceType, StoreSelect} from '../types'

interface NewVendorGeneralInfoSectionProps {
  vendorId: string
  today: string
  handleChangeJoinDate: (event: React.ChangeEvent<HTMLInputElement>) => void
  isActive: CheckStates
  vendorName: string
  handleChangeVendorName: (event: React.ChangeEvent<HTMLInputElement>) => void
  picName: string
  handleChangePicName: (event: React.ChangeEvent<HTMLInputElement>) => void
  phoneNumberVendor: any
  handleChangeVendorPhoneNumber: (event: React.ChangeEvent<HTMLInputElement>) => void
  emailVendor: string
  handleChangeVendorEmail: (event: React.ChangeEvent<HTMLInputElement>) => void
  animatedComponents: any
  serviceArea: ServiceArea[]
  handleChangeServiceAreaId: (element: any) => void
  serviceType: ServiceType[]
  handleChangeServiceTypeId: (element: any) => void
  store: StoreSelect[]
  handleChangeStoreId: (element: any) => void
  vendorAddress: any
  handleChangeVendorAddress: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const NewVendorGeneralInfoSection: React.FC<NewVendorGeneralInfoSectionProps> = ({
  vendorId,
  today,
  handleChangeJoinDate,
  isActive,
  vendorName,
  handleChangeVendorName,
  picName,
  handleChangePicName,
  phoneNumberVendor,
  handleChangeVendorPhoneNumber,
  emailVendor,
  handleChangeVendorEmail,
  animatedComponents,
  serviceArea,
  handleChangeServiceAreaId,
  serviceType,
  handleChangeServiceTypeId,
  store,
  handleChangeStoreId,
  vendorAddress,
  handleChangeVendorAddress,
}) => {
  return (
    <Col xxl={6} xl={6} lg={12} md={12}>
      <Row className='header-body'>
        <Col>
          <Form.Group as={Row}>
            <Form.Label column sm='4'>
              Vendor ID
            </Form.Label>

            <Col sm='8'>
              <Form.Control readOnly value={vendorId} />
            </Col>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group as={Row}>
            <Form.Label column sm='4'>
              Join Date
            </Form.Label>

            <Col sm='8'>
              <Form.Control type='date' onChange={handleChangeJoinDate} min={today} />
            </Col>
          </Form.Group>
        </Col>
      </Row>

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>
            Nama Perusahaan <Badge bg='primary'>{isActive.ptkp ? 'PKP' : 'Non-PKP'}</Badge>
          </Form.Label>

          <Form.Control type='text' onChange={handleChangeVendorName} value={vendorName} />
        </Form.Group>
      </Row>

      <Row className='form-body'>
        <Col>
          <Form.Group>
            <Form.Label>Nama PIC</Form.Label>

            <Form.Control type='text' onChange={handleChangePicName} value={picName} />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Nomor HP / WA</Form.Label>

            <Form.Control
              type='text'
              onChange={handleChangeVendorPhoneNumber}
              value={phoneNumberVendor}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>Email</Form.Label>

          <Form.Control
            type='email'
            onChange={handleChangeVendorEmail}
            value={emailVendor}
          />
        </Form.Group>
      </Row>

      <Row className='form-body'>
        <Col>
          <Form.Group>
            <Form.Label>Service Area</Form.Label>

            <Select
              classNamePrefix='select'
              placeholder='Pilih Service Area'
              isSearchable={true}
              isMulti
              closeMenuOnSelect={false}
              components={animatedComponents}
              options={serviceArea}
              onChange={(element) => handleChangeServiceAreaId(element)}
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Service Type</Form.Label>

            <Select
              classNamePrefix='select'
              placeholder='Pilih Service Type'
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={serviceType}
              onChange={(element) => handleChangeServiceTypeId(element)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='form-body'>
        <Col>
          <Form.Group>
            <Form.Label>Assign To Store</Form.Label>

            <Select
              classNamePrefix='select'
              placeholder='Pilih Toko'
              isSearchable={true}
              isMulti
              closeMenuOnSelect={false}
              components={animatedComponents}
              options={store}
              onChange={(element) => handleChangeStoreId(element)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>Address</Form.Label>
          <Form.Control
            as='textarea'
            className='address-form'
            onChange={handleChangeVendorAddress}
            value={vendorAddress}
          />
        </Form.Group>
      </Row>
    </Col>
  )
}
