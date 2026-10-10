import React from 'react'
import { MediaViewerModal } from './MediaViewerModal'
import { MediaPreview } from '../types'

interface MediaPreviewOverlayProps {
  media: MediaPreview
  onClose: () => void
}

export const MediaPreviewOverlay: React.FC<MediaPreviewOverlayProps> = ({ media, onClose }) => {
  return <MediaViewerModal media={media} onClose={onClose} />
}
