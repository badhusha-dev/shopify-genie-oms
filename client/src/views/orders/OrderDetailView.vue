<template>
  <div v-if="loading" class="text-center py-12">
    <p class="text-gray-500">Loading order...</p>
  </div>

  <div v-else-if="order" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <button @click="$router.back()" class="text-primary-600 hover:text-primary-700 mb-2 flex items-center">
          <ArrowLeftIcon class="w-4 h-4 mr-1" />
          Back to Orders
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Order {{ order.orderNumber }}</h1>
        <p class="text-gray-500 mt-1">Created on {{ formatDate(order.createdAt) }}</p>
      </div>
      <div class="flex gap-3">
        <span :class="getStatusBadgeClass(order.orderStatus)">{{ order.orderStatus }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Order Items -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div class="space-y-4">
            <div
              v-for="item in order.orderItems"
              :key="item.id"
              class="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
            >
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-gray-400 text-xs">{{ item.sku || 'N/A' }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ item.name }}</p>
                  <p class="text-sm text-gray-500">SKU: {{ item.sku || 'N/A' }}</p>
                  <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">{{ order.currency }} {{ item.totalAmount }}</p>
                <p class="text-sm text-gray-500">{{ order.currency }} {{ item.price }} each</p>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="text-gray-900">{{ order.currency }} {{ subtotal }}</span>
            </div>
            <div v-if="order.shippingAmount" class="flex justify-between text-sm">
              <span class="text-gray-600">Shipping</span>
              <span class="text-gray-900">{{ order.currency }} {{ order.shippingAmount }}</span>
            </div>
            <div v-if="order.taxAmount" class="flex justify-between text-sm">
              <span class="text-gray-600">Tax</span>
              <span class="text-gray-900">{{ order.currency }} {{ order.taxAmount }}</span>
            </div>
            <div v-if="order.discountAmount" class="flex justify-between text-sm">
              <span class="text-gray-600">Discount</span>
              <span class="text-red-600">-{{ order.currency }} {{ order.discountAmount }}</span>
            </div>
            <div class="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{{ order.currency }} {{ order.totalAmount }}</span>
            </div>
          </div>
        </div>

        <!-- Fulfillments -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Fulfillments</h2>
          <div v-if="order.fulfillments.length === 0" class="text-center py-8 text-gray-500">
            No fulfillments yet
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="fulfillment in order.fulfillments"
              :key="fulfillment.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span :class="getFulfillmentBadgeClass(fulfillment.status)">{{ fulfillment.status }}</span>
                <span class="text-sm text-gray-500">{{ formatDate(fulfillment.createdAt) }}</span>
              </div>
              <div v-if="fulfillment.trackingNumber" class="mt-2">
                <p class="text-sm text-gray-600">Tracking: {{ fulfillment.trackingNumber }}</p>
                <p class="text-sm text-gray-600">Carrier: {{ fulfillment.carrier }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Returns -->
        <div v-if="order.returnRequests.length > 0" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Returns</h2>
          <div class="space-y-4">
            <div
              v-for="returnReq in order.returnRequests"
              :key="returnReq.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ returnReq.returnNumber }}</span>
                <span :class="getReturnBadgeClass(returnReq.status)">{{ returnReq.status }}</span>
              </div>
              <p class="text-sm text-gray-600">Reason: {{ returnReq.reason }}</p>
              <p class="text-sm text-gray-500">Created: {{ formatDate(returnReq.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Customer Info -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div class="space-y-2">
            <div>
              <p class="text-sm text-gray-600">Name</p>
              <p class="font-medium">{{ order.customerName }}</p>
            </div>
            <div v-if="order.customerEmail">
              <p class="text-sm text-gray-600">Email</p>
              <p class="font-medium">{{ order.customerEmail }}</p>
            </div>
            <div v-if="order.customerPhone">
              <p class="text-sm text-gray-600">Phone</p>
              <p class="font-medium">{{ order.customerPhone }}</p>
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div v-if="order.shippingAddress" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <div class="text-sm space-y-1">
            <p>{{ order.shippingAddress.address1 }}</p>
            <p v-if="order.shippingAddress.address2">{{ order.shippingAddress.address2 }}</p>
            <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.province }} {{ order.shippingAddress.zip }}</p>
            <p>{{ order.shippingAddress.country }}</p>
          </div>
        </div>

        <!-- Order Status -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
          <div class="space-y-2">
            <div>
              <p class="text-sm text-gray-600">Financial Status</p>
              <p class="font-medium">{{ order.financialStatus }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Fulfillment Status</p>
              <p class="font-medium">{{ order.fulfillmentStatus.replace(/_/g, ' ') }}</p>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="order.tags.length > 0" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in order.tags" :key="tag" class="badge badge-gray">{{ tag }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ order.notes }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <p class="text-gray-500">Order not found</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()

const ORDER_QUERY = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      shopifyOrderId
      customerName
      customerEmail
      customerPhone
      financialStatus
      fulfillmentStatus
      orderStatus
      totalAmount
      currency
      taxAmount
      shippingAmount
      discountAmount
      tags
      notes
      shippingAddress
      billingAddress
      createdAt
      updatedAt
      orderItems {
        id
        name
        sku
        quantity
        price
        totalAmount
        taxAmount
        discountAmount
        fulfillmentStatus
      }
      fulfillments {
        id
        status
        trackingNumber
        carrier
        trackingUrl
        shippedAt
        deliveredAt
        createdAt
      }
      returnRequests {
        id
        returnNumber
        status
        reason
        refundAmount
        createdAt
      }
    }
  }
`

const { result, loading } = useQuery(ORDER_QUERY, {
  id: route.params.id,
})

const order = computed(() => result.value?.order)
const subtotal = computed(() => {
  if (!order.value) return 0
  return order.value.orderItems.reduce((sum: number, item: any) => sum + parseFloat(item.totalAmount), 0).toFixed(2)
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadgeClass(status: string) {
  const classes = {
    PENDING: 'badge badge-warning text-base',
    PROCESSED: 'badge badge-primary text-base',
    SHIPPED: 'badge badge-primary text-base',
    DELIVERED: 'badge badge-success text-base',
    CANCELLED: 'badge badge-danger text-base',
  }
  return classes[status as keyof typeof classes] || 'badge badge-gray text-base'
}

function getFulfillmentBadgeClass(status: string) {
  const classes = {
    PENDING: 'badge badge-warning',
    PROCESSING: 'badge badge-primary',
    READY_TO_SHIP: 'badge badge-primary',
    SHIPPED: 'badge badge-primary',
    IN_TRANSIT: 'badge badge-primary',
    OUT_FOR_DELIVERY: 'badge badge-primary',
    DELIVERED: 'badge badge-success',
    FAILED: 'badge badge-danger',
    CANCELLED: 'badge badge-gray',
  }
  return classes[status as keyof typeof classes] || 'badge badge-gray'
}

function getReturnBadgeClass(status: string) {
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

