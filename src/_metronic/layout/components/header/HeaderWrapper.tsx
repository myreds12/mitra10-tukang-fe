import clsx from 'clsx'
import React from 'react'
import {Link, useLocation} from 'react-router-dom'
import {KTSVG, toAbsoluteUrl} from '../../../helpers'
import {useLayout} from '../../core'
import {Header} from './Header'
import {Topbar} from './Topbar'

interface HeaderWrapperProps {
  className?: string
  style?: React.CSSProperties
}

export function HeaderWrapper({className, style}: HeaderWrapperProps) {
  const {config, classes, attributes} = useLayout()
  const {header, aside} = config
  const location = useLocation()
  const isPendaftar =
    location.pathname.startsWith('/pendaftar') ||
    localStorage.getItem('userRole') === 'Pendaftar Vendor'

  return (
    <div
      id='kt_header'
      className={clsx('header', classes.header.join(' '), 'align-items-stretch', className)}
      style={isPendaftar ? { left: 0, ...style } : style}
      {...attributes.headerMenu}
    >
      <div
        className={clsx(
          classes.headerContainer.join(' '),
          'd-flex align-items-stretch justify-content-between'
        )}
      >
        {/* begin::Aside mobile toggle */}
        {aside.display && !isPendaftar && (
          <div className='d-flex align-items-center d-lg-none ms-n3 me-1' title='Show aside menu'>
            <div
              className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
              id='kt_aside_mobile_toggle'
            >
              <KTSVG path='/media/icons/duotune/abstract/abs015.svg' className='svg-icon-2x mt-1' />
            </div>
          </div>
        )}
        {/* end::Aside mobile toggle */}
        {/* begin::Logo / Title */}
        {isPendaftar ? (
          <div className='d-flex align-items-center'>
            <span className='fs-2 fw-bold text-white' style={{ letterSpacing: '0.3px' }}>
              Pendaftar Vendor
            </span>
          </div>
        ) : (
          !aside.display && (
            <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0'>
              <Link to='/dashboard' className='d-lg-none'>
                <img
                  alt='Logo'
                  src={toAbsoluteUrl('/media/logos/default-small.svg')}
                  className='h-30px'
                />
              </Link>
            </div>
          )
        )}
        {/* end::Logo / Title */}

        {/* {aside.display && (
          <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0'>
            <Link to='/' className='d-lg-none'>
              <img alt='Logo' src={toAbsoluteUrl('/media/logos/default-small.svg')} className='h-30px' />
            </Link>
          </div>
        )} */}

        {/* begin::Wrapper */}
        <div className='d-flex align-items-stretch justify-content-between flex-lg-grow-1'>
          {/* begin::Navbar */}
          {header.left === 'menu' && !isPendaftar && (
            <div className='d-flex align-items-stretch' id='kt_header_nav'>
              <Header />
            </div>
          )}

          {/* {header.left === 'page-title' && (
            <div className='d-flex align-items-center' id='kt_header_nav'>
              <DefaultTitle />
            </div>
          )} */}

          <div className='d-flex align-items-stretch flex-shrink-0 align-items-center'>
            {aside.display && !isPendaftar && (
              <button
                className='btn btn-icon btn-active-light-primary me-3 d-none d-lg-inline-flex'
                title='Toggle sidebar'
                onClick={() => {
                  const MIN_KEY = 'kt_aside_minimized'
                  const willMinimize = !document.body.classList.contains('aside-minimize')
                  if (willMinimize) document.body.classList.add('aside-minimize')
                  else document.body.classList.remove('aside-minimize')
                  try { localStorage.setItem(MIN_KEY, willMinimize ? '1' : '0') } catch (e) {}
                }}
              >
                <KTSVG path='/media/icons/duotune/arrows/arr080.svg' className='svg-icon-2 rotate-180' />
              </button>
            )}

            <div className='d-flex align-items-center'>
              <Topbar />
            </div>
          </div>
        </div>
        {/* end::Wrapper */}
      </div>
    </div>
  )
}
