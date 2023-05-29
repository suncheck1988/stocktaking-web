<template>
  <div v-if="hasAccess && employee.id !== ''">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent="handleSubmit">
      <div class="form-floating mb-3">
        <input-with-validation
          :id="'name-validation'"
          :name="'Имя'"
          :errors="errors"
          :value="'name'"
          :inputValue="employee.user.name"
          v-model="employee.user.name"
        />
      </div>

      <div class="form-floating mb-3">
        <input type="text" disabled class="form-control" id="user-name" v-model="employee.user.email">
        <label for="user-name" class="form-label">Электронная почта</label>
      </div>

      <div class="mb-3">
        <label class="form-label">Права</label>
        <div
          v-for="item in userPermissions"
          :key="item.value"
          class="form-check"
        >
          <input class="form-check-input" type="checkbox" name="type" :id="'user-permission-' + item.value" :value="item.value" v-model="employee.user.permissions">
          <label class="form-check-label" :for="'user-permission-' + item.value">
            {{ item.label }}
          </label>
        </div>
      </div>

      <div class="form-floating mb-3">
        <template v-if="employee.user.status === UserStatus.New">
          <input type="text" disabled class="form-control" id="employee-status" v-model="UserStatusLabel.New">
        </template>
        <template v-if="employee.user.status === UserStatus.Active">
          <input type="text" disabled class="form-control" id="employee-status" v-model="UserStatusLabel.Active">
        </template>
        <template v-if="employee.user.status === UserStatus.Blocked">
          <input type="text" disabled class="form-control" id="employee-status" v-model="UserStatusLabel.Blocked">
        </template>

        <label for="employee-status" class="form-label">Статус</label>
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
import useEmployees from './../../../repositories/employees'
import { UserRole, UserRoleLabel, UserPermission, UserPermissionLabel, UserStatus, UserStatusLabel} from '@/models/user'
import {Error} from '@/models/error'
import AuthService from '../../../auth/auth-service'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'

export default defineComponent({
  computed: {
    UserStatus() {
      return UserStatus
    },
    UserRoleLabel() {
      return UserRoleLabel
    },
    UserRole() {
      return UserRole
    },
    UserStatusLabel() {
      return UserStatusLabel
    }
  },
  components: {
    InputWithValidation,
    ErrorMessage
  },
  setup () {
    const route = useRoute()
    const { push } = useRouter()

    const { employee, fetchEmployee, updateEmployee } = useEmployees()
    const isLoading = ref<boolean>(false)

    const errors = ref<Error[]>([])

    fetchEmployee(route.params.id as string)

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        await updateEmployee(employee);
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
      employee,
      errors,
      handleSubmit,
      userPermissions,
      hasAccess: AuthService.hasPermission(UserPermission.SectionEmployees)
    }
  }
})
</script>
