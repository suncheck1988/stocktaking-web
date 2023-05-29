<template>
  <month-picker-input :no-default="true" @change="handleChange" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MonthPickerInput } from 'vue-month-picker'
import moment from 'moment'

export default defineComponent({
  name: 'month-picker',
  components: {
    MonthPickerInput
  },
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup (props, context) {

    function handleChange(date: any) {
      const year = date.year
      const month = date.monthIndex
      const current = moment(year.toString() + '-' + month.toString(), 'YYYY-M')
      context.emit('update:modelValue', current.format('YYYY-MM-01'))
    }

    return {
      handleChange
    }
  }
})
</script>
