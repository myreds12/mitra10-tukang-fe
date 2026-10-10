import React from 'react'
import type {ColumnsType} from 'antd/es/table'
import {Tag} from 'antd'
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBook,
  faFile,
  faPen,
  faXmarkCircle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import {DataType} from '../types'

interface GetInvoiceColumnsParams {
  userRole: string
  navigate: (path: string) => void
  handleShowModal: (id: number, type: number) => void
  handleUpdateInvoice: (id: number, status: number, statusName: string) => void
}

export const getInvoiceColumns = ({
  userRole,
  navigate,
  handleShowModal,
  handleUpdateInvoice,
}: GetInvoiceColumnsParams): ColumnsType<DataType> => {
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  return [
    {
      title: 'Invoice ID',
      dataIndex: 'invoice_id',
      key: 'invoice_id',
      align: 'center',
      width: 100,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.invoice_id - b.invoice_id,
    },
    {
      title: 'Tanggal Invoice Terbit',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      align: 'center',
      width: 110,
      onFilter: (value, record) => record.invoice_date.includes(String(value)),
      sorter: (a, b) => a.invoice_date.length - b.invoice_date.length,
    },
    {
      title: 'Nama Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'center',
      width: 140,
      onFilter: (value, record) => record.vendor_name.includes(String(value)),
      sorter: (a, b) => a.vendor_name.length - b.vendor_name.length,
    },
    {
      title: 'Total Tagihan',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 100,
      className: 'col_order_id',
      defaultSortOrder: 'descend',
      sorter: (a, b) => {
        const valA = typeof a.amount === 'number' ? a.amount : Number(String(a.amount).replace(/[^0-9]/g, ''))
        const valB = typeof b.amount === 'number' ? b.amount : Number(String(b.amount).replace(/[^0-9]/g, ''))
        return valA - valB
      },
    },
    {
      title: 'Status Invoice',
      dataIndex: 'invoice_status',
      key: 'invoice_status',
      align: 'center',
      width: 140,
      onFilter: (value, record) => record.invoice_status.includes(String(value)),
      sorter: (a, b) => a.invoice_status.length - b.invoice_status.length,
      render: (invoice_status) => {
        const orderStatus = invoice_status
        let color = ''

        switch (orderStatus) {
          case 'UNPAID':
            color = 'red'
            break
          default:
            color = 'blue'
            break
        }

        return <Tag color={color}>{orderStatus}</Tag>
      },
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (record) => {
        const id = record.invoice_id

        const handleUpdateInvoicePage = () => {
          navigate(`/invoice/update-invoice/${id}`)
        }

        const handleDetailInvoicePage = () => {
          navigate(`/invoice/detail-invoice/${id}`)
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Detail Invoice')}
            >
              <a
                href={`/invoice/detail-invoice/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary button-detail'
                onClick={(e) => {
                  e.preventDefault()
                  handleDetailInvoicePage()
                }}
              >
                <FontAwesomeIcon className='text-white' icon={faBook} fontSize={'13px'} />
              </a>
            </OverlayTrigger>

            {[6].includes(record.status) && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Upload File Invoice')}
              >
                <Button
                  variant='primary'
                  className='button-verif'
                  onClick={() => handleShowModal(id, 2)}
                >
                  <FontAwesomeIcon className='text-white' icon={faFile} fontSize='13px' />
                </Button>
              </OverlayTrigger>
            )}

            {['Super User', 'Admin HO'].includes(userRole) && (
              <>
                {record.status === 1 && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Edit Invoice')}
                  >
                    <a
                      href={`/order/update-order/${id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn btn-primary button-edit'
                      onClick={(e) => {
                        e.preventDefault()
                        handleUpdateInvoicePage()
                      }}
                    >
                      <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
                    </a>
                  </OverlayTrigger>
                )}

                {![3, 6].includes(record.status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Tolak Invoice')}
                  >
                    <Button
                      className='button-cancel'
                      variant='danger'
                      onClick={() => handleShowModal(id, 1)}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faXmarkCircle}
                        fontSize='13px'
                      />
                    </Button>
                  </OverlayTrigger>
                )}

                {[2, 4].includes(record.status) && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Kirim Invoice ke Finance')}
                  >
                    <Button
                      variant='primary'
                      className='button-verif'
                      onClick={() => handleUpdateInvoice(id, 5, 'Invoice diberikan kepada Finance')}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faCheckCircle}
                        fontSize='13px'
                      />
                    </Button>
                  </OverlayTrigger>
                )}
              </>
            )}

            {['Finance'].includes(userRole) && (
              <>
                {record.status === 5 && (
                  <OverlayTrigger
                    placement='bottom'
                    delay={{show: 250, hide: 400}}
                    overlay={renderTooltip('Sudah dibayarkan')}
                  >
                    <Button
                      variant='primary'
                      className='button-verif'
                      onClick={() => handleUpdateInvoice(id, 6, 'Invoice sudah dibayarkan')}
                    >
                      <FontAwesomeIcon
                        className='text-white'
                        icon={faCheckCircle}
                        fontSize='13px'
                      />
                    </Button>
                  </OverlayTrigger>
                )}
              </>
            )}
          </div>
        )
      },
    },
  ]
}
