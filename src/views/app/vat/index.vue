<template>
  <div v-if="hasAccess">
    <div class="mb-3 text-end">
      <router-link :to="{ name: 'AppVatCreate' }" class="btn btn-secondary btn-sm">Создание ставки НДС</router-link>
    </div>

    <form class="mb-3" @submit.prevent="handleSearchSubmit">
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="ID" v-model="searchDto.id">
      </div>

      <div class="input-group mb-3">
        По умолчанию <input class="form-check-input" style="margin-left: 4px" type="checkbox" name="child-checkbox" v-model="searchDto.isDefault">
      </div>

      <div class="input-group mb-3">
        <div class="mb-3">
          <label for="status" class="form-label">Статус</label>
          <select class="form-select" id="status" v-model="searchDto.status">
            <option value=""></option>
            <option v-for="item in vatsStatuses" :key="item.value" :value="item.value">
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
          <th scope="col">Значение</th>
          <th scope="col">По умолчанию</th>
          <th scope="col" style="width: 120px;">Статус</th>
          <th scope="col" style="width: 140px;"></th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="item in vats"
          :key="item.id"
        >
          <td>
            {{ item.id }}
          </td>
          <td>
            {{ item.value }}
          </td>
          <td>
            <template v-if="item.isDefault">
              <span class="badge bg-success">Да</span>
            </template>
            <template v-else>
              <span class="badge bg-danger">Нет</span>
            </template>
          </td>
          <td>
            <template v-if="item.status === VatStatus.Active">
              <span class="badge bg-success">{{ VatStatusLabel.Active }}</span>
            </template>
            <template v-if="item.status === VatStatus.Inactive">
              <span class="badge bg-danger">{{ VatStatusLabel.Inactive }}</span>
            </template>
          </td>
          <td>
            <div class="dropdown">
              <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                Операции
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <router-link :to="{ name: 'AppVatUpdate', params: { id: item.id } }" class="dropdown-item">Редактировать</router-link>
                </li>
                <li v-if="item.status === VatStatus.Inactive">
                  <a class="dropdown-item" style="cursor:pointer" @click.prevent="activateClick(item.id)">Активировать</a>
                </li>
                <li v-if="item.status === VatStatus.Active">
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
import useVats from './../../../repositories/vats'
import {VatStatus, VatStatusLabel, VatSearchDto} from '@/models/vat'
import {UserPermission} from '@/models/user'
import AuthService from '../../../auth/auth-service'
import ModalConfirmation from '../../../components/modal-confirmation.vue'

export default defineComponent({
  components: {
    ModalConfirmation
  },
  setup () {
    const { vats, pageCount, fetchVats, inactiveVat, activateVat } = useVats()

    const page = ref(1)

    fetchVats()

    const searchDto = reactive<VatSearchDto>({})

    const isShowModal = ref<boolean>(false)
    const modalHandler = ref() as any
    const modalMessage = ref() as any

    const vatsStatuses = [
      {
        value: VatStatus.Active,
        label: VatStatusLabel.Active
      },
      {
        value: VatStatus.Inactive,
        label: VatStatusLabel.Inactive
      }
    ]

    function handleSearchSubmit () {
      fetchVats(searchDto)
    }

    function handlePageClick (value: number) {
      page.value = value
      searchDto.page = value
      fetchVats(searchDto)
    }

    let currentId: string

    function activateClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = activateHandler
      modalMessage.value = 'Вы уверены что хотите активировать ставку НДС ?'
    }

    async function activateHandler () {
      await activateVat(currentId)
      await fetchVats(searchDto);
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
      await inactiveVat(currentId)
      await fetchVats(searchDto);
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
      vats,
      VatStatus,
      VatStatusLabel,
      vatsStatuses,
      hasAccess: AuthService.hasPermission(UserPermission.SectionVats)
    }
  }
})
</script>
