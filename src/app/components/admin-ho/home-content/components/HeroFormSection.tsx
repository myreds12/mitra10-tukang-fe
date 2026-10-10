import React, {FC} from 'react'
import {Input, Upload, Button as AntButton} from 'antd'
import {UploadOutlined} from '@ant-design/icons'
import {UnifiedHomePayload} from '../../../../services/homeContentService'
import {resolveImageUrl} from '../../../home-content-shared/imageHelper'

const {TextArea} = Input

interface HeroFormSectionProps {
  hero: UnifiedHomePayload['hero']
  onChange: (updatedHero: UnifiedHomePayload['hero']) => void
  onUploadImage: (file: File) => Promise<boolean>
  onClearImage: () => void
}

export const HeroFormSection: FC<HeroFormSectionProps> = ({
  hero,
  onChange,
  onUploadImage,
  onClearImage,
}) => {
  return (
    <div style={{padding: '8px 2px'}}>
      <div className='mb-4'>
        <label className='hc-form-label'>
          Headline Teks Utama <span style={{color: '#E12429'}}>*</span>
        </label>
        <Input
          value={hero.headline_main}
          onChange={(e) => onChange({...hero, headline_main: e.target.value})}
          placeholder='Selamat bergabung sebagai'
          style={{height: 38, borderRadius: 6}}
        />
      </div>

      <div className='mb-4'>
        <label className='hc-form-label'>
          Headline Highlight (Teks Biru / Bold) <span style={{color: '#E12429'}}>*</span>
        </label>
        <Input
          value={hero.headline_highlight}
          onChange={(e) => onChange({...hero, headline_highlight: e.target.value})}
          placeholder='Mitra Instalasi Mitra10'
          style={{height: 38, borderRadius: 6}}
        />
      </div>

      <div className='mb-4'>
        <label className='hc-form-label'>Deskripsi Sambutan Paragraf</label>
        <TextArea
          rows={4}
          value={hero.description}
          onChange={(e) => onChange({...hero, description: e.target.value})}
          placeholder='Penjelasan sambutan vendor...'
          style={{borderRadius: 6}}
        />
      </div>

      <div className='hc-item-card bg-lighten'>
        <label className='hc-form-label mb-2'>Ilustrasi Gambar Hero (Opsional)</label>
        <div className='d-flex align-items-center gap-3 flex-wrap'>
          {hero.illustration_image ? (
            <div className='d-flex align-items-center gap-3'>
              <img
                src={resolveImageUrl(hero.illustration_image) || ''}
                alt='Preview Hero'
                style={{
                  width: 100,
                  height: 70,
                  objectFit: 'contain',
                  borderRadius: 6,
                  border: '1px solid #D9D9D9',
                  background: '#FFF',
                }}
              />
              <AntButton danger size='small' onClick={onClearImage}>
                Hapus Gambar
              </AntButton>
            </div>
          ) : (
            <div style={{color: '#9CA3AF', fontSize: 12}}>
              Menggunakan ilustrasi vektor default Mitra10.
            </div>
          )}

          <Upload
            accept='image/jpeg,image/png,image/webp'
            showUploadList={false}
            beforeUpload={onUploadImage}
          >
            <AntButton icon={<UploadOutlined />}>
              {hero.illustration_image ? 'Ganti Ilustrasi' : 'Unggah Ilustrasi Baru'}
            </AntButton>
          </Upload>
        </div>
        <span className='hc-form-help'>Format yang didukung: JPG, PNG, WEBP (Maksimal 2MB)</span>
      </div>
    </div>
  )
}
