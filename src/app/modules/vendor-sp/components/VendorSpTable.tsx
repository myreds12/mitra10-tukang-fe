import React from 'react'
import {useNavigate} from 'react-router-dom'
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
        aria-label={title}
        className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'} ${buttonClass} vendor-sp-action-button action-${tone} ${className}`.trim()}
      />
    </Tooltip>
  )
}

const getBadgeClass = (color?: string) => {
  switch (color) {
    case 'success':
    case 'green':
      return 'badge-light-success'
    case 'processing':
    case 'blue':
    case 'primary':
      return 'badge-light-primary'
    case 'warning':
    case 'gold':
    case 'orange':
      return 'badge-light-warning'
    case 'error':
    case 'red':
    case 'danger':
      return 'badge-light-danger'
    case 'purple':
    case 'dark':
      return 'badge-light-dark'
    default:
      return 'badge-light-secondary'
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

export const VendorSpOrderLink: React.FC<{
  orderId?: string | number | null
}> = ({orderId}) => {
  const navigate = useNavigate()

  if (orderId === undefined || orderId === null || orderId === '') {
    return <span className='text-muted'>-</span>
  }

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  const isVendorRole = userRole === 'Admin Vendor' || userRole === 'Owner Vendor'
  const targetRoute = isVendorRole
    ? `/work-order/detail-work-order/${orderId}`
    : `/order/detail-order/${orderId}`

  return (
    <Tooltip title={`Lihat Detail Order #${orderId}`}>
      <button
        type='button'
        className='vendor-sp-order-code vendor-sp-order-link'
        onClick={(e) => {
          e.stopPropagation()
          navigate(targetRoute)
        }}
      >
        {orderId}
      </button>
    </Tooltip>
  )
}

export const formatQuarterDateBounds = (
  quarter?: number | null,
  year?: number | null,
  customEndDate?: string | null,
  status?: number | null
) => {
  const validQuarter = quarter && quarter >= 1 && quarter <= 4 ? quarter : 1
  const validYear = year || new Date().getFullYear()
  const startMonth = (validQuarter - 1) * 3
  const endMonth = startMonth + 2

  const startDate = new Date(validYear, startMonth, 1)
  const quarterEndDate = new Date(validYear, endMonth + 1, 0, 23, 59, 59, 999)

  const effectiveEndDate =
    status === 3 && customEndDate && new Date(customEndDate).getTime() > quarterEndDate.getTime()
      ? new Date(customEndDate)
      : quarterEndDate

  const fmt = (d: Date) =>
    d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  const startFormatted = fmt(startDate)
  const endFormatted = fmt(effectiveEndDate)

  return {
    startDate,
    endDate: effectiveEndDate,
    startFormatted,
    endFormatted,
    rangeFormatted: `${startFormatted} - ${endFormatted}`,
    quarterLabel: `Q${validQuarter} ${validYear}`,
  }
}

export const deduplicateHighestVendorSp = <
  T extends {
    vendor_id?: number
    sp_level?: number
    status?: number
    total_point?: number
    updated_at?: string
    created_at?: string
    vendor?: {id?: number}
  },
>(
  rows: T[]
): T[] => {
  const map = new Map<number, T>()

  const isHigherPriority = (candidate: T, existing: T) => {
    const candLevel = candidate.sp_level ?? 0
    const existLevel = existing.sp_level ?? 0
    if (candLevel !== existLevel) return candLevel > existLevel

    const candActive = candidate.status === 1 || candidate.status === 3 ? 1 : 0
    const existActive = existing.status === 1 || existing.status === 3 ? 1 : 0
    if (candActive !== existActive) return candActive > existActive

    const candPoints = candidate.total_point ?? 0
    const existPoints = existing.total_point ?? 0
    if (candPoints !== existPoints) return candPoints > existPoints

    const candTime = new Date(candidate.updated_at || candidate.created_at || 0).getTime()
    const existTime = new Date(existing.updated_at || existing.created_at || 0).getTime()
    return candTime > existTime
  }

  for (const row of rows) {
    const vendorKey = row.vendor_id ?? row.vendor?.id
    if (vendorKey === undefined || vendorKey === null) continue
    const existing = map.get(vendorKey)
    if (!existing || isHigherPriority(row, existing)) {
      map.set(vendorKey, row)
    }
  }

  return Array.from(map.values())
}

export const resolveViolationIncidentDate = (record?: {
  evidence_path?: string | null
  created_at?: string | null
}): Date | null => {
  if (!record) return null
  const rawEvidence = record.evidence_path?.trim()
  if (rawEvidence) {
    if (rawEvidence.startsWith('{') && rawEvidence.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawEvidence)
        const candidate =
          parsed?.incidentDate ||
          parsed?.incident_date ||
          parsed?.scheduledDate ||
          parsed?.surveyDoneAt ||
          parsed?.rescheduleCreatedAt ||
          parsed?.detectedAt ||
          parsed?.timestamp
        if (candidate) {
          const parsedDate = new Date(candidate)
          if (!Number.isNaN(parsedDate.getTime())) {
            return parsedDate
          }
        }
      } catch {
        // fallback below
      }
    } else if (/^\d{4}-\d{2}-\d{2}/.test(rawEvidence)) {
      const parsedDate = new Date(rawEvidence)
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }
  }

  if (record.created_at) {
    const fallbackDate = new Date(record.created_at)
    if (!Number.isNaN(fallbackDate.getTime())) {
      return fallbackDate
    }
  }

  return null
}

export const formatViolationIncidentDate = (record?: {
  evidence_path?: string | null
  created_at?: string | null
}): string => {
  const date = resolveViolationIncidentDate(record)
  if (!date) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatViolationIncidentDateTime = (record?: {
  evidence_path?: string | null
  created_at?: string | null
}): string => {
  const date = resolveViolationIncidentDate(record)
  if (!date) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
