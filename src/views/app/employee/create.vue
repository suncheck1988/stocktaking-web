<template>
  <div v-if="hasAccess">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent="handleSubmit">
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

      <div class="mb-3">
        <input
          type="checkbox"
          class="form-check-input"
          style="margin-right: 10px;"
          id="is-financially-responsible-person"
          v-model="formData.isFinanciallyResponsiblePerson"
        >
        <label for="is-financially-responsible-person" class="form-check-label">Является МОЛ</label>
      </div>

      <div class="mb-3">
        <label class="form-label">Права</label>
        <div
          v-for="item in userPermissions"
          :key="item.value"
          class="form-check"
        >
          <input
            class="form-check-input"
            type="checkbox"
            name="type"
            :id="'employee-permission-' + item.value"
            :value="item.value"
            v-model="formData.permissions"
          >
          <label class="form-check-label" :for="'employee-permission-' + item.value">
            {{ item.label }}
          </label>
        </div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="isLoading">
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
import useEmployees from './../../../repositories/employees'
import { UserPermission, UserPermissionLabel } from '@/models/user'
import { Error } from '@/models/error'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import AuthService from '../../../auth/auth-service'
import {EmployeeDto} from "@/models/employee";

export default defineComponent({
  components: {
    InputWithValidation,
    ErrorMessage
  },
  setup () {
    const { push } = useRouter()

    const { createEmployee } = useEmployees()
    const formData = reactive<EmployeeDto>({permissions: []})
    const passwordConfirm = ref(undefined)
    const isLoading = ref<boolean>(false)

    const errors = ref<Error[]>([])

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []

      if (passwordConfirm.value !== formData.password) {
        errors.value[0] = {
          property: 'passwordConfirm',
          message: 'Пароль не совпадает',
        }

        isLoading.value = false

        return
      }

      try {
        await createEmployee(formData);
        isLoading.value = false
        await push({name: 'AppEmployeeIndex'})
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

    const userPermissions = [
      {
        value: UserPermission.SectionCategories,
        label: UserPermissionLabel.SectionCategories
      },
      {
        value: UserPermission.SectionWarehouses,
        label: UserPermissionLabel.SectionWarehouses
      },
      {
        value: UserPermission.SectionPositions,
        label: UserPermissionLabel.SectionPositions
      },
      {
        value: UserPermission.SectionPositionBalances,
        label: UserPermissionLabel.SectionPositionBalances
      },
      {
        value: UserPermission.SectionPositionUnits,
        label: UserPermissionLabel.SectionPositionUnits
      },
      {
        value: UserPermission.SectionFixedAssets,
        label: UserPermissionLabel.SectionFixedAssets
      },
      {
        value: UserPermission.SectionCounterparties,
        label: UserPermissionLabel.SectionCounterparties
      },
      {
        value: UserPermission.SectionOrders,
        label: UserPermissionLabel.SectionOrders
      },
      {
        value: UserPermission.SectionPaymentMethods,
        label: UserPermissionLabel.SectionPaymentMethods
      },
      {
        value: UserPermission.SectionDeliveryTypes,
        label: UserPermissionLabel.SectionDeliveryTypes
      },
      {
        value: UserPermission.SectionEmployees,
        label: UserPermissionLabel.SectionEmployees
      },
      {
        value: UserPermission.SectionVats,
        label: UserPermissionLabel.SectionVats
      }
    ]

    return {
      isLoading,
      formData,
      errors,
      passwordConfirm,
      handleSubmit,
      userPermissions,
      hasAccess: AuthService.hasPermission(UserPermission.SectionEmployees)
    }
  }
})
</script>
