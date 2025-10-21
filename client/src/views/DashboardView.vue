<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Orders</p>
            <p class="text-3xl font-bold text-gray-900">{{ analytics?.totalOrders || 0 }}</p>
          </div>
          <div class="p-3 bg-primary-100 rounded-full">
            <ShoppingBagIcon class="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-900">${{ formatNumber(analytics?.totalRevenue || 0) }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <ChartBarIcon class="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Avg Order Value</p>
            <p class="text-3xl font-bold text-gray-900">${{ formatNumber(analytics?.avgOrderValue || 0) }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <CurrencyDollarIcon class="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Orders</p>
            <p class="text-3xl font-bold text-gray-900">{{ pendingOrders }}</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <ClockIcon class="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Recent Orders</h2>
        <RouterLink to="/orders" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all →
        </RouterLink>
      </div>

      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading...</p>
      </div>

      <div v-else-if="recentOrders.length === 0" class="text-center py-8">
        <p class="text-gray-500">No recent orders</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 cursor-pointer" @click="$router.push(`/orders/${order.id}`)">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ order.orderNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customerName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ order.currency }} {{ order.totalAmount }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(order.orderStatus)">{{ order.orderStatus }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { RouterLink } from 'vue-router'
import {
  ShoppingBagIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

const ORDERS_QUERY = gql`
  query GetOrders {
    orders(limit: 10) {
      orders {
        id
        orderNumber
        customerName
        totalAmount
        currency
        orderStatus
        createdAt
      }
      total
    }
  }
`

const ANALYTICS_QUERY = gql`
  query GetAnalytics {
    orderAnalytics {
      totalOrders
      totalRevenue
      avgOrderValue
      ordersByStatus
    }
  }
`

const { result: ordersResult, loading } = useQuery(ORDERS_QUERY)
const { result: analyticsResult } = useQuery(ANALYTICS_QUERY)

const recentOrders = computed(() => ordersResult.value?.orders?.orders || [])
const analytics = computed(() => analyticsResult.value?.orderAnalytics)
const pendingOrders = computed(() => {
  const statuses = analytics.value?.ordersByStatus || []
  const pending = statuses.find((s: any) => s.orderStatus === 'PENDING')
  return pending?._count || 0
})

function formatNumber(num: number) {
  return num.toFixed(2)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function getStatusBadgeClass(status: string) {
  const classes = {
    PENDING: 'badge badge-warning',
    PROCESSED: 'badge badge-primary',
    SHIPPED: 'badge badge-primary',
    DELIVERED: 'badge badge-success',
    CANCELLED: 'badge badge-danger',
  }
  return classes[status as keyof typeof classes] || 'badge badge-gray'
}
</script>

