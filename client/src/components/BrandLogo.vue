<template>
  <div :class="['flex items-center', vertical ? 'flex-col' : 'space-x-3']">
    <!-- Logo -->
    <AnimatedLogo 
      :size="size" 
      :animated="animated"
      :hoverable="hoverable"
      @click="handleClick"
    />
    
    <!-- Text (optional) -->
    <div v-if="showText" :class="['flex flex-col', vertical && 'items-center mt-2']">
      <h1 :class="[
        'font-bold bg-gradient-brand bg-clip-text text-transparent',
        textSizeClasses
      ]">
        ShopifyGenie
      </h1>
      <span v-if="showSubtext" :class="[
        'text-gray-500 dark:text-gray-400 font-medium',
        subtextSizeClasses
      ]">
        OMS
      </span>
      <p v-if="showTagline" class="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5">
        Smarter Orders. Seamless Fulfillment.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AnimatedLogo from './AnimatedLogo.vue'

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  showSubtext?: boolean
  showTagline?: boolean
  animated?: boolean
  hoverable?: boolean
  vertical?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
  showSubtext: true,
  showTagline: false,
  animated: false,
  hoverable: true,
  vertical: false
})

const emit = defineEmits<{
  click: []
}>()

const textSizeClasses = computed(() => {
  const sizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }
  return sizes[props.size]
})

const subtextSizeClasses = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }
  return sizes[props.size]
})

const handleClick = () => {
  emit('click')
}
</script>

