import React from 'react'
import type {ColumnsType} from 'antd/es/table'
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faPen,
  faTrash,
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import {DataType} from '../types'
import {deleteSalesApi, updateSalesStatusApi} from '../services/newSalesService'

interface GetSalesColumnsParams {
  currentPage: number
  pageSize: number
  navigate: (path: string) => void
  apiUrl?: string
}

export const getSalesColumns = ({
  currentPage,
  pageSize,
  navigate,
  apiUrl,
}: GetSalesColumnsParams): ColumnsType<DataType> => {
  const renderTooltip = (title: string) => <Tooltip id='button-tooltip'>{title}</Tooltip>

  return [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: 70,
      className: 'col_order_id',
      sorter: (a, b) => a.no - b.no,
      render: (_text: any, _record: any, index: number) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Sales ID',
      dataIndex: 'sales_id',
      key: 'sales_id',
      align: 'center',
      width: 70,
      className: 'col_order_id',
      sorter: (a, b) => a.sales_id - b.sales_id,
    },
    {
      title: 'Assign From Store',
      dataIndex: 'store_name',
      key: 'store_name',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.store_name.includes(String(value)),
      sorter: (a, b) => a.store_name.length - b.store_name.length,
    },
    {
      title: 'Nama Sales',
      dataIndex: 'full_name',
      key: 'full_name',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.full_name.includes(String(value)),
      sorter: (a, b) => a.full_name.length - b.full_name.length,
    },
    {
      title: 'Brands',
      dataIndex: 'sales_brand',
      key: 'sales_brand',
      align: 'left',
      width: 120,
      onFilter: (value, record) => record.sales_brand.includes(String(value)),
      sorter: (a, b) => a.sales_brand.length - b.sales_brand.length,
    },
    {
      title: 'Category',
      dataIndex: 'sales_category',
      key: 'sales_category',
      align: 'left',
      width: 120,
      onFilter: (value, record) => record.sales_category.includes(String(value)),
      sorter: (a, b) => a.sales_category.length - b.sales_category.length,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'left',
      width: 110,
      onFilter: (value, record) => record.is_active.includes(String(value)),
      sorter: (a, b) => a.is_active.length - b.is_active.length,
      filters: [
        {text: 'ACTIVE', value: 'ACTIVE'},
        {text: 'INACTIVE', value: 'INACTIVE'},
      ],
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 45,
      render: (record) => {
        const id = record.sales_id
        const isActive = record.is_active
        const isDeleted = record.deleted_at

        const handleUpdateId = () => {
          navigate(`/sales/update-sales/${id}`)
        }

        const handleDeleteId = () => {
          Swal.fire({
            title: 'Konfirmasi Penghapusan Data Sales',
            text: 'Anda akan menghapus data sales ini. Harap diperhatikan bahwa seluruh informasi terkait sales ini akan hilang dan tidak dapat dipulihkan. Apakah Anda yakin?',
            icon: 'error',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Hapus Permanen',
            denyButtonText: 'Batal',
            denyButtonColor: '#183383',
            confirmButtonColor: '#6E010F',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                deleteSalesApi(apiUrl, id)
                  .then(() => {
                    Swal.fire({
                      title: 'Berhasil',
                      text: 'Akun sales berhasil dihapus',
                      icon: 'success',
                    }).then(() => {
                      window.location.reload()
                    })
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.response?.data?.message,
                      icon: 'error',
                    })
                  })
              }
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error',
                text: error.response?.data?.message,
                icon: 'error',
              })
            })
        }

        const handleActive = () => {
          Swal.fire({
            title: 'Konfirmasi Aktivasi Akun Sales',
            text: 'Anda akan mengaktifkan kembali akun sales ini. Sales akan memiliki akses penuh.',
            icon: 'question',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya, Aktifkan',
            denyButtonText: 'Batal',
            denyButtonColor: '#6E010F',
            confirmButtonColor: '#3D6500',
          })
            .then((willActive) => {
              if (willActive.value) {
                updateSalesStatusApi(apiUrl, id, 1)
                  .then(() => {
                    Swal.fire({
                      title: 'Berhasil',
                      text: 'Berhasil mengaktifkan akun sales',
                      icon: 'success',
                      showConfirmButton: false,
                    }).then(() => {
                      window.location.reload()
                    })
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.response?.data?.message,
                      icon: 'error',
                    })
                  })
              }
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error',
                text: error.response?.data?.message,
                icon: 'error',
              })
            })
        }

        const handleNonActive = () => {
          Swal.fire({
            title: 'Konfirmasi Penonaktifan Akun',
            text: 'Anda akan menonaktifkan akun sales ini. Tindakan ini akan membatasi akses sales terkait. Lanjutkan?',
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya, Nonaktifkan',
            denyButtonText: 'Batal',
            denyButtonColor: '#183383',
            confirmButtonColor: '#6E010F',
          })
            .then((willActive) => {
              if (willActive.value) {
                updateSalesStatusApi(apiUrl, id, 0)
                  .then(() => {
                    Swal.fire({
                      title: 'Berhasil',
                      text: 'Berhasil menonaktifkan akun sales',
                      icon: 'success',
                      showConfirmButton: false,
                    }).then(() => {
                      window.location.reload()
                    })
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.response?.data?.message,
                      icon: 'error',
                    })
                  })
              }
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error',
                text: error.response?.data?.message,
                icon: 'error',
              })
            })
        }

        return (
          <div className='button-wrapper d-flex justify-content-center gap-3'>
            {isActive === 'NON ACTIVE' && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Aktifkan Sales')}
              >
                <Button className='button-active' variant='success' onClick={handleActive}>
                  <FontAwesomeIcon className='text-white' icon={faCircleCheck} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}

            {isActive === 'ACTIVE' && !isDeleted && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Nonaktifkan Sales')}
              >
                <Button className='button-disable' variant='danger' onClick={handleNonActive}>
                  <FontAwesomeIcon className='text-white' icon={faCircleXmark} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Edit Sales')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdateId}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Hapus Sales')}
            >
              <Button className='button-delete' variant='danger' onClick={handleDeleteId}>
                <FontAwesomeIcon className='text-white' icon={faTrash} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>
          </div>
        )
      },
    },
  ]
}
