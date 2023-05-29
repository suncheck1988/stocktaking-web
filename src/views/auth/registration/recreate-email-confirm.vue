<template>
  <success-message :message="successMessage"/>
  <error-message :errors="errors"/>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue'
import api from '../../../api'
import { Error } from '@/models/error'
import SuccessMessage from '../../../components/UI/message/success-message.vue'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import { RecreateEmailConfirmDto } from "@/models/auth";
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

    const formData = reactive<RecreateEmailConfirmDto>({
      token: route.query.token as any
    })

    async function load() {
      isLoading.value = true
      errors.value = []
      successMessage.value = ''

      try {
        await api.post('v1/auth/registration/recreate-email-confirm', formData)

        successMessage.value = 'Письмо для подтверждения электронной почты успешно отправлено'

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
    load()

    return {
      isLoading,
      formData,
      errors,
      successMessage
    }
  }
})
</script>
