import { useState, useEffect } from 'react'
import axios from 'axios'
import { SingleValue } from 'react-select'
import { Orders } from '../../../../../interfaces/order'
import { StoreItemSelect, MemberSelect, SalesSelect, VendorSelect, ItemSelect, Order } from '../types'

interface UseOrderLookupsParams {
  apiUrl?: string
  apiChat: string
  orderId?: string
  updatePageTitle: (order: Orders) => void
  paymentTypeValue: string[]
  setPaymentTypeValue: (val: string[]) => void
  setOrderForm: React.Dispatch<React.SetStateAction<Order>>
  setReceiptFiles: (files: any) => void
  setIsOverdistance: (val: number) => void
}

export const useOrderLookups = ({
  apiUrl,
  apiChat,
  orderId,
  updatePageTitle,
  paymentTypeValue,
  setPaymentTypeValue,
  setOrderForm,
  setReceiptFiles,
  setIsOverdistance,
}: UseOrderLookupsParams) => {
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
  const [orderDetail, setOrderDetail] = useState<any>()

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
  const [selectedMember, setSelectedMember] = useState<SingleValue<MemberSelect>>({
    value: null,
    label: '',
    full_name: '',
    email: '',
    phone_number: '',
    whatsapp_number: '',
    address_1: '',
  })

  // Sales
  const [sales, setSales] = useState<SalesSelect[]>([])
  const [searchSales, setSearchSales] = useState('')
  const [selectedSales, setSelectedSales] = useState<SingleValue<SalesSelect>>({
    value: null,
    label: '',
    full_name: '',
  })

  // Vendor
  const [vendor, setVendor] = useState<VendorSelect[]>([])
  const [selectedVendor, setSelectedVendor] = useState<SingleValue<VendorSelect>>({
    value: null,
    label: '',
  })

  // Item & search
  const [item, setItem] = useState<ItemSelect[]>([])
  const [searchItem, setSearchItem] = useState('')
  const [debouncedSearchItem, setDebouncedSearchItem] = useState('')
  const [searchPemasangan, setSearchPemasangan] = useState('')
  const [debouncedSearchPemasangan, setDebouncedSearchPemasangan] = useState('')
  const [isLoadingItem, setIsLoadingItem] = useState<boolean>(false)

  // Template
  const [template, setTemplate] = useState<any[]>([])

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

  // Fetch API Items
  const getItem = async () => {
    const storeId = selectedStore && selectedStore.value ? `&store_id=${selectedStore.value}` : ``

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
          .map((it: any) => {
            const itemCode = it?.item_code ?? ''
            const itemName = it?.item_name || it?.service_name || ''
            const surveyLabel = itemCode && itemName ? `${itemCode} - ${itemName}` : itemCode || itemName
            const pemasanganLabel = `${it.service_name || it.item_name}${it.item_code ? ` (${it.item_code})` : ''}`

            return {
              value: it.id,
              label: isSurvey ? surveyLabel : pemasanganLabel,
              item_code: itemCode,
              item_name: it?.item_name ?? '',
              service_name: it?.service_name ?? '',
              category_id: it.category_id,
              default_price: it.default_price,
              type: it?.type,
              prices: (it.prices || []).map((priceItem: any) => ({
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
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingItem(false)
    }
  }

  useEffect(() => {
    getItem()
  }, [paymentTypeValue, selectedStore?.value, debouncedSearchItem, debouncedSearchPemasangan])

  // Fetch Order Data
  const fetchOrderData = async () => {
    if (!orderId) return
    try {
      const response = await axios.get(`${apiUrl}/orders/${orderId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      const data = response.data.data
      setOrderDetail(data)

      if (data?.store) {
        setSelectedStore((prev: any) => ({
          ...prev,
          value: data.store.id,
          label: data.store.store_name,
          address: data.store.address,
          city_id: data.store.city_id,
          zip_code: data.store.zip_code,
        }))

        setOrderForm((prev) => ({
          ...prev,
          store_id: data.store_id,
        }))
      }

      if (data?.payment_type) {
        if (data.payment_type === 'survey') {
          setPaymentTypeValue(['berbayar', 'survey'])
          setOrderForm((prev) => ({
            ...prev,
            payment_type: 'survey',
          }))
        } else if (data.payment_type === 'gratis') {
          setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
          setOrderForm((prev) => ({
            ...prev,
            payment_type: 'gratis',
          }))
        } else if (data.payment_type === 'pemasangan_tanpa_survey') {
          setPaymentTypeValue(['berbayar', 'pemasangan_tanpa_survey'])
          setOrderForm((prev) => ({
            ...prev,
            payment_type: 'pemasangan_tanpa_survey',
          }))
        } else {
          setPaymentTypeValue(['gratis', 'pemasangan_tanpa_survey'])
          setOrderForm((prev) => ({
            ...prev,
            payment_type: 'gratis',
          }))
        }
      }

      if (data?.members) {
        setSelectedMember((prev: any) => ({
          ...prev,
          value: data.members.id,
          label: data.members.member_number,
          full_name: data.members.full_name,
          email: data.members.email,
          phone_number: data.members.phone_number,
          whatsapp_number: data.members.whatsapp_number,
          address_1: data.members.address_1,
        }))

        setOrderForm((prev) => ({
          ...prev,
          member_id: data.members.id,
        }))
      }

      if (data?.project_address) {
        setOrderForm((prev) => ({
          ...prev,
          project_address: data.project_address,
        }))
      }

      if (data?.project_number) {
        setOrderForm((prev) => ({
          ...prev,
          project_number: data.project_number,
        }))
      }

      if (data?.receipt_number) {
        setOrderForm((prev) => ({
          ...prev,
          receipt_number: data.receipt_number,
        }))
      }

      if (data?.sales) {
        setSelectedSales((prev: any) => ({
          ...prev,
          value: data.sales.id,
          label: data.sales.full_name,
          full_name: data.sales.full_name,
        }))

        setOrderForm((prev) => ({
          ...prev,
          sales_id: data.sales.id,
        }))
      }

      if (data?.vendor) {
        setSelectedVendor((prev: any) => ({
          ...prev,
          value: data.vendor.id,
          label: data.vendor.company_name,
        }))

        setOrderForm((prev) => ({
          ...prev,
          vendor_id: data.vendor.id,
        }))
      }

      if (data?.request_survey) {
        setOrderForm((prev) => ({
          ...prev,
          request_survey: new Date(data.request_survey).toISOString().split('T')[0],
        }))
      }

      if (data?.is_overdistance) {
        setOrderForm((prev) => ({
          ...prev,
          is_overdistance: data?.is_overdistance ?? 0,
        }))

        setIsOverdistance(data?.is_overdistance ?? 0)
      }

      if (data?.additional_fee) {
        setOrderForm((prev) => ({
          ...prev,
          additional_fee: data?.additional_fee ?? 0,
        }))
      }

      if (data?.notes) {
        setOrderForm((prev) => ({
          ...prev,
          notes: data?.notes ?? '',
        }))
      }

      if (data?.order_details) {
        setOrderForm((prev) => {
          const previousDetailValues = data.order_details.map((it: any) => {
            const code = it?.item_code === 'null' ? '' : it?.item_code || ''
            const name =
              (it?.item_name === 'null' ? '' : it?.item_name) ||
              it?.item?.item_name ||
              it?.item?.service_name ||
              ''
            const surveyLabel = code && name ? `${code} - ${name}` : code || name

            const previousItem = {
              value: it.id,
              label:
                data?.payment_type === 'survey' ? surveyLabel : it?.item?.service_name,
              category_id: it?.item?.category?.id,
              item_code: code,
              item_name: name,
              service_name: it?.item?.service_name ?? '',
              default_price: it?.item?.default_price,
              type: it?.type,
              prices:
                it?.item?.prices?.length > 0
                  ? it?.item?.prices.map((price: any) => ({
                    id: price?.id,
                    item_id: price?.item_id,
                    store_id: price?.store_id,
                    periodic_start: price?.periodic_start,
                    periodic_end: price?.periodic_end,
                    price: price?.price,
                    min_order: price?.min_order,
                  }))
                  : [],
            }

            return {
              item: previousItem,
              id: it.id,
              item_id: it.item_id,
              item_code: it?.item_code === 'null' ? '' : it.item_code,
              item_name: it?.item_name === 'null' ? '' : it.item_name,
              item_notes: it?.item_notes === 'null' ? '' : it.item_notes,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total: it.total,
            }
          })

          return {
            ...prev,
            order_details: previousDetailValues,
          }
        })
      }

      if (data?.order_files) {
        const initialOrderFilesValues = data.order_files.map((it: any) => ({
          id: it.id,
          name: it.path,
        }))

        setReceiptFiles(initialOrderFilesValues)
      }

      updatePageTitle(data)
    } catch (error) {
      console.error(error)
    }
  }

  const getStore = async () => {
    try {
      const response = await axios.get(`${apiUrl}/stores?take=0`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempStore = response.data.data.map((it: any) => ({
          value: it.id,
          label: it.store_name,
          address: it.address,
          city_id: it.city_id,
          zip_code: it.zip_code,
        }))

        setStore(tempStore)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getMember = async () => {
    try {
      const response = await axios.get(`${apiUrl}/member`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (Array.isArray(response.data.data)) {
        const tempMember = response.data.data.map((it: any) => ({
          value: it.id,
          label: it.member_number,
          full_name: it.full_name,
          email: it.email,
          phone_number: it.phone_number,
          whatsapp_number: it.whatsapp_number,
          address_1: it.address_1,
        }))

        setMember(tempMember)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getTemplate = async () => {
    const apiUrlWithParams = `${apiChat}/templates`
    try {
      const response = await axios.get(apiUrlWithParams, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (response.data) {
        setTemplate(response.data)
      }
    } catch (error) {
      console.error('Error fetching template data:', error)
    }
  }

  const getSales = async () => {
    const search = searchSales ? `&search=${searchSales}` : ''
    const orderStore = selectedStore?.value ? `&store_id=${selectedStore.value}` : ``

    try {
      const response = await axios.get(`${apiUrl}/sales?take=0${search}${orderStore}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempSales = response.data.data.map((it: any) => ({
          value: it.id,
          label: it.full_name,
          full_name: it.full_name,
        }))

        setSales(tempSales)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getVendor = async () => {
    const orderStore = selectedStore?.value ? `&store_id=${selectedStore.value}` : ``

    try {
      const response = await axios.get(`${apiUrl}/vendor?vendor_with_max_order=1${orderStore}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (Array.isArray(response.data.data)) {
        const tempVendor = response.data.data.map((it: any) => ({
          value: it.id,
          label: it.company_name,
        }))

        setIsLoadingPage(false)
        setVendor(tempVendor)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchOrderData()
    getStore()
    getMember()
    getTemplate()
  }, [])

  useEffect(() => {
    getSales()
  }, [selectedStore?.value, searchSales])

  useEffect(() => {
    getVendor()
  }, [selectedStore?.value])

  return {
    isLoadingPage,
    setIsLoadingPage,
    orderDetail,
    setOrderDetail,
    store,
    selectedStore,
    setSelectedStore,
    member,
    selectedMember,
    setSelectedMember,
    sales,
    selectedSales,
    setSelectedSales,
    searchSales,
    setSearchSales,
    vendor,
    selectedVendor,
    setSelectedVendor,
    item,
    isLoadingItem,
    searchItem,
    setSearchItem,
    searchPemasangan,
    setSearchPemasangan,
    getItem,
    template,
    fetchOrderData,
  }
}
