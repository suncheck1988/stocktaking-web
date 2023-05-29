<template>
  <div v-if="hasAccess">
    <error-message :errors="errors"/>

    <form class="mb-3" @submit.prevent>
      <div class="form-floating mb-3">
        <input-with-validation
          :id="'name-validation'"
          :name="'Имя'"
          :type="number"
          :errors="errors"
          :value="'name'"
          v-model="formData.name"
        />
      </div>

      <div class="mb-3">
        <label for="category-parent" class="form-label"><strong>Дочерние категории:</strong></label>

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
import useCategories from './../../../repositories/categories'
import { UserPermission } from '@/models/user'
import { Error } from '@/models/error'
import ErrorMessage from '../../../components/UI/message/error-message.vue'
import InputWithValidation from '../../../components/UI/blocks/input-with-validation.vue'
import AuthService from '../../../auth/auth-service'
import { CategoryCreateDto } from "@/models/category";

export default defineComponent({
  components: {
    InputWithValidation,
    ErrorMessage
  },
  setup () {
    const { push } = useRouter()

    const { createCategory } = useCategories()
    const formData = reactive<CategoryCreateDto>({})
    const isLoading = ref<boolean>(false)

    const errors = ref<Error[]>([])

    const newChildCategoryRef = ref('')
    const newChildCategoriesToAdd = ref<any>([])

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

    async function handleSubmitCreate () {
      isLoading.value = true
      errors.value = []

      try {
        formData.children = newChildCategoriesToAdd.value

        await createCategory(formData);
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
      errors,
      newChildCategoryRef,
      newChildCategoriesToAdd,
      addNewChildCategory,
      removeNewChildCategory,
      handleSubmitCreate,
      hasAccess: AuthService.hasPermission(UserPermission.SectionCategories)
    }
  }
})
</script>
