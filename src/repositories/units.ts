import {reactive, ref} from 'vue'
import api from '../api'
import {Unit, UnitCreateDto, UnitUpdateDto, UnitSearchDto} from "@/models/unit";

export default function useUnits() {
  const unit = reactive<Unit>({
    id: '',
    name: '',
    status: 0
  })
  const units = ref<Unit[]>([])
  const pageCount = ref(0)

  async function fetchUnits (searchDto?: UnitSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/unit', query)
    const data = await result.data

    units.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchUnit (id: string): Promise<void> {
    await api.get('v1/unit/' + id).then(response => {
      unit.id = response.id
      unit.name = response.name
      unit.status = response.status
    })
  }

  async function createUnit (unit: UnitCreateDto): Promise<void> {
    const data = Object.assign({}, unit)
    await api.post('v1/unit', data)
  }

  async function updateUnit (unit: UnitUpdateDto): Promise<void> {
    const data = Object.assign({}, unit)
    await api.patch('v1/unit/' + unit.id, data)
  }

  async function activateUnit (id: string): Promise<void> {
    await api.post('v1/unit/' + id + '/active', null)
  }

  async function inactiveUnit (id: string): Promise<void> {
    await api.post('v1/unit/' + id + '/inactive', null)
  }

  return {
    units,
    unit,
    pageCount,
    fetchUnits,
    fetchUnit,
    createUnit,
    updateUnit,
    activateUnit,
    inactiveUnit
  }
}
