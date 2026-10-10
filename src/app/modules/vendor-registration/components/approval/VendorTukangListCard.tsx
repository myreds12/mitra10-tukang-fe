import React from 'react'

interface VendorTukangListCardProps {
  tukangList: any[]
  serviceTypes: Record<number, string>
}

export const VendorTukangListCard: React.FC<VendorTukangListCardProps> = ({
  tukangList,
  serviceTypes,
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
            <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
          </svg>
          Daftar Tukang
        </h2>
        <span className='count-badge'>{tukangList.length} orang</span>
      </div>

      {tukangList.length > 0 ? (
        <div className='tukang-list'>
          {tukangList.map((t: any, i: number) => {
            const rawSkillIds = Array.isArray(t.service_type_id)
              ? t.service_type_id
              : t.service_type_id !== undefined && t.service_type_id !== null
              ? [t.service_type_id]
              : []
            const skillNames = rawSkillIds.map(
              (skillId: number) => serviceTypes[skillId] || `Skill #${skillId}`
            )

            return (
              <div key={i} className='tukang-card'>
                <div className='tukang-head'>
                  <span className='tukang-num'>{i + 1}</span>
                  Tukang {i + 1}
                </div>
                <div className='tukang-body'>
                  <div>
                    <p className='i-label'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                        <circle cx='12' cy='7' r='4' />
                      </svg>
                      Nama Lengkap
                    </p>
                    <p className='i-value'>{t.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className='i-label'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                      </svg>
                      No. HP
                    </p>
                    <p className='i-value'>{t.phone_number || '-'}</p>
                  </div>
                  <div>
                    <p className='i-label'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <rect x='2' y='5' width='20' height='14' rx='2' />
                        <path d='M2 10h20' />
                      </svg>
                      No. KTP
                    </p>
                    <p className='i-value'>{t.ktp_number || '-'}</p>
                  </div>
                  <div>
                    <p className='i-label'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                      </svg>
                      Skill
                    </p>
                    <p className='i-value'>
                      {skillNames.length > 0 ? skillNames.join(', ') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className='tukang-empty'>Belum ada data tukang yang didaftarkan</div>
      )}
    </div>
  )
}
