<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Settings</h1>

    <!-- User Profile -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">User Profile</h2>
      <div class="space-y-4 max-w-lg">
        <div>
          <label class="label">First Name</label>
          <input type="text" :value="authStore.user?.firstName" class="input" readonly />
        </div>
        <div>
          <label class="label">Last Name</label>
          <input type="text" :value="authStore.user?.lastName" class="input" readonly />
        </div>
        <div>
          <label class="label">Email</label>
          <input type="email" :value="authStore.user?.email" class="input" readonly />
        </div>
        <div>
          <label class="label">Role</label>
          <input type="text" :value="authStore.user?.role" class="input" readonly />
        </div>
      </div>
    </div>

    <!-- Stores -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Connected Stores</h2>
      <div v-if="loadingStores" class="text-center py-4">
        <p class="text-gray-500">Loading stores...</p>
      </div>
      <div v-else-if="stores.length === 0" class="text-center py-8">
        <p class="text-gray-500">No stores connected</p>
        <button class="btn btn-primary mt-4">
          <PlusIcon class="w-5 h-5 mr-2" />
          Connect Shopify Store
        </button>
      </div>
      <div v-else class="space-y-3">
        <div v-for="store in stores" :key="store.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">{{ store.name }}</p>
            <p class="text-sm text-gray-500">{{ store.shopifyDomain }}</p>
            <p v-if="store.lastSyncAt" class="text-xs text-gray-400 mt-1">Last synced: {{ formatDate(store.lastSyncAt) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span :class="store.isActive ? 'badge badge-success' : 'badge badge-gray'">
              {{ store.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- API Settings -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">API & Integrations</h2>
      <p class="text-gray-600 mb-4">Configure integrations with shipping providers, notification services, and more.</p>
      <div class="space-y-3">
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Shopify API</p>
            <p class="text-sm text-gray-500">Sync orders, products, and inventory</p>
          </div>
          <span class="badge badge-success">Connected</span>
        </div>
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Email Notifications</p>
            <p class="text-sm text-gray-500">SMTP configuration for order updates</p>
          </div>
          <span class="badge badge-gray">Not Configured</span>
        </div>
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Slack Integration</p>
            <p class="text-sm text-gray-500">Real-time notifications to Slack</p>
          </div>
          <span class="badge badge-gray">Not Configured</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { useAuthStore } from '@/stores/auth'
import { PlusIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const STORES_QUERY = gql`
  query GetStores {
    stores {
      id
      name
      shopifyDomain
      isActive
      lastSyncAt
      createdAt
    }
  }
`

const { result, loading: loadingStores } = useQuery(STORES_QUERY)

const stores = computed(() => result.value?.stores || [])

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

