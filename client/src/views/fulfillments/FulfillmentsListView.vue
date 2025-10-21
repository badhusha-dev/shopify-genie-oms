<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Fulfillments</h1>

    <!-- Filters -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Status</label>
          <select v-model="statusFilter" class="input" @change="refetch">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_TO_SHIP">Ready to Ship</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Fulfillments Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading fulfillments...</p>
      </div>

      <div v-else-if="fulfillments.length === 0" class="text-center py-8">
        <TruckIcon class="w-16 h-16 mx-auto text-gray-300" />
        <p class="mt-4 text-gray-500">No fulfillments found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="fulfillment in fulfillments" :key="fulfillment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <RouterLink :to="`/orders/${fulfillment.order.id}`" class="text-primary-600 hover:text-primary-900">
                  {{ fulfillment.order.orderNumber }}
                </RouterLink>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(fulfillment.status)">{{ fulfillment.status }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ fulfillment.trackingNumber || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ fulfillment.carrier || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(fulfillment.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { TruckIcon } from '@heroicons/vue/24/outline'
import { RouterLink } from 'vue-router'

const FULFILLMENTS_QUERY = gql`
  query GetFulfillments($filters: FulfillmentFilters) {
    fulfillments(filters: $filters, limit: 50) {
      fulfillments {
        id
        status
        trackingNumber
        carrier
        createdAt
        order {
          id
          orderNumber
        }
      }
      total
    }
  }
`

const statusFilter = ref('')

const { result, loading, refetch } = useQuery(FULFILLMENTS_QUERY, () => ({
  filters: { status: statusFilter.value || undefined },
}))

const fulfillments = computed(() => result.value?.fulfillments?.fulfillments || [])

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function getStatusBadgeClass(status: string) {
  const classes = {
    PENDING: 'badge badge-warning',
    PROCESSING: 'badge badge-primary',
    READY_TO_SHIP: 'badge badge-primary',
    SHIPPED: 'badge badge-primary',
    DELIVERED: 'badge badge-success',
    FAILED: 'badge badge-danger',
    CANCELLED: 'badge badge-gray',
  }
  return classes[status as keyof typeof classes] || 'badge badge-gray'
}
</script>

