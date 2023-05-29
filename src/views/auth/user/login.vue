<template>
  <form @submit.prevent="handleSubmit">
    <error-message :errors="errors"/>

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

    <button class="w-100 btn btn-primary btn-block mb-4" type="submit">
      <div v-if="isLoading" class="spinner-grow spinner-grow-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <template v-else>Войти</template>
    </button>

    <template v-if="isPasswordIncorrect">
      <div class="text-center">
        <p><router-link :to="{ name: 'AuthUserResetPasswordRequest' }">Восстановить доступ</router-link></p>
      </div>
    </template>

    <div class="text-center">
      <p>Не зарегистрированы? <router-link :to="{ name: 'AuthRegistrationRequest' }">Регистрация</router-link></p>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../../api'
import { LoginDto } from '@/models/auth'
import {Error, ErrorCode} from '@/models/error'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import ErrorMessage from '../../../components/UI/message/error-message.vue'

export default defineComponent({
  components: {
    InputWithValidation,
    ErrorMessage
  },
  setup () {
    const router = useRouter()

    const isLoading = ref(false)

    const formData = reactive<LoginDto>({})

    const errors = ref<Error[]>([])

    const errorMessage = ref('')

    const isPasswordIncorrect = ref(false)

    const handleSubmit = async () => {
      isLoading.value = true
      errors.value = []
      errorMessage.value = ''
      isPasswordIncorrect.value = false

      try {
        const response = await api.post('v1/auth/login/request', formData)
        const accessToken = response['accessToken']

        localStorage.setItem('accessToken', accessToken)

        await router.push({ name: 'AppIndex' })

        isLoading.value = false
      } catch (e: any) {
        isLoading.value = false

        if (e instanceof Response) {
          const result = await e.json()
          errors.value = result.errors

          if (errors.value[0].code === ErrorCode.PasswordIncorrect) {
            isPasswordIncorrect.value = true
          }
        } else {
          errors.value = [{ message: 'Неизвестная ошибка' }]
        }
      }
    }

    return {
      isLoading,
      formData,
      errors,
      errorMessage,
      isPasswordIncorrect,
      handleSubmit
    }
  }
});
</script>
