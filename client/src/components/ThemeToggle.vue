<template>
  <button
    @click="toggle"
    class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform duration-200"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Moon v-if="isDark" :size="20" class="text-yellow-400" />
    <Sun v-else :size="20" class="text-orange-500" />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const toggle = () => themeStore.toggleTheme()
</script>

