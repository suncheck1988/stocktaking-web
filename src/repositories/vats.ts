import {reactive, ref} from 'vue'
import api from '../api'
import {Vat, VatCreateDto, VatUpdateDto, VatSearchDto} from "@/models/vat";

export default function useVats() {
  const vat = reactive<Vat>({
    id: '',
    value: 0,
    isDefault: false,
    status: 0
  })
  const vats = ref<Vat[]>([])
  const pageCount = ref(0)

  async function fetchVats (searchDto?: VatSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      id: searchDto?.id || '',
      isDefault: searchDto?.isDefault || '',
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/vat', query)
    const data = await result.data

    vats.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchVat (id: string): Promise<void> {
    await api.get('v1/vat/' + id).then(response => {
      vat.id = response.id
      vat.value = response.value
      vat.isDefault = response.isDefault
      vat.status = response.status
    })
  }

  async function createVat (vat: VatCreateDto): Promise<void> {
    const data = Object.assign({}, vat)
    await api.post('v1/vat', data)
  }

  async function updateVat (vat: VatUpdateDto): Promise<void> {
    const data = Object.assign({}, vat)
    await api.patch('v1/vat/' + vat.id, data)
  }

  async function activateVat (id: string): Promise<void> {
    await api.post('v1/vat/' + id + '/active', null)
  }

  async function inactiveVat (id: string): Promise<void> {
    await api.post('v1/vat/' + id + '/inactive', null)
  }

  return {
    vats,
    vat,
    pageCount,
    fetchVats,
    fetchVat,
    createVat,
    updateVat,
    activateVat,
    inactiveVat
  }
}
