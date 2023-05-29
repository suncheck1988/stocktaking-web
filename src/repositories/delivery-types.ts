import {reactive, ref} from 'vue'
import api from '../api'
import {DeliveryType, DeliveryTypeCreateDto, DeliveryTypeUpdateDto, DeliveryTypeSearchDto} from "@/models/delivery-type";

export default function useDeliveryTypes() {
  const deliveryType = reactive<DeliveryType>({
    id: '',
    name: '',
    status: 0
  })
  const deliveryTypes = ref<DeliveryType[]>([])
  const pageCount = ref(0)

  async function fetchDeliveryTypes (searchDto?: DeliveryTypeSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/delivery-type', query)
    const data = await result.data

    deliveryTypes.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchDeliveryType (id: string): Promise<void> {
    await api.get('v1/delivery-type/' + id).then(response => {
      deliveryType.id = response.id
      deliveryType.name = response.name
      deliveryType.status = response.status
    })
  }

  async function createDeliveryType (deliveryType: DeliveryTypeCreateDto): Promise<void> {
    const data = Object.assign({}, deliveryType)
    await api.post('v1/delivery-type', data)
  }

  async function updateDeliveryType (deliveryType: DeliveryTypeUpdateDto): Promise<void> {
    const data = Object.assign({}, deliveryType)
    await api.patch('v1/delivery-type/' + deliveryType.id, data)
  }

  async function activateDeliveryType (id: string): Promise<void> {
    await api.post('v1/delivery-type/' + id + '/active', null)
  }

  async function inactiveDeliveryType (id: string): Promise<void> {
    await api.post('v1/delivery-type/' + id + '/inactive', null)
  }

  return {
    deliveryTypes,
    deliveryType,
    pageCount,
    fetchDeliveryTypes,
    fetchDeliveryType,
    createDeliveryType,
    updateDeliveryType,
    activateDeliveryType,
    inactiveDeliveryType
  }
}
