import React from 'react'
import {Form, Row, Col, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faFileArrowUp} from '@fortawesome/free-solid-svg-icons'
import {Image} from 'antd'
import {stringToHash} from '../utils/workOrderHelpers'

interface WorkOrderEvidencesSectionProps {
  workOrderDetail: any
  workOrderBefore: Array<File | null>
  workOrderAfter: Array<File | null>
  evidenceRef: React.RefObject<any>
  handleImageWorkBeforeClick: () => void
  handleFileWorkBefore: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleFileWorkBeforeClick: (index: number) => void
  handleRemoveWorkBeforeFile: (index: number) => void
  selectedWorkBeforeFile: number | null
  previewWorkBeforeImage: any
  visibleWorkBefore: boolean
  setVisibleWorkBefore: (v: boolean) => void
  handleImageWorkAfterClick: () => void
  handleFileWorkAfter: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleFileWorkAfterClick: (index: number) => void
  handleRemoveWorkAfterFile: (index: number) => void
  selectedWorkAfterFile: number | null
  previewWorkAfterImage: any
  visibleWorkAfter: boolean
  setVisibleWorkAfter: (v: boolean) => void
  apiUrl?: string
}

export const WorkOrderEvidencesSection: React.FC<WorkOrderEvidencesSectionProps> = ({
  workOrderDetail,
  workOrderBefore,
  workOrderAfter,
  evidenceRef,
  handleImageWorkBeforeClick,
  handleFileWorkBefore,
  handleFileWorkBeforeClick,
  handleRemoveWorkBeforeFile,
  selectedWorkBeforeFile,
  previewWorkBeforeImage,
  visibleWorkBefore,
  setVisibleWorkBefore,
  handleImageWorkAfterClick,
  handleFileWorkAfter,
  handleFileWorkAfterClick,
  handleRemoveWorkAfterFile,
  selectedWorkAfterFile,
  previewWorkAfterImage,
  visibleWorkAfter,
  setVisibleWorkAfter,
  apiUrl,
}) => {
  return (
    <Row className='detail-info'>
      <Form.Group className='detail-info' as={Row}>
        <Form.Label className='fs-9 text-decoration-underline pt-0 pb-0' column md='4'>
          Upload Foto Sebelum
        </Form.Label>

        <Col md='8'>
          <Form.Group>
            <Form className='form-input-image' onClick={handleImageWorkBeforeClick}>
              <Form.Control
                type='file'
                accept='image/*'
                className='work-before-image'
                multiple
                hidden
                id='work-before-file-input'
                ref={evidenceRef}
                onChange={handleFileWorkBefore}
              />

              <div className='input-image-text'>
                <FontAwesomeIcon icon={faFileArrowUp} color='#858585' size='2xl' />
              </div>
            </Form>

            <ListGroup className='pt-3'>
              {workOrderBefore?.length ? (
                workOrderBefore.map((item, index) => (
                  <ListGroup key={`${stringToHash(item?.name ?? 'randomImageHash')}`}>
                    <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                      <FontAwesomeIcon
                        className='me-3'
                        icon={faFileArrowUp}
                        color='#858585'
                        size='sm'
                      />

                      <span
                        className='upload-content'
                        style={{cursor: 'pointer'}}
                        onClick={() => handleFileWorkBeforeClick(index)}
                      >
                        {item?.name}
                      </span>

                      <FontAwesomeIcon
                        icon={faTrash}
                        size='sm'
                        color='#ed2b2a'
                        style={{cursor: 'pointer'}}
                        onClick={() => handleRemoveWorkBeforeFile(index)}
                      />
                    </ListGroup.Item>

                    {selectedWorkBeforeFile === index && item && (
                      <Image
                        key={`${stringToHash(previewWorkBeforeImage)} - ${index} - ${item?.name}`}
                        width={200}
                        style={{display: 'none'}}
                        src={
                          item instanceof File
                            ? URL.createObjectURL(item)
                            : `${apiUrl}/public/work-orders/${previewWorkBeforeImage}`
                        }
                        preview={{
                          visible: visibleWorkBefore,
                          src:
                            item instanceof File
                              ? URL.createObjectURL(item)
                              : `${apiUrl}/public/work-orders/${previewWorkBeforeImage}`,
                          onVisibleChange: (value) => {
                            setVisibleWorkBefore(value)
                          },
                        }}
                      />
                    )}
                  </ListGroup>
                ))
              ) : (
                <ListGroup.Item className='d-flex justify-content-center'>
                  Tidak ada file yang dipilih
                </ListGroup.Item>
              )}
            </ListGroup>
          </Form.Group>
        </Col>
      </Form.Group>

      {[
        'SURVEYSTART',
        'SURVEYDONE',
        'RESURVEYSTART',
        'RESURVEYDONE',
        'WORKSTART',
        'WORKEND',
        'REWORKSTART',
        'REWORKEND',
        'WORKDONE',
        'DONE',
        'WORKSTARTSTEPONE',
        'WORKSTARTSTEPTWO',
        'WORKSTARTSTEPTHREE',
        'WORKENDSTEPONE',
        'WORKENDSTEPTWO',
        'WORKENDSTEPTHREE',
      ].includes(workOrderDetail?.work_order_status[0]?.status?.category) && (
        <Form.Group className='detail-info' as={Row}>
          <Form.Label className='fs-9 text-decoration-underline pt-0 pb-0 ' column md='4'>
            Upload Foto Sesudah
          </Form.Label>

          <Col md='8'>
            <Form.Group>
              <Form className='form-input-image' onClick={handleImageWorkAfterClick}>
                <Form.Control
                  type='file'
                  accept='image/*'
                  className='work-after-image'
                  multiple
                  hidden
                  id='work-after-file-input'
                  ref={evidenceRef}
                  onChange={handleFileWorkAfter}
                />

                <div className='input-image-text'>
                  <FontAwesomeIcon icon={faFileArrowUp} color='#858585' size='2xl' />
                </div>
              </Form>

              <ListGroup className='pt-3'>
                {workOrderAfter?.length ? (
                  workOrderAfter.map((item, index) => (
                    <ListGroup key={`${stringToHash(item?.name ?? 'randomImageHash')}`}>
                      <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                        <FontAwesomeIcon
                          className='me-3'
                          icon={faFileArrowUp}
                          color='#858585'
                          size='sm'
                        />

                        <span
                          style={{cursor: 'pointer'}}
                          className='upload-content'
                          onClick={() => handleFileWorkAfterClick(index)}
                        >
                          {item?.name}
                        </span>

                        <FontAwesomeIcon
                          icon={faTrash}
                          size='sm'
                          color='#ed2b2a'
                          style={{cursor: 'pointer'}}
                          onClick={() => handleRemoveWorkAfterFile(index)}
                        />
                      </ListGroup.Item>

                      {selectedWorkAfterFile === index && item && (
                        <Image
                          key={`${stringToHash(previewWorkAfterImage)} - ${index} - ${item?.name}`}
                          width={200}
                          style={{display: 'none'}}
                          src={
                            item instanceof File
                              ? URL.createObjectURL(item)
                              : `${apiUrl}/public/work-orders/${previewWorkAfterImage}`
                          }
                          preview={{
                            visible: visibleWorkAfter,
                            src:
                              item instanceof File
                                ? URL.createObjectURL(item)
                                : `${apiUrl}/public/work-orders/${previewWorkAfterImage}`,
                            onVisibleChange: (value) => {
                              setVisibleWorkAfter(value)
                            },
                          }}
                        />
                      )}
                    </ListGroup>
                  ))
                ) : (
                  <ListGroup.Item className='d-flex justify-content-center'>
                    Tidak ada file yang dipilih
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Form.Group>
          </Col>
        </Form.Group>
      )}
    </Row>
  )
}
