<template>
  <tree-select
    :id="id"
    :options="items"
    :disable-branch-nodes="true"
    :show-count="true"
    :placeholder="name"
    :class="error !== '' ? 'is-invalid' : ''"
    v-model="input"
    @input="$emit('update:modelValue', input)"
    v-bind="$attrs"
  />

  <div v-if="error !== ''" :id="id" class="invalid-feedback">
    {{ error }}
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, PropType, ref, toRefs, watch} from 'vue'
import { Error } from "@/models/error";
import TreeSelect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'

export default defineComponent({
  components: {
    TreeSelect
  },
  props: {
    id: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    errors: {
      type: Array as PropType<Error[]>,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    inputValue: {
      type: [String, Number],
      required: false
    },
  },
  setup (props) {
    const { errors } = toRefs(props)
    const error = ref('')
    const input = ref()
    const selectEl = ref(null)

    const colorFromScriptSetup = ref('#ced4da')

    onMounted( () => {
      if (props.inputValue) {
        input.value = props.inputValue
      }

      watch(errors, () => {
        error.value = ''
        colorFromScriptSetup.value = '#ced4da'
        if (errors.value.length > 0) {
          errors.value.forEach((item) => {
            if (item.property === props.value) {
              error.value = item.message
              colorFromScriptSetup.value = '#dc3545'
            }
          })
        }
      })
    })

    return {
      error,
      input,
      selectEl,
      colorFromScriptSetup
    }
  }
});
</script>

<style>
.vue-treeselect__control {
  border-color: v-bind('colorFromScriptSetup')
}
</style>
