<template>
  <div v-if="hasAccess">
    <div class="mb-3 text-end">
      <router-link :to="{ name: 'AppFixedAssetCreate' }" class="btn btn-secondary btn-sm">Создание основного средства</router-link>
    </div>

    <form class="mb-3" @submit.prevent="handleSearchSubmit">
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="ID" v-model="searchDto.id">
        <input type="text" class="form-control" placeholder="Имя" v-model="searchDto.name">
        <input type="text" class="form-control" placeholder="Серийный номер" v-model="searchDto.serialNumber">
      </div>

      <div class="input-group mb-3">
        <div class="mb-3">
          <tree-select
            :options="treeNodes"
            :disable-branch-nodes="true"
            :show-count="true"
            :placeholder="'Категория'"
            v-model="searchDto.categoryId"
          />
        </div>
      </div>

      <div class="input-group mb-3">
        <div class="mb-3">
          <label for="warehouse" class="form-label">Склад</label>
          <select class="form-select" id="warehouse" v-model="searchDto.warehouseId">
            <option value=""></option>
            <option v-for="item in warehouses" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="input-group mb-3">
        <div class="mb-3">
          <label for="status" class="form-label">Статус</label>
          <select class="form-select" id="status" v-model="searchDto.status">
            <option value=""></option>
            <option v-for="item in fixedAssetStatuses" :key="item.value" :value="item.value">
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
          <th scope="col">Материально ответственное лицо</th>
          <th scope="col">Категория</th>
          <th scope="col">Контрагент</th>
          <th scope="col">Склад</th>
          <th scope="col">Имя</th>
          <th scope="col">Описание</th>
          <th scope="col">Серийный номер</th>
          <th scope="col">Инвентарный номер</th>
          <th scope="col">Единица измерения</th>
          <th scope="col">Закупочная цена</th>
          <th scope="col">НДС</th>
          <th scope="col">Остаточная стоимость</th>
          <th scope="col">Дата начала эксплуатации</th>
          <th scope="col">Дата списания</th>
          <th scope="col" style="width: 120px;">Статус</th>
          <th scope="col" style="width: 140px;"></th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="item in fixedAssets"
          :key="item.id"
        >
          <td>
            {{ item.id }}
          </td>
          <td>
            <template v-if="item.financiallyResponsiblePerson">{{ item.financiallyResponsiblePerson?.name }}</template>
            -
          </td>
          <td>
            {{ item.category.name }}
          </td>
          <td>
            <template v-if="item.counterparty">{{ item.counterparty?.name }}</template>
            -
          </td>
          <td>
            <template v-if="item.warehouse">{{ item.warehouse?.name }}</template>
            -
          </td>
          <td>
            {{ item.name }}
          </td>
          <td>
            <template v-if="item.description">{{ item.description }}</template>
            -
          </td>
          <td>
            {{ item.serialNumber }}
          </td>
          <td>
            {{ item.inventoryNumber }}
          </td>
          <td>
            {{ item.unit.name }}
          </td>
          <td>
            {{ item.purchasePrice }}
          </td>
          <td>
            <template v-if="item.vat">{{ item.vat?.value }}</template>
            -
          </td>
          <td>
            {{ item.residualValue }}
          </td>
          <td>
            <template v-if="item.inUseAt">{{ item.inUseAt }}</template>
            -
          </td>
          <td>
            <template v-if="item.decommissionedAt">{{ item.decommissionedAt }}</template>
            -
          </td>
          <td>
            <template v-if="item.status === FixedAssetStatus.InUse">
              <span class="badge bg-success">{{ FixedAssetStatusLabel.InUse }}</span>
            </template>
            <template v-if="item.status === FixedAssetStatus.Storage">
              <span class="badge bg-warning">{{ FixedAssetStatusLabel.Storage }}</span>
            </template>
            <template v-if="item.status === FixedAssetStatus.Decommissioned">
              <span class="badge bg-danger">{{ FixedAssetStatusLabel.Decommissioned }}</span>
            </template>
          </td>
          <td>
            <div class="dropdown">
              <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                Операции
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <router-link :to="{ name: 'AppFixedAssetUpdate', params: { id: item.id } }" class="dropdown-item">Редактировать</router-link>
                </li>
                <li v-if="item.status === FixedAssetStatus.InUse">
                  <a class="dropdown-item" style="cursor:pointer" @click.prevent="storageClick(item.id)">Отправить на склад</a>
                </li>
                <li v-if="item.status === FixedAssetStatus.Storage">
                  <a class="dropdown-item" style="cursor:pointer" @click.prevent="inUseClick(item.id)">Выдать в эксплуатацию</a>
                </li>
                <li v-if="item.status === FixedAssetStatus.InUse || item.status === FixedAssetStatus.Storage">
                  <a class="dropdown-item" style="cursor:pointer" @click.prevent="decommissionedClick(item.id)">Списать</a>
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
import useFixedAssets from './../../../repositories/fixed-assets'
import useCategories from './../../../repositories/categories'
import useWarehouses from './../../../repositories/warehouses'
import {WarehouseSearchDto} from '@/models/warehouse'
import { FixedAssetStatus, FixedAssetStatusLabel, FixedAssetSearchDto } from '@/models/fixed-asset'
import { UserPermission } from '@/models/user'
import AuthService from '../../../auth/auth-service'
import ModalConfirmation from '../../../components/modal-confirmation.vue'
import TreeSelect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'

