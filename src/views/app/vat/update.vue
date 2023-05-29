<template>
  <div v-if="hasAccess && formData.id">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent>
      <div class="form-floating mb-3">
        <input-with-validation
          :id="'value-validation'"
          :name="'Значение'"
          :errors="errors"
          :value="'value'"
          :inputValue="formData.value"
          v-model="formData.value"
        />
      </div>

      <div class="form-floating mb-3">
        По умолчанию <input class="form-check-input" style="margin-left: 4px" type="checkbox" name="child-checkbox" v-model="formData.isDefault">
      </div>

      <div class="form-floating mb-3">
        <template v-if="vat.status === VatStatus.Active">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="VatStatusLabel.Active">
        </template>
        <template v-if="vat.status === VatStatus.Inactive">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="VatStatusLabel.Inactive">
        </template>

        <label for="warehouse-status" class="form-label">Статус</label>
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
import useVats from './../../../repositories/vats'
import { UserPermission} from '@/models/user'
import {VatUpdateDto, VatStatus, VatStatusLabel} from '@/models/vat'
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

    const { vat, fetchVat, updateVat } = useVats()

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const formData = reactive<VatUpdateDto>({})

    fetchVat(route.params.id as string).then(() => {
      if (vat) {
        formData.id = vat.id
        formData.value = vat.value
        formData.isDefault = vat.isDefault
      }
    })

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        await updateVat(formData);
        isLoading.value = false
        await push({name: 'AppVatIndex'})
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
      vat,
      errors,
      VatStatus,
      VatStatusLabel,
      handleSubmit,
      hasAccess: AuthService.hasPermission(UserPermission.SectionVats)
    }
  }
})
</script>
