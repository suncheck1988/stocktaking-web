<template>
  <div v-if="hasAccess">
    <div class="mb-3 text-end">
      <router-link :to="{ name: 'AppWarehouseCreate' }" class="btn btn-secondary btn-sm">Создание склада</router-link>
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
            <option v-for="item in warehouseStatuses" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <button class="btn btn-outline-secondary" type="submit">Поиск</button>
      </div>
    </form>

    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
        <tr>
          <th scope="col" style="width: 100px;">Id</th>
          <th scope="col">Имя</th>
          <th scope="col" style="width: 120px;">Статус</th>
          <th scope="col" style="width: 140px;"></th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="item in warehouses"
          :key="item.id"
        >
          <td>
            {{ item.id }}
          </td>
          <td>
            {{ item.name }}
          </td>
          <td>
            <template v-if="item.status === WarehouseStatus.Active">
              <span class="badge bg-success">{{ WarehouseStatusLabel.Active }}</span>
            </template>
            <template v-if="item.status === WarehouseStatus.Inactive">
              <span class="badge bg-danger">{{ WarehouseStatusLabel.Inactive }}</span>
            </template>
          </td>
          <td>
            <div class="dropdown">
              <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                Операции
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <router-link :to="{ name: 'AppWarehouseUpdate', params: { id: item.id } }" class="dropdown-item">Редактировать</router-link>
                </li>
                <li v-if="item.status === WarehouseStatus.Inactive">
                  <a class="dropdown-item" style="cursor:pointer" @click.prevent="activateClick(item.id)">Активировать</a>
                </li>
                <li v-if="item.status === WarehouseStatus.Active">
                  <a class="dropdown-item" style="cursor:pointer" @click.prevent="inactiveClick(item.id)">Деактивировать</a>
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
import useWarehouses from './../../../repositories/warehouses'
import {WarehouseStatus, WarehouseStatusLabel, WarehouseSearchDto} from '@/models/warehouse'
import {UserPermission} from '@/models/user'
import AuthService from '../../../auth/auth-service'
import ModalConfirmation from '../../../components/modal-confirmation.vue'

export default defineComponent({
  components: {
    ModalConfirmation
  },
  setup () {
    const { warehouses, pageCount, fetchWarehouses, inactiveWarehouse, activateWarehouse } = useWarehouses()

    const page = ref(1)

    fetchWarehouses()

    const searchDto = reactive<WarehouseSearchDto>({})

    const isShowModal = ref<boolean>(false)
    const modalHandler = ref() as any
    const modalMessage = ref() as any

    const warehouseStatuses = [
      {
        value: WarehouseStatus.Active,
        label: WarehouseStatusLabel.Active
      },
      {
        value: WarehouseStatus.Inactive,
        label: WarehouseStatusLabel.Inactive
      }
    ]

    function handleSearchSubmit () {
      fetchWarehouses(searchDto)
    }

    function handlePageClick (value: number) {
      page.value = value
      searchDto.page = value
      fetchWarehouses(searchDto)
    }

    let currentId: string

    function activateClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = activateHandler
      modalMessage.value = 'Вы уверены что хотите активировать склад ?'
    }

    async function activateHandler () {
      await activateWarehouse(currentId)
      await fetchWarehouses(searchDto);
      isShowModal.value = false
      modalHandler.value = null
      modalMessage.value = null
    }

    function inactiveClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = inactiveHandler
      modalMessage.value = 'Вы уверены что хотите деактивировать склад ?'
    }

    async function inactiveHandler () {
      await inactiveWarehouse(currentId)
      await fetchWarehouses(searchDto);
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
      inactiveClick,
      warehouses,
      WarehouseStatus,
      WarehouseStatusLabel,
      warehouseStatuses,
      hasAccess: AuthService.hasPermission(UserPermission.SectionWarehouses)
    }
  }
})
</script>
