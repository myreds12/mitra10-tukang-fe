import React from 'react'
import {Form, Button, Card, Row, Col} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash} from '@fortawesome/free-solid-svg-icons'
import {formatDate} from '../../../../../../_metronic/helpers'
import {WorkOrderItem} from '../types'
import {stringToHash} from '../utils/workOrderHelpers'

interface WorkOrderItemsSectionProps {
  workOrderDetail: any
  workOrderItem: WorkOrderItem[]
  handleAddForm: (type: number) => void
  handleRemoveForm: (index: any) => void
  handleCheckboxChange: (index: any, isChecked: boolean) => void
  handleItemNameChange: (index: any, value: any, type: number) => void
  handleQuantityChange: (index: any, value: any, type: number) => void
  handleSatuanChange: (index: any, value: any, type: number) => void
}

export const WorkOrderItemsSection: React.FC<WorkOrderItemsSectionProps> = ({
  workOrderDetail,
  workOrderItem,
  handleAddForm,
  handleRemoveForm,
  handleCheckboxChange,
  handleItemNameChange,
  handleQuantityChange,
  handleSatuanChange,
}) => {
  if (
    workOrderDetail?.order?.payment_type === 'survey' &&
    workOrderDetail?.order?.quotation?.length === 0 &&
    ['SURVEYSTART', 'SURVEYDONE', 'RESURVEYSTART', 'RESURVEYDONE'].includes(
      workOrderDetail?.work_order_status[0]?.status?.category
    )
  ) {
    return (
      <>
        <div className='fs-5 text-dark fw-bold mb-2'>Jasa pemasangan</div>
        <div className='item-jasa'>
          {workOrderItem
            .filter((x) => x.type === 2)
            .map((element, index) => (
              <Card
                id={`${element.index}-service`}
                key={`${stringToHash(element.index)}-service`}
                className='mb-5'
              >
                <div className='d-flex border-rounded-3'>
                  <Card.Body>
                    <Row>
                      <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                        <Form.Group>
                          <Form.Label>Jenis Jasa</Form.Label>
                          <Form.Control
                            id={`service-name-${index}`}
                            type='text'
                            className='mb-5'
                            value={element.item_name}
                            onChange={(e) => handleItemNameChange(index, e.target.value, 2)}
                          />
                        </Form.Group>
                      </Col>

                      <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                        <Form.Group>
                          <Form.Label>QTY</Form.Label>
                          <Form.Control
                            id={`quantity-${index}`}
                            type='number'
                            className='mb-5'
                            value={element.quantity?.toString()}
                            onChange={(e) => handleQuantityChange(element.index, e.target.value, 2)}
                          />
                        </Form.Group>
                      </Col>

                      <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                        <Form.Group>
                          <Form.Label>Satuan</Form.Label>
                          <Form.Control
                            id={`unit-${index}`}
                            className='mb-5'
                            value={element.unit?.toString()}
                            onChange={(e) => handleSatuanChange(element.index, e.target.value, 2)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>

                  <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                    <Button
                      variant='primary'
                      className='button-transparent text-danger'
                      onClick={() => handleRemoveForm(element.index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

          <Button
            variant='btn-jasa button-dark-primary mb-3'
            onClick={() => handleAddForm(2)}
          >
            Tambah Jasa
          </Button>
        </div>

        <hr />

        <div className='fs-5 text-dark fw-bold mb-2'>Material yang dibutuhkan</div>
        <div className='item-material'>
          {workOrderItem
            .filter((x) => x.type === 1)
            .map((element, index) => (
              <Card
                id={`${element.index}-material`}
                key={`${stringToHash(element.index)}-material`}
                className='mb-5'
              >
                <div className='d-flex border-rounded-3'>
                  <div className='d-flex flex-column align-items-center justify-content-between border-end p-2'>
                    <Form.Check
                      id={`is-user-${index}`}
                      type='checkbox'
                      checked={element.is_user === 1}
                      onChange={(e) => handleCheckboxChange(element.index, e.target.checked)}
                    />
                  </div>

                  <Card.Body>
                    <Row>
                      <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                        <Form.Group>
                          <Form.Label>Material yang dibutuhkan</Form.Label>
                          <Form.Control
                            id={`item-name-${index}`}
                            className='mb-5'
                            value={element.item_name}
                            onChange={(e) => handleItemNameChange(index, e.target.value, 1)}
                          />
                        </Form.Group>
                      </Col>

                      <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                        <Form.Group>
                          <Form.Label>QTY</Form.Label>
                          <Form.Control
                            id={`quantity-${index}`}
                            className='mb-5'
                            value={element.quantity?.toString()}
                            onChange={(e) => handleQuantityChange(element.index, e.target.value, 1)}
                          />
                        </Form.Group>
                      </Col>

                      <Col xxl={4} xl={4} lg={4} md={12} sm={12}>
                        <Form.Group>
                          <Form.Label>Satuan</Form.Label>
                          <Form.Control
                            id={`unit-${index}`}
                            className='mb-5'
                            value={element.unit?.toString()}
                            onChange={(e) => handleSatuanChange(element.index, e.target.value, 1)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>

                  <div className='d-flex flex-column align-items-center justify-content-between border-start p-2'>
                    <Button
                      variant='primary'
                      className='button-transparent text-danger'
                      onClick={() => handleRemoveForm(element.index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

          <h4 className='fs-8 fw-normal text-danger mb-5'>
            *Jika <span className='fw-bolder text-decoration-underline'>Material</span> diceklis,
            maka material tersebut disediakan oleh customer
          </h4>

          <Button
            variant='btn-material button-dark-primary mb-3'
            onClick={() => handleAddForm(1)}
          >
            Tambah Material
          </Button>
        </div>
      </>
    )
  }

  if (
    workOrderDetail?.order?.quotation?.length >= 1 &&
    workOrderDetail?.order?.payment_type === 'survey'
  ) {
    return (
      <>
        <div className='fs-5 text-dark fw-bold mb-2'>Jasa Pemasangan</div>
        <div className='table-warranty-content'>
          {workOrderDetail?.order?.quotation[0]?.quotation_special === 0 ? (
            <table className='table hover responsive'>
              <thead className='table-warranty-head'>
                <tr>
                  <th className='text-center' style={{width: '355px'}}>
                    Jenis Jasa
                  </th>
                  <th className='text-center' style={{width: '100px'}}>
                    QTY
                  </th>
                  <th className='text-center' style={{width: '250px'}}>
                    Satuan
                  </th>
                </tr>
              </thead>
              <tbody>
                {workOrderDetail?.order?.quotation[0]?.quotation_details
                  ?.filter((x: any) => x.item_type === 2)
                  ?.map((item: any, index: any) => (
                    <tr key={`${index}-quotation`}>
                      <td>
                        {item?.name ?? '-'}{' '}
                        {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                      </td>
                      <td>{item?.quantity ?? 0}</td>
                      <td>{item?.unit}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <>
              <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 1</div>
              <table className='table hover responsive'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th className='text-center' style={{width: '355px'}}>
                      Jenis Jasa
                    </th>
                    <th className='text-center' style={{width: '100px'}}>
                      QTY
                    </th>
                    <th className='text-center' style={{width: '250px'}}>
                      Satuan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workOrderDetail?.order?.quotation[0]?.quotation_details
                    ?.filter((x: any) => x.item_type === 2 && x.work_step === 1)
                    ?.map((item: any, index: any) => (
                      <tr key={`${index}-quotation`}>
                        <td>
                          {item?.name ?? '-'}{' '}
                          {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                        </td>
                        <td>{item?.quantity ?? 0}</td>
                        <td>{item?.unit}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 2</div>
              <table className='table hover responsive'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th className='text-center' style={{width: '355px'}}>
                      Jenis Jasa
                    </th>
                    <th className='text-center' style={{width: '100px'}}>
                      QTY
                    </th>
                    <th className='text-center' style={{width: '250px'}}>
                      Satuan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workOrderDetail?.order?.quotation[0]?.quotation_details
                    ?.filter((x: any) => x.item_type === 2 && x.work_step === 2)
                    ?.map((item: any, index: any) => (
                      <tr key={`${index}-quotation`}>
                        <td>
                          {item?.name ?? '-'}{' '}
                          {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                        </td>
                        <td>{item?.quantity ?? 0}</td>
                        <td>{item?.unit}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className='fs-6 fw-bold'>Jasa Pemasangan Tahap 3</div>
              <table className='table hover responsive'>
                <thead className='table-warranty-head'>
                  <tr>
                    <th className='text-center' style={{width: '355px'}}>
                      Jenis Jasa
                    </th>
                    <th className='text-center' style={{width: '100px'}}>
                      QTY
                    </th>
                    <th className='text-center' style={{width: '250px'}}>
                      Satuan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workOrderDetail?.order?.quotation[0]?.quotation_details
                    ?.filter((x: any) => x.item_type === 2 && x.work_step === 3)
                    ?.map((item: any, index: any) => (
                      <tr key={`${index}-quotation`}>
                        <td>
                          {item?.name ?? '-'}{' '}
                          {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                        </td>
                        <td>{item?.quantity ?? 0}</td>
                        <td>{item?.unit}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}

          {workOrderDetail?.order?.quotation[0]?.quotation_details?.filter(
            (x: any) => x.item_type === 1
          )?.length > 0 && (
            <table className='table hover responsive'>
              <thead className='table-warranty-head'>
                <tr>
                  <th className='text-center' style={{width: '355px'}}>
                    Material Yang Dibutuhkan
                  </th>
                  <th className='text-center' style={{width: '100px'}}>
                    QTY
                  </th>
                  <th className='text-center' style={{width: '250px'}}>
                    Satuan
                  </th>
                </tr>
              </thead>
              <tbody>
                {workOrderDetail?.order?.quotation[0]?.quotation_details
                  ?.filter((x: any) => x.item_type === 1)
                  ?.map((item: any, index: any) => (
                    <tr key={`${index}-quotation`}>
                      <td>
                        {item?.name ?? '-'}{' '}
                        {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                      </td>
                      <td>{item?.quantity ?? 0}</td>
                      <td>{item?.unit}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    )
  }

  if (
    [
      'WORKREQ',
      'WORKSTART',
      'WORKEND',
      'DONE',
      'REWORKREQ',
      'REWORKSTART',
      'REWORKEND',
    ].includes(workOrderDetail?.work_order_status[0]?.status?.category) &&
    workOrderDetail?.work_order_status.length >= 2 &&
    workOrderDetail?.order?.payment_type === 'survey'
  ) {
    return (
      <div className='table-warranty-content'>
        <table className='table hover responsive'>
          <thead className='table-warranty-head'>
            <tr>
              <th className='text-center' style={{width: '355px'}}>
                Jenis Jasa
              </th>
              <th className='text-center' style={{width: '100px'}}>
                QTY
              </th>
              <th className='text-center' style={{width: '250px'}}>
                Satuan
              </th>
            </tr>
          </thead>
          <tbody>
            {workOrderDetail?.order?.quotation[0]?.quotation_details
              ?.filter((x: any) => x.item_type === 2)
              ?.map((item: any, index: any) => (
                <tr key={`${index}-quotation`}>
                  <td>
                    {item?.name ?? '-'}{' '}
                    {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                  </td>
                  <td>{item?.quantity ?? 0}</td>
                  <td>{item?.unit}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <table className='table hover responsive'>
          <thead className='table-warranty-head'>
            <tr>
              <th className='text-center' style={{width: '355px'}}>
                Material Yang Dibutuhkan
              </th>
              <th className='text-center' style={{width: '100px'}}>
                QTY
              </th>
              <th className='text-center' style={{width: '250px'}}>
                Satuan
              </th>
            </tr>
          </thead>
          <tbody>
            {workOrderDetail?.order?.quotation[0]?.quotation_details
              ?.filter((x: any) => x.item_type === 1)
              ?.map((item: any, index: any) => (
                <tr key={`${index}-quotation`}>
                  <td>
                    {item?.name ?? '-'}{' '}
                    {item?.is_customer === true ? '( Disediakan oleh customer )' : ''}
                  </td>
                  <td>{item?.quantity ?? 0}</td>
                  <td>{item?.unit}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (
    workOrderDetail?.order?.payment_type === 'gratis' ||
    workOrderDetail?.order?.payment_type === 'pemasangan_tanpa_survey'
  ) {
    return (
      <>
        <div className='table-title-warranty mt-5'>
          <div className='fs-3 fw-bold'>Informasi Pemasangan</div>
          <Row>
            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>
                {workOrderDetail?.order?.payment_type === 'survey' &&
                workOrderDetail?.order?.quotation?.length === 0
                  ? 'Tanggal request survey'
                  : 'Tanggal request pemasangan'}
              </Form.Label>
              <Col>
                <p className='fs-7 p-0'>{formatDate(workOrderDetail?.order?.request_survey)}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Informasi Vendor Pemasangan :</Form.Label>
              <Col>
                <p className='fs-7 p-0'>{workOrderDetail?.vendor?.company_name ?? '-'}</p>
              </Col>
            </Form.Group>

            <Form.Group as={Col} className='mb-3' controlId='formPlaintextEmail'>
              <Form.Label column>Payment Type:</Form.Label>
              <Col>
                <p className='fs-7 p-0'>
                  {workOrderDetail?.order?.payment_type === 'survey'
                    ? 'Berbayar & Survey'
                    : workOrderDetail?.order?.payment_type === 'gratis'
                    ? 'Gratis'
                    : workOrderDetail?.order?.payment_type === 'pemasangan_tanpa_survey'
                    ? 'Berbayar & Pemasangan Tanpa Survey'
                    : ''}
                </p>
              </Col>
            </Form.Group>
          </Row>
        </div>

        <div className='table-warranty-content'>
          <table className='table hover responsive'>
            <thead className='table-warranty-head'>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Nama Pemasangan</th>
                <th>QTY Pemasangan</th>
              </tr>
            </thead>
            <tbody>
              {workOrderDetail?.order?.m_order_details?.map((item: any, index: any) => (
                <tr key={`${index} - order_detail`}>
                  <td>{item?.item_code}</td>
                  <td>{item?.item_name}</td>
                  <td>{item?.item?.service_name}</td>
                  <td>{item?.quantity ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return null
}
