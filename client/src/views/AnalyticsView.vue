<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>

    <!-- Order Analytics -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Overview</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Orders</p>
          <p class="text-3xl font-bold text-gray-900">{{ orderAnalytics?.totalOrders || 0 }}</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Revenue</p>
          <p class="text-3xl font-bold text-green-600">${{ formatNumber(orderAnalytics?.totalRevenue || 0) }}</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Avg Order Value</p>
          <p class="text-3xl font-bold text-primary-600">${{ formatNumber(orderAnalytics?.avgOrderValue || 0) }}</p>
        </div>
      </div>
    </div>

    <!-- Order Status Breakdown -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Orders by Status</h2>
      <div class="space-y-3">
        <div v-for="status in ordersByStatus" :key="status.orderStatus" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="font-medium">{{ status.orderStatus }}</span>
          <span class="text-2xl font-bold text-primary-600">{{ status._count }}</span>
        </div>
      </div>
    </div>

    <!-- Inventory Analytics -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Inventory Overview</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Items</p>
          <p class="text-2xl font-bold text-gray-900">{{ inventoryAnalytics?.totalItems || 0 }}</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Stock</p>
          <p class="text-2xl font-bold text-gray-900">{{ inventoryAnalytics?.totalQuantity || 0 }}</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Low Stock</p>
          <p class="text-2xl font-bold text-yellow-600">{{ inventoryAnalytics?.lowStockCount || 0 }}</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Out of Stock</p>
          <p class="text-2xl font-bold text-red-600">{{ inventoryAnalytics?.outOfStockCount || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Returns Analytics -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Returns Overview</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Returns</p>
          <p class="text-2xl font-bold text-gray-900">{{ returnAnalytics?.totalReturns || 0 }}</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600">Total Refunds</p>
          <p class="text-2xl font-bold text-red-600">${{ formatNumber(returnAnalytics?.totalRefundAmount || 0) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'

const ANALYTICS_QUERY = gql`
  query GetAllAnalytics {
    orderAnalytics {
      totalOrders
      totalRevenue
      avgOrderValue
      ordersByStatus
    }
    inventoryAnalytics {
      totalItems
      totalQuantity
      totalAvailable
      totalReserved
      lowStockCount
      outOfStockCount
    }
    returnAnalytics {
      totalReturns
      totalRefundAmount
      returnsByStatus
    }
  }
`

const { result } = useQuery(ANALYTICS_QUERY)

const orderAnalytics = computed(() => result.value?.orderAnalytics)
const inventoryAnalytics = computed(() => result.value?.inventoryAnalytics)
const returnAnalytics = computed(() => result.value?.returnAnalytics)
const ordersByStatus = computed(() => result.value?.orderAnalytics?.ordersByStatus || [])

function formatNumber(num: number) {
  return num.toFixed(2)
}
</script>

