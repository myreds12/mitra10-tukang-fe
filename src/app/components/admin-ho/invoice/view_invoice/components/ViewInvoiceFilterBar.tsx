import React from 'react'
import {Row, Button, FormGroup, Form} from 'react-bootstrap'
import {DatePicker} from 'antd'
import Select, {SingleValue} from 'react-select'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import dayjs from 'dayjs'
import {VendorItem} from '../types'

const {RangePicker} = DatePicker

interface ViewInvoiceFilterBarProps {
  exportTemplate: () => void
  loadingTemplate: boolean
  handleKeyPress: (event: React.KeyboardEvent<HTMLDivElement>) => void
  handleDateChange: (values: any) => void
  handleChangeSearchFilter: (e: React.ChangeEvent<HTMLInputElement>) => void
  vendorOptions: VendorItem[]
  selectedVendor: SingleValue<VendorItem>
  handleVendorChange: (newValue: SingleValue<VendorItem>) => void
  loadingButton: boolean
  handleSubmitFilter: () => void
}

export const ViewInvoiceFilterBar: React.FC<ViewInvoiceFilterBarProps> = ({
  exportTemplate,
  loadingTemplate,
  handleKeyPress,
  handleDateChange,
  handleChangeSearchFilter,
  vendorOptions,
  selectedVendor,
  handleVendorChange,
  loadingButton,
  handleSubmitFilter,
}) => {
  return (
    <>
      <div className='d-flex justify-content-end align-items-center gap-3 mb-5'>
        <button className='button-export' onClick={exportTemplate}>
          <h3 className='fs-5 fw-semibold'>
            {loadingTemplate ? 'Exporting..' : 'Export Excel'}
          </h3>
        </button>
      </div>

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
            onChange={handleDateChange}
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
            onChange={handleVendorChange}
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
    </>
  )
}
