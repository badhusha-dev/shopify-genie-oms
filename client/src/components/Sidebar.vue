<template>
  <aside
    :class="[
      'h-screen bg-lightSurface dark:bg-darkSurface shadow-lg fixed flex flex-col justify-between transition-all duration-300 border-r border-gray-200 dark:border-gray-800',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Header -->
    <div>
      <div class="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-gray-700">
        <transition name="fade" mode="out-in">
          <div v-if="!isCollapsed" class="flex items-center space-x-3">
            <img 
              :src="isDark ? '/logo-dark.svg' : '/logo.svg'" 
              alt="ShopifyGenie Logo" 
              class="w-10 h-10 transition-transform duration-300 hover:scale-110 hover:drop-shadow-glow"
            />
            <div class="flex flex-col">
              <h1 class="text-xl font-bold text-primary dark:text-secondary">
                ShopifyGenie
              </h1>
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">OMS</span>
            </div>
          </div>
          <img 
            v-else 
            :src="isDark ? '/logo-dark.svg' : '/logo.svg'" 
            alt="SG" 
            class="w-10 h-10 transition-transform duration-300 hover:scale-110 hover:drop-shadow-glow mx-auto"
          />
        </transition>
        <button
          @click="toggleSidebar"
          class="p-2 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded-lg transition-colors"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <ChevronLeft v-if="!isCollapsed" :size="20" class="text-lightText dark:text-darkText" />
          <ChevronRight v-else :size="20" class="text-lightText dark:text-darkText" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 px-3">
        <ul class="space-y-1">
          <li v-for="item in menu" :key="item.label">
            <router-link
              :to="item.to"
              v-slot="{ isActive }"
              custom
            >
              <a
                :href="item.to"
                @click.prevent="$router.push(item.to)"
                :class="[
                  'group flex items-center px-3 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary border border-primary/20 dark:border-secondary/30'
                    : 'text-lightText dark:text-darkText hover:bg-primary/10 dark:hover:bg-secondary/20'
                ]"
                :title="isCollapsed ? item.label : ''"
              >
                <component
                  :is="item.icon"
                  :size="20"
                  :class="[
                    'transition-transform duration-200',
                    isActive ? 'text-primary dark:text-secondary scale-110' : 'group-hover:text-primary dark:group-hover:text-secondary group-hover:scale-110'
                  ]"
                />
                <transition name="fade">
                  <span v-if="!isCollapsed" class="ml-3 font-medium">
                    {{ item.label }}
                  </span>
                </transition>
                <transition name="fade">
                  <span
                    v-if="item.badge && !isCollapsed"
                    class="ml-auto bg-accent text-white text-xs px-2 py-0.5 rounded-full font-semibold"
                  >
                    {{ item.badge }}
                  </span>
                </transition>
              </a>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <ThemeToggle />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Home, ShoppingBag, Truck, Package, Undo2, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const isCollapsed = ref(false)

const menu = [
  { label: 'Dashboard', to: '/', icon: Home, badge: null },
  { label: 'Orders', to: '/orders', icon: ShoppingBag, badge: '12' },
  { label: 'Fulfillment', to: '/fulfillments', icon: Truck, badge: null },
  { label: 'Inventory', to: '/inventory', icon: Package, badge: null },
  { label: 'Returns', to: '/returns', icon: Undo2, badge: '3' },
  { label: 'Analytics', to: '/analytics', icon: BarChart3, badge: null },
  { label: 'Settings', to: '/settings', icon: Settings, badge: null },
]

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
}

// Load saved state
const savedState = localStorage.getItem('sidebar-collapsed')
if (savedState !== null) {
  isCollapsed.value = savedState === 'true'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

