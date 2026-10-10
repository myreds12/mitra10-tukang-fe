import {useState} from 'react'
import axios from 'axios'
import {Order, Quotation} from '../types'

export interface UseOrderDetailProps {
  apiUrl?: string
}

export const useOrderDetail = ({apiUrl = process.env.REACT_APP_API_URL}: UseOrderDetailProps = {}) => {
  const [orderDetail, setOrderDetail] = useState<any>()
  const [mailLogs, setMailLogs] = useState<any[]>([])
  const [loadingModal, setLoadingModal] = useState<boolean>(true)
  const [receiptFiles, setReceiptFiles] = useState<Array<File | null>>([])
  const [receiptQuotation, setReceiptQuotation] = useState<Array<File | null>>([])
  const [quotationFiles, setQuotationFiles] = useState<Array<File | null>>([])

  const [orderForm, setOrderForm] = useState<Order>({
    id: null,
    project_status_id: null,
    store_id: null,
    request_survey: '',
    request_work: '',
    notes: '',
    order_details: [],
  })

  const [quotation, setQuotation] = useState<Quotation>({
    id: null,
    order_id: null,
    store_id: null,
    quotation_status: null,
    quotation_special: 0,
    description: '',
    quotation_number: '',
    quotation_date: '',
    quotation_validity: '',
    quotation_disc: 0,
    quotation_promotion: null,
    quotation_grand_total: 0,
    readiness: 0,
    receipt_quotation: '',
    receipts_quotation: [],
    quotation_details: [],
  })

  const fetchOrderData = async (order_id: number | null) => {
    if (order_id === null) return

    try {
      const response = await axios.get(`${apiUrl}/orders/${order_id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      const data = response.data.data
      const emailLog = response.data.mailLogs

      setMailLogs(emailLog)
      setOrderDetail(data)
      setTimeout(() => {
        setLoadingModal(false)
      }, 2000)

      if (data) {
        setOrderForm((prev) => ({
          ...prev,
          id: data?.id ?? null,
          project_status_id: data?.project_status_id ?? null,
          store_id: data?.store?.id ?? null,
          notes: data?.notes ?? '',
          request_survey: data?.request_survey
            ? new Date(data.request_survey).toISOString().split('T')[0]
            : '',
          request_work: data?.request_work
            ? new Date(data.request_work).toISOString().split('T')[0]
            : '',
        }))
      }

      if (data?.order_files) {
        const initialOrderFilesValues = data.order_files.map((item: any) => ({
          id: item.id,
          name: item.path,
        }))
        setReceiptFiles(initialOrderFilesValues)
      }

      if (data?.order_details) {
        setOrderForm((prev) => {
          const previousDetailValues = data?.order_details?.map((item: any) => {
            const previousItem = {
              value: item.id,
              label: item?.item?.service_name,
              item_code: item?.item_code ?? '',
              item_name: item?.item_name ?? '',
              category_id: item?.item?.category?.id,
              default_price: item?.item?.default_price,
              prices:
                item?.item?.prices?.length > 0
                  ? item?.item?.prices.map((price: any) => ({
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
              id: item.id,
              item_id: item.item_id,
              item_code: item?.item_code === 'null' ? '' : item.item_code,
              item_name: item?.item_name === 'null' ? '' : item.item_name,
              item_notes: item?.item_notes === 'null' ? '' : item.item_notes,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.total,
            }
          })

          return {
            ...prev,
            order_details: previousDetailValues,
          }
        })
      }

      if (data?.quotation?.length) {
        const quotationDetails = data.quotation[0].quotation_details.map(
          (item: any, index: number) => ({
            id: item?.id ?? null,
            index: (Date.now() + index).toString(),
            item_id: item?.item_id ?? null,
            work_order_item_id: item?.work_order_items_id ?? null,
            category_id: item?.category_id ?? null,
            type: item?.item_type ?? 2,
            item_name: item?.name ?? '',
            unit_price: item?.price ?? 0,
            unit: item?.unit ?? '',
            description: item?.description ?? '',
            final_price: item?.final_price ?? '',
            margin: item?.margin ?? 0,
            margin_type: item?.margin_type ?? 1,
            quantity: item?.quantity ?? 0,
            is_user: item?.is_customer === true ? 1 : 0,
            work_step: item?.work_step ?? 0,
          })
        )

        setQuotation((prev) => ({
          ...prev,
          id: data?.quotation[0]?.id,
          order_id: data?.quotation[0]?.order_id,
          store_id: data?.quotation[0]?.store_id,
          quotation_status: data?.quotation[0]?.quotation_status,
          quotation_special: data?.quotation[0]?.quotation_special,
          description: data?.quotation[0]?.description,
          quotation_number: data?.quotation[0]?.quotation_number,
          quotation_date: data?.quotation[0]?.quotation_date,
          quotation_validity: data?.quotation[0]?.quotation_validity,
          quotation_disc: data?.quotation[0]?.quotation_disc,
          quotation_promotion: data?.quotation[0]?.promotion?.id ?? null,
          quotation_grand_total: data?.quotation[0]?.quotation_grand_total,
          readiness: data?.quotation[0]?.readiness,
          receipt_quotation: data?.quotation[0]?.receipt_quotation,
          quotation_details: quotationDetails,
          promotion_id:
            data?.quotation[0]?.promotion_id === null ? 0 : data?.quotation[0]?.promotion_id,
          receipts_quotation: [
            {
              id: data?.quotation[0]?.quotation_receipt[0]?.id ?? null,
              index: 123,
              receipt_quotation:
                data?.quotation[0]?.quotation_receipt[0]?.receipt_quotation ?? '',
              quotation_step: 1,
            },
            {
              id: data?.quotation[0]?.quotation_receipt[1]?.id ?? null,
              index: 345,
              receipt_quotation:
                data?.quotation[0]?.quotation_receipt[1]?.receipt_quotation ?? '',
              quotation_step: 2,
            },
            {
              id: data?.quotation[0]?.quotation_receipt[2]?.id ?? null,
              index: 678,
              receipt_quotation:
                data?.quotation[0]?.quotation_receipt[2]?.receipt_quotation ?? '',
              quotation_step: 3,
            },
          ],
        }))
      }

      if (data?.quotation?.length) {
        const quotationFiles = data.quotation[0]?.quotation_files
          .filter((x: any) => x.type === 1)
          .map((item: any) => ({
            id: item.id,
            name: item.path,
          }))

        const receiptFiles = data.quotation[0]?.quotation_files
          .filter((x: any) => x.type === 2)
          .map((item: any) => ({
            id: item.id,
            name: item.path,
          }))

        setQuotationFiles(quotationFiles)
        setReceiptQuotation(receiptFiles)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return {
    orderDetail,
    setOrderDetail,
    mailLogs,
    setMailLogs,
    loadingModal,
    setLoadingModal,
    orderForm,
    setOrderForm,
    quotation,
    setQuotation,
    receiptFiles,
    setReceiptFiles,
    receiptQuotation,
    setReceiptQuotation,
    quotationFiles,
    setQuotationFiles,
    fetchOrderData,
  }
}
