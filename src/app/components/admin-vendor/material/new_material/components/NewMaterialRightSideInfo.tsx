import React, {FC} from 'react'
import {Form, Row, Col} from 'react-bootstrap'
import {formatDateWithTime} from '../../../../../../_metronic/helpers'

interface NewMaterialRightSideInfoProps {
  workOrderDetail: any
}

export const NewMaterialRightSideInfo: FC<NewMaterialRightSideInfoProps> = ({
  workOrderDetail,
}) => {
  const currentCategory = workOrderDetail?.work_order_status?.[0]?.status?.category

  const isSurveyCategory = [
    'SURVEYREQ',
    'TUKANGSURVEY',
    'SURVEYSTART',
    'SURVEYDONE',
    'RESURVEYREQ',
    'RESURVEYSTART',
    'RESURVEYDONE',
  ].includes(currentCategory)

  const isWorkCategory = [
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
  ].includes(currentCategory)

  return (
    <Col xxl={4} xl={4} md={4} sm={12}>
      <Form.Group as={Row} className='detail-info'>
        <Form.Label className='pt-3 fs-5 fw-semibold'>
          WORK ORDER STATUS :
          <span className='fw-bold'> {workOrderDetail?.order?.status?.description}</span>
        </Form.Label>
      </Form.Group>

      {isSurveyCategory && (
        <Row className='detail-info'>
          <div className='title'>
            <h1 className='fs-6'>Survey</h1>
          </div>

          <Form.Group className='detail-info'>
            <Form.Label className='fs-6'>Tanggal Survey</Form.Label>
            <Col sm='8'>
              <p className='fs-6'>{formatDateWithTime(workOrderDetail?.survey_date)}</p>
            </Col>
          </Form.Group>

          <Form.Group className='detail-info'>
            <Form.Label className='fs-6'>Tehnisi Survey</Form.Label>
            <Col sm='8'>
              <p>
                {Array.from(
                  new Set(
                    workOrderDetail?.work_order_tukang
                      ?.filter((x: any) => x.type === 1)
                      ?.map((x: any) => x?.tukang?.full_name ?? '-')
                  )
                ).join(', ')}
              </p>
            </Col>
          </Form.Group>

          <Form.Group className='detail-info'>
            <Form.Label>Sesi :</Form.Label>
            {workOrderDetail?.session !== null && workOrderDetail?.session !== undefined ? (
              <p>
                {workOrderDetail?.session === 1
                  ? 'Sesi Pagi'
                  : workOrderDetail?.session === 2
                  ? 'Sesi Siang'
                  : workOrderDetail?.session === 3
                  ? 'Sesi Sore'
                  : 'Sesi belum ditentukan oleh vendor'}
              </p>
            ) : (
              <p>Sesi belum diset oleh vendor</p>
            )}
          </Form.Group>
        </Row>
      )}

      {isWorkCategory && (
        <Row className='detail-info'>
          <div className='title'>
            <h1 className='fs-6'>Pengerjaan</h1>
          </div>

          <Form.Group className='detail-info'>
            <Form.Label className='fs-6'>Tanggal Mulai dan Selesai Pekerjaan</Form.Label>
            <Col sm='8'>
              <p className='fs-6 fw-bold'>
                {formatDateWithTime(workOrderDetail?.work_start_date)} sampai{' '}
                {formatDateWithTime(workOrderDetail?.work_end_date)}
              </p>
            </Col>
          </Form.Group>

          <Form.Group className='detail-info'>
            <Form.Label className='fs-6'>Tehnisi Pengerjaan</Form.Label>
            <Col sm='8'>
              <p className='fs-6 fw-bold'>
                {Array.from(
                  new Set(
                    workOrderDetail?.work_order_tukang
                      ?.filter((x: any) => x.type === 2)
                      ?.map((x: any) => x?.tukang?.full_name ?? '-')
                  )
                ).join(', ')}
              </p>
            </Col>
          </Form.Group>

          <Form.Group className='detail-info'>
            <Form.Label>Sesi :</Form.Label>
            {workOrderDetail?.session !== null && workOrderDetail?.session !== undefined ? (
              <p>
                {workOrderDetail?.session === 1
                  ? 'Sesi Pagi'
                  : workOrderDetail?.session === 2
                  ? 'Sesi Siang'
                  : workOrderDetail?.session === 3
                  ? 'Sesi Sore'
                  : 'Sesi belum ditentukan oleh vendor'}
              </p>
            ) : (
              <p>Sesi belum diset oleh vendor</p>
            )}
          </Form.Group>
        </Row>
      )}
    </Col>
  )
}
