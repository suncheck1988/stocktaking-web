<template>
  <input
    :type="type ? type : 'text'"
    class="form-control"
    :class="{ 'is-invalid': error !== '' }"
    :id="id"
    v-model="input"
    @input="$emit('update:modelValue', $event.target.value)"
    v-bind="$attrs"
  >
  <label :for="id">{{ name }}</label>

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
    type: {
      type: String,
      required: false
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
    }
  },
  setup (props) {
    const { errors } = toRefs(props)
    const error = ref('')
    const input = ref();

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
      input
    }
  }
});
</script>
