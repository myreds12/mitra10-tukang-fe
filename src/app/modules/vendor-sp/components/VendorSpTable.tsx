import React from 'react'
import {Button, Tooltip} from 'antd'
import type {ButtonProps} from 'antd'
import type {TablePaginationConfig} from 'antd/es/table'
import './VendorSpTable.css'

export const vendorSpTableClassName = 'table-striped-rows'

export const vendorSpPagination = (
  pagination?: TablePaginationConfig
): TablePaginationConfig => ({
  ...pagination,
  showSizeChanger: true,
  showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total}`,
})

type VendorSpActionButtonProps = Omit<ButtonProps, 'type'> & {
  title: string
  tone?: 'primary' | 'danger' | 'success'
}

export const VendorSpActionButton: React.FC<VendorSpActionButtonProps> = ({
  title,
  tone = 'primary',
  className = '',
  ...props
}) => {
  const buttonClass =
    tone === 'danger'
      ? 'button-delete'
      : tone === 'success'
        ? 'button-edit'
        : 'button-detail'

  return (
    <Tooltip title={title}>
      <Button
        {...props}
        className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'} ${buttonClass} vendor-sp-action-button action-${tone} ${className}`.trim()}
      />
    </Tooltip>
  )
}

const getBadgeClass = (color?: string) => {
  switch (color) {
    case 'success':
    case 'green':
      return 'badge-light-success text-success'
    case 'processing':
    case 'blue':
    case 'primary':
      return 'badge-light-primary text-primary'
    case 'warning':
    case 'gold':
    case 'orange':
      return 'badge-light-warning text-warning'
    case 'error':
    case 'red':
    case 'danger':
      return 'badge-light-danger text-danger'
    case 'purple':
    case 'dark':
      return 'badge-light-dark'
    default:
      return 'badge-light-secondary text-gray-700'
  }
}

export const VendorSpPill: React.FC<{
  color?: string
  children: React.ReactNode
  className?: string
}> = ({color = 'default', children, className = ''}) => (
  <span className={`badge ${getBadgeClass(color)} fw-bold vendor-sp-pill ${className}`.trim()}>
    {children}
  </span>
)
