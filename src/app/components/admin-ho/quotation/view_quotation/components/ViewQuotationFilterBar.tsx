import React from 'react'
import {Row, FormGroup, Form, Button} from 'react-bootstrap'
import {DatePicker} from 'antd'
import Select, {SingleValue} from 'react-select'
import dayjs from 'dayjs'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {VendorItem} from '../types'

const {RangePicker} = DatePicker

interface ViewQuotationFilterBarProps {
  handleKeyPress: (event: React.KeyboardEvent<HTMLDivElement>) => void
  setDateFrom: (val: any) => void
  setDateTo: (val: any) => void
  handleChangeSearchFilter: (event: React.ChangeEvent<HTMLInputElement>) => void
  vendorOptions: VendorItem[]
  selectedVendor: SingleValue<VendorItem>
  setSelectedVendor: (val: SingleValue<VendorItem>) => void
  loadingButton: boolean
  handleSubmitFilter: () => void
}

export const ViewQuotationFilterBar: React.FC<ViewQuotationFilterBarProps> = ({
  handleKeyPress,
  setDateFrom,
  setDateTo,
  handleChangeSearchFilter,
  vendorOptions,
  selectedVendor,
  setSelectedVendor,
  loadingButton,
  handleSubmitFilter,
}) => {
  return (
    <Row className='table-head-wrapper'>
      <div
        className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'
        onKeyDown={handleKeyPress}
      >
        <h3 className='d-flex align-items-center fs-5 fw-normal'>Date</h3>

        <RangePicker
          format={'DD-MM-YYYY'}
          className='date-range'
          defaultValue={[dayjs().subtract(30, 'day'), dayjs()]}
          onChange={(values) => {
            if (values && values.length === 2) {
              const dateFromFormatted = values[0]?.format('YYYY-MM-DD')
              const dateToFormatted = values[1]?.format('YYYY-MM-DD')

              setDateFrom(dateFromFormatted)
              setDateTo(dateToFormatted)
            } else {
              setDateFrom(new Date().toISOString().split('T')[0])
              setDateTo(new Date().toISOString().split('T')[0])
            }
          }}
        />

        <div className='filter-search'>
          <FormGroup>
            <Form.Control
              placeholder='Search'
              className='filter-ltr'
              onChange={handleChangeSearchFilter}
            />

            <span className='search-icon'>
              <FontAwesomeIcon icon={faSearch} className='text-black' size='sm' />
            </span>
          </FormGroup>
        </div>

        <Select
          name='vendor_id'
          className='form-control w-50 p-0'
          classNamePrefix='select'
          placeholder='Pilih Vendor'
          isSearchable={true}
          isClearable={true}
          options={vendorOptions}
          value={selectedVendor}
          onChange={(newValue) => setSelectedVendor(newValue)}
        />

        <Button
          className='btn-dark-primary button-submit m-0'
          disabled={loadingButton}
          onClick={handleSubmitFilter}
        >
          {loadingButton ? 'Filtering..' : 'Submit'}
        </Button>
      </div>
    </Row>
  )
}
