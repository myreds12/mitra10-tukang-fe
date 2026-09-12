import React from 'react';
import { HomeContentItem, JobResultPayload } from '../../services/homeContentService';
import { resolveImageUrl } from './imageHelper';

export interface JobResultCardProps {
  item?: HomeContentItem | null;
  payload?: Partial<JobResultPayload> | null;
  index?: number;
  showPlaceholder?: boolean;
}

/**
 * Helper to convert YouTube URL (watch, short, embed) to embed URL
 */
function getEmbedVideoUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
}

export const JobResultCard: React.FC<JobResultCardProps> = ({
  item,
  payload,
  index = 0,
  showPlaceholder = false,
}) => {
  const p: Partial<JobResultPayload> = payload || item?.payload || {};

  const title = p.title ?? item?.title ?? 'Hasil Pekerjaan';
  const description = p.description ?? item?.description ?? '';

  const rawVideoUrl = p.video_url ?? item?.video_url;
  const isVideo =
    p.media_type === 'video' ||
    item?.media_type === 'video' ||
    Boolean(rawVideoUrl);

  const defaultBadge = isVideo ? '🎥 Video Dokumentasi' : 'Before - After';
  const badge = p.badge_label ?? p.tag ?? item?.badge_label ?? defaultBadge;

  const rawBeforeImage =
    p.image_before_url ?? p.before_image ?? item?.image_before_url;
  const rawAfterImage =
    p.image_after_url ?? p.image ?? item?.image_after_url;

  const beforeImageUrl = resolveImageUrl(rawBeforeImage);
  const afterImageUrl = resolveImageUrl(rawAfterImage);

  const hasBothImages = Boolean(beforeImageUrl && afterImageUrl);
  const singleImageUrl = beforeImageUrl || afterImageUrl;
  const embedUrl = getEmbedVideoUrl(rawVideoUrl);
  const resolvedVideoUrl = rawVideoUrl ? resolveImageUrl(rawVideoUrl) : null;

  const hasMedia = isVideo
    ? Boolean(rawVideoUrl)
    : Boolean(singleImageUrl);

  // Jika tidak ada media dan bukan mode preview admin: jangan render
  if (!hasMedia && !showPlaceholder) return null;

  return (
    <div className='job-result-card'>
      <div className={`job-result-media ${isVideo ? 'video-mode' : ''}`}>
        {isVideo ? (
          resolvedVideoUrl ? (
            embedUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <iframe
                  src={embedUrl}
                  title={title}
                  className='job-result-iframe'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
                {badge && (
                  <span className='job-pane-label' style={{ top: 10, right: 10 }}>
                    {badge}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <video
                  controls
                  playsInline
                  preload='metadata'
                  src={resolvedVideoUrl}
                  className='job-result-video-player'
                >
                  Browser Anda tidak mendukung pemutaran video langsung.
                </video>
                {badge && (
                  <span className='job-pane-label' style={{ top: 10, right: 10 }}>
                    {badge}
                  </span>
                )}
              </div>
            )
          ) : (
            <div className={`job-result-placeholder grad-${(index % 6) + 1}`}>
              <span className='job-placeholder-icon'>🎥</span>
              <span className='job-placeholder-text'>Belum ada video dokumentasi</span>
            </div>
          )
        ) : hasBothImages ? (
          <div className='job-result-split'>
            <div className='job-result-pane before'>
              <img src={beforeImageUrl!} alt={`Sebelum - ${title}`} />
              <span className='job-pane-label before-label'>BEFORE</span>
            </div>
            <div className='job-result-pane after'>
              <img src={afterImageUrl!} alt={`Sesudah - ${title}`} />
              <span className='job-pane-label after-label'>AFTER</span>
            </div>
            {badge && (
              <span
                className='job-pane-label'
                style={{
                  top: 10,
                  right: 10,
                  bottom: 'auto',
                  background: 'rgba(30, 42, 120, 0.88)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {badge}
              </span>
            )}
          </div>
        ) : singleImageUrl ? (
          <div className='job-result-single'>
            <img src={singleImageUrl} alt={title} />
            <span className='job-pane-label'>{badge || 'Hasil Pekerjaan'}</span>
          </div>
        ) : (
          <div className={`job-result-placeholder grad-${(index % 6) + 1}`}>
            <span className='job-placeholder-icon'>📸</span>
            <span className='job-placeholder-text'>Belum ada foto pekerjaan</span>
          </div>
        )}
      </div>

      <div className='job-result-body'>
        <div className='job-result-header-row'>
          <h4 className='job-result-title'>{title}</h4>
          {badge && (
            <span className='job-tag-pill'>
              {badge}
            </span>
          )}
        </div>
        <p className='job-result-desc' style={{ whiteSpace: 'pre-line' }}>{description}</p>
      </div>
    </div>
  );
};

export interface JobResultSectionProps {
  items?: HomeContentItem[];
  jobResults?: JobResultPayload[];
}

export const JobResultSection: React.FC<JobResultSectionProps> = ({ items, jobResults }) => {
  const rawList: any[] = (jobResults && jobResults.length > 0
    ? jobResults
    : items && items.length > 0
    ? items
    : []) as any[];

  // Filter: item aktif yang memiliki minimal 1 media valid (video atau foto)
  const validList = rawList.filter((entry: any) => {
    const isItem = Boolean(entry.id || entry.section || entry.section_type);
    const p = isItem ? (entry.payload || entry) : entry;
    const isActive = entry.is_active !== false && p.is_active !== false;

    const isVideo =
      p.media_type === 'video' ||
      entry.media_type === 'video' ||
      Boolean(p.video_url || entry.video_url);

    if (isVideo) {
      return isActive && Boolean(p.video_url || entry.video_url);
    }

    const hasImage = Boolean(
      p.image_before_url ||
      p.before_image ||
      p.image_after_url ||
      p.image ||
      entry.image_before_url ||
      entry.image_url
    );
    return isActive && hasImage;
  });

  // Jika tidak ada item yang valid, sembunyikan section sepenuhnya
  if (validList.length === 0) return null;

  return (
    <div className='job-result-section-wrap'>
      <div className='sec-head'>
        <h2>Portofolio &amp; Hasil Pekerjaan Mitra</h2>
        <p>Standar mutu pengerjaan instalasi dan renovasi nyata oleh mitra resmi Mitra10.</p>
      </div>
      <div className='job-result-grid'>
        {validList.map((entry: any, idx: number) => {
          const isItem = Boolean(entry.id || entry.section || entry.section_type);
          return (
            <JobResultCard
              key={isItem ? entry.id : `job-${idx}`}
              item={isItem ? entry : null}
              payload={isItem ? undefined : entry}
              index={idx}
            />
          );
        })}
      </div>
    </div>
  );
};
