import React from 'react'
import {Tooltip, OverlayTrigger, Button} from 'react-bootstrap'
import {Tag} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faSearch,
  faPen,
  faCheckCircle,
  faEnvelope,
  faPrint,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons'
import {DataType} from '../types'

export interface UseOrderColumnsProps {
  userRole: string
  statusFilters: any[]
  navigate: (to: string) => void
  orderData: DataType[]
  fetchOrderData: (order_id: number | null) => Promise<void>
  getVendor: (store_id?: number | null) => Promise<void>
  exportToPDF: (order_id: number, receipt_quotation: string, customer_name: string) => void
  setShowModal: (show: boolean) => void
  setModalType: (type: number) => void
  setActiveKey: (key: number) => void
  setSelectedCSI: (val: any) => void
  selectedPaymentReceiptStatus?: any
  selectedOrderStatus?: any
  selectedPaymentQuotationStatus?: any
}

export const useOrderColumns = ({
  userRole,
  statusFilters,
  navigate,
  orderData,
  fetchOrderData,
  getVendor,
  exportToPDF,
  setShowModal,
  setModalType,
  setActiveKey,
  setSelectedCSI,
  selectedPaymentReceiptStatus,
  selectedOrderStatus,
  selectedPaymentQuotationStatus,
}: UseOrderColumnsProps): ColumnsType<DataType> => {
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>
  const columns: ColumnsType<DataType> = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      width: 100,
      sorter: (a: DataType, b: DataType) => a.order_id - b.order_id,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
    },
    !['Store Staff', 'Store CS'].includes(userRole) && {
      title: 'Nama Toko',
      dataIndex: 'assign_from',
      key: 'assign_from',
      align: 'left',
      className: 'col_order_id',
      width: 120,
      onFilter: (value: DataType, record: DataType) => record.assign_from.includes(String(value)),
      sorter: (a: DataType, b: DataType) => a.assign_from.length - b.assign_from.length,
    },
    {
      title: 'Nama Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'center',
      className: 'col_order_id',
      onFilter: (value: DataType, record: DataType) => record.vendor_name.includes(String(value)),
      sorter: (a: DataType, b: DataType) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Nama Customer',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      width: 140,
      render: (costumer_name: string) => costumer_name || '-',
      onFilter: (value: any, record: DataType) =>
        (record.costumer_name || '').toLowerCase().includes(String(value).toLowerCase()),
      sorter: (a: DataType, b: DataType) =>
        (a.costumer_name || '').localeCompare(b.costumer_name || ''),
    },
    {
      title: 'No. Telp / WA',
      dataIndex: 'phone_number',
      key: 'phone_number',
      align: 'left',
      width: 140,
      render: (phone_number: string) => phone_number || '-',
      sorter: (a: DataType, b: DataType) =>
        String(a.phone_number || '').localeCompare(String(b.phone_number || '')),
    },
    {
      title: 'Status Pembayaran Receipt',
      dataIndex: 'payment_receipt',
      key: 'payment_receipt',
      align: 'left',
      width: 200,
      filters: [
        {text: 'UNPAID', value: '0'},
        {text: 'PAID', value: '1'},
      ],
      filterMultiple: true,
      filteredValue: selectedPaymentReceiptStatus.length > 0 ? selectedPaymentReceiptStatus : null,
      sorter: (a: DataType, b: DataType) => a.payment_receipt.length - b.payment_receipt.length,
      render: (payment_receipt: string) => {
        if (!payment_receipt) return '-'
        const isPaid = payment_receipt.toUpperCase() === 'PAID'
        return <Tag color={isPaid ? 'green' : 'red'}>{payment_receipt}</Tag>
      },
    },
    {
      title: 'Status Order',
      dataIndex: 'order_status_label',
      key: 'order_status_label',
      align: 'left',
      filters: statusFilters,
      filterMultiple: true,
      filteredValue: selectedOrderStatus.length > 0 ? selectedOrderStatus : null,
      sorter: (a: DataType, b: DataType) =>
        a.order_status_label.length - b.order_status_label.length,
      render: (order_status_label: string) => {
        const orderStatus = order_status_label
        let color = ''

        switch (orderStatus) {
          case 'UNPAID':
            color = 'red'
            break
          case 'PAID':
            color = 'green'
            break
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
    },
    {
      title: 'Status Pembayaran Quotation',
      dataIndex: 'payment_quotation',
      key: 'payment_quotation',
      align: 'left',
      width: 230,
      filters: [
        {text: 'UNPAID', value: '0'},
        {text: 'PAID', value: '1'},
      ],
      filteredValue:
        selectedPaymentQuotationStatus.length > 0 ? selectedPaymentQuotationStatus : null,
      sorter: (a: DataType, b: DataType) => a.payment_quotation.length - b.payment_quotation.length,
      render: (payment_quotation: string) => {
        if (!payment_quotation) return '-'
        const isPaid = payment_quotation.toUpperCase() === 'PAID'
        return <Tag color={isPaid ? 'green' : 'red'}>{payment_quotation}</Tag>
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 170,
      render: (record: any) => {
        const id = record.order_id
        const handlePrintout = (status: string) => {
          if (['PICKLIST'].includes(status)) {
            navigate(`/order/printout-order-picklist/${id}`)
          } else if (
            ['BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(status)
          ) {
            navigate(`/order/printout-order-dipesan/${id}`)
          }
        }

        const handleDetailId = () => {
          navigate(`/order/detail-order/${id}`)
        }

        const handleUpdateId = () => {
          navigate(`/order/update-order/${id}`)
        }

        const handleShowModal = (id: number, type: number) => {
          const selected = orderData.find((order) => order.order_id === id)

          if (selected) {
            fetchOrderData(selected.order_id)
            getVendor(selected.store_id)
            setShowModal(true)
            setModalType(type)
          }
        }

        return (
          <div className='d-flex justify-content-center gap-2'>
            {['PICKLIST', 'BOOK', 'BOOKED', 'SURVEYREQ', 'SURVEYSTART', 'SURVEYDONE'].includes(
              record.order_status
            ) &&
              !['Admin HO', 'Super User'].includes(userRole) && (
                <OverlayTrigger
                  placement='bottom'
                  delay={{show: 250, hide: 400}}
                  overlay={renderTooltip(
                    `${record.print_counter === 0 ? 'Print Order' : 'Reprint Order'}`
                  )}
                >
                  <Button
                    className='button-request'
                    variant='warning'
                    onClick={() => handlePrintout(record.order_status)}
                  >
                    <FontAwesomeIcon className='text-white' icon={faPrint} fontSize={'13px'} />
                  </Button>
                </OverlayTrigger>
              )}

            {!['Sales', 'Admin HO', 'Super User'].includes(userRole) && (
              <>
                {['BOOK', 'BOOKED'].includes(record.order_status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Cancel Order')}
                  >
                    <Button
                      className='button-cancel'
                      variant='danger'
                      onClick={() => handleShowModal(id, 3)}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faXmarkCircle}
                        fontSize={'13px'}
                      />
                    </Button>
                  </OverlayTrigger>
                )}
              </>
            )}

            {['Super User', 'Admin HO'].includes(userRole) ? (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Cancel Order')}
              >
                <Button
                  className='button-cancel'
                  variant='danger'
                  onClick={() => handleShowModal(id, 3)}
                >
                  <FontAwesomeIcon className='text-white' icon={faXmarkCircle} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            ) : (
              <></>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Order')}
            >
              <a
                href={`/order/detail-order/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-detail'
                onClick={(e) => {
                  e.preventDefault()
                  handleDetailId()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {!['Sales'].includes(userRole) && (
              <>
                {['PICKLIST', 'BOOK', 'BOOKED'].includes(record.order_status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Update Order')}
                  >
                    <a
                      href={`/order/update-order/${id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn btn-primary button-edit'
                      onClick={(e) => {
                        e.preventDefault()
                        handleUpdateId()
                      }}
                    >
                      <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                    </a>
                  </OverlayTrigger>
                )}
              </>
            )}

            {[
              'WORKREQ',
              'SURVEYREQ',
              'QUOTEOUT',
              'QUOTATIONPAID',
              'QUOTATIONPAIDSTEPONE',
              'QUOTATIONPAIDSTEPTWO',
              'QUOTATIONPAIDSTEPTHREE',
              'WORKENDSTEPONE',
              'WORKENDSTEPTWO',
              'WORKENDSTEPTHREE',
            ].includes(record.order_status) && ['Super User', 'Admin HO'].includes(userRole) ? (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Update Order')}
              >
                <a
                  href={`/order/update-order/${id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn btn-primary button-edit'
                  onClick={(e) => {
                    e.preventDefault()
                    handleUpdateId()
                  }}
                >
                  <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                </a>
              </OverlayTrigger>
            ) : (
              <></>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Aktivitas Email')}
            >
              <Button
                variant='success'
                className='button-email'
                onClick={() => {
                  handleShowModal(id, 1)
                  setActiveKey(1)
                  setSelectedCSI({
                    value: null,
                    label: 'Pilih Format CSI',
                  })
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faEnvelope} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            {['QUOTATIONPAID', 'QUOTEOUT', 'WORKENDSTEPONE', 'WORKENDSTEPTWO'].includes(
              record.order_status
            ) && userRole === 'Store CS' ? (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Verifikasi Pembayaran Quotation')}
              >
                <Button
                  variant='primary'
                  className='button-verif'
                  onClick={() => handleShowModal(id, 2)}
                >
                  <FontAwesomeIcon className='text-white' icon={faCheckCircle} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            ) : (
              <></>
            )}

            {['QUOTEIN', 'UNPAID', 'PAID', 'QUOTEOUT', 'QUOTATIONPAID'].includes(
              record.order_status
            ) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Cetak PDF Quotation')}
              >
                <Button
                  className='button-request'
                  variant='warning'
                  onClick={() =>
                    exportToPDF(record.order_id, record.payment_quotation, record.costumer_name)
                  }
                >
                  <FontAwesomeIcon className='text-white' icon={faPrint} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        )
      },
    },
  ].filter(Boolean) as ColumnsType<DataType>

  return columns
}
