<template>
  <div v-if="hasAccess && formData.id">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent>
      <div class="form-floating mb-3">
        <input-with-validation
          :id="'name-validation'"
          :name="'Имя'"
          :errors="errors"
          :value="'name'"
          :inputValue="formData.name"
          v-model="formData.name"
        />
      </div>

      <div class="form-floating mb-3">
        <template v-if="paymentMethod.status === PaymentMethodStatus.Active">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="PaymentMethodStatusLabel.Active">
        </template>
        <template v-if="paymentMethod.status === PaymentMethodStatus.Inactive">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="PaymentMethodStatusLabel.Inactive">
        </template>

        <label for="payment-method-status" class="form-label">Статус</label>
      </div>

      <button @click="handleSubmit" class="btn btn-primary" :disabled="isLoading">
        <div v-if="isLoading" class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Сохранить
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import usePaymentMethods from './../../../repositories/payment-methods'
import { UserPermission} from '@/models/user'
import {PaymentMethodUpdateDto, PaymentMethodStatus, PaymentMethodStatusLabel} from '@/models/payment-method'
import {Error} from '@/models/error'
import AuthService from '../../../auth/auth-service'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'

export default defineComponent({
  components: {
    InputWithValidation,
    ErrorMessage
  },
  setup () {
    const route = useRoute()
    const { push } = useRouter()

    const { paymentMethod, fetchPaymentMethod, updatePaymentMethod } = usePaymentMethods()

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const formData = reactive<PaymentMethodUpdateDto>({})

    fetchPaymentMethod(route.params.id as string).then(() => {
      if (paymentMethod) {
        formData.id = paymentMethod.id
        formData.name = paymentMethod.name
      }
    })

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        await updatePaymentMethod(formData);
        isLoading.value = false
        await push({name: 'AppPaymentMethodIndex'})
      } catch (e: any) {
        isLoading.value = false
        if (e instanceof Response) {
          const result = await e.json()
          errors.value = result.errors
        } else {
          errors.value = [{ message: 'Неизвестная ошибка' }]
        }
      }
    }

    return {
      isLoading,
      formData,
      paymentMethod,
      errors,
      PaymentMethodStatus,
      PaymentMethodStatusLabel,
      handleSubmit,
      hasAccess: AuthService.hasPermission(UserPermission.SectionPaymentMethods)
    }
  }
})
</script>
