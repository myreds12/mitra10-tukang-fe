export type ReportHOProps = {
  endpoint: string
  statusName: string
  headerColor: string
  title: string
  params: string
}

export interface Status {
  value: number
  category: string
}

export interface StoreItem {
  value: number | null
  label: string
  area_id: number | null
}

export interface AreaItem {
  value: number | null
  label: string
}
