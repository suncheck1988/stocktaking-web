import { Warehouse } from "@/models/warehouse";
import { Category } from "@/models/category";
import {Vat} from "@/models/vat";
import {Unit} from "@/models/unit";

export interface Position {
  id: string
  name: string
  description?: string
  price: number
  vat?: Vat
  unit: Unit
  balance: PositionBalance[]
  category: Category
  status: PositionStatus
}
export interface PositionBalance {
  id: string
  warehouse: Warehouse
  quantity: number
  status: PositionBalanceStatus
}

export enum PositionStatus {
  Active = 100,
  Inactive = 200
}
export enum PositionStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}
export enum PositionBalanceStatus {
  Active = 100,
  Inactive = 200
}
export enum PositionBalanceStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface PositionCreateDto {
  categoryId?: string
  name?: string
  description?: string
  price?: number
  vatId?: string
  unitId?: string
  balance?: []
}

export interface PositionUpdateDto {
  id?: string
  categoryId?: string
  name?: string
  description?: string
  price?: number
  vatId?: string
  unitId?: string
  existsBalance?: []
  newBalance?: []
}

export interface PositionSearchDto {
  id?: string
  name?: string
  status?: number
  page?: number
}
