<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: delay } }"
    :hover="{ scale: 1.05, transition: { duration: 200 } }"
    :class="[
      'p-6 rounded-2xl shadow-md transition-all cursor-pointer border',
      bgClass || 'bg-lightSurface dark:bg-darkSurface border-gray-200 dark:border-gray-700',
      'hover:shadow-lg hover:border-primary dark:hover:border-secondary'
    ]"
  >
    <!-- Icon -->
    <div v-if="icon" class="mb-4">
      <div :class="[
        'w-12 h-12 rounded-lg flex items-center justify-center',
        iconBgClass || 'bg-primary/10 dark:bg-secondary/10'
      ]">
        <component :is="icon" :size="24" :class="iconClass || 'text-primary dark:text-secondary'" />
      </div>
    </div>

    <!-- Content -->
    <h3 :class="['text-sm font-medium mb-2', titleClass || 'text-mutedLight dark:text-mutedDark']">
      {{ title }}
    </h3>
    <p :class="['text-3xl font-bold', valueClass || 'text-primary dark:text-secondary']">
      {{ value }}
    </p>

    <!-- Optional Trend Indicator -->
    <div v-if="trend" class="mt-3 flex items-center gap-2">
      <component 
        :is="trend > 0 ? TrendingUp : TrendingDown" 
        :size="16" 
        :class="trend > 0 ? 'text-green-500' : 'text-red-500'" 
      />
      <span :class="[
        'text-sm font-medium',
        trend > 0 ? 'text-green-500' : 'text-red-500'
      ]">
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
    </div>

    <!-- Optional Badge -->
    <div v-if="badge" class="mt-3">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {{ badge }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Props {
  title: string
  value: string | number
  icon?: Component
  trend?: number
  badge?: string
  bgClass?: string
  iconBgClass?: string
  iconClass?: string
  titleClass?: string
  valueClass?: string
  delay?: number
}

withDefaults(defineProps<Props>(), {
  delay: 0
})
</script>

