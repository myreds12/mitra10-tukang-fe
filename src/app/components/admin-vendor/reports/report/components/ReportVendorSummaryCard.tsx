import React from 'react'
import {Row, Col, Card} from 'react-bootstrap'

interface ReportVendorSummaryCardProps {
  headerColor: string
  title: string
  loadingExport: boolean
  exportToExcel: () => void
  endpoint: string
  reportGrandTotal: any
}

export const ReportVendorSummaryCard: React.FC<ReportVendorSummaryCardProps> = ({
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
            <div className='d-flex flex-column flex-sm-row flex-md-row flex-lg-row flex-xl-row flex-xxl-row align-items-start align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center justify-content-between gap-3'>
              <h3 className='fs-3 fw-semibold text-uppercase mb-3'>{title}</h3>

              <button className='button-export mb-5' onClick={exportToExcel}>
                <h3 className='fs-5 fw-semibold'>
                  {loadingExport ? 'Exporting..' : 'Export To Excel'}
                </h3>
              </button>
            </div>

            {!['csi', 'complaints', 'reschedule'].includes(endpoint) ? (
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
