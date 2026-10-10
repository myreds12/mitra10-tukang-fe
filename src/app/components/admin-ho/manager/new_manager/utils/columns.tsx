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
import {deleteManagerApi, updateManagerStatusApi} from '../services/newManagerService'

interface GetManagerColumnsParams {
  currentPage: number
  pageSize: number
  navigate: (path: string) => void
  apiUrl?: string
}

export const getManagerColumns = ({
  currentPage,
  pageSize,
  navigate,
  apiUrl,
}: GetManagerColumnsParams): ColumnsType<DataType> => {
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
      title: 'Manager ID',
      dataIndex: 'manager_id',
      key: 'manager_id',
      align: 'center',
      width: 70,
      className: 'col_order_id',
      sorter: (a, b) => a.manager_id - b.manager_id,
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
      title: 'Nama Manager',
      dataIndex: 'full_name',
      key: 'full_name',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.full_name.includes(String(value)),
      sorter: (a, b) => a.full_name.length - b.full_name.length,
    },
    {
      title: 'NIK',
      dataIndex: 'nik',
      key: 'nik',
      align: 'left',
      width: 140,
      onFilter: (value, record) => record.nik.includes(String(value)),
      sorter: (a, b) => a.nik.length - b.nik.length,
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
        const id = record.manager_id
        const isActive = record.is_active

        const handleUpdateId = () => {
          navigate(`/manager/update-manager/${id}`)
        }

        const handleDeleteId = () => {
          Swal.fire({
            title: `Apakah anda yakin akan mengubah status manager ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            confirmButtonColor: 'gray',
            denyButtonText: 'Cancel',
          })
            .then((willDelete) => {
              if (willDelete.value) {
                deleteManagerApi(apiUrl, id)
                  .then((response) => {
                    Swal.fire({
                      title: 'Success',
                      text: response.data.message,
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
            title: `Apakah anda yakin akan mengaktifkan Manager ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Tidak',
          })
            .then((willActive) => {
              if (willActive.value) {
                updateManagerStatusApi(apiUrl, id, 1)
                  .then(() => {
                    Swal.fire({
                      title: 'Success',
                      text: 'Berhasil mengaktifkan sales',
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
            title: `Apakah anda yakin akan menonaktifkan manager ini ?`,
            icon: 'warning',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: 'Ya',
            denyButtonText: 'Tidak',
          })
            .then((willActive) => {
              if (willActive.value) {
                updateManagerStatusApi(apiUrl, id, 0)
                  .then(() => {
                    Swal.fire({
                      title: 'Success',
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
            {isActive !== 'ACTIVE' && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Aktifkan Manager')}
              >
                <Button className='button-active' variant='success' onClick={handleActive}>
                  <FontAwesomeIcon className='text-white' icon={faCircleCheck} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}

            {isActive !== 'NON ACTIVE' && (
              <OverlayTrigger
                placement='bottom'
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Nonaktifkan Manager')}
              >
                <Button className='button-disable' variant='danger' onClick={handleNonActive}>
                  <FontAwesomeIcon className='text-white' icon={faCircleXmark} fontSize={'13px'} />
                </Button>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Edit Manager')}
            >
              <Button variant='primary' className='button-edit' onClick={handleUpdateId}>
                <FontAwesomeIcon className='text-white' icon={faPen} fontSize={'13px'} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement='bottom'
              delay={{show: 250, hide: 400}}
              overlay={renderTooltip('Delete Manager')}
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
