import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select from 'react-select'
import {DatePicker} from 'antd'
import dayjs from 'dayjs'
import {
  formatDateWithTime,
  disableDateBeforeToday,
  getDisabledHours,
} from '../../../../../../_metronic/helpers'
import {WorkOrder, WorkOrderTukang} from '../../../../../interfaces/work-order'
import {SessionOption} from '../types'

const {RangePicker} = DatePicker

interface WorkOrderScheduleSectionProps {
  orderDetail: any
  sessionOptions: SessionOption[]
  selectedSession: any
  setSelectedSession: (val: any) => void
  workOrder: WorkOrder
  setWorkOrder: React.Dispatch<React.SetStateAction<WorkOrder>>
  tukang: WorkOrderTukang[]
  tukangHandler: (selectedOptions: any, field: string) => void
  setSearchTukang: (val: string) => void
  animatedComponents: any
}

export const WorkOrderScheduleSection: React.FC<WorkOrderScheduleSectionProps> = ({
  orderDetail,
  sessionOptions,
  selectedSession,
  setSelectedSession,
  workOrder,
  setWorkOrder,
  tukang,
  tukangHandler,
  setSearchTukang,
  animatedComponents,
}) => {
  return (
    <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12} className='sales-info mb-5'>
      <Row>
        {[
          'SURVEYREQ',
          'TUKANGSURVEY',
          'SURVEYSTART',
          'SURVEYDONE',
          'RESURVEYREQ',
          'RESURVEYSTART',
          'RESURVEYDONE',
          'RESCHEDULE',
        ].includes(orderDetail?.status?.category) && (
          <Col>
            <div className='survey mb-3'>
              <div className='fs-4 fw-bold'>Survey</div>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Sesi :</Form.Label>

                <Select
                  name='session_id'
                  className='form-control p-0'
                  classNamePrefix='select'
                  placeholder='Pilih Sesi'
                  isSearchable={true}
                  options={sessionOptions}
                  value={{
                    value: selectedSession?.value ?? null,
                    label: selectedSession?.label ?? 'Pilih Sesi',
                  }}
                  onChange={(newValue) => setSelectedSession(newValue)}
                />
              </Form.Group>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Tanggal Survey :</Form.Label>

                {orderDetail?.status?.category !== 'SURVEYDONE' ? (
                  <DatePicker
                    showTime={{
                      format: 'HH:mm',
                      hideDisabledOptions: true,
                      disabledHours: () => getDisabledHours(selectedSession.label),
                    }}
                    className='date-range w-100'
                    format='DD-MM-YYYY HH:mm'
                    disabledDate={disableDateBeforeToday}
                    value={
                      workOrder.survey_date
                        ? dayjs(workOrder.survey_date, 'YYYY-MM-DD HH:mm')
                        : null
                    }
                    onChange={(value) => {
                      const surveyDate = value ? value.format('YYYY-MM-DDTHH:mm') : ''
                      setWorkOrder((prev) => ({
                        ...prev,
                        survey_date: surveyDate,
                      }))
                    }}
                  />
                ) : (
                  <p>{formatDateWithTime(orderDetail?.work_orders?.survey_date)}</p>
                )}
              </Form.Group>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Nama Lengkap Teknisi :</Form.Label>

                <Select
                  classNamePrefix='select'
                  placeholder='Pilih Teknisi'
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  isMulti
                  options={tukang}
                  getOptionLabel={(option) => `${option.tukang_name}`}
                  getOptionValue={(option) => `${option.tukang_id}`}
                  value={workOrder.tukang_id.filter((x) => x.type === 1)}
                  onChange={(e) => tukangHandler(e, 'survey_tukang_id')}
                  onInputChange={(newValue) => setSearchTukang(newValue)}
                />
              </Form.Group>
            </div>
          </Col>
        )}

        {[
          'WORKREQ',
          'TUKANGWORK',
          'WORKSTART',
          'WORKEND',
          'REWORKREQ',
          'REWORKSTART',
          'REWORKEND',
          'RESCHEDULE',
          'DONE',
          'WORKREQSTEPONE',
          'WORKREQSTEPTWO',
          'WORKREQSTEPTHREE',
          'WORKSTARTSTEPONE',
          'WORKSTARTSTEPTWO',
          'WORKSTARTSTEPTHREE',
          'WORKENDSTEPONE',
          'WORKENDSTEPTWO',
          'WORKENDSTEPTHREE',
          'TUKANGWORKSTEPONE',
          'TUKANGWORKSTEPTWO',
          'TUKANGWORKSTEPTHREE',
        ].includes(orderDetail?.status?.category) && (
          <Col>
            <div className='work-date'>
              <div className='fs-4 fw-bold'>Pengerjaan</div>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Sesi :</Form.Label>

                <Select
                  name='session_id'
                  className='form-control p-0'
                  classNamePrefix='select'
                  placeholder='Pilih Sesi'
                  isSearchable={true}
                  options={sessionOptions}
                  value={{
                    value: selectedSession?.value ?? null,
                    label: selectedSession?.label ?? '',
                  }}
                  onChange={(newValue) => setSelectedSession(newValue)}
                />
              </Form.Group>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Tanggal mulai pengerjaan :</Form.Label>

                {orderDetail?.status?.category !== 'WORKEND' ? (
                  <RangePicker
                    showTime={{
                      format: 'HH:mm',
                      hideDisabledOptions: true,
                      disabledHours: () => getDisabledHours(selectedSession.label),
                    }}
                    className='date-range w-100'
                    format='DD-MM-YYYY HH:mm'
                    disabledDate={disableDateBeforeToday}
                    value={
                      (workOrder.work_start_date &&
                        workOrder.work_end_date && [
                          dayjs(workOrder.work_start_date, 'YYYY-MM-DD HH:mm'),
                          dayjs(workOrder.work_end_date, 'YYYY-MM-DD HH:mm'),
                        ]) ||
                      undefined
                    }
                    onChange={(values) => {
                      if (values && values.length === 2) {
                        const dateFromFormatted =
                          values[0]?.format('YYYY-MM-DDTHH:mm') || ''
                        const dateToFormatted =
                          values[1]?.format('YYYY-MM-DDTHH:mm') || ''

                        setWorkOrder((prev) => ({
                          ...prev,
                          work_start_date: dateFromFormatted,
                          work_end_date: dateToFormatted,
                        }))
                      } else {
                        setWorkOrder({
                          id: null,
                          order_id: null,
                          vendor_id: null,
                          session: null,
                          tukang_id: [],
                          request_work_time: '',
                          survey_date: '',
                          work_order_status: null,
                          complaint_status: null,
                          work_start_date: '',
                          work_end_date: '',
                          work_order_item: [],
                        })
                      }
                    }}
                  />
                ) : (
                  <p>
                    {formatDateWithTime(orderDetail?.work_orders?.work_start_date)} sampai{' '}
                    {formatDateWithTime(orderDetail?.work_orders?.work_end_date)}
                  </p>
                )}
              </Form.Group>

              <Form.Group className='detail-info mb-3'>
                <Form.Label>Nama Lengkap Teknisi :</Form.Label>

                <Select
                  classNamePrefix='select'
                  placeholder='Pilih Teknisi'
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  isMulti
                  options={tukang}
                  getOptionLabel={(option) => `${option.tukang_name}`}
                  getOptionValue={(option) => `${option.tukang_id}`}
                  value={workOrder.tukang_id.filter((x) => x.type === 2)}
                  onChange={(e) => tukangHandler(e, 'work_tukang_id')}
                  onInputChange={(newValue) => setSearchTukang(newValue)}
                />
              </Form.Group>
            </div>
          </Col>
        )}
      </Row>
    </Col>
  )
}
