import React from 'react'
import {Card, Row, Col, Form, ListGroup} from 'react-bootstrap'
import {Skeleton, Image} from 'antd'

interface UpdateComplaintInfoSectionProps {
  complaintDetail: any
  isLoadingPage: boolean
  apiUrl?: string
  previewImage: any
  setPreviewImage: (img: any) => void
  visibleComplaintEvidence: boolean
  setVisibleComplaintEvidence: (vis: boolean) => void
}

export const UpdateComplaintInfoSection: React.FC<UpdateComplaintInfoSectionProps> = ({
  complaintDetail,
  isLoadingPage,
  apiUrl,
  previewImage,
  setPreviewImage,
  visibleComplaintEvidence,
  setVisibleComplaintEvidence,
}) => {
  return (
    <Card className='mb-5'>
      <Card.Body>
        <Row className='complaint-info'>
          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='5'>
                  Nama PIC Komplain
                </Form.Label>
                <Col sm='7'>
                  <p className='fs-7'>: {complaintDetail?.pic_name ?? '-'}</p>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='5'>
                  Tanggal Komplain
                </Form.Label>
                <Col sm='7'>
                  <p className='fs-7'>
                    :{' '}
                    {complaintDetail?.created_at
                      ? new Date(complaintDetail.created_at).toLocaleDateString('id-ID', {
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

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='5'>
                  Komplain melalui
                </Form.Label>
                <Col sm='7'>
                  <p className='fs-7'>: {complaintDetail?.complaint_channels?.name ?? '-'}</p>
                </Col>
              </Form.Group>
            </Skeleton>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
              <Form.Group className='detail-info'>
                <Form.Label className='mb-2'>Alasan Komplain :</Form.Label>
                <p className='fs-7'>{complaintDetail?.description ?? '-'}</p>
              </Form.Group>
            </Skeleton>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
              <Form.Label>Complaint Evidence :</Form.Label>

              <ListGroup>
                {complaintDetail?.complaint_histories?.map((item: any) =>
                  item?.complaint_evidence?.map((evidence: any) => (
                    <ListGroup.Item
                      key={evidence?.id}
                      action
                      onClick={() => {
                        setPreviewImage(evidence?.evidence_location)
                        setVisibleComplaintEvidence(true)
                      }}
                    >
                      {evidence?.evidence_location}
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>

              {previewImage && (
                <div>
                  <Image
                    key={previewImage}
                    width={200}
                    style={{display: 'none'}}
                    src={`${apiUrl}/public/complaints/${previewImage}`}
                    preview={{
                      visible: visibleComplaintEvidence,
                      src: `${apiUrl}/public/complaints/${previewImage}`,
                      onVisibleChange: (value) => {
                        setVisibleComplaintEvidence(value)
                      },
                    }}
                  />
                </div>
              )}
            </Skeleton>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
