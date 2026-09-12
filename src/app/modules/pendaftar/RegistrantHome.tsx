import React, { useEffect, useState } from 'react';
import { homeContentService, HomeContentItem } from '../../services/homeContentService';
import { HeroSection } from '../../components/home-content-shared/HeroSection';
import { BenefitSection } from '../../components/home-content-shared/BenefitSection';
import { WorkflowSection } from '../../components/home-content-shared/WorkflowSection';
import { CatalogSection } from '../../components/home-content-shared/CatalogSection';
import { ProgramSection } from '../../components/home-content-shared/ProgramSection';
import { JobResultSection } from '../../components/home-content-shared/JobResultSection';
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
  const programs = items.filter((i) =>
    ['PROGRAM', 'PROGRAM_BERJALAN'].includes(i.section_type || i.section),
  );
  const jobResults = items.filter((i) =>
    ['JOB_RESULT', 'HASIL_PEKERJAAN'].includes(i.section_type || i.section),
  );

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

      {/* PROGRAM BERJALAN */}
      <ProgramSection items={programs} />

      {/* HASIL PEKERJAAN (Before - After / Portofolio) */}
      <JobResultSection items={jobResults} />

      {/* ADMIN HO / SUPER USER CONFIGURATION NOTICE */}
      <div
        style={{
          background: '#F0F5FF',
          border: '1px solid #D6E4FF',
          borderRadius: 8,
          padding: '12px 18px',
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#1D39C4',
          fontSize: 12.5,
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚙️</span>
        <div>
          <span style={{ fontWeight: 600 }}>Pengaturan Konten: </span>
          <span>
            Semua konten pada halaman ini dapat disetting dan dikonfigurasi secara dinamis oleh <strong>Admin HO / Super User</strong> melalui menu Kelola Konten Home.
          </span>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div
        style={{
          marginTop: 34,
          paddingTop: 18,
          borderTop: '1px solid #E4E7EC',
          textAlign: 'center',
          fontSize: 12,
          color: '#636B79',
        }}
      >
        <div>&copy; 2026 Mitra10 &mdash; Building Materials &amp; Home Improvement</div>
      </div>
    </div>
  );
};

export default RegistrantHome;
