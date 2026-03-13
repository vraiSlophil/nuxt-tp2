import type { Ref } from 'vue'
import { onMounted, watch } from 'vue'

interface ErrorToastOptions {
  title?: string
}

export const useErrorToast = (errorMessage: Ref<string>, options: ErrorToastOptions = {}): void => {
  const toastStore = useToastStore()
  let lastMessage = ''

  onMounted(() => {
    watch(
      errorMessage,
      (message) => {
        const normalizedMessage = message.trim()

        if (normalizedMessage.length === 0) {
          lastMessage = ''
          return
        }

        if (normalizedMessage === lastMessage) {
          return
        }

        lastMessage = normalizedMessage
        toastStore.error(normalizedMessage, { title: options.title })
      },
      { immediate: true }
    )
  })
}
