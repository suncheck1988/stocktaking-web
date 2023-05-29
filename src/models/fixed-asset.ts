import { Warehouse } from "@/models/warehouse";
import { Category } from "@/models/category";
import {Vat} from "@/models/vat";
import {Unit} from "@/models/unit";
import {UserShort} from "@/models/user";
import {Counterparty} from "@/models/counterparty";

export interface FixedAsset {
  id: string
  financiallyResponsiblePerson: UserShort
  category: Category
  counterparty?: Counterparty
  warehouse?: Warehouse
  name: string
  description?: string
  serialNumber: string
  inventoryNumber: string
  unit: Unit
  purchasePrice: number
  vat?: Vat
  residualValue: number
  inUseAt?: string
  decommissionedAt?: string
  status: FixedAssetStatus
}

export enum FixedAssetStatus {
  InUse = 100,
  Storage = 200,
  Decommissioned = 300
}
export enum FixedAssetStatusLabel {
  InUse = 'В использовании',
  Storage = 'На складе',
  Decommissioned = 'Списан'
}

export interface FixedAssetCreateDto {
  financiallyResponsiblePersonId?: string
  categoryId?: string
  counterpartyId?: string
  warehouseId?: string
  name?: string
  description?: string
  serialNumber?: string
  inventoryNumber?: string
  unitId?: string
  purchasePrice?: number
  vatId?: string
  status?: FixedAssetStatus
}

export interface FixedAssetUpdateDto {
  id?: string
  financiallyResponsiblePersonId?: string
  categoryId?: string
  counterpartyId?: string
  warehouseId?: string
  name?: string
  description?: string
  serialNumber?: string
  inventoryNumber?: string
  unitId?: string
  purchasePrice?: number
  vatId?: string
}

export interface FixedAssetSearchDto {
  id?: string
  categoryId?: string
  warehouseId?: string
  name?: string
  serialNumber?: string
  status?: number
  page?: number
}
