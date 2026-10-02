/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'

import {formatDateWithTimeZone} from '../../../helpers'

import axios from 'axios'
import Select, {components} from 'react-select'
import {Button} from 'react-bootstrap'
import {Tag, Checkbox, List, Pagination} from 'antd'

type Props = {
  notificationData: any[]
  currentPage: number
  pageSize: number
  totalData: number
  totalUnread: number
  status: StatusStorage[]
  selectedStatus: any[]
  loadingSearch: boolean
  handleSearch: () => void
  setPageSize: (size: number) => void
  setSelectedStatus: (element: any) => void
  getNotifications: (page: number, pageSize: number) => void
}

interface Notifications {
  id: number | null
  is_read: boolean
}

interface StatusStorage {
  value: number | null
  label: string
}

const Option = (props: any) => {
  return (
    <div>
      <components.Option {...props}>
        <input type='checkbox' checked={props.isSelected} onChange={() => null} />{' '}
        <label>{props.label}</label>
      </components.Option>
    </div>
  )
}

const HeaderNotificationsMenu: React.FC<Props> = ({
  notificationData,
  currentPage,
  pageSize,
  totalData,
  totalUnread,
  status,
  loadingSearch,
  selectedStatus,
  handleSearch,
  setPageSize,
  setSelectedStatus,
  getNotifications,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const role = localStorage.getItem('userRole') as string
  const customStyles = {multiValueRemove: (base: any) => ({...base, display: 'none'})}

  // State
  const [notifications, setNotifications] = useState<any[]>([])
  const [checked, setChecked] = useState<Notifications[]>([])
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false)
  const [isLoadingSubmitAll, setIsLoadingSubmitAll] = useState<boolean>(false)

  // Fetching Data
  useEffect(() => {
    setNotifications(notificationData)
    setChecked(notificationData.map((item: any) => ({id: item.id, is_read: item.is_read})))
  }, [notificationData])

  // Mapping Data
  const moduleTypeMap: {
    [key: string]: {
      name: string
      url: (role: string) => string
      disabled: (role: string) => boolean
    }
  } = {
    ORDERS: {
      name: 'Pesanan',
      url: (role: string) =>
        ['Owner Vendor', 'Admin Vendor', 'Tukang'].includes(role)
          ? '/work-order/detail-work-order'
          : '/order/detail-order',
      disabled: () => false,
    },
    QUOTATION: {
      name: 'Quotation',
      url: () => '/quotation/detail-quotation',
      disabled: (role: string) =>
        ['Super User', 'Admin HO', 'Owner Vendor', 'Admin Vendor'].includes(role) ? false : true,
    },
    COMPLAINTS: {
      name: 'Pengaduan',
      url: (role: string) =>
        ['Owner Vendor', 'Admin Vendor'].includes(role)
          ? '/complaint/update-complaint'
          : '/complaint/detail-complaint',
      disabled: () => false,
    },
    RESCHEDULES: {
      name: 'Perubahan Jadwal',
      url: (role: string) =>
        ['Tukang'].includes(role)
          ? '/reschedule/detail-reschedule'
          : '/reschedule/update-reschedule',
      disabled: () => false,
    },
    REFUNDS: {
      name: 'Pengembalian Dana',
      url: () => '/refund/detail-refund',
      disabled: (role: string) =>
        ['Owner Vendor', 'Admin Vendor', 'Tukang'].includes(role) ? true : false,
    },
    INVOICES: {
      name: 'Invoice',
      url: () => '/invoice/detail-invoice',
      disabled: (role: string) =>
        ['Super User', 'Admin HO', 'Owner Vendor', 'Admin Vendor'].includes(role) ? false : true,
    },
    INCENTIVE: {
      name: 'Insentif',
      url: () => '/reports/report-insentif',
      disabled: (role: string) =>
        ['Owner Vendor', 'Admin Vendor', 'Tukang'].includes(role) ? true : false,
    },
    COMISSION_SALES_INCENTIVE: {
      name: 'Pengajuan Insentif',
      url: () => '/reports/report-insentif',
      disabled: (role: string) =>
        ['Owner Vendor', 'Admin Vendor', 'Tukang'].includes(role) ? true : false,
    },
    QUOTATION_PROMOTION: {
      name: 'Pengajuan Diskon Quotation',
      url: () => '/quotation/detail-request-discount',
      disabled: (role: string) =>
        ['Owner Vendor', 'Admin Vendor', 'Tukang'].includes(role) ? true : false,
    },
  }

  const actionMap: {[key: string]: (moduleType: string) => string} = {
    CREATE: (moduleType) => `Pembuatan ${moduleType} Baru`,
    UPDATE: (moduleType) => `Pembaruan ${moduleType}`,
  }

  // Handler
  const onCheckItemChange = (id: number | null) => {
    setChecked((prevChecked) =>
      prevChecked.map((item) => (item.id === id ? {...item, is_read: !item.is_read} : item))
    )
  }

  const handleChangeStatuses = (element: any) => {
    const selectedStatus = element.map((option: any) => ({
      value: option.value,
      label: option.label,
    }))
    setSelectedStatus(selectedStatus)
  }

  // Handle Submit Single Notification
  const handleSubmitOneData = async (notifId: number, is_read: boolean) => {
    setIsLoadingSubmit(true)

    try {
      const response = await axios.post(
        `${apiUrl}/notifications`,
        [{id: notifId, is_read}],
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )

      if (response.data.status === 200 || response.data.status === 201) {
        await getNotifications(currentPage, pageSize)
        return true
      }

      return false
    } catch (error) {
      return false
    } finally {
      setIsLoadingSubmit(false)
    }
  }

  // Handle Multiple Notification
  const handleSubmit = async () => {
    setIsLoadingSubmit(true)

    await axios
      .post(`${apiUrl}/notifications`, checked, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        if (response.data.status === 200 || response.data.status === 201) {
          setIsLoadingSubmit(false)
          getNotifications(currentPage, pageSize)
        } else {
          setIsLoadingSubmit(false)
        }
      })
      .catch((error) => {
        setIsLoadingSubmit(false)
      })
  }

  // Handle Submit All Notification
  const handleSubmitAllData = async () => {
    setIsLoadingSubmitAll(true)

    const payload = {
      check_all: 1,
      is_read: 1,
    }

    await axios
      .post(`${apiUrl}/notifications`, [payload], {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((response) => {
        if (response.data.status === 200 || response.data.status === 201) {
          setIsLoadingSubmitAll(false)
          getNotifications(currentPage, pageSize)
        } else {
          setIsLoadingSubmitAll(false)
        }
      })
      .catch((error) => {
        setIsLoadingSubmitAll(false)
      })
  }

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-450px'
      data-kt-menu='true'
    >
      <div className='d-flex justify-content-between align-items-center border border-bottom-2 p-5'>
        <h3 className='fs-5 fw-bold '>Notifications</h3>

        <div className='trigger-read d-flex align-items-center gap-3 '>
          <Tag className='fs-8 opacity-75 ' color='blue'>
            {`${totalUnread} Unread`}
          </Tag>
        </div>
      </div>

      <div className='d-flex align-items-center justify-content-between p-5 gap-2'>
        <Select
          className='w-100'
          components={{
            Option,
          }}
          placeholder='Pilih Status'
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          isMulti
          options={status}
          value={selectedStatus}
          styles={customStyles}
          onChange={(element) => handleChangeStatuses(element)}
        />

        <Button
          className='btn btn-primary button-submit'
          size='sm'
          disabled={loadingSearch === true}
          onClick={handleSearch}
        >
          {loadingSearch === true ? 'Filtering..' : 'Filter'}
        </Button>
      </div>

      <div className='notification-wrapper' style={{maxHeight: '325px', overflowY: 'auto'}}>
        <List
          rowKey={(row) => row.id}
          itemLayout='vertical'
          size='small'
          dataSource={notifications}
          renderItem={(item) => {
            const module = moduleTypeMap[item.module_type] || {name: item.module_type, url: '#'}
            const moduleUrl = moduleTypeMap[item.module_type]
              ? item.module_type === 'INCENTIVE'
                ? moduleTypeMap[item.module_type].url(role)
                : `${moduleTypeMap[item.module_type].url(role)}/${item.module_id}`
              : ''

            return (
              <List.Item
                key={item.id}
                style={{
                  backgroundColor: item.is_read === true ? '#D9DDDC' : '#FFFFFF',
                  borderBottom: '1px solid black',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Checkbox
                      checked={checked.find((notif) => notif.id === item.id)?.is_read || false}
                      onChange={() => onCheckItemChange(item.id)}
                    />
                  }
                  title={
                    <div className='d-flex justify-content-between align-items-center'>
                      {moduleTypeMap[item.module_type]?.disabled(role) ?? null ? (
                        <a
                          className='fs-7 text-dark fw-bold'
                          onClick={() => handleSubmitOneData(item.id, true)}
                        >
                          {actionMap[item.action]?.(module.name) || item.action} oleh{' '}
                          {item?.created_by?.username}
                        </a>
                      ) : (
                        <a
                          className='fs-7 text-dark fw-bold'
                          href={moduleUrl}
                          style={{maxWidth: '190px'}}
                          onClick={async (event) => {
                            event.preventDefault()
                            const marked = await handleSubmitOneData(item.id, true)
                            if (marked) {
                              window.location.assign(moduleUrl)
                            }
                          }}
                        >
                          {actionMap[item.action]?.(module.name) || item.action} oleh{' '}
                          {item?.created_by?.username}
                        </a>
                      )}

                      <Tag color='blue'>{item?.status_description}</Tag>
                    </div>
                  }
                  description={
                    <div className='description'>
                      <div className='fs-7 text-dark fw-semibold'>
                        Order ID : {item?.parsedData?.orders?.id ?? ''}
                      </div>

                      <div className='fs-7 text-dark opacity-75'>
                        Pada : {formatDateWithTimeZone(item?.created_at)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )
          }}
        />
      </div>

      <div className='pagination-container p-5'>
        <span className='total-text fs-8'>
          {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalData)} of{' '}
          {totalData} Notif
        </span>

        <Pagination
          className='pagination d-flex justify-content-end align-items-center'
          size='small'
          current={currentPage}
          total={totalData}
          defaultPageSize={pageSize}
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50, 100, 500]}
          onChange={(page, size) => {
            if (size !== pageSize) {
              setPageSize(size)
              getNotifications(1, size)
              return
            }

            getNotifications(page, size)
          }}
        />
      </div>

      <div className='border border-bottom-2 p-5'>
        <Button
          size='sm'
          className='btn btn-primary d-flex justify-content-center align-items-center w-100 mb-3'
          onClick={() => handleSubmitAllData()}
        >
          <p className='fs-8'>{isLoadingSubmitAll ? 'Loading...' : 'Mark all as read'}</p>
        </Button>

        <Button
          size='sm'
          className='btn btn-primary d-flex justify-content-center align-items-center w-100 mb-3'
          onClick={() => handleSubmit()}
        >
          <p className='fs-8'>{isLoadingSubmit ? 'Loading...' : 'Mark notification'}</p>
        </Button>
      </div>
    </div>
  )
}

export {HeaderNotificationsMenu}
