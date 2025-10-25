<template>
  <div class="fixed inset-0 z-50 flex flex-col justify-center items-center bg-gradient-brand text-white">
    <!-- Animated Logo -->
    <div 
      v-motion-pop
      class="mb-6"
    >
      <img 
        src="/logo-dark.svg" 
        alt="ShopifyGenie" 
        class="w-24 h-24 animate-pulse-slow drop-shadow-glow"
      />
    </div>

    <!-- Brand Name -->
    <h1 
      v-motion-slide-visible-once-bottom
      :delay="200"
      class="text-3xl font-bold tracking-wide mb-2 font-display"
    >
      ShopifyGenie OMS
    </h1>

    <!-- Tagline -->
    <p 
      v-motion-slide-visible-once-bottom
      :delay="400"
      class="text-sm opacity-80 mb-8 tracking-wider"
    >
      Smarter Orders. Seamless Fulfillment.
    </p>

    <!-- Loading Bar -->
    <div class="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
      <div 
        class="h-full bg-white rounded-full animate-pulse"
        :style="{ width: progress + '%' }"
      ></div>
    </div>

    <!-- Loading Text -->
    <p class="mt-4 text-xs text-white/60 animate-pulse">
      {{ loadingText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  loadingText?: string
  progress?: number
}

withDefaults(defineProps<Props>(), {
  loadingText: 'Initializing...',
  progress: 0
})
</script>

