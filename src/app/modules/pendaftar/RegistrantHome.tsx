import {useEffect, useState} from 'react'
import axios from 'axios'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faBriefcase,
  faGraduationCap,
  faBookOpen,
  faGift,
  faChartLine,
  faHandshake,
} from '@fortawesome/free-solid-svg-icons'
import type {IconDefinition} from '@fortawesome/fontawesome-svg-core'
import './RegistrantHome.css'

// PLACEHOLDER BANNER: gambar berikut adalah placeholder dan PERLU DIGANTI
// dengan aset banner resmi dari tim Mitra10 (mis. foto tim/vendor instalasi).
const BANNER_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjMwMCI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMTgzMzgzIi8+PHRleHQgeD0iNjAwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHklZG9taW5hbnQ9Im1pZGRsZSI+UGxhY2Vob2xkZXIgQmFubmVyIE1pdHJhMTA8L3RleHQ+PC9zdmc+'

interface Benefit {
  icon: string
  title: string
  description: string
}

interface HomeContent {
  title: string
  intro: string
  subtitle: string
  sub_intro: string
  benefits: Benefit[]
  banner_image: string | null
}

// Mapping icon string (dari API) -> FontAwesome icon
const BENEFIT_ICONS: Record<string, IconDefinition> = {
  briefcase: faBriefcase,
  'graduation-cap': faGraduationCap,
  'book-open': faBookOpen,
  gift: faGift,
  'chart-line': faChartLine,
  handshake: faHandshake,
}

/**
 * Halaman Home dashboard Pendaftar Vendor (statis, V1).
 * Konten diambil dari endpoint /vendor-registration/me/home.
 * PLACEHOLDER: banner perlu diganti aset asli. Konten hardcode di backend V1
 * (rekomendasi improvement: CMS kecil bila perlu update dinamis).
 */
const RegistrantHome: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL

  const [content, setContent] = useState<HomeContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHomeContent = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.get(`${apiUrl}/vendor-registration/me/home`, {
          headers: {Accept: 'application/json', Authorization: `Bearer ${token}`},
          timeout: 10000,
        })
        const data = response.data?.data ?? response.data
        setContent(data)
      } catch (error) {
        console.error('Error fetching registrant home content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomeContent()
  }, [apiUrl])

  if (isLoading) {
    return (
      <section id='registrant-home' className='registrant-page'>
        <div className='registrant-loading text-center py-5'>Memuat konten...</div>
      </section>
    )
  }

  // Fallback konten (sesuai teks yang diberikan) bila API gagal
  const fallbackContent: HomeContent = {
    title: 'Bergabung & Tumbuh Bersama Mitra10',
    intro:
      'Menjadi bagian dari jaringan Vendor Instalasi Mitra10 dan dapatkan berbagai kesempatan untuk mengembangkan bisnis, meningkatkan kompetensi, serta memperluas peluang pekerjaan bersama Mitra10.',
    subtitle: 'Kenapa Bergabung Menjadi Vendor Mitra10?',
    sub_intro:
      'Dapatkan lebih dari sekadar order. Bergabung bersama jaringan Vendor Instalasi Mitra10 untuk mendapatkan peluang pekerjaan, meningkatkan kompetensi, dan mengembangkan bisnis Anda.',
    benefits: [],
    banner_image: null,
  }

  const view = content ?? fallbackContent

  return (
    <section id='registrant-home' className='registrant-page'>
      {/* PLACEHOLDER BANNER: ganti dengan aset banner asli dari tim Mitra10 */}
      <div className='registrant-banner'>
        <img src={BANNER_PLACEHOLDER} alt='Banner Mitra10' className='registrant-banner-img' />
      </div>

      <div className='registrant-content'>
        <h1 className='registrant-title'>{view.title}</h1>
        <p className='registrant-intro'>{view.intro}</p>

        <h2 className='registrant-subtitle'>{view.subtitle}</h2>
        <p className='registrant-sub-intro'>{view.sub_intro}</p>

        <div className='registrant-benefits'>
          {(view.benefits || []).map((benefit) => {
            const icon = BENEFIT_ICONS[benefit.icon] ?? faBriefcase
            return (
              <div className='registrant-benefit-card' key={benefit.title}>
                <div className='registrant-benefit-icon'>
                  <FontAwesomeIcon icon={icon} size='lg' />
                </div>
                <div className='registrant-benefit-body'>
                  <h3 className='registrant-benefit-title'>{benefit.title}</h3>
                  <p className='registrant-benefit-desc'>{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default RegistrantHome
