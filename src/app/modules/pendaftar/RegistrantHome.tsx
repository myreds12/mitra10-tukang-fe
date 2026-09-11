import React, { useEffect, useState } from 'react';
import { homeContentService, HomeContentItem } from '../../services/homeContentService';
import { HeroSection } from '../../components/home-content-shared/HeroSection';
import { BenefitSection } from '../../components/home-content-shared/BenefitSection';
import { WorkflowSection } from '../../components/home-content-shared/WorkflowSection';
import { CatalogSection } from '../../components/home-content-shared/CatalogSection';
import '../../components/home-content-shared/HomeContentVisual.css';

const RegistrantHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HomeContentItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;
    const fetchHome = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await homeContentService.getActive();
        if (!isCancelled) {
          setItems(data);
        }
      } catch (err) {
        console.error('Error fetching home content:', err);
        if (!isCancelled) {
          setError('Konten Home tidak dapat dimuat. Silakan coba beberapa saat lagi.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    fetchHome();
    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#636B79' }}>
        Memuat konten beranda...
      </div>
    );
  }

  // Filter per section_type (dengan fallback section untuk backward compatibility)
  const hero = items.find((i) => (i.section_type || i.section) === 'HERO');
  const benefits = items.filter((i) => (i.section_type || i.section) === 'BENEFIT');
  const catalogs = items.filter((i) => (i.section_type || i.section) === 'CATALOG');
  const support = items.find((i) => (i.section_type || i.section) === 'SUPPORT');
  const supportPayload = (support?.payload as any) || null;

  return (
    <div className='home-content-wrapper' style={{ marginTop: 20 }}>
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: '#FFF3CD',
            color: '#856404',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* HERO SECTION */}
      <HeroSection item={hero} />

      {/* BENEFIT SECTION */}
      <BenefitSection items={benefits} />

      {/* WORKFLOW SECTION (Hardcoded 6 langkah sesuai acuan visual) */}
      <WorkflowSection />

      {/* CATALOG SECTION */}
      <CatalogSection items={catalogs} />

      {/* SUPPORT INFO SECTION */}
      {support && (() => {
        const phone = supportPayload?.support_phone || support?.description || '+6281234567890';
        const cleanWaPhone = phone.replace(/[^0-9]/g, '');
        return (
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
              marginTop: 24,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2A78', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎧</span>
                <span>{supportPayload?.support_label || support.title || 'Hubungi Tim Support Mitra10'}</span>
              </div>
              {supportPayload?.support_note && (
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                  {supportPayload.support_note}
                </div>
              )}
            </div>
            {cleanWaPhone && (
              <a
                href={`https://wa.me/${cleanWaPhone}`}
                target='_blank'
                rel='noopener noreferrer'
                style={{
                  background: '#00A651',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>💬 WhatsApp Tim Support</span>
              </a>
            )}
          </div>
        );
      })()}

      {/* FOOTER NOTE */}
      <div
        style={{
          marginTop: 34,
          paddingTop: 18,
          borderTop: '1px solid #E4E7EC',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 12,
          color: '#636B79',
        }}
      >
        <div>
          Punya pertanyaan seputar proses approval?{' '}
          <a href='#faq-vendor' style={{ color: '#1E2A78', fontWeight: 600 }}>
            Lihat FAQ Vendor
          </a>
        </div>
        <div>&copy; 2026 Mitra10 &mdash; Building Materials &amp; Home Improvement</div>
      </div>
    </div>
  );
};

export default RegistrantHome;
