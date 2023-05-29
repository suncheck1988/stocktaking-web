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
        <template v-if="deliveryType.status === DeliveryTypeStatus.Active">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="DeliveryTypeStatusLabel.Active">
        </template>
        <template v-if="deliveryType.status === DeliveryTypeStatus.Inactive">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="DeliveryTypeStatusLabel.Inactive">
        </template>

        <label for="delivery-type-status" class="form-label">Статус</label>
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
import useDeliveryTypes from './../../../repositories/delivery-types'
import { UserPermission} from '@/models/user'
import {DeliveryTypeUpdateDto, DeliveryTypeStatus, DeliveryTypeStatusLabel} from '@/models/delivery-type'
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

    const { deliveryType, fetchDeliveryType, updateDeliveryType } = useDeliveryTypes()

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const formData = reactive<DeliveryTypeUpdateDto>({})

    fetchDeliveryType(route.params.id as string).then(() => {
      if (deliveryType) {
        formData.id = deliveryType.id
        formData.name = deliveryType.name
      }
    })

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        await updateDeliveryType(formData);
        isLoading.value = false
        await push({name: 'AppDeliveryTypeIndex'})
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
      deliveryType,
      errors,
      DeliveryTypeStatus,
      DeliveryTypeStatusLabel,
      handleSubmit,
      hasAccess: AuthService.hasPermission(UserPermission.SectionDeliveryTypes)
    }
  }
})
</script>
