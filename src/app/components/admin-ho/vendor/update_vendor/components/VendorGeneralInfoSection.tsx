import React from 'react'
import {Row, Col, Form, Badge} from 'react-bootstrap'
import Select from 'react-select'
import {
  StoreSelect,
  ServiceArea,
  ServiceAreaValues,
  ServiceType,
  ServiceTypeValues,
  CheckStates,
} from '../types'

interface VendorGeneralInfoSectionProps {
  userRole: string
  vendorId: string
  joinDate: string
  today: string
  handleChangeJoinDate: (e: React.ChangeEvent<HTMLInputElement>) => void
  vendorName: string
  handleChangeVendorName: (e: React.ChangeEvent<HTMLInputElement>) => void
  isActive: CheckStates
  picName: string
  handleChangeVendorPicName: (e: React.ChangeEvent<HTMLInputElement>) => void
  phoneNumberVendor: any
  handleChangeVendorPhoneNumber: (e: React.ChangeEvent<HTMLInputElement>) => void
  emailVendor: string
  handleChangeVendorEmail: (e: React.ChangeEvent<HTMLInputElement>) => void
  serviceArea: ServiceArea[]
  serviceAreaValues: ServiceAreaValues[]
  handleChangeServiceArea: (element: any) => void
  serviceType: ServiceType[]
  serviceTypeValues: ServiceTypeValues[]
  handleChangeServiceType: (element: any) => void
  store: StoreSelect[]
  storeValues: StoreSelect[]
  handleChangeStoreId: (element: any) => void
  animatedComponents: any
  vendorAddress: string
  handleChangeVendorAddress: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const VendorGeneralInfoSection: React.FC<VendorGeneralInfoSectionProps> = ({
  userRole,
  vendorId,
  joinDate,
  today,
  handleChangeJoinDate,
  vendorName,
  handleChangeVendorName,
  isActive,
  picName,
  handleChangeVendorPicName,
  phoneNumberVendor,
  handleChangeVendorPhoneNumber,
  emailVendor,
  handleChangeVendorEmail,
  serviceArea,
  serviceAreaValues,
  handleChangeServiceArea,
  serviceType,
  serviceTypeValues,
  handleChangeServiceType,
  store,
  storeValues,
  handleChangeStoreId,
  animatedComponents,
  vendorAddress,
  handleChangeVendorAddress,
}) => {
  const isVendorRole = ['Owner Vendor', 'Admin Vendor'].includes(userRole)

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
              <Form.Control
                type='date'
                onChange={handleChangeJoinDate}
                min={today}
                value={joinDate}
                readOnly={isVendorRole}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>
            Nama Perusahaan <Badge bg='primary'>{isActive.ptkp ? 'PKP' : 'Non-PKP'}</Badge>
          </Form.Label>

          <Form.Control
            type='text'
            onChange={handleChangeVendorName}
            value={vendorName}
            readOnly={isVendorRole}
          />
        </Form.Group>
      </Row>

      <Row className='form-body'>
        <Col>
          <Form.Group>
            <Form.Label>Nama PIC</Form.Label>

            <Form.Control
              type='text'
              value={picName}
              onChange={handleChangeVendorPicName}
              readOnly={isVendorRole}
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group>
            <Form.Label>Nomor HP / WA</Form.Label>

            <Form.Control
              type='text'
              onChange={handleChangeVendorPhoneNumber}
              value={phoneNumberVendor}
              readOnly={isVendorRole}
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
            readOnly={isVendorRole}
          />
        </Form.Group>
      </Row>

      {!isVendorRole && (
        <>
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
                  onChange={(element) => handleChangeServiceArea(element)}
                  value={serviceAreaValues}
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
                  onChange={(element) => handleChangeServiceType(element)}
                  value={serviceTypeValues}
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
                  value={storeValues}
                  onChange={(element) => handleChangeStoreId(element)}
                />
              </Form.Group>
            </Col>
          </Row>
        </>
      )}

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>Address</Form.Label>
          <Form.Control
            as='textarea'
            className='address-form'
            onChange={handleChangeVendorAddress}
            value={vendorAddress}
            readOnly={isVendorRole}
          />
        </Form.Group>
      </Row>
    </Col>
  )
}
