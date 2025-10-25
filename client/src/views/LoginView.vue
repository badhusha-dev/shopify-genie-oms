<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-emerald-400 to-blue-400 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Animated Background Shapes -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s"></div>
    </div>

    <div 
      class="max-w-md w-full space-y-8 backdrop-blur-2xl bg-white/10 p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10"
      v-motion-slide-visible-once-bottom
      :initial="{ opacity: 0, y: 50 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
    >
      <div class="text-center">
        <!-- Animated Logo -->
        <div class="flex justify-center mb-6">
          <img 
            src="/logo-dark.svg" 
            alt="ShopifyGenie Logo" 
            class="w-24 h-24 drop-shadow-glow animate-pulse-slow"
            v-motion-pop
          />
        </div>
        <h2 class="text-4xl font-extrabold text-white font-display mb-2">
          Welcome Back 👋
        </h2>
        <p class="text-sm text-white/70 font-medium tracking-wide">
          ShopifyGenie OMS
        </p>
        <p class="mt-1 text-xs text-white/60 font-normal italic">
          Smarter Orders. Seamless Fulfillment.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-white/90 mb-2">
              <i class="fas fa-envelope mr-2"></i>Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-white/90 mb-2">
              <i class="fas fa-lock mr-2"></i>Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="error" class="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-white text-sm px-4 py-3 rounded-xl">
          <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center items-center px-4 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span v-if="loading" class="flex items-center">
              <i class="fas fa-spinner fa-spin mr-2"></i>Signing in...
            </span>
            <span v-else class="flex items-center">
              <i class="fas fa-sign-in-alt mr-2"></i>Sign in
            </span>
          </button>
        </div>
      </form>
      
      <!-- Helper Text -->
      <div class="text-center">
        <p class="text-white/70 text-sm">
          Default: <span class="font-semibold text-white">admin@shopifygenie.com</span> / <span class="font-semibold text-white">admin123</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    toast.success('Login successful!')
    router.push('/')
  } catch (err: any) {
    // Get the actual error message from the API response
    const errorMessage = err.response?.data?.message || err.message || 'Invalid credentials'
    error.value = errorMessage
    toast.error(`Login failed: ${errorMessage}`)
    console.error('Full login error:', err.response || err)
  } finally {
    loading.value = false
  }
}
</script>

