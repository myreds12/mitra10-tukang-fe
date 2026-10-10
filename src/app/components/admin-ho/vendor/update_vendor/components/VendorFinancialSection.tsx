import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select from 'react-select'
import {Bank} from '../types'

interface VendorFinancialSectionProps {
  userRole: string
  bank: Bank[]
  bankId: any
  bankName: string
  handleChangeSelectBank: (element: Bank | null) => void
  accountNumber: any
  handleChangeAccountNumber: (e: React.ChangeEvent<HTMLInputElement>) => void
  accountName: string
  handleChangeAccountName: (e: React.ChangeEvent<HTMLInputElement>) => void
  marginType: number
  handleMarginTypeChange: (type: number) => void
  marginNominal: any
  handleChangeMargin: (e: React.ChangeEvent<HTMLInputElement>) => void
  maxOrder: string
  handleChangeMaxOrder: (e: React.ChangeEvent<HTMLInputElement>) => void
  nominalSurvey: any
  handleChangeNominalSurvey: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const VendorFinancialSection: React.FC<VendorFinancialSectionProps> = ({
  userRole,
  bank,
  bankId,
  bankName,
  handleChangeSelectBank,
  accountNumber,
  handleChangeAccountNumber,
  accountName,
  handleChangeAccountName,
  marginType,
  handleMarginTypeChange,
  marginNominal,
  handleChangeMargin,
  maxOrder,
  handleChangeMaxOrder,
  nominalSurvey,
  handleChangeNominalSurvey,
}) => {
  const isVendorRole = ['Owner Vendor', 'Admin Vendor'].includes(userRole)

  return (
    <Col xxl={3} xl={3} lg={12} md={12}>
      <Row className='header-body' />

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>Nama Bank</Form.Label>

          <Select
            classNamePrefix='select'
            placeholder='Pilih Nama Bank'
            isSearchable={true}
            options={bank}
            onChange={(element) => handleChangeSelectBank(element)}
            value={{
              value: bankId,
              label: bankName,
            }}
          />
        </Form.Group>
      </Row>

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>Nomor Account</Form.Label>

          <Form.Control
            type='number'
            onChange={handleChangeAccountNumber}
            value={accountNumber}
          />
        </Form.Group>
      </Row>

      <Row className='form-body'>
        <Form.Group>
          <Form.Label>Nama Pemilik Account</Form.Label>

          <Form.Control
            type='text'
            onChange={handleChangeAccountName}
            value={accountName}
          />
        </Form.Group>
      </Row>

      {!isVendorRole && (
        <>
          <Row className='form-body'>
            <Form.Group>
              <div className='d-flex justify-content-between'>
                <Form.Label>Margin Vendor</Form.Label>

                <div className='form-check-request'>
                  <Form.Check
                    inline
                    id='rupiah-percentage'
                    label='Rp'
                    name='margin_type'
                    type='radio'
                    checked={marginType === 2}
                    onChange={() => handleMarginTypeChange(2)}
                  />

                  <Form.Check
                    inline
                    id='radio-percentage'
                    label='%'
                    name='margin_type'
                    type='radio'
                    checked={marginType === 1}
                    onChange={() => handleMarginTypeChange(1)}
                  />
                </div>
              </div>

              <Form.Control
                type='number'
                onChange={handleChangeMargin}
                value={marginNominal}
              />
            </Form.Group>
          </Row>

          <Row className='form-body'>
            <Form.Group>
              <Form.Label>Maksimal Order Tukang</Form.Label>

              <Form.Control
                min={3}
                type='number'
                onChange={handleChangeMaxOrder}
                value={maxOrder}
              />
            </Form.Group>
          </Row>

          <Row className='form-body'>
            <Form.Group>
              <Form.Label>Nominal Survey</Form.Label>

              <Form.Control
                type='number'
                onChange={handleChangeNominalSurvey}
                value={nominalSurvey}
              />
            </Form.Group>
          </Row>
        </>
      )}
    </Col>
  )
}
