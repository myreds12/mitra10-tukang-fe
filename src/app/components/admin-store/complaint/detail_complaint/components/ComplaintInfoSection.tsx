import React, { FC } from 'react'
import { Row, Col, Form, ListGroup, Card, Button } from 'react-bootstrap'
import { Skeleton, Image, Tag } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faRotate } from '@fortawesome/free-solid-svg-icons'
import { formatDateWithTime, formatDateWithTimeZone } from '../../../../../../_metronic/helpers'
import { CrmType } from '../types'

interface ComplaintInfoSectionProps {
  isLoadingPage: boolean
  complaintDetail: any
  previewImage: string
  setPreviewImage: (val: string) => void
  visibleWorkBefore: boolean
  setVisibleWorkBefore: (val: boolean) => void
  visibleWorkAfter: boolean
  setVisibleWorkAfter: (val: boolean) => void
  visibleComplaintEvidence: boolean
  setVisibleComplaintEvidence: (val: boolean) => void
  visibleRemedial: boolean
  setVisibleRemedial: (val: boolean) => void
  apiUrl: string | undefined
  userRole: string
  shouldDisplayActions: () => boolean
  ActionButtons: FC
  getCrmSyncLabel: (isSync: number) => { text: string; color: string }
  resyncLoading: boolean
  handleResync: () => void
  crmType: CrmType[]
}

