<template>
  <div v-if="hasAccess">
    <div class="mb-3 text-end">
      <router-link :to="{ name: 'AppCategoryCreate' }" class="btn btn-secondary btn-sm">Создание корневой категории</router-link>
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
            <option v-for="item in categoryStatuses" :key="item.value" :value="item.value">
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
            <th scope="col">Является корневой</th>
            <th scope="col" style="width: 120px;">Статус</th>
            <th scope="col" style="width: 140px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in categories"
            :key="item.id"
          >
            <td>
              {{ item.id }}
            </td>
            <td>
              <template v-if="item.parent">{{ item.parent?.name }} -> </template>{{ item.name }}
            </td>
            <td>
              <template v-if="!item.parent">Да</template>
              <template v-else>Нет</template>
            </td>
            <td>
              <template v-if="item.status === CategoryStatus.Active">
                <span class="badge bg-success">{{ CategoryStatusLabel.Active }}</span>
              </template>
              <template v-if="item.status === CategoryStatus.Inactive">
                <span class="badge bg-danger">{{ CategoryStatusLabel.Inactive }}</span>
              </template>
            </td>
            <td>
              <div class="dropdown">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                  Операции
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li>
                    <router-link :to="{ name: 'AppCategoryUpdate', params: { id: item.id } }" class="dropdown-item">Редактировать</router-link>
                  </li>
                  <li v-if="item.status === CategoryStatus.Inactive">
                    <a class="dropdown-item" style="cursor:pointer" @click.prevent="activateClick(item.id)">Активировать</a>
                  </li>
                  <li v-if="item.status === CategoryStatus.Active">
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
import useCategories from './../../../repositories/categories'
import {CategoryStatus, CategoryStatusLabel, CategorySearchDto} from '@/models/category'
import {UserPermission} from '@/models/user'
import AuthService from '../../../auth/auth-service'
import ModalConfirmation from '../../../components/modal-confirmation.vue'

export default defineComponent({
  components: {
    ModalConfirmation
  },
  setup () {
    const { categories, pageCount, fetchCategories, inactiveCategory, activateCategory } = useCategories()

    const page = ref(1)

    fetchCategories()

    const searchDto = reactive<CategorySearchDto>({})

    const isShowModal = ref<boolean>(false)
    const modalHandler = ref() as any
    const modalMessage = ref() as any

    const categoryStatuses = [
      {
        value: CategoryStatus.Active,
        label: CategoryStatusLabel.Active
      },
      {
        value: CategoryStatus.Inactive,
        label: CategoryStatusLabel.Inactive
      }
    ]

    function handleSearchSubmit () {
      fetchCategories(searchDto)
    }

    function handlePageClick (value: number) {
      page.value = value
      searchDto.page = value
      fetchCategories(searchDto)
    }

    let currentId: string

    function activateClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = activateHandler
      modalMessage.value = 'Вы уверены что хотите активировать категорию ?'
    }

    async function activateHandler () {
      await activateCategory(currentId)
      await fetchCategories(searchDto);
      isShowModal.value = false
      modalHandler.value = null
      modalMessage.value = null
    }

    function inactiveClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = inactiveHandler
      modalMessage.value = 'Вы уверены что хотите деактивировать категорию ?'
    }

    async function inactiveHandler () {
      await inactiveCategory(currentId)
      await fetchCategories(searchDto);
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
      categories,
      CategoryStatus,
      CategoryStatusLabel,
      categoryStatuses,
      hasAccess: AuthService.hasPermission(UserPermission.SectionCategories)
    }
  }
})
</script>
