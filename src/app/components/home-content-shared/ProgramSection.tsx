import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import { HomeContentItem, ProgramPayload } from '../../services/homeContentService';
import { resolveImageUrl } from './imageHelper';

export interface ProgramCardProps {
  item?: HomeContentItem | null;
  payload?: Partial<ProgramPayload> | null;
  index?: number;
  showPlaceholder?: boolean;
  onOpenArticle?: (data: any) => void;
}

/**
 * Extracts a concise plain-text snippet from free-text markdown for card preview
 */
export function getPlainTextSnippet(text?: string | null, maxLength = 130): string {
  if (!text) return '';
  // Remove markdown image syntax: ![alt](url)
  let clean = text.replace(/!\[.*?\]\(.*?\)/g, '');
  // Remove html tags
  clean = clean.replace(/<[^>]*>/g, '');
  // Clean whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '...';
}

/**
 * RenderInjectedContent:
 * Handles rich HTML from Quill editor (with embedded images) as well as
 * markdown injected images `![alt](url)` and formatted free-text.
 */
export const RenderInjectedContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    // 1. Convert any legacy markdown images in html: ![alt](url) -> <img src="url" alt="alt" />
    let html = content.replace(/!\[(.*?)\]\((.*?)\)/g, (_m, alt, src) => {
      const resolved = resolveImageUrl(src) || src;
      return `<img src="${resolved}" alt="${alt || 'Foto Program'}" />`;
    });

    // 2. Resolve relative image sources in <img> tags and attach styling classes
    html = html.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (_m, before, src, after) => {
      const resolved = resolveImageUrl(src) || src;
      return `<img ${before}src="${resolved}"${after} class="program-injected-img" />`;
    });

    return (
      <div className='program-content-rendered ql-snow'>
        <div
          className='ql-editor program-article-html'
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ padding: 0 }}
        />
      </div>
    );
  }

  // Fallback for plain text or pure markdown:
  const regex = /(!\[(.*?)\]\((.*?)\)|<img\s+[^>]*src=["']([^"']+)["'][^>]*>)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.slice(lastIndex, match.index);
      parts.push(
        <span key={`txt-${lastIndex}`} style={{ whiteSpace: 'pre-line' }}>
          {textChunk}
        </span>
      );
    }

    let src = '';
    let alt = 'Foto Program';

    if (match[1].startsWith('![')) {
      alt = match[2] || 'Foto Program';
      src = match[3];
    } else {
      src = match[4];
      const altMatch = match[0].match(/alt=["']([^"']+)["']/i);
      if (altMatch) alt = altMatch[1];
    }

    const resolvedSrc = resolveImageUrl(src);
    if (resolvedSrc) {
      parts.push(
        <div key={`img-wrap-${match.index}`} className='program-injected-img-wrap'>
          <img
            src={resolvedSrc}
            alt={alt}
            className='program-injected-img'
            loading='lazy'
          />
          {alt && alt !== 'Foto Program' && (
            <span className='program-injected-img-caption'>{alt}</span>
          )}
        </div>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    const trailingChunk = content.slice(lastIndex);
    parts.push(
      <span key={`txt-${lastIndex}`} style={{ whiteSpace: 'pre-line' }}>
        {trailingChunk}
      </span>
    );
  }

  return <div className='program-content-rendered'>{parts}</div>;
};

