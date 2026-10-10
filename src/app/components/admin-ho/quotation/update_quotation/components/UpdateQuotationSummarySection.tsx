import React from 'react'
import {Form, Table, Button} from 'react-bootstrap'
import {PaymentStage} from '../types'

interface UpdateQuotationSummarySectionProps {
  totalMaterial: number
  totalJasaMaterial: number
  promosiDiscount: any
  handlePromosiChange: (value: any) => void
  promotionName: string
  additionalPromosi: any
  grandTotal: any
  grandTotalDiff: any
  grandTotalRounded: any
  quotationData: any
  paymentStages: PaymentStage[]
  isLoading: boolean
  handleUpdateQuotation: (readiness: number) => void
}

export const UpdateQuotationSummarySection: React.FC<UpdateQuotationSummarySectionProps> = ({
  totalMaterial,
  totalJasaMaterial,
  promosiDiscount,
  handlePromosiChange,
  promotionName,
  additionalPromosi,
  grandTotal,
  grandTotalDiff,
  grandTotalRounded,
  quotationData,
  paymentStages,
  isLoading,
  handleUpdateQuotation,
}) => {
  return (
    <>
      <hr />

      <div className='item-total'>
        <table className='table table-borderless'>
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
                <div className='fs-6 fw-bold'>Promosi :</div>
              </td>

              <td>
                <Form.Control
                  id='promosi'
                  type='number'
                  value={promosiDiscount}
                  onKeyDown={(e) => {
                    if (e.key === ',') {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => handlePromosiChange(e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td align='right'>
                <div className='fs-6 fw-bold'>
                  {promotionName !== ''
                    ? `Additional Promosi ( ${promotionName} ) :`
                    : 'Additional Promosi :'}
                </div>
              </td>

              <td className='total-content'>
                <div className='fs-6 fw-semibold'>
                  {`Rp. ${parseInt(additionalPromosi).toLocaleString('id')}`}
                </div>
              </td>
            </tr>

            <tr>
              <td align='right'>
                <div className='fs-6 fw-bold'>Grand Total :</div>
              </td>

              <td className='total-content'>
                <div className='fs-6 fw-semibold'>{`Rp. ${grandTotal.toLocaleString('id')}`}</div>
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

      {quotationData?.quotation_special === 1 && (
        <>
          <hr />

          <div className='fs-6 fw-semibold p-0 mb-2'>Preview Pembayaran</div>

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

      <div className='payment-detail'>
        <div className='payment-method mb-2'>
          <h1 className='fs-3 fw-bold'>
            Silahkan melakukan pembayaran di account di bawah ini :
          </h1>

          <h3 className='fs-5 fw-normal'>{quotationData?.store?.bank_account}</h3>
          <h3 className='fs-5 fw-normal'>{quotationData?.store?.bank_name}</h3>
          <h3 className='fs-5 fw-normal'>{quotationData?.store?.bank_number}</h3>
        </div>

        <div className='payment-evidence'>
          <h1 className='fs-3 fw-bold'>Silahkan kirim bukti bayar anda melalui:</h1>
          <h1 className='fs-5 fw-normal'>
            {`Telp : ${
              quotationData?.store?.phone_number_1 ??
              quotationData?.store?.phone_number_2 ??
              'Nomor telepon belum tersedia'
            }`}
          </h1>
          <h1 className='fs-5 fw-normal'>
            {`Email : ${
              quotationData?.store?.email ??
              quotationData?.store?.email ??
              'Email belum tersedia'
            }`}
          </h1>
        </div>

        <h1 className='fs-5 fw-normal'>
          Terima kasih telah melakukan bisnis dengan Mitra10. Kami harap kedatangan anda
          kembali.
        </h1>
      </div>

      <div className='button-wrapper d-flex justify-content-center align-items-center mt-5'>
        <Button
          variant='dark-primary'
          className='d-flex justify-content-center align-items-center mb-2'
          type='submit'
          disabled={isLoading}
          onClick={() => handleUpdateQuotation(1)}
        >
          Save
        </Button>

        {[1, 4].includes(quotationData?.readiness) && (
          <>
            <Button
              variant='dark-success'
              className='d-flex justify-content-center align-items-center mb-2'
              type='submit'
              disabled={isLoading}
              onClick={() => handleUpdateQuotation(2)}
            >
              Approve
            </Button>

            <Button
              variant='dark-danger'
              className='d-flex justify-content-center align-items-center mb-2'
              type='submit'
              disabled={isLoading}
              onClick={() => handleUpdateQuotation(3)}
            >
              Reject
            </Button>
          </>
        )}

        {quotationData?.readiness === 2 && (
          <Button
            variant='dark-warning'
            className='d-flex justify-content-center align-items-center mb-2'
            type='submit'
            disabled={isLoading}
            onClick={() => handleUpdateQuotation(4)}
          >
            Send Email To Customers
          </Button>
        )}
      </div>
    </>
  )
}
