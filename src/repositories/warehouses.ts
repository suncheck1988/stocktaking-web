import {reactive, ref} from 'vue'
import api from '../api'
import {Warehouse, WarehouseCreateDto, WarehouseUpdateDto, WarehouseSearchDto} from "@/models/warehouse";

export default function useWarehouses() {
  const warehouse = reactive<Warehouse>({
    id: '',
    name: '',
    status: 0
  })
  const warehouses = ref<Warehouse[]>([])
  const pageCount = ref(0)

  async function fetchWarehouses (searchDto?: WarehouseSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      withoutBalanceByPositionId: searchDto?.withoutBalanceByPositionId || '',
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/warehouse', query)
    const data = await result.data

    warehouses.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchWarehouse (id: string): Promise<void> {
    await api.get('v1/warehouse/' + id).then(response => {
      warehouse.id = response.id
      warehouse.name = response.name
      warehouse.status = response.status
    })
  }

  async function createWarehouse (warehouse: WarehouseCreateDto): Promise<void> {
    const data = Object.assign({}, warehouse)
    await api.post('v1/warehouse', data)
  }

  async function updateWarehouse (warehouse: WarehouseUpdateDto): Promise<void> {
    const data = Object.assign({}, warehouse)
    await api.patch('v1/warehouse/' + warehouse.id, data)
  }

  async function activateWarehouse (id: string): Promise<void> {
    await api.post('v1/warehouse/' + id + '/active', null)
  }

  async function inactiveWarehouse (id: string): Promise<void> {
    await api.post('v1/warehouse/' + id + '/inactive', null)
  }

  return {
    warehouses,
    warehouse,
    pageCount,
    fetchWarehouses,
    fetchWarehouse,
    createWarehouse,
    updateWarehouse,
    activateWarehouse,
    inactiveWarehouse
  }
}
