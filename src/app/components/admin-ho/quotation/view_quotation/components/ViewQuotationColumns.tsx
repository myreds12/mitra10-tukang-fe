import React from 'react'
import type {ColumnsType} from 'antd/es/table'
import {Tag} from 'antd'
import {OverlayTrigger, Tooltip, Button} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBook, faPen, faPrint, faTicket} from '@fortawesome/free-solid-svg-icons'
import {NavigateFunction} from 'react-router-dom'
import {DataType} from '../types'

interface ColumnOptions {
  navigate: NavigateFunction
  userRole: string
  exportToPDF: (order_id: number, payment_status: string, customer_name: string) => void
  handleShowModal: (id: number, type: number) => void
}

export const getViewQuotationColumns = ({
  navigate,
  userRole,
  exportToPDF,
  handleShowModal,
}: ColumnOptions): ColumnsType<DataType> => {
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  return [
    {
      title: 'Quotation ID',
      dataIndex: 'quotation_id',
      key: 'quotation_id',
      align: 'center',
      defaultSortOrder: 'descend',
      width: 100,
      sorter: (a, b) => a.quotation_id - b.quotation_id,
    },
    {
      title: 'Nama Toko',
      dataIndex: 'store_name',
      key: 'store_name',
      align: 'center',
      onFilter: (value, record) => record.store_name.includes(String(value)),
      sorter: (a, b) => a.store_name.length - b.store_name.length,
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      className: 'col_order_id',
      width: 100,
      sorter: (a, b) => a.order_id - b.order_id,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'date_order',
      key: 'date_order',
      align: 'center',
      sorter: (a, b) => new Date(a.date_order).getTime() - new Date(b.date_order).getTime(),
    },
    {
      title: 'Costumer Name',
      dataIndex: 'costumer_name',
      key: 'costumer_name',
      align: 'left',
      onFilter: (value, record) => record.costumer_name.includes(String(value)),
      sorter: (a, b) => a.costumer_name.length - b.costumer_name.length,
    },
    {
      title: 'Nama Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'left',
      onFilter: (value, record) => record.vendor_name.includes(String(value)),
      sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Status Pembayaran Quotation',
      dataIndex: 'payment_status',
      key: 'payment_status',
      align: 'left',
      width: 100,
      onFilter: (value, record) => record.payment_status.includes(String(value)),
      sorter: (a, b) => a.payment_status.length - b.payment_status.length,
    },
    {
      title: 'Receipt Quotation',
      dataIndex: 'receipt_quotation',
      key: 'receipt_quotation',
      align: 'left',
      onFilter: (value, record) => record.receipt_quotation.includes(String(value)),
      sorter: (a, b) => a.receipt_quotation.length - b.receipt_quotation.length,
    },
    {
      title: 'Tanggal Aktif Quotation',
      dataIndex: 'period_active',
      key: 'period_active',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.period_active).getTime() - new Date(b.period_active).getTime(),
    },
    {
      title: 'Umur Masa Quotation',
      dataIndex: 'countdown_to_expired',
      key: 'countdown_to_expired',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.countdown_to_expired).getTime() - new Date(b.countdown_to_expired).getTime(),
    },
    {
      title: 'Tanggal Quotation Expired',
      dataIndex: 'period_expired',
      key: 'period_expired',
      align: 'left',
      sorter: (a: DataType, b: DataType) =>
        new Date(a.period_expired).getTime() - new Date(b.period_expired).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'quotation_status',
      key: 'quotation_status',
      align: 'left',
      sorter: (a, b) => a.quotation_status.length - b.quotation_status.length,
    },
    {
      title: 'Status Order',
      dataIndex: 'order_status_label',
      key: 'order_status_label',
      align: 'left',
      render: (order_status_label) => {
        const orderStatus = order_status_label
        let color = ''

        switch (orderStatus) {
          case 'QUOTEIN':
            color = 'green'
            break
          case 'QUOTEOUT':
            color = 'lime'
            break
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
      onFilter: (value, record) => record.order_status_label.includes(String(value)),
      sorter: (a, b) => a.order_status_label.length - b.order_status_label.length,
    },
    {
      title: 'Grand Total Quotation',
      dataIndex: 'grand_total',
      key: 'grand_total',
      align: 'left',
      onFilter: (value, record) => record.grand_total.includes(String(value)),
      sorter: (a, b) => a.grand_total.length - b.grand_total.length,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      render: (record) => {
        const id = record.quotation_id

        const handleDetail = () => {
          navigate(`/quotation/detail-quotation/${id}`)
        }

        const handleEdit = () => {
          navigate(`/quotation/update-quotation/${id}`)
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Quotation')}
            >
              <a
                href={`/quotation/detail-quotation/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-detail'
                onClick={(e) => {
                  e.preventDefault()
                  handleDetail()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {['QUOTATIONDRAFT', 'QUOTEIN', 'QUOTEOUT', 'UNPAID', 'REJECTED', 'APPROVED'].includes(
              record.order_status
            ) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Edit Quotation')}
              >
                <a
                  href={`/quotation/update-quotation/${id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn btn-primary button-edit'
                  onClick={(e) => {
                    e.preventDefault()
                    handleEdit()
                  }}
                >
                  <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                </a>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Cetak PDF Quotation')}
            >
              <Button
                className='button-request'
                variant='warning'
                onClick={() =>
                  exportToPDF(record.order_id, record.payment_status, record.costumer_name)
                }
              >
                <FontAwesomeIcon className='text-white' icon={faPrint} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            {['QUOTEOUT'].includes(record.order_status) && ['Admin HO'].includes(userRole) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Pengajuan Diskon')}
              >
                <Button
                  variant='primary'
                  className='button-verif'
                  onClick={() => handleShowModal(id, 1)}
                >
                  <FontAwesomeIcon className='text-white' icon={faTicket} fontSize='13px' />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        )
      },
    },
  ]
}
