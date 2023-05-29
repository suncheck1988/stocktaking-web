export enum UserRole {
  Admin = 100,
  Client = 200,
  ClientEmployee = 300
}

export enum UserRoleLabel {
  Admin = 'Администратор',
  Client = 'Клиент',
  ClientEmployee = 'Сотрудник'
}

export enum UserStatus {
  New = 100,
  Active = 200,
  Blocked = 300
}

export enum UserStatusLabel {
  New = 'Не активен (не подтвержден по email)',
  Active = 'Активен',
  Blocked = 'Заблокирован'
}

export enum UserPermission {
  SectionUsers = 100,
  SectionCategories = 200,
  SectionWarehouses = 300,
  SectionPositions = 400,
  SectionPositionBalances = 500,
  SectionPositionUnits = 600,
  SectionFixedAssets = 700,
  SectionCounterparties = 800,
  SectionOrders = 900,
  SectionPaymentMethods = 1000,
  SectionDeliveryTypes = 1100,
  SectionEmployees = 1200,
  SectionVats = 1300
}

export enum UserPermissionLabel {
  SectionUsers = 'Раздел для работы с пользователями',
  SectionCategories = 'Раздел для работы с категориями',
  SectionWarehouses = 'Раздел для работы со складами',
  SectionPositions = 'Раздел для работы с позициями',
  SectionPositionBalances = 'Раздел для работы с балансом позиций',
  SectionPositionUnits = 'Раздел для работы с единицами измерения',
  SectionFixedAssets = 'Раздел для работы с основными средствами',
  SectionCounterparties = 'Раздел для работы с контрагентами',
  SectionOrders = 'Раздел для работы с заказами',
  SectionPaymentMethods = 'Раздел для работы с методами оплаты',
  SectionDeliveryTypes = 'Раздел для работы с типами доставки',
  SectionEmployees = 'Раздел для работы с сотрудниками',
  SectionVats = 'Раздел для работы с НДС'
}

export interface User {
  id: string
  name: string
  email: string
  permissions?: UserPermission[]
  role: UserRole
  status: UserStatus
}
export interface UserShort {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

export interface UserSearchDto {
  id?: string
  name?: string
  role?: number
  status?: number
  page?: number
}
