<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-emerald-600">
          <img 
            src="/logo.svg" 
            alt="ShopifyGenie OMS" 
            class="w-10 h-10 mr-2"
          />
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-white leading-tight">ShopifyGenie</h1>
            <span class="text-xs text-blue-100 font-medium">OMS</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="[
              $route.path === item.to || $route.path.startsWith(item.to + '/')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- User Menu -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                {{ userInitials }}
              </div>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-700">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user?.role }}</p>
            </div>
            <button
              @click="handleLogout"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pl-64">
      <main class="p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  HomeIcon,
  ShoppingBagIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Orders', to: '/orders', icon: ShoppingBagIcon },
  { name: 'Fulfillments', to: '/fulfillments', icon: TruckIcon },
  { name: 'Inventory', to: '/inventory', icon: ArchiveBoxIcon },
  { name: 'Returns', to: '/returns', icon: ArrowUturnLeftIcon },
  { name: 'Analytics', to: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
]

const userInitials = computed(() => {
  if (!authStore.user) return '?'
  return `${authStore.user.firstName[0]}${authStore.user.lastName[0]}`.toUpperCase()
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

