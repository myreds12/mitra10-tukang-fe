import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import makeAnimated from 'react-select/animated'
import {Card, Row, Button} from 'react-bootstrap'

import './NewVendor.css'
import {StoreSelect, ServiceArea, ServiceType, Bank, CheckStates, ImagePreview} from './types'
import {
  fetchStoresApi,
  fetchAreaApi,
  fetchServiceTypeApi,
  fetchBankApi,
  fetchNextVendorCodeApi,
  createNewVendorApi,
} from './services/newVendorService'
import {NewVendorGeneralInfoSection} from './components/NewVendorGeneralInfoSection'
import {NewVendorDocumentsSection} from './components/NewVendorDocumentsSection'
import {NewVendorFinancialSection} from './components/NewVendorFinancialSection'
import {NewVendorAccountSection} from './components/NewVendorAccountSection'

const NewVendorHO: FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const animatedComponents = makeAnimated()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Vendor Information
  const [vendorId, setVendorId] = useState<string>('')
  const [vendorName, setVendorName] = useState<string>('')
  const [joinDate, setJoinDate] = useState<string>('')
  const [picName, setPicName] = useState<string>('')
  const [emailVendor, setEmailVendor] = useState<string>('')
  const [phoneNumberVendor, setPhoneNumberVendor] = useState<any>()
  const [vendorAddress, setVendorAddress] = useState<any>('')
  const [username, setUsername] = useState<any>('')
  const [password, setPassword] = useState<any>('')
  const [maxOrder, setMaxOrder] = useState<string>('')
  const [nominalSurvey, setNominalSurvey] = useState<any>()

  const [ktpNumber, setKtpNumber] = useState<any>('')
  const [npwpNumber, setNpwpNumber] = useState<any>('')

  const [storeId, setStoreId] = useState<any>([])
  const [store, setStore] = useState<StoreSelect[]>([])

  const [serviceAreaId, setserviceAreaId] = useState<any>([])
  const [serviceArea, setServiceArea] = useState<ServiceArea[]>([])

  const [serviceTypeId, setserviceTypeId] = useState<any>([])
  const [serviceType, setServiceType] = useState<ServiceType[]>([])

  // File Upload
  const [ktpEvidence, setKtpEvidence] = useState<FileList | []>()
  const [npwpEvidence, setNpwpEvidence] = useState<FileList | []>()
  const [comproEvidence, setComproEvidence] = useState<FileList | []>()
  const [suratPermohonanEvidence, setSuratPermohonanEvidence] = useState<FileList | []>()
  const [pksEvidence, setPksEvidence] = useState<FileList | []>()
  const [suipEvidence, setSuipEvidence] = useState<FileList | []>()
  const [ptkpEvidence, setPtkpEvidence] = useState<FileList | []>()

  const [uploadFiles, setUploadFiles] = useState<Array<File | null>>([])
  const evidenceRef = useRef<HTMLInputElement>(null)

  const [imageKTP, setimageKTP] = useState<ImagePreview>({
    blob: '',
    fileName: '',
  })

  const [imageNPWP, setimageNPWP] = useState<ImagePreview>({
    blob: '',
    fileName: '',
  })

  const [imageCompro, setimageCompro] = useState<ImagePreview>({
    blob: '',
    fileName: '',
  })

  const [imageSuratPermohonan, setimageSuratPermohonan] = useState<ImagePreview>({
    blob: '',
    fileName: '',
  })

  const [imagePksEvidence, setimagePksEvidence] = useState<ImagePreview>({
    blob: '',
    fileName: '',
  })

  const [imageSuipEvidence, setimageSuipEvidence] = useState<ImagePreview>({
    blob: '',
    fileName: '',
  })

  const [imagePtkpEvidence, setimagePtkpEvidence] = useState<ImagePreview>({
    blob: '',
    fileName: '',
  })

  // Bank Information
  const [bank, setBank] = useState<Bank[]>([])
  const [bankId, setBankId] = useState<any>()
  const [bankName, setBankName] = useState<string>('')
  const [accountNumber, setAccountNumber] = useState<any>()
  const [accountName, setAccountName] = useState<string>('')
  const [marginNominal, setMarginNominal] = useState<any>()
  const [marginType, setMarginType] = useState<number>(1)
  const [vendorType, setVendorType] = useState<number>(1)

  const [isActive, setisActive] = useState<CheckStates>({
    compro: false,
    suratPermohonan: false,
    pks: false,
    suip: false,
    ptkp: false,
  })

  const today = new Date().toISOString().split('T')[0]

  const formatDate = (date: any) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${year}/${month}/${day}`
  }

  const getStore = async () => {
    try {
      const response = await fetchStoresApi(apiUrl)
      if (Array.isArray(response.data.data)) {
        const tempStore = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.store_name,
        }))
        setStore(tempStore)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getArea = async () => {
    try {
      const response = await fetchAreaApi(apiUrl)
      if (Array.isArray(response.data.data)) {
        const tempArea = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.area,
        }))
        setServiceArea(tempArea)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getServiceType = async () => {
    try {
      const response = await fetchServiceTypeApi(apiUrl)
      if (Array.isArray(response.data.data)) {
        const tempServiceType = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.service_type,
        }))
        setServiceType(tempServiceType)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getBank = async () => {
    try {
      const response = await fetchBankApi(apiUrl)
      if (Array.isArray(response.data.data)) {
        const tempBank = response.data.data.map((item: any) => ({
          value: item.id,
          label: item.bank_name,
        }))
        setBank(tempBank)
      } else {
        console.error('API response data is not an array:', response.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getVendorId = async () => {
    try {
      const response = await fetchNextVendorCodeApi(apiUrl)
      if (response.status === 200) {
        const {data} = response
        setVendorId(data.data.code)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getStore()
    getArea()
    getServiceType()
    getBank()
    getVendorId()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (isActive.ptkp === true) {
      setVendorType(1)
    } else {
      setVendorType(0)
    }
  }, [vendorType, isActive.ptkp])

  const handleChangeJoinDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedJoinDate = new Date(event.target.value)
    setJoinDate(formatDate(updatedJoinDate))
  }

  const handleChangeVendorName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVendorName(event.target.value)
  }

  const handleChangePicName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPicName(event.target.value)
  }

  const handleChangeVendorEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailVendor(event.target.value)
  }

  const handleChangeVendorPhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumberVendor(event.target.value)
  }

  const handleChangeVendorAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVendorAddress(event.target.value)
  }

  const handleChangeMaxOrder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxOrder(event.target.value)
  }

  const handleChangeNominalSurvey = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNominalSurvey(event.target.value)
  }

  const handleFormCheckbox = (element: keyof CheckStates) => {
    setisActive({...isActive, [element]: !isActive[element]})
  }

  // Upload Handlers
  const handleFileChangeKTP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setKtpEvidence(files)
      setimageKTP({
        blob: URL.createObjectURL(files[0]),
        fileName: files[0].name,
      })
    }
  }

  const handleUploadKTP = () => {
    const inputField = document.getElementById('input-ktp-file') as HTMLInputElement
    inputField.click()
  }

  const handleFileChangeNPWP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setNpwpEvidence(files)
      setimageNPWP({
        blob: URL.createObjectURL(files[0]),
        fileName: files[0].name,
      })
    }
  }

  const handleUploadNPWP = () => {
    const inputField = document.getElementById('input-npwp-file') as HTMLInputElement
    inputField.click()
  }

  const handleFileChangeCompro = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setComproEvidence(files)
      setimageCompro({
        blob: URL.createObjectURL(files[0]),
        fileName: files[0].name,
      })
    }
  }

  const handleUploadCompro = () => {
    const inputField = document.getElementById('input-compro-file') as HTMLInputElement
    inputField.click()
  }

  const handleFileChangeSuratPermohonan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setSuratPermohonanEvidence(files)
      setimageSuratPermohonan({
        blob: URL.createObjectURL(files[0]),
        fileName: files[0].name,
      })
    }
  }

  const handleUploadSuratPermohonan = () => {
    const inputField = document.getElementById('input-surat_permohonan-file') as HTMLInputElement
    inputField.click()
  }

  const handleFileChangePksEvidence = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setPksEvidence(files)
      setimagePksEvidence({
        blob: URL.createObjectURL(files[0]),
        fileName: files[0].name,
      })
    }
  }

  const handleUploadPksEvidence = () => {
    const inputField = document.getElementById('input-pks-file') as HTMLInputElement
    inputField.click()
  }

  const handleFileChangeSuipEvidence = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setSuipEvidence(files)
      setimageSuipEvidence({
        blob: URL.createObjectURL(files[0]),
        fileName: files[0].name,
      })
    }
  }

  const handleUploadSuipEvidence = () => {
    const inputField = document.getElementById('input-suip-file') as HTMLInputElement
    inputField.click()
  }

  const handleFileChangePtkpEvidence = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setPtkpEvidence(files)
      setimagePtkpEvidence({
        blob: URL.createObjectURL(files[0]),
        fileName: files[0].name,
      })
    }
  }

  const handleUploadPtkpEvidence = () => {
    const inputField = document.getElementById('input-ptkp-file') as HTMLInputElement
    inputField.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const {length} = fileList

      for (let i = 0; i < length; i++) {
        file[i] = fileList.item(i)
      }

      setUploadFiles(file)
    }
  }

  const handleImageClick = () => {
    const inputField = document.getElementById('file-input') as HTMLInputElement
    inputField.click()
  }

  const handleRemoveFile = (index: number) => {
    const newEvidances = [...uploadFiles]
    newEvidances.splice(index, 1)
    setUploadFiles(newEvidances)

    if (evidenceRef.current?.value) {
      evidenceRef.current.value = ''
    }
  }

  const handleChangeKTPNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKtpNumber(event.target.value)
  }

  const handleChangeNPWPNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNpwpNumber(event.target.value)
  }

  const handleChangeSelectBank = (element: Bank | null) => {
    const newBankInfo: Bank = {
      value: element?.value || 0,
      label: element?.label || '',
    }
    setBankId(newBankInfo.value)
    setBankName(newBankInfo.label)
  }

  const handleChangeAccountName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountName(event.target.value)
  }

  const handleChangeAccountNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(event.target.value)
  }

  const handleChangeMargin = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMarginNominal(event.target.value)
  }

  const handleMarginTypeChange = (type: number) => {
    setMarginType(type)
  }

  const handleChangeUsernameVendor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handleChangePasswordVendor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const handleChangeServiceAreaId = (element: any) => {
    const updatedServiceArea = element.map((option: any) => option.value)
    setserviceAreaId(updatedServiceArea)
  }

  const handleChangeStoreId = (element: any) => {
    const updatedStore = element.map((option: any) => option.value)
    setStoreId(updatedStore)
  }

  const handleChangeServiceTypeId = (element: any) => {
    const updatedServiceTypeId = element.map((option: any) => option.value)
    setserviceTypeId(updatedServiceTypeId)
  }

  // Vendor Validation
  const VendorValidation = () => {
    let valid = true

    if (!joinDate) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Join Date form',
        icon: 'warning',
      })
      valid = false
    } else if (!ktpNumber) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nomor KTP form',
        icon: 'warning',
      })
      valid = false
    } else if (!npwpNumber) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nomor NPWP form',
        icon: 'warning',
      })
      valid = false
    } else if (!picName) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nama PIC form',
        icon: 'warning',
      })
      valid = false
    } else if (!vendorName) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nama Perusahaan form',
        icon: 'warning',
      })
      valid = false
    } else if (!emailVendor) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Email form',
        icon: 'warning',
      })
      valid = false
    } else if (!phoneNumberVendor) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nomor HP / WA form',
        icon: 'warning',
      })
      valid = false
    } else if (!serviceAreaId) {
      Swal.fire({
        title: 'Warning',
        text: 'Please select Service Area form',
        icon: 'warning',
      })
      valid = false
    } else if (!serviceTypeId) {
      Swal.fire({
        title: 'Warning',
        text: 'Please select Service Type form',
        icon: 'warning',
      })
      valid = false
    } else if (!vendorAddress) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Vendor Address form',
        icon: 'warning',
      })
      valid = false
    } else if (!ktpEvidence) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Upload KTP form',
        icon: 'warning',
      })
      valid = false
    } else if (!npwpEvidence) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Upload NPWP form',
        icon: 'warning',
      })
      valid = false
    } else if (!bankName) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nama Bank form',
        icon: 'warning',
      })
      valid = false
    } else if (!accountNumber) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nomor Account form',
        icon: 'warning',
      })
      valid = false
    } else if (!accountName) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Account Name form',
        icon: 'warning',
      })
      valid = false
    } else if (maxOrder === '') {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Max Order form',
        icon: 'warning',
      })
      valid = false
    } else if (maxOrder < '3') {
      Swal.fire({
        title: 'Warning',
        text: 'Each Vendor have 3 minimal order',
        icon: 'warning',
      })
      valid = false
    } else if (!nominalSurvey) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Nominal Survey form',
        icon: 'warning',
      })
      valid = false
    } else if (!password) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Password form',
        icon: 'warning',
      })
      valid = false
    } else if (storeId?.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill Assign To Store form',
        icon: 'warning',
      })
      valid = false
    }

    return valid
  }

  // Handle Submit New Vendor
  const handleSubmitNewVendor = async () => {
    if (VendorValidation()) {
      setIsLoading(true)
      const formData = new FormData()

      formData.append('id', vendorId)
      formData.append('company_name', vendorName)
      formData.append('address', vendorAddress)
      formData.append('phone_number', phoneNumberVendor)
      formData.append('email_address', emailVendor)
      formData.append('join_date', joinDate)
      formData.append('max_order', maxOrder)
      formData.append('nominal_survey', nominalSurvey)
      formData.append('vendor_type', String(vendorType))

      formData.append('pic_name', picName)
      formData.append('margin_nominal', marginNominal)
      formData.append('margin_type', String(marginType))
      formData.append('account_name', accountName)
      formData.append('account_number', accountNumber)
      formData.append('bank_id', bankId)

      if (username) {
        formData.append('default_username', username)
      }

      if (password) {
        formData.append('password', password)
      }

      if (ktpNumber) {
        formData.append('ktp_number', ktpNumber)
      }

      if (npwpNumber) {
        formData.append('npwp_number', npwpNumber)
      }

      if (npwpEvidence?.length) {
        formData.append('npwp_file', npwpEvidence[0])
      }

      if (ktpEvidence?.length) {
        formData.append('ktp_file', ktpEvidence[0])
      }

      if (isActive && comproEvidence?.length) {
        formData.append('compro_file', comproEvidence[0])
      }

      if (isActive && suratPermohonanEvidence?.length) {
        formData.append('surat_permohonan_file', suratPermohonanEvidence[0])
      }

      if (isActive && pksEvidence?.length) {
        formData.append('pks_file', pksEvidence[0])
      }

      if (isActive && suipEvidence?.length) {
        formData.append('suip_file', suipEvidence[0])
      }

      if (isActive && ptkpEvidence?.length) {
        formData.append('ptkp_file', ptkpEvidence[0])
      }

      if (uploadFiles?.length) {
        uploadFiles.forEach((item) => {
          if (item) {
            formData.append(`vendor_document`, item, item?.name)
          }
        })
      }

      if (serviceAreaId?.length) {
        serviceAreaId.forEach((item: any) => {
          if (item) {
            formData.append(`area_id[]`, item)
          }
        })
      }

      if (storeId?.length) {
        storeId.forEach((item: any, index: number) => {
          if (item) {
            formData.append(`vendor_store[${index}][store_id]`, item)
          }
        })
      }

      if (serviceTypeId?.length) {
        serviceTypeId.forEach((item: any) => {
          if (item) {
            formData.append(`service_type_id[]`, item)
          }
        })
      }

      try {
        const response = await createNewVendorApi(apiUrl, formData)

        if (response.data.status === 200 || response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Success Create Vendor',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          })

          setIsLoading(false)
        } else {
          Swal.fire({
            title: 'Error',
            text: response.data.message,
            icon: 'error',
          })

          setIsLoading(false)
        }

        navigate('/vendor/view-vendor')
      } catch (error: any) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message,
          icon: 'error',
        })

        setIsLoading(false)
      }
    }
  }

  return (
    <section id='new-vendor'>
      <Card>
        <Card.Header>
          <Card.Title>Informasi Vendor</Card.Title>
        </Card.Header>

        <Card.Body>
          <Row>
            <NewVendorGeneralInfoSection
              vendorId={vendorId}
              today={today}
              handleChangeJoinDate={handleChangeJoinDate}
              isActive={isActive}
              vendorName={vendorName}
              handleChangeVendorName={handleChangeVendorName}
              picName={picName}
              handleChangePicName={handleChangePicName}
              phoneNumberVendor={phoneNumberVendor}
              handleChangeVendorPhoneNumber={handleChangeVendorPhoneNumber}
              emailVendor={emailVendor}
              handleChangeVendorEmail={handleChangeVendorEmail}
              animatedComponents={animatedComponents}
              serviceArea={serviceArea}
              handleChangeServiceAreaId={handleChangeServiceAreaId}
              serviceType={serviceType}
              handleChangeServiceTypeId={handleChangeServiceTypeId}
              store={store}
              handleChangeStoreId={handleChangeStoreId}
              vendorAddress={vendorAddress}
              handleChangeVendorAddress={handleChangeVendorAddress}
            />

            <NewVendorDocumentsSection
              handleUploadKTP={handleUploadKTP}
              handleFileChangeKTP={handleFileChangeKTP}
              imageKTP={imageKTP}
              handleChangeKTPNumber={handleChangeKTPNumber}
              ktpNumber={ktpNumber}
              handleUploadNPWP={handleUploadNPWP}
              handleFileChangeNPWP={handleFileChangeNPWP}
              imageNPWP={imageNPWP}
              handleChangeNPWPNumber={handleChangeNPWPNumber}
              npwpNumber={npwpNumber}
              handleFileChangeCompro={handleFileChangeCompro}
              handleUploadCompro={handleUploadCompro}
              imageCompro={imageCompro}
              handleFileChangeSuratPermohonan={handleFileChangeSuratPermohonan}
              handleUploadSuratPermohonan={handleUploadSuratPermohonan}
              imageSuratPermohonan={imageSuratPermohonan}
              handleFileChangePksEvidence={handleFileChangePksEvidence}
              handleUploadPksEvidence={handleUploadPksEvidence}
              imagePksEvidence={imagePksEvidence}
              handleFileChangeSuipEvidence={handleFileChangeSuipEvidence}
              handleUploadSuipEvidence={handleUploadSuipEvidence}
              imageSuipEvidence={imageSuipEvidence}
              handleFileChangePtkpEvidence={handleFileChangePtkpEvidence}
              handleUploadPtkpEvidence={handleUploadPtkpEvidence}
              imagePtkpEvidence={imagePtkpEvidence}
              isActive={isActive}
              handleFormCheckbox={handleFormCheckbox}
              handleImageClick={handleImageClick}
              evidenceRef={evidenceRef}
              handleFileChange={handleFileChange}
              uploadFiles={uploadFiles}
              handleRemoveFile={handleRemoveFile}
            />

            <NewVendorFinancialSection
              bank={bank}
              handleChangeSelectBank={handleChangeSelectBank}
              handleChangeAccountNumber={handleChangeAccountNumber}
              accountNumber={accountNumber}
              handleChangeAccountName={handleChangeAccountName}
              accountName={accountName}
              marginType={marginType}
              handleMarginTypeChange={handleMarginTypeChange}
              handleChangeMargin={handleChangeMargin}
              marginNominal={marginNominal}
              handleChangeMaxOrder={handleChangeMaxOrder}
              maxOrder={maxOrder}
              handleChangeNominalSurvey={handleChangeNominalSurvey}
              nominalSurvey={nominalSurvey}
            />
          </Row>

          <div className='d-flex justify-content-center'>
            <Button
              className='d-flex justify-content-center align-items-center'
              variant='dark-primary'
              type='submit'
              disabled={isLoading}
              onClick={handleSubmitNewVendor}
            >
              {isLoading ? 'Saving..' : 'Save'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <hr />

      <NewVendorAccountSection
        username={username}
        handleChangeUsernameVendor={handleChangeUsernameVendor}
        password={password}
        handleChangePasswordVendor={handleChangePasswordVendor}
      />
    </section>
  )
}

export {NewVendorHO}
