<template>
  <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary" @click.prevent="$emit('confirm')">Подтвердить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { Modal } from 'bootstrap'

export default defineComponent({
  name: 'modal',
  props: ['modelValue', 'modalTitle'],
  emits: ['update:modelValue', 'confirm'],
  setup (props, context) {
    const modalRef = ref()
    let myModal: Modal

    onMounted(() => {
      myModal = new Modal(modalRef.value as Element, {
        backdrop: 'static',
        keyboard: false
      })

      modalRef.value.addEventListener('hide.bs.modal', function () {
        context.emit('update:modelValue', false)
      })
    })

    watch(() => props.modelValue, (value: boolean, prev: boolean) => {
      if (value !== prev) {
        if (value) {
          myModal.show()
        } else {
          myModal.hide()
        }
      }
    })

    return {
      modalRef
    }
  }
})
</script>
