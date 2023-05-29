<template>
  <div v-if="hasAccess && formData.id">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent>
      <div class="form-floating mb-3">
        <tree-select-with-validation
          id="category-validation"
          :name="'Категория'"
          value="categoryId"
          :errors="errors"
          :items="treeNodes"
          v-model="formData.categoryId"
          :inputValue="formData.categoryId"
        />
      </div>

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
        <input-with-validation
          :id="'description-validation'"
          :name="'Описание'"
          :errors="errors"
          :value="'description'"
          :inputValue="formData.description"
          v-model="formData.description"
        />
      </div>

      <div class="form-group">
        <select-with-validation
          id="vat"
          :name="'НДС'"
          value="vatId"
          :errors="errors"
          :items="vats"
          :isShowFirstEmptyElement="true"
          :inputValue="formData.vatId"
          v-model="formData.vatId"
        />
      </div>

      <div class="form-group">
        <select-with-validation
          id="unit"
          :name="'Единица измерения'"
          value="unitId"
          :errors="errors"
          :items="units"
          :isShowFirstEmptyElement="false"
          :inputValue="formData.unitId"
          v-model="formData.unitId"
        />
      </div>

      <div class="form-floating mb-3">
        <input-with-validation
          :id="'price-validation'"
          :name="'Стоимость'"
          :type="'number'"
          :errors="errors"
          :value="'price'"
          :inputValue="formData.price"
          v-model="formData.price"
        />
      </div>

      <div class="form-floating mb-3">
        <template v-if="position.status === PositionStatus.Active">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="PositionStatusLabel.Active">
        </template>
        <template v-if="position.status === PositionStatus.Inactive">
          <input type="text" disabled class="form-control" id="warehouse-status" v-model="PositionStatusLabel.Inactive">
        </template>

        <label for="warehouse-status" class="form-label">Статус</label>
      </div>

      <div class="mb-3">
        <label for="position-balance" class="form-label">Доступность на складах:</label>

        <!--    Current balances    -->
        <div
          class="input-group w-60"
          style="margin-bottom: 15px;"
          v-for="item in formData.existsBalance"
          :key="item.id"
        >
          <span class="input-group-text">
            <div style="margin-right: 4px">Удалить</div>
            <input class="form-check-input" @change="toRemoveExistsBalance($event)" type="checkbox" name="child-checkbox" :id="'child-' + item.id" :value="item.id">
          </span>

          <span class="input-group-text">Склад</span>
          <input class="form-control" type="text" name="child" :id="'child-' + item.id" :value="item.warehouse" disabled>

          <span class="input-group-text">Кол-во</span>
          <input type="number" class="form-control" v-model="item.quantity">
        </div>

        <!--    New balance creator    -->
        <div class="input-group w-60" style="margin-bottom: 15px;">
          <span class="input-group-text">Склад</span>
          <select
            :disabled="warehouses.length === 0"
            class="form-select"
            v-model="newPositionBalanceRef.warehouseId"
          >
            <option v-for="item in warehouses" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>

          <span class="input-group-text">Кол-во</span>
          <input type="number" class="form-control" :disabled="warehouses.length === 0" v-model="newPositionBalanceRef.quantity">

          <button class="btn btn-primary me-3" @click="addNewPositionBalance" :disabled="warehouses.length === 0">Добавить баланс</button>
        </div>

        <!--    New balances    -->
        <div class="mb-3">
          <div class="input-group w-60 mb-3" v-for="(balance, index) in newPositionBalancesToAdd" :key="index">
            <span class="input-group-text">Склад</span>
            <input type="text" class="form-control" v-model="balance.warehouseName" disabled>

            <span class="input-group-text">Кол-во</span>
            <input type="text" class="form-control" v-model="balance.quantity" disabled>

            <button class="btn btn-primary me-3" @click="removeNewPositionBalance(index)">Удалить</button>
          </div>
        </div>
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
import usePositions from './../../../repositories/positions'
import useCategories from './../../../repositories/categories'
import useVats from './../../../repositories/vats'
import useUnits from './../../../repositories/units'
import useWarehouses from './../../../repositories/warehouses'
import { UserPermission} from '@/models/user'
import {PositionUpdateDto, PositionStatus, PositionStatusLabel, PositionBalance} from '@/models/position'
import {Error} from '@/models/error'
import AuthService from '../../../auth/auth-service'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import SelectWithValidation from '../../../components/UI/blocks/select-with-validation.vue'
import TreeSelectWithValidation from '../../../components/UI/blocks/tree-select-with-validation.vue'
import {VatSearchDto, VatStatus} from "@/models/vat";
import {UnitSearchDto, UnitStatus} from "@/models/unit";
import {Warehouse, WarehouseSearchDto, WarehouseStatus} from "@/models/warehouse";

