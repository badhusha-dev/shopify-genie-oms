<template>
  <div class="flex h-screen overflow-hidden bg-lightBg dark:bg-darkBg transition-colors duration-300">
    <!-- Sidebar Component -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300" :style="{ marginLeft: sidebarWidth }">
      <!-- Navbar Component -->
      <Navbar />

      <!-- Main Content with Page Transitions -->
      <main class="flex-1 overflow-y-auto pt-20 px-6 bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText">
        <div class="max-w-7xl mx-auto py-6">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="$route.path" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'

// Reactive sidebar width based on collapsed state
const sidebarWidth = computed(() => {
  const collapsed = localStorage.getItem('sidebar-collapsed') === 'true'
  return collapsed ? '5rem' : '16rem'
})
</script>

<style scoped>
/* Page transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

:deep(.dark) ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

:deep(.dark) ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>
