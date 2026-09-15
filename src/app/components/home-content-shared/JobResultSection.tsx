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
 * Helper to convert any YouTube URL (watch, shorts, embed, youtu.be, iframe) or Vimeo to embed URL
 */
export function getEmbedVideoUrl(url?: string | null): string | null {
  if (!url) return null;
  let trimmed = url.trim();

  // If user pasted full iframe tag: <iframe ... src="..." ...>
  if (trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1].trim();
    }
  }

  // Helper to append parameters that disable fullscreen / maximize
  const formatYt = (id: string) => `https://www.youtube.com/embed/${id}?fs=0&modestbranding=1&rel=0`;

  // Already a standard YouTube embed URL
  if (/^https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]+/i.test(trimmed)) {
    const match = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/i);
    return match ? formatYt(match[1]) : (trimmed.includes('?') ? `${trimmed}&fs=0` : `${trimmed}?fs=0`);
  }

  // YouTube Shorts: youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/(?:youtube\.com|youtu\.be)\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return formatYt(shortsMatch[1]);
  }

  // Standard YouTube Watch / Live / v: youtube.com/watch?v=<id>, youtube.com/live/<id>, youtu.be/<id>
  const ytMatch = trimmed.match(
    /(?:(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return formatYt(ytMatch[1]);
  }

  // Fallback regex for YouTube with query string or other path
  const fallbackYt = trimmed.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (fallbackYt && fallbackYt[1]) {
    return formatYt(fallbackYt[1]);
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?fullscreen=0`;
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

  const mediaModeClass = isVideo
    ? 'video-mode'
    : hasBothImages
    ? 'split-mode'
    : 'single-mode';

  return (
    <div className={`job-result-card ${isVideo ? 'card-video-type' : 'card-image-type'}`}>
      <div className={`job-result-media ${mediaModeClass}`}>
        {isVideo ? (
          resolvedVideoUrl ? (
            embedUrl ? (
              <div className='job-result-media-inner'>
                <iframe
                  src={embedUrl}
                  title={title}
                  className='job-result-iframe'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                />
              </div>
            ) : (
              <div className='job-result-media-inner'>
                <video
                  controls
                  controlsList='nofullscreen nodownload noremoteplayback noplaybackrate'
                  disablePictureInPicture
                  playsInline
                  preload='metadata'
                  src={resolvedVideoUrl}
                  className='job-result-video-player'
                  onContextMenu={(e) => e.preventDefault()}
                >
                  Browser Anda tidak mendukung pemutaran video langsung.
                </video>
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

  const isVideoItem = (entry: any) => {
    const isItem = Boolean(entry.id || entry.section || entry.section_type);
    const p = isItem ? (entry.payload || entry) : entry;
    return (
      p.media_type === 'video' ||
      entry.media_type === 'video' ||
      Boolean(p.video_url || entry.video_url)
    );
  };

  const imageList = validList.filter((entry) => !isVideoItem(entry));
  const videoList = validList.filter((entry) => isVideoItem(entry));

  return (
    <div className='job-result-section-wrap'>
      <div className='sec-head'>
        <h2>Portofolio &amp; Hasil Pekerjaan Mitra</h2>
        <p>Standar mutu pengerjaan instalasi dan renovasi nyata oleh mitra resmi Mitra10.</p>
      </div>

      {/* BARIS 1: FOTO DOKUMENTASI (BEFORE - AFTER) */}
      {imageList.length > 0 && (
        <div className='job-result-subgroup'>
          <div className='job-result-subgroup-head'>
            <div className='subgroup-title-wrap'>
              <span className='subgroup-icon'>📸</span>
              <div>
                <h3 className='subgroup-title'>Foto Dokumentasi Hasil Pekerjaan</h3>
                <span className='subgroup-subtitle'>Perbandingan Sebelum vs Sesudah (Before - After) instalasi</span>
              </div>
            </div>
            <span className='subgroup-count-pill'>{imageList.length} Dokumentasi</span>
          </div>
          <div className='job-result-grid job-result-image-grid'>
            {imageList.map((entry: any, idx: number) => {
              const isItem = Boolean(entry.id || entry.section || entry.section_type);
              return (
                <JobResultCard
                  key={isItem ? entry.id : `job-img-${idx}`}
                  item={isItem ? entry : null}
                  payload={isItem ? undefined : entry}
                  index={idx}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* BARIS 2: VIDEO DOKUMENTASI */}
      {videoList.length > 0 && (
        <div className='job-result-subgroup' style={imageList.length > 0 ? { marginTop: 32 } : undefined}>
          <div className='job-result-subgroup-head'>
            <div className='subgroup-title-wrap'>
              <span className='subgroup-icon'>🎥</span>
              <div>
                <h3 className='subgroup-title'>Video Dokumentasi Pekerjaan</h3>
                <span className='subgroup-subtitle'>Dokumentasi video proses pengerjaan instalasi</span>
              </div>
            </div>
            <span className='subgroup-count-pill video-pill'>{videoList.length} Video</span>
          </div>
          <div className='job-result-grid job-result-video-grid'>
            {videoList.map((entry: any, idx: number) => {
              const isItem = Boolean(entry.id || entry.section || entry.section_type);
              return (
                <JobResultCard
                  key={isItem ? entry.id : `job-vid-${idx}`}
                  item={isItem ? entry : null}
                  payload={isItem ? undefined : entry}
                  index={idx}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
