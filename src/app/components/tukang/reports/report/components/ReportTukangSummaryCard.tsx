import React from 'react'
import {Row, Col, Card} from 'react-bootstrap'

interface ReportTukangSummaryCardProps {
  headerColor: string
  title: string
  loadingExport: boolean
  exportToExcel: () => void
  endpoint: string
  reportGrandTotal: any
}

export const ReportTukangSummaryCard: React.FC<ReportTukangSummaryCardProps> = ({
  headerColor,
  title,
  loadingExport,
  exportToExcel,
  endpoint,
  reportGrandTotal,
}) => {
  return (
    <Row className='mb-5'>
      <Col>
        <Card className={`border-top border-${headerColor} border-5`}>
          <Card.Body>
            <div className='d-flex justify-content-between align-items-center'>
              <h3 className='fs-3 fw-semibold text-uppercase mb-3'>{title}</h3>

              <button className='button-export' onClick={exportToExcel}>
                <h3 className='fs-5 fw-semibold'>
                  {loadingExport ? 'Exporting..' : 'Export To Excel'}
                </h3>
              </button>
            </div>

            {!['csi', 'complaints', 'reschedule', 'work-orders'].includes(endpoint) ? (
              <h1 className='fs-1 fw-bold'>{`Rp. ${parseInt(reportGrandTotal || '0').toLocaleString(
                'id'
              )}`}</h1>
            ) : null}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}
