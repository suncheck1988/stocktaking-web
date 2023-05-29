import {reactive, ref} from 'vue'
import api from '../api'
import {PaymentMethod, PaymentMethodCreateDto, PaymentMethodUpdateDto, PaymentMethodSearchDto} from "@/models/payment-method";

export default function usePaymentMethods() {
  const paymentMethod = reactive<PaymentMethod>({
    id: '',
    name: '',
    status: 0
  })
  const paymentMethods = ref<PaymentMethod[]>([])
  const pageCount = ref(0)

  async function fetchPaymentMethods (searchDto?: PaymentMethodSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/payment-method', query)
    const data = await result.data

    paymentMethods.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchPaymentMethod (id: string): Promise<void> {
    await api.get('v1/payment-method/' + id).then(response => {
      paymentMethod.id = response.id
      paymentMethod.name = response.name
      paymentMethod.status = response.status
    })
  }

  async function createPaymentMethod (paymentMethod: PaymentMethodCreateDto): Promise<void> {
    const data = Object.assign({}, paymentMethod)
    await api.post('v1/payment-method', data)
  }

  async function updatePaymentMethod (paymentMethod: PaymentMethodUpdateDto): Promise<void> {
    const data = Object.assign({}, paymentMethod)
    await api.patch('v1/payment-method/' + paymentMethod.id, data)
  }

  async function activatePaymentMethod (id: string): Promise<void> {
    await api.post('v1/payment-method/' + id + '/active', null)
  }

  async function inactivePaymentMethod (id: string): Promise<void> {
    await api.post('v1/payment-method/' + id + '/inactive', null)
  }

  return {
    paymentMethods,
    paymentMethod,
    pageCount,
    fetchPaymentMethods,
    fetchPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    activatePaymentMethod,
    inactivePaymentMethod
  }
}
