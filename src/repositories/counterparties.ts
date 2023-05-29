import {reactive, ref} from 'vue'
import api from '../api'
import {Counterparty, CounterpartyDto, CounterpartySearchDto} from "@/models/counterparty";

export default function useCounterparties() {
  const counterparty = reactive<Counterparty>({
    id: '',
    name: '',
    status: 0
  })
  const counterparties = ref<Counterparty[]>([])
  const pageCount = ref(0)

  async function fetchCounterparties (searchDto?: CounterpartySearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      email: searchDto?.email || '',
      status: searchDto?.status || ''
    }
    const result = await api.getWithHeaders('v1/counterparty', query)
    const data = await result.data

    counterparties.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchCounterparty (id: string): Promise<void> {
    await api.get('v1/counterparty/' + id).then(response => {
      counterparty.id = response.id
      counterparty.name = response.name
      counterparty.email = response.email
      counterparty.status = response.status
    })
  }

  async function createCounterparty (counterparty: CounterpartyDto): Promise<void> {
    const data = Object.assign({}, counterparty)
    await api.post('v1/counterparty', data)
  }

  async function updateCounterparty (counterparty: Counterparty): Promise<void> {
    const data = Object.assign({}, counterparty)
    await api.patch('v1/counterparty/' + counterparty.id, data)
  }

  async function activateCounterparty (id: string): Promise<void> {
    await api.post('v1/counterparty/' + id + '/active', null)
  }

  async function inactiveCounterparty (id: string): Promise<void> {
    await api.post('v1/counterparty/' + id + '/inactive', null)
  }

  return {
    counterparties,
    counterparty,
    pageCount,
    fetchCounterparties,
    fetchCounterparty,
    createCounterparty,
    updateCounterparty,
    activateCounterparty,
    inactiveCounterparty
  }
}
