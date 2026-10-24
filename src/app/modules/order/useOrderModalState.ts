import {useState} from 'react'

export const useOrderModalState = () => {
  const [loadingModal, setLoadingModal] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<number | null>(null)
  const [activeKey, setActiveKey] = useState(1)

  const openModal = (type: number) => {
    setModalType(type)
    setShowModal(true)
  }

  const closeModal = () => setShowModal(false)

  return {
    loadingModal,
    setLoadingModal,
    showModal,
    modalType,
    activeKey,
    setActiveKey,
    openModal,
    closeModal,
  }
}
