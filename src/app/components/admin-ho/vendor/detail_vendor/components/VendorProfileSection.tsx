import React from 'react'
import {Col, Row, Form} from 'react-bootstrap'
import {toAbsoluteUrl} from '../../../../../../_metronic/helpers'

interface VendorProfileSectionProps {
  vendorDetail: any
  isVendorSpEnabled: boolean
  spStatus: any
  formatDate: (date: any) => string
  getSpLevelText: (level: number | null) => string
}

export const VendorProfileSection: React.FC<VendorProfileSectionProps> = ({
  vendorDetail,
  isVendorSpEnabled,
  spStatus,
  formatDate,
  getSpLevelText,
}) => {
  return (
    <Col xl={3}>
      <div className='vendor-profile'>
        <img
          className='d-block m-auto mb-4'
          src={toAbsoluteUrl('/media/avatars/blank.png')}
          alt='Avatar'
        />
      </div>

      <h1 className='text-center fs-1 fw-bold'>{vendorDetail?.company_name}</h1>

      <Row className='d-flex justify-content-center'>
        <Col>
          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Vendor ID :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.id}</p>
            </Col>
          </Form.Group>

          {isVendorSpEnabled && spStatus?.has_ever_sp && (
            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='6'>
                Riwayat SP :
              </Form.Label>
              <Col sm='6'>
                <span className='badge badge-light-danger fw-semibold'>Pernah SP</span>
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Join Since :
            </Form.Label>

            <Col sm='6'>
              <p className='fw-normal mt-3'>
                {vendorDetail ? formatDate(new Date(vendorDetail?.created_at)) : ''}
              </p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Status :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>
                {vendorDetail?.is_active ? 'ACTIVE' : 'NON ACTIVE'}
              </p>
            </Col>
          </Form.Group>

          {isVendorSpEnabled && (
            <Form.Group as={Row} className='detail-info'>
              <Form.Label column sm='6'>
                Status SP :
              </Form.Label>
              <Col sm='6'>
                {spStatus?.has_active_sp ? (
                  <span
                    className={`badge fw-semibold ${
                      spStatus?.sp_level === 1
                        ? 'badge-warning'
                        : spStatus?.sp_level === 2
                        ? 'badge-danger'
                        : 'badge-dark'
                    }`}
                  >
                    {getSpLevelText(spStatus?.sp_level)} ({spStatus?.total_point ?? 0} poin)
                  </span>
                ) : (
                  <span className='badge badge-light-success fw-semibold'>NORMAL</span>
                )}
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Margin :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.margin_nominal ?? 0} %</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Phone Number :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.phone_number}</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Email Address :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.email_address}</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Address :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.address}</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Nama PIC :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.pic_name ?? ''}</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Phone Number :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.phone_number}</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Email Address :
            </Form.Label>

            <Col sm='6'>
              <p className='fw-normal mt-3'>{vendorDetail?.email_address}</p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Service Type :
            </Form.Label>

            <Col sm='6'>
              {vendorDetail?.vendor_service?.length ? (
                <p className='fw-normal mt-3'>
                  {Array.from(
                    new Set(
                      vendorDetail?.vendor_service.map(
                        (item: any) => item?.service_type?.service_type ?? '-'
                      )
                    )
                  ).join(', ')}
                </p>
              ) : (
                <p className='fw-normal mt-3'>Service type belum diset</p>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Area Toko :
            </Form.Label>
            <Col sm='6'>
              <p className='fw-normal mt-3'>
                {Array.from(
                  new Set(
                    vendorDetail?.vendor_store?.map(
                      (item: any) => item?.store?.store_name ?? '-'
                    )
                  )
                ).join(', ')}
              </p>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='detail-info'>
            <Form.Label column sm='6'>
              Jumlah Teknisi :
            </Form.Label>
            <Col sm='6'>
              <p className='fs-1 fw-semibold mt-2'>
                {vendorDetail?.tukang?.filter((x: any) => x.deleted_at === null).length}
              </p>
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </Col>
  )
}
