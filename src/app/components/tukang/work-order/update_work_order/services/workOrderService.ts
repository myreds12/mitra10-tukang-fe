import axios from 'axios'
import {urlToBase64} from '../utils/workOrderHelpers'

export const sendWorkOrderWA = async (workOrderDetail: any, origin: string) => {
  const category = workOrderDetail?.order?.status?.category
  let invoiceMessage = ''
  let iamgeIcon = ''

  if (category === 'SURVEYSTART') {
    iamgeIcon = await urlToBase64(origin + '/media/JASA_INSTALASI_2_CSI_PEKERJAAN.jpg')
    invoiceMessage = `
Hi *${workOrderDetail?.order?.members?.full_name || '-'}*, terima kasih telah menggunakan layanan instalasi Mitra10.

📍 Survey lokasi untuk order Anda *telah selesai dilakukan* oleh tim kami.

Untuk membantu kami meningkatkan kualitas layanan, mohon kesediaannya untuk mengisi:
📝 *Survei Kepuasan Pelanggan (CSI)*  
Melalui link berikut: https://forms.gle/YJfkjJqDNDN5ekyK8 

Masukan Anda sangat berarti agar kami dapat memberikan pelayanan yang lebih baik lagi ke depannya 😊

Terima kasih atas waktu dan kepercayaan Anda kepada *Mitra10* 🙏
`
  } else if (category === 'WORKSTART') {
    iamgeIcon = await urlToBase64(origin + '/media/JASA_INSTALASI_2_CSI_PEKERJAAN.jpg')
    invoiceMessage = `
    Hi *${workOrderDetail?.order?.members?.full_name || '-'}*, terima kasih telah menggunakan layanan instalasi Mitra10.

    📍 Pekerjaan lAnda *telah selesai dilakukan* oleh tim kami.

    Untuk membantu kami meningkatkan kualitas layanan, mohon kesediaannya untuk mengisi:
    📝 *Survei Kepuasan Pelanggan (CSI)*  
    Melalui link berikut: https://forms.gle/YJfkjJqDNDN5ekyK8 

    Masukan Anda sangat berarti agar kami dapat memberikan pelayanan yang lebih baik lagi ke depannya 😊

    Terima kasih atas waktu dan kepercayaan Anda kepada *Mitra10* 🙏
    `
  } else if (category === 'TUKANGWORK') {
    invoiceMessage = `
Hi *${workOrderDetail?.order?.members?.full_name || '-'}*,

Kami informasikan bahwa tim teknisi Instalasi Mitra10 telah *memulai pengerjaan* sesuai pesanan Anda.

Mohon pastikan area kerja dapat diakses dengan baik dan bebas dari barang pribadi, perabot, atau benda pecah belah, agar pengerjaan berjalan lancar. 🙏

⚠️ Kerusakan atau kehilangan pada barang pribadi/perabot di area kerja menjadi tanggung jawab customer. Kami menyarankan untuk mengamankan barang-barang tersebut sebelum pengerjaan dimulai.

Setelah pekerjaan selesai, Anda akan menerima notifikasi otomatis untuk melakukan *Konfirmasi Hasil Pekerjaan*.

📝 Catatan:
Dengan dimulainya pengerjaan ini, Anda dianggap telah menyetujui hasil survey dan penawaran harga sebelumnya.

Terima kasih telah memilih Mitra10! 😊

`
  }

  const payload = {
    phonenumber: workOrderDetail?.order?.members?.member_number,
    message: invoiceMessage,
    location: '',
    img: iamgeIcon,
    document: '',
    audio: '',
    video: '',
    types: 'Order',
  }

  const apiBase = process.env.REACT_APP_WA_BACKEND_API_URL
  if (apiBase) {
    try {
      await axios.post(`${apiBase}/conversation`, payload, {
        headers: {'Content-Type': 'application/json'},
      })
    } catch (e) {
      console.warn('Failed to send WA:', e)
    }
  }
}
