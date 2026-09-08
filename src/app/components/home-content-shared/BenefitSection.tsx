import React from 'react';
import { BenefitAccentColor, BenefitPayload, HomeContentItem } from '../../services/homeContentService';

const ACCENT_MAP: Record<BenefitAccentColor | string, string> = {
  'brand-blue': '#1E2A78',
  'brand-red': '#E12429',
  'brand-yellow': '#FBC02D',
};

export interface BenefitCardProps {
  item?: HomeContentItem | null;
  payload?: Partial<BenefitPayload> | null;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ item, payload }) => {
  const p: Partial<BenefitPayload> = payload || item?.payload || {};

  const icon = p.icon ?? item?.icon ?? '📦';
  const title = p.title ?? item?.title ?? 'Benefit Title';
  const description = p.description ?? item?.description ?? 'Deskripsi benefit...';
  const accentKey = p.accent_color ?? 'brand-blue';
  const accentCode = ACCENT_MAP[accentKey] || '#1E2A78';

  return (
    <div className='benefit' style={{ '--accent': accentCode } as React.CSSProperties}>
      <div className='ico'>{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

export interface BenefitSectionProps {
  items: HomeContentItem[];
}

export const BenefitSection: React.FC<BenefitSectionProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      <div className='sec-head'>
        <h2>Kenapa bergabung dengan Mitra10?</h2>
        <p>Enam alasan mitra instalasi bertahan lama di platform ini.</p>
      </div>
      <div className='benefits'>
        {items.map((it) => (
          <BenefitCard key={it.id} item={it} />
        ))}
      </div>
    </>
  );
};
