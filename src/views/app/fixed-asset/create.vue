<template>
  <div v-if="hasAccess">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent>
      <div class="form-group">
        <select-with-validation
          id="employee"
          :name="'Материально ответственное лицо'"
          value="employeeId"
          :errors="errors"
          :items="employees"
          :isShowFirstEmptyElement="true"
          v-model="formData.financiallyResponsiblePersonId"
        />
      </div>

      <div class="form-group">
        <tree-select-with-validation
          id="category-validation"
          :name="'Категория'"
          value="categoryId"
          :errors="errors"
          :items="treeNodes"
          v-model="formData.categoryId"
        />
      </div>

      <div class="form-group">
        <select-with-validation
          id="counterparty"
          :name="'Контрагент'"
          value="counterpartyId"
          :errors="errors"
          :items="counterparties"
          :isShowFirstEmptyElement="true"
          v-model="formData.counterpartyId"
        />
      </div>

      <div class="form-group">
        <select-with-validation
          id="warehouse"
          :name="'Склад'"
          value="warehouseId"
          :errors="errors"
          :items="warehouses"
          :isShowFirstEmptyElement="true"
          v-model="formData.warehouseId"
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

      <div class="form-floating mb-3">
        <input-with-validation
          :id="'serial-number-validation'"
          :name="'Серийный номер'"
          :errors="errors"
          :value="'serialNumber'"
          v-model="formData.serialNumber"
        />
      </div>

      <div class="form-floating mb-3">
        <input-with-validation
          :id="'inventory-number-validation'"
          :name="'Инвентарный номер'"
          :errors="errors"
          :value="'inventoryNumber'"
          v-model="formData.inventoryNumber"
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
          :id="'purchase-price-validation'"
          :name="'Закупочная стоимость'"
          :type="'number'"
          :errors="errors"
          :value="'purchasePrice'"
          v-model="formData.purchasePrice"
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
        <div class="mb-3">
          <label for="status" class="form-label">Статус</label>
          <select class="form-select" id="status" v-model="formData.status">
            <option value=""></option>
            <option v-for="item in fixedAssetStatuses" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
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
import useFixedAssets from './../../../repositories/fixed-assets'
import useCategories from './../../../repositories/categories'
import useVats from './../../../repositories/vats'
import useUnits from './../../../repositories/units'
import useWarehouses from './../../../repositories/warehouses'
import useEmployees from './../../../repositories/employees'
import useCounterparties from './../../../repositories/counterparties'
import {UserPermission, UserStatus} from '@/models/user'
import { Error } from '@/models/error'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import SelectWithValidation from '../../../components/UI/blocks/select-with-validation.vue'
import TreeSelectWithValidation from '../../../components/UI/blocks/tree-select-with-validation.vue'
import AuthService from '../../../auth/auth-service'
import {FixedAssetCreateDto, FixedAssetStatus, FixedAssetStatusLabel} from "@/models/fixed-asset";
import {VatSearchDto, VatStatus} from "@/models/vat";
import {UnitSearchDto, UnitStatus} from "@/models/unit";
import {WarehouseSearchDto, WarehouseStatus} from "@/models/warehouse";
import {EmployeeSearchDto, } from "@/models/employee";
import {CounterpartySearchDto, CounterpartyStatus} from "@/models/counterparty";

export default defineComponent({
  components: {
    InputWithValidation,
    SelectWithValidation,
    TreeSelectWithValidation,
    ErrorMessage
  },
  setup () {
    const { push } = useRouter()

    const { createFixedAsset } = useFixedAssets()
    const { categoriesTree, fetchCategoriesTree } = useCategories()
    const { vats, fetchVats } = useVats()
    const { units, fetchUnits } = useUnits()
    const { warehouses, fetchWarehouses } = useWarehouses()
    const { employees, fetchEmployees } = useEmployees()
    const { counterparties, fetchCounterparties } = useCounterparties()

    const formData = reactive<FixedAssetCreateDto>({})
    const vatSearchDto = reactive<VatSearchDto>({withoutPagination: true, status: VatStatus.Active})
    const unitSearchDto = reactive<UnitSearchDto>({withoutPagination: true, status: UnitStatus.Active})
    const warehouseSearchDto = reactive<WarehouseSearchDto>({withoutPagination: true, status: WarehouseStatus.Active})
    const employeeSearchDto = reactive<EmployeeSearchDto>({withoutPagination: true, status: UserStatus.Active})
    const counterpartySearchDto = reactive<CounterpartySearchDto>({withoutPagination: true, status: CounterpartyStatus.Active})

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

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
    fetchEmployees(employeeSearchDto)
    fetchCounterparties(counterpartySearchDto)

    async function handleSubmitCreate () {
      isLoading.value = true
      errors.value = []

      try {
        await createFixedAsset(formData);
        isLoading.value = false
        await push({name: 'AppFixedAssetIndex'})
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
      errors,
      treeNodes,
      vats,
      units,
      warehouses,
      employees,
      counterparties,
      fixedAssetStatuses,
      handleSubmitCreate,
      hasAccess: AuthService.hasPermission(UserPermission.SectionFixedAssets)
    }
  }
})
</script>
