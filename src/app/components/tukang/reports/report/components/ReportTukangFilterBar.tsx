import React from 'react'
import dayjs from 'dayjs'
import {DatePicker} from 'antd'
import {Row, Col, Button} from 'react-bootstrap'
import {formatCustomDate} from '../utils/dataMapper'

const {RangePicker} = DatePicker

interface ReportTukangFilterBarProps {
  loadingButton: boolean
  setDateFrom: (date: string) => void
  setDateTo: (date: string) => void
  handleSubmitFilter: () => void
}

export const ReportTukangFilterBar: React.FC<ReportTukangFilterBarProps> = ({
  loadingButton,
  setDateFrom,
  setDateTo,
  handleSubmitFilter,
}) => {
  const today = new Date()

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSubmitFilter()
    }
  }

  return (
    <Row className='mb-5'>
      <Col xxl={4} xl={4} lg={12}>
        <Row>
          <Col
            xxl={4}
            xl={4}
            lg={4}
            className='d-flex align-items-center'
            onKeyDown={handleKeyPress}
          >
            <h3 className='title-header fs-5 fw-normal'>Pilih rentang waktu</h3>
          </Col>

          <Col xxl={8} xl={8} lg={8}>
            <RangePicker
              format={'DD-MM-YYYY'}
              className='date-range w-100'
              defaultValue={[
                dayjs(`${formatCustomDate(today)}`, 'DD-MM-YYYY'),
                dayjs(`${formatCustomDate(today)}`, 'DD-MM-YYYY'),
              ]}
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
          </Col>
        </Row>
      </Col>

      <Col xxl={4} xl={4} lg={12}>
        <Button
          className='btn-dark-primary button-submit'
          disabled={loadingButton}
          onClick={handleSubmitFilter}
        >
          {loadingButton ? 'Filtering..' : 'Submit'}
        </Button>
      </Col>

      <Col xxl={4} xl={4} lg={12}></Col>
    </Row>
  )
}
