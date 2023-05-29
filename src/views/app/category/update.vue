<template>
  <div v-if="hasAccess && formData.id">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent>
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

      <template v-if="!formData.parentId">
        <div class="mb-3">
          <label for="category-parent" class="form-label"><strong>Дочерние категории:</strong></label>

          <div
            style="margin-bottom: 15px;"
            v-for="item in formData.existsChildren"
            :key="item.id"
          >
            <input class="form-control" type="text" name="child" :id="'child-' + item.id" :value="item.name" disabled>

            Удалить <input class="form-check-input" @change="toRemoveExistsChild($event)" type="checkbox" name="child-checkbox" :id="'child-' + item.id" :value="item.id">
          </div>

          <div class="input-group w-60" style="margin-bottom: 15px;">
            <span class="input-group-text">Имя</span>
            <input type="text" class="form-control" v-model="newChildCategoryRef">

            <button class="btn btn-primary me-3" @click="addNewChildCategory">Добавить дочернюю категорию</button>
          </div>

          <div class="mb-3">
            <div class="input-group w-60 mb-3" v-for="(childCategory, index) in newChildCategoriesToAdd" :key="index">
              <span class="input-group-text">Имя</span>
              <input type="text" class="form-control" v-model="childCategory.name" disabled>

              <button class="btn btn-primary me-3" @click="removeNewChildCategory(index)">Удалить</button>
            </div>
          </div>
        </div>
      </template>

      <div class="form-floating mb-3">
        <template v-if="category.status === CategoryStatus.Active">
          <input type="text" disabled class="form-control" id="category-status" v-model="CategoryStatusLabel.Active">
        </template>
        <template v-if="category.status === CategoryStatus.Inactive">
          <input type="text" disabled class="form-control" id="category-status" v-model="CategoryStatusLabel.Inactive">
        </template>

        <label for="category-status" class="form-label">Статус</label>
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
import useCategories from './../../../repositories/categories'
import { UserPermission} from '@/models/user'
import {CategoryUpdateDto, CategorySearchDto, CategoryStatus, CategoryStatusLabel, Category} from '@/models/category'
import {Error} from '@/models/error'
import AuthService from '../../../auth/auth-service'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'

export default defineComponent({
  components: {
    InputWithValidation,
    ErrorMessage
  },
  setup () {
    const route = useRoute()
    const { push } = useRouter()

    const { category, fetchCategory, categories, fetchCategories, updateCategory } = useCategories()

    const isLoading = ref<boolean>(false)
    const errors = ref<Error[]>([])

    const newChildCategoryRef = ref('')
    const newChildCategoriesToAdd = ref<any>([])

    const formData = reactive<CategoryUpdateDto>({})
    const categorySearchDto = reactive<CategorySearchDto>({withoutPagination: true})

    function addNewChildCategory() {
      if (newChildCategoryRef.value !== '') {
        let obj = {
          name: newChildCategoryRef.value
        };

        newChildCategoriesToAdd.value.push(obj);

        newChildCategoryRef.value = '';
      }
    }
    function removeNewChildCategory(index: string) {
      newChildCategoriesToAdd.value.splice(index, 1);
    }

    function toRemoveExistsChild(e: any) {
      formData.existsChildren?.forEach((item: any) => {
        if (item.id === e.target.value) {
          item.isRemove = !!e.target.checked;
          return
        }
      })
    }

    fetchCategory(route.params.id as string).then(() => {
      if (category) {
        formData.id = category.id
        formData.name = category.name
        formData.parentId = category.parent?.id
        formData.existsChildren = [];

        category.children.forEach((child: Category) => {
          const obj = {id: child.id, name: child.name, isRemove: false} as never
          if (formData.existsChildren) {
            formData.existsChildren.push(obj)
          }
        })
      }
    })
    fetchCategories(categorySearchDto)

    async function handleSubmit () {
      isLoading.value = true
      errors.value = []
      try {
        if (!formData.parentId) {
          formData.newChildren = newChildCategoriesToAdd.value
        }

        await updateCategory(formData);
        isLoading.value = false
        await push({name: 'AppCategoryIndex'})
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
      category,
      categories,
      newChildCategoryRef,
      newChildCategoriesToAdd,
      toRemoveExistsChild,
      errors,
      CategoryStatus,
      CategoryStatusLabel,
      addNewChildCategory,
      removeNewChildCategory,
      handleSubmit,
      hasAccess: AuthService.hasPermission(UserPermission.SectionCategories)
    }
  }
})
</script>
