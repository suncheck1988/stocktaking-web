import {User, UserPermission} from "@/models/user";
import { Client } from "@/models/client";

export interface Employee {
  id: string
  user: User
  client: Client
  isFinanciallyResponsiblePerson: boolean
}

export interface EmployeeDto {
  name?: string
  email?: string
  password?: string
  permissions?: UserPermission[]
  isFinanciallyResponsiblePerson?: boolean
}

export interface EmployeeSearchDto {
  id?: string
  name?: string
  status?: number
  withoutPagination?: boolean
  page?: number
}
