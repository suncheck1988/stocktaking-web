<template>
  <label :for="id">{{ name }}</label>
  <select
    style="margin-bottom: 12px"
    ref="selectEl"
    :id="id"
    class="form-select"
    v-model="input"
    :class="{ 'is-invalid': error !== '' }"
    @input="$emit('update:modelValue', input)"
    v-bind="$attrs"
  >
    <template v-if="isShowFirstEmptyElement">
      <option :value=null></option>
    </template>
    <option v-for="item in items" :key="item.id" :value="item.id">
      <template v-if="item.name">
        {{ item.name }}
      </template>
      <template v-if="item.value">
        {{ item.value }}
      </template>
      <template v-if="item.user?.name">
        {{ item.user?.name }}
      </template>
    </option>
  </select>
  <div v-if="error !== ''" :id="id" class="invalid-feedback">
    {{ error }}
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, PropType, ref, toRefs, watch} from 'vue'
import { Error } from "@/models/error";

export default defineComponent({
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
    isShowFirstEmptyElement: {
      type: Boolean,
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

    onMounted( () => {
      if (props.inputValue) {
        input.value = props.inputValue
      }

      watch(errors, () => {
        error.value = ''
        if (errors.value.length > 0) {
          errors.value.forEach((item) => {
            if (item.property === props.value) {
              error.value = item.message
            }
          })
        }
      })
    })

    return {
      error,
      input,
      selectEl
    }
  }
});
</script>
