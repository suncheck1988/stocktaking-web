import { reactive, ref } from 'vue'
import api from '../api'
import { Position, PositionCreateDto, PositionUpdateDto, PositionSearchDto } from "@/models/position";
import {Category} from "@/models/category";
import {Unit} from "@/models/unit";

export default function usePositions() {
  const position = reactive<Position>({
    id: '',
    name: '',
    price: 0,
    unit: reactive<Unit>({
      id: '',
      name: '',
      status: 0
    }),
    balance: [],
    category: reactive<Category>({
      id: '',
      name: '',
      children: [],
      status: 0,
    }),
    status: 0
  })
  const positions = ref<Position[]>([])
  const pageCount = ref(0)

  async function fetchPositions (searchDto?: PositionSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/position', query)
    const data = await result.data

    positions.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchPosition (id: string): Promise<void> {
    await api.get('v1/position/' + id).then(response => {
      position.id = response.id
      position.name = response.name
      position.description = response.description
      position.price = response.price
      position.unit = response.unit
      position.vat = response.vat
      position.balance = response.balance
      position.category = response.category
      position.status = response.status
    })
  }

  async function createPosition (position: PositionCreateDto): Promise<void> {
    const data = Object.assign({}, position)
    await api.post('v1/position', data)
  }

  async function updatePosition (position: PositionUpdateDto): Promise<void> {
    const data = Object.assign({}, position)
    await api.patch('v1/position/' + position.id, data)
  }

  async function activatePosition (id: string): Promise<void> {
    await api.post('v1/position/' + id + '/active', null)
  }

  async function inactivePosition (id: string): Promise<void> {
    await api.post('v1/position/' + id + '/inactive', null)
  }

  return {
    positions,
    position,
    pageCount,
    fetchPositions,
    fetchPosition,
    createPosition,
    updatePosition,
    activatePosition,
    inactivePosition
  }
}
