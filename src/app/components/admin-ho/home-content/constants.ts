import {UnifiedHomePayload, BenefitAccentColor} from '../../../services/homeContentService'

export const BENEFIT_EMOJI_PRESETS = ['📦', '💰', '🧾', '🛡️', '⭐', '🎓', '🔧', '🏆', '💡', '🤝']

export const ACCENT_OPTIONS: Array<{value: BenefitAccentColor; label: string; color: string}> = [
  {value: 'brand-blue', label: 'Brand Blue (#1E2A78)', color: '#1E2A78'},
  {value: 'brand-red', label: 'Brand Red (#E12429)', color: '#E12429'},
  {value: 'brand-yellow', label: 'Brand Yellow (#FBC02D)', color: '#FBC02D'},
]

export const DEFAULT_UNIFIED_PAYLOAD: UnifiedHomePayload = {
  hero: {
    headline_main: 'Selamat bergabung sebagai',
    headline_highlight: 'Mitra Instalasi Mitra10',
    description:
      'Sambil menunggu verifikasi selesai, kenali dulu bagaimana platform ini membantu Anda mendapatkan order instalasi rutin dari pelanggan Mitra10 di kota Anda.',
    illustration_image: null,
  },
  benefits: [
    {
      icon: '',
      title: 'Order instalasi langsung dari pembeli',
      description:
        'Customer Mitra10 yang belanja material langsung memesan jasa pemasangan lewat platform. Tanpa perlu cari order sendiri.',
      accent_color: 'brand-blue',
    },
    {
      icon: '',
      title: 'Tarif jasa transparan & pasti',
      description:
        'Harga jasa terstandarisasi jelas per item pekerjaan. Tidak ada tawar-menawar yang memotong margin Anda.',
      accent_color: 'brand-red',
    },
    {
      icon: '',
      title: 'Pencairan dana tepat waktu',
      description:
        'Begitu pekerjaan selesai & diverifikasi customer, pembayaran ditransfer langsung ke rekening bank vendor Anda.',
      accent_color: 'brand-yellow',
    },
    {
      icon: '',
      title: 'Perlindungan & jaminan kerja',
      description:
        'Sistem komplain & garansi ditangani bersama tim Mitra10, sehingga risiko pekerjaan lebih terukur.',
      accent_color: 'brand-blue',
    },
    {
      icon: '',
      title: 'Tingkatkan reputasi vendor',
      description:
        'Rating & ulasan dari customer akan menaikkan level kemitraan Anda, membuka akses ke proyek bervolume lebih besar.',
      accent_color: 'brand-red',
    },
    {
      icon: '',
      title: 'Dukungan & pelatihan berkala',
      description:
        'Akses SOP instalasi Mitra10, briefing produk baru dari brand prinsipal, serta bantuan teknis dari tim lapangan.',
      accent_color: 'brand-yellow',
    },
  ],
  catalogs: [
    {
      name: 'Cat & Dinding',
      link_url: 'https://www.mitra10.com/cat-lantai-dinding',
      badge_text: 'Populer',
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Keramik & Granit',
      link_url: 'https://www.mitra10.com/cat-lantai-dinding/lantai',
      badge_text: null,
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Sanitari & Kamar Mandi',
      link_url: 'https://www.mitra10.com/kamar-mandi',
      badge_text: 'Banyak Order',
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Pintu & Jendela',
      link_url: 'https://www.mitra10.com/pintu-jendela-material-bangunan',
      badge_text: null,
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Dapur & Sink',
      link_url: 'https://www.mitra10.com/dapur',
      badge_text: null,
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Alat Listrik & Lampu',
      link_url: 'https://www.mitra10.com/lampu-elektronik',
      badge_text: null,
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Hardware & Kunci',
      link_url: 'https://www.mitra10.com/hardware-tools',
      badge_text: null,
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
    {
      name: 'Atap & Bahan Bangunan',
      link_url: 'https://www.mitra10.com/pintu-jendela-material-bangunan/bahan-bangunan',
      badge_text: null,
      icon_fallback: '',
      image: null,
      button_label: 'Lihat Produk →',
      button_style: 'primary',
    },
  ],
  programs: [
    {
      title: 'Program Insentif Awal Tahun Mitra10 2026',
      badge: 'Program Promosi',
      badge_label: 'Program Promosi',
      description:
        'Dapatkan bonus insentif tambahan sebesar 5% per penyelesaian order instalasi tepat waktu dan dengan rating bintang 5 dari pelanggan Mitra10 selama kuartal pertama tahun 2026.',
      image: '',
      image_url: '',
      cta_label: 'Lihat Detail',
      link_url: 'https://www.mitra10.com',
      external_cta_label: 'Ikuti Program',
      is_active: true,
      has_external_link: false,
      show_card_cta: true,
    },
  ],
  job_results: [
    {
      title: 'Pemasangan Granit Lantai Ruang Utama 60x60',
      description:
        'Pengerjaan pemasangan keramik granit presisi tinggi dengan nat rata sempurna di area ruang tamu rumah tinggal.',
      badge_label: 'Before - After',
      tag: 'Before - After',
      media_type: 'before_after',
      before_image: '',
      image_before_url: '',
      image: '',
      image_after_url: '',
      video_url: null,
      order_index: 0,
      is_active: true,
    },
  ],
  support: {
    support_label: 'Hubungi Tim Support',
    support_email: 'vendor-support@mitra10.com',
    support_phone: '+6281234567890',
    support_hours: 'Senin - Jumat, 08:00 - 17:00 WIB',
    support_note: 'Tim kami siap membantu kendala dan verifikasi pendaftaran vendor Anda.',
  },
}
