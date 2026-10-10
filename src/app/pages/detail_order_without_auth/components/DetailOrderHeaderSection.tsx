import React from 'react'
import {Row, Col, Form, Button} from 'react-bootstrap'
import {Skeleton} from 'antd'
import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {KTSVG, toAbsoluteUrl} from '../../../../_metronic/helpers'
import {useLayout} from '../../../../_metronic/layout/core'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDownload} from '@fortawesome/free-solid-svg-icons'
import {Orders} from '../../../interfaces/order'

interface DetailOrderHeaderSectionProps {
  order: Orders
  isLoadingPage: boolean
  loadingUploadReceipt: boolean
  handleUploadReceipt: () => void
}

export const DetailOrderHeaderSection: React.FC<DetailOrderHeaderSectionProps> = ({
  order,
  isLoadingPage,
  loadingUploadReceipt,
  handleUploadReceipt,
}) => {
  const {config, classes, attributes} = useLayout()
  const {header, aside} = config

  return (
    <>
      <div
        id='kt_header_page_without_auth'
        className={clsx('header', classes.header.join(' '), 'align-items-stretch bg-primary')}
        {...attributes.headerMenu}
      >
        <div
          className={clsx(
            classes.headerContainer.join(' '),
            'd-flex align-items-stretch justify-content-between'
          )}
        >
          {aside.display && (
            <div className='d-flex align-items-center d-lg-none ms-n3 me-1' title='Show aside menu'>
              <div
                className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
                id='kt_aside_mobile_toggle'
              >
                <KTSVG
                  path='/media/icons/duotune/abstract/abs015.svg'
                  className='svg-icon-2x mt-1'
                />
              </div>
            </div>
          )}

          {!aside.display && (
            <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0'>
              <Link to='/dashboard' className='d-lg-none'>
                <img
                  alt='Logo'
                  src={toAbsoluteUrl('/media/logos/default-small.svg')}
                  className='h-30px'
                />
              </Link>
            </div>
          )}

          <div className='d-flex align-items-stretch justify-content-between flex-lg-grow-1'>
            {header.left === 'menu' && (
              <div className='d-flex align-items-stretch' id='kt_header_nav'>
                <div
                  className='header-menu align-items-stretch'
                  data-kt-drawer='true'
                  data-kt-drawer-name='header-menu'
                  data-kt-drawer-activate='{default: true, lg: false}'
                  data-kt-drawer-overlay='true'
                  data-kt-drawer-width="{default:'200px', '300px': '250px'}"
                  data-kt-drawer-direction='end'
                  data-kt-drawer-toggle='#kt_header_menu_mobile_toggle'
                  data-kt-swapper='true'
                  data-kt-swapper-mode='prepend'
                  data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}"
                >
                  <div
                    className='menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch'
                    id='#kt_header_menu'
                    data-kt-menu='true'
                  >
                    <div id='kt_page_title' className={clsx('page-title d-flex')}>
                      <h1 className='d-flex align-items-center  text-light-md-black fw-bolder my-1 fs-1'>
                        {`DETAIL ORDER ${order?.id} - ${order?.members?.full_name}`}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className='d-flex align-items-stretch flex-shrink-0'>{/* <Topbar /> */}</div>
          </div>
        </div>
      </div>

      <div className='d-flex justify-content-end mb-5'>
        <Button
          className='btn-dark-primary d-flex justify-content-center align-items-center w-50 m-0'
          disabled={loadingUploadReceipt}
          onClick={handleUploadReceipt}
        >
          {loadingUploadReceipt === false ? (
            <>
              <FontAwesomeIcon icon={faDownload} size='lg' className='me-2' />
              Upload Bukti Pembayaran
            </>
          ) : (
            'Uploading...'
          )}
        </Button>
      </div>

      <div className='form-wrapper'>
        <Row className='form-header'>
          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
              <Form.Label className='fs-4 fw-bold'>
                Nama Toko :{' '}
                <span className='fs-4 ms-2 fw-normal'>
                  {order?.store?.store_name ?? ''}
                </span>
              </Form.Label>
            </Skeleton>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
              <Form.Label className='fs-4 fw-bold'>
                Order ID : <span className='fs-4 ms-2 fw-normal'>{order?.id}</span>
              </Form.Label>
            </Skeleton>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} xxl={4}>
            <Col>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                <Form.Label className='fs-4 fw-bold'>
                  Receipt Number :
                  <span className='fs-4 ms-2 fw-normal'>
                    {order?.receipt_number ?? '-'}
                  </span>
                </Form.Label>

                {order?.quotation[0]?.receipt_quotation &&
                  order?.quotation[0]?.quotation_special === 0 && (
                    <Form.Label className='fs-4 fw-bold'>
                      Receipt Quotation :
                      <span className='fs-4 ms-2 fw-normal'>
                        {order?.quotation[0]?.receipt_quotation ?? '-'}
                      </span>
                    </Form.Label>
                  )}
              </Skeleton>
            </Col>

            <Col>
              <Skeleton active loading={isLoadingPage} paragraph={{rows: 0}}>
                <Form.Label className='fs-4 fw-bold'>
                  Order Status :
                  <span className='fs-4 ms-2 fw-bold text-success'>
                    {order?.status?.description}
                  </span>
                </Form.Label>
              </Skeleton>
            </Col>
          </Col>
        </Row>

        <Row className='information-detail'>
          <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='costumer-info mb-5'>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
              <div className='fs-3 fw-bold'>Informasi Pembeli</div>

              <Row>
                <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      No Member :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fs-7'>{order?.members?.member_number}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Customer Name :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fs-7'>{order?.members?.full_name}</p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='6'>
                      Alamat Pemasangan :
                    </Form.Label>
                    <Col sm='6'>
                      <p className='fs-7'>{order?.project_address}</p>
                    </Col>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} lg={6} xl={6} xxl={6}>
                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='5'>
                      Nomor Whatsapp :
                    </Form.Label>
                    <Col sm='7'>
                      <p className='fs-7'>
                        {!order?.project_number.startsWith('0')
                          ? `+62${order?.members?.whatsapp_number}`
                          : '-'}
                      </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='5'>
                      Nomor Telepon :
                    </Form.Label>
                    <Col sm='7'>
                      <p className='fs-7'>
                        {order?.project_number.startsWith('0')
                          ? order?.members?.phone_number
                          : '-'}
                      </p>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className='detail-info'>
                    <Form.Label column sm='5'>
                      Alamat Email :
                    </Form.Label>
                    <Col sm='7'>
                      <p className='fs-7'>{order?.members?.email} </p>
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
            </Skeleton>
          </Col>

          <Col xs={12} md={6} lg={6} xl={6} xxl={6} className='sales-info mb-5'>
            <Skeleton active loading={isLoadingPage} paragraph={{rows: 3}}>
              <div className='fs-3 fw-bold'>Informasi Penjual</div>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='3'>
                  Sales ID :
                </Form.Label>
                <Col sm='9'>
                  <p className='fs-7'>{order?.sales?.id} </p>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className='detail-info'>
                <Form.Label column sm='3'>
                  Sales Person :
                </Form.Label>
                <Col sm='9'>
                  <p className='fs-7'>{order?.sales?.full_name} </p>
                </Col>
              </Form.Group>
            </Skeleton>
          </Col>
        </Row>
      </div>
    </>
  )
}
