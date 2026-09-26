import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axios from 'axios';

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
  onBlur?: (field: string, value: any) => void;
}

export const CompanyInfoForm: React.FC<Props> = ({ data, onChange, errors, onBlur }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const animatedComponents = makeAnimated();

  const [serviceArea, setServiceArea] = useState<any[]>([]);
  const [serviceType, setServiceType] = useState<any[]>([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [areaRes, typeRes] = await Promise.all([
          axios.get(`${apiUrl}/area?take=100`),
          axios.get(`${apiUrl}/service-type/public/list`),
        ]);

        if (Array.isArray(areaRes.data.data)) {
          setServiceArea(areaRes.data.data.map((item: any) => ({ value: item.id, label: item.area })));
        }
        if (Array.isArray(typeRes.data.data?.data)) {
          setServiceType(typeRes.data.data.data.map((item: any) => ({ value: item.id, label: item.service_type })));
        }
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    };
    fetchDropdowns();
  }, [apiUrl]);

  return (
    <>
      <h5 className="mb-4 fw-bold">Informasi Perusahaan</h5>
      <Row className="form-body mb-3">
        <Form.Group>
          <Form.Label style={{ fontWeight: 500 }}>Nama Perusahaan</Form.Label>
          <Form.Control
            type="text"
            value={data.company_name}
            onChange={(e) => onChange('company_name', e.target.value)}
            onBlur={(e) => onBlur && onBlur('company_name', e.target.value)}
            placeholder="Nama perusahaan/usaha"
            isInvalid={Boolean(errors?.company_name)}
          />
          {errors?.company_name && (
            <div className="text-danger mt-1 fs-7 fw-semibold">
              {errors.company_name}
            </div>
          )}
        </Form.Group>
      </Row>

      <Row className="form-body mb-3">
        <Form.Group>
          <Form.Label style={{ fontWeight: 500 }}>Email Perusahaan</Form.Label>
          <Form.Control
            type="email"
            value={data.email_address}
            onChange={(e) => onChange('email_address', e.target.value)}
            onBlur={(e) => onBlur && onBlur('email_address', e.target.value)}
            placeholder="email@perusahaan.com"
            isInvalid={Boolean(errors?.email_address)}
          />
          {errors?.email_address && (
            <div className="text-danger mt-1 fs-7 fw-semibold">
              {errors.email_address}
            </div>
          )}
        </Form.Group>
      </Row>

      <Row className="form-body mb-3">
        <Form.Group>
          <Form.Label style={{ fontWeight: 500 }}>Telepon Perusahaan</Form.Label>
          <Form.Control
            type="text"
            value={data.phone_number}
            onChange={(e) => onChange('phone_number', e.target.value)}
            onBlur={(e) => onBlur && onBlur('phone_number', e.target.value)}
            placeholder="08xxxxxxxxxx"
            isInvalid={Boolean(errors?.phone_number)}
          />
          {errors?.phone_number && (
            <div className="text-danger mt-1 fs-7 fw-semibold">
              {errors.phone_number}
            </div>
          )}
        </Form.Group>
      </Row>

      <Row className="form-body mb-3">
        <Form.Group>
          <Form.Label style={{ fontWeight: 500 }}>NPWP Perusahaan</Form.Label>
          <Form.Control
            type="text"
            value={data.npwp_number || ''}
            onChange={(e) => onChange('npwp_number', e.target.value)}
            onBlur={(e) => onBlur && onBlur('npwp_number', e.target.value)}
            placeholder="Nomor NPWP Perusahaan"
            isInvalid={Boolean(errors?.npwp_number)}
          />
          {errors?.npwp_number && (
            <div className="text-danger mt-1 fs-7 fw-semibold">
              {errors.npwp_number}
            </div>
          )}
        </Form.Group>
      </Row>

      <Row className="form-body mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontWeight: 500 }}>Service Area</Form.Label>
            <Select
              classNamePrefix="select"
              placeholder="Pilih Service Area"
              isSearchable
              isMulti
              closeMenuOnSelect={false}
              components={animatedComponents}
              options={serviceArea}
              onChange={(elements: any) => onChange('areas', elements.map((el: any) => el.value))}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontWeight: 500 }}>Service Type</Form.Label>
            <Select
              classNamePrefix="select"
              placeholder="Pilih Service Type"
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={serviceType}
              onChange={(elements: any) => onChange('service_types', elements.map((el: any) => el.value))}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="form-body mb-3">
        <Form.Group>
          <Form.Label style={{ fontWeight: 500 }}>Alamat Lengkap</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Alamat lengkap"
          />
        </Form.Group>
      </Row>
    </>
  );
};
