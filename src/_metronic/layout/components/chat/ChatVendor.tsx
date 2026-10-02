import React from 'react'

interface Vendor {
  id: string
  company_name?: string
  store_name?: string
}

interface ChatVendorProps {
  vendorList: Vendor[]
  loadingVendors: boolean
  startChat: (chatType: string, vendor: Vendor) => void
  chatType: string
  vendorListRef: any
  setSearchQuery: any
  searchQuery: any
  StoreList: Vendor[]
  handleScroll: () => void
}

const ChatVendor: React.FC<ChatVendorProps> = ({
  vendorList,
  loadingVendors,
  startChat,
  chatType,
  vendorListRef,
  handleScroll,
  setSearchQuery,
  searchQuery,
  StoreList,
}) => {
  const data = chatType === 'vendor' ? vendorList : StoreList
  return (
    <div style={{padding: '10px', borderTop: '1px solid #ccc'}}>
      {loadingVendors ? (
        <div>Loading vendor list...</div>
      ) : (
        <>
          {/* Search input */}
          <input
            type='text'
            placeholder='Search by name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px',
              marginBottom: '10px',
              width: '100%',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />

          {/* Vendor list with scroll */}
          <div
            style={{maxHeight: '200px', overflowY: 'auto'}}
            ref={vendorListRef}
            onScroll={handleScroll}
          >
            {data.length === 0 ? (
              <div>No vendors found</div>
            ) : (
              data.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => startChat(chatType, vendor)}
                  style={buttonStyle}
                >
                  {chatType === 'vendor' ? vendor.company_name : vendor.store_name}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: 'white',
  color: '#020080f',
  border: '1px solid #020080',
  marginBottom: '10px',
  borderColor: '#020080',
  cursor: 'pointer',
}

export default ChatVendor
