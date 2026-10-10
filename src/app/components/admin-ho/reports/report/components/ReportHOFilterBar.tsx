import React from 'react'
import dayjs from 'dayjs'
import Select from 'react-select'
import {DatePicker} from 'antd'
import {Row, Col, Button} from 'react-bootstrap'
import {StoreItem, AreaItem} from '../types'

const {RangePicker} = DatePicker

interface ReportHOFilterBarProps {
  storeOptions: StoreItem[]
  selectedStore: any
  onStoreChange: (val: any) => void
  zoneOptions: AreaItem[]
  selectedZone: any
  onZoneChange: (val: any) => void
  loadingButton: boolean
  onSubmitFilter: () => void
  onDateChange: (from: string, to: string) => void
}

export const ReportHOFilterBar: React.FC<ReportHOFilterBarProps> = ({
  storeOptions,
  selectedStore,
  onStoreChange,
  zoneOptions,
  selectedZone,
  onZoneChange,
  loadingButton,
  onSubmitFilter,
  onDateChange,
}) => {
  return (
    <Row className='mb-5'>
      <Col xxl={4} xl={4} sm={12}>
        <Row>
          <Col xxl={4} xl={4} lg={4} className='d-flex align-items-center'>
            <h3 className='title-header fs-5 fw-normal'>Pilih rentang waktu</h3>
          </Col>

          <Col xxl={8} xl={8} lg={8}>
            <RangePicker
              format={'DD-MM-YYYY'}
              className='date-range w-100'
              defaultValue={[dayjs().subtract(30, 'day'), dayjs()]}
              onChange={(values) => {
                if (values && values.length === 2) {
                  const dateFromFormatted = values[0]?.format('YYYY-MM-DD') ?? ''
                  const dateToFormatted = values[1]?.format('YYYY-MM-DD') ?? ''
                  onDateChange(dateFromFormatted, dateToFormatted)
                } else {
                  onDateChange('', '')
                }
              }}
            />
          </Col>
        </Row>
      </Col>

      <Col xxl={3} xl={3} sm={12}>
        <Row>
          <Col xxl={4} xl={4} lg={12} className='d-flex align-items-center'>
            <h3 className='title-header fs-5 fw-normal'>Lihat Store Dashboard</h3>
          </Col>

          <Col xxl={8} xl={8} lg={12}>
            <div className='d-flex'>
              <Select
                name='store_id'
                className='form-control p-0'
                classNamePrefix='select'
                placeholder='Pilih Toko'
                isSearchable={true}
                options={storeOptions}
                value={selectedStore}
                onChange={onStoreChange}
              />
            </div>
          </Col>
        </Row>
      </Col>

      <Col xxl={3} xl={3} sm={12}>
        <Row>
          <Col xxl={4} xl={4} lg={12} className='d-flex align-items-center'>
            <h3 className='title-header fs-5 fw-normal'>Pilih Zona</h3>
          </Col>

          <Col xxl={8} xl={8} lg={12}>
            <div className='d-flex'>
              <Select
                name='province_id'
                className='form-control p-0'
                classNamePrefix='select'
                placeholder='Pilih Zona'
                isSearchable={true}
                options={zoneOptions}
                value={selectedZone}
                onChange={onZoneChange}
              />
            </div>
          </Col>
        </Row>
      </Col>

      <Col xxl={2} xl={2} sm={12}>
        <Button
          className='btn-dark-primary button-submit'
          disabled={loadingButton}
          onClick={onSubmitFilter}
        >
          {loadingButton ? 'Filtering..' : 'Submit'}
        </Button>
      </Col>
    </Row>
  )
}
