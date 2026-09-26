import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { handleNumericKeyDown, sanitizeNumeric } from '../../utils/numericInput';

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
  onBlur?: (field: string, value: any) => void;
}

export const PicInfoForm: React.FC<Props> = ({ data, onChange, errors, onBlur }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get(`${apiUrl}/bank/public/list`);
        if (Array.isArray(response.data.data?.data)) {
          setBanks(response.data.data.data.map((item: any) => ({ value: item.id, label: item.bank_name })));
        }
      } catch (err) {
        console.error('Failed to load banks', err);
      }
    };
    fetchBanks();
  }, [apiUrl]);

  return (
    <>
      <hr className="my-4" />
      <h5 className="mb-4 fw-bold">Informasi Penanggung Jawab (PIC)</h5>

      <Row className="form-body mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontWeight: 500 }}>Nama PIC</Form.Label>
            <Form.Control
              type="text"
              value={data.pic_name}
              onChange={(e) => onChange('pic_name', e.target.value)}
              placeholder="Nama penanggung jawab"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontWeight: 500 }}>Nomor HP / WA PIC</Form.Label>
            <Form.Control
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={data.pic_phone}
              onChange={(e) => onChange('pic_phone', sanitizeNumeric(e.target.value))}
              onKeyDown={handleNumericKeyDown}
              onBlur={(e) => onBlur && onBlur('pic_phone', e.target.value)}
              placeholder="08xxxxxxxxxx"
              isInvalid={Boolean(errors?.pic_phone)}
            />
            {errors?.pic_phone && (
              <div className="text-danger mt-1 fs-7 fw-semibold">
                {errors.pic_phone}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className="form-body mb-3">
        <Form.Group>
          <Form.Label style={{ fontWeight: 500 }}>Email PIC</Form.Label>
          <Form.Control
            type="email"
            value={data.pic_email}
            onChange={(e) => onChange('pic_email', e.target.value)}
            onBlur={(e) => onBlur && onBlur('pic_email', e.target.value)}
            placeholder="email@pic.com"
            isInvalid={Boolean(errors?.pic_email)}
          />
          {errors?.pic_email && (
            <div className="text-danger mt-1 fs-7 fw-semibold">
              {errors.pic_email}
            </div>
          )}
        </Form.Group>
      </Row>

      <Row className="form-body mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontWeight: 500 }}>Nomor KTP</Form.Label>
            <Form.Control
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={16}
              value={data.ktp_number || ''}
              onChange={(e) => onChange('ktp_number', sanitizeNumeric(e.target.value, 16))}
              onKeyDown={handleNumericKeyDown}
              onBlur={(e) => onBlur && onBlur('ktp_number', e.target.value)}
              placeholder="Nomor KTP"
              isInvalid={Boolean(errors?.ktp_number)}
            />
            {errors?.ktp_number && (
              <div className="text-danger mt-1 fs-7 fw-semibold">
                {errors.ktp_number}
              </div>
            )}
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontWeight: 500 }}>Bank (Opsional)</Form.Label>
            <Select
              classNamePrefix="select"
              placeholder="Pilih Nama Bank"
              isSearchable
              isClearable
              options={banks}
              value={banks.find((b) => b.value === data.bank_id) || null}
              onChange={(element: any) => onChange('bank_id', element?.value || null)}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};
