import React from 'react'
import dayjs from 'dayjs'
import {DatePicker} from 'antd'
import {Row, Button} from 'react-bootstrap'

const {RangePicker} = DatePicker

interface ReportVendorFilterBarProps {
  loadingButton: boolean
  setDateFrom: (date: string) => void
  setDateTo: (date: string) => void
  handleSubmitFilter: () => void
}

export const ReportVendorFilterBar: React.FC<ReportVendorFilterBarProps> = ({
  loadingButton,
  setDateFrom,
  setDateTo,
  handleSubmitFilter,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  return (
    <Row className='table-head-wrapper mb-5'>
      <div
        className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-start gap-3'
        onKeyDown={handleKeyPress}
      >
        <h3 className='d-flex align-items-center fs-5 fw-normal'>Pilih rentang waktu</h3>

        <RangePicker
          format={'DD-MM-YYYY'}
          className='date-range'
          defaultValue={[dayjs().subtract(30, 'day'), dayjs()]}
          onChange={(values) => {
            if (values && values.length === 2) {
              const dateFromFormatted = values[0]?.format('YYYY-MM-DD') ?? ''
              const dateToFormatted = values[1]?.format('YYYY-MM-DD') ?? ''

              setDateFrom(dateFromFormatted)
              setDateTo(dateToFormatted)
            } else {
              setDateFrom(new Date().toISOString().split('T')[0])
              setDateTo(new Date().toISOString().split('T')[0])
            }
          }}
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
