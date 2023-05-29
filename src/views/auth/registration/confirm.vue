<template>
  <success-message :message="successMessage"/>
  <error-message :errors="errors"/>

  <template v-if="successMessage">
    <div class="text-center">
      <p><router-link :to="{ name: 'AuthUserLogin' }">Авторизация</router-link></p>
    </div>
  </template>
  <template v-else-if="isEmailConfirmExpired">
    <div class="text-center">
      <p><router-link :to="{ name: 'AuthRegistrationRecreateEmailConfirm', query: { token: formData.token } }">Запросить подтверждение email заново</router-link></p>
    </div>
  </template>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue'
import api from '../../../api'
import { Error, ErrorCode } from '@/models/error'
import SuccessMessage from '../../../components/UI/message/success-message.vue'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import { RegistrationConfirmDto } from "@/models/auth";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    ErrorMessage,
    SuccessMessage
  },
  setup () {
    const route = useRoute()

    const isLoading = ref(false)
    const errors = ref<Error[]>([])
    const successMessage = ref('')
    const isEmailConfirmExpired = ref(false)
    const formData = reactive<RegistrationConfirmDto>({
      token: route.query.token as any
    })

    async function load() {
      isLoading.value = true
      errors.value = []
      successMessage.value = ''
      isEmailConfirmExpired.value = false

      try {
        await api.post('v1/auth/registration/confirm', formData)

        successMessage.value = 'Учетная запись успешно активирована'

        isLoading.value = false
      } catch (e: any) {
        isLoading.value = false

        if (e instanceof Response) {
          const result = await e.json()
          errors.value = result.errors

          if (errors.value[0].code === ErrorCode.EmailConfirmExpired) {
            isEmailConfirmExpired.value = true
          }
        } else {
          errors.value = [{ message: 'Неизвестная ошибка' }]
        }
      }
    }
    load()

    return {
      isLoading,
      formData,
      errors,
      successMessage,
      isEmailConfirmExpired
    }
  }
})
</script>
