import React, { useState, useCallback } from 'react'
import AsyncSelect from 'react-select/async'
import { Room, Store, Vendor } from '../types'
import { api } from '../liveChatApi'
import { normalizeLiveChatRoom } from '../roomDisplay'

interface CreateModalProps {
  token: string
  onClose: () => void
  onCreated: (room: Room) => void
}

export const CreateModal: React.FC<CreateModalProps> = ({ token, onClose, onCreated }) => {
  const [step, setStep] = useState<null | 'order' | 'store' | 'vendor'>(null)
  const [orderId, setOrderId] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allStores, setAllStores] = useState<Store[]>([])
  const [allVendors, setAllVendors] = useState<Vendor[]>([])
  const [loadingList, setLoadingList] = useState(false)

  const getStoreOptions = (inputValue: string) =>
    allStores
      .filter((s) => s.store_name.toLowerCase().includes(inputValue.toLowerCase()))
      .map((s) => ({ value: String(s.id), label: s.store_name }))

  const getVendorOptions = (inputValue: string) =>
    allVendors
      .filter((v) => v.company_name.toLowerCase().includes(inputValue.toLowerCase()))
      .map((v) => ({ value: String(v.id), label: v.company_name }))

  const loadStoresIfNeeded = useCallback(() => {
    if (allStores.length === 0) {
      setLoadingList(true)
      api
        .getStores(token, '')
        .then((r: any) => {
          setAllStores((r.data || []) as Store[])
        })
        .catch(() => {})
        .finally(() => setLoadingList(false))
    }
  }, [allStores.length, token])

  const loadVendorsIfNeeded = useCallback(() => {
    if (allVendors.length === 0) {
      setLoadingList(true)
      api
        .getVendors(token, '')
        .then((r: any) => {
          setAllVendors((r.data || []) as Vendor[])
        })
        .catch(() => {})
        .finally(() => setLoadingList(false))
    }
  }, [allVendors.length, token])

  const goStore = () => {
    setStep('store')
    setSelectedStore('')
    setError('')
    loadStoresIfNeeded()
  }

  const goVendor = () => {
    setStep('vendor')
    setSelectedVendor('')
    setError('')
    loadVendorsIfNeeded()
  }

  const canSubmit = () => {
    if (step === 'order') return orderId.trim().length > 0
    if (step === 'store') return selectedStore !== ''
    if (step === 'vendor') return selectedVendor !== ''
    return false
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      let res: any
      let fallbackStoreName: string | undefined
      let fallbackVendorName: string | undefined

      if (step === 'order') {
        res = await api.createRoom(token, orderId.trim())
      } else if (step === 'store') {
        res = await api.createDirectStore(token, selectedStore)
        if (res?.success) {
          const storeData = allStores.find((s: Store) => String(s.id) === selectedStore)
          fallbackStoreName = storeData?.store_name
        }
      } else if (step === 'vendor') {
        res = await api.createDirectVendor(token, selectedVendor)
        if (res?.success) {
          const vendorData = allVendors.find((v: Vendor) => String(v.id) === selectedVendor)
          fallbackVendorName = vendorData?.company_name
        }
      }

      if (res?.success) {
        const createdRoom = normalizeLiveChatRoom(res.data || {}, {
          fallbackType:
            step === 'store' ? 'DIRECT_STORE' : step === 'vendor' ? 'DIRECT_VENDOR' : 'ORDER',
          fallbackStoreId: step === 'store' ? selectedStore : undefined,
          fallbackStoreName,
          fallbackVendorId: step === 'vendor' ? selectedVendor : undefined,
          fallbackVendorName,
        }) as Room
        onCreated(createdRoom)
        onClose()
      } else setError(res?.message || 'Gagal membuat room')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.46)',
        backdropFilter: 'blur(6px)',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: 20,
          width: '92%',
          maxWidth: 360,
          border: '1px solid #dbe7f5',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.26)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid #e7eef7',
            background: 'linear-gradient(180deg, #f5faff 0%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: '#102a43' }}>
            {!step
              ? 'Mulai Chat'
              : step === 'order'
              ? 'Chat Order'
              : step === 'store'
              ? 'Chat Store'
              : 'Chat Vendor'}
          </span>
          <button
            className='btn btn-sm btn-icon'
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#f4f7fb',
              border: '1px solid #d7e3f0',
              color: '#486581',
            }}
          >
            <i className='bi bi-x fs-5' />
          </button>
        </div>

        <div style={{ padding: 18, background: '#fbfdff' }}>
          {!step && (
            <div className='d-flex flex-column gap-2'>
              {[
                {
                  icon: 'bi-box-seam',
                  label: 'Berdasarkan Order',
                  sub: 'Masukkan Order ID',
                  action: () => setStep('order'),
                },
                {
                  icon: 'bi-shop',
                  label: 'Chat dengan Store',
                  sub: 'Pilih dari daftar store',
                  action: () => goStore(),
                },
                {
                  icon: 'bi-truck',
                  label: 'Chat dengan Vendor',
                  sub: 'Pilih dari daftar vendor',
                  action: () => goVendor(),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className='btn text-start d-flex align-items-center gap-3 p-3'
                  style={{
                    border: '1px solid #d8e5f2',
                    borderRadius: 14,
                    background: '#ffffff',
                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #eaf5ff, #dceeff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${item.icon}`} style={{ color: '#0f63ff', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#102a43' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7c93' }}>{item.sub}</div>
                  </div>
                  <i className='bi bi-chevron-right text-muted ms-auto' />
                </button>
              ))}
            </div>
          )}

          {step === 'order' && (
            <div>
              <label className='form-label fw-bold fs-7'>Order ID</label>
              <input
                className='form-control form-control-sm'
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canSubmit() && handleSubmit()}
                placeholder='Contoh: 12345'
                autoFocus
              />
            </div>
          )}

          {step === 'store' && (
            <div>
              <label className='form-label fw-bold fs-7'>Pilih Store</label>
              {loadingList ? (
                <div className='text-center py-3 text-muted'>
                  <span className='spinner-border spinner-border-sm me-2' />
                  Memuat...
                </div>
              ) : (
                <AsyncSelect
                  placeholder='Ketik untuk mencari store...'
                  loadOptions={(input) => Promise.resolve(getStoreOptions(input))}
                  defaultOptions={true}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue ? 'Store tidak ditemukan' : 'Ketik nama store'
                  }
                  onChange={(opt: any) => setSelectedStore(opt ? opt.value : '')}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      borderColor: '#d7e3f0',
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      zIndex: 9999,
                    }),
                  }}
                />
              )}
            </div>
          )}

          {step === 'vendor' && (
            <div>
              <label className='form-label fw-bold fs-7'>Pilih Vendor</label>
              {loadingList ? (
                <div className='text-center py-3 text-muted'>
                  <span className='spinner-border spinner-border-sm me-2' />
                  Memuat...
                </div>
              ) : (
                <AsyncSelect
                  placeholder='Ketik untuk mencari vendor...'
                  loadOptions={(input) => Promise.resolve(getVendorOptions(input))}
                  defaultOptions={true}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue ? 'Vendor tidak ditemukan' : 'Ketik nama vendor'
                  }
                  onChange={(opt: any) => setSelectedVendor(opt ? opt.value : '')}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      borderColor: '#d7e3f0',
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: 10,
                      fontSize: 13,
                      zIndex: 9999,
                    }),
                  }}
                />
              )}
            </div>
          )}

          {error && step && <div className='alert alert-danger mt-3 py-2 fs-8'>{error}</div>}
        </div>

        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid #e7eef7',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            background: '#ffffff',
          }}
        >
          {step ? (
            <>
              <button
                className='btn btn-sm'
                onClick={() => {
                  setStep(null)
                  setError('')
                  setSelectedStore('')
                  setSelectedVendor('')
                }}
                style={{
                  minWidth: 108,
                  borderRadius: 10,
                  background: '#eef4ff',
                  border: '1px solid #cfe0ff',
                  color: '#0f63ff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  fontSize: 0,
                }}
              >
                <i className='bi bi-arrow-left-short' style={{ fontSize: 16 }} />
                <span style={{ fontSize: 12 }}>Kembali</span>
              </button>
              <button
                className='btn btn-sm btn-primary'
                onClick={handleSubmit}
                disabled={loading || !canSubmit()}
                style={{
                  minWidth: 116,
                  borderRadius: 10,
                  fontWeight: 600,
                  boxShadow: '0 10px 24px rgba(15, 99, 255, 0.22)',
                }}
              >
                {loading ? <span className='spinner-border spinner-border-sm me-1' /> : null}
                Mulai Chat
              </button>
            </>
          ) : (
            <button
              className='btn btn-sm'
              onClick={onClose}
              style={{
                borderRadius: 10,
                background: '#f4f7fb',
                border: '1px solid #d7e3f0',
                color: '#486581',
                fontWeight: 600,
              }}
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
