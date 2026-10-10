import React, {ChangeEvent} from 'react'
import {Row, Col, Form} from 'react-bootstrap'
import Select from 'react-select'
import {Quotation} from '../types'

interface QuotationHeaderSectionProps {
  workOrderDetail: any
  workOrder: any[]
  quotation: Quotation
  today: string
  handleChangeQuotation: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectWorkOrder: (element: any) => void
  handleChangeQuotationType: (isChecked: boolean) => void
}

export const QuotationHeaderSection: React.FC<QuotationHeaderSectionProps> = ({
  workOrderDetail,
  workOrder,
  quotation,
  today,
  handleChangeQuotation,
  handleSelectWorkOrder,
  handleChangeQuotationType,
}) => {
  return (
    <>
      <Row className='mb-4'>
        <Col
          xs={{order: 'last'}}
          xxl={6}
          className='vendor-information order-1 order-xxl-1 order-xl-2 order-lg-2 order-md-2 order-sm-2 mb-3'
        >
          <div className='vendor-detail'>
            <Form.Group>
              <Form.Label className='fs-5 fw-semibold'>Nama Toko :</Form.Label>

              <Col>
                <Form.Label className='fs-3 fw-bold'>
                  {workOrderDetail?.order?.store?.store_name}
                </Form.Label>
              </Col>
            </Form.Group>

            <Form.Group>
              <Form.Label className='fs-5 fw-bold'>
                {workOrderDetail?.order?.store?.address}
              </Form.Label>

              <Col>
                <Form.Label className='fs-5 fw-bold'>
                  {workOrderDetail?.order?.store?.phone_number_1
                    ? `Telp : ${
                        workOrderDetail?.order?.store?.phone_number_1 ??
                        workOrderDetail?.order?.store?.phone_number_2 ??
                        'Nomor Telepon tidak tersedia'
                      }`
                    : ''}
                </Form.Label>
              </Col>
            </Form.Group>
          </div>
        </Col>

        <Col
          xs={{order: 'first'}}
          xxl={6}
          className='payment-request order-2 order-xxl-2 order-xl-1 order-lg-1 order-md-1 order-sm-1 mb-3'
        >
          <h1 className='fw-bolder'>QUOTATION</h1>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Status :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                readOnly
                plaintext
                className='fs-2 fw-bold text-black'
                type='text'
                value={workOrderDetail?.work_order_status?.[0]?.status?.description || ''}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Tanggal :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                name='quotation_date'
                type='date'
                min={today}
                required
                onChange={(e) => handleChangeQuotation(e as ChangeEvent<HTMLInputElement>)}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Order ID :
            </Form.Label>

            <Col sm='8'>
              <Select
                name='order-id'
                className='form-control p-0'
                placeholder='Ketik/Pilih Order Id'
                isSearchable={true}
                options={workOrder}
                onChange={(e) => handleSelectWorkOrder(e)}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Quotation ID :
            </Form.Label>

            <Col sm='8'>
              <Form.Control type='number' value={quotation.id ? quotation.id : ''} readOnly />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className='mb-4'>
            <Form.Label className='fs-5 fw-bold' column sm='4'>
              Costumer ID :
            </Form.Label>

            <Col sm='8'>
              <Form.Control
                type='number'
                readOnly
                value={workOrderDetail?.order?.members?.member_number || ''}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>

      <Row className='mb-5'>
        <Col xxl={6}>
          <div className='receiver-information mb-3'>
            <div className='receiver-detail'>
              <h1 className='fs-5 fw-semibold'>Ditunjukkan kepada :</h1>
              <h1 className='fs-3 fw-bold mt-2'>{workOrderDetail?.order?.members?.full_name}</h1>
            </div>

            <div className='address'>
              <h3 className='fw-normal'>{workOrderDetail?.order?.project_address}</h3>
              <h3 className='fw-normal'>
                {workOrderDetail?.order?.project_number
                  ? `Telp : ${workOrderDetail?.order?.project_number}`
                  : ''}
              </h3>
            </div>
          </div>
        </Col>

        <Col xxl={6}>
          <div className='payment-request'>
            <Form.Group>
              <Form.Label className='fs-5 fw-bold'>Instruksi Spesial</Form.Label>
              <Form.Control
                style={{minHeight: '140px'}}
                as='textarea'
                name='description'
                onChange={(e) => handleChangeQuotation(e as ChangeEvent<HTMLInputElement>)}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>

      <hr />

      <Row>
        <Col>
          <Form.Check
            id='quotation-type'
            type='checkbox'
            label='Tipe Quotation Spesial'
            className='mb-5'
            checked={quotation.quotation_special === 1}
            onChange={(e) => handleChangeQuotationType(e.target.checked)}
          />
          <Form.Text className='fs-7 text-black'>Catatan : </Form.Text>
          <br />
          <Form.Text className='fs-7 text-black'>
            *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
          </Form.Text>
          <br />
          <Form.Text className='fs-7 text-danger'>
            *Ceklis checkbox diatas untuk mengaktifkan quotation spesial
          </Form.Text>
          <br />
          <Form.Text className='fs-7 text-danger'>
            *Harap masukkan angka tanpa tanda koma (,) sebagai pengganti gunakan tanda titik (.).
          </Form.Text>
        </Col>
      </Row>
    </>
  )
}
