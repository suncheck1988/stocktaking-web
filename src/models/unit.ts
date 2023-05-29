export interface Unit {
  id: string
  name: string
  status: UnitStatus
}

export enum UnitStatus {
  Active = 100,
  Inactive = 200
}
export enum UnitStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface UnitCreateDto {
  name?: string
}

export interface UnitUpdateDto {
  id?: string
  name?: string
}

export interface UnitSearchDto {
  id?: string
  name?: string
  status?: number
  withoutPagination?: boolean
  page?: number
}
