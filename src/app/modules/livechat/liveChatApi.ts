export const API_URL =
  process.env.REACT_APP_LIVECHAT_API_URL || 'https://apigatewayinstalasi.mitra10.com/live-chat'

export const buildHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

export const api = {
  getRooms: (token: string) =>
    fetch(`${API_URL}/rooms`, { headers: buildHeaders(token) }).then((r) => r.json()),
  getMessages: (token: string, roomId: number) =>
    fetch(`${API_URL}/rooms/${roomId}/messages?limit=30`, { headers: buildHeaders(token) }).then(
      (r) => r.json()
    ),
  sendMessage: (token: string, roomId: number, content: string) =>
    fetch(`${API_URL}/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({ content, type: 'text' }),
    }).then((r) => r.json()),
  markAsRead: (token: string, roomId: number) =>
    fetch(`${API_URL}/rooms/${roomId}/read`, { method: 'PATCH', headers: buildHeaders(token) }),
  createRoom: (token: string, orderId: string) =>
    fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({ orderId }),
    }).then((r) => r.json()),
  createDirectStore: (token: string, storeId: string) =>
    fetch(`${API_URL}/rooms/direct-store`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({ storeId }),
    }).then((r) => r.json()),
  createDirectVendor: (token: string, vendorId: string) =>
    fetch(`${API_URL}/rooms/direct-vendor`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({ vendorId }),
    }).then((r) => r.json()),
  getStores: (token: string, search?: string) =>
    fetch(`${API_URL}/rooms/stores${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
      headers: buildHeaders(token),
    }).then((r) => r.json()),
  getVendors: (token: string, search?: string) =>
    fetch(`${API_URL}/rooms/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
      headers: buildHeaders(token),
    }).then((r) => r.json()),
  uploadFile: (token: string, roomId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${API_URL}/rooms/${roomId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(async (r) => {
      const contentType = r.headers.get('content-type') || ''
      if (!r.ok) {
        let errorMessage = `Upload gagal (HTTP ${r.status})`
        if (contentType.includes('application/json')) {
          const errData = await r.json()
          errorMessage = errData?.message || errorMessage
        } else {
          const text = await r.text().catch(() => '')
          if (text) {
            const match = text.match(/<title>(.*?)<\/title>/i)
            if (match) errorMessage = `Upload gagal: ${match[1]}`
          }
        }
        return { success: false, message: errorMessage }
      }
      if (!contentType.includes('application/json')) {
        return { success: false, message: 'Respons server tidak valid. Pastikan koneksi stabil.' }
      }
      return r.json()
    })
  },
  deleteRoom: (token: string, roomId: number) =>
    fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: buildHeaders(token),
    }).then((r) => r.json()),
}
