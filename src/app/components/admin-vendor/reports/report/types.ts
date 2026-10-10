export interface ReportVendorProps {
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
