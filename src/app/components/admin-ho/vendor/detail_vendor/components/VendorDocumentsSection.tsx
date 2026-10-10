import React from 'react'
import {Row, Col, Form} from 'react-bootstrap'

interface DocumentFileState {
  blob: string
  fileName: string
}

interface VendorDocumentsSectionProps {
  imageKTP: DocumentFileState
  imageNPWP: DocumentFileState
  imageCompro: DocumentFileState
  imageSuratPermohonan: DocumentFileState
  apiUrl?: string
}

export const VendorDocumentsSection: React.FC<VendorDocumentsSectionProps> = ({
  imageKTP,
  imageNPWP,
  imageCompro,
  imageSuratPermohonan,
  apiUrl,
}) => {
  return (
    <Row>
      <Col xxl={4}>
        <div className='d-flex flex-column'>
          <div className='mb-5'>
            <Form.Group controlId='formFileKtp'>
              <Form.Label>Foto KTP</Form.Label>
              <Form className='form-input-image'>
                <Form.Control
                  type='file'
                  accept='image/*'
                  className='input-field-image'
                  hidden
                />

                {imageKTP?.fileName ? (
                  <img
                    src={`${apiUrl}/public/vendors/${imageKTP.fileName}`}
                    alt={imageKTP.fileName}
                    className='image-preview'
                  />
                ) : null}
              </Form>
            </Form.Group>
          </div>

          <div className='mb-5'>
            <Form.Group controlId='formFileNpwp'>
              <Form.Label>Foto NPWP</Form.Label>
              <Form className='form-input-image'>
                <Form.Control
                  type='file'
                  accept='image/*'
                  className='input-field-image'
                  hidden
                />

                {imageNPWP?.fileName ? (
                  <img
                    src={`${apiUrl}/public/vendors/${imageNPWP.fileName}`}
                    alt={imageNPWP.fileName}
                    className='image-preview'
                  />
                ) : null}
              </Form>
            </Form.Group>
          </div>
        </div>
      </Col>

      <Col xxl={4}>
        <Form.Group controlId='formFileCompro'>
          <Form.Label>Foto Company Profile</Form.Label>
          {imageCompro.fileName ? (
            <Form className='form-input-image'>
              <Form.Control
                type='file'
                accept='image/*'
                className='input-field-image'
                hidden
              />

              <img
                src={`${apiUrl}/public/vendors/${imageCompro.fileName}`}
                alt={imageCompro.fileName}
                className='image-preview'
              />
            </Form>
          ) : (
            <p className='fw-semibold text-danger'>File belum tersedia</p>
          )}
        </Form.Group>
      </Col>

      <Col xxl={4}>
        <Form.Group controlId='formFilePermohonan'>
          <Form.Label>Foto Surat Permohonan</Form.Label>
          {imageSuratPermohonan.fileName ? (
            <Form className='form-input-image'>
              <Form.Control
                type='file'
                accept='image/*'
                className='input-field-image'
                hidden
              />

              <img
                src={`${apiUrl}/public/vendors/${imageSuratPermohonan.fileName}`}
                alt={imageSuratPermohonan.fileName}
                className='image-preview'
              />
            </Form>
          ) : (
            <p className='fw-semibold text-danger'>File belum tersedia</p>
          )}
        </Form.Group>
      </Col>
    </Row>
  )
}
