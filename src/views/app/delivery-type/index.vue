<template>
  <div v-if="hasAccess">
    <div class="mb-3 text-end">
      <router-link :to="{ name: 'AppDeliveryTypeCreate' }" class="btn btn-secondary btn-sm">Создание типа доставки</router-link>
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
            <option v-for="item in deliveryTypeStatuses" :key="item.value" :value="item.value">
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
          v-for="item in deliveryTypes"
          :key="item.id"
        >
          <td>
            {{ item.id }}
          </td>
          <td>
            {{ item.name }}
          </td>
          <td>
            <template v-if="item.status === DeliveryTypeStatus.Active">
              <span class="badge bg-success">{{ DeliveryTypeStatusLabel.Active }}</span>
            </template>
            <template v-if="item.status === DeliveryTypeStatus.Inactive">
              <span class="badge bg-danger">{{ DeliveryTypeStatusLabel.Inactive }}</span>
            </template>
          </td>
          <td>
            <div class="dropdown">
              <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                Операции
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <router-link :to="{ name: 'AppDeliveryTypeUpdate', params: { id: item.id } }" class="dropdown-item">Редактировать</router-link>
                </li>
                <li v-if="item.status === DeliveryTypeStatus.Inactive">
                  <a class="dropdown-item" style="cursor:pointer" @click.prevent="activateClick(item.id)">Активировать</a>
                </li>
                <li v-if="item.status === DeliveryTypeStatus.Active">
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
import useDeliveryTypes from './../../../repositories/delivery-types'
import {DeliveryTypeStatus, DeliveryTypeStatusLabel, DeliveryTypeSearchDto} from '@/models/delivery-type'
import {UserPermission} from '@/models/user'
import AuthService from '../../../auth/auth-service'
import ModalConfirmation from '../../../components/modal-confirmation.vue'

export default defineComponent({
  components: {
    ModalConfirmation
  },
  setup () {
    const { deliveryTypes, pageCount, fetchDeliveryTypes, inactiveDeliveryType, activateDeliveryType } = useDeliveryTypes()

    const page = ref(1)

    fetchDeliveryTypes()

    const searchDto = reactive<DeliveryTypeSearchDto>({})

    const isShowModal = ref<boolean>(false)
    const modalHandler = ref() as any
    const modalMessage = ref() as any

    const deliveryTypeStatuses = [
      {
        value: DeliveryTypeStatus.Active,
        label: DeliveryTypeStatusLabel.Active
      },
      {
        value: DeliveryTypeStatus.Inactive,
        label: DeliveryTypeStatusLabel.Inactive
      }
    ]

    function handleSearchSubmit () {
      fetchDeliveryTypes(searchDto)
    }

    function handlePageClick (value: number) {
      page.value = value
      searchDto.page = value
      fetchDeliveryTypes(searchDto)
    }

    let currentId: string

    function activateClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = activateHandler
      modalMessage.value = 'Вы уверены что хотите активировать тип доставки ?'
    }

    async function activateHandler () {
      await activateDeliveryType(currentId)
      await fetchDeliveryTypes(searchDto);
      isShowModal.value = false
      modalHandler.value = null
      modalMessage.value = null
    }

    function inactiveClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = inactiveHandler
      modalMessage.value = 'Вы уверены что хотите деактивировать тип доставки ?'
    }

    async function inactiveHandler () {
      await inactiveDeliveryType(currentId)
      await fetchDeliveryTypes(searchDto);
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
      deliveryTypes,
      DeliveryTypeStatus,
      DeliveryTypeStatusLabel,
      deliveryTypeStatuses,
      hasAccess: AuthService.hasPermission(UserPermission.SectionDeliveryTypes)
    }
  }
})
</script>
