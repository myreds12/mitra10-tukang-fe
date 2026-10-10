import React from 'react'
import {Row, Col, Form, ListGroup} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUpload, faImage, faFileImage, faTrash} from '@fortawesome/free-solid-svg-icons'
import {CheckStates} from '../types'

interface VendorDocumentsSectionProps {
  userRole: string
  handleUploadKTP: () => void
  handleFileChangeKTP: (e: React.ChangeEvent<HTMLInputElement>) => void
  imageKTP: {blob: string; fileName: string}
  handleChangeKTPNumber: (e: React.ChangeEvent<HTMLInputElement>) => void
  ktpNumber: any
  handleUploadNPWP: () => void
  handleFileChangeNPWP: (e: React.ChangeEvent<HTMLInputElement>) => void
  imageNPWP: {blob: string; fileName: string}
  handleChangeNPWPNumber: (e: React.ChangeEvent<HTMLInputElement>) => void
  npwpNumber: any
  handleFileChangeCompro: (e: React.ChangeEvent<HTMLInputElement>) => void
  isActive: CheckStates
  handleFormCheckbox: (element: keyof CheckStates) => void
  imageCompro: {blob: string; fileName: string}
  handleUploadCompro: () => void
  handleFileChangeSuratPermohonan: (e: React.ChangeEvent<HTMLInputElement>) => void
  imageSuratPermohonan: {blob: string; fileName: string}
  handleUploadSuratPermohonan: () => void
  handleFileChangePksEvidence: (e: React.ChangeEvent<HTMLInputElement>) => void
  imagePksEvidence: {blob: string; fileName: string}
  handleUploadPksEvidence: () => void
  handleFileChangeSuipEvidence: (e: React.ChangeEvent<HTMLInputElement>) => void
  imageSuipEvidence: {blob: string; fileName: string}
  handleUploadSuipEvidence: () => void
  handleFileChangePtkpEvidence: (e: React.ChangeEvent<HTMLInputElement>) => void
  imagePtkpEvidence: {blob: string; fileName: string}
  handleUploadPtkpEvidence: () => void
  evidenceRef: React.RefObject<any>
  handleImageClick: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadFiles: Array<any>
  handleRemoveFile: (index: number) => void
}

