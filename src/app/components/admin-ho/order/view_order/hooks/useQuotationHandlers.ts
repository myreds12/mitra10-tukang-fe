import React, {useState, useRef, useEffect} from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import {Quotation, Order} from '../types'

export interface UseQuotationHandlersProps {
  quotation: Quotation
  setQuotation: React.Dispatch<React.SetStateAction<Quotation>>
  orderForm: Order
  receiptQuotation: any[]
  setReceiptQuotation: React.Dispatch<React.SetStateAction<any[]>>
  quotationFiles: any[]
  setQuotationFiles: React.Dispatch<React.SetStateAction<any[]>>
  evidenceRef: React.RefObject<any>
  statusData: any[]
  apiUrl?: string
  handleUpdateRequestSurvey?: () => Promise<any>
}

export const useQuotationHandlers = ({
  quotation,
  setQuotation,
  orderForm,
  receiptQuotation,
  setReceiptQuotation,
  quotationFiles,
  setQuotationFiles,
  evidenceRef,
  statusData,
  apiUrl = process.env.REACT_APP_API_URL,
  handleUpdateRequestSurvey,
}: UseQuotationHandlersProps) => {
  const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false)
  const verificationStatus = statusData.find((status: any) => status.category === 'QUOTATIONPAID')

  const singleReceipt = useRef<HTMLInputElement>(null)
  const notes = useRef<HTMLInputElement>(null)
  const receiptRefs = useRef<{[key: number]: HTMLInputElement | null}>({})
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState<number | null>(null)
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const [previewReceipt, setPreviewReceipt] = useState<any>()
  const [previewImage, setPreviewImage] = useState<any>()
  const [visibleReceipt, setVisibleReceipt] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (focusedIndex !== null) {
      const focusedElement = receiptRefs.current[focusedIndex]
      if (focusedElement) {
        focusedElement.focus()
      }
    }
  }, [focusedIndex, quotation.receipts_quotation])

  useEffect(() => {
    if (notes.current) {
      notes.current.focus()
    }
  }, [orderForm.notes])

  useEffect(() => {
    if (singleReceipt.current) {
      singleReceipt.current.focus()
    }
  }, [quotation.receipt_quotation])

  const handleMultiReceiptChange = (index: number, value: string) => {
    setQuotation((prev) => {
      const updatedReceipts = prev.receipts_quotation.map((receipt) =>
        receipt.index === index ? {...receipt, receipt_quotation: value} : receipt
      )
      return {...prev, receipts_quotation: updatedReceipts}
    })
    setFocusedIndex(index)
  }

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...receiptQuotation]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setReceiptQuotation(mergedFiles)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files

    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...quotationFiles]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setQuotationFiles(mergedFiles)
    }
  }

  // Click Image
  const handleReceiptClick = () => {
    const inputField = document.querySelector('.input-field-receipt') as HTMLInputElement
    inputField.click()
  }

  const handleImageClick = () => {
    const inputField = document.querySelector('.input-field-image') as HTMLInputElement
    inputField.click()
  }

  // Remove File
  const handleRemoveReceipt = (index: number) => {
    const newEvidances = [...receiptQuotation]
    newEvidances.splice(index, 1)
    setReceiptQuotation(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...quotationFiles]
    newEvidances.splice(index, 1)
    setQuotationFiles(newEvidances)

    // Update element value
    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  // File Click
  const handleFileReceipt = (index: number) => {
    setPreviewReceipt(receiptQuotation[index]?.name)
    setVisibleReceipt(true)
    setSelectedReceiptIndex(index)
  }

  const handleFileClick = (index: number) => {
    setPreviewImage(quotationFiles[index]?.name)
    setVisible(true)
    setSelectedFileIndex(index)
  }


  const QuotationValidation = () => {
    let valid = true

    if (
      (quotation.receipt_quotation === null || quotation.receipt_quotation === '') &&
      quotation.quotation_special === 0
    ) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi formulir receipt quotation',
        icon: 'warning',
      })
      valid = false
    } else if (quotation.receipts_quotation.length === 0 && quotation.quotation_special === 1) {
      Swal.fire({
        title: 'Warning',
        text: 'Mohon untuk mengisi formulir receipt quotation tahap 1',
        icon: 'warning',
      })
      valid = false
    } else if (receiptQuotation.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi bukti receipt quotation',
        icon: 'warning',
      })
      valid = false
    } else if (quotationFiles.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Tolong isi bukti transfer quotation',
        icon: 'warning',
      })
      valid = false
    }
    return valid
  }

  const handleUpdateQuotation = async () => {
    if (!QuotationValidation()) {
      setLoadingUpdate(false)
      return false
    }

    setLoadingUpdate(true)
    const formData = new FormData()
    const appendIfNotDefault = (formData: any, key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        formData.append(key, String(value))
      }
    }

    formData.append('order_id', String(quotation.order_id))
    formData.append('store_id', String(quotation.store_id))
    formData.append('description', quotation.description)
    formData.append('quotation_status', verificationStatus?.value)
    formData.append('quotation_number', String(quotation.quotation_number))
    formData.append('quotation_special', String(quotation.quotation_special))
    formData.append('quotation_date', quotation.quotation_date)
    formData.append('quotation_validity', quotation.quotation_validity)
    formData.append('quotation_disc', String(quotation.quotation_disc))
    formData.append('readiness', String(4))
    // formData.append('quotation_promotion', String(quotation.quotation_promotion))

    if (quotation.receipt_quotation !== null) {
      formData.append('receipt_quotation', quotation.receipt_quotation)
    }

    if (quotation.quotation_promotion !== null) {
      formData.append('promotion_id', String(quotation.quotation_promotion))
    }

    quotation.quotation_details.forEach((quotation, index) => {
      appendIfNotDefault(formData, `quotation_details[${index}][id]`, quotation.id)
      appendIfNotDefault(formData, `quotation_details[${index}][item_id]`, quotation.item_id)
      appendIfNotDefault(formData, `quotation_details[${index}][type]`, quotation.type)
      appendIfNotDefault(formData, `quotation_details[${index}][name]`, quotation.item_name)
      appendIfNotDefault(formData, `quotation_details[${index}][unit]`, quotation.unit)
      appendIfNotDefault(formData, `quotation_details[${index}][work_step]`, quotation.work_step)

      formData.append(`quotation_details[${index}][price]`, String(quotation.unit_price))
      formData.append(`quotation_details[${index}][quantity]`, String(quotation.quantity))
      formData.append(`quotation_details[${index}][margin]`, String(quotation.margin))
      formData.append(`quotation_details[${index}][margin_type]`, String(quotation.margin_type))
      formData.append(`quotation_details[${index}][is_customer]`, String(quotation.is_user))
      appendIfNotDefault(
        formData,
        `quotation_details[${index}][work_order_item_id]`,
        quotation.work_order_item_id
      )
      appendIfNotDefault(
        formData,
        `quotation_details[${index}][category_id]`,
        quotation.category_id
      )
    })

    if (quotation?.quotation_special === 1) {
      quotation.receipts_quotation.forEach((receipt, index) => {
        appendIfNotDefault(formData, `receipts_quotation[${index}][id]`, receipt.id)
        appendIfNotDefault(
          formData,
          `receipts_quotation[${index}][receipt_quotation]`,
          receipt.receipt_quotation
        )
        appendIfNotDefault(
          formData,
          `receipts_quotation[${index}][quotation_step]`,
          receipt.quotation_step
        )
      })
    }

    if (receiptQuotation?.length) {
      receiptQuotation.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_receipts`, item, (item as any).name)
        }
      })
    }

    if (quotationFiles?.length) {
      quotationFiles.forEach((item) => {
        if (item instanceof Blob) {
          formData.append(`quotation_files`, item, (item as any).name)
        }
      })
    }

    if (quotationFiles?.length) {
      quotationFiles.forEach((item: any, index: number) => {
        if (item.id) {
          formData.append(`preserve_files[${index}]`, item.id)
        }
      })
    }

    await axios
      .post(`${apiUrl}/quotation/${quotation.id}`, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        //  // 'Access-Control-Allow-Origin': '*',
        // // 'ngrok-skip-browser-warning':  'true',
        },
      })
      .then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Berhasil Verifikasi Pembayaran',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            handleUpdateRequestSurvey?.()
          })

          setLoadingUpdate(false)
        } else {
          Swal.fire({
            title: 'Warning',
            text: response.data.message,
            icon: 'warning',
          })

          setLoadingUpdate(false)
        }
      })
      .catch((error) => {
        setLoadingUpdate(false)

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
        })
      })
  }


  return {
    singleReceipt,
    notes,
    receiptRefs,
    focusedIndex,
    setFocusedIndex,
    loadingUpdate,
    setLoadingUpdate,
    handleMultiReceiptChange,
    handleReceiptChange,
    handleFileChange,
    handleReceiptClick,
    handleImageClick,
    handleRemoveReceipt,
    handleRemoveFile,
    handleFileReceipt,
    handleFileClick,
    QuotationValidation,
    handleUpdateQuotation,
    selectedReceiptIndex,
    setSelectedReceiptIndex,
    selectedFileIndex,
    setSelectedFileIndex,
    previewReceipt,
    setPreviewReceipt,
    previewImage,
    setPreviewImage,
    visibleReceipt,
    setVisibleReceipt,
    visible,
    setVisible,
  }
}
