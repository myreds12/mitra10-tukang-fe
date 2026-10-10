import React from 'react'
import {Row, Col, Form, Button, ListGroup} from 'react-bootstrap'
import {Skeleton, Image} from 'antd'
import Swal from 'sweetalert2'

interface DetailWorkOrderEvidencesProps {
  orderDetail: any
  isLoadingPage: boolean
  userRole: string | null
  previewImage: any
  setPreviewImage: (val: any) => void
  visible: boolean
  setVisible: (val: boolean) => void
  editingItemId: any
  setEditingItemId: (val: any) => void
  apiUrl?: string
  handleButtonClick: () => void
  fileInputRef: React.RefObject<any>
  handleFileChange2: (e: any) => void
  handleButtonAfterClick: () => void
  fileInputAfterRef: React.RefObject<any>
  handleFileAfterChange2: (e: any) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, item: any) => void
  deleteFoto: (item: any) => void
}

export const DetailWorkOrderEvidences: React.FC<DetailWorkOrderEvidencesProps> = ({
  orderDetail,
  isLoadingPage,
  userRole,
  previewImage,
  setPreviewImage,
  visible,
  setVisible,
  editingItemId,
  setEditingItemId,
  apiUrl,
  handleButtonClick,
  fileInputRef,
  handleFileChange2,
  handleButtonAfterClick,
  fileInputAfterRef,
  handleFileAfterChange2,
  handleFileChange,
  deleteFoto,
}) => {
  if (!orderDetail?.work_orders?.work_order_evidences?.length) {
    return null
  }

  return (
    <Skeleton active loading={isLoadingPage}>
      <Row>
        <Col>
          <Form.Label className='mt-3'>Work Before :</Form.Label>
          <Button
            variant='outline-primary'
            size='sm'
            style={{marginLeft: '10px', marginBottom: '10px'}}
            onClick={handleButtonClick}
          >
            Upload File Before
          </Button>
          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            style={{display: 'none'}}
            onChange={handleFileChange2}
          />
          <ListGroup>
            {orderDetail?.work_orders?.work_order_evidences
              ?.filter((x: any) => x.type === 2)
              ?.map((item: any) => (
                <ListGroup.Item key={item.id} action>
                  <div className='d-flex justify-content-between align-items-center'>
                    <span
                      onClick={() => {
                        setPreviewImage(item.evidence_location)
                        setVisible(true)
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      {item.evidence_location}
                    </span>
                    <div>
                      {userRole === 'Owner Vendor' && (
                        <>
                          {' '}
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={() => {
                              setEditingItemId(item.evidence_location)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            style={{marginLeft: 5}}
                            onClick={() => {
                              Swal.fire({
                                title: 'Apakah kamu yakin?',
                                text: 'Foto ini akan dihapus secara permanen!',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Ya, hapus!',
                                cancelButtonText: 'Batal',
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  deleteFoto(item)
                                }
                              })
                            }}
                          >
                            Delete Foto
                          </Button>
                          {editingItemId === item.evidence_location && (
                            <input
                              type='file'
                              accept='image/*'
                              style={{display: 'inline', marginLeft: '10px'}}
                              onChange={(e) => handleFileChange(e, item)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Col>

        <Col>
          <Form.Label className='mt-3'>Work After :</Form.Label>
          <Button
            variant='outline-primary'
            size='sm'
            style={{marginLeft: '10px', marginBottom: '10px'}}
            onClick={handleButtonAfterClick}
          >
            Upload File After
          </Button>
          <input
            type='file'
            accept='image/*'
            ref={fileInputAfterRef}
            style={{display: 'none'}}
            onChange={handleFileAfterChange2}
          />
          <ListGroup>
            {orderDetail?.work_orders?.work_order_evidences
              ?.filter((x: any) => x.type === 3)
              ?.map((item: any) => (
                <ListGroup.Item key={item.id} action>
                  <div className='d-flex justify-content-between align-items-center'>
                    <span
                      onClick={() => {
                        setPreviewImage(item.evidence_location)
                        setVisible(true)
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      {item.evidence_location}
                    </span>
                    <div>
                      {userRole === 'Owner Vendor' && (
                        <>
                          {' '}
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={() => {
                              setEditingItemId(item.evidence_location)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            style={{marginLeft: 5}}
                            onClick={() => {
                              Swal.fire({
                                title: 'Apakah kamu yakin?',
                                text: 'Foto ini akan dihapus secara permanen!',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Ya, hapus!',
                                cancelButtonText: 'Batal',
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  deleteFoto(item)
                                }
                              })
                            }}
                          >
                            Delete Foto
                          </Button>
                          {editingItemId === item.evidence_location && (
                            <input
                              type='file'
                              accept='image/*'
                              style={{display: 'inline', marginLeft: '10px'}}
                              onChange={(e) => handleFileChange(e, item)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
          </ListGroup>
          {previewImage && (
            <div>
              <Image
                key={previewImage}
                width={200}
                style={{display: 'none'}}
                src={`${apiUrl}/public/work-orders/${previewImage}`}
                preview={{
                  visible,
                  src: `${apiUrl}/public/work-orders/${previewImage}`,
                  onVisibleChange: (val) => {
                    setVisible(val)
                  },
                }}
              />
            </div>
          )}
        </Col>
      </Row>
    </Skeleton>
  )
}
