import React, {useState, useEffect, useCallback} from 'react'
import axios from 'axios'
import axiosInstance from '../../../../../../_metronic/layout/core/axiosInterceptor'
import {SingleValue} from 'react-select'
import {MemberSelect, SalesSelect, ItemSelect} from '../types'

export const useNewOrderCSLookups = (paymentTypeValue: string[], staffStoreId: any) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)

  // Member
  const [member, setMember] = useState<MemberSelect[]>([])
  const [searchByPhoneNumber, setSearchByPhoneNumber] = useState('')
  const [selectedMember, setSelectedMember] = useState<MemberSelect>({
    full_name: '',
    address_1: '',
    join_location: null,
  })

  const handleChangeSelectMember = (newValue: MemberSelect | null) => {
    if (newValue) {
      setSelectedMember({
        value: newValue.value || null,
        label: newValue.label || '',
        full_name: newValue.full_name || '',
        email: newValue.email || '',
        phone_number: newValue.phone_number || '',
        whatsapp_number: newValue.whatsapp_number || '',
        address_1: newValue.address_1 || '',
        join_location: newValue.join_location || null,
      })
    } else {
      setSelectedMember({
        value: null,
        label: '',
        full_name: '',
        email: '',
        phone_number: '',
        whatsapp_number: '',
        address_1: '',
        join_location: null,
      })
    }
  }

  // Sales
  const [sales, setSales] = useState<SalesSelect[]>([])
  const [searchSales, setSearchSales] = useState('')
  const [selectedSales, setSelectedSales] = useState<SingleValue<SalesSelect>>({
    value: null,
    label: '',
    full_name: '',
  })

  // Vendor
  const [vendor, setVendor] = useState<any[]>([])

  // Items
  const [item, setItem] = useState<ItemSelect[]>([])
  const [searchItem, setSearchItem] = useState('')
  const [debouncedSearchItem, setDebouncedSearchItem] = useState('')
  const [searchPemasangan, setSearchPemasangan] = useState('')
  const [debouncedSearchPemasangan, setDebouncedSearchPemasangan] = useState('')
  const [isLoadingItem, setIsLoadingItem] = useState<boolean>(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchItem(searchItem)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchItem])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchPemasangan(searchPemasangan)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchPemasangan])

  // Fetch Items
  const getItem = useCallback(async () => {
    const isGratis = paymentTypeValue[0] === 'gratis'
    const isTanpaSurvey = paymentTypeValue[1] === 'pemasangan_tanpa_survey'
    const isSurvey = paymentTypeValue[1] === 'survey'

    let itemTypeParam = ''
    if (isGratis) {
      itemTypeParam = `&item_type=1&is_promotion=1&store_id=${staffStoreId}`
    } else if (isTanpaSurvey) {
      itemTypeParam = `&item_type=2&is_promotion=1&store_id=${staffStoreId}`
    } else if (isSurvey) {
      itemTypeParam = `&item_type=3&store_id=${staffStoreId}`
    }

    const activeSearch = (isSurvey ? debouncedSearchItem : debouncedSearchPemasangan)?.trim()
    const search = activeSearch ? `&search=${encodeURIComponent(activeSearch)}` : ''
    const take = isSurvey ? 50 : 0

    setIsLoadingItem(true)
    try {
      const response = await axios.get(
        `${apiUrl}/items?take=${take}${search}${itemTypeParam}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )

      if (Array.isArray(response.data.data)) {
        const expectedType = isGratis ? 1 : isTanpaSurvey ? 2 : 3
        const items = response.data.data
          .filter((x: any) => Boolean(x.is_active) && Number(x.type) === expectedType)
          .map((it: any) => {
            const itemCode = it?.item_code ?? ''
            const itemName = it?.item_name || it?.service_name || ''
            const surveyLabel =
              itemCode && itemName ? `${itemCode} - ${itemName}` : itemCode || itemName
            const pemasanganLabel = `${it.service_name || it.item_name}${
              it.item_code ? ` (${it.item_code})` : ''
            }`

            return {
              value: it.id,
              label: isSurvey ? surveyLabel : pemasanganLabel,
              item_code: itemCode,
              item_name: it?.item_name ?? '',
              service_name: it?.service_name ?? '',
              category: it.category,
              type: it?.type,
              default_price: it.default_price,
              prices: (it.prices || []).map((priceItem: any) => ({
                id: priceItem.id,
                is_active: priceItem.is_active,
                item_id: priceItem.item_id,
                unit_id: priceItem.unit_id,
                store_id: priceItem.store_id,
                periodic_start: priceItem.periodic_start,
                periodic_end: priceItem.periodic_end,
                nominal_discount: priceItem.nominal_discount,
                price: priceItem.price,
                min_order: priceItem.min_order,
              })),
            }
          })

        setItem(items)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingItem(false)
    }
  }, [apiUrl, paymentTypeValue, staffStoreId, debouncedSearchItem, debouncedSearchPemasangan])

  useEffect(() => {
    getItem()
  }, [getItem])

  // Fetch Member
  useEffect(() => {
    const getMember = async () => {
      try {
        const response = await axios.get(`${apiUrl}/member`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            search: searchByPhoneNumber ? searchByPhoneNumber : null,
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempMember = response.data.data.map((m: any) => ({
            value: m.id,
            label: m?.member_number,
            full_name: m.full_name,
            email: m.email,
            phone_number: m.phone_number,
            whatsapp_number: m.whatsapp_number,
            address_1: m.address_1,
            join_location: m.join_location,
          }))

          setMember(tempMember)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getMember()
  }, [apiUrl, staffStoreId, searchByPhoneNumber])

  // Fetch Sales
  const getSales = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${apiUrl}/sales`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        params: {
          is_active: 1,
          store_id: staffStoreId,
          search: searchSales ? searchSales : null,
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempSales = response.data.data.map((s: any) => ({
          value: s.id,
          label: s.full_name,
          full_name: s.full_name,
        }))

        setSales(tempSales)
      }
    } catch (error: any) {
      console.log('error when fetching data', error)
    }
  }, [apiUrl, staffStoreId, searchSales])

  useEffect(() => {
    getSales()
  }, [getSales])

  // Fetch Vendor
  useEffect(() => {
    const getVendor = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vendor`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            take: 0,
            store_id: staffStoreId ? staffStoreId : null,
          },
        })
        setIsLoadingPage(false)
        setVendor(response.data.data || [])
      } catch (error) {
        setIsLoadingPage(false)
        console.error(error)
      }
    }

    getVendor()
  }, [apiUrl, staffStoreId])

  const vendorAvailbility = (data: any, requestSurvey: string) => {
    const maxOrder = data?.max_order ?? 0

    const orderVendor = (data?.orders || []).filter((x: any) => {
      const surveyDate = new Date(x.request_survey).toISOString().split('T')[0]
      return surveyDate === requestSurvey
    })

    const tukangActive = (data?.tukang || []).filter((x: any) => {
      const isActive = x.is_active === true && x.deleted_at === null
      return isActive
    }).length

    const tukangActiveAvailability = (data?.tukang || []).filter((x: any) => {
      const isAvailable =
        x.is_active === true &&
        x.deleted_at === null &&
        maxOrder > x.slot_order &&
        x.slot_order < orderVendor.length
      return isAvailable
    }).length

    if (tukangActive === 0 && orderVendor.length >= 0) {
      return <p className='text-danger'>UNAVAILABLE</p>
    } else if (tukangActiveAvailability === 0 && orderVendor.length > 0) {
      return <p className='text-danger'>FULL BOOKED</p>
    } else {
      return <p className='text-black'>AVAILABLE</p>
    }
  }

  return {
    isLoadingPage,
    member,
    searchByPhoneNumber,
    setSearchByPhoneNumber,
    selectedMember,
    setSelectedMember,
    handleChangeSelectMember,
    sales,
    searchSales,
    setSearchSales,
    selectedSales,
    setSelectedSales,
    vendor,
    vendorAvailbility,
    item,
    setItem,
    searchItem,
    setSearchItem,
    searchPemasangan,
    setSearchPemasangan,
    isLoadingItem,
    getItem,
  }
}
