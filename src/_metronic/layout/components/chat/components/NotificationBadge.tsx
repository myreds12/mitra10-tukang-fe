import React from 'react'

interface NotificationBadgeProps {
  count: number
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({count}) => {
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

export default NotificationBadge
