<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Inventory</h1>
      <button class="btn btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        Add Product
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <p class="text-sm font-medium text-gray-600">Total Items</p>
        <p class="text-2xl font-bold text-gray-900">{{ analytics?.totalItems || 0 }}</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-600">Total Stock</p>
        <p class="text-2xl font-bold text-gray-900">{{ analytics?.totalQuantity || 0 }}</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-600">Low Stock</p>
        <p class="text-2xl font-bold text-yellow-600">{{ analytics?.lowStockCount || 0 }}</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-600">Out of Stock</p>
        <p class="text-2xl font-bold text-red-600">{{ analytics?.outOfStockCount || 0 }}</p>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading inventory...</p>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-8">
        <ArchiveBoxIcon class="w-16 h-16 mx-auto text-gray-300" />
        <p class="mt-4 text-gray-500">No inventory items found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ item.product.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.product.sku }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ item.quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">{{ item.availableQuantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{{ item.reservedQuantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.warehouse?.name || 'Default' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="item.availableQuantity === 0" class="badge badge-danger">Out of Stock</span>
                <span v-else-if="item.reorderPoint && item.availableQuantity <= item.reorderPoint" class="badge badge-warning">Low Stock</span>
                <span v-else class="badge badge-success">In Stock</span>
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
import { PlusIcon, ArchiveBoxIcon } from '@heroicons/vue/24/outline'

const INVENTORY_QUERY = gql`
  query GetInventory {
    inventoryItems(limit: 100) {
      items {
        id
        quantity
        availableQuantity
        reservedQuantity
        reorderPoint
        product {
          id
          name
          sku
        }
        warehouse {
          id
          name
        }
      }
      total
    }
    inventoryAnalytics {
      totalItems
      totalQuantity
      totalAvailable
      totalReserved
      lowStockCount
      outOfStockCount
    }
  }
`

const { result, loading } = useQuery(INVENTORY_QUERY)

const items = computed(() => result.value?.inventoryItems?.items || [])
const analytics = computed(() => result.value?.inventoryAnalytics)
</script>

