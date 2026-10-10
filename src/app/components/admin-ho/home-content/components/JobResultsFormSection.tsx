import React, {FC} from 'react'
import {Input, Row, Col, Select, Upload, Button as AntButton} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import {UnifiedHomePayload} from '../../../../services/homeContentService'
import {resolveImageUrl} from '../../../home-content-shared/imageHelper'
import {getEmbedVideoUrl} from '../../../home-content-shared/JobResultSection'

const {TextArea} = Input

interface JobResultsFormSectionProps {
  jobResults: UnifiedHomePayload['job_results']
  onChange: (jobs: UnifiedHomePayload['job_results']) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onUploadImage: (file: File, index: number, isBefore: boolean) => Promise<boolean>
  onClearImage: (index: number, isBefore: boolean) => void
  onUploadVideo: (file: File, index: number) => Promise<boolean>
  onClearVideo: (index: number) => void
}

export const JobResultsFormSection: FC<JobResultsFormSectionProps> = ({
  jobResults = [],
  onChange,
  onAdd,
  onRemove,
  onUploadImage,
  onClearImage,
  onUploadVideo,
  onClearVideo,
}) => {
  return (
    <div>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <span className='text-muted fs-7'>
          Dokumentasi foto nyata Before - After atau video pekerjaan instalasi vendor.
        </span>
        <AntButton
          type='primary'
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{backgroundColor: '#183383', borderColor: '#183383'}}
        >
          Tambah Hasil Kerja
        </AntButton>
      </div>

      {jobResults.map((job, idx) => (
        <div key={`job-${idx}`} className='hc-item-card mb-3'>
          <div className='d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom'>
            <span className='fw-bold text-gray-800 fs-7'>
              Dokumentasi #{idx + 1}: {job.title || 'Judul Pekerjaan'}
            </span>
            <AntButton
              type='text'
              danger
              size='small'
              icon={<DeleteOutlined />}
              onClick={() => onRemove(idx)}
            >
              Hapus
            </AntButton>
          </div>

          <Row gutter={12} className='mb-3'>
            <Col xs={24} md={12}>
              <label className='hc-form-label'>Judul Pekerjaan</label>
              <Input
                value={job.title || ''}
                onChange={(e) => {
                  const list = [...jobResults]
                  list[idx] = {...list[idx], title: e.target.value}
                  onChange(list)
                }}
                placeholder='Contoh: Pemasangan Granit 60x60 Ruang Utama'
              />
            </Col>
            <Col xs={24} md={12}>
              <label className='hc-form-label'>Tipe Media Dokumentasi</label>
              <Select
                value={job.media_type === 'video' ? 'video' : 'before_after'}
                onChange={(val: 'before_after' | 'video') => {
                  const list = [...jobResults]
                  list[idx] = {
                    ...list[idx],
                    media_type: val,
                    badge_label: val === 'video' ? 'Video Dokumentasi' : 'Before - After',
                    tag: val === 'video' ? 'Video Dokumentasi' : 'Before - After',
                  }
                  onChange(list)
                }}
                style={{width: '100%'}}
              >
                <Select.Option value='before_after'>
                  🖼️ Foto Perbandingan (Before - After)
                </Select.Option>
                <Select.Option value='video'>🎥 Video Dokumentasi</Select.Option>
              </Select>
            </Col>
          </Row>

          <div className='mb-3'>
            <label className='hc-form-label'>Deskripsi Pekerjaan</label>
            <TextArea
              rows={2}
              value={job.description || ''}
              onChange={(e) => {
                const list = [...jobResults]
                list[idx] = {...list[idx], description: e.target.value}
                onChange(list)
              }}
              placeholder='Keterangan pekerjaan instalasi...'
            />
          </div>

          {/* MEDIA INPUT: BEFORE-AFTER OR VIDEO */}
          {job.media_type === 'video' ? (
            <div className='card card-bordered p-3 bg-lighten'>
              {/* OPSI 1: LINK YOUTUBE / VIMEO */}
              <div className='mb-3'>
                <div className='d-flex align-items-center justify-content-between mb-1'>
                  <label className='hc-form-label fw-bold mb-0' style={{color: '#C41818'}}>
                    <VideoCameraOutlined className='me-1' /> Link Video YouTube (Sangat
                    Direkomendasikan)
                  </label>
                  <span className='badge badge-light-primary fs-9 fw-semibold'>
                    Cepat &amp; Hemat Server
                  </span>
                </div>
                <Input
                  value={job.video_url || ''}
                  onChange={(e) => {
                    const list = [...jobResults]
                    list[idx] = {...list[idx], video_url: e.target.value}
                    onChange(list)
                  }}
                  placeholder='Contoh: https://www.youtube.com/watch?v=... atau https://www.youtube.com/shorts/... atau https://youtu.be/...'
                  style={{height: 38}}
                />
                <span className='hc-form-help d-block mt-1 text-muted'>
                  💡 Mendukung link YouTube biasa, YouTube Shorts (format vertikal 4x6), youtu.be,
                  Vimeo, atau kode embed.
                </span>

                {/* DETEKSI PREVIEW YOUTUBE / EMBED */}
                {job.video_url && getEmbedVideoUrl(job.video_url) && (
                  <div
                    className='mt-2 p-2 rounded d-flex align-items-center justify-content-between flex-wrap gap-2'
                    style={{background: '#EFF6FF', border: '1px solid #BFDBFE'}}
                  >
                    <div className='d-flex align-items-center gap-2'>
                      <span className='badge badge-light-danger fw-bold'>
                        ▶️ YouTube Terdeteksi
                      </span>
                      <span
                        className='text-muted fs-8 text-truncate'
                        style={{maxWidth: 360}}
                      >
                        {getEmbedVideoUrl(job.video_url)}
                      </span>
                    </div>
                    <AntButton
                      size='small'
                      type='text'
                      danger
                      onClick={() => onClearVideo(idx)}
                    >
                      Hapus Link
                    </AntButton>
                  </div>
                )}
              </div>

              {/* OPSI 2: UPLOAD FILE VIDEO SENDIRI */}
              <div className='pt-2 border-top'>
                <div className='d-flex align-items-center justify-content-between mb-2'>
                  <label className='hc-form-label mb-0 text-gray-700'>
                    Atau Unggah File Video dari Komputer (MP4 / WebM / MOV):
                  </label>
                  {job.video_url && !getEmbedVideoUrl(job.video_url) && (
                    <AntButton
                      size='small'
                      type='text'
                      danger
                      onClick={() => onClearVideo(idx)}
                    >
                      Hapus File Video
                    </AntButton>
                  )}
                </div>
                <div className='d-flex align-items-center gap-2 flex-wrap'>
                  <Upload
                    accept='video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv'
                    showUploadList={false}
                    beforeUpload={(f) => onUploadVideo(f, idx)}
                  >
                    <AntButton size='small' icon={<UploadOutlined />}>
                      Pilih File Video untuk Diunggah
                    </AntButton>
                  </Upload>
                </div>
              </div>

              {/* NOTES & OPERATIONAL HOURS */}
              <div
                className='mt-3 p-3 rounded'
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px dashed #F59E0B',
                  fontSize: 12,
                  color: '#92400E',
                }}
              >
                <div
                  className='d-flex align-items-center gap-2 mb-2 fw-bold'
                  style={{color: '#B45309'}}
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Catatan &amp; Ketentuan Video Portofolio:
                </div>
                <ul className='m-0 ps-3' style={{lineHeight: 1.6}}>
                  <li>
                    <strong>Link YouTube:</strong> Sangat disarankan menempelkan link video YouTube /
                    YouTube Shorts. Video langsung dapat diputar dalam bingkai 4x6 tanpa batasan
                    kuota upload server.
                  </li>
                  <li>
                    <strong>Batas Upload File Video:</strong> Maksimal <strong>30 MB</strong> (format
                    yang didukung: <strong>MP4, WebM, MOV, MKV</strong>). Video &gt; 2 MB otomatis
                    dikompresi ke <strong>720p HD</strong> (1.2 Mbps).
                  </li>
                  <li className='fw-bold' style={{color: '#B45309'}}>
                    ⚠️ Harap upload video sebelum atau sesudah jam operasional mitra10.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className='card card-bordered p-3 bg-lighten'>
                  <label className='hc-form-label text-danger'>📷 Foto Sebelum (Before)</label>
                  <div className='d-flex align-items-center gap-3'>
                    {(job.before_image || job.image_before_url) && (
                      <img
                        src={
                          resolveImageUrl(job.before_image || job.image_before_url) || ''
                        }
                        alt='Before'
                        style={{width: 80, height: 56, objectFit: 'cover', borderRadius: 4}}
                      />
                    )}
                    <Upload
                      accept='image/jpeg,image/png,image/webp'
                      showUploadList={false}
                      beforeUpload={(f) => onUploadImage(f, idx, true)}
                    >
                      <AntButton size='small' icon={<UploadOutlined />}>
                        {job.before_image || job.image_before_url ? 'Ganti Foto' : 'Unggah Foto'}
                      </AntButton>
                    </Upload>
                    {(job.before_image || job.image_before_url) && (
                      <AntButton
                        size='small'
                        type='text'
                        danger
                        onClick={() => onClearImage(idx, true)}
                      >
                        Hapus
                      </AntButton>
                    )}
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className='card card-bordered p-3 bg-lighten'>
                  <label className='hc-form-label text-success'>✨ Foto Sesudah (After)</label>
                  <div className='d-flex align-items-center gap-3'>
                    {(job.image || job.image_after_url) && (
                      <img
                        src={resolveImageUrl(job.image || job.image_after_url) || ''}
                        alt='After'
                        style={{width: 80, height: 56, objectFit: 'cover', borderRadius: 4}}
                      />
                    )}
                    <Upload
                      accept='image/jpeg,image/png,image/webp'
                      showUploadList={false}
                      beforeUpload={(f) => onUploadImage(f, idx, false)}
                    >
                      <AntButton size='small' icon={<UploadOutlined />}>
                        {job.image || job.image_after_url ? 'Ganti Foto' : 'Unggah Foto'}
                      </AntButton>
                    </Upload>
                    {(job.image || job.image_after_url) && (
                      <AntButton
                        size='small'
                        type='text'
                        danger
                        onClick={() => onClearImage(idx, false)}
                      >
                        Hapus
                      </AntButton>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </div>
      ))}
    </div>
  )
}
