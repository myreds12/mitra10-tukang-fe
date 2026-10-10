import React from 'react'
import {CategorySelect, QuotationDetail} from '../types'
import {UpdateQuotationServiceItemCard} from './UpdateQuotationServiceItemCard'

interface UpdateQuotationServiceSectionProps {
  quotationData: any
  quotationDetail: QuotationDetail[]
  categories: CategorySelect[]
  handleCategoryChange: (index: any, value: any) => void
}

export const UpdateQuotationServiceSection: React.FC<UpdateQuotationServiceSectionProps> = ({
  quotationData,
  quotationDetail,
  categories,
  handleCategoryChange,
}) => {
  return (
    <>
      {quotationData?.quotation_special === 0 && (
        <>
          <hr />

          <div className='item-jasa'>
            <h4 className='fs-5 fw-semibold mb-5'>Item Jasa Pemasangan</h4>

            {quotationDetail
              .filter((x) => x.type === 2)
              .map((element) => (
                <UpdateQuotationServiceItemCard
                  key={`${element.index}-service`}
                  element={element}
                  categories={categories}
                  handleCategoryChange={handleCategoryChange}
                />
              ))}
          </div>
        </>
      )}

      {quotationData?.quotation_special === 1 && (
        <>
          <hr />

          <div className='p-0'>
            <p className='fs-7 text-black'>Keterangan : </p>
            <p className='fs-7 fw-semibold text-black'>
              *Quotation ini menggunakan quotation tipe spesial
            </p>
            <p className='fs-7 fw-semibold text-black'>
              *Quotation spesial merupakan quotation yang nominalnya diatas 20.000.000
            </p>
          </div>

          <hr />

          <div className='item-jasa'>
            <h4 className='fs-5 fw-semibold mb-5'>Jasa Pemasangan Tahap 1</h4>

            {quotationDetail
              .filter((x) => x.type === 2 && x.work_step === 1)
              .map((element) => (
                <UpdateQuotationServiceItemCard
                  key={`${element.index}-service`}
                  element={element}
                  categories={categories}
                  handleCategoryChange={handleCategoryChange}
                />
              ))}
          </div>

          <hr />

          <div className='item-jasa'>
            <h4 className='fs-5 fw-semibold mb-5'>Jasa Pemasangan Tahap 2</h4>

            {quotationDetail
              .filter((x) => x.type === 2 && x.work_step === 2)
              .map((element) => (
                <UpdateQuotationServiceItemCard
                  key={`${element.index}-service`}
                  element={element}
                  categories={categories}
                  handleCategoryChange={handleCategoryChange}
                />
              ))}
          </div>

          <hr />

          <div className='item-jasa'>
            <h4 className='fs-5 fw-semibold mb-5'>Jasa Pemasangan Tahap 3</h4>

            {quotationDetail
              .filter((x) => x.type === 2 && x.work_step === 3)
              .map((element) => (
                <UpdateQuotationServiceItemCard
                  key={`${element.index}-service`}
                  element={element}
                  categories={categories}
                  handleCategoryChange={handleCategoryChange}
                />
              ))}
          </div>
        </>
      )}
    </>
  )
}
