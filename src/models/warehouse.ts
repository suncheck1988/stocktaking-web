export interface Warehouse {
  id: string
  name: string
  status: WarehouseStatus
}

export enum WarehouseStatus {
  Active = 100,
  Inactive = 200
}
export enum WarehouseStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface WarehouseCreateDto {
  name?: string
}

export interface WarehouseUpdateDto {
  id?: string
  name?: string
}

export interface WarehouseSearchDto {
  id?: string
  name?: string
  status?: number
  withoutBalanceByPositionId?: string
  withoutPagination?: boolean
  page?: number
}
