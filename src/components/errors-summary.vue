<template>
  <div v-if="errors.length > 0" class="alert alert-danger">
    <ul class=" mb-0">
      <li v-for="(error, key) in errors" :key="key">
        <template v-if="error.property">{{ error.property }} — </template>
        {{ error.message }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Error } from '@/models/error'

export default defineComponent({
  props: {
    errors: {
      type: Array as PropType<Error[]>,
      required: true
    }
  }
});
</script>
