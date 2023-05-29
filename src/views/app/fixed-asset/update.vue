<template>
  <div v-if="hasAccess && formData.id">
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
          :inputValue="formData.financiallyResponsiblePersonId"
          v-model="formData.financiallyResponsiblePersonId"
        />
      </div>

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

      <div class="form-group">
        <select-with-validation
          id="counterparty"
          :name="'Контрагент'"
          value="counterpartyId"
          :errors="errors"
          :items="counterparties"
          :isShowFirstEmptyElement="true"
          :inputValue="formData.counterpartyId"
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
          :inputValue="formData.warehouseId"
          v-model="formData.warehouseId"
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

      <div class="form-floating mb-3">
        <input-with-validation
          :id="'serial-number-validation'"
          :name="'Серийный номер'"
          :errors="errors"
          :value="'serialNumber'"
          :inputValue="formData.serialNumber"
          v-model="formData.serialNumber"
        />
      </div>

      <div class="form-floating mb-3">
        <input-with-validation
          :id="'inventory-number-validation'"
          :name="'Инвентарный номер'"
          :errors="errors"
          :value="'inventoryNumber'"
          :inputValue="formData.inventoryNumber"
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
          :inputValue="formData.unitId"
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
          :inputValue="formData.purchasePrice"
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
          :inputValue="formData.vatId"
          v-model="formData.vatId"
        />
      </div>

      <div class="form-floating mb-3">
        <template v-if="fixedAsset.status === FixedAssetStatus.InUse">
          <input type="text" disabled class="form-control" id="fixed-asset-status" v-model="FixedAssetStatusLabel.InUse">
        </template>
        <template v-if="fixedAsset.status === FixedAssetStatus.Storage">
          <input type="text" disabled class="form-control" id="fixed-asset-status" v-model="FixedAssetStatusLabel.Storage">
        </template>
        <template v-if="fixedAsset.status === FixedAssetStatus.Decommissioned">
          <input type="text" disabled class="form-control" id="fixed-asset-status" v-model="FixedAssetStatusLabel.Decommissioned">
        </template>

        <label for="warehouse-status" class="form-label">Статус</label>
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
import useFixedAssets from './../../../repositories/fixed-assets'
import useCategories from './../../../repositories/categories'
import useVats from './../../../repositories/vats'
import useUnits from './../../../repositories/units'
import useWarehouses from './../../../repositories/warehouses'
import useEmployees from './../../../repositories/employees'
import useCounterparties from './../../../repositories/counterparties'
import { UserPermission, UserStatus} from '@/models/user'
import {FixedAssetUpdateDto, FixedAssetStatus, FixedAssetStatusLabel} from "@/models/fixed-asset";
import {Error} from '@/models/error'
import AuthService from '../../../auth/auth-service'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import SelectWithValidation from '../../../components/UI/blocks/select-with-validation.vue'
import TreeSelectWithValidation from '../../../components/UI/blocks/tree-select-with-validation.vue'
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
    const route = useRoute()
    const { push } = useRouter()

    const { fixedAsset, fetchFixedAsset, updateFixedAsset } = useFixedAssets()
    const { categoriesTree, fetchCategoriesTree } = useCategories()
    const { vats, fetchVats } = useVats()
    const { units, fetchUnits } = useUnits()
    const { warehouses, fetchWarehouses } = useWarehouses()
    const { employees, fetchEmployees } = useEmployees()
    const { counterparties, fetchCounterparties } = useCounterparties()

    const vatSearchDto = reactive<VatSearchDto>({withoutPagination: true, status: VatStatus.Active})
    const unitSearchDto = reactive<UnitSearchDto>({withoutPagination: true, status: UnitStatus.Active})
    const warehouseSearchDto = reactive<WarehouseSearchDto>({withoutPagination: true, status: WarehouseStatus.Active})
    const employeeSearchDto = reactive<EmployeeSearchDto>({withoutPagination: true, status: UserStatus.Active})
    const counterpartySearchDto = reactive<CounterpartySearchDto>({withoutPagination: true, status: CounterpartyStatus.Active})

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const treeNodes = ref([]) as any;

    const formData = reactive<FixedAssetUpdateDto>({})

    fetchFixedAsset(route.params.id as string).then(() => {
      if (fixedAsset) {
        formData.id = fixedAsset.id
        formData.financiallyResponsiblePersonId = fixedAsset.financiallyResponsiblePerson?.id
        formData.categoryId = fixedAsset.category.id
        formData.counterpartyId = fixedAsset.counterparty?.id
        formData.warehouseId = fixedAsset.warehouse?.id
        formData.name = fixedAsset.name
        formData.description = fixedAsset.description
        formData.serialNumber = fixedAsset.serialNumber
        formData.inventoryNumber = fixedAsset.inventoryNumber
        formData.unitId = fixedAsset.unit.id
        formData.purchasePrice = fixedAsset.purchasePrice
        formData.vatId = fixedAsset.vat?.id
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
    fetchEmployees(employeeSearchDto)
    fetchCounterparties(counterpartySearchDto)

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        await updateFixedAsset(formData);
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
      fixedAsset,
      errors,
      treeNodes,
      vats,
      units,
      warehouses,
      employees,
      counterparties,
      FixedAssetStatus,
      FixedAssetStatusLabel,
      handleSubmit,
      hasAccess: AuthService.hasPermission(UserPermission.SectionFixedAssets)
    }
  }
})
</script>
