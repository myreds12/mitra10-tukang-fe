export const statusLabels: Record<number, string> = {
  1: 'Menunggu Approve',
  2: 'Proses Pitching',
  3: 'Disetujui',
  4: 'Ditolak',
}

export const actionLabels: Record<string, string> = {
  REGISTER_SUBMITTED: 'Registrasi Disubmit',
  REGISTRANT_ACCOUNT_CREATED: 'Akun Pendaftar Dibuat',
  START_PITCHING: 'Masuk Proses Pitching',
  FINAL_APPROVED: 'Disetujui Final',
  REJECTED: 'Ditolak',
  RESEND_EMAIL: 'Kirim Ulang Email',
  REGISTRANT_PROMOTED: 'Akun Pendaftar Dipromosikan',
}

export const formatRegistrationDate = (date?: string | null) => {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateTime = (date?: string | null) => {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  const datePart = parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const hours = parsed.getHours().toString().padStart(2, '0')
  const minutes = parsed.getMinutes().toString().padStart(2, '0')
  return `${datePart}, ${hours}.${minutes}`
}

export const getImageUrl = (apiUrl?: string, path?: string | null) => {
  if (!path) return ''
  const cleanPath = path.replace('uploads/', '')
  return `${apiUrl}/public/${cleanPath}`
}
