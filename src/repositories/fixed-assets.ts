import { reactive, ref } from 'vue'
import api from '../api'
import { FixedAsset, FixedAssetCreateDto, FixedAssetUpdateDto, FixedAssetSearchDto } from "@/models/fixed-asset";
import {Category} from "@/models/category";
import {Unit} from "@/models/unit";
import {UserShort} from "@/models/user";

export default function useFixedAssets() {
  const fixedAsset = reactive<FixedAsset>({
    id: '',
    financiallyResponsiblePerson: reactive<UserShort>({
      id: '',
      name: '',
      email: '',
      role: 0,
      status: 0
    }),
    category: reactive<Category>({
      id: '',
      name: '',
      children: [],
      status: 0,
    }),
    name: '',
    serialNumber: '',
    inventoryNumber: '',
    unit: reactive<Unit>({
      id: '',
      name: '',
      status: 0
    }),
    purchasePrice: 0,
    residualValue: 0,
    status: 0
  })
  const fixedAssets = ref<FixedAsset[]>([])
  const pageCount = ref(0)

  async function fetchFixedAssets (searchDto?: FixedAssetSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      id: searchDto?.id || '',
      categoryId: searchDto?.categoryId || '',
      warehouseId: searchDto?.warehouseId || '',
      name: searchDto?.name || '',
      serialNumber: searchDto?.serialNumber || '',
      status: searchDto?.status || ''
    }

    const result = await api.getWithHeaders('v1/fixed-asset', query)
    const data = await result.data

    fixedAssets.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchFixedAsset (id: string): Promise<void> {
    await api.get('v1/fixed-asset/' + id).then(response => {
      fixedAsset.id = response.id
      fixedAsset.financiallyResponsiblePerson = response.financiallyResponsiblePerson
      fixedAsset.category = response.category
      fixedAsset.counterparty = response.counterparty
      fixedAsset.warehouse = response.warehouse
      fixedAsset.name = response.name
      fixedAsset.description = response.description
      fixedAsset.serialNumber = response.serialNumber
      fixedAsset.inventoryNumber = response.inventoryNumber
      fixedAsset.unit = response.unit
      fixedAsset.purchasePrice = response.purchasePrice
      fixedAsset.vat = response.vat
      fixedAsset.residualValue = response.residualValue
      fixedAsset.inUseAt = response.inUseAt
      fixedAsset.decommissionedAt = response.decommissionedAt
      fixedAsset.status = response.status
    })
  }

  async function createFixedAsset (fixedAsset: FixedAssetCreateDto): Promise<void> {
    const data = Object.assign({}, fixedAsset)
    await api.post('v1/fixed-asset', data)
  }

  async function updateFixedAsset (fixedAsset: FixedAssetUpdateDto): Promise<void> {
    const data = Object.assign({}, fixedAsset)
    await api.patch('v1/fixed-asset/' + fixedAsset.id, data)
  }

  async function inUseFixedAsset (id: string): Promise<void> {
    await api.post('v1/fixed-asset/' + id + '/in-use', null)
  }

  async function storageFixedAsset (id: string): Promise<void> {
    await api.post('v1/fixed-asset/' + id + '/storage', null)
  }

  async function decommissionedFixedAsset (id: string): Promise<void> {
    await api.post('v1/fixed-asset/' + id + '/decommissioned', null)
  }

  return {
    fixedAssets,
    fixedAsset,
    pageCount,
    fetchFixedAssets,
    fetchFixedAsset,
    createFixedAsset,
    updateFixedAsset,
    inUseFixedAsset,
    storageFixedAsset,
    decommissionedFixedAsset
  }
}
