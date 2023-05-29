<template>
  <success-message :message="successMessage"/>
  <error-message :errors="errors"/>

  <template v-if="successMessage === ''">
    <form @submit.prevent="handleSubmit">
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
        <template v-else>Изменить пароль</template>
      </button>
    </form>
  </template>

  <template v-if="successMessage !== ''">
    <div class="text-center">
      <p><router-link :to="{ name: 'AuthUserLogin' }">Авторизация</router-link></p>
    </div>
  </template>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue'
import api from '../../../../api'
import { Error, ErrorCode } from '@/models/error'
import SuccessMessage from '../../../../components/UI/message/success-message.vue'
import ErrorMessage from '../../../../components/UI/message/error-message.vue'
import { ResetPasswordConfirmDto } from "@/models/auth";
import { useRoute } from "vue-router";
import InputWithValidation from '../../../../components/UI/blocks/input-with-validation.vue'

export default defineComponent({
  components: {
    ErrorMessage,
    SuccessMessage,
    InputWithValidation
  },
  setup () {
    const route = useRoute()

    const isLoading = ref(false)
    const errors = ref<Error[]>([])
    const successMessage = ref('')
    const passwordConfirm = ref(undefined)
    const formData = reactive<ResetPasswordConfirmDto>({
      token: route.query.token as any
    })

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
        await api.post('v1/user/reset-password/confirm', formData)

        successMessage.value = 'Доступ к учётной записи успешно восстановлен'

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
      handleSubmit,
      isLoading,
      formData,
      errors,
      successMessage,
      passwordConfirm
    }
  }
})
</script>
