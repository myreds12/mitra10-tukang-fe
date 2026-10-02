import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';

interface Props {
  images: any;
  onChange: (field: string, file: any) => void;
}

export const DocumentUploadForm: React.FC<Props> = ({ images, onChange }) => {
  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      onChange(field, {
        blob: URL.createObjectURL(file),
        fileName: file.name,
        file: file,
      });
    }
  };

  const handleRemove = (field: string, blob?: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (blob) {
      URL.revokeObjectURL(blob);
    }

    const input = document.getElementById(`input-${field}`) as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }

    onChange(field, null);
  };

  const renderUpload = (field: string, label: string, isAvatar = false) => {
    const imageState = images[field];

    if (isAvatar) {
      return (
        <Form.Group className="text-center">
          <div
            onClick={() => document.getElementById(`input-${field}`)?.click()}
            style={{
              cursor: 'pointer', border: '2px dashed #ccc', borderRadius: '10px', padding: '20px',
              backgroundColor: '#f8f9fa', minHeight: '150px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Form.Control
              id={`input-${field}`}
              type="file"
              accept=".jpg, .jpeg, .png"
              hidden
              onChange={handleFileChange(field)}
            />
            {imageState?.blob ? (
              <div style={{ position: 'relative' }}>
                <img src={imageState.blob} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #020080' }} />
                <button
                  type="button"
                  aria-label={`Hapus ${label}`}
                  onClick={handleRemove(field, imageState.blob)}
                  style={{
                    position: 'absolute',
                    right: '-8px',
                    top: '-8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} fontSize="12px" />
                </button>
              </div>
            ) : (
              <>
                <FontAwesomeIcon icon={faUpload} size="2x" style={{ color: '#666', marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Upload {label}</p>
              </>
            )}
          </div>
          <Form.Label style={{ fontWeight: 500, marginTop: '10px', fontSize: '13px' }}>{label}</Form.Label>
        </Form.Group>
      );
    }

    return (
      <Form.Group className="mb-3">
        <div className="vendor-document-upload-row d-flex justify-content-between align-items-center" style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} onClick={() => document.getElementById(`input-${field}`)?.click()}>
          <Form.Control
            id={`input-${field}`}
            type="file"
            accept=".jpg, .jpeg, .png, .pdf"
            hidden
            onChange={handleFileChange(field)}
          />
          <Form.Label className="m-0 fw-bold">{label}</Form.Label>
          <div className="vendor-document-upload-file d-flex align-items-center">
            <span className="me-3 text-primary text-decoration-underline" style={{ fontSize: '12px' }}>
              {imageState?.fileName || 'Pilih File'}
            </span>
            {imageState?.fileName ? (
              <button
                type="button"
                aria-label={`Hapus ${label}`}
                className="btn btn-icon btn-sm btn-light-danger"
                onClick={handleRemove(field, imageState.blob)}
              >
                <FontAwesomeIcon icon={faTrash} fontSize="12px" />
              </button>
            ) : (
              <FontAwesomeIcon icon={faUpload} />
            )}
          </div>
        </div>
      </Form.Group>
    );
  };

  return (
    <>
      <hr className="my-4" />
      <h5 className="mb-4 fw-bold">Dokumen Pendukung</h5>
      <Row>
        <Col md={4} className="mb-4">
          {renderUpload('vendor_image', 'Foto Vendor/Toko', true)}
        </Col>
        <Col md={8}>
          <Row>
            <Col md={6}>{renderUpload('ktp_image', 'KTP')}</Col>
            <Col md={6}>{renderUpload('npwp_image', 'NPWP')}</Col>
            <Col md={6}>{renderUpload('compro_image', 'Company Profile')}</Col>
            <Col md={6}>{renderUpload('surat_permohonan_image', 'Surat Permohonan')}</Col>
            <Col md={6}>{renderUpload('pks_image', 'PKS')}</Col>
            <Col md={6}>{renderUpload('siup_image', 'SIUP / NIB')}</Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
