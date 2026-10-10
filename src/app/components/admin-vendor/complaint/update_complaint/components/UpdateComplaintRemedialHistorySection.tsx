import React from 'react'
import {Card, Row, Col, Form, ListGroup} from 'react-bootstrap'
import {Skeleton, Image} from 'antd'

interface UpdateComplaintRemedialHistorySectionProps {
  complaintDetail: any
  isLoadingPage: boolean
  apiUrl?: string
  previewImage: any
  setPreviewImage: (img: any) => void
  visibleRemedial: boolean
  setVisibleRemedial: (vis: boolean) => void
}

export const UpdateComplaintRemedialHistorySection: React.FC<UpdateComplaintRemedialHistorySectionProps> = ({
  complaintDetail,
  isLoadingPage,
  apiUrl,
  previewImage,
  setPreviewImage,
  visibleRemedial,
  setVisibleRemedial,
}) => {
  if (!complaintDetail?.remedials || complaintDetail.remedials.length === 0) {
    return null
  }

  return (
    <>
      {complaintDetail.remedials.map((item: any, idx: number) => (
        <Card key={item?.id ?? idx} className='mb-5'>
          <Card.Body>
            <Row className='remedial-info'>
              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='5'>
                      PIC Feedback :
                    </Form.Label>
                    <Col sm='7'>
                      <p className='fs-7'>: {item?.remedial_pic ?? '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='5'>
                      Jabatan :
                    </Form.Label>
                    <Col sm='7'>
                      <p className='fs-7'>: {item?.remedial_pic_positon ?? '-'}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='5'>
                      Tanggal Feedback
                    </Form.Label>
                    <Col sm='7'>
                      <p className='fs-7'>
                        :{' '}
                        {item?.created_at
                          ? new Date(item.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                            })
                          : '-'}
                      </p>
                    </Col>
                  </Form.Group>

                  {['Owner Vendor', 'Admin Vendor'].includes(item?.remedial_pic_positon) && (
                    <Form.Group as={Row} className='detail-info'>
                      <Form.Label column sm='5'>
                        Status Vendor
                      </Form.Label>
                      <Col sm='7'>
                        <p className='fs-7'>: {item?.status?.description ?? '-'}</p>
                      </Col>
                    </Form.Group>
                  )}
                </Skeleton>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                  <Form.Group className='detail-info'>
                    <Form.Label className='mb-2'>Deskripsi Feedback :</Form.Label>
                    <p className='fs-7'>{item?.remedial_action}</p>
                  </Form.Group>
                </Skeleton>
              </Col>

              <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
                  <Form.Group className='detail-info'>
                    <Form.Label className='mb-2'>Remedial Evidence:</Form.Label>
                    <ListGroup>
                      {item?.remedial_evidences?.map((evidenceItem: any) => (
                        <ListGroup.Item
                          key={evidenceItem.id}
                          action
                          onClick={() => {
                            setPreviewImage(evidenceItem.evidence_location)
                            setVisibleRemedial(true)
                          }}
                        >
                          {evidenceItem.evidence_location}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    {previewImage && (
                      <div>
                        <Image
                          key={previewImage}
                          width={200}
                          style={{display: 'none'}}
                          src={`${apiUrl}/public/remedials/${previewImage}`}
                          preview={{
                            visible: visibleRemedial,
                            src: `${apiUrl}/public/remedials/${previewImage}`,
                            onVisibleChange: (value) => {
                              setVisibleRemedial(value)
                            },
                          }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Skeleton>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </>
  )
}
