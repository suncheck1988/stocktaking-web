<template>
  <success-message :message="successMessage"/>
  <error-message :errors="errors"/>

  <form @submit.prevent="handleSubmit">
    <div class="form-floating mb-3">
      <input-with-validation
        :id="'email-validation'"
        :name="'Электронная почта'"
        :errors="errors"
        :value="'email'"
        v-model="formData.email"
      />
    </div>

    <button class="w-100 btn btn-primary btn-block mb-4" type="submit">
      <div v-if="isLoading" class="spinner-grow spinner-grow-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <template v-else>Восстановить доступ</template>
    </button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import api from '../../../../api'
import { ResetPasswordRequestDto} from '@/models/auth'
import { Error } from '@/models/error'
import SuccessMessage from '../../../../components/UI/message/success-message.vue'
import ErrorMessage from '../../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../../components/UI/blocks/input-with-validation.vue'

export default defineComponent({
  components: {
    InputWithValidation,
    ErrorMessage,
    SuccessMessage
  },
  setup () {
    const isLoading = ref(false)
    const errors = ref<Error[]>([])
    const successMessage = ref('')
    const formData = reactive<ResetPasswordRequestDto>({})

    const handleSubmit = async () => {
      isLoading.value = true
      errors.value = []
      successMessage.value = ''

      try {
        await api.post('v1/user/reset-password/request', formData)

        successMessage.value = 'Письмо для подтверждения восстановления доступа отправлено на ' + formData.email

        isLoading.value = false
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
      successMessage,
      handleSubmit
    }
  }
})
</script>
