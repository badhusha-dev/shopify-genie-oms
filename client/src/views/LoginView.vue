<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
      <div class="text-center">
        <!-- Animated Logo -->
        <div class="flex justify-center mb-6">
          <img 
            src="/logo.svg" 
            alt="ShopifyGenie OMS Logo" 
            class="w-32 h-32 animate-pulse-slow"
          />
        </div>
        <h2 class="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          ShopifyGenie OMS
        </h2>
        <p class="mt-2 text-sm text-gray-600 font-medium">
          Smarter Orders. Seamless Fulfillment.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="label">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="input"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="input"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
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
    error.value = err.message || 'Invalid credentials'
    toast.error('Login failed. Please check your credentials.')
  } finally {
    loading.value = false
  }
}
</script>

