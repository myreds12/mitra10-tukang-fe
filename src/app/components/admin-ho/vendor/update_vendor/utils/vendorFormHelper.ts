import Swal from 'sweetalert2'
import {CheckStates} from '../types'

interface VendorValidationParams {
  joinDate: string
  ktpNumber: any
  npwpNumber: any
  picName: string
  vendorName: string
  emailVendor: string
  phoneNumberVendor: any
  serviceAreaValues: any[]
  serviceTypeValues: any[]
  storeValues: any[]
  vendorAddress: string
  bankName: string
  accountNumber: any
  accountName: string
  nominalSurvey: any
  maxOrder: string
}

export const validateVendorForm = (params: VendorValidationParams): boolean => {
  const {
    joinDate,
    ktpNumber,
    npwpNumber,
    picName,
    vendorName,
    emailVendor,
    phoneNumberVendor,
    serviceAreaValues,
    serviceTypeValues,
    storeValues,
    vendorAddress,
    bankName,
    accountNumber,
    accountName,
    nominalSurvey,
    maxOrder,
  } = params

  if (!joinDate) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Join Date form',
      icon: 'warning',
    })
    return false
  }
  if (!ktpNumber) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nomor KTP form',
      icon: 'warning',
    })
    return false
  }
  if (!npwpNumber) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nomor NPWP form',
      icon: 'warning',
    })
    return false
  }
  if (!picName) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nama PIC form',
      icon: 'warning',
    })
    return false
  }
  if (!vendorName) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nama Perusahaan form',
      icon: 'warning',
    })
    return false
  }
  if (!emailVendor) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Email form',
      icon: 'warning',
    })
    return false
  }
  if (!phoneNumberVendor) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nomor HP / WA form',
      icon: 'warning',
    })
    return false
  }
  if (serviceAreaValues.length === 0) {
    Swal.fire({
      title: 'Warning',
      text: 'Please select Service Area form',
      icon: 'warning',
    })
    return false
  }
  if (serviceTypeValues.length === 0) {
    Swal.fire({
      title: 'Warning',
      text: 'Please select Service Type form',
      icon: 'warning',
    })
    return false
  }
  if (storeValues.length === 0) {
    Swal.fire({
      title: 'Warning',
      text: 'Please select Assign To Store form',
      icon: 'warning',
    })
    return false
  }
  if (vendorAddress === '') {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Vendor Address form',
      icon: 'warning',
    })
    return false
  }
  if (!bankName) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nama Bank form',
      icon: 'warning',
    })
    return false
  }
  if (!accountNumber) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nomor Account form',
      icon: 'warning',
    })
    return false
  }
  if (!accountName) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Account Name form',
      icon: 'warning',
    })
    return false
  }
  if (!nominalSurvey) {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Nominal Survey form',
      icon: 'warning',
    })
    return false
  }
  if (maxOrder === '') {
    Swal.fire({
      title: 'Warning',
      text: 'Please fill Max Order form',
      icon: 'warning',
    })
    return false
  }
  if (maxOrder < '3') {
    Swal.fire({
      title: 'Warning',
      text: 'Each Vendor have 3 minimal order',
      icon: 'warning',
    })
    return false
  }

  return true
}

interface BuildVendorFormDataParams {
  vendorId: string
  picName: string
  vendorName: string
  vendorAddress: string
  phoneNumberVendor: any
  emailVendor: string
  joinDate: string
  maxOrder: string
  bankId: any
  accountNumber: any
  accountName: string
  nominalSurvey: any
  marginNominal: any
  marginType: number
  vendorType: any
  username: string
  ktpNumber: any
  npwpNumber: any
  password: any
  npwpEvidence?: FileList | []
  ktpEvidence?: FileList | []
  isActive: CheckStates
  comproEvidence?: FileList | []
  suratPermohonanEvidence?: FileList | []
  pksEvidence?: FileList | []
  suipEvidence?: FileList | []
  ptkpEvidence?: FileList | []
  uploadFiles: Array<any>
  serviceAreaValues: any[]
  serviceTypeValues: any[]
  storeValues: any[]
}

export const buildVendorFormData = (params: BuildVendorFormDataParams): FormData => {
  const formData = new FormData()

  formData.append('id', params.vendorId)
  formData.append('pic_name', params.picName)
  formData.append('company_name', params.vendorName)
  formData.append('address', params.vendorAddress)
  formData.append('phone_number', params.phoneNumberVendor)
  formData.append('email_address', params.emailVendor)
  formData.append('join_date', params.joinDate)
  formData.append('max_order', params.maxOrder)
  formData.append('bank_id', params.bankId)
  formData.append('account_number', params.accountNumber)
  formData.append('account_name', params.accountName)
  formData.append('nominal_survey', params.nominalSurvey)
  formData.append('margin_nominal', params.marginNominal)
  formData.append('margin_type', String(params.marginType))
  formData.append('vendor_type', String(params.vendorType))

  if (params.username) {
    formData.append('default_username', params.username)
  }
  if (params.ktpNumber) {
    formData.append('ktp_number', params.ktpNumber)
  }
  if (params.npwpNumber) {
    formData.append('npwp_number', params.npwpNumber)
  }
  if (params.password) {
    formData.append('password', params.password)
  }
  if (params.npwpEvidence?.length) {
    formData.append('npwp_file', params.npwpEvidence[0])
  }
  if (params.ktpEvidence?.length) {
    formData.append('ktp_file', params.ktpEvidence[0])
  }
  if (params.isActive && params.comproEvidence?.length) {
    formData.append('compro_file', params.comproEvidence[0])
  }
  if (params.isActive && params.suratPermohonanEvidence?.length) {
    formData.append('surat_permohonan_file', params.suratPermohonanEvidence[0])
  }
  if (params.isActive && params.pksEvidence?.length) {
    formData.append('pks_file', params.pksEvidence[0])
  }
  if (params.isActive && params.suipEvidence?.length) {
    formData.append('suip_file', params.suipEvidence[0])
  }
  if (params.isActive && params.ptkpEvidence?.length) {
    formData.append('ptkp_file', params.ptkpEvidence[0])
  }

  if (params.uploadFiles?.length) {
    params.uploadFiles.forEach((item) => {
      if (item instanceof Blob) {
        formData.append('vendor_document', item, (item as any)?.name)
      }
    })
  }

  if (params.serviceAreaValues?.length) {
    params.serviceAreaValues.forEach((item: any, index: number) => {
      if (item) {
        if (item.id !== null) {
          formData.append(`vendor_area[${index}][id]`, item.id)
        }
        formData.append(`vendor_area[${index}][area_id]`, item.value)
      }
    })
  }

  if (params.serviceTypeValues?.length) {
    params.serviceTypeValues.forEach((item: any, index: number) => {
      if (item?.id !== null) {
        formData.append(`vendor_service[${index}][id]`, item.id)
      }
      if (item) {
        formData.append(`vendor_service[${index}][service_type_id]`, item.value)
      }
    })
  }

  if (params.storeValues?.length) {
    params.storeValues.forEach((item: any, index: number) => {
      if (item) {
        if (item.id !== null) {
          formData.append(`vendor_store[${index}][id]`, item.id)
        }
        formData.append(`vendor_store[${index}][store_id]`, item.value)
      }
    })
  }

  return formData
}
