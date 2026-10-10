import React, {FC} from 'react'
import {Form, Row, Col} from 'react-bootstrap'
import Select, {SingleValue} from 'react-select'
import {WorkOrderSelect} from '../types'
import {NewMaterialEvidenceSection} from './NewMaterialEvidenceSection'

interface NewMaterialHeaderInfoProps {
  apiUrl?: string
  workOrderDetail: any
  workOrderOption: WorkOrderSelect[]
  selectedWorkOrderId: SingleValue<WorkOrderSelect>
  setSelectedWorkOrderId: (newValue: SingleValue<WorkOrderSelect>) => void
  description: string
  onDescriptionChange: (val: string) => void
  workOrderBefore: Array<File | null | any>
  setWorkOrderBefore: React.Dispatch<React.SetStateAction<Array<File | null | any>>>
  workOrderAfter: Array<File | null | any>
  setWorkOrderAfter: React.Dispatch<React.SetStateAction<Array<File | null | any>>>
}

export const NewMaterialHeaderInfo: FC<NewMaterialHeaderInfoProps> = ({
  apiUrl,
  workOrderDetail,
  workOrderOption,
  selectedWorkOrderId,
  setSelectedWorkOrderId,
  description,
  onDescriptionChange,
  workOrderBefore,
  setWorkOrderBefore,
  workOrderAfter,
  setWorkOrderAfter,
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
    'REWORKSTART',
    'REWORKEND',
    'WORKDONE',
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
    <Col xxl={8} xl={8} md={8} sm={12}>
      <Row>
        <Col xxl={6} xl={6} md={6} sm={12}>
          <Form.Group className='detail-info' as={Row}>
            <Form.Label className='fs-7' column md='4'>
              Nama Toko
            </Form.Label>
            <Col md='8' className='d-flex align-items-center'>
              <p className='fs-7 fw-semibold'>
                {workOrderDetail?.order?.store?.store_name ?? ''}
              </p>
            </Col>
          </Form.Group>
        </Col>

        <Col xxl={6} xl={6} md={6} sm={12}>
          <Form.Group className='detail-info' as={Row}>
            <Form.Label className='fs-7' column md='4'>
              Nama Vendor
            </Form.Label>
            <Col md='8' className='d-flex align-items-center'>
              <p className='fs-7 fw-semibold'>
                {workOrderDetail?.vendor?.company_name ?? ''}
              </p>
            </Col>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col xxl={6} xl={6} md={6} sm={12}>
          <Form.Group className='detail-info' as={Row}>
            <Form.Label className='fs-7' column md='4'>
              Order ID
            </Form.Label>
            <Col md='8'>
              <Form.Control readOnly value={workOrderDetail?.order_id ?? ''} />
            </Col>
          </Form.Group>

          <Row className='detail-info'>
            <Col md={4}>
              <div className='title'>
                <h1 className='fs-6'>Customer Info</h1>
              </div>
            </Col>
            <Col md={8} className='mt-5'>
              <div className='detail-info'>
                <p className='fs-7 fw-bold '>
                  {workOrderDetail?.order?.members?.full_name ?? ''}
                </p>
                <p className='fs-7'> {workOrderDetail?.order?.project_number ?? ''}</p>
                <p className='fs-7'>{workOrderDetail?.order?.members?.email ?? ''}</p>
                <p className='fs-7'>{workOrderDetail?.order?.project_address ?? ''}</p>
              </div>
            </Col>
          </Row>

          <Row className='detail-info'>
            <Col md={4}>
              <div className='title'>
                <h1 className='fs-6'>Catatan Toko</h1>
              </div>
            </Col>
            <Col md={8} className='mt-5'>
              <div className='detail-info'>
                <p className='fs-7 fw-normal '>
                  {workOrderDetail?.order?.notes ?? 'Toko tidak memberikan catatan'}
                </p>
              </div>
            </Col>
          </Row>
        </Col>

        <Col xxl={6} xl={6} md={6} sm={12}>
          <Form.Group className='detail-info' as={Row}>
            <Form.Label className='fs-7' column sm='4'>
              Work Order ID
            </Form.Label>
            <Col sm='8'>
              <Select
                name='work-order-id'
                className='form-control p-0'
                classNamePrefix='select'
                isSearchable={true}
                isClearable={true}
                placeholder='Pilih Work Order'
                options={workOrderOption}
                value={selectedWorkOrderId}
                onChange={(newValue) => setSelectedWorkOrderId(newValue)}
              />
            </Col>
          </Form.Group>

          <Row className='detail-info'>
            <Col md={4}>
              <div className='title'>
                <h1 className='fs-6'>Work Order Info</h1>
              </div>
            </Col>
            <Col md={8} className='mt-5'>
              <div className='detail-info'>
                {isSurveyCategory && (
                  <>
                    {workOrderDetail?.order?.m_order_details?.map(
                      (item: any, index: number) => (
                        <p key={`${index}-work_order_tukang`} className='fs-7'>
                          {item?.item_notes ?? '-'}
                        </p>
                      )
                    )}
                  </>
                )}

                {isWorkCategory && (
                  <>
                    {workOrderDetail?.work_order_status[0]?.work_order_items.map(
                      (item: any, index: number) => (
                        <p key={`${index}-work_order_tukang`} className='fs-7'>
                          {item?.name ?? '-'}
                        </p>
                      )
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>

          <Row className='detail-info'>
            <NewMaterialEvidenceSection
              apiUrl={apiUrl}
              workOrderDetail={workOrderDetail}
              workOrderBefore={workOrderBefore}
              setWorkOrderBefore={setWorkOrderBefore}
              workOrderAfter={workOrderAfter}
              setWorkOrderAfter={setWorkOrderAfter}
            />
          </Row>
        </Col>
      </Row>

      <Row>
        <Form.Group className='detail-info'>
          <Form.Label className='fs-7'>Catatan Tambahan</Form.Label>
          <Form.Control
            name='description'
            style={{minHeight: '170px'}}
            as='textarea'
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </Form.Group>
      </Row>
    </Col>
  )
}
