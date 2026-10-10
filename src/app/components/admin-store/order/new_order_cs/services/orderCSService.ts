import axios from 'axios'
import {formatDateTimeZone} from '../../../../../../_metronic/helpers'

export async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()

    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn('⚠️ Failed convert to Base64 (CORS maybe):', err)
    return ''
  }
}

export const sendOrderCSWA = async (
  orderDetail: any,
  emailDetail: any,
  staffStoreName: string,
  origin: string
) => {
  const API_BASE = process.env.REACT_APP_WA_BACKEND_API_URL
  if (!API_BASE) return

  const paymentType = orderDetail?.payment_type
  const showPrice = !(paymentType === 'gratis' || paymentType === 'survey')

  const detailItems = orderDetail?.order_details
    ?.map((item: any) => {
      const pemasangan =
        paymentType === 'survey' ? item?.item_notes : item?.item?.service_name ?? '-'

      const totalPrice = showPrice ? `Rp ${parseInt(item?.total || 0).toLocaleString('id')}` : '-'

      return `[${item?.item_code ?? '-'}] | ${item?.item_name ?? '-'} | ${pemasangan} | ${
        item?.quantity ?? 0
      } | ${totalPrice}`
    })
    .join('\n')

  const information_detail = emailDetail?.information_detail
    ?.map((item: any) => item.information)
    .join('\n• ')

  const invoiceMessage = `
${emailDetail?.welcome_header} , ${
    orderDetail?.members?.full_name || '-'
  }, terima kasih telah memesan layanan instalasi di Mitra10.
Order Anda berhasil kami terima dan tercatat di sistem, dan saat ini sedang masuk dalam antrean proses oleh tim Instalasi & Servis.

——————————————
🧾 Detail Order
• Nama Toko: ${staffStoreName}
• Order ID: *${orderDetail?.id}* 
• Tanggal Order: *${formatDateTimeZone(orderDetail?.created_at)}* 
• Survey/Pemasangan: *${formatDateTimeZone(orderDetail?.request_survey)}* 
• Nama Customer: *${orderDetail?.members?.full_name || '-'}*
• Alamat: *${orderDetail?.members?.address_1 || '-'}*

——————————————
📦 Detail Pemasangan
${detailItems}

——————————————
⚠️ Catatan Penting:
• Pastikan produk tersedia di lokasi sebelum survey/pemasangan.
• Jika produk belum dibeli, teknisi kami akan melakukan survey terlebih dahulu.
• Layanan hanya berlaku untuk produk yang dibeli di Mitra10.

Tim kami akan segera menghubungi Anda untuk konfirmasi jadwal sesuai antrean dan ketersediaan teknisi.

——————————————
📞 Informasi & Bantuan:
${information_detail}
(📌 Order di luar jam operasional akan diproses pada hari kerja berikutnya.)

Terima kasih telah menggunakan layanan instalasi Mitra10. Jika membutuhkan bantuan, silakan hubungi
kami pada jam operasional.
  `

  const payload = {
    phonenumber: orderDetail?.members?.member_number,
    message: invoiceMessage,
    location: '',
    img: await urlToBase64(origin + '/media/INSTALASI_HIRES.jpeg'),
    document: '',
    audio: '',
    video: '',
    types: 'Order',
  }

  try {
    await axios.post(`${API_BASE}/conversation`, payload, {
      headers: {'Content-Type': 'application/json'},
    })
  } catch (err) {
    console.warn('Failed to send WA:', err)
  }
}
