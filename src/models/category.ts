export interface Category {
  id: string
  name: string
  children: Category[]
  parent?: Category
  status: CategoryStatus
}

export interface CategoryTree {
  id: string
  name: string
  children: CategoryShort[]
}

export interface CategoryShort {
  id: string
  name: string
}

export enum CategoryStatus {
  Active = 100,
  Inactive = 200
}
export enum CategoryStatusLabel {
  Active = 'Активен',
  Inactive = 'Не активен'
}

export interface CategoryCreateDto {
  name?: string
  children?: []
}

export interface CategoryUpdateDto {
  id?: string
  name?: string
  parentId?: string
  existsChildren?: []
  newChildren?: []
}

export interface CategorySearchDto {
  id?: string
  name?: string
  onlyRoot?: boolean
  status?: number
  withoutPagination?: boolean
  page?: number
}
