/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useState, useEffect, useRef} from 'react'
import io from 'socket.io-client'
import axios from '../../core/axiosInterceptor'
import Swal from 'sweetalert2'
import ChatStart from './ChatStart'
import ChatVendor from './ChatVendor'
import ChatOrderId from './ChatOrderId'
import ChatActive from './ChatActive'
import ChatPrevious from './ChatPrevious'
import EditMessageModal from './EditMessageModal'
import {toAbsoluteUrl} from '../../../helpers'
import {Button, Modal} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faComment} from '@fortawesome/free-solid-svg-icons'

const enableSockets = process.env.REACT_APP_ENABLE_CHAT_SOCKETS === 'true'

export default function ChatPage(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [step, setStep] = useState<string>('start')
  const [steps, setSteps] = useState<string>('')
  const [message, setMessage] = useState<any>()
  const [messages, setMessages] = useState<{sender: string; message: string; timestamp: any}[]>([])
  const [orderId, setOrderId] = useState<string>('')
  const [chatType, setChatType] = useState<string>('')
  const [groupId, setGroupId] = useState<string>('')
  const [reciver, setReciver] = useState<any>([])
  const [organisasiId, setOrganisasiId] = useState<string>('')
  const [vendorList, setVendorList] = useState<{id: string; store_name: string}[]>([])
  const [StoreList, setStoreList] = useState<{id: string; store_name: string}[]>([])
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false)
  const [previousChats, setPreviousChats] = useState<any>([])
  const [page, setPage] = useState(1) // Pagination state
  const [newMessages, setNewMessages] = useState<any>(false)
  const [unreadChats, setUnreadChats] = useState<any>([])
  const userRole = localStorage.getItem('userRole') as any
  const storeName = localStorage.getItem('storeName') as string
  const storeId = localStorage.getItem('storeId') as string
  const vendorName = localStorage.getItem('vendorName') as string
  const vendorId = localStorage.getItem('vendor_id') as string
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [previewImage, setPreviewImage] = useState('')
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const vendorListRef = useRef<HTMLDivElement>(null) // Reference for vendor list container
  const poveuesiListRef = useRef<HTMLDivElement>(null) // Reference for vendor list container
  const apiUrl = process.env.REACT_APP_API_URL
  const apiChat = process.env.REACT_APP_WA_BACKEND_API_URL || process.env.REACT_APP_API_CHAT_URL || process.env.REACT_APP_API_URL || ''
  const agentSocketsEnabled = process.env.REACT_APP_ENABLE_CHAT_AGENT_SOCKETS === 'true'
  const socketsAllowed = (enableSockets && apiChat !== process.env.REACT_APP_API_CHAT_URL) || agentSocketsEnabled

  // Use a ref to hold the socket instance so we can initialize it only when apiChat is configured
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (!socketsAllowed) {
      console.info('Chat sockets disabled via flag or REACT_APP_API_CHAT_URL')
      return
    }
    // Determine socket base URL. If agentSocketsEnabled, prefer REACT_APP_API_URL fallback to apiChat
    const socketBase = agentSocketsEnabled ? (process.env.REACT_APP_API_URL || apiChat) : apiChat

    if (!socketBase) {
      console.warn('No socket base URL configured. Socket will not be initialized.')
      return
    }

    const url = socketBase.replace(/\/$/, '')
    socketRef.current = io(`${url}/live-chat`)

    const handleReceiveMessage = (msg: {sender: string; message: string; timestamp: any}) => {
      if (
        msg.sender !==
        (userRole === 'Owner Vendor'
          ? vendorName
          : userRole === 'Super User'
          ? 'Admin HO'
          : userRole === 'Store CS'
          ? storeName
          : userRole)
      ) {
        setNewMessages(true)
      }
      setMessages((prev) => [...prev, msg])
    }

    socketRef.current.on('receiveMessage', handleReceiveMessage)

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receiveMessage', handleReceiveMessage)
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiChat, socketsAllowed])

  useEffect(() => {
    if (messages.length > 0 && !isOpen) {
      setUnreadChats((prev: any) => {
        const lastChat = messages[messages.length - 1]
        if (!prev.includes(lastChat.sender)) {
          return [...prev, lastChat.sender]
        }
        return prev
      })
    }
  }, [messages, isOpen])

  const fetchVendors = async (page: number) => {
    setLoadingVendors(true)
    try {
      const ttype = chatType === 'vendor' ? 'vendor' : 'stores'
      let apiUrlWithParams = `${apiUrl}/${ttype}?order_by=desc&page=${page}&take=50` // Increased take to 50

      if (userRole === 'Store CS') {
        apiUrlWithParams += `&store_id=${storeId}`
      }

      if (userRole === 'Owner Vendor') {
        apiUrlWithParams += `&vendor_id=${vendorId}`
      }
      const res = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })

      if (res.data && res.data.data) {
        if (chatType === 'vendor') {
          setVendorList((prevList) => [...prevList, ...res.data.data])
        } else {
          setStoreList((prevList) => [...prevList, ...res.data.data])
        }
      }
    } catch (err) {
      console.error('Error fetching vendors:', err)
      alert('Gagal memuat daftar.')
    } finally {
      setLoadingVendors(false)
    }
  }

  const GetVendor = async () => {
    let apiUrlWithParams = `${apiUrl}/vendor?order_by=desc&page=1&take=50` // Increased take to 50
    if (userRole === 'Store CS') {
      apiUrlWithParams += `&store_id=${storeId}`
    }

    if (userRole === 'Owner Vendor') {
      apiUrlWithParams += `&vendor_id=${vendorId}`
    }

    if (searchQuery) {
      apiUrlWithParams += `&search=${searchQuery}`
    }
    const res = await axios.get(apiUrlWithParams, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      },
    })
    setVendorList(res.data.data)
  }
  const getStore = async () => {
    let apiUrlWithParams = `${apiUrl}/stores?order_by=desc&page=1&take=50` // Increased take to 50
    if (userRole === 'Owner Vendor') {
      apiUrlWithParams += `&vendor_id=${vendorId}`
    }
    if (searchQuery) {
      apiUrlWithParams += `&search=${searchQuery}`
    }
    const res = await axios.get(apiUrlWithParams, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        // // 'Access-Control-Allow-Origin': '*',
       // // 'ngrok-skip-browser-warning':  'true',
      },
    })

    setStoreList(res.data.data)
  }
  useEffect(() => {
    getStore()
    GetVendor()
  }, [searchQuery])
  // Handle scrolling behavior
  const handleScroll = () => {
    const container = vendorListRef.current
    if (container) {
      const bottom = container.scrollHeight === container.scrollTop + container.clientHeight
      if (bottom && !loadingVendors) {
        setPage((prevPage) => prevPage + 1) // Increment page number when scrolled to the bottom
        fetchVendors(page + 1)
      }
    }
  }

  const datasss = async () => {
    if (!apiChat) return
    try {
      const res = await axios.get(`${apiChat}/chat/organisasi/Mitra 10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      setOrganisasiId(res.data.groups._id)
      const timestamp = new Date()

      setMessages([
        {
          sender: 'Mitra 10',
          message: res.data.groups.description,
          timestamp,
        },
      ])
    } catch (err) {
      console.error('Failed to load organisasi data', err)
    }
  }
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      datasss()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleChatTypeSelection = async (option: string) => {
    setChatType(option)
    const timestamp = new Date()
    if (option === 'id') {
      setMessages((prev) => [
        ...prev,
        {sender: 'Mitra 10', message: 'Silakan isi Order ID Anda.', timestamp},
      ])
      setStep('orderId')
    } else if (option === 'ho') {
      await startChat('ho', {})
    } else if (option === 'vendor') {
      setLoadingVendors(true)
      try {
        setMessages([{sender: 'Mitra 10', message: 'Silakan pilih vendor:', timestamp}])
        setStep('vendor')
      } catch (err) {
        console.error(err)
        alert('Gagal memuat daftar vendor.')
      } finally {
        setLoadingVendors(false)
      }
    } else if (option === 'store') {
      setLoadingVendors(true)

      try {
        setMessages([{sender: 'Mitra 10', message: 'Silakan pilih store:', timestamp}])
        setStep('vendor')
      } catch (err) {
        console.error(err)
        alert('Gagal memuat daftar vendor.')
      } finally {
        setLoadingVendors(false)
      }
    } else if (option === 'previous') {
      setMessages((prev) => [
        ...prev,
        {sender: 'Mitra 10', message: 'Silakan pilih chat sebelumnya:', timestamp},
      ])
      fetchPreviousChats()
      setStep('previous')
    }
  }

  const startChat = async (type: string, datas: any) => {
    const timestamp = new Date()
    try {
      let payload: any = {}

      // Admin HO/Super User logic
      if (
        (userRole === 'Admin HO' || userRole === 'Super User') &&
        (type === 'store' || type === 'vendor' || type === 'id')
      ) {
        payload = {
          role_admin: 'Admin HO',
          role: userRole === 'Super User' ? 'Admin HO' : userRole,
          option: type,
        }

        if (type === 'vendor') {
          payload.vendor = {
            name: datas.company_name,
            id: datas.id,
          }
        } else if (type === 'store') {
          payload.store = {
            name: datas.store_name,
            id: datas.id,
          }
        }

        if (type === 'id') {
          // IMPORTANT: Pass orderId ke backend
          payload.orderId = orderId

          let apiUrlWithParams = `${apiUrl}/orders/${orderId}`
          const res = await axios.get(apiUrlWithParams, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
          })
          if (res.status === 200) {
            payload.store = {
              name: res.data.data.store.store_name,
              id: res.data.data.store_id,
            }
            payload.vendor = {
              name: res.data.data.vendor.company_name,
              id: res.data.data.vendor_id,
            }
          }
        }

        const res = await axios.post(`${apiChat}/chat/group/create-group`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        if (res.data.success) {
          const dataReciver = res.data.group.members.filter(
            (member: any) =>
              member !==
              (userRole === 'Owner Vendor'
                ? vendorName
                : userRole === 'Super User'
                ? 'Admin HO'
                : userRole === 'Store CS'
                ? storeName
                : userRole)
          )
          setReciver(dataReciver)
          setGroupId(res.data.groupId)
          setStep('chat')

          setMessages((prev) => [
            ...prev,
            {sender: 'Mitra 10', message: `Anda telah bergabung ke grup.`, timestamp},
          ])
          if (socketsAllowed && socketRef.current) socketRef.current.emit('joinGroup', res.data.groupId)
        } else {
          alert('Gagal memulai chat.')
        }
      } else if (userRole === 'Store CS' && (type === 'ho' || type === 'vendor' || type === 'id')) {
        let payload: any = {
          role_admin: 'Admin HO',
          role: userRole,
          option: type,
          store: storeName,
        }

        if (type === 'vendor') {
          payload.vendor = {
            name: datas.company_name,
            id: datas.id,
          }
        }

        if (type === 'id') {
          // IMPORTANT: Pass orderId ke backend
          payload.orderId = orderId

          let apiUrlWithParams = `${apiUrl}/orders/${orderId}`
          const res = await axios.get(apiUrlWithParams, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
          })
          if (res.status === 200) {
            if (parseInt(storeId) === res.data.data.store_id) {
              payload.vendor = {
                name: res.data.data.vendor.company_name,
                id: res.data.data.vendor_id,
              }
            } else {
              setMessages((prev) => [
                ...prev,
                {sender: 'Mitra 10', message: 'Order ID ini bukan Milik Anda.', timestamp},
              ])
              setMessages((prev) => [
                ...prev,
                {sender: 'Mitra 10', message: 'Silakan isi Order ID Anda.', timestamp},
              ])
              setStep('orderId')
            }
          }
        }
        const res = await axios.post(`${apiChat}/chat/group/create-group`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        if (res.data.success) {
          const dataReciver = res.data.group.members.filter(
            (member: any) =>
              member !==
              (userRole === 'Owner Vendor'
                ? vendorName
                : userRole === 'Super User'
                ? 'Admin HO'
                : userRole === 'Store CS'
                ? storeName
                : userRole)
          )
          setReciver(dataReciver)
          setGroupId(res.data.groupId)
          setStep('chat')
          setMessages((prev) => [
            ...prev,
            {sender: 'Mitra 10', message: `Anda telah bergabung ke grup.`, timestamp},
          ])
          if (socketsAllowed && socketRef.current) socketRef.current.emit('joinGroup', res.data.groupId)
        } else {
          alert('Gagal memulai chat.')
        }
      } else if (
        userRole === 'Owner Vendor' &&
        (type === 'ho' || type === 'store' || type === 'id')
      ) {
        payload = {
          role_admin: 'Admin HO',
          role: userRole,
          option: type,
          vendor: vendorName,
        }

        if (type === 'store') {
          payload.store = {
            name: datas.store_name,
            id: datas.id,
          }
        }

        if (type === 'id') {
          // IMPORTANT: Pass orderId ke backend
          payload.orderId = orderId

          let apiUrlWithParams = `${apiUrl}/orders/${orderId}`
          const res = await axios.get(apiUrlWithParams, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              // 'Access-Control-Allow-Origin': '*',
             // 'ngrok-skip-browser-warning':  'true',
            },
          })
          if (res.status === 200) {
            if (parseInt(vendorId) === res.data.data.vendor_id) {
              payload.store = {
                name: res.data.data.store.store_name,
                id: res.data.data.store_id,
              }
            } else {
              setMessages((prev) => [
                ...prev,
                {sender: 'Mitra 10', message: 'Order ID ini bukan Milik Anda.', timestamp},
              ])
              setMessages((prev) => [
                ...prev,
                {sender: 'Mitra 10', message: 'Silakan isi Order ID Anda.', timestamp},
              ])
              setStep('orderId')
              return
            }
          }
        }
        const res = await axios.post(`${apiChat}/chat/group/create-group`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        if (res.data.success) {
          const dataReciver = res.data.group.members.filter(
            (member: any) =>
              member !==
              (userRole === 'Owner Vendor'
                ? vendorName
                : userRole === 'Super User'
                ? 'Admin HO'
                : userRole === 'Store CS'
                ? storeName
                : userRole)
          )
          setReciver(dataReciver)
          setGroupId(res.data.groupId)
          setStep('chat')
          setMessages((prev) => [
            ...prev,
            {
              sender: 'Mitra 10',
              message: res.data.message || 'Anda telah bergabung ke grup baru.',
              timestamp,
            },
          ])
          if (socketsAllowed && socketRef.current) socketRef.current.emit('joinGroup', res.data.groupId)
        } else {
          alert('Gagal memulai chat.')
        }
      }
    } catch (err) {
      console.error('Error in startChat:', err)
      setMessages((prev) => [
        ...prev,
        {sender: 'Mitra 10', message: 'Terjadi kesalahan, silakan coba lagi.', timestamp},
      ])
      setMessages((prev) => [
        ...prev,
        {sender: 'Mitra 10', message: 'Silakan isi Order ID Anda.', timestamp},
      ])
      setStep('orderId')
    }
  }

  const resetChat = () => {
    setIsOpen(false)
    setStep('start')
    setMessage('')
    setMessages([])
    setOrderId('')
    setChatType('')
    setSearchQuery('')
    setGroupId('')
    setLoadingVendors(false)
    setNewMessages(false) // Reset new messages
    setUnreadCount(0) // Reset counter
  }

  const sendMessage = () => {
    const timestamp = new Date()
    let msg = {
      groupId,
      organisasi: 'Mitra 10',
      sender:
        userRole === 'Owner Vendor'
          ? vendorName
          : userRole === 'Super User'
          ? 'Admin HO'
          : userRole === 'Store CS'
          ? storeName
          : userRole,
      timestamp,
      receiver: reciver,
      message,
    }

    if (typeof message === 'string') {
      msg.message = message

      if (socketsAllowed && socketRef.current) socketRef.current.emit('sendMessage', msg)
      // Refresh lists so UI updates immediately even when sockets are off
      fetchPreviousChats()
      if (groupId) fetchMessagesForGroup(groupId)
    } else if (message.type === 'file') {
      const formData = new FormData()
      formData.append('file', message.file)

      axios
        .post(`${apiChat}/chat/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          msg.message = res.data.fileUrl // URL dari server setelah upload
          if (res.data.fileUrl && socketsAllowed && socketRef.current) {
            socketRef.current.emit('sendMessage', msg)
          }
          // After upload/send, refresh UI
          fetchPreviousChats()
          if (groupId) fetchMessagesForGroup(groupId)
        })
        .catch((err) => {
          console.error('Upload gagal', err)
        })
    } else {
      return
    }
    setMessage('')
  }

  const fetchPreviousChats = async () => {
    if (!apiChat) {
      console.error('REACT_APP_API_CHAT_URL not configured')
      return
    }

    try {
      const role =
        userRole === 'Admin HO'
          ? userRole
          : userRole === 'Super User'
          ? 'Admin HO'
          : userRole === 'Store CS'
          ? storeName
          : vendorName
      if (!localStorage.getItem('accessToken')) {
        console.warn('No access token present, skipping fetchPreviousChats')
        return
      }
      const res = await axios.get(`${apiChat}/chat/previousChats/${role}`)
      if (res.status === 200) {
        setPreviousChats(res.data.groups)
      }
    } catch (err) {
      console.error(err)
      alert('Gagal memuat chat sebelumnya.')
    }
  }

  // Polling when sockets are disabled: refresh previous chats and current conversation periodically
  // useEffect(() => {
  //   if (socketsAllowed) return // if sockets enabled, server will push updates

  //   // initial fetch
  //   fetchPreviousChats()

  //   const prevChatsInterval = setInterval(() => {
  //     fetchPreviousChats()
  //   }, 5000) // every 5s

  //   return () => clearInterval(prevChatsInterval)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [apiChat])

  // Poll messages for selected group when sockets are disabled
  useEffect(() => {
    if (socketsAllowed) return
    if (!groupId) return

    // fetch immediately
    fetchMessagesForGroup(groupId)

    const messagesInterval = setInterval(() => {
      fetchMessagesForGroup(groupId)
    }, 3000) // every 3s

    return () => clearInterval(messagesInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, apiChat])

  const handlePreviousChat = async (groupId: any) => {
    setGroupId(groupId)
    setSteps('riwayatChat')
    if (socketsAllowed && socketRef.current) socketRef.current.emit('joinGroup', groupId)
    await fetchMessagesForGroup(groupId)
    setUnreadChats((prev: any) => prev.filter((id: any) => id !== groupId))
  }

  // Fetch messages helper (separate from handlePreviousChat to allow polling without side-effects)
  async function fetchMessagesForGroup(groupId: any) {
    if (!apiChat) {
      console.error('REACT_APP_API_CHAT_URL not configured')
      return
    }
    try {
      if (!localStorage.getItem('accessToken')) {
        console.warn('No access token present, skipping fetchMessagesForGroup')
        return
      }
      const url = `${apiChat}/chat/messages/${groupId}`
      const res = await axios.get(url)
      if (res.status === 200) {
        setMessages(res.data)

        // Kurangi counter berdasarkan jumlah pesan yang dibaca dari grup ini
        const readCount = res.data.filter((msg: any) => {
          const currentUser =
            userRole === 'Owner Vendor'
              ? vendorName
              : userRole === 'Super User'
              ? 'Admin HO'
              : userRole === 'Store CS'
              ? storeName
              : userRole

          return msg.receiver?.some(
            (receiver: any) => receiver.user === currentUser && !receiver.read
          )
        }).length

        setUnreadCount((prev) => Math.max(0, prev - readCount))

        // IMPORTANT: Jangan ubah step jika sudah di 'previous'
        // Biarkan ChatPrevious component handle sendiri tampilan chat di kanan
        if (step !== 'previous') {
          setStep('chat') // Hanya ubah step jika dari auto-redirect
        }

        // Update read status di backend
        const currentUser =
          userRole === 'Owner Vendor'
            ? vendorName
            : userRole === 'Super User'
            ? 'Admin HO'
            : userRole === 'Store CS'
            ? storeName
            : userRole

        try {
          await axios.put(
            `${apiChat}/chat/status/${groupId}`,
            {sender: currentUser},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          )
        } catch (updateError) {
          console.error('Failed to update read status:', updateError)
        }
      } else {
        console.warn(`Unexpected response fetching conversation (${url}):`, res.status, res.data)
        setMessages([])
      }
    } catch (err: any) {
      if (err.response) {
        console.error(`Failed to fetch conversation detail. URL: ${apiChat}/chat/messages/${groupId} Status: ${err.response.status}`, err.response.data)
        if (err.response.status === 404) {
          Swal.fire({
            title: 'Conversation not found',
            text: 'Percakapan tidak ditemukan atau sudah dihapus.',
            icon: 'warning',
            timer: 2500,
            showConfirmButton: false,
          })
          setMessages([])
        } else if (err.response.status === 401) {
          console.warn('Unauthorized when fetching conversation detail')
        } else {
          console.error('Error response:', err.response.data)
        }
      } else {
        console.error('Failed to fetch conversation detail', err)
      }
    }
  }

  const handleDeleteChat = (id: any) => {
    Swal.fire({
      title: 'Kamu Yakin Menghapus Chat ini?',
      text: 'Data Chat Akan Terhapus Selamanya!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.delete(`${apiChat}/chat/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        if (res.status === 200) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            icon: 'success',
          })
          fetchPreviousChats()
        }
      }
    })
  }
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [messageToEdit, setMessageToEdit] = useState<string>('')
  const [messageIndexToEdit, setMessageIndexToEdit] = useState<number | null>(null)

  const handleEditMessage = () => {
    setIsEditModalOpen(true)
  }

  const handleSaveEditedMessage = async (newMessage: string) => {
    if (!apiChat) return
    const res = await axios.post(
      `${apiChat}/chat/organisasi/`,
      {
        id: organisasiId,
        deskripsi: newMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    )
    resetChat()
  }

  const fetchNewChats = async () => {
    
    let unreadCounter = 0
    if (!apiChat) {
      console.error('REACT_APP_API_CHAT_URL not configured')
      return
    }

    if (!localStorage.getItem('accessToken')) {
      console.warn('No access token present, skipping fetchNewChats')
      return
    }

    // helper with retries for transient network errors
    const fetchWithRetry = async (url: string, retries = 2, delayMs = 1000) => {
      let attempt = 0
      while (attempt <= retries) {
        try {
          // use absolute URL; axios instance will honor full URL
          const res = await axios.get(url)
          return res
        } catch (err: any) {
          attempt++
          // If it's not a network error, rethrow
          const isNetworkError = !err.response
          console.warn(`fetchNewChats attempt ${attempt} failed`, err.message || err)
          if (!isNetworkError) throw err
          if (attempt > retries) throw err
          // exponential backoff
          await new Promise((r) => setTimeout(r, delayMs * attempt))
        }
      }
    }

    try {
      const url = `${apiChat.replace(/\/$/, '')}/chat/messages`
      const res = await fetchWithRetry(url, 3, 1000)

      if (res && res.data && res.data.length > 0) {
        const hasNewMessages = res.data.some((chat: any) => {
          let currentUser: string

          switch (userRole) {
            case 'Owner Vendor':
              currentUser = vendorName
              break
            case 'Super User':
              currentUser = 'Admin HO'
              break
            case 'Store CS':
              currentUser = storeName
              break
            default:
              currentUser = userRole
          }

          return chat.receiver && Array.isArray(chat.receiver) && chat.receiver.some(
            (receiver: any) => receiver.user === currentUser && !receiver.read
          ).length

          // Hitung jumlah pesan yang belum dibaca untuk user ini
          const unreadForUser = chat.receiver.filter(
            (receiver: any) => receiver.user === currentUser && !receiver.read
          ).length
          unreadCounter += unreadForUser
        })

        setNewMessages(!!hasNewMessages)
      } else {
        setNewMessages(false)
        setUnreadCount(0)
      }
    } catch (err: any) {
      // Provide clearer debug info for network errors
      if (!err.response) {
        console.error('Failed to fetch new chats: Network Error. Endpoint:', `${apiChat}/chat/messages`, err.message || err)
      } else {
        console.error('Failed to fetch new chats', err)
      }
      // schedule a retry later
      setTimeout(() => {
        try { fetchNewChats() } catch (_) {}
      }, 5000)
    }
  }
  useEffect(() => {
    fetchNewChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const NotificationBadge = ({count}: {count: number}) => {
    if (count === 0) return null

    return (
      <span
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-2px',
          backgroundColor: 'red',
          color: 'white',
          borderRadius: '50%',
          padding: count > 99 ? '3px 6px' : '5px',
          minWidth: '20px',
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: count > 99 ? '10px' : '12px',
          zIndex: 999,
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          fontWeight: 'bold',
        }}
      >
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  const debugExistingGroups = async () => {
    try {
      const currentUser =
        userRole === 'Owner Vendor'
          ? vendorName
          : userRole === 'Super User'
          ? 'Admin HO'
          : userRole === 'Store CS'
          ? storeName
          : userRole

      const res = await axios.get(`${apiChat}/chat/groups/member/${currentUser}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      console.log("User's existing groups:", res.data.groups)
      return res.data.groups
    } catch (error) {
      console.error('Error fetching user groups:', error)
      return []
    }
  }
  const debugSearchGroups = async (members: string[]) => {
    try {
      const memberString = members.join(',')
      const res = await axios.get(
        `${apiChat}/chat/groups/search?members=${encodeURIComponent(memberString)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      console.log(`Groups with members [${memberString}]:`, res.data.groups)
      return res.data.groups
    } catch (error) {
      console.error('Error searching groups:', error)
      return []
    }
  }

  const handleChatError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error)

    const timestamp = new Date()
    setMessages((prev) => [
      ...prev,
      {
        sender: 'Mitra 10',
        message: `Terjadi kesalahan saat ${context}. Silakan coba lagi.`,
        timestamp,
      },
    ])
  }
  return (
    <div>
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        {isOpen === false && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {/* Ganti badge lama dengan NotificationBadge component */}
            <NotificationBadge count={unreadCount} />

            <Button
              onClick={() => {
                if (isOpen) {
                  resetChat()
                } else {
                  if (newMessages) {
                    setIsOpen(true)
                    handleChatTypeSelection('previous')
                    setNewMessages(false)
                    // Jangan reset unreadCount di sini, biarkan reset ketika chat benar-benar dibaca
                  } else {
                    setIsOpen(true)
                  }
                }
              }}
              style={{
                padding: '10px',
                backgroundColor: isOpen ? 'transparent' : '#0F4CFF',
                color: isOpen ? 'black' : 'white',
                borderRadius: isOpen ? '0' : '20px',
                border: isOpen ? 'none' : 'none',
                cursor: 'pointer',
                boxShadow: isOpen ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.2)',
                fontSize: '15px',
                position: 'relative',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={faComment} size='lg' className='text-white mx-1' />
              <span className='mx-1'>Live Chat</span>
            </Button>
          </div>
        )}

        {isOpen && (
          <div
            style={{
              width: step === 'previous' ? '900px' : '300px',
              height: '550px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                padding: '10px',
                backgroundColor: '#020080',
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                display: 'flex', // Untuk membuat layout fleksibel
                alignItems: 'center',
                justifyContent: 'space-between', // Memberi ruang antara ikon dan judul
                position: 'relative', // Dibutuhkan untuk dropdown
              }}
            >
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                {step !== 'start' && (
                  <Button
                    variant='link'
                    onClick={() => {
                      setStep('start')
                      setMessages([])
                      setGroupId('')
                    }}
                    style={{color: 'white'}}
                  >
                    Back
                  </Button>
                )}
                <div style={{marginLeft: 10}}>Live Chat</div>
              </div>

              <div style={{display: 'flex', alignItems: 'center'}}>
                <Button
                  variant='link'
                  onClick={() => {
                    setIsOpen(false)
                  }}
                  style={{color: 'white'}}
                >
                  Close
                </Button>
              </div>
            </div>

            <div style={{display: 'flex', flex: 1}}>
              {step === 'start' && (
                <ChatStart handleChatTypeSelection={handleChatTypeSelection} userRole={userRole} handleEditMessage={handleEditMessage} />
              )}
              {step === 'vendor' && (
                <ChatVendor
                  vendorList={vendorList}
                  loadingVendors={loadingVendors}
                  startChat={(type: string, datas: any) => startChat(type, datas)}
                  chatType={chatType}
                  vendorListRef={vendorListRef}
                  handleScroll={handleScroll}
                  setSearchQuery={setSearchQuery}
                  searchQuery={searchQuery}
                  StoreList={StoreList}
                />
              )}
              {step === 'orderId' && (
                <ChatOrderId
                  orderId={orderId}
                  setOrderId={setOrderId}
                  startChat={(type: string, id: string) => startChat(type, id)}
                />
              )}
              {step === 'previous' && (
                <ChatPrevious
                  previousChats={previousChats}
                  handlePreviousChat={handlePreviousChat}
                  handleDeleteChat={handleDeleteChat}
                  unreadChats={unreadChats}
                  userRole={userRole}
                  messages={messages}
                  message={message}
                  setMessage={setMessage}
                  sendMessage={sendMessage}
                  vendorName={vendorName}
                  fetchNewChats={fetchNewChats}
                  storeName={storeName}
                  setReciver={setReciver}
                />
              )}
              {step === 'chat' && (
                <ChatActive
                  messages={messages}
                  message={message}
                  setMessage={setMessage}
                  sendMessage={sendMessage}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)}>
        <EditMessageModal
          isOpen={isEditModalOpen}
          message={messageToEdit}
          onSave={handleSaveEditedMessage}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
