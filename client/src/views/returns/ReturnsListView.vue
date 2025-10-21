<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Returns</h1>

    <!-- Returns Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading returns...</p>
      </div>

      <div v-else-if="returns.length === 0" class="text-center py-8">
        <ArrowUturnLeftIcon class="w-16 h-16 mx-auto text-gray-300" />
        <p class="mt-4 text-gray-500">No returns found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return #</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="returnReq in returns" :key="returnReq.id" class="hover:bg-gray-50 cursor-pointer" @click="$router.push(`/returns/${returnReq.id}`)">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ returnReq.returnNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <RouterLink :to="`/orders/${returnReq.order.id}`" class="text-primary-600 hover:text-primary-900">
                  {{ returnReq.order.orderNumber }}
                </RouterLink>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ returnReq.reason }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(returnReq.status)">{{ returnReq.status }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ returnReq.refundAmount ? `$${returnReq.refundAmount}` : '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(returnReq.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { ArrowUturnLeftIcon } from '@heroicons/vue/24/outline'
import { RouterLink } from 'vue-router'

const RETURNS_QUERY = gql`
  query GetReturns {
    returnRequests(limit: 50) {
      returns {
        id
        returnNumber
        reason
        status
        refundAmount
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

const { result, loading } = useQuery(RETURNS_QUERY)

const returns = computed(() => result.value?.returnRequests?.returns || [])

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function getStatusBadgeClass(status: string) {
  const classes = {
    PENDING: 'badge badge-warning',
    APPROVED: 'badge badge-success',
    REJECTED: 'badge badge-danger',
    RECEIVED: 'badge badge-primary',
    INSPECTING: 'badge badge-primary',
    COMPLETED: 'badge badge-success',
    CANCELLED: 'badge badge-gray',
  }
  return classes[status as keyof typeof classes] || 'badge badge-gray'
}
</script>

