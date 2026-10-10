import React, {useState, useEffect, useCallback} from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import {SingleValue} from 'react-select'
import {StoreItemSelect, MemberSelect, SalesSelect, VendorSelect, ItemSelect} from '../types'

export const useNewOrderLookups = (paymentTypeValue: string[]) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)

  // Store
  const [store, setStore] = useState<StoreItemSelect[]>([])
  const [selectedStore, setSelectedStore] = useState<SingleValue<StoreItemSelect>>({
    value: null,
    label: '',
    address: '',
    city_id: null,
    zip_code: '',
  })

  // Member
  const [member, setMember] = useState<MemberSelect[]>([])
  const [searchByPhoneNumber, setSearchByPhoneNumber] = useState('')
  const [selectedMember, setSelectedMember] = useState<MemberSelect>({
    full_name: '',
    email: '',
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
  const [vendorSelect, setVendorSelect] = useState<VendorSelect[]>([])
  const [searchVendor, setSearchVendor] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<SingleValue<VendorSelect>>({
    value: null,
    label: '',
  })

  // Item Search
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
    const storeId =
      selectedStore && selectedStore.value && Number(selectedStore.value) > 0
        ? `&store_id=${selectedStore.value}`
        : ``

    const isGratis = paymentTypeValue[0] === 'gratis'
    const isTanpaSurvey = paymentTypeValue[1] === 'pemasangan_tanpa_survey'
    const isSurvey = paymentTypeValue[1] === 'survey'

    let itemTypeParam = ''
    if (isGratis) {
      itemTypeParam = `&item_type=1&is_promotion=1${storeId}`
    } else if (isTanpaSurvey) {
      itemTypeParam = `&item_type=2&is_promotion=1${storeId}`
    } else if (isSurvey) {
      itemTypeParam = `&item_type=3${storeId ? storeId : '&all_store=1'}`
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
          .map((item: any) => {
            const itemCode = item?.item_code ?? ''
            const itemName = item?.item_name || item?.service_name || ''
            const surveyLabel =
              itemCode && itemName ? `${itemCode} - ${itemName}` : itemCode || itemName
            const pemasanganLabel = `${item.service_name || item.item_name}${
              item.item_code ? ` (${item.item_code})` : ''
            }`

            return {
              value: item.id,
              label: isSurvey ? surveyLabel : pemasanganLabel,
              item_code: itemCode,
              item_name: item?.item_name ?? '',
              service_name: item?.service_name ?? '',
              category_id: item.category_id,
              default_price: item.default_price,
              type: item?.type,
              prices: (item.prices || []).map((priceItem: any) => ({
                id: priceItem.id,
                is_active: priceItem.is_active,
                item_id: priceItem.item_id,
                store_id: priceItem.store_id,
                periodic_start: priceItem.periodic_start,
                periodic_end: priceItem.periodic_end,
                min_order: priceItem.min_order,
                price: priceItem.price,
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
  }, [apiUrl, paymentTypeValue, selectedStore, debouncedSearchItem, debouncedSearchPemasangan])

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
          const tempMember = response.data.data.map((item: any) => ({
            value: item.id,
            label: item?.member_number,
            full_name: item.full_name,
            email: item.email,
            phone_number: item.phone_number,
            whatsapp_number: item.whatsapp_number,
            address_1: item.address_1,
            join_location: item.join_location,
          }))

          setMember(tempMember)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getMember()
  }, [apiUrl, searchByPhoneNumber, selectedStore])

  // Fetch Stores
  useEffect(() => {
    const getStore = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stores`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            take: 0,
            store_id: selectedStore ? selectedStore.value : null,
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempStore = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.store_name,
            address: item.address,
            city_id: item.city_id,
            zip_code: item.zip_code,
          }))

          setStore(tempStore)
        }
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          Swal.fire({
            title: 'Sesi Anda Telah Berakhir',
            text: 'Silahkan Logout dan Login Ulang Kembali',
            icon: 'warning',
            confirmButtonText: 'Ok',
          })
        }
      }
    }

    getStore()
  }, [apiUrl, selectedStore?.value])

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
            store_id: selectedStore ? selectedStore.value : null,
            search: searchVendor ? searchVendor : null,
          },
        })
        setIsLoadingPage(false)
        setVendor(response.data.data || [])
      } catch (error) {
        setIsLoadingPage(false)
        console.error(error)
      }
    }

    const getVendorByMaxOrder = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vendor`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            vendor_with_max_order: 1,
            store_id: selectedStore ? selectedStore.value : null,
            search: searchVendor ? searchVendor : null,
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempVendor = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.company_name,
          }))

          setVendorSelect(tempVendor)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getVendor()
    getVendorByMaxOrder()
  }, [apiUrl, selectedStore?.value, searchVendor])

  // Fetch Sales
  useEffect(() => {
    const getSales = async () => {
      try {
        const response = await axios.get(`${apiUrl}/sales`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            is_active: 1,
            store_id: selectedStore ? selectedStore.value : null,
            search: searchSales ? searchSales : null,
          },
        })

        if (Array.isArray(response.data.data)) {
          const tempSales = response.data.data.map((item: any) => ({
            value: item.id,
            label: item.full_name,
            full_name: item.full_name,
          }))

          setSales(tempSales)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getSales()
  }, [apiUrl, selectedStore?.value, searchSales])

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
    store,
    selectedStore,
    setSelectedStore,
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
    vendorSelect,
    searchVendor,
    setSearchVendor,
    selectedVendor,
    setSelectedVendor,
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
