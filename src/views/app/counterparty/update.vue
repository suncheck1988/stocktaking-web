<template>
  <div v-if="hasAccess && counterparty.id !== ''">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent="handleSubmit">
      <div class="form-floating mb-3">
        <input-with-validation
          :id="'name-validation'"
          :name="'Имя'"
          :errors="errors"
          :value="'name'"
          :inputValue="counterparty.name"
          v-model="counterparty.name"
        />
      </div>

      <div class="form-floating mb-3">
        <input-with-validation
          :id="'email-validation'"
          :name="'Электронная почта'"
          :errors="errors"
          :value="'email'"
          :inputValue="counterparty.email"
          v-model="counterparty.email"
        />
      </div>

      <div class="form-floating mb-3">
        <template v-if="counterparty.status === CounterpartyStatus.Active">
          <input type="text" disabled class="form-control" id="counterparty-status" v-model="CounterpartyStatusLabel.Active">
        </template>
        <template v-if="counterparty.status === CounterpartyStatus.Inactive">
          <input type="text" disabled class="form-control" id="counterparty-status" v-model="CounterpartyStatusLabel.Inactive">
        </template>

        <label for="counterparty-status" class="form-label">Статус</label>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="isLoading">
        <div v-if="isLoading" class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Сохранить
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useCounterparties from './../../../repositories/counterparties'
import { UserPermission} from '@/models/user'
import { CounterpartyStatus, CounterpartyStatusLabel} from '@/models/counterparty'
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

    const { counterparty, fetchCounterparty, updateCounterparty } = useCounterparties()
    const isLoading = ref<boolean>(false)

    const errors = ref<Error[]>([])

    fetchCounterparty(route.params.id as string)

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        await updateCounterparty(counterparty);
        isLoading.value = false
        await push({name: 'AppCounterpartyIndex'})
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
      counterparty,
      errors,
      CounterpartyStatus,
      CounterpartyStatusLabel,
      handleSubmit,
      hasAccess: AuthService.hasPermission(UserPermission.SectionCounterparties)
    }
  }
})
</script>
