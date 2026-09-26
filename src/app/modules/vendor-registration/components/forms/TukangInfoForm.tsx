import React, {useState, useEffect} from 'react'
import {Form, Button, Row, Col} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faTrash,
  faUser,
  faPhone,
  faIdCard,
  faTools,
} from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import axios from 'axios'
import type {TukangItem} from '../../hooks/useVendorRegistrationForm'
import {handleNumericKeyDown, sanitizeNumeric} from '../../utils/numericInput'

interface TukangInfoFormProps {
  tukangList: TukangItem[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof TukangItem, value: any) => void
  ktpErrors?: Record<number, string>
  onKtpBlur?: (index: number, value: string) => void
  phoneErrors?: Record<number, string>
  onPhoneBlur?: (index: number, value: string) => void
}

export const TukangInfoForm: React.FC<TukangInfoFormProps> = ({
  tukangList,
  onAdd,
  onRemove,
  onUpdate,
  ktpErrors,
  onKtpBlur,
  phoneErrors,
  onPhoneBlur,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const animatedComponents = makeAnimated()
  const [serviceTypeOptions, setServiceTypeOptions] = useState<any[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false)
  const [errorOptions, setErrorOptions] = useState<string | null>(null)

  useEffect(() => {
    const fetchServiceTypes = async () => {
      setIsLoadingOptions(true)
      setErrorOptions(null)
      try {
        const res = await axios.get(`${apiUrl}/service-type/public/list`)
        const data = res.data?.data?.data || res.data?.data || []
        const options = data.map((item: any) => ({
          value: item.id,
          label: item.service_type,
        }))
        setServiceTypeOptions(options)
      } catch (err) {
        console.error('Failed to load service types', err)
        setErrorOptions('Gagal memuat daftar keahlian')
      } finally {
        setIsLoadingOptions(false)
      }
    }
    fetchServiceTypes()
  }, [apiUrl])

  return (
    <div className='tukang-section mb-10'>
      {/* Section Header */}
      <div className='d-flex align-items-center justify-content-between mb-6'>
        <div>
          <h3 className='fw-bold text-dark mb-1'>Informasi Tukang</h3>
          <div className='text-muted fs-7'>
            Tambahkan data tukang yang akan bekerja dengan vendor ini
          </div>
        </div>
        <Button
          variant='primary'
          onClick={onAdd}
          className='btn btn-primary btn-sm d-flex align-items-center gap-2'
        >
          <FontAwesomeIcon icon={faPlus} />
          Tambah Tukang
        </Button>
      </div>

      {/* Empty State */}
      {tukangList.length === 0 && (
        <div
          className='text-center py-10 bg-light rounded border border-dashed border-gray-300'
        >
          <FontAwesomeIcon icon={faUser} className='text-muted mb-3 fs-1' />
          <div className='text-gray-600 fw-semibold'>Belum ada tukang ditambahkan.</div>
          <div className='text-muted fs-7'>
            Klik "Tambah Tukang" untuk menambahkan data tukang.
          </div>
        </div>
      )}

      {/* Tukang Cards */}
      <div className='d-flex flex-column gap-5'>
        {tukangList.map((tukang, idx) => (
          <div
            key={idx}
            className='card shadow-sm border border-gray-200'
          >
            {/* Card Header */}
            <div
              className='card-header min-h-50px px-6 py-2 bg-primary'
              style={{ borderBottom: 'none' }}
            >
              <div className='card-title m-0'>
                <div className='d-flex align-items-center gap-3'>
                  <div
                    className='symbol symbol-30px symbol-circle'
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    <span className='symbol-label bg-transparent text-white fw-bold fs-7'>
                      {idx + 1}
                    </span>
                  </div>
                  <h4 className='text-white fw-bold fs-6 m-0'>Tukang {idx + 1}</h4>
                </div>
              </div>
              <div className='card-toolbar'>
                <Button
                  variant='link'
                  onClick={() => onRemove(idx)}
                  className='btn btn-icon btn-sm btn-color-white btn-active-color-primary'
                  title='Hapus Tukang'
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            </div>

            {/* Card Body */}
            <div className='card-body p-6'>
              <Row className='g-6'>
                {/* Nama Lengkap */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='form-label fw-bold fs-7 text-gray-700'>
                      <FontAwesomeIcon icon={faUser} className='me-2 text-primary' />
                      Nama Lengkap
                    </Form.Label>
                    <Form.Control
                      type='text'
                      className='form-control form-control-solid'
                      placeholder='Masukkan nama lengkap tukang'
                      value={tukang.full_name}
                      onChange={(e) => onUpdate(idx, 'full_name', e.target.value)}
                    />
                  </Form.Group>
                </Col>

                {/* No. HP */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='form-label fw-bold fs-7 text-gray-700'>
                      <FontAwesomeIcon icon={faPhone} className='me-2 text-primary' />
                      No. HP
                    </Form.Label>
                    <Form.Control
                      type='text'
                      inputMode='numeric'
                      pattern='[0-9]*'
                      className='form-control form-control-solid'
                      placeholder='08xxxxxxxxxx'
                      value={tukang.phone_number}
                      onChange={(e) => onUpdate(idx, 'phone_number', sanitizeNumeric(e.target.value))}
                      onKeyDown={handleNumericKeyDown}
                      onBlur={(e) => onPhoneBlur && onPhoneBlur(idx, e.target.value)}
                      isInvalid={Boolean(phoneErrors?.[idx])}
                    />
                    {phoneErrors?.[idx] && (
                      <div className='text-danger mt-1 fs-7 fw-semibold'>
                        {phoneErrors[idx]}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* No. KTP */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='form-label fw-bold fs-7 text-gray-700'>
                      <FontAwesomeIcon icon={faIdCard} className='me-2 text-primary' />
                      No. KTP
                    </Form.Label>
                    <Form.Control
                      type='text'
                      inputMode='numeric'
                      pattern='[0-9]*'
                      maxLength={16}
                      className='form-control form-control-solid'
                      placeholder='Nomor KTP'
                      value={tukang.ktp_number}
                      onChange={(e) => onUpdate(idx, 'ktp_number', sanitizeNumeric(e.target.value, 16))}
                      onKeyDown={handleNumericKeyDown}
                      onBlur={(e) => onKtpBlur && onKtpBlur(idx, e.target.value)}
                      isInvalid={Boolean(ktpErrors?.[idx])}
                    />
                    {ktpErrors?.[idx] && (
                      <div className='text-danger mt-1 fs-7 fw-semibold'>
                        {ktpErrors[idx]}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Skill / Keahlian */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className='form-label fw-bold fs-7 text-gray-700'>
                      <FontAwesomeIcon icon={faTools} className='me-2 text-primary' />
                      Skill / Keahlian
                    </Form.Label>
                    <Select
                      isMulti
                      closeMenuOnSelect={false}
                      menuPortalTarget={document.body}
                      isLoading={isLoadingOptions}
                      placeholder={errorOptions || 'Pilih keahlian...'}
                      options={serviceTypeOptions}
                      components={animatedComponents}
                      value={serviceTypeOptions.filter((opt) =>
                        (tukang.service_type_id || []).includes(opt.value)
                      )}
                      onChange={(selected: any) =>
                        onUpdate(
                          idx,
                          'service_type_id',
                          selected.map((s: any) => s.value)
                        )
                      }
                      styles={{
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                        control: (base) => ({
                          ...base,
                          borderRadius: '0.475rem',
                          padding: '2px 4px',
                          backgroundColor: '#f5f8fa',
                          border: 'none',
                          fontSize: '13px',
                        }),
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Selected Skills Tags */}
              {(tukang.service_type_id || []).length > 0 && (
                <div className='mt-6 d-flex flex-wrap gap-2'>
                  {serviceTypeOptions
                    .filter((opt) => (tukang.service_type_id || []).includes(opt.value))
                    .map((opt) => (
                      <span
                        key={opt.value}
                        className='badge badge-light-primary px-3 py-2 rounded-pill fs-9'
                      >
                        {opt.label}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
