import React from 'react'
import dayjs, {Dayjs} from 'dayjs'
import Select, {SingleValue} from 'react-select'
import {Button, Form, FormGroup, Row} from 'react-bootstrap'
import {DatePicker} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from '@fortawesome/free-solid-svg-icons'

const {RangePicker} = DatePicker as any

export interface OrderFilterOption {
  value: number | null
  label: string
}

interface OrderFilterToolbarProps {
  userRole: string
  dateFrom: string
  dateTo: string
  searchFilter: string
  selectedStore: OrderFilterOption
  selectedVendor: OrderFilterOption
  storeOptions: OrderFilterOption[]
  vendorOptions: OrderFilterOption[]
  loading: boolean
  onKeyPress: (event: React.KeyboardEvent<HTMLDivElement>) => void
  onDateChange: (values: [Dayjs | null, Dayjs | null] | null) => void
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onStoreChange: (value: SingleValue<OrderFilterOption>) => void
  onVendorChange: (value: SingleValue<OrderFilterOption>) => void
  onSubmit: () => void
}

const OrderFilterToolbar: React.FC<OrderFilterToolbarProps> = ({
  userRole,
  dateFrom,
  dateTo,
  searchFilter,
  selectedStore,
  selectedVendor,
  storeOptions,
  vendorOptions,
  loading,
  onKeyPress,
  onDateChange,
  onSearchChange,
  onStoreChange,
  onVendorChange,
  onSubmit,
}) => (
  <Row className='table-head-wrapper'>
    <div
      className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'
      onKeyDown={onKeyPress}
    >
      <h3 className='d-flex align-items-center fs-5 fw-normal'>Date</h3>

      <RangePicker
        format='DD-MM-YYYY'
        className='date-range'
        value={[
          dateFrom ? dayjs(dateFrom, 'YYYY-MM-DD') : null,
          dateTo ? dayjs(dateTo, 'YYYY-MM-DD') : null,
        ]}
        onChange={onDateChange}
      />

      <div className='filter-search'>
        <FormGroup>
          <Form.Control
            placeholder='Search'
            className='filter-ltr'
            value={searchFilter ?? ''}
            onChange={onSearchChange}
          />
          <span className='search-icon'>
            <FontAwesomeIcon icon={faSearch} className='text-black' size='sm' />
          </span>
        </FormGroup>
      </div>

      {['Super User', 'Admin HO'].includes(userRole) && (
        <Select
          name='store_id'
          className='form-control p-0 w-25'
          classNamePrefix='select'
          placeholder='Pilih Toko'
          isSearchable
          options={storeOptions}
          value={selectedStore}
          onChange={onStoreChange}
        />
      )}

      {['Super User', 'Admin HO'].includes(userRole) && (
        <Select
          name='vendor_id'
          className='form-control p-0 w-25'
          classNamePrefix='select'
          placeholder='Pilih Vendor'
          isSearchable
          options={vendorOptions}
          value={selectedVendor}
          onChange={onVendorChange}
        />
      )}

      <Button className='btn-dark-primary button-submit m-0' disabled={loading} onClick={onSubmit}>
        {loading ? 'Filtering..' : 'Submit'}
      </Button>
    </div>
  </Row>
)

export default OrderFilterToolbar
