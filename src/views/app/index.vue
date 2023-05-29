<template>
  <div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  UserRole,
  UserRoleLabel
} from '@/models/user'
import moment from 'moment'

export default defineComponent({
  setup () {
    function date(val: string) {
      return moment(val).format('DD-MM-YYYY')
    }

    return {
      date,

      adminRole: UserRole.Admin,
      adminRoleLabel: UserRoleLabel.Admin,
    }
  }
})
</script>
