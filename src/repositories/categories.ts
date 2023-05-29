import {reactive, ref} from 'vue'
import api from '../api'
import {Category, CategoryTree, CategoryCreateDto, CategoryUpdateDto, CategorySearchDto} from "@/models/category";

export default function useCategories() {
  const category = reactive<Category>({
    id: '',
    name: '',
    children: [],
    status: 0
  })
  const categories = ref<Category[]>([])
  const categoriesTree = ref<CategoryTree[]>([])
  const pageCount = ref(0)

  async function fetchCategories (searchDto?: CategorySearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      onlyRoot: searchDto?.onlyRoot || 0,
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/category', query)
    const data = await result.data

    categories.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchCategoriesTree (): Promise<void> {
    const result = await api.getWithHeaders('v1/category/tree')
    const data = await result.data

    categoriesTree.value = data.data
  }

  async function fetchCategory (id: string): Promise<void> {
    await api.get('v1/category/' + id).then(response => {
      category.id = response.id
      category.name = response.name
      category.children = response.children
      category.parent = response.parent
      category.status = response.status
    })
  }

  async function createCategory (category: CategoryCreateDto): Promise<void> {
    const data = Object.assign({}, category)
    await api.post('v1/category', data)
  }

  async function updateCategory (category: CategoryUpdateDto): Promise<void> {
    const data = Object.assign({}, category)
    await api.patch('v1/category/' + category.id, data)
  }

  async function activateCategory (id: string): Promise<void> {
    await api.post('v1/category/' + id + '/active', null)
  }

  async function inactiveCategory (id: string): Promise<void> {
    await api.post('v1/category/' + id + '/inactive', null)
  }

  return {
    categories,
    categoriesTree,
    category,
    pageCount,
    fetchCategories,
    fetchCategoriesTree,
    fetchCategory,
    createCategory,
    updateCategory,
    activateCategory,
    inactiveCategory
  }
}
