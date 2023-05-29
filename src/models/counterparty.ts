import { Client } from "@/models/client";

export interface Counterparty {
  id: string
  client: Client
  name: string
  email?: string
  status: CounterpartyStatus
}

export enum CounterpartyStatus {
  Active = 100,
  Inactive = 200
}
export enum CounterpartyStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface CounterpartyDto {
  name?: string
  email?: string
}

export interface CounterpartySearchDto {
  id?: string
  name?: string
  email?: string
  status?: number
  page?: number
}