export const ProgramCard: React.FC<ProgramCardProps> = ({
  item,
  payload,
  index = 0,
  showPlaceholder = false,
  onOpenArticle,
}) => {
  const navigate = useNavigate();
  const p: Partial<ProgramPayload> = payload || item?.payload || {};

  const title = p.title ?? item?.title ?? 'Program Mitra10';
  const description = p.description ?? item?.description ?? '';
  const badge = p.badge_label ?? p.badge ?? item?.badge_label ?? null;
  const rawImage = p.image_url ?? p.image ?? item?.image_url;
  const imageUrl = resolveImageUrl(rawImage);
  const rawCta = p.cta_label ?? 'Lihat Detail Program';

  const hasContent = Boolean(
    imageUrl ||
    (description && description.trim().length > 0) ||
    (p.title && p.title.trim().length > 0)
  );

  // Jika tidak ada konten valid dan bukan admin placeholder preview: jangan render card
  if (!hasContent && !showPlaceholder) return null;

  const targetId = item?.id ?? p.order_index ?? index + 1;

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenArticle) {
      onOpenArticle(item || payload || p);
      return;
    }
    navigate(`/pendaftar/program/${targetId}`, {
      state: { item, payload: p },
    });
  };

  const snippet = getPlainTextSnippet(description, 160);
  const showCardCta = p.show_card_cta !== false;
  const formattedCta = rawCta.includes('→') ? rawCta : `${rawCta} →`;

  return (
    <div className='program-card'>
      {imageUrl ? (
        <div className='program-banner' onClick={handleOpenDetail} style={{ cursor: 'pointer' }}>
          <img src={imageUrl} alt={title} className='program-img' />
          {badge && <span className='program-badge'>{badge}</span>}
        </div>
      ) : showPlaceholder ? (
        <div className='program-banner'>
          <div className={`program-placeholder grad-${(index % 6) + 1}`}>
            <span className='program-placeholder-icon'>📢</span>
            <span className='program-placeholder-text'>Belum ada banner promo</span>
          </div>
          {badge && <span className='program-badge'>{badge}</span>}
        </div>
      ) : badge ? (
        <div style={{ padding: '14px 16px 0' }}>
          <span className='program-badge-inline'>{badge}</span>
        </div>
      ) : null}

      <div className='program-body'>
        <h4 className='program-title' onClick={handleOpenDetail} style={{ cursor: 'pointer' }}>
          {title}
        </h4>
        {showCardCta && (
          <div className='program-card-action-row'>
            <button
              type='button'
              onClick={handleOpenDetail}
              className='program-cta-btn'
            >
              {formattedCta}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export interface ProgramSectionProps {
  items?: HomeContentItem[];
  programs?: ProgramPayload[];
  onOpenArticle?: (data: any) => void;
}

export const ProgramSection: React.FC<ProgramSectionProps> = ({ items, programs, onOpenArticle }) => {
  const rawList: any[] = (programs && programs.length > 0
    ? programs
    : items && items.length > 0
    ? items
    : []) as any[];

  // Filter: item aktif yang memiliki gambar banner, gambar disisipkan, atau deskripsi/judul
  const validList = rawList.filter((entry: any) => {
    const isItem = Boolean(entry.id || entry.section || entry.section_type);
    const p = isItem ? (entry.payload || entry) : entry;
    const isActive = entry.is_active !== false && p.is_active !== false;
    const rawImage = p.image_url || p.image || entry.image_url;
    const hasContent = Boolean(
      rawImage ||
      (p.description && p.description.trim().length > 0) ||
      (p.title && p.title.trim().length > 0)
    );
    return isActive && hasContent;
  });

  // Jika tidak ada item yang valid, sembunyikan section sepenuhnya
  if (validList.length === 0) return null;

  return (
    <div className='program-section-wrap'>
      <div className='sec-head'>
        <h2>Program Promosi &amp; Aktivasi Berjalan</h2>
        <p>Program insentif khusus dan promo terkini untuk mitra instalasi Mitra10.</p>
      </div>
      <div className='program-grid'>
        {validList.map((entry: any, idx: number) => {
          const isItem = Boolean(entry.id || entry.section || entry.section_type);
          return (
            <ProgramCard
              key={isItem ? entry.id : `prog-${idx}`}
              item={isItem ? entry : null}
              payload={isItem ? undefined : entry}
              index={idx}
              onOpenArticle={onOpenArticle}
            />
          );
        })}
      </div>
    </div>
  );
};
