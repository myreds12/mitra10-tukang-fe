import { useState, useCallback } from 'react'
import axios from 'axios'

export interface VendorSPInfo {
  vendor_id: number
  vendor_name: string
  sp_level: number | null
  sp_status: string | null
  total_point: number | null
  allocation_reduction: number | null
  has_active_sp: boolean
}

interface UseVendorSPCheckReturn {
  spInfo: VendorSPInfo | null
  loading: boolean
  error: string | null
  checkVendorSP: (vendorId: number) => Promise<VendorSPInfo | null>
  resetSPInfo: () => void
}

export const useVendorSPCheck = (): UseVendorSPCheckReturn => {
  const [spInfo, setSpInfo] = useState<VendorSPInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkVendorSP = useCallback(async (vendorId: number): Promise<VendorSPInfo | null> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/vendor-sp/check/${vendorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.has_active_sp) {
        const spData: VendorSPInfo = {
          vendor_id: vendorId,
          vendor_name: response.data.vendor?.company_name || 'Unknown',
          sp_level: response.data.sp_level,
          sp_status: response.data.sp_status,
          total_point: response.data.total_point,
          allocation_reduction: response.data.allocation_reduction,
          has_active_sp: true,
        }
        setSpInfo(spData)
        return spData
      } else {
        setSpInfo(null)
        return null
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengecek status SP vendor')
      setSpInfo(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const resetSPInfo = useCallback(() => {
    setSpInfo(null)
    setError(null)
  }, [])

  return {
    spInfo,
    loading,
    error,
    checkVendorSP,
    resetSPInfo,
  }
}

// Example usage in a component:
//
// const VendorAllocationButton: React.FC = () => {
//   const { spInfo, checkVendorSP, resetSPInfo } = useVendorSPCheck()
//   const [showWarning, setShowWarning] = useState(false)
//
//   const handleAllocateOrder = async (vendorId: number) => {
//     const spResult = await checkVendorSP(vendorId)
//     if (spResult) {
//       setShowWarning(true)
//     } else {
//       // Proceed with allocation
//       doAllocateOrder(vendorId)
//     }
//   }
//
//   return (
//     <>
//       <Button onClick={() => handleAllocateOrder(selectedVendorId)}>
//         Alokasikan Order
//       </Button>
//       <SPWarningModal
//         visible={showWarning}
//         vendorInfo={spInfo}
//         onConfirm={() => {
//           setShowWarning(false)
//           doAllocateOrder(selectedVendorId)
//           resetSPInfo()
//         }}
//         onCancel={() => {
//           setShowWarning(false)
//           resetSPInfo()
//         }}
//       />
//     </>
//   )
// }
