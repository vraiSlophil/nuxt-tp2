import { useState } from '#imports'

export type ToastTone = 'error' | 'success' | 'info' | 'warning'

export interface ToastOptions {
  title?: string
  message: string
  tone?: ToastTone
  duration?: number
}

export interface ToastItem {
  id: string
  title: string
  message: string
  tone: ToastTone
  duration: number
}

const DEFAULT_DURATION = 4500
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>()

const createToastId = (): string => {
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

const clearToastTimer = (id: string): void => {
  const timer = toastTimers.get(id)

  if (!timer) {
    return
  }

  clearTimeout(timer)
  toastTimers.delete(id)
}

export const useToast = () => {
  const toasts = useState<ToastItem[]>('app-toasts', () => [])

  const dismissToast = (id: string): void => {
    toasts.value = toasts.value.filter((toast) => {
      return toast.id !== id
    })

    clearToastTimer(id)
  }

  const scheduleDismiss = (toast: ToastItem): void => {
    if (!import.meta.client || toast.duration <= 0) {
      return
    }

    clearToastTimer(toast.id)

    const timer = window.setTimeout(() => {
      dismissToast(toast.id)
    }, toast.duration)

    toastTimers.set(toast.id, timer)
  }

  const showToast = (options: ToastOptions): ToastItem => {
    const tone = options.tone ?? 'info'
    const message = options.message.trim()

    if (message.length === 0) {
      throw new Error('Toast message cannot be empty.')
    }

    const existingToast = toasts.value.find((toast) => {
      return toast.message === message && toast.tone === tone
    })

    if (existingToast) {
      scheduleDismiss(existingToast)
      return existingToast
    }

    const toast: ToastItem = {
      id: createToastId(),
      title: options.title?.trim() || 'Notification',
      message,
      tone,
      duration: options.duration ?? DEFAULT_DURATION
    }

    toasts.value = [...toasts.value, toast]
    scheduleDismiss(toast)

    return toast
  }

  const error = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}): ToastItem => {
    return showToast({
      ...options,
      message,
      tone: 'error',
      title: options.title ?? 'Erreur'
    })
  }

  const success = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}): ToastItem => {
    return showToast({
      ...options,
      message,
      tone: 'success',
      title: options.title ?? 'Succes'
    })
  }

  const info = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}): ToastItem => {
    return showToast({
      ...options,
      message,
      tone: 'info',
      title: options.title ?? 'Information'
    })
  }

  const warning = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}): ToastItem => {
    return showToast({
      ...options,
      message,
      tone: 'warning',
      title: options.title ?? 'Attention'
    })
  }

  const clearToasts = (): void => {
    toasts.value.forEach((toast) => {
      clearToastTimer(toast.id)
    })

    toasts.value = []
  }

  return {
    toasts,
    showToast,
    dismissToast,
    clearToasts,
    error,
    success,
    info,
    warning
  }
}
