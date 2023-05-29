<template>
  <div v-if="hasAccess">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent>
      <div class="form-floating mb-3">
        <input-with-validation
          :id="'name-validation'"
          :name="'Имя'"
          :errors="errors"
          :value="'name'"
          v-model="formData.name"
        />
      </div>

      <button @click="handleSubmitCreate" class="btn btn-primary" :disabled="isLoading">
        <div v-if="isLoading" class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Создать
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue'
import { useRouter } from 'vue-router'
import useDeliveryTypes from './../../../repositories/delivery-types'
import { UserPermission } from '@/models/user'
import { Error } from '@/models/error'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import AuthService from '../../../auth/auth-service'
import { DeliveryTypeCreateDto } from "@/models/delivery-type";

export default defineComponent({
  components: {
    InputWithValidation,
    ErrorMessage
  },
  setup () {
    const { push } = useRouter()

    const { createDeliveryType } = useDeliveryTypes()
    const formData = reactive<DeliveryTypeCreateDto>({})
    const isLoading = ref<boolean>(false)

    const errors = ref<Error[]>([])

    async function handleSubmitCreate () {
      isLoading.value = true
      errors.value = []

      try {
        await createDeliveryType(formData);
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
      errors,
      handleSubmitCreate,
      hasAccess: AuthService.hasPermission(UserPermission.SectionDeliveryTypes)
    }
  }
})
</script>
