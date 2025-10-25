<template>
  <div class="inline-block">
    <img 
      :src="isDark ? '/logo-dark.svg' : '/logo.svg'" 
      :alt="alt"
      :class="[
        'transition-all duration-300',
        sizeClasses,
        animated && 'animate-pulse-slow',
        hoverable && 'hover:scale-110 hover:drop-shadow-glow cursor-pointer'
      ]"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  hoverable?: boolean
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  animated: false,
  hoverable: true,
  alt: 'ShopifyGenie Logo'
})

const emit = defineEmits<{
  click: []
}>()

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }
  return sizes[props.size]
})

const handleClick = () => {
  if (props.hoverable) {
    emit('click')
  }
}
</script>

