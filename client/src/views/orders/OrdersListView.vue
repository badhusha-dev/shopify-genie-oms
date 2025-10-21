<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Orders</h1>
      <button class="btn btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        Create Order
      </button>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Order #, customer name..."
            class="input"
            @input="debouncedRefetch"
          />
        </div>
        <div>
          <label class="label">Status</label>
          <select v-model="filters.status" class="input" @change="refetch">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSED">Processed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label class="label">Fulfillment</label>
          <select v-model="filters.fulfillmentStatus" class="input" @change="refetch">
            <option value="">All</option>
            <option value="UNFULFILLED">Unfulfilled</option>
            <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
            <option value="FULFILLED">Fulfilled</option>
          </select>
        </div>
        <div>
          <label class="label">Date Range</label>
          <select v-model="dateRange" class="input" @change="updateDateFilter">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading orders...</p>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-8">
        <ShoppingBagIcon class="w-16 h-16 mx-auto text-gray-300" />
        <p class="mt-4 text-gray-500">No orders found</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="order in orders"
                :key="order.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="$router.push(`/orders/${order.id}`)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ order.orderNumber }}</div>
                  <div v-if="order.tags.length > 0" class="flex gap-1 mt-1">
                    <span v-for="tag in order.tags.slice(0, 2)" :key="tag" class="badge badge-gray text-xs">{{ tag }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                  <div class="text-sm text-gray-500">{{ order.customerEmail }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ order.orderItems.length }} items
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ order.currency }} {{ order.totalAmount }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(order.orderStatus)">{{ order.orderStatus }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getFulfillmentBadgeClass(order.fulfillmentStatus)">{{ formatFulfillmentStatus(order.fulfillmentStatus) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" @click.stop>
                  <button class="text-primary-600 hover:text-primary-900 mr-3" @click="viewOrder(order.id)">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, total) }} of {{ total }} results
          </div>
          <div class="flex gap-2">
            <button
              :disabled="currentPage === 1"
              class="btn btn-secondary disabled:opacity-50"
              @click="previousPage"
            >
              Previous
            </button>
            <button
              :disabled="currentPage * pageSize >= total"
              class="btn btn-secondary disabled:opacity-50"
              @click="nextPage"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { PlusIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const ORDERS_QUERY = gql`
  query GetOrders($filters: OrderFilters, $limit: Int, $offset: Int) {
    orders(filters: $filters, limit: $limit, offset: $offset) {
      orders {
        id
        orderNumber
        customerName
        customerEmail
        totalAmount
        currency
        orderStatus
        fulfillmentStatus
        tags
        createdAt
        orderItems {
          id
          name
          quantity
        }
      }
      total
    }
  }
`

const filters = ref({
  search: '',
  status: '',
  fulfillmentStatus: '',
  startDate: null as Date | null,
  endDate: null as Date | null,
})

const dateRange = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)

const { result, loading, refetch } = useQuery(ORDERS_QUERY, () => ({
  filters: {
    search: filters.value.search || undefined,
    status: filters.value.status || undefined,
    fulfillmentStatus: filters.value.fulfillmentStatus || undefined,
    startDate: filters.value.startDate,
    endDate: filters.value.endDate,
  },
  limit: pageSize.value,
  offset: (currentPage.value - 1) * pageSize.value,
}))

const orders = computed(() => result.value?.orders?.orders || [])
const total = computed(() => result.value?.orders?.total || 0)

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedRefetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    refetch()
  }, 500)
}

function updateDateFilter() {
  const now = new Date()
  switch (dateRange.value) {
    case 'today':
      filters.value.startDate = new Date(now.setHours(0, 0, 0, 0))
      filters.value.endDate = new Date(now.setHours(23, 59, 59, 999))
      break
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filters.value.startDate = weekAgo
      filters.value.endDate = now
      break
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filters.value.startDate = monthAgo
      filters.value.endDate = now
      break
    default:
      filters.value.startDate = null
      filters.value.endDate = null
  }
  currentPage.value = 1
  refetch()
}

function nextPage() {
  currentPage.value++
  refetch()
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    refetch()
  }
}

function viewOrder(id: string) {
  router.push(`/orders/${id}`)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatFulfillmentStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function getStatusBadgeClass(status: string) {
  const classes = {
    PENDING: 'badge badge-warning',
    PROCESSED: 'badge badge-primary',
    SHIPPED: 'badge badge-primary',
    DELIVERED: 'badge badge-success',
    CANCELLED: 'badge badge-danger',
    ON_HOLD: 'badge badge-gray',
  }
  return classes[status as keyof typeof classes] || 'badge badge-gray'
}

function getFulfillmentBadgeClass(status: string) {
  const classes = {
    UNFULFILLED: 'badge badge-warning',
    PARTIALLY_FULFILLED: 'badge badge-primary',
    FULFILLED: 'badge badge-success',
    SCHEDULED: 'badge badge-gray',
  }
  return classes[status as keyof typeof classes] || 'badge badge-gray'
}
</script>

