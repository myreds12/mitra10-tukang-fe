import {Vendor} from '../../../../interfaces/vendor'

export interface StoreSelect {
  id?: number
  value: number
  label: string
}

export interface ServiceArea {
  id?: number
  value: number
  label: string
}

export interface ServiceAreaValues {
  id?: number
  value: number
  label: string
}

export interface ServiceType {
  id?: number
  value: number
  label: string
}

export interface ServiceTypeValues {
  id?: number
  value: number
  label: string
}

export interface Bank {
  value: any
  label: string
}

export interface CheckStates {
  compro: boolean
  suratPermohonan: boolean
  pks: boolean
  suip: boolean
  ptkp: boolean
}

export interface UpdateVendorHOProps {
  updatePageTitle: (vendor: Vendor) => void
}