export default defineComponent({
  components: {
    ModalConfirmation,
    TreeSelect
  },
  setup () {
    const { fixedAssets, pageCount, fetchFixedAssets, inUseFixedAsset, storageFixedAsset, decommissionedFixedAsset } = useFixedAssets()
    const { categoriesTree, fetchCategoriesTree } = useCategories()
    const { warehouses, fetchWarehouses } = useWarehouses()

    const page = ref(1)

    const searchDto = reactive<FixedAssetSearchDto>({})
    const warehouseSearchDto = reactive<WarehouseSearchDto>({withoutPagination: true})

    const isShowModal = ref<boolean>(false)
    const modalHandler = ref() as any
    const modalMessage = ref() as any

    const treeNodes = ref([]) as any;

    const fixedAssetStatuses = [
      {
        value: FixedAssetStatus.InUse,
        label: FixedAssetStatusLabel.InUse
      },
      {
        value:FixedAssetStatus.Storage,
        label: FixedAssetStatusLabel.Storage
      },
      {
        value:FixedAssetStatus.Decommissioned,
        label: FixedAssetStatusLabel.Decommissioned
      }
    ]

    fetchFixedAssets()
    fetchCategoriesTree().then(function () {
      for (const [key1, parent] of Object.entries(categoriesTree.value)) {
        let children = [] as any

        for (const [key2, child] of Object.entries(parent.children)) {
          const childEl = { id: child.id, label: child.name }
          children.push(childEl)
        }

        const parentEl = { id: parent.id, label: parent.name, children: children };
        treeNodes.value.push(parentEl)
      }
    })
    fetchWarehouses(warehouseSearchDto)

    function handleSearchSubmit () {
      fetchFixedAssets(searchDto)
    }

    function handlePageClick (value: number) {
      page.value = value
      searchDto.page = value
      fetchFixedAssets(searchDto)
    }

    let currentId: string

    function inUseClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = inUseHandler
      modalMessage.value = 'Вы уверены что хотите выдать в использование основное средство ?'
    }

    async function inUseHandler () {
      await inUseFixedAsset(currentId)
      await fetchFixedAssets(searchDto);
      isShowModal.value = false
      modalHandler.value = null
      modalMessage.value = null
    }

    function storageClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = storageHandler
      modalMessage.value = 'Вы уверены что хотите отправить на склад основное средство ?'
    }

    async function storageHandler () {
      await storageFixedAsset(currentId)
      await fetchFixedAssets(searchDto);
      isShowModal.value = false
      modalHandler.value = null
      modalMessage.value = null
    }

    function decommissionedClick (id: string) {
      currentId = id
      isShowModal.value = true
      modalHandler.value = decommissionedHandler
      modalMessage.value = 'Вы уверены что хотите списать основное средство ?'
    }

    async function decommissionedHandler () {
      await decommissionedFixedAsset(currentId)
      await fetchFixedAssets(searchDto);
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
      inUseClick,
      storageClick,
      decommissionedClick,
      fixedAssets,
      treeNodes,
      warehouses,
      FixedAssetStatus,
      FixedAssetStatusLabel,
      fixedAssetStatuses,
      hasAccess: AuthService.hasPermission(UserPermission.SectionFixedAssets)
    }
  }
})
</script>
