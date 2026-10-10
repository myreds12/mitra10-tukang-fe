import React from 'react'
import {VendorRegistrationHistoryItem} from './types'
import {statusLabels, actionLabels, formatDateTime} from './formatters'

interface VendorHistoryTimelineCardProps {
  histories: VendorRegistrationHistoryItem[]
}

export const VendorHistoryTimelineCard: React.FC<VendorHistoryTimelineCardProps> = ({
  histories,
}) => {
  return (
    <div className='card'>
      <div className='section-head'>
        <h2>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 3v5h5' />
            <path d='M3.05 13A9 9 0 1 0 6 5.3L3 8' />
            <path d='M12 7v5l4 2' />
          </svg>
          Histori Pendaftaran
        </h2>
        <span className='hist-count'>{histories.length} catatan aktivitas</span>
      </div>

      {histories.length === 0 ? (
        <div className='hist-empty'>Belum ada catatan aktivitas untuk pendaftaran ini.</div>
      ) : (
        <div className='hist-timeline'>
          {histories.map((history, idx) => {
            const fromLabel = history.from_status
              ? statusLabels[history.from_status] || `Status ${history.from_status}`
              : 'Pendaftaran Masuk'
            const toLabel = statusLabels[history.to_status] || `Status ${history.to_status}`
            const actionTitle =
              actionLabels[history.action] || history.action || 'Perubahan Status'

            const dotColor =
              history.to_status === 3
                ? 'green'
                : history.to_status === 4
                ? 'red'
                : history.to_status === 2
                ? 'blue'
                : 'amber'

            const toBadgeColor = dotColor

            return (
              <div key={history.id || idx} className='hist-item'>
                <div className='hist-marker'>
                  <span className={`hist-dot ${dotColor}`} />
                  {idx !== histories.length - 1 && <span className='hist-line' />}
                </div>

                <div
                  className='hist-body'
                  style={idx === histories.length - 1 ? {marginBottom: 0} : undefined}
                >
                  <div className='hist-top'>
                    <p className='hist-title'>{actionTitle}</p>
                    <span className='hist-time'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <path d='M12 6v6l4 2' />
                      </svg>
                      {formatDateTime(history.created_at)}
                    </span>
                  </div>

                  <div className='hist-status-row'>
                    <span className='hist-badge'>{fromLabel}</span>
                    <svg
                      className='hist-arrow'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                    >
                      <path d='M5 12h14M13 6l6 6-6 6' />
                    </svg>
                    <span className={`hist-badge ${toBadgeColor}`}>{toLabel}</span>
                  </div>

                  {history.notes && (
                    <p className='hist-note'>
                      <b>Catatan:</b> {history.notes}
                    </p>
                  )}

                  <p className='hist-exec'>
                    Eksekutor:{' '}
                    <b>
                      {history.actor_display ||
                        (history.actor_username
                          ? `${history.actor_username}${
                              history.actor_role ? ` (${history.actor_role})` : ''
                            }`
                          : history.actor_id
                          ? `Admin #${history.actor_id}`
                          : 'Sistem')}
                    </b>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
