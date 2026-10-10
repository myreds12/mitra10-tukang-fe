import React from 'react'
import {Table, Button} from 'react-bootstrap'
import {Quotation, PaymentStage} from '../types'

interface UpdateQuotationSummarySectionProps {
  quotation: Quotation
  paymentStages: PaymentStage[]
  totalMaterial: number
  totalJasaMaterial: number
  grandTotalDiff: any
  grandTotalRounded: any
  isLoading: boolean
  handleCancelQuotation: () => void
  handleUpdateQuotation: () => void
}

export const UpdateQuotationSummarySection: React.FC<UpdateQuotationSummarySectionProps> = ({
  quotation,
  paymentStages,
  totalMaterial,
  totalJasaMaterial,
  grandTotalDiff,
  grandTotalRounded,
  isLoading,
  handleCancelQuotation,
  handleUpdateQuotation,
}) => {
  return (
    <>
      {quotation.quotation_special === 1 && (
        <>
          <hr />

          <div className='title fs-6 mb-2'>Preview Pembayaran</div>

          <Table bordered responsive>
            <thead>
              <tr>
                <th>Tahap Pembayaran</th>
                <th>Persentase</th>
                <th>Nominal Pembayaran</th>
              </tr>
            </thead>

            <tbody>
              {paymentStages.map((stage, index) => (
                <tr key={index}>
                  <td>{stage.stage}</td>
                  <td>{stage.percentage}</td>
                  <td>{`${stage.amount.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  })}`}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      <hr />

      <div className='item-total'>
        <table className='table table-borderless '>
          <tbody>
            <tr>
              <td align='right'>
                <div className='fs-6 fw-bold'>Total Material :</div>
              </td>

              <td className='total-content'>
                <div className='fs-6 fw-semibold'>{`Rp. ${totalMaterial.toLocaleString(
                  'id'
                )}`}</div>
              </td>
            </tr>

            <tr>
              <td align='right'>
                <div className='fs-6 fw-bold'>Total Jasa & Material :</div>
              </td>

              <td className='total-content'>
                <div className='fs-6 fw-semibold'>{`Rp. ${totalJasaMaterial.toLocaleString(
                  'id'
                )}`}</div>
              </td>
            </tr>

            <tr>
              <td align='right'>
                <div className='fs-6 fw-bold'>Grand Total :</div>
              </td>

              <td className='total-content'>
                <div className='fs-6 fw-semibold'>{`Rp. ${quotation.quotation_grand_total.toLocaleString(
                  'id'
                )}`}</div>
              </td>
            </tr>

            <tr>
              <td align='right'>
                <div className='fs-6 fw-bold'>
                  Grand Total{' '}
                  <span className='dark-success'>{`+ Rp. ${grandTotalDiff} (Pembulatan) :`}</span>
                </div>
              </td>

              <td className='total-content'>
                <div className='fs-6 fw-semibold'>{grandTotalRounded}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className='button-wrapper d-flex justify-content-center align-items-center mt-5'>
        <Button
          variant='dark-danger'
          className='d-flex justify-content-center align-items-center mb-2'
          type='button'
          onClick={handleCancelQuotation}
        >
          Cancel
        </Button>

        <Button
          variant='dark-primary'
          className='d-flex justify-content-center align-items-center mb-2'
          type='button'
          disabled={isLoading}
          onClick={handleUpdateQuotation}
        >
          {isLoading ? 'Saving..' : 'Save'}
        </Button>
      </div>
    </>
  )
}
