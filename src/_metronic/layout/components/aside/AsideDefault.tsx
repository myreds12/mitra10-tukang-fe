/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useRef, useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useLayout} from '../../core'
import {KTSVG, toAbsoluteUrl} from '../../../helpers'
import {AsideMenu} from './AsideMenu'
import axiosInstance from '../../core/axiosInterceptor'

interface User {
  user_id: number | null
  username: string
  full_name: string
  roles: string
}

interface VendorSpBadgeState {
  loaded: boolean
  sp_level: number | null
  sp_status: string
  total_point: number
}

const AsideDefault: FC = () => {
  const {config, classes} = useLayout()
  const asideRef = useRef<HTMLDivElement | null>(null)
  const {aside} = config

  const apiUrl = process.env.REACT_APP_API_URL
  const userId = localStorage.getItem('user_id')

  const [user, setUser] = useState<User>({
    user_id: null,
    username: '',
    full_name: '',
    roles: '',
  })

  const [vendorSpBadge, setVendorSpBadge] = useState<VendorSpBadgeState>({
    loaded: false,
    sp_level: null,
    sp_status: 'NORMAL',
    total_point: 0,
  })

  const fetchVendorSpBadge = async (vendorId?: number | string | null) => {
    try {
      const endpoint = vendorId
        ? `${apiUrl}/vendor-sp/check/${vendorId}`
        : `${apiUrl}/vendor-sp/my-status`
      const response = await axiosInstance.get(endpoint)
      const payload = response.data?.data || response.data || {}
      if (payload?.vendor_id && !localStorage.getItem('vendor_id')) {
        localStorage.setItem('vendor_id', String(payload.vendor_id))
      }
      setVendorSpBadge({
        loaded: true,
        sp_level: payload?.sp_level ?? null,
        sp_status: payload?.sp_status || (payload?.sp_level ? `SP${payload.sp_level}` : 'NORMAL'),
        total_point: payload?.total_point ?? 0,
      })
    } catch (error) {
      setVendorSpBadge({
        loaded: true,
        sp_level: null,
        sp_status: 'NORMAL',
        total_point: 0,
      })
    }
  }

  const getUser = async () => {
    try {
      await axiosInstance.get(`${apiUrl}/auth/find-user/${userId}`).then((response) => {
        const data = response.data.data
        const role = data?.roles?.name

        switch (role) {
          case 'Sales':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.sales[0]?.full_name ?? '',
              roles: role,
            })
            break
          case 'Manager Store':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.sales[0]?.full_name ?? '',
              roles: role,
            })
            break
          case 'Store Staff':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.employee?.full_name ?? '',
              roles: role,
            })
            break
          case 'Store CS':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.store[0]?.store_name ?? '',
              roles: role,
            })
            break
          case 'Super User':
          case 'Admin HO':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: '',
              roles: role,
            })
            break
          case 'Owner Vendor': {
            const vendorId =
              data?.pic_vendor?.[0]?.vendor?.id ??
              data?.pic_vendor?.[0]?.vendor_id ??
              localStorage.getItem('vendor_id')
            if (vendorId) {
              localStorage.setItem('vendor_id', String(vendorId))
            }
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.pic_vendor[0]?.vendor?.company_name ?? '',
              roles: role,
            })
            void fetchVendorSpBadge(vendorId)
            break
          }
          case 'Admin Vendor': {
            const vendorId =
              data?.pic_vendor?.[0]?.vendor?.id ??
              data?.pic_vendor?.[0]?.vendor_id ??
              localStorage.getItem('vendor_id')
            if (vendorId) {
              localStorage.setItem('vendor_id', String(vendorId))
            }
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.pic_vendor[0]?.pic_name ?? '',
              roles: role,
            })
            void fetchVendorSpBadge(vendorId)
            break
          }
          case 'Tukang':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.tukang[0]?.full_name ?? '',
              roles: role,
            })
            break
          case 'Finance':
          case 'Payroll':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.username ?? '',
              roles: role,
            })
            break
          case 'Admin WA':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.username ?? '',
              roles: role,
            })
            break
          case 'Admin WA2':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name: data?.username ?? '',
              roles: role,
            })
            break
          case 'Pendaftar Vendor':
            setUser({
              user_id: data.id,
              username: data?.username ?? '',
              full_name:
                data?.vendor_registrant?.company_name ||
                data?.company_name ||
                data?.username ||
                'Pendaftar Vendor',
              roles: role || 'Pendaftar Vendor',
            })
            break
          default:
            console.log('user not found!:')
        }
      })
    } catch (error: any) {
      console.log('error when fetching data', error)
    }
  }

  useEffect(() => {
    getUser()
    const currentRole = localStorage.getItem('userRole') || ''
    if (currentRole === 'Owner Vendor' || currentRole === 'Admin Vendor') {
      void fetchVendorSpBadge(localStorage.getItem('vendor_id'))
    }
    // eslint-disable-next-line
  }, [])

  const MIN_KEY = 'kt_aside_minimized'

  const applyMinState = (min: boolean) => {
    if (min) {
      document.body.classList.add('aside-minimize')
    } else {
      document.body.classList.remove('aside-minimize')
    }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MIN_KEY)
      const isMin = saved === '1'
      applyMinState(isMin)
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line
  }, [])

  const minimize = () => {
    const willMinimize = !document.body.classList.contains('aside-minimize')
    // add small animation class to aside
    asideRef.current?.classList.add('animating')
    setTimeout(() => {
      asideRef.current?.classList.remove('animating')
    }, 300)

    applyMinState(willMinimize)

    try {
      localStorage.setItem(MIN_KEY, willMinimize ? '1' : '0')
    } catch (e) {
      // ignore
    }
  }

  const getSpBadgeStyle = (spLevel: number | null): React.CSSProperties => {
    if (spLevel === 3) {
      return {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
      }
    }
    if (spLevel === 2) {
      return {
        backgroundColor: '#fff5f8',
        color: '#b91c1c',
        border: '1px solid #fecdd3',
      }
    }
    if (spLevel === 1) {
      return {
        backgroundColor: '#fff8dd',
        color: '#b45309',
        border: '1px solid #fde68a',
      }
    }
    return {
      backgroundColor: '#e8fff3',
      color: '#15803d',
      border: '1px solid #bbf7d0',
    }
  }

  return (
    <div
      id='kt_aside'
      // className={clsx('aside', classes.aside.join(' '))}
      className='aside aside-light'
      data-kt-drawer='true'
      data-kt-drawer-name='aside'
      data-kt-drawer-activate='{default: true, lg: false}'
      data-kt-drawer-overlay='true'
      data-kt-drawer-width="{default:'200px', '300px': '250px'}"
      data-kt-drawer-direction='start'
      data-kt-drawer-toggle='#kt_aside_mobile_toggle'
      ref={asideRef}
    >
      {/* begin::Brand */}
      <div
        className='aside-logo d-flex justify-content-center align-items-center flex-column'
        id='kt_aside_logo'
      >
        <Link to='/home'>
          <img
            alt='Logo'
            className='h-50px logo mb-3'
            src={toAbsoluteUrl('/media/auth/logo-mitra.png')}
          />
        </Link>

        <div className='d-flex justify-content-center align-items-center flex-column'>
          <img
            alt='Logo'
            className='h-75px logo rounded-circle mb-3'
            src={toAbsoluteUrl('/media/avatars/blank.png')}
          />

          {(() => {
            const roleName = user.roles || localStorage.getItem('userRole') || ''
            const isVendorRole = roleName === 'Owner Vendor' || roleName === 'Admin Vendor'
            const displayName =
              [
                'Super User',
                'Admin HO',
                'Store CS',
                'Admin WA',
                'Admin WA2',
                'Manager Store',
              ].includes(roleName)
                ? user.username || localStorage.getItem('username') || ''
                : user.full_name || user.username || localStorage.getItem('username') || ''
            return (
              <div className='d-flex flex-column align-items-center text-center'>
                <h6 className='text-center text-secondary-emphasis mb-1'>
                  {displayName}
                  {roleName ? (
                    <>
                      <br />({roleName}){' '}
                    </>
                  ) : null}
                </h6>
                {isVendorRole && (
                  <Link
                    to='/vendor-sp/violation-log'
                    title='Lihat Log SP & Pelanggaran Vendor'
                    style={{
                      ...getSpBadgeStyle(vendorSpBadge.sp_level),
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '6px',
                      marginTop: '2px',
                      marginBottom: '4px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      lineHeight: 1.3,
                    }}
                  >
                    <span>
                      Level SP:{' '}
                      {vendorSpBadge.sp_level
                        ? `SP${vendorSpBadge.sp_level}`
                        : 'Normal (Bebas SP)'}
                    </span>
                  </Link>
                )}
              </div>
            )
          })()}
        </div>
        {/* end::Logo */}

        {/* begin::Aside toggler */}
        {aside.minimize && (
          <div
            id='kt_aside_toggle'
            className='btn btn-icon w-auto px-0 btn-active-color-primary aside-toggle'
            data-kt-toggle='true'
            data-kt-toggle-state='active'
            data-kt-toggle-target='body'
            data-kt-toggle-name='aside-minimize'
            onClick={minimize}
          >
            <KTSVG
              path={'/media/icons/duotune/arrows/arr080.svg'}
              className={'svg-icon-1 rotate-180'}
            />
          </div>
        )}
        {/* end::Aside toggler */}
      </div>
      {/* end::Brand */}

      {/* begin::Aside menu */}
      <div className='aside-menu flex-column-fluid'>
        <AsideMenu asideMenuCSSClasses={classes.asideMenu} />
      </div>
      {/* end::Aside menu */}
    </div>
  )
}

export {AsideDefault}
