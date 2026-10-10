import React from 'react'
import {getImageUrl} from './formatters'

interface DocumentItem {
  key: string
  label: string
  value?: string
}

interface VendorDocumentListCardProps {
  documentList: DocumentItem[]
  uploadedDocsCount: number
  apiUrl?: string
  setPreviewDoc: (doc: {title: string; url: string}) => void
}

export const VendorDocumentListCard: React.FC<VendorDocumentListCardProps> = ({
  documentList,
  uploadedDocsCount,
  apiUrl,
  setPreviewDoc,
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
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
            <path d='M14 2v6h6' />
          </svg>
          Dokumen
        </h2>
        <span className='count-badge'>
          {uploadedDocsCount} / {documentList.length} lengkap
        </span>
      </div>

      <div className='doc-list'>
        {documentList.map((doc, idx) => {
          const hasFile = Boolean(doc.value)
          const docUrl = hasFile ? getImageUrl(apiUrl, doc.value) : ''

          return (
            <div key={idx} className={`doc-row ${hasFile ? '' : 'missing'}`}>
              <span className='doc-row-label'>{doc.label}</span>
              {hasFile ? (
                <button
                  type='button'
                  className='file-link'
                  onClick={() => setPreviewDoc({title: doc.label, url: docUrl})}
                  title={`Lihat dokumen ${doc.label}`}
                >
                  Lihat Dokumen
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                  >
                    <path d='M7 17 17 7M7 7h10v10' />
                  </svg>
                </button>
              ) : (
                <span className='file-link'>Belum diunggah</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
