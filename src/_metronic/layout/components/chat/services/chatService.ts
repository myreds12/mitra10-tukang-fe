import axios from '../../../core/axiosInterceptor'

export const getCurrentUser = (userRole: string, vendorName: string, storeName: string): string => {
  if (userRole === 'Owner Vendor') return vendorName || ''
  if (userRole === 'Super User') return 'Admin HO'
  if (userRole === 'Store CS') return storeName || ''
  return userRole || ''
}

export const fetchVendorsOrStores = async (
  apiUrl: string,
  page: number,
  chatType: string,
  userRole: string,
  storeId?: string,
  vendorId?: string
) => {
  const ttype = chatType === 'vendor' ? 'vendor' : 'stores'
  let url = `${apiUrl}/${ttype}?order_by=desc&page=${page}&take=50`
  if (userRole === 'Store CS' && storeId) {
    url += `&store_id=${storeId}`
  }
  if (userRole === 'Owner Vendor' && vendorId) {
    url += `&vendor_id=${vendorId}`
  }
  return axios.get(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const searchVendorApi = async (
  apiUrl: string,
  userRole: string,
  storeId?: string,
  vendorId?: string,
  searchQuery?: string
) => {
  let url = `${apiUrl}/vendor?order_by=desc&page=1&take=50`
  if (userRole === 'Store CS' && storeId) {
    url += `&store_id=${storeId}`
  }
  if (userRole === 'Owner Vendor' && vendorId) {
    url += `&vendor_id=${vendorId}`
  }
  if (searchQuery) {
    url += `&search=${searchQuery}`
  }
  return axios.get(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const searchStoreApi = async (
  apiUrl: string,
  userRole: string,
  vendorId?: string,
  searchQuery?: string
) => {
  let url = `${apiUrl}/stores?order_by=desc&page=1&take=50`
  if (userRole === 'Owner Vendor' && vendorId) {
    url += `&vendor_id=${vendorId}`
  }
  if (searchQuery) {
    url += `&search=${searchQuery}`
  }
  return axios.get(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const fetchOrganisasiApi = async (apiChat: string) => {
  return axios.get(`${apiChat}/chat/organisasi/Mitra 10`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const fetchOrderByIdApi = async (apiUrl: string, orderId: string) => {
  return axios.get(`${apiUrl}/orders/${orderId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const createGroupApi = async (apiChat: string, payload: any) => {
  return axios.post(`${apiChat}/chat/group/create-group`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const uploadChatFileApi = async (apiChat: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`${apiChat}/chat/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const fetchPreviousChatsApi = async (apiChat: string, role: string) => {
  return axios.get(`${apiChat}/chat/previousChats/${role}`)
}

export const fetchMessagesForGroupApi = async (apiChat: string, groupId: string) => {
  return axios.get(`${apiChat}/chat/messages/${groupId}`)
}

export const updateChatStatusApi = async (apiChat: string, groupId: string, currentUser: string) => {
  return axios.put(
    `${apiChat}/chat/status/${groupId}`,
    {sender: currentUser},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
}

export const deleteChatApi = async (apiChat: string, id: string) => {
  return axios.delete(`${apiChat}/chat/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}

export const updateOrganisasiApi = async (apiChat: string, organisasiId: string, deskripsi: string) => {
  return axios.post(
    `${apiChat}/chat/organisasi/`,
    {
      id: organisasiId,
      deskripsi,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  )
}

export const fetchNewChatsWithRetryApi = async (apiChat: string, retries = 3, delayMs = 1000) => {
  const url = `${apiChat.replace(/\/$/, '')}/chat/messages`
  let attempt = 0
  while (attempt <= retries) {
    try {
      return await axios.get(url)
    } catch (err: any) {
      attempt++
      const isNetworkError = !err.response
      console.warn(`fetchNewChats attempt ${attempt} failed`, err.message || err)
      if (!isNetworkError || attempt > retries) throw err
      await new Promise((r) => setTimeout(r, delayMs * attempt))
    }
  }
}
