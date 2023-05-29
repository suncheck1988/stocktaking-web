export interface Vat {
  id: string
  value: number
  isDefault: boolean
  status: VatStatus
}

export enum VatStatus {
  Active = 100,
  Inactive = 200
}
export enum VatStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface VatCreateDto {
  value?: number
  isDefault?: boolean
}

export interface VatUpdateDto {
  id?: string
  value?: number
  isDefault?: boolean
}

export interface VatSearchDto {
  id?: string
  isDefault?: boolean
  status?: number
  withoutPagination?: boolean
  page?: number
}
