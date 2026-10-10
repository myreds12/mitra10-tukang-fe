/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useState, useEffect, useRef, useCallback} from 'react'
import Swal from 'sweetalert2'
import ChatStart from './ChatStart'
import ChatVendor from './ChatVendor'
import ChatOrderId from './ChatOrderId'
import ChatActive from './ChatActive'
import ChatPrevious from './ChatPrevious'
import EditMessageModal from './EditMessageModal'
import {Button, Modal} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faComment} from '@fortawesome/free-solid-svg-icons'
import {ChatMessage, VendorItem, StoreItem, ChatStep} from './types'
import {
  getCurrentUser,
  fetchVendorsOrStores,
  searchVendorApi,
  searchStoreApi,
  fetchOrganisasiApi,
  uploadChatFileApi,
  fetchPreviousChatsApi,
  fetchMessagesForGroupApi,
  updateChatStatusApi,
  deleteChatApi,
  updateOrganisasiApi,
  fetchNewChatsWithRetryApi,
} from './services/chatService'
import {executeStartChat} from './services/chatStartHelper'
import {useChatSocket} from './hooks/useChatSocket'
import NotificationBadge from './components/NotificationBadge'

export default function ChatPage(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [step, setStep] = useState<ChatStep>('start')
  const [steps, setSteps] = useState<string>('')
  const [message, setMessage] = useState<any>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [orderId, setOrderId] = useState<string>('')
  const [chatType, setChatType] = useState<string>('')
  const [groupId, setGroupId] = useState<string>('')
  const [reciver, setReciver] = useState<any>([])
  const [organisasiId, setOrganisasiId] = useState<string>('')
  const [vendorList, setVendorList] = useState<VendorItem[]>([])
  const [StoreList, setStoreList] = useState<StoreItem[]>([])
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false)
  const [previousChats, setPreviousChats] = useState<any>([])
  const [page, setPage] = useState(1)
  const [newMessages, setNewMessages] = useState<boolean>(false)
  const [unreadChats, setUnreadChats] = useState<any>([])
  const userRole = localStorage.getItem('userRole') as any
  const storeName = localStorage.getItem('storeName') as string
  const storeId = localStorage.getItem('storeId') as string
  const vendorName = localStorage.getItem('vendorName') as string
  const vendorId = localStorage.getItem('vendor_id') as string
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const vendorListRef = useRef<HTMLDivElement>(null)

  const apiUrl = process.env.REACT_APP_API_URL || ''
  const apiChat =
    process.env.REACT_APP_WA_BACKEND_API_URL ||
    process.env.REACT_APP_API_CHAT_URL ||
    process.env.REACT_APP_API_URL ||
    ''

  const currentUser = getCurrentUser(userRole, vendorName, storeName)

  const handleReceiveMessage = useCallback(
    (msg: ChatMessage) => {
      if (msg.sender !== currentUser) {
        setNewMessages(true)
      }
      setMessages((prev) => [...prev, msg])
    },
    [currentUser]
  )

  const {socketsAllowed, emitJoinGroup, emitSendMessage} = useChatSocket({
    apiChat,
    currentUser,
    onReceiveMessage: handleReceiveMessage,
  })

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

  const fetchVendors = async (pageNumber: number) => {
    setLoadingVendors(true)
    try {
      const res = await fetchVendorsOrStores(
        apiUrl,
        pageNumber,
        chatType,
        userRole,
        storeId,
        vendorId
      )
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
    try {
      const res = await searchVendorApi(apiUrl, userRole, storeId, vendorId, searchQuery)
      setVendorList(res.data?.data || [])
    } catch (err) {
      console.error('Error search vendors:', err)
    }
  }

  const getStore = async () => {
    try {
      const res = await searchStoreApi(apiUrl, userRole, vendorId, searchQuery)
      setStoreList(res.data?.data || [])
    } catch (err) {
      console.error('Error search stores:', err)
    }
  }

  useEffect(() => {
    getStore()
    GetVendor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleScroll = () => {
    const container = vendorListRef.current
    if (container) {
      const bottom = container.scrollHeight === container.scrollTop + container.clientHeight
      if (bottom && !loadingVendors) {
        setPage((prevPage) => prevPage + 1)
        fetchVendors(page + 1)
      }
    }
  }

  const loadOrganisasiData = async () => {
    if (!apiChat) return
    try {
      const res = await fetchOrganisasiApi(apiChat)
      setOrganisasiId(res.data?.groups?._id)
      const timestamp = new Date()
      setMessages([
        {
          sender: 'Mitra 10',
          message: res.data?.groups?.description,
          timestamp,
        },
      ])
    } catch (err) {
      console.error('Failed to load organisasi data', err)
    }
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadOrganisasiData()
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
      const result = await executeStartChat({
        type,
        datas,
        orderId,
        userRole,
        vendorName,
        vendorId,
        storeName,
        storeId,
        apiUrl,
        apiChat,
      })

      if (result.invalidOrder) {
        setMessages((prev) => [
          ...prev,
          {sender: 'Mitra 10', message: 'Order ID ini bukan Milik Anda.', timestamp},
          {sender: 'Mitra 10', message: 'Silakan isi Order ID Anda.', timestamp},
        ])
        setStep('orderId')
        return
      }

      if (result.success && result.groupId) {
        setReciver(result.receiver || [])
        setGroupId(result.groupId)
        setStep('chat')
        setMessages((prev) => [
          ...prev,
          {
            sender: 'Mitra 10',
            message: result.message || 'Anda telah bergabung ke grup.',
            timestamp,
          },
        ])
        emitJoinGroup(result.groupId)
      } else {
        alert('Gagal memulai chat.')
      }
    } catch (err) {
      console.error('Error in startChat:', err)
      setMessages((prev) => [
        ...prev,
        {sender: 'Mitra 10', message: 'Terjadi kesalahan, silakan coba lagi.', timestamp},
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
    setNewMessages(false)
    setUnreadCount(0)
  }

  const sendMessage = () => {
    const timestamp = new Date()
    const msg = {
      groupId,
      organisasi: 'Mitra 10',
      sender: currentUser,
      timestamp,
      receiver: reciver,
      message,
    }

    if (typeof message === 'string') {
      msg.message = message
      emitSendMessage(msg)
      fetchPreviousChats()
      if (groupId) fetchMessagesForGroup(groupId)
    } else if (message?.type === 'file') {
      uploadChatFileApi(apiChat, message.file)
        .then((res) => {
          msg.message = res.data.fileUrl
          if (res.data.fileUrl) {
            emitSendMessage(msg)
          }
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
      const res = await fetchPreviousChatsApi(apiChat, role)
      if (res.status === 200) {
        setPreviousChats(res.data.groups)
      }
    } catch (err) {
      console.error(err)
      alert('Gagal memuat chat sebelumnya.')
    }
  }

  useEffect(() => {
    if (socketsAllowed || !groupId) return

    fetchMessagesForGroup(groupId)
    const messagesInterval = setInterval(() => {
      fetchMessagesForGroup(groupId)
    }, 3000)

    return () => clearInterval(messagesInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, apiChat, socketsAllowed])

  const handlePreviousChat = async (selectedGroupId: string) => {
    setGroupId(selectedGroupId)
    setSteps('riwayatChat')
    emitJoinGroup(selectedGroupId)
    await fetchMessagesForGroup(selectedGroupId)
    setUnreadChats((prev: any) => prev.filter((id: any) => id !== selectedGroupId))
  }

  async function fetchMessagesForGroup(targetGroupId: string) {
    if (!apiChat) {
      console.error('REACT_APP_API_CHAT_URL not configured')
      return
    }
    try {
      if (!localStorage.getItem('accessToken')) {
        console.warn('No access token present, skipping fetchMessagesForGroup')
        return
      }
      const res = await fetchMessagesForGroupApi(apiChat, targetGroupId)
      if (res.status === 200) {
        setMessages(res.data)

        const readCount = res.data.filter((msgItem: any) => {
          return msgItem.receiver?.some(
            (receiverItem: any) => receiverItem.user === currentUser && !receiverItem.read
          )
        }).length

        setUnreadCount((prev) => Math.max(0, prev - readCount))

        if (step !== 'previous') {
          setStep('chat')
        }

        try {
          await updateChatStatusApi(apiChat, targetGroupId, currentUser)
        } catch (updateError) {
          console.error('Failed to update read status:', updateError)
        }
      } else {
        setMessages([])
      }
    } catch (err: any) {
      if (err.response) {
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
        const res = await deleteChatApi(apiChat, id)
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

  const handleEditMessage = () => {
    setIsEditModalOpen(true)
  }

  const handleSaveEditedMessage = async (newMessage: string) => {
    if (!apiChat) return
    await updateOrganisasiApi(apiChat, organisasiId, newMessage)
    resetChat()
  }

  const fetchNewChats = async () => {
    if (!apiChat || !localStorage.getItem('accessToken')) return

    try {
      const res = await fetchNewChatsWithRetryApi(apiChat, 3, 1000)
      if (res && res.data && res.data.length > 0) {
        const hasNew = res.data.some((chat: any) => {
          return (
            chat.receiver &&
            Array.isArray(chat.receiver) &&
            chat.receiver.some(
              (rcv: any) => rcv.user === currentUser && !rcv.read
            )
          )
        })
        setNewMessages(!!hasNew)
      } else {
        setNewMessages(false)
        setUnreadCount(0)
      }
    } catch (err: any) {
      if (!err.response) {
        console.error('Failed to fetch new chats: Network Error', err.message || err)
      } else {
        console.error('Failed to fetch new chats', err)
      }
      setTimeout(() => {
        try {
          fetchNewChats()
        } catch (_) {}
      }, 5000)
    }
  }

  useEffect(() => {
    fetchNewChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        {!isOpen && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
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
                border: 'none',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
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
                  onClick={() => setIsOpen(false)}
                  style={{color: 'white'}}
                >
                  Close
                </Button>
              </div>
            </div>

            <div style={{display: 'flex', flex: 1}}>
              {step === 'start' && (
                <ChatStart
                  handleChatTypeSelection={handleChatTypeSelection}
                  userRole={userRole}
                  handleEditMessage={handleEditMessage}
                />
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