export default defineComponent({
  components: {
    InputWithValidation,
    SelectWithValidation,
    TreeSelectWithValidation,
    ErrorMessage
  },
  setup () {
    const route = useRoute()
    const { push } = useRouter()

    const { position, fetchPosition, updatePosition } = usePositions()
    const { categoriesTree, fetchCategoriesTree } = useCategories()
    const { vats, fetchVats } = useVats()
    const { units, fetchUnits } = useUnits()
    const { warehouses, fetchWarehouses } = useWarehouses()

    const vatSearchDto = reactive<VatSearchDto>({withoutPagination: true, status: VatStatus.Active})
    const unitSearchDto = reactive<UnitSearchDto>({withoutPagination: true, status: UnitStatus.Active})
    const warehouseSearchDto = reactive<WarehouseSearchDto>({withoutPagination: true, status: WarehouseStatus.Active, withoutBalanceByPositionId: route.params.id as string})

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const treeNodes = ref([]) as any;

    const newPositionBalanceRef = ref<any>({})
    const newPositionBalancesToAdd = ref<any>([])

    const formData = reactive<PositionUpdateDto>({})

    fetchPosition(route.params.id as string).then(() => {
      if (position) {
        formData.id = position.id
        formData.categoryId = position.category.id
        formData.name = position.name
        formData.description = position.description
        formData.price = position.price
        formData.vatId = position.vat?.id
        formData.unitId = position.unit.id
        formData.existsBalance = []

        position.balance.forEach((balance: PositionBalance) => {
          const obj = {id: balance.id, warehouseId: balance.warehouse.id, warehouse: balance.warehouse.name, quantity: balance.quantity, isRemove: false} as never
          if (formData.existsBalance) {
            formData.existsBalance.push(obj)
          }
        })
      }
    })

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
    fetchVats(vatSearchDto)
    fetchUnits(unitSearchDto)
    fetchWarehouses(warehouseSearchDto)

    function addNewPositionBalance() {
      if (newPositionBalanceRef.value.warehouseId !== undefined && newPositionBalanceRef.value.quantity !== undefined) {
        let obj = {};

        warehouses.value.forEach((warehouse: Warehouse, index) => {
          if (warehouse.id === newPositionBalanceRef.value.warehouseId) {
            obj = {
              warehouseName: warehouse.name,
              warehouseId: newPositionBalanceRef.value.warehouseId,
              quantity: newPositionBalanceRef.value.quantity
            };

            warehouses.value.splice(index, 1);
            return
          }
        })

        newPositionBalancesToAdd.value.push(obj);

        newPositionBalanceRef.value = {};
      }
    }

    function removeNewPositionBalance(index: string) {
      warehouses.value.push({
        id: newPositionBalancesToAdd.value[index].warehouseId,
        name: newPositionBalancesToAdd.value[index].warehouseName,
        status: 0
      })

      newPositionBalancesToAdd.value.splice(index, 1);
    }

    function toRemoveExistsBalance(e: any) {
      formData.existsBalance?.forEach((item: any) => {
        if (item.id === e.target.value) {
          item.isRemove = !!e.target.checked;
          return
        }
      })
    }

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        formData.newBalance = newPositionBalancesToAdd.value

        await updatePosition(formData);
        isLoading.value = false
        await push({name: 'AppPositionIndex'})
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
      position,
      errors,
      treeNodes,
      vats,
      units,
      warehouses,
      newPositionBalanceRef,
      newPositionBalancesToAdd,
      PositionStatus,
      PositionStatusLabel,
      handleSubmit,
      addNewPositionBalance,
      removeNewPositionBalance,
      toRemoveExistsBalance,
      hasAccess: AuthService.hasPermission(UserPermission.SectionPositions)
    }
  }
})
</script>
