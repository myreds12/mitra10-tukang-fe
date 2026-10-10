import React, {FC, useRef, useState} from 'react'
import {Form, Col, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faFileArrowUp, faPencil} from '@fortawesome/free-solid-svg-icons'
import {Image} from 'antd'
import {stringToHash} from '../services/newMaterialService'

interface NewMaterialEvidenceSectionProps {
  apiUrl?: string
  workOrderDetail: any
  workOrderBefore: Array<File | null | any>
  setWorkOrderBefore: React.Dispatch<React.SetStateAction<Array<File | null | any>>>
  workOrderAfter: Array<File | null | any>
  setWorkOrderAfter: React.Dispatch<React.SetStateAction<Array<File | null | any>>>
}

export const NewMaterialEvidenceSection: FC<NewMaterialEvidenceSectionProps> = ({
  apiUrl,
  workOrderDetail,
  workOrderBefore,
  setWorkOrderBefore,
  workOrderAfter,
  setWorkOrderAfter,
}) => {
  const evidenceBeforeRef = useRef<HTMLInputElement>(null)
  const evidenceAfterRef = useRef<HTMLInputElement>(null)

  const [selectedWorkBeforeFile, setSelectedWorkBeforeFile] = useState<number | null>(null)
  const [selectedWorkAfterFile, setSelectedWorkAfterFile] = useState<number | null>(null)

  const [previewWorkBeforeImage, setPreviewWorkBeforeImage] = useState<any>()
  const [previewWorkAfterImage, setPreviewWorkAfterImage] = useState<any>()

  const [visibleWorkBefore, setVisibleWorkBefore] = useState(false)
  const [visibleWorkAfter, setVisibleWorkAfter] = useState(false)

  // Handle File ( Before ) Change
  const handleFileWorkBefore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    const input = evidenceBeforeRef.current

    if (!fileList || !input) return

    const editIndexAttr = input.getAttribute('data-edit-index-before')
    const updatedFiles = [...workOrderBefore]

    if (editIndexAttr !== null) {
      const index = parseInt(editIndexAttr)
      if (!isNaN(index) && fileList.length > 0) {
        updatedFiles[index] = fileList[0]
      }

      input.removeAttribute('data-edit-index-before')
    } else {
      for (let i = 0; i < fileList.length; i++) {
        updatedFiles.push(fileList.item(i))
      }
    }

    setWorkOrderBefore(updatedFiles)
    input.value = ''
  }

  const handleImageWorkBeforeClick = () => {
    const inputField = document.querySelector('.work-before-image') as HTMLInputElement
    if (inputField) inputField.click()
  }

  const handleFileWorkBeforeClick = (index: number) => {
    setPreviewWorkBeforeImage(workOrderBefore[index]?.name)
    setVisibleWorkBefore(true)
    setSelectedWorkBeforeFile(index)
  }

  const handleEditWorkBeforeFile = (index: number) => {
    if (evidenceBeforeRef.current) {
      evidenceBeforeRef.current.setAttribute('data-edit-index-before', index.toString())
      evidenceBeforeRef.current.click()
    }
  }

  const handleRemoveWorkBeforeFile = (index: number) => {
    const newEvidances = [...workOrderBefore]
    newEvidances.splice(index, 1)
    setWorkOrderBefore(newEvidances)

    if (evidenceBeforeRef.current?.value) {
      evidenceBeforeRef.current.value = ''
    }
  }

  // Handle File ( After ) Change
  const handleFileWorkAfter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    const input = evidenceAfterRef.current

    if (!fileList || !input) return

    const editIndexAttr = input.getAttribute('data-edit-index-after')
    const updatedFiles = [...workOrderAfter]

    if (editIndexAttr !== null) {
      const index = parseInt(editIndexAttr)
      if (!isNaN(index) && fileList.length > 0) {
        updatedFiles[index] = fileList[0]
      }
      input.removeAttribute('data-edit-index-after')
    } else {
      for (let i = 0; i < fileList.length; i++) {
        updatedFiles.push(fileList.item(i))
      }
    }

    setWorkOrderAfter(updatedFiles)
    input.value = ''
  }

  const handleImageWorkAfterClick = () => {
    const inputField = document.querySelector('.work-after-image') as HTMLInputElement
    if (inputField) inputField.click()
  }

  const handleFileWorkAfterClick = (index: number) => {
    setPreviewWorkAfterImage(workOrderAfter[index]?.name)
    setVisibleWorkAfter(true)
    setSelectedWorkAfterFile(index)
  }

  const handleEditWorkAfterFile = (index: number) => {
    if (evidenceAfterRef.current) {
      evidenceAfterRef.current.setAttribute('data-edit-index-after', index.toString())
      evidenceAfterRef.current.click()
    }
  }

  const handleRemoveWorkAfterFile = (index: number) => {
    const newEvidances = [...workOrderAfter]
    newEvidances.splice(index, 1)
    setWorkOrderAfter(newEvidances)

    if (evidenceAfterRef.current?.value) {
      evidenceAfterRef.current.value = ''
    }
  }

  return (
    <>
      <Form.Group className='detail-info row'>
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
                ref={evidenceBeforeRef}
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
                        icon={faPencil}
                        size='sm'
                        color='#858585'
                        style={{cursor: 'pointer'}}
                        onClick={() => handleEditWorkBeforeFile(index)}
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
        'WORKSTART',
        'WORKEND',
        'REWORKSTART',
        'RIP',
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
        <Form.Group className='detail-info row'>
          <Form.Label className='fs-9 text-decoration-underline pt-0 pb-0' column md='4'>
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
                  ref={evidenceAfterRef}
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
                          icon={faPencil}
                          size='sm'
                          color='#858585'
                          style={{cursor: 'pointer'}}
                          onClick={() => handleEditWorkAfterFile(index)}
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
    </>
  )
}
