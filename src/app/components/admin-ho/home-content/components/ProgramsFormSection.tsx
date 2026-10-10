import React, {FC} from 'react'
import {Input, Row, Col, Switch, Upload, Button as AntButton} from 'antd'
import {PlusOutlined, DeleteOutlined, UploadOutlined} from '@ant-design/icons'
import {UnifiedHomePayload} from '../../../../services/homeContentService'
import {resolveImageUrl} from '../../../home-content-shared/imageHelper'
import {ProgramQuillEditor} from '../ProgramQuillEditor'

interface ProgramsFormSectionProps {
  programs: UnifiedHomePayload['programs']
  onChange: (programs: UnifiedHomePayload['programs']) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onUploadImage: (file: File, index: number) => Promise<boolean>
  onClearImage: (index: number) => void
}

export const ProgramsFormSection: FC<ProgramsFormSectionProps> = ({
  programs = [],
  onChange,
  onAdd,
  onRemove,
  onUploadImage,
  onClearImage,
}) => {
  return (
    <div>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <span className='text-muted fs-7'>
          Program promosi, insentif, atau aktivasi berjalan lengkap dengan artikel detail dan opsi
          pendaftaran.
        </span>
        <AntButton
          type='primary'
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{backgroundColor: '#183383', borderColor: '#183383'}}
        >
          Tambah Program Baru
        </AntButton>
      </div>

      {programs.map((prog, idx) => (
        <div key={`prog-${idx}`} className='hc-item-card mb-4'>
          <div className='d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom'>
            <div className='d-flex align-items-center gap-2'>
              <span className='badge badge-light-primary fw-bold'>Program #{idx + 1}</span>
              <span className='fw-bold text-gray-800 fs-6'>{prog.title || 'Judul Program'}</span>
            </div>
            <AntButton
              type='text'
              danger
              size='small'
              icon={<DeleteOutlined />}
              onClick={() => onRemove(idx)}
            >
              Hapus Program
            </AntButton>
          </div>

          <Row gutter={12} className='mb-3'>
            <Col xs={24} md={16}>
              <label className='hc-form-label'>Judul Program Promosi</label>
              <Input
                value={prog.title}
                onChange={(e) => {
                  const list = [...programs]
                  list[idx] = {...list[idx], title: e.target.value}
                  onChange(list)
                }}
                placeholder='Contoh: Program Insentif Vendor Q1 2026'
                style={{height: 38}}
              />
            </Col>
            <Col xs={24} md={8}>
              <label className='hc-form-label'>Badge Label</label>
              <Input
                value={prog.badge_label || prog.badge || ''}
                onChange={(e) => {
                  const list = [...programs]
                  list[idx] = {...list[idx], badge_label: e.target.value, badge: e.target.value}
                  onChange(list)
                }}
                placeholder='Program Promosi / Event'
                style={{height: 38}}
              />
            </Col>
          </Row>

          {/* BANNER & CTA CARD SWITCHES */}
          <div className='card card-bordered p-3 mb-3 bg-lighten' style={{borderRadius: 6}}>
            <Row gutter={16} align='middle'>
              <Col xs={24} md={12}>
                <div className='d-flex align-items-center justify-content-between'>
                  <div>
                    <span className='hc-form-label mb-0'>🎴 Tombol di Card Beranda</span>
                    <span className='hc-form-help'>
                      Tampilkan tombol CTA langsung di kartu beranda vendor
                    </span>
                  </div>
                  <Switch
                    size='small'
                    checked={prog.show_card_cta !== false}
                    onChange={(checked) => {
                      const list = [...programs]
                      list[idx] = {...list[idx], show_card_cta: checked}
                      onChange(list)
                    }}
                    style={{background: prog.show_card_cta !== false ? '#183383' : undefined}}
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className='d-flex align-items-center gap-3'>
                  {(prog.image_url || prog.image) && (
                    <img
                      src={resolveImageUrl(prog.image_url || prog.image) || ''}
                      alt={prog.title}
                      style={{width: 64, height: 44, objectFit: 'cover', borderRadius: 4}}
                    />
                  )}
                  <Upload
                    accept='image/jpeg,image/png,image/webp'
                    showUploadList={false}
                    beforeUpload={(f) => onUploadImage(f, idx)}
                  >
                    <AntButton size='small' icon={<UploadOutlined />}>
                      {prog.image_url || prog.image ? 'Ganti Banner' : 'Unggah Banner'}
                    </AntButton>
                  </Upload>
                  {(prog.image_url || prog.image) && (
                    <AntButton
                      size='small'
                      type='text'
                      danger
                      onClick={() => onClearImage(idx)}
                    >
                      Hapus
                    </AntButton>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* EXTERNAL LINK / IKUTI PROGRAM SWITCH */}
          <div
            className='card card-bordered p-3 mb-3'
            style={{border: '1px solid #CBD5E1', borderRadius: 6, background: '#F8FAFC'}}
          >
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <div>
                <span className='hc-form-label mb-0 text-primary'>
                  🔗 Tombol Ikuti Program (Tautan Eksternal)
                </span>
                <span className='hc-form-help'>
                  Aktifkan jika program ini memiliki link pendaftaran atau microsite khusus
                </span>
              </div>
              <Switch
                size='small'
                checked={prog.has_external_link ?? Boolean(prog.link_url)}
                onChange={(checked) => {
                  const list = [...programs]
                  list[idx] = {
                    ...list[idx],
                    has_external_link: checked,
                    external_cta_label: checked
                      ? list[idx].external_cta_label || 'Ikuti Program'
                      : list[idx].external_cta_label,
                  }
                  onChange(list)
                }}
                checkedChildren='Aktif'
                unCheckedChildren='Nonaktif'
                style={{
                  background:
                    (prog.has_external_link ?? Boolean(prog.link_url)) ? '#50cd89' : undefined,
                }}
              />
            </div>

            {(prog.has_external_link ?? Boolean(prog.link_url)) && (
              <Row gutter={12} className='pt-2 border-top'>
                <Col xs={24} md={14}>
                  <label className='hc-form-label'>URL Tautan Eksternal</label>
                  <Input
                    value={prog.link_url || ''}
                    onChange={(e) => {
                      const list = [...programs]
                      list[idx] = {...list[idx], link_url: e.target.value}
                      onChange(list)
                    }}
                    placeholder='https://bit.ly/... atau https://www.mitra10.com'
                    style={{height: 36}}
                  />
                </Col>
                <Col xs={24} md={10}>
                  <label className='hc-form-label'>Label Tombol di Artikel</label>
                  <Input
                    value={prog.external_cta_label || 'Ikuti Program'}
                    onChange={(e) => {
                      const list = [...programs]
                      list[idx] = {...list[idx], external_cta_label: e.target.value}
                      onChange(list)
                    }}
                    placeholder='Ikuti Program / Daftar Sekarang'
                    style={{height: 36}}
                  />
                </Col>
              </Row>
            )}
          </div>

          {/* QUILL RICH TEXT EDITOR */}
          <div>
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <label className='hc-form-label mb-0'>
                ✍️ Isi Lengkap Artikel Program (Quill Editor)
              </label>
              <span className='hc-form-help'>
                💡 Klik icon 🖼️ pada toolbar Quill untuk menyisipkan gambar langsung ke dalam
                artikel
              </span>
            </div>
            <ProgramQuillEditor
              value={prog.description || ''}
              onChange={(val) => {
                const list = [...programs]
                list[idx] = {...list[idx], description: val}
                onChange(list)
              }}
              placeholder='Tuliskan detail ketentuan program atau artikel lengkap di sini...'
            />
          </div>
        </div>
      ))}
    </div>
  )
}
