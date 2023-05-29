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
        <template v-if="unit.status === UnitStatus.Active">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="UnitStatusLabel.Active">
        </template>
        <template v-if="unit.status === UnitStatus.Inactive">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="UnitStatusLabel.Inactive">
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
import useUnits from './../../../repositories/units'
import { UserPermission} from '@/models/user'
import {UnitUpdateDto, UnitStatus, UnitStatusLabel} from '@/models/unit'
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

    const { unit, fetchUnit, updateUnit } = useUnits()

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const formData = reactive<UnitUpdateDto>({})

    fetchUnit(route.params.id as string).then(() => {
      if (unit) {
        formData.id = unit.id
        formData.name = unit.name
      }
    })

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        await updateUnit(formData);
        isLoading.value = false
        await push({name: 'AppPositionUnitIndex'})
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
      unit,
      errors,
      UnitStatus,
      UnitStatusLabel,
      handleSubmit,
      hasAccess: AuthService.hasPermission(UserPermission.SectionPositionUnits)
    }
  }
})
</script>
