import React, {FC, useState} from 'react'
import {Card, Form, ListGroup, Modal} from 'react-bootstrap'
import {Skeleton, Steps, Image} from 'antd'
import {Orders} from '../../../../../interfaces/order'

interface DetailOrderComplaintSectionProps {
  order: Orders
  apiUrl?: string
  isLoadingPage: boolean
  complaintHistory: Array<{title: string; value: Array<number | null>}>
}

export const DetailOrderComplaintSection: FC<DetailOrderComplaintSectionProps> = ({
  order,
  apiUrl,
  isLoadingPage,
  complaintHistory,
}) => {
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleComplaint, setVisibleComplaint] = useState(false)

  if (!order?.complaints || order?.complaints?.length === 0) {
    return null
  }

  const currentStep = complaintHistory.findIndex((step) =>
    step.value.includes(
      order?.work_orders?.work_order_status?.length > 0
        ? order?.work_orders?.work_order_status[0]?.status?.id
        : order?.project_status_id
    )
  )

  return (
    <Card className='mt-5'>
      <Card.Header>
        <Card.Title className='fw-bold'>Complaint History</Card.Title>
      </Card.Header>

      <Card.Body>
        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
          <Form.Label className='mt-3'>Bukti Komplain :</Form.Label>
          <ListGroup>
            {order?.complaints?.[0]?.complaint_histories?.[0]?.complaint_evidence?.map(
              (item: any) => (
                <ListGroup.Item
                  key={item.id}
                  action
                  style={{cursor: 'pointer'}}
                  onClick={() => {
                    setPreviewImage(item.evidence_location)
                    setVisibleComplaint(true)
                  }}
                >
                  {item.evidence_location}
                </ListGroup.Item>
              )
            )}
          </ListGroup>

          {previewImage && (
            <div>
              {previewImage.endsWith('.pdf') ? (
                <Modal
                  dialogClassName='modal-show-pdf'
                  centered
                  show={visibleComplaint}
                  onHide={() => setVisibleComplaint(false)}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>File - {previewImage}</Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                    <iframe
                      key={previewImage}
                      title={previewImage}
                      width='100%'
                      height='100%'
                      src={`${apiUrl}/public/complaints/${previewImage}`}
                      style={{border: 'none'}}
                    />
                  </Modal.Body>
                </Modal>
              ) : (
                <Image
                  key={previewImage}
                  width={200}
                  style={{display: 'none'}}
                  src={`${apiUrl}/public/complaints/${previewImage}`}
                  preview={{
                    visible: visibleComplaint,
                    src: `${apiUrl}/public/complaints/${previewImage}`,
                    onVisibleChange: (value) => {
                      setVisibleComplaint(value)
                    },
                  }}
                />
              )}
            </div>
          )}
        </Skeleton>

        <Skeleton active loading={isLoadingPage} paragraph={{rows: 1}}>
          {order?.complaints && order?.complaints?.length >= 1 && (
            <div className='complaint-history  mt-3 mb-3'>
              <div className='fs-3 fw-bold text-danger mb-4'>Complaint History</div>
              <Steps
                className='complaint-history-timeline'
                current={currentStep}
                labelPlacement='vertical'
                items={complaintHistory}
              />
            </div>
          )}
        </Skeleton>
      </Card.Body>
    </Card>
  )
}
