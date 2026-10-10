import {useEffect, useRef} from 'react'
import io from 'socket.io-client'

interface UseChatSocketProps {
  apiChat: string
  currentUser: string
  onReceiveMessage: (msg: {sender: string; message: string; timestamp: any}) => void
}

export const useChatSocket = ({apiChat, currentUser, onReceiveMessage}: UseChatSocketProps) => {
  const enableSockets = process.env.REACT_APP_ENABLE_CHAT_SOCKETS === 'true'
  const agentSocketsEnabled = process.env.REACT_APP_ENABLE_CHAT_AGENT_SOCKETS === 'true'
  const socketsAllowed =
    (enableSockets && apiChat !== process.env.REACT_APP_API_CHAT_URL) || agentSocketsEnabled

  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (!socketsAllowed) {
      console.info('Chat sockets disabled via flag or REACT_APP_API_CHAT_URL')
      return
    }

    const socketBase = agentSocketsEnabled ? process.env.REACT_APP_API_URL || apiChat : apiChat

    if (!socketBase) {
      console.warn('No socket base URL configured. Socket will not be initialized.')
      return
    }

    const url = socketBase.replace(/\/$/, '')
    socketRef.current = io(`${url}/live-chat`)

    const handleReceive = (msg: {sender: string; message: string; timestamp: any}) => {
      onReceiveMessage(msg)
    }

    socketRef.current.on('receiveMessage', handleReceive)

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receiveMessage', handleReceive)
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiChat, socketsAllowed, currentUser])

  const emitJoinGroup = (groupId: string) => {
    if (socketsAllowed && socketRef.current) {
      socketRef.current.emit('joinGroup', groupId)
    }
  }

  const emitSendMessage = (msg: any) => {
    if (socketsAllowed && socketRef.current) {
      socketRef.current.emit('sendMessage', msg)
    }
  }

  return {
    socketRef,
    socketsAllowed,
    emitJoinGroup,
    emitSendMessage,
  }
}
