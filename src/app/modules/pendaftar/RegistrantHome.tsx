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
  faThLarge,
  faImage,
} from '@fortawesome/free-solid-svg-icons'
import type {IconDefinition} from '@fortawesome/fontawesome-svg-core'
import './RegistrantHome.css'

// Icon mapping untuk section BENEFIT/CATALOG. key = string dari DB `icon` field.
const ICON_MAP: Record<string, IconDefinition> = {
  briefcase: faBriefcase,
  'graduation-cap': faGraduationCap,
  'book-open': faBookOpen,
  gift: faGift,
  'chart-line': faChartLine,
  handshake: faHandshake,
  'th-large': faThLarge,
}

// URL gambar absolut: gabung base API + path relatif dari DB.
const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')
const resolveImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.startsWith('uploads/')) return `${apiUrl}/public/${imageUrl.replace(/^uploads\//, '')}`
  return `${apiUrl}/${imageUrl.replace(/^\//, '')}`
}

interface BaseItem {
  id: number
  section: 'HERO' | 'BENEFIT' | 'BANNER' | 'CATALOG'
  title: string | null
  subtitle: string | null
  description: string | null
  icon: string | null
  image_url: string | null
  order_index: number
}

const RegistrantHome: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<BaseItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHome = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.get(`${apiUrl}/home-content`, {
          headers: {Accept: 'application/json', Authorization: `Bearer ${token}`},
          timeout: 10000,
        })
        const data = response.data?.data ?? response.data
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching home content:', err)
        setError(
          'Konten Home tidak dapat dimuat. Silakan coba beberapa saat lagi.',
        )
      } finally {
        setLoading(false)
      }
    }
    fetchHome()
  }, [])

  if (loading) {
    return (
      <section id='registrant-home' className='registrant-page'>
        <div className='registrant-loading text-center py-5'>Memuat konten...</div>
      </section>
    )
  }

  // Group by section - backend sudah sort by section + order_index
  const hero = items.find((i) => i.section === 'HERO')
  const benefits = items.filter((i) => i.section === 'BENEFIT')
  const banners = items.filter((i) => i.section === 'BANNER')
  const catalogs = items.filter((i) => i.section === 'CATALOG')

  // BANNER pertama dipakai sebagai hero banner image background
  const bannerImage = resolveImageUrl(banners[0]?.image_url)

  return (
    <section id='registrant-home' className='registrant-page'>
      {/* BANNER: image utama + overlay (brand-blue) dengan judul HERO di atas */}
      <div
        className='registrant-banner'
        style={
          bannerImage
            ? {backgroundImage: `linear-gradient(rgba(30, 42, 120, 0.55), rgba(30, 42, 120, 0.55)), url('${bannerImage}')`}
            : undefined
        }
      >
        {!bannerImage && (
          <div className='registrant-banner-placeholder'>
            <FontAwesomeIcon icon={faImage} size='3x' />
          </div>
        )}
        <div className='registrant-banner-overlay'>
          {hero?.title && <h1 className='registrant-hero-title'>{hero.title}</h1>}
          {hero?.subtitle && (
            <p className='registrant-hero-subtitle'>{hero.subtitle}</p>
          )}
        </div>
      </div>

      <div className='registrant-content'>
        {error && <div className='registrant-error-banner'>{error}</div>}

        {/* BENEFIT: 2-kolom grid dengan card border-radius 10px + icon container brand-blue */}
        {benefits.length > 0 && (
          <section className='registrant-section'>
            <h2 className='registrant-section-title'>
              Kenapa Bergabung Menjadi Vendor Mitra10?
            </h2>
            <div className='registrant-benefits'>
              {benefits.map((benefit) => {
                const Icon = ICON_MAP[benefit.icon || ''] ?? faBriefcase
                return (
                  <div className='registrant-benefit-card' key={benefit.id}>
                    <div className='registrant-benefit-icon'>
                      <FontAwesomeIcon icon={Icon} size='lg' />
                    </div>
                    <div className='registrant-benefit-body'>
                      <h3 className='registrant-benefit-title'>
                        {benefit.title || '-'}
                      </h3>
                      <p className='registrant-benefit-desc'>
                        {benefit.description || ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* CATALOG: grid cards sederhana (untuk konten katalog Mitra10) */}
        {catalogs.length > 0 && (
          <section className='registrant-section'>
            <h2 className='registrant-section-title'>Katalog Layanan Kami</h2>
            <div className='registrant-catalogs'>
              {catalogs.map((cat) => {
                const Icon = ICON_MAP[cat.icon || ''] ?? faThLarge
                return (
                  <div className='registrant-catalog-card' key={cat.id}>
                    <div className='registrant-catalog-icon'>
                      <FontAwesomeIcon icon={Icon} size='2x' />
                    </div>
                    <h3 className='registrant-catalog-title'>
                      {cat.title || '-'}
                    </h3>
                    <p className='registrant-catalog-desc'>
                      {cat.description || ''}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {items.length === 0 && !error && (
          <div className='registrant-empty'>
            Konten Home belum tersedia. Hubungi Admin untuk info lebih lanjut.
          </div>
        )}
      </div>
    </section>
  )
}

export default RegistrantHome
