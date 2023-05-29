<template>
  <success-message :message="successMessage"/>
  <error-message :errors="errors"/>

  <form @submit.prevent="handleSubmit">
    <div class="form-floating mb-3">
      <input-with-validation
        :id="'name-validation'"
        :name="'Имя'"
        :errors="errors"
        :value="'name'"
        v-model="formData.name"
      />
    </div>

    <div class="form-floating mb-3">
      <input-with-validation
        :id="'email-validation'"
        :name="'Электронная почта'"
        :errors="errors"
        :value="'email'"
        v-model="formData.email"
      />
    </div>

    <div class="form-floating mb-3">
      <input-with-validation
        :id="'password-validation'"
        :type="'password'"
        :name="'Пароль'"
        :errors="errors"
        :value="'password'"
        v-model="formData.password"
      />
    </div>
    <div class="form-floating mb-3">
      <input-with-validation
        :id="'password-validation-confirm'"
        :type="'password'"
        :name="'Подтверждение пароля'"
        :errors="errors"
        :value="'passwordConfirm'"
        v-model="passwordConfirm"
      />
    </div>

    <button class="w-100 btn btn-primary btn-block mb-4" type="submit">
      <div v-if="isLoading" class="spinner-grow spinner-grow-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <template v-else>Регистрация</template>
    </button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import api from '../../../api'
import { RegistrationRequestDto } from '@/models/auth'
import { Error } from '@/models/error'
import SuccessMessage from '../../../components/UI/message/success-message.vue'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'

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
    const passwordConfirm = ref(undefined)
    const formData = reactive<RegistrationRequestDto>({})

    const handleSubmit = async () => {
      isLoading.value = true
      errors.value = []
      successMessage.value = ''

      if (passwordConfirm.value !== formData.password) {
        errors.value[0] = {
          property: 'passwordConfirm',
          message: 'Пароль не совпадает',
        }

        isLoading.value = false

        return
      }

      try {
        await api.post('v1/auth/registration/client/request', formData)

        successMessage.value = 'Письмо для подтверждения отправлено на ' + formData.email

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
      passwordConfirm,
      handleSubmit
    }
  }
})
</script>
