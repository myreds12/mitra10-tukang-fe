import React from 'react';
import { HeroPayload, HomeContentItem } from '../../services/homeContentService';
import { resolveImageUrl } from './imageHelper';
import { toAbsoluteUrl } from '../../../_metronic/helpers';

export interface HeroSectionProps {
  item?: HomeContentItem | null;
  payload?: Partial<HeroPayload> | null;
}

const DEFAULT_BANNER = toAbsoluteUrl('/pendaftar-vendor/pendaftar-vendor-banner.png');

export const HeroSection: React.FC<HeroSectionProps> = ({ item, payload }) => {
  const p: Partial<HeroPayload> = payload || item?.payload || {};

  const headlineMain = p.headline_main ?? item?.title ?? 'Selamat bergabung sebagai';
  const headlineHighlight = p.headline_highlight ?? item?.subtitle ?? 'Mitra Instalasi Mitra10';
  const description =
    p.description ??
    item?.description ??
    'Sambil menunggu verifikasi selesai, kenali dulu bagaimana platform ini membantu Anda mendapatkan order instalasi rutin dari pelanggan Mitra10 di kota Anda.';

  const rawImage = p.illustration_image ?? item?.image_url;
  const imageUrl = resolveImageUrl(rawImage) || DEFAULT_BANNER;

  return (
    <div className='hero'>
      <div className='text'>
        <h1>
          {headlineMain} <em>{headlineHighlight}</em>
        </h1>
        <p>{description}</p>
      </div>
      <div className='art'>
        <img
          src={imageUrl}
          alt={headlineHighlight || 'Hero Banner'}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/pendaftar-vendor/pendaftar-vendor-banner.png';
          }}
        />
      </div>
    </div>
  );
};
