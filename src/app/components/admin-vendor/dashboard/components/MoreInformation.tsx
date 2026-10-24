/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {Link} from 'react-router-dom'

import {Card, Row, Col} from 'react-bootstrap'

import './MoreInformation.css'

type Props = {
  className: string
  totalComplaint: number
  totalResurvey: number
  totalRework: number
  totalReschedule: number
  totalRefund: number
  totalCancel: number
  totalViolationPoints?: number
  violationCount?: number
  spLevel?: number | null
}

const renderStat = (value: number | string, label: string, colorClass = 'text-danger') => (
  <Col className='pt-5 pb-5'>
    <h1
      className='fw-normal text-center'
      style={{fontSize: '25px', fontVariantNumeric: 'tabular-nums'}}
    >
      {value}
    </h1>
    <p className={`fs-6 ${colorClass} text-center mt-1 mb-1`}>{label}</p>
  </Col>
)

const MoreInformation: React.FC<Props> = ({
  className,
  totalComplaint,
  totalRework,
  totalResurvey,
  totalReschedule,
  totalCancel,
  totalRefund,
  totalViolationPoints = 0,
  violationCount = 0,
  spLevel = null,
}) => {
  const spLabel = spLevel ? `SP${spLevel}` : 'NORMAL'
  const spColorClass = spLevel ? 'text-danger fw-bold' : 'text-success fw-bold'

  return (
    <section id='more-information-vendor'>
      <Card className={`${className}`} id='more-information'>
        <Card.Body>
          <Row className='mb-5'>
            <div className='fs-1 text-gray-800'>Informasi Lainnya</div>

            <Row>
              {renderStat(totalComplaint, 'COMPLAINT')}
              {renderStat(totalResurvey, 'RESURVEY')}
              {renderStat(totalRework, 'REWORK')}
            </Row>

            <Row>
              {renderStat(totalReschedule, 'RESCHEDULE')}
              {renderStat(totalCancel, 'CANCEL')}
              {renderStat(totalRefund, 'REFUND')}
            </Row>

            <Row className='border-top border-gray-200 mt-2 pt-2'>
              <Col className='pt-4 pb-3'>
                <Link
                  to='/vendor-sp/violation-log'
                  style={{textDecoration: 'none', color: 'inherit'}}
                  title='Klik untuk melihat Log SP & Pelanggaran'
                >
                  <h1
                    className='fw-bold text-center'
                    style={{
                      fontSize: '25px',
                      fontVariantNumeric: 'tabular-nums',
                      color: totalViolationPoints > 0 ? '#b91c1c' : '#15803d',
                    }}
                  >
                    {totalViolationPoints}
                  </h1>
                  <p className='fs-6 text-danger text-center mt-1 mb-0 fw-semibold'>
                    POIN PELANGGARAN
                  </p>
                </Link>
              </Col>
              <Col className='pt-4 pb-3'>
                <Link
                  to='/vendor-sp/violation-log'
                  style={{textDecoration: 'none', color: 'inherit'}}
                  title='Klik untuk melihat Log SP & Pelanggaran'
                >
                  <h1
                    className='fw-normal text-center'
                    style={{fontSize: '25px', fontVariantNumeric: 'tabular-nums'}}
                  >
                    {violationCount}
                  </h1>
                  <p className='fs-6 text-danger text-center mt-1 mb-0'>LOG PELANGGARAN</p>
                </Link>
              </Col>
              <Col className='pt-4 pb-3'>
                <Link
                  to='/vendor-sp/violation-log'
                  style={{textDecoration: 'none', color: 'inherit'}}
                  title='Klik untuk melihat Log SP & Pelanggaran'
                >
                  <h1
                    className='fw-bold text-center'
                    style={{
                      fontSize: '25px',
                      color: spLevel ? '#b91c1c' : '#15803d',
                    }}
                  >
                    {spLabel}
                  </h1>
                  <p className={`fs-6 ${spColorClass} text-center mt-1 mb-0`}>LEVEL SP</p>
                </Link>
              </Col>
            </Row>
          </Row>
        </Card.Body>
      </Card>
    </section>
  )
}

export {MoreInformation}
