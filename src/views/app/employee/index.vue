<template>
  <div v-if="hasAccess">
    <div class="mb-3 text-end">
      <router-link :to="{ name: 'AppEmployeeCreate' }" class="btn btn-secondary btn-sm">Создание сотрудника</router-link>
    </div>

    <form class="mb-3" @submit.prevent="handleSearchSubmit">
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="ID" v-model="searchDto.id">
        <input type="text" class="form-control" placeholder="Имя" v-model="searchDto.name">
      </div>

      <div class="input-group mb-3">
        <div class="mb-3">
          <label for="status" class="form-label">Статус</label>
          <select class="form-select" id="status" v-model="searchDto.status">
            <option value=""></option>
            <option v-for="item in userStatuses" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <button class="btn btn-outline-secondary" type="submit">Поиск</button>&nbsp;
      </div>
    </form>

    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" style="width: 100px;">Id</th>
            <th scope="col">Имя</th>
            <th scope="col">Email</th>
            <th scope="col">Является МОЛ</th>
            <th scope="col" style="width: 120px;">Статус</th>
            <th scope="col" style="width: 140px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in employees"
            :key="item.id"
          >
            <td>
              {{ item.id }}
            </td>
            <td>
              {{ item.user.name }}
            </td>
            <td>
              {{ item.user.email }}
            </td>
            <td>
              {{ item.isFinanciallyResponsiblePerson }}
            </td>
            <td>
              <template v-if="item.user.status === UserStatus.New">
                <span class="badge bg-warning">{{ UserStatusLabel.New }}</span>
              </template>
              <template v-if="item.user.status === UserStatus.Active">
                <span class="badge bg-success">{{ UserStatusLabel.Active }}</span>
              </template>
              <template v-if="item.user.status === UserStatus.Blocked">
                <span class="badge bg-danger">{{ UserStatusLabel.Blocked }}</span>
              </template>
            </td>
            <td>
              <div class="dropdown">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                  Операции
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li>
                    <router-link :to="{ name: 'AppEmployeeUpdate', params: { id: item.id } }" class="dropdown-item">Редактировать</router-link>
                  </li>
                  <li v-if="item.user.status === UserStatus.Blocked">
                    <a class="dropdown-item" style="cursor:pointer" @click.prevent="activateClick(item.id)">Активировать</a>
                  </li>
                  <li v-if="item.user.status === UserStatus.Active">
                    <a class="dropdown-item" style="cursor:pointer" @click.prevent="blockClick(item.id)">Заблокировать</a>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pageCount > 1">
      <nav>
        <ul class="pagination pagination-sm flex-wrap">
          <li
            v-for="i in pageCount"
            :key="i"
            class="page-item"
            :class="{ 'active': i === page }"
          >
            <a class="page-link" href="#" @click.prevent="handlePageClick(i)">{{ i }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <modal-confirmation
      modal-title="Внимание! Проверьте прежде чем подтвердить!"
      v-model="isShowModal"
      @confirm="modalHandler"
    >
      {{ modalMessage }}
    </modal-confirmation>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import useEmployees from './../../../repositories/employees'
import {UserPermission, UserRole, UserRoleLabel, UserStatus, UserStatusLabel} from '@/models/user'
import { EmployeeSearchDto } from '@/models/employee'
import AuthService from '../../../auth/auth-service'
import ModalConfirmation from '../../../components/modal-confirmation.vue'

export default defineComponent({
  components: {
    ModalConfirmation
  },
  setup () {
    const { employees, pageCount, fetchEmployees, blockEmployee, activateEmployee } = useEmployees()

    const page = ref(1)

    fetchEmployees()

    const searchDto = reactive<EmployeeSearchDto>({})

    const isShowModal = ref<boolean>(false)
    const modalHandler = ref() as any
    const modalMessage = ref() as any

    const userStatuses = [
      {
        value: UserStatus.New,
        label: UserStatusLabel.New
      },
      {
        value: UserStatus.Active,
        label: UserStatusLabel.Active
      },
      {
        value: UserStatus.Blocked,
        label: UserStatusLabel.Blocked
      }
    ]

    function handleSearchSubmit () {
      fetchEmployees(searchDto)
    }

    function handlePageClick (value: number) {
      page.value = value
      searchDto.page = value
      fetchEmployees(searchDto)
    }

    let currentId: string

    function activateClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = activateHandler
      modalMessage.value = 'Вы уверены что хотите активировать сотрудника ?'
    }

    async function activateHandler () {
      await activateEmployee(currentId)
      await fetchEmployees(searchDto);
      isShowModal.value = false
      modalHandler.value = null
      modalMessage.value = null
    }

    function blockClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = blockHandler
      modalMessage.value = 'Вы уверены что хотите заблокировать сотрудника ?'
    }

    async function blockHandler () {
      await blockEmployee(currentId)
      await fetchEmployees(searchDto);
      isShowModal.value = false
      modalHandler.value = null
      modalMessage.value = null
    }

    return {
      searchDto,
      handleSearchSubmit,
      handlePageClick,
      pageCount,
      page,
      isShowModal,
      modalHandler,
      modalMessage,
      activateClick,
      blockClick,
      employees,
      UserRole,
      UserRoleLabel,
      UserStatus,
      UserStatusLabel,
      userStatuses,
      hasAccess: AuthService.hasPermission(UserPermission.SectionEmployees)
    }
  }
})
</script>
