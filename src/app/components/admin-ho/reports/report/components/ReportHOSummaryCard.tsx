import React from 'react'
import {Card, Row, Col} from 'react-bootstrap'

interface ReportHOSummaryCardProps {
  headerColor: string
  title: string
  totalOrder: number
  endpoint: string
  statusName: string
  reportGrandTotal: any
  loadingUploadExcel: boolean
  loadingTemplate: boolean
  loadingExport: boolean
  onUploadExcel: () => void
  onExportTemplate: (status: number) => void
  onExportToExcel: () => void
}

export const ReportHOSummaryCard: React.FC<ReportHOSummaryCardProps> = ({
  headerColor,
  title,
  totalOrder,
  endpoint,
  statusName,
  reportGrandTotal,
  loadingUploadExcel,
  loadingTemplate,
  loadingExport,
  onUploadExcel,
  onExportTemplate,
  onExportToExcel,
}) => {
  const formattedTotal = Number.isNaN(parseInt(reportGrandTotal))
    ? '0'
    : parseInt(reportGrandTotal).toLocaleString('id')

  return (
    <Row className='mb-5'>
      <Col>
        <Card className={`border-top border-${headerColor} border-5`}>
          <Card.Body>
            <div className='d-flex justify-content-between align-items-center'>
              {['Laporan Refund'].includes(title) ? (
                <h1 className='fs-3 fw-semibold text-uppercase mb-3'>
                  Total Laporan Refund : {totalOrder}
                </h1>
              ) : (
                <h3 className='fs-3 fw-semibold text-uppercase mb-3'>{title}</h3>
              )}

              <div className='d-flex justify-content-between gap-3'>
                {['sales-comission'].includes(endpoint) && statusName === 'PAID' && (
                  <>
                    <button className='button-export' onClick={onUploadExcel}>
                      <h3 className='fs-5 fw-semibold'>
                        {loadingUploadExcel ? 'Uploading..' : 'Upload Excel'}
                      </h3>
                    </button>

                    <button className='button-export' onClick={() => onExportTemplate(3)}>
                      <h3 className='fs-5 fw-semibold'>
                        {loadingTemplate ? 'Exporting..' : 'Export Excel'}
                      </h3>
                    </button>
                  </>
                )}

                {['sales-comission'].includes(endpoint) && statusName === 'UNPAID' && (
                  <>
                    <button className='button-export' onClick={() => onExportTemplate(2)}>
                      <h3 className='fs-5 fw-semibold'>
                        {loadingTemplate ? 'Exporting..' : 'Export Excel'}
                      </h3>
                    </button>
                  </>
                )}

                {!['sales-comission'].includes(endpoint) && (
                  <>
                    <button className='button-export' onClick={onExportToExcel}>
                      <h3 className='fs-5 fw-semibold'>
                        {loadingExport ? 'Exporting..' : 'Export To Excel'}
                      </h3>
                    </button>
                  </>
                )}
              </div>
            </div>

            <h1 className='fs-1 fw-bold'>{`Rp. ${formattedTotal}`}</h1>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}
