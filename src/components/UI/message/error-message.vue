<template>
  <div v-if="error !== ''" class="alert alert-danger">
    {{ error }}
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, PropType, ref, toRefs, watch} from 'vue'
import {Error} from "@/models/error";

export default defineComponent({
  props: {
    errors: {
      type: Array as PropType<Error[]>,
      required: true
    }
  },
  setup (props) {
    const { errors } = toRefs(props)
    const error = ref('')

    onMounted( () => {
      watch(errors, () => {
        error.value = ''
        if (errors.value.length > 0) {
          errors.value.forEach((item) => {
            if (!item.property) {
              error.value = item.message
            }
          })
        }
      })
    })

    return {
      error
    }
  }
});
</script>
