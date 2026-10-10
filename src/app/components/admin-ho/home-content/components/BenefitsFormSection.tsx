import React, {FC} from 'react'
import {Input, Select, Row, Col, Button as AntButton} from 'antd'
import {PlusOutlined, DeleteOutlined} from '@ant-design/icons'
import {UnifiedHomePayload, BenefitAccentColor} from '../../../../services/homeContentService'
import {BENEFIT_EMOJI_PRESETS, ACCENT_OPTIONS} from '../constants'

const {TextArea} = Input

interface BenefitsFormSectionProps {
  benefits: UnifiedHomePayload['benefits']
  onChange: (benefits: UnifiedHomePayload['benefits']) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

export const BenefitsFormSection: FC<BenefitsFormSectionProps> = ({
  benefits,
  onChange,
  onAdd,
  onRemove,
}) => {
  return (
    <div>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <span className='text-muted fs-7'>
          Daftar poin keuntungan yang didapatkan mitra saat bergabung di Mitra10.
        </span>
        <AntButton
          type='primary'
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{backgroundColor: '#183383', borderColor: '#183383'}}
        >
          Tambah Keuntungan
        </AntButton>
      </div>

      <Row gutter={[16, 16]}>
        {benefits.map((ben, idx) => (
          <Col xs={24} md={12} key={`ben-${idx}`}>
            <div className='hc-item-card position-relative h-100'>
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <span className='fw-bold text-gray-800 fs-7'>Keuntungan #{idx + 1}</span>
                <AntButton
                  type='text'
                  danger
                  size='small'
                  icon={<DeleteOutlined />}
                  onClick={() => onRemove(idx)}
                />
              </div>

              <div className='mb-2'>
                <div className='d-flex align-items-center justify-content-between'>
                  <label className='hc-form-label mb-0'>
                    Icon Emoji (Opsional, Default Kosong)
                  </label>
                  {ben.icon && (
                    <AntButton
                      type='link'
                      danger
                      size='small'
                      style={{padding: 0, height: 'auto', fontSize: 11}}
                      onClick={() => {
                        const list = [...benefits]
                        list[idx] = {...list[idx], icon: ''}
                        onChange(list)
                      }}
                    >
                      ✕ Kosongkan
                    </AntButton>
                  )}
                </div>
                <div className='d-flex align-items-center gap-2 mt-1'>
                  <Input
                    value={ben.icon && !ben.icon.includes('?') ? ben.icon : ''}
                    onChange={(e) => {
                      const list = [...benefits]
                      list[idx] = {...list[idx], icon: e.target.value}
                      onChange(list)
                    }}
                    placeholder='Kosong'
                    style={{width: 80}}
                  />
                  <div className='d-flex gap-1 flex-wrap'>
                    {BENEFIT_EMOJI_PRESETS.map((em) => (
                      <button
                        key={em}
                        type='button'
                        className='btn btn-xs btn-light p-1'
                        onClick={() => {
                          const list = [...benefits]
                          list[idx] = {...list[idx], icon: em}
                          onChange(list)
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='mb-2'>
                <label className='hc-form-label'>Judul Keuntungan</label>
                <Input
                  value={ben.title}
                  onChange={(e) => {
                    const list = [...benefits]
                    list[idx] = {...list[idx], title: e.target.value}
                    onChange(list)
                  }}
                  placeholder='Judul keuntungan...'
                />
              </div>

              <div className='mb-2'>
                <label className='hc-form-label'>Deskripsi</label>
                <TextArea
                  rows={2}
                  value={ben.description}
                  onChange={(e) => {
                    const list = [...benefits]
                    list[idx] = {...list[idx], description: e.target.value}
                    onChange(list)
                  }}
                  placeholder='Penjelasan keuntungan...'
                />
              </div>

              <div>
                <label className='hc-form-label'>Warna Aksen Border</label>
                <Select
                  value={ben.accent_color || 'brand-blue'}
                  onChange={(val: BenefitAccentColor) => {
                    const list = [...benefits]
                    list[idx] = {...list[idx], accent_color: val}
                    onChange(list)
                  }}
                  style={{width: '100%'}}
                >
                  {ACCENT_OPTIONS.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      <span style={{color: opt.color, fontWeight: 600}}>●</span> {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}
