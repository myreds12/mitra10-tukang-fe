import React, { FC, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Orders } from '../../../../interfaces/order'

import './UpdateOrder.css'

import Swal from 'sweetalert2'
import Select from 'react-select'
import { Card, Row, Col, Form, Button } from 'react-bootstrap'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { OrderCustomerSection } from './components/OrderCustomerSection'
import { QuotationOverviewSection } from './components/QuotationOverviewSection'
import { OrderDetailsSection } from './components/OrderDetailsSection'
import { useOrderLookups } from './hooks/useOrderLookups'
import { useUpdateOrderSubmit } from './hooks/useUpdateOrderSubmit'
import { Order } from './types'

const apiChat = process.env.REACT_APP_API_CHAT_URL || process.env.REACT_APP_API_URL || ''

const UpdateOrderHO: FC<{ updatePageTitle: (order: Orders) => void }> = ({ updatePageTitle }) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()
  const textAreaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const [orderForm, setOrderForm] = useState<Order>({
    member_id: null,
    sales_id: null,
    store_id: null,
    vendor_id: null,
    project_status_id: null,
    project_address: '',
    project_number: '',
    request_survey: '',
    payment_type: '',
    receipt_number: '',
    is_overdistance: 0,
    additional_fee: 25000,
    notes: '',
    order_details: [
      {
        id: null,
        item: null,
        item_id: null,
        item_code: '',
        item_name: '',
        quantity: 1,
        unit_price: null,
        total: null,
        item_notes: null,
      },
    ],
    order_files: [],
  })

  const [paymentTypeValue, setPaymentTypeValue] = useState(['gratis', 'pemasangan_tanpa_survey'])
  const [receiptFiles, setReceiptFiles] = useState<Array<File | null>>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [previewImage, setPreviewImage] = useState<any>()
  const [visible, setVisible] = useState(false)
  const [visibleQuotationReceipt, setVisibleQuotationReceipt] = useState(false)
  const [visibleQuotationFiles, setVisibleQuotationFiles] = useState(false)
  const [orderStatusLabel, setOrderStatusLabel] = useState('')
  const [isCanceledOrder, setIsCanceledOrder] = useState(false)
  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(false)
  const [isOverdistance, setIsOverdistance] = useState<number>(0)
  const [grandTotal, setGrandTotal] = useState<number>(0)

  const userRole = localStorage.getItem('userRole') as string

  const {
    isLoadingPage,
    orderDetail,
    store,
    selectedStore,
    setSelectedStore,
    member,
    selectedMember,
    setSelectedMember,
    sales,
    selectedSales,
    setSelectedSales,
    setSearchSales,
    vendor,
    selectedVendor,
    setSelectedVendor,
    item,
    isLoadingItem,
    setSearchItem,
    setSearchPemasangan,
    getItem,
    template,
  } = useOrderLookups({
    apiUrl,
    apiChat,
    orderId: params.id,
    updatePageTitle,
    paymentTypeValue,
    setPaymentTypeValue,
    setOrderForm,
    setReceiptFiles,
    setIsOverdistance,
  })

  const { isLoading, handleUpdateOrder, handleCancelOrder } = useUpdateOrderSubmit({
    apiUrl,
    apiChat,
    orderId: params.id,
    orderForm,
    isOverdistance,
    receiptFiles,
    template,
    orderStatusLabel,
    userRole,
    orderDetail,
    isCanceledOrder,
    setIsCanceledOrder,
    navigate,
  })

  const orderFormHandler = (e: any) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value,
    })
  }

  const orderDetailsFormHandler = (e: any, index: number) => {
    setOrderForm((prev) => {
      const cache = { ...prev }
      cache.order_details[index] = {
        ...cache.order_details[index],
        [e.target.name]: e.target.value,
      }
      return cache
    })
  }

  const handleCheckboxChange = (isChecked: boolean) => {
    setIsOverdistance(isChecked ? 1 : 0)
  }

  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      is_overdistance: isOverdistance,
      additional_fee: 25000,
    }))
  }, [isOverdistance])

  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      store_id: selectedStore?.value ?? null,
    }))
  }, [selectedStore])

  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      project_address: selectedMember?.address_1 ?? '',
      project_number:
        (isWhatsapp ? selectedMember?.whatsapp_number : selectedMember?.phone_number) ?? '',
      member_id: selectedMember?.value ?? null,
    }))
  }, [selectedMember, isWhatsapp])

  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      sales_id: selectedSales?.value ?? null,
    }))
  }, [selectedSales])

  const handleChangeVendor = (newValue: any) => {
    if (selectedVendor?.value !== null) {
      Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah anda sudah mengkonfirmasi dengan vendor terkait mengenai pergantian alokasi vendor survey/pengerjaan?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        confirmButtonColor: '#6b9230',
        cancelButtonText: 'Tidak',
        cancelButtonColor: '#a30014',
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedVendor(newValue)
        }
      })
    } else {
      setSelectedVendor(newValue)
    }
  }

  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      vendor_id: selectedVendor?.value ?? null,
    }))
  }, [selectedVendor])

  useEffect(() => {
    setOrderForm((prev) => ({
      ...prev,
      payment_type: paymentTypeValue[0] === 'gratis' ? 'gratis' : paymentTypeValue[1],
    }))
  }, [paymentTypeValue])

  // Status mapping
  useEffect(() => {
    const storedStatus = localStorage.getItem('statusData')
    const statusData = storedStatus ? JSON.parse(storedStatus) : []

    const determineStatus = () => {
      const hasQuotation = orderDetail?.quotation?.length > 0
      const specialQuotation = orderDetail?.quotation?.[0]?.quotation_special === 1
      const receiptQuotations =
        orderDetail?.quotation?.[0]?.quotation_receipt?.map(
          (receipt: any) => receipt?.receipt_quotation || null
        ) || []

      switch (true) {
        case paymentTypeValue.includes('gratis') ||
          paymentTypeValue.includes('pemasangan_tanpa_survey'):
          return 'WORKREQ'

        case paymentTypeValue.includes('survey'):
          if (!hasQuotation && !specialQuotation) {
            return 'SURVEYREQ'
          } else if (hasQuotation && !specialQuotation) {
            return 'WORKREQ'
          } else if (hasQuotation && specialQuotation) {
            if (
              receiptQuotations[0] !== null &&
              receiptQuotations[1] === null &&
              receiptQuotations[2] === null
            )
              return 'WORKREQSTEPONE'
            if (
              receiptQuotations[0] !== null &&
              receiptQuotations[1] !== null &&
              receiptQuotations[2] === null
            )
              return 'WORKREQSTEPTWO'
            if (
              receiptQuotations[0] !== null &&
              receiptQuotations[1] !== null &&
              receiptQuotations[2] !== null
            )
              return 'WORKREQSTEPTHREE'
            return 'WORKREQ'
          }
          break

        case isCanceledOrder:
          return 'CLOSE'

        default:
          return 'WORKREQ'
      }
    }

    const status = determineStatus()
    const desiredStatus = statusData.find((statuses: any) => statuses.category === status)
    setOrderStatusLabel(desiredStatus?.description)
    const statusId = desiredStatus?.value

    setOrderForm((prev) => ({
      ...prev,
      project_status_id: statusId,
    }))
  }, [paymentTypeValue, isCanceledOrder, orderDetail])

  const today = new Date().toISOString().split('T')[0]

  const calcEachDetails = () => {
    const now = new Date()

    setOrderForm((prev) => {
      const order_details = prev.order_details.map((detail) => {
        let newDetail = { ...detail }

        if (detail.item) {
          const { item: it, quantity } = detail
          const { prices, default_price } = it

          const validPrices = prices.filter((price) => {
            const start = new Date(price.periodic_start)
            const end = new Date(price.periodic_end)
            return now >= start && now <= end
          })

          const applicablePrice = validPrices
            .filter((price) => quantity >= +price.min_order)
            .sort((a, b) => +b.min_order - +a.min_order)[0]

          const unitPrice =
            applicablePrice && quantity >= +applicablePrice.min_order
              ? +applicablePrice.price
              : +default_price || 0

          const total = unitPrice * quantity

          newDetail = { ...newDetail, unit_price: unitPrice.toString(), total: total.toString() }
        }

        return newDetail
      })

      return { ...prev, order_details }
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...receiptFiles]
      const mergedFiles = existingFiles.concat(file)
      const { length: existingFilesLength } = existingFiles
      const { length: fileListLength } = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setReceiptFiles(mergedFiles)
    }
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField?.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidences = [...receiptFiles]
    newEvidences.splice(index, 1)
    setReceiptFiles(newEvidences)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleFileClick = (index: number) => {
    setPreviewImage(receiptFiles[index]?.name)
    setVisible(true)
    setSelectedFileIndex(index)
  }

  const addOrderDetails = () => {
    const newDetail = {
      id: null,
      item: null,
      item_id: null,
      item_code: '',
      item_name: '',
      quantity: 1,
      unit_price: null,
      total: null,
      item_notes: null,
    }

    setOrderForm((prev) => {
      const cache = { ...prev }
      cache.order_details.push(newDetail)
      return cache
    })

    getItem()
  }

  const handleRemoveForm = (index: any) => {
    setOrderForm((prev) => {
      const cache = { ...prev }
      cache.order_details.splice(index, 1)
      return cache
    })

    getItem()
  }

  useEffect(() => {
    textAreaRefs.current.forEach((textarea: any) => {
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    })
  }, [orderForm])

  const calculatedGrandTotalOrder = () => {
    const calculatedTotal = orderForm.order_details.reduce((accumulator, element) => {
      let totalOrderAmount = 0
      let biayaSurvey = 0

      const total = element.total ? parseInt(element.total) : 0

      if (paymentTypeValue[0] === 'gratis') {
        biayaSurvey = 0
        totalOrderAmount = 0
      } else if (paymentTypeValue[1] === 'survey') {
        biayaSurvey = 99000
        totalOrderAmount = 0
      } else {
        biayaSurvey = 0
        totalOrderAmount = total
      }

      const calculatedGrandTotal = totalOrderAmount + biayaSurvey

      return paymentTypeValue[1] === 'pemasangan_tanpa_survey'
        ? accumulator + calculatedGrandTotal
        : calculatedGrandTotal
    }, 0)

    const additionalFee = Number(orderForm.additional_fee)
    return isOverdistance === 1 ? calculatedTotal + additionalFee : calculatedTotal
  }

  useEffect(() => {
    const total = calculatedGrandTotalOrder()
    setGrandTotal(total)
  }, [orderForm.order_details, orderForm.additional_fee, paymentTypeValue])

  return (
    <section id='update-order'>
      <Spin
        spinning={isLoadingPage}
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      >
        <Card className='mb-5'>
          <Card.Body>
            <OrderCustomerSection
              orderDetail={orderDetail}
              orderForm={orderForm}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
              store={store}
              paymentTypeValue={paymentTypeValue as [string, string]}
              setPaymentTypeValue={(val) => setPaymentTypeValue(val)}
              selectedMember={selectedMember}
              setSelectedMember={setSelectedMember}
              member={member}
              isWhatsapp={isWhatsapp}
              setIsWhatsapp={setIsWhatsapp}
              orderFormHandler={orderFormHandler}
              isOverdistance={isOverdistance}
              handleCheckboxChange={handleCheckboxChange}
              selectedSales={selectedSales}
              setSelectedSales={setSelectedSales}
              sales={sales}
              setSearchSales={setSearchSales}
            />

            {orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey' ? (
              <Row className='table-order-header d-flex align-items-center mb-5'>
                <Col
                  xs={12}
                  md={4}
                  lg={4}
                  xl={4}
                  xxl={4}
                  className='request-date order-2 order-md-1'
                >
                  <Form.Group>
                    <Form.Label>Nama Vendor :</Form.Label>
                    <Select
                      name='vendor'
                      id='vendor'
                      className='form-control p-0 form-item-name'
                      classNamePrefix='select'
                      placeholder='Pilih/Ketik Nama Vendor'
                      isSearchable={true}
                      isClearable={true}
                      options={vendor}
                      value={{
                        value: selectedVendor?.value ?? null,
                        label: selectedVendor?.label ?? '',
                      }}
                      onChange={(newValue) => handleChangeVendor(newValue)}
                    />
                  </Form.Group>
                  <Form.Text className='fs-8 text-transparent'>
                    *Tanggal Request{' '}
                    <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                    pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                  </Form.Text>
                </Col>

                <Col xs={12} md={4} lg={4} xl={4} xxl={4} className='request-date'>
                  <Form.Group>
                    <Form.Label>Tanggal Request</Form.Label>
                    <Form.Control
                      name='request_survey'
                      type='date'
                      value={orderForm.request_survey}
                      readOnly={true}
                      onChange={(e) => orderFormHandler(e)}
                      min={today}
                    />
                    <Form.Text className='fs-8 text-dark-danger'>
                      *Tanggal Request{' '}
                      <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                      pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col
                  xs={12}
                  md={4}
                  lg={4}
                  xl={4}
                  xxl={4}
                  className='text-start order-status order-1 order-md-2'
                >
                  <h1 className='fs-3 fw-bold'>
                    STATUS ORDER :{' '}
                    {orderDetail?.quotation[0]?.quotation_files?.length ? (
                      <span className='fw-bold text-success'>
                        {`${orderDetail?.status?.description}`}{' '}
                        <span className='text-dark'>( Sudah dibayar )</span>
                      </span>
                    ) : (
                      <span className='fw-bold text-success'>
                        {`${orderDetail?.status?.description}`}{' '}
                        <span className='text-dark'>( Belum dibayar )</span>
                      </span>
                    )}
                  </h1>
                </Col>
              </Row>
            ) : (
              <Row className='table-order-header d-flex align-items-center mb-5'>
                <Col
                  xs={12}
                  md={3}
                  lg={3}
                  xl={3}
                  xxl={3}
                  className='request-date order-2 order-md-1'
                >
                  <Form.Group>
                    <Form.Label>Nama Vendor :</Form.Label>
                    <Select
                      name='vendor'
                      id='vendor'
                      className='form-control p-0 form-item-name'
                      classNamePrefix='select'
                      placeholder='Pilih/Ketik Nama Vendor'
                      isSearchable={true}
                      isClearable={true}
                      options={vendor}
                      value={{
                        value: selectedVendor?.value ?? null,
                        label: selectedVendor?.label ?? '',
                      }}
                      onChange={(newValue) => handleChangeVendor(newValue)}
                    />
                  </Form.Group>
                  <Form.Text className='fs-8 text-transparent'>
                    *Tanggal Request{' '}
                    <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                    pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                  </Form.Text>
                </Col>

                <Col xs={12} md={3} lg={3} xl={3} xxl={3} className='request-date'>
                  <Form.Group>
                    <Form.Label>Tanggal Request</Form.Label>
                    <Form.Control
                      name='request_survey'
                      type='date'
                      value={orderForm.request_survey}
                      onChange={(e) => orderFormHandler(e)}
                      min={today}
                    />
                    <Form.Text className='fs-8 text-dark-danger'>
                      *Tanggal Request{' '}
                      <span className='fw-bolder text-decoration-underline'>bukan</span> tanggal
                      pasti. Konfirmasi kunjungan dilakukan oleh Vendor
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col
                  xs={12}
                  md={3}
                  lg={3}
                  xl={3}
                  xxl={3}
                  className='order-status order-1 order-md-2'
                >
                  <h1 className='fs-3 fw-bold'>
                    STATUS ORDER :{' '}
                    <span className='fw-bold text-success'>{orderDetail?.status?.description}</span>
                  </h1>
                </Col>

                <Col
                  xs={12}
                  md={3}
                  lg={3}
                  xl={3}
                  xxl={3}
                  className='button-add text-end order-3 order-md-3'
                >
                  <button onClick={() => addOrderDetails()}>Tambah Order</button>
                </Col>
              </Row>
            )}

            {orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey' ? (
              <QuotationOverviewSection
                orderDetail={orderDetail}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
                visible={visible}
                setVisible={setVisible}
                visibleQuotationReceipt={visibleQuotationReceipt}
                setVisibleQuotationReceipt={setVisibleQuotationReceipt}
                visibleQuotationFiles={visibleQuotationFiles}
                setVisibleQuotationFiles={setVisibleQuotationFiles}
                apiUrl={apiUrl}
              />
            ) : (
              <OrderDetailsSection
                orderForm={orderForm}
                setOrderForm={setOrderForm}
                paymentTypeValue={paymentTypeValue as [string, string]}
                isLoadingItem={isLoadingItem}
                item={item}
                textAreaRefs={textAreaRefs}
                evidenceRef={evidenceRef}
                setSearchItem={setSearchItem}
                setSearchPemasangan={setSearchPemasangan}
                orderDetailsFormHandler={orderDetailsFormHandler}
                calcEachDetails={calcEachDetails}
                handleRemoveForm={handleRemoveForm}
                isOverdistance={isOverdistance}
                grandTotal={grandTotal}
                handleImageClick={handleImageClick}
                handleFileChange={handleFileChange}
                receiptFiles={receiptFiles}
                handleFileClick={handleFileClick}
                handleRemoveFile={handleRemoveFile}
                selectedFileIndex={selectedFileIndex ?? 0}
                previewImage={previewImage}
                visible={visible}
                setVisible={setVisible}
                apiUrl={apiUrl}
              />
            )}

            <div className='button-submit d-flex justify-content-center align-items-center mt-5'>
              <Button onClick={() => handleUpdateOrder()} disabled={isLoading} variant='dark-primary'>
                {orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey'
                  ? isLoading
                    ? 'Submitting..'
                    : 'Request Pengerjaan Ke Vendor Terkait'
                  : isLoading
                    ? 'Submitting..'
                    : 'Submit Order & Email'}
              </Button>

              {orderDetail?.quotation?.length >= 1 && orderDetail?.payment_type === 'survey' && (
                <Button onClick={handleCancelOrder} disabled={isLoading} variant='dark-danger'>
                  Close Order
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Spin>
    </section>
  )
}

export { UpdateOrderHO }