export const VendorDocumentsSection: React.FC<VendorDocumentsSectionProps> = ({
  userRole,
  handleUploadKTP,
  handleFileChangeKTP,
  imageKTP,
  handleChangeKTPNumber,
  ktpNumber,
  handleUploadNPWP,
  handleFileChangeNPWP,
  imageNPWP,
  handleChangeNPWPNumber,
  npwpNumber,
  handleFileChangeCompro,
  isActive,
  handleFormCheckbox,
  imageCompro,
  handleUploadCompro,
  handleFileChangeSuratPermohonan,
  imageSuratPermohonan,
  handleUploadSuratPermohonan,
  handleFileChangePksEvidence,
  imagePksEvidence,
  handleUploadPksEvidence,
  handleFileChangeSuipEvidence,
  imageSuipEvidence,
  handleUploadSuipEvidence,
  handleFileChangePtkpEvidence,
  imagePtkpEvidence,
  handleUploadPtkpEvidence,
  evidenceRef,
  handleImageClick,
  handleFileChange,
  uploadFiles,
  handleRemoveFile,
}) => {
  const isVendorRole = ['Owner Vendor', 'Admin Vendor'].includes(userRole)

  return (
    <Col xxl={3} xl={3} lg={12} md={12}>
      <Row className='header-body' />

      <Row className='form-body'>
        <Form.Group>
          <div className='d-flex justify-content-between' onClick={handleUploadKTP}>
            <Form.Control
              id='input-ktp-file'
              type='file'
              accept='.jpg, .jpeg, .png'
              hidden
              className='input-field-image'
              onChange={handleFileChangeKTP}
            />

            <Form.Label className='me-2'>KTP</Form.Label>

            <div className='d-flex'>
              <Form.Label className='me-2 text-decoration-underline text-primary'>
                {imageKTP.fileName ? imageKTP.fileName : ''}
              </Form.Label>

              <FontAwesomeIcon icon={faUpload} size='lg' />
            </div>
          </div>

          <Form.Control
            type='number'
            onChange={handleChangeKTPNumber}
            value={ktpNumber}
            readOnly={isVendorRole}
          />
        </Form.Group>
      </Row>

      <Row className='form-body'>
        <Form.Group>
          <div className='d-flex justify-content-between' onClick={handleUploadNPWP}>
            <Form.Control
              id='input-npwp-file'
              type='file'
              accept='.jpg, .jpeg, .png'
              hidden
              className='input-field-image'
              onChange={handleFileChangeNPWP}
            />

            <Form.Label className='me-2'>NPWP</Form.Label>

            <div className='d-flex'>
              <Form.Label className='me-2 text-decoration-underline text-primary'>
                {imageNPWP.fileName ? imageNPWP.fileName : ''}
              </Form.Label>

              <FontAwesomeIcon icon={faUpload} size='lg' />
            </div>
          </div>

          <Form.Control
            type='number'
            onChange={handleChangeNPWPNumber}
            value={npwpNumber}
            readOnly={isVendorRole}
          />
        </Form.Group>
      </Row>

      <Row className='form-body'>
        <Form.Group className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Control
            id='input-compro-file'
            type='file'
            accept='.jpg, .jpeg, .png'
            hidden
            className='input-field-image'
            onChange={handleFileChangeCompro}
          />

          <div className='upload d-flex align-items-center'>
            <Form.Check
              checked={isActive.compro}
              onChange={() => handleFormCheckbox('compro')}
            />

            <Form.Label className='ms-2'>COMPRO</Form.Label>
          </div>

          <Form.Label className='text-primary fw-semibold text-decoration-underline ms-2 me-2'>
            {imageCompro.fileName ? imageCompro.fileName : ''}
          </Form.Label>

          <FontAwesomeIcon icon={faUpload} size='lg' onClick={handleUploadCompro} />
        </Form.Group>

        <Form.Group className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Control
            id='input-surat_permohonan-file'
            type='file'
            accept='.jpg, .jpeg, .png'
            hidden
            className='input-field-image'
            onChange={handleFileChangeSuratPermohonan}
          />

          <div className='upload d-flex align-items-center'>
            <Form.Check
              checked={isActive.suratPermohonan}
              onChange={() => handleFormCheckbox('suratPermohonan')}
            />
            <Form.Label className='ms-2'>Surat Pemohonan</Form.Label>
          </div>

          <Form.Label className='text-primary fw-semibold text-decoration-underline ms-2 me-2'>
            {imageSuratPermohonan.fileName ? imageSuratPermohonan.fileName : ''}
          </Form.Label>

          <FontAwesomeIcon
            icon={faUpload}
            size='lg'
            onClick={handleUploadSuratPermohonan}
          />
        </Form.Group>

        <Form.Group className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Control
            id='input-pks-file'
            type='file'
            accept='.jpg, .jpeg, .png'
            hidden
            className='input-field-image'
            onChange={handleFileChangePksEvidence}
          />

          <div className='upload d-flex align-items-center'>
            <Form.Check
              checked={isActive.pks}
              onChange={() => handleFormCheckbox('pks')}
            />
            <Form.Label className='ms-2'>PKS</Form.Label>
          </div>

          <Form.Label className='text-primary fw-semibold text-decoration-underline ms-2 me-2'>
            {imagePksEvidence.fileName ? imagePksEvidence.fileName : ''}
          </Form.Label>

          <FontAwesomeIcon icon={faUpload} size='lg' onClick={handleUploadPksEvidence} />
        </Form.Group>

        <Form.Group className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Control
            id='input-suip-file'
            type='file'
            accept='.jpg, .jpeg, .png'
            hidden
            className='input-field-image'
            onChange={handleFileChangeSuipEvidence}
          />

          <div className='upload d-flex align-items-center'>
            <Form.Check
              checked={isActive.suip}
              onChange={() => handleFormCheckbox('suip')}
            />
            <Form.Label className='ms-2'>SIUP</Form.Label>
          </div>

          <Form.Label className='text-primary fw-semibold text-decoration-underline ms-2 me-2'>
            {imageSuipEvidence.fileName ? imageSuipEvidence.fileName : ''}
          </Form.Label>

          <FontAwesomeIcon icon={faUpload} size='lg' onClick={handleUploadSuipEvidence} />
        </Form.Group>

        {!isVendorRole && (
          <Form.Group className='d-flex justify-content-between align-items-center mb-2'>
            <Form.Control
              id='input-ptkp-file'
              type='file'
              accept='.jpg, .jpeg, .png'
              hidden
              className='input-field-image'
              onChange={handleFileChangePtkpEvidence}
            />

            <div className='upload d-flex flex-column align-items-start p-0'>
              <Form.Check
                id='radio-ptkp'
                label={<Form.Label className=''>PKP</Form.Label>}
                name='true'
                type='radio'
                checked={isActive.ptkp === true}
                onChange={() => handleFormCheckbox('ptkp')}
              />

              <Form.Check
                id='radio-ptkp'
                label={<Form.Label className=''>Non PKP</Form.Label>}
                name='ptkp_false'
                type='radio'
                checked={isActive.ptkp === false}
                onChange={() => handleFormCheckbox('ptkp')}
              />
            </div>

            <Form.Label className='text-primary fw-semibold text-decoration-underline ms-2 me-2'>
              {imagePtkpEvidence.blob ? imagePtkpEvidence.fileName : ''}
            </Form.Label>

            <FontAwesomeIcon
              icon={faUpload}
              size='lg'
              onClick={handleUploadPtkpEvidence}
            />
          </Form.Group>
        )}
      </Row>

      {!isVendorRole && (
        <Row className='form-body'>
          <Form.Group>
            <Form.Label>Upload other docs</Form.Label>
            <Form className='form-input-image' onClick={handleImageClick}>
              <Form.Control
                id='file-input'
                type='file'
                accept='.jpg, .jpeg, .png'
                multiple
                hidden
                ref={evidenceRef}
                onChange={handleFileChange}
              />

              <div className='input-image-text'>
                <FontAwesomeIcon icon={faImage} color='#858585' size='2xl' />
                <p>Add File</p>
              </div>
            </Form>

            <ListGroup className='pt-3'>
              {uploadFiles.length ? (
                uploadFiles.map((item, index) => (
                  <ListGroup.Item
                    key={`${(item as any)?.name}-${index}-${(item as any)?.type}`}
                    className='d-flex justify-content-between'
                  >
                    <FontAwesomeIcon icon={faFileImage} color='#858585' size='sm' />

                    <span className='upload-content'>{(item as any)?.name}</span>

                    <FontAwesomeIcon
                      icon={faTrash}
                      size='sm'
                      color='#ed2b2a'
                      style={{cursor: 'pointer'}}
                      onClick={() => handleRemoveFile(index)}
                    />
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className='d-flex justify-content-center'>
                  Tidak ada file yang dipilih
                </ListGroup.Item>
              )}
            </ListGroup>
          </Form.Group>
        </Row>
      )}
    </Col>
  )
}
