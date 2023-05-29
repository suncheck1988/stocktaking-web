export interface PaymentMethod {
  id: string
  name: string
  status: PaymentMethodStatus
}

export enum PaymentMethodStatus {
  Active = 100,
  Inactive = 200
}
export enum PaymentMethodStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface PaymentMethodCreateDto {
  name?: string
}

export interface PaymentMethodUpdateDto {
  id?: string
  name?: string
}

export interface PaymentMethodSearchDto {
  id?: string
  name?: string
  status?: number
  withoutPagination?: boolean
  page?: number
}
