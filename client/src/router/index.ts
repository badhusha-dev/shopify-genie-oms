import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/orders/OrdersListView.vue'),
          meta: { title: 'Orders' },
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: () => import('@/views/orders/OrderDetailView.vue'),
          meta: { title: 'Order Details' },
        },
        {
          path: 'fulfillments',
          name: 'fulfillments',
          component: () => import('@/views/fulfillments/FulfillmentsListView.vue'),
          meta: { title: 'Fulfillments' },
        },
        {
          path: 'fulfillments/:id',
          name: 'fulfillment-detail',
          component: () => import('@/views/fulfillments/FulfillmentDetailView.vue'),
          meta: { title: 'Fulfillment Details' },
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/views/inventory/InventoryListView.vue'),
          meta: { title: 'Inventory' },
        },
        {
          path: 'returns',
          name: 'returns',
          component: () => import('@/views/returns/ReturnsListView.vue'),
          meta: { title: 'Returns' },
        },
        {
          path: 'returns/:id',
          name: 'return-detail',
          component: () => import('@/views/returns/ReturnDetailView.vue'),
          meta: { title: 'Return Details' },
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/views/AnalyticsView.vue'),
          meta: { title: 'Analytics' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
          meta: { title: 'Settings' },
        },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    if (authStore.token) {
      await authStore.fetchUser()
      if (authStore.isAuthenticated) {
        next()
      } else {
        next('/login')
      }
    } else {
      next('/login')
    }
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router

