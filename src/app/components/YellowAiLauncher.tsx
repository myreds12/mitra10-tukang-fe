import React, {useState, useEffect} from 'react'
import {toggleYellowChat} from '../utils/yellowMessenger'

export const YellowAiLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const publicUrl = process.env.PUBLIC_URL || ''

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const eventCode = event.data?.event_code || event.data?.event
        if (
          eventCode === 'ym-client-chat-opened' ||
          eventCode === 'chat-opened' ||
          eventCode === 'open'
        ) {
          setIsOpen(true)
        } else if (
          eventCode === 'ym-client-chat-closed' ||
          eventCode === 'chat-closed' ||
          eventCode === 'close'
        ) {
          setIsOpen(false)
        }
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <button
      id='yellow-ai-custom-launcher'
      className={`yellow-ai-custom-launcher ${isOpen ? 'is-chat-open' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleYellowChat()
      }}
      title='Live Chat CS Mitra10'
      aria-label='Live Chat CS Mitra10'
      type='button'
    >
      <img
        src={`${publicUrl}/media/livechat-yellow-ai.png`}
        alt='Live Chat Mitra10'
        draggable={false}
      />
    </button>
  )
}
