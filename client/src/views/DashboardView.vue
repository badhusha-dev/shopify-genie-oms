<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <div
      v-motion-slide-visible-once-left
      class="bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl p-8 text-white shadow-2xl shadow-glow relative overflow-hidden"
    >
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div class="relative z-10">
        <h1 class="text-5xl font-extrabold font-display mb-3 text-white drop-shadow-lg">Welcome back! 👋</h1>
        <p class="text-white text-xl font-medium drop-shadow-md">Here's what's happening with your orders today.</p>
      </div>
    </div>

    <!-- Stats Cards using StatCard Component -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Orders - Teal -->
      <StatCard 
        title="Total Orders"
        :value="analytics?.totalOrders || 0"
        :icon="ShoppingBag"
        :trend="12.5"
        bg-class="bg-gradient-to-br from-primary to-primary/80 text-white"
        icon-bg-class="bg-white/20"
        icon-class="text-white"
        title-class="text-white/80"
        value-class="text-white"
        :delay="100"
      />

      <!-- Total Revenue - Blue -->
      <StatCard 
        title="Total Revenue"
        :value="`$${formatNumber(analytics?.totalRevenue || 0)}`"
        :icon="DollarSign"
        :trend="8.2"
        bg-class="bg-gradient-to-br from-secondary to-secondary/80 text-white"
        icon-bg-class="bg-white/20"
        icon-class="text-white"
        title-class="text-white/80"
        value-class="text-white"
        :delay="200"
      />

      <!-- Avg Order Value - Purple -->
      <StatCard 
        title="Avg Order Value"
        :value="`$${formatNumber(analytics?.avgOrderValue || 0)}`"
        :icon="TrendingUp"
        :trend="-2.4"
        bg-class="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        icon-bg-class="bg-white/20"
        icon-class="text-white"
        title-class="text-white/80"
        value-class="text-white"
        :delay="300"
      />

      <!-- Pending Orders - Orange -->
      <StatCard 
        title="Pending Orders"
        :value="pendingOrders"
        :icon="Clock"
        badge="Urgent"
        bg-class="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
        icon-bg-class="bg-white/20"
        icon-class="text-white"
        title-class="text-white/80"
        value-class="text-white"
        :delay="400"
      />
    </div>

    <!-- Recent Orders -->
    <div
      v-motion-slide-visible-once-right
      class="bg-lightSurface dark:bg-darkSurface rounded-3xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-extrabold text-primary dark:text-secondary font-display">Recent Orders</h2>
          <p class="text-base font-semibold text-gray-800 dark:text-gray-100 mt-2">Your latest customer orders</p>
        </div>
        <RouterLink
          to="/orders"
          class="flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg shadow-glow transition-all duration-200 hover:scale-105 font-medium"
        >
          View all
          <ArrowRight :size="16" class="ml-2" />
        </RouterLink>
      </div>

      <div v-if="loading" class="text-center py-12">
        <Loader2 :size="56" class="text-primary dark:text-secondary mb-4 animate-spin mx-auto" />
        <p class="text-2xl font-bold text-gray-900 dark:text-white">Loading orders...</p>
      </div>

      <div v-else-if="recentOrders.length === 0" class="text-center py-12">
        <Inbox :size="80" class="text-gray-500 dark:text-gray-400 mb-4 mx-auto" />
        <p class="text-2xl font-bold text-gray-900 dark:text-white">No recent orders</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-extrabold text-black dark:text-white uppercase tracking-wider">
                <Hash :size="16" class="inline mr-2" />Order
              </th>
              <th class="px-6 py-4 text-left text-sm font-extrabold text-black dark:text-white uppercase tracking-wider">
                <User :size="16" class="inline mr-2" />Customer
              </th>
              <th class="px-6 py-4 text-left text-sm font-extrabold text-black dark:text-white uppercase tracking-wider">
                <DollarSign :size="16" class="inline mr-2" />Total
              </th>
              <th class="px-6 py-4 text-left text-sm font-extrabold text-black dark:text-white uppercase tracking-wider">
                <Info :size="16" class="inline mr-2" />Status
              </th>
              <th class="px-6 py-4 text-left text-sm font-extrabold text-black dark:text-white uppercase tracking-wider">
                <Calendar :size="16" class="inline mr-2" />Date
              </th>
            </tr>
          </thead>
                <tbody class="bg-lightSurface dark:bg-darkSurface divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="order in recentOrders"
              :key="order.id"
                      class="hover:bg-primary/10 dark:hover:bg-secondary/20 cursor-pointer transition-colors duration-150"
              @click="$router.push(`/orders/${order.id}`)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-base font-extrabold text-primary dark:text-secondary">
                  {{ order.orderNumber }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base font-bold text-black dark:text-white">
                {{ order.customerName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base font-extrabold text-black dark:text-white">
                {{ order.currency }} {{ order.totalAmount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(order.orderStatus)">{{ order.orderStatus }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-800 dark:text-gray-200">
                {{ formatDate(order.createdAt) }}
              </td>
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
import { RouterLink } from 'vue-router'
import { ShoppingBag, DollarSign, TrendingUp, TrendingDown, Clock, Minus, ArrowRight, Hash, User, Info, Calendar, Loader2, Inbox } from 'lucide-vue-next'
import StatCard from '@/components/StatCard.vue'

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

