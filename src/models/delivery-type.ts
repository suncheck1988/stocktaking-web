export interface DeliveryType {
  id: string
  name: string
  status: DeliveryTypeStatus
}

export enum DeliveryTypeStatus {
  Active = 100,
  Inactive = 200
}
export enum DeliveryTypeStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface DeliveryTypeCreateDto {
  name?: string
}

export interface DeliveryTypeUpdateDto {
  id?: string
  name?: string
}

export interface DeliveryTypeSearchDto {
  id?: string
  name?: string
  status?: number
  withoutPagination?: boolean
  page?: number
}
