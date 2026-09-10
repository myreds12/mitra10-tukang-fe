import React, {FC, useState, useEffect} from 'react'
import clsx from 'clsx'

// Third Party Components
import axios from 'axios'

// Internal Components
import {KTSVG} from '../../../helpers'
import {HeaderNotificationsMenu} from '../../../partials'
import {useLayout} from '../../core'
import {formatTotalNumber} from '../../../helpers/NumberHelpers'

const NOTIFICATION_SYNC_EVENT = 'notifications:sync'
let notificationPollingInterval: ReturnType<typeof setInterval> | null = null
let notificationPollingSubscribers = 0
let notificationPollingFetch: (() => void) | null = null

const toolbarButtonMarginClass = 'ms-1 ms-lg-3',
  toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px',
  toolbarButtonIconSizeClass = 'svg-icon-1'

interface StatusStorage {
  value: number | null
  label: string
}

const Topbar: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const liveChatApiUrl = process.env.REACT_APP_LIVECHAT_API_URL || 'http://localhost:3002'
  const {config} = useLayout()

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [totalData, setTotalData] = useState<number>(0)
  const [totalUnread, setTotalUnread] = useState<number>(0)

  // Loading State
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false)

  // Status State
  const [status, setStatus] = useState<StatusStorage[]>([])
  const [selectedStatus, setSelectedStatus] = useState<StatusStorage[]>([])
  const statuses = selectedStatus.length > 0 ? `&status=${selectedStatus.map((x) => x.value)}` : ''
  const liveChatAllowedRoles = ['Store CS', 'Admin HO', 'Super User', 'Admin Vendor', 'Owner Vendor']

  const getChatUnreadCount = async () => {
    const token = localStorage.getItem('accessToken')
    const userRole = localStorage.getItem('userRole') || ''

    if (!token || !liveChatAllowedRoles.includes(userRole)) return

    try {
      const response = await axios.get(`${liveChatApiUrl}/rooms`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const rooms = response.data?.data || []
      const totalUnread = Array.isArray(rooms)
        ? rooms.reduce((sum: number, room: any) => sum + (room.unreadCount || 0), 0)
        : 0

      window.dispatchEvent(
        new CustomEvent('livechat:unread-count', {detail: {totalUnread}})
      )
    } catch (error) {
      console.error('Error fetching live chat unread count:', error)
    }
  }

  // Fetching Data
  const getNotifications = async (page: number, pageSize: number) => {
    notificationPollingFetch = () => {
      void getNotifications(page, pageSize)
    }

    try {
      const response = await axios.get(
        `${apiUrl}/notifications?take=${pageSize}&page=${page}${statuses}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )

      const notificationsData = response.data.data.map((item: any) => {
        let parsedData = {}
        try {
          parsedData = item.data ? JSON.parse(item.data) : {}
        } catch {
          parsedData = {}
        }

        return {
          ...item,
          parsedData,
        }
      })

      const notificationState = {
        notifications: notificationsData,
        currentPage: response.data.page,
        totalData: response?.data?.total ?? 0,
        totalUnread: response?.data?.unread ?? 0,
      }

      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_SYNC_EVENT, {detail: notificationState})
      )

      return notificationsData
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const getStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/status?take=0`, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempStatus = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.description,
        }))

        setStatus(tempStatus)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const userRole = localStorage.getItem('userRole') || ''
  const isPendaftar =
    window.location.pathname.startsWith('/pendaftar') ||
    userRole === 'Pendaftar Vendor'

  useEffect(() => {
    if (isPendaftar) return

    const syncNotifications = (event: Event) => {
      const {notifications, currentPage, totalData, totalUnread} = (
        event as CustomEvent
      ).detail

      setNotifications(notifications)
      setCurrentPage(currentPage)
      setTotalData(totalData)
      setTotalUnread(totalUnread)
    }

    window.addEventListener(NOTIFICATION_SYNC_EVENT, syncNotifications)
    notificationPollingSubscribers += 1

    if (!notificationPollingInterval) {
      getNotifications(1, pageSize)
      notificationPollingInterval = setInterval(() => {
        notificationPollingFetch?.()
      }, 30000)
    }

    return () => {
      window.removeEventListener(NOTIFICATION_SYNC_EVENT, syncNotifications)
      notificationPollingSubscribers -= 1

      if (notificationPollingSubscribers === 0 && notificationPollingInterval) {
        clearInterval(notificationPollingInterval)
        notificationPollingInterval = null
        notificationPollingFetch = null
      }
    }
    // eslint-disable-next-line
  }, [isPendaftar])

  useEffect(() => {
    getChatUnreadCount()

    const intervalId = setInterval(() => {
      getChatUnreadCount()
    }, 30000)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    getStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async () => {
    setLoadingSearch(true)
    const data = await getNotifications(currentPage, pageSize)
    setNotifications(data)
    setLoadingSearch(false)
  }

  if (isPendaftar) {
    return null
  }

  return (
    <div className='d-flex align-items-stretch flex-shrink-0' id='topbar'>
      <div
        className={clsx('d-flex align-items-center position-relative', toolbarButtonMarginClass)}
      >
        <div
          className={clsx(
            'btn btn-icon btn-active-light-primary btn-custom',
            toolbarButtonHeightClass
          )}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          data-kt-menu-flip='bottom'
        >
          <KTSVG path='/media/bell.svg' className={toolbarButtonIconSizeClass} />
        </div>

        <span
          className='badge bg-danger position-absolute translate-middle'
          style={{
            top: '20px',
            left: '30px',
            width: 'fit-content',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
          }}
        >
          {formatTotalNumber(totalUnread)}
        </span>

        <HeaderNotificationsMenu
          notificationData={notifications}
          currentPage={currentPage}
          pageSize={pageSize}
          totalData={totalData}
          totalUnread={totalUnread}
          status={status}
          loadingSearch={loadingSearch}
          handleSearch={handleSearch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setPageSize={setPageSize}
          getNotifications={getNotifications}
        />
      </div>

      {/* begin::User */}
      {/* <div
        className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}
        id='kt_header_user_menu_toggle'
      >
        <div
          className={clsx('cursor-pointer symbol', toolbarUserAvatarHeightClass)}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          data-kt-menu-flip='bottom'
        >
          <img src={toAbsoluteUrl('/media/avatars/blank.png')} alt='metronic' />
        </div>
        <HeaderUserMenu />
      </div> */}
      {/* end::User */}

      {/* begin::Aside Toggler */}
      {config.header.left === 'menu' && (
        <div className='d-flex align-items-center d-lg-none ms-2 me-n3' title='Show header menu'>
          <div
            className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
            id='kt_header_menu_mobile_toggle'
          >
            <KTSVG path='/media/icons/duotune/text/txt001.svg' className='svg-icon-1' />
          </div>
        </div>
      )}
    </div>
  )
}

export {Topbar}
