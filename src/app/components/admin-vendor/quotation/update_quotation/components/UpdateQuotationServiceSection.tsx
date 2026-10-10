import React from 'react'
import {Button} from 'react-bootstrap'
import {Quotation} from '../types'
import {UpdateQuotationServiceItemCard} from './UpdateQuotationServiceItemCard'

interface UpdateQuotationServiceSectionProps {
  quotation: Quotation
  addQuotationDetail: (type: number, work_step?: number) => void
  handleChangeQuotationDetails: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number | string,
    item_type: number,
    work_step?: number
  ) => void
  validateQtyInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number | string,
    item_type: number,
    work_step?: number
  ) => void
  calculateEachDetail: (isNominal: number, index: number | string) => void
  handleMarginType: (index: number | string, isChecked: boolean) => void
  handleRemoveQuotationDetailForm: (index: number | string) => void
}

export const UpdateQuotationServiceSection: React.FC<UpdateQuotationServiceSectionProps> = ({
  quotation,
  addQuotationDetail,
  handleChangeQuotationDetails,
  validateQtyInput,
  calculateEachDetail,
  handleMarginType,
  handleRemoveQuotationDetailForm,
}) => {
  if (quotation.quotation_special === 0) {
    return (
      <>
        <hr />
        <div className='item-jasa'>
          <h4 className='fs-4 fw-semibold mb-5'>Item Jasa Pemasangan</h4>

          {quotation.quotation_details
            .filter((x) => x.type === 2)
            .map((element, index) => (
              <UpdateQuotationServiceItemCard
                key={`${element.index}-service`}
                element={element}
                index={index}
                handleChangeQuotationDetails={handleChangeQuotationDetails}
                validateQtyInput={validateQtyInput}
                calculateEachDetail={calculateEachDetail}
                handleMarginType={handleMarginType}
                handleRemoveQuotationDetailForm={handleRemoveQuotationDetailForm}
              />
            ))}

          <Button
            className='add-jasa'
            variant='button-dark-success'
            onClick={() => addQuotationDetail(2)}
          >
            Tambah Jasa
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <hr />
      <div className='item-jasa'>
        <h4 className='fs-4 fw-bold mb-5'>Item Jasa Pemasangan Tahap 1</h4>

        {quotation.quotation_details
          .filter((x) => x.type === 2 && x.work_step === 1)
          .map((element, index) => (
            <UpdateQuotationServiceItemCard
              key={`${element.index}-service-step1`}
              element={element}
              index={index}
              workStep={1}
              handleChangeQuotationDetails={handleChangeQuotationDetails}
              validateQtyInput={validateQtyInput}
              calculateEachDetail={calculateEachDetail}
              handleMarginType={handleMarginType}
              handleRemoveQuotationDetailForm={handleRemoveQuotationDetailForm}
            />
          ))}

        <Button
          className='add-jasa'
          variant='button-dark-success'
          onClick={() => addQuotationDetail(2, 1)}
        >
          Tambah Jasa
        </Button>
      </div>

      <hr />
      <div className='item-jasa'>
        <h4 className='fs-4 fw-bold mb-5'>Item Jasa Pemasangan Tahap 2</h4>

        {quotation.quotation_details
          .filter((x) => x.type === 2 && x.work_step === 2)
          .map((element, index) => (
            <UpdateQuotationServiceItemCard
              key={`${element.index}-service-step2`}
              element={element}
              index={index}
              workStep={2}
              handleChangeQuotationDetails={handleChangeQuotationDetails}
              validateQtyInput={validateQtyInput}
              calculateEachDetail={calculateEachDetail}
              handleMarginType={handleMarginType}
              handleRemoveQuotationDetailForm={handleRemoveQuotationDetailForm}
            />
          ))}

        <Button
          className='add-jasa'
          variant='button-dark-success'
          onClick={() => addQuotationDetail(2, 2)}
        >
          Tambah Jasa
        </Button>
      </div>

      <hr />
      <div className='item-jasa'>
        <h4 className='fs-4 fw-bold mb-5'>Item Jasa Pemasangan Tahap 3</h4>

        {quotation.quotation_details
          .filter((x) => x.type === 2 && x.work_step === 3)
          .map((element, index) => (
            <UpdateQuotationServiceItemCard
              key={`${element.index}-service-step3`}
              element={element}
              index={index}
              workStep={3}
              handleChangeQuotationDetails={handleChangeQuotationDetails}
              validateQtyInput={validateQtyInput}
              calculateEachDetail={calculateEachDetail}
              handleMarginType={handleMarginType}
              handleRemoveQuotationDetailForm={handleRemoveQuotationDetailForm}
            />
          ))}

        <Button
          className='add-jasa'
          variant='button-dark-success'
          onClick={() => addQuotationDetail(2, 3)}
        >
          Tambah Jasa
        </Button>
      </div>
    </>
  )
}
