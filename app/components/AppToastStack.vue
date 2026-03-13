<script setup lang="ts">
import type { ToastItem, ToastTone } from '~/stores/toast'

const toastStore = useToastStore()
const { dismissToast } = toastStore
const { toasts } = storeToRefs(toastStore)

const toneClasses: Record<ToastTone, string> = {
  error: 'border-error/70',
  info: 'border-info/70',
  success: 'border-success/70',
  warning: 'border-warning/70'
}

const iconClasses: Record<ToastTone, string> = {
  error: 'text-error',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning'
}

const toneIcons: Record<ToastTone, string> = {
  error: 'error',
  info: 'info',
  success: 'check_circle',
  warning: 'warning'
}

const closeToast = (toast: ToastItem): void => {
  dismissToast(toast.id)
}
</script>

<template>
  <div aria-live="polite" class="pointer-events-none fixed inset-x-4 top-4 z-[100] flex justify-end">
    <TransitionGroup name="toast-stack" tag="div" class="flex w-full max-w-sm flex-col gap-3">
      <article v-for="toast in toasts" :key="toast.id"
        class="pointer-events-auto rounded-[1.75rem] border-2 bg-base-100/95 p-4 shadow-xl backdrop-blur"
        :class="toneClasses[toast.tone]" role="status">
        <div class="flex items-start gap-3">
          <span class="material-symbols-rounded shrink-0 pt-0.5 text-[20px]" :class="iconClasses[toast.tone]">
            {{ toneIcons[toast.tone] }}
          </span>

          <div class="min-w-0 flex-1">
            <p class="font-semibold">{{ toast.title }}</p>
            <p class="mt-1 text-sm text-base-content/80">{{ toast.message }}</p>
          </div>

          <button type="button" class="btn btn-ghost btn-sm btn-circle shrink-0" aria-label="Fermer la notification"
            @click="closeToast(toast)">
            <span class="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-stack-enter-active,
.toast-stack-leave-active,
.toast-stack-move {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.toast-stack-enter-from,
.toast-stack-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}
</style>