export const ComplaintInfoSection: FC<ComplaintInfoSectionProps> = ({
  isLoadingPage,
  complaintDetail,
  previewImage,
  setPreviewImage,
  visibleWorkBefore,
  setVisibleWorkBefore,
  visibleWorkAfter,
  setVisibleWorkAfter,
  visibleComplaintEvidence,
  setVisibleComplaintEvidence,
  visibleRemedial,
  setVisibleRemedial,
  apiUrl,
  userRole,
  shouldDisplayActions,
  ActionButtons,
  getCrmSyncLabel,
  resyncLoading,
  handleResync,
  crmType,
}) => {
  return (
    <>
      <Skeleton active loading={isLoadingPage}>
        {complaintDetail?.orders?.work_orders?.work_order_evidences?.length > 0 ? (
          <Row>
            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Form.Label className='mt-3'>Work Before :</Form.Label>
              <ListGroup>
                {complaintDetail?.orders?.work_orders?.work_order_evidences
                  .filter((x: any) => x.type === 2)
                  .map((item: any) => (
                    <ListGroup.Item
                      key={item.id}
                      action
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setPreviewImage(item.evidence_location)
                        setVisibleWorkBefore(true)
                      }}
                    >
                      {item.evidence_location}
                    </ListGroup.Item>
                  ))}
              </ListGroup>

              {complaintDetail?.orders?.work_orders?.work_order_evidences?.filter(
                (x: any) => x.type === 2
              ).length ? (
                <>
                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{ display: 'none' }}
                        src={`${apiUrl}/public/work-orders/${previewImage}`}
                        preview={{
                          visible: visibleWorkBefore,
                          src: `${apiUrl}/public/work-orders/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisibleWorkBefore(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className='d-flex justify-content-start align-items-center'>
                  <p className='fs-7 text-danger'>Foto belum diupload oleh Tukang</p>
                </div>
              )}
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Form.Label className='mt-3'>Work After :</Form.Label>
              <ListGroup>
                {complaintDetail?.orders?.work_orders?.work_order_evidences
                  .filter((x: any) => x.type === 3)
                  .map((item: any) => (
                    <ListGroup.Item
                      key={item.id}
                      action
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setPreviewImage(item.evidence_location)
                        setVisibleWorkAfter(true)
                      }}
                    >
                      {item.evidence_location}
                    </ListGroup.Item>
                  ))}
              </ListGroup>

              {complaintDetail?.orders?.work_orders?.work_order_evidences?.filter(
                (x: any) => x.type === 3
              ).length ? (
                <>
                  {previewImage && (
                    <div>
                      <Image
                        key={previewImage}
                        width={200}
                        style={{ display: 'none' }}
                        src={`${apiUrl}/public/work-orders/${previewImage}`}
                        preview={{
                          visible: visibleWorkAfter,
                          src: `${apiUrl}/public/work-orders/${previewImage}`,
                          onVisibleChange: (value) => {
                            setVisibleWorkAfter(value)
                          },
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className='d-flex justify-content-start align-items-center'>
                  <p className='fs-7 text-danger'>Foto belum diupload oleh Tukang</p>
                </div>
              )}
            </Col>
          </Row>
        ) : null}
      </Skeleton>

      {shouldDisplayActions() && ['Admin HO', 'Super User'].includes(userRole) && (
        <ActionButtons />
      )}

      {/* CRM Sync Status Section */}
      <Card className='mt-4 mb-4 border-warning'>
        <Card.Body>
          <Row className='align-items-center'>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
              <div className='d-flex align-items-center gap-3'>
                <div className='fs-4 fw-bold text-warning'>CRM Integration</div>
                <Tag color={getCrmSyncLabel(complaintDetail?.is_sync ?? 0).color}>
                  {getCrmSyncLabel(complaintDetail?.is_sync ?? 0).text}
                </Tag>
              </div>
              <p className='fs-7 text-muted mt-1 mb-0'>
                Status sinkronisasi data pengaduan ke sistem CRM eksternal
              </p>
            </Col>
            <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='text-end'>
              {(complaintDetail?.is_sync ?? 0) !== 1 && (
                <Button
                  variant='warning'
                  className='text-white'
                  disabled={resyncLoading}
                  onClick={handleResync}
                >
                  <FontAwesomeIcon
                    icon={faRotate}
                    className='me-2'
                    spin={resyncLoading}
                  />
                  {resyncLoading ? 'Mengirim Ulang...' : 'Resubmit ke CRM'}
                </Button>
              )}
              {(complaintDetail?.is_sync ?? 0) === 1 && (
                <span className='text-success fw-bold'>
                  <FontAwesomeIcon icon={faCircleInfo} className='me-1' />
                  Data sudah tersinkronisasi
                </span>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <hr />

      <Card className='mb-5'>
        <Card.Body>
          <Row className='complaint-info'>
            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Skeleton active loading={isLoadingPage} paragraph={{ rows: 3 }}>
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
                    Tanggal Komplain Dibuat
                  </Form.Label>
                  <Col sm='7'>
                    <p className='fs-7'>: {formatDateWithTime(complaintDetail?.created_at)}</p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='5'>
                    Tanggal Komplain Diterima
                  </Form.Label>
                  <Col sm='7'>
                    <p className='fs-7'>
                      :{' '}
                      {formatDateWithTimeZone(complaintDetail?.complaint_received_date ?? null)}
                    </p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='5'>
                    Komplain melalui
                  </Form.Label>
                  <Col sm='7'>
                    <p className='fs-7'>: {complaintDetail?.complaint_channels?.name}</p>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className='detail-info'>
                  <Form.Label column sm='5'>
                    Jenis Pengaduan
                  </Form.Label>
                  <Col sm='7'>
                    <p className='fs-7'>
                      :{' '}
                      {crmType.find((type) => type.value === complaintDetail?.crm_type)
                        ?.label ?? '-'}
                    </p>
                  </Col>
                </Form.Group>
              </Skeleton>
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Skeleton active loading={isLoadingPage} paragraph={{ rows: 1 }}>
                <Form.Group className='detail-info'>
                  <Form.Label className='mb-2'>Alasan Komplain :</Form.Label>
                  <p className='fs-7'>{complaintDetail?.description}</p>
                </Form.Group>
              </Skeleton>
            </Col>

            <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
              <Skeleton active loading={isLoadingPage} paragraph={{ rows: 1 }}>
                <Form.Label>Complaint Evidence :</Form.Label>
                <ListGroup>
                  {complaintDetail?.complaint_histories?.map((item: any) =>
                    item.complaint_evidence?.map((evidence: any) => (
                      <ListGroup.Item
                        key={evidence.id}
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
                      style={{ display: 'none' }}
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

      {complaintDetail?.remedials && complaintDetail.remedials.length > 0 && (
        <>
          {complaintDetail.remedials.map((item: any) => (
            <Card key={item.id} className='mb-5'>
              <Card.Body>
                <Row className='remedial-info'>
                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Skeleton active loading={isLoadingPage} paragraph={{ rows: 3 }}>
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
                          Jabatan
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
                          <p className='fs-7'>: {formatDateWithTime(item?.created_at)}</p>
                        </Col>
                      </Form.Group>

                      {['Owner Vendor', 'Admin Vendor'].includes(
                        item?.remedial_pic_positon
                      ) && (
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
                    <Skeleton active loading={isLoadingPage} paragraph={{ rows: 1 }}>
                      <Form.Group className='detail-info'>
                        <Form.Label className='mb-2'>Deskripsi Feedback :</Form.Label>
                        <p className='fs-7'>{item?.remedial_action}</p>
                      </Form.Group>
                    </Skeleton>
                  </Col>

                  <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
                    <Skeleton active loading={isLoadingPage} paragraph={{ rows: 1 }}>
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
                            style={{ display: 'none' }}
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
                    </Skeleton>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </>
      )}
    </>
  )
}
