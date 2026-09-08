import React from 'react';
import { HeroPayload, HomeContentItem } from '../../services/homeContentService';
import { resolveImageUrl } from './imageHelper';

export interface HeroSectionProps {
  item?: HomeContentItem | null;
  payload?: Partial<HeroPayload> | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ item, payload }) => {
  const p: Partial<HeroPayload> = payload || item?.payload || {};

  const headlineMain = p.headline_main ?? item?.title ?? 'Selamat bergabung sebagai';
  const headlineHighlight = p.headline_highlight ?? item?.subtitle ?? 'Mitra Instalasi Mitra10';
  const description =
    p.description ??
    item?.description ??
    'Sambil menunggu verifikasi selesai, kenali dulu bagaimana platform ini membantu Anda mendapatkan order instalasi rutin dari pelanggan Mitra10 di kota Anda.';

  const rawImage = p.illustration_image ?? item?.image_url;
  const imageUrl = resolveImageUrl(rawImage);

  return (
    <div className='hero'>
      <div className='text'>
        <h1>
          {headlineMain} <em>{headlineHighlight}</em>
        </h1>
        <p>{description}</p>
      </div>
      <div className='art'>
        {imageUrl ? (
          <img src={imageUrl} alt={headlineHighlight || 'Hero Illustration'} />
        ) : (
          <svg width='150' height='120' viewBox='0 0 150 120' fill='none'>
            <rect x='20' y='55' width='110' height='55' rx='4' fill='#EEF1FF' />
            <rect x='20' y='55' width='110' height='14' rx='4' fill='#1E2A78' />
            <circle cx='34' cy='62' r='2.5' fill='#FBC02D' />
            <circle cx='43' cy='62' r='2.5' fill='#E12429' />
            <rect x='34' y='78' width='86' height='6' rx='3' fill='#D8DDF0' />
            <rect x='34' y='90' width='60' height='6' rx='3' fill='#D8DDF0' />
            <path
              d='M55 55 L75 30 L95 55'
              stroke='#E12429'
              strokeWidth='6'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
            <rect x='66' y='40' width='18' height='15' fill='#FBC02D' />
          </svg>
        )}
      </div>
    </div>
  );
};
