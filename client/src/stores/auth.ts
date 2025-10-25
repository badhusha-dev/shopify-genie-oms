import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive?: boolean
  createdAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isManager = computed(() => user.value?.role === 'MANAGER' || isAdmin.value)

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { data } = await api.post('/auth/login', { email, password })

      if (data) {
        token.value = data.token
        user.value = data.user
        localStorage.setItem('token', data.token)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, firstName: string, lastName: string, role: string = 'SUPPORT') {
    loading.value = true
    try {
      const { data } = await api.post('/auth/register', { 
        email, 
        password, 
        firstName, 
        lastName, 
        role 
      })

      if (data) {
        token.value = data.token
        user.value = data.user
        localStorage.setItem('token', data.token)
        return true
      }
      return false
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const { data } = await api.get('/auth/me')

      if (data) {
        user.value = data
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      logout()
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isManager,
    login,
    register,
    fetchUser,
    logout,
  }
})

