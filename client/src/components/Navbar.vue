<template>
  <header
    class="fixed left-0 right-0 top-0 h-16 bg-lightSurface dark:bg-darkSurface backdrop-blur-xl flex justify-between items-center px-6 shadow-md border-b border-gray-200 dark:border-gray-800 z-10 transition-all duration-300"
    :style="{ marginLeft: sidebarWidth }"
  >
    <h2 class="text-lg font-semibold text-lightText dark:text-darkText">
      {{ title }}
    </h2>

    <div class="flex items-center gap-4">
      <!-- Search (placeholder) -->
      <div class="hidden md:flex items-center px-4 py-2 bg-lightBg dark:bg-darkBg rounded-lg border border-gray-200 dark:border-gray-700">
        <Search :size="16" class="text-mutedLight dark:text-mutedDark mr-2" />
        <input
          type="text"
          placeholder="Search..."
          class="bg-transparent outline-none text-sm text-lightText dark:text-darkText placeholder-mutedLight dark:placeholder-mutedDark w-48"
        />
      </div>

      <!-- Notifications -->
      <button
        class="relative p-2 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell :size="20" class="text-lightText dark:text-darkText" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- User Menu -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-3 px-3 py-2 bg-primary/10 dark:bg-secondary/10 rounded-full border border-primary/20 dark:border-secondary/20">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
            {{ userInitials }}
          </div>
          <span class="text-sm font-medium text-lightText dark:text-darkText">
            {{ userName }}
          </span>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
        >
          <LogOut :size="16" />
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Bell, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const title = computed(() => route.meta?.title || 'Dashboard')
const userName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName} ${user.lastName}` : 'Guest'
})
const userInitials = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?'
})

// Responsive sidebar width
const sidebarWidth = computed(() => {
  const collapsed = localStorage.getItem('sidebar-collapsed') === 'true'
  return collapsed ? '5rem' : '16rem'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

