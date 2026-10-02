import React, { useState, useEffect } from 'react';
import { Modal, Radio, Select, Button } from 'antd';
import { ArrowLeftOutlined, FullscreenOutlined } from '@ant-design/icons';
import './HomeContentVisual.css';
import '../../modules/pendaftar/ProgramDetailPage.css';
import { HeroSection } from './HeroSection';
import { BenefitCard, BenefitSection } from './BenefitSection';
import { CatalogTileCard, CatalogSection } from './CatalogSection';
import { WorkflowSection } from './WorkflowSection';
import { ProgramCard, ProgramSection, RenderInjectedContent } from './ProgramSection';
import { JobResultCard, JobResultSection } from './JobResultSection';
import { resolveImageUrl } from './imageHelper';
import {
  UnifiedHomePayload,
  HeroPayload,
  BenefitPayload,
  CatalogPayload,
  ProgramPayload,
  JobResultPayload,
} from '../../services/homeContentService';

export interface LivePreviewPanelProps {
  sectionType: 'FULL' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'PROGRAM' | 'ARTICLE' | 'JOB_RESULT';
  payload?: any;
  unifiedPayload?: Partial<UnifiedHomePayload> | null;
  selectedProgramIndex?: number;
  onSelectProgramIndex?: (index: number) => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  sectionType,
  payload,
  unifiedPayload,
  selectedProgramIndex = 0,
  onSelectProgramIndex,
}) => {
  const [previewArticle, setPreviewArticle] = useState<Partial<ProgramPayload> | null>(null);
  const [programSubMode, setProgramSubMode] = useState<'CARD' | 'ARTICLE'>(
    sectionType === 'ARTICLE' ? 'ARTICLE' : 'CARD'
  );
  const [activeProgIdx, setActiveProgIdx] = useState<number>(selectedProgramIndex ?? 0);

  useEffect(() => {
    if (selectedProgramIndex !== undefined) {
      setActiveProgIdx(selectedProgramIndex);
    }
  }, [selectedProgramIndex]);

  useEffect(() => {
    if (sectionType === 'ARTICLE') {
      setProgramSubMode('ARTICLE');
    }
  }, [sectionType]);

  const currentHero: Partial<HeroPayload> =
    sectionType === 'HERO' ? payload : unifiedPayload?.hero || {};

  const currentBenefits: BenefitPayload[] =
    sectionType === 'BENEFIT'
      ? Array.isArray(payload)
        ? payload
        : payload
        ? [payload]
        : []
      : unifiedPayload?.benefits || [];

  const currentCatalogs: CatalogPayload[] =
    sectionType === 'CATALOG'
      ? Array.isArray(payload)
        ? payload
        : payload
        ? [payload]
        : []
      : unifiedPayload?.catalogs || [];

  const currentPrograms: ProgramPayload[] =
    sectionType === 'PROGRAM' || sectionType === 'ARTICLE'
      ? Array.isArray(payload)
        ? payload
        : payload
        ? [payload]
        : unifiedPayload?.programs || []
      : unifiedPayload?.programs || [];

  const safeProgIdx = Math.min(Math.max(0, activeProgIdx), Math.max(0, currentPrograms.length - 1));
  const activeProgram: Partial<ProgramPayload> = currentPrograms[safeProgIdx] || currentPrograms[0] || {};

  const currentJobResults: JobResultPayload[] =
    sectionType === 'JOB_RESULT'
      ? Array.isArray(payload)
        ? payload
        : payload
        ? [payload]
        : []
      : unifiedPayload?.job_results || [];

  return (
    <div
      style={{
        background: '#F8F9FA',
        border: '1px solid #E4E7EC',
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid #E8EBF0',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>👁️</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1F2430' }}>
            Live WYSIWYG Preview
          </span>
          <span style={{ fontSize: 11, color: '#636B79' }}>
            (Render memakai CSS &amp; Markup Asli)
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            background: sectionType === 'FULL' ? '#00A651' : '#1E2A78',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 12,
            letterSpacing: '0.5px',
          }}
        >
          {sectionType === 'FULL'
            ? '✨ FULL PAGE'
            : sectionType === 'ARTICLE'
            ? '📰 ARTIKEL'
            : sectionType === 'PROGRAM'
            ? (programSubMode === 'ARTICLE' ? '📰 PROGRAM: ARTIKEL' : '📢 PROGRAM: CARD')
            : sectionType}
        </span>
      </div>

      <div
        className='home-content-wrapper'
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Render HERO */}
        {(sectionType === 'FULL' || sectionType === 'HERO') && (
          <HeroSection payload={currentHero} />
        )}

        {/* Render BENEFIT */}
        {sectionType === 'BENEFIT' && (
          <div style={{ width: '100%' }}>
            {Array.isArray(payload) ? (
              <BenefitSection
                items={payload.map((b: any, idx: number) => ({
                  id: idx + 1,
                  section: 'BENEFIT',
                  section_type: 'BENEFIT',
                  title: b.title,
                  description: b.description,
                  icon: b.icon,
                  payload: b,
                  is_active: true,
                  status: 'active',
                  order_index: idx + 1,
                  image_url: b.image || null,
                  subtitle: null,
                  created_at: '',
                  updated_at: null,
                  updated_by: null,
                }))}
              />
            ) : (
              <div style={{ maxWidth: 450, margin: '0 auto' }}>
                <BenefitCard payload={payload} />
              </div>
            )}
          </div>
        )}

        {sectionType === 'FULL' && currentBenefits.length > 0 && (
          <BenefitSection
            items={currentBenefits.map((b, idx) => ({
              id: idx + 1,
              section: 'BENEFIT',
              section_type: 'BENEFIT',
              title: b.title,
              description: b.description,
              icon: b.icon,
              payload: b,
              is_active: true,
              status: 'active',
              order_index: idx + 1,
              image_url: b.image || null,
              subtitle: null,
              created_at: '',
              updated_at: null,
              updated_by: null,
            }))}
          />
        )}

        {/* WORKFLOW (Cara kerja) on Full Page */}
        {sectionType === 'FULL' && <WorkflowSection />}

        {/* Render CATALOG */}
        {sectionType === 'CATALOG' && (
          <div style={{ width: '100%' }}>
            {Array.isArray(payload) ? (
              <CatalogSection
                items={payload.map((c: any, idx: number) => ({
                  id: idx + 1,
                  section: 'CATALOG',
                  section_type: 'CATALOG',
                  title: c.name,
                  description: c.link_url,
                  icon: c.icon_fallback || null,
                  image_url: c.image || null,
                  payload: c,
                  is_active: true,
                  status: 'active',
                  order_index: idx + 1,
                  subtitle: null,
                  created_at: '',
                  updated_at: null,
                  updated_by: null,
                }))}
              />
            ) : (
              <div style={{ maxWidth: 260, margin: '0 auto' }}>
                <CatalogTileCard payload={payload} index={0} />
              </div>
            )}
          </div>
        )}

        {sectionType === 'FULL' && currentCatalogs.length > 0 && (
          <CatalogSection
            items={currentCatalogs.map((c, idx) => ({
              id: idx + 1,
              section: 'CATALOG',
              section_type: 'CATALOG',
              title: c.name,
              description: c.link_url,
              icon: c.icon_fallback || null,
              image_url: c.image || null,
              payload: c,
              is_active: true,
              status: 'active',
              order_index: idx + 1,
              subtitle: null,
              created_at: '',
              updated_at: null,
              updated_by: null,
            }))}
          />
        )}

        {/* Toggle sub-mode bar when PROGRAM or ARTICLE is selected */}
        {(sectionType === 'PROGRAM' || sectionType === 'ARTICLE') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              background: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <Radio.Group
              size='small'
              value={programSubMode}
              onChange={(e) => setProgramSubMode(e.target.value)}
            >
              <Radio.Button value='CARD'>🎴 Card Beranda</Radio.Button>
              <Radio.Button value='ARTICLE'>📰 Detail Artikel</Radio.Button>
            </Radio.Group>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {currentPrograms.length > 1 && programSubMode === 'ARTICLE' && (
                <Select
                  size='small'
                  value={safeProgIdx}
                  onChange={(val) => {
                    setActiveProgIdx(val);
                    if (onSelectProgramIndex) onSelectProgramIndex(val);
                  }}
                  style={{ minWidth: 160, maxWidth: 220 }}
                >
                  {currentPrograms.map((prog, idx) => (
                    <Select.Option key={idx} value={idx}>
                      {prog.title ? `#${idx + 1}: ${prog.title.slice(0, 24)}...` : `Program #${idx + 1}`}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {programSubMode === 'ARTICLE' && (
                <Button
                  size='small'
                  icon={<FullscreenOutlined />}
                  onClick={() => setPreviewArticle(activeProgram)}
                  title='Buka Modal Preview Layar Penuh'
                >
                  Layar Penuh
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Render PROGRAM: Detail Artikel View */}
        {(sectionType === 'PROGRAM' || sectionType === 'ARTICLE') && programSubMode === 'ARTICLE' && (
          <div className='program-detail-container' style={{ padding: '0 2px', maxWidth: '100%', width: '100%' }}>
            <div className='program-detail-nav' style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                type='link'
                size='small'
                icon={<ArrowLeftOutlined />}
                onClick={() => setProgramSubMode('CARD')}
                style={{ padding: 0, fontWeight: 600, color: '#1E2A78' }}
              >
                Kembali ke Card Beranda
              </Button>
              <div className='program-detail-breadcrumb' style={{ fontSize: 11 }}>
                <span>Beranda</span>
                <span className='sep'>/</span>
                <span>Program Promosi &amp; Aktivasi</span>
              </div>
            </div>

            <article className='program-article-card' style={{ padding: '24px 22px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff' }}>
              <header className='program-article-header' style={{ marginBottom: 16 }}>
                {(activeProgram.badge || activeProgram.badge_label) && (
                  <span className='program-article-badge' style={{ marginBottom: 10 }}>
                    {activeProgram.badge || activeProgram.badge_label}
                  </span>
                )}
                <h2 className='program-article-title' style={{ fontSize: 20, marginBottom: 8, lineHeight: 1.35 }}>
                  {activeProgram.title || 'Program Mitra10'}
                </h2>
                <div className='program-article-meta' style={{ fontSize: 11, paddingBottom: 10 }}>
                  <span style={{ color: '#00A651', fontWeight: 600 }}>
                    ✓ Program Resmi Mitra Instalasi Mitra10
                  </span>
                  <span className='meta-divider'>•</span>
                  <span>Informasi &amp; Ketentuan Lengkap</span>
                </div>
              </header>

              {(activeProgram.image || activeProgram.image_url) && (
                <div className='program-article-hero-wrap' style={{ maxHeight: 260, marginBottom: 18 }}>
                  <img
                    src={resolveImageUrl(activeProgram.image || activeProgram.image_url) || ''}
                    alt={activeProgram.title || 'Banner'}
                    className='program-article-hero-img'
                  />
                </div>
              )}

              <div className='program-article-body' style={{ fontSize: 13.5, lineHeight: 1.75, marginBottom: 22 }}>
                {activeProgram.description && activeProgram.description.trim() ? (
                  <RenderInjectedContent content={activeProgram.description} />
                ) : (
                  <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '24px 16px', textAlign: 'center', background: '#F9FAFB', borderRadius: 8 }}>
                    Belum ada teks artikel. Ketikkan deskripsi/artikel di panel form kiri untuk melihat preview teks dan gambar langsung di sini...
                  </div>
                )}
              </div>

              <footer className='program-article-footer' style={{ paddingTop: 14 }}>
                {(activeProgram.has_external_link !== false && Boolean(activeProgram.link_url && activeProgram.link_url.trim().length > 0)) ? (
                  <div className='program-footer-cta-box' style={{ padding: '12px 16px' }}>
                    <div className='cta-box-text'>
                      <strong>Tertarik mengikuti program ini?</strong>
                      <span>Kunjungi tautan pendaftaran atau informasi resmi program:</span>
                    </div>
                    <a
                      href={activeProgram.link_url || undefined}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='program-action-btn primary'
                      style={{ padding: '8px 18px', fontSize: 12 }}
                    >
                      {activeProgram.external_cta_label || activeProgram.cta_label || 'Ikuti Program →'}
                    </a>
                  </div>
                ) : (
                  <div className='program-footer-notice' style={{ fontSize: 11.5, padding: '10px 14px', marginBottom: 0 }}>
                    📢 Untuk informasi pendaftaran program dan konsultasi lebih lanjut, hubungi tim via widget Live Chat di pojok kanan bawah.
                  </div>
                )}
              </footer>
            </article>
          </div>
        )}

        {/* Render PROGRAM: Card Beranda View */}
        {(sectionType === 'PROGRAM' || sectionType === 'ARTICLE') && programSubMode === 'CARD' && (
          <div style={{ width: '100%' }}>
            {Array.isArray(currentPrograms) && currentPrograms.length > 0 ? (
              <ProgramSection
                programs={currentPrograms}
                onOpenArticle={(prog) => {
                  const clickedIdx = currentPrograms.findIndex(
                    (p) =>
                      p === prog ||
                      (p.title && prog?.title && p.title === prog.title) ||
                      p.order_index === prog?.order_index
                  );
                  if (clickedIdx >= 0) {
                    setActiveProgIdx(clickedIdx);
                    if (onSelectProgramIndex) onSelectProgramIndex(clickedIdx);
                  }
                  setProgramSubMode('ARTICLE');
                }}
              />
            ) : (
              <div style={{ maxWidth: 360, margin: '0 auto' }}>
                <ProgramCard
                  payload={activeProgram}
                  index={0}
                  showPlaceholder={true}
                  onOpenArticle={() => setProgramSubMode('ARTICLE')}
                />
              </div>
            )}
          </div>
        )}

        {/* Render PROGRAM in FULL Page */}
        {sectionType === 'FULL' && (
          <ProgramSection programs={currentPrograms} onOpenArticle={(prog) => setPreviewArticle(prog)} />
        )}

        {/* Render JOB_RESULT */}
        {sectionType === 'JOB_RESULT' && (
          <div style={{ width: '100%' }}>
            {Array.isArray(payload) ? (
              <JobResultSection jobResults={payload} />
            ) : (
              <div style={{ maxWidth: 380, margin: '0 auto' }}>
                <JobResultCard payload={payload} index={0} showPlaceholder={true} />
              </div>
            )}
          </div>
        )}

        {/* Render JOB_RESULT in FULL Page */}
        {sectionType === 'FULL' && (
          <JobResultSection jobResults={currentJobResults} />
        )}
      </div>

      {/* ARTICLE PREVIEW MODAL FOR ADMIN */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📰</span>
            <span style={{ fontWeight: 700, color: '#1E2A78' }}>
              Preview Halaman Artikel Program (Tampilan Vendor)
            </span>
          </div>
        }
        open={Boolean(previewArticle)}
        onCancel={() => setPreviewArticle(null)}
        footer={null}
        width={760}
        bodyStyle={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px 24px' }}
      >
        {previewArticle && (
          <div className='program-article-card' style={{ boxShadow: 'none', border: 'none', padding: '8px 4px' }}>
            <div style={{ marginBottom: 12 }}>
              {(previewArticle.badge_label || previewArticle.badge) && (
                <span className='program-article-badge'>
                  {previewArticle.badge_label || previewArticle.badge}
                </span>
              )}
            </div>
            <h2 className='program-article-title' style={{ marginBottom: 14 }}>
              {previewArticle.title || 'Program Mitra10'}
            </h2>
            {(previewArticle.image_url || previewArticle.image) && (
              <div className='program-article-hero-wrap' style={{ maxHeight: 320 }}>
                <img
                  src={resolveImageUrl(previewArticle.image_url || previewArticle.image) || ''}
                  alt={previewArticle.title || 'Banner'}
                  className='program-article-hero-img'
                />
              </div>
            )}
            <div className='program-article-body' style={{ marginTop: 16 }}>
              <RenderInjectedContent content={previewArticle.description || ''} />
            </div>
            {(previewArticle.has_external_link !== false && Boolean(previewArticle.link_url && previewArticle.link_url.trim().length > 0)) && (
              <div className='program-footer-cta-box' style={{ marginTop: 24 }}>
                <div className='cta-box-text'>
                  <strong>Tertarik mengikuti program ini?</strong>
                  <span>Kunjungi tautan resmi pendaftaran atau ketentuan program:</span>
                </div>
                <a
                  href={previewArticle.link_url || undefined}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='program-action-btn primary'
                >
                  {previewArticle.external_cta_label || previewArticle.cta_label || 'Ikuti Program →'}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px dashed #E0E4EA',
          fontSize: 11,
          color: '#8C94A0',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        Preview diperbarui otomatis secara real-time saat Anda mengubah field atau mengunggah gambar.
      </div>
    </div>
  );
};
