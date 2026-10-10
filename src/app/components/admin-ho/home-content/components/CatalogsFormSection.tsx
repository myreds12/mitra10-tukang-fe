import React, {FC} from 'react'
import {Input, Row, Col, Upload, Button as AntButton} from 'antd'
import {PlusOutlined, DeleteOutlined, UploadOutlined} from '@ant-design/icons'
import {UnifiedHomePayload} from '../../../../services/homeContentService'
import {resolveImageUrl} from '../../../home-content-shared/imageHelper'

interface CatalogsFormSectionProps {
  catalogs: UnifiedHomePayload['catalogs']
  onChange: (catalogs: UnifiedHomePayload['catalogs']) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onUploadImage: (file: File, index: number) => Promise<boolean>
  onClearImage: (index: number) => void
}

export const CatalogsFormSection: FC<CatalogsFormSectionProps> = ({
  catalogs,
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
          Kategori jasa & material yang sering diorder customer untuk dikerjakan vendor.
        </span>
        <AntButton
          type='primary'
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{backgroundColor: '#183383', borderColor: '#183383'}}
        >
          Tambah Kategori Katalog
        </AntButton>
      </div>

      <Row gutter={[16, 16]}>
        {catalogs.map((cat, idx) => (
          <Col xs={24} md={12} key={`cat-${idx}`}>
            <div className='hc-item-card h-100'>
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <span className='fw-bold text-gray-800 fs-7'>
                  Kategori #{idx + 1}: {cat.name}
                </span>
                <AntButton
                  type='text'
                  danger
                  size='small'
                  icon={<DeleteOutlined />}
                  onClick={() => onRemove(idx)}
                />
              </div>

              <div className='mb-2'>
                <label className='hc-form-label'>Nama Kategori</label>
                <Input
                  value={cat.name}
                  onChange={(e) => {
                    const list = [...catalogs]
                    list[idx] = {...list[idx], name: e.target.value}
                    onChange(list)
                  }}
                  placeholder='Contoh: Cat & Dinding'
                />
              </div>

              <Row gutter={8}>
                <Col span={14}>
                  <div className='mb-2'>
                    <label className='hc-form-label'>Link URL Belanja Produk</label>
                    <Input
                      value={cat.link_url || ''}
                      onChange={(e) => {
                        const list = [...catalogs]
                        list[idx] = {...list[idx], link_url: e.target.value}
                        onChange(list)
                      }}
                      placeholder='https://www.mitra10.com/...'
                    />
                  </div>
                </Col>
                <Col span={10}>
                  <div className='mb-2'>
                    <label className='hc-form-label'>Badge (Opsional)</label>
                    <Input
                      value={cat.badge_text || ''}
                      onChange={(e) => {
                        const list = [...catalogs]
                        list[idx] = {...list[idx], badge_text: e.target.value || null}
                        onChange(list)
                      }}
                      placeholder='Populer / Promo'
                    />
                  </div>
                </Col>
              </Row>

              <div className='mt-2 pt-2 border-top'>
                <label className='hc-form-label mb-1'>Foto Ilustrasi Kategori</label>
                <div className='d-flex align-items-center gap-2'>
                  {cat.image && (
                    <img
                      src={resolveImageUrl(cat.image) || ''}
                      alt={cat.name}
                      style={{width: 48, height: 36, objectFit: 'cover', borderRadius: 4}}
                    />
                  )}
                  <Upload
                    accept='image/jpeg,image/png,image/webp'
                    showUploadList={false}
                    beforeUpload={(f) => onUploadImage(f, idx)}
                  >
                    <AntButton size='small' icon={<UploadOutlined />}>
                      {cat.image ? 'Ganti Foto' : 'Unggah Foto'}
                    </AntButton>
                  </Upload>
                  {cat.image && (
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
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}
