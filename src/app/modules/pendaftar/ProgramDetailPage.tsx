import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Spin, Tag, Card } from 'antd';
import { ArrowLeftOutlined, ShareAltOutlined, LinkOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { homeContentService, HomeContentItem, ProgramPayload } from '../../services/homeContentService';
import { resolveImageUrl } from '../../components/home-content-shared/imageHelper';
import { RenderInjectedContent } from '../../components/home-content-shared/ProgramSection';
import './ProgramDetailPage.css';

export const ProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = (location.state as any)?.payload || (location.state as any)?.item || null;
  const [program, setProgram] = useState<Partial<ProgramPayload> | null>(() => {
    if (stateData) {
      return stateData.payload || stateData;
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!stateData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If stateData already populated, we don't strictly need to block UI, but can revalidate
    let isMounted = true;

    const fetchProgram = async () => {
      try {
        if (!stateData) setLoading(true);
        const items = await homeContentService.getActive();

        // 1. Check decomposed PROGRAM_BERJALAN items
        const programItems = items.filter(
          (x: any) =>
            x.section === 'PROGRAM_BERJALAN' ||
            x.section === 'PROGRAM' ||
            x.section_type === 'PROGRAM_BERJALAN' ||
            x.section_type === 'PROGRAM'
        );

        let match: any = null;
        if (id) {
          match = programItems.find((p: any, idx: number) => {
            if (p.id && String(p.id) === String(id)) return true;
            if (p.order_index && String(p.order_index) === String(id)) return true;
            if (String(idx + 1) === String(id) || String(idx) === String(id)) return true;
            return false;
          });

          // 2. Fallback check inside UNIFIED_HOME payload.programs
          if (!match) {
            const unified = items.find((x: any) => x.section === 'UNIFIED_HOME' || x.section_type === 'UNIFIED_HOME');
            const list = unified?.payload?.programs || [];
            match = list.find((p: any, idx: number) => {
              if (p.id && String(p.id) === String(id)) return true;
              if (p.order_index && String(p.order_index) === String(id)) return true;
              if (String(idx + 1) === String(id) || String(idx) === String(id)) return true;
              return false;
            });
          }
        }

        if (!match && !stateData) {
          if (isMounted) setError('Program promosi atau aktivasi tidak ditemukan atau sudah tidak aktif.');
        } else if (match) {
          const resolvedPayload = match.payload || match;
          if (isMounted) {
            setProgram({
              title: match.title || resolvedPayload.title,
              description: match.description || resolvedPayload.description,
              image_url: match.image_url || resolvedPayload.image_url || resolvedPayload.image,
              image: match.image_url || resolvedPayload.image_url || resolvedPayload.image,
              badge_label: match.badge_label || resolvedPayload.badge_label || resolvedPayload.badge,
              badge: match.badge_label || resolvedPayload.badge_label || resolvedPayload.badge,
              cta_label: match.cta_label || resolvedPayload.cta_label,
              link_url: match.link_url || resolvedPayload.link_url,
            });
          }
        }
      } catch (err: any) {
        if (isMounted && !stateData) {
          setError('Gagal memuat detail program. Silakan coba beberapa saat lagi.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProgram();
    return () => {
      isMounted = false;
    };
  }, [id, stateData]);

  if (loading) {
    return (
      <div className='program-detail-container'>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Spin size='large' />
          <p style={{ marginTop: 16, color: '#6B7280', fontSize: 14 }}>
            Memuat detail program &amp; ketentuan...
          </p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className='program-detail-container'>
        <div className='program-detail-error-card'>
          <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>⚠️</span>
          <h3 style={{ fontSize: 18, color: '#1A1A2E', marginBottom: 8 }}>
            Program Tidak Ditemukan
          </h3>
          <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>
            {error || 'Program yang Anda cari tidak tersedia atau telah berakhir masa berlakunya.'}
          </p>
          <Button
            type='primary'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/pendaftar/home')}
            style={{ background: '#1E2A78', borderColor: '#1E2A78' }}
          >
            Kembali ke Beranda Vendor
          </Button>
        </div>
      </div>
    );
  }

  const title = program.title || 'Program Promosi Mitra10';
  const description = program.description || '';
  const badge = program.badge_label || program.badge || 'Program Berjalan';
  const rawImage = program.image_url || program.image;
  const imageUrl = resolveImageUrl(rawImage);
  const linkUrl = program.link_url || undefined;
  const hasExternalLink = program.has_external_link !== false && Boolean(linkUrl && linkUrl.trim().length > 0);
  const externalCtaLabel = program.external_cta_label || program.cta_label || 'Ikuti Program';

  return (
    <div className='program-detail-container'>
      {/* TOP NAVIGATION / BREADCRUMB */}
      <div className='program-detail-nav'>
        <Button
          type='link'
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/pendaftar/home')}
          className='program-back-btn'
        >
          Kembali ke Beranda
        </Button>
        <div className='program-detail-breadcrumb'>
          <Link to='/pendaftar/home'>Beranda</Link>
          <span className='sep'>/</span>
          <span>Program Promosi &amp; Aktivasi</span>
        </div>
      </div>

      {/* MAIN ARTICLE CARD */}
      <article className='program-article-card'>
        {/* ARTICLE HEADER */}
        <header className='program-article-header'>
          {badge && (
            <span className='program-article-badge'>
              {badge}
            </span>
          )}
          <h1 className='program-article-title'>{title}</h1>
          <div className='program-article-meta'>
            <span className='meta-item'>
              <CheckCircleOutlined style={{ color: '#00A651', marginRight: 4 }} />
              Program Resmi Mitra Instalasi Mitra10
            </span>
            <span className='meta-divider'>•</span>
            <span className='meta-item'>Informasi &amp; Ketentuan Lengkap</span>
          </div>
        </header>

        {/* HERO BANNER IMAGE (IF AVAILABLE) */}
        {imageUrl && (
          <div className='program-article-hero-wrap'>
            <img src={imageUrl} alt={title} className='program-article-hero-img' />
          </div>
        )}

        {/* ARTICLE CONTENT (FREE TEXT WITH INJECTED IMAGES) */}
        <div className='program-article-body'>
          <RenderInjectedContent content={description} />
        </div>

        {/* ACTION / EXTERNAL CTA FOOTER */}
        <footer className='program-article-footer'>
          {hasExternalLink && linkUrl ? (
            <div className='program-footer-cta-box'>
              <div className='cta-box-text'>
                <strong>Tertarik mengikuti program ini?</strong>
                <span>Kunjungi halaman pendaftaran atau informasi resmi terkait melalui tombol berikut:</span>
              </div>
              <a
                href={linkUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='program-action-btn primary'
              >
                {externalCtaLabel} <LinkOutlined style={{ marginLeft: 6 }} />
              </a>
            </div>
          ) : (
            <div className='program-footer-notice'>
              <span style={{ fontSize: 18, marginRight: 8 }}>📢</span>
              <span>
                Untuk informasi pendaftaran program dan konsultasi lebih lanjut, silakan hubungi tim kami via widget Live Chat di pojok kanan bawah.
              </span>
            </div>
          )}

          <div className='program-footer-nav-row'>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/pendaftar/home')}
            >
              Kembali ke Halaman Beranda
            </Button>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ProgramDetailPage;
