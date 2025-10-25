import { defineStore } from 'pinia'
import { useDark, useToggle } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useDark({
    storageKey: 'shopify-genie-theme',
    valueDark: 'dark',
    valueLight: 'light',
  })

  const toggleTheme = useToggle(isDark)

  return {
    isDark,
    toggleTheme,
  }
})

