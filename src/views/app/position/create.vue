<template>
  <div v-if="hasAccess">
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
        />
      </div>

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
          :id="'description-validation'"
          :name="'Описание'"
          :errors="errors"
          :value="'description'"
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
          v-model="formData.price"
        />
      </div>

      <div class="mb-3">
        <label for="position-balance" class="form-label">Доступность на складах:</label>

        <div class="input-group w-60" style="margin-bottom: 15px;">
          <span class="input-group-text">Склад</span>
          <select
            class="form-select"
            v-model="newPositionBalanceRef.warehouseId"
          >
            <option v-for="item in warehouses" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>

          <span class="input-group-text">Кол-во</span>
          <input type="number" class="form-control" v-model="newPositionBalanceRef.quantity">

          <button class="btn btn-primary me-3" @click="addNewPositionBalance">Добавить баланс</button>
        </div>

        <div class="mb-3">
          <div class="input-group w-60 mb-3" v-for="(balance, index) in newPositionBalancesToAdd" :key="index">
            <span class="input-group-text">Склад</span>
            <select
              class="form-select"
              disabled
              v-model="balance.warehouseId"
            >
              <option v-for="item in warehouses" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>

            <span class="input-group-text">Кол-во</span>
            <input type="text" class="form-control" v-model="balance.quantity" disabled>

            <button class="btn btn-primary me-3" @click="removeNewPositionBalance(index)">Удалить</button>
          </div>
        </div>
      </div>

      <button @click="handleSubmitCreate" class="btn btn-primary" :disabled="isLoading">
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
import usePositions from './../../../repositories/positions'
import useCategories from './../../../repositories/categories'
import useVats from './../../../repositories/vats'
import useUnits from './../../../repositories/units'
import useWarehouses from './../../../repositories/warehouses'
import { UserPermission } from '@/models/user'
import { Error } from '@/models/error'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import SelectWithValidation from '../../../components/UI/blocks/select-with-validation.vue'
import TreeSelectWithValidation from '../../../components/UI/blocks/tree-select-with-validation.vue'
import AuthService from '../../../auth/auth-service'
import { PositionCreateDto } from "@/models/position";
import {VatSearchDto, VatStatus} from "@/models/vat";
import {UnitSearchDto, UnitStatus} from "@/models/unit";
import {WarehouseSearchDto, WarehouseStatus} from "@/models/warehouse";

export default defineComponent({
  components: {
    InputWithValidation,
    SelectWithValidation,
    TreeSelectWithValidation,
    ErrorMessage
  },
  setup () {
    const { push } = useRouter()

    const { createPosition } = usePositions()
    const { categoriesTree, fetchCategoriesTree } = useCategories()
    const { vats, fetchVats } = useVats()
    const { units, fetchUnits } = useUnits()
    const { warehouses, fetchWarehouses } = useWarehouses()

    const formData = reactive<PositionCreateDto>({})
    const vatSearchDto = reactive<VatSearchDto>({withoutPagination: true, status: VatStatus.Active})
    const unitSearchDto = reactive<UnitSearchDto>({withoutPagination: true, status: UnitStatus.Active})
    const warehouseSearchDto = reactive<WarehouseSearchDto>({withoutPagination: true, status: WarehouseStatus.Active})

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const treeNodes = ref([]) as any;

    const newPositionBalanceRef = ref<any>({})
    const newPositionBalancesToAdd = ref<any>([])

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

    async function handleSubmitCreate () {
      isLoading.value = true
      errors.value = []

      try {
        formData.balance = newPositionBalancesToAdd.value

        await createPosition(formData);
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

    function addNewPositionBalance() {
      if (newPositionBalanceRef.value.warehouseId !== undefined && newPositionBalanceRef.value.quantity !== undefined) {
        let obj = {
          warehouseId: newPositionBalanceRef.value.warehouseId,
          quantity: newPositionBalanceRef.value.quantity
        };

        newPositionBalancesToAdd.value.push(obj);

        console.log(newPositionBalancesToAdd)

        newPositionBalanceRef.value = {};
      }
    }

    function removeNewPositionBalance(index: string) {
      newPositionBalancesToAdd.value.splice(index, 1);
    }

    return {
      isLoading,
      formData,
      errors,
      treeNodes,
      vats,
      units,
      warehouses,
      newPositionBalanceRef,
      newPositionBalancesToAdd,
      handleSubmitCreate,
      addNewPositionBalance,
      removeNewPositionBalance,
      hasAccess: AuthService.hasPermission(UserPermission.SectionPositions)
    }
  }
})
</script>
