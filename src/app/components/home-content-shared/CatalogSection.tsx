import React from 'react';
import { CatalogPayload, HomeContentItem } from '../../services/homeContentService';
import { resolveImageUrl } from './imageHelper';

export interface CatalogTileCardProps {
  item?: HomeContentItem | null;
  payload?: Partial<CatalogPayload> | null;
  index?: number;
}

export const CatalogTileCard: React.FC<CatalogTileCardProps> = ({
  item,
  payload,
  index = 0,
}) => {
  const p: Partial<CatalogPayload> = payload || item?.payload || {};

  const name = p.name ?? item?.title ?? 'Nama Kategori';
  const rawImage = p.image ?? item?.image_url;
  const imageUrl = resolveImageUrl(rawImage);
  const iconFallback = p.icon_fallback ?? item?.icon ?? '💡';
  const badgeText = p.badge_text ?? null;
  const linkUrl = p.link_url ?? (typeof item?.description === 'string' && item.description.startsWith('http') ? item.description : 'https://www.mitra10.com');
  const buttonLabel = p.button_label || 'Lihat Produk →';
  const isSecondary = p.button_style === 'secondary';

  const gradClass = `grad-${(index % 6) + 1}`;
  const tileClass = imageUrl
    ? `cat-tile has-photo ${isSecondary ? 'muted' : ''}`
    : `cat-tile ${gradClass} ${isSecondary ? 'muted' : ''}`;

  return (
    <div className='cat-tile-card'>
      <a
        className={tileClass}
        href={linkUrl || '#'}
        target='_blank'
        rel='noopener noreferrer'
        style={imageUrl ? { backgroundImage: `url('${imageUrl}')` } : undefined}
      >
        {badgeText && <span className='cat-tile-badge'>{badgeText}</span>}
        {!imageUrl && iconFallback && (
          <span className='cat-tile-icowrap'>{iconFallback}</span>
        )}
        <span className='cat-tile-overlay'>
          <span className='cat-tile-name'>{name}</span>
        </span>
      </a>
      <div className='cat-tile-foot'>
        <a
          className={`cat-cta ${isSecondary ? 'secondary' : ''}`}
          href={linkUrl || '#'}
          target='_blank'
          rel='noopener noreferrer'
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
};

export interface CatalogSectionProps {
  items: HomeContentItem[];
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      <div className='sec-head'>
        <h2>Katalog produk Mitra10 yang relevan dengan jasa Anda</h2>
      </div>
      <div className='catalog-grid'>
        {items.map((it, idx) => (
          <CatalogTileCard key={it.id} item={it} index={idx} />
        ))}
      </div>
      <div className='catalog-caption'>
        Foto kategori di atas masih placeholder warna karena mitra10.com membatasi pengambilan gambar otomatis &mdash; tinggal diganti foto asli per kategori saat integrasi. Link setiap kartu sudah mengarah ke halaman kategori resmi di mitra10.com.
      </div>
    </>
  );
};
