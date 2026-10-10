import React, {FC, useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import Swal from 'sweetalert2'
import {Spin} from 'antd'
import makeAnimated from 'react-select/animated'
import {Card, Button} from 'react-bootstrap'

import './UpdateVendor.css'
import {
  StoreSelect,
  ServiceArea,
  ServiceAreaValues,
  ServiceType,
  ServiceTypeValues,
  Bank,
  CheckStates,
  UpdateVendorHOProps,
} from './types'
import {
  fetchVendorByIdApi,
  fetchStoresApi,
  fetchAreasApi,
  fetchServiceTypesApi,
  fetchBanksApi,
  updateVendorApi,
} from './services/updateVendorService'
import {validateVendorForm, buildVendorFormData} from './utils/vendorFormHelper'
import {VendorGeneralInfoSection} from './components/VendorGeneralInfoSection'
import {VendorDocumentsSection} from './components/VendorDocumentsSection'
import {VendorFinancialSection} from './components/VendorFinancialSection'
import {VendorProfileSection} from './components/VendorProfileSection'

const UpdateVendorHO: FC<UpdateVendorHOProps> = ({updatePageTitle}) => {
  const apiUrl = process.env.REACT_APP_API_URL
  const navigate = useNavigate()
  const params = useParams()

  const userRole = localStorage.getItem('userRole') as string
  const animatedComponents = makeAnimated()
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true)
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
  const [vendorType, setVendorType] = useState<any>()

  const [ktpNumber, setKtpNumber] = useState<any>('')
  const [npwpNumber, setNpwpNumber] = useState<any>('')

  const [store, setStore] = useState<StoreSelect[]>([])
  const [storeValues, setStoreValues] = useState<StoreSelect[]>([])

  const [serviceArea, setServiceArea] = useState<ServiceArea[]>([])
  const [serviceAreaValues, setServiceAreaValues] = useState<ServiceAreaValues[]>([])

  const [serviceType, setServiceType] = useState<ServiceType[]>([])
  const [serviceTypeValues, setServiceTypeValues] = useState<ServiceTypeValues[]>([])

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

  const [imageKTP, setimageKTP] = useState<{blob: string; fileName: string}>({
    blob: '',
    fileName: '',
  })
  const [imageNPWP, setimageNPWP] = useState<{blob: string; fileName: string}>({
    blob: '',
    fileName: '',
  })
  const [imageCompro, setimageCompro] = useState<{blob: string; fileName: string}>({
    blob: '',
    fileName: '',
  })
  const [imageSuratPermohonan, setimageSuratPermohonan] = useState<{
    blob: string
    fileName: string
  }>({blob: '', fileName: ''})
  const [imagePksEvidence, setimagePksEvidence] = useState<{
    blob: string
    fileName: string
  }>({blob: '', fileName: ''})
  const [imageSuipEvidence, setimageSuipEvidence] = useState<{
    blob: string
    fileName: string
  }>({blob: '', fileName: ''})
  const [imagePtkpEvidence, setimagePtkpEvidence] = useState<{
    blob: string
    fileName: string
  }>({blob: '', fileName: ''})

  // Bank Information
  const [bank, setBank] = useState<Bank[]>([])
  const [bankId, setBankId] = useState<any>()
  const [bankName, setBankName] = useState<string>('')
  const [accountNumber, setAccountNumber] = useState<any>()
  const [accountName, setAccountName] = useState<string>('')
  const [marginNominal, setMarginNominal] = useState<any>()
  const [marginType, setMarginType] = useState<number>(1)

  const [isActive, setisActive] = useState<CheckStates>({
    compro: false,
    suratPermohonan: false,
    pks: false,
    suip: false,
    ptkp: false,
  })

  // Fetch API
  const fetchVendorData = async () => {
    try {
      const response = await fetchVendorByIdApi(apiUrl, params.id)
      const data = response.data?.data

      setIsLoadingPage(false)
      updatePageTitle(data)

      if (data?.id) {
        setVendorId(data.id)
        setJoinDate(new Date(data.join_date).toISOString().split('T')[0])
        setPicName(data.pic_name)
        setVendorName(data.company_name)
        setVendorAddress(data.address)
        setEmailVendor(data.email_address)
        setPhoneNumberVendor(data.phone_number)
        setKtpNumber(data.ktp_number)
        setNpwpNumber(data.npwp_number)
        setMaxOrder(data.max_order)
        setNominalSurvey(data.nominal_survey)
        setMarginNominal(data.margin_nominal)
        setMarginType(data.margin_type)
        setVendorType(data.type ?? 0)
      }

      if (data?.type) {
        setisActive((prevState) => ({
          ...prevState,
          ptkp: data.type === 1,
        }))
      }

      if (data?.pic_vendor) {
        setUsername(data?.pic_vendor[0]?.users?.username ?? '')
      }

      if (data?.bank) {
        setBankId(data?.bank?.id ?? null)
        setBankName(data?.bank?.bank_name ?? '')
      }

      if (data?.account_name) {
        setAccountName(data.account_name)
      }

      if (data?.account_number) {
        setAccountNumber(data.account_number)
      }

      if (data?.vendor_area?.length >= 1) {
        const vendorArea = Array.from(
          new Set(data.vendor_area.map((itemObj: any) => itemObj.area.id))
        ).map((id) => {
          const itemObj = data.vendor_area.find((a: any) => a.area.id === id)
          return {
            id: itemObj?.id ?? null,
            value: itemObj.area.id,
            label: itemObj.area.area,
          }
        })
        setServiceAreaValues(vendorArea)
      }

      if (data?.vendor_store?.length >= 1) {
        const storeList = Array.from(
          new Set(data.vendor_store.map((itemObj: any) => itemObj.store.id))
        ).map((id) => {
          const itemObj = data.vendor_store.find((s: any) => s.store.id === id)
          return {
            id: itemObj?.id ?? null,
            value: itemObj.store.id,
            label: itemObj.store.store_name,
          }
        })
        setStoreValues(storeList)
      }

      if (data?.vendor_service?.length >= 1) {
        const serviceTypeList = Array.from(
          new Set(data.vendor_service.map((itemObj: any) => itemObj.service_type_id))
        ).map((id) => {
          const itemObj = data.vendor_service.find((st: any) => st.service_type_id === id)
          return {
            id: itemObj?.id ?? null,
            value: itemObj?.service_type_id,
            label: itemObj?.service_type?.service_type,
          }
        })
        setServiceTypeValues(serviceTypeList)
      }

      if (data?.vendor_document) {
        const documentTypes = [
          'npwp_file',
          'ktp_file',
          'compro_file',
          'surat_permohonan_file',
          'pks_file',
          'suip_file',
        ]

        type DocumentStateSetter = (state: {blob: string; fileName: string}) => void

        const documentStateSetters: Record<string, DocumentStateSetter> = {
          npwp_file: setimageNPWP,
          ktp_file: setimageKTP,
          compro_file: setimageCompro,
          surat_permohonan_file: setimageSuratPermohonan,
          pks_file: setimagePksEvidence,
          suip_file: setimageSuipEvidence,
        }

        data.vendor_document.forEach((document: any) => {
          const {document_name, path} = document
          if (documentTypes.includes(document_name)) {
            const setter = documentStateSetters[document_name]
            if (setter) {
              setter({
                blob: '',
                fileName: path,
              })
            }
          }
        })

        const filteredData = data.vendor_document.filter(
          (itemObj: any) => itemObj.document_name === 'vendor_document'
        )
        const vendorDocumentValues = filteredData.map((itemObj: any) => ({
          id: itemObj.id,
          name: itemObj.path,
        }))
        setUploadFiles(vendorDocumentValues)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getStore = async () => {
    try {
      const response = await fetchStoresApi(apiUrl)
      if (Array.isArray(response.data?.data)) {
        const tempStore = response.data.data.map((itemObj: any) => ({
          value: itemObj.id,
          label: itemObj.store_name,
        }))
        setStore(tempStore)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getArea = async () => {
    try {
      const response = await fetchAreasApi(apiUrl)
      if (Array.isArray(response.data?.data)) {
        const tempArea = response.data.data.map((itemObj: any) => ({
          value: itemObj.id,
          label: itemObj.area,
        }))
        setServiceArea(tempArea)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getServiceType = async () => {
    try {
      const response = await fetchServiceTypesApi(apiUrl)
      if (Array.isArray(response.data?.data)) {
        const tempServiceType = response.data.data.map((itemObj: any) => ({
          value: itemObj.id,
          label: itemObj.service_type,
        }))
        setServiceType(tempServiceType)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getBank = async () => {
    try {
      const response = await fetchBanksApi(apiUrl)
      if (Array.isArray(response.data?.data)) {
        const tempBank = response.data.data.map((itemObj: any) => ({
          value: itemObj.id,
          label: itemObj.bank_name,
        }))
        setBank(tempBank)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchVendorData()
    getStore()
    getArea()
    getServiceType()
    getBank()
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const handleChangeJoinDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJoinDate(event.target.value)
  }

  const handleChangeVendorName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVendorName(event.target.value)
  }

  const handleChangeVendorPicName = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleChangeUsernameVendor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handleChangePasswordVendor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const handleChangeMaxOrder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxOrder(event.target.value)
  }

  const handleChangeNominalSurvey = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNominalSurvey(event.target.value)
  }

  const handleMarginTypeChange = (type: number) => {
    setMarginType(type)
  }

  useEffect(() => {
    setisActive((prevState) => ({
      ...prevState,
      compro: imageCompro.fileName !== '',
      suratPermohonan: imageSuratPermohonan.fileName !== '',
      pks: imagePksEvidence.fileName !== '',
      suip: imageSuipEvidence.fileName !== '',
    }))
  }, [
    imageCompro.fileName,
    imageSuratPermohonan.fileName,
    imagePksEvidence.fileName,
    imageSuipEvidence.fileName,
  ])

  useEffect(() => {
    if (isActive.ptkp === true) {
      setVendorType(1)
    } else {
      setVendorType(0)
    }
  }, [vendorType, isActive.ptkp])

  const handleFormCheckbox = (element: keyof CheckStates) => {
    setisActive({...isActive, [element]: !isActive[element]})
  }

  // Handle Upload KTP
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
    inputField?.click()
  }

  // Handle Upload NPWP
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
    inputField?.click()
  }

  // Handle Upload Compro
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
    inputField?.click()
  }

  // Handle Upload Surat Permohonan
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
    inputField?.click()
  }

  // Handle Upload PKS Evidence
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
    inputField?.click()
  }

  // Handle Upload SUIP Evidence
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
    inputField?.click()
  }

  // Handle Upload PTKP Evidence
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
    inputField?.click()
  }

  // Handle Change Upload File
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const file: Array<File | null> = new Array<File>()
      const existingFiles = [...uploadFiles]
      const mergedFiles = existingFiles.concat(file)

      const {length: existingFilesLength} = existingFiles
      const {length: fileListLength} = fileList

      for (let i = 0; i < fileListLength; i++) {
        mergedFiles[existingFilesLength + i] = fileList.item(i)
      }

      setUploadFiles(mergedFiles)
    }
  }

  const handleImageClick = () => {
    const inputField = document.getElementById('file-input') as HTMLInputElement
    inputField?.click()
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

  const handleChangeStoreId = (element: any) => {
    const updatedStore = element.map((option: any) => ({
      id: option?.id ?? null,
      value: option.value,
      label: option.label,
    }))
    setStoreValues(updatedStore)
  }

  const handleChangeServiceArea = (element: any) => {
    const updatedServiceArea = element.map((option: any) => ({
      id: option?.id ?? null,
      value: option.value,
      label: option.label,
    }))
    setServiceAreaValues(updatedServiceArea)
  }

  const handleChangeServiceType = (element: any) => {
    const updatedServiceType = element.map((option: any) => ({
      id: option?.id ?? null,
      value: option.value,
      label: option.label,
    }))
    setServiceTypeValues(updatedServiceType)
  }

  // Handle Submit Update Vendor
  const handleUpdateVendor = async () => {
    const isValid = validateVendorForm({
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
    })

    if (isValid) {
      setIsLoading(true)

      const formData = buildVendorFormData({
        vendorId,
        picName,
        vendorName,
        vendorAddress,
        phoneNumberVendor,
        emailVendor,
        joinDate,
        maxOrder,
        bankId,
        accountNumber,
        accountName,
        nominalSurvey,
        marginNominal,
        marginType,
        vendorType,
        username,
        ktpNumber,
        npwpNumber,
        password,
        npwpEvidence,
        ktpEvidence,
        isActive,
        comproEvidence,
        suratPermohonanEvidence,
        pksEvidence,
        suipEvidence,
        ptkpEvidence,
        uploadFiles,
        serviceAreaValues,
        serviceTypeValues,
        storeValues,
      })

      try {
        const response = await updateVendorApi(apiUrl, params.id, formData)

        if (response.data.status === 200 || response.data.status === 201) {
          Swal.fire({
            title: 'Success',
            text: 'Success Update Vendor',
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

        if (['Admin HO', 'Super User'].includes(userRole)) {
          navigate('/vendor/view-vendor')
        } else {
          window.location.reload()
        }
      } catch (error: any) {
        console.error(error)
        setIsLoading(false)

        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.message ?? 'Failed to update vendor',
          icon: 'error',
        })
      }
    }
  }

  return (
    <section id='update-vendor'>
      <Spin spinning={isLoadingPage} size='large' tip='Loading..'>
        <Card className='mb-5'>
          <Card.Header>
            <Card.Title>Informasi Vendor</Card.Title>
          </Card.Header>

          <Card.Body>
            <div className='row'>
              <VendorGeneralInfoSection
                userRole={userRole}
                vendorId={vendorId}
                joinDate={joinDate}
                today={today}
                handleChangeJoinDate={handleChangeJoinDate}
                vendorName={vendorName}
                handleChangeVendorName={handleChangeVendorName}
                isActive={isActive}
                picName={picName}
                handleChangeVendorPicName={handleChangeVendorPicName}
                phoneNumberVendor={phoneNumberVendor}
                handleChangeVendorPhoneNumber={handleChangeVendorPhoneNumber}
                emailVendor={emailVendor}
                handleChangeVendorEmail={handleChangeVendorEmail}
                serviceArea={serviceArea}
                serviceAreaValues={serviceAreaValues}
                handleChangeServiceArea={handleChangeServiceArea}
                serviceType={serviceType}
                serviceTypeValues={serviceTypeValues}
                handleChangeServiceType={handleChangeServiceType}
                store={store}
                storeValues={storeValues}
                handleChangeStoreId={handleChangeStoreId}
                animatedComponents={animatedComponents}
                vendorAddress={vendorAddress}
                handleChangeVendorAddress={handleChangeVendorAddress}
              />

              <VendorDocumentsSection
                userRole={userRole}
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
                isActive={isActive}
                handleFormCheckbox={handleFormCheckbox}
                imageCompro={imageCompro}
                handleUploadCompro={handleUploadCompro}
                handleFileChangeSuratPermohonan={handleFileChangeSuratPermohonan}
                imageSuratPermohonan={imageSuratPermohonan}
                handleUploadSuratPermohonan={handleUploadSuratPermohonan}
                handleFileChangePksEvidence={handleFileChangePksEvidence}
                imagePksEvidence={imagePksEvidence}
                handleUploadPksEvidence={handleUploadPksEvidence}
                handleFileChangeSuipEvidence={handleFileChangeSuipEvidence}
                imageSuipEvidence={imageSuipEvidence}
                handleUploadSuipEvidence={handleUploadSuipEvidence}
                handleFileChangePtkpEvidence={handleFileChangePtkpEvidence}
                imagePtkpEvidence={imagePtkpEvidence}
                handleUploadPtkpEvidence={handleUploadPtkpEvidence}
                evidenceRef={evidenceRef}
                handleImageClick={handleImageClick}
                handleFileChange={handleFileChange}
                uploadFiles={uploadFiles}
                handleRemoveFile={handleRemoveFile}
              />

              <VendorFinancialSection
                userRole={userRole}
                bank={bank}
                bankId={bankId}
                bankName={bankName}
                handleChangeSelectBank={handleChangeSelectBank}
                accountNumber={accountNumber}
                handleChangeAccountNumber={handleChangeAccountNumber}
                accountName={accountName}
                handleChangeAccountName={handleChangeAccountName}
                marginType={marginType}
                handleMarginTypeChange={handleMarginTypeChange}
                marginNominal={marginNominal}
                handleChangeMargin={handleChangeMargin}
                maxOrder={maxOrder}
                handleChangeMaxOrder={handleChangeMaxOrder}
                nominalSurvey={nominalSurvey}
                handleChangeNominalSurvey={handleChangeNominalSurvey}
              />
            </div>
          </Card.Body>
        </Card>

        <hr />

        <VendorProfileSection
          username={username}
          handleChangeUsernameVendor={handleChangeUsernameVendor}
          password={password}
          handleChangePasswordVendor={handleChangePasswordVendor}
        />

        <div className='d-flex justify-content-center mt-5'>
          <Button
            className='d-flex justify-content-center align-items-center m-0'
            variant='dark-primary'
            type='submit'
            disabled={isLoading}
            onClick={handleUpdateVendor}
          >
            {isLoading ? 'Saving..' : 'Save'}
          </Button>
        </div>
      </Spin>
    </section>
  )
}

export {UpdateVendorHO}
