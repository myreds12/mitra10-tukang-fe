import React from 'react';
import './HomeContentVisual.css';
import { HeroSection } from './HeroSection';
import { BenefitCard, BenefitSection } from './BenefitSection';
import { CatalogTileCard, CatalogSection } from './CatalogSection';
import { WorkflowSection } from './WorkflowSection';
import {
  UnifiedHomePayload,
  HeroPayload,
  BenefitPayload,
  CatalogPayload,
  SupportPayload,
} from '../../services/homeContentService';

export interface LivePreviewPanelProps {
  sectionType: 'FULL' | 'HERO' | 'BENEFIT' | 'CATALOG' | 'SUPPORT';
  payload?: any;
  unifiedPayload?: Partial<UnifiedHomePayload> | null;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  sectionType,
  payload,
  unifiedPayload,
}) => {
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

  const currentSupport: Partial<SupportPayload> =
    sectionType === 'SUPPORT' ? payload : unifiedPayload?.support || {};

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
          {sectionType === 'FULL' ? '✨ FULL PAGE' : sectionType}
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
                  image_url: null,
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
              image_url: null,
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

        {/* Render SUPPORT Card */}
        {(sectionType === 'FULL' || sectionType === 'SUPPORT') && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #D0D5DD',
              borderRadius: 8,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginTop: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#1E2A78',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>🎧</span>
                <span>
                  {currentSupport.support_label || 'Hubungi Tim Support Mitra10'}
                </span>
              </div>
              {currentSupport.support_note && (
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                  {currentSupport.support_note}
                </div>
              )}
            </div>
            <button
              type='button'
              style={{
                background: '#00A651',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <span>💬 WhatsApp Tim Support</span>
            </button>
          </div>
        )}
      </div>

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
